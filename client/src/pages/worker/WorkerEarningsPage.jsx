// WorkerEarningsPage - Premium dashboard for revenue & payouts

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion as Motion } from 'framer-motion';
import {
  Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft,
  Calendar, IndianRupee, Download, Search, Clock, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import { MainLayout } from '../../components/layout/MainLayout';
import {
  PageHeader, Card, Button, Badge,
  StatCard, AsyncState, Input, Select, Modal, ModalFooter
} from '../../components/common';
import { getMyPayments } from '../../api/payments';
import { getBankDetails, requestInstantPayout, updateBankDetails, downloadWorkerReport } from '../../api/payouts';
import { getPageLayout } from '../../constants/layout';
import { queryKeys } from '../../utils/queryKeys';
import { usePageTitle } from '../../hooks/usePageTitle';
import { toastErrorFromResponse } from '../../utils/notifications';

export function WorkerEarningsPage() {
  const { t, i18n } = useTranslation();
  usePageTitle(t('Earnings'));
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutForm, setPayoutForm] = useState({
    payoutMethod: 'BANK',
    bankAccountNumber: '',
    bankIfsc: '',
    upiId: '',
    razorpayAccountId: '',
  });

  const formatPaymentDate = (value) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString(i18n.language);
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.worker.payments(),
    queryFn: getMyPayments,
  });

  const { data: bankData, refetch: refetchBank } = useQuery({
    queryKey: ['bank-details'],
    queryFn: getBankDetails,
  });

  const queryClient = useQueryClient();

  const instantPayoutMutation = useMutation({
    mutationFn: requestInstantPayout,
    onSuccess: () => {
      toast.success(t('Instant payout requested successfully!'));
      refetchBank();
      queryClient.invalidateQueries({ queryKey: queryKeys.worker.payments() });
    },
    onError: (err) => {
      toastErrorFromResponse(err, t('Failed to request instant payout'));
    }
  });

  const updateBankMutation = useMutation({
    mutationFn: updateBankDetails,
    onSuccess: () => {
      toast.success(t('Payout destination updated successfully!'));
      refetchBank();
      setIsPayoutModalOpen(false);
    },
    onError: (err) => {
      toastErrorFromResponse(err, t('Failed to update payout destination'));
    }
  });

  const payments = useMemo(() => data?.payments || [], [data?.payments]);

  const stats = useMemo(() => {
    const total = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const pending = payments
      .filter(p => p.status === 'PENDING')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const paid = payments
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    return {
      total, pending, paid,
      walletBalance: bankData?.walletBalance || 0,
      count: payments.length
    };
  }, [payments, bankData]);

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const serviceName = p.booking?.service?.name || '';
      const paymentIdText = String(p.id || '');
      const matchesSearch =
        serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paymentIdText.includes(searchTerm);
      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payments, searchTerm, statusFilter]);

  const earningsInsights = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const paidLast7Days = payments.filter((p) => {
      if (p.status !== 'PAID' || !p.createdAt) return false;
      const createdAt = new Date(p.createdAt);
      return Number.isFinite(createdAt.getTime()) && createdAt >= sevenDaysAgo;
    });

    const paidAmountLast7Days = paidLast7Days.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const avgPaidTicket = paidLast7Days.length ? paidAmountLast7Days / paidLast7Days.length : 0;

    return {
      paidLast7DaysCount: paidLast7Days.length,
      paidAmountLast7Days,
      avgPaidTicket,
    };
  }, [payments]);

  const payoutReadiness = useMemo(() => {
    const blockers = [];

    if (!bankData?.payoutMethod) {
      blockers.push(t('Set a payout method before withdrawing.'));
    }

    if (Number(stats.walletBalance || 0) < 100) {
      blockers.push(t('Minimum instant withdrawal is ₹100.'));
    }

    if (bankData?.payoutMode === 'LIVE' && !bankData?.isLinked) {
      blockers.push(t('Live mode requires linked Razorpay account (acc_...).'));
    }

    return {
      isReady: blockers.length === 0,
      blockers,
    };
  }, [bankData?.payoutMethod, bankData?.payoutMode, bankData?.isLinked, stats.walletBalance, t]);

  const openPayoutModal = () => {
    setPayoutForm({
      payoutMethod: bankData?.payoutMethod || 'BANK',
      bankAccountNumber: '',
      bankIfsc: '',
      upiId: '',
      razorpayAccountId: bankData?.razorpayAccountId || '',
    });
    setIsPayoutModalOpen(true);
  };

  const submitPayoutDestination = () => {
    const method = String(payoutForm.payoutMethod || 'BANK').toUpperCase();

    if (method === 'BANK' && (!payoutForm.bankAccountNumber || !payoutForm.bankIfsc)) {
      toast.error(t('Bank account number and IFSC are required for BANK payout method.'));
      return;
    }

    if (method === 'UPI' && !payoutForm.upiId) {
      toast.error(t('UPI ID is required for UPI payout method.'));
      return;
    }

    if (method === 'LINKED_ACCOUNT' && !payoutForm.razorpayAccountId) {
      toast.error(t('Razorpay account ID is required for linked-account payouts.'));
      return;
    }

    const payload = {
      payoutMethod: method,
      razorpayAccountId: payoutForm.razorpayAccountId || undefined,
    };

    if (method === 'BANK') {
      payload.bankAccountNumber = payoutForm.bankAccountNumber;
      payload.bankIfsc = payoutForm.bankIfsc;
    }

    if (method === 'UPI') {
      payload.upiId = payoutForm.upiId;
    }

    updateBankMutation.mutate(payload);
  };

  return (
    <MainLayout>
      <div className={`${getPageLayout('wide')} module-canvas module-canvas--profile`}>
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <Motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-500 mb-2 block">{t('Financial Suite')}</span>
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white leading-tight">
              {t('Earnings & Wallet')}
            </h1>
          </Motion.div>

          <Motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <Button
              icon={Download}
              variant="outline"
              size="lg"
              className="px-8 h-14 bg-white dark:bg-dark-900 shadow-xl shadow-brand-500/5 rounded-2xl border-2 hover:border-brand-500 transition-all font-bold"
              onClick={() => {
                const m = new Date().getMonth() + 1;
                const y = new Date().getFullYear();
                toast.promise(downloadWorkerReport(m, y), {
                  loading: t('Generating Monthly Tax Report...'),
                  success: t('ITR Report Downloaded Successfully'),
                  error: t('Failed to generate tax report')
                });
              }}
            >
              {t('Export Statement')}
            </Button>
          </Motion.div>
        </div>

        <AsyncState
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={refetch}
        >
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <StatCard title={t("Total Revenue")}        value={`₹${stats.total.toLocaleString()}`}             icon={Wallet}       color="brand" delay={0} className="shadow-2xl shadow-brand-500/10 rounded-[2rem] border-none" />
              <StatCard title={t("Available for Payout")} value={`₹${Number(stats.walletBalance).toLocaleString()}`} icon={TrendingUp}   color="success" delay={1} className="shadow-2xl shadow-success-500/10 rounded-[2rem] border-none" />
              <StatCard title={t("Pending Clearance")}    value={`₹${stats.pending.toLocaleString()}`}           icon={Clock}        color="warning" delay={2} className="shadow-2xl shadow-warning-500/10 rounded-[2rem] border-none" />
              <StatCard title={t("Total Transactions")}   value={stats.count}                                    icon={ArrowUpRight} color="brand" delay={3} className="shadow-2xl shadow-brand-500/10 rounded-[2rem] border-none" />
            </div>

            <Card className="mb-10 border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
              <div className="p-8 border-b border-neutral-100 dark:border-dark-800 bg-neutral-50/30 dark:bg-dark-900/50">
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white uppercase tracking-tight">{t('Worker Wallet')}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">{t('Redeem your earned balance securely via Razorpay payouts.')}</p>
              </div>
              <div className="p-8 grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">{t('Redeemable Earnings')}</p>
                  <p className="mt-2 text-4xl font-black tracking-tight text-neutral-900 dark:text-white">₹{Number(stats.walletBalance || 0).toLocaleString()}</p>
                  <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                    {t('Payout Method')}: <span className="font-bold text-neutral-700 dark:text-neutral-200">{bankData?.payoutMethod || 'BANK'}</span>
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => instantPayoutMutation.mutate()}
                    loading={instantPayoutMutation.isPending}
                    disabled={!bankData?.isLinked && bankData?.payoutMode === 'LIVE'}
                    className="h-12 rounded-2xl font-bold uppercase tracking-widest text-xs"
                  >
                    {t('Redeem Now')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={openPayoutModal}
                    loading={updateBankMutation.isPending}
                    className="h-12 rounded-2xl font-bold uppercase tracking-widest text-xs"
                  >
                    {t('Change Payout Method')}
                  </Button>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
              {/* Insights */}
              <div className="xl:col-span-2">
                <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="rounded-[2.5rem] shadow-2xl border-none h-full">
                    <div className="p-8 border-b border-neutral-100 dark:border-dark-800 bg-neutral-50/40 dark:bg-dark-900/40">
                      <h3 className="text-2xl font-bold text-neutral-900 dark:text-white uppercase tracking-tight">{t('Earnings Insights')}</h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">{t('Actionable payout and revenue summary for your worker account.')}</p>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="rounded-2xl border border-neutral-200 dark:border-dark-700 p-5 bg-white dark:bg-dark-900">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">{t('Paid Revenue (7d)')}</p>
                        <p className="mt-2 text-2xl font-black text-neutral-900 dark:text-white">₹{earningsInsights.paidAmountLast7Days.toLocaleString()}</p>
                      </div>
                      <div className="rounded-2xl border border-neutral-200 dark:border-dark-700 p-5 bg-white dark:bg-dark-900">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">{t('Paid Transactions (7d)')}</p>
                        <p className="mt-2 text-2xl font-black text-neutral-900 dark:text-white">{earningsInsights.paidLast7DaysCount}</p>
                      </div>
                      <div className="rounded-2xl border border-neutral-200 dark:border-dark-700 p-5 bg-white dark:bg-dark-900">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">{t('Avg Ticket (7d)')}</p>
                        <p className="mt-2 text-2xl font-black text-neutral-900 dark:text-white">₹{Math.round(earningsInsights.avgPaidTicket).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="px-8 pb-8">
                      <div className={`rounded-2xl p-5 border ${payoutReadiness.isReady ? 'border-success-200 bg-success-50/60 dark:border-success-500/30 dark:bg-success-500/10' : 'border-warning-200 bg-warning-50/60 dark:border-warning-500/30 dark:bg-warning-500/10'}`}>
                        <p className="text-sm font-bold text-neutral-900 dark:text-white mb-2">
                          {payoutReadiness.isReady ? t('Payout Ready') : t('Payout Setup Needed')}
                        </p>
                        {payoutReadiness.isReady ? (
                          <p className="text-sm text-neutral-600 dark:text-neutral-300">{t('Your account is ready for instant withdrawal.')}</p>
                        ) : (
                          <div className="space-y-1.5">
                            {payoutReadiness.blockers.map((item) => (
                              <p key={item} className="text-sm text-neutral-600 dark:text-neutral-300 flex items-start gap-2">
                                <AlertCircle size={14} className="mt-0.5 shrink-0" /> {item}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </Motion.div>
              </div>

              {/* Payout Settings Card */}
              <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="h-full flex flex-col border-none shadow-2xl rounded-[2rem] lg:rounded-[2.25rem] overflow-hidden bg-white dark:bg-dark-900 min-w-0">
                  <div className="p-8 pb-4 border-b border-neutral-100 dark:border-dark-800 bg-neutral-50/50 dark:bg-dark-950/50">
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white uppercase tracking-tight">{t('Payout Method')}</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">{t('Secure disbursement settings')}</p>
                  </div>
                  <div className="p-6 lg:p-8 space-y-5 flex-1 flex flex-col min-w-0">
                    
                    <div className="p-5 lg:p-6 rounded-[1.5rem] lg:rounded-[2rem] border-2 border-dashed border-brand-200 dark:border-brand-500/30 bg-brand-50/30 dark:bg-brand-500/5 relative overflow-hidden group min-w-0">
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                      <div className="flex items-center gap-4 mb-5 relative z-10 min-w-0">
                        <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-accent-600 text-white flex items-center justify-center shadow-xl shadow-brand-500/30 transform group-hover:rotate-6 transition-transform shrink-0">
                          <IndianRupee size={28} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-base lg:text-lg text-neutral-900 dark:text-white truncate">{t('Payout Destination')}</p>
                          <p className="text-[10px] lg:text-xs font-bold uppercase tracking-[0.14em] lg:tracking-widest text-brand-600 dark:text-brand-400">
                            {bankData?.isLinked ? t('Active & Verified') : t('Action Required')}
                          </p>
                        </div>
                      </div>
                      
                      {bankData?.isLinked ? (
                        <div className="relative z-10">
                          <div className="bg-white/50 dark:bg-dark-950/50 p-4 rounded-xl border border-neutral-100 dark:border-dark-800 mb-6 shadow-inner min-w-0">
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{t('Method')}</p>
                            <p className="text-sm font-bold tracking-[0.03em] text-neutral-900 dark:text-white font-mono break-words">
                              {bankData?.payoutMethod || 'BANK'}
                            </p>
                            {bankData?.payoutMethod === 'BANK' && bankData?.bankAccountNumber && (
                              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.12em] mt-2 break-all">
                                A/C: {bankData.bankAccountNumber}
                                <br />
                                IFSC: {bankData.bankIfsc}
                              </p>
                            )}
                            {bankData?.payoutMethod === 'UPI' && bankData?.upiId && (
                              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.12em] mt-2 break-all">UPI: {bankData.upiId}</p>
                            )}
                          </div>
                          <Button
                            fullWidth
                            size="lg"
                            variant="primary"
                            loading={instantPayoutMutation.isPending}
                            onClick={() => instantPayoutMutation.mutate()}
                            className="h-14 shadow-brand-md rounded-2xl font-bold uppercase tracking-widest text-xs"
                          >
                            {t('Instant Withdrawal')}
                          </Button>
                          <p className="text-[10px] text-center text-neutral-400 mt-3 font-bold uppercase tracking-widest">2% Processing Fee applies</p>
                          {bankData?.payoutMode && (
                            <p className="text-[10px] text-center text-neutral-400 mt-2 font-bold uppercase tracking-widest">
                              Mode: {bankData.payoutMode}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="relative z-10">
                          <p className="text-sm font-medium mb-6 text-neutral-500 leading-relaxed italic">
                            {t('Configure BANK, UPI, or LINKED_ACCOUNT for Razorpay payouts.')}
                          </p>
                          <Button
                            fullWidth
                            size="lg"
                            variant="primary"
                            loading={updateBankMutation.isPending}
                            onClick={openPayoutModal}
                            className="h-14 shadow-brand-md rounded-2xl font-bold uppercase tracking-widest text-xs"
                          >
                            {t('Setup Payout Method')}
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="p-5 rounded-2xl border border-neutral-100 dark:border-dark-800 bg-neutral-50 dark:bg-dark-800/20 shadow-inner">
                      <div className="flex items-center gap-3 mb-2 text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
                        <Calendar size={14} className="text-brand-500" />
                        {t('Scheduled Payment')}
                      </div>
                      <p className="text-base font-bold text-neutral-900 dark:text-white">{t('Every Monday Morning')}</p>
                    </div>

                  </div>
                </Card>
              </Motion.div>
            </div>

            {/* Transactions Table */}
            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
              <div className="p-8 border-b border-neutral-100 dark:border-dark-800 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-neutral-50/30 dark:bg-dark-900/50">
                <div>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white uppercase tracking-tight">{t('Transaction Ledger')}</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">{t('Full audit history of your revenue stream.')}</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="w-full md:w-72">
                    <Input
                      icon={Search}
                      placeholder={t("Filter by ID or Service...")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="shadow-inner"
                    />
                  </div>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full md:w-48 h-12 rounded-2xl font-bold text-xs uppercase tracking-widest"
                  >
                    <option value="ALL">{t('All Status')}</option>
                    <option value="PAID">{t('Paid')}</option>
                    <option value="PENDING">{t('Pending')}</option>
                    <option value="FAILED">{t('Failed')}</option>
                    <option value="REFUNDED">{t('Refunded')}</option>
                  </Select>
                </div>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-50/80 dark:bg-dark-950/50 border-b border-neutral-100 dark:border-dark-800">
                      <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">{t('Transaction Flow')}</th>
                      <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">{t('Verification')}</th>
                      <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">{t('Timestamp')}</th>
                      <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 text-right">{t('Value')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-dark-800">
                    {filteredPayments.map((p) => (
                      <tr key={p.id} className="group transition-all duration-300 hover:bg-neutral-50/50 dark:hover:bg-dark-950/50">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-5">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110
                              ${p.status === 'PAID'
                                ? 'bg-success-100 text-success-600 dark:bg-success-500/20 dark:text-success-400 shadow-success-500/10'
                                : 'bg-warning-100 text-warning-600 dark:bg-warning-500/20 dark:text-warning-400 shadow-warning-500/10'
                              }`}>
                              {p.status === 'PAID' ? <ArrowDownLeft size={24} strokeWidth={2.5} /> : <Clock size={24} strokeWidth={2.5} />}
                            </div>
                            <div>
                              <p className="text-base font-bold text-neutral-900 dark:text-white leading-tight uppercase tracking-tight">
                                {p.booking?.service?.name || t('Service Revenue')}
                              </p>
                              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 mt-1.5 font-mono">ID: {String(p.id || '').slice(-8).toUpperCase() || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <Badge variant={p.status === 'PAID' ? 'success' : 'warning'} size="sm" className="font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm">
                            {t(p.status)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 dark:text-neutral-400">
                            <Calendar size={14} />
                            {formatPaymentDate(p.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-base font-black text-neutral-900 dark:text-white tracking-tight">
                            ₹{Number(p.amount).toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredPayments.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-24 text-center">
                          <div className="max-w-xs mx-auto">
                            <div className="w-16 h-16 rounded-3xl bg-neutral-100 dark:bg-dark-800/50 flex items-center justify-center mx-auto mb-4 border border-neutral-200 dark:border-dark-700">
                              <Wallet size={32} className="text-neutral-400" />
                            </div>
                            <p className="font-bold text-neutral-900 dark:text-white mb-1">{t('No transactions found')}</p>
                            <p className="text-sm text-neutral-500">{t('Try adjusting your filters or complete more jobs.')}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

          </>
        </AsyncState>
      </div>

      <Modal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        title={t('Configure Payout Method')}
        size="md"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
              {t('Payout Method')}
            </label>
            <select
              value={payoutForm.payoutMethod}
              onChange={(e) => setPayoutForm((prev) => ({ ...prev, payoutMethod: e.target.value }))}
              className="w-full h-14 rounded-2xl border border-neutral-200 dark:border-dark-700 bg-white dark:bg-dark-900 px-4 text-sm font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            >
              {(bankData?.availableMethods || ['BANK', 'UPI', 'LINKED_ACCOUNT']).map((method) => (
                <option key={method} value={method}>
                  {t(method)}
                </option>
              ))}
            </select>
          </div>

          {payoutForm.payoutMethod === 'BANK' && (
            <>
              <Input
                label={t('Bank Account Number')}
                value={payoutForm.bankAccountNumber}
                onChange={(e) => setPayoutForm((prev) => ({ ...prev, bankAccountNumber: e.target.value }))}
                placeholder={t('Enter 9-18 digit account number')}
              />
              <Input
                label={t('IFSC')}
                value={payoutForm.bankIfsc}
                onChange={(e) => setPayoutForm((prev) => ({ ...prev, bankIfsc: e.target.value.toUpperCase() }))}
                placeholder={t('Enter valid IFSC (e.g. HDFC0001234)')}
              />
            </>
          )}

          {payoutForm.payoutMethod === 'UPI' && (
            <Input
              label={t('UPI ID')}
              value={payoutForm.upiId}
              onChange={(e) => setPayoutForm((prev) => ({ ...prev, upiId: e.target.value }))}
              placeholder={t('name@okhdfcbank')}
            />
          )}

          <Input
            label={t('Razorpay Account ID (optional in test mode)')}
            value={payoutForm.razorpayAccountId}
            onChange={(e) => setPayoutForm((prev) => ({ ...prev, razorpayAccountId: e.target.value }))}
            placeholder={t('acc_...')}
          />
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsPayoutModalOpen(false)}>
            {t('Cancel')}
          </Button>
          <Button loading={updateBankMutation.isPending} onClick={submitPayoutDestination}>
            {t('Save Payout Method')}
          </Button>
        </ModalFooter>
      </Modal>
    </MainLayout>
  );
}
