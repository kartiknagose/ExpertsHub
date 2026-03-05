import { CalendarClock, MapPin, IndianRupee, User, MessageSquare, Zap, FileText, CheckCircle2 } from 'lucide-react';
import { Input, Textarea, Button } from '../../../components/common';
import { LocationPicker } from '../../../components/features/location/LocationPicker';

export function BookingFormPanel({
  service,
  bookingMode,
  activeMode,
  selectedWorker,
  register,
  handleSubmit,
  onSubmit,
  errors,
  isSubmitting,
  estimatedPrice,
  selectedLocation,
  setSelectedLocation,
  setValue,
  serverError,
  successMessage,
}) {
  return (
    <div className="rounded-3xl shadow-2xl overflow-hidden ring-1 bg-white ring-black/5 shadow-xl shadow-brand-900/5 dark:bg-dark-800 dark:ring-white/5 dark:shadow-black/50">
      {/* Integrated Header */}
      <div className="px-6 py-6 bg-brand-50/50 border-b border-brand-100 dark:bg-brand-900/20 dark:border-white/5">
        <h2 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">Booking Details</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Complete your request to secure a slot.</p>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register('workerProfileId')} />

          {bookingMode === 'DIRECT' && !selectedWorker && (
            <div className="mb-6 p-4 rounded-2xl bg-warning-50 text-warning-800 border border-warning-200 flex items-start gap-3 animate-pulse">
              <User size={20} className="mt-0.5 shrink-0" />
              <span className="text-sm font-medium">Please select a worker from the list on the left to continue.</span>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-5">
            {/* Date Time */}
            <div>
              <Input
                type="datetime-local"
                label="Date & Time"
                icon={CalendarClock}
                error={errors.scheduledDate?.message}
                {...register('scheduledDate')}
              />
            </div>

            {/* Address */}
            <div>
              <Textarea
                label="Service Location"
                rows={2}
                placeholder="Enter your full address"
                icon={MapPin}
                error={errors.addressDetails?.message}
                {...register('addressDetails')}
              />
              <div className="mt-4">
                <LocationPicker
                  initialLocation={selectedLocation}
                  onChange={(loc) => {
                    setSelectedLocation(loc);
                    if (loc?.address) {
                      setValue('addressDetails', loc.address, { shouldDirty: true, shouldValidate: true });
                    }
                  }}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <Textarea
                label="Special Requests (Optional)"
                rows={2}
                placeholder="Any specific instructions..."
                icon={MessageSquare}
                {...register('notes')}
              />
            </div>

            {/* Optional Price Input */}
            <div>
              <Input
                type="number"
                label="Offer Price (Optional)"
                icon={IndianRupee}
                placeholder={`Leave blank for standard ₹${selectedWorker ? selectedWorker.hourlyRate : service.basePrice}`}
                {...register('estimatedPrice')}
              />
              <p className="mt-1.5 text-[10px] text-gray-400 font-medium pl-1 uppercase tracking-tighter">Enter a budget if you want to negotiate.</p>
            </div>
          </div>

          {/* Pricing Summary Block */}
          <div className="mt-8 p-4 rounded-xl border bg-gray-50 border-gray-200 dark:bg-dark-900 dark:border-dark-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500 dark:text-gray-400">Selected Service</span>
              <span className="font-medium text-gray-900 dark:text-white">{service.name}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500 dark:text-gray-400">Booking Mode</span>
              <span className="text-brand-600 dark:text-brand-400 font-medium">{activeMode?.title}</span>
            </div>
            <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-200 dark:border-dark-700">
              <span className="text-base font-semibold">Total Estimate</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{estimatedPrice || (selectedWorker ? selectedWorker.hourlyRate : service.basePrice)}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-8">
            {serverError && (
              <div className="mb-4 p-3 rounded-xl bg-error-50 text-error-600 text-sm border border-error-100 flex items-center gap-2">
                <FileText size={16} /> {serverError}
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-success-50 text-success-600 text-sm border border-success-100 flex items-center gap-2">
                <CheckCircle2 size={16} /> {successMessage}
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isSubmitting}
              disabled={!activeMode?.enabled || (bookingMode === 'DIRECT' && !selectedWorker)}
              className="h-14 text-lg font-bold shadow-xl shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {bookingMode === 'AUTO_ASSIGN' ? 'Find Worker Now' : 'Confirm Booking'}
            </Button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
              <Zap size={12} fill="currentColor" />
              <span>Secure payment only after job completion</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
