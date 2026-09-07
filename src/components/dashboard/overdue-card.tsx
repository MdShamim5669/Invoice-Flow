'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { AlertCircle, TrendingUp } from 'lucide-react';
import Image from 'next/image';

interface OverdueCardProps {
  amount: string;
  trend?: string;
  isLoading?: boolean;
}

export const OverdueCard: React.FC<OverdueCardProps> = ({
  amount,
  trend = '12.5% from last month',
  isLoading = false,
}) => {
  return (
    <Card className="p-6 pb-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Overdue
          </span>
          <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
        </div>

        <div className="mt-3">
          {isLoading ? (
            <div className="h-9 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          ) : (
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
              {amount}
            </h2>
          )}
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{trend}</span>
        </div>
      </div>

      {/* Desk Photo embedded cleanly (Dashboard One.jpg highlight) */}
      <div className="mt-4 -mx-2 -mb-1 rounded-2xl overflow-hidden relative h-28 w-auto border border-slate-100 dark:border-slate-800">
        <Image
          src="/images/desk.jpg"
          alt="Office Desk"
          fill
          className="object-cover object-center transform hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, 25vw"
          priority
        />
      </div>
    </Card>
  );
};
