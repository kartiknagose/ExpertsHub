const { body } = require('express-validator');

const sendMessageSchema = [
  body('content')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Message must be 2000 characters or fewer'),
  body('type')
    .optional()
    .isIn(['TEXT', 'IMAGE', 'DOCUMENT', 'VOICE']).withMessage('Invalid message type'),
  body('mediaUrl').optional().isURL().withMessage('Invalid media URL'),
  body('fileName').optional().isString(),
  body('fileSize').optional().isInt(),
];

module.exports = { sendMessageSchema };
