const prisma = require('../../config/prisma');
const AppError = require('../../common/errors/AppError');
const { randomBytes } = require('crypto');

// Import specialized services
const LoyaltyService = require('./loyalty.service');
const ProPlusService = require('./proplus.service');
const FavoritesService = require('./favorites.service');
const GiftCardService = require('./gift.service');

/**
 * BUSINESS GROWTH SERVICE (Sprint 17)
 * Handles Wallet, Referrals, and Coupons.
 * Consolidates sub-services for easier access from other modules.
 */

/**
 * Initialize a wallet for a user if it doesn't exist
 */
async function initializeWallet(userId, tx = prisma) {
    return tx.wallet.upsert({
        where: { userId },
        create: { userId, balance: 0.0, currency: 'INR' },
        update: {} // Do nothing if exists
    });
}

/**
 * Generate a unique referral code for a user
 */
async function generateReferralCode(userId, tx = prisma) {
    const user = await tx.user.findUnique({ where: { id: userId }, select: { name: true, referralCode: true } });
    if (user.referralCode) return user.referralCode;

    // Format: NAME + 4 random chars
    const namePart = user.name.split(' ')[0].replace(/[^a-zA-Z]/g, '').toUpperCase().substring(0, 4);
    const randomPart = randomBytes(2).toString('hex').toUpperCase();
    const code = `${namePart}${randomPart}`;

    await tx.user.update({
        where: { id: userId },
        data: { referralCode: code }
    });

    return code;
}

/**
 * Apply a referral code during registration or later
 */
async function applyReferral(userId, code) {
    const referrer = await prisma.user.findUnique({ where: { referralCode: code } });
    if (!referrer) throw new AppError(404, 'Invalid referral code.');
    if (referrer.id === userId) throw new AppError(400, 'You cannot refer yourself.');

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user.referredById) throw new AppError(400, 'Referral already applied to this account.');

    return prisma.user.update({
        where: { id: userId },
        data: { referredById: referrer.id }
    });
}

/**
 * Process a Wallet Transaction
 */
async function processWalletTransaction({ userId, amount, type, description, referenceId }, tx = prisma) {
    const wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new AppError(404, 'User wallet not found.');

    const newBalance = Number(wallet.balance) + Number(amount);
    if (newBalance < 0 && amount < 0) {
        throw new AppError(400, 'Insufficient wallet balance.');
    }

    // 1. Update Wallet Balance
    await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance }
    });

    // 2. Create Transaction History
    return tx.walletTransaction.create({
        data: {
            userId,
            amount,
            type,
            description,
            referenceId: String(referenceId),
            status: 'COMPLETED'
        }
    });
}

/**
 * Validate Coupon code
 */
async function validateCoupon(code, userId, { bookingAmount, serviceCategory } = {}) {
    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });

    if (!coupon || !coupon.isActive) throw new AppError(404, 'Coupon not found or inactive.');

    const now = new Date();
    if (coupon.startDate && now < coupon.startDate) throw new AppError(400, 'Coupon is not yet active.');
    if (coupon.endDate && now > coupon.endDate) throw new AppError(400, 'Coupon has expired.');

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        throw new AppError(400, 'Coupon usage limit reached.');
    }

    if (coupon.minOrderValue && bookingAmount < Number(coupon.minOrderValue)) {
        throw new AppError(400, `Minimum order value of ₹${coupon.minOrderValue} required.`);
    }

    if (coupon.applicableTo && coupon.applicableTo !== 'ALL' && coupon.applicableTo !== serviceCategory) {
        throw new AppError(400, `Coupon is only valid for ${coupon.applicableTo} services.`);
    }

    // Check if user already used this coupon (optional rule depending on requirements)
    const usage = await prisma.booking.count({
        where: { customerId: userId, couponId: coupon.id, status: { not: 'CANCELLED' } }
    });

    if (usage > 0) throw new AppError(400, 'You have already used this coupon.');

    if (coupon.firstTimeOnly) {
        const totalBookings = await prisma.booking.count({
            where: { customerId: userId, status: { not: 'CANCELLED' } }
        });
        if (totalBookings > 0) throw new AppError(400, 'This coupon is for first-time users only.');
    }

    // Calculate Discount
    let discountAmount;
    if (coupon.discountType === 'PERCENTAGE') {
        discountAmount = (bookingAmount * Number(coupon.discountValue)) / 100;
        if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
            discountAmount = Number(coupon.maxDiscount);
        }
    } else {
        discountAmount = Number(coupon.discountValue);
    }

    return {
        couponId: coupon.id,
        discountAmount: Math.min(discountAmount, bookingAmount), // Can't be more than price
        code: coupon.code
    };
}

/**
 * Award Referral Bonus
 */
async function awardReferralBonus(bookingId, tx = prisma) {
    const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: {
            customer: { select: { id: true, referredById: true } },
            service: true
        }
    });

    if (!booking || !booking.customer.referredById) return;

    // Check if this is the customer's first completed job
    const completedJobs = await tx.booking.count({
        where: { customerId: booking.customerId, status: 'COMPLETED' }
    });

    if (completedJobs === 1) {
        // Referrer gets 50
        await processWalletTransaction({
            userId: booking.customer.referredById,
            amount: 50.0,
            type: 'REFERRAL_BONUS',
            description: `Referral bonus for inviting member #${booking.customer.id}`,
            referenceId: bookingId
        }, tx);

        // Referee gets 50
        await processWalletTransaction({
            userId: booking.customerId,
            amount: 50.0,
            type: 'REFERRAL_BONUS',
            description: `Welcome bonus for joining via referral`,
            referenceId: bookingId
        }, tx);
    }
}

/**
 * Add credits to a user's wallet
 */
async function depositCredits(userId, amount, description = 'Wallet Deposit', referenceId = 'manual', tx = prisma) {
    await initializeWallet(userId, tx);
    return processWalletTransaction({
        userId,
        amount: Number(amount),
        type: 'DEPOSIT',
        description,
        referenceId
    }, tx);
}

// Re-export specialized services for simplified access
module.exports = {
    initializeWallet,
    generateReferralCode,
    applyReferral,
    processWalletTransaction,
    validateCoupon,
    awardReferralBonus,
    depositCredits,

    // Proxy to specialized services
    awardLoyaltyPoints: LoyaltyService.awardPoints,
    redeemLoyaltyPoints: LoyaltyService.redeemPoints,
    getLoyaltySummary: LoyaltyService.getLoyaltySummary,
    
    subscribeProPlus: ProPlusService.subscribeUser,
    getProPlusSubscription: ProPlusService.getSubscriptionInfo,
    cancelProPlus: ProPlusService.cancelSubscription,

    toggleFavoriteWorker: FavoritesService.toggleFavorite,
    getFavoriteWorkers: FavoritesService.getFavorites,

    purchaseGiftCard: GiftCardService.purchaseGiftCard,
    redeemGiftCard: GiftCardService.redeemGiftCard,
    checkGiftCard: GiftCardService.checkGiftCard
};

