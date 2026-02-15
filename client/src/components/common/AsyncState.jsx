// Standard async state wrapper for loading, error, and empty states

import { useTheme } from '../../context/ThemeContext';
import { Card } from './Card';
import { Spinner } from './Spinner';
import { Button } from './Button';
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
  const { isDark } = useTheme();

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
      <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
        No content available.
      </p>
    );
  }

  return <>{children}</>;
}
