import api from '@/lib/api';
import { ApiResponse } from '@/types/api';
import {
  Payment,
  RecordPaymentInput,
  SSLCommerzCheckoutResponse,
  StripeCheckoutResponse,
  StripeVerifyResponse,
} from '@/types/payment';

export const PaymentService = {
  /**
   * Initiate Stripe Checkout session for an invoice
   */
  async createStripeCheckout(invoiceId: string, amount?: number): Promise<StripeCheckoutResponse> {
    const res = await api.post<ApiResponse<StripeCheckoutResponse>>(
      `/invoices/${invoiceId}/payments/stripe-checkout`,
      { amount }
    );
    return res.data.data;
  },

  /**
   * Verify Stripe session after redirect
   */
  async verifyStripeSession(sessionId: string): Promise<StripeVerifyResponse> {
    const res = await api.get<ApiResponse<StripeVerifyResponse>>(
      `/payments/stripe/verify-session/${sessionId}`
    );
    return res.data.data;
  },

  /**
   * Initiate SSLCommerz Checkout session for an invoice (BD payment rails)
   */
  async createSSLCommerzCheckout(
    invoiceId: string,
    amount?: number
  ): Promise<SSLCommerzCheckoutResponse> {
    const res = await api.post<ApiResponse<SSLCommerzCheckoutResponse>>(
      `/invoices/${invoiceId}/payments/sslcommerz-checkout`,
      { amount }
    );
    return res.data.data;
  },

  /**
   * Record a manual payment (Cash, Bank transfer, etc.)
   */
  async recordManualPayment(
    invoiceId: string,
    payload: RecordPaymentInput
  ): Promise<{ payment: Payment; isFullyPaid: boolean }> {
    const res = await api.post<ApiResponse<{ payment: Payment; isFullyPaid: boolean }>>(
      `/invoices/${invoiceId}/payments`,
      payload
    );
    return res.data.data;
  },

  /**
   * Retrieve all payments made toward an invoice
   */
  async getInvoicePayments(invoiceId: string): Promise<Payment[]> {
    const res = await api.get<ApiResponse<Payment[]>>(`/invoices/${invoiceId}/payments`);
    return res.data.data;
  },

  /**
   * Disburse real funds via Stripe Payouts API (Next.js server route)
   */
  async createStripePayout(payload: {
    amount: number;
    currency?: string;
    destinationRail?: string;
  }): Promise<{
    success: boolean;
    payout: {
      id: string;
      amount: number;
      currency: string;
      status: string;
      arrivalDate: string;
      destination?: string;
      method?: string;
      stripeDashboardUrl: string;
    };
  }> {
    const res = await fetch('/api/payouts/stripe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Stripe Payout failed.');
    }
    return data;
  },

  /**
   * Retrieve real live Stripe balance
   */
  async getStripeBalance(): Promise<{
    success: boolean;
    configured: boolean;
    balance?: {
      available: number;
      pending: number;
      currency: string;
    };
    error?: string;
  }> {
    const res = await fetch('/api/payouts/stripe', { method: 'GET' });
    return await res.json();
  },
};

export default PaymentService;
