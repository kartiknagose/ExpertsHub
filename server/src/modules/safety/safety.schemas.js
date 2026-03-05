const { body } = require('express-validator');

const addContactSchema = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2–100 characters'),
  body('phone')
    .trim()
    .isMobilePhone('any', { strictMode: false })
    .withMessage('A valid phone number is required'),
  body('relation')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Relation must be 2–50 characters'),
];

module.exports = {
  addContactSchema,
};
