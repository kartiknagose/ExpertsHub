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
  DollarSign,
  Target,
  MapPin,
  ChevronRight,
  User,
  AlertCircle
} from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, Button, Badge, StatCard, Skeleton, AsyncState, Spinner, SimpleBarChart, SimpleDonutChart } from '../../components/common';

import { useTheme } from '../../context/ThemeContext';
import { getAllBookings, updateBookingStatus, cancelBooking, getOpenBookings, acceptBooking } from '../../api/bookings';
import { getMyAvailability } from '../../api/availability';
import { getMyServices, getMyWorkerProfile } from '../../api/workers';
import { queryKeys } from '../../utils/queryKeys';
import { getBookingStatusVariant } from '../../utils/statusHelpers';


export function WorkerDashboardPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.bookings.worker(),
    queryFn: getAllBookings,
  });

  const { data: profile } = useQuery({
    queryKey: ['worker-profile'],
    queryFn: getMyWorkerProfile,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateBookingStatus(id, { status }),
    onSuccess: (_, variables) => {
      const labels = { CONFIRMED: 'accepted', IN_PROGRESS: 'started', COMPLETED: 'completed' };
      toast.success(`Job ${labels[variables.status] || 'updated'} successfully!`);
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.worker() });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error || 'Failed to update booking status.');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => cancelBooking(id),
    onSuccess: () => {
      toast.success('Booking rejected successfully.');
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.worker() });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error || 'Failed to reject booking.');
    },
  });

  // Query for Open Jobs (Job Board)
  const { data: openJobsData, refetch: refetchOpenJobs } = useQuery({
    queryKey: ['open-bookings'],
    queryFn: getOpenBookings,
  });

  const acceptJobMutation = useMutation({
    mutationFn: (id) => acceptBooking(id),
    onSuccess: () => {
      toast.success('Job accepted! You can now see customer details.');
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.worker() });
      queryClient.invalidateQueries({ queryKey: ['open-bookings'] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error || 'Failed to accept job.');
    },
  });

  const openJobs = openJobsData?.bookings || [];
  const bookings = data?.bookings || [];

  // Stats Calculation
  const stats = useMemo(() => {
    const totalJobs = bookings.length;
    const completedJobs = bookings.filter((b) => b.status === 'COMPLETED').length;
    const pendingJobs = bookings.filter((b) => ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(b.status)).length;
    const totalEarnings = bookings
      .filter((b) => b.status === 'COMPLETED')
      .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

    // Calculate rating (mock based on profile if available, else standard)
    const rating = profile?.rating || 0;

    return [
      { label: 'Total Earnings', value: `₹${totalEarnings}`, icon: Wallet, color: 'text-green-500', bg: 'bg-green-500/10' },
      { label: 'Active Jobs', value: pendingJobs, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
      { label: 'Completed Jobs', value: completedJobs, icon: CheckCircle, color: 'text-purple-500', bg: 'bg-purple-500/10' },
      { label: 'Rating', value: rating ? rating.toFixed(1) : 'New', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    ];
  }, [bookings, profile]);

  const chartData = useMemo(() => {
    // Earnings (Last 7 Days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    const earningsData = last7Days.map(date => {
      const dateString = date.toISOString().split('T')[0];
      const dailyTotal = bookings
        .filter(b => {
          if (b.status !== 'COMPLETED') return false;
          // Use scheduledDate as the reference date
          if (!b.scheduledDate) return false;
          const bookingDate = new Date(b.scheduledDate).toISOString().split('T')[0];
          return bookingDate === dateString;
        })
        .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

      return {
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        value: dailyTotal,
        tooltip: `₹${dailyTotal}`
      };
    });

    // Job Status Distribution
    const activeJobsCount = bookings.filter(b => ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(b.status)).length;
    const completedCount = bookings.filter(b => b.status === 'COMPLETED').length;
    const cancelledCount = bookings.filter(b => ['CANCELLED', 'REJECTED'].includes(b.status)).length;

    const statusData = [
      { label: 'Completed', value: completedCount, color: '#10b981' }, // emerald-500
      { label: 'Active', value: activeJobsCount, color: '#3b82f6' },    // blue-500
      { label: 'Cancelled', value: cancelledCount, color: '#ef4444' }   // red-500
    ];

    return { earningsData, statusData };
  }, [bookings]);

  const activeBookings = bookings.filter(b => ['CONFIRMED', 'IN_PROGRESS'].includes(b.status));

  return (
    <MainLayout>
      <div className={`min-h-screen pb-20 ${isDark ? 'bg-dark-950' : 'bg-gray-50'}`}>

        {/* Welcome Header */}
        <div className={`pt-12 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden ${isDark ? 'bg-gradient-to-r from-brand-900 via-dark-900 to-dark-950' : 'bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500'}`}>
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
          <div className="max-w-7xl mx-auto relative z-10 text-white">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back, {profile?.user?.name || 'Pro'}!</h1>
                <p className="text-brand-100 text-lg max-w-2xl">
                  Here's what's happening with your business today. You have {activeBookings.length} active jobs.
                </p>
              </div>
              <Button
                variant="outline"
                className="hidden sm:flex bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
                onClick={() => navigate('/worker/availability')}
              >
                <Clock size={16} className="mr-2" /> Manage Availability
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                trend={index === 0 ? "+12%" : null}
                trendDirection="up"
                className="shadow-lg border-none ring-1 ring-black/5 dark:ring-white/5"
              />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <SimpleBarChart
              title="Weekly Earnings"
              data={chartData.earningsData}
              height="h-64"
            />
            <SimpleDonutChart
              title="Job Status Overview"
              data={chartData.statusData}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Main Column: Jobs */}
            <div className="lg:col-span-2 space-y-8">

              {/* Active Jobs Section */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <Briefcase className="text-brand-500" size={20} /> Active Jobs
                  </h2>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/worker/bookings')}>View All</Button>
                </div>

                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
                  </div>
                ) : activeBookings.length > 0 ? (
                  <div className="space-y-4">
                    {activeBookings.map((booking) => (
                      <div key={booking.id} className={`p-6 rounded-2xl border transition-all duration-200 hover:shadow-md ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-100'}`}>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-brand-900/30 text-brand-400' : 'bg-brand-50 text-brand-600'}`}>
                              <CalendarCheck size={24} />
                            </div>
                            <div>
                              <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{booking.service?.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                <User size={14} /> {booking.customer?.name}
                              </div>
                            </div>
                          </div>
                          <Badge variant={getBookingStatusVariant(booking.status).variant}>
                            {booking.status.replace('_', ' ')}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 pl-16">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <Calendar size={16} className="text-gray-400" />
                            {new Date(booking.scheduledDate).toLocaleString()}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <MapPin size={16} className="text-gray-400" />
                            <span className="truncate">{booking.addressDetails}</span>
                          </div>
                        </div>

                        <div className="pl-16 flex gap-3">
                          {booking.status === 'CONFIRMED' && (
                            <Button
                              size="sm"
                              onClick={() => statusMutation.mutate({ id: booking.id, status: 'IN_PROGRESS' })}
                              loading={statusMutation.isPending}
                              className="bg-brand-600 text-white hover:bg-brand-700"
                            >
                              Start Job
                            </Button>
                          )}
                          {booking.status === 'IN_PROGRESS' && (
                            <Button
                              size="sm"
                              onClick={() => statusMutation.mutate({ id: booking.id, status: 'COMPLETED' })}
                              loading={statusMutation.isPending}
                              className="bg-green-600 text-white hover:bg-green-700"
                            >
                              Complete Job
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/worker/bookings/${booking.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-12 rounded-2xl border border-dashed ${isDark ? 'border-dark-700 bg-dark-800/50' : 'border-gray-200 bg-gray-50'}`}>
                    <Briefcase className="mx-auto text-gray-400 mb-2" size={32} />
                    <h3 className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>No active jobs</h3>
                    <p className="text-gray-500">Check the Open Requests tab to find work.</p>
                  </div>
                )}
              </section>

              {/* Open Requests Section */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <Target className="text-accent-500" size={20} /> Open Requests
                  </h2>
                  <Button variant="ghost" size="sm" onClick={() => refetchOpenJobs()}>Refresh</Button>
                </div>

                {openJobs.length > 0 ? (
                  <div className="space-y-4">
                    {openJobs.map((job) => (
                      <Card key={job.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-accent-500">
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{job.service?.name}</h3>
                            <Badge variant="outline" className="text-accent-600 border-accent-200 bg-accent-50">New Lead</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                            <span className="flex items-center gap-1"><MapPin size={14} /> {job.addressDetails?.split(',')[0] || 'Local'}</span>
                            <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(job.scheduledDate).toLocaleDateString()}</span>
                          </div>
                          <Button
                            fullWidth
                            onClick={() => acceptJobMutation.mutate(job.id)}
                            loading={acceptJobMutation.isPending}
                            className="bg-black dark:bg-white dark:text-black text-white hover:bg-gray-800 dark:hover:bg-gray-200"
                          >
                            Accept Job
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-12 rounded-2xl border border-dashed ${isDark ? 'border-dark-700 bg-dark-800/50' : 'border-gray-200 bg-gray-50'}`}>
                    <Target className="mx-auto text-gray-400 mb-2" size={32} />
                    <h3 className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>No listed jobs nearby</h3>
                    <p className="text-gray-500">We'll notify you when new requests come in.</p>
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar: Quick Actions */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="border-none shadow-lg shadow-brand-500/5">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <div className="p-4 pt-0 space-y-2">
                  <Button variant="ghost" fullWidth className="justify-start h-12" onClick={() => navigate('/worker/availability')}>
                    <Clock size={18} className="mr-3 text-blue-500" /> Availability
                  </Button>
                  <Button variant="ghost" fullWidth className="justify-start h-12" onClick={() => navigate('/worker/services')}>
                    <Briefcase size={18} className="mr-3 text-purple-500" /> My Services
                  </Button>
                  <Button variant="ghost" fullWidth className="justify-start h-12" onClick={() => navigate('/worker/profile')}>
                    <User size={18} className="mr-3 text-green-500" /> Profile
                  </Button>
                  <Button variant="ghost" fullWidth className="justify-start h-12" onClick={() => navigate('/worker/reviews')}>
                    <Star size={18} className="mr-3 text-yellow-500" /> Reviews
                  </Button>
                </div>
              </Card>

              <div className={`p-6 rounded-2xl ${isDark ? 'bg-brand-900/10 border border-brand-800' : 'bg-brand-50 border border-brand-100'}`}>
                <h3 className={`font-bold mb-2 ${isDark ? 'text-brand-100' : 'text-brand-900'}`}>Pro Tip</h3>
                <p className={`text-sm ${isDark ? 'text-brand-200' : 'text-brand-700'}`}>
                  Updating your availability calendar weekly increases your chances of getting hired by 40%.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
