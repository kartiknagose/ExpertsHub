// Worker profile page
// Allows workers to view and update their profile

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Briefcase, MapPin, IndianRupee, Image, Save, UserCircle, Star, ShieldCheck, CheckCircle, PencilLine, X, Plus } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common';
import { Input, Button, Badge } from '../../components/common';
import { toast } from 'sonner';
import { getMyWorkerProfile, createWorkerProfile } from '../../api/workers';
import { uploadProfilePhoto } from '../../api/uploads';
import { useAuth } from '../../hooks/useAuth';
import { resolveProfilePhotoUrl } from '../../utils/profilePhoto';
import { getPageLayout } from '../../constants/layout';
import { LocationPicker } from '../../components/features/location/LocationPicker';
import { MiniMap } from '../../components/features/location/MiniMap';

const workerProfileSchema = z.object({
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
  skills: z.string().min(2, 'Please add at least one skill'),
  serviceAreas: z.string().min(2, 'Please add at least one service area'),
  hourlyRate: z.coerce.number().min(1, 'Hourly rate must be greater than 0'),
  baseLatitude: z.number().optional(),
  baseLongitude: z.number().optional(),
  serviceRadius: z.number().min(1).max(100).optional(),
});

export function WorkerProfilePage() {
  const navigate = useNavigate();
  const { user: authUser, setUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [skillsList, setSkillsList] = useState([]);
  const [serviceAreasList, setServiceAreasList] = useState([]);
  const [serverError, setServerError] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [initialPhotoUrl, setInitialPhotoUrl] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [areaInput, setAreaInput] = useState('');
  const [initialSkillsList, setInitialSkillsList] = useState([]);
  const [initialAreasList, setInitialAreasList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(workerProfileSchema),
  });

  const watchedRate = useWatch({ control, name: 'hourlyRate' });
  const watchedRadius = useWatch({ control, name: 'serviceRadius' });

  // Only show Save Changes when the user is editing and changed something.
  const canSave = isEditing && (isDirty || Boolean(photoFile) || (photoPreview && photoPreview !== initialPhotoUrl));

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getMyWorkerProfile();
        const profile = data.profile;
        const userData = data.profile?.user || authUser || null;

        setProfileData({
          ...profile,
          user: userData,
        });

        if (profile) {
          const normalizeList = (value) => {
            if (Array.isArray(value)) return value;
            if (typeof value === 'string') {
              try {
                const parsed = JSON.parse(value);
                return Array.isArray(parsed) ? parsed : [];
              } catch {
                return value.split(',').map((item) => item.trim()).filter(Boolean);
              }
            }
            return [];
          };

          const normalizedSkills = normalizeList(profile.skills);
          const normalizedAreas = normalizeList(profile.serviceAreas);

          setValue('bio', profile.bio || '');
          setValue('skills', normalizedSkills.join(', '));
          setValue('serviceAreas', normalizedAreas.join(', '));
          setValue('hourlyRate', profile.hourlyRate || '');
          setValue('baseLatitude', profile.baseLatitude || undefined);
          setValue('baseLongitude', profile.baseLongitude || undefined);
          setValue('serviceRadius', profile.serviceRadius || 10);

          setSkillsList(normalizedSkills);
          setServiceAreasList(normalizedAreas);
          setInitialSkillsList(normalizedSkills);
          setInitialAreasList(normalizedAreas);

          // If important fields are missing, treat as setup/edit mode
          if (!profile.bio || !profile.hourlyRate || normalizedSkills.length === 0 || normalizedAreas.length === 0) {
            setIsEditing(true);
          }
        } else {
          // No profile at all, definitely setup mode
          setIsEditing(true);
        }

        const resolvedPhoto = resolveProfilePhotoUrl(
          profile?.user?.profilePhotoUrl || authUser?.profilePhotoUrl || ''
        );
        if (resolvedPhoto) {
          setPhotoPreview(resolvedPhoto);
          setInitialPhotoUrl(resolvedPhoto);
        }
      } catch (error) {
        setServerError(error.response?.data?.message || 'Failed to load profile');
      }
    };

    loadProfile();
  }, [setValue, authUser]);

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
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setServerError('');
    setPhotoFile(null);
    setPhotoPreview(initialPhotoUrl || '');
    setSkillInput('');
    setAreaInput('');
    setSkillsList(initialSkillsList);
    setServiceAreasList(initialAreasList);
    reset({
      bio: profileData?.bio || '',
      skills: initialSkillsList.join(', '),
      serviceAreas: initialAreasList.join(', '),
      hourlyRate: profileData?.hourlyRate || '',
    });
  };

  const syncSkills = (next) => {
    setSkillsList(next);
    setValue('skills', next.join(', '), { shouldDirty: true });
  };

  const syncAreas = (next) => {
    setServiceAreasList(next);
    setValue('serviceAreas', next.join(', '), { shouldDirty: true });
  };

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value) return;
    if (skillsList.length >= 10) return;
    if (skillsList.some((item) => item.toLowerCase() === value.toLowerCase())) {
      setSkillInput('');
      return;
    }
    syncSkills([...skillsList, value]);
    setSkillInput('');
  };

  const addArea = () => {
    const value = areaInput.trim();
    if (!value) return;
    if (serviceAreasList.length >= 10) return;
    if (serviceAreasList.some((item) => item.toLowerCase() === value.toLowerCase())) {
      setAreaInput('');
      return;
    }
    syncAreas([...serviceAreasList, value]);
    setAreaInput('');
  };

  const removeSkill = (value) => {
    syncSkills(skillsList.filter((item) => item !== value));
  };

  const removeArea = (value) => {
    syncAreas(serviceAreasList.filter((item) => item !== value));
  };

  const onSubmit = async (data) => {
    setServerError('');

    try {
      let profilePhotoUrl;
      if (photoFile) {
        const uploadResult = await uploadProfilePhoto(photoFile);
        profilePhotoUrl = uploadResult.url;
      }

      const skillsArray = skillsList;
      const serviceAreasArray = serviceAreasList;

      await createWorkerProfile({
        bio: data.bio,
        hourlyRate: data.hourlyRate,
        skills: skillsArray,
        serviceAreas: serviceAreasArray,
        profilePhotoUrl,
        baseLatitude: data.baseLatitude,
        baseLongitude: data.baseLongitude,
        serviceRadius: data.serviceRadius,
      });

      // Refresh profile data so UI reflects changes without a reload.
      const refreshed = await getMyWorkerProfile();
      const refreshedProfile = refreshed.profile || null;
      setProfileData((prev) => ({
        ...refreshedProfile,
        user: prev?.user || authUser || null,
      }));
      if (refreshedProfile) {
        setSkillsList(skillsArray);
        setServiceAreasList(serviceAreasArray);
        setInitialSkillsList(skillsArray);
        setInitialAreasList(serviceAreasArray);
      }

      toast.success('Profile updated successfully.');

      if (refreshedProfile?.user) {
        const updatedUser = { ...authUser, ...refreshedProfile.user };
        // Ensure manual update of profilePhotoUrl if for some reason backend didn't return it instantly
        if (profilePhotoUrl) {
          updatedUser.profilePhotoUrl = profilePhotoUrl;
        }

        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }

      if (profilePhotoUrl) {
        setPhotoPreview(resolveProfilePhotoUrl(profilePhotoUrl));
      } else if (refreshedProfile?.user?.profilePhotoUrl) {
        setPhotoPreview(resolveProfilePhotoUrl(refreshedProfile.user.profilePhotoUrl));
      }
      setIsEditing(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      setServerError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <MainLayout>
      <div className={getPageLayout('default')}>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            Worker Profile
          </h1>
          <p className="text-gray-600 mt-2 dark:text-gray-400">
            Build trust with customers across India and manage your services.
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
                    {profileData?.user?.name || 'Worker'}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={profileData?.isVerified ? 'success' : 'warning'}>
                      {profileData?.isVerified ? 'Verified' : 'Verification Pending'}
                    </Badge>
                    <Badge variant="info">Worker</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                    {profileData?.user?.email || 'Add email'}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <IndianRupee size={16} className="text-success-500" />
                  <span className="text-gray-600 dark:text-gray-300">
                    INR {profileData?.hourlyRate || '--'} / hr
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin size={16} className="text-brand-500" />
                  <span className="text-gray-600 dark:text-gray-300">
                    {serviceAreasList[0] || 'Set service areas in India'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Star size={16} className="text-accent-500" />
                  <span className="text-gray-600 dark:text-gray-300">
                    {profileData?.rating?.toFixed?.(1) || '0.0'} rating · {profileData?.totalReviews || 0} reviews
                  </span>
                </div>
              </div>
            </Card>

            {(() => {
              const hasBio = Boolean(profileData?.bio);
              const hasSkills = skillsList.length > 0;
              const hasAreas = serviceAreasList.length > 0;
              const hasRate = Boolean(profileData?.hourlyRate);
              const hasPhoto = Boolean(photoPreview);
              const completionTotal = 5;
              const completionCount = [hasBio, hasSkills, hasAreas, hasRate, hasPhoto].filter(Boolean).length;
              const completionPercent = Math.round((completionCount / completionTotal) * 100);

              return (
                <Card className="p-6">
                  <CardTitle>Profile Strength</CardTitle>
                  <CardDescription>Boost visibility in Indian search results.</CardDescription>
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
                        <CheckCircle size={16} className={hasBio ? 'text-success-500' : 'text-gray-400'} />
                        <span className="text-gray-600 dark:text-gray-300">Add bio</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className={hasSkills ? 'text-success-500' : 'text-gray-400'} />
                        <span className="text-gray-600 dark:text-gray-300">Add skills</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className={hasAreas ? 'text-success-500' : 'text-gray-400'} />
                        <span className="text-gray-600 dark:text-gray-300">Add service areas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className={hasRate ? 'text-success-500' : 'text-gray-400'} />
                        <span className="text-gray-600 dark:text-gray-300">Set hourly rate</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className={hasPhoto ? 'text-success-500' : 'text-gray-400'} />
                        <span className="text-gray-600 dark:text-gray-300">Add profile photo</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })()}

            <Card className="p-6">
              <CardTitle>Services Snapshot</CardTitle>
              <CardDescription>What customers see first</CardDescription>
              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Skills</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {skillsList.length === 0 && (
                      <Badge variant="default">Add skills</Badge>
                    )}
                    {skillsList.map((skill) => (
                      <Badge key={skill} variant="info">{skill}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Service Areas</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {serviceAreasList.length === 0 && (
                      <Badge variant="default">Add areas</Badge>
                    )}
                    {serviceAreasList.map((area) => (
                      <Badge key={area} variant="default">{area}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              {!isEditing && (
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-dark-700">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => navigate('/worker/services')}
                  >
                    Manage Offered Services
                  </Button>
                </div>
              )}
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {!profileData?.bio ? 'Complete Your Profile' : (isEditing ? 'Edit Profile' : 'Profile Details')}
                  </CardTitle>
                  <CardDescription>
                    {isEditing
                      ? 'Update your profile information and save changes.'
                      : 'Keep your skills and pricing up to date for Indian customers.'}
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
                  <p className="text-xs text-gray-500 dark:text-gray-400">Bio</p>
                  <p className="text-gray-800 dark:text-gray-200">{profileData?.bio || '--'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Skills</p>
                  <p className="text-gray-800 dark:text-gray-200">
                    {skillsList.length ? skillsList.join(', ') : '--'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Service Areas</p>
                  <p className="text-gray-800 dark:text-gray-200">
                    {serviceAreasList.length ? serviceAreasList.join(', ') : '--'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Hourly Rate</p>
                  <p className="text-gray-800 dark:text-gray-200">
                    {profileData?.hourlyRate ? `INR ${profileData.hourlyRate} / hr` : '--'}
                  </p>
                </div>
                {profileData?.baseLatitude && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Service Hub & Coverage</p>
                    <div className="mt-2 rounded-xl overflow-hidden border border-gray-100 dark:border-dark-700">
                      <MiniMap lat={profileData.baseLatitude} lng={profileData.baseLongitude} height="120px" />
                      <div className="p-2 text-[10px] font-bold uppercase tracking-widest text-center bg-gray-50 text-brand-600 dark:bg-dark-900 dark:text-brand-400">
                        {profileData.serviceRadius || 10} km Coverage Radius
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isEditing && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 pb-6">
                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-200">
                        Profile Photo
                      </label>
                      <label
                        className="flex items-center gap-4 rounded-xl border border-dashed p-4 transition-colors cursor-pointer border-gray-200 hover:border-brand-500 bg-gray-50 dark:border-dark-600 dark:bg-dark-800/40"
                      >
                        <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-dark-700 overflow-hidden">
                          {photoPreview ? (
                            <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Image size={24} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-700 dark:text-gray-200">Drop a new photo here</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            JPG or PNG, up to 5MB
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-200">
                        Bio
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Tell customers about your experience"
                        className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 dark:border-dark-600 dark:bg-dark-900 dark:text-gray-100 dark:placeholder:text-gray-500"
                        {...register('bio')}
                      />
                      {errors.bio?.message && (
                        <p className="mt-1 text-sm text-error-500">{errors.bio.message}</p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          Skills
                        </label>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Add up to 10
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {skillsList.length === 0 && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">No skills yet</span>
                        )}
                        {skillsList.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 dark:bg-dark-700 dark:text-gray-200"
                          >
                            {skill}
                            <button type="button" onClick={() => removeSkill(skill)} className="text-gray-400 hover:text-gray-200">
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <input
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ',') {
                              e.preventDefault();
                              addSkill();
                            }
                          }}
                          placeholder="Type a skill and press Enter"
                          className="flex-1 rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 dark:border-dark-600 dark:bg-dark-900 dark:text-gray-100 dark:placeholder:text-gray-500"
                        />
                        <button
                          type="button"
                          onClick={addSkill}
                          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-600"
                        >
                          <Plus size={14} />
                          Add
                        </button>
                      </div>
                      <input type="hidden" {...register('skills')} />
                      {errors.skills?.message && (
                        <p className="mt-1 text-sm text-error-500">{errors.skills.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-200">
                        Service Areas
                      </label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {serviceAreasList.length === 0 && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">No areas yet</span>
                        )}
                        {serviceAreasList.map((area) => (
                          <span
                            key={area}
                            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 dark:bg-dark-700 dark:text-gray-200"
                          >
                            {area}
                            <button type="button" onClick={() => removeArea(area)} className="text-gray-400 hover:text-gray-200">
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <input
                          value={areaInput}
                          onChange={(e) => setAreaInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ',') {
                              e.preventDefault();
                              addArea();
                            }
                          }}
                          placeholder="Add a city or locality"
                          className="flex-1 rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 dark:border-dark-600 dark:bg-dark-900 dark:text-gray-100 dark:placeholder:text-gray-500"
                        />
                        <button
                          type="button"
                          onClick={addArea}
                          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-600"
                        >
                          <Plus size={14} />
                          Add
                        </button>
                      </div>
                      <input type="hidden" {...register('serviceAreas')} />
                      {errors.serviceAreas?.message && (
                        <p className="mt-1 text-sm text-error-500">{errors.serviceAreas.message}</p>
                      )}
                    </div>

                    <div className="pt-4 space-y-5">
                      <div className="border-t border-dashed border-gray-100 dark:border-dark-700 pt-5">
                        <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-200">
                          Service Hub (Base Location)
                        </label>
                        <p className="text-xs mb-3 text-gray-500 dark:text-gray-400">
                          Mark your central location on the map. This helps us find jobs near you.
                        </p>
                        <LocationPicker
                          onLocationSelect={(loc) => {
                            setValue('baseLatitude', loc.lat, { shouldDirty: true });
                            setValue('baseLongitude', loc.lng, { shouldDirty: true });
                          }}
                          initialLocation={
                            profileData?.baseLatitude && profileData?.baseLongitude
                              ? { lat: profileData.baseLatitude, lng: profileData.baseLongitude }
                              : null
                          }
                        />
                      </div>

                      <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-dark-700 dark:bg-dark-800/20">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            Service Radius
                          </label>
                          <span className="text-sm font-bold text-brand-500">
                            {watchedRadius || 10} km
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="100"
                          step="1"
                          {...register('serviceRadius', { valueAsNumber: true })}
                          className="w-full accent-brand-500"
                        />
                        <p className="text-[10px] mt-2 text-gray-400 dark:text-gray-500">
                          Jobs within this distance from your hub will be visible to you.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-2xl border p-4 border-gray-200 bg-gray-50 dark:border-dark-700 dark:bg-dark-900/40">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Hourly Rate</p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        INR {watchedRate || '--'} / hr
                      </p>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="5000"
                      step="50"
                      value={watchedRate || 0}
                      onChange={(e) => setValue('hourlyRate', Number(e.target.value), { shouldDirty: true })}
                      className="w-full accent-brand-500"
                    />
                    <Input
                      label="Hourly Rate (INR/hr)"
                      type="number"
                      placeholder="750"
                      icon={IndianRupee}
                      error={errors.hourlyRate?.message}
                      {...register('hourlyRate')}
                    />
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Tip: Higher rates can signal premium expertise in metro cities.
                    </div>
                  </div>
                </div>

                {serverError && (
                  <p className="text-sm text-error-500">{serverError}</p>
                )}


                <div className="flex flex-col gap-3">
                  {canSave && (
                    <Button
                      type="submit"
                      fullWidth
                      loading={isSubmitting}
                      icon={Save}
                      iconPosition="right"
                    >
                      Save Changes
                    </Button>
                  )}
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
      </div>
    </MainLayout>
  );
}
