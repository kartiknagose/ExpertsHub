import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Star, Search } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardDescription, Input } from '../../components/common';
import { Badge, AsyncState, PageHeader } from '../../components/common';
import { getAdminWorkers } from '../../api/admin';
import { getPageLayout } from '../../constants/layout';
import { queryKeys } from '../../utils/queryKeys';
import { useSocketEvent } from '../../hooks/useSocket';
import { usePageTitle } from '../../hooks/usePageTitle';

export function AdminWorkersPage() {
    usePageTitle('Manage Workers');
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.admin.workers(),
    queryFn: getAdminWorkers,
  });

  const workers = data?.workers || [];

  const refreshWorkers = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.workers() });
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard() });
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.verificationPreview() });
    queryClient.invalidateQueries({ queryKey: queryKeys.verification.applications() });
  };

  useSocketEvent('verification:created', refreshWorkers);
  useSocketEvent('verification:updated', refreshWorkers);
  useSocketEvent('admin:workers_updated', refreshWorkers);
  useSocketEvent('admin:users_updated', refreshWorkers);

  const filteredWorkers = workers.filter(worker =>
    (worker.user?.name && worker.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (worker.user?.email && worker.user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <MainLayout>
      <div className={`${getPageLayout('default')} module-canvas module-canvas--utility`}>
        <PageHeader
          title="Workers"
          subtitle="Review worker profiles and services."
        />

        <div className="mb-6 max-w-md">
          <Input
            icon={Search}
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
                    <p className="text-gray-900 dark:text-gray-100 font-semibold">
                      {worker.user?.name || 'Worker'}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {worker.user?.email || 'No email'}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
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
