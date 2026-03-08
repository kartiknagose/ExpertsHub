// Reset password page
// Sets a new password using reset token

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Save } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input, Button } from '../../components/common';
import { resetPassword } from '../../api/auth';
import { usePageTitle } from '../../hooks/usePageTitle';

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export function ResetPasswordPage() {
    usePageTitle('Reset Password');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const token = searchParams.get('token') || '';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data) => {
    setServerError('');
    setSuccessMessage('');

    if (!token) {
      setServerError('Reset token is missing. Please use the link from your email.');
      return;
    }

    try {
      await resetPassword({ token, password: data.password });
      setSuccessMessage('Password reset successfully. You can sign in now.');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to reset password.';
      setServerError(errorMessage);
    }
  };

  return (
    <AuthLayout
      title="Set your new password"
      subtitle="Choose a strong, unique password to keep your account secure."
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Reset Password</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose a new password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="New Password"
              type="password"
              placeholder="Create a strong password"
              icon={Lock}
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              icon={Lock}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            {serverError && (
              <p className="text-sm text-error-500">{serverError}</p>
            )}

            {successMessage && (
              <p className="text-sm text-success-600 dark:text-success-400">
                {successMessage}
              </p>
            )}

            <Button
              type="submit"
              fullWidth
              loading={isSubmitting}
              icon={Save}
              iconPosition="right"
            >
              Update Password
            </Button>

            <div className="text-center text-sm">
              <p className="text-gray-600 dark:text-gray-400">
                Go back to{' '}
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
