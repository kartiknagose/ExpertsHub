// LegalLayout — reusable shell for Privacy, Terms, Cookies pages

import { motion as Motion } from 'framer-motion';
import { MainLayout } from '../../components/layout/MainLayout';
import { getPageLayout } from '../../constants/layout';

export function LegalLayout({ title, subtitle, lastUpdated, children }) {
  return (
    <MainLayout>
      {/* Hero */}
      <section className="py-16 bg-white dark:bg-dark-950 text-center border-b border-neutral-100 dark:border-dark-800">
        <div className={getPageLayout('narrow')}>
          <Motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs font-black uppercase tracking-widest text-brand-500 mb-3 block">Legal</span>
            <h1 className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tight mb-3">
              {title}
            </h1>
            {subtitle && (
              <p className="text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto">{subtitle}</p>
            )}
            {lastUpdated && (
              <p className="mt-3 text-xs text-neutral-400">Last updated: {lastUpdated}</p>
            )}
          </Motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-neutral-50 dark:bg-dark-900">
        <div className={getPageLayout('narrow')}>
          <div className="bg-white dark:bg-dark-800 rounded-3xl border border-neutral-100 dark:border-dark-700 shadow-card p-8 md:p-12 prose prose-neutral dark:prose-invert max-w-none
            prose-headings:font-black prose-headings:tracking-tight
            prose-h2:text-xl prose-h2:text-neutral-900 prose-h2:dark:text-white prose-h2:mb-2
            prose-p:text-neutral-500 prose-p:dark:text-neutral-400 prose-p:leading-relaxed
            prose-li:text-neutral-500 prose-li:dark:text-neutral-400
          ">
            {children}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
