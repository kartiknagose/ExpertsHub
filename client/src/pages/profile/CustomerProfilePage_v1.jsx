import { useEffect, useState, useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { CheckCircle, MapPin, Save, ShieldCheck, UserCircle, Camera, PencilLine, X, Navigation, Loader2, Search, Map as MapIcon, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, Input, CardHeader, CardTitle, CardDescription, Button, Badge } from '../../components/common';
import { LocationPicker } from '../../components/features/location/LocationPicker';

import { getCustomerProfile, saveCustomerProfile } from '../../api/customers';
import { uploadProfilePhoto } from '../../api/uploads';
import { useAuth } from '../../hooks/useAuth';
import { resolveProfilePhotoUrl } from '../../utils/profilePhoto';
import { getPageLayout } from '../../constants/layout';
import { usePageTitle } from '../../hooks/usePageTitle';

export function CustomerProfilePage() {
  const { t } = useTranslation();
  usePageTitle(t('My Profile'));

  const customerProfileSchema = z.object({
    line1: z.string().min(3, t('Address line 1 is required')),
    line2: z.string().optional(),
    city: z.string().min(2, t('City is required')),
    state: z.string().min(2, t('State is required')),
    postalCode: z.string().min(3, t('Postal code is required')),
    country: z.string().min(2, t('Country is required')),
  });

  const navigate = useNavigate();
  const { user: authUser, setUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [addressSummary, setAddressSummary] = useState(null);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [initialPhotoUrl, setInitialPhotoUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(customerProfileSchema),
  });

  const watchedLine1 = useWatch({ control, name: 'line1' });
  const watchedLine2 = useWatch({ control, name: 'line2' });
  const watchedCity = useWatch({ control, name: 'city' });
  const watchedState = useWatch({ control, name: 'state' });
  const watchedPostal = useWatch({ control, name: 'postalCode' });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getCustomerProfile();
        const address = data.user?.addresses?.[0];

        setProfileUser(data.user || null);
        setAddressSummary(address || null);

        if (address) {
          setValue('line1', address.line1 || '');
          setValue('line2', address.line2 || '');
          setValue('city', address.city || '');
          setValue('state', address.state || '');
          setValue('postalCode', address.postalCode || '');
          setValue('country', address.country || '');
        } else {
          // New user or empty profile - Auto-enable edit mode for setup
          setIsEditing(true);
          setValue('country', 'India');
        }

        if (data.user?.profilePhotoUrl) {
          const resolvedPhoto = resolveProfilePhotoUrl(data.user.profilePhotoUrl);
          setPhotoPreview(resolvedPhoto);
          setInitialPhotoUrl(resolvedPhoto);
        }
      } catch (error) {
        setServerError(error.response?.data?.message || t('Failed to load profile'));
      }
    };

    loadProfile();
  }, [setValue, t]);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Client-side guard: only allow image uploads.
      if (!file.type.startsWith('image/')) {
        setServerError(t('Only image files are allowed'));
        setPhotoFile(null);
        setPhotoPreview(initialPhotoUrl || '');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setSuccessMessage('');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setServerError('');
    setSuccessMessage('');
    setPhotoFile(null);
    setPhotoPreview(initialPhotoUrl || '');
    reset({
      line1: addressSummary?.line1 || '',
      line2: addressSummary?.line2 || '',
      city: addressSummary?.city || '',
      state: addressSummary?.state || '',
      postalCode: addressSummary?.postalCode || '',
      country: addressSummary?.country || 'India',
    });
  };

  const handleMapLocationChange = useCallback(async (loc) => {
    if (!loc) return;
    setSelectedLocation(loc);

    // If the location picker has an address, we can try to parse it
    // But better to perform a fresh reverse geocode to get structured parts if possible
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${loc.lat}&lon=${loc.lng}`
      );
      const data = await response.json();

      if (data.address) {
        const addr = data.address;
        
        const line1 = [addr.house_number, addr.road, addr.neighbourhood, addr.residential].filter(Boolean).join(', ');
        const line2 = [addr.suburb, addr.city_district, addr.amenity].filter(Boolean).join(', ');
        const city = addr.city || addr.town || addr.village || addr.municipality || '';
        const state = addr.state || '';
        const postalCode = addr.postcode || '';

        setValue('line1', line1 || addr.display_name?.split(',')[0] || '', { shouldDirty: true });
        setValue('line2', line2 || '', { shouldDirty: true });
        setValue('city', city, { shouldDirty: true });
        setValue('state', state, { shouldDirty: true });
        setValue('postalCode', postalCode, { shouldDirty: true });
        setValue('country', 'India', { shouldDirty: true });
      }
    } catch (error) {
      console.error('Map Reverse Geocoding Error:', error);
      // Fallback: just use the raw address if provided by the picker
      if (loc.address) {
        setValue('line1', loc.address, { shouldDirty: true });
      }
    }
  }, [setValue]);

  const onSubmit = async (data) => {
    setServerError('');
    setSuccessMessage('');

    try {
      let profilePhotoUrl;
      if (photoFile) {
        const uploadResult = await uploadProfilePhoto(photoFile);
        profilePhotoUrl = uploadResult.url;
      }

      await saveCustomerProfile({
        ...data,
        country: 'India',
        profilePhotoUrl,
      });

      // Refresh profile data so UI reflects changes without a reload.
      const refreshed = await getCustomerProfile();
      const refreshedAddress = refreshed.user?.addresses?.[0] || null;
      setProfileUser(refreshed.user || null);
      setAddressSummary(refreshedAddress);

      setSuccessMessage(t('Profile updated successfully.'));

      if (refreshed.user) {
        const updatedUser = { ...authUser, ...refreshed.user };
        // Ensure manual update of profilePhotoUrl if for some reason backend didn't return it instantly (though it should)
        if (profilePhotoUrl) {
          updatedUser.profilePhotoUrl = profilePhotoUrl;
        }

        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }

      if (refreshed.user?.profilePhotoUrl) {
        const resolvedPhoto = resolveProfilePhotoUrl(refreshed.user.profilePhotoUrl);
        setPhotoPreview(resolvedPhoto);
        setInitialPhotoUrl(resolvedPhoto);
      } else if (profilePhotoUrl) {
        // Fallback if refreshed user didn't have it yet for some reason
        const resolvedPhoto = resolveProfilePhotoUrl(profilePhotoUrl);
        setPhotoPreview(resolvedPhoto);
        setInitialPhotoUrl(resolvedPhoto);
      }

      setIsEditing(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || t('Failed to update profile');
      setServerError(errorMessage);
    }
  };

  return (
    <MainLayout>
      <div className={getPageLayout('default')}>
        {(() => {
          const user = profileUser || authUser;
          const hasPhoto = Boolean(photoPreview);
          const hasAddress = Boolean(addressSummary);
          const hasEmailVerified = Boolean(user?.emailVerified);
          const completionTotal = 3;
          const completionCount = [hasPhoto, hasAddress, hasEmailVerified].filter(Boolean).length;
          const completionPercent = Math.round((completionCount / completionTotal) * 100);
          const addressLine = addressSummary
            ? `${addressSummary.line1}, ${addressSummary.city}, ${addressSummary.state}`
            : t('Add your address to speed up bookings.');
          const canEditPhoto = isEditing;

          return (
            <>
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                  {t('Profile')}
                </h1>
                <p className="text-gray-600 mt-2 dark:text-gray-400">
                  {t('Keep your account details up to date for smooth bookings.')}
                </p>
              </div>

              <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                <div className="space-y-6">
                  <Card className="p-6">
                    <div className="flex items-center gap-4">
                      {photoPreview ? (
                        <img src={photoPreview} alt={t("Profile")} className="w-16 h-16 rounded-full object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white">
                          <UserCircle size={28} />
                        </div>
                      )}
                      <div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {user?.name || t('Customer')}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="info">{t('Customer')}</Badge>
                          {hasEmailVerified ? (
                            <Badge variant="success">{t('Email Verified')}</Badge>
                          ) : (
                            <Badge variant="warning">{t('Email Pending')}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                          {user?.email || t('Add email')}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <MapPin size={16} className="text-success-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {addressLine}
                      </span>
                    </div>

                    <div className="mt-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-200">
                        {t('Profile Photo')}
                      </label>
                      <label
                        className={`flex items-center gap-3 rounded-xl border border-dashed px-3 py-3 text-sm font-medium transition-colors border-gray-200 text-gray-700 bg-gray-50 dark:border-dark-600 dark:text-gray-200 dark:bg-dark-800/40 ${canEditPhoto ? 'cursor-pointer hover:border-brand-500' : 'cursor-not-allowed opacity-70'}`}
                      >
                        <Camera size={16} />
                        <div>
                          <p>{t('Drop or upload a photo')}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {photoFile?.name || t('JPG, PNG up to 5MB')}
                          </p>
                          {!canEditPhoto && (
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              {t('Click Edit to update')}
                            </p>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handlePhotoChange}
                          disabled={!canEditPhoto}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <CardTitle>{t('Profile Completion')}</CardTitle>
                    <CardDescription>{t('Build trust with a complete profile.')}</CardDescription>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">{t('Progress')}</span>
                        <span className="text-gray-800 dark:text-gray-200">{completionPercent}%</span>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-dark-700">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-brand-500 to-accent-500"
                          style={{ width: `${completionPercent}%` }}
                        />
                      </div>
                      <div className="mt-4 space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle size={16} className={hasPhoto ? 'text-success-500' : 'text-gray-400'} />
                          <span className="text-gray-600 dark:text-gray-300">{t('Add a profile photo')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle size={16} className={hasAddress ? 'text-success-500' : 'text-gray-400'} />
                          <span className="text-gray-600 dark:text-gray-300">{t('Save your address')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={16} className={hasEmailVerified ? 'text-success-500' : 'text-gray-400'} />
                          <span className="text-gray-600 dark:text-gray-300">{t('Verify email')}</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <CardTitle>{t('Quick Actions')}</CardTitle>
                    <CardDescription>{t('Get the most out of UrbanPro')}</CardDescription>
                    <div className="mt-4 space-y-3">
                      <Button fullWidth onClick={() => navigate('/services')}>
                        {t('Browse Services')}
                      </Button>
                      <Button fullWidth variant="outline" onClick={() => navigate('/customer/bookings')}>
                        {t('View My Bookings')}
                      </Button>
                    </div>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>
                          {!addressSummary ? t('Complete Your Profile') : (isEditing ? t('Edit Profile') : t('Contact & Address'))}
                        </CardTitle>
                        <CardDescription>
                          {isEditing
                            ? t('Update your details and save changes.')
                            : t('Use a current address in India for faster matching.')}
                        </CardDescription>
                      </div>
                      {!isEditing && (
                        <Button size="sm" icon={PencilLine} onClick={() => setIsEditing(true)}>
                          {t('Edit')}
                        </Button>
                      )}
                    </div>
                  </CardHeader>

                  {!isEditing && (
                    <div className="space-y-4 px-6 pb-6">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('Name')}</p>
                        <p className="text-gray-800 dark:text-gray-200">{user?.name || '--'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('Email')}</p>
                        <p className="text-gray-800 dark:text-gray-200">{user?.email || '--'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('Address')}</p>
                        <p className="text-gray-800 dark:text-gray-200">{addressLine}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('City')}</p>
                        <p className="text-gray-800 dark:text-gray-200">{addressSummary?.city || '--'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('State')}</p>
                        <p className="text-gray-800 dark:text-gray-200">{addressSummary?.state || '--'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('PIN Code')}</p>
                        <p className="text-gray-800 dark:text-gray-200">{addressSummary?.postalCode || '--'}</p>
                      </div>
                    </div>
                  )}

                  {isEditing && (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 pb-6">
                      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="space-y-4">
                          <div className="mb-4">
                            <label className="block text-sm font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-3">
                              {t('Select Location on Map')}
                            </label>
                            <div className="rounded-3xl overflow-hidden border border-neutral-200 dark:border-dark-700 shadow-sm relative z-10">
                              <LocationPicker
                                initialLocation={selectedLocation}
                                onChange={handleMapLocationChange}
                              />
                            </div>
                          </div>

                          <Input
                            label={t("Address Line 1")}
                            placeholder={t("Flat 12, MG Road")}
                            icon={MapPin}
                            error={errors.line1?.message}
                            {...register('line1')}
                          />

                          <Input
                            label={t("Address Line 2 (Optional)")}
                            placeholder={t("Building, area")}
                            icon={MapPin}
                            error={errors.line2?.message}
                            {...register('line2')}
                          />

                          <div className="grid gap-4 md:grid-cols-2">
                            <Input
                              label={t("City")}
                              placeholder={t("Bengaluru")}
                              icon={MapPin}
                              error={errors.city?.message}
                              {...register('city')}
                            />

                            <Input
                              label={t("State/UT")}
                              placeholder={t("Karnataka")}
                              icon={MapPin}
                              error={errors.state?.message}
                              {...register('state')}
                            />
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <Input
                              label={t("PIN Code")}
                              placeholder={t("560001")}
                              icon={MapPin}
                              error={errors.postalCode?.message}
                              {...register('postalCode')}
                            />

                            <Input
                              label={t("Country")}
                              placeholder={t("India")}
                              icon={MapPin}
                              error={errors.country?.message}
                              readOnly
                              {...register('country')}
                            />
                          </div>
                        </div>

                        <div className="space-y-4 rounded-2xl border p-4 border-gray-200 bg-gray-50 dark:border-dark-700 dark:bg-dark-900/40">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('Live Preview')}</p>
                            <div className="mt-3 rounded-xl border p-4 border-gray-200 bg-white dark:border-dark-700 dark:bg-dark-900">
                              <p className="text-xs text-gray-500 dark:text-gray-400">{t('Saved Address')}</p>
                              <p className="text-base text-gray-900 dark:text-gray-100">
                                {watchedLine1 || addressSummary?.line1 || t('Add your street address')}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {[watchedLine2 || addressSummary?.line2, watchedCity || addressSummary?.city, watchedState || addressSummary?.state]
                                  .filter(Boolean)
                                  .join(', ') || t('City, State')}
                              </p>
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-xl border p-3 border-gray-200 bg-white dark:border-dark-700 dark:bg-dark-900">
                              <p className="text-xs text-gray-500 dark:text-gray-400">{t('PIN Code')}</p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {watchedPostal || addressSummary?.postalCode || '--'}
                              </p>
                            </div>
                            <div className="rounded-xl border p-3 border-gray-200 bg-white dark:border-dark-700 dark:bg-dark-900">
                              <p className="text-xs text-gray-500 dark:text-gray-400">{t('City')}</p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {watchedCity || addressSummary?.city || '--'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {serverError && (
                        <p className="text-sm text-error-500">{serverError}</p>
                      )}

                      {successMessage && (
                        <p className="text-sm text-success-600 dark:text-success-400">
                          {successMessage}
                        </p>
                      )}

                      <div className="flex flex-col gap-3">
                        <Button
                          type="submit"
                          fullWidth
                          loading={isSubmitting}
                          icon={Save}
                          iconPosition="right"
                        >
                          {t('Save Changes')}
                        </Button>
                        <Button
                          type="button"
                          fullWidth
                          variant="outline"
                          icon={X}
                          onClick={handleCancelEdit}
                        >
                          {t('Cancel')}
                        </Button>
                      </div>
                    </form>
                  )}
                </Card>
              </div>

            </>
          );
        })()}
      </div>
    </MainLayout>
  );
}
