import api from '@/lib/api';
import { ApiResponse } from '@/types/api';
import { CreateInvoiceInput, Invoice, UpdateInvoiceInput } from '@/types/invoice';

export const InvoiceService = {
  async getAll(params?: {
    status?: string;
    clientId?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ invoices: Invoice[]; meta?: any }> {
    const res = await api.get<ApiResponse<any>>('/invoices', { params });
    const rawData = res.data?.data;
    let invoices: Invoice[] = [];

    if (Array.isArray(rawData)) {
      invoices = rawData;
    } else if (rawData && Array.isArray(rawData.invoices)) {
      invoices = rawData.invoices;
    } else if (Array.isArray(res.data)) {
      invoices = res.data as any;
    }

    return {
      invoices,
      meta: res.data?.meta || (rawData && rawData.meta),
    };
  },

  async getById(id: string): Promise<Invoice> {
    const res = await api.get<ApiResponse<Invoice>>(`/invoices/${id}`);
    return res.data?.data || (res.data as any);
  },

  async create(payload: CreateInvoiceInput): Promise<Invoice> {
    const res = await api.post<ApiResponse<Invoice>>('/invoices', payload);
    return res.data?.data || (res.data as any);
  },

  async update(id: string, payload: UpdateInvoiceInput): Promise<Invoice> {
    const res = await api.patch<ApiResponse<Invoice>>(`/invoices/${id}`, payload);
    return res.data?.data || (res.data as any);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/invoices/${id}`);
  },

  async getPdfDownloadUrl(id: string): Promise<string> {
    const baseURL =
      process.env.NEXT_PUBLIC_API_URL ||
      'https://ai-invoicing-and-billing-app-server.onrender.com/api';
    return `${baseURL}/invoices/${id}/pdf`;
  },
};

export default InvoiceService;
