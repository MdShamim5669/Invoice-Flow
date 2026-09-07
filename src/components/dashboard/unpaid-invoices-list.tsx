'use client';

import React from 'react';
import { Invoice } from '@/types/invoice';
import { formatCurrency, cn } from '@/lib/utils';
import { ClientAvatar } from '@/components/invoice/client-avatar';
import { FileText, Clock } from 'lucide-react';

interface UnpaidInvoicesListProps {
  invoices: Invoice[];
  selectedId: string | null;
  onSelect: (invoice: Invoice) => void;
  isLoading?: boolean;
}

export const UnpaidInvoicesList: React.FC<UnpaidInvoicesListProps> = ({
  invoices,
  selectedId,
  onSelect,
  isLoading = false,
}) => {
  // Helper to compute human-friendly due time
  const getDueText = (dueDateStr?: string | null, status?: string) => {
    if (status === 'paid') return 'Paid';
    if (!dueDateStr) return 'No due date';
    const now = new Date();
    const due = new Date(dueDateStr);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)}d`;
    if (diffDays === 0) return 'Due today';
    return `In ${diffDays} day${diffDays === 1 ? '' : 's'}`;
  };

  // Helper to format status pill
  const getStatusLabel = (status?: string) => {
    if (!status) return 'Draft';
    if (status === 'sent') return 'Unsent';
    if (status === 'viewed') return 'Viewed';
    if (status === 'pending') return 'Pending';
    if (status === 'paid') return 'Paid';
    if (status === 'overdue') return 'Overdue';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (isLoading) {
    return (
      <div className="space-y-2.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between px-4 py-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/40 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-800 shrink-0" />
              <div className="space-y-1.5">
                <div className="w-20 h-3.5 bg-slate-800 rounded" />
                <div className="w-14 h-2.5 bg-slate-800/70 rounded" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-14 h-6 bg-slate-800 rounded-full" />
              <div className="w-16 h-4 bg-slate-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="py-12 px-4 text-center rounded-2xl bg-[#12172A]/50 border border-slate-800/50 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-300">No invoices found</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Try adjusting your search or filters to see invoices.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
      {invoices.map((inv, idx) => {
        const isSelected = selectedId === inv.id || (idx === 0 && !selectedId);
        const clientName = inv.client?.name || 'Customer';
        const dueText = getDueText(inv.dueDate, inv.status);
        const statusLabel = getStatusLabel(inv.status);

        return (
          <div
            key={inv.id}
            onClick={() => onSelect(inv)}
            className={cn(
              'group flex items-center justify-between px-4 py-3.5 rounded-2xl cursor-pointer transition-all duration-200',
              isSelected
                ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-950/60 scale-[1.01]'
                : 'bg-[#14192D]/70 hover:bg-[#1A223E] text-slate-200 border border-slate-800/60'
            )}
          >
            {/* Avatar + Number + Due Date */}
            <div className="flex items-center gap-3 min-w-0">
              <ClientAvatar name={clientName} size="md" />

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold tracking-tight truncate">
                    # {inv.invoiceNumber}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={cn(
                      'text-[11px] font-medium truncate',
                      isSelected ? 'text-indigo-100' : 'text-slate-400'
                    )}
                  >
                    {dueText}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Pill + Total Amount */}
            <div className="flex items-center gap-3 shrink-0">
              <span
                className={cn(
                  'text-[11px] font-semibold px-2.5 py-0.5 rounded-full',
                  isSelected
                    ? 'bg-white text-indigo-950 shadow-xs font-bold'
                    : 'bg-slate-800/80 text-slate-400 border border-slate-700/60'
                )}
              >
                {statusLabel}
              </span>

              <span
                className={cn(
                  'text-xs font-black tracking-tight font-sans whitespace-nowrap min-w-[75px] text-right',
                  isSelected ? 'text-white' : 'text-slate-200'
                )}
              >
                {formatCurrency(inv.total, inv.currency)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
