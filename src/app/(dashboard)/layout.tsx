import React from 'react';
import { PillNav } from '@/components/layout/pill-nav';
import {
  PageTransition,
  TransitionProvider,
  CurtainsDemoSwitcher,
} from '@/components/layout/page-transition';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TransitionProvider>
      <div className="min-h-screen bg-slate-100/60 dark:bg-transparent flex flex-col">
        <PillNav />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <PageTransition>{children}</PageTransition>
        </main>
        <CurtainsDemoSwitcher />
      </div>
    </TransitionProvider>
  );
}
