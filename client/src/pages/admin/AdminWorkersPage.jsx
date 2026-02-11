import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common';
import { Badge, Spinner } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';
import { getAdminWorkers } from '../../api/admin';

export function AdminWorkersPage() {
  const { isDark } = useTheme();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-workers'],
    queryFn: getAdminWorkers,
  });

  const workers = data?.workers || [];

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

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        )}

        {isError && (
          <Card className="p-6">
            <p className="text-error-500 mb-3">
              {error?.response?.data?.error || error?.message || 'Failed to load workers.'}
            </p>
            <button type="button" className="text-sm text-brand-500" onClick={() => refetch()}>
              Retry
            </button>
          </Card>
        )}

        {!isLoading && !isError && (
          <div className="space-y-4">
            {workers.length === 0 && (
              <Card className="p-6">
                <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                  No worker profiles found.
                </p>
              </Card>
            )}
            {workers.map((worker) => (
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
        )}
      </div>
    </MainLayout>
  );
}
