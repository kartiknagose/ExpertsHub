const { body } = require('express-validator');

const sendMessageSchema = [
  body('content')
    .trim()
    .notEmpty().withMessage('Message content is required')
    .isLength({ max: 2000 }).withMessage('Message must be 2000 characters or fewer'),
];

module.exports = { sendMessageSchema };
