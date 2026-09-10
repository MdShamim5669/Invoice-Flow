'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  FileText,
  Zap,
  Calendar,
  ShoppingBag,
  Bell,
  Settings,
  LogOut,
  CheckCircle2,
  Clock,
  LogIn,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { CoolThemeToggle } from '@/components/lightswind/cool-theme-toggle';
import { motion, AnimatePresence } from 'framer-motion';

export const PillNav: React.FC = () => {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navItems = [
    { label: 'Overview', href: '/dashboard' },
    { label: 'Invoices', href: '/invoices' },
    { label: 'Payments', href: '/payments' },
    { label: 'Clients', href: '/clients' },
    { label: 'Expenses', href: '/expenses' },
    { label: 'Reports', href: '/reports' },
    { label: 'Settings', href: '/settings' },
  ];

  return (
    <header className="sticky top-0 w-full px-4 sm:px-8 pt-3.5 pb-2.5 bg-white/20 dark:bg-[#0b0c13]/30 backdrop-blur-xl border-b border-slate-200/10 dark:border-white/[0.04] transition-all z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand: Logo from Design folder + 80 Badge */}
        {/* Brand: Logo Icon + InvoiceFlow Text */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <Image
              src="/LOGO2.png"
              alt="InvoiceFlow Icon"
              width={42}
              height={42}
              className="h-9 w-9 object-contain transition-transform group-hover:scale-105 shrink-0"
              priority
            />
            <div className="flex flex-col">
              <span className="font-black text-base sm:text-lg tracking-tight leading-none text-slate-950 dark:text-white font-sans">
                Invoice<span className="text-[#008779] dark:text-[#00A896]">Flow</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium tracking-tight mt-0.5 whitespace-nowrap">
                Invoicing, simplified.
              </p>
            </div>
          </Link>
        </div>

        {/* Center Floating Dark Pill Navbar (Dashboard One.jpg signature bar) */}
        <nav className="hidden lg:flex items-center bg-slate-900/40 dark:bg-white/[0.04] backdrop-blur-xl text-slate-300 px-2.5 py-1.5 rounded-full shadow-lg border border-slate-800/40 dark:border-white/10">
          {navItems.map((item) => {
            const isActive =
              (item.href === '/dashboard' && pathname === '/dashboard') ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const isDot = item.label === 'Overview' || item.label === 'Invoices';

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'relative flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors duration-200 whitespace-nowrap z-10',
                  isActive ? 'text-white' : 'text-slate-400 hover:text-white'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-pill-indicator"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full shadow-md shadow-indigo-600/40 -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                {isDot && (
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full transition-colors',
                      isActive ? 'bg-white' : 'bg-slate-400'
                    )}
                  />
                )}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right utility buttons array + user avatar */}
        <div className="flex items-center gap-1.5 sm:gap-2 relative">
          {/* Action icon shortcuts */}
          <div className="hidden xl:flex items-center gap-1.5">
            <Link
              href="/invoices"
              title="All Documents"
              className="w-8 h-8 rounded-full bg-white/70 dark:bg-white/[0.05] border border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-white/10 flex items-center justify-center shadow-xs backdrop-blur-md transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/invoices/new"
              title="Instant Invoice Builder"
              className="w-8 h-8 rounded-full bg-white/70 dark:bg-white/[0.05] border border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-white/10 flex items-center justify-center shadow-xs backdrop-blur-md transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-500" />
            </Link>

            <Link
              href="/reports"
              title="Financial Schedule"
              className="w-8 h-8 rounded-full bg-white/70 dark:bg-white/[0.05] border border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-white/10 flex items-center justify-center shadow-xs backdrop-blur-md transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/expenses"
              title="Expense Receipts"
              className="w-8 h-8 rounded-full bg-white/70 dark:bg-white/[0.05] border border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-white/10 flex items-center justify-center shadow-xs backdrop-blur-md transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Bell with red notification badge & dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                setIsProfileOpen(false);
              }}
              title="Notifications"
              className="w-8 h-8 rounded-full bg-white/70 dark:bg-white/[0.05] border border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-white/10 flex items-center justify-center shadow-xs backdrop-blur-md transition-colors cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
            </button>
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />

            {/* Notification Popover Tray */}
            <AnimatePresence>
              {isNotifOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Activity Notifications</span>
                    <span className="text-[10px] text-indigo-500 font-semibold cursor-pointer" onClick={() => setIsNotifOpen(false)}>Close</span>
                  </div>
                  <div className="space-y-3 mt-3 text-xs">
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">SSLCommerz Settlement</p>
                        <p className="text-[11px] text-slate-500">Invoice #INV-1003 verified & reconciled.</p>
                        <span className="text-[9px] text-slate-400">10m ago</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">Stripe Webhook Event</p>
                        <p className="text-[11px] text-slate-500">Checkout session completed successfully.</p>
                        <span className="text-[9px] text-slate-400">1h ago</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Mode Switcher */}
          <CoolThemeToggle size="sm" />

          {/* Settings */}
          <Link
            href="/settings"
            title="Settings"
            className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 flex items-center justify-center shadow-xs transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
          </Link>

          {/* User Profile Avatar with dropdown or Sign In button */}
          {user ? (
            <div className="relative ml-1">
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotifOpen(false);
                }}
                className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 cursor-pointer block ring-2 ring-transparent hover:ring-indigo-500/50 transition-all"
              >
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || 'User'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-xs font-bold uppercase">
                    {(user.name || user.email || 'U').charAt(0)}
                  </div>
                )}
              </button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50"
                  >
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {user.email}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/settings"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        Company Settings
                      </Link>

                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          signOut();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30 transition-all cursor-pointer ml-1 hover:scale-105 active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
