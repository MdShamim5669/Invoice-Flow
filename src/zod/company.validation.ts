import { z } from 'zod';

export const updateCompanySettingsSchema = z.object({
  companyName: z.string().trim().optional(),
  logoUrl: z.string().url().or(z.literal('')).optional(),
  address: z.string().trim().optional(),
  email: z.string().email('Invalid email address').or(z.literal('')).optional(),
  phone: z.string().trim().optional(),
  currency: z.string().trim().min(1).max(5).default('BDT'),
  taxRate: z.number().min(0).max(100).default(0),
  invoicePrefix: z.string().trim().min(1).max(10).default('INV-'),
  accentColor: z.string().trim().optional(),
});

export type UpdateCompanySettingsFormData = z.infer<typeof updateCompanySettingsSchema>;
