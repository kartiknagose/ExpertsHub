// Careers page

import { MainLayout } from '../../components/layout/MainLayout';
import { Card, PageHeader } from '../../components/common';
import { getPageLayout } from '../../constants/layout';
import { usePageTitle } from '../../hooks/usePageTitle';

const openings = [
  { title: 'Customer Success Specialist', location: 'Remote' },
  { title: 'Operations Manager', location: 'Hybrid' },
  { title: 'Full Stack Developer', location: 'Remote' },
];

export function CareersPage() {
    usePageTitle('Careers');
  return (
    <MainLayout>
      <div className={getPageLayout('narrow')}>
        <PageHeader
          title="Careers"
          subtitle="Help us build the most trusted services marketplace."
        />

        <div className="space-y-4">
          {openings.map((job) => (
            <Card key={job.title}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {job.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{job.location}</p>
                </div>
                <span className="text-gray-600 dark:text-gray-400">Apply via email</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
