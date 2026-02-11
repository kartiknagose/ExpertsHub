// Contact page

import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';

export function ContactPage() {
  const { isDark } = useTheme();

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className={`text-4xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            Contact Us
          </h1>
          <p className={isDark ? 'text-gray-400 mt-3' : 'text-gray-600 mt-3'}>
            We are here to help with bookings, payments, and account support. Reach out anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="text-brand-500" />
                <div>
                  <h3 className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Email</h3>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>support@urbanpro.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="text-accent-500" />
                <div>
                  <h3 className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Phone</h3>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>+1 (234) 567-890</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="text-success-500" />
                <div>
                  <h3 className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Office</h3>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>123 Business St, City, Country</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="text-warning-500" />
                <div>
                  <h3 className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Support Hours</h3>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    Mon - Sat: 8:00 AM - 8:00 PM
                  </p>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    Sun: 10:00 AM - 4:00 PM
                  </p>
                </div>
              </div>
              <div>
                <h3 className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Need quick help?</h3>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  Check our FAQ for common questions and solutions.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
