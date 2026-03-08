// server/src/config/webPush.js
// Configures the web-push library with VAPID credentials.
// VAPID (Voluntary Application Server Identification) keys
// authenticate push requests so browsers trust our server.

const webpush = require('web-push');

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@urbanpro.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} else {
  console.warn('VAPID keys not configured — push notifications disabled. Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in .env');
}

/**
 * Send a push notification to a single subscription.
 * Returns true on success, false on failure (subscription expired / invalid).
 */
async function sendPushNotification(subscription, payload) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return false;

  const pushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.p256dh,
      auth: subscription.auth,
    },
  };

  try {
    await webpush.sendNotification(
      pushSubscription,
      typeof payload === 'string' ? payload : JSON.stringify(payload),
      { TTL: 60 * 60 } // 1 hour time-to-live
    );
    return true;
  } catch (err) {
    // 404 or 410 = subscription expired; caller should remove it
    if (err.statusCode === 404 || err.statusCode === 410) {
      return false;
    }
    console.error('Push notification failed:', err.message);
    return false;
  }
}

module.exports = {
  sendPushNotification,
  VAPID_PUBLIC_KEY,
};
