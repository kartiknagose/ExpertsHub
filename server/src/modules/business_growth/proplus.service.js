const prisma = require('../../config/prisma');
const AppError = require('../../common/errors/AppError');

/**
 * URBANPRO PLUS SUBSCRIPTION SERVICE (Sprint 17 - #74)
 * Allows customers to subscribe to UrbanPro Plus for discounts / waived fees.
 */

const PLANS = {
  plus_monthly: { price: 99, durationMonths: 1, name: 'UrbanPro Plus Monthly' },
  plus_yearly: { price: 999, durationMonths: 12, name: 'UrbanPro Plus Yearly' },
};

/**
 * Get current subscription status for a user
 */
async function getSubscriptionInfo(userId) {
  const sub = await prisma.urbanProPlusSubscription.findUnique({
    where: { userId },
  });

  if (!sub) return { isSubscribed: false };

  const now = new Date();
  const isActive = sub.status === 'ACTIVE' && sub.endDate > now;

  return {
    isSubscribed: isActive,
    status: sub.status,
    planId: sub.planId,
    startDate: sub.startDate,
    endDate: sub.endDate,
  };
}

/**
 * Subscribe a user (Simulated direct toggle for demo purposes)
 */
async function subscribeUser(userId, planId) {
  const plan = PLANS[planId];
  if (!plan) throw new AppError(400, 'Invalid subscription plan.');

  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + plan.durationMonths);

  const sub = await prisma.urbanProPlusSubscription.upsert({
    where: { userId },
    create: {
      userId,
      planId,
      status: 'ACTIVE',
      endDate,
    },
    update: {
      planId,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate,
    },
  });

  return sub;
}

/**
 * Cancel subscription auto-renewal
 */
async function cancelSubscription(userId) {
  const sub = await prisma.urbanProPlusSubscription.findUnique({
    where: { userId },
  });

  if (!sub) throw new AppError(404, 'No active subscription found.');

  return prisma.urbanProPlusSubscription.update({
    where: { userId },
    data: { status: 'CANCELLED' },
  });
}

module.exports = {
  PLANS,
  getSubscriptionInfo,
  subscribeUser,
  cancelSubscription,
};
