// Main layout wrapper component
// Wraps pages with Navbar and Footer

import { useState } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

/**
 * MainLayout Component
 * Wraps page content with navigation and footer
 * @param {React.ReactNode} children - Page content
 */
export function MainLayout({ children }) {
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Background gradient styles
  const backgroundStyles = isDark
    ? 'bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 min-h-screen'
    : 'bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen';

  return (
    <div className={backgroundStyles}>
      <Navbar
        onOpenSidebar={() => setIsSidebarOpen(true)}
        sidebarOffset={isAuthenticated ? (isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64') : ''}
        showBrand={!isAuthenticated}
      />

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
        className={`flex-1 ${
          isAuthenticated ? (isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64') : ''
        }`}
      >
        {children}
      </main>

      {!isAuthenticated && <Footer />}
    </div>
  );
}
