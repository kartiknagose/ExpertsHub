// Worker bookings page
// Manage incoming jobs and update booking statuses

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, MapPin, User, CheckCircle, XCircle, PlayCircle } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common';
import { Badge, Spinner, Button, PageHeader, EmptyState } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';
import { getAllBookings, updateBookingStatus, cancelBooking } from '../../api/bookings';

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

const statusFilters = ['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export function WorkerBookingsPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('ALL');
  const queryClient = useQueryClient();

  const bookingsQuery = useQuery({
    queryKey: ['bookings'],
    queryFn: getAllBookings,
  });

  const updateMutation = useMutation({
    mutationFn: ({ bookingId, status }) => updateBookingStatus(bookingId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (bookingId) => cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

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
        label: 'Start',
        icon: PlayCircle,
        action: () => updateMutation.mutate({ bookingId: booking.id, status: 'IN_PROGRESS' }),
      });
    }

    if (booking.status === 'IN_PROGRESS') {
      actions.push({
        label: 'Complete',
        icon: CheckCircle,
        action: () => updateMutation.mutate({ bookingId: booking.id, status: 'COMPLETED' }),
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

        {bookingsQuery.isLoading && (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        )}

        {bookingsQuery.isError && (
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
        )}

        {!bookingsQuery.isLoading && !bookingsQuery.isError && filteredBookings.length === 0 && (
          <EmptyState
            title="No bookings assigned"
            message="Bookings assigned to you will appear here."
          />
        )}

        {!bookingsQuery.isLoading && !bookingsQuery.isError && filteredBookings.length > 0 && (
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
                    <Badge variant={statusVariant(booking.status)}>
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

                  <div className="flex items-center gap-2">
                    <User size={18} className="text-accent-500" />
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      Customer: {booking.customer?.name || 'Customer'}
                    </span>
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

                <div className="mt-5 flex flex-wrap gap-2">
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
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
