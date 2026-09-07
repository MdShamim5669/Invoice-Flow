'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ArrowUpRight, Lock, Zap } from 'lucide-react';

interface InstantPayoutCardProps {
  availableAmount: string;
  onPayout?: (method: string) => void;
  isLoading?: boolean;
}

export const InstantPayoutCard: React.FC<InstantPayoutCardProps> = ({
  availableAmount,
  onPayout,
  isLoading = false,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'visa' | 'stripe' | 'sslcommerz'>('stripe');

  return (
    <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Available for Instant Payout
            </span>
            <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <Lock className="w-3 h-3 text-emerald-500" />
            </div>
          </div>

          <button
            type="button"
            title="Instant Payout"
            onClick={() => onPayout?.(selectedMethod)}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3">
          {isLoading ? (
            <div className="h-9 w-36 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          ) : (
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
              {availableAmount}
            </h2>
          )}
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          <Zap className="w-3.5 h-3.5" />
          <span>Expected within 30 mins</span>
        </div>
      </div>

      {/* Payment methods selector + Payout Action */}
      <div className="mt-5 space-y-2.5">
        {/* 3 Payment card chips */}
        <div className="grid grid-cols-3 gap-1.5">
          {/* Card 1: Visa */}
          <button
            type="button"
            onClick={() => setSelectedMethod('visa')}
            className={`py-2 px-1 rounded-2xl text-center border transition-all cursor-pointer ${
              selectedMethod === 'visa'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/30 scale-[1.02]'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <p className="text-[11px] font-bold tracking-tight">Visa</p>
          </button>

          {/* Card 2: Stripe (Selected purple card) */}
          <button
            type="button"
            onClick={() => setSelectedMethod('stripe')}
            className={`py-2 px-1 rounded-2xl text-center border transition-all cursor-pointer ${
              selectedMethod === 'stripe'
                ? 'bg-gradient-to-tr from-indigo-600 via-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-600/40 scale-[1.02]'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <p className="text-[11px] font-bold tracking-tight">Stripe</p>
      
          </button>

          {/* Card 3: SSLCommerz / Local */}
          <button
            type="button"
            onClick={() => setSelectedMethod('sslcommerz')}
            className={`py-2 px-1 rounded-2xl text-center border transition-all cursor-pointer ${
              selectedMethod === 'sslcommerz'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/30 scale-[1.02]'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <p className="text-[11px] font-bold tracking-tight">SSLCommerz</p>
          </button>
        </div>

        {/* Payout now button: Full-width, never overflows */}
        <button
          type="button"
          onClick={() => onPayout?.(selectedMethod)}
          className="w-full py-2.5 px-4 rounded-2xl text-xs font-bold bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-850 dark:hover:bg-slate-100 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
        >
          <span>Payout now</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </Card>
  );
};
