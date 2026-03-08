// Cookie policy page

import { MainLayout } from '../../components/layout/MainLayout';
import { PageHeader } from '../../components/common';
import { getPageLayout } from '../../constants/layout';
import { usePageTitle } from '../../hooks/usePageTitle';

export function CookiesPage() {
    usePageTitle('Cookie Policy');
  return (
    <MainLayout>
      <div className={getPageLayout('narrow')}>
        <PageHeader
          title="Cookie Policy"
          subtitle="We use cookies to improve your experience, maintain sessions, and measure performance."
        />

        <div className="text-gray-600 dark:text-gray-400 mt-8 space-y-6">
          <div>
            <h2 className="text-gray-900 dark:text-gray-100 text-xl font-semibold mb-2">
              Essential Cookies
            </h2>
            <p>
              Required for authentication and secure access to the platform.
            </p>
          </div>
          <div>
            <h2 className="text-gray-900 dark:text-gray-100 text-xl font-semibold mb-2">
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
