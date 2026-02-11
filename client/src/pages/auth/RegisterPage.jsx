// Customer registration page
// Creates a new customer account using AuthContext

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Mail, Phone, Lock, UserPlus, Briefcase } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common';
import { Input, Button } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';

// Validation schema for customer registration
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  mobile: z.string().min(8, 'Please enter a valid mobile number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export function RegisterPage() {
  const { isDark } = useTheme();
  const { register: registerCustomer, registerAsWorker } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [serverError, setServerError] = useState('');
  const [role, setRole] = useState(() => {
    return searchParams.get('role') === 'worker' ? 'WORKER' : 'CUSTOMER';
  });

  // Keep role in sync with URL if user lands via link
  useEffect(() => {
    setRole(searchParams.get('role') === 'worker' ? 'WORKER' : 'CUSTOMER');
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setServerError('');

    // Remove confirmPassword before sending to API
    const { confirmPassword, ...payload } = data;

    const result = role === 'WORKER'
      ? await registerAsWorker(payload)
      : await registerCustomer(payload);

    if (!result.success) {
      setServerError(result.error || 'Registration failed');
      return;
    }

    // Navigate to login after successful registration
    navigate('/login');
  };

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Create Your Account</CardTitle>
            <CardDescription>
              {role === 'WORKER'
                ? 'Sign up as a worker to offer services'
                : 'Sign up as a customer to book services'}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Role Selection */}
            <div>
              <p className={isDark ? 'text-sm text-gray-300 mb-2' : 'text-sm text-gray-700 mb-2'}>
                I want to
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('CUSTOMER')}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    role === 'CUSTOMER'
                      ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white border-transparent'
                      : isDark
                        ? 'bg-dark-800 text-gray-300 border-dark-700 hover:border-brand-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-brand-500'
                  }`}
                >
                  <User size={18} />
                  Book Services
                </button>
                <button
                  type="button"
                  onClick={() => setRole('WORKER')}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    role === 'WORKER'
                      ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white border-transparent'
                      : isDark
                        ? 'bg-dark-800 text-gray-300 border-dark-700 hover:border-brand-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-brand-500'
                  }`}
                >
                  <Briefcase size={18} />
                  Offer Services
                </button>
              </div>
            </div>
            {/* Name */}
            <Input
              label="Full Name"
              placeholder="John Doe"
              icon={User}
              error={errors.name?.message}
              {...register('name')}
            />

            {/* Email */}
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              error={errors.email?.message}
              {...register('email')}
            />

            {/* Mobile */}
            <Input
              label="Mobile"
              type="tel"
              placeholder="+1234567890"
              icon={Phone}
              error={errors.mobile?.message}
              {...register('mobile')}
            />

            {/* Password */}
            <Input
              label="Password"
              type="password"
              placeholder="Create a strong password"
              icon={Lock}
              error={errors.password?.message}
              {...register('password')}
            />

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              icon={Lock}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            {/* Server Error */}
            {serverError && (
              <p className="text-sm text-error-500">{serverError}</p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              loading={isSubmitting}
              icon={UserPlus}
              iconPosition="right"
            >
              Create Account
            </Button>

            {/* Links */}
            <div className="text-center text-sm">
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-brand-500 hover:text-brand-600 font-medium"
                >
                  Sign in
                </button>
              </p>
              <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Want to offer services?{' '}
                <button
                  type="button"
                  onClick={() => setRole('WORKER')}
                  className="text-brand-500 hover:text-brand-600 font-medium"
                >
                  Switch to worker
                </button>
              </p>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}
