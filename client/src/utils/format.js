/**
 * Consistent date/time/currency formatting utilities.
 * Uses Intl.DateTimeFormat and Intl.NumberFormat for locale-aware output.
 */

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('en-IN', {
  hour: '2-digit',
  minute: '2-digit',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function formatDate(value) {
  if (!value) return '—';
  return dateFormatter.format(new Date(value));
}

export function formatTime(value) {
  if (!value) return '—';
  return timeFormatter.format(new Date(value));
}

export function formatDateTime(value) {
  if (!value) return '—';
  return dateTimeFormatter.format(new Date(value));
}

export function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return '—';
  return currencyFormatter.format(amount);
}
