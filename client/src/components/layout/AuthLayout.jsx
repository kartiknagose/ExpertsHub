import { MainLayout } from './MainLayout';
import { IMAGES } from '../../constants/images';

/**
 * AuthLayout - Shared split-screen layout for all auth pages.
 * Left: branded visual panel (hidden on mobile). Right: form content.
 */
export function AuthLayout({ children, title, subtitle }) {
  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-64px)] flex bg-gray-50 dark:bg-dark-950">

        {/* Left Side - Visual Branding (Hidden on mobile) */}
        <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-accent-700" />
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)' }} />
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full border border-white/10" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full border border-white/10" />

          <div className="relative z-10 max-w-lg text-white">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-xl">U</span>
              </div>
              <span className="text-2xl font-bold">UrbanPro</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-extrabold mb-5 leading-tight">
              {title || 'Your trusted home services platform'}
            </h1>
            <p className="text-lg text-brand-100 mb-10 leading-relaxed">
              {subtitle || 'Connect with verified professionals for all your home service needs.'}
            </p>

            <div className="grid grid-cols-3 gap-4">
              {[
                { value: '50K+', label: 'Customers' },
                { value: '8K+', label: 'Professionals' },
                { value: '4.9★', label: 'Avg Rating' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-black mb-0.5">{stat.value}</div>
                  <div className="text-xs text-brand-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Form Content */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative bg-white dark:bg-dark-950">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="flex lg:hidden items-center gap-2.5 mb-8">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-accent-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">U</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent">UrbanPro</span>
            </div>

            {children}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
