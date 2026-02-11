import { Mail, MapPin, Phone, Linkedin, Twitter, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

/**
 * Footer Component
 *
 * Bottom section for all pages (public and authenticated)
 * Features:
 * - Company info and branding
 * - Quick links
 * - Social media
 * - Contact information
 * - Copyright
 * - Theme-aware (light/dark)
 * - Clean, professional, minimal
 */
function Footer() {
  const currentYear = new Date().getFullYear();
  const { isDark } = useTheme();

  const footerSections = [
    {
      title: 'Product',
      links: [
        { label: 'Browse Services', href: '/services' },
        { label: 'How It Works', href: '/how-it-works' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Security', href: '/security' },
        { label: 'FAQ', href: '/faq' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Blog', href: '/blog' },
        { label: 'Careers', href: '/careers' },
        { label: 'Contact', href: '/contact' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Cookie Policy', href: '/cookies' },
      ],
    },
  ];

  const socialLinks = [
    { icon: Twitter, href: '#twitter', label: 'Twitter' },
    { icon: Linkedin, href: '#linkedin', label: 'LinkedIn' },
    { icon: Facebook, href: '#facebook', label: 'Facebook' },
  ];

  // Theme-aware styles
  const footerBg = isDark
    ? 'linear-gradient(90deg, rgba(20,10,50,0.95) 0%, rgba(30,10,60,0.95) 100%)'
    : 'linear-gradient(90deg, rgba(249,250,251,1) 0%, rgba(243,244,246,1) 100%)';

  const borderColor = isDark ? 'border-brand-500/30' : 'border-gray-200';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const textBody = isDark ? 'text-gray-300' : 'text-gray-600';
  const textHeading = isDark ? 'text-brand-300' : 'text-gray-800';
  const linkHover = isDark ? 'hover:text-accent-300' : 'hover:text-brand-600';
  const socialHover = isDark
    ? 'text-brand-400 hover:text-brand-300 hover:bg-brand-500/20'
    : 'text-gray-500 hover:text-brand-600 hover:bg-brand-50';
  const dividerColor = isDark ? 'border-brand-500/20' : 'border-gray-200';
  const bottomLinkStyle = isDark
    ? 'text-gray-400 hover:text-brand-300'
    : 'text-gray-500 hover:text-brand-600';

  return (
    <footer
      className={`border-t ${borderColor} mt-12`}
      style={{ background: footerBg, backdropFilter: 'blur(10px)' }}
    >
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-accent-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/50">
                U
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">UrbanPro</span>
            </div>
            <p className={`${textBody} text-sm mb-4`}>
              Professional services marketplace connecting customers with skilled workers.
            </p>

            {/* Contact Info */}
            <div className={`space-y-2 text-sm ${textBody}`}>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-brand-400" />
                <a href="mailto:support@urbanpro.com" className={`${linkHover} transition-colors`}>
                  support@urbanpro.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-accent-400" />
                <a href="tel:+1234567890" className={`${linkHover} transition-colors`}>
                  +1 (234) 567-890
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-success-400" />
                <span>123 Business St, City, Country</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className={`p-2 ${socialHover} rounded-lg transition-colors`}
                    aria-label={social.label}
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Footer Links Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className={`font-semibold ${textHeading} mb-4`}>{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('/') ? (
                      <Link
                        to={link.href}
                        className={`text-sm ${textBody} ${linkHover} transition-colors`}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className={`text-sm ${textBody} ${linkHover} transition-colors`}
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className={`border-t ${dividerColor} pt-8`}>
          {/* Bottom Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className={`text-sm ${textMuted}`}>
              &copy; {currentYear} UrbanPro. All rights reserved.
            </p>

            {/* Bottom Links */}
            <div className="flex gap-6 text-sm">
              <Link to="/privacy" className={`${bottomLinkStyle} transition-colors`}>
                Privacy
              </Link>
              <Link to="/terms" className={`${bottomLinkStyle} transition-colors`}>
                Terms
              </Link>
              <Link to="/cookies" className={`${bottomLinkStyle} transition-colors`}>
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
