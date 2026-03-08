// Login page for all users (Customer, Worker, Admin)
// Uses AuthContext to authenticate and redirect based on role

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Input, Button } from '../../components/common';
import { useAuth } from '../../hooks/useAuth';
import { IMAGES } from '../../constants/images';
import { usePageTitle } from '../../hooks/usePageTitle';

// Validation schema for login form
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export function LoginPage() {
    usePageTitle('Log In');
  const { login, error: authError, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { email: defaultEmail, message: successMessage } = location.state || {};
  const [serverError, setServerError] = useState('');

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: defaultEmail || '',
    },
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

    // Redirect user based on role from the API response
    // Access result directly rather than localStorage which might be stale
    const userRole = result.user?.role;

    // Small delay to ensure state updates
    setTimeout(() => {
      if (userRole === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (userRole === 'WORKER') {
        navigate('/worker/dashboard');
      } else {
        navigate('/dashboard');
      }
    }, 100);
  };

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-64px)] flex bg-gray-50 dark:bg-dark-950">

        {/* Left Side - Visual Branding (Hidden on mobile) */}
        <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center p-12">
          {/* Gradient mesh background */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-accent-700" />
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)' }} />
          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full border border-white/10" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full border border-white/10" />
          <div className="absolute top-1/3 right-8 w-32 h-32 rounded-full border border-white/10" />

          <div className="relative z-10 max-w-lg text-white">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-xl">U</span>
              </div>
              <span className="text-2xl font-bold">UrbanPro</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-extrabold mb-5 leading-tight">
              Welcome back to{' '}
              <span className="text-white/80">UrbanPro</span>
            </h1>
            <p className="text-lg text-brand-100 mb-10 leading-relaxed">
              Manage your bookings, connect with professionals, or grow your service business — all in one place.
            </p>

            {/* Stats glass cards */}
            <div className="grid grid-cols-3 gap-4 mb-10">
              {[
                { value: '50K+', label: 'Customers' },
                { value: '8K+', label: 'Professionals' },
                { value: '4.9★', label: 'Avg Rating' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-black mb-0.5">{stat.value}</div>
                  <div className="text-xs text-brand-200">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* User avatars */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {[IMAGES.AVATAR_USER_1, IMAGES.AVATAR_USER_2, IMAGES.AVATAR_WORKER_1, IMAGES.AVATAR_WORKER_2].map((src, i) => (
                  <img key={i} src={src} className="w-10 h-10 rounded-full border-2 border-brand-500 bg-gray-200 object-cover" alt="User" />
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-white/30 bg-white/20 backdrop-blur-sm flex items-center justify-center text-xs font-bold text-white">
                  +2k
                </div>
              </div>
              <p className="text-sm text-brand-100">Trusted by thousands of users</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative bg-white dark:bg-dark-950">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="flex lg:hidden items-center gap-2.5 mb-8">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-accent-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">U</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent">UrbanPro</span>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Sign In</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter your credentials to access your account
              </p>
            </div>

            {successMessage && (
              <div className="p-4 rounded-xl bg-success-50 text-success-700 text-sm border border-success-100 dark:bg-success-900/20 dark:border-success-800 dark:text-success-400 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success-500"></div>
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-5">
                <Input
                  label="Email Address"
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
                  className="h-12"
                />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                    <button
                      type="button"
                      onClick={() => navigate('/forgot-password')}
                      className="text-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    type="password"
                    placeholder="Your password"
                    icon={Lock}
                    error={errors.password?.message}
                    {...register('password', {
                      onChange: () => {
                        setServerError('');
                        clearError();
                      },
                    })}
                    className="h-12"
                  />
                </div>
              </div>

              {/* Server Error */}
              {(serverError || authError) && (
                <div className="p-4 rounded-xl bg-error-50 text-error-600 text-sm border border-error-100 dark:bg-error-900/20 dark:border-error-800 dark:text-error-400">
                  {serverError || authError}
                </div>
              )}

              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={isSubmitting}
                icon={LogIn}
                iconPosition="right"
                className="h-12 text-lg shadow-lg shadow-brand-500/20"
              >
                Sign In
              </Button>

              <div className="pt-6 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="font-bold text-brand-600 hover:text-brand-500 dark:text-brand-400 transition-colors inline-flex items-center gap-1"
                  >
                    Sign up for free <ArrowRight size={14} />
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
