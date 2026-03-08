import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Briefcase,
  Calendar,
  AlertTriangle,
  Activity,
  RefreshCw,
  LayoutGrid,
  UserCog,
  ShieldCheck
} from 'lucide-react';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, Button, Badge, Spinner, StatCard, Skeleton, SimpleBarChart, SimpleDonutChart, AsyncState, StatGridSkeleton, BookingStatusBadge } from '../../components/common';
import { useSocketEvent } from '../../hooks/useSocket';
import { getAdminUsers, getAdminDashboard } from '../../api/admin';
import { getAllBookings } from '../../api/bookings';
import { getVerificationApplications } from '../../api/verification';
import { MainLayout } from '../../components/layout/MainLayout';
import { getPageLayout } from '../../constants/layout';
import { queryKeys } from '../../utils/queryKeys';
import { usePageTitle } from '../../hooks/usePageTitle';

export function AdminDashboardPage() {
    usePageTitle('Admin Dashboard');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.admin.dashboard(),
    queryFn: getAdminDashboard,
  });

  const bookingsQuery = useQuery({
    queryKey: queryKeys.admin.bookingsPreview(),
    queryFn: getAllBookings,
  });

  const usersQuery = useQuery({
    queryKey: queryKeys.admin.usersPreview(),
    queryFn: () => getAdminUsers(),
  });

  const stats = data?.stats;
  const bookings = useMemo(() => bookingsQuery.data?.bookings || [], [bookingsQuery.data?.bookings]);
  const users = useMemo(() => usersQuery.data?.users || [], [usersQuery.data?.users]);

  const verificationQuery = useQuery({
    queryKey: queryKeys.admin.verificationPreview(),
    queryFn: getVerificationApplications,
  });

  const applications = verificationQuery.data?.applications || [];
  const pendingApplications = applications.filter(app => app.status === 'PENDING');

  const refreshDashboardData = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard() });
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.bookingsPreview() });
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.verificationPreview() });
  };

  useSocketEvent('booking:created', refreshDashboardData);
  useSocketEvent('booking:status_updated', refreshDashboardData);
  useSocketEvent('verification:updated', refreshDashboardData);
  useSocketEvent('verification:created', refreshDashboardData);
  useSocketEvent('admin:users_updated', refreshDashboardData);
  useSocketEvent('admin:workers_updated', refreshDashboardData);

  const chartData = useMemo(() => {
    // User Growth (Last 7 Days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    const userGrowth = last7Days.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      const count = users.filter(u => u.createdAt?.startsWith(dateStr)).length;
      return {
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        value: count,
        tooltip: `${count} Users`
      };
    });

    // Booking Status
    const bookingStatus = [
      { label: 'Completed', value: bookings.filter(b => b.status === 'COMPLETED').length, color: '#10b981' },
      { label: 'Confirmed', value: bookings.filter(b => b.status === 'CONFIRMED').length, color: '#3b82f6' },
      { label: 'Pending', value: bookings.filter(b => b.status === 'PENDING').length, color: '#f59e0b' },
      { label: 'Cancelled', value: bookings.filter(b => b.status === 'CANCELLED').length, color: '#ef4444' }
    ];

    return { userGrowth, bookingStatus };
  }, [users, bookings]);

  return (
    <MainLayout>
      <div className={getPageLayout('default')}>
        <PageHeader
          title="Admin Dashboard"
          subtitle="Monitor marketplace activity and system health."
        />

        <AsyncState
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={refetch}
          loadingFallback={<StatGridSkeleton />}
          errorFallback={
            <Card className="p-6">
              <p className="text-error-500 mb-3">
                {error?.response?.data?.error || error?.message || 'Failed to load dashboard.'}
              </p>
              <button
                type="button"
                className="text-sm text-brand-500"
                onClick={() => refetch()}
              >
                Retry
              </button>
            </Card>
          }
        >
          {stats && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                  title="Users"
                  value={stats.users}
                  icon={Users}
                  color="brand"
                  delay={0}
                />
                <StatCard
                  title="Workers"
                  value={stats.workers}
                  icon={Briefcase}
                  color="info"
                  delay={1}
                />
                <StatCard
                  title="Total Bookings"
                  value={stats.bookings}
                  icon={Calendar}
                  color="success"
                  delay={2}
                />
                <StatCard
                  title="Pending Bookings"
                  value={stats.pendingBookings}
                  icon={AlertTriangle}
                  color="warning"
                  delay={3}
                />
                <StatCard
                  title="Verification Requests"
                  value={stats.pendingVerifications || 0}
                  icon={ShieldCheck}
                  color="error" // Use a distinct color to highlight action needed
                  delay={4}
                  onClick={() => navigate('/admin/verification')} // Make it clickable if StatCard supports it, or wrap it
                  className="cursor-pointer hover:shadow-md transition-shadow"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <SimpleBarChart
                  title="User Growth (Last 7 Days)"
                  data={chartData.userGrowth}
                  height="h-64"
                />
                <SimpleDonutChart
                  title="Booking Status"
                  data={chartData.bookingStatus}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Bookings</CardTitle>
                    <CardDescription>Latest bookings across the marketplace</CardDescription>
                  </CardHeader>

                  {bookingsQuery.isLoading && (
                    <div className="flex items-center justify-center py-10">
                      <Spinner size="lg" />
                    </div>
                  )}

                  {!bookingsQuery.isLoading && bookings.length === 0 && (
                    <p className="text-gray-600 dark:text-gray-300">
                      No bookings yet.
                    </p>
                  )}

                  {!bookingsQuery.isLoading && bookings.length > 0 && (
                    <div className="space-y-4">
                      {bookings.slice(0, 5).map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-900 dark:text-gray-100">
                              {booking.service?.name || `Booking #${booking.id}`}
                            </p>
                            <p className="text-gray-600 text-sm dark:text-gray-400">
                              {new Date(booking.scheduledAt || booking.scheduledDate).toLocaleString()}
                            </p>
                          </div>
                          <BookingStatusBadge status={booking.status} />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-5">
                    <Button size="sm" onClick={() => navigate('/admin/bookings')}>
                      View All Bookings
                    </Button>
                  </div>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Newest Users</CardTitle>
                    <CardDescription>Latest signups by role</CardDescription>
                  </CardHeader>

                  {usersQuery.isLoading && (
                    <div className="flex items-center justify-center py-10">
                      <Spinner size="lg" />
                    </div>
                  )}

                  {!usersQuery.isLoading && users.length === 0 && (
                    <p className="text-gray-600 dark:text-gray-300">
                      No users yet.
                    </p>
                  )}

                  {!usersQuery.isLoading && users.length > 0 && (
                    <div className="space-y-4">
                      {users.slice(0, 5).map((user) => (
                        <div key={user.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-900 dark:text-gray-100">{user.name}</p>
                            <p className="text-gray-600 text-sm dark:text-gray-400">{user.email}</p>
                          </div>
                          <Badge variant={user.role === 'ADMIN' ? 'info' : user.role === 'WORKER' ? 'warning' : 'default'}>
                            {user.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-5">
                    <Button size="sm" onClick={() => navigate('/admin/users')}>
                      Manage Users
                    </Button>
                  </div>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Pending Verifications</CardTitle>
                    <CardDescription>New worker applications needing review</CardDescription>
                  </CardHeader>

                  {verificationQuery.isLoading && (
                    <div className="flex items-center justify-center py-10">
                      <Spinner size="lg" />
                    </div>
                  )}

                  {!verificationQuery.isLoading && pendingApplications.length === 0 && (
                    <div className="px-6 pb-6">
                      <p className="text-gray-600 dark:text-gray-300">
                        No pending applications.
                      </p>
                    </div>
                  )}

                  {!verificationQuery.isLoading && pendingApplications.length > 0 && (
                    <div className="space-y-4 px-6">
                      {pendingApplications.slice(0, 5).map((app) => (
                        <div key={app.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {app.user?.name || 'Worker'}
                            </p>
                            <p className="text-gray-600 text-sm dark:text-gray-400">
                              Applied: {new Date(app.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="warning">Pending</Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-6 pt-4">
                    <Button size="sm" fullWidth variant="outline" onClick={() => navigate('/admin/verification')}>
                      Review Applications
                    </Button>
                  </div>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Admin shortcuts for daily operations</CardDescription>
                  </CardHeader>
                  <div className="space-y-3">
                    <Button fullWidth icon={LayoutGrid} onClick={() => navigate('/admin/services')}>
                      Manage Services
                    </Button>
                    <Button fullWidth variant="outline" icon={Users} onClick={() => navigate('/admin/workers')}>
                      Review Workers
                    </Button>
                    <Button fullWidth variant="outline" icon={UserCog} onClick={() => navigate('/admin/users')}>
                      User Management
                    </Button>
                    <Button fullWidth variant="ghost" icon={Calendar} onClick={() => navigate('/admin/bookings')}>
                      Booking Oversight
                    </Button>
                    <Button fullWidth variant="ghost" icon={ShieldCheck} onClick={() => navigate('/admin/verification')}>
                      Verification Queue
                    </Button>
                  </div>
                </Card>
              </div>
            </>
          )}
        </AsyncState>
      </div>
    </MainLayout>
  );
}
