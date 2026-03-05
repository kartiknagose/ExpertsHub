// Terms of service page

import { MainLayout } from '../../components/layout/MainLayout';
import { PageHeader } from '../../components/common';
import { getPageLayout } from '../../constants/layout';

export function TermsPage() {
  return (
    <MainLayout>
      <div className={getPageLayout('narrow')}>
        <PageHeader
          title="Terms of Service"
          subtitle="By using UrbanPro, you agree to follow our policies for safe and respectful service delivery."
        />

        <div className="text-gray-600 dark:text-gray-400 mt-8 space-y-6">
          <div>
            <h2 className="text-gray-900 dark:text-gray-100 text-xl font-semibold mb-2">
              User Responsibilities
            </h2>
            <p>
              Provide accurate information, respect service terms, and communicate clearly.
            </p>
          </div>
          <div>
            <h2 className="text-gray-900 dark:text-gray-100 text-xl font-semibold mb-2">
              Booking Policies
            </h2>
            <p>
              Cancellations and rescheduling must follow the agreed service window.
            </p>
          </div>
          <div>
            <h2 className="text-gray-900 dark:text-gray-100 text-xl font-semibold mb-2">
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
