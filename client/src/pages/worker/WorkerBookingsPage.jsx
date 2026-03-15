import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  CheckCircle,
  Clock3,
  Download,
  ListFilter,
  MapPin,
  PlayCircle,
  RefreshCw,
  Search,
  User,
  XCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { MainLayout } from '../../components/layout/MainLayout';
import {
  AsyncState,
  Badge,
  BookingStatusBadge,
  Button,
  Card,
  ConfirmDialog,
} from '../../components/common';
import { OtpVerificationModal } from '../../components/features/bookings/OtpVerificationModal';
import { getAllBookings } from '../../api/bookings';
import { getPageLayout } from '../../constants/layout';
import { queryKeys } from '../../utils/queryKeys';
import { useBookingActions } from '../../hooks/useBookingActions';
import { usePageTitle } from '../../hooks/usePageTitle';

const FILTERS = ['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

function formatDateParts(iso, locale) {
  if (!iso) return { date: '-', time: '-' };
  const dateObj = new Date(iso);
  if (Number.isNaN(dateObj.getTime())) return { date: '-', time: '-' };

  return {
    date: dateObj.toLocaleDateString(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    time: dateObj.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

export function WorkerBookingsPage() {
  const { t, i18n } = useTranslation();
  usePageTitle(t('My Bookings'));

  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const {
    handleBookingAction,
    activeActionId,
    isAnyPending,
    otpModalProps,
    cancelConfirmProps,
  } = useBookingActions({
    invalidateKeys: [queryKeys.bookings.worker(), queryKeys.bookings.open()],
  });

  const bookingsQuery = useQuery({
    queryKey: queryKeys.bookings.worker(),
    queryFn: getAllBookings,
  });

  const bookings = useMemo(() => bookingsQuery.data?.bookings || [], [bookingsQuery.data?.bookings]);

  const stats = useMemo(() => {
    const pending = bookings.filter((b) => b.status === 'PENDING').length;
    const active = bookings.filter((b) => ['CONFIRMED', 'IN_PROGRESS'].includes(b.status)).length;
    const completed = bookings.filter((b) => b.status === 'COMPLETED').length;

    return {
      total: bookings.length,
      pending,
      active,
      completed,
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return bookings.filter((booking) => {
      const statusMatch = statusFilter === 'ALL' || booking.status === statusFilter;
      if (!statusMatch) return false;
      if (!term) return true;

      const serviceName = booking.service?.name?.toLowerCase() || '';
      const customerName = booking.customer?.name?.toLowerCase() || '';
      const address = (booking.address || booking.addressDetails || '').toLowerCase();
      const idText = String(booking.id || '');

      return (
        serviceName.includes(term) ||
        customerName.includes(term) ||
        address.includes(term) ||
        idText.includes(term)
      );
    });
  }, [bookings, statusFilter, searchTerm]);

  const renderActions = (booking) => {
    if (booking.status === 'PENDING') {
      return (
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            icon={CheckCircle}
            loading={isAnyPending && activeActionId === booking.id}
            onClick={() => handleBookingAction('CONFIRM', { id: booking.id })}
            className="h-9 rounded-lg"
          >
            {t('Accept')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={XCircle}
            loading={isAnyPending && activeActionId === booking.id}
            onClick={() => handleBookingAction('CANCEL', { id: booking.id })}
            className="h-9 rounded-lg"
          >
            {t('Decline')}
          </Button>
        </div>
      );
    }

    if (booking.status === 'CONFIRMED') {
      return (
        <Button
          size="sm"
          icon={PlayCircle}
          onClick={() => handleBookingAction('START_OTP', { id: booking.id })}
          className="h-9 rounded-lg"
        >
          {t('Start Job')}
        </Button>
      );
    }

    if (booking.status === 'IN_PROGRESS') {
      return (
        <Button
          size="sm"
          icon={CheckCircle}
          onClick={() => handleBookingAction('COMPLETE_OTP', { id: booking.id })}
          className="h-9 rounded-lg bg-success-600 hover:bg-success-700"
        >
          {t('Finish Job')}
        </Button>
      );
    }

    if (booking.status === 'COMPLETED') {
      return (
        <Button
          size="sm"
          variant="outline"
          icon={Download}
          loading={isAnyPending && activeActionId === booking.id}
          onClick={() => handleBookingAction('DOWNLOAD_INVOICE', { id: booking.id })}
          className="h-9 rounded-lg"
        >
          {t('Invoice')}
        </Button>
      );
    }

    return null;
  };

  return (
    <MainLayout>
      <div className={getPageLayout('wide')}>
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-500">{t('Bookings')}</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
              {t('My Bookings')}
            </h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {t('Review requests, manage active jobs, and close completed work.')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="neutral" size="sm">{t('Total')}: {stats.total}</Badge>
            <Badge variant="warning" size="sm">{t('Pending')}: {stats.pending}</Badge>
            <Badge variant="info" size="sm">{t('Active')}: {stats.active}</Badge>
            <Badge variant="success" size="sm">{t('Completed')}: {stats.completed}</Badge>
            <Button
              size="sm"
              variant="outline"
              icon={RefreshCw}
              onClick={() => bookingsQuery.refetch()}
              loading={bookingsQuery.isFetching}
              className="h-9 rounded-lg"
            >
              {t('Refresh')}
            </Button>
          </div>
        </div>

        <Card className="mb-4 p-3 sm:p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto]">
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('Search by booking ID, customer, service, or location')}
                className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-3 text-sm font-medium text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-dark-700 dark:bg-dark-900 dark:text-white"
              />
            </div>

            <div className="relative">
              <ListFilter size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 w-full appearance-none rounded-lg border border-neutral-200 bg-white pl-10 pr-8 text-sm font-semibold text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-dark-700 dark:bg-dark-900 dark:text-white"
              >
                {FILTERS.map((status) => (
                  <option key={status} value={status}>
                    {status === 'ALL' ? t('All Statuses') : t(status.replace('_', ' '))}
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-10 rounded-lg"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
              }}
            >
              {t('Clear')}
            </Button>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map((status) => {
              const active = statusFilter === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={
                    `h-8 rounded-md border px-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition ${
                      active
                        ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400'
                        : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50 dark:border-dark-700 dark:text-neutral-300 dark:hover:bg-dark-800'
                    }`
                  }
                >
                  {status === 'ALL' ? t('All') : t(status.replace('_', ' '))}
                </button>
              );
            })}
          </div>
        </Card>

        <AsyncState
          isLoading={bookingsQuery.isLoading}
          isError={bookingsQuery.isError}
          error={bookingsQuery.error}
          onRetry={() => bookingsQuery.refetch()}
          isEmpty={!bookingsQuery.isLoading && !bookingsQuery.isError && filteredBookings.length === 0}
          emptyTitle={t('No bookings found')}
          emptyMessage={
            searchTerm || statusFilter !== 'ALL'
              ? t('Try another search or status filter.')
              : t('Bookings will appear here when customers request your services.')
          }
        >
          <Card className="hidden overflow-hidden p-0 md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-neutral-100 bg-neutral-50/70 dark:border-dark-700 dark:bg-dark-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-neutral-500">{t('Booking')}</th>
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-neutral-500">{t('Customer')}</th>
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-neutral-500">{t('Schedule')}</th>
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-neutral-500">{t('Location')}</th>
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-neutral-500">{t('Status')}</th>
                    <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-neutral-500">{t('Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => {
                    const scheduledAt = booking.scheduledAt || booking.scheduledDate;
                    const locale = i18n.language === 'en' ? 'en-IN' : i18n.language;
                    const { date, time } = formatDateParts(scheduledAt, locale);

                    return (
                      <tr key={booking.id} className="border-b border-neutral-100 transition hover:bg-neutral-50/60 dark:border-dark-700 dark:hover:bg-dark-800/50">
                        <td className="px-4 py-3 align-top">
                          <div className="min-w-[180px]">
                            <p className="truncate text-sm font-bold text-neutral-900 dark:text-white">
                              {booking.service?.name || t('Service')}
                            </p>
                            <p className="mt-1 text-xs font-semibold text-neutral-500">#{booking.id}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex items-center gap-1.5 text-sm text-neutral-700 dark:text-neutral-200">
                            <User size={14} className="text-neutral-400" />
                            <span className="truncate">{booking.customer?.name || t('Customer')}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="space-y-1 text-xs text-neutral-600 dark:text-neutral-300">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={13} className="text-neutral-400" />
                              <span>{date}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock3 size={13} className="text-neutral-400" />
                              <span>{time}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex max-w-[260px] items-start gap-1.5 text-xs text-neutral-600 dark:text-neutral-300">
                            <MapPin size={13} className="mt-0.5 shrink-0 text-neutral-400" />
                            <span className="line-clamp-2">{booking.address || booking.addressDetails || t('Location')}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <BookingStatusBadge status={booking.status} size="sm" />
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            {renderActions(booking)}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/worker/bookings/${booking.id}`)}
                              className="h-8 rounded-md"
                            >
                              {t('Details')}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="space-y-2.5 md:hidden">
            {filteredBookings.map((booking) => {
              const scheduledAt = booking.scheduledAt || booking.scheduledDate;
              const locale = i18n.language === 'en' ? 'en-IN' : i18n.language;
              const { date, time } = formatDateParts(scheduledAt, locale);

              return (
                <Card key={booking.id} className="p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-bold text-neutral-900 dark:text-white">
                      {booking.service?.name || t('Service')}
                    </p>
                    <BookingStatusBadge status={booking.status} size="sm" />
                  </div>

                  <div className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-300">
                    <div className="flex items-center gap-1.5">
                      <User size={13} className="text-neutral-400" />
                      <span className="truncate">{booking.customer?.name || t('Customer')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-neutral-400" />
                      <span>{date}</span>
                      <Clock3 size={13} className="ml-2 text-neutral-400" />
                      <span>{time}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <MapPin size={13} className="mt-0.5 text-neutral-400" />
                      <span className="line-clamp-2">{booking.address || booking.addressDetails || t('Location')}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {renderActions(booking)}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/worker/bookings/${booking.id}`)}
                      className="h-8 rounded-md"
                    >
                      {t('Details')}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </AsyncState>

        <OtpVerificationModal {...otpModalProps} />
        <ConfirmDialog {...cancelConfirmProps} />
      </div>
    </MainLayout>
  );
}
