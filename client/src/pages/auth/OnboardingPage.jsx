// OnboardingPage — collects additional profile info (full name, mobile number, role)
// after a user signs up through Clerk. Clerk handles email/password; this
// page syncs the extra fields to our database.

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Phone, User, Briefcase, ArrowRight } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input, Button } from '../../components/common';
import { useAuth } from '../../hooks/useAuth';
import { usePageTitle } from '../../hooks/usePageTitle';

const onboardingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  mobile: z
    .string()
    .min(10, 'Mobile must be at least 10 digits')
    .regex(/^[0-9]+$/, 'Must be only digits'),
});

export function OnboardingPage() {
  usePageTitle('Complete Your Profile');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'worker' ? 'WORKER' : 'CUSTOMER';
  const [role, setRole] = useState(initialRole);
  const [serverError, setServerError] = useState('');

  const { syncClerkUser, clearError } = useAuth();
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();

  const clerkFullName = clerkUser
    ? `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.username || ''
    : '';

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { name: clerkFullName },
  });

  const onSubmit = async (data) => {
    setServerError('');
    clearError();

    if (!clerkLoaded || !clerkUser) {
      setServerError('Session not ready. Please refresh and try again.');
      return;
    }

    const profileData = {
      name: data.name,
      email: clerkUser.primaryEmailAddress?.emailAddress || '',
      mobile: data.mobile,
      role,
    };

    const result = await syncClerkUser(profileData);
    if (!result.success) {
      setServerError(result.error || 'Profile setup failed. Please try again.');
      return;
    }

    if (role === 'WORKER') {
      navigate('/worker/dashboard');
    } else {
      navigate('/customer/dashboard');
    }
  };

  return (
    <AuthLayout
      title="Almost there!"
      subtitle="Just a few more details to complete your UrbanPro profile."
    >
      <Motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-7">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-1.5 tracking-tight">
            Complete Your Profile
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Your email has been verified! Now tell us a bit more.
          </p>
        </div>

        {/* Role Switcher */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            I want to join as…
          </p>
          <div className="flex bg-neutral-100 dark:bg-dark-800 p-1 rounded-xl border border-neutral-200 dark:border-dark-700">
            {[
              { id: 'CUSTOMER', label: 'Customer', icon: User },
              { id: 'WORKER', label: 'Professional', icon: Briefcase },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setRole(id)}
                className={[
                  'relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200',
                  role === id
                    ? 'bg-white dark:bg-dark-700 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200',
                ].join(' ')}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            icon={User}
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Mobile Number"
            type="tel"
            placeholder="9876543210"
            icon={Phone}
            error={errors.mobile?.message}
            hint="10-digit mobile number without country code"
            {...register('mobile')}
          />

          {serverError && (
            <Motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-error-50 dark:bg-error-500/10 border border-error-200 dark:border-error-500/30 text-sm font-medium text-error-700 dark:text-error-400"
            >
              {serverError}
            </Motion.div>
          )}

          <Button
            type="submit"
            fullWidth
            size="lg"
            variant="gradient"
            loading={isSubmitting}
            icon={ArrowRight}
            iconPosition="right"
            className="h-14 text-base font-bold rounded-2xl shadow-xl shadow-brand-500/20"
          >
            Get Started
          </Button>
        </form>
      </Motion.div>
    </AuthLayout>
  );
}


