export interface StripeCheckoutResponse {
  sessionId: string;
  url: string;
}

export interface StripeVerifyResponse {
  verified: boolean;
  status: string;
  paymentStatus: string;
  amountTotal: number;
  currency: string;
  customerEmail?: string;
  invoiceId?: string;
  isFullyPaid?: boolean;
}

export interface SSLCommerzCheckoutResponse {
  status: string;
  failedreason?: string;
  sessionkey?: string;
  GatewayPageURL: string;
  redirectGatewayURL?: string;
}

export interface RecordPaymentInput {
  amount: number;
  method: 'cash' | 'bank_transfer' | 'stripe' | 'sslcommerz' | 'check' | 'other';
  paidOn?: string;
  notes?: string;
}

export interface Payment {
  id: string;
  userId: string;
  invoiceId: string;
  amount: number;
  method: string;
  paidOn: string;
  notes?: string;
  createdAt: string;
}

