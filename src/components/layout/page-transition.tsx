'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Sparkles, Layers, Sliders, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CurtainEffect = 'fade' | 'wipe' | 'doors' | 'iris';

interface TransitionContextType {
  effect: CurtainEffect;
  setEffect: (effect: CurtainEffect) => void;
}

const TransitionContext = createContext<TransitionContextType>({
  effect: 'wipe',
  setEffect: () => {},
});

export const useTransitionEffect = () => useContext(TransitionContext);

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const [effect, setEffectState] = useState<CurtainEffect>('wipe');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('finnova_curtain_effect') as CurtainEffect;
      if (saved && ['fade', 'wipe', 'doors', 'iris'].includes(saved)) {
        setEffectState(saved);
      }
    }
  }, []);

  const setEffect = (newEffect: CurtainEffect) => {
    setEffectState(newEffect);
    if (typeof window !== 'undefined') {
      localStorage.setItem('finnova_curtain_effect', newEffect);
    }
  };

  return (
    <TransitionContext.Provider value={{ effect, setEffect }}>
      {children}
    </TransitionContext.Provider>
  );
}

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname();
  const { effect } = useTransitionEffect();

  return (
    <div className="relative w-full">
      <AnimatePresence mode="wait" initial={false}>
        {/* Wipe Curtain Overlay */}
        {effect === 'wipe' && (
          <motion.div
            key={`wipe-curtain-${pathname}`}
            className="fixed inset-0 bg-gradient-to-b from-indigo-950/90 via-[#0b0c13]/95 to-[#131722] z-50 pointer-events-none backdrop-blur-md"
            initial={{ scaleY: 0, transformOrigin: 'bottom' }}
            animate={{
              scaleY: 0,
              transformOrigin: 'top',
              transition: { duration: 0.38, ease: [0.76, 0, 0.24, 1], delay: 0.05 },
            }}
            exit={{
              scaleY: 1,
              transformOrigin: 'bottom',
              transition: { duration: 0.3, ease: [0.76, 0, 0.24, 1] },
            }}
          />
        )}

        {/* Doors Curtain Overlays (Split Left & Right stage doors) */}
        {effect === 'doors' && (
          <React.Fragment key={`doors-curtain-${pathname}`}>
            {/* Left Door */}
            <motion.div
              className="fixed top-0 left-0 bottom-0 w-1/2 bg-gradient-to-r from-[#0b0c13] to-indigo-950/90 border-r border-indigo-500/20 z-50 pointer-events-none backdrop-blur-md"
              initial={{ scaleX: 1, transformOrigin: 'left' }}
              animate={{
                scaleX: 0,
                transformOrigin: 'left',
                transition: { duration: 0.42, ease: [0.76, 0, 0.24, 1], delay: 0.05 },
              }}
              exit={{
                scaleX: 1,
                transformOrigin: 'left',
                transition: { duration: 0.32, ease: [0.76, 0, 0.24, 1] },
              }}
            />
            {/* Right Door */}
            <motion.div
              className="fixed top-0 right-0 bottom-0 w-1/2 bg-gradient-to-l from-[#0b0c13] to-indigo-950/90 border-l border-indigo-500/20 z-50 pointer-events-none backdrop-blur-md"
              initial={{ scaleX: 1, transformOrigin: 'right' }}
              animate={{
                scaleX: 0,
                transformOrigin: 'right',
                transition: { duration: 0.42, ease: [0.76, 0, 0.24, 1], delay: 0.05 },
              }}
              exit={{
                scaleX: 1,
                transformOrigin: 'right',
                transition: { duration: 0.32, ease: [0.76, 0, 0.24, 1] },
              }}
            />
          </React.Fragment>
        )}

        {/* Main Content Render with Curtain Effect Variants */}
        <motion.div
          key={pathname}
          variants={
            effect === 'iris'
              ? {
                  initial: {
                    clipPath: 'circle(0% at 50% 50%)',
                    opacity: 0,
                  },
                  animate: {
                    clipPath: 'circle(150% at 50% 50%)',
                    opacity: 1,
                    transition: {
                      duration: 0.48,
                      ease: [0.76, 0, 0.24, 1],
                    },
                  },
                  exit: {
                    clipPath: 'circle(0% at 50% 50%)',
                    opacity: 0.8,
                    transition: {
                      duration: 0.3,
                      ease: [0.76, 0, 0.24, 1],
                    },
                  },
                }
              : effect === 'wipe' || effect === 'doors'
              ? {
                  initial: { opacity: 0, y: 14 },
                  animate: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.32,
                      delay: 0.12,
                      ease: [0.16, 1, 0.3, 1],
                    },
                  },
                  exit: {
                    opacity: 0,
                    y: -10,
                    transition: {
                      duration: 0.18,
                      ease: [0.4, 0, 1, 1],
                    },
                  },
                }
              : {
                  // Default Fade with asymmetrical easeReverse
                  initial: { opacity: 0, y: 10 },
                  animate: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.28,
                      ease: [0.16, 1, 0.3, 1],
                    },
                  },
                  exit: {
                    opacity: 0,
                    y: -6,
                    transition: {
                      duration: 0.15,
                      ease: [0.4, 0, 1, 1],
                    },
                  },
                }
          }
          initial="initial"
          animate="animate"
          exit="exit"
          className={className}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/**
 * Floating Curtains Demo Switcher
 * Allows user to live test and swap between Fade, Wipe, Doors, and Iris effects
 */
export function CurtainsDemoSwitcher() {
  const { effect, setEffect } = useTransitionEffect();
  const [isOpen, setIsOpen] = useState(false);

  const effects: { id: CurtainEffect; label: string; desc: string }[] = [
    { id: 'wipe', label: 'Wipe', desc: 'Vertical curtain sweep' },
    { id: 'doors', label: 'Doors', desc: 'Split double stage doors' },
    { id: 'iris', label: 'Iris', desc: 'Radial circular aperture' },
    { id: 'fade', label: 'Fade', desc: 'Asymmetrical smooth crossfade' },
  ];

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{
              opacity: 0,
              scale: 0.94,
              y: 8,
              transition: { duration: 0.15, ease: [0.32, 0, 0.67, 0] },
            }}
            className="mb-2 p-3 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-2xl w-64 space-y-2 text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>Curtain Transitions</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {effects.map((item) => {
                const isActive = effect === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setEffect(item.id)}
                    className={cn(
                      'flex items-center justify-between p-2 rounded-xl text-left font-semibold transition-all cursor-pointer',
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100/70 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    )}
                  >
                    <div>
                      <p className="text-xs">{item.label}</p>
                      <p className={cn('text-[9px]', isActive ? 'text-indigo-100' : 'text-slate-400')}>
                        {item.desc.split(' ')[0]}
                      </p>
                    </div>
                    {isActive && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-400 text-center pt-1 font-medium">
              Click any navbar link to preview
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-slate-200 shadow-xl cursor-pointer hover:border-indigo-500/50 transition-colors"
      >
        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
        <span className="text-xs font-bold font-sans">Curtains: {effect}</span>
        <Sliders className="w-3.5 h-3.5 text-indigo-500" />
      </motion.button>
    </div>
  );
}

export default PageTransition;
