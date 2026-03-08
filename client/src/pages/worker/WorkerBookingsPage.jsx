import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search, Filter, CalendarCheck, ShieldAlert,
  ArrowRight
} from 'lucide-react';

import { MainLayout } from '../../components/layout/MainLayout';
import {
  Card, Button, PageHeader, AsyncState,
  Input, BookingCard, Badge, ConfirmDialog, Pagination
} from '../../components/common';
import { OtpVerificationModal } from '../../components/features/bookings/OtpVerificationModal';
import { useBookingActions } from '../../hooks/useBookingActions';
import { getAllBookings } from '../../api/bookings';
import { queryKeys } from '../../utils/queryKeys';
import { getPageLayout } from '../../constants/layout';
import { useDebounce } from '../../hooks/useDebounce';
import { usePageTitle } from '../../hooks/usePageTitle';

const statusFilters = ['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export function WorkerBookingsPage() {
    usePageTitle('My Jobs');
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const {
    handleBookingAction,
    activeActionId,
    isAnyPending,
    otpModalProps,
    cancelConfirmProps,
  } = useBookingActions({ invalidateKeys: [queryKeys.bookings.worker()] });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.bookings.worker(),
    queryFn: () => getAllBookings({ viewAs: 'WORKER' }),
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });

  const bookings = data?.bookings || [];
  const debouncedSearch = useDebounce(searchQuery);
  const filteredBookings = bookings.filter(b => {
    const matchesFilter = filter === 'ALL' || b.status === filter;
    const matchesSearch = b.id.toString().includes(debouncedSearch) ||
      b.service?.name?.toLowerCase().includes(debouncedSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedBookings = filteredBookings.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <MainLayout>
      <div className={getPageLayout('default')}>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2 text-gray-900 dark:text-white">
              Mission Logs
            </h1>
            <p className="text-gray-500 font-medium italic">Command center for your active and past deployments.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={18} />
              <Input
                placeholder="Search mission ID..."
                className="pl-12 w-full md:w-64 h-14 rounded-2xl border-2 focus:border-brand-500 transition-all bg-transparent font-bold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="h-14 w-14 p-0 rounded-2xl border-2 hover:border-brand-500/50">
              <Filter size={20} />
            </Button>
          </div>
        </div>

        {/* Filter Chips */}
        <div role="radiogroup" aria-label="Booking status filter" className="flex overflow-x-auto gap-3 mb-10 pb-2 no-scrollbar">
          {statusFilters.map((f) => (
            <button
              key={f}
              role="radio"
              aria-checked={filter === f}
              onClick={() => setFilter(f)}
              className={`
                px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all
                ${filter === f
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-dark-800 dark:text-gray-400 dark:hover:text-white'
                }
              `}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>

        <AsyncState
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={refetch}
          isEmpty={filteredBookings.length === 0}
          emptyTitle="No records found"
          emptyMessage="Adjust your filters or standby for new missions."
        >
          <div className="grid grid-cols-1 gap-8 mb-20">
            {paginatedBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                role="WORKER"
                onAction={handleBookingAction}
                isActionLoading={isAnyPending && activeActionId === booking.id}
                activeActionId={activeActionId}
              />
            ))}
          </div>
          <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} totalItems={filteredBookings.length} pageSize={PAGE_SIZE} />
        </AsyncState>

        {/* Verification Modal */}
        <OtpVerificationModal {...otpModalProps} />

        <ConfirmDialog {...cancelConfirmProps} />
      </div>
    </MainLayout>
  );
}
