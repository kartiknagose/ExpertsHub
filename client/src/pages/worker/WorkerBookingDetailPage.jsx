import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
    Briefcase,
    ArrowLeft,
    CheckCircle,
    XCircle,
    PlayCircle,
    Phone,
    MessageCircle,
    Mail,
    Star,
    AlertCircle,
    MessageSquare,
    Calendar,
    Clock,
    MapPin,
    ExternalLink,
    User,
} from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import {
    Button,
    AsyncState,
    Card,
    Badge,
} from '../../components/common';
import { BookingStatusBadge } from '../../components/common';
import { getBookingById, updateBookingStatus } from '../../api/bookings';
import { OtpVerificationModal } from '../../components/features/bookings/OtpVerificationModal';
import { CancellationModal } from '../../components/features/bookings/CancellationModal';
import { queryKeys } from '../../utils/queryKeys';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';
import { createReview } from '../../api/reviews';
import { getPageLayout } from '../../constants/layout';
import { useWorkerLocation } from '../../hooks/useWorkerLocation';
import { resolveProfilePhotoUrl } from '../../utils/profilePhoto';
import { useSocketEvent } from '../../hooks/useSocket';
import { MiniMap } from '../../components/features/location/MiniMap';
import { ChatToggle } from '../../components/features/chat/ChatWindow';
import { StarRating } from '../../components/features/reviews/StarRating';

import { BookingTimeline } from './components/BookingTimeline';
import { BookingReviewSection } from './components/BookingReviewSection';
import { BookingAssignmentDetails } from './components/BookingAssignmentDetails';
import { WorkerContactSidebar } from './components/WorkerContactSidebar';
import { WorkerDesktopActions, WorkerMobileActions } from './components/BookingActionButtons';
import { WorkerSessionPanel } from './components/WorkerSessionPanel';
import { BookingSessionsTimeline } from '../../components/features/bookings/BookingSessionsTimeline';

