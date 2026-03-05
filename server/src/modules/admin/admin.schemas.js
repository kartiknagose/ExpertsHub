const { body, query } = require('express-validator');

const VALID_ROLES = ['CUSTOMER', 'WORKER', 'ADMIN'];

const getUsersSchema = [
  query('role')
    .optional()
    .toUpperCase()
    .isIn(VALID_ROLES)
    .withMessage(`Role must be one of: ${VALID_ROLES.join(', ')}`),
];

const updateUserStatusSchema = [
  body('isActive')
    .exists({ checkNull: true })
    .withMessage('isActive is required')
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

module.exports = {
  getUsersSchema,
  updateUserStatusSchema,
};
