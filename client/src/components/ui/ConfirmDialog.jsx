// Confirmation dialog component
// Replaces native browser confirm() dialogs for better UX

import { Modal, ModalFooter } from './Modal';
import { Button } from './Button';
import { AlertTriangle, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * ConfirmDialog Component
 * @param {boolean} isOpen - Dialog open state
 * @param {function} onConfirm - Callback when user confirms
 * @param {function} onCancel - Callback when user cancels
 * @param {string} title - Dialog title
 * @param {string} message - Confirmation message
 * @param {string} confirmText - Confirm button text (default: "Confirm")
 * @param {string} cancelText - Cancel button text (default: "Cancel")
 * @param {string} variant - Visual variant: 'danger', 'warning', 'success', 'primary'
 * @param {boolean} loading - Show loading state on confirm button
 */
export function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  // Icon based on variant
  const icons = {
    danger: Trash2,
    warning: AlertTriangle,
    success: CheckCircle,
    primary: AlertCircle,
  };

  const Icon = icons[variant] || AlertCircle;

  // Button variant mapping
  const buttonVariant = variant === 'danger' ? 'danger' : 'primary';

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full ${
          variant === 'danger' 
            ? 'bg-error-100 dark:bg-error-900/30' 
            : variant === 'warning'
            ? 'bg-warning-100 dark:bg-warning-900/30'
            : variant === 'success'
            ? 'bg-success-100 dark:bg-success-900/30'
            : 'bg-brand-100 dark:bg-brand-900/30'
        }`}>
          <Icon 
            size={24} 
            className={`${
              variant === 'danger' 
                ? 'text-error-600 dark:text-error-400' 
                : variant === 'warning'
                ? 'text-warning-600 dark:text-warning-400'
                : variant === 'success'
                ? 'text-success-600 dark:text-success-400'
                : 'text-brand-600 dark:text-brand-400'
            }`}
          />
        </div>
        <div className="flex-1">
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      <ModalFooter>
        <Button 
          variant={buttonVariant} 
          onClick={onConfirm}
          loading={loading}
          disabled={loading}
        >
          {confirmText}
        </Button>
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={loading}
        >
          {cancelText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