export function WorkerBookingDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Ensure worker tracking continues while on this page
    const { isOnline, toggleOnline, isUpdating } = useWorkerLocation(true);

    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
    const [otpAction, setOtpAction] = useState(null); // 'start' or 'complete'
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    // Review State
    const [activeReview, setActiveReview] = useState({ rating: 0, comment: '' });

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: queryKeys.bookings.detail(id),
        queryFn: () => getBookingById(id),
    });

    const booking = data?.booking;

    const statusMutation = useMutation({
        mutationFn: ({ status }) => updateBookingStatus(id, { status }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
            toast.success(`Job ${variables.status === 'CONFIRMED' ? 'accepted' : 'updated'} successfully!`);
        },
        onError: () => {
            toast.error('Failed to update status');
        }
    });

    const reviewMutation = useMutation({
        mutationFn: (payload) => createReview(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
            toast.success('Thank you for your feedback!');
            setActiveReview({ rating: 0, comment: '' });
        },
        onError: (err) => {
            toast.error(err?.response?.data?.error || 'Failed to submit review');
        }
    });

    const handleReviewSubmit = () => {
        if (!activeReview.rating) return toast.error('Please provide a star rating');
        reviewMutation.mutate({
            bookingId: parseInt(id),
            rating: activeReview.rating,
            comment: activeReview.comment,
            type: 'CUSTOMER' // Explicitly stating this is a review for the customer
        });
    };

    const openCancelModal = (e) => {
        if (e) e.stopPropagation();
        setIsCancelModalOpen(true);
    };

    const openOtpModal = (action) => {
        setOtpAction(action);
        setIsOtpModalOpen(true);
    };

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

    useSocketEvent('booking:status_updated', (payload) => {
        if (!user?.id || !id) return;

        const eventBookingId = payload?.id || payload?.bookingId;
        const workerUserId = payload?.workerProfile?.userId || payload?.workerProfile?.user?.id;
        const isForMe = String(eventBookingId) === String(id) && String(workerUserId) === String(user.id);
        if (!isForMe) return;

        const statusMessage = (status) => {
            switch (status) {
                case 'CONFIRMED': return 'Booking confirmed';
                case 'IN_PROGRESS': return 'Job started';
                case 'COMPLETED': return 'Job completed';
                case 'CANCELLED': return 'Booking cancelled';
                default: return 'Booking status updated';
            }
        };

        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.worker() });
        toast.info(statusMessage(payload?.status));
    }, [id, user?.id]);

    return (
        <MainLayout>
            <div className={`${getPageLayout('default')} pb-32 lg:pb-10`}>
                <Button
                    variant="ghost"
                    onClick={() => navigate('/worker/dashboard')}
                    className="mb-6 -ml-4 text-gray-500 hover:text-brand-600 transition-colors"
                    icon={ArrowLeft}
                >
                    Return to Dashboard
                </Button>

                <AsyncState
                    isLoading={isLoading}
                    isError={isError}
                    error={error}
                    onRetry={refetch}
                >
                    {booking &&
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            {/* Main Content Area */}
                            <div className="lg:col-span-3 space-y-6">
                                {/* Header Card */}
                                <div className="space-y-4">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                                                    Job #{booking.id}
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
                                            {booking.status === 'PENDING' && (
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
                                            )}
                                            {booking.status === 'CONFIRMED' && (
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
                                            )}
                                            {booking.status === 'IN_PROGRESS' && (
                                                <Button
                                                    size="md"
                                                    icon={CheckCircle}
                                                    onClick={() => openOtpModal('complete')}
                                                    className="bg-green-600 hover:bg-green-700 text-white shadow-lg px-6 h-12 rounded-xl font-bold"
                                                >
                                                    Complete Job
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Service Lifecycle Timeline (More Compact) */}
                                    <div className="p-5 rounded-2xl border shadow-sm bg-white border-gray-100 dark:bg-dark-800/40 dark:border-dark-700">
                                        <div className="flex flex-col gap-4">
                                            {booking.status === 'CANCELLED' && booking.cancellationReason && (
                                                <div className="p-4 rounded-xl flex items-start gap-4 border bg-error-50 border-error-100 dark:bg-error-950/20 dark:border-error-900/40">
                                                    <AlertCircle size={20} className="text-error-500 shrink-0 mt-1" />
                                                    <div className="space-y-1">
                                                        <p className="text-2xs font-black uppercase tracking-widest text-error-600/70 dark:text-error-400/70">
                                                            Cancellation Reason
                                                        </p>
                                                        <p className="text-sm font-bold leading-relaxed text-error-800 dark:text-error-300">
                                                            {booking.cancellationReason}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between relative max-w-xl mx-auto px-2">
                                                <div className="absolute top-1/2 left-0 w-full h-[1px] -translate-y-1/2 z-0 bg-gray-100 dark:bg-dark-700"></div>

                                                {['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].map((s, i) => {
                                                    const statuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'];
                                                    const isPassed = statuses.indexOf(booking.status) >= i;
                                                    const isActive = booking.status === s;

                                                    return (
                                                        <div key={s} className="flex flex-col items-center z-10">
                                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-500 ${isPassed
                                                                ? 'bg-brand-600 border-brand-400 text-white shadow-md shadow-brand-500/20'
                                                                : 'bg-white border-gray-200 text-gray-300 dark:bg-dark-900 dark:border-dark-700 dark:text-dark-500'
                                                                } ${isActive ? 'ring-4 ring-brand-500/10 scale-110' : ''}`}>
                                                                {isPassed ? <CheckCircle size={16} /> : <div className="w-1 h-1 rounded-full bg-current" />}
                                                            </div>
                                                            <span className={`text-micro font-black mt-2 uppercase tracking-tight ${isPassed ? 'text-brand-500' : 'text-gray-400'}`}>
                                                                {s}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rating/Review Section for COMPLETED Bookings */}
                                    {booking.status === 'COMPLETED' && (
                                        <Card className="p-6 border-none ring-1 ring-black/5 dark:ring-white/10 shadow-lg bg-gradient-to-br from-yellow-50/50 to-white dark:from-yellow-900/5 dark:to-dark-800">
                                            {(() => {
                                                const hasReviewed = (booking.reviews || []).some(r => {
                                                    const reviewerId = r.reviewerId || r.reviewer?.id;
                                                    return String(reviewerId) === String(user?.id);
                                                });

                                                if (hasReviewed) {
                                                    const review = booking.reviews.find(r => String(r.reviewerId || r.reviewer?.id) === String(user?.id));
                                                    return (
                                                        <div className="flex flex-col items-center text-center space-y-3">
                                                            <div className="p-3 bg-success-50 dark:bg-success-900/20 text-success-600 rounded-full">
                                                                <CheckCircle size={24} />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-black text-lg">Feedback Submitted</h4>
                                                                <p className="text-sm text-gray-500 font-medium">You rated the customer {review.rating} stars.</p>
                                                            </div>
                                                            {review.comment && (
                                                                <p className="text-sm italic text-gray-400">&ldquo;{review.comment}&rdquo;</p>
                                                            )}
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <div className="space-y-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-lg">
                                                                <Star size={20} fill="currentColor" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-black text-lg">Rate your experience</h4>
                                                                <p className="text-sm text-gray-500 font-medium">How was working with {booking.customer?.name}?</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col items-center space-y-6 py-2">
                                                            <StarRating
                                                                value={activeReview.rating}
                                                                onChange={(r) => setActiveReview(s => ({ ...s, rating: r }))}
                                                                size={40}
                                                            />

                                                            <div className="w-full space-y-3">
                                                                <div className="flex items-center gap-2 px-1">
                                                                    <MessageSquare size={14} className="text-gray-400" />
                                                                    <span className="text-2xs font-black uppercase tracking-widest text-gray-400">Add a Public Comment</span>
                                                                </div>
                                                                <textarea
                                                                    placeholder="How was the customer? Polite? Job as described?"
                                                                    value={activeReview.comment}
                                                                    onChange={(e) => setActiveReview(s => ({ ...s, comment: e.target.value }))}
                                                                    className="w-full p-4 rounded-xl border transition-all text-sm outline-none focus:ring-4 focus:ring-brand-500/10 bg-gray-50 border-gray-100 focus:border-brand-500 dark:bg-dark-900 dark:border-dark-700 dark:text-white"
                                                                    rows={3}
                                                                />
                                                            </div>

                                                            <Button
                                                                fullWidth
                                                                size="lg"
                                                                onClick={handleReviewSubmit}
                                                                loading={reviewMutation.isPending}
                                                                disabled={!activeReview.rating}
                                                                className="h-14 rounded-2xl font-black bg-brand-600 shadow-xl shadow-brand-500/20"
                                                            >
                                                                Submit Feedback
                                                            </Button>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </Card>
                                    )}

                                    {/* Assignment Details Card (Grid for compactness) */}
                                    <Card className="overflow-hidden border-none ring-1 ring-black/5 dark:ring-white/10 shadow-lg">
                                        <div className="p-6 space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 rounded-lg shrink-0 bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400">
                                                        <Calendar size={18} />
                                                    </div>
                                                    <div>
                                                        <span className="block text-2xs font-black text-gray-400 uppercase tracking-widest mb-0.5">Appointment</span>
                                                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                            {new Date(booking.scheduledAt || booking.scheduledDate).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-2xs font-bold text-blue-500">
                                                            <Clock size={12} />
                                                            {new Date(booking.scheduledAt || booking.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 rounded-lg shrink-0 bg-success-50 text-success-600 dark:bg-success-900/20 dark:text-success-400">
                                                        <MapPin size={18} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="block text-2xs font-black text-gray-400 uppercase tracking-widest mb-0.5">Location</span>
                                                        <span className="text-sm font-bold block truncate text-gray-900 dark:text-gray-100">
                                                            {booking.address || booking.addressDetails}
                                                        </span>
                                                        <Button
                                                            variant="link"
                                                            size="sm"
                                                            className="p-0 h-auto text-2xs text-brand-500 font-bold flex items-center gap-1"
                                                            onClick={handleOpenMaps}
                                                        >
                                                            Open Maps <ExternalLink size={10} />
                                                        </Button>
                                                    </div>
                                                </div>
                                                {booking.latitude && booking.longitude && (
                                                    <div className="md:col-span-2 lg:col-span-3">
                                                        <MiniMap lat={booking.latitude} lng={booking.longitude} height="180px" />
                                                    </div>
                                                )}

                                                <div className="md:text-right lg:text-left">
                                                    <span className="block text-2xs font-black text-gray-400 uppercase tracking-widest mb-0.5">Estimated Payout</span>
                                                    <div className="text-2xl font-black text-gray-900 dark:text-white">
                                                        ₹{booking.totalPrice || booking.estimatedPrice || booking.service?.basePrice || 0}
                                                    </div>
                                                    <Badge variant="outline" className="text-micro font-black uppercase bg-success-50 text-success-700 border-success-200">Guaranteed</Badge>
                                                </div>
                                            </div>

                                            {booking.notes && (
                                                <div className="p-4 rounded-xl border-l-4 border-l-brand-500 bg-gray-50 border-gray-100 dark:bg-dark-900/50 dark:border-dark-700">
                                                    <span className="block text-2xs font-black text-gray-400 uppercase tracking-widest mb-1 pointer-events-none opacity-50">Customer Notes</span>
                                                    <p className="text-sm font-medium italic text-gray-600 dark:text-gray-300">
                                                        &ldquo;{booking.notes}&rdquo;
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                </div>
                            </div>

                            {/* Sidebar Area */}
                            <div className="space-y-6">
                                {/* Session Management Panel (IN_PROGRESS only) */}
                                <WorkerSessionPanel bookingId={booking.id} bookingStatus={booking.status} />

                                {/* Session Timeline (IN_PROGRESS only) */}
                                {booking.status === 'IN_PROGRESS' && (
                                    <BookingSessionsTimeline bookingId={booking.id} />
                                )}

                                <Card className="border-none ring-1 ring-black/5 dark:ring-white/10 shadow-xl overflow-hidden sticky top-8">
                                    <div className="p-3 border-b bg-gray-50 border-gray-100 dark:bg-dark-900/50 dark:border-dark-700">
                                        <h3 className="text-2xs font-black uppercase tracking-widest text-gray-400 text-center flex items-center justify-center gap-2">
                                            <User size={12} /> Contact Client
                                        </h3>
                                    </div>
                                    <div className="p-5">
                                        <div className="flex flex-col items-center text-center mb-6">
                                            <div className="relative mb-3">
                                                {booking.customer?.profilePhotoUrl ? (
                                                    <img
                                                        src={resolveProfilePhotoUrl(booking.customer.profilePhotoUrl)}
                                                        alt=""
                                                        className="w-20 h-20 rounded-2xl object-cover ring-4 ring-brand-500/10 shadow-lg"
                                                    />
                                                ) : (
                                                    <div className="w-20 h-20 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500 text-2xl font-black shadow-inner">
                                                        {booking.customer?.name?.charAt(0) || '?'}
                                                    </div>
                                                )}
                                                <div className="absolute -bottom-2 -right-2 bg-success-500 border-4 border-white dark:border-dark-800 w-6 h-6 rounded-full" aria-hidden="true" />
                                                <span className="sr-only">Customer verified</span>
                                            </div>
                                            <h4 className="text-lg font-black text-gray-900 dark:text-white">{booking.customer?.name}</h4>
                                            <div className="flex items-center gap-1 mt-1">
                                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-2xs">
                                                    ★ {booking.customer?.rating || '0.0'}
                                                </Badge>
                                                <span className="text-2xs font-bold text-gray-400 uppercase">({booking.customer?.totalReviews || 0} Reviews)</span>
                                            </div>
                                        </div>

                                        {/* Tracking Status Card */}
                                        <div className={`mb-6 p-4 rounded-2xl border ${isOnline ? 'bg-success-50/50 border-success-100 dark:bg-success-950/10 dark:border-success-900/30' : 'bg-gray-50 border-gray-100 dark:bg-dark-900/50 dark:border-dark-700'}`}>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Tracking</span>
                                                <Badge variant={isOnline ? "success" : "secondary"} className="text-[9px] font-black uppercase">
                                                    {isOnline ? 'Active' : 'Paused'}
                                                </Badge>
                                            </div>
                                            <Button
                                                fullWidth
                                                size="sm"
                                                variant={isOnline ? "outline" : "primary"}
                                                onClick={toggleOnline}
                                                loading={isUpdating}
                                                className="h-10 rounded-xl font-bold text-xs"
                                            >
                                                {isOnline ? 'Stop Tracking' : 'Share Location'}
                                            </Button>
                                            {isOnline && (
                                                <p className="text-[10px] text-center mt-2 text-success-600 font-bold animate-pulse">
                                                    You are visible to the customer
                                                </p>
                                            )}
                                        </div>

                                        {['CONFIRMED', 'IN_PROGRESS'].includes(booking.status) ? (
                                            <div className="space-y-4">
                                                <div className="p-3 rounded-xl border bg-gray-50 border-gray-100 dark:bg-dark-900/30 dark:border-dark-700">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Phone size={14} className="text-brand-500" />
                                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                                            {booking.customer?.mobile}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Mail size={14} className="text-brand-500" />
                                                        <span className="text-xs font-bold truncate text-gray-700 dark:text-gray-300">
                                                            {booking.customer?.email}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="primary"
                                                        icon={Phone}
                                                        className="rounded-xl font-bold h-10"
                                                        onClick={() => window.location.href = `tel:${booking.customer.mobile}`}
                                                    >
                                                        Call
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        icon={MessageCircle}
                                                        className="rounded-xl font-bold h-10"
                                                        onClick={() => window.location.href = `sms:${booking.customer.mobile}`}
                                                    >
                                                        SMS
                                                    </Button>
                                                </div>
                                                <Button
                                                    fullWidth
                                                    variant="ghost"
                                                    size="sm"
                                                    icon={Mail}
                                                    className="h-10 rounded-xl font-bold text-gray-500"
                                                    onClick={() => window.location.href = `mailto:${booking.customer.email}`}
                                                >
                                                    Email Client
                                                </Button>
                                                <ChatToggle bookingId={booking.id} label="Chat with Customer" />
                                            </div>
                                        ) : (
                                            <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-dark-900/50 border border-dashed border-gray-200 dark:border-dark-700">
                                                <p className="text-2xs font-black text-gray-400 uppercase mb-1">Contact Hidden</p>
                                                <p className="text-2xs leading-tight text-gray-500">Confirm the job to see client contact details.</p>
                                            </div>
                                        )}
                                    </div>
                                </Card>

                            </div>
                        </div>
                    }
                </AsyncState>
            </div>

            {/* Mobile Sticky Action Bar */}
            {booking && !isLoading && !isError && (
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
                                onClick={() => navigate('/worker/dashboard')}
                                className="text-gray-500 font-black h-14"
                                icon={ArrowLeft}
                            >
                                Back to Dashboard
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Verification Modal */}
            <OtpVerificationModal
                isOpen={isOtpModalOpen}
                onClose={() => setIsOtpModalOpen(false)}
                otpAction={otpAction}
                bookingId={id}
                invalidateKeys={[queryKeys.bookings.detail(id)]}
            />

            {/* Cancellation Modal */}
            <CancellationModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                bookingId={parseInt(id)}
                role="WORKER"
                invalidateKeys={[queryKeys.bookings.detail(id)]}
            />
        </MainLayout>
    );
}
