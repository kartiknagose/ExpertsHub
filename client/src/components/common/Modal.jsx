// Modal/Dialog component for overlays and confirmations
// Supports animations, backdrop click, and close button

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

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
  const { isDark } = useTheme();

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

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
  const modalStyles = isDark
    ? 'bg-dark-800 border border-dark-700'
    : 'bg-white border border-gray-200';

  const backdropStyles = isDark
    ? 'bg-black/70'
    : 'bg-black/50';

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
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${backdropStyles} backdrop-blur-sm`}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={handleBackdropClick}
        >
          <motion.div
            className={`relative w-full ${sizeStyles[size]} ${modalStyles} rounded-xl shadow-2xl ${className}`}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className={`flex items-center justify-between p-6 ${isDark ? 'border-b border-dark-700' : 'border-b border-gray-200'}`}>
                {title && (
                  <h2 className={`text-xl font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className={`ml-auto p-2 rounded-lg transition-colors ${
                      isDark
                        ? 'text-gray-400 hover:text-gray-200 hover:bg-dark-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * ModalFooter - Optional footer for Modal
 * Use for action buttons
 */
export function ModalFooter({ children, className = '' }) {
  const { isDark } = useTheme();

  const borderStyles = isDark
    ? 'border-t border-dark-700'
    : 'border-t border-gray-200';

  return (
    <div className={`flex items-center justify-end gap-3 px-6 py-4 ${borderStyles} ${className}`}>
      {children}
    </div>
  );
}
