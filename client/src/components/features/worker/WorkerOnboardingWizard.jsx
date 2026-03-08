// Multi-step worker KYC onboarding wizard
// Steps: 1. Personal Info → 2. Aadhaar Upload → 3. PAN Upload → 4. Selfie → 5. Address Proof → 6. Preview & Submit

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  User, CreditCard, Camera, FileText, MapPin, CheckCircle2,
  UploadCloud, X, ChevronRight, ChevronLeft, AlertCircle, Loader2, ShieldCheck
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardDescription } from '../../common';
import { uploadVerificationDocument } from '../../../api/uploads';
import { applyForVerification } from '../../../api/verification';
import { toast } from 'sonner';
import { queryKeys } from '../../../utils/queryKeys';

const STEPS = [
  { id: 1, title: 'Personal Info', description: 'Tell us about yourself', icon: User },
  { id: 2, title: 'Aadhaar Card', description: 'Upload your Aadhaar card', icon: CreditCard },
  { id: 3, title: 'PAN Card', description: 'Upload your PAN card', icon: CreditCard },
  { id: 4, title: 'Selfie', description: 'Take a clear selfie photo', icon: Camera },
  { id: 5, title: 'Address Proof', description: 'Utility bill or rent agreement', icon: MapPin },
  { id: 6, title: 'Review & Submit', description: 'Preview and submit your application', icon: CheckCircle2 },
];

