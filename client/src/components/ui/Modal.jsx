// Modal — glassmorphic, spring animation, sheet on mobile

import { useEffect, useRef, useCallback } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  closeOnBackdrop = true,
  showCloseButton = true,
  children,
  className = '',
}) {
  const modalRef = useRef(null);
  const previouslyFocusedRef = useRef(null);
  const FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const handleTabKey = useCallback((e) => {
    if (e.key !== 'Tab' || !modalRef.current) return;
    const els = modalRef.current.querySelectorAll(FOCUSABLE);
    if (!els.length) return;
    const first = els[0], last = els[els.length - 1];
    if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
    else            { if (document.activeElement === last)  { e.preventDefault(); first.focus(); } }
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && isOpen) onClose(); handleTabKey(e); };
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, handleTabKey]);

  useEffect(() => {
    if (isOpen) {
      previouslyFocusedRef.current = document.activeElement;
      const t = setTimeout(() => {
        const el = modalRef.current?.querySelector(FOCUSABLE);
        (el || modalRef.current)?.focus();
      }, 60);
      return () => clearTimeout(t);
    } else {
      previouslyFocusedRef.current?.focus?.();
      previouslyFocusedRef.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const sizeClasses = {
    sm:   'max-w-md',
    md:   'max-w-lg',
    lg:   'max-w-2xl',
    xl:   'max-w-4xl',
    '2xl':'max-w-6xl',
    full: 'max-w-full mx-4',
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  const backdropVariants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden:  { opacity: isMobile ? 1 : 0, y: isMobile ? '100%' : 24, scale: isMobile ? 1 : 0.94 },
    visible: {
      opacity: 1, y: 0, scale: 1,
      transition: { type: 'spring', damping: 28, stiffness: 380 },
    },
    exit: {
      opacity: isMobile ? 1 : 0, y: isMobile ? '100%' : 24, scale: isMobile ? 1 : 0.94,
      transition: { duration: 0.22 },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Motion.div
          className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.2 }}
          onClick={closeOnBackdrop ? (e) => e.target === e.currentTarget && onClose() : undefined}
        >
          <Motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-label={title || undefined}
            tabIndex={-1}
            className={[
              'relative w-full focus:outline-none',
              sizeClasses[size] ?? sizeClasses.md,
              'bg-white dark:bg-dark-800',
              'border border-neutral-200 dark:border-dark-700',
              'rounded-t-3xl sm:rounded-2xl shadow-3xl',
              'fixed bottom-0 sm:relative sm:bottom-auto',
              'max-h-[90vh] overflow-y-auto scrollbar-thin',
              className,
            ].join(' ')}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Mobile drag handle */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-neutral-300 dark:bg-dark-600" />
            </div>

            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-dark-700">
                {title && (
                  <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl transition-colors text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-dark-700 ml-auto"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="p-6">{children}</div>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
}

export function ModalFooter({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 dark:border-dark-700 ${className}`}>
      {children}
    </div>
  );
}
