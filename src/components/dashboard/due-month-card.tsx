'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Calendar, TrendingUp } from 'lucide-react';

interface DueMonthCardProps {
  amount: string;
  trend?: string;
  isLoading?: boolean;
}

export const DueMonthCard: React.FC<DueMonthCardProps> = ({
  amount,
  trend = '8.2% from last month',
  isLoading = false,
}) => {
  const bars = [
    { month: 'Jul', height: '35%', active: false },
    { month: 'Aug', height: '55%', active: false },
    { month: 'Sep', height: '70%', active: false },
    { month: 'Sep', height: '45%', active: false },
    { month: 'Oct', height: '85%', active: false },
    { month: 'Nov', height: '65%', active: false },
    { month: 'Dec', height: '100%', active: true },
  ];

  return (
    <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Due within next month
          </span>
          <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-indigo-500" />
          </div>
        </div>

        <div className="mt-3">
          {isLoading ? (
            <div className="h-9 w-36 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          ) : (
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
              {amount}
            </h2>
          )}
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{trend}</span>
        </div>
      </div>

      {/* Mini Bar Chart matching Dashboard One */}
      <div className="mt-6 pt-3 flex items-end justify-between gap-1.5 h-24">
        {bars.map((bar, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
            <div className="w-full relative flex items-end justify-center h-full">
              <div
                style={{ height: bar.height }}
                className={`w-3.5 rounded-t-lg transition-all duration-300 ${
                  bar.active
                    ? 'bg-indigo-600 dark:bg-indigo-500 shadow-sm shadow-indigo-500/50 group-hover:bg-indigo-700'
                    : 'bg-indigo-200/80 dark:bg-indigo-950 group-hover:bg-indigo-300'
                }`}
              />
            </div>
            <span className="text-[10px] font-medium text-slate-400">{bar.month}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};
