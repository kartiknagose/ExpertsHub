import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, FileText, RefreshCw } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common';
import { Button, Spinner, Badge } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';
import { applyForVerification, getMyVerification } from '../../api/verification';

const statusVariant = (status) => {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'REJECTED':
      return 'error';
    case 'MORE_INFO':
      return 'warning';
    default:
      return 'info';
  }
};

export function WorkerVerificationPage() {
  const { isDark } = useTheme();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState('');

  const verificationQuery = useQuery({
    queryKey: ['verification'],
    queryFn: getMyVerification,
  });

  const applyMutation = useMutation({
    mutationFn: (payload) => applyForVerification(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification'] });
      setNotes('');
    },
  });

  const application = verificationQuery.data?.application || null;
  const canApply = !application || ['REJECTED', 'MORE_INFO'].includes(application.status);

  const handleSubmit = (event) => {
    event.preventDefault();
    applyMutation.mutate({ notes });
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className={`text-4xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            Verification
          </h1>
          <p className={isDark ? 'text-gray-400 mt-2' : 'text-gray-600 mt-2'}>
            Submit your verification request to build customer trust.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
              <CardDescription>Track your verification progress.</CardDescription>
            </CardHeader>

            {verificationQuery.isLoading && (
              <div className="flex items-center justify-center py-16">
                <Spinner size="lg" />
              </div>
            )}

            {verificationQuery.isError && (
              <div className="px-6 pb-6">
                <p className="text-sm text-error-500">
                  {verificationQuery.error?.response?.data?.error || verificationQuery.error?.message || 'Failed to load verification.'}
                </p>
              </div>
            )}

            {!verificationQuery.isLoading && !verificationQuery.isError && (
              <div className="px-6 pb-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                    <ShieldCheck size={20} className="text-white" />
                  </div>
                  <div>
                    <p className={isDark ? 'text-gray-200 font-semibold' : 'text-gray-800 font-semibold'}>
                      {application ? 'Verification Submitted' : 'Not Submitted'}
                    </p>
                    {application && (
                      <Badge variant={statusVariant(application.status)}>
                        {application.status}
                      </Badge>
                    )}
                  </div>
                </div>

                {application?.notes && (
                  <div className={isDark ? 'text-gray-300 text-sm' : 'text-gray-600 text-sm'}>
                    Notes: {application.notes}
                  </div>
                )}

                {application?.submittedAt && (
                  <div className={isDark ? 'text-gray-400 text-xs' : 'text-gray-500 text-xs'}>
                    Submitted on {new Date(application.submittedAt).toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Submit Verification</CardTitle>
              <CardDescription>Share details that help us verify your profile.</CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6">
              <div>
                <label className={isDark ? 'block text-sm font-medium text-gray-200 mb-2' : 'block text-sm font-medium text-gray-700 mb-2'}>
                  Notes (optional)
                </label>
                <textarea
                  rows={5}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Share certifications, experience, or any details to help verification."
                  className={`w-full px-4 py-2.5 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 ${
                    isDark
                      ? 'bg-dark-800 border-dark-600 text-gray-100 placeholder-gray-500 focus:border-brand-500 focus:ring-brand-500/50'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-brand-600 focus:ring-brand-600/50'
                  }`}
                />
              </div>

              {applyMutation.isError && (
                <p className="text-sm text-error-500">
                  {applyMutation.error?.response?.data?.error || applyMutation.error?.message || 'Failed to submit verification.'}
                </p>
              )}

              <Button
                type="submit"
                fullWidth
                icon={canApply ? FileText : RefreshCw}
                loading={applyMutation.isPending}
                disabled={!canApply}
              >
                {canApply ? 'Submit Verification' : 'Already Submitted'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
