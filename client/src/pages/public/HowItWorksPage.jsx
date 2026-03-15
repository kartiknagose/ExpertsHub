// HowItWorksPage — premium timeline steps for customers and workers

import { useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { UserPlus, Search, CalendarCheck, Star, ArrowRight, Shield, Wallet, CheckCircle, MessageSquare } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Button } from '../../components/common';
import { getPageLayout } from '../../constants/layout';
import { usePageTitle } from '../../hooks/usePageTitle';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] },
});

const customerSteps = [
  { step: '01', icon: UserPlus,     title: 'Create Account',       desc: 'Sign up for free in minutes. No credit card required.', gradient: 'from-brand-400 to-brand-600' },
  { step: '02', icon: Search,       title: 'Find a Service',        desc: 'Browse categories, filter by rating, and pick the right professional.', gradient: 'from-violet-400 to-accent-500' },
  { step: '03', icon: CalendarCheck, title: 'Book & Schedule',     desc: 'Choose your date and time. Get instant confirmation.', gradient: 'from-emerald-400 to-teal-500' },
  { step: '04', icon: Wallet,        title: 'Pay Securely',         desc: 'Your payment is held in escrow until the job is done to your satisfaction.', gradient: 'from-yellow-400 to-orange-500' },
  { step: '05', icon: Star,          title: 'Rate & Review',        desc: 'Share honest feedback to help the community and reward great work.', gradient: 'from-pink-400 to-accent-500' },
];

const workerSteps = [
  { step: '01', icon: UserPlus,      title: 'Apply and Verify',     desc: 'Submit your professional profile. We verify your identity and skills.', gradient: 'from-brand-400 to-brand-600' },
  { step: '02', icon: Shield,        title: 'Get Approved',          desc: 'Our team reviews your application and approves your profile.', gradient: 'from-violet-400 to-accent-500' },
  { step: '03', icon: MessageSquare, title: 'Accept Bookings',       desc: 'Browse open jobs or receive direct requests from customers.', gradient: 'from-emerald-400 to-teal-500' },
  { step: '04', icon: CheckCircle,   title: 'Complete the Job',      desc: 'Do excellent work, verify completion with the customer OTP.', gradient: 'from-yellow-400 to-orange-500' },
  { step: '05', icon: Wallet,        title: 'Get Paid',              desc: 'Payment is released directly to you after job completion.', gradient: 'from-pink-400 to-accent-500' },
];

function StepRow({ steps }) {
  return (
    <div className="relative">
      {/* Connector line */}
      <div className="hidden lg:block absolute top-8 left-[8.5%] right-[8.5%] h-0.5 bg-gradient-to-r from-brand-200 via-accent-200 to-brand-200 dark:from-brand-500/20 dark:via-accent-500/20 dark:to-brand-500/20" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {steps.map((s, i) => {
          const I = s.icon;
          return (
            <Motion.div
              key={s.step}
              {...fadeUp(i * 0.1)}
              className="relative text-center group"
            >
              {/* Icon container */}
              <div className="relative inline-flex mb-5">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <I size={26} />
                </div>
                <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-lg bg-neutral-900 dark:bg-dark-700 border-2 border-white dark:border-dark-800 text-white text-[10px] font-black flex items-center justify-center">
                  {s.step}
                </span>
              </div>
              <h3 className="text-base font-bold mb-2 text-neutral-900 dark:text-white">{s.title}</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{s.desc}</p>
            </Motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function HowItWorksPage() {
  usePageTitle('How It Works');
  const navigate = useNavigate();

  return (
    <MainLayout>
      {/* Hero */}
      <section className="py-20 bg-white dark:bg-dark-950 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-80 h-80 rounded-full blur-[120px] opacity-15 bg-brand-400" />
          <div className="absolute bottom-0 right-1/3 w-64 h-64 rounded-full blur-[100px] opacity-10 bg-accent-400" />
        </div>
        <div className={`${getPageLayout('narrow')} relative z-10`}>
          <Motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-xs font-black uppercase tracking-widest text-brand-500 mb-4 block">Simple Process</span>
            <h1 className="text-5xl md:text-6xl font-black text-neutral-900 dark:text-white tracking-tight mb-5">
              How <span className="gradient-text">UrbanPro</span> Works
            </h1>
            <p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
              From signup to service completion — we&apos;ve made it seamless for both customers and professionals.
            </p>
          </Motion.div>
        </div>
      </section>

      {/* Customer Journey */}
      <section className="section-padding bg-neutral-50 dark:bg-dark-900">
        <div className={getPageLayout('wide')}>
          <Motion.div {...fadeUp()} className="mb-14 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-100 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400 text-sm font-bold mb-4">
              👤 For Customers
            </span>
            <h2 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">Book a service in 5 easy steps</h2>
          </Motion.div>
          <StepRow steps={customerSteps} />
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-neutral-200 dark:via-dark-700 to-transparent" />

      {/* Worker Journey */}
      <section className="section-padding bg-white dark:bg-dark-950">
        <div className={getPageLayout('wide')}>
          <Motion.div {...fadeUp()} className="mb-14 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-100 dark:bg-accent-500/15 text-accent-600 dark:text-accent-400 text-sm font-bold mb-4">
              💼 For Professionals
            </span>
            <h2 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">Start earning in 5 steps</h2>
          </Motion.div>
          <StepRow steps={workerSteps} />
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-neutral-50 dark:bg-dark-900">
        <div className={getPageLayout('narrow')}>
          <Motion.div {...fadeUp()} className="relative rounded-[2.5rem] p-12 text-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed, #9d174d)' }}>
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-[80px]" aria-hidden="true" />
            <h2 className="text-3xl font-black text-white mb-4 relative z-10">Ready to get started?</h2>
            <p className="text-white/80 mb-8 relative z-10">Join thousands of happy users today — it&apos;s completely free to sign up.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center relative z-10">
              <Button size="lg" onClick={() => navigate('/register')} className="h-12 px-8 bg-white text-brand-700 font-bold border-none shadow-xl">
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/register?role=worker')} className="h-12 px-8 border-white/30 text-white hover:bg-white/10">
                Join as Pro
              </Button>
            </div>
          </Motion.div>
        </div>
      </section>
    </MainLayout>
  );
}
