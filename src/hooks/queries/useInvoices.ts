'use client';

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import InvoiceService from '@/services/invoice.service';
import { CreateInvoiceInput, UpdateInvoiceInput } from '@/types/invoice';

export const INVOICES_QUERY_KEY = ['invoices'];

export function useInvoicesQuery(params?: {
  status?: string;
  clientId?: string;
  page?: number;
  limit?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: [...INVOICES_QUERY_KEY, params],
    queryFn: () => InvoiceService.getAll(params),
    placeholderData: keepPreviousData,
  });
}

export function useInvoiceQuery(id: string) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => InvoiceService.getById(id),
    enabled: !!id,
  });
}

export function useCreateInvoiceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateInvoiceInput) => InvoiceService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateInvoiceMutation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateInvoiceInput) => InvoiceService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteInvoiceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => InvoiceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
