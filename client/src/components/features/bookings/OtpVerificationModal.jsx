import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Modal, Button, Input, ImageUpload } from '../../common';
import { verifyBookingStart, verifyBookingCompletion } from '../../../api/bookings';
import { uploadBookingPhoto } from '../../../api/uploads';

/**
 * Shared OTP Verification Modal used across worker pages.
 *
 * @param {Object} props
 * @param {boolean}  props.isOpen       - Whether the modal is visible
 * @param {Function} props.onClose      - Called when the modal should close
 * @param {'start'|'complete'} props.otpAction - Whether this is a start or completion verification
 * @param {number|string} props.bookingId     - The booking being verified
 * @param {string[]}      props.invalidateKeys - Query key arrays to invalidate on success
 * @param {Function}      [props.onSuccess]    - Optional callback after successful verification
 */
export function OtpVerificationModal({ isOpen, onClose, otpAction, bookingId, invalidateKeys = [], onSuccess }) {
  const queryClient = useQueryClient();

  const [otpCode, setOtpCode] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const resetState = useCallback(() => {
    setOtpCode('');
    setSelectedFile(null);
    setIsUploading(false);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  const verifyStartMutation = useMutation({
    mutationFn: ({ bookingId: bId, otp }) => verifyBookingStart(bId, otp),
    onSuccess: () => {
      invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      toast.success('Work started successfully!');
      resetState();
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      const msg = error.response?.data?.error || error.response?.data?.message || 'Invalid OTP';
      toast.error(msg);
    },
  });

  const verifyCompleteMutation = useMutation({
    mutationFn: ({ bookingId: bId, otp }) => verifyBookingCompletion(bId, otp),
    onSuccess: () => {
      invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      toast.success('Job completed successfully!');
      resetState();
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      const msg = error.response?.data?.error || error.response?.data?.message || 'Invalid OTP';
      toast.error(msg);
    },
  });

  const handleSubmit = async () => {
    if (!bookingId) {
      toast.error('No booking selected. Please close and try again.');
      return;
    }
    if (!selectedFile) {
      toast.error(`Please upload a ${otpAction === 'start' ? 'BEFORE' : 'AFTER'} photo as proof.`);
      return;
    }
    if (!otpCode || otpCode.length < 4) {
      toast.error('Please enter a valid 4-digit OTP.');
      return;
    }

    setIsUploading(true);
    try {
      const photoType = otpAction === 'start' ? 'BEFORE' : 'AFTER';
      await uploadBookingPhoto(selectedFile, bookingId, photoType);

      if (otpAction === 'start') {
        await verifyStartMutation.mutateAsync({ bookingId, otp: otpCode });
      } else {
        await verifyCompleteMutation.mutateAsync({ bookingId, otp: otpCode });
      }
    } catch {
      // Mutation onError handles the toast for verify failures.
      // This catch handles uploadBookingPhoto failures.
    } finally {
      setIsUploading(false);
    }
  };

  const isPending = isUploading || verifyStartMutation.isPending || verifyCompleteMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={otpAction === 'start' ? 'Start Verification' : 'Completion Verification'}
      size="sm"
    >
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
        {/* Step 1: Photo Evidence */}
        <div className="p-4 rounded-2xl border bg-brand-50 dark:bg-brand-900/10 border-brand-100 dark:border-brand-800">
          <p className="text-sm font-black uppercase tracking-widest text-brand-800 dark:text-brand-300">
            Step 1: Visual Proof
          </p>
          <p className="text-xs mt-1 text-brand-600 dark:text-brand-400">
            Please upload a photo of the {otpAction === 'start' ? 'work area' : 'finished result'}.
          </p>
        </div>

        <ImageUpload
          label={otpAction === 'start' ? 'Before photo (capture or upload)' : 'After photo (capture or upload)'}
          onUpload={setSelectedFile}
          value={selectedFile}
        />

        {/* Step 2: OTP Input */}
        <div className="border-t pt-6 border-gray-100 dark:border-dark-700">
          <p className="text-sm font-black uppercase tracking-widest mb-4 text-gray-700 dark:text-gray-200">
            Step 2: Customer OTP
          </p>
          <Input
            label="Customer OTP"
            placeholder="0 0 0 0"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            className="text-center text-4xl tracking-[1rem] font-black h-20 rounded-2xl border-2 focus:border-brand-500"
            maxLength={4}
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
          />
          <p className="text-xs text-center mt-3 text-gray-500 font-bold uppercase tracking-widest">
            Ask customer for the 4-digit code
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 sticky bottom-0 bg-inherit pb-2">
          <Button variant="ghost" fullWidth onClick={handleClose}>
            Cancel
          </Button>
          <Button
            fullWidth
            size="lg"
            onClick={handleSubmit}
            loading={isPending}
            disabled={!selectedFile || otpCode.length < 4}
            className="bg-brand-600 text-white shadow-xl shadow-brand-500/20"
          >
            Verify & Proceed
          </Button>
        </div>
      </div>
    </Modal>
  );
}
