import { z } from 'zod';

export const createExpenseSchema = z.object({
  vendor: z.string().trim().min(1, 'Vendor / Service name is required'),
  category: z.string().trim().default('General'),
  expenseDate: z.string().min(1, 'Expense date is required'),
  amount: z.number().positive('Expense amount must be greater than 0'),
  currency: z.string().trim().min(1).max(5).default('BDT'),
  notes: z.string().trim().optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export type CreateExpenseFormData = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseFormData = z.infer<typeof updateExpenseSchema>;
