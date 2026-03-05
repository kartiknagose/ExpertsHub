// Shared status helpers for consistent badge variants

export const getBookingStatusVariant = (status) => {
  switch (status) {
    case 'PENDING':
      return 'warning';
    case 'CONFIRMED':
      return 'info';
    case 'IN_PROGRESS':
      return 'default';
    case 'COMPLETED':
      return 'success';
    case 'CANCELLED':
      return 'error';
    default:
      return 'default';
  }
};

export const getPaymentStatusVariant = (status) => {
  switch (status) {
    case 'PAID':
      return 'success';
    case 'FAILED':
      return 'error';
    case 'REFUNDED':
      return 'warning';
    default:
      return 'info';
  }
};

export const getVerificationStatusVariant = (status) => {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'REJECTED':
      return 'error';
    case 'MORE_INFO':
      return 'warning';
    default:
      return 'info';
  }
};

export const getVerificationLevelVariant = (level) => {
  switch (level) {
    case 'PREMIUM':
      return 'success';
    case 'VERIFIED':
      return 'info';
    case 'DOCUMENTS':
      return 'warning';
    default:
      return 'default';
  }
};

/**
 * Determines if payment badge should be shown for a booking
 * Cancelled bookings should not show payment badges
 * @param {Object} booking - The booking object
 * @returns {boolean} - Whether to show the payment badge
 */
export const shouldShowPaymentBadge = (booking) => {
  if (!booking) return false;
  return booking.status !== 'CANCELLED';
};

/**
 * Gets the appropriate payment status text for display
 * Cancelled bookings show 'N/A' instead of payment status
 * @param {Object} booking - The booking object
 * @returns {string} - The payment status text to display
 */
export const getPaymentDisplayText = (booking) => {
  if (!booking) return 'PENDING';
  if (booking.status === 'CANCELLED') return 'N/A';
  return booking.paymentStatus || 'PENDING';
};
