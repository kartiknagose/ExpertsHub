const prisma = require('../../config/prisma');
const AppError = require('../../common/errors/AppError');
const { getRazorpayClient } = require('../payments/payment.service');

const MIN_PAYOUT_THRESHOLD = 100.0;
const INSTANT_PAYOUT_FEE_PERCENT = 2.0;
const PAYOUT_MODE = (process.env.RAZORPAY_PAYOUT_MODE || 'SIMULATED').toUpperCase();

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
        isLinked: !!profile.razorpayAccountId,
        payoutMode: PAYOUT_MODE,
    };
};

exports.updateWorkerBankDetails = async (userId, bankAccountNumber, bankIfsc, razorpayAccountId) => {
    const profile = await prisma.workerProfile.findUnique({ where: { userId }, include: { user: true } });
    if (!profile) throw new AppError(404, 'Worker profile not found');

    if (!bankAccountNumber || !bankIfsc) {
        throw new AppError(400, 'Bank Account Number and IFSC are required');
    }

    const normalizedAcc = String(bankAccountNumber).replace(/\s+/g, '');
    const normalizedIfsc = String(bankIfsc).trim().toUpperCase();
    if (!/^\d{9,18}$/.test(normalizedAcc)) {
        throw new AppError(400, 'Bank account number must be 9 to 18 digits.');
    }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(normalizedIfsc)) {
        throw new AppError(400, 'Invalid IFSC format.');
    }

    let accountId = razorpayAccountId ? String(razorpayAccountId).trim() : profile.razorpayAccountId;

    // In simulated mode we auto-generate a stable testing account ID if none is provided.
    if (!accountId && PAYOUT_MODE !== 'LIVE') {
        accountId = `test_acc_${Math.random().toString(36).slice(2, 11)}`;
    }

    if (PAYOUT_MODE === 'LIVE' && !accountId) {
        throw new AppError(400, 'Razorpay linked account ID is required for live payouts.');
    }

    await prisma.workerProfile.update({
        where: { id: profile.id },
        data: {
            bankAccountNumber: normalizedAcc,
            bankIfsc: normalizedIfsc,
            razorpayAccountId: accountId
        }
    });

    return {
        isLinked: !!accountId,
        payoutMode: PAYOUT_MODE,
    };
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

        // 3. Initiate Razorpay transfer (live) or test transfer (simulated)
        try {
            let transferId;

            const canUseLiveTransfer =
                PAYOUT_MODE === 'LIVE' &&
                typeof profile.razorpayAccountId === 'string' &&
                profile.razorpayAccountId.startsWith('acc_');

            if (canUseLiveTransfer) {
                const razorpay = getRazorpayClient();
                const transfer = await razorpay.transfers.create({
                    account: profile.razorpayAccountId,
                    amount: Math.round(Number(payoutAmount) * 100),
                    currency: 'INR',
                    notes: {
                        workerProfileId: String(profile.id),
                        payoutType: 'WORKER_WITHDRAWAL',
                    },
                });
                transferId = transfer.id;
            } else {
                transferId = `trf_test_${Math.random().toString(36).slice(2, 11)}`;
            }

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
