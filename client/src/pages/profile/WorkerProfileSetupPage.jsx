// Worker profile setup page
// Collects worker-specific details after registration

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, DollarSign, Save, Image } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common';
import { Input, Button } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';
import { createWorkerProfile } from '../../api/workers';
import { uploadProfilePhoto } from '../../api/uploads';

// Validation schema for worker profile setup
const workerProfileSchema = z.object({
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
  skills: z.string().min(2, 'Please add at least one skill'),
  serviceAreas: z.string().min(2, 'Please add at least one service area'),
  hourlyRate: z.coerce.number().min(1, 'Hourly rate must be greater than 0'),
  profilePhotoUrl: z.string().url('Profile photo must be a valid URL').optional().or(z.literal('')),
});

export function WorkerProfileSetupPage() {
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
    resolver: zodResolver(workerProfileSchema),
  });

  const onSubmit = async (data) => {
    setServerError('');
    setSuccessMessage('');

    // Transform comma-separated values into arrays
    const skillsArray = data.skills
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);

    const serviceAreasArray = data.serviceAreas
      .split(',')
      .map((area) => area.trim())
      .filter(Boolean);

    try {
      let profilePhotoUrl;
      if (photoFile) {
        const uploadResult = await uploadProfilePhoto(photoFile);
        profilePhotoUrl = uploadResult.url;
      }

      await createWorkerProfile({
        bio: data.bio,
        hourlyRate: data.hourlyRate,
        skills: skillsArray,
        serviceAreas: serviceAreasArray,
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
            <CardTitle>Set Up Your Worker Profile</CardTitle>
            <CardDescription>
              Add your skills and service details to start getting bookings
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Bio */}
            <div>
              <label className={isDark ? 'block text-sm font-medium text-gray-200 mb-1.5' : 'block text-sm font-medium text-gray-700 mb-1.5'}>
                Bio
              </label>
              <textarea
                rows={4}
                placeholder="Tell customers about your experience"
                className={`w-full px-4 py-2.5 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 ${
                  isDark
                    ? errors.bio
                      ? 'bg-dark-800 border-error-500 text-gray-100 focus:border-error-400 focus:ring-error-500/50'
                      : 'bg-dark-800 border-dark-600 text-gray-100 placeholder-gray-500 focus:border-brand-500 focus:ring-brand-500/50 hover:border-dark-500'
                    : errors.bio
                      ? 'bg-white border-error-500 text-gray-900 focus:border-error-400 focus:ring-error-500/50'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-brand-600 focus:ring-brand-600/50 hover:border-gray-400'
                }`}
                {...register('bio')}
              />
              {errors.bio && (
                <p className={isDark ? 'mt-1.5 text-sm text-error-400' : 'mt-1.5 text-sm text-error-500'}>
                  {errors.bio.message}
                </p>
              )}
            </div>

            {/* Skills */}
            <Input
              label="Skills (comma separated)"
              placeholder="Plumbing, Electrical, Carpentry"
              icon={Briefcase}
              error={errors.skills?.message}
              {...register('skills')}
            />

            {/* Service Areas */}
            <Input
              label="Service Areas (comma separated)"
              placeholder="Lagos, Ikeja, Lekki"
              icon={MapPin}
              error={errors.serviceAreas?.message}
              {...register('serviceAreas')}
            />

            {/* Hourly Rate */}
            <Input
              label="Hourly Rate"
              type="number"
              placeholder="50"
              icon={DollarSign}
              error={errors.hourlyRate?.message}
              {...register('hourlyRate')}
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

            {/* Server Error */}
            {serverError && (
              <p className="text-sm text-error-500">{serverError}</p>
            )}

            {/* Success Message */}
            {successMessage && (
              <p className={isDark ? 'text-sm text-success-400' : 'text-sm text-success-600'}>
                {successMessage}
              </p>
            )}

            {/* Submit Button */}
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
