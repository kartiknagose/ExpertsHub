const prisma = require('../../config/prisma');
const { getIo } = require('../../socket');

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

        // Push via Socket.IO
        const io = getIo();
        if (io) {
            io.to(`user:${userId}`).emit('notification:new', notification);
        }

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        // We don't want to crash the main flow if notification fails
        return null;
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
