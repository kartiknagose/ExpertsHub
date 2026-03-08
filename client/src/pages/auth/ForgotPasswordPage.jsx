// Forgot password page
// Requests a password reset link

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input, Button } from '../../components/common';
import { requestPasswordReset } from '../../api/auth';
import { usePageTitle } from '../../hooks/usePageTitle';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

export function ForgotPasswordPage() {
    usePageTitle('Forgot Password');
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
    <AuthLayout
      title="Forgot your password?"
      subtitle="No worries — we'll help you get back into your account securely."
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Reset Password</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Enter your email and we'll send a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
              <p className="text-sm text-success-600 dark:text-success-400">
                {successMessage}
              </p>
            )}

            {import.meta.env.DEV && resetLink && (
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <p>Reset link (dev only):</p>
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
              <p className="text-gray-600 dark:text-gray-400">
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
    </AuthLayout>
  );
}
