import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Wallet,
    TrendingUp,
    ArrowUpRight,
    ArrowDownLeft,
    Calendar,
    IndianRupee,
    Download,
    Filter,
    Search,
    CheckCircle2,
    Clock,
    AlertCircle
} from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import {
    PageHeader,
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    Button,
    Badge,
    StatCard,
    AsyncState,
    SimpleBarChart,
    Input
} from '../../components/common';
import { getMyPayments } from '../../api/payments';
import { getPageLayout } from '../../constants/layout';
import { queryKeys } from '../../utils/queryKeys';
import { usePageTitle } from '../../hooks/usePageTitle';
import { getBankDetails, requestInstantPayout, updateBankDetails, downloadWorkerReport } from '../../api/payouts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function WorkerEarningsPage() {
    usePageTitle('Earnings');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

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
            toast.success('Instant payout requested successfully!');
            refetchBank();
            queryClient.invalidateQueries({ queryKey: queryKeys.worker.payments() });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to request instant payout');
        }
    });

    const updateBankMutation = useMutation({
        mutationFn: updateBankDetails,
        onSuccess: () => {
            toast.success('Bank details linked successfully!');
            refetchBank();
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to link bank details');
        }
    });

    const payments = useMemo(() => data?.payments || [], [data?.payments]);

    const stats = useMemo(() => {
        const total = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
        const pending = payments
            .filter(p => p.status === 'PENDING')
            .reduce((sum, p) => sum + Number(p.amount || 0), 0);
        const completed = payments
            .filter(p => p.status === 'COMPLETED')
            .reduce((sum, p) => sum + Number(p.amount || 0), 0);

        return {
            total,
            pending,
            completed,
            walletBalance: bankData?.walletBalance || 0,
            count: payments.length
        };
    }, [payments, bankData]);

    const filteredPayments = useMemo(() => {
        return payments.filter(p => {
            const matchesSearch =
                p.booking?.service?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.id.toString().includes(searchTerm);

            const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [payments, searchTerm, statusFilter]);

    const chartData = useMemo(() => {
        // Group by month/day for chart
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d;
        });

        return last7Days.map(date => {
            const dateStr = date.toISOString().split('T')[0];
            const dailyTotal = payments
                .filter(p => p.createdAt?.startsWith(dateStr) && p.status === 'COMPLETED')
                .reduce((sum, p) => sum + Number(p.amount || 0), 0);

            return {
                label: date.toLocaleDateString('en-US', { weekday: 'short' }),
                value: dailyTotal,
                tooltip: `₹${dailyTotal}`
            };
        });
    }, [payments]);

    return (
        <MainLayout>
            <div className={getPageLayout('wide')}>
                <PageHeader
                    title="Earnings & Wallet"
                    subtitle="Track your income, view payment history, and manage payouts."
                    action={
                        <Button
                            icon={Download}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const m = new Date().getMonth() + 1;
                                const y = new Date().getFullYear();
                                toast.promise(downloadWorkerReport(m, y), {
                                    loading: 'Generating Monthly Tax Report...',
                                    success: 'ITR Report Downloaded Successfully',
                                    error: 'Failed to generate tax report'
                                });
                            }}
                        >
                            Export Statement (ITR)
                        </Button>
                    }
                />

                <AsyncState
                    isLoading={isLoading}
                    isError={isError}
                    error={error}
                    onRetry={refetch}
                >
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <StatCard
                                title="Total Revenue"
                                value={`₹${stats.total.toLocaleString()}`}
                                icon={Wallet}
                                color="brand"
                            />
                            <StatCard
                                title="Available for Payout"
                                value={`₹${Number(stats.walletBalance).toLocaleString()}`}
                                icon={TrendingUp}
                                color="success"
                            />
                            <StatCard
                                title="Pending Clearance"
                                value={`₹${stats.pending.toLocaleString()}`}
                                icon={Clock}
                                color="warning"
                            />
                            <StatCard
                                title="Total Transactions"
                                value={stats.count}
                                icon={ArrowUpRight}
                                color="info"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                            <div className="lg:col-span-2">
                                <SimpleBarChart
                                    title="Revenue Overview (Last 7 Days)"
                                    data={chartData}
                                    height="h-80"
                                />
                            </div>

                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle>Payout Method</CardTitle>
                                    <CardDescription>Where your money goes</CardDescription>
                                </CardHeader>
                                <div className="p-6 pt-0 space-y-4">
                                    <div className="p-4 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50 dark:border-brand-500/30 dark:bg-brand-500/5">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center">
                                                <IndianRupee size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">Payout Settings</p>
                                                <p className="text-xs opacity-70">
                                                    {bankData?.isLinked ? 'Linked with Razorpay Route' : 'Configure your payout method'}
                                                </p>
                                            </div>
                                        </div>
                                        {bankData?.isLinked ? (
                                            <>
                                                <p className="text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
                                                    Bank Account: {bankData.bankAccountNumber}
                                                </p>
                                                <p className="text-xs text-gray-500 mb-4">IFSC: {bankData.bankIfsc}</p>
                                                <Button
                                                    fullWidth
                                                    size="sm"
                                                    variant="outline"
                                                    isLoading={instantPayoutMutation.isPending}
                                                    onClick={() => instantPayoutMutation.mutate()}
                                                >
                                                    Instant Payout (2% Fee)
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-xs font-medium mb-4 text-gray-600 dark:text-gray-400">
                                                    No payout method configured yet.
                                                </p>
                                                <Button
                                                    fullWidth
                                                    size="sm"
                                                    variant="outline"
                                                    isLoading={updateBankMutation.isPending}
                                                    onClick={() => {
                                                        const acc = prompt('Enter Bank Account Number:');
                                                        const ifsc = prompt('Enter Bank IFSC:');
                                                        if (acc && ifsc) {
                                                            updateBankMutation.mutate({ bankAccountNumber: acc, bankIfsc: ifsc });
                                                        }
                                                    }}
                                                >
                                                    Set Up Payout
                                                </Button>
                                            </>
                                        )}
                                    </div>

                                    <div className="p-4 rounded-2xl border border-gray-100 dark:border-dark-700">
                                        <div className="flex items-center gap-2 mb-1 text-xs font-black uppercase tracking-wider text-gray-500">
                                            <AlertCircle size={14} />
                                            Next Payout
                                        </div>
                                        <p className="text-sm font-bold">Monday, Apr 10</p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Transactions Table */}
                        <Card>
                            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <CardTitle>Transaction History</CardTitle>
                                    <CardDescription>Detailed record of your earnings</CardDescription>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="w-64">
                                        <Input
                                            placeholder="Search jobs..."
                                            icon={Search}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="mb-0"
                                        />
                                    </div>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="px-4 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 bg-white border-gray-200 text-gray-900 focus:ring-brand-500/50 dark:bg-dark-800 dark:border-dark-700 dark:text-white"
                                    >
                                        <option value="ALL">All Status</option>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="PENDING">Pending</option>
                                        <option value="FAILED">Failed</option>
                                    </select>
                                </div>
                            </CardHeader>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-100 dark:border-dark-700">
                                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Transaction</th>
                                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Status</th>
                                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Date</th>
                                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-inherit">
                                        {filteredPayments.map((p) => (
                                            <tr key={p.id} className="group transition-colors hover:bg-gray-50/50 dark:hover:bg-dark-800/50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.status === 'COMPLETED'
                                                            ? 'bg-success-50 text-success-600 dark:bg-success-950/20 dark:text-success-500'
                                                            : 'bg-warning-50 text-warning-600 dark:bg-warning-950/20 dark:text-warning-500'
                                                            }`}>
                                                            {p.status === 'COMPLETED' ? <ArrowDownLeft size={18} /> : <Clock size={18} />}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                                {p.booking?.service?.name || 'Service Payment'}
                                                            </p>
                                                            <p className="text-xs text-gray-500">ID: #{p.id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant={p.status === 'COMPLETED' ? 'success' : 'warning'} size="sm" className="font-black uppercase text-[10px]">
                                                        {p.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                                        <Calendar size={14} />
                                                        {new Date(p.createdAt).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-base font-black text-gray-900 dark:text-white">
                                                        ₹{Number(p.amount).toLocaleString()}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredPayments.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-20 text-center">
                                                    <div className="max-w-xs mx-auto">
                                                        <Wallet size={40} className="mx-auto text-gray-300 opacity-20 mb-4" />
                                                        <p className="text-gray-400 font-medium">No transactions found matching your criteria.</p>
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
