const asyncHandler = require('../../common/utils/asyncHandler');
const parseId = require('../../common/utils/parseId');
const parsePagination = require('../../common/utils/parsePagination');
const notificationService = require('./notification.service');

const getNotifications = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const { data: notifications, total } = await notificationService.getUserNotifications(req.user.id, { skip, limit });
    const unreadCount = await notificationService.getUnreadCount(req.user.id);
    res.json({ notifications, unreadCount, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

const readNotification = asyncHandler(async (req, res) => {
    const id = parseId(req.params.id, 'notification ID');
    await notificationService.markAsRead(id, req.user.id);
    res.json({ success: true });
});

const readAllNotifications = asyncHandler(async (req, res) => {
    await notificationService.markAllAsRead(req.user.id);
    res.json({ success: true });
});

module.exports = {
    getNotifications,
    readNotification,
    readAllNotifications
};
