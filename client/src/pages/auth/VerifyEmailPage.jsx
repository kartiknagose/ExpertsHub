// Email verification page
// Verifies email token and redirects based on role/profile completion

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import { verifyEmail } from '../../api/auth';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common';
import { Button } from '../../components/common';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState(token ? 'loading' : 'error'); // loading | success | error
  const [message, setMessage] = useState(token ? 'Verifying your email...' : 'Verification token is missing.');
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [redirectCount, setRedirectCount] = useState(5);
  const hasVerifiedRef = useRef(false);

  // Countdown effect
  useEffect(() => {
    let timer;
    if (status === 'success' && redirectCount > 0) {
      timer = setInterval(() => setRedirectCount((c) => c - 1), 1000);
    } else if (status === 'success' && redirectCount === 0) {
      // Navigate when countdown hits 0
      navigate('/login', {
        state: {
          email: verifiedEmail,
          message: message,
          type: 'success',
        },
        replace: true,
      });
    }
    return () => clearInterval(timer);
  }, [status, redirectCount, navigate, verifiedEmail, message]);

  // Verification effect
  useEffect(() => {
    if (!token || hasVerifiedRef.current) return;
    hasVerifiedRef.current = true;

    const verify = async () => {
      try {
        const data = await verifyEmail(token);

        let successMsg = 'Email verified successfully! You can now log in.';
        if (data.role === 'WORKER' && !data.hasWorkerProfile) {
          successMsg = 'Email verified! Please login to complete your professional profile.';
        } else if (!data.hasAddress) {
          successMsg = 'Email verified! Please login to add your address.';
        }

        setStatus('success');
        setMessage(successMsg);
        setVerifiedEmail(data.email || '');
      } catch (error) {
        // If already verified, treat as success
        if (error.response?.data?.message?.includes('already verified') ||
          error.response?.status === 409) {
          setStatus('success');
          setMessage('Email is already verified.');
          setVerifiedEmail(''); // We might not have email here if error
        } else {
          setStatus('error');
          setMessage(error.response?.data?.message || 'Verification failed. The link may have expired.');
        }
      }
    };

    verify();
  }, [token]);

  const getIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle size={64} className="text-success-500 mx-auto" />;
      case 'error':
        return <XCircle size={64} className="text-error-500 mx-auto" />;
      default:
        return <div className="w-12 h-12 rounded-full border-4 border-brand-500 border-t-transparent animate-spin mx-auto"></div>;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-dark-900">
      <Card className="w-full max-w-md text-center p-8 shadow-xl">
        <div className="mb-6">
          {getIcon()}
        </div>

        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          {status === 'loading' ? 'Verifying...' : status === 'success' ? 'Verified!' : 'Verification Failed'}
        </h2>

        <p className="text-lg mb-8 text-gray-600 dark:text-gray-300">
          {message}
        </p>

        {status === 'success' && (
          <p className="text-sm text-gray-400 mb-6">
            Redirecting to login in {redirectCount}s...
          </p>
        )}

        <Button
          fullWidth
          onClick={() => navigate('/login', {
            state: { email: verifiedEmail, message, type: 'success' },
            replace: true
          })}
          disabled={status === 'loading'}
          variant={status === 'error' ? 'outline' : 'primary'}
        >
          {status === 'success' ? 'Continue to Login' : 'Back to Login'}
        </Button>
      </Card>
    </div>
  );
}
