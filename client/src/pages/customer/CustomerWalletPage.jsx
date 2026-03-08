import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion as Motion } from 'framer-motion';
import {
    Wallet, TrendingUp, TrendingDown,
    Clock, DollarSign, ArrowUpRight, ArrowDownLeft, AlertCircle, Plus
} from 'lucide-react';
import { PageHeader, Card, Button, Badge, AsyncState, AsyncProgress } from '../../components/common';
import { MainLayout } from '../../components/layout/MainLayout';
import { getPageLayout } from '../../constants/layout';
import { format } from 'date-fns';
import { getWallet, addCredits } from '../../api/growth';
import { toast } from 'sonner';

export function CustomerWalletPage() {
    const queryClient = useQueryClient();

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['customer', 'wallet'],
        queryFn: getWallet
    });

    const addMutation = useMutation({
        mutationFn: (amount) => addCredits({ amount, description: 'Direct Top-up' }),
        onSuccess: () => {
            toast.success('Funds added successfully!');
            queryClient.invalidateQueries(['customer', 'wallet']);
        },
        onError: (err) => {
            toast.error(err.response?.data?.error || 'Failed to add funds');
        }
    });

    const handleAddDemoCredits = () => {
        const amount = window.prompt('Enter amount to deposit (Demo Mode):', '500');
        if (amount && !isNaN(amount)) {
            addMutation.mutate(parseFloat(amount));
        }
    };

    return (
        <MainLayout>
            <div className={getPageLayout('default')}>
                <PageHeader
                    title="My Wallet"
                    subtitle="Manage your platform credits and transaction history."
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Balanced Card */}
                    <div className="lg:col-span-1">
                        <Card className="bg-gradient-to-br from-brand-600 to-brand-800 text-white p-8 border-none sticky top-24">
                            <div className="flex items-center gap-3 mb-8 opacity-90">
                                <div className="p-2 rounded-xl bg-white/10">
                                    <Wallet size={20} />
                                </div>
                                <span className="font-bold uppercase tracking-widest text-xs">Total Balance</span>
                            </div>

                            <div className="mb-10">
                                <span className="text-xl font-bold opacity-80 mr-1">₹</span>
                                <span className="text-6xl font-black">{data?.balance || '0.00'}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    variant="secondary"
                                    icon={Plus}
                                    loading={addMutation.isPending}
                                    onClick={handleAddDemoCredits}
                                    className="bg-white text-brand-700 hover:bg-white/90 border-none font-black text-xs uppercase h-12"
                                >
                                    Add Credits
                                </Button>
                                <Button
                                    variant="outline"
                                    className="text-white border-white/20 hover:bg-white/10 font-black text-xs uppercase h-12"
                                    onClick={() => toast.info('Detailed statements feature coming soon')}
                                >
                                    Statements
                                </Button>
                            </div>
                        </Card>

                        <div className="mt-8 p-6 rounded-3xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                            <h4 className="flex items-center gap-2 font-black text-amber-700 dark:text-amber-500 mb-2">
                                <AlertCircle size={18} />
                                Safe Escrow
                            </h4>
                            <p className="text-xs text-amber-600/80 font-bold leading-relaxed">
                                Your wallet funds are held securely in escrow until jobs are verified via OTP. Refunds are processed instantly to your wallet.
                            </p>
                        </div>
                    </div>

                    {/* Transactions List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-black">Transaction History</h3>
                            <Badge variant="neutral">Last 50 Records</Badge>
                        </div>

                        <AsyncState
                            isLoading={isLoading}
                            isError={isError}
                            error={error}
                            onRetry={refetch}
                            isEmpty={!isLoading && data?.transactions?.length === 0}
                            emptyTitle="No transactions yet"
                            emptyMessage="Your wallet history will appear here once you start using credits."
                        >
                            <div className="space-y-3">
                                {data?.transactions?.map((tx) => (
                                    <Motion.div
                                        key={tx.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="bg-white dark:bg-dark-800 p-5 rounded-2xl border border-gray-100 dark:border-dark-700 flex items-center justify-between group hover:shadow-xl hover:shadow-gray-100/50 dark:hover:shadow-none transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0
                                                ${parseFloat(tx.amount) >= 0
                                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'
                                                    : 'bg-red-50 text-red-600 dark:bg-red-900/20'}`}>
                                                {parseFloat(tx.amount) >= 0 ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                                                    {tx.description}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-black p-1 px-1.5 rounded-md bg-gray-50 dark:bg-dark-900 text-gray-400 uppercase tracking-widest">{tx.type}</span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-200" />
                                                    <span className="text-[10px] font-extrabold text-gray-400">{format(new Date(tx.createdAt), 'MMM dd, yyyy · p')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className={`text-lg font-black ${parseFloat(tx.amount) >= 0 ? 'text-emerald-600' : 'text-gray-900 dark:text-white'}`}>
                                                {parseFloat(tx.amount) >= 0 ? '+' : ''}₹{Math.abs(tx.amount)}
                                            </div>
                                            <Badge size="xs" variant={tx.status === 'COMPLETED' ? 'success' : 'warning'}>
                                                {tx.status}
                                            </Badge>
                                        </div>
                                    </Motion.div>
                                ))}
                            </div>
                        </AsyncState>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
