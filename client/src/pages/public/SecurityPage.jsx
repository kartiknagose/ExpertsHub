// Security page

import { ShieldCheck, Lock, AlertTriangle } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, PageHeader } from '../../components/common';
import { getPageLayout } from '../../constants/layout';
import { usePageTitle } from '../../hooks/usePageTitle';

export function SecurityPage() {
    usePageTitle('Security');
  return (
    <MainLayout>
      <div className={`${getPageLayout('default')} module-canvas module-canvas--public`}>
        <section className="mb-8 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-dark-700 dark:bg-dark-800">
          <PageHeader
            title="Security & Trust"
            subtitle="We protect both customers and workers through verification, monitoring, and secure systems."
          />
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-dark-700 dark:bg-dark-800">
            <ShieldCheck className="text-success-500 mb-3" />
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Verified Professionals
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Identity checks, email verification, and community reviews keep standards high.
            </p>
          </Card>
          <Card className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-dark-700 dark:bg-dark-800">
            <Lock className="text-brand-500 mb-3" />
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Data Protection
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Secure authentication, hashed passwords, and minimal data exposure.
            </p>
          </Card>
          <Card className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-dark-700 dark:bg-dark-800">
            <AlertTriangle className="text-warning-500 mb-3" />
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Active Monitoring
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              We review feedback, flag risky behavior, and protect the community.
            </p>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
