// MainLayout — animated mesh gradient background, smooth sidebar transitions

import { useState } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { ProfileIncompleteAlert } from '../common/ProfileIncompleteAlert';

export function MainLayout({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const sidebarWidth = isSidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64';
  const navOffset    = isSidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-64';

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-dark-950 relative">
      {/* Skip to content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-brand-500 focus:text-white focus:rounded-xl focus:font-bold focus:shadow-brand-md"
      >
        Skip to content
      </a>

      {/* Subtle fixed mesh background */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 20% -20%, rgba(59,130,246,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 110%, rgba(217,70,239,0.04) 0%, transparent 60%)
          `,
        }}
      />

      <Navbar
        onOpenSidebar={() => setIsSidebarOpen(true)}
        sidebarOffset={isAuthenticated ? navOffset : ''}
        showBrand={true}
      />

      {/* Profile alert */}
      {isAuthenticated && (
        <div className={isAuthenticated ? (isSidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64') : ''}>
          <ProfileIncompleteAlert />
        </div>
      )}

      {/* Sidebar */}
      {isAuthenticated && (
        <Sidebar
          isOpen={isSidebarOpen}
          isCollapsed={isSidebarCollapsed}
          onClose={() => setIsSidebarOpen(false)}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />
      )}

      {/* Main content */}
      <main
        id="main-content"
        className={`flex-1 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] animate-fade-in ${isAuthenticated ? sidebarWidth : ''}`}
      >
        {children}
      </main>

      {!isAuthenticated && <Footer />}
    </div>
  );
}
