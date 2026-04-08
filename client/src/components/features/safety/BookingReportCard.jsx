import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Flag, ShieldAlert, Info, Link as LinkIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button, Card, Badge, Modal, ModalFooter, Select, Textarea, Input } from '../../common';
import { createBookingReport, getMyBookingReports } from '../../../api/safety';
import { queryKeys } from '../../../utils/queryKeys';
import { toast } from 'sonner';

const REPORT_OPTIONS = [
  { value: 'SAFETY', label: 'Safety concern' },
  { value: 'HARASSMENT', label: 'Harassment' },
  { value: 'NO_SHOW', label: 'No-show / late arrival' },
  { value: 'PROPERTY_DAMAGE', label: 'Property damage' },
  { value: 'PAYMENT_DISPUTE', label: 'Payment dispute' },
  { value: 'MISCONDUCT', label: 'Misconduct' },
  { value: 'FRAUD', label: 'Fraud or scam' },
  { value: 'OTHER', label: 'Other issue' },
];

const DEFAULT_FORM = {
  category: 'SAFETY',
  details: '',
  evidenceUrl: '',
};

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

function getStatusVariant(status) {
  switch (status) {
    case 'RESOLVED':
      return 'success';
    case 'UNDER_REVIEW':
      return 'warning';
    case 'DISMISSED':
      return 'default';
    default:
      return 'error';
  }
}

export function BookingReportCard({ booking, reporterRole, className = '' }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);

  const bookingId = booking?.id;
  const reporterRoleUpper = String(reporterRole || '').toUpperCase();

  const targetUser = useMemo(() => {
    if (!booking) return null;
    if (reporterRoleUpper === 'CUSTOMER') return booking.workerProfile?.user || null;
    if (reporterRoleUpper === 'WORKER') return booking.customer || null;
    return null;
  }, [booking, reporterRoleUpper]);

  const reportableStatuses = ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  const canReport = Boolean(bookingId && targetUser && reportableStatuses.includes(booking?.status));

  const reportsQuery = useQuery({
    queryKey: queryKeys.safety.reports(bookingId, reporterRoleUpper),
    queryFn: () => getMyBookingReports({ bookingId }),
    enabled: Boolean(bookingId && reporterRoleUpper),
    staleTime: 30_000,
  });

  const existingReport = reportsQuery.data?.reports?.[0] || null;

  const submitMutation = useMutation({
    mutationFn: (payload) => createBookingReport(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.safety.reports(bookingId, reporterRoleUpper) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(bookingId) });
      setForm(DEFAULT_FORM);
      setIsOpen(false);
      toast.success(t('Report submitted successfully.'));
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error?.response?.data?.error || t('Failed to submit report'));
    },
  });

  const handleSubmit = () => {
    if (!canReport) return;
    submitMutation.mutate({
      bookingId,
      category: form.category,
      details: form.details,
      evidenceUrl: form.evidenceUrl || undefined,
    });
  };

  if (!booking || !targetUser) return null;

  const roleLabel = reporterRoleUpper === 'CUSTOMER' ? t('worker') : t('customer');
  const cardTitle = reporterRoleUpper === 'CUSTOMER' ? t('Report worker') : t('Report customer');
  const cardDescription = reporterRoleUpper === 'CUSTOMER'
    ? t('Use this when the assigned professional behaved unsafely, missed the job, or caused damage.')
    : t('Use this when the customer caused a safety issue, harassment, or a booking dispute.');

  return (
    <Card className={`p-5 border-none ring-1 ring-black/5 dark:ring-white/10 shadow-sm ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 shrink-0">
            <ShieldAlert size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-400 mb-1">{t('Trust & Safety')}</p>
            <h4 className="text-sm font-black text-gray-900 dark:text-white">{cardTitle}</h4>
            <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">{cardDescription}</p>
          </div>
        </div>

        {existingReport ? (
          <Badge variant={getStatusVariant(existingReport.status)} size="sm" className="shrink-0 uppercase">
            {existingReport.status.replace(/_/g, ' ')}
          </Badge>
        ) : (
          <Button
            variant="outline"
            size="sm"
            icon={AlertTriangle}
            className="shrink-0 rounded-xl font-black"
            onClick={() => setIsOpen(true)}
            disabled={!canReport}
          >
            {t('Report')}
          </Button>
        )}
      </div>

      {existingReport ? (
        <div className="mt-4 rounded-2xl border border-dashed border-gray-200 dark:border-dark-700 bg-gray-50/70 dark:bg-dark-900/40 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400">
            <Info size={12} />
            {t('Latest report')}
          </div>
          <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{existingReport.category.replace(/_/g, ' ')}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{existingReport.details}</p>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
            {existingReport.reviewedAt ? t('Reviewed') : t('Submitted')} {formatDate(existingReport.reviewedAt || existingReport.createdAt)}
          </p>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-gray-200 dark:border-dark-700 bg-gray-50/70 dark:bg-dark-900/40 p-4 flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${canReport ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400' : 'bg-gray-100 text-gray-400 dark:bg-dark-800 dark:text-gray-500'}`}>
            <Flag size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{t('Report the {{role}} if something went wrong.', { role: roleLabel })}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{canReport ? t('The safety team will review it privately.') : t('Reports are available after a professional is assigned.')}</p>
          </div>
        </div>
      )}

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setForm(DEFAULT_FORM);
        }}
        title={cardTitle}
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-2xl border border-gray-200 dark:border-dark-700 bg-gray-50/80 dark:bg-dark-900/60 p-4">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400 flex items-center justify-center shrink-0">
              {reporterRoleUpper === 'CUSTOMER' ? <ShieldAlert size={18} /> : <AlertTriangle size={18} />}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">{t('Reporting {{role}}', { role: roleLabel })}</p>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{targetUser.name}</p>
            </div>
          </div>

          <Select
            label={t('Reason')}
            value={form.category}
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
          >
            {REPORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{t(option.label)}</option>
            ))}
          </Select>

          <Textarea
            label={t('Tell us what happened')}
            rows={5}
            value={form.details}
            onChange={(e) => setForm((prev) => ({ ...prev, details: e.target.value }))}
            placeholder={t('Include dates, what happened, and why this should be reviewed...')}
            hint={t('Please provide at least 20 characters.')} 
          />

          <Input
            label={t('Evidence link (optional)')}
            value={form.evidenceUrl}
            onChange={(e) => setForm((prev) => ({ ...prev, evidenceUrl: e.target.value }))}
            placeholder={t('Paste a photo, document, or cloud link')}
            hint={t('Optional. Use only if you have a safe shareable link.')} 
          />

          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 dark:bg-amber-900/10 dark:border-amber-900/30 p-4 text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
            {t('This report is shared with the safety team only. Do not include passwords, card numbers, or other sensitive data.')}
          </div>
        </div>

        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setIsOpen(false);
              setForm(DEFAULT_FORM);
            }}
          >
            {t('Cancel')}
          </Button>
          <Button
            variant="danger"
            icon={AlertTriangle}
            loading={submitMutation.isPending}
            disabled={!canReport || form.details.trim().length < 20}
            onClick={handleSubmit}
          >
            {t('Submit report')}
          </Button>
        </ModalFooter>
      </Modal>
    </Card>
  );
}