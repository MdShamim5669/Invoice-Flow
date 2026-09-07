import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  amount: string;
  subtitle?: string;
  trend?: {
    value: string;
    isUp: boolean;
  };
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  amount,
  subtitle,
  trend,
  icon,
  children,
  className,
}) => {
  return (
    <Card className={cn('p-6 relative overflow-hidden flex flex-col justify-between', className)}>
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {title}
          </span>
          {icon && (
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {icon}
            </div>
          )}
        </div>

        <div className="mt-3">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {amount}
          </h2>
        </div>

        {trend && (
          <div className="mt-2 flex items-center gap-1.5">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full',
                trend.isUp
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
              )}
            >
              {trend.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend.value}
            </span>
            {subtitle && (
              <span className="text-xs text-slate-400 font-normal">{subtitle}</span>
            )}
          </div>
        )}
      </div>

      {children && <div className="mt-4">{children}</div>}
    </Card>
  );
};
