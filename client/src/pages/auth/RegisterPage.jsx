// Registration page for new users (Customer and Worker)
// Handles user creation, role selection, and validation

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Briefcase, ArrowRight, CheckCircle } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Input, Button, Badge } from '../../components/common';
import { useAuth } from '../../hooks/useAuth';
import { IMAGES } from '../../constants/images';
import { usePageTitle } from '../../hooks/usePageTitle';

// Validation schema for registration form
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  mobile: z.string().min(10, 'Mobile must be at least 10 digits').regex(/^[0-9]+$/, 'Must be only digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export function RegisterPage() {
    usePageTitle('Sign Up');
  const { register: registerUser, registerAsWorker, error: authError, clearError } = useAuth();
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const searchParams = new URLSearchParams(routerLocation.search);
  const initialRole = searchParams.get('role') === 'worker' ? 'WORKER' : 'CUSTOMER';
  const [role, setRole] = useState(initialRole);
  const [serverError, setServerError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [ackMessage, setAckMessage] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  // Handle form submit
  const onSubmit = async (data) => {
    setServerError('');
    clearError();
    setAckMessage('Submitting your registration. Check your email for the verification link once complete.');
    setSubmittedEmail(data.email);

    const userData = {
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      password: data.password,
      role,
    };

    let result;
    if (role === 'WORKER') {
      result = await registerAsWorker(userData);
    } else {
      result = await registerUser(userData);
    }

    if (!result.success) {
      setAckMessage('');
      setServerError(result.error || 'Registration failed. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Force ensure loading is off in context just in case, though context should handle it.
    // We can't access setLoading here directly as it wasn't destructured.
    // But since we fixed AuthContext, this part SHOULD be fine.

    // Show success message instead of redirecting
    setIsSuccess(true);
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setServerError('');
    clearError();
  };


  return (
    <MainLayout>
<div className="min-h-[calc(100vh-64px)] flex bg-gray-50 dark:bg-dark-950">

        {/* Left Side - Visual Branding (Hidden on mobile) */}
        <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center p-12">
          {/* Gradient mesh background */}
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-600 via-accent-600 to-brand-700" />
          <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 40%)' }} />
          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full border border-white/10" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full border border-white/10" />

          <div className="relative z-10 max-w-lg text-white">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-xl">U</span>
              </div>
              <span className="text-2xl font-bold">UrbanPro</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-extrabold mb-5 leading-tight">
              Join the{' '}
              <span className="text-white/80">
                {role === 'WORKER' ? 'Professional' : 'Customer'}
              </span>{' '}
              Community
            </h1>
            <p className="text-lg text-brand-100 mb-10 leading-relaxed">
              {role === 'WORKER'
                ? 'Expand your business, find new clients, and manage your schedule effortlessly.'
                : 'Get access to top-rated professionals for all your home service needs.'}
            </p>

            {/* Benefits */}
            <div className="space-y-4 mb-10">
              {[
                'Verified & Secure Platform',
                role === 'WORKER' ? 'Guaranteed Payments' : 'Quality Assurance',
                '24/7 Dedicated Support',
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle size={14} className="text-white" />
                  </div>
                  <span className="font-medium text-base">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: role === 'WORKER' ? '8K+' : '50K+', label: role === 'WORKER' ? 'Professionals' : 'Customers' },
                { value: '120+', label: 'Cities' },
                { value: '4.9★', label: 'Rating' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center">
                  <div className="text-xl font-black mb-0.5">{stat.value}</div>
                  <div className="text-xs text-brand-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Register Form OR Success Message */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto bg-white dark:bg-dark-950">
          <div className={`max-w-md w-full my-auto transition-all duration-300`}>

            {/* Mobile Logo */}
            <div className="flex lg:hidden items-center gap-2.5 mb-8">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-accent-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">U</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent">UrbanPro</span>
            </div>

            {isSuccess ? (
              <div className="text-center animate-fadeIn">
                <div className="w-20 h-20 bg-success-100 text-success-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail size={40} />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Check your inbox</h2>
                <p className="text-lg mb-8 text-gray-600 dark:text-gray-300">
                  We&apos;ve sent a verification link to {submittedEmail || 'your email address'}. Please click the link to verify your account.
                </p>
                <div className="p-4 bg-brand-50 dark:bg-brand-900/20 rounded-lg border border-brand-100 dark:border-brand-800 text-sm text-brand-700 dark:text-brand-300 mb-8">
                  <strong>Tip:</strong> If you don&apos;t see the email, check your spam folder.
                </div>
                <Button
                  fullWidth
                  onClick={() => navigate('/login')}
                  variant="outline"
                >
                  Go to Login
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Create Account</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sign up to get started for free</p>
                </div>

                {/* Role Switcher */}
                <div className="flex bg-gray-100 dark:bg-dark-800 p-1 rounded-xl mb-8">
                  <button
                    onClick={() => handleRoleChange('CUSTOMER')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${role === 'CUSTOMER'
                      ? 'bg-white dark:bg-dark-700 text-brand-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                  >
                    <User size={16} /> Customer
                  </button>
                  <button
                    onClick={() => handleRoleChange('WORKER')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${role === 'WORKER'
                      ? 'bg-white dark:bg-dark-700 text-brand-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                  >
                    <Briefcase size={16} /> Professional
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Input
                    label="Full Name"
                    placeholder="John Doe"
                    icon={User}
                    error={errors.name?.message}
                    {...register('name')}
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="you@example.com"
                    icon={Mail}
                    error={errors.email?.message}
                    {...register('email', { onChange: () => { setServerError(''); clearError(); } })}
                  />

                  <Input
                    label="Mobile Number"
                    type="tel"
                    placeholder="9876543210"
                    icon={Briefcase}
                    error={errors.mobile?.message}
                    {...register('mobile')}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Password"
                      type="password"
                      placeholder="Min 6 chars"
                      icon={Lock}
                      error={errors.password?.message}
                      {...register('password')}
                    />
                    <Input
                      label="Confirm Password"
                      type="password"
                      placeholder="Repeat password"
                      icon={Lock}
                      error={errors.confirmPassword?.message}
                      {...register('confirmPassword')}
                    />
                  </div>

                  {/* Server Error */}
                  {(serverError || authError) && (
                    <div className="p-3 rounded-xl bg-error-50 text-error-600 text-sm border border-error-100 dark:bg-error-900/20 dark:border-error-800 dark:text-error-400">
                      {serverError || authError}
                    </div>
                  )}

                  {ackMessage && !serverError && !authError && (
                    <div className="p-3 rounded-xl bg-brand-50 text-brand-700 text-sm border border-brand-100 dark:bg-brand-900/20 dark:border-brand-800 dark:text-brand-300">
                      {ackMessage}
                    </div>
                  )}

                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    loading={isSubmitting}
                    className="mt-6 h-12 text-lg shadow-lg shadow-brand-500/20"
                  >
                    {role === 'WORKER' ? 'Join as Professional' : 'Create Account'}
                  </Button>

                  <div className="mt-8 text-center border-t border-gray-200 dark:border-gray-800 pt-6">
                    <p className="text-gray-600 dark:text-gray-400">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="font-bold text-brand-600 hover:text-brand-500 dark:text-brand-400 inline-flex items-center gap-1"
                      >
                        Sign in <ArrowRight size={14} />
                      </button>
                    </p>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
