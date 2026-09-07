import api from '@/lib/api';
import { ApiResponse } from '@/types/api';
import { CreateExpenseInput, Expense, ExpenseSummary, UpdateExpenseInput } from '@/types/expense';

export const ExpenseService = {
  async getAll(): Promise<Expense[]> {
    const res = await api.get<ApiResponse<any>>('/expenses');
    const raw = res.data?.data;
    if (Array.isArray(raw)) return raw;
    if (raw && Array.isArray(raw.expenses)) return raw.expenses;
    if (Array.isArray(res.data)) return res.data as any;
    return [];
  },

  async create(payload: CreateExpenseInput): Promise<Expense> {
    const res = await api.post<ApiResponse<Expense>>('/expenses', payload);
    return res.data?.data || (res.data as any);
  },

  async update(id: string, payload: UpdateExpenseInput): Promise<Expense> {
    const res = await api.patch<ApiResponse<Expense>>(`/expenses/${id}`, payload);
    return res.data?.data || (res.data as any);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/expenses/${id}`);
  },

  async getSummary(month?: string): Promise<ExpenseSummary> {
    const res = await api.get<ApiResponse<ExpenseSummary>>('/expenses/summary', {
      params: month ? { month } : undefined,
    });
    return res.data?.data || (res.data as any);
  },
};

export default ExpenseService;
