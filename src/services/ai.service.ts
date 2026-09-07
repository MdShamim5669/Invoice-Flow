import api from '@/lib/api';
import { ApiResponse } from '@/types/api';

export interface BusinessSummaryResponse {
  summary: string;
}

export interface PaymentReminderResponse {
  subject: string;
  body: string;
}

export interface WriteNoteResponse {
  note: string;
}

export interface ParsedReceiptResponse {
  vendor: string;
  category: string;
  amount: number;
  date: string;
  items?: Array<{ description: string; amount: number }>;
}

export const AIService = {
  async getBusinessSummary(): Promise<BusinessSummaryResponse> {
    const res = await api.post<ApiResponse<BusinessSummaryResponse>>('/ai/business-summary');
    return res.data.data;
  },

  async generatePaymentReminder(
    invoiceId: string,
    tone: 'polite' | 'firm' | 'urgent' = 'polite'
  ): Promise<PaymentReminderResponse> {
    const res = await api.post<ApiResponse<PaymentReminderResponse>>('/ai/payment-reminder', {
      invoiceId,
      tone,
    });
    return res.data.data;
  },

  async writeNote(prompt: string): Promise<WriteNoteResponse> {
    const res = await api.post<ApiResponse<WriteNoteResponse>>('/ai/write-note', { prompt });
    return res.data.data;
  },

  async parseReceipt(file: File): Promise<ParsedReceiptResponse> {
    const formData = new FormData();
    formData.append('receipt', file);

    const res = await api.post<ApiResponse<ParsedReceiptResponse>>('/ai/receipt-parse', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data;
  },
};

export default AIService;
