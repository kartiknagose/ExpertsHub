import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import { Activity, Zap, ShieldAlert } from 'lucide-react';
import { queryKeys } from '../../utils/queryKeys';
import { useSocketEvent } from '../../hooks/useSocket';

/**
 * GlobalSocketListener
 * 
 * A headless component that listens for global system events via Socket.io
 * and triggers UI actions (like forced logout on suspension).
 */
export const GlobalSocketListener = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    useSocketEvent('user:status_changed', (payload) => {
        if (!user?.id) return;
        if (payload.isActive === false) {
            toast.error('Your account has been suspended. Logging out...', { duration: 10000 });
            setTimeout(() => {
                logout();
                navigate('/login', { replace: true });
            }, 3000);
        }
    }, [user?.id, logout, navigate]);

    useSocketEvent('booking:status_updated', (booking) => {
        if (!user?.id) return;
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all() });

        if (user.role === 'CUSTOMER') {
            const statusMessages = {
                CONFIRMED: `Professional ${booking.workerProfile?.user?.name || ''} has accepted your booking!`,
                IN_PROGRESS: 'Your service has started. Please share the completion OTP once finished.',
                COMPLETED: 'Your service is complete! Please rate your experience.',
                CANCELLED: 'Your booking was cancelled.'
            };
            if (statusMessages[booking.status]) {
                toast.info(statusMessages[booking.status], {
                    icon: <Activity className="text-brand-500" size={16} />,
                    action: {
                        label: 'Details',
                        onClick: () => navigate(`/bookings/${booking.id}`)
                    }
                });
            }
        } else if (user.role === 'WORKER') {
            if (booking.status === 'CANCELLED') {
                toast.error('A customer cancelled their booking.', {
                    action: { label: 'View', onClick: () => navigate('/worker/dashboard') }
                });
            }
        }
    }, [user?.id, user?.role, navigate, queryClient]);

    useSocketEvent('booking:available', (payload) => {
        if (!user?.id || user.role !== 'WORKER') return;
        toast('New Job Opportunity!', {
            description: `${payload.serviceName} needed at ${payload.address}`,
            icon: <Zap className="text-orange-500" size={16} />,
            action: {
                label: 'View Job',
                onClick: () => navigate('/worker/dashboard')
            },
            duration: 10000
        });
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.open() });
    }, [user?.id, user?.role, navigate, queryClient]);

    useSocketEvent('sos:alert', (payload) => {
        if (!user?.id) return;
        toast.error('🚨 EMERGENCY SOS ALERT', {
            description: payload.message || `A safety alert has been triggered for Booking #${payload.bookingId}.`,
            duration: 30000,
            icon: <ShieldAlert className="text-white" size={20} />,
            style: { backgroundColor: '#be123c', color: 'white' },
            action: {
                label: 'View Details',
                onClick: () => navigate(user.role === 'ADMIN' ? `/admin/safety/alerts/${payload.alertId}` : `/bookings/${payload.bookingId}`)
            }
        });
    }, [user?.id, user?.role, navigate]);

    useSocketEvent('worker:location_updated', (payload) => {
        const event = new CustomEvent('upro:worker-location-updated', { detail: payload });
        window.dispatchEvent(event);
    });

    useSocketEvent('notification:new', (notification) => {
        if (!user?.id) return;
        const event = new CustomEvent('upro:notification-received', { detail: notification });
        window.dispatchEvent(event);

        if (notification.priority === 'HIGH' || notification.type === 'BOOKING_UPDATE') {
            toast(notification.title, {
                description: notification.message,
                icon: <Activity className="text-brand-500" size={16} />,
                action: {
                    label: 'View',
                    onClick: () => {
                        if (notification.data?.bookingId) {
                            navigate(user.role === 'CUSTOMER' ? `/bookings/${notification.data.bookingId}` : `/worker/bookings/${notification.data.bookingId}`);
                        }
                    }
                }
            });
        }
    }, [user?.id, user?.role, navigate]);

    return null;
};
