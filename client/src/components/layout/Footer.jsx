// Footer — premium dark gradient with animated social icons and divider

import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { Twitter, Linkedin, Github, Instagram, Mail, Phone, MapPin, ArrowUpRight, Zap } from 'lucide-react';

const footerLinks = {
  product: [
    { label: 'Browse Services', href: '/services' },
    { label: 'How It Works',    href: '/how-it-works' },
    { label: 'Pricing',         href: '/pricing' },
    { label: 'System Status',   href: '/system-status' },
  ],
  company: [
    { label: 'About Us',  href: '/about' },
    { label: 'Blog',      href: '/blog' },
    { label: 'Careers',   href: '/careers' },
    { label: 'Contact',   href: '/contact' },
  ],
  legal: [
    { label: 'Privacy Policy',  href: '/privacy' },
    { label: 'Terms of Service',href: '/terms' },
    { label: 'Cookie Policy',   href: '/cookies' },
    { label: 'Security',        href: '/security' },
  ],
};

const socials = [
  { icon: Twitter,   href: '#', label: 'Twitter',   color: 'hover:text-sky-400 hover:border-sky-400/40 hover:bg-sky-400/10' },
  { icon: Linkedin,  href: '#', label: 'LinkedIn',  color: 'hover:text-blue-400 hover:border-blue-400/40 hover:bg-blue-400/10' },
  { icon: Github,    href: '#', label: 'GitHub',    color: 'hover:text-neutral-300 hover:border-neutral-500/40 hover:bg-neutral-500/10' },
  { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:text-pink-400 hover:border-pink-400/40 hover:bg-pink-400/10' },
];

const contactDetails = [
  { icon: Mail,   text: 'support@urbanpro.com', href: 'mailto:support@urbanpro.com' },
  { icon: Phone,  text: '+91 98765 43210',       href: 'tel:+919876543210' },
  { icon: MapPin, text: 'Pune, Maharashtra, India', href: '#' },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t bg-neutral-950 border-neutral-800/80 dark:bg-neutral-950">
      {/* Background gradient accent */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Main content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">

          {/* Brand Column */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-accent-500 rounded-xl flex items-center justify-center shadow-brand-sm">
                <span className="text-white font-black text-xl leading-none">U</span>
              </div>
              <span className="text-2xl font-black gradient-text tracking-tight">UrbanPro</span>
            </div>

            <p className="text-sm leading-relaxed mb-6 max-w-xs text-neutral-400">
              India&apos;s trusted marketplace connecting homeowners with verified service professionals for all home maintenance and repair needs.
            </p>

            {/* Contact */}
            <div className="space-y-3 mb-7">
              {contactDetails.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.text}
                    href={item.href}
                    className="flex items-center gap-3 text-sm transition-colors group text-neutral-500 hover:text-neutral-200"
                  >
                    <div className="w-7 h-7 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0 group-hover:border-brand-500/40 group-hover:bg-brand-500/10 transition-colors">
                      <Icon size={13} className="text-brand-400" />
                    </div>
                    {item.text}
                  </a>
                );
              })}
            </div>

            {/* Socials */}
            <div className="flex items-center gap-2">
              {socials.map((social) => {
                const Icon = social.icon;
                return (
                  <Motion.a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.12, y: -3 }}
                    whileTap={{ scale: 0.93 }}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-200 bg-neutral-900 border-neutral-700 text-neutral-500 ${social.color}`}
                  >
                    <Icon size={16} />
                  </Motion.a>
                );
              })}
            </div>
          </div>

          {/* Link Columns */}
          {[
            { title: 'Product', links: footerLinks.product },
            { title: 'Company', links: footerLinks.company },
            { title: 'Legal',   links: footerLinks.legal },
          ].map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-black uppercase tracking-widest mb-5 text-neutral-400">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm font-medium transition-colors flex items-center gap-1 group text-neutral-500 hover:text-neutral-100"
                    >
                      {link.label}
                      <ArrowUpRight
                        size={12}
                        className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Gradient divider */}
      <div className="divider-gradient" />

      {/* Bottom bar */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-neutral-500 font-medium">
          © {new Date().getFullYear()} UrbanPro Technologies Pvt. Ltd. All rights reserved.
        </p>
        <p className="text-xs flex items-center gap-1.5 text-neutral-500">
          Made with{' '}
          <span className="text-error-500 text-sm">❤</span>
          {' '}in India
          <span className="text-neutral-600">·</span>
          <span className="flex items-center gap-1 text-success-500 font-semibold">
            <Zap size={11} />
            All systems operational
          </span>
        </p>
      </div>
    </footer>
  );
}
