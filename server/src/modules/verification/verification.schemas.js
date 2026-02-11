const { body } = require('express-validator');

const applyVerificationSchema = [
  body('notes')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Notes must be 1000 characters or less'),
];

const reviewVerificationSchema = [
  body('status')
    .notEmpty()
    .isIn(['PENDING', 'APPROVED', 'REJECTED', 'MORE_INFO'])
    .withMessage('Status must be one of: PENDING, APPROVED, REJECTED, MORE_INFO'),
  body('score')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Score must be between 0 and 100'),
  body('notes')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Notes must be 1000 characters or less'),
];

module.exports = {
  applyVerificationSchema,
  reviewVerificationSchema,
};
