'use client';

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import ExpenseService from '@/services/expense.service';
import { CreateExpenseInput, UpdateExpenseInput } from '@/types/expense';

export const EXPENSES_QUERY_KEY = ['expenses'];

export function useExpensesQuery() {
  return useQuery({
    queryKey: EXPENSES_QUERY_KEY,
    queryFn: () => ExpenseService.getAll(),
    placeholderData: keepPreviousData,
  });
}

export function useExpenseSummaryQuery(month?: string) {
  return useQuery({
    queryKey: ['expenses-summary', month],
    queryFn: () => ExpenseService.getSummary(month),
    placeholderData: keepPreviousData,
  });
}

export function useCreateExpenseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateExpenseInput) => ExpenseService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['expenses-summary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteExpenseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ExpenseService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['expenses-summary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
