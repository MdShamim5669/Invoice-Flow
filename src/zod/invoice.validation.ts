import { z } from 'zod';

export const lineItemSchema = z.object({
  description: z.string().trim().min(1, 'Item description is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  rate: z.number().min(0, 'Rate cannot be negative'),
  position: z.number().int().optional(),
});

export const createInvoiceSchema = z.object({
  clientId: z.string().min(1, 'Please select a client'),
  dueDate: z.string().optional().nullable(),
  currency: z.string().trim().min(1).max(5).default('BDT'),
  taxRate: z.number().min(0).max(100).default(0),
  discount: z.number().min(0).default(0),
  notes: z.string().trim().optional(),
  terms: z.string().trim().optional(),
  items: z
    .array(lineItemSchema)
    .min(1, 'At least one line item is required to create an invoice'),
});

export const updateInvoiceSchema = createInvoiceSchema.partial().extend({
  status: z.enum(['draft', 'sent', 'paid']).optional(),
});

export type LineItemFormData = z.infer<typeof lineItemSchema>;
export type CreateInvoiceFormData = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceFormData = z.infer<typeof updateInvoiceSchema>;
