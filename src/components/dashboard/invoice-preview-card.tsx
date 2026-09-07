'use client';

import React from 'react';
import Link from 'next/link';
import { Invoice } from '@/types/invoice';
import { formatCurrency } from '@/lib/utils';
import { ClientAvatar } from '@/components/invoice/client-avatar';
import { ArrowUpRight, Plus, Link as LinkIcon, Calendar, FileText, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface InvoicePreviewCardProps {
  invoice: Invoice | null;
  companyName?: string;
  onOpenPayment: (invoice: Invoice) => void;
  onAddItem?: () => void;
}

export const InvoicePreviewCard: React.FC<InvoicePreviewCardProps> = ({
  invoice,
  companyName = 'Finnova Studio',
  onOpenPayment,
  onAddItem,
}) => {
  if (!invoice) {
    return (
      <div className="relative overflow-hidden rounded-[26px] bg-[#121629]/75 dark:bg-slate-900/50 backdrop-blur-2xl border border-slate-700/60 dark:border-white/[0.08] shadow-2xl p-6 text-center flex flex-col items-center justify-center min-h-[260px] space-y-3.5 transition-all">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-inner">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">No Invoice Selected</h3>
          <p className="text-xs text-slate-400 max-w-[210px] mx-auto mt-1 leading-relaxed">
            Select an invoice from the list or draft a new invoice to preview details.
          </p>
        </div>
        <Link
          href="/invoices/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/30 transition-all hover:scale-102 cursor-pointer mt-1"
        >
          <Plus className="w-3.5 h-3.5" />
          Create an invoice
        </Link>
      </div>
    );
  }

  const invNumber = invoice.invoiceNumber;
  const currency = invoice.currency || 'USD';
  const clientName = invoice.client?.name || 'Customer';
  const clientCompany = invoice.client?.company || 'Client Account';
  const items = invoice.items || [];
  const subTotal = invoice.subtotal;
  const total = invoice.total;
  const balanceDue = invoice.status === 'paid' ? 0 : invoice.total;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/invoices/${invoice.id}`;
      navigator.clipboard.writeText(url);
      toast.success('Invoice link copied to clipboard!');
    }
  };

  const handleShowCalendar = () => {
    toast.info(
      `Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()} | Due: ${
        invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'Immediate'
      }`
    );
  };

  return (
    <div className="relative overflow-hidden rounded-[26px] bg-[#121629]/85 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-700/60 dark:border-white/[0.08] shadow-2xl p-5 sm:p-6 text-white flex flex-col justify-between transition-all space-y-4">
      {/* Ambient Glows */}
      <div className="absolute -top-16 -right-16 w-44 h-44 bg-indigo-500/15 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Header: Invoice Number + Status + Customer */}
      <div className="space-y-3 pb-4 border-b border-white/[0.08] relative z-10">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Invoice
            </span>
            <h2 className="text-base sm:text-lg font-black tracking-tight font-mono text-white mt-0.5">
              # {invNumber}
            </h2>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/15 uppercase tracking-wide">
            {invoice.status === 'sent' ? 'Unsent' : invoice.status}
          </span>
        </div>

        {/* Client details badge */}
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <ClientAvatar name={clientName} size="sm" />
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold block truncate text-white">
              {clientName}
            </span>
            <span className="text-[10px] text-slate-400 block truncate">
              {clientCompany}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Items List / Mini-Grid */}
      <div className="space-y-2 relative z-10">
        <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-slate-400">
          <span>Items ({items.length})</span>
          <button
            type="button"
            onClick={onAddItem}
            className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            Add item
          </button>
        </div>

        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {items.map((item, idx) => (
            <div
              key={item.id || idx}
              className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] transition-colors text-xs"
            >
              <div className="min-w-0 pr-2">
                <p className="font-semibold text-slate-200 truncate text-[11px]">
                  {item.description}
                </p>
                {item.quantity > 1 && (
                  <p className="text-[9px] text-slate-400">Qty: {item.quantity}</p>
                )}
              </div>
              <span className="font-bold font-mono text-white text-[11px] shrink-0">
                {formatCurrency(item.amount, currency)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Totals Breakdown & Action Buttons */}
      <div className="pt-3 border-t border-white/[0.08] space-y-3 relative z-10">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">Subtotal</span>
          <span className="font-mono font-bold text-slate-200 text-xs">
            {formatCurrency(subTotal, currency)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-bold text-xs">Balance Due</span>
          <span className="font-mono font-black text-sm text-indigo-300">
            {formatCurrency(balanceDue, currency)}
          </span>
        </div>

        {/* Action Row */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            title="Copy Public Link"
            onClick={handleCopyLink}
            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            title="View Dates"
            onClick={handleShowCalendar}
            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onOpenPayment(invoice)}
            className="flex-1 py-2 px-3 rounded-full text-xs font-bold bg-white text-slate-950 hover:bg-slate-100 transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-center"
          >
            Payout now
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreviewCard;
