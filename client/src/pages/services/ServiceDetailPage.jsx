// Service detail page with booking form

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { CalendarClock, MapPin, DollarSign, User, MessageSquare, Zap, Users, Target, FileText } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common';
import { Input, Button, Spinner, Badge } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { getServiceById, getServiceWorkers } from '../../api/services';
import { createBooking } from '../../api/bookings';

const bookingSchema = z.object({
  workerProfileId: z.coerce.number().int().positive('Worker ID is required'),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  addressDetails: z.string().min(10, 'Address must be at least 10 characters'),
  estimatedPrice: z.coerce.number().nonnegative().optional(),
  notes: z.string().max(1000).optional(),
});

export function ServiceDetailPage() {
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [bookingMode, setBookingMode] = useState('DIRECT');

  const bookingModes = [
    {
      id: 'DIRECT',
      title: 'Direct Worker Booking',
      description: 'Pick a worker and request a slot. The worker confirms.',
      icon: Users,
      enabled: true,
    },
    {
      id: 'AUTO_ASSIGN',
      title: 'Service-First Auto-Assign',
      description: 'We auto-assign the best available worker for you.',
      icon: Target,
      enabled: false,
    },
    {
      id: 'BIDS',
      title: 'Request + Bids',
      description: 'Post a job and compare worker quotes.',
      icon: FileText,
      enabled: false,
    },
    {
      id: 'INSTANT',
      title: 'Instant / On-Demand',
      description: 'Get the nearest available worker now.',
      icon: Zap,
      enabled: false,
    },
  ];

  const activeMode = bookingModes.find((mode) => mode.id === bookingMode);

  const { data: service, isLoading, isError, error } = useQuery({
    queryKey: ['service', id],
    queryFn: async () => {
      const data = await getServiceById(id);
      return data.service || data;
    },
    enabled: Boolean(id),
  });

  const { data: workers = [], isLoading: workersLoading } = useQuery({
    queryKey: ['service-workers', id],
    queryFn: async () => {
      const data = await getServiceWorkers(id);
      return data.workers || data;
    },
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(bookingSchema),
  });

  const onSubmit = async (data) => {
    setServerError('');
    setSuccessMessage('');

    if (bookingMode !== 'DIRECT') {
      setServerError('This booking mode is not available yet.');
      return;
    }

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const scheduledIso = new Date(data.scheduledDate).toISOString();

      await createBooking({
        workerProfileId: data.workerProfileId,
        serviceId: Number(id),
        scheduledDate: scheduledIso,
        addressDetails: data.addressDetails,
        estimatedPrice: data.estimatedPrice,
        notes: data.notes,
      });

      setSuccessMessage('Booking created successfully.');
      reset();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create booking';
      setServerError(message);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        )}

        {isError && (
          <Card className="p-6">
            <p className="text-error-500">{error?.message || 'Failed to load service'}</p>
          </Card>
        )}

        {service && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{service.name}</CardTitle>
                <CardDescription>{service.description || 'No description available.'}</CardDescription>
              </CardHeader>

              <div className="flex items-center gap-3">
                {service.category && <Badge variant="info">{service.category}</Badge>}
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  Base Price: {service.basePrice ? `₹${service.basePrice}` : 'Contact'}
                </span>
              </div>

              <div className="mt-6">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                  Booking Modes
                </h3>
                <p className={isDark ? 'text-gray-400 mt-2' : 'text-gray-600 mt-2'}>
                  Choose how you want to book this service.
                </p>

                <div className="mt-4 space-y-3">
                  {bookingModes.map((mode) => {
                    const Icon = mode.icon;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        disabled={!mode.enabled}
                        onClick={() => setBookingMode(mode.id)}
                        className={`w-full text-left border rounded-xl p-4 transition-all duration-200 ${bookingMode === mode.id
                            ? 'border-brand-500 shadow-md'
                            : isDark
                              ? 'border-dark-700'
                              : 'border-gray-200'
                          } ${mode.enabled
                            ? isDark
                              ? 'bg-dark-800 hover:border-brand-500/60'
                              : 'bg-white hover:border-brand-500/60'
                            : isDark
                              ? 'bg-dark-900/60 text-gray-500 cursor-not-allowed'
                              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                            <Icon size={18} className="text-white" />
                          </div>
                          <div>
                            <p className={`text-sm font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                              {mode.title}
                              {!mode.enabled && (
                                <span className="ml-2 text-xs text-warning-500">Coming soon</span>
                              )}
                            </p>
                            <p className={isDark ? 'text-gray-400 text-sm mt-1' : 'text-gray-600 text-sm mt-1'}>
                              {mode.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Book This Service</CardTitle>
                <CardDescription>Provide details to schedule your booking</CardDescription>
              </CardHeader>

              {!activeMode?.enabled && (
                <div className="px-6 pb-0">
                  <p className={isDark ? 'text-warning-400 text-sm' : 'text-warning-600 text-sm'}>
                    This booking mode is not available yet. Select Direct Worker Booking to proceed.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className={isDark ? 'block text-sm font-medium text-gray-200 mb-1.5' : 'block text-sm font-medium text-gray-700 mb-1.5'}>
                    Select Worker
                  </label>
                  <div className={`relative ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select
                      className={`w-full pl-11 px-4 py-2.5 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 ${isDark
                          ? 'bg-dark-800 border-dark-600 text-gray-100 focus:border-brand-500 focus:ring-brand-500/50'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-brand-600 focus:ring-brand-600/50'
                        }`}
                      {...register('workerProfileId')}
                    >
                      <option value="">Choose a worker</option>
                      {workers.map((worker) => (
                        <option key={worker.id} value={worker.id}>
                          {worker.user?.name || 'Worker'}{worker.hourlyRate ? ` - ₹${worker.hourlyRate}/hr` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.workerProfileId && (
                    <p className={isDark ? 'mt-1.5 text-sm text-error-400' : 'mt-1.5 text-sm text-error-500'}>
                      {errors.workerProfileId.message}
                    </p>
                  )}
                  {!workersLoading && workers.length === 0 && (
                    <p className={isDark ? 'mt-1.5 text-sm text-warning-400' : 'mt-1.5 text-sm text-warning-600'}>
                      No workers found for this service yet.
                    </p>
                  )}
                </div>

                <div>
                  <label className={isDark ? 'block text-sm font-medium text-gray-200 mb-1.5' : 'block text-sm font-medium text-gray-700 mb-1.5'}>
                    Scheduled Date & Time
                  </label>
                  <div className="relative">
                    <CalendarClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="datetime-local"
                      className={`w-full pl-11 px-4 py-2.5 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 ${isDark
                          ? 'bg-dark-800 border-dark-600 text-gray-100 focus:border-brand-500 focus:ring-brand-500/50'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-brand-600 focus:ring-brand-600/50'
                        }`}
                      {...register('scheduledDate')}
                    />
                  </div>
                  {errors.scheduledDate && (
                    <p className={isDark ? 'mt-1.5 text-sm text-error-400' : 'mt-1.5 text-sm text-error-500'}>
                      {errors.scheduledDate.message}
                    </p>
                  )}
                </div>

                <Input
                  label="Service Address"
                  placeholder="123 Main St, City"
                  icon={MapPin}
                  error={errors.addressDetails?.message}
                  {...register('addressDetails')}
                />

                <Input
                  label="Estimated Price (Optional)"
                  type="number"
                  placeholder="150"
                  icon={DollarSign}
                  error={errors.estimatedPrice?.message}
                  {...register('estimatedPrice')}
                />

                <Input
                  label="Notes (Optional)"
                  placeholder="Any special instructions"
                  icon={MessageSquare}
                  error={errors.notes?.message}
                  {...register('notes')}
                />

                {serverError && (
                  <p className="text-sm text-error-500">{serverError}</p>
                )}

                {successMessage && (
                  <p className={isDark ? 'text-sm text-success-400' : 'text-sm text-success-600'}>
                    {successMessage}
                  </p>
                )}

                <Button type="submit" fullWidth loading={isSubmitting} disabled={!activeMode?.enabled}>
                  Book Now
                </Button>
              </form>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
