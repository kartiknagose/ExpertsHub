// Main layout wrapper component
// Wraps pages with Navbar and Footer

import { useState } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
// import correct path
import { ProfileIncompleteAlert } from '../common/ProfileIncompleteAlert';

export function MainLayout({ children }) {
  const { isDark } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Background gradient styles
  const backgroundStyles = isDark
    ? 'bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 min-h-screen'
    : 'bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen';

  return (
    <div className={`${backgroundStyles} flex flex-col relative`}>
      <Navbar
        onOpenSidebar={() => setIsSidebarOpen(true)}
        sidebarOffset={isAuthenticated ? (isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64') : ''}
        showBrand={!isAuthenticated}
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
        className={`flex-1 ${isAuthenticated ? (isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64') : ''
          }`}
      >
        {children}
      </main>

      {!isAuthenticated && <Footer />}
    </div>
  );
}
