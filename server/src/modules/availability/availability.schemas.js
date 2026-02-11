const { body } = require('express-validator');

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const createAvailabilitySchema = [
  body('dayOfWeek')
    .notEmpty()
    .withMessage('Day of week is required')
    .isInt({ min: 0, max: 6 })
    .withMessage('Day of week must be between 0 (Sunday) and 6 (Saturday)'),
  body('startTime')
    .notEmpty()
    .withMessage('Start time is required')
    .matches(timePattern)
    .withMessage('Start time must be in HH:mm format'),
  body('endTime')
    .notEmpty()
    .withMessage('End time is required')
    .matches(timePattern)
    .withMessage('End time must be in HH:mm format'),
];

module.exports = {
  createAvailabilitySchema,
};
