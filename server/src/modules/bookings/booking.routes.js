/**
 * BOOKING ROUTES - API ENDPOINTS
 */

const express = require('express');
const router = express.Router();

// Import middleware
const authenticate = require('../../middleware/auth');
const validate = require('../../middleware/validation');
const { bookingLimiter, otpLimiter } = require('../../config/rateLimit');
const { requireCustomer, requireWorker } = require('../../middleware/requireRole');

// Import validation schemas
const {
  createBookingSchema,
  updateBookingStatusSchema,
  cancelBookingSchema,
  payBookingSchema,
} = require('./booking.schemas');

// Import controller functions
const bookingController = require('./booking.controller');

/**
 * ROUTE 1: CREATE A NEW BOOKING
 */
router.post(
  '/',
  authenticate,
  requireCustomer,
  bookingLimiter,
  createBookingSchema,
  validate,
  bookingController.createBooking
);

/**
 * ROUTE 2: GET ALL MY BOOKINGS
 */
router.get(
  '/',
  authenticate,
  bookingController.getMyBookings
);

/**
 * ROUTE 3: GET OPEN BOOKINGS (JOB BOARD)
 */
router.get(
  '/open',
  authenticate,
  bookingController.getOpenBookings
);

/**
 * ROUTE 4: GET A SINGLE BOOKING BY ID
 */
router.get(
  '/:id',
  authenticate,
  bookingController.getBookingById
);

/**
 * ROUTE 5: UPDATE BOOKING STATUS
 */
router.patch(
  '/:id/status',
  authenticate,
  updateBookingStatusSchema,
  validate,
  bookingController.updateBookingStatus
);

/**
 * ROUTE 6: CANCEL A BOOKING
 */
router.patch(
  '/:id/cancel',
  authenticate,
  cancelBookingSchema,
  validate,
  bookingController.cancelBooking
);

/**
 * ROUTE 7: PAY FOR A BOOKING
 */
router.post(
  '/:id/pay',
  authenticate,
  requireCustomer,
  payBookingSchema,
  validate,
  bookingController.payBooking
);

/**
 * ROUTE 8: ACCEPT AN OPEN BOOKING
 */
router.post(
  '/:id/accept',
  authenticate,
  requireWorker,
  bookingController.acceptBooking
);

/**
 * ROUTE 9: VERIFY START OTP
 */
router.post(
  '/:id/start',
  authenticate,
  requireWorker,
  otpLimiter,
  bookingController.verifyBookingStart
);

/**
 * ROUTE 10: VERIFY COMPLETION OTP
 */
router.post(
  '/:id/complete',
  authenticate,
  requireWorker,
  otpLimiter,
  bookingController.verifyBookingCompletion
);

// ─── SESSION MANAGEMENT ROUTES (Phase 7) ───────────────────────────

/**
 * ROUTE 11: GET SESSIONS FOR A BOOKING
 */
router.get(
  '/:id/sessions',
  authenticate,
  bookingController.getBookingSessions
);

/**
 * ROUTE 12: CREATE A NEW SESSION (schedule next visit)
 */
router.post(
  '/:id/sessions',
  authenticate,
  requireWorker,
  bookingController.createSession
);

/**
 * ROUTE 13: START A SESSION (verify session OTP)
 */
router.post(
  '/:id/sessions/:sessionId/start',
  authenticate,
  requireWorker,
  otpLimiter,
  bookingController.startSession
);

/**
 * ROUTE 14: END A SESSION
 */
router.post(
  '/:id/sessions/:sessionId/end',
  authenticate,
  requireWorker,
  bookingController.endSession
);

// ─── RESCHEDULING ROUTE (Phase 7) ──────────────────────────────────

/**
 * ROUTE 15: RESCHEDULE A BOOKING
 */
router.patch(
  '/:id/reschedule',
  authenticate,
  bookingController.rescheduleBooking
);

// ─── STATUS HISTORY ROUTE (Phase 7) ────────────────────────────────

/**
 * ROUTE 16: GET BOOKING STATUS HISTORY
 */
router.get(
  '/:id/history',
  authenticate,
  bookingController.getBookingStatusHistory
);

/**
 * ROUTE 17: GET CANCELLATION POLICY FOR BOOKING
 */
router.get(
  '/:id/cancellation-policy',
  authenticate,
  bookingController.getCancellationPolicy
);

module.exports = router;
