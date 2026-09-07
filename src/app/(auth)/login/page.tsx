'use client';

import React, { Suspense } from 'react';
import { SlidingAuthCard } from '@/components/auth/sliding-auth-card';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-6 bg-[#090b14] text-white relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Studio Ambient Background Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.18),transparent_60%)] pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-teal-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Subtle Dot Matrix Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />

      <Suspense
        fallback={
          <div className="text-center text-xs text-slate-400 animate-pulse">
            Loading authentication workspace...
          </div>
        }
      >
        <SlidingAuthCard initialMode="signin" />
      </Suspense>
    </div>
  );
}
