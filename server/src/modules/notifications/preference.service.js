// server/src/modules/notifications/preference.service.js
// Manages per-user notification preferences (channels + event types).

const prisma = require('../../config/prisma');

const PREFERENCE_FIELDS = [
  'pushEnabled', 'emailEnabled', 'inAppEnabled',
  'bookingUpdates', 'reviewAlerts', 'paymentAlerts',
  'chatMessages', 'promotions', 'systemAlerts',
];

/**
 * Get notification preferences for a user.
 * Returns default values if no record exists yet.
 */
async function getPreferences(userId) {
  let prefs = await prisma.notificationPreference.findUnique({ where: { userId } });

  if (!prefs) {
    // Return defaults without persisting — only persist on explicit save
    prefs = {
      pushEnabled: true,
      emailEnabled: true,
      inAppEnabled: true,
      bookingUpdates: true,
      reviewAlerts: true,
      paymentAlerts: true,
      chatMessages: true,
      promotions: false,
      systemAlerts: true,
    };
  }

  return prefs;
}

/**
 * Update notification preferences for a user (upsert).
 * Only whitelisted fields are accepted.
 */
async function updatePreferences(userId, updates) {
  const data = {};
  for (const field of PREFERENCE_FIELDS) {
    if (typeof updates[field] === 'boolean') {
      data[field] = updates[field];
    }
  }

  return prisma.notificationPreference.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });
}

/**
 * Check whether a specific notification type should be sent
 * to a user, considering their preferences.
 *
 * @param {number} userId
 * @param {string} channel - 'push' | 'email' | 'inApp'
 * @param {string} eventType - 'BOOKING_UPDATE' | 'REVIEW_RECEIVED' | 'PAYMENT' | 'CHAT' | 'PROMOTION' | 'SYSTEM'
 */
async function shouldNotify(userId, channel, eventType) {
  const prefs = await getPreferences(userId);

  // Check channel enabled
  const channelMap = { push: 'pushEnabled', email: 'emailEnabled', inApp: 'inAppEnabled' };
  if (!prefs[channelMap[channel]]) return false;

  // Check event type enabled
  const eventMap = {
    BOOKING_UPDATE: 'bookingUpdates',
    REVIEW_RECEIVED: 'reviewAlerts',
    PAYMENT: 'paymentAlerts',
    CHAT: 'chatMessages',
    PROMOTION: 'promotions',
    SYSTEM: 'systemAlerts',
  };
  const prefField = eventMap[eventType];
  if (prefField && prefs[prefField] === false) return false;

  return true;
}

module.exports = {
  getPreferences,
  updatePreferences,
  shouldNotify,
};
