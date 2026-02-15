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
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { IMAGES } from '../../constants/images';

// Validation schema for login form
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export function LoginPage() {
  const { isDark } = useTheme();
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
    const user = result.user; // Use the user object returned from login

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
      <div className={`min-h-[calc(100vh-64px)] flex ${isDark ? 'bg-dark-950' : 'bg-gray-50'}`}>

        {/* Left Side - Visual Branding (Hidden on mobile) */}
        <div className="hidden lg:flex flex-1 relative overflow-hidden bg-brand-600 items-center justify-center p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-brand-800 z-0"></div>
          <div className="absolute inset-0 bg-cover bg-center opacity-20 z-0 mix-blend-overlay" style={{ backgroundImage: `url(${IMAGES.AUTH_LOGIN_BG})` }}></div>

          <div className="relative z-10 max-w-lg text-white">
            <h1 className="text-5xl font-extrabold mb-6 leading-tight">Welcome back to UrbanPro</h1>
            <p className="text-xl text-brand-100 mb-8">
              Login to manage your bookings, connect with professionals, or grow your service business.
            </p>

            <div className="flex -space-x-4 mb-6">
              {[IMAGES.AVATAR_USER_1, IMAGES.AVATAR_USER_2, IMAGES.AVATAR_WORKER_1, IMAGES.AVATAR_WORKER_2].map((src, i) => (
                <img key={i} src={src} className="w-12 h-12 rounded-full border-2 border-brand-500 bg-gray-200 object-cover" alt="User" />
              ))}
              <div className="w-12 h-12 rounded-full border-2 border-brand-500 bg-brand-800 flex items-center justify-center text-xs font-bold">+2k</div>
            </div>
            <p className="text-sm text-brand-200">Join thousands of verified users today.</p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-24 relative">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:text-left">
              <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Sign In</h2>
              <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Enter your details to access your account
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
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
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
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
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
