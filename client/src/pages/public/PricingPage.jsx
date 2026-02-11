// Pricing page

import { Check } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';

const tiers = [
  {
    name: 'Basic',
    price: 'Free',
    description: 'Perfect for trying the platform and booking occasional services.',
    features: ['Browse services', 'Verified workers', 'Standard support'],
  },
  {
    name: 'Plus',
    price: '$9/mo',
    description: 'Best for regular customers who want priority scheduling.',
    features: ['Priority support', 'Faster confirmations', 'Preferred workers'],
  },
  {
    name: 'Pro',
    price: '$29/mo',
    description: 'Designed for businesses and bulk service needs.',
    features: ['Dedicated account manager', 'Custom pricing', 'Team bookings'],
  },
];

export function PricingPage() {
  const { isDark } = useTheme();

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className={`text-4xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            Pricing
          </h1>
          <p className={isDark ? 'text-gray-400 mt-3' : 'text-gray-600 mt-3'}>
            Simple, transparent pricing. Start free and upgrade anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <Card key={tier.name} hoverable>
              <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                {tier.name}
              </h3>
              <p className={`text-3xl font-bold mb-3 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                {tier.price}
              </p>
              <p className={isDark ? 'text-gray-400 mb-4' : 'text-gray-600 mb-4'}>
                {tier.description}
              </p>
              <ul className={isDark ? 'text-gray-400 space-y-2' : 'text-gray-600 space-y-2'}>
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
