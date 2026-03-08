// Sidebar navigation for authenticated users — premium redesign

import { NavLink } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Briefcase,
  Calendar,
  User,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Star,
  Lock,
  ChevronLeft,
  ChevronRight,
  Search,
  LayoutDashboard,
  ClipboardList,
  MessageSquare,
  Gift,
  Shield,
  Activity,
  Tag,
  AlertTriangle,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { resolveProfilePhotoUrl } from '../../utils/profilePhoto';

const navConfig = {
  CUSTOMER: [
    { label: 'Dashboard', to: '/customer/dashboard', icon: Home },
    { label: 'Browse Services', to: '/services', icon: Briefcase },
    { label: 'My Bookings', to: '/customer/bookings', icon: Calendar },
    { label: 'Messages', to: '/messages', icon: MessageSquare },
    { label: 'My Reviews', to: '/customer/reviews', icon: Star },
    { label: 'My Wallet', to: '/customer/wallet', icon: Wallet },
    { label: 'Refer & Earn', to: '/customer/referrals', icon: Gift },
    { label: 'Safety Settings', to: '/customer/safety/contacts', icon: Shield },
  ],
  WORKER: [
    { label: 'Dashboard', to: '/worker/dashboard', icon: LayoutDashboard },
    { label: 'Browse Services', to: '/services', icon: Search },
    { label: 'My Services', to: '/worker/services', icon: Briefcase },
    { label: 'Bookings', to: '/worker/bookings', icon: ClipboardList },
    { label: 'Messages', to: '/messages', icon: MessageSquare },
    { label: 'Availability', to: '/worker/availability', icon: Clock },
    { label: 'Reviews', to: '/worker/reviews', icon: Star },
    { label: 'Earnings', to: '/worker/earnings', icon: Wallet },
    { label: 'Verification', to: '/worker/verification', icon: ShieldCheck },
    { label: 'Emergency Contacts', to: '/worker/safety/contacts', icon: ShieldAlert },
  ],
  ADMIN: [
    { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', to: '/admin/analytics', icon: Activity },
    { label: 'Services', to: '/admin/services', icon: Briefcase },
    { label: 'Bookings', to: '/admin/bookings', icon: Calendar },
    { label: 'Users', to: '/admin/users', icon: User },
    { label: 'Workers', to: '/admin/workers', icon: Users },
    { label: 'Verification', to: '/admin/verification', icon: ShieldCheck },
    { label: 'Fraud Detection', to: '/admin/fraud', icon: ShieldAlert },
    { label: 'Coupons', to: '/admin/coupons', icon: Tag },
    { label: 'SOS Alerts', to: '/admin/sos-alerts', icon: AlertTriangle, highlight: true },
  ],
};

export function Sidebar({ isOpen, isCollapsed, onClose, onToggleCollapse }) {
  const { user } = useAuth();

  const links = navConfig[user?.role] || [];

  const profilePhotoUrl = resolveProfilePhotoUrl(user?.profilePhotoUrl);
  const profileInitial = (user?.name || 'U').slice(0, 1).toUpperCase();

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 lg:hidden bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <Motion.aside
        animate={{
          width: isCollapsed ? 72 : 256,
        }}
        initial={false}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r
          bg-white dark:bg-dark-900 border-gray-200 dark:border-dark-700/80
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} transition-transform duration-300 lg:transition-none`}
      >
        {/* Header */}
        <div className={`flex items-center h-16 border-b px-4 shrink-0 border-gray-100 dark:border-dark-700/80
          ${isCollapsed ? 'justify-center' : 'justify-between'}`}>

          {/* Logo mark when collapsed */}
          {isCollapsed ? (
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-accent-500 rounded-lg flex items-center justify-center shadow-md shadow-brand-500/20">
              <span className="text-white font-bold text-sm">U</span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-accent-500 rounded-lg flex items-center justify-center shadow-md shadow-brand-500/20">
                <span className="text-white font-bold text-sm">U</span>
              </div>
              <span className="font-bold text-lg text-gray-900 dark:text-white">
                UrbanPro
              </span>
            </div>
          )}

          <div className="flex items-center gap-1">
            {/* Collapse button - desktop only */}
            <button
              type="button"
              onClick={onToggleCollapse}
              className={`hidden lg:flex p-1.5 rounded-lg transition-colors
                text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800
                `}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            {/* Close button - mobile only */}
            <button
              type="button"
              onClick={onClose}
              className={`lg:hidden p-1.5 rounded-lg transition-colors
                text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800
                `}
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* User Profile Section */}
        <div className={`px-4 py-4 border-b border-gray-100 dark:border-dark-700/80`}>
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="relative shrink-0">
              {profilePhotoUrl ? (
                <img
                  src={profilePhotoUrl}
                  alt="Profile"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-500/30"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold ring-2 ring-brand-500/30">
                  {profileInitial}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success-500 border-2 border-white dark:border-dark-900" role="status">
                <span className="sr-only">Online</span>
              </span>
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate text-gray-900 dark:text-white">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs font-medium text-gray-500">
                  {user?.role === 'CUSTOMER' ? 'Customer' : user?.role === 'WORKER' ? 'Professional' : 'Administrator'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className={`flex-1 overflow-y-auto py-4 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          <div className="space-y-1">
            {links.map((item) => {
              const Icon = item.icon;
              const isDisabled = item.disabled;

              if (isDisabled) {
                return (
                  <div
                    key={item.to}
                    title={isCollapsed ? `${item.label} (coming soon)` : 'Coming soon'}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm opacity-50 cursor-not-allowed ${isCollapsed ? 'justify-center' : ''
                      } text-gray-400 dark:text-gray-500`}
                  >
                    <Icon size={18} />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        <span className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-dark-700 text-gray-400 dark:text-gray-500
                          `}>
                          <Lock size={10} />
                          Soon
                        </span>
                      </>
                    )}
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  title={isCollapsed ? item.label : undefined}
                  className={({ isActive }) => {
                    const baseClasses = `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isCollapsed ? 'justify-center' : ''
                      }`;

                    if (item.highlight) {
                      return `${baseClasses} text-red-500 hover:bg-red-500/10`;
                    }

                    if (isActive) {
                      return `${baseClasses} bg-gradient-to-r from-brand-50 dark:from-brand-500/20 to-accent-50/50 dark:to-accent-500/10 text-brand-700 dark:text-brand-300
                        `;
                    }

                    return `${baseClasses} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-dark-800
                      `;
                  }}
                >
                  {({ isActive }) => (
                    <>
                      {/* Active indicator bar */}
                      {isActive && !isCollapsed && (
                        <Motion.span
                          layoutId="sidebar-indicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-brand-500 to-accent-500"
                        />
                      )}
                      {/* Icon with active glow */}
                      <span className={isActive ? 'text-brand-500' : ''}>
                        <Icon size={18} />
                      </span>
                      {!isCollapsed && item.label}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-dark-700/80">
            <p className="text-xs text-center text-gray-400 dark:text-gray-600">
              UrbanPro &copy; {new Date().getFullYear()}
            </p>
          </div>
        )}
      </Motion.aside>
    </>
  );
}
