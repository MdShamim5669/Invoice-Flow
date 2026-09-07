export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanySettings {
  userId: string;
  companyName: string;
  logoUrl?: string;
  address?: string;
  email?: string;
  phone?: string;
  currency: string;
  taxRate: number;
  invoicePrefix: string;
  nextSeq: number;
  accentColor?: string;
  createdAt: string;
  updatedAt: string;
}

export type UpdateCompanySettingsInput = Partial<
  Omit<CompanySettings, 'userId' | 'nextSeq' | 'createdAt' | 'updatedAt'>
>;
