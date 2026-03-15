// ConfirmDialog — premium variant with icon container and reordered buttons

import { Modal, ModalFooter } from './Modal';
import { Button } from './Button';
import { AlertTriangle, Trash2, CheckCircle, AlertCircle, Info } from 'lucide-react';

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
  const variantConfig = {
    danger: {
      icon: Trash2,
      iconBg:   'bg-error-100 dark:bg-error-500/20',
      iconText: 'text-error-600 dark:text-error-400',
      btnVariant: 'danger',
    },
    warning: {
      icon: AlertTriangle,
      iconBg:   'bg-warning-100 dark:bg-warning-500/20',
      iconText: 'text-warning-600 dark:text-warning-400',
      btnVariant: 'primary',
    },
    success: {
      icon: CheckCircle,
      iconBg:   'bg-success-100 dark:bg-success-500/20',
      iconText: 'text-success-600 dark:text-success-400',
      btnVariant: 'success',
    },
    primary: {
      icon: Info,
      iconBg:   'bg-brand-100 dark:bg-brand-500/20',
      iconText: 'text-brand-600 dark:text-brand-400',
      btnVariant: 'primary',
    },
  };

  const cfg = variantConfig[variant] || variantConfig.danger;
  const Icon = cfg.icon;

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-2xl shrink-0 ${cfg.iconBg}`}>
          <Icon size={22} className={cfg.iconText} />
        </div>
        <div className="flex-1 pt-0.5">
          <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed text-sm">
            {message}
          </p>
        </div>
      </div>

      <ModalFooter className="mt-2">
        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={loading}
          size="sm"
        >
          {cancelText}
        </Button>
        <Button
          variant={cfg.btnVariant}
          onClick={onConfirm}
          loading={loading}
          disabled={loading}
          size="sm"
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
