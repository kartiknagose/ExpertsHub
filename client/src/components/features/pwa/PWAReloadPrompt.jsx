import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { toast } from 'sonner';

/**
 * PWAReloadPrompt
 *
 * Handles service worker lifecycle events:
 * 1. Shows a toast when app is ready for offline use (first install)
 * 2. Shows a persistent toast with "Update Now" button when a new SW version is available
 * 3. Periodically checks for updates (every hour)
 */
export function PWAReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      if (registration) {
        // Check for SW updates every hour
        setInterval(() => registration.update(), 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('Service worker registration error:', error);
    },
  });

  useEffect(() => {
    if (offlineReady) {
      toast.success('UrbanPro is ready to work offline!', {
        id: 'pwa-offline-ready',
        duration: 5000,
      });
      setOfflineReady(false);
    }
  }, [offlineReady, setOfflineReady]);

  useEffect(() => {
    if (needRefresh) {
      toast('A new version of UrbanPro is available', {
        id: 'pwa-update-available',
        duration: Infinity,
        action: {
          label: 'Update Now',
          onClick: () => updateServiceWorker(true),
        },
        onDismiss: () => setNeedRefresh(false),
      });
    }
  }, [needRefresh, setNeedRefresh, updateServiceWorker]);

  return null;
}
