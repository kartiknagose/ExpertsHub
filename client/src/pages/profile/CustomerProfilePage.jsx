// Customer profile page
// Allows customers to view and update their profile and address

import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle, MapPin, Save, ShieldCheck, UserCircle, Camera, PencilLine, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common';
import { Input, Button, Badge } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';
import { getCustomerProfile, saveCustomerProfile } from '../../api/customers';
import { uploadProfilePhoto } from '../../api/uploads';
import { useAuth } from '../../hooks/useAuth';
import { resolveProfilePhotoUrl } from '../../utils/profilePhoto';
import { getPageLayout } from '../../constants/layout';

const customerProfileSchema = z.object({
  line1: z.string().min(3, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
});

export function CustomerProfilePage() {
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
        setServerError(error.response?.data?.message || 'Failed to load profile');
      }
    };

    loadProfile();
  }, [setValue]);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Client-side guard: only allow image uploads.
      if (!file.type.startsWith('image/')) {
        setServerError('Only image files are allowed');
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

      setSuccessMessage('Profile updated successfully.');

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
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
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
              : 'Add your address to speed up bookings.';
            const canEditPhoto = isEditing;

            return (
              <>
                <div className="mb-8">
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                    Profile
                  </h1>
                  <p className="text-gray-600 mt-2 dark:text-gray-400">
                    Keep your account details up to date for smooth bookings.
                  </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                  <div className="space-y-6">
                    <Card className="p-6">
                      <div className="flex items-center gap-4">
                        {photoPreview ? (
                          <img src={photoPreview} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white">
                            <UserCircle size={28} />
                          </div>
                        )}
                        <div>
                          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {user?.name || 'Customer'}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="info">Customer</Badge>
                            {hasEmailVerified ? (
                              <Badge variant="success">Email Verified</Badge>
                            ) : (
                              <Badge variant="warning">Email Pending</Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                            {user?.email || 'Add email'}
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
                          Profile Photo
                        </label>
                        <label
                          className={`flex items-center gap-3 rounded-xl border border-dashed px-3 py-3 text-sm font-medium transition-colors border-gray-200 text-gray-700 bg-gray-50 dark:border-dark-600 dark:text-gray-200 dark:bg-dark-800/40 ${canEditPhoto ? 'cursor-pointer hover:border-brand-500' : 'cursor-not-allowed opacity-70'}`}
                        >
                          <Camera size={16} />
                          <div>
                            <p>Drop or upload a photo</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {photoFile?.name || 'JPG, PNG up to 5MB'}
                            </p>
                            {!canEditPhoto && (
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                Click Edit to update
                              </p>
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            disabled={!canEditPhoto}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <CardTitle>Profile Completion</CardTitle>
                      <CardDescription>Build trust with a complete profile.</CardDescription>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">Progress</span>
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
                            <span className="text-gray-600 dark:text-gray-300">Add a profile photo</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={16} className={hasAddress ? 'text-success-500' : 'text-gray-400'} />
                            <span className="text-gray-600 dark:text-gray-300">Save your address</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ShieldCheck size={16} className={hasEmailVerified ? 'text-success-500' : 'text-gray-400'} />
                            <span className="text-gray-600 dark:text-gray-300">Verify email</span>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <CardTitle>Quick Actions</CardTitle>
                      <CardDescription>Get the most out of UrbanPro</CardDescription>
                      <div className="mt-4 space-y-3">
                        <Button fullWidth onClick={() => navigate('/services')}>
                          Browse Services
                        </Button>
                        <Button fullWidth variant="outline" onClick={() => navigate('/bookings')}>
                          View My Bookings
                        </Button>
                      </div>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>
                            {!addressSummary ? 'Complete Your Profile' : (isEditing ? 'Edit Profile' : 'Contact & Address')}
                          </CardTitle>
                          <CardDescription>
                            {isEditing
                              ? 'Update your details and save changes.'
                              : 'Use a current address in India for faster matching.'}
                          </CardDescription>
                        </div>
                        {!isEditing && (
                          <Button size="sm" icon={PencilLine} onClick={() => setIsEditing(true)}>
                            Edit
                          </Button>
                        )}
                      </div>
                    </CardHeader>

                    {!isEditing && (
                      <div className="space-y-4 px-6 pb-6">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                          <p className="text-gray-800 dark:text-gray-200">{user?.name || '--'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                          <p className="text-gray-800 dark:text-gray-200">{user?.email || '--'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Address</p>
                          <p className="text-gray-800 dark:text-gray-200">{addressLine}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">City</p>
                          <p className="text-gray-800 dark:text-gray-200">{addressSummary?.city || '--'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">State</p>
                          <p className="text-gray-800 dark:text-gray-200">{addressSummary?.state || '--'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">PIN Code</p>
                          <p className="text-gray-800 dark:text-gray-200">{addressSummary?.postalCode || '--'}</p>
                        </div>
                      </div>
                    )}

                    {isEditing && (
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 pb-6">
                        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                          <div className="space-y-4">
                            <Input
                              label="Address Line 1"
                              placeholder="Flat 12, MG Road"
                              icon={MapPin}
                              error={errors.line1?.message}
                              {...register('line1')}
                            />

                            <Input
                              label="Address Line 2 (Optional)"
                              placeholder="Building, area"
                              icon={MapPin}
                              error={errors.line2?.message}
                              {...register('line2')}
                            />

                            <div className="grid gap-4 md:grid-cols-2">
                              <Input
                                label="City"
                                placeholder="Bengaluru"
                                icon={MapPin}
                                error={errors.city?.message}
                                {...register('city')}
                              />

                              <Input
                                label="State/UT"
                                placeholder="Karnataka"
                                icon={MapPin}
                                error={errors.state?.message}
                                {...register('state')}
                              />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <Input
                                label="PIN Code"
                                placeholder="560001"
                                icon={MapPin}
                                error={errors.postalCode?.message}
                                {...register('postalCode')}
                              />

                              <Input
                                label="Country"
                                placeholder="India"
                                icon={MapPin}
                                error={errors.country?.message}
                                readOnly
                                {...register('country')}
                              />
                            </div>
                          </div>

                          <div className="space-y-4 rounded-2xl border p-4 border-gray-200 bg-gray-50 dark:border-dark-700 dark:bg-dark-900/40">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Live Preview</p>
                              <div className="mt-3 rounded-xl border p-4 border-gray-200 bg-white dark:border-dark-700 dark:bg-dark-900">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Saved Address</p>
                                <p className="text-base text-gray-900 dark:text-gray-100">
                                  {watchedLine1 || addressSummary?.line1 || 'Add your street address'}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {[watchedLine2 || addressSummary?.line2, watchedCity || addressSummary?.city, watchedState || addressSummary?.state]
                                    .filter(Boolean)
                                    .join(', ') || 'City, State'}
                                </p>
                              </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="rounded-xl border p-3 border-gray-200 bg-white dark:border-dark-700 dark:bg-dark-900">
                                <p className="text-xs text-gray-500 dark:text-gray-400">PIN Code</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                  {watchedPostal || addressSummary?.postalCode || '--'}
                                </p>
                              </div>
                              <div className="rounded-xl border p-3 border-gray-200 bg-white dark:border-dark-700 dark:bg-dark-900">
                                <p className="text-xs text-gray-500 dark:text-gray-400">City</p>
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
                            Save Changes
                          </Button>
                          <Button
                            type="button"
                            fullWidth
                            variant="outline"
                            icon={X}
                            onClick={handleCancelEdit}
                          >
                            Cancel
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
