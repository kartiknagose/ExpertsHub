const express = require('express');
const router = express.Router();
const chatController = require('./chat.controller');
const authenticate = require('../../middleware/auth');
const validate = require('../../middleware/validation');
const { sendMessageSchema } = require('./chat.schemas');

router.use(authenticate);

router.get('/conversations', chatController.getUserConversations);
router.get('/booking/:bookingId', chatController.getOrCreateConversation);
router.get('/:conversationId/messages', chatController.getMessages);
router.post('/:conversationId/messages', sendMessageSchema, validate, chatController.sendMessage);

module.exports = router;
