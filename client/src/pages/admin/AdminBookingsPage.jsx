import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarClock, CheckCircle, XCircle, PlayCircle } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common';
import { Badge, Button, PageHeader, AsyncState } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';
import { cancelBooking, getAllBookings, updateBookingStatus } from '../../api/bookings';
import { queryKeys } from '../../utils/queryKeys';
import { getBookingStatusVariant } from '../../utils/statusHelpers';


const statusFilters = ['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export function AdminBookingsPage() {
  const { isDark } = useTheme();
  const [filter, setFilter] = useState('ALL');
  const queryClient = useQueryClient();

  const bookingsQuery = useQuery({
    queryKey: queryKeys.bookings.admin(),
    queryFn: () => getAllBookings({ viewAs: 'ADMIN' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ bookingId, status }) => updateBookingStatus(bookingId, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bookings.admin() }),
  });

  const cancelMutation = useMutation({
    mutationFn: (bookingId) => cancelBooking(bookingId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bookings.admin() }),
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
          subtitle="Review and manage all marketplace bookings."
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
          isEmpty={!bookingsQuery.isLoading && !bookingsQuery.isError && filteredBookings.length === 0}
          emptyTitle="No bookings for this filter"
          emptyMessage="Try a different status filter to see more results."
        >
          <div className="grid grid-cols-1 gap-5">
            {filteredBookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Booking #{booking.id}</CardTitle>
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
                      {booking.service?.name || `Service #${booking.serviceId}`}
                    </span>
                  </div>

                  <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    Customer: {booking.customer?.name || 'Customer'} · Worker: {booking.workerProfile?.user?.name || 'Unassigned'}
                  </div>
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
        </AsyncState>
      </div>
    </MainLayout>
  );
}
