'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Clock, TrendingDown } from 'lucide-react';

interface PaidTimeCardProps {
  days: string;
  trend?: string;
  isLoading?: boolean;
}

export const PaidTimeCard: React.FC<PaidTimeCardProps> = ({
  days,
  trend = '2 days from last month',
  isLoading = false,
}) => {
  return (
    <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Average time to get paid
          </span>
          <div className="w-7 h-7 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-500 flex items-center justify-center">
            <Clock className="w-4 h-4 text-cyan-500" />
          </div>
        </div>

        <div className="mt-3">
          {isLoading ? (
            <div className="h-9 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          ) : (
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
              {days}
            </h2>
          )}
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-xs text-cyan-600 dark:text-cyan-400 font-medium">
          <TrendingDown className="w-3.5 h-3.5" />
          <span>{trend}</span>
        </div>
      </div>

      {/* SVG Spline Curve with glowing nodes (Dashboard One.jpg highlight) */}
      <div className="mt-6 pt-3 h-24 relative flex items-end">
        <svg
          viewBox="0 0 240 80"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="curveGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#818CF8" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#6366F1" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Smooth path */}
          <path
            d="M 10 70 C 40 68, 60 45, 90 42 C 120 40, 140 28, 170 20 C 195 14, 215 8, 235 5"
            fill="none"
            stroke="url(#curveGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#glow)"
          />

          {/* Glowing nodes on points */}
          {[
            { cx: 10, cy: 70 },
            { cx: 60, cy: 52 },
            { cx: 90, cy: 42 },
            { cx: 120, cy: 38 },
            { cx: 150, cy: 26 },
            { cx: 170, cy: 20 },
            { cx: 200, cy: 12 },
            { cx: 235, cy: 5 },
          ].map((dot, i) => (
            <g key={i}>
              <circle cx={dot.cx} cy={dot.cy} r="4" fill="#FFFFFF" stroke="#6366F1" strokeWidth="2.5" />
            </g>
          ))}
        </svg>
      </div>
    </Card>
  );
};
