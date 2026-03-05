import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
    Briefcase,
    ArrowLeft,
    XCircle,
    ShieldAlert,
    CreditCard,
    Compass,
} from 'lucide-react';

import { MainLayout } from '../../components/layout/MainLayout';
import { Card, Button, AsyncState } from '../../components/common';
import { BookingStatusBadge } from '../../components/common';
import { getBookingById, payBooking } from '../../api/bookings';
import { getWorkerLocation } from '../../api/location';
import { queryKeys } from '../../utils/queryKeys';
import { getPaymentDisplayText } from '../../utils/statusHelpers';
import { CancellationModal } from '../../components/features/bookings/CancellationModal';
import { BookingSessionsTimeline } from '../../components/features/bookings/BookingSessionsTimeline';
import { LiveTrackingMap } from '../../components/features/location/LiveTrackingMap';
import { createReview } from '../../api/reviews';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';
import { useSocketEvent } from '../../hooks/useSocket';
import { getPageLayout } from '../../constants/layout';
import { BookingDetailsGrid } from './components/BookingDetailsGrid';
import { CustomerWorkerSection } from './components/CustomerWorkerSection';
import { CustomerOTPSection } from './components/CustomerOTPSection';
import { CustomerMobileActions } from './components/CustomerMobileActions';

export function CustomerBookingDetailPage() {
    const { id: bookingId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [workerLocation, setWorkerLocation] = useState(null);
    const [activeReview, setActiveReview] = useState({ rating: 0, comment: '' });

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: queryKeys.bookings.detail(bookingId),
        queryFn: () => getBookingById(bookingId),
        refetchInterval: (query) => {
            // Polling is useful for customers to see worker acceptance or progress
            const bookingData = query.state.data;
            if (['PENDING', 'IN_PROGRESS'].includes(bookingData?.booking?.status)) return 10000;
            return false;
        },
        refetchIntervalInBackground: false,
    });

    const booking = data?.booking;
    const workerProfileId = booking?.workerProfile?.id;

    const payMutation = useMutation({
        mutationFn: () => payBooking(bookingId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(bookingId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.bookings.customer() });
            toast.success('Payment successful! Thank you.');
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Payment failed');
        }
    });

    const reviewMutation = useMutation({
        mutationFn: (data) => createReview(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(bookingId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.bookings.customer() });
            toast.success('Thank you for your feedback!');
            setActiveReview({ rating: 0, comment: '' });
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to submit review');
        }
    });

    useEffect(() => {
        if (!workerProfileId) return;

        // Only track location for active bookings
        const isActive = ['CONFIRMED', 'IN_PROGRESS'].includes(booking?.status);
        if (!isActive) return;

        const fetchLocation = async () => {
            try {
                const res = await getWorkerLocation(workerProfileId);
                if (res?.location) {
                    setWorkerLocation({
                        lat: res.location.latitude,
                        lng: res.location.longitude,
                    });
                }
            } catch {
                // ignore location fetch errors
            }
        };

        fetchLocation();

        const handleLocationUpdate = (event) => {
            const payload = event.detail;
            if (payload?.workerProfileId === workerProfileId) {
                setWorkerLocation({ lat: payload.latitude, lng: payload.longitude });
            }
        };

        const joinWorkerRoom = () => {
            const socketRef = typeof window !== 'undefined' ? window.__UPRO_SOCKET : null;
            if (socketRef?.current) {
                socketRef.current.emit('joinRoom', `worker_tracking:${workerProfileId}`);
            }
        };

        joinWorkerRoom();
        window.addEventListener('upro:socket-ready', joinWorkerRoom);
        window.addEventListener('upro:worker-location-updated', handleLocationUpdate);

        return () => {
            window.removeEventListener('upro:socket-ready', joinWorkerRoom);
            window.removeEventListener('upro:worker-location-updated', handleLocationUpdate);

            // Strictly clean up: leave the room when component unmounts or status changes
            const socketRef = typeof window !== 'undefined' ? window.__UPRO_SOCKET : null;
            if (socketRef?.current) {
                socketRef.current.emit('leaveRoom', `worker_tracking:${workerProfileId}`);
            }
        };
    }, [workerProfileId, booking?.status]);

    useSocketEvent('booking:status_updated', (payload) => {
        if (!user?.id || !bookingId) return;

        const eventBookingId = payload?.id || payload?.bookingId;
        const eventCustomerId = payload?.customer?.id || payload?.customerId;
        const isForMe = String(eventBookingId) === String(bookingId) && String(eventCustomerId) === String(user.id);
        if (!isForMe) return;

        const getStatusMessage = (status) => {
            switch (status) {
                case 'CONFIRMED': return 'Worker accepted your booking';
                case 'IN_PROGRESS': return 'Worker started your service';
                case 'COMPLETED': return 'Service marked as completed';
                case 'CANCELLED': return 'Booking was cancelled';
                default: return 'Booking updated';
            }
        };

        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(bookingId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.customer() });
        toast.info(getStatusMessage(payload?.status));
    }, [bookingId, user?.id]);

    const handleOpenMaps = () => {
        if (!booking) return;
        const lat = booking.latitude;
        const lng = booking.longitude;
        const address = booking.address || booking.addressDetails;

        if (lat && lng) {
            window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
        } else if (address) {
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
        }
    };

    if (isLoading) return <MainLayout><div className="flex items-center justify-center min-h-[60vh]"><AsyncState isLoading={true} /></div></MainLayout>;
    if (isError) return <MainLayout><div className={`${getPageLayout('narrow')} py-10`}><AsyncState isError={true} onRetry={refetch} /></div></MainLayout>;
    if (!booking) return <MainLayout><div className={`${getPageLayout('narrow')} py-10`}><AsyncState isEmpty={true} emptyTitle="Booking not found" /></div></MainLayout>;

    return (
        <MainLayout>
            <div className={`${getPageLayout('default')} pb-32 lg:pb-10 min-h-screen`}>
                <Button
                    variant="ghost"
                    onClick={() => navigate('/bookings')}
                    className="mb-6 group hover:pl-2 transition-all"
                >
                    <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Bookings
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main Content Area */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Header Card */}
                        <div className="space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                                            Booking #{booking.id}
                                        </h1>
                                        <BookingStatusBadge status={booking.status} className="px-2 py-0.5 text-2xs font-black uppercase" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Briefcase size={16} className="text-brand-500" />
                                        <p className="text-lg font-bold text-gray-600 dark:text-gray-300">
                                            {booking.service?.name}
                                        </p>
                                    </div>
                                </div>

                                <div className="hidden lg:flex items-center gap-2">
                                    {booking.status === 'COMPLETED' && booking.paymentStatus !== 'PAID' && (
                                        <Button
                                            size="md"
                                            icon={CreditCard}
                                            onClick={() => payMutation.mutate()}
                                            loading={payMutation.isPending}
                                            className="bg-brand-600 hover:bg-brand-700 text-white shadow-lg px-6 h-12 rounded-xl font-bold"
                                        >
                                            Pay Now
                                        </Button>
                                    )}
                                    {['PENDING', 'CONFIRMED'].includes(booking.status) && (
                                        <Button
                                            size="md"
                                            variant="ghost"
                                            icon={XCircle}
                                            onClick={() => setIsCancelModalOpen(true)}
                                            className="text-error-500 hover:bg-error-50 h-12 px-6 rounded-xl font-bold"
                                        >
                                            Cancel Booking
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Service Status Banner */}
                            <div className="p-4 rounded-2xl border flex items-center justify-between transition-all bg-white border-gray-100 shadow-sm dark:bg-dark-800/50 dark:border-dark-700 dark:shadow-none">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                                        <ShieldAlert size={24} />
                                    </div>
                                    <div>
                                        <p className="text-2xs font-black uppercase text-gray-500 tracking-widest leading-none mb-1">Live Status</p>
                                        <h3 className="text-sm font-black text-gray-900 dark:text-gray-100">
                                            {booking.status === 'PENDING' ? 'Awaiting professional acceptance' :
                                                booking.status === 'CONFIRMED' ? 'Professional is assigned and ready' :
                                                    booking.status === 'IN_PROGRESS' ? 'Service is currently in progress' :
                                                        booking.status === 'COMPLETED' ? 'Job finished successfully' :
                                                            'Booking has been cancelled'}
                                        </h3>
                                    </div>
                                </div>
                                {booking.status === 'IN_PROGRESS' && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" aria-hidden="true"></div>
                                        <span className="text-2xs font-black uppercase text-green-500">Live</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Live Tracking Feature - More prominent in main column */}
                        {['CONFIRMED', 'IN_PROGRESS'].includes(booking.status) && booking.latitude && booking.longitude && (
                            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-500">
                                            <Compass size={18} />
                                        </div>
                                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-700 dark:text-gray-300">
                                            Live Professional Tracking
                                        </h3>
                                    </div>
                                    <div className="px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
                                        Active Stream
                                    </div>
                                </div>
                                <LiveTrackingMap
                                    workerId={workerProfileId}
                                    customerLocation={{ lat: booking.latitude, lng: booking.longitude }}
                                    initialWorkerLocation={workerLocation}
                                    height="340px"
                                />
                            </section>
                        )}

                        <BookingDetailsGrid booking={booking} onOpenMaps={handleOpenMaps} />

                        {/* Session Timeline for multi-day bookings */}
                        {booking.status === 'IN_PROGRESS' && (
                            <BookingSessionsTimeline bookingId={booking.id} />
                        )}
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-6">
                        <CustomerWorkerSection
                            booking={booking}
                            user={user}
                            activeReview={activeReview}
                            setActiveReview={setActiveReview}
                            reviewMutation={reviewMutation}
                        />


                        <CustomerOTPSection booking={booking} />

                        {/* Payment Info */}
                        <Card className="p-5 border-none bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-xl shadow-brand-500/20">
                            <h3 className="text-2xs font-black uppercase tracking-widest opacity-80 mb-1">Billing Summary</h3>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-3xl font-black">₹{booking.totalPrice || booking.estimatedPrice}</p>
                                    <p className="text-2xs font-bold opacity-80 uppercase tracking-tighter">
                                        Payment: {getPaymentDisplayText(booking)}
                                    </p>
                                </div>
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <CreditCard size={20} />
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {booking && !isLoading && !isError && (
                <CustomerMobileActions
                    booking={booking}
                    navigate={navigate}
                    payMutation={payMutation}
                    onCancelOpen={() => setIsCancelModalOpen(true)}
                />
            )}

            {/* Cancellation Modal */}
            <CancellationModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                bookingId={parseInt(bookingId)}
                role="CUSTOMER"
                invalidateKeys={[queryKeys.bookings.detail(bookingId), queryKeys.bookings.customer()]}
            />
        </MainLayout>
    );
}
