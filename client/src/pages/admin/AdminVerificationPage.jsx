// Admin verification management page
// Review worker verification applications

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, XCircle, AlertTriangle } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common';
import { Badge, Button, Spinner } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';
import { getVerificationApplications, reviewVerificationApplication } from '../../api/verification';

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

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        )}

        {isError && (
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
        )}

        {!isLoading && !isError && applications.length === 0 && (
          <Card className="p-6">
            <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              No verification requests available.
            </p>
          </Card>
        )}

        {!isLoading && !isError && applications.length > 0 && (
          <div className="grid grid-cols-1 gap-5">
            {applications.map((application) => (
              <Card key={application.id}>
                <CardHeader>
                  <CardTitle>
                    {application.user?.name || 'Worker'}
                  </CardTitle>
                  <CardDescription>
                    Submitted: {new Date(application.submittedAt).toLocaleString()}
                  </CardDescription>
                </CardHeader>

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={statusVariant(application.status)}>
                      {application.status}
                    </Badge>
                    {application.score !== null && application.score !== undefined && (
                      <Badge variant="info">Score: {application.score}</Badge>
                    )}
                  </div>

                  <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                    Email: {application.user?.email || 'N/A'}
                  </div>
                  <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                    Mobile: {application.user?.mobile || 'N/A'}
                  </div>

                  <div>
                    <label className={isDark ? 'block text-sm font-medium text-gray-200 mb-2' : 'block text-sm font-medium text-gray-700 mb-2'}>
                      Admin Notes (optional)
                    </label>
                    <input
                      value={notes[application.id] || ''}
                      onChange={(event) => setNotes((prev) => ({ ...prev, [application.id]: event.target.value }))}
                      placeholder="Reason or notes"
                      className={`w-full px-4 py-2.5 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 ${
                        isDark
                          ? 'bg-dark-800 border-dark-600 text-gray-100 placeholder-gray-500 focus:border-brand-500 focus:ring-brand-500/50'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-brand-600 focus:ring-brand-600/50'
                      }`}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      icon={ShieldCheck}
                      loading={reviewMutation.isPending}
                      onClick={() => handleReview(application.id, 'APPROVED')}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      icon={AlertTriangle}
                      loading={reviewMutation.isPending}
                      onClick={() => handleReview(application.id, 'MORE_INFO')}
                    >
                      Request More Info
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      icon={XCircle}
                      loading={reviewMutation.isPending}
                      onClick={() => handleReview(application.id, 'REJECTED')}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
