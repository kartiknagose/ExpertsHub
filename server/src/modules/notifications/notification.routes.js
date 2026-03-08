const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');
const pushController = require('./push.controller');
const authenticate = require('../../middleware/auth');

// Existing notification routes
router.get('/', authenticate, notificationController.getNotifications);
router.patch('/:id/read', authenticate, notificationController.readNotification);
router.post('/read-all', authenticate, notificationController.readAllNotifications);
router.get('/mock-gateway', notificationController.getMockGatewayMessages); // Open endpoint for testing UI

// Push subscription routes
router.get('/push/vapid-key', authenticate, pushController.getVapidPublicKey);
router.post('/push/subscribe', authenticate, pushController.subscribe);
router.post('/push/unsubscribe', authenticate, pushController.unsubscribe);
router.get('/push/subscriptions', authenticate, pushController.getSubscriptions);

// Notification preferences
router.get('/preferences', authenticate, pushController.getPreferences);
router.patch('/preferences', authenticate, pushController.updatePreferences);

module.exports = router;
