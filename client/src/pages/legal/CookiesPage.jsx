// Cookie policy page

import { MainLayout } from '../../components/layout/MainLayout';
import { useTheme } from '../../context/ThemeContext';

export function CookiesPage() {
  const { isDark } = useTheme();

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className={`text-4xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
          Cookie Policy
        </h1>
        <p className={isDark ? 'text-gray-400 mt-3' : 'text-gray-600 mt-3'}>
          We use cookies to improve your experience, maintain sessions, and measure performance.
        </p>

        <div className={isDark ? 'text-gray-400 mt-8 space-y-6' : 'text-gray-600 mt-8 space-y-6'}>
          <div>
            <h2 className={isDark ? 'text-gray-100 text-xl font-semibold mb-2' : 'text-gray-900 text-xl font-semibold mb-2'}>
              Essential Cookies
            </h2>
            <p>
              Required for authentication and secure access to the platform.
            </p>
          </div>
          <div>
            <h2 className={isDark ? 'text-gray-100 text-xl font-semibold mb-2' : 'text-gray-900 text-xl font-semibold mb-2'}>
              Analytics Cookies
            </h2>
            <p>
              Help us understand usage patterns to improve the platform.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
