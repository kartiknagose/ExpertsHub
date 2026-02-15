// Worker services management page

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Briefcase, PlusCircle, Trash2, Search } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common';
import { Badge, Button, AsyncState, Input } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';
import { getAllServices } from '../../api/services';
import { getMyServices, addServiceToWorker, removeServiceFromWorker } from '../../api/workers';

export function WorkerServicesPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

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
  const isLoading = servicesQuery.isLoading || myServicesQuery.isLoading;
  const hasServicesError = servicesQuery.isError;
  const hasMyServicesError = myServicesQuery.isError;

  const myServiceIds = useMemo(() => {
    return new Set(myServices.map((entry) => entry.service?.id));
  }, [myServices]);

  const availableServices = useMemo(() => {
    return allServices.filter((service) => !myServiceIds.has(service.id));
  }, [allServices, myServiceIds]);

  const filteredAvailableServices = useMemo(() => {
    if (!searchTerm) return availableServices;
    const lowerTerm = searchTerm.toLowerCase();
    return availableServices.filter(service =>
      service.name.toLowerCase().includes(lowerTerm) ||
      (service.category && service.category.toLowerCase().includes(lowerTerm))
    );
  }, [availableServices, searchTerm]);

  const showProfileMessage = myServicesQuery.isError &&
    (myServicesQuery.error?.response?.data?.error || '').includes('Worker profile not found');
  const showError = hasServicesError || (hasMyServicesError && !showProfileMessage);
  const errorMessage = hasServicesError
    ? 'Failed to load services catalog.'
    : hasMyServicesError
      ? 'Failed to load your services.'
      : null;

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

        <AsyncState
          isLoading={isLoading}
          isError={showError}
          error={servicesQuery.error || myServicesQuery.error}
          errorFallback={
            <Card className="p-6 mt-6">
              <p className="text-error-500">{errorMessage || 'Failed to load services.'}</p>
            </Card>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Currently Offered</CardTitle>
                <CardDescription>Services visible on your worker profile</CardDescription>
              </CardHeader>

              {myServices.length === 0 && (
                <p className={`px-6 pb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  You have not added any services yet.
                </p>
              )}

              {myServices.length > 0 && (
                <div className="space-y-3 px-6 pb-6">
                  {myServices.map((entry) => (
                    <div key={entry.serviceId} className={`flex items-center justify-between p-3 rounded-lg border ${isDark ? 'border-dark-700 bg-dark-800' : 'border-gray-100 bg-gray-50'}`}>
                      <div>
                        <p className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                          {entry.service?.name || 'Service'}
                        </p>
                        {entry.service?.category && (
                          <p className={isDark ? 'text-gray-400 text-xs' : 'text-gray-600 text-xs'}>
                            {entry.service.category}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-error-500 hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20"
                        icon={Trash2}
                        loading={removeMutation.isPending && removeMutation.variables === entry.serviceId}
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

              <div className="px-6 mb-4">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} size={18} />
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors ${isDark
                        ? 'bg-dark-900 border-dark-700 text-gray-100 placeholder-gray-500'
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                      }`}
                  />
                </div>
              </div>

              {filteredAvailableServices.length === 0 && (
                <p className={`px-6 pb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {searchTerm ? 'No services match your search.' : 'No more services to add right now.'}
                </p>
              )}

              {filteredAvailableServices.length > 0 && (
                <div className="space-y-3 px-6 pb-6 max-h-[500px] overflow-y-auto custom-scrollbar">
                  {filteredAvailableServices.map((service) => (
                    <div key={service.id} className={`flex items-center justify-between p-3 rounded-lg border ${isDark ? 'border-dark-700 hover:border-dark-600' : 'border-gray-100 hover:border-gray-200'} transition-colors`}>
                      <div>
                        <p className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                          {service.name}
                        </p>
                        {service.category && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {service.category}
                          </Badge>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={PlusCircle}
                        loading={addMutation.isPending && addMutation.variables === service.id}
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
        </AsyncState>
      </div>
    </MainLayout>
  );
}
