import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { resendVerificationEmail } from '../../api/auth';
import { toastSuccess, toastErrorFromResponse } from '../../utils/notifications';
import { Button } from '../ui/Button';

export function ProfileIncompleteAlert() {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isResending, setIsResending] = useState(false);

    if (!isAuthenticated || !user) return null;

    const needsEmailVerification = user.emailVerified === false;
    const isProfileComplete = user.isProfileComplete;
    const isWorker = user.role === 'WORKER';
    const isVerified = isWorker ? user.isVerified : true;

    if (isProfileComplete && isVerified && !needsEmailVerification) return null;

    const alertType = needsEmailVerification ? 'verification' : (!isProfileComplete ? 'profile' : 'verification');

    const handleAction = async () => {
        if (alertType === 'profile') {
            if (user.role === 'CUSTOMER') {
                navigate('/customer/profile');
            } else if (user.role === 'WORKER') {
                navigate('/worker/profile');
            }
        } else {
            try {
                setIsResending(true);
                const result = await resendVerificationEmail({ email: user.email });
                toastSuccess(result.message || 'Verification email sent. Check your inbox.');
            } catch (error) {
                toastErrorFromResponse(error, 'Failed to resend verification email');
            } finally {
                setIsResending(false);
            }
        }
    };

    const message = needsEmailVerification
        ? 'Verify your email to unlock bookings, payments, and other protected actions.'
        : alertType === 'profile'
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
                loading={isResending}
            >
                {needsEmailVerification ? 'Resend Verification Email' : (alertType === 'profile' ? 'Complete Setup' : 'Verify Now')}
            </Button>
        </div>
    );
}
