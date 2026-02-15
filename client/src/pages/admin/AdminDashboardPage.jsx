import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
import { MainLayout } from '../../components/layout/MainLayout';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, Button, Badge, Spinner, StatCard, Skeleton, SimpleBarChart, SimpleDonutChart, AsyncState } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';
import { getAdminUsers, getAdminDashboard } from '../../api/admin';
import { getAllBookings } from '../../api/bookings';
import { getVerificationApplications } from '../../api/verification';

export function AdminDashboardPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: getAdminDashboard,
  });

  const bookingsQuery = useQuery({
    queryKey: ['admin-bookings-preview'],
    queryFn: getAllBookings,
  });

  const usersQuery = useQuery({
    queryKey: ['admin-users-preview'],
    queryFn: () => getAdminUsers(),
  });

  const stats = data?.stats;
  const bookings = bookingsQuery.data?.bookings || [];
  const users = usersQuery.data?.users || [];

  const verificationQuery = useQuery({
    queryKey: ['admin-verification-preview'],
    queryFn: getVerificationApplications,
  });

  const applications = verificationQuery.data?.applications || [];
  const pendingApplications = applications.filter(app => app.status === 'PENDING');

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <PageHeader
          title="Admin Dashboard"
          subtitle="Monitor marketplace activity and system health."
        />

        <AsyncState
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={refetch}
          loadingFallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="h-32 flex flex-col justify-between">
                  <Skeleton className="h-4 w-24 mb-4" />
                  <Skeleton className="h-8 w-16" />
                  <div className="flex justify-end">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                  </div>
                </Card>
              ))}
            </div>
          }
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
                    <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                      No bookings yet.
                    </p>
                  )}

                  {!bookingsQuery.isLoading && bookings.length > 0 && (
                    <div className="space-y-4">
                      {bookings.slice(0, 5).map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between">
                          <div>
                            <p className={isDark ? 'text-gray-100' : 'text-gray-900'}>
                              {booking.service?.name || `Booking #${booking.id}`}
                            </p>
                            <p className={isDark ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>
                              {new Date(booking.scheduledAt || booking.scheduledDate).toLocaleString()}
                            </p>
                          </div>
                          <Badge variant={booking.status === 'PENDING' ? 'warning' : 'info'}>
                            {booking.status}
                          </Badge>
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
                    <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                      No users yet.
                    </p>
                  )}

                  {!usersQuery.isLoading && users.length > 0 && (
                    <div className="space-y-4">
                      {users.slice(0, 5).map((user) => (
                        <div key={user.id} className="flex items-center justify-between">
                          <div>
                            <p className={isDark ? 'text-gray-100' : 'text-gray-900'}>{user.name}</p>
                            <p className={isDark ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>{user.email}</p>
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
                      <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                        No pending applications.
                      </p>
                    </div>
                  )}

                  {!verificationQuery.isLoading && pendingApplications.length > 0 && (
                    <div className="space-y-4 px-6">
                      {pendingApplications.slice(0, 5).map((app) => (
                        <div key={app.id} className="flex items-center justify-between">
                          <div>
                            <p className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                              {app.user?.name || 'Worker'}
                            </p>
                            <p className={isDark ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>
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
