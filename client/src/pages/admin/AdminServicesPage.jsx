import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PlusCircle } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common';
import { Button, Spinner } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';
import { createService, getAllServices } from '../../api/services';

export function AdminServicesPage() {
  const { isDark } = useTheme();
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState({
    name: '',
    category: '',
    basePrice: '',
    description: '',
  });

  const servicesQuery = useQuery({
    queryKey: ['services'],
    queryFn: getAllServices,
  });

  const createMutation = useMutation({
    mutationFn: (payload) => createService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setFormState({ name: '', category: '', basePrice: '', description: '' });
    },
  });

  const services = servicesQuery.data?.services || servicesQuery.data || [];

  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    createMutation.mutate({
      name: formState.name,
      category: formState.category || undefined,
      description: formState.description || undefined,
      basePrice: formState.basePrice ? Number(formState.basePrice) : undefined,
    });
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className={`text-4xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            Services Catalog
          </h1>
          <p className={isDark ? 'text-gray-400 mt-2' : 'text-gray-600 mt-2'}>
            Manage the services available for customers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Service</CardTitle>
              <CardDescription>Create a new service for the marketplace.</CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6">
              <div>
                <label className={isDark ? 'block text-sm font-medium text-gray-200 mb-2' : 'block text-sm font-medium text-gray-700 mb-2'}>
                  Service Name
                </label>
                <input
                  value={formState.name}
                  onChange={(event) => handleChange('name', event.target.value)}
                  placeholder="e.g., Home Cleaning"
                  className={`w-full px-4 py-2.5 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 ${
                    isDark
                      ? 'bg-dark-800 border-dark-600 text-gray-100 placeholder-gray-500 focus:border-brand-500 focus:ring-brand-500/50'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-brand-600 focus:ring-brand-600/50'
                  }`}
                />
              </div>

              <div>
                <label className={isDark ? 'block text-sm font-medium text-gray-200 mb-2' : 'block text-sm font-medium text-gray-700 mb-2'}>
                  Category
                </label>
                <input
                  value={formState.category}
                  onChange={(event) => handleChange('category', event.target.value)}
                  placeholder="e.g., Home"
                  className={`w-full px-4 py-2.5 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 ${
                    isDark
                      ? 'bg-dark-800 border-dark-600 text-gray-100 placeholder-gray-500 focus:border-brand-500 focus:ring-brand-500/50'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-brand-600 focus:ring-brand-600/50'
                  }`}
                />
              </div>

              <div>
                <label className={isDark ? 'block text-sm font-medium text-gray-200 mb-2' : 'block text-sm font-medium text-gray-700 mb-2'}>
                  Base Price
                </label>
                <input
                  type="number"
                  value={formState.basePrice}
                  onChange={(event) => handleChange('basePrice', event.target.value)}
                  placeholder="e.g., 500"
                  className={`w-full px-4 py-2.5 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 ${
                    isDark
                      ? 'bg-dark-800 border-dark-600 text-gray-100 placeholder-gray-500 focus:border-brand-500 focus:ring-brand-500/50'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-brand-600 focus:ring-brand-600/50'
                  }`}
                />
              </div>

              <div>
                <label className={isDark ? 'block text-sm font-medium text-gray-200 mb-2' : 'block text-sm font-medium text-gray-700 mb-2'}>
                  Description
                </label>
                <textarea
                  rows={4}
                  value={formState.description}
                  onChange={(event) => handleChange('description', event.target.value)}
                  placeholder="Describe the service"
                  className={`w-full px-4 py-2.5 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 ${
                    isDark
                      ? 'bg-dark-800 border-dark-600 text-gray-100 placeholder-gray-500 focus:border-brand-500 focus:ring-brand-500/50'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-brand-600 focus:ring-brand-600/50'
                  }`}
                />
              </div>

              {createMutation.isError && (
                <p className="text-sm text-error-500">
                  {createMutation.error?.response?.data?.error || createMutation.error?.message || 'Failed to create service.'}
                </p>
              )}

              <Button
                type="submit"
                fullWidth
                icon={PlusCircle}
                loading={createMutation.isPending}
              >
                Add Service
              </Button>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Services</CardTitle>
              <CardDescription>Visible services for customers.</CardDescription>
            </CardHeader>

            {servicesQuery.isLoading && (
              <div className="flex items-center justify-center py-16">
                <Spinner size="lg" />
              </div>
            )}

            {servicesQuery.isError && (
              <div className="px-6 pb-6">
                <p className="text-error-500">Failed to load services.</p>
              </div>
            )}

            {!servicesQuery.isLoading && !servicesQuery.isError && (
              <div className="space-y-3 px-6 pb-6">
                {services.length === 0 && (
                  <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    No services added yet.
                  </p>
                )}
                {services.map((service) => (
                  <div key={service.id} className="rounded-lg border px-4 py-3">
                    <p className={isDark ? 'text-gray-100 font-semibold' : 'text-gray-900 font-semibold'}>
                      {service.name}
                    </p>
                    <p className={isDark ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>
                      {service.category || 'Uncategorized'} · {service.basePrice ? `INR ${service.basePrice}` : 'No base price'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
