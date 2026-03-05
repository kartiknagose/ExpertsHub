// Modal/Dialog component for overlays and confirmations
// Supports animations, backdrop click, and close button

import { useEffect, useRef, useCallback } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Modal Component
 * @param {boolean} isOpen - Modal open state
 * @param {function} onClose - Function to close modal
 * @param {string} title - Modal title
 * @param {string} size - Modal size: 'sm', 'md', 'lg', 'xl', 'full'
 * @param {boolean} closeOnBackdrop - Close modal when clicking backdrop (default: true)
 * @param {boolean} showCloseButton - Show X button in top-right (default: true)
 * @param {React.ReactNode} children - Modal content
 */
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

  const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const handleTabKey = useCallback((e) => {
    if (e.key !== 'Tab' || !modalRef.current) return;
    const focusableElements = modalRef.current.querySelectorAll(FOCUSABLE_SELECTOR);
    if (focusableElements.length === 0) return;

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  // Close modal on Escape key + focus trap
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
        return;
      }
      handleTabKey(e);
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleTabKey]);

  // Save and restore focus
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedRef.current = document.activeElement;
      // Delay to allow modal animation to render
      const timer = setTimeout(() => {
        if (modalRef.current) {
          const firstFocusable = modalRef.current.querySelector(FOCUSABLE_SELECTOR);
          if (firstFocusable) {
            firstFocusable.focus();
          } else {
            modalRef.current.focus();
          }
        }
      }, 50);
      return () => clearTimeout(timer);
    } else {
      if (previouslyFocusedRef.current && typeof previouslyFocusedRef.current.focus === 'function') {
        previouslyFocusedRef.current.focus();
        previouslyFocusedRef.current = null;
      }
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Size variants
  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  // Theme styles
  const modalStyles = 'bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700';

  const backdropStyles = 'bg-black/50 dark:bg-black/70';

  // Backdrop click handler
  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: {
      opacity: window.innerWidth < 640 ? 1 : 0,
      y: window.innerWidth < 640 ? '100%' : 20,
      scale: window.innerWidth < 640 ? 1 : 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 400
      }
    },
    exit: {
      opacity: window.innerWidth < 640 ? 1 : 0,
      y: window.innerWidth < 640 ? '100%' : 20,
      scale: window.innerWidth < 640 ? 1 : 0.95,
      transition: {
        duration: 0.2
      }
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Motion.div
          className={`fixed inset-0 z-50 flex items-center justify-center sm:p-4 ${backdropStyles} backdrop-blur-sm overflow-hidden`}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={handleBackdropClick}
        >
          <Motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-label={title || undefined}
            tabIndex={-1}
            className={`relative w-full ${sizeStyles[size]} ${modalStyles} 
                            rounded-t-3xl sm:rounded-xl shadow-2xl ${className}
                            fixed bottom-0 sm:relative sm:bottom-auto
                            max-h-[90vh] overflow-y-auto custom-scrollbar
                        `}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Mobile Handle */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-12 h-1.5 rounded-full bg-gray-200 dark:bg-dark-600" />
            </div>

            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-200 dark:border-dark-700">
                {title && (
                  <h2 className="text-lg sm:text-xl font-black tracking-tight text-gray-900 dark:text-gray-100">
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="p-5 sm:p-6">
              {children}
            </div>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * ModalFooter - Optional footer for Modal
 * Use for action buttons
 */
export function ModalFooter({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-dark-700 ${className}`}>
      {children}
    </div>
  );
}
