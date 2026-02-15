import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star, Search } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common';
import { Badge, AsyncState } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';
import { getAdminWorkers } from '../../api/admin';

export function AdminWorkersPage() {
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-workers'],
    queryFn: getAdminWorkers,
  });

  const workers = data?.workers || [];

  const filteredWorkers = workers.filter(worker =>
    (worker.user?.name && worker.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (worker.user?.email && worker.user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className={`text-4xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            Workers
          </h1>
          <p className={isDark ? 'text-gray-400 mt-2' : 'text-gray-600 mt-2'}>
            Review worker profiles and services.
          </p>
        </div>

        <div className="mb-6 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border outline-none transition-colors ${isDark
              ? 'bg-dark-900 border-dark-700 text-white focus:border-brand-500'
              : 'bg-white border-gray-200 text-gray-900 focus:border-brand-500'}`}
          />
        </div>

        <AsyncState
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={refetch}
          isEmpty={!isLoading && !isError && filteredWorkers.length === 0}
          emptyTitle={searchTerm ? "No results found" : "No worker profiles found"}
          emptyMessage={searchTerm ? "Try different keywords." : "Check back after workers complete onboarding."}
          errorFallback={
            <Card className="p-6">
              <p className="text-error-500 mb-3">
                {error?.response?.data?.error || error?.message || 'Failed to load workers.'}
              </p>
              <button type="button" className="text-sm text-brand-500" onClick={() => refetch()}>
                Retry
              </button>
            </Card>
          }
        >
          <div className="space-y-4">
            {filteredWorkers.map((worker) => (
              <Card key={worker.id} className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className={isDark ? 'text-gray-100 font-semibold' : 'text-gray-900 font-semibold'}>
                      {worker.user?.name || 'Worker'}
                    </p>
                    <p className={isDark ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>
                      {worker.user?.email || 'No email'}
                    </p>
                    <p className={isDark ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>
                      {worker.bio || 'No bio yet'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={worker.isVerified ? 'success' : 'warning'}>
                      {worker.isVerified ? 'Verified' : 'Pending'}
                    </Badge>
                    <Badge variant="info">{worker.services?.length || 0} services</Badge>
                    <Badge variant="default" className="flex items-center gap-1">
                      <Star size={14} /> {worker.rating?.toFixed?.(1) || '0.0'}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </AsyncState>
      </div>
    </MainLayout>
  );
}
