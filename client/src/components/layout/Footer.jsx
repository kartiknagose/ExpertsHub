// Footer component — premium redesign

import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { Twitter, Linkedin, Github, Instagram, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';

const footerLinks = {
  product: [
    { label: 'Browse Services', href: '/services' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'System Status', href: '/system-status' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Security', href: '/security' },
  ],
};

const socials = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Instagram, href: '#', label: 'Instagram' },
];

const contactDetails = [
  { icon: Mail, text: 'support@urbanpro.com', href: 'mailto:support@urbanpro.com' },
  { icon: Phone, text: '+91 98765 43210', href: 'tel:+919876543210' },
  { icon: MapPin, text: 'Pune, Maharashtra, India', href: '#' },
];

export function Footer() {
  return (
    <footer className="border-t bg-white dark:bg-dark-900 border-gray-200 dark:border-dark-700/80">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">

          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
                <span className="text-white font-black text-lg leading-none">U</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent">
                UrbanPro
              </span>
            </div>

            <p className="text-sm leading-relaxed mb-6 max-w-xs text-gray-500 dark:text-gray-400">
              India&apos;s trusted marketplace connecting homeowners with verified service professionals for all home maintenance and repair needs.
            </p>

            {/* Contact Details */}
            <div className="space-y-3 mb-7">
              {contactDetails.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.text}
                    href={item.href}
                    className="flex items-center gap-3 text-sm transition-colors group text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200
                      "
                  >
                    <Icon size={14} className="shrink-0 text-brand-500 dark:text-brand-400" />
                    {item.text}
                  </a>
                );
              })}
            </div>

            {/* Social Links */}
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
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-200
                        bg-gray-50 dark:bg-dark-800 border-gray-200 dark:border-dark-700 text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-200 dark:hover:border-brand-500/50 hover:bg-brand-50
                      "
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
            { title: 'Legal', links: footerLinks.legal },
          ].map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-5 text-gray-500 dark:text-gray-400">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm font-medium transition-colors flex items-center gap-1 group text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white
                        "
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

      {/* Bottom Bar */}
      <div className="border-t border-gray-100 dark:border-dark-700/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            &copy; {new Date().getFullYear()} UrbanPro Technologies Pvt. Ltd. All rights reserved.
          </p>
          <p className="text-xs flex items-center gap-1 text-gray-400 dark:text-gray-500">
            Made with{' '}
            <span className="text-red-500">❤️</span>{' '}
            in India
          </p>
        </div>
      </div>
    </footer>
  );
}
