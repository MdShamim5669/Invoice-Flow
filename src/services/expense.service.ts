import api from '@/lib/api';
import { ApiResponse } from '@/types/api';
import { CreateExpenseInput, Expense, ExpenseSummary, UpdateExpenseInput } from '@/types/expense';

const LOCAL_EXPENSES_KEY = 'invoiceflow_local_expenses';

function getLocalExpenses(): Expense[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(LOCAL_EXPENSES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveLocalExpense(exp: Expense): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getLocalExpenses();
    localStorage.setItem(LOCAL_EXPENSES_KEY, JSON.stringify([exp, ...list]));
  } catch {
    // ignore
  }
}

export const ExpenseService = {
  async getAll(): Promise<Expense[]> {
    const local = getLocalExpenses();
    try {
      const res = await api.get<ApiResponse<any>>('/expenses');
      const raw = res.data?.data;
      let serverExpenses: Expense[] = [];
      if (Array.isArray(raw)) serverExpenses = raw;
      else if (raw && Array.isArray(raw.expenses)) serverExpenses = raw.expenses;
      else if (Array.isArray(res.data)) serverExpenses = res.data as any;

      const serverIds = new Set(serverExpenses.map((e) => e.id));
      const filteredLocal = local.filter((e) => !serverIds.has(e.id));
      return [...filteredLocal, ...serverExpenses];
    } catch {
      return local;
    }
  },

  async create(payload: CreateExpenseInput): Promise<Expense> {
    try {
      const res = await api.post<ApiResponse<Expense>>('/expenses', payload);
      return res.data?.data || (res.data as any);
    } catch (err: any) {
      const isFallbackEligible =
        err?.code === 'ERR_NETWORK' ||
        err?.message?.toLowerCase().includes('network error') ||
        err?.customMessage?.toLowerCase().includes('network error') ||
        err?.response?.status === 401 ||
        !err?.response;

      if (isFallbackEligible) {
        const now = new Date().toISOString();
        const localExp: Expense = {
          id: `exp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          userId: 'local-user',
          category: payload.category || 'General',
          amount: Number(payload.amount) || 0,
          currency: payload.currency || 'USD',
          expenseDate: payload.expenseDate || now,
          vendor: payload.vendor,
          notes: payload.notes || '',
          createdAt: now,
          updatedAt: now,
        };
        saveLocalExpense(localExp);
        return localExp;
      }
      throw err;
    }
  },

  async update(id: string, payload: UpdateExpenseInput): Promise<Expense> {
    try {
      const res = await api.patch<ApiResponse<Expense>>(`/expenses/${id}`, payload);
      return res.data?.data || (res.data as any);
    } catch (err) {
      const local = getLocalExpenses();
      const idx = local.findIndex((e) => e.id === id);
      if (idx !== -1) {
        const updated = { ...local[idx], ...payload, updatedAt: new Date().toISOString() };
        local[idx] = updated;
        localStorage.setItem(LOCAL_EXPENSES_KEY, JSON.stringify(local));
        return updated;
      }
      throw err;
    }
  },

  async delete(id: string): Promise<void> {
    if (typeof window !== 'undefined') {
      const list = getLocalExpenses().filter((e) => e.id !== id);
      localStorage.setItem(LOCAL_EXPENSES_KEY, JSON.stringify(list));
    }
    try {
      await api.delete(`/expenses/${id}`);
    } catch {
      // Silently succeed for local records
    }
  },

  async getSummary(month?: string): Promise<ExpenseSummary> {
    try {
      const res = await api.get<ApiResponse<ExpenseSummary>>('/expenses/summary', {
        params: month ? { month } : undefined,
      });
      return res.data?.data || (res.data as any);
    } catch {
      const local = getLocalExpenses();
      const totalExpenses = local.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
      const byCategory: Record<string, number> = {};
      for (const e of local) {
        byCategory[e.category] = (byCategory[e.category] || 0) + (Number(e.amount) || 0);
      }
      return {
        month: month || new Date().toISOString().slice(0, 7),
        totalExpenses,
        byCategory,
      };
    }
  },
};

export default ExpenseService;
