import { useEffect } from 'react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { ThemeProvider } from './context/ThemeContext';
import { SOSProvider } from './context/SOSContext';
import { GlobalSOSButton } from './components/features/safety/GlobalSOSButton';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { GlobalSocketListener } from './components/common/GlobalSocketListener';
import { useAuth } from './hooks/useAuth';

/**
 * SessionExpiredHandler
 *
 * Listens for the custom 'auth:session-expired' event dispatched by the Axios
 * interceptor and triggers logout + navigation via React Router (no page reload).
 */
function SessionExpiredHandler() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => {
      logout();
      navigate('/login', { replace: true });
    };

    window.addEventListener('auth:session-expired', handler);
    return () => window.removeEventListener('auth:session-expired', handler);
  }, [logout, navigate]);

  return null;
}

/**
 * Root App Component
 *
 * Wraps entire application with:
 * 1. ErrorBoundary - catches runtime errors
 * 2. ThemeProvider - dark/light mode
 * 3. BrowserRouter - enables client-side routing
 * 4. SOSProvider - global active booking tracker for SOS button
 * 5. GlobalSOSButton - floating SOS button (visible on all pages during active bookings)
 * 6. SessionExpiredHandler - handles auth session expiry via React Router
 * 7. AppRoutes - all route definitions
 */
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <SOSProvider>
            <SessionExpiredHandler />
            <GlobalSocketListener />
            <AppRoutes />
            <GlobalSOSButton />
          </SOSProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
