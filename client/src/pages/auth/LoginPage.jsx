// Login page for all users (Customer, Worker, Admin)
// Uses AuthContext to authenticate and redirect based on role

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common';
import { Input, Button } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';

// Validation schema for login form
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export function LoginPage() {
  const { isDark } = useTheme();
  const { login, error: authError, clearError } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  // Handle form submit
  const onSubmit = async (data) => {
    setServerError('');
    clearError();

    const result = await login(data);

    if (!result.success) {
      setServerError(result.error || 'Login failed');
      return;
    }

    // Redirect user based on role
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.role === 'ADMIN') {
      navigate('/admin/dashboard');
    } else if (user?.role === 'WORKER') {
      navigate('/worker/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Sign in to access your dashboard
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              error={errors.email?.message}
              {...register('email', {
                onChange: () => {
                  setServerError('');
                  clearError();
                },
              })}
            />

            {/* Password */}
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              icon={Lock}
              error={errors.password?.message}
              {...register('password', {
                onChange: () => {
                  setServerError('');
                  clearError();
                },
              })}
            />

            {/* Server Error */}
            {(serverError || authError) && (
              <p className="text-sm text-error-500">{serverError || authError}</p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              loading={isSubmitting}
              icon={LogIn}
              iconPosition="right"
            >
              Sign In
            </Button>

            {/* Links */}
            <div className="text-center text-sm">
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-brand-500 hover:text-brand-600 font-medium"
                >
                  Forgot password?
                </button>
              </p>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="text-brand-500 hover:text-brand-600 font-medium"
                >
                  Sign up
                </button>
              </p>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}
