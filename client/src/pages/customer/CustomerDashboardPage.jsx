import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { MainLayout } from '../../components/layout/MainLayout';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  StatCard,
  BookingCard,
  Avatar,
  BookingCardSkeleton,
  StatGridSkeleton,
  AsyncState,
  ConfirmDialog
} from '../../components/common';

import {
  Calendar,
  Briefcase,
  CheckCircle,
  Clock,
  Zap,
  Star,
  CalendarClock,
  Wallet,
  ShieldAlert,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

import { getAllBookings, cancelBooking, payBooking } from '../../api/bookings';
import { createReview } from '../../api/reviews';
import { getAllServices } from '../../api/services';
import { queryKeys } from '../../utils/queryKeys';
import { useAuth } from '../../hooks/useAuth';
import { getPageLayout } from '../../constants/layout';
import { getServiceImage } from '../../constants/images';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcut';
import { useSocketEvent } from '../../hooks/useSocket';
import { toast } from 'sonner';
import { usePageTitle } from '../../hooks/usePageTitle';

export function CustomerDashboardPage() {
    usePageTitle('Dashboard');
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cancelConfirmId, setCancelConfirmId] = useState(null);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    { key: 'b', callback: () => navigate('/bookings'), meta: true, title: 'Go to bookings' },
    { key: 's', callback: () => navigate('/services'), meta: true, title: 'Browse services' },
    { key: 'p', callback: () => navigate('/profile'), meta: true, title: 'Open profile' },
  ]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.bookings.customer(),
    queryFn: getAllBookings,
  });

  const servicesQuery = useQuery({
    queryKey: queryKeys.services.preview(),
    queryFn: getAllServices,
    staleTime: 5 * 60 * 1000,
  });

  const reviewMutation = useMutation({
    mutationFn: (payload) => createReview(payload),
    onSuccess: () => {
      toast.success('Review submitted! Thank you.');
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.customer() });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to submit review');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => cancelBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.customer() });
    },
  });

  const payMutation = useMutation({
    mutationFn: (id) => payBooking(id),
    onSuccess: () => {
      toast.success('Payment successful! Thank you.');
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.customer() });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Payment failed');
    },
  });

  const [activeActionId, setActiveActionId] = useState(null);

  const bookings = useMemo(() => data?.bookings || [], [data?.bookings]);
  const activeBookings = useMemo(() =>
    bookings.filter(b => {
      // Always show active jobs
      if (['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(b.status)) return true;
      // Keep completed jobs until customer has paid AND reviewed
      if (b.status === 'COMPLETED') {
        const hasReviewed = (b.reviews || []).some(r => r.reviewerId === user?.id);
        const hasPaid = b.paymentStatus === 'PAID';
        return !hasPaid || !hasReviewed;
      }
      return false;
    }),
    [bookings, user?.id]);

  const services = servicesQuery.data?.services || servicesQuery.data || [];

  const handleBookingAction = async (type, payload) => {
    const actionId = payload.id || payload.bookingId;
    setActiveActionId(actionId);
    try {
      if (type === 'CANCEL') {
        setCancelConfirmId(actionId);
        return; // Dialog handles the rest
      } else if (type === 'PAY') {
        await payMutation.mutateAsync(actionId);
      } else if (type === 'REVIEW') {
        await reviewMutation.mutateAsync({
          bookingId: payload.bookingId,
          rating: payload.rating,
          comment: payload.comment,
        });
      }
    } finally {
      setActiveActionId(null);
    }
  };

  const summary = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === 'PENDING').length,
      confirmed: bookings.filter((b) => b.status === 'CONFIRMED').length,
      completed: bookings.filter((b) => b.status === 'COMPLETED').length,
      cancelled: bookings.filter((b) => b.status === 'CANCELLED').length,
      active: activeBookings.length
    };
  }, [bookings, activeBookings]);

  const totalSpent = useMemo(() => {
    return bookings
      .filter((booking) => booking.status === 'COMPLETED')
      .reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0);
  }, [bookings]);

  useSocketEvent('booking:created', (payload) => {
    if (payload.customerId === user?.id) {
      toast.info('New booking confirmed!');
      refetch();
    }
  });

  useSocketEvent('booking:status_updated', (payload) => {
    if (payload.customerId === user?.id) {
      toast.success(`Booking status: ${payload.status}`);
      refetch();
    }
  });

  return (
    <MainLayout>
      <div className={getPageLayout('wide')}>

        {/* Modern Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="flex items-center gap-6">
            <Avatar name={user?.name} src={user?.profilePhotoUrl} size="xl" ring />
            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2 text-gray-900 dark:text-white">
                Welcome back, <span className="text-brand-500">{user?.name?.split(' ')[0]}!</span>
              </h1>
              <p className="text-gray-500 font-medium italic">Your personalized service hub is ready.</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => navigate('/services')} className="px-8 rounded-2xl h-14 font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-brand-500/20">
              Book New Service
            </Button>
          </div>
        </div>

        {/* Dynamic Stat Cards */}
        {isLoading ? (
          <StatGridSkeleton />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
            <StatCard
              title="Active Sessions"
              value={summary.active}
              icon={CalendarClock}
              color="brand"
              className="md:scale-105"
            />
            <StatCard
              title="Jobs Completed"
              value={summary.completed}
              icon={CheckCircle}
              color="success"
            />
            <StatCard
              title="Pending Payments"
              value={`₹${bookings.filter(b => b.status === 'COMPLETED' && b.paymentStatus !== 'PAID').reduce((sum, b) => sum + Number(b.totalPrice || 0), 0).toLocaleString()}`}
              icon={Wallet}
              color="info"
            />
            <StatCard
              title="Total Invested"
              value={`₹${totalSpent.toLocaleString()}`}
              icon={Briefcase}
              color="warning"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Activity & Recommendations */}
          <div className="lg:col-span-2 space-y-12">

            {/* Real-time Activity Section */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                  Live Activity
                </h2>
                <Link to="/bookings" className="text-brand-500 font-black text-xs uppercase tracking-widest hover:underline px-4 py-2 bg-brand-500/10 rounded-xl transition-colors">
                  Full History
                </Link>
              </div>

              <AsyncState
                isLoading={isLoading}
                isError={isError}
                onRetry={refetch}
                loadingFallback={<div className="space-y-6"><BookingCardSkeleton /><BookingCardSkeleton /></div>}
                isEmpty={activeBookings.length === 0}
                emptyTitle="No active missions"
                emptyMessage="Book a professional service to track real-time updates here."
                className="min-h-[200px]"
              >
                <div className="grid grid-cols-1 gap-6">
                  {activeBookings.map(booking => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      role="CUSTOMER"
                      onAction={handleBookingAction}
                      isActionLoading={cancelMutation.isPending || reviewMutation.isPending || payMutation.isPending}
                      activeActionId={activeActionId}
                    />
                  ))}
                </div>
              </AsyncState>
            </section>

            {/* Smart Discovery Section */}
            <section>
              <h2 className="text-2xl font-black tracking-tight mb-8 text-gray-900 dark:text-white">
                Handpicked for you
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {services.slice(0, 4).map(service => (
                  <Card
                    key={service.id}
                    className="group hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden border-0 bg-transparent"
                    onClick={() => navigate(`/services/${service.id}`)}
                  >
                    <div className="relative h-56 rounded-[2rem] overflow-hidden shadow-lg">
                      <img
                        src={getServiceImage(service.name || service.category)}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 blur-[0.5px] group-hover:blur-0"
                        alt={service.name}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/10 to-transparent opacity-80" />
                      <div className="absolute bottom-6 left-6 right-6">
                        <Badge className="bg-brand-500 text-white border-0 mb-3 px-3 py-1 font-black uppercase text-[8px] tracking-[0.2em]">{service.category}</Badge>
                        <div className="flex items-center justify-between">
                          <h3 className="text-white font-black text-xl tracking-tight">{service.name}</h3>
                          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform duration-300">
                            <ArrowRight size={20} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Premium Widgets */}
          <div className="space-y-8">

            {/* Share Widget */}
            <Card className="border-0 bg-brand-500 text-white p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl shadow-brand-500/20">
              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-4 leading-tight">Share UrbanPro <br />with Friends</h3>
                <p className="text-brand-100 text-sm font-medium mb-6 opacity-80">Know someone who needs quality home services? Spread the word!</p>
                <Button onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: 'UrbanPro', text: 'Check out UrbanPro for professional home services!', url: window.location.origin });
                  } else {
                    navigator.clipboard.writeText(window.location.origin);
                    toast.success('Link copied to clipboard!');
                  }
                }} className="w-full h-14 bg-white text-brand-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-50 hover:scale-[1.02] transition-all">
                  Share Now
                </Button>
              </div>
              <Zap className="absolute -bottom-6 -right-6 w-32 h-32 opacity-10 rotate-12" />
            </Card>

            {/* Security widget */}
            <Card className="p-8 rounded-[2.5rem] bg-opacity-50 backdrop-blur-sm">
              <h3 className="font-black uppercase tracking-widest text-[10px] mb-8 text-gray-500 dark:text-gray-400">Safety Matrix</h3>
              <div className="space-y-8">
                <div className="flex gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-success-500/10 flex items-center justify-center text-success-500 group-hover:scale-110 transition-transform">
                    <ShieldAlert size={24} />
                  </div>
                  <div>
                    <p className="font-black text-sm tracking-tight mb-1 text-dark-900 dark:text-white">Zero-Risk Promise</p>
                    <p className="text-xs text-gray-500 font-medium">Verified professional network</p>
                  </div>
                </div>
                <div className="flex gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-info-500/10 flex items-center justify-center text-info-500 group-hover:scale-110 transition-transform">
                    <Star size={24} />
                  </div>
                  <div>
                    <p className="font-black text-sm tracking-tight mb-1 text-dark-900 dark:text-white">UrbanPro Quality</p>
                    <p className="text-xs text-gray-500 font-medium">Top-rated standard of work</p>
                  </div>
                </div>
                <div className="flex gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500 group-hover:scale-110 transition-transform">
                    <Wallet size={24} />
                  </div>
                  <div>
                    <p className="font-black text-sm tracking-tight mb-1 text-dark-900 dark:text-white">Secure Escrow</p>
                    <p className="text-xs text-gray-500 font-medium">Pay only when satisfied</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Support widget */}
            <div className="p-2">
              <button onClick={() => toast.info('Support center coming soon! For urgent help, email support@urbanpro.com')} className="w-full p-6 rounded-3xl border-2 border-dashed flex items-center justify-between group transition-all border-gray-200 hover:border-brand-500/30 dark:border-dark-700 dark:hover:border-brand-500/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-dark-800 flex items-center justify-center">
                    <Clock size={18} className="text-gray-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Support Center</p>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Available 24/7</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={cancelConfirmId !== null}
        onCancel={() => setCancelConfirmId(null)}
        onConfirm={async () => {
          try {
            await cancelMutation.mutateAsync(cancelConfirmId);
          } finally {
            setCancelConfirmId(null);
          }
        }}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmText="Yes, Cancel"
        cancelText="Keep Booking"
        variant="danger"
        loading={cancelMutation.isPending}
      />
    </MainLayout>
  );
}
