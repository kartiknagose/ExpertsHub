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
  StatCard, AsyncState, SimpleBarChart, Input, Select
} from '../../components/common';
import { getMyPayments } from '../../api/payments';
import { getBankDetails, requestInstantPayout, updateBankDetails, downloadWorkerReport } from '../../api/payouts';
import { getPageLayout } from '../../constants/layout';
import { queryKeys } from '../../utils/queryKeys';
import { usePageTitle } from '../../hooks/usePageTitle';

export function WorkerEarningsPage() {
  const { t, i18n } = useTranslation();
  usePageTitle(t('Earnings'));
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

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
      toast.error(err.response?.data?.message || t('Failed to request instant payout'));
    }
  });

  const updateBankMutation = useMutation({
    mutationFn: updateBankDetails,
    onSuccess: () => {
      toast.success(t('Payout destination updated successfully!'));
      refetchBank();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || t('Failed to update payout destination'));
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

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    return last7Days.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      const dailyTotal = payments
        .filter(p => p.createdAt?.startsWith(dateStr) && p.status === 'PAID')
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);

      return {
        label: date.toLocaleDateString(i18n.language, { weekday: 'short' }),
        value: dailyTotal,
        tooltip: `₹${dailyTotal.toLocaleString()}`
      };
    });
  }, [payments, i18n.language]);

  const handleConfigurePayoutDestination = () => {
    const methodInput = window.prompt(
      `${t('Choose payout method:')}\n1. BANK\n2. UPI\n3. LINKED_ACCOUNT`,
      bankData?.payoutMethod || 'BANK'
    );

    if (!methodInput) return;

    const normalized = String(methodInput).trim().toUpperCase();
    const methodMap = { '1': 'BANK', '2': 'UPI', '3': 'LINKED_ACCOUNT' };
    const payoutMethod = methodMap[normalized] || normalized;

    if (!['BANK', 'UPI', 'LINKED_ACCOUNT'].includes(payoutMethod)) {
      toast.error(t('Invalid payout method.'));
      return;
    }

    if (payoutMethod === 'BANK') {
      const acc = window.prompt(t('Enter Bank Account Number:'), '');
      const ifsc = window.prompt(t('Enter Bank IFSC:'), '');
      const linkedAccountId = window.prompt(t('Enter Razorpay Linked Account ID (optional in test mode):'), '');
      if (!acc || !ifsc) return;

      updateBankMutation.mutate({
        payoutMethod,
        bankAccountNumber: acc,
        bankIfsc: ifsc,
        razorpayAccountId: linkedAccountId || undefined,
      });
      return;
    }

    if (payoutMethod === 'UPI') {
      const upiId = window.prompt(t('Enter UPI ID (example: name@okhdfcbank):'), '');
      const linkedAccountId = window.prompt(t('Enter Razorpay Linked Account ID (optional in test mode):'), '');
      if (!upiId) return;

      updateBankMutation.mutate({
        payoutMethod,
        upiId,
        razorpayAccountId: linkedAccountId || undefined,
      });
      return;
    }

    const linkedAccountId = window.prompt(t('Enter Razorpay Linked Account ID (acc_...):'), '');
    if (!linkedAccountId) return;
    updateBankMutation.mutate({ payoutMethod, razorpayAccountId: linkedAccountId });
  };

  return (
    <MainLayout>
      <div className={getPageLayout('wide')}>
        
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
                    isLoading={instantPayoutMutation.isPending}
                    disabled={!bankData?.isLinked && bankData?.payoutMode === 'LIVE'}
                    className="h-12 rounded-2xl font-bold uppercase tracking-widest text-xs"
                  >
                    {t('Redeem Now')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleConfigurePayoutDestination}
                    isLoading={updateBankMutation.isPending}
                    className="h-12 rounded-2xl font-bold uppercase tracking-widest text-xs"
                  >
                    {t('Change Payout Method')}
                  </Button>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-10">
              {/* Chart */}
              <div className="lg:col-span-2">
                <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <SimpleBarChart title={t("Revenue Overview (Last 7 Days)")} data={chartData} height="h-96" className="rounded-[2.5rem] shadow-2xl border-none" />
                </Motion.div>
              </div>

              {/* Payout Settings Card */}
              <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="h-full flex flex-col border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-dark-900">
                  <div className="p-8 pb-4 border-b border-neutral-100 dark:border-dark-800 bg-neutral-50/50 dark:bg-dark-950/50">
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white uppercase tracking-tight">{t('Payout Method')}</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">{t('Secure disbursement settings')}</p>
                  </div>
                  <div className="p-8 space-y-6 flex-1 flex flex-col">
                    
                    <div className="p-6 rounded-[2rem] border-2 border-dashed border-brand-200 dark:border-brand-500/30 bg-brand-50/30 dark:bg-brand-500/5 relative overflow-hidden group">
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                      <div className="flex items-center gap-5 mb-6 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-accent-600 text-white flex items-center justify-center shadow-xl shadow-brand-500/30 transform group-hover:rotate-6 transition-transform">
                          <IndianRupee size={28} />
                        </div>
                        <div>
                          <p className="font-bold text-lg text-neutral-900 dark:text-white">{t('Payout Destination')}</p>
                          <p className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
                            {bankData?.isLinked ? t('Active & Verified') : t('Action Required')}
                          </p>
                        </div>
                      </div>
                      
                      {bankData?.isLinked ? (
                        <div className="relative z-10">
                          <div className="bg-white/50 dark:bg-dark-950/50 p-4 rounded-xl border border-neutral-100 dark:border-dark-800 mb-6 shadow-inner">
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{t('Method')}</p>
                            <p className="text-sm font-bold tracking-[0.08em] text-neutral-900 dark:text-white font-mono">
                              {bankData?.payoutMethod || 'BANK'}
                            </p>
                            {bankData?.payoutMethod === 'BANK' && bankData?.bankAccountNumber && (
                              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-2">A/C: {bankData.bankAccountNumber} · IFSC: {bankData.bankIfsc}</p>
                            )}
                            {bankData?.payoutMethod === 'UPI' && bankData?.upiId && (
                              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-2">UPI: {bankData.upiId}</p>
                            )}
                          </div>
                          <Button
                            fullWidth
                            size="lg"
                            variant="primary"
                            isLoading={instantPayoutMutation.isPending}
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
                            isLoading={updateBankMutation.isPending}
                            onClick={handleConfigurePayoutDestination}
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
                    options={[
                      { value: 'ALL', label: t('All Status') },
                      { value: 'PAID', label: t('Paid') },
                      { value: 'PENDING', label: t('Pending') },
                      { value: 'FAILED', label: t('Failed') },
                      { value: 'REFUNDED', label: t('Refunded') },
                    ]}
                  />
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
    </MainLayout>
  );
}
