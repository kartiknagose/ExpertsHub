// Bookings API calls
// Handles booking creation, listing, status updates, and cancellation

import axiosInstance from './axios';

// Bookings API endpoints
const BOOKINGS_ENDPOINTS = {
  BASE: '/bookings',
  BY_ID: (id) => `/bookings/${id}`,
  UPDATE_STATUS: (id) => `/bookings/${id}/status`,
  CANCEL: (id) => `/bookings/${id}/cancel`,
  PAY: (id) => `/bookings/${id}/pay`,
};

/**
 * Create a new booking
 * @param {Object} data - Booking data
 * @param {number} data.workerProfileId - Worker profile ID to book
 * @param {number} data.serviceId - Service ID to book
 * @param {string} data.scheduledDate - ISO date string for scheduled time
 * @param {string} data.addressDetails - Service address
 * @param {number} data.estimatedPrice - Optional estimated price
 * @param {string} data.notes - Optional notes
 * @returns {Promise} Response with created booking
 */
export const createBooking = async (data) => {
  const response = await axiosInstance.post(BOOKINGS_ENDPOINTS.BASE, data);
  return response.data;
};

/**
 * Get all bookings for current user
 * - Customers see their bookings
 * - Workers see bookings assigned to them
 * @returns {Promise} Response with array of bookings
 */
export const getAllBookings = async () => {
  const response = await axiosInstance.get(BOOKINGS_ENDPOINTS.BASE);
  return response.data;
};

/**
 * Get single booking by ID
 * @param {string} bookingId - Booking ID
 * @returns {Promise} Response with booking details
 */
export const getBookingById = async (bookingId) => {
  const response = await axiosInstance.get(BOOKINGS_ENDPOINTS.BY_ID(bookingId));
  return response.data;
};

/**
 * Update booking status (WORKER only)
 * @param {string} bookingId - Booking ID
 * @param {Object} data - Status update data
 * @param {string} data.status - New status (PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED)
 * @returns {Promise} Response with updated booking
 */
export const updateBookingStatus = async (bookingId, data) => {
  const response = await axiosInstance.patch(BOOKINGS_ENDPOINTS.UPDATE_STATUS(bookingId), data);
  return response.data;
};

/**
 * Cancel a booking
 * - Customers can cancel their own bookings
 * - Workers can cancel bookings assigned to them
 * @param {string} bookingId - Booking ID
 * @returns {Promise} Response with cancelled booking
 */
export const cancelBooking = async (bookingId) => {
  const response = await axiosInstance.patch(BOOKINGS_ENDPOINTS.CANCEL(bookingId));
  return response.data;
};

/**
 * Pay for a booking (CUSTOMER only)
 * @param {string} bookingId - Booking ID
 * @param {Object} data - Optional payment payload
 * @param {string} data.paymentReference - Payment reference (optional)
 * @returns {Promise} Response with updated booking
 */
export const payBooking = async (bookingId, data = {}) => {
  const response = await axiosInstance.post(BOOKINGS_ENDPOINTS.PAY(bookingId), data);
  return response.data;
};
