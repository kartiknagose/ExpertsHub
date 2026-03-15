// Specialized badge components for common use cases
// Provides consistent styling and reduces code duplication

import { Badge } from '../ui/Badge';
import { getPaymentStatusVariant, getVerificationStatusVariant } from '../../utils/statusHelpers';

import {
  CheckCircle, XCircle, Search, PlayCircle, Clock, Star
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * BookingStatusBadge - Badge for booking status with modern icons
 */
export function BookingStatusBadge({ status, size = 'md', className = '', ...props }) {
  const { t } = useTranslation();
  if (!status) return null;

  const config = {
    PENDING: { label: t('Pending Arrival'), variant: 'warning', icon: Search },
    CONFIRMED: { label: t('Confirmed'), variant: 'info', icon: CheckCircle },
    IN_PROGRESS: { label: t('Working'), variant: 'accent', icon: PlayCircle },
    COMPLETED: { label: t('Completed'), variant: 'success', icon: CheckCircle },
    CANCELLED: { label: t('Cancelled'), variant: 'error', icon: XCircle },
  };

  const c = config[status] || { label: t(status), variant: 'default', icon: Clock };
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
  const { t } = useTranslation();
  if (!status) return null;

  return (
    <Badge
      variant={getPaymentStatusVariant(status)}
      size={size}
      className={className}
      {...props}
    >
      {t(`${status}_PAYMENT`, { defaultValue: t(status) })}
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
  const { t } = useTranslation();
  if (!status) return null;

  return (
    <Badge
      variant={getVerificationStatusVariant(status)}
      size={size}
      className={className}
      {...props}
    >
      {t(`${status}_VERIFICATION`, { defaultValue: t(status) })}
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
  const { t } = useTranslation();
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
      {role === 'CUSTOMER' ? t('Customer') : role === 'WORKER' ? t('Professional') : t('Administrator')}
    </Badge>
  );
}

/**
 * WorkerTierBadge - Badge for worker experience levels (Sprint 17 - #82)
 * @param {number} totalJobs - Number of completed jobs
 */
export function WorkerTierBadge({ totalJobs = 0, size = 'sm', className = '' }) {
  const { t } = useTranslation();
  let tier = null;
  let color = '';
  let Icon = Star;

  if (totalJobs >= 500) {
    tier = 'PLATINUM';
    color = 'bg-[#E5E4E2] text-gray-800 border-gray-300';
  } else if (totalJobs >= 200) {
    tier = 'GOLD';
    color = 'bg-yellow-100 text-yellow-800 border-yellow-200';
  } else if (totalJobs >= 50) {
    tier = 'SILVER';
    color = 'bg-gray-100 text-gray-700 border-gray-200';
  } else if (totalJobs >= 10) {
    tier = 'BRONZE';
    color = 'bg-orange-100 text-orange-800 border-orange-200';
  }

  if (!tier) return null;

  return (
    <Badge
      size={size}
      className={`font-black uppercase text-[10px] tracking-widest flex items-center gap-1.5 ${color} ${className}`}
    >
      <Icon size={10} fill="currentColor" />
      {t(tier)}
    </Badge>
  );
}

