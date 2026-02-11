// Email verification page
// Verifies email token and redirects based on role/profile completion

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import { verifyEmail } from '../../api/auth';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common';
import { Button } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';

export function VerifyEmailPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Verification token is missing.');
      return;
    }

    const verify = async () => {
      try {
        const result = await verifyEmail(token);
        setStatus('success');
        setMessage('Email verified successfully.');

        // Redirect based on role and profile completion
        if (result.role === 'WORKER') {
          if (!result.hasWorkerProfile || !result.isProfileComplete) {
            navigate('/worker/setup-profile');
            return;
          }
          navigate('/login');
          return;
        }

        if (result.role === 'CUSTOMER') {
          if (!result.hasAddress || !result.isProfileComplete) {
            navigate('/profile/setup');
            return;
          }
          navigate('/login');
          return;
        }

        navigate('/login');
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed.');
      }
    };

    verify();
  }, [navigate, searchParams]);

  const iconColor = status === 'success' ? 'text-success-500' : 'text-error-500';

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Email Verification</CardTitle>
            <CardDescription>
              {status === 'loading' ? 'Verifying your email...' : message}
            </CardDescription>
          </CardHeader>

          <div className="flex justify-center py-6">
            {status === 'success' ? (
              <CheckCircle size={48} className={iconColor} />
            ) : status === 'error' ? (
              <XCircle size={48} className={iconColor} />
            ) : (
              <div className="w-12 h-12 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"></div>
            )}
          </div>

          {status === 'error' && (
            <div className="pb-6">
              <Button onClick={() => navigate('/login')}>Go to Login</Button>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
