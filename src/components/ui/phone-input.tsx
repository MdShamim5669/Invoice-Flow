'use client';

import React from 'react';
import { Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PhoneInputProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  id?: string;
  defaultCountryCode?: string; // Kept optional for backward compatibility with existing callers
  disabled?: boolean;
  className?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  label = 'Business Phone',
  value = '',
  onChange,
  placeholder = '+880 1712-345678',
  error,
  id = 'phone-input',
  disabled = false,
  className,
}) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}

      <div className="relative rounded-2xl shadow-inner">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
          <Phone className="w-4 h-4" />
        </div>

        <input
          id={id}
          type="tel"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'block w-full rounded-2xl border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-slate-950/70 pl-10 pr-4 py-3 text-sm font-mono tracking-wide text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 disabled:cursor-not-allowed disabled:opacity-60',
            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
            className
          )}
        />
      </div>

      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
};

export default PhoneInput;
