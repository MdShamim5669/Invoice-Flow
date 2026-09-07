import { z } from 'zod';

export const createClientSchema = z.object({
  name: z.string().trim().min(1, 'Client name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  company: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export const updateClientSchema = createClientSchema.partial();

export type CreateClientFormData = z.infer<typeof createClientSchema>;
export type UpdateClientFormData = z.infer<typeof updateClientSchema>;
