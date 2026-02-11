// Customer dashboard page
// Shows booking summary and quick actions

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useTheme } from '../../context/ThemeContext';
import { MainLayout } from '../../components/layout/MainLayout';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, Button, Badge, Spinner, StatCard, Skeleton } from '../../components/common';

import {
  Calendar,
  Clock,
  Briefcase,
  CheckCircle,
  XOctagon,
  DollarSign,
  Star,
  CalendarClock,
  Wallet
} from 'lucide-react';
import { getAllBookings, payBooking } from '../../api/bookings';
import { getAllServices } from '../../api/services';

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

export function CustomerDashboardPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['bookings'],
    queryFn: getAllBookings,
  });

  const servicesQuery = useQuery({
    queryKey: ['services-preview'],
    queryFn: getAllServices,
    staleTime: 5 * 60 * 1000,
  });

  const payMutation = useMutation({
    mutationFn: (id) => payBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  const bookings = data?.bookings || [];
  const services = servicesQuery.data?.services || servicesQuery.data || [];

  const pendingReviews = useMemo(() => {
    return bookings.filter((booking) => booking.status === 'COMPLETED' && (!booking.reviews || booking.reviews.length === 0));
  }, [bookings]);

  const summary = useMemo(() => {
    const counts = {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === 'PENDING').length,
      confirmed: bookings.filter((b) => b.status === 'CONFIRMED').length,
      completed: bookings.filter((b) => b.status === 'COMPLETED').length,
      cancelled: bookings.filter((b) => b.status === 'CANCELLED').length,
    };
    return counts;
  }, [bookings]);

  const totalSpent = useMemo(() => {
    return bookings
      .filter((booking) => booking.status === 'COMPLETED')
      .reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0);
  }, [bookings]);

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <PageHeader
          title="Dashboard"
          subtitle="Welcome back! Track your bookings and explore services."
        />

        {/* Loading State - Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-32 flex flex-col justify-between">
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-8 w-16" />
                <div className="flex justify-end">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <Card className="p-6 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10">
            <p className="text-red-600 dark:text-red-400 mb-3">
              Failed to load dashboard data. Please try again later.
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

        {!isLoading && !isError && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
              <StatCard
                title="Total Bookings"
                value={summary.total}
                icon={Briefcase}
                color="brand"
                delay={0}
              />
              <StatCard
                title="Pending"
                value={summary.pending}
                icon={Clock}
                color="warning"
                delay={1}
              />
              <StatCard
                title="Confirmed"
                value={summary.confirmed}
                icon={Calendar}
                color="info"
                delay={2}
              />
              <StatCard
                title="Completed"
                value={summary.completed}
                icon={CheckCircle}
                color="success"
                delay={3}
              />
              <StatCard
                title="Cancelled"
                value={summary.cancelled}
                icon={XOctagon}
                color="error"
                delay={4}
              />
              <StatCard
                title="Total Spent"
                value={`₹${totalSpent.toFixed(0)}`}
                icon={DollarSign}
                color="brand"
                delay={5}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>Track the status of your latest requests</CardDescription>
                </CardHeader>

                {bookings.length === 0 && (
                  <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    No bookings yet. Post a request to get started.
                  </p>
                )}

                {bookings.length > 0 && (
                  <div className="space-y-4">
                    {bookings.slice(0, 4).map((booking) => (
                      <div key={booking.id} className="flex flex-col gap-2 border-b last:border-0 pb-3 last:pb-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={isDark ? 'text-gray-100 font-medium' : 'text-gray-900 font-medium'}>
                              {booking.service?.name || `Service #${booking.serviceId}`}
                            </p>
                            <p className={isDark ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>
                              {new Date(booking.scheduledAt || booking.scheduledDate).toLocaleString()}
                            </p>
                          </div>
                          <Badge variant={statusVariant(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex justify-end gap-2 mt-1">
                          {booking.status === 'COMPLETED' && booking.paymentStatus !== 'PAID' && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => payMutation.mutate(booking.id)}
                              loading={payMutation.isPending}
                            >
                              Pay Now
                            </Button>
                          )}

                          {booking.status === 'COMPLETED' && booking.paymentStatus === 'PAID' && (!booking.reviews || booking.reviews.length === 0) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              icon={Star}
                              className="text-yellow-500 hover:text-yellow-600"
                              onClick={() => navigate('/reviews')}
                            >
                              Leave Review
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pending Reviews</CardTitle>
                  <CardDescription>Help workers grow with feedback</CardDescription>
                </CardHeader>

                {pendingReviews.length === 0 && (
                  <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    No reviews pending right now.
                  </p>
                )}

                {pendingReviews.length > 0 && (
                  <div className="space-y-3">
                    {pendingReviews.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between">
                        <div>
                          <p className={isDark ? 'text-gray-100' : 'text-gray-900'}>
                            {booking.service?.name || `Service #${booking.serviceId}`}
                          </p>
                          <p className={isDark ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>
                            Completed · {booking.workerProfile?.user?.name || 'Worker'}
                          </p>
                        </div>
                        <Star className="text-warning-500" size={18} />
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Stay on top of your account</CardDescription>
                </CardHeader>
                <div className="space-y-3">
                  <Button fullWidth icon={Briefcase} onClick={() => navigate('/services')}>
                    Post a Booking
                  </Button>
                  <Button fullWidth variant="outline" icon={CalendarClock} onClick={() => navigate('/bookings')}>
                    View All Bookings
                  </Button>
                  <Button fullWidth variant="outline" icon={Star} onClick={() => navigate('/reviews')}>
                    Leave Reviews
                  </Button>
                  <Button fullWidth variant="ghost" icon={Wallet} onClick={() => navigate('/profile')}>
                    Manage Profile
                  </Button>
                </div>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Popular Services</CardTitle>
                  <CardDescription>Explore what people book most</CardDescription>
                </CardHeader>

                {servicesQuery.isLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Spinner size="lg" />
                  </div>
                )}

                {!servicesQuery.isLoading && services.length === 0 && (
                  <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    No services available yet.
                  </p>
                )}

                {!servicesQuery.isLoading && services.length > 0 && (
                  <div className="space-y-3">
                    {services.slice(0, 4).map((service) => (
                      <div key={service.id} className="flex items-center justify-between">
                        <div>
                          <p className={isDark ? 'text-gray-100' : 'text-gray-900'}>{service.name}</p>
                          <p className={isDark ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>
                            {service.category || 'General'}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/services/${service.id}`)}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
