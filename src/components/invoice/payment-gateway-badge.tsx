import React from 'react';

interface PaymentGatewayBadgeProps {
  method?: string;
}

export function PaymentGatewayBadge({ method = 'Stripe' }: PaymentGatewayBadgeProps) {
  const normalized = method.toLowerCase();

  if (normalized.includes('master')) {
    return (
      <div className="inline-flex items-center gap-2">
        <span className="relative flex items-center justify-center w-6 h-6 rounded-md bg-white dark:bg-slate-800 shadow-xs border border-slate-200/60 dark:border-slate-700/60 overflow-hidden shrink-0">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle cx="9" cy="12" r="6" fill="#EB001B" />
            <circle cx="15" cy="12" r="6" fill="#F79E1B" fillOpacity="0.88" />
          </svg>
        </span>
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Master</span>
      </div>
    );
  }

  if (normalized.includes('visa')) {
    return (
      <div className="inline-flex items-center gap-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-md bg-[#1A1F71] text-white shadow-xs shrink-0 font-black italic text-[10px]">
          V
        </span>
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Visa</span>
      </div>
    );
  }

  if (normalized.includes('paypal')) {
    return (
      <div className="inline-flex items-center gap-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-md bg-[#003087] text-[#0079C1] shadow-xs shrink-0">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path
              fill="#0079C1"
              d="M20.067 8.478c-.492 5.15-3.92 7.747-8.91 7.747h-2.18c-.443 0-.814.333-.878.77l-1.076 6.82-.31 1.968a.723.723 0 0 1-.715.617H2.25a.54.54 0 0 1-.533-.624l3.52-22.316a.9.9 0 0 1 .889-.76h6.666c3.42 0 5.867.75 6.945 2.115 1.05 1.332 1.037 3.39.33 5.663z"
            />
          </svg>
        </span>
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">PayPal</span>
      </div>
    );
  }

  if (normalized.includes('wise')) {
    return (
      <div className="inline-flex items-center gap-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-md bg-[#163300] text-[#9FE870] font-black text-xs shadow-xs shrink-0">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 18l6-12h4l-3 6h6l-9 8h-4z" />
          </svg>
        </span>
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Wise</span>
      </div>
    );
  }

  if (normalized.includes('american') || normalized.includes('amex')) {
    return (
      <div className="inline-flex items-center gap-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-md bg-[#002663] text-white font-black text-[8px] tracking-tighter shadow-xs shrink-0">
          AMEX
        </span>
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">American E.</span>
      </div>
    );
  }

  if (normalized.includes('ssl') || normalized.includes('commerz')) {
    return (
      <div className="inline-flex items-center gap-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-md bg-[#006A4E] text-[#F42A41] font-bold text-[9px] shadow-xs shrink-0">
          SSL
        </span>
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">SSLCommerz</span>
      </div>
    );
  }

  // Default: Stripe
  return (
    <div className="inline-flex items-center gap-2">
      <span className="flex items-center justify-center w-6 h-6 rounded-md bg-[#635BFF] text-white font-black text-xs shadow-xs shrink-0">
        S
      </span>
      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Stripe</span>
    </div>
  );
}
