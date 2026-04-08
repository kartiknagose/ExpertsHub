const { body, param, query } = require('express-validator');

const reportCategories = ['SAFETY', 'HARASSMENT', 'NO_SHOW', 'PROPERTY_DAMAGE', 'PAYMENT_DISPUTE', 'MISCONDUCT', 'FRAUD', 'OTHER'];
const reportStatuses = ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'];
const reportPriorities = ['LOW', 'MEDIUM', 'HIGH'];

const triggerSosSchema = [
  body('bookingId')
    .notEmpty().withMessage('Booking ID is required')
    .isInt({ min: 1 }).withMessage('Booking ID must be a positive integer')
    .toInt(),
  body('location')
    .optional({ nullable: true })
    .isObject().withMessage('Location must be an object'),
  body('location.latitude')
    .optional({ nullable: true })
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90')
    .toFloat(),
  body('location.longitude')
    .optional({ nullable: true })
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180')
    .toFloat(),
];

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

const deleteContactSchema = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Contact ID must be a positive integer')
    .toInt(),
];

const listSosAlertsQuerySchema = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 100000 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

const updateSosAlertStatusSchema = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Alert ID must be a positive integer')
    .toInt(),
  body('status')
    .notEmpty()
    .isIn(['ACKNOWLEDGED', 'RESOLVED'])
    .withMessage('Status must be ACKNOWLEDGED or RESOLVED'),
];

const createBookingReportSchema = [
  body('bookingId')
    .notEmpty()
    .withMessage('Booking ID is required')
    .isInt({ min: 1 })
    .withMessage('Booking ID must be a positive integer')
    .toInt(),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(reportCategories)
    .withMessage(`Category must be one of: ${reportCategories.join(', ')}`),
  body('details')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Details must be between 20 and 2000 characters'),
  body('evidenceUrl')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Evidence URL cannot exceed 500 characters'),
];

const listReportsQuerySchema = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 100000 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(reportStatuses)
    .withMessage(`Status must be one of: ${reportStatuses.join(', ')}`),
  query('category')
    .optional()
    .isIn(reportCategories)
    .withMessage(`Category must be one of: ${reportCategories.join(', ')}`),
  query('priority')
    .optional()
    .isIn(reportPriorities)
    .withMessage(`Priority must be one of: ${reportPriorities.join(', ')}`),
  query('bookingId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Booking ID must be a positive integer'),
];

const updateBookingReportStatusSchema = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Report ID must be a positive integer')
    .toInt(),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(reportStatuses)
    .withMessage(`Status must be one of: ${reportStatuses.join(', ')}`),
  body('adminNotes')
    .optional({ nullable: true })
    .isString()
    .withMessage('Admin notes must be text')
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Admin notes cannot exceed 2000 characters'),
];

module.exports = {
  triggerSosSchema,
  addContactSchema,
  deleteContactSchema,
  listSosAlertsQuerySchema,
  updateSosAlertStatusSchema,
  createBookingReportSchema,
  listReportsQuerySchema,
  updateBookingReportStatusSchema,
};
