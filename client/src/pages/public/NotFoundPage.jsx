// NotFoundPage — animated 404 with gradient text and floating icon

import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, SearchX, Compass } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { MainLayout } from '../../components/layout/MainLayout';
import { Button } from '../../components/common';
import { usePageTitle } from '../../hooks/usePageTitle';

export function NotFoundPage() {
  usePageTitle('Page Not Found');
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 relative overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full blur-[100px] opacity-20 bg-brand-400" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[100px] opacity-15 bg-accent-400" />
        </div>

        <div className="text-center max-w-lg w-full relative z-10">
          {/* Animated icon */}
          <Motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative mx-auto mb-8 w-36 h-36"
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-100 to-accent-100 dark:from-brand-500/20 dark:to-accent-500/20 border border-brand-100 dark:border-brand-500/20" />
            <div className="relative flex items-center justify-center h-full">
              <SearchX className="w-16 h-16 text-brand-500 dark:text-brand-400" strokeWidth={1.5} />
            </div>
          </Motion.div>

          {/* 404 */}
          <Motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-[8rem] sm:text-[10rem] font-black gradient-text leading-none mb-4 select-none"
          >
            404
          </Motion.h1>

          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-neutral-900 dark:text-neutral-100">
              Page Not Found
            </h2>
            <p className="text-base sm:text-lg mb-10 text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-md mx-auto">
              Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
              Try going back or heading to the homepage.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" variant="gradient" icon={Home} onClick={() => navigate('/')}>
                Go Home
              </Button>
              <Button size="lg" variant="outline" icon={ArrowLeft} onClick={() => navigate(-1)}>
                Go Back
              </Button>
            </div>
          </Motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
