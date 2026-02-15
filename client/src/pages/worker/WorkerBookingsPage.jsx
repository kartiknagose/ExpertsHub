// Worker bookings page
// Manage incoming jobs and update booking statuses

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, MapPin, User, CheckCircle, XCircle, PlayCircle, ShieldAlert } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common';
import { Badge, Button, PageHeader, AsyncState, Modal, Input, ImageUpload } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';
import { getAllBookings, updateBookingStatus, cancelBooking, verifyBookingStart, verifyBookingCompletion } from '../../api/bookings';
import { uploadBookingPhoto } from '../../api/uploads';
import { SOSButton } from '../../components/safety/SOSButton';
import { UserMiniProfile } from '../../components/features/bookings/UserMiniProfile';
import { queryKeys } from '../../utils/queryKeys';
import { getBookingStatusVariant } from '../../utils/statusHelpers';
import { toast } from 'sonner';


const statusFilters = ['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export function WorkerBookingsPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('ALL');
  const queryClient = useQueryClient();

  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [otpAction, setOtpAction] = useState(null); // 'start' or 'complete'
  const [otpCode, setOtpCode] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const bookingsQuery = useQuery({
    queryKey: queryKeys.bookings.worker(),
    queryFn: () => getAllBookings({ viewAs: 'WORKER' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ bookingId, status }) => updateBookingStatus(bookingId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.worker() });
      toast.success('Booking updated successfully');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Update failed'),
  });

  const cancelMutation = useMutation({
    mutationFn: (bookingId) => cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.worker() });
      toast.success('Booking cancelled');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Cancellation failed'),
  });

  const verifyStartMutation = useMutation({
    mutationFn: ({ bookingId, otp }) => verifyBookingStart(bookingId, otp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.worker() });
      setIsOtpModalOpen(false);
      setOtpCode('');
      setSelectedFile(null);
      toast.success('Job started successfully!');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Invalid OTP'),
  });

  const verifyCompleteMutation = useMutation({
    mutationFn: ({ bookingId, otp }) => verifyBookingCompletion(bookingId, otp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.worker() });
      setIsOtpModalOpen(false);
      setOtpCode('');
      setSelectedFile(null);
      toast.success('Job completed successfully!');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Invalid OTP'),
  });

  const handleOtpSubmit = async () => {
    if (!selectedFile) {
      toast.error(`Please upload a ${otpAction === 'start' ? 'BEFORE' : 'AFTER'} photo as proof.`);
      return;
    }

    if (!otpCode || otpCode.length < 4) {
      toast.error('Please enter a valid OTP');
      return;
    }

    setIsUploading(true);
    try {
      // 1. Upload the photo proof
      const type = otpAction === 'start' ? 'BEFORE' : 'AFTER';
      await uploadBookingPhoto(selectedFile, selectedBookingId, type);

      // 2. Verify OTP and transition status
      if (otpAction === 'start') {
        verifyStartMutation.mutate({ bookingId: selectedBookingId, otp: otpCode });
      } else if (otpAction === 'complete') {
        verifyCompleteMutation.mutate({ bookingId: selectedBookingId, otp: otpCode });
      }
    } catch (error) {
      toast.error('Failed to upload photo proof. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const openOtpModal = (bookingId, action) => {
    setSelectedBookingId(bookingId);
    setOtpAction(action);
    setOtpCode('');
    setSelectedFile(null);
    setIsOtpModalOpen(true);
  };

  const bookings = bookingsQuery.data?.bookings || [];

  const filteredBookings = useMemo(() => {
    if (filter === 'ALL') return bookings;
    return bookings.filter((booking) => booking.status === filter);
  }, [bookings, filter]);

  const getActions = (booking) => {
    const actions = [];

    if (booking.status === 'PENDING') {
      actions.push({
        label: 'Confirm',
        icon: CheckCircle,
        action: () => updateMutation.mutate({ bookingId: booking.id, status: 'CONFIRMED' }),
      });
    }

    if (booking.status === 'CONFIRMED') {
      actions.push({
        label: 'Start Job',
        icon: PlayCircle,
        action: () => openOtpModal(booking.id, 'start'),
      });
    }

    if (booking.status === 'IN_PROGRESS') {
      actions.push({
        label: 'Complete Job',
        icon: CheckCircle,
        action: () => openOtpModal(booking.id, 'complete'),
      });
    }

    if (booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED') {
      actions.push({
        label: 'Cancel',
        icon: XCircle,
        variant: 'outline',
        action: () => cancelMutation.mutate(booking.id),
      });
    }

    return actions;
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <PageHeader
          title="Bookings"
          subtitle="Confirm, start, and complete your assigned jobs."
        />

        <div className="flex flex-wrap gap-2 mb-6">
          {statusFilters.map((status) => (
            <Button
              key={status}
              size="sm"
              variant={filter === status ? 'primary' : 'outline'}
              onClick={() => setFilter(status)}
            >
              {status}
            </Button>
          ))}
        </div>

        <AsyncState
          isLoading={bookingsQuery.isLoading}
          isError={bookingsQuery.isError}
          error={bookingsQuery.error}
          onRetry={bookingsQuery.refetch}
          isEmpty={!bookingsQuery.isLoading && !bookingsQuery.isError && filteredBookings.length === 0}
          emptyTitle="No bookings assigned"
          emptyMessage="Bookings assigned to you will appear here."
          errorFallback={
            <Card className="p-6">
              <p className="text-error-500 mb-3">
                {bookingsQuery.error?.response?.data?.error || bookingsQuery.error?.message || 'Failed to load bookings.'}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="sm" onClick={() => bookingsQuery.refetch()}>
                  Retry
                </Button>
                <Button size="sm" variant="outline" onClick={() => navigate('/system-status')}>
                  Check System Status
                </Button>
              </div>
            </Card>
          }
        >
          <div className="grid grid-cols-1 gap-5">
            {filteredBookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Job #{booking.id}</CardTitle>
                      <CardDescription>
                        {new Date(booking.scheduledAt || booking.scheduledDate).toLocaleString()}
                      </CardDescription>
                    </div>
                    <Badge variant={getBookingStatusVariant(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                </CardHeader>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CalendarClock size={18} className="text-brand-500" />
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      Service: {booking.service?.name || `Service #${booking.serviceId}`}
                    </span>
                  </div>

                  <div className="mt-2">
                    <UserMiniProfile
                      user={booking.customer}
                      label="Customer"
                      showContact={booking.status !== 'CANCELLED'}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-success-500" />
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      {booking.address || 'No address'}
                    </span>
                  </div>

                  {booking.notes && (
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      Notes: {booking.notes}
                    </p>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap gap-2 items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {getActions(booking).map((action) => (
                      <Button
                        key={action.label}
                        size="sm"
                        variant={action.variant || 'primary'}
                        icon={action.icon}
                        loading={updateMutation.isPending || cancelMutation.isPending}
                        onClick={action.action}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>

                  {['CONFIRMED', 'IN_PROGRESS'].includes(booking.status) && (
                    <SOSButton bookingId={booking.id} />
                  )}
                </div>
              </Card>
            ))}
          </div>
        </AsyncState>
      </div>


      <Modal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        title={otpAction === 'start' ? 'Start Job - Verification' : 'Complete Job - Verification'}
      >
        <div className="space-y-6">
          <div className="p-4 bg-brand-50 border border-brand-100 rounded-xl">
            <p className="text-sm text-brand-800 font-medium">
              Step 1: Upload Proof
            </p>
            <p className="text-xs text-brand-600 mt-1">
              A {otpAction === 'start' ? 'BEFORE' : 'AFTER'} photo is required to resolve any future disputes.
            </p>
          </div>

          <ImageUpload
            label={otpAction === 'start' ? "Photo of work area before starting" : "Photo of completed work"}
            onUpload={setSelectedFile}
            value={selectedFile}
          />

          <div className="border-t border-gray-100 pt-6">
            <p className="text-sm text-gray-700 font-medium mb-1">
              Step 2: Enter Verification Code
            </p>
            <p className="text-xs text-gray-500 mb-3">
              Ask the customer for the code displayed on their dashboard.
            </p>

            <Input
              placeholder="e.g. 1234"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              maxLength={6}
              className="text-center text-2xl tracking-widest font-bold"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsOtpModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleOtpSubmit}
              loading={verifyStartMutation.isPending || verifyCompleteMutation.isPending || isUploading}
              disabled={!selectedFile || !otpCode}
            >
              Verify & {otpAction === 'start' ? 'Start' : 'Complete'}
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout >
  );
}
