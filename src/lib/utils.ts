import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Money math exact implementation as specified in PRD Section 3.1
 * round2(n) = Math.round((n + Number.EPSILON) * 100) / 100
 */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export interface LineItemInput {
  quantity: number;
  rate: number;
}

export interface ComputedTotals {
  subtotal: number;
  discount: number;
  taxableBase: number;
  taxAmount: number;
  total: number;
}

/**
 * Invoice total computed in the exact authoritative order:
 * 1. Per line item: amount = round2(quantity * rate)
 * 2. subtotal = round2(sum(amount))
 * 3. discount = min(round2(discountInput), subtotal) -> never let discount exceed subtotal
 * 4. taxableBase = round2(subtotal - discount)
 * 5. taxAmount = round2(taxableBase * taxRate / 100)
 * 6. total = round2(taxableBase + taxAmount)
 */
export function computeInvoiceTotals(
  items: LineItemInput[],
  discountInput: number = 0,
  taxRate: number = 0
): ComputedTotals {
  const lineItemAmounts = items.map((item) =>
    round2((Number(item.quantity) || 0) * (Number(item.rate) || 0))
  );

  const subtotal = round2(lineItemAmounts.reduce((acc, curr) => acc + curr, 0));
  const discount = Math.min(round2(Number(discountInput) || 0), subtotal);
  const taxableBase = round2(subtotal - discount);
  const taxAmount = round2((taxableBase * (Number(taxRate) || 0)) / 100);
  const total = round2(taxableBase + taxAmount);

  return {
    subtotal,
    discount,
    taxableBase,
    taxAmount,
    total,
  };
}

/**
 * Format currency with symbol support (BDT ৳, USD $, EUR €, etc.)
 */
export function formatCurrency(amount: number, currency: string = 'BDT'): string {
  const numeric = round2(amount || 0);
  const symbols: Record<string, string> = {
    BDT: '৳',
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
  };

  const symbol = symbols[currency.toUpperCase()] || currency;
  const formatted = numeric.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${symbol}${formatted}`;
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}
