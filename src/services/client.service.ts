import api from '@/lib/api';
import { ApiResponse } from '@/types/api';
import { Client, CreateClientInput, UpdateClientInput } from '@/types/client';

export const ClientService = {
  async getAll(): Promise<Client[]> {
    const res = await api.get<ApiResponse<any>>('/clients');
    const raw = res.data?.data;
    if (Array.isArray(raw)) return raw;
    if (raw && Array.isArray(raw.clients)) return raw.clients;
    if (Array.isArray(res.data)) return res.data as any;
    return [];
  },

  async getById(id: string): Promise<Client> {
    const res = await api.get<ApiResponse<Client>>(`/clients/${id}`);
    return res.data?.data || (res.data as any);
  },

  async create(payload: CreateClientInput): Promise<Client> {
    const res = await api.post<ApiResponse<Client>>('/clients', payload);
    return res.data?.data || (res.data as any);
  },

  async update(id: string, payload: UpdateClientInput): Promise<Client> {
    const res = await api.patch<ApiResponse<Client>>(`/clients/${id}`, payload);
    return res.data?.data || (res.data as any);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/clients/${id}`);
  },
};

export default ClientService;
