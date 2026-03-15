// Standard async state wrapper for loading, error, and empty states

import { Card } from '../ui/Card';
import { Spinner } from '../ui/Spinner';
import { Button } from '../ui/Button';
import { EmptyState } from './EmptyState';
import { useTranslation } from 'react-i18next';

export function AsyncState({
  isLoading,
  isError,
  error,
  onRetry,
  isEmpty,
  emptyTitle,
  emptyMessage,
  emptyAction,
  errorMessage,
  loadingFallback,
  errorFallback,
  emptyFallback,
  children,
}) {
  const { t } = useTranslation();
  
  const finalEmptyTitle = emptyTitle || t('No data yet');
  const finalEmptyMessage = emptyMessage || t('There is nothing to show right now.');
  const finalErrorMessage = errorMessage || error?.response?.data?.error || error?.message || t('Failed to load data.');
  if (isLoading) {
    return loadingFallback || (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    if (errorFallback) return errorFallback;

    return (
      <Card className="p-12 text-center border-dashed border-2 border-error-100 dark:border-error-500/10">
        <p className="text-error-500 mb-6 font-bold">{finalErrorMessage}</p>
        {onRetry && (
          <Button size="sm" variant="gradient" onClick={onRetry} className="mx-auto h-10 px-6">
            {t('Retry')}
          </Button>
        )}
      </Card>
    );
  }

  if (isEmpty) {
    return emptyFallback || (
      <EmptyState
        title={finalEmptyTitle}
        message={finalEmptyMessage}
        action={emptyAction}
      />
    );
  }

  if (!children) {
    return (
      <p className="text-gray-600 dark:text-gray-300 text-center py-10 font-medium">
        {t('No content available.')}
      </p>
    );
  }

  return <>{children}</>;
}
