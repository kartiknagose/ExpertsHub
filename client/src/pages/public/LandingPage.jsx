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
  CheckCircle,
  Search,
  MapPin,
  Calendar
} from 'lucide-react';
import { Button } from '../../components/common';
import { MainLayout } from '../../components/layout/MainLayout';
import { useTheme } from '../../context/ThemeContext';
import { IMAGES, getServiceImage } from '../../constants/images';

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
      title: 'Instant Booking',
      description: 'Book verified professionals in under 60 seconds. Fast, easy, and reliable.',
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10'
    },
    {
      icon: Shield,
      title: 'Verified Experts',
      description: 'Every professional is vetted, background-checked, and skill-tested.',
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    },
    {
      icon: Clock,
      title: 'Flexible Schedule',
      description: 'Choose time slots that work for you, 7 days a week, from 8 AM to 8 PM.',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      icon: Star,
      title: 'Satisfaction Guaranteed',
      description: 'Not happy? We will re-do the job or give your money back. No questions asked.',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
  ];

  // Service categories
  const categories = [
    { name: 'Home Cleaning', icon: '🧹' },
    { name: 'Plumbing', icon: '🚰' },
    { name: 'Electrical', icon: '⚡' },
    { name: 'Carpentry', icon: '🪚' },
    { name: 'Painting', icon: '🎨' },
    { name: 'AC Repair', icon: '❄️' },
    { name: 'Pest Control', icon: '🐜' },
    { name: 'Beauty', icon: '💅' },
  ];

  // Stats data
  const stats = [
    { label: 'Active Workers', value: '500+' },
    { label: 'Services Completed', value: '10k+' },
    { label: 'Happy Customers', value: '5k+' },
    { label: 'Average Rating', value: '4.8' },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className={`relative min-h-[90vh] flex items-center pt-20 overflow-hidden ${isDark ? 'bg-dark-950' : 'bg-white'}`}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className={`absolute top-0 right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-30 animate-pulse ${isDark ? 'bg-brand-500' : 'bg-brand-300'}`} />
          <div className={`absolute bottom-0 left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-20 animate-pulse delay-1000 ${isDark ? 'bg-accent-500' : 'bg-accent-300'}`} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left Column: Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border mb-8 animate-fade-in-up"
                style={{
                  backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                  borderColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.2)'
                }}>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500"></span>
                </span>
                <span className="text-sm font-semibold text-brand-600 dark:text-brand-300">
                  #1 Marketplace in your City
                </span>
              </div>

              <h1 className={`text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight leading-[1.1] ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Expert hands for <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-accent-500">
                  every home task
                </span>
              </h1>

              <p className={`text-xl md:text-2xl mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed opacity-90 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                The smartest way to book local professionals. Verified, insured, and ready to help you today.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="xl"
                  onClick={() => navigate('/services')}
                  icon={ArrowRight}
                  iconPosition="right"
                  className="rounded-xl shadow-xl shadow-brand-500/25 h-14 px-8 text-lg hover:translate-y-[-2px] transition-transform"
                >
                  Book a Service
                </Button>
                <Button
                  size="xl"
                  variant="outline"
                  onClick={() => navigate('/register?role=worker')}
                  className="rounded-xl h-14 px-8 text-lg backdrop-blur-sm bg-transparent border-gray-300 dark:border-gray-700 hover:bg-gray-100/50 dark:hover:bg-dark-800/50"
                >
                  Become a Professional
                </Button>
              </div>

              <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 border-t border-gray-200 dark:border-gray-800 pt-8">
                <div className="flex items-center gap-2">
                  <div className="bg-green-500/20 p-1 rounded-full">
                    <CheckCircle className="text-green-500" size={16} strokeWidth={3} />
                  </div>
                  <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Verified Pros</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-purple-500/20 p-1 rounded-full">
                    <Shield className="text-purple-500" size={16} strokeWidth={3} />
                  </div>
                  <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Insured Work</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Visual Composition */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block h-[500px]"
            >
              <div className="grid grid-cols-2 gap-4 h-full relative z-10">
                {/* Card 1 */}
                <div className="space-y-4 pt-10">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className={`p-6 rounded-3xl border shadow-xl backdrop-blur-xl ${isDark ? 'bg-dark-800/80 border-dark-700' : 'bg-white/90 border-gray-100'}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Briefcase size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Plumbing</h4>
                        <p className="text-xs text-gray-500">Booked 2m ago</p>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-dark-700 rounded-full w-full mb-2"></div>
                    <div className="h-2 bg-gray-200 dark:bg-dark-700 rounded-full w-2/3"></div>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className={`p-6 rounded-3xl border shadow-xl backdrop-blur-xl ${isDark ? 'bg-dark-800/80 border-dark-700' : 'bg-white/90 border-gray-100'}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Top Rated</h4>
                      <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">4.9 ★</span>
                    </div>
                    <div className="flex gap-2">
                      <img src={IMAGES.AVATAR_USER_1} className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-dark-800" alt="user" />
                      <img src={IMAGES.AVATAR_USER_2} className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-dark-800" alt="user" />
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 border-2 border-white dark:border-dark-800">+5</div>
                    </div>

                  </motion.div>
                </div>

                {/* Card 2 */}
                <div className="space-y-4">
                  <motion.div
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className={`h-[300px] p-6 rounded-3xl border shadow-xl backdrop-blur-xl flex flex-col justify-end relative overflow-hidden ${isDark ? 'bg-brand-900/40 border-brand-800' : 'bg-brand-600 text-white border-brand-500'}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-0"></div>
                    <img src={IMAGES.HERO_LANDING} alt="Worker" className="absolute inset-0 w-full h-full object-cover -z-10" />

                    <div className="relative z-10">
                      <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl border border-white/20">
                        <p className="text-sm font-medium text-white mb-1">Worker of the Month</p>
                        <h3 className="text-xl font-bold text-white">Sarah Jenkins</h3>
                        <p className="text-white/80 text-sm">Professional Cleaner</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={`py-20 px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-dark-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Why Millions Choose UrbanPro
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              We've re-imagined the home service experience to be seamless, safe, and superior.
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
                  transition={{ delay: index * 0.1 }}
                  className={`p-8 rounded-3xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isDark ? 'bg-dark-800 border-dark-700 hover:bg-dark-800/80' : 'bg-white border-gray-100 hover:border-brand-200'
                    }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-2xl ${feature.color} ${feature.bg}`}>
                    <Icon size={28} />
                  </div>
                  <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {feature.title}
                  </h3>
                  <p className={`leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Popular Services</h2>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Most booked services in your area this week</p>
            </div>
            <Button variant="ghost" onClick={() => navigate('/services')} className="group">
              View All Services <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((category, index) => (
              <motion.button
                key={category.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/services')}
                className={`group relative flex flex-col items-center justify-end p-4 h-32 rounded-2xl border overflow-hidden transition-all duration-200 shadow-md hover:shadow-xl ${isDark
                    ? 'border-dark-700 hover:border-brand-500'
                    : 'border-gray-100 hover:border-brand-400'
                  }`}
              >
                {/* Background Image */}
                <img
                  src={getServiceImage(category.name)}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-black/90 via-black/50 to-transparent' : 'from-black/80 via-black/40 to-transparent'}`}></div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center">
                  <span className="text-xl mb-1 drop-shadow-md">{category.icon}</span>
                  <span className="text-xs font-bold text-center leading-tight text-white drop-shadow-md">{category.name}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats/Proof Section */}
      <section className={`py-16 ${isDark ? 'bg-brand-900/20' : 'bg-brand-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-200 dark:divide-gray-800">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center px-4">
                <div className={`text-4xl md:text-5xl font-extrabold mb-1 bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
                <div className={`text-sm font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className={`relative rounded-[2.5rem] p-12 lg:p-16 text-center overflow-hidden isolate ${isDark
            ? 'bg-gradient-to-br from-brand-900 to-dark-900'
            : 'bg-gradient-to-br from-brand-600 to-brand-800'
            } text-white shadow-2xl shadow-brand-900/20`}>

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-[100px]"></div>
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-[100px]"></div>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
              Ready to transform your home?
            </h2>
            <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
              Join thousands of happy homeowners and expert professionals on the UrbanPro network.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Button
                size="xl"
                onClick={() => navigate('/register')}
                className="bg-white text-brand-700 hover:bg-gray-100 border-none shadow-lg px-8 h-14 text-lg font-bold"
              >
                Get Started Now
              </Button>
              <Button
                size="xl"
                variant="outline"
                onClick={() => navigate('/register?role=worker')}
                className="border-white/30 text-white hover:bg-white/10 px-8 h-14 text-lg font-semibold"
              >
                Join as a Pro
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
