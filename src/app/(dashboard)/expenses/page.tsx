'use client';

import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import {
  useExpensesQuery,
  useExpenseSummaryQuery,
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
} from '@/hooks/queries/useExpenses';
import AIService from '@/services/ai.service';
import { Expense, CreateExpenseInput } from '@/types/expense';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Trash2, Sparkles, Upload, Receipt, RefreshCw, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function ExpensesPage() {
  const { data: expensesData, refetch, isLoading, isRefetching } = useExpensesQuery();
  const { data: summary } = useExpenseSummaryQuery();
  const createExpenseMutation = useCreateExpenseMutation();
  const deleteExpenseMutation = useDeleteExpenseMutation();

  // Dynamic expenses purely from backend
  const expenses: Expense[] = expensesData || [];

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isAiScanning, setIsAiScanning] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CreateExpenseInput>({
    vendor: '',
    category: 'Software & Tools',
    amount: 0,
    currency: 'USD',
    expenseDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vendor || !formData.amount) {
      toast.error('Please specify vendor and amount');
      return;
    }

    try {
      await createExpenseMutation.mutateAsync({
        ...formData,
        amount: Number(formData.amount),
      });
      toast.success('Expense recorded successfully');
      setIsModalOpen(false);
      setFormData({
        vendor: '',
        category: 'Software & Tools',
        amount: 0,
        currency: 'USD',
        expenseDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
      refetch();
    } catch (err: any) {
      toast.error(err?.customMessage || 'Failed to record expense');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      await deleteExpenseMutation.mutateAsync(id);
      toast.success('Expense deleted');
      refetch();
    } catch (err: any) {
      toast.error(err?.customMessage || 'Failed to delete expense');
    }
  };

  // AI Receipt Scanner / Parser (PRD Section 4.3 & 8)
  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAiScanning(true);
    toast.info('Scanning receipt with Gemini AI vision...');

    try {
      const parsed = await AIService.parseReceipt(file);
      setFormData({
        vendor: parsed.vendor || file.name.replace(/\.[^/.]+$/, ''),
        category: parsed.category || 'Software & Tools',
        amount: Number(parsed.amount) || 0,
        currency: 'USD',
        expenseDate: parsed.date || new Date().toISOString().split('T')[0],
        notes: `AI auto-scanned from ${file.name}`,
      });
      toast.success('Receipt parsed! Review and save details.');
      setIsModalOpen(true);
    } catch (err: any) {
      toast.error(err?.customMessage || 'Could not parse receipt automatically');
      setFormData({
        vendor: file.name.replace(/\.[^/.]+$/, ''),
        category: 'Other',
        amount: 0,
        currency: 'USD',
        expenseDate: new Date().toISOString().split('T')[0],
        notes: `Scanned file: ${file.name}`,
      });
      setIsModalOpen(true);
    } finally {
      setIsAiScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const totalSpent = summary?.totalExpenses ?? expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white font-sans">
              Business Expenses
            </h1>
            <button
              onClick={() => refetch()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              title="Refresh from backend"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading || isRefetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Log vendor subscriptions and scan receipts with Gemini AI vision.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* AI Scan Receipt Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleReceiptUpload}
            accept="image/*,application/pdf"
            className="hidden"
          />

          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            isLoading={isAiScanning}
            className="gap-2 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            AI Scan Receipt
          </Button>

          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Log Expense
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Total Spent (This Month)</span>
          <h2 className="text-2xl sm:text-3xl font-black mt-2 text-rose-600 dark:text-rose-400 font-mono">
            {formatCurrency(totalSpent, 'USD')}
          </h2>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {expenses.length} expense items recorded
          </span>
        </Card>

        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Top Category</span>
          <h2 className="text-xl sm:text-2xl font-black mt-2 text-slate-900 dark:text-white">
            {summary?.byCategory
              ? Object.keys(summary.byCategory)[0] || 'Software & Tools'
              : (expenses.length > 0 ? expenses[0].category : 'No records')}
          </h2>
          <span className="text-[11px] text-slate-400 mt-1 block">Recurring cloud stack</span>
        </Card>

        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Tax Deductible</span>
          <h2 className="text-2xl sm:text-3xl font-black mt-2 text-emerald-600 dark:text-emerald-400 font-mono">
            100%
          </h2>
          <span className="text-[11px] text-slate-400 mt-1 block">Eligible business deductions</span>
        </Card>
      </div>

      {/* Expenses Table */}
      <Card className="overflow-hidden border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase font-bold text-slate-400">
              <tr>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Vendor / Service</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Notes / Project</th>
                <th className="py-4 px-6 text-right">Amount</th>
                <th className="py-4 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="py-4 px-6">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
                        <Receipt className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        No expenses logged yet
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Record vendor charges or scan receipts with Gemini AI vision to track your outlays.
                      </p>
                      <Button onClick={() => setIsModalOpen(true)} className="gap-2 text-xs">
                        <Plus className="w-3.5 h-3.5" />
                        Log Expense
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr
                    key={exp.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-4 px-6 text-xs text-slate-500 font-mono">
                      {formatDate(exp.expenseDate)}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                      {exp.vendor}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500 truncate max-w-xs">
                      {exp.notes || '—'}
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-slate-900 dark:text-white font-mono">
                      {formatCurrency(exp.amount, exp.currency)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        title="Delete expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Log Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record New Expense"
        description="Log vendor, software subscription, or business expenditure."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Vendor / Payee *"
            placeholder="e.g. AWS, Figma, Zoom"
            value={formData.vendor}
            onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500"
              >
                <option value="Software & Tools">Software & Tools</option>
                <option value="Hosting & Servers">Hosting & Servers</option>
                <option value="AI & Services">AI & Services</option>
                <option value="Office & Workspace">Office & Workspace</option>
                <option value="Marketing & Ads">Marketing & Ads</option>
                <option value="Legal & Accounting">Legal & Accounting</option>
                <option value="Hardware">Hardware</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <Input
              label="Amount *"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={formData.amount || ''}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500"
              >
                <option value="USD">USD ($)</option>
                <option value="BDT">BDT (৳)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            <Input
              label="Date"
              type="date"
              value={formData.expenseDate}
              onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Notes / Memo
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Monthly cloud hosting for client project"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={createExpenseMutation.isPending}>
              Save Expense
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
