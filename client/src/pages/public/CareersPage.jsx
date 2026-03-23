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
      <div className={`${getPageLayout('narrow')} module-canvas module-canvas--public`}>
        <section className="mb-8 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-dark-700 dark:bg-dark-800">
          <PageHeader
            title="Careers"
            subtitle="Help us build the most trusted services marketplace."
          />
        </section>

        <div className="space-y-4">
          {openings.map((job) => (
            <Card key={job.title} className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-dark-700 dark:bg-dark-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {job.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{job.location}</p>
                </div>
                <span className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-brand-600 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300">Apply via email</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
