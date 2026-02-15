// Customer bookings page
// Lists all bookings for the logged-in customer

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Briefcase, User } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common';
import { Badge, Button, PageHeader, AsyncState } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';
import { cancelBooking, getAllBookings, payBooking } from '../../api/bookings';
import { queryKeys } from '../../utils/queryKeys';
import { getBookingStatusVariant, getPaymentStatusVariant } from '../../utils/statusHelpers';
import { SOSButton } from '../../components/safety/SOSButton';
import { UserMiniProfile } from '../../components/features/bookings/UserMiniProfile';


export function CustomerBookingsPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.bookings.customer(),
    queryFn: () => getAllBookings({ viewAs: 'CUSTOMER' }),
  });

  const cancelMutation = useMutation({
    mutationFn: (bookingId) => cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.customer() });
    },
  });

  const payMutation = useMutation({
    mutationFn: (bookingId) => payBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.customer() });
    },
  });

  const bookings = data?.bookings || [];

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <PageHeader
          title="My Bookings"
          subtitle="Track and manage your service appointments."
        />

        <AsyncState
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={refetch}
          isEmpty={!isLoading && !isError && bookings.length === 0}
          emptyTitle="No bookings yet"
          emptyMessage="Once you book a service, it will appear here."
          emptyAction={
            <Button size="sm" variant="outline" onClick={() => navigate('/services')}>
              Browse Services
            </Button>
          }
          errorFallback={
            <Card className="p-6">
              <p className="text-error-500 mb-3">
                {error?.response?.data?.error || error?.message || 'Failed to load bookings'}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="sm" onClick={() => refetch()}>
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
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <CardTitle>
                    Booking #{booking.id}
                  </CardTitle>
                  <CardDescription>
                    {new Date(booking.scheduledAt || booking.scheduledDate).toLocaleString()}
                  </CardDescription>
                </CardHeader>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={getBookingStatusVariant(booking.status)}>
                      {booking.status}
                    </Badge>
                    <Badge variant={getPaymentStatusVariant(booking.paymentStatus || 'PENDING')}>
                      {booking.paymentStatus || 'PENDING'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Briefcase size={18} className="text-brand-500" />
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      {booking.service?.name || `Service #${booking.serviceId}`}
                    </span>
                  </div>

                  {booking.workerProfile && (
                    <div className="mt-2">
                      <UserMiniProfile
                        user={booking.workerProfile.user}
                        label="Assigned Professional"
                        showContact={['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(booking.status)}
                      />
                    </div>
                  )}

                  {!booking.workerProfile && (
                    <div className="flex items-center gap-2">
                      <User size={18} className="text-accent-500" />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                        Worker: Looking for someone...
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-success-500" />
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      {booking.address || booking.addressDetails || 'No address'}
                    </span>
                  </div>

                  {booking.notes && (
                    <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      Notes: {booking.notes}
                    </div>
                  )}

                  {booking.status === 'CONFIRMED' && booking.startOtp && (
                    <div className={`p-4 rounded-lg border mt-2 ${isDark ? 'bg-brand-900/20 border-brand-700' : 'bg-brand-50 border-brand-200'}`}>
                      <p className={`text-sm font-medium mb-1 ${isDark ? 'text-brand-300' : 'text-brand-700'}`}>
                        Start Code (Share with Worker):
                      </p>
                      <p className={`text-3xl font-bold tracking-widest ${isDark ? 'text-brand-100' : 'text-brand-900'}`}>
                        {booking.startOtp}
                      </p>
                    </div>
                  )}

                  {booking.status === 'IN_PROGRESS' && booking.completionOtp && (
                    <div className={`p-4 rounded-lg border mt-2 ${isDark ? 'bg-success-900/20 border-success-700' : 'bg-success-50 border-success-200'}`}>
                      <p className={`text-sm font-medium mb-1 ${isDark ? 'text-success-300' : 'text-success-700'}`}>
                        Completion Code (Share with Worker):
                      </p>
                      <p className={`text-3xl font-bold tracking-widest ${isDark ? 'text-success-100' : 'text-success-900'}`}>
                        {booking.completionOtp}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {booking.paymentStatus !== 'PAID' && booking.status !== 'CANCELLED' && (
                      <Button
                        size="sm"
                        loading={payMutation.isPending}
                        onClick={() => payMutation.mutate(booking.id)}
                      >
                        Pay Now
                      </Button>
                    )}

                    {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        loading={cancelMutation.isPending}
                        onClick={() => cancelMutation.mutate(booking.id)}
                      >
                        Cancel Booking
                      </Button>
                    )}

                    {['CONFIRMED', 'IN_PROGRESS'].includes(booking.status) && (
                      <SOSButton bookingId={booking.id} />
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </AsyncState>
      </div>
    </MainLayout>
  );
}
