// How It Works page

import { UserPlus, Search, CalendarCheck, Star } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';

const steps = [
  { icon: UserPlus, title: 'Sign Up', text: 'Create an account in minutes as a customer or worker.' },
  { icon: Search, title: 'Find Services', text: 'Browse categories, compare options, and choose the right fit.' },
  { icon: CalendarCheck, title: 'Book & Schedule', text: 'Pick a time that works for you and confirm your booking.' },
  { icon: Star, title: 'Rate & Review', text: 'Share feedback to keep the community trustworthy.' },
];

export function HowItWorksPage() {
  const { isDark } = useTheme();

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className={`text-4xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            How It Works
          </h1>
          <p className={isDark ? 'text-gray-400 mt-3' : 'text-gray-600 mt-3'}>
            From signup to service completion, UrbanPro makes it seamless for both customers and workers.
          </p>
        </div>

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
                    <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                      {step.title}
                    </h3>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
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
