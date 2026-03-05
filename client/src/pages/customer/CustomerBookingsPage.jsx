import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Filter, CalendarCheck, Star } from 'lucide-react';

import { MainLayout } from '../../components/layout/MainLayout';
import {
  Button,
  PageHeader,
  AsyncState,
  BookingCard,
  Input,
  Card,
  ConfirmDialog
} from '../../components/common';
import { cancelBooking, getAllBookings } from '../../api/bookings';
import { createReview } from '../../api/reviews';
import { queryKeys } from '../../utils/queryKeys';
import { getPageLayout } from '../../constants/layout';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcut';

export function CustomerBookingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeActionId, setActiveActionId] = useState(null);
  const [cancelConfirmId, setCancelConfirmId] = useState(null);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    { key: 'd', callback: () => navigate('/dashboard'), meta: true },
    { key: 's', callback: () => navigate('/services'), meta: true },
  ]);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.bookings.customer(),
    queryFn: () => getAllBookings({ viewAs: 'CUSTOMER' }),
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => cancelBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.customer() });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: (payload) => createReview(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.customer() });
    },
  });

  const handleBookingAction = async (type, payload) => {
    setActiveActionId(payload.id);
    try {
      if (type === 'CANCEL') {
        setCancelConfirmId(payload.id);
        return; // Dialog handles the rest
      } else if (type === 'REVIEW') {
        await reviewMutation.mutateAsync(payload);
      }
    } finally {
      setActiveActionId(null);
    }
  };

  const bookings = data?.bookings || [];
  const filteredBookings = bookings.filter(b =>
    b.service?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.id.toString().includes(searchQuery)
  );

  return (
    <MainLayout>
      <div className={getPageLayout('default')}>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2 text-gray-900 dark:text-white">
              My Missions
            </h1>
            <p className="text-gray-500 font-medium italic">Track, manage and review your service history.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={18} />
              <Input
                placeholder="Search by mission ID or service..."
                className="pl-12 w-full md:w-80 h-14 rounded-2xl border-2 focus:border-brand-500 transition-all bg-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="h-14 w-14 p-0 rounded-2xl border-2 hover:border-brand-500/50">
              <Filter size={20} />
            </Button>
          </div>
        </div>

        <AsyncState
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={refetch}
          isEmpty={filteredBookings.length === 0}
          emptyTitle={searchQuery ? "No matches found" : "Your mission log is empty"}
          emptyMessage={searchQuery ? "Try searching for a different service name or ID." : "Start your first mission by booking a professional service."}
          emptyAction={
            <Button size="lg" className="rounded-2xl px-10 h-14 font-black uppercase text-[10px] tracking-widest" onClick={() => navigate('/services')}>
              Deploy New Scout
            </Button>
          }
        >
          <div className="grid grid-cols-1 gap-8 mb-20">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                role="CUSTOMER"
                onAction={handleBookingAction}
                isActionLoading={cancelMutation.isPending || reviewMutation.isPending}
                activeActionId={activeActionId}
              />
            ))}
          </div>
        </AsyncState>

        {/* Global Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-80">
          <Card className="p-6 rounded-[2rem] border-dashed border-2 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500">
              <CalendarCheck size={24} />
            </div>
            <div>
              <h4 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-1">Total Deployments</h4>
              <p className="text-xl font-black text-dark-900 dark:text-white">{bookings.length}</p>
            </div>
          </Card>
          <Card className="p-6 rounded-[2rem] border-dashed border-2 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success-500/10 flex items-center justify-center text-success-500">
              <Star size={24} />
            </div>
            <div>
              <h4 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-1">Success Rate</h4>
              <p className="text-xl font-black text-dark-900 dark:text-white">{bookings.length > 0 ? `${((bookings.filter(b => b.status === 'COMPLETED').length / bookings.length) * 100).toFixed(1)}%` : 'N/A'}</p>
            </div>
          </Card>
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
      </div>
    </MainLayout>
  );
}
