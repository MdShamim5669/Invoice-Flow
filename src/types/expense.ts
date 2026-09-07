export interface Expense {
  id: string;
  userId: string;
  vendor: string;
  category: string;
  expenseDate: string;
  amount: number;
  currency: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateExpenseInput = Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
export type UpdateExpenseInput = Partial<CreateExpenseInput>;

export interface ExpenseSummary {
  month: string;
  totalExpenses: number;
  byCategory: Record<string, number>;
}
