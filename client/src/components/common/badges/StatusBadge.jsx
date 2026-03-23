/**
 * StatusBadge Component
 * Consolidated status badge component that replaces 5+ scattered variants
 * 
 * Centralized logic for:
 * - BookingStatusBadge
 * - PaymentStatusBadge  
 * - VerificationStatusBadge
 * - WorkerStatusBadge
 * - CustomStatusBadge
 * 
 * Now all status badges use single component with type-based rendering
 */

import { Badge } from '../../ui/Badge';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  PlayCircle,
  Search,
  Star,
  Shield,
  TrendingUp,
  Pause,
  RotateCw,
  Ban,
} from 'lucide-react';

/**
 * Status badge configuration mapping
 */
const STATUS_CONFIG = {
  // Booking statuses
  booking: {
    PENDING: {
      label: 'Pending Arrival',
      variant: 'warning',
      icon: Search,
      pulse: true,
    },
    CONFIRMED: { label: 'Confirmed', variant: 'info', icon: CheckCircle },
    IN_PROGRESS: {
      label: 'Working',
      variant: 'accent',
      icon: PlayCircle,
      pulse: true,
    },
    COMPLETED: { label: 'Completed', variant: 'success', icon: CheckCircle },
    CANCELLED: { label: 'Cancelled', variant: 'error', icon: XCircle },
    RESCHEDULED: {
      label: 'Rescheduled',
      variant: 'warning',
      icon: RotateCw,
    },
  },

  // Payment statuses
  payment: {
    PENDING: { label: 'Pending', variant: 'warning', icon: Clock },
    COMPLETED: { label: 'Paid', variant: 'success', icon: CheckCircle },
    FAILED: { label: 'Failed', variant: 'error', icon: XCircle },
    REFUNDED: { label: 'Refunded', variant: 'info', icon: RotateCw },
    PARTIAL: { label: 'Partial', variant: 'warning', icon: AlertCircle },
  },

  // Verification statuses
  verification: {
    PENDING: {
      label: 'Pending Review',
      variant: 'warning',
      icon: Clock,
      pulse: true,
    },
    VERIFIED: { label: 'Verified', variant: 'success', icon: CheckCircle },
    REJECTED: { label: 'Rejected', variant: 'error', icon: XCircle },
    RESUBMIT: { label: 'Resubmit Required', variant: 'error', icon: AlertCircle },
    APPROVED: { label: 'Approved', variant: 'success', icon: Shield },
  },

  // Worker statuses
  worker: {
    ACTIVE: { label: 'Active', variant: 'success', icon: CheckCircle },
    INACTIVE: { label: 'Inactive', variant: 'error', icon: Pause },
    PAUSED: { label: 'Paused', variant: 'warning', icon: Pause },
    BANNED: { label: 'Banned', variant: 'error', icon: Ban },
    PENDING: { label: 'Pending Approval', variant: 'warning', icon: Clock },
  },

  // Rating/Review statuses
  rating: {
    EXCELLENT: { label: '★★★★★', variant: 'success', icon: Star },
    GOOD: { label: '★★★★', variant: 'success', icon: Star },
    AVERAGE: { label: '★★★', variant: 'warning', icon: Star },
    POOR: { label: '★★', variant: 'warning', icon: Star },
    VERY_POOR: { label: '★', variant: 'error', icon: Star },
  },

  // Generic statuses
  generic: {
    ACTIVE: { label: 'Active', variant: 'success', icon: CheckCircle },
    INACTIVE: { label: 'Inactive', variant: 'error', icon: XCircle },
    PENDING: { label: 'Pending', variant: 'warning', icon: Clock },
    SUCCESS: { label: 'Success', variant: 'success', icon: CheckCircle },
    ERROR: { label: 'Error', variant: 'error', icon: XCircle },
    ALERT: { label: 'Alert', variant: 'error', icon: AlertCircle },
    INFO: { label: 'Info', variant: 'info', icon: AlertCircle },
  },
};

/**
 * StatusBadge Component
 * 
 * @param {string} status - The status value (e.g., 'PENDING', 'COMPLETED')
 * @param {string} type - Category: 'booking' | 'payment' | 'verification' | 'worker' | 'rating' | 'generic'
 * @param {string} size - Badge size: 'sm' | 'md' | 'lg'
 * @param {string} customLabel - Override the label
 * @param {React.ReactNode} icon - Override the icon
 * @param {string} className - Additional CSS
 */
export function StatusBadge({
  status,
  type = 'generic',
  size = 'md',
  customLabel,
  icon: customIcon,
  className = '',
  animated = false,
}) {
  if (!status) return null;

  const normalizedStatus = String(status).toUpperCase();
  const config = STATUS_CONFIG[type]?.[normalizedStatus] || STATUS_CONFIG.generic[normalizedStatus];

  if (!config) {
    // Fallback for unknown status
    return (
      <Badge variant="default" size={size} className={className}>
        {customLabel || status}
      </Badge>
    );
  }

  const Icon = customIcon || config.icon;
  const label = customLabel || config.label;
  const pulse = animated && config.pulse;

  return (
    <Badge
      variant={config.variant}
      size={size}
      className={`
        flex items-center gap-1.5 px-3 py-1 font-semibold uppercase text-[10px] tracking-widest rounded-lg border shadow-sm
        ${pulse ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      {Icon && <Icon size={12} className={pulse ? 'animate-pulse' : ''} />}
      {label}
    </Badge>
  );
}

/**
 * Booking-specific status badge (convenience wrapper)
 */
export function BookingStatusBadge({ status, size = 'md', className = '', animated = true }) {
  return (
    <StatusBadge
      status={status}
      type="booking"
      size={size}
      className={className}
      animated={animated}
    />
  );
}

/**
 * Payment-specific status badge (convenience wrapper)
 */
export function PaymentStatusBadge({ status, size = 'md', className = '' }) {
  return (
    <StatusBadge
      status={status}
      type="payment"
      size={size}
      className={className}
    />
  );
}

/**
 * Verification-specific status badge (convenience wrapper)
 */
export function VerificationStatusBadge({ status, size = 'md', className = '', animated = true }) {
  return (
    <StatusBadge
      status={status}
      type="verification"
      size={size}
      className={className}
      animated={animated}
    />
  );
}

/**
 * Worker-specific status badge (convenience wrapper)
 */
export function WorkerStatusBadge({ status, size = 'md', className = '' }) {
  return (
    <StatusBadge
      status={status}
      type="worker"
      size={size}
      className={className}
    />
  );
}

/**
 * Rating-specific status badge (convenience wrapper)
 */
export function RatingBadge({ rating, size = 'md', className = '' }) {
  const ratingLabels = {
    5: 'EXCELLENT',
    4: 'GOOD',
    3: 'AVERAGE',
    2: 'POOR',
    1: 'VERY_POOR',
  };

  const statusKey = ratingLabels[Math.round(rating)] || 'AVERAGE';

  return (
    <StatusBadge
      status={statusKey}
      type="rating"
      size={size}
      className={className}
    />
  );
}

/**
 * Helper to get status color variant
 */
export function getStatusVariant(status, type = 'generic') {
  const config = STATUS_CONFIG[type]?.[String(status).toUpperCase()];
  return config?.variant || 'default';
}

/**
 * Helper to get status label
 */
export function getStatusLabel(status, type = 'generic') {
  const config = STATUS_CONFIG[type]?.[String(status).toUpperCase()];
  return config?.label || status;
}
