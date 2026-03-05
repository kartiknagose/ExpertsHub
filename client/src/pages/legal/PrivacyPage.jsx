// Privacy policy page

import { MainLayout } from '../../components/layout/MainLayout';
import { PageHeader } from '../../components/common';
import { getPageLayout } from '../../constants/layout';

export function PrivacyPage() {
  return (
    <MainLayout>
      <div className={getPageLayout('narrow')}>
        <PageHeader
          title="Privacy Policy"
          subtitle="We respect your privacy and only collect what is necessary to deliver reliable services."
        />

        <div className="text-gray-600 dark:text-gray-400 mt-8 space-y-6">
          <div>
            <h2 className="text-gray-900 dark:text-gray-100 text-xl font-semibold mb-2">
              Information We Collect
            </h2>
            <p>
              Account details, booking information, and service feedback to improve marketplace quality.
            </p>
          </div>
          <div>
            <h2 className="text-gray-900 dark:text-gray-100 text-xl font-semibold mb-2">
              How We Use It
            </h2>
            <p>
              To match customers with workers, process bookings, and maintain platform safety.
            </p>
          </div>
          <div>
            <h2 className="text-gray-900 dark:text-gray-100 text-xl font-semibold mb-2">
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
