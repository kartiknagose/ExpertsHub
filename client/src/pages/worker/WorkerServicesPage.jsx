// Worker services management page

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Briefcase, PlusCircle, Trash2 } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common';
import { Badge, Spinner, Button } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';
import { getAllServices } from '../../api/services';
import { getMyServices, addServiceToWorker, removeServiceFromWorker } from '../../api/workers';

export function WorkerServicesPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const servicesQuery = useQuery({
    queryKey: ['services'],
    queryFn: getAllServices,
  });

  const myServicesQuery = useQuery({
    queryKey: ['worker-services'],
    queryFn: getMyServices,
  });

  const addMutation = useMutation({
    mutationFn: (serviceId) => addServiceToWorker({ serviceId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worker-services'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (serviceId) => removeServiceFromWorker(serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worker-services'] });
    },
  });

  const allServices = servicesQuery.data?.services || servicesQuery.data || [];
  const myServices = myServicesQuery.data?.services || [];

  const myServiceIds = useMemo(() => {
    return new Set(myServices.map((entry) => entry.service?.id));
  }, [myServices]);

  const availableServices = useMemo(() => {
    return allServices.filter((service) => !myServiceIds.has(service.id));
  }, [allServices, myServiceIds]);

  const showProfileMessage = myServicesQuery.isError &&
    (myServicesQuery.error?.response?.data?.error || '').includes('Worker profile not found');

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className={`text-4xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            My Services
          </h1>
          <p className={isDark ? 'text-gray-400 mt-2' : 'text-gray-600 mt-2'}>
            Manage the services you offer to customers.
          </p>
        </div>

        {(servicesQuery.isLoading || myServicesQuery.isLoading) && (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        )}

        {showProfileMessage && (
          <Card className="p-6 mb-6">
            <p className="text-error-500">
              Complete your worker profile before adding services.
            </p>
            <div className="mt-4">
              <Button onClick={() => navigate('/worker/profile/setup')}>
                Set Up Profile
              </Button>
            </div>
          </Card>
        )}

        {!servicesQuery.isLoading && !myServicesQuery.isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Currently Offered</CardTitle>
                <CardDescription>Services visible on your worker profile</CardDescription>
              </CardHeader>

              {myServices.length === 0 && (
                <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                  You have not added any services yet.
                </p>
              )}

              {myServices.length > 0 && (
                <div className="space-y-3">
                  {myServices.map((entry) => (
                    <div key={entry.serviceId} className="flex items-center justify-between">
                      <div>
                        <p className={isDark ? 'text-gray-100' : 'text-gray-900'}>
                          {entry.service?.name || 'Service'}
                        </p>
                        {entry.service?.category && (
                          <p className={isDark ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>
                            {entry.service.category}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Trash2}
                        loading={removeMutation.isPending}
                        onClick={() => removeMutation.mutate(entry.serviceId)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Available Services</CardTitle>
                <CardDescription>Pick services to add to your offer list</CardDescription>
              </CardHeader>

              {availableServices.length === 0 && (
                <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                  No more services to add right now.
                </p>
              )}

              {availableServices.length > 0 && (
                <div className="space-y-3">
                  {availableServices.map((service) => (
                    <div key={service.id} className="flex items-center justify-between">
                      <div>
                        <p className={isDark ? 'text-gray-100' : 'text-gray-900'}>
                          {service.name}
                        </p>
                        {service.category && (
                          <p className={isDark ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>
                            {service.category}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        icon={PlusCircle}
                        loading={addMutation.isPending}
                        onClick={() => addMutation.mutate(service.id)}
                      >
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {servicesQuery.isError && (
          <Card className="p-6 mt-6">
            <p className="text-error-500">Failed to load services catalog.</p>
          </Card>
        )}

        {myServicesQuery.isError && !showProfileMessage && (
          <Card className="p-6 mt-6">
            <p className="text-error-500">Failed to load your services.</p>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
