import { CheckCircle, PlayCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/common';

export function WorkerDesktopActions({ booking, statusMutation, openOtpModal, openCancelModal }) {
    if (booking.status === 'PENDING') {
        return (
            <>
                <Button
                    size="md"
                    icon={CheckCircle}
                    onClick={() => statusMutation.mutate({ status: 'CONFIRMED' })}
                    loading={statusMutation.isPending}
                    className="bg-brand-600 hover:bg-brand-700 text-white shadow-lg px-6 h-12 rounded-xl font-bold"
                >
                    Accept Job
                </Button>
                <Button
                    size="md"
                    variant="ghost"
                    icon={XCircle}
                    onClick={openCancelModal}
                    className="text-error-500 hover:bg-error-50 h-12 px-6 rounded-xl font-bold"
                >
                    Reject
                </Button>
            </>
        );
    }
    if (booking.status === 'CONFIRMED') {
        return (
            <>
                <Button
                    size="md"
                    icon={PlayCircle}
                    onClick={() => openOtpModal('start')}
                    className="bg-brand-600 hover:bg-brand-700 text-white shadow-lg px-6 h-12 rounded-xl font-bold"
                >
                    Start Job
                </Button>
                <Button
                    size="md"
                    variant="ghost"
                    icon={XCircle}
                    onClick={openCancelModal}
                    className="text-error-500 hover:bg-error-50 h-12 px-6 rounded-xl font-bold"
                >
                    Cancel Job
                </Button>
            </>
        );
    }
    if (booking.status === 'IN_PROGRESS') {
        return (
            <Button
                size="md"
                icon={CheckCircle}
                onClick={() => openOtpModal('complete')}
                className="bg-green-600 hover:bg-green-700 text-white shadow-lg px-6 h-12 rounded-xl font-bold"
            >
                Complete Job
            </Button>
        );
    }
    return null;
}

export function WorkerMobileActions({ booking, statusMutation, openOtpModal, openCancelModal, onBack }) {
    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-4 pb-8 border-t backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] bg-white/80 border-gray-100 dark:bg-dark-900/80 dark:border-dark-700">
            <div className="flex gap-3">
                {booking.status === 'PENDING' && (
                    <>
                        <Button
                            fullWidth
                            size="lg"
                            icon={CheckCircle}
                            onClick={() => statusMutation.mutate({ status: 'CONFIRMED' })}
                            loading={statusMutation.isPending}
                            className="bg-brand-600 text-white rounded-2xl font-black h-14"
                        >
                            Accept
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={openCancelModal}
                            className="text-error-500 font-black px-4"
                        >
                            Reject
                        </Button>
                    </>
                )}
                {booking.status === 'CONFIRMED' && (
                    <>
                        <Button
                            fullWidth
                            size="lg"
                            icon={PlayCircle}
                            onClick={() => openOtpModal('start')}
                            className="bg-brand-600 text-white rounded-2xl font-black h-14"
                        >
                            Start Job
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={openCancelModal}
                            className="text-error-500 font-black px-4"
                        >
                            Cancel
                        </Button>
                    </>
                )}
                {booking.status === 'IN_PROGRESS' && (
                    <div className="flex flex-col w-full gap-3">
                        <Button
                            fullWidth
                            size="lg"
                            icon={CheckCircle}
                            onClick={() => openOtpModal('complete')}
                            className="bg-green-600 text-white rounded-2xl font-black h-14 shadow-lg shadow-green-500/20"
                        >
                            Finish Job
                        </Button>
                    </div>
                )}
                {['COMPLETED', 'CANCELLED', 'REJECTED'].includes(booking.status) && (
                    <Button
                        fullWidth
                        variant="ghost"
                        onClick={onBack}
                        className="text-gray-500 font-black h-14"
                        icon={ArrowLeft}
                    >
                        Back to Dashboard
                    </Button>
                )}
            </div>
        </div>
    );
}
