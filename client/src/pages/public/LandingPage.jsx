// Landing page - First page users see
// Shows app benefits, features, and CTA for registration

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Shield,
  Clock,
  Star,
  Users,
  Briefcase,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { Button } from '../../components/common';
import { MainLayout } from '../../components/layout/MainLayout';
import { useTheme } from '../../context/ThemeContext';

/**
 * Landing Page Component
 * Homepage for unauthenticated users
 */
export function LandingPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  // Feature cards data
  const features = [
    {
      icon: Zap,
      title: 'Quick Booking',
      description: 'Book services instantly with just a few clicks. No hassle, no waiting.',
    },
    {
      icon: Shield,
      title: 'Verified Workers',
      description: 'All workers are verified and background-checked for your safety.',
    },
    {
      icon: Clock,
      title: 'Flexible Scheduling',
      description: 'Choose the time that works best for you. 24/7 availability.',
    },
    {
      icon: Star,
      title: 'Quality Guarantee',
      description: 'Top-rated professionals with reviews from real customers.',
    },
  ];

  // Service categories
  const categories = [
    'Home Cleaning',
    'Plumbing',
    'Electrical Work',
    'Carpentry',
    'Painting',
    'AC Repair',
    'Pest Control',
    'Appliance Repair',
  ];

  // Stats data
  const stats = [
    { label: 'Active Workers', value: '500+' },
    { label: 'Services Completed', value: '10,000+' },
    { label: 'Happy Customers', value: '5,000+' },
    { label: 'Average Rating', value: '4.8/5' },
  ];

  // Text color styles
  const textPrimary = isDark ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';

  return (
    <MainLayout>
      {/* Hero Section */}
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-accent-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

            {/* Left Column: Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-900/30 border border-brand-100 dark:border-brand-500/20 mb-6">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
                </span>
                <span className="text-sm font-medium text-brand-700 dark:text-brand-300">
                  #1 Marketplace for Local Services
                </span>
              </div>

              <h1 className={`text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight leading-tight ${textPrimary}`}>
                Expert hands for <br className="hidden lg:block" />
                <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 bg-clip-text text-transparent">
                  every home task
                </span>
              </h1>

              <p className={`text-xl md:text-2xl mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed ${textSecondary}`}>
                Connect with verified professionals for cleaning, repairs, painting, and more.
                Trusted by 10,000+ homeowners.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="xl"
                  onClick={() => navigate('/register')}
                  icon={ArrowRight}
                  iconPosition="right"
                  className="shadow-xl shadow-brand-500/20 hover:shadow-2xl hover:shadow-brand-500/30 transition-shadow"
                >
                  Find a Professional
                </Button>
                <Button
                  size="xl"
                  variant="outline"
                  onClick={() => navigate('/register?role=worker')}
                  className="bg-white/50 dark:bg-dark-800/50 backdrop-blur-sm"
                >
                  Become a Professional
                </Button>
              </div>

              <div className="mt-10 flex items-center justify-center lg:justify-start gap-8 opacity-80">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={20} />
                  <span className={textSecondary}>Verified Experts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={20} />
                  <span className={textSecondary}>Insured Work</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={20} />
                  <span className={textSecondary}>24/7 Support</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Visual Composition */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block h-[600px]"
            >
              {/* Abstract Background Blotches */}
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/10 to-accent-500/10 rounded-full blur-3xl transform rotate-12 scale-75"></div>

              {/* Composition Container */}
              <div className="relative w-full h-full flex items-center justify-center">

                {/* Main Card: Search Mockup */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className={`absolute z-20 w-80 p-6 rounded-2xl border shadow-2xl backdrop-blur-md ${isDark ? 'bg-dark-800/90 border-dark-700' : 'bg-white/90 border-gray-100'}`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-dark-700 overflow-hidden">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                    </div>
                    <div>
                      <h3 className={`font-bold ${textPrimary}`}>John Doe</h3>
                      <p className={`text-xs ${textSecondary}`}>Electrician • 4.9 <Star size={10} className="inline text-yellow-400 fill-current" /></p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-200 dark:bg-dark-700 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-200 dark:bg-dark-700 rounded w-1/2"></div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <div className="h-8 bg-brand-500 rounded-lg w-full"></div>
                  </div>
                </motion.div>

                {/* Floating Badge: Rating */}
                <motion.div
                  animate={{ x: [0, 10, 0], y: [0, 5, 0] }}
                  transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                  className={`absolute top-20 right-10 z-30 p-4 rounded-2xl shadow-xl border backdrop-blur-md flex items-center gap-3 ${isDark ? 'bg-dark-800/90 border-dark-700' : 'bg-white/90 border-gray-100'}`}
                >
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                    <Star size={24} className="fill-current" />
                  </div>
                  <div>
                    <p className={`font-bold text-lg ${textPrimary}`}>4.9/5</p>
                    <p className={`text-xs ${textSecondary}`}>Average Rating</p>
                  </div>
                </motion.div>

                {/* Floating Badge: Success */}
                <motion.div
                  animate={{ x: [0, -10, 0], y: [0, -5, 0] }}
                  transition={{ duration: 7, repeat: Infinity, delay: 0.5 }}
                  className={`absolute bottom-32 left-0 z-30 p-4 rounded-2xl shadow-xl border backdrop-blur-md flex items-center gap-3 ${isDark ? 'bg-dark-800/90 border-dark-700' : 'bg-white/90 border-gray-100'}`}
                >
                  <div className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded-full text-brand-600 dark:text-brand-400">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <p className={`font-bold text-lg ${textPrimary}`}>10k+</p>
                    <p className={`text-xs ${textSecondary}`}>Jobs Completed</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className={`text-4xl font-bold mb-4 ${textPrimary}`}>
              Why Choose UrbanPro?
            </h2>
            <p className={`text-lg ${textSecondary}`}>
              We make finding and booking services simple and secure
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`p-6 rounded-xl border transition-all duration-300 ${isDark
                      ? 'bg-dark-800 border-dark-700 hover:border-brand-500/50'
                      : 'bg-white border-gray-200 hover:border-brand-400'
                    }`}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-accent-500 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="text-white" size={24} />
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${textPrimary}`}>
                    {feature.title}
                  </h3>
                  <p className={textSecondary}>
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className={`text-4xl font-bold mb-4 ${textPrimary}`}>
              Popular Services
            </h2>
            <p className={`text-lg ${textSecondary}`}>
              Explore our wide range of professional services
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <motion.button
                key={category}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate('/services')}
                className={`p-4 rounded-lg border font-medium transition-all duration-200 ${isDark
                    ? 'bg-dark-800 border-dark-700 text-gray-200 hover:border-brand-500 hover:bg-dark-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-brand-400 hover:bg-gray-50'
                  }`}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className={`text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
                <div className={`text-sm md:text-base ${textSecondary}`}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`p-12 rounded-2xl text-center ${isDark
                ? 'bg-gradient-to-br from-brand-900/50 to-accent-900/50 border border-brand-500/30'
                : 'bg-gradient-to-br from-brand-50 to-accent-50 border border-brand-200'
              }`}
          >
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${textPrimary}`}>
              Ready to Get Started?
            </h2>
            <p className={`text-lg mb-8 ${textSecondary}`}>
              Join thousands of satisfied customers and find the perfect worker for your needs today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/register')}
                icon={Users}
              >
                Sign Up as Customer
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/register?role=worker')}
                icon={Briefcase}
              >
                Join as Worker
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
}
