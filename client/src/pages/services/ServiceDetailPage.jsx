// Service detail page with booking form

import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { FileText } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Button, Spinner, ConfirmDialog, Breadcrumbs } from '../../components/common';
import { useAuth } from '../../hooks/useAuth';
import { getServiceById, getServiceWorkers } from '../../api/services';
import { createBooking, previewPrice } from '../../api/bookings';
import { queryKeys } from '../../utils/queryKeys';
import { getPageLayout } from '../../constants/layout';
import { WorkerProfileWindow } from '../../components/features/workers/WorkerProfileWindow';
import { ServiceHeader } from './components/ServiceHeader';
import { WorkerSelectionPanel } from './components/WorkerSelectionPanel';
import { bookingModes } from './components/bookingModes';
import { BookingFormPanel } from './components/BookingFormPanel';
import { usePageTitle } from '../../hooks/usePageTitle';

const bookingSchema = z.object({
  workerProfileId: z.preprocess((val) => (val === '' || val === undefined ? undefined : Number(val)), z.number().int().positive().optional()), // Optional for Auto-Assign
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  addressDetails: z.string().min(10, 'Address must be at least 10 characters'),
  estimatedPrice: z.preprocess((val) => (val === '' || val === undefined ? undefined : Number(val)), z.number().nonnegative().optional()),
  notes: z.string().max(1000).optional(),
  couponCode: z.string().optional(),
});

