import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ClerkProvider } from '@clerk/clerk-react';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ClerkBridge } from './components/auth/ClerkBridge';
import App from './App.jsx';
import GlobalErrorBoundary from './components/common/GlobalErrorBoundary.jsx';
import { initClientMonitoring } from './config/sentry';
import './index.css';
import './config/i18n';
import { installToastDeduper } from './utils/toastDeduper';

initClientMonitoring();
installToastDeduper();

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

/**
 * React Query Client Setup
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const AppTree = (
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <AuthProvider>
          {/* ClerkBridge syncs Clerk session → AuthContext (only rendered when Clerk is active) */}
          {CLERK_PUBLISHABLE_KEY && <ClerkBridge />}
          <GlobalErrorBoundary>
            <App />
          </GlobalErrorBoundary>
          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={4000}
            toastOptions={{ style: { fontFamily: 'inherit' } }}
          />
        </AuthProvider>
      </NotificationProvider>
    </QueryClientProvider>
  </StrictMode>
);

// Wrap with ClerkProvider only when a publishable key is configured.
// This allows the app to run without Clerk during local dev if the key is absent.
createRoot(document.getElementById('root')).render(
  CLERK_PUBLISHABLE_KEY
    ? <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>{AppTree}</ClerkProvider>
    : AppTree
);


