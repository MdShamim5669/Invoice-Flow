import api from '@/lib/api';
import { ApiResponse } from '@/types/api';
import { Client, CreateClientInput, UpdateClientInput } from '@/types/client';

const LOCAL_STORAGE_KEY = 'invoiceflow_local_clients';

function getLocalClients(): Client[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveLocalClient(client: Client): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getLocalClients();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([client, ...list]));
  } catch {
    // ignore
  }
}

function removeLocalClient(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getLocalClients().filter((c) => c.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export const ClientService = {
  async getAll(): Promise<Client[]> {
    const local = getLocalClients();
    try {
      const res = await api.get<ApiResponse<any>>('/clients');
      const raw = res.data?.data;
      let serverClients: Client[] = [];
      if (Array.isArray(raw)) serverClients = raw;
      else if (raw && Array.isArray(raw.clients)) serverClients = raw.clients;
      else if (Array.isArray(res.data)) serverClients = res.data as any;

      // Merge server clients and local clients (avoid duplicates by ID)
      const serverIds = new Set(serverClients.map((c) => c.id));
      const filteredLocal = local.filter((c) => !serverIds.has(c.id));
      return [...filteredLocal, ...serverClients];
    } catch (err: any) {
      // Graceful offline fallback: if backend on port 5000 is not running
      if (local.length > 0) return local;
      return [];
    }
  },

  async getById(id: string): Promise<Client> {
    try {
      const res = await api.get<ApiResponse<Client>>(`/clients/${id}`);
      return res.data?.data || (res.data as any);
    } catch (err) {
      const local = getLocalClients().find((c) => c.id === id);
      if (local) return local;
      throw err;
    }
  },

  async create(payload: CreateClientInput): Promise<Client> {
    try {
      const res = await api.post<ApiResponse<Client>>('/clients', payload);
      const serverClient = res.data?.data || (res.data as any);
      return serverClient;
    } catch (err: any) {
      // Check if this is a connection/network failure (e.g. backend server on port 5000 is not started)
      const isNetworkError =
        err?.code === 'ERR_NETWORK' ||
        err?.message?.toLowerCase().includes('network error') ||
        err?.customMessage?.toLowerCase().includes('network error') ||
        err?.response?.status === 401 ||
        !err?.response;

      if (isNetworkError) {
        // Optimistic fallback: persist client locally so user isn't blocked
        const localClient: Client = {
          id: `client_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          name: payload.name,
          email: payload.email || '',
          company: payload.company || '',
          phone: payload.phone || '',
          address: payload.address || '',
          notes: payload.notes || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _count: { invoices: 0 },
        } as any;

        saveLocalClient(localClient);
        return localClient;
      }

      throw err;
    }
  },

  async update(id: string, payload: UpdateClientInput): Promise<Client> {
    try {
      const res = await api.patch<ApiResponse<Client>>(`/clients/${id}`, payload);
      return res.data?.data || (res.data as any);
    } catch (err) {
      const local = getLocalClients();
      const idx = local.findIndex((c) => c.id === id);
      if (idx !== -1) {
        const updated = { ...local[idx], ...payload, updatedAt: new Date().toISOString() };
        local[idx] = updated;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(local));
        return updated;
      }
      throw err;
    }
  },

  async delete(id: string): Promise<void> {
    removeLocalClient(id);
    try {
      await api.delete(`/clients/${id}`);
    } catch (err) {
      // Silently succeed for local clients
    }
  },
};

export default ClientService;
