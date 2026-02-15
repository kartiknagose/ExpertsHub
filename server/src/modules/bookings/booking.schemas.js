/**
 * VALIDATION SCHEMAS FOR BOOKINGS
 * 
 * What is this file?
 * This file defines the "rules" for booking data that users send to our server.
 * Think of it like a security guard checking if someone has the right papers before entering.
 * 
 * Why do we need validation?
 * - Prevents bad data from entering our database (e.g., empty dates, invalid prices)
 * - Stops hackers from sending malicious data
 * - Gives clear error messages to users if they make mistakes
 */

const { body, param } = require('express-validator');

/**
 * VALIDATION RULES FOR CREATING A BOOKING
 * 
 * When a customer wants to book a service, they must provide:
 * 1. workerId - The ID of the worker they want to hire
 * 2. serviceId - The ID of the service they want (e.g., plumbing, cleaning)
 * 3. scheduledDate - When they want the service (must be a valid date)
 * 4. addressDetails - Where the service should be performed
 * 5. estimatedPrice - How much they expect to pay (optional, worker can adjust)
 */
const createBookingSchema = [
  // workerProfileId is OPTIONAL now. 
  // If provided, it's a Direct Booking. If null/undefined, it's an Open Booking.
  body('workerProfileId')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('Worker ID must be a valid number'),

  // Check if serviceId exists and is a valid number
  body('serviceId')
    .notEmpty().withMessage('Service ID is required')
    .isInt({ min: 1 }).withMessage('Service ID must be a valid number'),

  // Check if scheduledDate is a valid date format (ISO 8601: 2026-01-30T10:00:00Z)
  body('scheduledDate')
    .notEmpty().withMessage('Scheduled date is required')
    .isISO8601().withMessage('Scheduled date must be a valid date format')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      if (date <= now) {
        throw new Error('Scheduled date must be in the future');
      }
      return true;
    }),

  // Check if addressDetails is provided and is text
  body('addressDetails')
    .notEmpty().withMessage('Address details are required')
    .isString().withMessage('Address details must be text')
    .trim()
    .isLength({ min: 10, max: 500 }).withMessage('Address must be between 10 and 500 characters'),

  // Optional: Check estimatedPrice if provided
  body('estimatedPrice')
    .optional()
    .isDecimal({ decimal_digits: '0,2' }).withMessage('Estimated price must be a valid number with up to 2 decimal places')
    .custom((value) => {
      const price = parseFloat(value);
      if (price < 0) {
        throw new Error('Price cannot be negative');
      }
      if (price > 100000) {
        throw new Error('Price exceeds maximum limit of $100,000');
      }
      return true;
    }),

  // Optional: Additional notes from customer
  body('notes')
    .optional()
    .isString().withMessage('Notes must be text')
    .trim()
    .isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),
];

/**
 * VALIDATION RULES FOR UPDATING BOOKING STATUS
 * 
 * What statuses exist?
 * - PENDING: Customer created booking, waiting for worker to accept
 * - CONFIRMED: Worker accepted the booking
 * - IN_PROGRESS: Worker started the job
 * - COMPLETED: Job finished successfully
 * - CANCELLED: Either customer or worker cancelled
 * 
 * Why validate status?
 * - Prevents invalid statuses like "DONE" or "MAYBE" (only allow defined statuses)
 * - Ensures bookings follow the correct workflow
 */
const updateBookingStatusSchema = [
  // Check if the booking ID in the URL is a valid number
  param('id')
    .isInt({ min: 1 }).withMessage('Booking ID must be a valid number'),

  // Check if the new status is one of the allowed values
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
    .withMessage('Status must be one of: PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED'),
];

/**
 * VALIDATION RULES FOR CANCELLING A BOOKING
 * 
 * When someone wants to cancel a booking, they can optionally provide a reason.
 * This helps both parties understand why the cancellation happened.
 */
const cancelBookingSchema = [
  // Check if the booking ID in the URL is a valid number
  param('id')
    .isInt({ min: 1 }).withMessage('Booking ID must be a valid number'),

  // Optional: Cancellation reason
  body('cancellationReason')
    .optional()
    .isString().withMessage('Cancellation reason must be text')
    .trim()
    .isLength({ max: 500 }).withMessage('Cancellation reason cannot exceed 500 characters'),
];

/**
 * VALIDATION RULES FOR PAYING A BOOKING
 * 
 * Allows an optional payment reference
 */
const payBookingSchema = [
  param('id')
    .isInt({ min: 1 }).withMessage('Booking ID must be a valid number'),

  body('paymentReference')
    .optional()
    .isString().withMessage('Payment reference must be text')
    .trim()
    .isLength({ max: 100 }).withMessage('Payment reference cannot exceed 100 characters'),
];

// Export these validation schemas so other files can use them
module.exports = {
  createBookingSchema,
  updateBookingStatusSchema,
  cancelBookingSchema,
  payBookingSchema,
};
