import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, FileText, RefreshCw, UploadCloud, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common';
import { Button, Badge, AsyncState, PageHeader, VerificationStatusBadge, Textarea } from '../../components/common';
import { applyForVerification, getMyVerification } from '../../api/verification';
import { uploadVerificationDocument } from '../../api/uploads';
import { getPageLayout } from '../../constants/layout';
import { queryKeys } from '../../utils/queryKeys';

export function WorkerVerificationPage() {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState({ ID_PROOF: null, ADDRESS_PROOF: null, EXPERIENCE_LETTER: null });
  const [previews, setPreviews] = useState({ ID_PROOF: null, ADDRESS_PROOF: null, EXPERIENCE_LETTER: null });
  const [uploadError, setUploadError] = useState('');

  const verificationQuery = useQuery({
    queryKey: queryKeys.verification.my(),
    queryFn: getMyVerification,
  });

  const applyMutation = useMutation({
    mutationFn: (payload) => applyForVerification(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.verification.my() });
      setNotes('');
      setFiles({ ID_PROOF: null, ADDRESS_PROOF: null });
      setPreviews({ ID_PROOF: null, ADDRESS_PROOF: null });
    },
  });

  const application = verificationQuery.data?.application || null;
  const canApply = !application || ['REJECTED', 'MORE_INFO'].includes(application.status);

  const handleFileChange = (type, e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        setUploadError('Only images and PDF files are allowed.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size must be less than 10MB.');
        return;
      }

      setUploadError('');
      setFiles((prev) => ({ ...prev, [type]: file }));

      if (file.type.startsWith('image/')) {
        setPreviews((prev) => ({ ...prev, [type]: URL.createObjectURL(file) }));
      } else {
        setPreviews((prev) => ({ ...prev, [type]: null })); // No preview for PDF
      }
    }
  };

  const removeFile = (type) => {
    setFiles((prev) => ({ ...prev, [type]: null }));
    setPreviews((prev) => ({ ...prev, [type]: null }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setUploadError('');

    if (!files.ID_PROOF || !files.ADDRESS_PROOF) {
      setUploadError('Please upload both ID Proof and Address Proof.');
      return;
    }

    try {
      // Upload files first
      const uploadPromises = Object.entries(files).map(async ([type, file]) => {
        if (!file) return null;
        const res = await uploadVerificationDocument(file);
        return { type, url: res.url };
      });

      const uploadedDocs = (await Promise.all(uploadPromises)).filter(Boolean);

      applyMutation.mutate({
        notes,
        documents: uploadedDocs
      });
    } catch {
      setUploadError('Failed to upload documents. Please try again.');
    }
  };

  return (
    <MainLayout>
      <div className={getPageLayout('narrow')}>
        <PageHeader
          title="Verification"
          subtitle="Submit your verification request to build customer trust."
        />

        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8">
          {/* Status Card */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Status</CardTitle>
              <CardDescription>Track your verification progress.</CardDescription>
            </CardHeader>
            <AsyncState
              isLoading={verificationQuery.isLoading}
              isError={verificationQuery.isError}
              error={verificationQuery.error}
              errorFallback={
                <div className="px-6 pb-6">
                  <p className="text-sm text-error-500">
                    {verificationQuery.error?.response?.data?.error || verificationQuery.error?.message || 'Failed to load verification.'}
                  </p>
                </div>
              }
            >
              <div className="px-6 pb-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${application?.status === 'APPROVED'
                    ? 'bg-success-100 text-success-600'
                    : application?.status === 'REJECTED'
                      ? 'bg-error-100 text-error-600'
                      : 'bg-brand-100 text-brand-600'
                    }`}>
                    {application?.status === 'APPROVED' ? <CheckCircle2 size={24} /> : <ShieldCheck size={24} />}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-100">
                      {application ? 'Application Submitted' : 'Not Submitted'}
                    </p>
                    {application && (
                      <VerificationStatusBadge status={application.status} className="mt-1" />
                    )}
                  </div>
                </div>

                {application?.notes && (
                  <div className="p-3 rounded-lg text-sm bg-gray-50 text-gray-600 dark:bg-dark-800 dark:text-gray-300">
                    <span className="font-semibold block mb-1">Your Note:</span>
                    {application.notes}
                  </div>
                )}

                {application?.rejectionReason && (
                  <div className="p-3 rounded-lg bg-error-50 text-error-700 text-sm border border-error-100">
                    <span className="font-bold block mb-1 flex items-center gap-1"><AlertCircle size={12} /> Admin Feedback:</span>
                    {application.rejectionReason}
                  </div>
                )}

                {application?.submittedAt && (
                  <div className="text-gray-500 text-xs dark:text-gray-400">
                    Submitted on {new Date(application.submittedAt).toLocaleString()}
                  </div>
                )}
              </div>
            </AsyncState>
          </Card>

          {/* Submission Form */}
          <Card>
            <CardHeader>
              <CardTitle>Submit Documents</CardTitle>
              <CardDescription>Upload secure documents for identity verification.</CardDescription>
            </CardHeader>

            {!canApply ? (
              <div className="p-8 text-center">
                {application?.status === 'APPROVED' ? (
                  <>
                    <div className="w-16 h-16 bg-success-50 text-success-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Identity Verified</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Congratulations! Your profile has been verified. You can now accept bookings and offer services.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-brand-50 text-brand-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ClockIcon />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Application Under Review</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Your verification request is currently being reviewed by our team. We will notify you once a decision is made.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 px-6 pb-6">
                {/* ID Proof Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                    ID Proof (Aadhaar / PAN) <span className="text-error-500">*</span>
                  </label>
                  {!files.ID_PROOF ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors border-gray-200 bg-gray-50/50 dark:border-dark-600 dark:bg-dark-800/50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-400">PDF, PNG, JPG up to 10MB</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileChange('ID_PROOF', e)}
                      />
                    </label>
                  ) : (
                    <div className="relative flex items-center p-3 rounded-xl border border-gray-200 bg-white dark:border-dark-600 dark:bg-dark-800">
                      {previews.ID_PROOF ? (
                        <img src={previews.ID_PROOF} alt="Preview" className="w-12 h-12 rounded object-cover mr-3 bg-gray-200" />
                      ) : (
                        <div className="w-12 h-12 rounded bg-red-100 flex items-center justify-center mr-3 text-red-600 font-bold text-xs">PDF</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-gray-800 dark:text-gray-200">
                          {files.ID_PROOF.name}
                        </p>
                        <p className="text-xs text-gray-400">{(files.ID_PROOF.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile('ID_PROOF')}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full transition-colors"
                      >
                        <X size={18} className="text-gray-400" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Address Proof Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                    Address Proof (Utility Bill / Rent Agreement) <span className="text-error-500">*</span>
                  </label>
                  {!files.ADDRESS_PROOF ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors border-gray-200 bg-gray-50/50 dark:border-dark-600 dark:bg-dark-800/50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-400">PDF, PNG, JPG up to 10MB</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileChange('ADDRESS_PROOF', e)}
                      />
                    </label>
                  ) : (
                    <div className="relative flex items-center p-3 rounded-xl border border-gray-200 bg-white dark:border-dark-600 dark:bg-dark-800">
                      {previews.ADDRESS_PROOF ? (
                        <img src={previews.ADDRESS_PROOF} alt="Preview" className="w-12 h-12 rounded object-cover mr-3 bg-gray-200" />
                      ) : (
                        <div className="w-12 h-12 rounded bg-red-100 flex items-center justify-center mr-3 text-red-600 font-bold text-xs">PDF</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-gray-800 dark:text-gray-200">
                          {files.ADDRESS_PROOF.name}
                        </p>
                        <p className="text-xs text-gray-400">{(files.ADDRESS_PROOF.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile('ADDRESS_PROOF')}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full transition-colors"
                      >
                        <X size={18} className="text-gray-400" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Experience / Certification Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                    Photos of Past Work / Experience Proof (Recommended)
                  </label>
                  {!files.EXPERIENCE_LETTER ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors border-gray-200 bg-gray-50/50 dark:border-dark-600 dark:bg-dark-800/50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span> photos of work
                        </p>
                        <p className="text-xs text-gray-400">Images of past jobs, or certificates</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileChange('EXPERIENCE_LETTER', e)}
                      />
                    </label>
                  ) : (
                    <div className="relative flex items-center p-3 rounded-xl border border-gray-200 bg-white dark:border-dark-600 dark:bg-dark-800">
                      {previews.EXPERIENCE_LETTER ? (
                        <img src={previews.EXPERIENCE_LETTER} alt="Preview" className="w-12 h-12 rounded object-cover mr-3 bg-gray-200" />
                      ) : (
                        <div className="w-12 h-12 rounded bg-red-100 flex items-center justify-center mr-3 text-red-600 font-bold text-xs">PDF</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-gray-800 dark:text-gray-200">
                          {files.EXPERIENCE_LETTER.name}
                        </p>
                        <p className="text-xs text-gray-400">{(files.EXPERIENCE_LETTER.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile('EXPERIENCE_LETTER')}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full transition-colors"
                      >
                        <X size={18} className="text-gray-400" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <Textarea
                  label="Experience Details & References (Recommended)"
                  rows={3}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Describe your work experience, years in the field, or provide contact references of previous clients..."
                />

                {uploadError && (
                  <p className="text-sm text-error-500 flex items-center gap-1">
                    <AlertCircle size={14} /> {uploadError}
                  </p>
                )}

                {applyMutation.isError && (
                  <p className="text-sm text-error-500">
                    {applyMutation.error?.response?.data?.error || applyMutation.error?.message || 'Failed to submit verification.'}
                  </p>
                )}

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  icon={FileText}
                  loading={applyMutation.isPending}
                >
                  Submit Application
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);