export function ServiceDetailPage() {
  usePageTitle('Service Details');
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [bookingMode, setBookingMode] = useState('DIRECT');
  const [workerSearch, setWorkerSearch] = useState('');
  const [profileSetupDialog, setProfileSetupDialog] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [workerDrawer, setWorkerDrawer] = useState({ isOpen: false, workerId: null });

  const activeMode = bookingModes.find((mode) => mode.id === bookingMode);

  const { data: service, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.services.detail(id),
    queryFn: async () => {
      const data = await getServiceById(id);
      return data.service || data;
    },
    enabled: Boolean(id),
  });

  const { data: workers = [], isLoading: workersLoading } = useQuery({
    queryKey: queryKeys.services.workers(id),
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
    control,
    setValue,
  } = useForm({
    resolver: zodResolver(bookingSchema),
  });

  // Auto-select worker from query param (from Worker Profile Window's Book Now)
  const preselectedWorker = searchParams.get('worker');
  useEffect(() => {
    if (preselectedWorker) {
      setValue('workerProfileId', Number(preselectedWorker), { shouldValidate: true, shouldDirty: true });
    }
  }, [preselectedWorker, setValue]);

  const selectedWorkerId = useWatch({ control, name: 'workerProfileId' });
  const scheduledDate = useWatch({ control, name: 'scheduledDate' });
  const estimatedPrice = useWatch({ control, name: 'estimatedPrice' });
  const selectedWorker = workers.find((worker) => String(worker.id) === String(selectedWorkerId));

  const hasValidSelectedLocation = Number.isFinite(Number(selectedLocation?.lat)) && Number.isFinite(Number(selectedLocation?.lng));
  const tempPrice = estimatedPrice || (selectedWorker ? selectedWorker.hourlyRate : service?.basePrice);

  const { data: pricingData, isFetching: isPricing } = useQuery({
    queryKey: ['preview-price', id, selectedWorkerId, scheduledDate, selectedLocation?.lat, tempPrice],
    queryFn: () => previewPrice({
      serviceId: id,
      workerProfileId: selectedWorkerId || null,
      scheduledDate: scheduledDate,
      latitude: hasValidSelectedLocation ? selectedLocation.lat : undefined,
      longitude: hasValidSelectedLocation ? selectedLocation.lng : undefined,
      estimatedPrice: tempPrice
    }),
    enabled: !!service && !!id, // Only run once the service is known
    staleTime: 1000 * 30, // 30s
  });
  const normalizedQuery = workerSearch.trim().toLowerCase();
  const filteredWorkers = normalizedQuery
    ? workers.filter((worker) => {
      const name = (worker.user?.name || '').toLowerCase();
      const rate = worker.hourlyRate ? String(worker.hourlyRate) : '';
      const workerId = worker.id ? String(worker.id) : '';
      return name.includes(normalizedQuery) || rate.includes(normalizedQuery) || workerId.includes(normalizedQuery);
    })
    : workers;

  const handleQuickPick = (workerId) => {
    setValue('workerProfileId', workerId, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = async (data) => {
    setServerError('');
    setSuccessMessage('');

    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/services/${id}` } });
      return;
    }

    // Check for profile completion
    if (!user?.isProfileComplete) {
      setProfileSetupDialog(true);
      return;
    }

    // Validation: If Direct Mode, Worker is required
    if (bookingMode === 'DIRECT' && !data.workerProfileId) {
      setServerError('Please select a worker for Direct Booking.');
      return;
    }

    try {
      const scheduledIso = new Date(data.scheduledDate).toISOString();

      // For Auto-Assign, send null as workerProfileId
      const workerIdToSend = bookingMode === 'DIRECT' ? data.workerProfileId : null;

      if (bookingMode === 'AUTO_ASSIGN' && !hasValidSelectedLocation) {
        setServerError('Please select a service location on the map.');
        return;
      }

      // Calculate estimate to send
      const finalEstimate = data.estimatedPrice || (selectedWorker ? selectedWorker.hourlyRate : service.basePrice);

      await createBooking({
        workerProfileId: workerIdToSend,
        serviceId: Number(id),
        scheduledDate: scheduledIso,
        addressDetails: data.addressDetails,
        latitude: hasValidSelectedLocation ? Number(selectedLocation.lat) : undefined,
        longitude: hasValidSelectedLocation ? Number(selectedLocation.lng) : undefined,
        estimatedPrice: finalEstimate ? Number(finalEstimate) : undefined,
        notes: data.notes,
        couponCode: data.couponCode || null,
      });

      setSuccessMessage('Booking placed successfully! Workers will be notified.');
      reset();
      setSelectedLocation(null);

      // Real-time update: Invalidate booking queries so they refresh immediately
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.customer() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.worker() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all() });

      setTimeout(() => navigate('/dashboard'), 2000);

    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to create booking';
      setServerError(message);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen pb-20 bg-gray-50 dark:bg-dark-950">

        {/* Decorative Background - Subtle & Premium */}
        <div className="absolute top-0 left-0 right-0 h-[500px] overflow-hidden pointer-events-none">
          <div className="absolute -top-[50%] -left-[20%] w-[70%] h-[200%] rounded-full blur-[100px] opacity-20 bg-brand-200 dark:bg-brand-900" />
          <div className="absolute top-0 right-0 w-[50%] h-[100%] rounded-full blur-[120px] opacity-20 bg-blue-200 dark:bg-blue-900" />
        </div>

        <div className={`${getPageLayout('wide')} relative z-10`}>

          <Breadcrumbs items={[
            { label: 'Services', to: '/services' },
            { label: service?.name || 'Service Details' },
          ]} />

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-32">
              <Spinner size="xl" className="text-brand-500" />
              <p className="mt-4 text-gray-500 font-medium animate-pulse">Finding the best experts for you...</p>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="max-w-lg mx-auto mt-20 text-center">
              <div className="w-20 h-20 bg-error-50 text-error-500 rounded-3xl flex items-center justify-center mx-auto mb-6 dark:bg-error-900/20">
                <FileText size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Service Not Found</h3>
              <p className="mb-8 text-gray-600 dark:text-gray-400">{error?.message || 'We could not find the service you are looking for.'}</p>
              <Button onClick={() => navigate('/services')} variant="outline" size="lg">Browse All Services</Button>
            </div>
          )}

          {service && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

              {/* LEFT COLUMN: Content & Selection */}
              <div className="lg:col-span-7 space-y-10">

                <ServiceHeader service={service} />

                <WorkerSelectionPanel
                  service={service}
                  bookingMode={bookingMode}
                  setBookingMode={setBookingMode}
                  workers={workers}
                  workersLoading={workersLoading}
                  filteredWorkers={filteredWorkers}
                  workerSearch={workerSearch}
                  setWorkerSearch={setWorkerSearch}
                  selectedWorkerId={selectedWorkerId}
                  onQuickPick={handleQuickPick}
                  onOpenWorkerProfile={(id) => setWorkerDrawer({ isOpen: true, workerId: id })}
                />
              </div>

              {/* RIGHT COLUMN: Booking Form (Sticky & Clean) */}
              <div className="lg:col-span-5 relative">
                <div className="lg:sticky lg:top-24 transition-all duration-300">
                  <BookingFormPanel
                    service={service}
                    bookingMode={bookingMode}
                    activeMode={activeMode}
                    selectedWorker={selectedWorker}
                    register={register}
                    handleSubmit={handleSubmit}
                    onSubmit={onSubmit}
                    errors={errors}
                    isSubmitting={isSubmitting}
                    estimatedPrice={estimatedPrice}
                    selectedLocation={selectedLocation}
                    setSelectedLocation={setSelectedLocation}
                    setValue={setValue}
                    serverError={serverError}
                    successMessage={successMessage}
                    pricingData={pricingData}
                    isPricing={isPricing}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Setup Dialog */}
      <ConfirmDialog
        isOpen={profileSetupDialog}
        onConfirm={() => {
          navigate('/profile/setup', { state: { from: `/services/${id}` } });
        }}
        onCancel={() => setProfileSetupDialog(false)}
        title="Complete Your Profile"
        message="You need to complete your profile (address details) before booking a service. Would you like to do that now?"
        confirmText="Complete Profile"
        cancelText="Later"
        variant="primary"
      />

      <WorkerProfileWindow
        workerId={workerDrawer.workerId}
        isOpen={workerDrawer.isOpen}
        onClose={() => setWorkerDrawer({ ...workerDrawer, isOpen: false })}
      />
    </MainLayout>
  );
}
