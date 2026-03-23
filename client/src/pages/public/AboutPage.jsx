// AboutPage — rich premium layout with hero, values, team section

import { motion as Motion } from 'framer-motion';
import { Shield, Star, Users, Zap, Heart, Award, MapPin, TrendingUp } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { getPageLayout } from '../../constants/layout';
import { usePageTitle } from '../../hooks/usePageTitle';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] },
});

export function AboutPage() {
  usePageTitle('About Us');

  const values = [
    { icon: Shield, title: 'Trust & Safety',      desc: 'Every professional is background-verified and skill-tested before they can work on our platform.', gradient: 'from-brand-400 to-brand-600' },
    { icon: Star,   title: 'Quality First',        desc: 'We monitor reviews, maintain standards, and only keep top-performing professionals.', gradient: 'from-yellow-400 to-orange-500' },
    { icon: Heart,  title: 'Fair Opportunity',     desc: 'We help skilled workers build consistent income and grow their reputation with every job.', gradient: 'from-pink-400 to-accent-500' },
    { icon: Users,  title: 'Community Impact',     desc: 'By connecting local talent with local demand, we strengthen neighborhood economies.', gradient: 'from-emerald-400 to-teal-500' },
    { icon: Zap,    title: 'Speed & Reliability',  desc: 'Book in seconds, get confirmed instantly. No waiting, no guessing, no stress.', gradient: 'from-violet-400 to-brand-500' },
    { icon: Award,  title: 'Satisfaction Guaranteed', desc: "Not happy? We'll redo the job or give your money back. No questions asked.", gradient: 'from-brand-400 to-accent-500' },
  ];

  const stats = [
    { value: '50K+',  label: 'Happy Customers',      icon: Users },
    { value: '8K+',   label: 'Verified Professionals', icon: Shield },
    { value: '100K+', label: 'Services Completed',    icon: TrendingUp },
    { value: '4.9★',  label: 'Average Rating',        icon: Star },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden bg-white dark:bg-dark-950">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-20 bg-brand-400" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-[100px] opacity-15 bg-accent-400" />
        </div>

        <div className={`${getPageLayout('narrow')} relative z-10 text-center`}>
          <Motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/30 mb-8"
          >
            <MapPin size={14} className="text-brand-500" />
            <span className="text-sm font-bold text-brand-600 dark:text-brand-400">Made in India 🇮🇳</span>
          </Motion.div>

          <Motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tight mb-6 text-neutral-900 dark:text-white"
          >
            We&apos;re building<br />
            <span className="gradient-text">India&apos;s most trusted</span><br />
            home services platform
          </Motion.h1>

          <Motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed"
          >
            ExpertsHub connects customers with skill-verified, background-checked professionals for every home service need — built on trust, transparency, and respect for everyone&apos;s time.
          </Motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 border-y border-neutral-100 dark:border-dark-800 bg-neutral-50 dark:bg-dark-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-neutral-200 dark:divide-dark-700">
            {stats.map((s, i) => {
              const I = s.icon;
              return (
                <Motion.div key={s.label} {...fadeUp(i * 0.1)} className="text-center px-4">
                  <I size={20} className="mx-auto mb-2 text-brand-400" />
                  <div className="text-3xl font-black mb-1 gradient-text">{s.value}</div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">{s.label}</div>
                </Motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="section-padding bg-white dark:bg-dark-950">
        <div className={getPageLayout('default')}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <Motion.div {...fadeUp()}>
              <span className="text-xs font-black uppercase tracking-widest text-brand-500 mb-3 block">Our Mission</span>
              <h2 className="text-4xl font-black mb-6 text-neutral-900 dark:text-white tracking-tight leading-tight">
                Making quality home services <span className="gradient-text">accessible to all</span>
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed mb-6 text-lg">
                We believe every household deserves reliable, affordable, and professional help — and every skilled worker deserves dignified work, fair pay, and growth opportunities.
              </p>
              <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-lg">
                ExpertsHub is built on a foundation of verification, transparency, and accountability — so both sides of every booking feel confident and protected.
              </p>
            </Motion.div>

            <Motion.div {...fadeUp(0.15)} className="grid grid-cols-2 gap-4">
              {[
                { emoji: '🎯', title: 'Verified',     sub: 'Every professional is vetted' },
                { emoji: '💳', title: 'Secure Pay',    sub: 'Escrow-protected payments' },
                { emoji: '📞', title: '24/7 Support',  sub: 'Always here for you' },
                { emoji: '⭐', title: 'Rated',         sub: '5-star quality guarantee' },
              ].map((item) => (
                <div key={item.title} className="p-5 rounded-2xl bg-neutral-50 dark:bg-dark-800 border border-neutral-100 dark:border-dark-700 hover:border-brand-200 dark:hover:border-brand-500/30 transition-colors">
                  <div className="text-3xl mb-2">{item.emoji}</div>
                  <p className="font-bold text-neutral-900 dark:text-white mb-0.5">{item.title}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{item.sub}</p>
                </div>
              ))}
            </Motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-neutral-50 dark:bg-dark-900">
        <div className={getPageLayout('wide')}>
          <Motion.div {...fadeUp()} className="text-center mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-brand-500 mb-3 block">Our Values</span>
            <h2 className="text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
              What we stand for
            </h2>
          </Motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => {
              const I = v.icon;
              return (
                <Motion.div
                  key={v.title}
                  {...fadeUp(i * 0.07)}
                  className="p-8 rounded-2xl bg-white dark:bg-dark-800 border border-neutral-100 dark:border-dark-700 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${v.gradient} flex items-center justify-center mb-4 text-white shadow-md`}>
                    <I size={22} />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-neutral-900 dark:text-white">{v.title}</h3>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">{v.desc}</p>
                </Motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
