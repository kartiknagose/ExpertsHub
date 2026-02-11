// Privacy policy page

import { MainLayout } from '../../components/layout/MainLayout';
import { useTheme } from '../../context/ThemeContext';

export function PrivacyPage() {
  const { isDark } = useTheme();

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className={`text-4xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
          Privacy Policy
        </h1>
        <p className={isDark ? 'text-gray-400 mt-3' : 'text-gray-600 mt-3'}>
          We respect your privacy and only collect what is necessary to deliver reliable services.
        </p>

        <div className={isDark ? 'text-gray-400 mt-8 space-y-6' : 'text-gray-600 mt-8 space-y-6'}>
          <div>
            <h2 className={isDark ? 'text-gray-100 text-xl font-semibold mb-2' : 'text-gray-900 text-xl font-semibold mb-2'}>
              Information We Collect
            </h2>
            <p>
              Account details, booking information, and service feedback to improve marketplace quality.
            </p>
          </div>
          <div>
            <h2 className={isDark ? 'text-gray-100 text-xl font-semibold mb-2' : 'text-gray-900 text-xl font-semibold mb-2'}>
              How We Use It
            </h2>
            <p>
              To match customers with workers, process bookings, and maintain platform safety.
            </p>
          </div>
          <div>
            <h2 className={isDark ? 'text-gray-100 text-xl font-semibold mb-2' : 'text-gray-900 text-xl font-semibold mb-2'}>
              Data Protection
            </h2>
            <p>
              We apply best practices in encryption and secure storage to protect your data.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
