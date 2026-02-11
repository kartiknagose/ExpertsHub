// FAQ page

import { MainLayout } from '../../components/layout/MainLayout';
import { Card } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';

const faqs = [
  {
    q: 'How do I book a service?',
    a: 'Browse services, choose a worker, and schedule a time that works for you.'
  },
  {
    q: 'Are workers verified?',
    a: 'Yes. We verify identity and continuously monitor quality through reviews and ratings.'
  },
  {
    q: 'Can I reschedule or cancel a booking?',
    a: 'Yes. You can reschedule or cancel based on the service policy and time window.'
  },
  {
    q: 'How do workers get paid?',
    a: 'Payments are released after service completion and customer confirmation.'
  },
];

export function FaqPage() {
  const { isDark } = useTheme();

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className={`text-4xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            Frequently Asked Questions
          </h1>
          <p className={isDark ? 'text-gray-400 mt-3' : 'text-gray-600 mt-3'}>
            Answers to common questions about UrbanPro.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((item) => (
            <Card key={item.q}>
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                {item.q}
              </h3>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                {item.a}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
