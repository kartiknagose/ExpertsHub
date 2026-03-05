/**
 * GlobalSOSButton — Floating Emergency Safety Button
 *
 * Rendered ONCE globally in App.jsx. Reads the active booking from SOSContext.
 * Visible on ALL pages when user has a CONFIRMED or IN_PROGRESS booking.
 *
 * Flow:
 *   1. Tap floating button → opens confirmation modal
 *   2. Hold confirm button for 3s → triggers SOS
 *   3. GPS captured, API called, contacts notified via email-to-SMS, admins alerted
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { ShieldAlert, Phone, MapPin, Loader2, CheckCircle, X, AlertTriangle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { triggerSOS } from '../../../api/safety';
import { useSOS } from '../../../context/SOSContext';
import { toast } from 'sonner';

const HOLD_DURATION = 3000;

export function GlobalSOSButton() {
    const { activeBooking } = useSOS();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [holdProgress, setHoldProgress] = useState(0);
    const [isHolding, setIsHolding] = useState(false);
    const [result, setResult] = useState(null);

    const animFrameRef = useRef(null);
    const holdStartRef = useRef(null);

    const sosMutation = useMutation({
        mutationFn: (data) => triggerSOS(data),
        onSuccess: (data) => {
            setResult(data);
            toast.success('🚨 SOS alert triggered — help is on the way!');
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to trigger SOS');
            setIsModalOpen(false);
        },
    });

    const getLocation = () =>
        new Promise((resolve) => {
            if (!navigator.geolocation) { resolve(null); return; }
            navigator.geolocation.getCurrentPosition(
                (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
                () => resolve(null),
                { timeout: 8000, enableHighAccuracy: true }
            );
        });

    const handleTrigger = useCallback(async () => {
        const location = await getLocation();
        sosMutation.mutate({ bookingId: activeBooking.id, location });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeBooking?.id]);

    const startHold = useCallback(() => {
        if (sosMutation.isPending || result) return;
        setIsHolding(true);
        holdStartRef.current = Date.now();

        const tick = () => {
            const elapsed = Date.now() - holdStartRef.current;
            const progress = Math.min(elapsed / HOLD_DURATION, 1);
            setHoldProgress(progress);
            if (progress >= 1) {
                setIsHolding(false);
                setHoldProgress(0);
                handleTrigger();
                return;
            }
            animFrameRef.current = requestAnimationFrame(tick);
        };
        animFrameRef.current = requestAnimationFrame(tick);
    }, [handleTrigger, sosMutation.isPending, result]);

    const endHold = useCallback(() => {
        setIsHolding(false);
        setHoldProgress(0);
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }, []);

    const closeModal = () => {
        if (sosMutation.isPending) return;
        setIsModalOpen(false);
        setResult(null);
        setHoldProgress(0);
        setIsHolding(false);
    };

    // Cleanup
    useEffect(() => () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); }, []);

    // Don't render if no active booking
    if (!activeBooking) return null;

    return (
        <>
            {/* ── Floating SOS Button ── */}
            <Motion.button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-24 lg:bottom-8 right-4 lg:right-8 z-50 flex items-center gap-2
                           bg-red-600 hover:bg-red-700 active:bg-red-800 text-white
                           px-4 py-3 rounded-2xl shadow-2xl shadow-red-500/50
                           transition-colors group"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                title={`Emergency SOS — Active Booking #${activeBooking.id}`}
                aria-label="Emergency SOS"
            >
                {/* Pulsing ring */}
                <span className="absolute inset-0 rounded-2xl animate-ping bg-red-500 opacity-25 pointer-events-none" />
                <ShieldAlert size={20} className="group-hover:animate-pulse relative z-10" />
                <span className="text-xs font-black uppercase tracking-widest hidden sm:inline relative z-10">SOS</span>
            </Motion.button>

            {/* ── SOS Confirmation Modal ── */}
            <AnimatePresence>
                {isModalOpen && (
                    <Motion.div
                        className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={(e) => { if (e.target === e.currentTarget && !sosMutation.isPending) closeModal(); }}
                    >
                        <Motion.div
                            className="relative w-full max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden
                                        bg-white dark:bg-dark-800 dark:border dark:border-dark-700"
                            initial={{ y: '100%', opacity: 0.8 }}
                            animate={{ y: 0, opacity: 1, transition: { type: 'spring', damping: 28, stiffness: 400 } }}
                            exit={{ y: '100%', opacity: 0, transition: { duration: 0.2 } }}
                        >
                            {/* Mobile handle */}
                            <div className="flex justify-center pt-3 pb-1 sm:hidden">
                                <div className="w-12 h-1.5 rounded-full bg-gray-200 dark:bg-dark-600" />
                            </div>

                            {/* Close button */}
                            {!sosMutation.isPending && (
                                <button
                                    onClick={closeModal}
                                    className="absolute top-4 right-4 p-2 rounded-xl z-10 transition-colors
                                                text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700"
                                >
                                    <X size={18} />
                                </button>
                            )}

                            <div className="p-6 pt-4 sm:pt-6">
                                {result ? (
                                    /* ── Post-trigger: Success state ── */
                                    <div className="text-center space-y-5 py-2">
                                        <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                            <CheckCircle size={32} className="text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 dark:text-white">
                                                SOS Alert Sent
                                            </h3>
                                            <p className="text-sm mt-2 leading-relaxed text-gray-500 dark:text-gray-400">
                                                {result.message}
                                            </p>
                                        </div>

                                        {result.contactsNotified?.length > 0 && (
                                            <div className="p-4 rounded-2xl text-left space-y-2 bg-gray-50 dark:bg-dark-900/60">
                                                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
                                                    Contacts Notified via SMS
                                                </p>
                                                {result.contactsNotified.map((c, i) => (
                                                    <div key={i} className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                                                            <Phone size={14} className="text-red-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{c.name}</p>
                                                            <p className="text-xs text-gray-500">{c.phone}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {(!result.contactsNotified || result.contactsNotified.length === 0) && (
                                            <div className="p-4 rounded-2xl text-sm bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
                                                <p className="font-bold">No emergency contacts set up.</p>
                                                <p className="text-xs mt-1 opacity-80">
                                                    Go to Profile → Emergency Contacts to add contacts for future alerts.
                                                </p>
                                            </div>
                                        )}

                                        <button
                                            onClick={closeModal}
                                            className="w-full py-3 rounded-2xl font-black text-sm transition-colors
                                                        bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-dark-700 dark:hover:bg-dark-600 dark:text-gray-200"
                                        >
                                            Done — I'm safe
                                        </button>
                                    </div>
                                ) : (
                                    /* ── Pre-trigger: Confirmation state ── */
                                    <div className="space-y-5">
                                        <div className="text-center">
                                            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-3">
                                                <AlertTriangle size={32} className="text-red-600 animate-pulse" />
                                            </div>
                                            <h3 className="text-xl font-black text-gray-900 dark:text-white">
                                                Emergency SOS
                                            </h3>
                                            <p className="text-sm mt-2 leading-relaxed text-gray-500 dark:text-gray-400">
                                                This will send an emergency alert for{' '}
                                                <strong>Booking #{activeBooking.id}</strong>
                                                {activeBooking.service?.name ? ` (${activeBooking.service.name})` : ''}.
                                            </p>
                                        </div>

                                        {/* What will happen */}
                                        <div className="p-4 rounded-2xl space-y-3 bg-gray-50 dark:bg-dark-900/60">
                                            <div className="flex items-center gap-3">
                                                <MapPin size={16} className="text-red-500 shrink-0" />
                                                <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                                    Your GPS location will be captured &amp; shared
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Phone size={16} className="text-red-500 shrink-0" />
                                                <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                                    Emergency contacts alerted via SMS (free)
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <ShieldAlert size={16} className="text-red-500 shrink-0" />
                                                <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                                    Admin team notified in real-time
                                                </p>
                                            </div>
                                        </div>

                                        {/* Hold-to-confirm */}
                                        <button
                                            onMouseDown={startHold}
                                            onMouseUp={endHold}
                                            onMouseLeave={endHold}
                                            onTouchStart={startHold}
                                            onTouchEnd={endHold}
                                            disabled={sosMutation.isPending}
                                            className="relative w-full py-4 rounded-2xl font-black text-sm text-white uppercase tracking-widest
                                                       bg-red-600 hover:bg-red-700 transition-colors overflow-hidden select-none disabled:opacity-70"
                                        >
                                            {/* Progress fill */}
                                            <div
                                                className="absolute inset-0 bg-red-900 origin-left transition-none"
                                                style={{ transform: `scaleX(${holdProgress})` }}
                                            />
                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                {sosMutation.isPending ? (
                                                    <><Loader2 size={18} className="animate-spin" /> Sending Alert...</>
                                                ) : isHolding ? (
                                                    <><ShieldAlert size={18} className="animate-pulse" /> Keep Holding... ({Math.ceil((1 - holdProgress) * 3)}s)</>
                                                ) : (
                                                    <><ShieldAlert size={18} /> Hold to Trigger SOS (3s)</>
                                                )}
                                            </span>
                                        </button>

                                        {!sosMutation.isPending && (
                                            <button
                                                onClick={closeModal}
                                                className="w-full py-2 text-sm font-bold transition-colors rounded-xl
                                                            text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                            >
                                                Cancel — I'm safe
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Motion.div>
                    </Motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
