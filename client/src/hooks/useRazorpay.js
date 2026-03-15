import { useEffect } from 'react';
import { ensureRazorpayLoaded } from '../utils/razorpay';

export function useRazorpay({ preload = true, onError } = {}) {
  useEffect(() => {
    if (!preload) return;

    ensureRazorpayLoaded().catch((error) => {
      if (typeof onError === 'function') {
        onError(error);
      }
    });
  }, [preload, onError]);
}
