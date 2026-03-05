const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');
const authenticate = require('../../middleware/auth');

router.get('/', authenticate, notificationController.getNotifications);
router.patch('/:id/read', authenticate, notificationController.readNotification);
router.post('/read-all', authenticate, notificationController.readAllNotifications);

module.exports = router;
