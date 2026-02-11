// About page

import { MainLayout } from '../../components/layout/MainLayout';
import { Card } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';

export function AboutPage() {
  const { isDark } = useTheme();

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className={`text-4xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            About UrbanPro
          </h1>
          <p className={isDark ? 'text-gray-400 mt-3' : 'text-gray-600 mt-3'}>
            UrbanPro connects customers with trusted professionals for home services, repairs, and maintenance. We focus on quality, transparency, and reliable service delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h2 className={`text-2xl font-semibold mb-3 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              Our Mission
            </h2>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Make local services accessible, predictable, and high-quality for every household. We aim to empower skilled workers and help customers book with confidence.
            </p>
          </Card>

          <Card>
            <h2 className={`text-2xl font-semibold mb-3 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              What We Stand For
            </h2>
            <ul className={isDark ? 'text-gray-400 list-disc ml-5 space-y-2' : 'text-gray-600 list-disc ml-5 space-y-2'}>
              <li>Verified professionals and transparent ratings</li>
              <li>Clear pricing and upfront expectations</li>
              <li>Reliable scheduling and communication</li>
              <li>Customer-first support</li>
            </ul>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <Card>
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              Trust & Safety
            </h3>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              We invest in verification and quality monitoring so customers feel safe and workers get recognized for great work.
            </p>
          </Card>
          <Card>
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              Fair Opportunity
            </h3>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              We help skilled professionals build reputations and grow consistent income through a trusted marketplace.
            </p>
          </Card>
          <Card>
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              Community Impact
            </h3>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              By connecting local talent with local demand, we strengthen neighborhood economies and service quality.
            </p>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
