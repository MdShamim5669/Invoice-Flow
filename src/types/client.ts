export interface Client {
  id: string;
  userId: string;
  name: string;
  email?: string;
  company?: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    invoices: number;
  };
}

export type CreateClientInput = Omit<Client, 'id' | 'userId' | 'createdAt' | 'updatedAt' | '_count'>;
export type UpdateClientInput = Partial<CreateClientInput>;
