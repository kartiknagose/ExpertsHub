// About page

import { MainLayout } from '../../components/layout/MainLayout';
import { Card, PageHeader } from '../../components/common';
import { getPageLayout } from '../../constants/layout';

export function AboutPage() {
  return (
    <MainLayout>
      <div className={getPageLayout('default')}>
        <PageHeader
          title="About UrbanPro"
          subtitle="UrbanPro connects customers with trusted professionals for home services, repairs, and maintenance. We focus on quality, transparency, and reliable service delivery."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
              Our Mission
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Make local services accessible, predictable, and high-quality for every household. We aim to empower skilled workers and help customers book with confidence.
            </p>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
              What We Stand For
            </h2>
            <ul className="text-gray-600 dark:text-gray-400 list-disc ml-5 space-y-2">
              <li>Verified professionals and transparent ratings</li>
              <li>Clear pricing and upfront expectations</li>
              <li>Reliable scheduling and communication</li>
              <li>Customer-first support</li>
            </ul>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <Card>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Trust & Safety
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              We invest in verification and quality monitoring so customers feel safe and workers get recognized for great work.
            </p>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Fair Opportunity
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              We help skilled professionals build reputations and grow consistent income through a trusted marketplace.
            </p>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Community Impact
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              By connecting local talent with local demand, we strengthen neighborhood economies and service quality.
            </p>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
