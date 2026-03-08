const asyncHandler = require('../../common/utils/asyncHandler');
const prisma = require('../../config/prisma');
const GrowthService = require('./business_growth.service');
const AppError = require('../../common/errors/AppError');

/**
 * Get User Wallet & Transactions
 */
exports.getWallet = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const wallet = await prisma.wallet.findUnique({
        where: { userId },
        include: {
            user: {
                select: {
                    transactions: {
                        orderBy: { createdAt: 'desc' },
                        take: 50
                    }
                }
            }
        }
    });

    res.json({
        balance: wallet?.balance || 0,
        currency: wallet?.currency || 'INR',
        transactions: wallet?.user?.transactions || []
    });
});

/**
 * Get Referral Info
 */
exports.getReferralInfo = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            referralCode: true,
            _count: {
                select: { referrals: true }
            }
        }
    });

    // Award bonus if user doesn't have a code yet
    let code = user.referralCode;
    if (!code) {
        code = await GrowthService.generateReferralCode(userId);
    }

    res.json({
        referralCode: code,
        totalReferrals: user._count.referrals
    });
});

/**
 * Validate a Coupon (Checkout)
 */
exports.checkCoupon = asyncHandler(async (req, res) => {
    const { code, bookingAmount, serviceCategory } = req.body;

    const result = await GrowthService.validateCoupon(code, req.user.id, {
        bookingAmount,
        serviceCategory
    });

    res.json(result);
});

/**
 * Apply a Referral Code (if not applied during signup)
 */
exports.applyReferralCode = asyncHandler(async (req, res) => {
    const { code } = req.body;
    await GrowthService.applyReferral(req.user.id, code);
    res.json({ message: 'Referral code applied successfully!' });
});
/**
 * Add Credits to Wallet (Simulated for Demo)
 */
exports.addCredits = asyncHandler(async (req, res) => {
    const { amount, description } = req.body;
    if (!amount || amount <= 0) throw new AppError(400, 'Invalid amount.');

    const transaction = await GrowthService.depositCredits(
        req.user.id,
        amount,
        description || 'Wallet Top-up'
    );

    res.json({
        message: 'Credits added successfully!',
        transaction
    });
});
