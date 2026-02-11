// Customer profile setup page
// Collects address and profile photo for customers

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { MapPin, Image, Save } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common';
import { Input, Button } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';
import { saveCustomerProfile } from '../../api/customers';
import { uploadProfilePhoto } from '../../api/uploads';

const customerProfileSchema = z.object({
  line1: z.string().min(3, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.literal('India'),
  profilePhotoUrl: z.string().url('Profile photo must be a valid URL').optional().or(z.literal('')),
});

export function CustomerProfileSetupPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(customerProfileSchema),
  });

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
      setSuccessMessage('Profile saved successfully.');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to save profile';
      setServerError(errorMessage);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Set Up Your Profile</CardTitle>
            <CardDescription>
              Add your address and profile photo to book services faster
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Address Line 1"
              placeholder="123 Main Street"
              icon={MapPin}
              error={errors.line1?.message}
              {...register('line1')}
            />

            <Input
              label="Address Line 2 (Optional)"
              placeholder="Apartment, suite, etc."
              icon={MapPin}
              error={errors.line2?.message}
              {...register('line2')}
            />

            <Input
              label="City"
              placeholder="City"
              icon={MapPin}
              error={errors.city?.message}
              {...register('city')}
            />

            <Input
              label="State"
              placeholder="State"
              icon={MapPin}
              error={errors.state?.message}
              {...register('state')}
            />

            <Input
              label="Postal Code"
              placeholder="Postal Code"
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
              value="India"
              {...register('country')}
            />

            {/* Profile Photo */}
            <div>
              <label className={isDark ? 'block text-sm font-medium text-gray-200 mb-2' : 'block text-sm font-medium text-gray-700 mb-2'}>
                Profile Photo (Attachment)
              </label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-dark-700 overflow-hidden">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Image size={24} />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPhotoFile(file);
                      setPhotoPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="text-sm"
                />
              </div>
            </div>

            {serverError && (
              <p className="text-sm text-error-500">{serverError}</p>
            )}

            {successMessage && (
              <p className={isDark ? 'text-sm text-success-400' : 'text-sm text-success-600'}>
                {successMessage}
              </p>
            )}

            <Button
              type="submit"
              fullWidth
              loading={isSubmitting}
              icon={Save}
              iconPosition="right"
            >
              Save Profile
            </Button>

            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-brand-500 hover:text-brand-600 font-medium"
              >
                Go to Home
              </button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}
