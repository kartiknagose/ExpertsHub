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
