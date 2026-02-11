// Security page

import { ShieldCheck, Lock, AlertTriangle } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';

export function SecurityPage() {
  const { isDark } = useTheme();

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className={`text-4xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            Security & Trust
          </h1>
          <p className={isDark ? 'text-gray-400 mt-3' : 'text-gray-600 mt-3'}>
            We protect both customers and workers through verification, monitoring, and secure systems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <ShieldCheck className="text-success-500 mb-3" />
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              Verified Professionals
            </h3>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Identity checks, email verification, and community reviews keep standards high.
            </p>
          </Card>
          <Card>
            <Lock className="text-brand-500 mb-3" />
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              Data Protection
            </h3>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Secure authentication, hashed passwords, and minimal data exposure.
            </p>
          </Card>
          <Card>
            <AlertTriangle className="text-warning-500 mb-3" />
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              Active Monitoring
            </h3>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              We review feedback, flag risky behavior, and protect the community.
            </p>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
