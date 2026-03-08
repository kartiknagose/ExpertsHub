import { useState } from 'react';
import { CalendarClock, MapPin, IndianRupee, User, MessageSquare, Zap, FileText, CheckCircle2, Ticket, X } from 'lucide-react';
import { Input, Textarea, Button, Badge } from '../../../components/common';
import { LocationPicker } from '../../../components/features/location/LocationPicker';
import { AddressAutocomplete } from '../../../components/features/location/AddressAutocomplete';
import { validateCoupon } from '../../../api/growth';
import { toast } from 'sonner';

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
  pricingData,
  isPricing,
}) {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsValidating(true);
    try {
      const result = await validateCoupon({
        code: couponCode,
        bookingAmount: pricingData?.totalPrice || estimatedPrice || (selectedWorker ? selectedWorker.hourlyRate : service.basePrice),
        serviceCategory: service.category
      });
      setAppliedCoupon(result);
      setValue('couponCode', result.code);
      toast.success(`Coupon "${result.code}" applied! Discount: ₹${result.discountAmount}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid coupon code');
      setAppliedCoupon(null);
      setValue('couponCode', '');
    } finally {
      setIsValidating(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setValue('couponCode', '');
  };

  const finalTotalPrice = pricingData?.totalPrice || estimatedPrice || (selectedWorker ? selectedWorker.hourlyRate : service.basePrice);
  const discountedPrice = appliedCoupon ? Math.max(0, finalTotalPrice - appliedCoupon.discountAmount) : finalTotalPrice;

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
          <input type="hidden" {...register('couponCode')} />

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

            {/* Address Autocomplete (Google Places) */}
            <div>
              <AddressAutocomplete
                value={selectedLocation?.address || ''}
                onChange={(loc) => {
                  setSelectedLocation(loc);
                  setValue('addressDetails', loc.address, { shouldDirty: true, shouldValidate: true });
                  setValue('addressLat', loc.lat);
                  setValue('addressLng', loc.lng);
                  setValue('addressDetailsStructured', loc.details);
                }}
                placeholder="Search for your address..."
              />
              <div className="mt-4">
                <LocationPicker
                  initialLocation={selectedLocation}
                  onChange={(loc) => {
                    setSelectedLocation(loc);
                    if (loc?.address) {
                      setValue('addressDetails', loc.address, { shouldDirty: true, shouldValidate: true });
                      setValue('addressLat', loc.lat);
                      setValue('addressLng', loc.lng);
                      setValue('addressDetailsStructured', loc.details);
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

            {/* Coupon Code Inline Input */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-gray-400 pl-1 flex items-center gap-2">
                <Ticket size={12} /> Coupon Code
              </label>
              <div className="flex gap-2">
                <div className="grow relative">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={!!appliedCoupon}
                    placeholder="WINTER50"
                    className="w-full h-12 px-4 rounded-xl border border-gray-100 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 font-black uppercase placeholder:opacity-30 outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                  {appliedCoupon && (
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-error-500"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                {!appliedCoupon ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    loading={isValidating}
                    onClick={handleApplyCoupon}
                    className="px-6 rounded-xl font-bold"
                  >
                    Apply
                  </Button>
                ) : (
                  <div className="h-12 flex items-center">
                    <Badge variant="success" className="h-8 px-3 font-black">APPLIED</Badge>
                  </div>
                )}
              </div>
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
          <div className="mt-8 p-6 rounded-3xl border bg-gray-50/50 border-gray-100 dark:bg-dark-900/30 dark:border-dark-800">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Selected Service</span>
              <span className="font-bold text-gray-900 dark:text-white">{service.name}</span>
            </div>

            {pricingData && (
              <div className="space-y-3 pb-4 mb-4 border-b border-gray-100 border-dashed dark:border-dark-800">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Service Fee</span>
                  <span className="font-bold text-gray-700 dark:text-gray-300">₹{pricingData.basePrice}</span>
                </div>

                {pricingData.timeMultiplier > 1 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Premium Timing</span>
                    <span className="text-warning-600 font-bold">x{pricingData.timeMultiplier}</span>
                  </div>
                )}

                {pricingData.surgeMultiplier > 1 && (
                  <div className="flex justify-between items-center text-sm text-error-600">
                    <span className="flex items-center gap-1 font-bold">
                      <Zap size={12} fill="currentColor" /> Peak Demand Surge
                    </span>
                    <span className="font-black">x{pricingData.surgeMultiplier}</span>
                  </div>
                )}

                {pricingData.gstAmount > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Taxes (GST 18%)</span>
                    <span className="text-gray-400 font-medium">+₹{pricingData.gstAmount}</span>
                  </div>
                )}
              </div>
            )}

            {appliedCoupon && (
              <div className="flex justify-between items-center mb-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 border border-emerald-100 dark:border-emerald-900/20">
                <div className="flex items-center gap-2">
                  <Ticket size={16} />
                  <span className="text-xs font-black uppercase">{appliedCoupon.code} Applied</span>
                </div>
                <span className="font-black">-₹{appliedCoupon.discountAmount}</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div>
                <span className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Payable</span>
                <span className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                  {isPricing ? (
                    <div className="w-24 h-8 bg-gray-100 animate-pulse rounded-lg" />
                  ) : (
                    <>
                      {appliedCoupon ? (
                        <>
                          <span className="text-gray-300 line-through text-lg mt-1 font-bold">₹{finalTotalPrice}</span>
                          <span className="text-emerald-600">₹{discountedPrice}</span>
                        </>
                      ) : (
                        `₹${finalTotalPrice}`
                      )}
                    </>
                  )}
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
                <IndianRupee size={24} />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-8">
            {serverError && (
              <div className="mb-4 p-4 rounded-2xl bg-error-50 text-error-600 text-sm border border-error-100 flex items-start gap-3">
                <AlertCircle size={20} className="shrink-0" />
                <span className="font-bold">{serverError}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-4 rounded-2xl bg-success-50 text-success-600 text-sm border border-success-100 flex items-start gap-3">
                <CheckCircle2 size={20} className="shrink-0" />
                <span className="font-bold">{successMessage}</span>
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isSubmitting}
              disabled={!activeMode?.enabled || (bookingMode === 'DIRECT' && !selectedWorker)}
              className="h-16 text-xl font-black rounded-2xl shadow-xl shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {bookingMode === 'AUTO_ASSIGN' ? 'Find Worker Now' : 'Confirm Booking'}
            </Button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-tighter">
              <Zap size={14} fill="currentColor" className="text-brand-500" />
              <span>Zero cancellation fee within 5 minutes</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

