'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PaymentModal } from '@/components/invoice/payment-modal';
import { PaymentGatewayBadge } from '@/components/invoice/payment-gateway-badge';
import { ClientAvatar } from '@/components/invoice/client-avatar';
import { useInvoicesQuery, useDeleteInvoiceMutation } from '@/hooks/queries/useInvoices';
import { Invoice } from '@/types/invoice';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Plus,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CreditCard,
  Eye,
  Download,
  Trash2,
  Check,
  RefreshCw,
  FilePlus2,
} from 'lucide-react';
import { toast } from 'sonner';

type SortField = 'date' | 'amount' | 'client' | 'invoiceId';
type SortOrder = 'asc' | 'desc';

export default function InvoicesAndBillingPage() {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(7);

  // Search & Filter State
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isSortOpen, setIsSortOpen] = useState<boolean>(false);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Dynamic TanStack Query fetching directly from backend
  const { data, isLoading, refetch, isRefetching } = useInvoicesQuery({
    page: currentPage,
    limit: pageSize,
    search: search ? search.trim() : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const deleteInvoiceMutation = useDeleteInvoiceMutation();

  // Invoices directly from backend API
  const rawInvoices: Invoice[] = data?.invoices || [];

  // Checkbox multi-select state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Action menu popover
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Payment Modal
  const [selectedPaymentInvoice, setSelectedPaymentInvoice] = useState<Invoice | null>(null);

  // Keyboard shortcut: Cmd+K / Ctrl+K to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setIsFilterOpen(false);
        setIsSortOpen(false);
        setActiveMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleDelete = async (id: string, invoiceNum: string) => {
    if (!confirm(`Are you sure you want to delete invoice ${invoiceNum}?`)) return;
    try {
      await deleteInvoiceMutation.mutateAsync(id);
      toast.success(`Invoice ${invoiceNum} deleted`);
      refetch();
    } catch (err: any) {
      toast.error(err?.customMessage || 'Failed to delete invoice');
    }
    setActiveMenuId(null);
  };

  const handleDownloadSinglePdf = (inv: Invoice) => {
    router.push(`/invoices/${inv.id}`);
  };

  // Sort invoices
  const sortedInvoices = [...rawInvoices].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'date') {
      comparison = new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
    } else if (sortField === 'amount') {
      comparison = Number(b.total) - Number(a.total);
    } else if (sortField === 'client') {
      comparison = (a.client?.name || '').localeCompare(b.client?.name || '');
    } else if (sortField === 'invoiceId') {
      comparison = a.invoiceNumber.localeCompare(b.invoiceNumber);
    }
    return sortOrder === 'asc' ? -comparison : comparison;
  });

  // Total items & pagination
  const totalItems = data?.meta?.total ?? sortedInvoices.length;
  const totalPages = data?.meta?.totalPage ?? Math.max(1, Math.ceil(totalItems / pageSize));

  // Checkbox multi-select logic
  const isAllSelected =
    sortedInvoices.length > 0 && sortedInvoices.every((inv) => selectedIds.includes(inv.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedInvoices.map((inv) => inv.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 sm:px-2">
      {/* 1. Header Section (Reference Image: "Invoice & Billing") */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
              Invoice & Billing
            </h1>
            <button
              onClick={() => refetch()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              title="Refresh from backend"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading || isRefetching ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal mt-0.5">
            Add invoices under your created events
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/invoices/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#18181B] hover:bg-black dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-white shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + Add invoice
          </Link>
        </div>
      </div>

      {/* 2. Search, Filter & Sort By Bar (Reference Image Style) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {/* Search Input with ⌘K Badge */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search.."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-12 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 text-slate-900 dark:text-slate-100 shadow-2xs placeholder:text-slate-400"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200/80 dark:border-slate-700/80 pointer-events-none font-mono">
            ⌘K
          </span>
        </div>

        {/* Right Action Buttons: Filter & Sort By */}
        <div className="flex items-center gap-2.5 dropdown-container">
          {/* Filter Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => {
                setIsFilterOpen(!isFilterOpen);
                setIsSortOpen(false);
              }}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl border transition-all cursor-pointer shadow-2xs ${
                statusFilter !== 'all'
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Filter</span>
              {statusFilter !== 'all' && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              )}
            </button>

            {/* Filter Menu Popup */}
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-30 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  Filter by status
                </div>
                {[
                  { key: 'all', label: 'All Invoices' },
                  { key: 'paid', label: 'Active (Paid)' },
                  { key: 'sent', label: 'Sent (Pending)' },
                  { key: 'draft', label: 'Archived (Draft)' },
                  { key: 'overdue', label: 'Overdue' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      setStatusFilter(item.key);
                      setIsFilterOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer ${
                      statusFilter === item.key
                        ? 'font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/40'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span>{item.label}</span>
                    {statusFilter === item.key && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort By Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => {
                setIsSortOpen(!isSortOpen);
                setIsFilterOpen(false);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer shadow-2xs"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Sort By</span>
            </button>

            {/* Sort Menu Popup */}
            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-30 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  Sort records by
                </div>
                {[
                  { field: 'date', label: 'Date (Newest)' },
                  { field: 'amount', label: 'Amount (Highest)' },
                  { field: 'client', label: 'Client Name (A-Z)' },
                  { field: 'invoiceId', label: 'Invoice ID' },
                ].map((item) => (
                  <button
                    key={item.field}
                    onClick={() => {
                      setSortField(item.field as SortField);
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer ${
                      sortField === item.field
                        ? 'font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/40'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span>{item.label}</span>
                    {sortField === item.field && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Main Invoices & Billing Table (Matching Reference Image) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            {/* Table Header Row */}
            <thead>
              <tr className="bg-[#F8FAFC]/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-[12px] font-semibold text-slate-500 dark:text-slate-400 select-none">
                <th className="py-3.5 pl-4 pr-2 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                  />
                </th>
                <th
                  onClick={() => {
                    setSortField('client');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className="py-3.5 px-4 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Client</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    setSortField('invoiceId');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className="py-3.5 px-4 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Invoice ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    setSortField('date');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className="py-3.5 px-4 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4 font-semibold">
                  <div className="flex items-center gap-1">
                    <span>Payment</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4 font-semibold">
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    setSortField('amount');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className="py-3.5 px-4 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Amount</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 pr-4 pl-2 text-right w-12" />
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {isLoading ? (
                // Shimmer Loading Skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 pl-4 pr-2">
                      <div className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
                        <div className="space-y-1.5">
                          <div className="w-24 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
                          <div className="w-12 h-2 bg-slate-200 dark:bg-slate-800 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-16 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-20 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-16 h-5 bg-slate-200 dark:bg-slate-800 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-16 h-5 bg-slate-200 dark:bg-slate-800 rounded-full" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-14 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
                    </td>
                    <td className="py-4 pr-4 pl-2 text-right">
                      <div className="w-5 h-5 bg-slate-200 dark:bg-slate-800 rounded ml-auto" />
                    </td>
                  </tr>
                ))
              ) : sortedInvoices.length === 0 ? (
                // Clean Empty State
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <FilePlus2 className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        No invoices found
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {search
                          ? `No records matching "${search}".`
                          : 'You have no invoices created yet on your account.'}
                      </p>
                      <Link
                        href="/invoices/new"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 transition-colors shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Create your first invoice
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedInvoices.map((inv, index) => {
                  const clientName = inv.client?.name || 'Customer';
                  const clientNumber = inv.clientNumber || (inv.clientId ? `#${inv.clientId.slice(-3)}` : `#${index + 1}`);
                  const isChecked = selectedIds.includes(inv.id);
                  const isMenuOpen = activeMenuId === inv.id;

                  // Derive payment method from backend payment records or gateway
                  const paymentMethod =
                    inv.payments?.[0]?.method ||
                    inv.paymentMethod ||
                    (inv.status === 'paid' ? 'Stripe' : 'Wise');

                  const isActiveStatus = inv.status === 'paid' || inv.status === 'sent';
                  const isOverdueStatus =
                    inv.status === 'overdue' ||
                    (inv.dueDate && new Date(inv.dueDate) < new Date() && inv.status !== 'paid');

                  return (
                    <tr
                      key={inv.id}
                      className={`hover:bg-[#F8FAFC]/90 dark:hover:bg-slate-800/40 transition-colors group ${
                        isChecked ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 pl-4 pr-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectRow(inv.id)}
                          className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                        />
                      </td>

                      {/* Client Column: Avatar + Name + #ID */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <ClientAvatar name={clientName} />
                          <div>
                            <Link
                              href={`/invoices/${inv.id}`}
                              className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 transition-colors block text-xs sm:text-sm"
                            >
                              {clientName}
                            </Link>
                            <span className="text-[11px] font-medium text-slate-400">
                              {clientNumber}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Invoice ID */}
                      <td className="py-4 px-4 font-mono font-medium text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                        <Link
                          href={`/invoices/${inv.id}`}
                          className="hover:underline hover:text-slate-950 dark:hover:text-white"
                        >
                          {inv.invoiceNumber}
                        </Link>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {formatDate(inv.issueDate)}
                      </td>

                      {/* Payment Gateway Badge */}
                      <td className="py-4 px-4">
                        <PaymentGatewayBadge method={paymentMethod} />
                      </td>

                      {/* Status Pill Badge (Matching Reference style with dot) */}
                      <td className="py-4 px-4">
                        {isOverdueStatus ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50/80 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Overdue
                          </span>
                        ) : isActiveStatus ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Archived
                          </span>
                        )}
                      </td>

                      {/* Amount Column */}
                      <td className="py-4 px-4 font-bold text-slate-900 dark:text-white text-xs sm:text-sm font-mono whitespace-nowrap">
                        {formatCurrency(inv.total, inv.currency)}
                      </td>

                      {/* Action Menu (Three vertical dots ⋮) */}
                      <td className="py-4 pr-4 pl-2 text-right relative dropdown-container">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(isMenuOpen ? null : inv.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Floating Popover Action Menu */}
                        {isMenuOpen && (
                          <div className="absolute right-4 top-10 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-40 py-1.5 text-left animate-in fade-in zoom-in-95 duration-100">
                            <Link
                              href={`/invoices/${inv.id}`}
                              className="w-full px-3.5 py-2 text-xs flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors font-medium"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              View Invoice
                            </Link>

                            {inv.status !== 'paid' && (
                              <button
                                onClick={() => {
                                  setSelectedPaymentInvoice(inv);
                                  setActiveMenuId(null);
                                }}
                                className="w-full text-left px-3.5 py-2 text-xs flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-colors font-semibold cursor-pointer"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                Collect Payment
                              </button>
                            )}

                            <button
                              onClick={() => handleDownloadSinglePdf(inv)}
                              className="w-full text-left px-3.5 py-2 text-xs flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors font-medium cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5 text-slate-400" />
                              Download PDF
                            </button>

                            <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                            <button
                              onClick={() => handleDelete(inv.id, inv.invoiceNumber)}
                              className="w-full text-left px-3.5 py-2 text-xs flex items-center gap-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors font-medium cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Bottom Pagination Bar (Matching Reference Image) */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs select-none">
          {/* Left: Page indicator */}
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            Page {currentPage} of {totalPages}
          </span>

          {/* Center: Pagination controls « < 1 2 3 ... > » */}
          <div className="flex items-center gap-1.5 self-center">
            {/* First page « */}
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="First Page"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>

            {/* Previous page < */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Page number buttons */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = i + 1;
              if (totalPages > 5 && currentPage > 3) {
                pageNum = currentPage - 2 + i;
                if (pageNum > totalPages) pageNum = totalPages - (4 - i);
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`min-w-8 h-8 px-2 rounded-lg font-semibold transition-all cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                      : 'border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Next page > */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Last page » */}
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="Last Page"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right: Items per page dropdown (Reference: "7 / page ∨") */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:border-slate-400 cursor-pointer shadow-2xs"
            >
              <option value={7}>7 / page</option>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment Gateway Modal (Stripe & SSLCommerz Integration) */}
      {selectedPaymentInvoice && (
        <PaymentModal
          isOpen={!!selectedPaymentInvoice}
          onClose={() => setSelectedPaymentInvoice(null)}
          invoice={selectedPaymentInvoice}
          onSuccess={() => {
            setSelectedPaymentInvoice(null);
            refetch();
            toast.success(`Payment recorded for invoice ${selectedPaymentInvoice.invoiceNumber}`);
          }}
        />
      )}
    </div>
  );
}
