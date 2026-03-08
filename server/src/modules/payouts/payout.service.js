const prisma = require('../../config/prisma');
const AppError = require('../../common/errors/AppError');
// const Razorpay = require('razorpay');

// const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_xxxxxxxx';
// const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'xxxxxxxxxxxxxx';
// const razorpay = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });

const MIN_PAYOUT_THRESHOLD = 100.0;
const INSTANT_PAYOUT_FEE_PERCENT = 2.0;

exports.getWorkerBankDetails = async (userId) => {
    const profile = await prisma.workerProfile.findUnique({
        where: { userId },
        select: {
            bankAccountNumber: true,
            bankIfsc: true,
            walletBalance: true,
            razorpayAccountId: true
        }
    });

    if (!profile) throw new AppError(404, 'Worker profile not found');

    // Mask account number
    const maskedAcc = profile.bankAccountNumber ?
        'XXXX' + profile.bankAccountNumber.slice(-4) : null;

    return {
        ...profile,
        bankAccountNumber: maskedAcc,
        isLinked: !!profile.razorpayAccountId
    };
};

exports.updateWorkerBankDetails = async (userId, bankAccountNumber, bankIfsc) => {
    const profile = await prisma.workerProfile.findUnique({ where: { userId }, include: { user: true } });
    if (!profile) throw new AppError(404, 'Worker profile not found');

    if (!bankAccountNumber || !bankIfsc) {
        throw new AppError(400, 'Bank Account Number and IFSC are required');
    }

    // 1. Create a linked account (Route Contact & Fund Account) via Razorpay API
    // NOTE: This usually involves creating a contact -> fund account -> linked account API sequence.
    // For sandbox / Sprint 8 scope, we simulate generating a dummy ID if keys are dummy.
    let accountId = `acc_${Math.random().toString(36).substr(2, 9)}`;

    try {
        if (process.env.RAZORPAY_KEY_ID?.startsWith('rzp_live') || process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test')) {
            // In a real prod environment we map bank account -> Razorpay API
            // Since Razorpay requires KYC for active Route Accounts, we often use Test Mode mocks
            // For Sprint 8 parity, we'll store the account strings locally.
        }
    } catch (err) {
        console.error('Razorpay Linking Failed:', err.message);
        throw new AppError(500, 'Failed to link Razorpay Route account');
    }

    await prisma.workerProfile.update({
        where: { id: profile.id },
        data: {
            bankAccountNumber,
            bankIfsc,
            razorpayAccountId: accountId
        }
    });

    return { isLinked: true };
};

exports.processInstantPayout = async (userId) => {
    const profile = await prisma.workerProfile.findUnique({ where: { userId }, include: { user: true } });
    if (!profile) throw new AppError(404, 'Worker profile not found');

    if (!profile.razorpayAccountId) {
        throw new AppError(400, 'Bank account not linked yet for Payouts');
    }

    const balance = Number(profile.walletBalance);
    if (balance < MIN_PAYOUT_THRESHOLD) {
        throw new AppError(400, `Minimum payout threshold is ₹${MIN_PAYOUT_THRESHOLD}. Current balance: ₹${balance.toFixed(2)}`);
    }

    // Calculate 2% instant payout fee
    const fee = balance * (INSTANT_PAYOUT_FEE_PERCENT / 100);
    const payoutAmount = balance - fee;

    return processRazorpayTransfer(profile, balance, payoutAmount);
};

exports.processDailyCronPayouts = async () => {
    console.log('[CRON] Starting daily automated payouts...');
    // Find all workers with balance >= 100 mapped to a Razorpay Account
    const eligibleWorkers = await prisma.workerProfile.findMany({
        where: {
            walletBalance: { gte: MIN_PAYOUT_THRESHOLD },
            razorpayAccountId: { not: null }
        },
        include: { user: true }
    });

    console.log(`[CRON] Found ${eligibleWorkers.length} eligible workers for payout.`);

    for (const profile of eligibleWorkers) {
        try {
            const balance = Number(profile.walletBalance);
            // Scheduled payouts have zero fees
            await processRazorpayTransfer(profile, balance, balance);
            console.log(`[CRON] Processed ₹${balance} payout for Worker ${profile.id}`);
        } catch (err) {
            console.error(`[CRON] Payout failed for Worker ${profile.id}:`, err.message);
        }
    }
};

async function processRazorpayTransfer(profile, deductBalance, payoutAmount) {
    return prisma.$transaction(async (tx) => {
        // 1. Deduct wallet balance before firing external API
        await tx.workerProfile.update({
            where: { id: profile.id },
            data: { walletBalance: { decrement: deductBalance } }
        });

        // 2. Create local pending payout record
        const payoutRecord = await tx.payout.create({
            data: {
                workerProfileId: profile.id,
                amount: payoutAmount,
                status: 'PROCESSING'
            }
        });

        // 3. Initiate Razorpay Route Transfer
        try {
            // In production, execute razorpay.transfers.create({
            //   account: profile.razorpayAccountId, amount: payoutAmount * 100, currency: 'INR'
            // });

            const transferId = `trf_${Math.random().toString(36).substr(2, 9)}`;

            // 4. Update status to processed
            const completed = await tx.payout.update({
                where: { id: payoutRecord.id },
                data: {
                    status: 'PROCESSED',
                    transferReference: transferId,
                    processedAt: new Date()
                }
            });

            return completed;
        } catch (apiError) {
            // 5. On Gateway Failure - refund to wallet and mark FAILED
            await tx.workerProfile.update({
                where: { id: profile.id },
                data: { walletBalance: { increment: deductBalance } }
            });
            await tx.payout.update({
                where: { id: payoutRecord.id },
                data: { status: 'FAILED' }
            });
            throw new AppError(500, 'Payment Gateway failed to process transfer: ' + apiError.message);
        }
    });
}

exports.getWorkerPayoutHistory = async (userId, { skip, limit }) => {
    const profile = await prisma.workerProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError(404, 'Worker profile not found');

    const [data, total] = await Promise.all([
        prisma.payout.findMany({
            where: { workerProfileId: profile.id },
            orderBy: { createdAt: 'desc' },
            skip, take: limit
        }),
        prisma.payout.count({ where: { workerProfileId: profile.id } })
    ]);
    return { data, total, pagination: { skip, limit, totalPages: Math.ceil(total / limit) } };
};
