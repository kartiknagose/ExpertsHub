import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { acceptBooking, cancelBooking } from '../api/bookings';
import { createReview } from '../api/reviews';

/**
 * Shared hook for booking action handling across worker pages.
 *
 * Manages accept / cancel / OTP-verify / review mutations and the
 * associated UI state (active action, OTP modal, cancel confirm dialog).
 *
 * @param {Object} options
 * @param {Array<Array>} options.invalidateKeys - Query key arrays to invalidate on mutation success.
 * @returns {{
 *   handleBookingAction: Function,
 *   activeActionId: number|null,
 *   isAnyPending: boolean,
 *   otpModalProps: Object,
 *   cancelConfirmProps: Object,
 * }}
 */
export function useBookingActions({ invalidateKeys = [] } = {}) {
  const queryClient = useQueryClient();

  // ── UI state ──────────────────────────────────────────────
  const [activeActionId, setActiveActionId] = useState(null);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpAction, setOtpAction] = useState(null);
  const [cancelConfirmId, setCancelConfirmId] = useState(null);
  const otpBookingRef = useRef(null);

  // ── Helpers ───────────────────────────────────────────────
  const invalidateAll = () => {
    invalidateKeys.forEach((key) =>
      queryClient.invalidateQueries({ queryKey: key }),
    );
  };

  // ── Mutations ─────────────────────────────────────────────
  const acceptMutation = useMutation({
    mutationFn: (id) => acceptBooking(id),
    onSuccess: () => {
      invalidateAll();
      toast.success('Job accepted successfully!');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => cancelBooking(id),
    onSuccess: () => {
      invalidateAll();
      toast.success('Job cancelled successfully.');
    },
  });

  const reviewMutation = useMutation({
    mutationFn: (payload) => createReview(payload),
    onSuccess: () => {
      invalidateAll();
      toast.success('Review submitted!');
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          'Failed to submit review',
      );
    },
  });

  // ── Action dispatcher (passed to BookingCard.onAction) ────
  const handleBookingAction = async (type, payload) => {
    const actionId = payload.id || payload.bookingId;
    setActiveActionId(actionId);

    try {
      if (type === 'CONFIRM') {
        await acceptMutation.mutateAsync(actionId);
      } else if (type === 'CANCEL') {
        setCancelConfirmId(actionId);
      } else if (type === 'START_OTP') {
        otpBookingRef.current = actionId;
        setOtpAction('start');
        setIsOtpModalOpen(true);
      } else if (type === 'COMPLETE_OTP') {
        otpBookingRef.current = actionId;
        setOtpAction('complete');
        setIsOtpModalOpen(true);
      } else if (type === 'REVIEW') {
        await reviewMutation.mutateAsync({
          bookingId: payload.bookingId,
          rating: payload.rating,
          comment: payload.comment,
        });
      }
    } finally {
      // OTP actions hand off loading to the modal, so don't clear yet.
      if (type !== 'START_OTP' && type !== 'COMPLETE_OTP') {
        setActiveActionId(null);
      }
    }
  };

  // ── Derived ───────────────────────────────────────────────
  const isAnyPending =
    acceptMutation.isPending ||
    cancelMutation.isPending ||
    reviewMutation.isPending;

  // ── Props objects for declarative rendering ───────────────
  const otpModalProps = {
    isOpen: isOtpModalOpen,
    onClose: () => {
      setIsOtpModalOpen(false);
      setActiveActionId(null);
      otpBookingRef.current = null;
    },
    otpAction,
    bookingId: otpBookingRef.current,
    invalidateKeys,
    onSuccess: () => setActiveActionId(null),
  };

  const cancelConfirmProps = {
    isOpen: cancelConfirmId !== null,
    onCancel: () => setCancelConfirmId(null),
    onConfirm: async () => {
      try {
        await cancelMutation.mutateAsync(cancelConfirmId);
      } finally {
        setCancelConfirmId(null);
      }
    },
    title: 'Decline / Cancel Job',
    message:
      'Are you sure you want to decline or cancel this job? This action cannot be undone.',
    confirmText: 'Yes, Cancel Job',
    cancelText: 'Keep Job',
    variant: 'danger',
    loading: cancelMutation.isPending,
  };

  return {
    handleBookingAction,
    activeActionId,
    isAnyPending,
    otpModalProps,
    cancelConfirmProps,
  };
}
