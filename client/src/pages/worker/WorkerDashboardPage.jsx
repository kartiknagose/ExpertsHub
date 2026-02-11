// Worker dashboard page
// Shows job summary and recent bookings for the worker

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Briefcase,
  Wallet,
  Clock,
  CalendarCheck,
  Star,
  ShieldCheck,
  CheckCircle,
  Activity,
  Calendar,
  DollarSign
} from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, Button, Badge, Spinner, StatCard, Skeleton, SimpleBarChart, SimpleDonutChart } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';
import { getAllBookings, updateBookingStatus, cancelBooking } from '../../api/bookings';
import { getMyAvailability } from '../../api/availability';
import { getMyServices, getMyWorkerProfile } from '../../api/workers';

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

export function WorkerDashboardPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['bookings'],
    queryFn: getAllBookings,
  });

  const availabilityQuery = useQuery({
    queryKey: ['availability'],
    queryFn: getMyAvailability,
  });

  const profileQuery = useQuery({
    queryKey: ['worker-profile'],
    queryFn: getMyWorkerProfile,
  });

  const servicesQuery = useQuery({
    queryKey: ['worker-services'],
    queryFn: getMyServices,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateBookingStatus(id, { status }),
    onSuccess: (_, variables) => {
      const labels = { CONFIRMED: 'accepted', IN_PROGRESS: 'started', COMPLETED: 'completed' };
      toast.success(`Job ${labels[variables.status] || 'updated'} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error || 'Failed to update booking status.');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => cancelBooking(id),
    onSuccess: () => {
      toast.success('Booking rejected successfully.');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error || 'Failed to reject booking.');
    },
  });

  const bookings = data?.bookings || [];
  const availability = availabilityQuery.data?.availability || [];
  const profile = profileQuery.data?.profile;
  const services = servicesQuery.data?.services || [];

  const summary = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === 'PENDING').length,
      confirmed: bookings.filter((b) => b.status === 'CONFIRMED').length,
      inProgress: bookings.filter((b) => b.status === 'IN_PROGRESS').length,
      completed: bookings.filter((b) => b.status === 'COMPLETED').length,
      cancelled: bookings.filter((b) => b.status === 'CANCELLED').length,
    };
  }, [bookings]);

  const chartData = useMemo(() => {
    // Last 7 days earnings
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); // Today
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    const earnings = last7Days.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      // Note: Using createdAt for simplicity as seed data has random dates
      // Real app might use 'completedAt' or 'updatedAt'
      const dayEarnings = bookings
        .filter(b => b.createdAt.startsWith(dateStr) && (b.status === 'COMPLETED' || b.status === 'CONFIRMED'))
        .reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);

      return {
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        value: dayEarnings,
        tooltip: `₹${dayEarnings}`
      };
    });

    const status = [
      { label: 'Completed', value: summary.completed, color: '#10b981' },
      { label: 'Confirmed', value: summary.confirmed, color: '#3b82f6' },
      { label: 'Pending', value: summary.pending, color: '#f59e0b' },
      { label: 'Cancelled', value: summary.cancelled, color: '#ef4444' },
    ];

    return { earnings, status };
  }, [bookings, summary]);

  const earnings = useMemo(() => {
    return bookings
      .filter((booking) => booking.status === 'COMPLETED')
      .reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0);
  }, [bookings]);

  const upcomingJobs = useMemo(() => {
    const now = new Date();
    return bookings
      .filter((booking) => new Date(booking.scheduledAt || booking.scheduledDate) >= now)
      .sort((a, b) => new Date(a.scheduledAt || a.scheduledDate) - new Date(b.scheduledAt || b.scheduledDate))
      .slice(0, 3);
  }, [bookings]);

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <PageHeader
          title="Worker Dashboard"
          subtitle="Track your jobs, confirmations, and progress."
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

        {isError && (
          <Card className="p-6">
            <p className="text-error-500 mb-3">
              {error?.response?.data?.error || error?.message || 'Failed to load dashboard'}
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
                title="Total Jobs"
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
                title="In Progress"
                value={summary.inProgress}
                icon={Activity}
                color="info"
                delay={3}
              />
              <StatCard
                title="Completed"
                value={summary.completed}
                icon={CheckCircle}
                color="success"
                delay={4}
              />
              <StatCard
                title="Earnings"
                value={`₹${earnings.toFixed(0)}`}
                icon={DollarSign}
                color="success"
                delay={5}
                trend={{
                  value: 12,
                  direction: 'up',
                  label: 'vs last month'
                }}
              />
            </div>

            {/* Charts Section (ISSUE-039) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <SimpleBarChart
                title="Weekly Earnings"
                data={chartData.earnings}
                className="lg:col-span-2"
                height="h-64"
              />
              <SimpleDonutChart
                title="Job Status"
                data={chartData.status}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Jobs</CardTitle>
                  <CardDescription>Your next scheduled appointments</CardDescription>
                </CardHeader>

                {upcomingJobs.length === 0 && (
                  <div className="space-y-3">
                    <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                      No upcoming jobs scheduled.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button size="sm" onClick={() => navigate('/worker/services')}>
                        Add Services
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => navigate('/worker/availability')}>
                        Set Availability
                      </Button>
                    </div>
                  </div>
                )}

                {upcomingJobs.length > 0 && (
                  <div className="space-y-4">
                    {upcomingJobs.map((booking) => (
                      <div key={booking.id} className="flex flex-col gap-2 border-b last:border-0 pb-3 last:pb-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={isDark ? 'text-gray-100 font-medium' : 'text-gray-900 font-medium'}>
                              {booking.service?.name || `Job #${booking.id}`}
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
                          {booking.status === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/10"
                                onClick={() => cancelMutation.mutate(booking.id)}
                                loading={cancelMutation.isPending}
                              >
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => statusMutation.mutate({ id: booking.id, status: 'CONFIRMED' })}
                                loading={statusMutation.isPending}
                              >
                                Accept
                              </Button>
                            </>
                          )}

                          {booking.status === 'CONFIRMED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => statusMutation.mutate({ id: booking.id, status: 'IN_PROGRESS' })}
                              loading={statusMutation.isPending}
                            >
                              Start Job
                            </Button>
                          )}

                          {booking.status === 'IN_PROGRESS' && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => statusMutation.mutate({ id: booking.id, status: 'COMPLETED' })}
                              loading={statusMutation.isPending}
                            >
                              Complete Job
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
                  <CardTitle>Availability</CardTitle>
                  <CardDescription>Weekly slots for customers</CardDescription>
                </CardHeader>

                {availabilityQuery.isLoading && (
                  <div className="flex items-center justify-center py-10">
                    <Spinner size="lg" />
                  </div>
                )}

                {!availabilityQuery.isLoading && availability.length === 0 && (
                  <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    No availability slots yet.
                  </p>
                )}

                {!availabilityQuery.isLoading && availability.length > 0 && (
                  <div className="space-y-2">
                    {availability.slice(0, 4).map((slot) => (
                      <div key={slot.id} className="flex items-center justify-between">
                        <span className={isDark ? 'text-gray-200' : 'text-gray-800'}>
                          {dayLabels[slot.dayOfWeek] || `Day ${slot.dayOfWeek}`}
                        </span>
                        <Badge variant="info">{slot.startTime} - {slot.endTime}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profile Status</CardTitle>
                  <CardDescription>Keep your profile competitive</CardDescription>
                </CardHeader>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Rating</span>
                    <Badge variant={profile?.rating ? 'success' : 'default'}>
                      {profile?.rating?.toFixed?.(1) || '0.0'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Total Reviews</span>
                    <Badge variant="info">{profile?.totalReviews || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Services</span>
                    <Badge variant="default">{services.length}</Badge>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" icon={Briefcase} onClick={() => navigate('/worker/services')}>
                    Manage Services
                  </Button>
                  <Button size="sm" variant="outline" icon={Wallet} onClick={() => navigate('/worker/profile')}>
                    Update Profile
                  </Button>
                </div>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>My Services</CardTitle>
                  <CardDescription>What customers can book</CardDescription>
                </CardHeader>

                {servicesQuery.isLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Spinner size="lg" />
                  </div>
                )}

                {!servicesQuery.isLoading && services.length === 0 && (
                  <div className="space-y-3">
                    <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                      No services added yet.
                    </p>
                    <Button size="sm" onClick={() => navigate('/worker/services')}>
                      Add Services
                    </Button>
                  </div>
                )}

                {!servicesQuery.isLoading && services.length > 0 && (
                  <div className="space-y-3">
                    {services.slice(0, 4).map((entry) => (
                      <div key={entry.serviceId} className="flex items-center justify-between">
                        <div>
                          <p className={isDark ? 'text-gray-100' : 'text-gray-900'}>
                            {entry.service?.name || 'Service'}
                          </p>
                          <p className={isDark ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>
                            {entry.service?.category || 'General'}
                          </p>
                        </div>
                        <Badge variant="info">Active</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Stay on top of your workflow</CardDescription>
                </CardHeader>
                <div className="space-y-3">
                  <Button fullWidth icon={CalendarCheck} onClick={() => navigate('/worker/bookings')}>
                    Review Bookings
                  </Button>
                  <Button fullWidth variant="outline" icon={Clock} onClick={() => navigate('/worker/availability')}>
                    Set Availability
                  </Button>
                  <Button fullWidth variant="outline" icon={Briefcase} onClick={() => navigate('/worker/services')}>
                    Add Services
                  </Button>
                  <Button fullWidth variant="ghost" icon={Star} onClick={() => navigate('/worker/reviews')}>
                    View Reviews
                  </Button>
                  <Button fullWidth variant="ghost" icon={ShieldCheck} onClick={() => navigate('/worker/verification')}>
                    Verification Status
                  </Button>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
