'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useInvoicesQuery } from '@/hooks/queries/useInvoices';
import { useExpensesQuery } from '@/hooks/queries/useExpenses';
import { formatCurrency } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Download,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ReportsPage() {
  const { data: invoicesData, refetch: refetchInvoices, isLoading: isLoadingInvoices } = useInvoicesQuery();
  const { data: expensesData, refetch: refetchExpenses, isLoading: isLoadingExpenses } = useExpensesQuery();

  // Purely dynamic records from backend
  const invoices = invoicesData?.invoices || [];
  const expenses = expensesData || [];

  const [timeRange, setTimeRange] = useState<'6m' | '12m'>('6m');

  // Compute Revenue vs Expenses aggregated data dynamically
  const totalRevenue = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + Number(inv.total || 0), 0);

  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin =
    totalRevenue > 0
      ? Math.round((netProfit / totalRevenue) * 100)
      : 0;

  // Monthly breakdown data for Recharts calculated dynamically from backend data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthIdx = new Date().getMonth();

  const dynamicMonthlyData = Array.from({ length: timeRange === '6m' ? 6 : 12 }, (_, i) => {
    const idx = (currentMonthIdx - (timeRange === '6m' ? 5 - i : 11 - i) + 12) % 12;
    const monthName = months[idx];

    // Filter invoices and expenses matching this month
    const rev = invoices
      .filter((inv) => {
        const d = new Date(inv.issueDate);
        return d.getMonth() === idx && inv.status === 'paid';
      })
      .reduce((sum, inv) => sum + Number(inv.total || 0), 0);

    const exp = expenses
      .filter((item) => {
        const d = new Date(item.expenseDate);
        return d.getMonth() === idx;
      })
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    return {
      month: monthName,
      revenue: rev,
      expenses: exp,
      profit: rev - exp,
    };
  });

  // CSV Export functionality
  const handleExportCSV = () => {
    try {
      if (invoices.length === 0) {
        toast.info('No invoice records to export');
        return;
      }

      const headers = 'Invoice Number,Client,Status,Due Date,Total Amount,Currency\n';
      const rows = invoices
        .map(
          (inv) =>
            `"${inv.invoiceNumber}","${inv.client?.name || 'Customer'}","${inv.status}","${inv.dueDate || ''}",${inv.total},"${inv.currency}"`
        )
        .join('\n');

      const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `invoiceflow_financial_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Financial report exported as CSV successfully!');
    } catch {
      toast.error('Failed to export CSV report');
    }
  };

  const handleRefresh = () => {
    refetchInvoices();
    refetchExpenses();
    toast.info('Refreshed reports data from backend');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white font-sans">
            Reports & Insights
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Real-time cashflow, revenue vs expenses, and profit margin analysis.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh reports"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                isLoadingInvoices || isLoadingExpenses ? 'animate-spin' : ''
              }`}
            />
          </button>
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2 shadow-xs">
            <Download className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block">Total Revenue Collected</span>
          <h2 className="text-2xl sm:text-3xl font-black mt-2 text-slate-900 dark:text-white font-mono">
            {formatCurrency(totalRevenue, 'USD')}
          </h2>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Direct from backend invoices</span>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block">Total Expenses Logged</span>
          <h2 className="text-2xl sm:text-3xl font-black mt-2 text-rose-600 dark:text-rose-400 font-mono">
            {formatCurrency(totalExpenses, 'USD')}
          </h2>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>{expenses.length} expenses logged</span>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block">Net Profit</span>
          <h2 className="text-2xl sm:text-3xl font-black mt-2 text-indigo-600 dark:text-indigo-400 font-mono">
            {formatCurrency(netProfit, 'USD')}
          </h2>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Net calculated balance</span>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block">Net Profit Margin</span>
          <h2 className="text-2xl sm:text-3xl font-black mt-2 text-emerald-600 dark:text-emerald-400 font-mono">
            {profitMargin}%
          </h2>
          <div className="mt-2 text-xs text-slate-400 font-medium">
            <span>Margin percentage</span>
          </div>
        </Card>
      </div>

      {/* Recharts: Revenue vs Expenses Monthly Chart */}
      <Card className="p-6 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Revenue vs Expenses Trend
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Monthly cashflow comparison computed from backend billing records.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-full text-xs font-semibold">
            {(['6m', '12m'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-full uppercase transition-all cursor-pointer ${
                  timeRange === range
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dynamicMonthlyData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#94A3B8', fontSize: 12 }}
                tickFormatter={(val) => `$${val / 1000}k`}
              />
              <Tooltip
                formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#1E293B',
                  borderRadius: '16px',
                  color: '#FFFFFF',
                  fontSize: '12px',
                }}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '20px' }} />
              <Bar dataKey="revenue" name="Revenue" fill="#6366F1" radius={[8, 8, 0, 0]} barSize={24} />
              <Bar dataKey="expenses" name="Expenses" fill="#F43F5E" radius={[8, 8, 0, 0]} barSize={24} />
              <Bar dataKey="profit" name="Net Profit" fill="#10B981" radius={[8, 8, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
