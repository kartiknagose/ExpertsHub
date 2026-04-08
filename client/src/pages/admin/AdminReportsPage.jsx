import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  RefreshCw,
  ShieldAlert,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

import { MainLayout } from '../../components/layout/MainLayout';
import { getPageLayout } from '../../constants/layout';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  AsyncState,
  Modal,
  ModalFooter,
  Textarea,
  Select,
} from '../../components/common';
import { getBookingReportSummary, getBookingReports, updateBookingReportStatus } from '../../api/safety';
import { queryKeys } from '../../utils/queryKeys';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const STATUS_OPTIONS = ['ALL', 'OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'];
const CATEGORY_OPTIONS = ['ALL', 'SAFETY', 'HARASSMENT', 'NO_SHOW', 'PROPERTY_DAMAGE', 'PAYMENT_DISPUTE', 'MISCONDUCT', 'FRAUD', 'OTHER'];
const PRIORITY_OPTIONS = ['ALL', 'LOW', 'MEDIUM', 'HIGH'];

const DEFAULT_ACTION = { report: null, status: 'UNDER_REVIEW' };

function formatDate(value) {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

function badgeVariant(status) {
  switch (status) {
    case 'RESOLVED': return 'success';
    case 'UNDER_REVIEW': return 'warning';
    case 'DISMISSED': return 'default';
    default: return 'error';
  }
}

function priorityVariant(priority) {
  switch (priority) {
    case 'HIGH': return 'error';
    case 'MEDIUM': return 'warning';
    default: return 'default';
  }
}

export function AdminReportsPage() {
  const { t } = useTranslation();
  usePageTitle('Booking Reports');
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [priority, setPriority] = useState('ALL');
  const [actionState, setActionState] = useState(DEFAULT_ACTION);
  const [adminNotes, setAdminNotes] = useState('');

  const filters = useMemo(() => ({
    status: status === 'ALL' ? undefined : status,
    category: category === 'ALL' ? undefined : category,
    priority: priority === 'ALL' ? undefined : priority,
    page: 1,
    limit: 50,
  }), [status, category, priority]);

  const summaryQuery = useQuery({
    queryKey: queryKeys.safety.reportSummary(),
    queryFn: getBookingReportSummary,
    refetchInterval: 60000,
  });

  const reportsQuery = useQuery({
    queryKey: queryKeys.safety.adminReports(filters),
    queryFn: () => getBookingReports(filters),
    refetchInterval: 30000,
  });

  const reports = reportsQuery.data?.reports || [];
  const summary = summaryQuery.data?.summary || {};

  const updateMutation = useMutation({
    mutationFn: ({ reportId, nextStatus, notes }) => updateBookingReportStatus(reportId, { status: nextStatus, adminNotes: notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.safety.adminReports(filters) });
      queryClient.invalidateQueries({ queryKey: queryKeys.safety.reportSummary() });
      setActionState(DEFAULT_ACTION);
      setAdminNotes('');
      toast.success(t('Report updated successfully.'));
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error?.response?.data?.error || t('Failed to update report'));
    },
  });

  const openAction = (report, nextStatus) => {
    setActionState({ report, status: nextStatus });
    setAdminNotes(report?.adminNotes || '');
  };

  const submitAction = () => {
    if (!actionState.report) return;
    updateMutation.mutate({
      reportId: actionState.report.id,
      nextStatus: actionState.status,
      notes: adminNotes,
    });
  };

  return (
    <MainLayout>
      <div className={`${getPageLayout('default')} module-canvas module-canvas--utility`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <PageHeader
            title="Booking Reports"
            subtitle="Review customer and worker complaints without crowding the rest of the admin workspace."
            className="mb-0"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              summaryQuery.refetch();
              reportsQuery.refetch();
            }}
            className={reportsQuery.isFetching ? 'opacity-50 cursor-wait' : ''}
            icon={RefreshCw}
          >
            {t('Refresh')}
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-1 space-y-4">
            <Card className="bg-brand-500 text-white border-none overflow-hidden relative">
              <div className="p-6 relative z-10">
                <p className="text-[10px] uppercase font-black opacity-80">Total Reports</p>
                <h3 className="text-4xl font-black mt-1">{summary.total || 0}</h3>
                <p className="text-xs mt-4 font-bold flex items-center gap-1 opacity-90">
                  <ShieldAlert size={14} /> Trust and safety queue
                </p>
              </div>
              <ShieldAlert size={120} className="absolute -right-4 -bottom-4 opacity-10 rotate-12" />
            </Card>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Open', value: summary.open || 0, icon: AlertTriangle, tone: 'error' },
                { label: 'Reviewing', value: summary.underReview || 0, icon: Clock3, tone: 'warning' },
                { label: 'Resolved', value: summary.resolved || 0, icon: CheckCircle2, tone: 'success' },
                { label: 'Dismissed', value: summary.dismissed || 0, icon: XCircle, tone: 'default' },
              ].map((item) => (
                <Card key={item.label} className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{item.label}</p>
                      <h4 className="text-2xl font-black mt-1">{item.value}</h4>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.tone === 'error' ? 'bg-red-50 text-red-600' : item.tone === 'warning' ? 'bg-amber-50 text-amber-600' : item.tone === 'success' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                      <item.icon size={18} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-4">
              <h4 className="font-black text-xs uppercase text-gray-400 mb-4 px-2">Filters</h4>
              <div className="space-y-3">
                <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
                  {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option === 'ALL' ? 'All' : option.replace(/_/g, ' ')}</option>)}
                </Select>
                <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORY_OPTIONS.map((option) => <option key={option} value={option}>{option === 'ALL' ? 'All' : option.replace(/_/g, ' ')}</option>)}
                </Select>
                <Select label="Priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
                  {PRIORITY_OPTIONS.map((option) => <option key={option} value={option}>{option === 'ALL' ? 'All' : option}</option>)}
                </Select>
              </div>

              <div className="mt-4 rounded-2xl border border-dashed border-gray-200 dark:border-dark-700 bg-gray-50/70 dark:bg-dark-900/40 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Hot categories</p>
                <div className="space-y-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                  {Object.entries(summary.byCategory || {}).slice(0, 6).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between gap-3">
                      <span>{key.replace(/_/g, ' ')}</span>
                      <span className="text-gray-400">{value}</span>
                    </div>
                  ))}
                  {Object.keys(summary.byCategory || {}).length === 0 && (
                    <p className="text-xs font-medium text-gray-400">No category data yet.</p>
                  )}
                </div>
              </div>
            </Card>
          </div>

          <div className="xl:col-span-3">
            <AsyncState
              isLoading={reportsQuery.isLoading || summaryQuery.isLoading}
              isError={reportsQuery.isError || summaryQuery.isError}
              error={reportsQuery.error || summaryQuery.error}
              onRetry={() => {
                summaryQuery.refetch();
                reportsQuery.refetch();
              }}
              isEmpty={!reportsQuery.isLoading && reports.length === 0}
              emptyTitle="No reports found"
              emptyMessage="There are no booking reports matching the current filters."
            >
              <AnimatePresence mode="popLayout">
                <div className="space-y-4">
                  {reports.map((report) => (
                    <Motion.div
                      key={report.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      className="rounded-3xl border border-gray-100 dark:border-dark-700 bg-white dark:bg-dark-800 p-5 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 dark:hover:shadow-none transition-shadow"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex-1 space-y-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={badgeVariant(report.status)} size="sm">{report.status.replace(/_/g, ' ')}</Badge>
                            <Badge variant={priorityVariant(report.priority)} size="sm">{report.priority}</Badge>
                            <Badge variant="outline" size="sm">{report.category.replace(/_/g, ' ')}</Badge>
                            <span className="text-xs font-bold text-gray-400">Booking #{report.bookingId}</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="rounded-2xl bg-gray-50 dark:bg-dark-900/40 border border-gray-100 dark:border-dark-700 p-4">
                              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Reporter</p>
                              <p className="font-bold text-gray-900 dark:text-white">{report.reporter?.name}</p>
                              <p className="text-xs text-gray-500">{report.reporter?.email}</p>
                            </div>
                            <div className="rounded-2xl bg-gray-50 dark:bg-dark-900/40 border border-gray-100 dark:border-dark-700 p-4">
                              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Reported user</p>
                              <p className="font-bold text-gray-900 dark:text-white">{report.reportedUser?.name}</p>
                              <p className="text-xs text-gray-500">{report.reportedRole} • {report.reportedUser?.email}</p>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-gray-100 dark:border-dark-700 bg-gray-50/70 dark:bg-dark-900/40 p-4 space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Booking details</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                  {report.booking?.service?.name || 'Booking'} • {formatDate(report.booking?.scheduledAt)}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{report.details}</p>
                            {report.evidenceUrl && (
                              <a href={report.evidenceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 break-all">
                                Evidence link
                              </a>
                            )}
                            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                              Submitted {formatDate(report.createdAt)}
                              {report.reviewedAt ? ` • Reviewed ${formatDate(report.reviewedAt)}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col gap-2 lg:w-40">
                          <Button variant="outline" size="sm" icon={Clock3} className="rounded-xl font-black" onClick={() => openAction(report, 'UNDER_REVIEW')}>
                            Review
                          </Button>
                          <Button variant="success" size="sm" icon={CheckCircle2} className="rounded-xl font-black" onClick={() => openAction(report, 'RESOLVED')}>
                            Resolve
                          </Button>
                          <Button variant="ghost" size="sm" icon={XCircle} className="rounded-xl font-black text-gray-500" onClick={() => openAction(report, 'DISMISSED')}>
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </Motion.div>
                  ))}
                </div>
              </AnimatePresence>
            </AsyncState>
          </div>
        </div>
      </div>

      <Modal
        isOpen={Boolean(actionState.report)}
        onClose={() => {
          setActionState(DEFAULT_ACTION);
          setAdminNotes('');
        }}
        title={actionState.report ? `Update report #${actionState.report.id}` : ''}
        size="lg"
      >
        {actionState.report && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900/60 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Action</p>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Set report #{actionState.report.id} to {actionState.status.replace(/_/g, ' ')}
              </p>
            </div>

            <Textarea
              label="Admin notes"
              rows={5}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add internal notes, findings, or resolution context"
              hint="Optional but recommended for resolved or dismissed reports."
            />
          </div>
        )}

        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setActionState(DEFAULT_ACTION);
              setAdminNotes('');
            }}
          >
            Cancel
          </Button>
          <Button
            variant={actionState.status === 'RESOLVED' ? 'success' : actionState.status === 'DISMISSED' ? 'ghost' : 'primary'}
            loading={updateMutation.isPending}
            onClick={submitAction}
          >
            Apply status
          </Button>
        </ModalFooter>
      </Modal>
    </MainLayout>
  );
}