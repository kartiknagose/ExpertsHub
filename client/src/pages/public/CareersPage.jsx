// Careers page

import { MainLayout } from '../../components/layout/MainLayout';
import { Card } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';

const openings = [
  { title: 'Customer Success Specialist', location: 'Remote' },
  { title: 'Operations Manager', location: 'Hybrid' },
  { title: 'Full Stack Developer', location: 'Remote' },
];

export function CareersPage() {
  const { isDark } = useTheme();

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className={`text-4xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            Careers
          </h1>
          <p className={isDark ? 'text-gray-400 mt-3' : 'text-gray-600 mt-3'}>
            Help us build the most trusted services marketplace.
          </p>
        </div>

        <div className="space-y-4">
          {openings.map((job) => (
            <Card key={job.title}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                    {job.title}
                  </h3>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{job.location}</p>
                </div>
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Apply via email</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
