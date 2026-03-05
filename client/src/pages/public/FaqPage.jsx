// FAQ page

import { MainLayout } from '../../components/layout/MainLayout';
import { Card, PageHeader } from '../../components/common';
import { getPageLayout } from '../../constants/layout';

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
  return (
    <MainLayout>
      <div className={getPageLayout('narrow')}>
        <PageHeader
          title="Frequently Asked Questions"
          subtitle="Answers to common questions about UrbanPro."
        />

        <div className="space-y-4">
          {faqs.map((item) => (
            <Card key={item.q}>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                {item.q}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {item.a}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
