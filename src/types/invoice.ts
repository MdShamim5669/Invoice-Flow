import { Client } from './client';
import { Payment } from './payment';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export interface InvoiceItem {
  id?: string;
  invoiceId?: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  position?: number;
}


export interface Invoice {
  id: string;
  userId: string;
  clientId: string | null;
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string | null;
  currency: string;
  taxRate: number;
  discount: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  notes?: string;
  terms?: string;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
  client?: Client | null;
  items: InvoiceItem[];
  payments?: Payment[];
  amountPaid?: number;
  balanceDue?: number;
  paymentMethod?: string;
  clientNumber?: string;
}

export interface CreateInvoiceInput {
  clientId?: string | null;
  dueDate?: string;
  currency?: string;
  taxRate?: number;
  discount?: number;
  notes?: string;
  terms?: string;
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount?: number;
  }>;
}

export type UpdateInvoiceInput = Partial<CreateInvoiceInput> & {
  status?: InvoiceStatus;
};
