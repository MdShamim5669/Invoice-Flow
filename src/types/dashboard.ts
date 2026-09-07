import { Invoice } from './invoice';
import { Expense } from './expense';

export interface DashboardStats {
  currency: string;
  totalRevenue: number;
  totalInvoiced: number;
  totalOutstanding: number;
  overdueCount: number;
  paidInvoicesCount: number;
  totalClientsCount: number;
  recentInvoices: Invoice[];
  recentExpenses: Expense[];
}
