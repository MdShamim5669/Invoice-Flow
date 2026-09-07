'use client';

import { useMemo } from 'react';
import { computeInvoiceTotals, LineItemInput } from '@/lib/utils';

export function useInvoiceMath(
  items: LineItemInput[],
  discountInput: number = 0,
  taxRate: number = 0
) {
  const totals = useMemo(() => {
    return computeInvoiceTotals(items, discountInput, taxRate);
  }, [items, discountInput, taxRate]);

  return totals;
}
