import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Pencil, Trash2, X, Search } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common';
import { Button, AsyncState } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';
import { createService, getAllServices, updateService, deleteService } from '../../api/services';

export function AdminServicesPage() {
  const { isDark } = useTheme();
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState({
    name: '',
    category: '',
    basePrice: '',
    description: '',
  });
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const servicesQuery = useQuery({
    queryKey: ['services'],
    queryFn: getAllServices,
  });

  const createMutation = useMutation({
    mutationFn: (payload) => createService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateService(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  const services = servicesQuery.data?.services || servicesQuery.data || [];

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.category && service.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const resetForm = () => {
    setFormState({ name: '', category: '', basePrice: '', description: '' });
    setEditId(null);
  };

  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = (service) => {
    setFormState({
      name: service.name,
      category: service.category || '',
      basePrice: service.basePrice || '',
      description: service.description || '',
    });
    setEditId(service.id);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      name: formState.name,
      category: formState.category || undefined,
      description: formState.description || undefined,
      basePrice: formState.basePrice ? Number(formState.basePrice) : undefined,
    };

    if (editId) {
      updateMutation.mutate({ id: editId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

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

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{editId ? 'Edit Service' : 'Add Service'}</CardTitle>
              <CardDescription>
                {editId ? 'Update details for this service' : 'Create a new service for the marketplace.'}
              </CardDescription>
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
                  className={`w-full px-4 py-2.5 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 ${isDark
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
                  className={`w-full px-4 py-2.5 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 ${isDark
                    ? 'bg-dark-800 border-dark-600 text-gray-100 placeholder-gray-500 focus:border-brand-500 focus:ring-brand-500/50'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-brand-600 focus:ring-brand-600/50'
                    }`}
                />
              </div>

              <div>
                <label className={isDark ? 'block text-sm font-medium text-gray-200 mb-2' : 'block text-sm font-medium text-gray-700 mb-2'}>
                  Base Price (Rs)
                </label>
                <input
                  type="number"
                  value={formState.basePrice}
                  onChange={(event) => handleChange('basePrice', event.target.value)}
                  placeholder="e.g., 500"
                  className={`w-full px-4 py-2.5 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 ${isDark
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
                  className={`w-full px-4 py-2.5 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 ${isDark
                    ? 'bg-dark-800 border-dark-600 text-gray-100 placeholder-gray-500 focus:border-brand-500 focus:ring-brand-500/50'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-brand-600 focus:ring-brand-600/50'
                    }`}
                />
              </div>

              {(createMutation.isError || updateMutation.isError) && (
                <p className="text-sm text-error-500">
                  {createMutation.error?.response?.data?.error || updateMutation.error?.response?.data?.error || 'Operation failed.'}
                </p>
              )}

              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  fullWidth
                  icon={editId ? Pencil : PlusCircle}
                  loading={isPending}
                >
                  {editId ? 'Update Service' : 'Add Service'}
                </Button>

                {editId && (
                  <Button
                    type="button"
                    fullWidth
                    variant="outline"
                    icon={X}
                    onClick={resetForm}
                  >
                    Cancel Edit
                  </Button>
                )}
              </div>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Services</CardTitle>
              <CardDescription>Visible services for customers.</CardDescription>
            </CardHeader>

            <div className="px-6 pt-2 pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border outline-none transition-colors ${isDark
                    ? 'bg-dark-900 border-dark-700 text-white focus:border-brand-500'
                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-brand-500'}`}
                />
              </div>
            </div>

            <AsyncState
              isLoading={servicesQuery.isLoading}
              isError={servicesQuery.isError}
              error={servicesQuery.error}
              isEmpty={!servicesQuery.isLoading && !servicesQuery.isError && services.length === 0}
              emptyTitle="No services added"
              emptyMessage="Create a service to get started."
              errorFallback={
                <div className="px-6 pb-6">
                  <p className="text-error-500">Failed to load services.</p>
                </div>
              }
            >
              <div className="space-y-3 px-6 pb-6 max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar">
                {filteredServices.map((service) => (
                  <div key={service.id} className={`rounded-lg border px-4 py-3 flex items-start justify-between group transition-all ${isDark ? 'border-dark-700 bg-dark-800 hover:border-dark-600' : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                    }`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                          {service.name}
                        </p>
                        {service.id === editId && (
                          <span className="text-xs bg-brand-500/10 text-brand-500 px-2 py-0.5 rounded-full">Editing</span>
                        )}
                      </div>
                      <p className={isDark ? 'text-gray-400 text-sm mt-1' : 'text-gray-600 text-sm mt-1'}>
                        {service.category || 'Uncategorized'} · {service.basePrice ? `INR ${service.basePrice}` : 'No base price'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={Pencil}
                        onClick={() => handleEdit(service)}
                        className={isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}
                      >
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={Trash2}
                        loading={deleteMutation.isPending && deleteMutation.variables === service.id}
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this service?')) {
                            deleteMutation.mutate(service.id);
                          }
                        }}
                        className="text-error-500 hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20"
                      >
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </AsyncState>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
