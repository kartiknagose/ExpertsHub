// PricingPage — premium pricing cards with gradient featured tier

import { useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { Check, Zap, Shield, Star, ArrowRight } from 'lucide-react';
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

const tiers = [
  {
    name:        'Basic',
    price:       'Free',
    period:      'forever',
    description: 'Perfect for trying the platform and booking occasional services.',
    icon:        Shield,
    gradient:    'from-neutral-400 to-neutral-600',
    featured:    false,
    cta:         'Get Started Free',
    features: [
      'Browse all services',
      'Verified professionals',
      'Standard support',
      'Basic booking management',
    ],
  },
  {
    name:        'Plus',
    price:       '₹199',
    period:      '/month',
    description: 'Best for regular customers who want priority scheduling and perks.',
    icon:        Zap,
    gradient:    'from-brand-500 to-accent-500',
    featured:    true,
    cta:         'Start Plus Trial',
    badge:       'Most Popular',
    features: [
      'Everything in Basic',
      'Priority support (24h response)',
      'Faster booking confirmations',
      'Preferred worker selection',
      'Booking history export',
    ],
  },
  {
    name:        'Pro',
    price:       '₹799',
    period:      '/month',
    description: 'Designed for businesses and teams with bulk service needs.',
    icon:        Star,
    gradient:    'from-violet-500 to-accent-600',
    featured:    false,
    cta:         'Contact Sales',
    features: [
      'Everything in Plus',
      'Dedicated account manager',
      'Custom pricing agreements',
      'Team booking management',
      'Analytics & reports',
      'SLA guarantee',
    ],
  },
];

export function PricingPage() {
  usePageTitle('Pricing');
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
            <span className="text-xs font-black uppercase tracking-widest text-brand-500 mb-4 block">Transparent Pricing</span>
            <h1 className="text-5xl md:text-6xl font-black text-neutral-900 dark:text-white tracking-tight mb-4">
              Simple, honest <span className="gradient-text">pricing</span>
            </h1>
            <p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto">
              Start free and upgrade when you need more. No hidden fees, ever.
            </p>
          </Motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="section-padding bg-neutral-50 dark:bg-dark-900">
        <div className={getPageLayout('default')}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {tiers.map((tier, i) => {
              const I = tier.icon;
              return (
                <Motion.div
                  key={tier.name}
                  {...fadeUp(i * 0.12)}
                  className={[
                    'relative rounded-3xl border overflow-hidden transition-all duration-300',
                    tier.featured
                      ? 'border-brand-300 dark:border-brand-500/50 shadow-2xl shadow-brand-500/20 scale-[1.02]'
                      : 'border-neutral-200 dark:border-dark-700 bg-white dark:bg-dark-800 hover:shadow-xl',
                  ].join(' ')}
                >
                  {/* Featured gradient background */}
                  {tier.featured && (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-accent-700" />
                  )}

                  {tier.badge && (
                    <div className="absolute top-5 right-5 z-10">
                      <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-black border border-white/30">
                        {tier.badge}
                      </span>
                    </div>
                  )}

                  <div className={`relative z-10 p-8 ${!tier.featured ? '' : 'text-white'}`}>
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-2xl mb-5 flex items-center justify-center ${tier.featured ? 'bg-white/20 text-white' : `bg-gradient-to-br ${tier.gradient} text-white shadow-md`}`}>
                      <I size={22} />
                    </div>

                    {/* Name */}
                    <h3 className={`text-xl font-black mb-1 ${tier.featured ? 'text-white' : 'text-neutral-900 dark:text-white'}`}>
                      {tier.name}
                    </h3>

                    {/* Price */}
                    <div className="flex items-end gap-1 mb-3">
                      <span className={`text-4xl font-black ${tier.featured ? 'text-white' : 'gradient-text'}`}>
                        {tier.price}
                      </span>
                      {tier.period && (
                        <span className={`text-sm pb-1 ${tier.featured ? 'text-white/70' : 'text-neutral-400'}`}>
                          {tier.period}
                        </span>
                      )}
                    </div>

                    <p className={`text-sm mb-7 leading-relaxed ${tier.featured ? 'text-white/80' : 'text-neutral-500 dark:text-neutral-400'}`}>
                      {tier.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-2.5 mb-8">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm">
                          <Check size={15} className={`shrink-0 mt-0.5 ${tier.featured ? 'text-white' : 'text-success-500'}`} strokeWidth={3} />
                          <span className={tier.featured ? 'text-white/90' : 'text-neutral-600 dark:text-neutral-300'}>{f}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Button
                      fullWidth
                      onClick={() => navigate(tier.name === 'Pro' ? '/contact' : '/register')}
                      className={tier.featured ? 'bg-white text-brand-700 hover:bg-neutral-50 border-none font-bold h-11' : 'h-11'}
                      variant={tier.featured ? 'primary' : 'outline'}
                      icon={ArrowRight}
                      iconPosition="right"
                    >
                      {tier.cta}
                    </Button>
                  </div>
                </Motion.div>
              );
            })}
          </div>

          {/* Money back */}
          <Motion.p {...fadeUp(0.4)} className="text-center mt-8 text-sm text-neutral-400 dark:text-neutral-500">
            🔒 30-day money-back guarantee on paid plans. No questions asked.
          </Motion.p>
        </div>
      </section>
    </MainLayout>
  );
}
