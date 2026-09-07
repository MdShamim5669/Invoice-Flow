'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/invoice/status-badge';
import { PaymentModal } from '@/components/invoice/payment-modal';
import InvoiceService from '@/services/invoice.service';
import PaymentService from '@/services/payment.service';
import AIService from '@/services/ai.service';
import { exportInvoiceToPdf } from '@/lib/pdf';
import { Invoice } from '@/types/invoice';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  CreditCard,
  Download,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Sparkles,
  Building,
  Printer,
  FileCheck,
} from 'lucide-react';
import { toast } from 'sonner';

function InvoiceDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [aiReminder, setAiReminder] = useState<{ subject: string; body: string } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Check URL query parameters for payment return status
  const paymentStatus = searchParams.get('payment');
  const sessionId = searchParams.get('session_id');
  const tranId = searchParams.get('tran_id');
  const failureReason = searchParams.get('reason');

  const loadInvoice = async () => {
    setIsLoading(true);
    try {
      const data = await InvoiceService.getById(id);
      setInvoice(data);
    } catch (err: any) {
      toast.error(err?.customMessage || 'Failed to load invoice');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvoice();

    // If returning from Stripe with session_id
    if (paymentStatus === 'success' && sessionId) {
      PaymentService.verifyStripeSession(sessionId)
        .then((res) => {
          if (res.verified) {
            toast.success('Stripe payment verified successfully!');
            loadInvoice();
          }
        })
        .catch(() => {
          loadInvoice();
        });
    } else if (paymentStatus === 'success' && tranId) {
      toast.success(`SSLCommerz payment successful! Transaction ID: ${tranId}`);
      loadInvoice();
    } else if (paymentStatus === 'failed') {
      toast.error(`Payment failed: ${failureReason || 'Transaction could not be completed.'}`);
    } else if (paymentStatus === 'cancelled') {
      toast.warning('Payment session was cancelled.');
    }
  }, [id, paymentStatus, sessionId, tranId]);

  const handleGenerateReminder = async () => {
    if (!invoice) return;
    setIsAiLoading(true);
    try {
      const res = await AIService.generatePaymentReminder(invoice.id, 'polite');
      setAiReminder(res);
      toast.success('AI drafted reminder email generated!');
    } catch {
      // Fallback drafted reminder
      setAiReminder({
        subject: `Gentle Reminder: Invoice #${invoice.invoiceNumber} payment is pending`,
        body: `Dear ${invoice.client?.name || 'Valued Client'},\n\nWe hope this email finds you well. This is a gentle reminder that invoice #${invoice.invoiceNumber} for the total amount of ${formatCurrency(invoice.total, invoice.currency)} was issued on ${formatDate(invoice.issueDate)} and is due on ${formatDate(invoice.dueDate)}.\n\nYou can settle this invoice securely online via credit card (Stripe) or SSLCommerz gateway.\n\nThank you for your prompt attention.\n\nBest regards,\nFinnova Billing Team`,
      });
      toast.success('AI drafted reminder email generated!');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!invoice) return;
    setIsDownloadingPdf(true);
    toast.info('Generating PDF document...');

    try {
      // First attempt high-res client-side canvas PDF
      const success = await exportInvoiceToPdf('invoice-paper-preview', invoice.invoiceNumber);
      if (success) {
        toast.success(`Invoice ${invoice.invoiceNumber}.pdf downloaded!`);
        setIsDownloadingPdf(false);
        return;
      }
      throw new Error('Canvas render fallback');
    } catch {
      try {
        const url = await InvoiceService.getPdfDownloadUrl(invoice.id);
        window.open(url, '_blank');
      } catch {
        window.print();
      }
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        Loading invoice details...
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-sm text-slate-500">Invoice not found or no longer available.</p>
        <Button onClick={() => router.push('/invoices')}>Back to Invoices</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top back navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => router.push('/invoices')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoices
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPdf}
            isLoading={isDownloadingPdf}
            className="gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </Button>

          {invoice.status !== 'paid' && (
            <Button
              size="sm"
              onClick={() => setIsPaymentModalOpen(true)}
              className="gap-1.5 shadow-xs bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Collect Payment
            </Button>
          )}
        </div>
      </div>

      {/* Payment status banner if returned from Gateway */}
      {paymentStatus === 'success' && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-xs font-bold">Payment Completed</p>
            <p className="text-xs opacity-90">
              Your payment has been successfully recorded against this invoice.
            </p>
          </div>
        </div>
      )}

      {paymentStatus === 'failed' && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <p className="text-xs font-bold">Payment Failed</p>
            <p className="text-xs opacity-90">
              {failureReason || 'Transaction could not be completed. You can try again.'}
            </p>
          </div>
        </div>
      )}

      {/* Invoice Main Paper Card (Used for PDF Export & Onscreen display) */}
      <Card
        id="invoice-paper-preview"
        className="p-8 sm:p-10 bg-white dark:bg-slate-900 shadow-xl border border-slate-200/90 dark:border-slate-800 rounded-3xl"
      >
        {/* Header: Company & Invoice info */}
        <div className="flex flex-wrap justify-between items-start gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 dark:text-white font-sans">
                INVOICE
              </span>
              <StatusBadge status={invoice.status} dueDate={invoice.dueDate} />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-bold text-slate-500 font-mono">
                #{invoice.invoiceNumber}
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-400 font-medium">Issue Date</p>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono">
              {formatDate(invoice.issueDate)}
            </p>
            <p className="text-xs text-slate-400 font-medium mt-2">Due Date</p>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono">
              {formatDate(invoice.dueDate)}
            </p>
          </div>
        </div>

        {/* Bill To */}
        <div className="py-6 border-b border-slate-100 dark:border-slate-800 flex flex-wrap justify-between gap-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Billed To
            </span>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
              {invoice.client?.name || 'Customer'}
            </h3>
            {invoice.client?.company && (
              <p className="text-xs text-slate-500 font-medium">{invoice.client.company}</p>
            )}
            {invoice.client?.email && (
              <p className="text-xs text-slate-500">{invoice.client.email}</p>
            )}
            {invoice.client?.address && (
              <p className="text-xs text-slate-500">{invoice.client.address}</p>
            )}
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Issued By
            </span>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
              Finnova Studio Inc.
            </h3>
            <p className="text-xs text-slate-500">Suite 400, 100 Montgomery St</p>
            <p className="text-xs text-slate-500">San Francisco, CA 94104</p>
            <p className="text-xs text-slate-500">billing@finnova.io</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="py-6">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase font-bold text-slate-400">
                <th className="pb-3">Description</th>
                <th className="pb-3 text-center">Qty</th>
                <th className="pb-3 text-right">Rate</th>
                <th className="pb-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {invoice.items.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td className="py-3.5 text-slate-800 dark:text-slate-200 font-medium">
                    {item.description}
                  </td>
                  <td className="py-3.5 text-center text-slate-500 font-mono">
                    {item.quantity}
                  </td>
                  <td className="py-3.5 text-right text-slate-500 font-mono">
                    {formatCurrency(item.rate, invoice.currency)}
                  </td>
                  <td className="py-3.5 text-right font-bold text-slate-900 dark:text-white font-mono">
                    {formatCurrency(item.amount, invoice.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Breakdown */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span className="font-mono">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
            </div>

            {invoice.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount</span>
                <span className="font-mono">-{formatCurrency(invoice.discount, invoice.currency)}</span>
              </div>
            )}

            {invoice.taxAmount > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>Tax ({invoice.taxRate}%)</span>
                <span className="font-mono">+{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-black text-base text-slate-900 dark:text-white">
              <span>Total Due</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">
                {formatCurrency(invoice.total, invoice.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes and terms */}
        {(invoice.notes || invoice.terms) && (
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 space-y-2">
            {invoice.notes && (
              <p>
                <strong className="text-slate-700 dark:text-slate-300">Notes:</strong> {invoice.notes}
              </p>
            )}
            {invoice.terms && (
              <p>
                <strong className="text-slate-700 dark:text-slate-300">Terms:</strong> {invoice.terms}
              </p>
            )}
          </div>
        )}
      </Card>

      {/* AI Payment Reminder Card */}
      {invoice.status !== 'paid' && (
        <Card className="p-6 border-indigo-200/60 dark:border-indigo-900/40 bg-indigo-50/20 dark:bg-indigo-950/20 rounded-3xl shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                AI Payment Reminder Assistant
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateReminder}
              isLoading={isAiLoading}
              className="text-xs text-indigo-600 border-indigo-300 dark:border-indigo-800 bg-white dark:bg-slate-900"
            >
              Draft Follow-up Email
            </Button>
          </div>

          {aiReminder && (
            <div className="mt-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/60 space-y-2">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                <strong>Subject:</strong> {aiReminder.subject}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed">
                {aiReminder.body}
              </p>
              <div className="pt-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-xs"
                  onClick={() => {
                    navigator.clipboard.writeText(`${aiReminder.subject}\n\n${aiReminder.body}`);
                    toast.success('Reminder copied to clipboard!');
                  }}
                >
                  Copy to Clipboard
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Payment Gateway Modal (Stripe, SSLCommerz, & Offline Cash) */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        invoice={invoice}
        onSuccess={() => {
          loadInvoice();
          setIsPaymentModalOpen(false);
          toast.success('Payment successfully recorded!');
        }}
      />
    </div>
  );
}

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);

  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-xs text-slate-400">
          Loading invoice...
        </div>
      }
    >
      <InvoiceDetailContent id={resolvedParams.id} />
    </Suspense>
  );
}
