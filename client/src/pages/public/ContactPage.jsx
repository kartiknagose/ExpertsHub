// Contact page

import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, PageHeader } from '../../components/common';
import { getPageLayout } from '../../constants/layout';

export function ContactPage() {
  return (
    <MainLayout>
      <div className={getPageLayout('narrow')}>
        <PageHeader
          title="Contact Us"
          subtitle="We are here to help with bookings, payments, and account support. Reach out anytime."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="text-brand-500" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Email</h3>
                  <p className="text-gray-600 dark:text-gray-400">support@urbanpro.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="text-accent-500" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Phone</h3>
                  <p className="text-gray-600 dark:text-gray-400">+91 98765 43210</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="text-success-500" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Office</h3>
                  <p className="text-gray-600 dark:text-gray-400">123 Business St, City, Country</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="text-warning-500" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Support Hours</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Mon - Sat: 8:00 AM - 8:00 PM
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Sun: 10:00 AM - 4:00 PM
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Need quick help?</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Check our FAQ for common questions and solutions.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
