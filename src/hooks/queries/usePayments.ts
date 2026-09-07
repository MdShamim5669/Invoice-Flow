'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PaymentService from '@/services/payment.service';
import { RecordPaymentInput } from '@/types/payment';

export function useInvoicePaymentsQuery(invoiceId: string) {
  return useQuery({
    queryKey: ['payments', invoiceId],
    queryFn: () => PaymentService.getInvoicePayments(invoiceId),
    enabled: !!invoiceId,
  });
}

export function useRecordPaymentMutation(invoiceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RecordPaymentInput) =>
      PaymentService.recordManualPayment(invoiceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['payments', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useStripeCheckoutMutation(invoiceId: string) {
  return useMutation({
    mutationFn: (amount?: number) => PaymentService.createStripeCheckout(invoiceId, amount),
  });
}

export function useSSLCommerzCheckoutMutation(invoiceId: string) {
  return useMutation({
    mutationFn: (amount?: number) => PaymentService.createSSLCommerzCheckout(invoiceId, amount),
  });
}
