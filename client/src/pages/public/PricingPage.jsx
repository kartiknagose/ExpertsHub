// Pricing page

import { Check } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, PageHeader } from '../../components/common';
import { getPageLayout } from '../../constants/layout';

const tiers = [
  {
    name: 'Basic',
    price: 'Free',
    description: 'Perfect for trying the platform and booking occasional services.',
    features: ['Browse services', 'Verified workers', 'Standard support'],
  },
  {
    name: 'Plus',
    price: '₹199/mo',
    description: 'Best for regular customers who want priority scheduling.',
    features: ['Priority support', 'Faster confirmations', 'Preferred workers'],
  },
  {
    name: 'Pro',
    price: '₹799/mo',
    description: 'Designed for businesses and bulk service needs.',
    features: ['Dedicated account manager', 'Custom pricing', 'Team bookings'],
  },
];

export function PricingPage() {
  return (
    <MainLayout>
      <div className={getPageLayout('default')}>
        <PageHeader
          title="Pricing"
          subtitle="Simple, transparent pricing. Start free and upgrade anytime."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <Card key={tier.name} hoverable>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                {tier.name}
              </h3>
              <p className="text-3xl font-bold mb-3 text-gray-900 dark:text-gray-100">
                {tier.price}
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {tier.description}
              </p>
              <ul className="text-gray-600 dark:text-gray-400 space-y-2">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check size={16} className="text-success-500" />
                    {f}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