const ACCEPTED_DOC_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'];
const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function ProgressBar({ currentStep, totalSteps }) {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="mb-8">
      {/* Step indicators */}
      <div className="flex items-center justify-between mb-3">
        {STEPS.map((step, idx) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const StepIcon = step.icon;

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-initial">
              <div className="flex flex-col items-center relative">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${isCompleted
                    ? 'bg-success-500 text-white shadow-lg shadow-success-500/25'
                    : isCurrent
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30 ring-4 ring-brand-100 dark:ring-brand-900'
                      : 'bg-gray-100 text-gray-400 dark:bg-dark-700 dark:text-gray-500'
                    }`}
                >
                  {isCompleted ? <CheckCircle2 size={18} /> : <StepIcon size={16} />}
                </div>
                <span className={`text-[10px] mt-1.5 font-medium text-center whitespace-nowrap hidden sm:block ${isCurrent ? 'text-brand-600 dark:text-brand-400' : isCompleted ? 'text-success-600' : 'text-gray-400'
                  }`}>
                  {step.title}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mt-[-14px] sm:mt-0 transition-colors duration-300 ${currentStep > step.id ? 'bg-success-500' : 'bg-gray-200 dark:bg-dark-600'
                  }`} />
              )}
            </div>
          );
        })}
      </div>
      {/* Overall progress bar */}
      <div className="w-full bg-gray-100 dark:bg-dark-700 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-brand-500 to-brand-600 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function FileUploadZone({ acceptTypes, file, preview, error, onFileChange, onRemove, helpText }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) onFileChange(droppedFile);
  };

  const handleInputChange = (e) => {
    const selected = e.target.files[0];
    if (selected) onFileChange(selected);
  };

  if (file) {
    return (
      <div className="relative rounded-xl border-2 border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-950/20 p-4">
        <div className="flex items-center gap-4">
          {preview ? (
            <img src={preview} alt="Preview" className="w-20 h-20 rounded-lg object-cover border border-gray-200 dark:border-dark-600 shadow-sm" />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-red-50 dark:bg-red-900/20 flex flex-col items-center justify-center border border-red-200 dark:border-red-800">
              <FileText size={24} className="text-red-500" />
              <span className="text-[10px] font-bold text-red-500 mt-1">PDF</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-gray-800 dark:text-gray-200">{file.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <div className="flex items-center gap-1 mt-1">
              <CheckCircle2 size={12} className="text-success-500" />
              <span className="text-xs text-success-600 font-medium">File ready</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full transition-colors"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>
        {error && (
          <p className="text-sm text-error-500 flex items-center gap-1 mt-3">
            <AlertCircle size={14} /> {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <label
        className={`flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${isDragging
          ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/20 scale-[1.01]'
          : 'border-gray-200 bg-gray-50/50 dark:border-dark-600 dark:bg-dark-800/50 hover:border-brand-400 hover:bg-gray-50 dark:hover:bg-dark-800'
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center py-6">
          <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center mb-3">
            <UploadCloud className="w-6 h-6 text-brand-500" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-brand-600 dark:text-brand-400">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-400 mt-1">{helpText || 'PNG, JPG, WebP, or PDF up to 10MB'}</p>
        </div>
        <input
          type="file"
          className="hidden"
          accept={acceptTypes.join(',')}
          onChange={handleInputChange}
        />
      </label>
      {error && (
        <p className="text-sm text-error-500 flex items-center gap-1 mt-2">
          <AlertCircle size={14} /> {error}
        </p>
      )}
    </div>
  );
}

export function WorkerOnboardingWizard({ onComplete }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Personal Info
  const [personalInfo, setPersonalInfo] = useState({
    experience: '',
    notes: '',
  });

  // Steps 2-5: File uploads
  const [files, setFiles] = useState({
    aadhaar: null,
    pan: null,
    selfie: null,
    addressProof: null,
  });
  const [previews, setPreviews] = useState({
    aadhaar: null,
    pan: null,
    selfie: null,
    addressProof: null,
  });
  const [fileErrors, setFileErrors] = useState({
    aadhaar: '',
    pan: '',
    selfie: '',
    addressProof: '',
  });

  const handleFileSelect = useCallback((key, acceptedTypes) => (file) => {
    // Validate type
    if (!acceptedTypes.includes(file.type)) {
      setFileErrors(prev => ({ ...prev, [key]: 'Invalid file type. Please use PNG, JPG, or PDF.' }));
      return;
    }
    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      setFileErrors(prev => ({ ...prev, [key]: 'File is too large. Maximum 10MB allowed.' }));
      return;
    }
    setFileErrors(prev => ({ ...prev, [key]: '' }));
    setFiles(prev => ({ ...prev, [key]: file }));

    if (file.type.startsWith('image/')) {
      setPreviews(prev => ({ ...prev, [key]: URL.createObjectURL(file) }));
    } else {
      setPreviews(prev => ({ ...prev, [key]: null }));
    }
  }, []);

  const removeFile = useCallback((key) => {
    setFiles(prev => ({ ...prev, [key]: null }));
    setPreviews(prev => ({ ...prev, [key]: null }));
    setFileErrors(prev => ({ ...prev, [key]: '' }));
  }, []);

  // Navigation
  const canGoNext = () => {
    switch (step) {
      case 1: return true; // Personal info is optional notes
      case 2: return !!files.aadhaar;
      case 3: return !!files.pan;
      case 4: return !!files.selfie;
      case 5: return !!files.addressProof;
      case 6: return true;
      default: return false;
    }
  };

  const goNext = () => {
    if (step < 6 && canGoNext()) setStep(step + 1);
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // Submit the entire application
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // 1. Upload all files
      const uploadPromises = [];
      const docMapping = {
        aadhaar: 'ID_PROOF',
        pan: 'CERTIFICATION',
        selfie: 'PORTFOLIO',
        addressProof: 'ADDRESS_PROOF',
      };

      for (const [key, file] of Object.entries(files)) {
        if (file) {
          uploadPromises.push(
            uploadVerificationDocument(file).then(res => ({
              type: docMapping[key],
              url: res.url,
            }))
          );
        }
      }

      const uploadedDocs = await Promise.all(uploadPromises);

      // 2. Submit verification application
      await applyForVerification({
        notes: [personalInfo.experience, personalInfo.notes].filter(Boolean).join('\n\n'),
        documents: uploadedDocs,
      });

      queryClient.invalidateQueries({ queryKey: queryKeys.verification.my() });
      toast.success('Verification application submitted successfully! We\'ll review it shortly.');

      if (onComplete) onComplete();
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to submit application';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <ProgressBar currentStep={step} totalSteps={6} />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
              {(() => {
                const StepIcon = STEPS[step - 1].icon;
                return <StepIcon size={20} className="text-brand-600 dark:text-brand-400" />;
              })()}
            </div>
            <div>
              <CardTitle>{STEPS[step - 1].title}</CardTitle>
              <CardDescription>{STEPS[step - 1].description}</CardDescription>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Step {step} of {STEPS.length}</p>
        </CardHeader>

        <div className="px-6 pb-6">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                  Work Experience & Skills
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all bg-gray-50 dark:bg-dark-900 border-gray-200 dark:border-dark-600 text-gray-900 dark:text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  rows={4}
                  value={personalInfo.experience}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, experience: e.target.value }))}
                  placeholder="Describe your work experience, years in the field, any specializations..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                  Additional Notes (Optional)
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all bg-gray-50 dark:bg-dark-900 border-gray-200 dark:border-dark-600 text-gray-900 dark:text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  rows={3}
                  value={personalInfo.notes}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any references, certifications, or additional info to support your application..."
                />
              </div>
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Tip:</strong> Providing detailed work experience and references increases your chances of faster approval.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Aadhaar Upload */}
          {step === 2 && (
            <div className="space-y-4">
              <FileUploadZone
                label="Aadhaar Card"
                acceptTypes={ACCEPTED_DOC_TYPES}
                file={files.aadhaar}
                preview={previews.aadhaar}
                error={fileErrors.aadhaar}
                onFileChange={handleFileSelect('aadhaar', ACCEPTED_DOC_TYPES)}
                onRemove={() => removeFile('aadhaar')}
                helpText="Upload front/back of your Aadhaar card (PNG, JPG, PDF up to 10MB)"
              />
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  <strong>Important:</strong> Ensure your Aadhaar card details are clearly visible. Blurry images will be rejected.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: PAN Upload */}
          {step === 3 && (
            <div className="space-y-4">
              <FileUploadZone
                label="PAN Card"
                acceptTypes={ACCEPTED_DOC_TYPES}
                file={files.pan}
                preview={previews.pan}
                error={fileErrors.pan}
                onFileChange={handleFileSelect('pan', ACCEPTED_DOC_TYPES)}
                onRemove={() => removeFile('pan')}
                helpText="Upload your PAN card (PNG, JPG, PDF up to 10MB)"
              />
            </div>
          )}

          {/* Step 4: Selfie */}
          {step === 4 && (
            <div className="space-y-4">
              <FileUploadZone
                label="Live Selfie"
                acceptTypes={ACCEPTED_IMAGE_TYPES}
                file={files.selfie}
                preview={previews.selfie}
                error={fileErrors.selfie}
                onFileChange={handleFileSelect('selfie', ACCEPTED_IMAGE_TYPES)}
                onRemove={() => removeFile('selfie')}
                helpText="Take a clear, well-lit selfie photo (PNG, JPG only)"
              />
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Tips:</strong> Face the camera directly, ensure good lighting, remove hats/sunglasses.
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Address Proof */}
          {step === 5 && (
            <div className="space-y-4">
              <FileUploadZone
                label="Address Proof"
                acceptTypes={ACCEPTED_DOC_TYPES}
                file={files.addressProof}
                preview={previews.addressProof}
                error={fileErrors.addressProof}
                onFileChange={handleFileSelect('addressProof', ACCEPTED_DOC_TYPES)}
                onRemove={() => removeFile('addressProof')}
                helpText="Utility bill, rent agreement, or bank statement (PNG, JPG, PDF up to 10MB)"
              />
            </div>
          )}

          {/* Step 6: Review & Submit */}
          {step === 6 && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-success-50 dark:bg-success-900/10 border border-success-100 dark:border-success-800/30">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck size={18} className="text-success-600" />
                  <span className="font-semibold text-success-700 dark:text-success-400">All documents ready!</span>
                </div>
                <p className="text-sm text-success-600 dark:text-success-400">
                  Review your uploaded documents below before submitting.
                </p>
              </div>

              {/* Document Summary Grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'aadhaar', label: 'Aadhaar Card' },
                  { key: 'pan', label: 'PAN Card' },
                  { key: 'selfie', label: 'Selfie Photo' },
                  { key: 'addressProof', label: 'Address Proof' },
                ].map(({ key, label }) => (
                  <div key={key} className="border rounded-xl p-3 border-gray-200 dark:border-dark-600">
                    {files[key] ? (
                      <div className="flex items-center gap-3">
                        {previews[key] ? (
                          <img src={previews[key]} alt={label} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                            <FileText size={18} className="text-red-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{label}</p>
                          <p className="text-[10px] text-gray-400 truncate">{files[key].name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <CheckCircle2 size={10} className="text-success-500" />
                            <span className="text-[10px] text-success-600 font-medium">Uploaded</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-dark-700 flex items-center justify-center">
                          <X size={18} className="text-gray-300" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500">{label}</p>
                          <p className="text-[10px] text-gray-400">Not uploaded</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Experience Notes Preview */}
              {(personalInfo.experience || personalInfo.notes) && (
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-dark-800 border border-gray-100 dark:border-dark-700">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Your Notes</p>
                  {personalInfo.experience && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">{personalInfo.experience}</p>
                  )}
                  {personalInfo.notes && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{personalInfo.notes}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="px-6 pb-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goBack}
            disabled={step === 1}
            icon={ChevronLeft}
          >
            Back
          </Button>

          {step < 6 ? (
            <Button
              onClick={goNext}
              disabled={!canGoNext()}
              icon={ChevronRight}
              iconPosition="right"
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              loading={submitting}
              disabled={!files.aadhaar || !files.addressProof}
              icon={ShieldCheck}
              className="bg-success-600 hover:bg-success-700"
            >
              Submit Application
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
