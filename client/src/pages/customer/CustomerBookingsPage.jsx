// Customer bookings page
// Lists all bookings for the logged-in customer

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Briefcase, User } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common';
import { Badge, Spinner, Button, PageHeader, EmptyState } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';
import { cancelBooking, getAllBookings, payBooking } from '../../api/bookings';

const statusVariant = (status) => {
  switch (status) {
    case 'PENDING':
      return 'warning';
    case 'CONFIRMED':
      return 'info';
    case 'IN_PROGRESS':
      return 'default';
    case 'COMPLETED':
      return 'success';
    case 'CANCELLED':
      return 'error';
    default:
      return 'default';
  }
};

const paymentVariant = (status) => {
  switch (status) {
    case 'PAID':
      return 'success';
    case 'FAILED':
      return 'error';
    case 'REFUNDED':
      return 'warning';
    default:
      return 'info';
  }
};

export function CustomerBookingsPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['bookings'],
    queryFn: getAllBookings,
  });

  const cancelMutation = useMutation({
    mutationFn: (bookingId) => cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  const payMutation = useMutation({
    mutationFn: (bookingId) => payBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
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

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        )}

        {isError && (
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
        )}

        {!isLoading && !isError && bookings.length === 0 && (
          <EmptyState
            title="No bookings yet"
            message="Once you book a service, it will appear here."
            action={
              <Button size="sm" variant="outline" onClick={() => navigate('/services')}>
                Browse Services
              </Button>
            }
          />
        )}

        {!isLoading && !isError && bookings.length > 0 && (
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
                    <Badge variant={statusVariant(booking.status)}>
                      {booking.status}
                    </Badge>
                    <Badge variant={paymentVariant(booking.paymentStatus || 'PENDING')}>
                      {booking.paymentStatus || 'PENDING'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Briefcase size={18} className="text-brand-500" />
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      {booking.service?.name || `Service #${booking.serviceId}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <User size={18} className="text-accent-500" />
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      Worker: {booking.workerProfile?.user?.name || 'Unassigned'}
                    </span>
                  </div>

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
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
