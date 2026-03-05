// Main navigation bar component
// Adapts based on user role (Customer, Worker, Admin) and authentication state

import { useMemo, useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Briefcase,
  Settings,
  Users,
  Tag,
  Mail,
  LogOut,
  LogIn,
  UserPlus,
  Sun,
  Moon,
  LayoutGrid,
  ChevronDown,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { resolveProfilePhotoUrl } from '../../utils/profilePhoto';
import { Button } from '../common';
import { NotificationDropdown } from '../features/notifications/NotificationDropdown';

/**
 * Navbar Component
 * Role-based navigation with mobile responsiveness
 */
export function Navbar({ onOpenSidebar = () => { }, sidebarOffset = '', showBrand = true }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMobileMenuOpen(false);
      setUserMenuOpen(false);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  // Close user dropdown when clicking outside
  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  const publicLinks = [
    { name: 'Services', href: '/services', icon: Briefcase },
    { name: 'How It Works', href: '/how-it-works', icon: Settings },
    { name: 'Pricing', href: '/pricing', icon: Tag },
    { name: 'About', href: '/about', icon: Users },
    { name: 'Contact', href: '/contact', icon: Mail },
  ];

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  // Close mobile menu when clicking a link
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const userMenuItems = useMemo(() => {
    switch (user?.role) {
      case 'WORKER':
        return [
          { label: 'Dashboard', href: '/worker/dashboard' },
          { label: 'My Profile', href: '/worker/profile' },
          { label: 'My Reviews', href: '/worker/reviews' },
          { label: 'Verification', href: '/worker/verification' },
        ];
      case 'ADMIN':
        return [
          { label: 'Dashboard', href: '/admin/dashboard' },
        ];
      case 'CUSTOMER':
      default:
        return [
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'My Profile', href: '/profile' },
          { label: 'My Bookings', href: '/bookings' },
        ];
    }
  }, [user?.role]);

  const profilePhotoUrl = resolveProfilePhotoUrl(user?.profilePhotoUrl);
  const profileInitial = (user?.name || 'U').slice(0, 1).toUpperCase();

  // Check if link is active
  const isLinkActive = (href) => location.pathname === href || location.pathname.startsWith(href + '/');

  return (
    <nav className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-all duration-200
        bg-white/90 dark:bg-dark-900/90 border-gray-200/80 dark:border-dark-700 shadow-sm dark:shadow-lg dark:shadow-black/30
      ${sidebarOffset}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          {showBrand ? (
            <Link
              to={isAuthenticated
                ? (user?.role === 'CUSTOMER' ? '/dashboard' : user?.role === 'WORKER' ? '/worker/dashboard' : '/admin/dashboard')
                : '/'
              }
              className="flex items-center gap-2.5 shrink-0"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-accent-500 rounded-lg flex items-center justify-center shadow-md shadow-brand-500/30">
                <span className="text-white font-bold text-lg leading-none">U</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent">
                UrbanPro
              </span>
            </Link>
          ) : (
            <div className="w-8 h-8" />
          )}

          {/* Desktop Navigation - Public Links */}
          <div className="hidden md:flex items-center gap-0.5">
            {(!isAuthenticated ? publicLinks : []).map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${active
                      ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-800'
                    }`}
                >
                  {link.name}
                  {active && (
                    <Motion.span
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-gradient-to-r from-brand-500 to-accent-500"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1">

            {/* Sidebar toggle (for authenticated users) */}
            {isAuthenticated && (
              <button
                type="button"
                onClick={onOpenSidebar}
                className="p-2 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-800
                  "
                aria-label="Open sidebar"
              >
                <LayoutGrid size={20} />
              </button>
            )}

            {/* Messages Link */}
            {isAuthenticated && (
              <Link
                to="/messages"
                className="p-2 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-800
                  "
                aria-label="Messages"
              >
                <MessageSquare size={20} />
              </Link>
            )}

            {/* Notifications */}
            {isAuthenticated && <NotificationDropdown />}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-dark-800
                "
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Auth - Desktop */}
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((open) => !open)}
                    className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border-2 transition-all duration-200
                        border-gray-200 dark:border-dark-600 hover:border-brand-200 dark:hover:border-brand-500/50 hover:bg-gray-50 dark:hover:bg-dark-800
                      "
                    aria-label="Open user menu"
                    aria-expanded={userMenuOpen}
                  >
                    {profilePhotoUrl ? (
                      <img
                        src={profilePhotoUrl}
                        alt="Profile"
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold">
                        {profileInitial}
                      </div>
                    )}
                    <span className="text-sm font-medium max-w-[80px] truncate text-gray-700 dark:text-gray-300">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <Motion.span animate={{ rotate: userMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown size={14} className="text-gray-500 dark:text-gray-400" />
                    </Motion.span>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <Motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 rounded-2xl border shadow-xl py-2 z-50 bg-white dark:bg-dark-900 border-gray-200 dark:border-dark-700
                          "
                      >
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-dark-700">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {user?.name || 'User'}
                          </p>
                          <p className="text-xs mt-0.5 text-gray-500">
                            {user?.email}
                          </p>
                          <span className="inline-flex mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300
                            ">
                            {user?.role}
                          </span>
                        </div>
                        <div className="py-1.5">
                          {userMenuItems.map((item) => (
                            <Link
                              key={item.href}
                              to={item.href}
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center px-4 py-2.5 text-sm font-medium transition-colors
                                  text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-800 hover:text-gray-900 dark:hover:text-white
                                "
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                        <div className="border-t pt-1.5 border-gray-100 dark:border-dark-700">
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20
                              "
                          >
                            <LogOut size={15} />
                            Sign Out
                          </button>
                        </div>
                      </Motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={LogIn}
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={UserPlus}
                    onClick={() => navigate('/register')}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-800
                "
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <Motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X size={22} />
                  </Motion.span>
                ) : (
                  <Motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Menu size={22} />
                  </Motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <Motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className={`md:hidden border-t overflow-hidden border-gray-200 dark:border-dark-700 bg-white/95 dark:bg-dark-900/95 backdrop-blur-xl`}
          >
            <div className="px-4 py-4 space-y-1">
              {/* Public Nav Links */}
              {(!isAuthenticated ? publicLinks : []).map((link) => {
                const Icon = link.icon;
                const active = isLinkActive(link.href);
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${active
                        ? 'bg-brand-50 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400'
                        : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-dark-800'
                      }`}
                  >
                    <Icon size={18} />
                    {link.name}
                  </Link>
                );
              })}

              {/* Theme Toggle */}
              <button
                onClick={() => { toggleTheme(); closeMobileMenu(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-dark-800
                  "
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
                {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              </button>

              {/* Authenticated mobile items */}
              {isAuthenticated ? (
                <div className="pt-3 mt-3 border-t space-y-1 border-gray-100 dark:border-dark-700">
                  <div className="flex items-center gap-3 px-4 py-2 mb-2">
                    {profilePhotoUrl ? (
                      <img src={profilePhotoUrl} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-bold">
                        {profileInitial}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-sm text-gray-900 dark:text-white">{user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</p>
                    </div>
                  </div>
                  {userMenuItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={closeMobileMenu}
                      className="flex items-center px-4 py-3 rounded-xl font-medium transition-all text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-dark-800
                        "
                    >
                      {item.label}
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20
                      "
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="pt-3 mt-3 border-t space-y-2 border-gray-100 dark:border-dark-700">
                  <Button
                    fullWidth
                    variant="ghost"
                    icon={LogIn}
                    onClick={() => { navigate('/login'); closeMobileMenu(); }}
                  >
                    Login
                  </Button>
                  <Button
                    fullWidth
                    variant="primary"
                    icon={UserPlus}
                    onClick={() => { navigate('/register'); closeMobileMenu(); }}
                  >
                    Create Account
                  </Button>
                </div>
              )}
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
