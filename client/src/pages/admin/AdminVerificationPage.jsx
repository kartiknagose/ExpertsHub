// Admin verification management page
// Review worker verification applications

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, XCircle, AlertTriangle, FileText, ExternalLink } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common';
import { Badge, Button, AsyncState } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';
import { getVerificationApplications, reviewVerificationApplication } from '../../api/verification';
import { getVerificationStatusVariant } from '../../utils/statusHelpers';
import { resolveProfilePhotoUrl } from '../../utils/profilePhoto';

export function AdminVerificationPage() {
  const { isDark } = useTheme();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState({});

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['verification-applications'],
    queryFn: getVerificationApplications,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, payload }) => reviewVerificationApplication(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification-applications'] });
    },
  });

  const applications = data?.applications || [];

  const handleReview = (id, status) => {
    reviewMutation.mutate({
      id,
      payload: {
        status,
        notes: notes[id] || undefined,
      },
    });
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className={`text-4xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            Verification Requests
          </h1>
          <p className={isDark ? 'text-gray-400 mt-2' : 'text-gray-600 mt-2'}>
            Review worker verification applications and update status.
          </p>
        </div>

        <AsyncState
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={refetch}
          isEmpty={!isLoading && !isError && applications.length === 0}
          emptyTitle="No verification requests"
          emptyMessage="Worker applications will appear here once submitted."
          errorFallback={
            <Card className="p-6">
              <p className="text-error-500 mb-3">
                {error?.response?.data?.error || error?.message || 'Failed to load verification requests.'}
              </p>
              <button
                type="button"
                className="text-sm text-brand-500"
                onClick={() => refetch()}
              >
                Retry
              </button>
            </Card>
          }
        >
          <div className="grid grid-cols-1 gap-6">
            {applications.map((application) => (
              <Card key={application.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>
                        {application.user?.name || 'Worker'}
                      </CardTitle>
                      <CardDescription>
                        Submitted: {new Date(application.submittedAt).toLocaleString()}
                      </CardDescription>
                    </div>
                    <Badge variant={getVerificationStatusVariant(application.status)}>
                      {application.status}
                    </Badge>
                  </div>
                </CardHeader>

                <div className="px-6 pb-6 space-y-6">
                  {/* User Details */}
                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <div>
                      <span className="font-semibold block text-xs uppercase tracking-wider mb-1 opacity-70">Contact Info</span>
                      <p>Email: {application.user?.email || 'N/A'}</p>
                      <p>Mobile: {application.user?.mobile || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-semibold block text-xs uppercase tracking-wider mb-1 opacity-70">Application Details</span>
                      <p>Score: {application.score ?? 'N/A'}</p>
                      <p>App ID: #{application.id}</p>
                    </div>
                  </div>

                  {/* Documents Section */}
                  {application.documents && application.documents.length > 0 && (
                    <div>
                      <h4 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Submitted Documents</h4>
                      <div className="flex flex-wrap gap-4">
                        {application.documents.map((doc) => {
                          const docUrl = resolveProfilePhotoUrl(doc.url);
                          const isPdf = doc.url.toLowerCase().endsWith('.pdf');
                          return (
                            <div key={doc.id} className="group relative">
                              <a
                                href={docUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`block w-32 h-32 rounded-lg border overflow-hidden relative ${isDark ? 'border-dark-600 bg-dark-800' : 'border-gray-200 bg-gray-50'}`}
                                onClick={(e) => {
                                  if (!docUrl) e.preventDefault();
                                }}
                              >
                                {isPdf ? (
                                  <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
                                    <FileText size={32} />
                                    <span className="text-xs font-bold mt-2">PDF</span>
                                  </div>
                                ) : (
                                  <img
                                    src={docUrl}
                                    alt={doc.type}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                  <ExternalLink size={20} className="text-white drop-shadow-md" />
                                </div>
                              </a>
                              <p className={`text-xs mt-1.5 font-medium truncate w-32 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {doc.type.replace('_', ' ')}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Worker Notes */}
                  {application.notes && (
                    <div className={`p-4 rounded-lg text-sm ${isDark ? 'bg-dark-800 text-gray-300' : 'bg-gray-50 text-gray-600'}`}>
                      <span className="font-semibold block mb-1 text-xs uppercase opacity-70">Worker Note</span>
                      {application.notes}
                    </div>
                  )}

                  {/* Admin Action Area */}
                  {application.status !== 'APPROVED' && application.status !== 'REJECTED' && (
                    <div className={`pt-4 border-t ${isDark ? 'border-dark-700' : 'border-gray-100'}`}>
                      <label className={isDark ? 'block text-sm font-medium text-gray-200 mb-2' : 'block text-sm font-medium text-gray-700 mb-2'}>
                        Review Notes / Rejection Reason
                      </label>
                      <div className="flex gap-4 items-start">
                        <input
                          value={notes[application.id] || ''}
                          onChange={(event) => setNotes((prev) => ({ ...prev, [application.id]: event.target.value }))}
                          placeholder="Enter feedback..."
                          className={`flex-1 px-4 py-2.5 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 ${isDark
                            ? 'bg-dark-800 border-dark-600 text-gray-100 placeholder-gray-500 focus:border-brand-500 focus:ring-brand-500/50'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-brand-600 focus:ring-brand-600/50'
                            }`}
                        />
                      </div>
                      <div className="flex flex-wrap gap-3 mt-4">
                        <Button
                          size="sm"
                          icon={ShieldCheck}
                          loading={reviewMutation.isPending && reviewMutation.variables?.id === application.id && reviewMutation.variables?.payload.status === 'APPROVED'}
                          onClick={() => handleReview(application.id, 'APPROVED')}
                          disabled={reviewMutation.isPending}
                          className="bg-success-600 hover:bg-success-700 text-white"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          icon={AlertTriangle}
                          loading={reviewMutation.isPending && reviewMutation.variables?.id === application.id && reviewMutation.variables?.payload.status === 'MORE_INFO'}
                          onClick={() => handleReview(application.id, 'MORE_INFO')}
                          disabled={reviewMutation.isPending}
                        >
                          Request More Info
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          icon={XCircle}
                          loading={reviewMutation.isPending && reviewMutation.variables?.id === application.id && reviewMutation.variables?.payload.status === 'REJECTED'}
                          onClick={() => handleReview(application.id, 'REJECTED')}
                          disabled={reviewMutation.isPending}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </AsyncState>
      </div>
    </MainLayout>
  );
}
