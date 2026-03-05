// Reset password page
// Sets a new password using reset token

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Save } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common';
import { Input, Button } from '../../components/common';
import { resetPassword } from '../../api/auth';

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export function ResetPasswordPage() {
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
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              Choose a new password for your account.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        </Card>
      </div>
    </MainLayout>
  );
}
