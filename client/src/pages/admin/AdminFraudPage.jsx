import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    ShieldAlert, UserX, AlertCircle,
    ExternalLink, RefreshCw, Ban
} from 'lucide-react';
import { PageHeader, Card, Button, Badge, AsyncState } from '../../components/common';
import { MainLayout } from '../../components/layout/MainLayout';
import { getPageLayout } from '../../constants/layout';
import { getFraudAlerts } from '../../api/admin';
import { usePageTitle } from '../../hooks/usePageTitle';
import { motion as Motion, AnimatePresence } from 'framer-motion';

export function AdminFraudPage() {
    usePageTitle('Fraud Detection');
    const [filter, setFilter] = useState('ALL');

    const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
        queryKey: ['admin', 'fraud-alerts'],
        queryFn: getFraudAlerts,
        refetchInterval: 60000,
    });

    const highCancellers = data?.highCancellers || [];
    const badWorkers = data?.badWorkers || [];

    const allAlerts = [
        ...highCancellers.map(a => ({ ...a, category: 'USER' })),
        ...badWorkers.map(a => ({ ...a, category: 'WORKER' }))
    ];

    const filtered = filter === 'ALL' ? allAlerts : allAlerts.filter(a => a.category === filter);

    return (
        <MainLayout>
            <div className={getPageLayout('default')}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <PageHeader
                        title="Fraud & Trust Safety"
                        subtitle="Monitor suspicious activities and maintain marketplace quality."
                        className="mb-0"
                    />
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetch()}
                            className={isFetching ? 'opacity-50 cursor-wait' : ''}
                        >
                            {isFetching ? <RefreshCw size={14} className="animate-spin mr-2" /> : <RefreshCw size={14} className="mr-2" />}
                            Refresh
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Stats Sidebar */}
                    <div className="lg:col-span-1 space-y-4">
                        <Card className="bg-brand-500 text-white border-none overflow-hidden relative">
                            <div className="p-6 relative z-10">
                                <p className="text-[10px] uppercase font-black opacity-80">Active Alerts</p>
                                <h3 className="text-4xl font-black mt-1">{allAlerts.length}</h3>
                                <p className="text-xs mt-4 font-bold flex items-center gap-1 opacity-90">
                                    <AlertCircle size={14} /> Critical Attention Required
                                </p>
                            </div>
                            <ShieldAlert size={120} className="absolute -right-4 -bottom-4 opacity-10 rotate-12" />
                        </Card>

                        <Card className="p-4">
                            <h4 className="font-black text-xs uppercase text-gray-400 mb-4 px-2">Filters</h4>
                            <div className="space-y-1">
                                {['ALL', 'USER', 'WORKER'].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-bold transition-all
                                            ${filter === f
                                                ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/20'
                                                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-800'}`}
                                    >
                                        {f === 'ALL' ? 'Show All' : f === 'USER' ? 'User Violations' : 'Worker Quality'}
                                        {filter === f && <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />}
                                    </button>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Alert List */}
                    <div className="lg:col-span-3">
                        <AsyncState
                            isLoading={isLoading}
                            isError={isError}
                            error={error}
                            onRetry={refetch}
                            isEmpty={!isLoading && filtered.length === 0}
                            emptyTitle="All Clear!"
                            emptyMessage="No suspicious fraud or quality alerts detected right now."
                        >
                            <AnimatePresence mode="popLayout">
                                <div className="space-y-4">
                                    {filtered.map((alert, idx) => (
                                        <Motion.div
                                            key={`${alert.type}-${idx}`}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="group relative rounded-2xl border border-gray-100 dark:border-dark-700 bg-white dark:bg-dark-800 p-5 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-none transition-all"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0
                                                        ${alert.severity === 'HIGH'
                                                            ? 'bg-red-100 text-red-600 dark:bg-red-900/20'
                                                            : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20'}`}>
                                                        {alert.type === 'VELOCITY_ALERT' ? <UserX size={24} /> : <ShieldAlert size={24} />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                                                                {alert.name}
                                                            </h4>
                                                            <Badge variant={alert.severity === 'HIGH' ? 'error' : 'warning'} size="sm">
                                                                {alert.type}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-gray-500 font-medium">{alert.email}</p>
                                                        <div className="mt-4 flex items-center gap-3">
                                                            <div className="px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-dark-900 border border-gray-100 dark:border-dark-700 text-xs font-black text-gray-600 dark:text-gray-400">
                                                                REASON: {alert.reason}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col sm:flex-row gap-2 h-fit opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="outline" size="sm" icon={ExternalLink}>
                                                        View Profile
                                                    </Button>
                                                    <Button variant="error" size="sm" icon={Ban}>
                                                        Suspend
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
        </MainLayout>
    );
}
