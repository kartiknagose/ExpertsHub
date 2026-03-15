import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

export function ProfileIncompleteAlert() {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    if (!isAuthenticated || !user) return null;

    // Check if profile is complete
    const isProfileComplete = user.isProfileComplete;
    const isWorker = user.role === 'WORKER';
    // isVerified might be undefined for customers, defaulting to true effectively since they don't block on it here
    // But for workers, we check explicitly.
    const isVerified = isWorker ? user.isVerified : true;

    if (isProfileComplete && isVerified) return null;

    const alertType = !isProfileComplete ? 'profile' : 'verification';

    const handleAction = () => {
        if (alertType === 'profile') {
            if (user.role === 'CUSTOMER') {
                navigate('/customer/profile');
            } else if (user.role === 'WORKER') {
                navigate('/worker/profile');
            }
        } else {
            navigate('/worker/verification');
        }
    };

    const message = alertType === 'profile'
        ? (user.role === 'WORKER'
            ? "Complete your profile details to proceed."
            : "Complete your profile to book services and manage your account.")
        : "Verify your identity (ID proof) to start receiving job requests.";

    return (
        <div className={`w-full px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-b
            bg-brand-50 dark:bg-brand-900/30 border-brand-100 dark:border-brand-800 text-brand-800 dark:text-brand-100
            `}>
            <div className="flex items-center gap-3">
                <AlertCircle className="shrink-0 text-brand-500" size={20} />
                <span className="text-sm font-medium">{message}</span>
            </div>
            <Button
                size="sm"
                onClick={handleAction}
                className="shrink-0 text-xs"
                icon={ArrowRight}
            >
                {alertType === 'profile' ? 'Complete Setup' : 'Verify Now'}
            </Button>
        </div>
    );
}
