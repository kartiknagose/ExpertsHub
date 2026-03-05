import { ArrowLeft, CreditCard } from 'lucide-react';
import { Button } from '../../../components/common';

export function CustomerMobileActions({ booking, navigate, payMutation, onCancelOpen }) {
    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-4 pb-8 border-t backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] bg-white/80 border-gray-100 dark:bg-dark-900/80 dark:border-dark-700">
            <div className="flex gap-3">
                {booking.status === 'COMPLETED' && booking.paymentStatus !== 'PAID' ? (
                    <Button
                        fullWidth
                        size="lg"
                        icon={CreditCard}
                        onClick={() => payMutation.mutate()}
                        loading={payMutation.isPending}
                        className="bg-brand-600 text-white rounded-2xl font-black h-14"
                    >
                        Pay Now
                    </Button>
                ) : ['PENDING', 'CONFIRMED'].includes(booking.status) ? (
                    <>
                        <Button
                            fullWidth
                            size="lg"
                            variant="outline"
                            onClick={() => navigate('/services')}
                            className="border-gray-200 dark:border-dark-700 text-gray-600 dark:text-gray-300 rounded-2xl font-black h-14"
                        >
                            Modify
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={onCancelOpen}
                            className="text-error-500 font-black px-6"
                        >
                            Cancel
                        </Button>
                    </>
                ) : booking.status === 'IN_PROGRESS' ? (
                    <div className="flex flex-col w-full gap-3">
                        <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-xl flex items-center justify-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                            <span className="text-2xs font-black uppercase text-brand-600 tracking-widest">Service in Progress</span>
                        </div>
                    </div>
                ) : (
                    <Button
                        fullWidth
                        variant="ghost"
                        onClick={() => navigate('/dashboard')}
                        className="text-gray-500 font-black h-14"
                        icon={ArrowLeft}
                    >
                        Back to Home
                    </Button>
                )}
            </div>
        </div>
    );
}
