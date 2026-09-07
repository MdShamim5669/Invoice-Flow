import { z } from 'zod';

export const recordPaymentSchema = z.object({
  amount: z.number().positive('Payment amount must be greater than 0'),
  method: z.enum(['cash', 'bank_transfer', 'stripe', 'sslcommerz', 'check', 'other']),
  paidOn: z.string().optional(),
  notes: z.string().trim().optional(),
});

export const checkoutSessionSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  amount: z.number().positive('Payment amount must be greater than 0').optional(),
});

export type RecordPaymentFormData = z.infer<typeof recordPaymentSchema>;
export type CheckoutSessionFormData = z.infer<typeof checkoutSessionSchema>;
