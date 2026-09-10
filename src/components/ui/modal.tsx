'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Deep Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              transition: {
                type: 'spring',
                stiffness: 420,
                damping: 30,
              },
            }}
            exit={{
              opacity: 0,
              scale: 0.96,
              y: 8,
              transition: {
                duration: 0.16,
                ease: [0.32, 0, 0.67, 0],
              },
            }}
            className={cn(
              'relative w-full rounded-3xl bg-white dark:bg-[#0c0d16]/95 backdrop-blur-2xl shadow-[0_24px_70px_rgba(0,0,0,0.7)] border border-slate-200/90 dark:border-white/[0.12] p-6 sm:p-7 z-10 overflow-hidden',
              maxWidths[maxWidth],
              className
            )}
          >
            {/* Specular Top Bevel Edge */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.25] to-transparent pointer-events-none" />

            {/* Subtle Ambient Radial Highlight */}
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-indigo-500/[0.12] rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-violet-600/[0.08] rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-white/[0.08] relative z-10">
              <div className="space-y-1">
                {title && (
                  <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed max-w-sm">
                    {description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] border border-transparent dark:border-white/[0.08] transition-all cursor-pointer shadow-2xs"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-5 relative z-10">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
