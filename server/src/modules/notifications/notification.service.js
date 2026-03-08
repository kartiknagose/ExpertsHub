const prisma = require('../../config/prisma');
const { getIo } = require('../../socket');
const { pushToUser } = require('./push.service');
const { shouldNotify } = require('./preference.service');

async function createNotification({ userId, type, title, message, data }) {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                data: data || {}
            }
        });

        // Push via Socket.IO (in-app)
        const sendInApp = await shouldNotify(userId, 'inApp', type);
        if (sendInApp) {
            const io = getIo();
            if (io) {
                io.to(`user:${userId}`).emit('notification:new', notification);
            }
        }

        // Push via Web Push (browser notification)
        const sendPush = await shouldNotify(userId, 'push', type);
        if (sendPush) {
            pushToUser(userId, {
                title,
                body: message,
                icon: '/pwa-192x192.png',
                badge: '/pwa-64x64.png',
                tag: `${type}-${notification.id}`,
                data: { url: getNotificationUrl(type, data), ...data },
            }).catch(() => {}); // fire-and-forget — don't block the main flow
        }

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
}

/**
 * Generate a URL to navigate to when the user clicks the push notification.
 */
function getNotificationUrl(type, data) {
    if (!data) return '/';
    switch (type) {
        case 'BOOKING_UPDATE':
            return data.bookingId ? `/bookings/${data.bookingId}` : '/dashboard';
        case 'REVIEW_RECEIVED':
            return '/reviews';
        case 'PAYMENT':
            return data.bookingId ? `/bookings/${data.bookingId}` : '/payments';
        case 'CHAT':
            return '/messages';
        default:
            return '/';
    }
}

async function getUserNotifications(userId, { skip = 0, limit = 20 } = {}) {
    const where = { userId };
    const [data, total] = await Promise.all([
        prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma.notification.count({ where }),
    ]);
    return { data, total };
}

async function markAsRead(notificationId, userId) {
    return await prisma.notification.updateMany({
        where: { id: notificationId, userId },
        data: { read: true }
    });
}

async function markAllAsRead(userId) {
    return await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true }
    });
}

async function getUnreadCount(userId) {
    return await prisma.notification.count({
        where: { userId, read: false }
    });
}

module.exports = {
    createNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount
};
