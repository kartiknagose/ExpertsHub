import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';

/**
 * useNotification Hook
 * Use this in any component to show notifications
 * 
 * Usage:
 * const { showError, showSuccess } = useNotification();
 * showError('Something went wrong!');
 * showSuccess('Booking created!');
 */
export function useNotification() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      'useNotification must be used within <NotificationProvider>. ' +
      'Make sure your app is wrapped with NotificationProvider in main.jsx'
    );
  }

  return context;
}
