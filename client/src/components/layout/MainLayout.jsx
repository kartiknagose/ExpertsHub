// Main layout wrapper component
// Wraps pages with Navbar and Footer

import { useState } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { ProfileIncompleteAlert } from '../common/ProfileIncompleteAlert';
import { toast } from 'sonner';
import { useSocketEvent } from '../../hooks/useSocket';

export function MainLayout({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Global Admin SOS Listener
  useSocketEvent('sos:alert', (payload) => {
    if (!isAuthenticated || user?.role !== 'ADMIN') return;
    toast.error(`🚨 EMERGENCY SOS: Booking #${payload.bookingId}`, {
      description: `${payload.triggeredBy?.name} (${payload.triggeredBy?.role}) needs immediate assistance!`,
      duration: 20000,
      action: {
        label: 'OPEN SOS DASHBOARD',
        onClick: () => window.location.href = '/admin/sos-alerts'
      },
    });
  }, [isAuthenticated, user?.role]);

  // Background gradient styles
  const backgroundStyles = 'bg-gradient-to-br from-gray-50 dark:from-dark-900 via-white dark:via-dark-800 to-gray-50 dark:to-dark-900 min-h-screen';

  return (
    <div className={`${backgroundStyles} flex flex-col relative`}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-brand-500 focus:text-white focus:rounded-lg focus:font-bold focus:shadow-lg"
      >
        Skip to content
      </a>
      <Navbar
        onOpenSidebar={() => setIsSidebarOpen(true)}
        sidebarOffset={isAuthenticated ? (isSidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-64') : ''}
        showBrand={true}
      />

      {/* Show alert for authenticated users with incomplete profiles or pending verification */}
      {isAuthenticated && (
        <div className={isAuthenticated ? (isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64') : ''}>
          <ProfileIncompleteAlert />
        </div>
      )}

      {isAuthenticated && (
        <Sidebar
          isOpen={isSidebarOpen}
          isCollapsed={isSidebarCollapsed}
          onClose={() => setIsSidebarOpen(false)}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />
      )}

      {/* Main content area */}
      <main
        id="main-content"
        className={`flex-1 transition-all duration-300 ease-in-out ${isAuthenticated ? (isSidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64') : ''}`}
      >
        {children}
      </main>

      {!isAuthenticated && <Footer />}
    </div>
  );
}
