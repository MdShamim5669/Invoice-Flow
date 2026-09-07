'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { OverdueCard } from '@/components/dashboard/overdue-card';
import { DueMonthCard } from '@/components/dashboard/due-month-card';
import { PaidTimeCard } from '@/components/dashboard/paid-time-card';
import { InstantPayoutCard } from '@/components/dashboard/instant-payout-card';
import { UnpaidInvoicesList } from '@/components/dashboard/unpaid-invoices-list';
import { InvoicePreviewCard } from '@/components/dashboard/invoice-preview-card';
import { PaymentModal } from '@/components/invoice/payment-modal';
import { useDashboardQuery } from '@/hooks/queries/useDashboard';
import { useInvoicesQuery } from '@/hooks/queries/useInvoices';
import { useClientsQuery } from '@/hooks/queries/useClients';
import { useCompanySettingsQuery } from '@/hooks/queries/useCompany';
import { Invoice } from '@/types/invoice';
import { formatCurrency } from '@/lib/utils';
import {
  ArrowLeft,
  SlidersHorizontal,
  Plus,
  Search,
  Calendar,
  ChevronDown,
  LayoutGrid,
  MoreVertical,
  Check,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { StaggerContainer, StaggerItem, FadeIn } from '@/components/ui/motion-wrapper';

export default function DashboardPage() {
  const router = useRouter();
  const { data: stats, isLoading: statsLoading } = useDashboardQuery();
  const { data: invoicesData, isLoading: invoicesLoading, refetch: refetchInvoices } = useInvoicesQuery();
  const { data: clients = [] } = useClientsQuery();
  const { data: companySettings } = useCompanySettingsQuery();

  const invoices: Invoice[] = invoicesData?.invoices || [];
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'unpaid'>('unpaid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  // Dropdown open states
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const customerDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setCustomerDropdownOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setStatusDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync selected invoice with backend list
  useEffect(() => {
    if (invoices.length > 0) {
      // If none selected, or selected invoice is no longer in the list, select first
      if (!selectedInvoice || !invoices.find((i) => i.id === selectedInvoice.id)) {
        setSelectedInvoice(invoices[0]);
      }
    } else {
      setSelectedInvoice(null);
    }
  }, [invoices, selectedInvoice]);

  // Dynamic counts for tab pills
  const draftCount = useMemo(() => invoices.filter((inv) => inv.status === 'draft').length, [invoices]);
  const unpaidCount = useMemo(() => invoices.filter((inv) => inv.status !== 'paid').length, [invoices]);
  const allCount = invoices.length;

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCustomer !== 'all') count++;
    if (selectedStatus !== 'all') count++;
    if (searchQuery.trim().length > 0) count++;
    if (selectedMonth !== null) count++;
    return count;
  }, [selectedCustomer, selectedStatus, searchQuery, selectedMonth]);

  // Average time to get paid calculation
  const averageDaysToGetPaid = useMemo(() => {
    const paidInvoices = invoices.filter((inv) => inv.status === 'paid');
    if (paidInvoices.length === 0) return '16 days';
    const totalDays = paidInvoices.reduce((acc, inv) => {
      const created = new Date(inv.createdAt).getTime();
      const updated = new Date(inv.updatedAt || inv.issueDate).getTime();
      const diff = Math.max(1, Math.round((updated - created) / (1000 * 60 * 60 * 24)));
      return acc + diff;
    }, 0);
    const avg = Math.round(totalDays / paidInvoices.length);
    return `${avg} day${avg === 1 ? '' : 's'}`;
  }, [invoices]);

  // Top metric amounts from backend
  const overdueAmount = formatCurrency(stats?.totalOutstanding ?? 0, stats?.currency || 'USD');
  const dueNextMonthAmount = formatCurrency(stats?.totalInvoiced ?? 0, stats?.currency || 'USD');
  const instantPayoutAmount = formatCurrency(stats?.totalRevenue ?? 0, stats?.currency || 'USD');

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Search query filter
      const matchesSearch =
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.client?.name && inv.client.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (inv.client?.company && inv.client.company.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchesSearch) return false;

      // Tab filter
      if (activeTab === 'draft' && inv.status !== 'draft') return false;
      if (activeTab === 'unpaid' && inv.status === 'paid') return false;

      // Customer filter
      if (selectedCustomer !== 'all' && inv.client?.name !== selectedCustomer && inv.clientId !== selectedCustomer) {
        return false;
      }

      // Status dropdown filter
      if (selectedStatus !== 'all' && inv.status !== selectedStatus) {
        return false;
      }

      // Month filter
      if (selectedMonth) {
        const invDate = new Date(inv.issueDate || inv.createdAt);
        const invMonthStr = `${invDate.getFullYear()}-${String(invDate.getMonth() + 1).padStart(2, '0')}`;
        if (invMonthStr !== selectedMonth) return false;
      }

      return true;
    });
  }, [invoices, searchQuery, activeTab, selectedCustomer, selectedStatus, selectedMonth]);

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedCustomer('all');
    setSelectedStatus('all');
    setSearchQuery('');
    setSelectedMonth(null);
  };

  const statusOptions = [
    { label: 'All statuses', value: 'all' },
    { label: 'Draft', value: 'draft' },
    { label: 'Pending', value: 'pending' },
    { label: 'Sent', value: 'sent' },
    { label: 'Viewed', value: 'viewed' },
    { label: 'Paid', value: 'paid' },
    { label: 'Overdue', value: 'overdue' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Invoices Header (Dashboard One.jpg highlight) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {/* Back Arrow button */}
          <button
            type="button"
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white font-sans">
              Invoices
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Manage and track all your invoices in one place.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Filter/Sliders icon button */}
          <button
            type="button"
            title="Reset Filters"
            onClick={handleClearFilters}
            className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* "+ Create an invoice" purple button */}
          <Link
            href="/invoices/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/30 transition-all hover:scale-102 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create an invoice
          </Link>
        </div>
      </div>

      {/* 2. Top 4 Metric Cards Row (Dashboard One.jpg highlight) */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StaggerItem>
          <OverdueCard
            amount={overdueAmount}
            trend="12.5% from last month"
            isLoading={statsLoading}
          />
        </StaggerItem>
        <StaggerItem>
          <DueMonthCard
            amount={dueNextMonthAmount}
            trend="8.2% from last month"
            isLoading={statsLoading}
          />
        </StaggerItem>
        <StaggerItem>
          <PaidTimeCard
            days={averageDaysToGetPaid}
            trend="2 days from last month"
            isLoading={statsLoading}
          />
        </StaggerItem>
        <StaggerItem>
          <InstantPayoutCard
            availableAmount={instantPayoutAmount}
            isLoading={statsLoading}
            onPayout={(method) => {
              router.push(`/payments?method=${method}`);
            }}
          />
        </StaggerItem>
      </StaggerContainer>

      {/* 3. Filter Toolbar (Dashboard One.jpg highlight) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Active filters pill */}
          <button
            type="button"
            onClick={handleClearFilters}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-xs hover:scale-[1.02] active:scale-[0.98] ${
              activeFiltersCount > 0
                ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
                : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <span>Active filters</span>
            <span
              className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                activeFiltersCount > 0
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {activeFiltersCount}
            </span>
            {activeFiltersCount > 0 && <X className="w-3 h-3 ml-0.5 opacity-70 hover:opacity-100 text-indigo-600 dark:text-indigo-300" />}
          </button>

          {/* All customers dropdown */}
          <div className="relative" ref={customerDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setCustomerDropdownOpen(!customerDropdownOpen);
                setStatusDropdownOpen(false);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span className="max-w-[130px] truncate">
                {selectedCustomer === 'all' ? 'All customers' : selectedCustomer}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {customerDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-30 max-h-60 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCustomer('all');
                    setCustomerDropdownOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs flex items-center justify-between text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <span>All customers</span>
                  {selectedCustomer === 'all' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </button>
                {clients.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedCustomer(c.name);
                      setCustomerDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs flex items-center justify-between text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <span className="truncate">{c.name}</span>
                    {selectedCustomer === c.name && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* All statuses dropdown */}
          <div className="relative" ref={statusDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setStatusDropdownOpen(!statusDropdownOpen);
                setCustomerDropdownOpen(false);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span className="capitalize">
                {selectedStatus === 'all' ? 'All statuses' : selectedStatus}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {statusDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-44 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-30">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setSelectedStatus(opt.value);
                      setStatusDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs flex items-center justify-between text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <span>{opt.label}</span>
                    {selectedStatus === opt.value && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* November 2023 pill toggle */}
          <button
            type="button"
            onClick={() => setSelectedMonth(selectedMonth === '2023-11' ? null : '2023-11')}
            className={`hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
              selectedMonth === '2023-11'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            <span>November 2023</span>
            <Calendar className={`w-3.5 h-3.5 ${selectedMonth === '2023-11' ? 'text-white' : 'text-slate-400'}`} />
          </button>

          {/* December 2023 pill toggle */}
          <button
            type="button"
            onClick={() => setSelectedMonth(selectedMonth === '2023-12' ? null : '2023-12')}
            className={`hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
              selectedMonth === '2023-12'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            <span>December 2023</span>
            <Calendar className={`w-3.5 h-3.5 ${selectedMonth === '2023-12' ? 'text-white' : 'text-slate-400'}`} />
          </button>
        </div>

        {/* Search input: "Enter invoice #" */}
        <div className="relative">
          <input
            type="text"
            placeholder="Enter invoice #"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-4 pr-9 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-full focus:outline-none focus:border-indigo-500 hover:border-slate-300 dark:hover:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 shadow-xs w-52 sm:w-56 transition-colors"
          />
          <Search className="w-3.5 h-3.5 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* 4. Signature Dark Section (Dashboard One.jpg highlight) */}
      <FadeIn delay={0.08} className="bg-[#101426] border border-slate-800/80 rounded-[32px] p-5 sm:p-7 text-white shadow-2xl overflow-hidden">
        {/* Top bar inside dark container: Tabs & Action Icons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800/70">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-extrabold text-white tracking-tight mr-4">
              Unpaid Invoices
            </h3>
          </div>

          {/* Centered Tab Pills: All Invoices | Draft {X} | Unpaid {Y} */}
          <div className="flex items-center bg-[#151A2E] p-1 rounded-full border border-slate-800 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/40 hover:brightness-110'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80 active:scale-95'
              }`}
            >
              <span>All Invoices</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${
                  activeTab === 'all'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-800/90 text-slate-400 group-hover:bg-slate-700/90 group-hover:text-slate-200'
                }`}
              >
                {allCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('draft')}
              className={`group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'draft'
                  ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/40 hover:brightness-110'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80 active:scale-95'
              }`}
            >
              <span>Draft</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${
                  activeTab === 'draft'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-800/90 text-slate-400 group-hover:bg-slate-700/90 group-hover:text-slate-200'
                }`}
              >
                {draftCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('unpaid')}
              className={`group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'unpaid'
                  ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/40 hover:brightness-110'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80 active:scale-95'
              }`}
            >
              <span>Unpaid</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${
                  activeTab === 'unpaid'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-800/90 text-slate-400 group-hover:bg-slate-700/90 group-hover:text-slate-200'
                }`}
              >
                {unpaidCount}
              </span>
            </button>
          </div>

          {/* Right toggle & menu */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              title="Toggle View"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="More Options"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Split Grid: Left Primary Invoices List (8 cols) | Right Compact Preview Card (4 cols) */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* Left Column (Primary Invoices List) */}
          <div className="lg:col-span-8">
            <UnpaidInvoicesList
              invoices={filteredInvoices}
              selectedId={selectedInvoice?.id || null}
              onSelect={(inv) => setSelectedInvoice(inv)}
              isLoading={invoicesLoading}
            />
          </div>

          {/* Right Column: Compact & Ultra-Premium Preview Card */}
          <div className="lg:col-span-4">
            <InvoicePreviewCard
              invoice={selectedInvoice}
              companyName={companySettings?.companyName || 'Finnova Studio'}
              onOpenPayment={(inv) => setPaymentModalInvoice(inv)}
              onAddItem={() => router.push('/invoices/new')}
            />
          </div>
        </div>
      </FadeIn>

      {/* Payment Modal (Stripe & SSLCommerz) */}
      {paymentModalInvoice && (
        <PaymentModal
          isOpen={!!paymentModalInvoice}
          onClose={() => setPaymentModalInvoice(null)}
          invoice={paymentModalInvoice}
          onSuccess={() => {
            refetchInvoices();
            toast.success(`Invoice ${paymentModalInvoice.invoiceNumber} paid successfully!`);
            setPaymentModalInvoice(null);
          }}
        />
      )}
    </div>
  );
}
