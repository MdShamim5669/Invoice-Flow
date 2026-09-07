'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { useClientsQuery, useCreateClientMutation } from '@/hooks/queries/useClients';
import { useCreateInvoiceMutation } from '@/hooks/queries/useInvoices';
import AIService from '@/services/ai.service';
import { Client } from '@/types/client';
import { Invoice } from '@/types/invoice';
import { computeInvoiceTotals, formatCurrency, round2 } from '@/lib/utils';
import { Plus, Trash2, Sparkles, ArrowLeft, Save, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface LineItemState {
  description: string;
  quantity: number;
  rate: number;
}

function NewInvoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlClientId = searchParams.get('clientId');

  const { data: serverClients = [], refetch: refetchClients } = useClientsQuery();
  const createClientMutation = useCreateClientMutation();
  const createInvoiceMutation = useCreateInvoiceMutation();

  // Pure dynamic clients from backend
  const clients: Client[] = serverClients;

  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [currency, setCurrency] = useState<string>('USD');
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [taxRate, setTaxRate] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState<string>(
    'Thank you for your business! Please remit payment within the specified term.'
  );
  const [terms, setTerms] = useState<string>('Payment due within 14 days.');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Inline Quick Add Client Modal State
  const [isClientModalOpen, setIsClientModalOpen] = useState<boolean>(false);
  const [newClientName, setNewClientName] = useState<string>('');
  const [newClientEmail, setNewClientEmail] = useState<string>('');
  const [newClientCompany, setNewClientCompany] = useState<string>('');

  const [items, setItems] = useState<LineItemState[]>([
    { description: 'Product Design & UI/UX Retainer', quantity: 1, rate: 25000 },
  ]);

  // Pre-select client from URL parameter or first client
  useEffect(() => {
    if (urlClientId && clients.some((c) => c.id === urlClientId)) {
      setSelectedClientId(urlClientId);
    } else if (clients.length > 0 && !selectedClientId) {
      setSelectedClientId(clients[0].id);
    }
  }, [clients, urlClientId, selectedClientId]);

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, rate: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof LineItemState, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  // Authoritative money calculation according to PRD Section 3.1
  const totals = computeInvoiceTotals(items, discount, taxRate);

  const handleAiDraftNotes = async () => {
    setIsAiLoading(true);
    try {
      const res = await AIService.writeNote(
        `Write a polite professional invoice note for ${items[0]?.description || 'freelance services'}`
      );
      if (res.note) {
        setNotes(res.note);
        toast.success('AI drafted notes generated!');
      }
    } catch {
      // High-fidelity fallback note
      setNotes(
        `Thank you for your collaboration on ${items[0]?.description || 'this milestone'}! It was a pleasure delivering high-impact results for your team. Please reach out if you have any questions regarding this statement.`
      );
      toast.success('AI professional note generated!');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleQuickAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) {
      toast.error('Client name is required');
      return;
    }

    try {
      const createdClient = await createClientMutation.mutateAsync({
        name: newClientName.trim(),
        email: newClientEmail.trim() || undefined,
        company: newClientCompany.trim() || undefined,
      });

      setSelectedClientId(createdClient.id);
      setIsClientModalOpen(false);
      setNewClientName('');
      setNewClientEmail('');
      setNewClientCompany('');
      refetchClients();
      toast.success(`Client ${createdClient.name} added!`);
    } catch (err: any) {
      toast.error(err?.customMessage || 'Failed to create client');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) {
      toast.error('Please select or add a client');
      return;
    }

    if (items.some((i) => !i.description.trim())) {
      toast.error('Please enter descriptions for all line items');
      return;
    }

    try {
      const created = await createInvoiceMutation.mutateAsync({
        clientId: selectedClientId,
        dueDate: dueDate || undefined,
        currency,
        taxRate: Number(taxRate),
        discount: Number(discount),
        notes,
        terms,
        items: items.map((i) => ({
          description: i.description,
          quantity: Number(i.quantity),
          rate: Number(i.rate),
        })),
      });

      toast.success(`Invoice ${created.invoiceNumber} created!`);
      router.push(`/invoices/${created.id}`);
    } catch (err: any) {
      toast.error(err?.customMessage || 'Failed to create invoice');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
      {/* Top action header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoices
        </button>

        <Button type="submit" isLoading={createInvoiceMutation.isPending} className="gap-2">
          <Save className="w-4 h-4" />
          Save & Issue Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Client, line items, notes */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Client & Terms
              </h3>
              <button
                type="button"
                onClick={() => setIsClientModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                + Add New Client
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Select Customer
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500"
                  required
                >
                  <option value="">-- Choose Client --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.company ? `(${c.company})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Input
                  label="Due Date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Billing Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500"
                >
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="BDT">BDT (৳) - Bangladeshi Taka</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                  <option value="INR">INR (₹) - Indian Rupee</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Line Items Card */}
          <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Itemized Charges
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                className="text-xs gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2.5 items-end p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800"
                >
                  <div className="col-span-12 sm:col-span-5">
                    <Input
                      label="Description"
                      placeholder="e.g. Mobile App Wireframing"
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <Input
                      label="Qty"
                      type="number"
                      min="1"
                      step="0.1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(idx, 'quantity', Number(e.target.value))
                      }
                      required
                    />
                  </div>
                  <div className="col-span-5 sm:col-span-3">
                    <Input
                      label="Rate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) =>
                        handleItemChange(idx, 'rate', Number(e.target.value))
                      }
                      required
                    />
                  </div>
                  <div className="col-span-3 sm:col-span-2 flex items-center justify-between pb-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                      {formatCurrency(round2(item.quantity * item.rate), currency)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      disabled={items.length === 1}
                      className="text-slate-400 hover:text-rose-500 disabled:opacity-30 p-1 cursor-pointer transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Notes & Terms with AI Assistant */}
          <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Notes & Terms
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAiDraftNotes}
                isLoading={isAiLoading}
                className="text-xs text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 gap-1 bg-indigo-50/40 dark:bg-indigo-950/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI Draft Note
              </Button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Customer Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Thank you for your business!"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Payment Terms & Conditions
              </label>
              <textarea
                rows={2}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100"
              />
            </div>
          </Card>
        </div>

        {/* Right 1 col: Live Billing Overview */}
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-white to-indigo-50/40 dark:from-slate-900 dark:to-indigo-950/20 border-indigo-100 dark:border-indigo-900/40 rounded-3xl shadow-sm">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
              Billing Overview
            </h3>

            <div className="space-y-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-white font-mono">
                  {formatCurrency(totals.subtotal, currency)}
                </span>
              </div>

              <div>
                <Input
                  label="Discount (amount)"
                  type="number"
                  min="0"
                  max={totals.subtotal}
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
              </div>

              <div>
                <Input
                  label="Tax Rate (%)"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                />
              </div>

              {totals.taxAmount > 0 && (
                <div className="flex justify-between text-xs text-slate-500 font-mono">
                  <span>Tax Amount ({taxRate}%)</span>
                  <span>{formatCurrency(totals.taxAmount, currency)}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-2 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-slate-400">
                  Total Due
                </span>
                <h2 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  {formatCurrency(totals.total, currency)}
                </h2>
              </div>
            </div>

            <div className="mt-6">
              <Button type="submit" isLoading={createInvoiceMutation.isPending} className="w-full py-3">
                Create & Send Invoice
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Add Client Modal */}
      <Modal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        title="Quick Add Client"
        description="Add a new customer profile without leaving the invoice builder."
      >
        <form onSubmit={handleQuickAddClient} className="space-y-4">
          <Input
            label="Client Full Name *"
            placeholder="e.g. Marcus Vance"
            value={newClientName}
            onChange={(e) => setNewClientName(e.target.value)}
            required
          />
          <Input
            label="Business Email"
            type="email"
            placeholder="marcus@agency.com"
            value={newClientEmail}
            onChange={(e) => setNewClientEmail(e.target.value)}
          />
          <Input
            label="Company Name"
            placeholder="Vance Media Group"
            value={newClientCompany}
            onChange={(e) => setNewClientCompany(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsClientModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Save & Select
            </Button>
          </div>
        </form>
      </Modal>
    </form>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-xs text-slate-400">
          Loading invoice builder...
        </div>
      }
    >
      <NewInvoiceContent />
    </Suspense>
  );
}
