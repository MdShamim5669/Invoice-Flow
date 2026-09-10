import api from '@/lib/api';
import { ApiResponse } from '@/types/api';
import { CreateInvoiceInput, Invoice, UpdateInvoiceInput } from '@/types/invoice';
import { Client } from '@/types/client';

const LOCAL_INVOICES_KEY = 'invoiceflow_local_invoices';
const LOCAL_CLIENTS_KEY = 'invoiceflow_local_clients';

function getLocalInvoices(): Invoice[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(LOCAL_INVOICES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveLocalInvoice(invoice: Invoice): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getLocalInvoices();
    localStorage.setItem(LOCAL_INVOICES_KEY, JSON.stringify([invoice, ...list]));
  } catch {
    // ignore
  }
}

function getLocalClientById(clientId?: string | null): Client | null {
  if (!clientId || typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(LOCAL_CLIENTS_KEY);
    const list: Client[] = saved ? JSON.parse(saved) : [];
    return list.find((c) => c.id === clientId) || null;
  } catch {
    return null;
  }
}

export const InvoiceService = {
  async getAll(params?: {
    status?: string;
    clientId?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ invoices: Invoice[]; meta?: any }> {
    const local = getLocalInvoices();
    try {
      const res = await api.get<ApiResponse<any>>('/invoices', { params });
      const rawData = res.data?.data;
      let serverInvoices: Invoice[] = [];

      if (Array.isArray(rawData)) {
        serverInvoices = rawData;
      } else if (rawData && Array.isArray(rawData.invoices)) {
        serverInvoices = rawData.invoices;
      } else if (Array.isArray(res.data)) {
        serverInvoices = res.data as any;
      }

      // Merge server invoices with local fallback invoices
      const serverIds = new Set(serverInvoices.map((inv) => inv.id));
      const filteredLocal = local.filter((inv) => !serverIds.has(inv.id));
      const combined = [...filteredLocal, ...serverInvoices];

      return {
        invoices: combined,
        meta: res.data?.meta || (rawData && rawData.meta) || { total: combined.length },
      };
    } catch {
      // Graceful offline fallback
      return {
        invoices: local,
        meta: { total: local.length, page: 1, limit: 10, totalPages: 1 },
      };
    }
  },

  async getById(id: string): Promise<Invoice> {
    try {
      const res = await api.get<ApiResponse<Invoice>>(`/invoices/${id}`);
      return res.data?.data || (res.data as any);
    } catch (err) {
      const local = getLocalInvoices().find((inv) => inv.id === id);
      if (local) return local;
      throw err;
    }
  },

  async create(payload: CreateInvoiceInput): Promise<Invoice> {
    try {
      const res = await api.post<ApiResponse<Invoice>>('/invoices', payload);
      return res.data?.data || (res.data as any);
    } catch (err: any) {
      // Check if network error, backend 401 unauthorized, or client not found
      const isFallbackEligible =
        err?.code === 'ERR_NETWORK' ||
        err?.message?.toLowerCase().includes('network error') ||
        err?.customMessage?.toLowerCase().includes('network error') ||
        err?.response?.status === 401 ||
        err?.response?.status === 404 ||
        !err?.response;

      if (isFallbackEligible) {
        const localList = getLocalInvoices();
        const client = getLocalClientById(payload.clientId);

        const subtotal = payload.items.reduce((acc, item) => {
          return acc + (Number(item.quantity) || 1) * (Number(item.rate) || 0);
        }, 0);
        const discount = Number(payload.discount) || 0;
        const taxRate = Number(payload.taxRate) || 0;
        const discountedSubtotal = Math.max(0, subtotal - discount);
        const taxAmount = (discountedSubtotal * taxRate) / 100;
        const total = discountedSubtotal + taxAmount;

        const seq = localList.length + 1;
        const invoiceNumber = `INV-${String(seq).padStart(4, '0')}`;
        const now = new Date().toISOString();

        const localInvoice: Invoice = {
          id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          userId: 'local-user',
          clientId: payload.clientId || null,
          invoiceNumber,
          status: 'sent',
          issueDate: now,
          dueDate: payload.dueDate || new Date(Date.now() + 14 * 86400000).toISOString(),
          currency: payload.currency || 'USD',
          taxRate,
          discount,
          subtotal,
          taxAmount,
          total,
          notes: payload.notes || '',
          terms: payload.terms || '',
          paidAt: null,
          createdAt: now,
          updatedAt: now,
          client: client || (payload.clientId ? ({ id: payload.clientId, name: 'Client' } as any) : null),
          items: payload.items.map((item, idx) => ({
            id: `item_${Date.now()}_${idx}`,
            description: item.description,
            quantity: Number(item.quantity) || 1,
            rate: Number(item.rate) || 0,
            amount: (Number(item.quantity) || 1) * (Number(item.rate) || 0),
            position: idx,
          })),
          payments: [],
          amountPaid: 0,
          balanceDue: total,
        };

        saveLocalInvoice(localInvoice);
        return localInvoice;
      }

      throw err;
    }
  },

  async update(id: string, payload: UpdateInvoiceInput): Promise<Invoice> {
    try {
      const res = await api.patch<ApiResponse<Invoice>>(`/invoices/${id}`, payload);
      return res.data?.data || (res.data as any);
    } catch (err) {
      const local = getLocalInvoices();
      const idx = local.findIndex((inv) => inv.id === id);
      if (idx !== -1) {
        const existing = local[idx];
        const updatedItems = payload.items
          ? payload.items.map((i, iIdx) => ({
              id: `item_${Date.now()}_${iIdx}`,
              description: i.description,
              quantity: Number(i.quantity) || 1,
              rate: Number(i.rate) || 0,
              amount: (Number(i.quantity) || 1) * (Number(i.rate) || 0),
              position: iIdx,
            }))
          : existing.items;

        const updated: Invoice = {
          ...existing,
          ...payload,
          items: updatedItems,
          updatedAt: new Date().toISOString(),
        } as Invoice;

        local[idx] = updated;
        localStorage.setItem(LOCAL_INVOICES_KEY, JSON.stringify(local));
        return updated;
      }
      throw err;
    }
  },

  async delete(id: string): Promise<void> {
    if (typeof window !== 'undefined') {
      const list = getLocalInvoices().filter((inv) => inv.id !== id);
      localStorage.setItem(LOCAL_INVOICES_KEY, JSON.stringify(list));
    }
    try {
      await api.delete(`/invoices/${id}`);
    } catch {
      // Silently succeed for local records
    }
  },

  async getPdfDownloadUrl(id: string): Promise<string> {
    const baseURL =
      process.env.NEXT_PUBLIC_API_URL ||
      'https://ai-invoicing-and-billing-app-server.onrender.com/api';
    return `${baseURL}/invoices/${id}/pdf`;
  },
};

export default InvoiceService;
