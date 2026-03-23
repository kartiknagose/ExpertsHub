// ContactPage — premium contact cards, inquiry form

import { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, CheckCircle } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Input, Button, Textarea } from '../../components/common';
import { getPageLayout } from '../../constants/layout';
import { usePageTitle } from '../../hooks/usePageTitle';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] },
});

export function ContactPage() {
  usePageTitle('Contact Us');
  const [sent, setSent] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const contactItems = [
    { icon: Mail,  label: 'Email Us',      value: 'support@ExpertsHub.com', color: 'from-brand-400 to-brand-600', link: 'mailto:support@ExpertsHub.com' },
    { icon: Phone, label: 'Call Us',       value: '+91 98765 43210',       color: 'from-accent-400 to-accent-600', link: 'tel:+919876543210' },
    { icon: MapPin, label: 'Visit Us',     value: '123 Business St, Pune, MH', color: 'from-emerald-400 to-teal-500', link: null },
    { icon: Clock,  label: 'Support Hours', value: 'Mon–Sat 8AM–8PM\nSun 10AM–4PM', color: 'from-yellow-400 to-orange-500', link: null },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSent(true);
  };

  return (
    <MainLayout>
      {/* Hero */}
      <section className="py-20 bg-white dark:bg-dark-950 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[120px] opacity-15 bg-brand-400" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-[100px] opacity-10 bg-accent-400" />
        </div>
        <div className={`${getPageLayout('narrow')} text-center relative z-10`}>
          <Motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/30 mb-8"
          >
            <MessageSquare size={14} className="text-brand-500" />
            <span className="text-sm font-bold text-brand-600 dark:text-brand-400">We respond within 24 hours</span>
          </Motion.div>
          <Motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-black text-neutral-900 dark:text-white tracking-tight mb-4"
          >
            Get in <span className="gradient-text">Touch</span>
          </Motion.h1>
          <Motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto"
          >
            Have a question, feedback, or need support? We&apos;re here and happy to help.
          </Motion.p>
        </div>
      </section>

      <section className="section-padding bg-neutral-50 dark:bg-dark-900">
        <div className={getPageLayout('default')}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

            {/* Contact Details — left */}
            <div className="lg:col-span-2 space-y-4">
              {contactItems.map((item, i) => {
                const I = item.icon;
                const content = (
                  <Motion.div
                    key={item.label}
                    {...fadeUp(i * 0.1)}
                    className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-dark-800 border border-neutral-100 dark:border-dark-700 hover:shadow-md hover:border-brand-200 dark:hover:border-brand-500/30 transition-all duration-300 group"
                  >
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0 shadow-lg text-white group-hover:scale-110 transition-transform`}>
                      <I size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-0.5">{item.label}</p>
                      <p className="font-semibold text-neutral-800 dark:text-neutral-200 whitespace-pre-line text-sm leading-relaxed">{item.value}</p>
                    </div>
                  </Motion.div>
                );
                return item.link ? <a key={item.label} href={item.link}>{content}</a> : <div key={item.label}>{content}</div>;
              })}

              {/* FAQ shortcut */}
              <Motion.div {...fadeUp(0.4)} className="p-5 rounded-2xl bg-gradient-to-br from-brand-50 to-accent-50 dark:from-brand-500/10 dark:to-accent-500/10 border border-brand-100 dark:border-brand-500/20">
                <p className="font-bold text-neutral-900 dark:text-white text-sm mb-1">Looking for quick answers?</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Check our FAQ page for common questions about bookings, payments, and professionals.</p>
              </Motion.div>
            </div>

            {/* Contact Form — right */}
            <Motion.div {...fadeUp(0.15)} className="lg:col-span-3">
              <div className="bg-white dark:bg-dark-800 rounded-3xl border border-neutral-100 dark:border-dark-700 p-8 shadow-card">
                {sent ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-success-100 to-success-200 dark:from-success-500/20 dark:to-success-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-success-200 dark:border-success-500/30">
                      <CheckCircle size={36} className="text-success-600 dark:text-success-400" />
                    </div>
                    <h3 className="text-2xl font-black text-neutral-900 dark:text-white mb-3">Message Sent!</h3>
                    <p className="text-neutral-500 dark:text-neutral-400">Thanks for reaching out. We&apos;ll get back to you within 24 hours.</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-7">
                      <h3 className="text-2xl font-black text-neutral-900 dark:text-white mb-1">Send us a message</h3>
                      <p className="text-sm text-neutral-400">Fill in the form and our team will reply shortly.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Your Name"
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                        <Input
                          label="Your Email"
                          type="email"
                          placeholder="you@example.com"
                          icon={Mail}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <Textarea
                        label="Your Message"
                        placeholder="Tell us how we can help…"
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                      />
                      <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        variant="gradient"
                        icon={Send}
                        iconPosition="right"
                        className="h-12"
                        disabled={!name || !email || !message}
                      >
                        Send Message
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </Motion.div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
