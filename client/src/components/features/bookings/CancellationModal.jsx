import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, AlertCircle } from 'lucide-react';
import { Modal, Button, Input } from '../../common';
import { cancelBooking } from '../../../api/bookings';

const ROLE_CONFIG = {
    WORKER: {
        title: 'Reason for Cancellation',
        Icon: ShieldAlert,
        iconSize: 24,
        message: 'Please provide a reason for cancelling or rejecting this job.',
        label: 'Cancellation Reason',
        placeholder: 'e.g., Scheduling conflict, out of specialized tools...',
        cancelText: 'Go Back',
        confirmText: 'Confirm Cancellation',
        successMessage: 'Job cancelled/rejected successfully',
    },
    CUSTOMER: {
        title: 'Cancel Booking',
        Icon: AlertCircle,
        iconSize: 32,
        message: 'Are you sure you want to cancel? This may affect your service reliability rating.',
        label: 'Reason for cancellation',
        placeholder: 'e.g., Booked by mistake, no longer needed...',
        cancelText: 'Wait, Keep it',
        confirmText: 'Cancel Job',
        successMessage: 'Booking cancelled successfully',
    },
};

/**
 * Shared cancellation modal with reason input.
 */
export function CancellationModal({ isOpen, onClose, bookingId, role = 'CUSTOMER', invalidateKeys = [] }) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [cancelReason, setCancelReason] = useState('');
    const config = ROLE_CONFIG[role] || ROLE_CONFIG.CUSTOMER;
    const { Icon } = config;

    const cancelMutation = useMutation({
        mutationFn: (reason) => cancelBooking(bookingId, reason),
        onSuccess: () => {
            invalidateKeys.forEach((key) => {
                queryClient.invalidateQueries({ queryKey: key });
            });
            toast.success(t(config.successMessage));
            setCancelReason('');
            onClose();
        },
        onError: (error) => {
            toast.error(error?.response?.data?.error || t('Failed to cancel'));
        },
    });

    const handleSubmit = () => {
        if (!cancelReason.trim()) return;
        cancelMutation.mutate(cancelReason);
    };

    const handleClose = () => {
        setCancelReason('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={t(config.title)} size="sm">
            <div className="space-y-4">
                <div className="p-4 rounded-xl flex items-center gap-4 bg-error-50 dark:bg-error-950/20 text-error-600">
                    <Icon size={config.iconSize} />
                    <p className="text-sm font-bold leading-tight">{t(config.message)}</p>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-gray-500 tracking-widest pl-1">
                        {t(config.label)}
                    </label>
                    <Input
                        placeholder={t(config.placeholder)}
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="h-12 text-sm"
                        autoFocus
                    />
                </div>

                <div className="flex gap-3 pt-4">
                    <Button fullWidth variant="ghost" onClick={handleClose}>
                        {t(config.cancelText)}
                    </Button>
                    <Button
                        fullWidth
                        className="bg-error-600 text-white hover:bg-error-700"
                        onClick={handleSubmit}
                        disabled={!cancelReason.trim()}
                        loading={cancelMutation.isPending}
                    >
                        {t(config.confirmText)}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
