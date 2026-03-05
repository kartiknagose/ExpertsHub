// Standard async state wrapper for loading, error, and empty states

import { Card } from '../ui/Card';
import { Spinner } from '../ui/Spinner';
import { Button } from '../ui/Button';
import { EmptyState } from './EmptyState';

export function AsyncState({
  isLoading,
  isError,
  error,
  onRetry,
  isEmpty,
  emptyTitle = 'No data yet',
  emptyMessage = 'There is nothing to show right now.',
  emptyAction,
  errorMessage,
  loadingFallback,
  errorFallback,
  emptyFallback,
  children,
}) {
  if (isLoading) {
    return loadingFallback || (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    if (errorFallback) {
      return errorFallback;
    }

    const message =
      errorMessage ||
      error?.response?.data?.error ||
      error?.message ||
      'Failed to load data.';

    return (
      <Card className="p-6">
        <p className="text-error-500 mb-3">{message}</p>
        {onRetry && (
          <Button size="sm" onClick={onRetry}>
            Retry
          </Button>
        )}
      </Card>
    );
  }

  if (isEmpty) {
    return emptyFallback || (
      <EmptyState
        title={emptyTitle}
        message={emptyMessage}
        action={emptyAction}
      />
    );
  }

  if (!children) {
    return (
      <p className="text-gray-600 dark:text-gray-300">
        No content available.
      </p>
    );
  }

  return <>{children}</>;
}
