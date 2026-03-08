import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Tag, Plus, Trash2, Power
} from 'lucide-react';
import { PageHeader, Card, Button, Badge, AsyncState } from '../../components/common';
import { MainLayout } from '../../components/layout/MainLayout';
import { getPageLayout } from '../../constants/layout';
import axiosInstance from '../../api/axiosConfig';
import { toast } from 'sonner';

export function AdminCouponsPage() {
    const queryClient = useQueryClient();
    const [isAdding, setIsAdding] = useState(false);

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['admin', 'coupons'],
        queryFn: async () => {
            const res = await axiosInstance.get('/admin/coupons');
            return res.data.coupons;
        }
    });

    const createMutation = useMutation({
        mutationFn: async (newCoupon) => {
            const res = await axiosInstance.post('/admin/coupons', newCoupon);
            return res.data;
        },
        onSuccess: () => {
            toast.success('Coupon created successfully!');
            queryClient.invalidateQueries(['admin', 'coupons']);
            setIsAdding(false);
        }
    });

    const toggleMutation = useMutation({
        mutationFn: async ({ id, isActive }) => {
            await axiosInstance.patch(`/admin/coupons/${id}/status`, { isActive });
        },
        onSuccess: () => {
            toast.success('Coupon status updated');
            queryClient.invalidateQueries(['admin', 'coupons']);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            await axiosInstance.delete(`/admin/coupons/${id}`);
        },
        onSuccess: () => {
            toast.success('Coupon deleted');
            queryClient.invalidateQueries(['admin', 'coupons']);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        createMutation.mutate({
            ...data,
            discountValue: parseFloat(data.discountValue),
            minOrderValue: data.minOrderValue ? parseFloat(data.minOrderValue) : null,
            maxDiscount: data.maxDiscount ? parseFloat(data.maxDiscount) : null,
            usageLimit: data.usageLimit ? parseInt(data.usageLimit) : null,
            firstTimeOnly: data.firstTimeOnly === 'on'
        });
    };

    return (
        <MainLayout>
            <div className={getPageLayout('default')}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <PageHeader
                        title="Coupons & Promotions"
                        subtitle="Create and manage discount codes for customers."
                        className="mb-0"
                    />
                    <Button
                        variant="primary"
                        icon={Plus}
                        onClick={() => setIsAdding(!isAdding)}
                    >
                        {isAdding ? 'Cancel' : 'New Coupon'}
                    </Button>
                </div>

                {isAdding && (
                    <Card className="mb-8 p-6">
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-gray-400">Coupon Code</label>
                                <input name="code" required placeholder="URBAN50" className="w-full h-12 px-4 rounded-xl border border-gray-100 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 font-bold uppercase" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-gray-400">Discount Type</label>
                                <select name="discountType" className="w-full h-12 px-4 rounded-xl border border-gray-100 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 font-bold">
                                    <option value="PERCENTAGE">Percentage (%)</option>
                                    <option value="FIXED">Fixed Amount (₹)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-gray-400">Value</label>
                                <input name="discountValue" required type="number" step="0.01" className="w-full h-12 px-4 rounded-xl border border-gray-100 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 font-bold" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-gray-400">Min Order Value (₹)</label>
                                <input name="minOrderValue" type="number" step="0.01" className="w-full h-12 px-4 rounded-xl border border-gray-100 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 font-bold" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-gray-400">Max Discount (₹)</label>
                                <input name="maxDiscount" type="number" step="0.01" className="w-full h-12 px-4 rounded-xl border border-gray-100 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 font-bold" />
                            </div>
                            <div className="flex items-center gap-2 pt-8">
                                <input type="checkbox" name="firstTimeOnly" id="firstTime" className="w-5 h-5 accent-brand-500" />
                                <label htmlFor="firstTime" className="text-sm font-bold">First Time User Only</label>
                            </div>
                            <div className="md:col-span-3 flex justify-end gap-2">
                                <Button type="submit" variant="primary" loading={createMutation.isPending}>
                                    Save Coupon
                                </Button>
                            </div>
                        </form>
                    </Card>
                )}

                <AsyncState
                    isLoading={isLoading}
                    isError={isError}
                    error={error}
                    onRetry={refetch}
                    isEmpty={!isLoading && data?.length === 0}
                    emptyTitle="No Coupons"
                    emptyMessage="You haven't created any promotional codes yet."
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data?.map((coupon) => (
                            <Card key={coupon.id} className="relative overflow-hidden group">
                                <div className={`absolute top-0 right-0 p-4`}>
                                    <Badge variant={coupon.isActive ? 'success' : 'neutral'}>
                                        {coupon.isActive ? 'ACTIVE' : 'INACTIVE'}
                                    </Badge>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                                            <Tag size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black">{coupon.code}</h3>
                                            <p className="text-xs text-gray-400 font-bold uppercase">
                                                {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} FLAT OFF`}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 py-4 border-y border-gray-50 dark:border-dark-800 my-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400 font-bold">MIN ORDER</span>
                                            <span className="font-black">₹{coupon.minOrderValue || 'None'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400 font-bold">USAGE</span>
                                            <span className="font-black">{coupon.usageCount} / {coupon.usageLimit || '∞'}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="grow"
                                            icon={Power}
                                            onClick={() => toggleMutation.mutate({ id: coupon.id, isActive: !coupon.isActive })}
                                        >
                                            {coupon.isActive ? 'Deactivate' : 'Activate'}
                                        </Button>
                                        <Button
                                            variant="error"
                                            size="sm"
                                            icon={Trash2}
                                            onClick={() => {
                                                if (window.confirm('Are you sure you want to delete this coupon?')) {
                                                    deleteMutation.mutate(coupon.id);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </AsyncState>
            </div>
        </MainLayout>
    );
}
