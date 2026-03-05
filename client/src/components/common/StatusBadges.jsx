// Specialized badge components for common use cases
// Provides consistent styling and reduces code duplication

import { Badge } from '../ui/Badge';
import { getPaymentStatusVariant, getVerificationStatusVariant } from '../../utils/statusHelpers';

import {
  CheckCircle, XCircle, Search, PlayCircle, Clock
} from 'lucide-react';

/**
 * BookingStatusBadge - Badge for booking status with modern icons
 */
export function BookingStatusBadge({ status, size = 'md', className = '', ...props }) {
  if (!status) return null;

  const config = {
    PENDING: { label: 'Pending Arrival', variant: 'warning', icon: Search },
    CONFIRMED: { label: 'Confirmed', variant: 'info', icon: CheckCircle },
    IN_PROGRESS: { label: 'Working', variant: 'accent', icon: PlayCircle },
    COMPLETED: { label: 'Completed', variant: 'success', icon: CheckCircle },
    CANCELLED: { label: 'Cancelled', variant: 'error', icon: XCircle },
  };

  const c = config[status] || { label: status, variant: 'default', icon: Clock };
  const Icon = c.icon;

  return (
    <Badge
      variant={c.variant}
      size={size}
      className={`flex items-center gap-1.5 px-3 py-1 font-black uppercase text-[10px] tracking-widest rounded-lg border shadow-sm ${className}`}
      {...props}
    >
      <Icon size={12} className={status === 'PENDING' ? 'animate-pulse' : ''} />
      {c.label}
    </Badge>
  );
}

/**
 * PaymentStatusBadge - Badge for payment status
 * @param {string} status - Payment status (PAID, PENDING, FAILED, REFUNDED)
 * @param {string} size - Badge size: 'sm', 'md', 'lg'
 * @param {string} className - Additional CSS classes
 */
export function PaymentStatusBadge({ status, size = 'sm', className = '', ...props }) {
  if (!status) return null;

  return (
    <Badge
      variant={getPaymentStatusVariant(status)}
      size={size}
      className={className}
      {...props}
    >
      {status}
    </Badge>
  );
}

/**
 * VerificationStatusBadge - Badge for verification status
 * @param {string} status - Verification status (PENDING, APPROVED, REJECTED, MORE_INFO)
 * @param {string} size - Badge size: 'sm', 'md', 'lg'
 * @param {string} className - Additional CSS classes
 */
export function VerificationStatusBadge({ status, size = 'md', className = '', ...props }) {
  if (!status) return null;

  return (
    <Badge
      variant={getVerificationStatusVariant(status)}
      size={size}
      className={className}
      {...props}
    >
      {status}
    </Badge>
  );
}

/**
 * RoleBadge - Badge for user roles
 * @param {string} role - User role (CUSTOMER, WORKER, ADMIN)
 * @param {string} size - Badge size: 'sm', 'md', 'lg'
 * @param {string} className - Additional CSS classes
 */
export function RoleBadge({ role, size = 'sm', className = '', ...props }) {
  if (!role) return null;

  const roleVariants = {
    'ADMIN': 'info',
    'WORKER': 'warning',
    'CUSTOMER': 'default',
  };

  return (
    <Badge
      variant={roleVariants[role] || 'default'}
      size={size}
      className={className}
      {...props}
    >
      {role}
    </Badge>
  );
}
