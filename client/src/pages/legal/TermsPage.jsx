// Terms of service page

import { MainLayout } from '../../components/layout/MainLayout';
import { useTheme } from '../../context/ThemeContext';

export function TermsPage() {
  const { isDark } = useTheme();

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className={`text-4xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
          Terms of Service
        </h1>
        <p className={isDark ? 'text-gray-400 mt-3' : 'text-gray-600 mt-3'}>
          By using UrbanPro, you agree to follow our policies for safe and respectful service delivery.
        </p>

        <div className={isDark ? 'text-gray-400 mt-8 space-y-6' : 'text-gray-600 mt-8 space-y-6'}>
          <div>
            <h2 className={isDark ? 'text-gray-100 text-xl font-semibold mb-2' : 'text-gray-900 text-xl font-semibold mb-2'}>
              User Responsibilities
            </h2>
            <p>
              Provide accurate information, respect service terms, and communicate clearly.
            </p>
          </div>
          <div>
            <h2 className={isDark ? 'text-gray-100 text-xl font-semibold mb-2' : 'text-gray-900 text-xl font-semibold mb-2'}>
              Booking Policies
            </h2>
            <p>
              Cancellations and rescheduling must follow the agreed service window.
            </p>
          </div>
          <div>
            <h2 className={isDark ? 'text-gray-100 text-xl font-semibold mb-2' : 'text-gray-900 text-xl font-semibold mb-2'}>
              Platform Conduct
            </h2>
            <p>
              We reserve the right to suspend accounts for misuse or unsafe behavior.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
