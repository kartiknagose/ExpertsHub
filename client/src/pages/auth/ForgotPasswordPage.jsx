// Forgot password page
// Requests a password reset link

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common';
import { Input, Button } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';
import { requestPasswordReset } from '../../api/auth';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

export function ForgotPasswordPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resetLink, setResetLink] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    setServerError('');
    setSuccessMessage('');
    setResetLink('');

    try {
      const response = await requestPasswordReset(data.email);
      setSuccessMessage(response.message || 'If an account exists, a reset link has been created.');
      if (response.resetLink) {
        setResetLink(response.resetLink);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to request password reset.';
      setServerError(errorMessage);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Forgot Password</CardTitle>
            <CardDescription>
              Enter your email and we will send a reset link.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              error={errors.email?.message}
              {...register('email')}
            />

            {serverError && (
              <p className="text-sm text-error-500">{serverError}</p>
            )}

            {successMessage && (
              <p className={isDark ? 'text-sm text-success-400' : 'text-sm text-success-600'}>
                {successMessage}
              </p>
            )}

            {resetLink && (
              <div className={isDark ? 'text-sm text-gray-300' : 'text-sm text-gray-700'}>
                <p>Reset link (dev):</p>
                <button
                  type="button"
                  onClick={() => {
                    if (resetLink.startsWith('http')) {
                      window.location.href = resetLink;
                    } else {
                      navigate(resetLink);
                    }
                  }}
                  className="text-brand-500 hover:text-brand-600 font-medium"
                >
                  Open reset link
                </button>
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              loading={isSubmitting}
              icon={ArrowRight}
              iconPosition="right"
            >
              Send Reset Link
            </Button>

            <div className="text-center text-sm">
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Remembered your password?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-brand-500 hover:text-brand-600 font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}
