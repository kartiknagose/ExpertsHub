// How It Works page

import { UserPlus, Search, CalendarCheck, Star } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, PageHeader } from '../../components/common';
import { getPageLayout } from '../../constants/layout';

const steps = [
  { icon: UserPlus, title: 'Sign Up', text: 'Create an account in minutes as a customer or worker.' },
  { icon: Search, title: 'Find Services', text: 'Browse categories, compare options, and choose the right fit.' },
  { icon: CalendarCheck, title: 'Book & Schedule', text: 'Pick a time that works for you and confirm your booking.' },
  { icon: Star, title: 'Rate & Review', text: 'Share feedback to keep the community trustworthy.' },
];

export function HowItWorksPage() {
  return (
    <MainLayout>
      <div className={getPageLayout('default')}>
        <PageHeader
          title="How It Works"
          subtitle="From signup to service completion, UrbanPro makes it seamless for both customers and workers."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Card key={step.title}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                    <Icon className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {step.text}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
