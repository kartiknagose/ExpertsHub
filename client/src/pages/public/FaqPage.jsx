// FaqPage — interactive accordion with categories

import { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Users, Wallet, Shield, Star } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { getPageLayout } from '../../constants/layout';
import { usePageTitle } from '../../hooks/usePageTitle';

const categories = [
  {
    id: 'general',
    label: 'General',
    icon: HelpCircle,
    faqs: [
      { q: 'What is ExpertsHub?', a: 'ExpertsHub is India\'s trusted home services marketplace connecting customers with verified, skilled professionals for all types of home services — from cleaning and plumbing to electrical and painting.' },
      { q: 'Is ExpertsHub available in my city?', a: 'ExpertsHub is currently expanding across major Indian cities. Sign up to check availability in your area.' },
      { q: 'Is ExpertsHub free to use for customers?', a: 'Yes! Creating an account and browsing services is completely free. You only pay when you book a service.' },
    ],
  },
  {
    id: 'booking',
    label: 'Bookings',
    icon: Users,
    faqs: [
      { q: 'How do I book a service?', a: 'Browse services, choose a professional that fits your needs and budget, then pick a date and time that works for you. Booking takes less than 2 minutes.' },
      { q: 'Can I reschedule or cancel a booking?', a: 'Yes. You can reschedule or cancel bookings based on the service policy. Cancellations made well in advance are generally free.' },
      { q: 'What if the professional doesn\'t show up?', a: 'We guarantee a replacement professional or a full refund if a professional fails to show up without valid reason.' },
      { q: 'How do I know the job is done well?', a: 'We use a customer OTP-verification system to confirm job completion. Payments are only released after you verify the job is done to satisfaction.' },
    ],
  },
  {
    id: 'payments',
    label: 'Payments',
    icon: Wallet,
    faqs: [
      { q: 'How does payment work?', a: 'Your payment is held securely in escrow until the job is completed to your satisfaction. Then it\'s released to the professional.' },
      { q: 'What payment methods are accepted?', a: 'We accept all major UPI apps, credit/debit cards, net banking, and wallets.' },
      { q: 'Is my payment information secure?', a: 'Absolutely. We use industry-standard encryption and never store your card details directly.' },
    ],
  },
  {
    id: 'workers',
    label: 'Professionals',
    icon: Shield,
    faqs: [
      { q: 'Are workers background-checked?', a: 'Yes. Every professional on ExpertsHub goes through identity verification and skill assessment before being approved to take bookings.' },
      { q: 'How do I become a professional on ExpertsHub?', a: 'Sign up with a Professional account, complete your profile, and submit your verification documents. Our team will review and approve your account.' },
      { q: 'How do professionals get paid?', a: 'Payments are released directly after service completion and customer OTP confirmation, usually within 24 hours.' },
    ],
  },
];

function FaqItem({ faq, isOpen, onToggle }) {
  return (
    <div className="border-b border-neutral-100 dark:border-dark-700 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 px-1 text-left gap-4 group"
        aria-expanded={isOpen}
      >
        <span className={`text-base font-semibold transition-colors ${isOpen ? 'text-brand-600 dark:text-brand-400' : 'text-neutral-900 dark:text-neutral-100 group-hover:text-brand-600 dark:group-hover:text-brand-400'}`}>
          {faq.q}
        </span>
        <Motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-brand-500 text-white' : 'bg-neutral-100 dark:bg-dark-700 text-neutral-400'}`}
        >
          <ChevronDown size={16} />
        </Motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <Motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-neutral-500 dark:text-neutral-400 leading-relaxed text-[15px]">
              {faq.a}
            </p>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FaqPage() {
  usePageTitle('FAQ');
  const [activeCategory, setActiveCategory] = useState('general');
  const [openIndex, setOpenIndex] = useState(null);

  const currentFaqs = categories.find((c) => c.id === activeCategory)?.faqs || [];

  return (
    <MainLayout>
      {/* Hero */}
      <section className="py-20 bg-white dark:bg-dark-950 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-72 h-72 rounded-full blur-[120px] opacity-15 bg-brand-400" />
        </div>
        <div className={`${getPageLayout('narrow')} relative z-10`}>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-100 to-accent-100 dark:from-brand-500/20 dark:to-accent-500/20 flex items-center justify-center mx-auto mb-8 border border-brand-100 dark:border-brand-500/20">
            <HelpCircle size={28} className="text-brand-500" />
          </div>
          <h1 className="text-5xl font-black text-neutral-900 dark:text-white tracking-tight mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h1>
          <p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto">
            Everything you need to know about ExpertsHub — answered here.
          </p>
        </div>
      </section>

      <section className="section-padding bg-neutral-50 dark:bg-dark-900">
        <div className={getPageLayout('narrow')}>
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {categories.map((cat) => {
              const I = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); setOpenIndex(null); }}
                  className={[
                    'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all',
                    activeCategory === cat.id
                      ? 'bg-brand-500 text-white shadow-brand-sm'
                      : 'bg-white dark:bg-dark-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-dark-700 hover:border-brand-300 dark:hover:border-brand-500/30',
                  ].join(' ')}
                >
                  <I size={15} />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* FAQ List */}
          <Motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-dark-800 rounded-3xl border border-neutral-100 dark:border-dark-700 shadow-card overflow-hidden"
          >
            <div className="p-6">
              {currentFaqs.map((faq, index) => (
                <FaqItem
                  key={faq.q}
                  faq={faq}
                  isOpen={openIndex === index}
                  onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                />
              ))}
            </div>
          </Motion.div>

          {/* Still need help */}
          <Motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-10 p-8 rounded-3xl text-center bg-gradient-to-br from-brand-50 to-accent-50 dark:from-brand-500/10 dark:to-accent-500/10 border border-brand-100 dark:border-brand-500/20"
          >
            <Star size={24} className="text-brand-500 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Still have questions?</h3>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-4">
              Our support team is available Mon–Sat 8AM–8PM to help you.
            </p>
            <a
              href="mailto:support@expertshub.tech"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-bold hover:bg-brand-600 transition-colors shadow-brand-sm"
            >
              Email Support
            </a>
          </Motion.div>
        </div>
      </section>
    </MainLayout>
  );
}
