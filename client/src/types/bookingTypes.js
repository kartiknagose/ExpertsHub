/**
 * Booking Type Definitions
 * 
 * Defines the shape of booking-related data
 * Matches backend Booking, Review, and Availability models
 */

/**
 * @typedef {('PENDING'|'CONFIRMED'|'IN_PROGRESS'|'COMPLETED'|'CANCELLED')} BookingStatus
 * 
 * Booking lifecycle:
 * PENDING → CONFIRMED → IN_PROGRESS → COMPLETED
 *   ↓ (can cancel anytime before COMPLETED)
 * CANCELLED
 */

/**
 * @typedef {Object} Booking
 * @property {number} id - Unique booking ID
 * @property {number} customerId - Customer user ID
 * @property {number|null} workerProfileId - Assigned worker profile ID (null if not assigned)
 * @property {number} serviceId - Service ID
 * @property {Date} scheduledAt - When the service is scheduled
 * @property {BookingStatus} status - Current booking status
 * @property {number|null} totalPrice - Total price for the service
 * @property {string|null} address - Address where service will be done
 * @property {string|null} notes - Special notes/instructions from customer
 * @property {string|null} cancellationReason - Why it was cancelled (if cancelled)
 * @property {Date} createdAt - When booking was created
 * @property {Date} updatedAt - Last updated
 */

/**
 * @typedef {Object} Review
 * @property {number} id - Unique review ID
 * @property {number} bookingId - Booking ID being reviewed
 * @property {number} reviewerId - User who wrote the review
 * @property {number} revieweeId - User being reviewed
 * @property {number} rating - Rating 1-5
 * @property {string|null} comment - Review text
 * @property {Date} createdAt - When review was posted
 */

/**
 * @typedef {Object} Availability
 * @property {number} id - Unique availability ID
 * @property {number} workerProfileId - Worker profile ID
 * @property {number} dayOfWeek - Day 0-6 (Sunday to Saturday)
 * @property {string} startTime - Start time (HH:mm format)
 * @property {string} endTime - End time (HH:mm format)
 * @property {Date} createdAt - When created
 * @property {Date} updatedAt - Last updated
 */

/**
 * @typedef {Object} CreateBookingRequest
 * @property {number} customerId - Customer creating booking
 * @property {number} serviceId - Service being booked
 * @property {number|null} workerProfileId - Worker profile being booked (optional)
 * @property {string} scheduledDate - When service is scheduled (ISO string)
 * @property {string} addressDetails - Service address
 * @property {string|null} notes - Special instructions
 */

/**
 * @typedef {Object} UpdateBookingStatusRequest
 * @property {BookingStatus} status - New status
 */

/**
 * @typedef {Object} CancelBookingRequest
 * @property {string} cancellationReason - Why cancelling
 */

export {};