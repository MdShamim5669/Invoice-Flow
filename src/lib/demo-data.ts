import { Invoice } from '@/types/invoice';
import { Client } from '@/types/client';
import { Expense } from '@/types/expense';
import { CompanySettings } from '@/types/user';

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'c-ref-7',
    userId: 'u1',
    name: 'Brooklyn Simmons',
    company: 'Simmons Media & Events',
    email: 'brooklyn@simmons.io',
    phone: '+1 (555) 301-4455',
    address: '742 Evergreen Terrace, Brooklyn, NY',
    notes: 'Keynote Speaker & Host',
    createdAt: new Date('2024-10-11').toISOString(),
    updatedAt: new Date('2024-10-11').toISOString(),
    _count: { invoices: 7 },
  },
  {
    id: 'c-ref-6',
    userId: 'u1',
    name: 'Dianne Russell',
    company: 'Russell Creative Labs',
    email: 'dianne@russell.com',
    phone: '+1 (555) 782-9900',
    address: '100 Market St, San Francisco, CA',
    notes: 'Brand Strategist',
    createdAt: new Date('2024-10-07').toISOString(),
    updatedAt: new Date('2024-10-07').toISOString(),
    _count: { invoices: 6 },
  },
  {
    id: 'c-ref-5',
    userId: 'u1',
    name: 'Annette Black',
    company: 'Blackwood Production',
    email: 'annette@blackwood.design',
    phone: '+1 (555) 234-5678',
    address: '350 5th Ave, New York, NY',
    notes: 'Executive Producer',
    createdAt: new Date('2024-10-07').toISOString(),
    updatedAt: new Date('2024-10-07').toISOString(),
    _count: { invoices: 5 },
  },
  {
    id: 'c-ref-4',
    userId: 'u1',
    name: 'Robert Fox',
    company: 'Fox Visual Architecture',
    email: 'robert@foxarch.com',
    phone: '+1 (555) 890-1234',
    address: '220 Congress Ave, Austin, TX',
    notes: 'Spatial Audio Director',
    createdAt: new Date('2024-10-07').toISOString(),
    updatedAt: new Date('2024-10-07').toISOString(),
    _count: { invoices: 4 },
  },
  {
    id: 'c-ref-3',
    userId: 'u1',
    name: 'Kristin Watson',
    company: 'Watson & Partners Co.',
    email: 'kristin@watson.co',
    phone: '+1 (555) 456-7890',
    address: '450 West 33rd St, Chicago, IL',
    notes: 'Creative Director',
    createdAt: new Date('2024-10-07').toISOString(),
    updatedAt: new Date('2024-10-07').toISOString(),
    _count: { invoices: 3 },
  },
  {
    id: 'c-ref-2',
    userId: 'u1',
    name: 'Arthur Cooper',
    company: 'Cooper Event Network',
    email: 'arthur@cooper.org',
    phone: '+44 20 7946 0192',
    address: '25 Bank Street, London',
    notes: 'Event Sponsor & Partner',
    createdAt: new Date('2024-10-07').toISOString(),
    updatedAt: new Date('2024-10-07').toISOString(),
    _count: { invoices: 2 },
  },
  {
    id: 'c-ref-1',
    userId: 'u1',
    name: 'Theresa Webb',
    company: 'Webb Global Studios',
    email: 'theresa@webb.io',
    phone: '+1 (555) 902-3344',
    address: '100 North Michigan Ave, Chicago, IL',
    notes: 'Chief Marketing Officer',
    createdAt: new Date('2024-10-07').toISOString(),
    updatedAt: new Date('2024-10-07').toISOString(),
    _count: { invoices: 1 },
  },
  {
    id: 'c1',
    userId: 'u1',
    name: 'Sophia Chen',
    company: 'Acme Design Corp',
    email: 'sophia@acmedesign.com',
    phone: '+1 (555) 234-5678',
    address: '742 Evergreen Terrace, San Francisco, CA',
    notes: 'Premium UI retainer client',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _count: { invoices: 3 },
  },
  {
    id: 'c2',
    userId: 'u1',
    name: 'James Carter',
    company: 'BrightWave Studio',
    email: 'james@brightwave.com',
    phone: '+1 (555) 890-1234',
    address: '100 Market St, Austin, TX',
    notes: 'Marketing Director, enterprise contract',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _count: { invoices: 5 },
  },
  {
    id: 'c3',
    userId: 'u1',
    name: 'Alex Rivera',
    company: 'NovaTech Solutions',
    email: 'alex@novatech.io',
    phone: '+1 (555) 456-7890',
    address: '450 West 33rd St, New York, NY',
    notes: 'Full-stack development partner',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _count: { invoices: 2 },
  },
  {
    id: 'c4',
    userId: 'u1',
    name: 'Elena Rostova',
    company: 'Vanguard Capital',
    email: 'elena@vanguardcap.com',
    phone: '+44 20 7946 0912',
    address: '25 Bank Street, Canary Wharf, London',
    notes: 'Fintech client, monthly retainers',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _count: { invoices: 4 },
  },
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'demo-ref-1',
    userId: 'u1',
    clientId: 'c-ref-7',
    invoiceNumber: 'INV-0089',
    status: 'paid',
    paymentMethod: 'Master',
    clientNumber: '#7',
    issueDate: new Date('2024-10-11').toISOString(),
    dueDate: new Date('2024-10-25').toISOString(),
    currency: 'USD',
    taxRate: 0,
    discount: 0,
    subtotal: 50.0,
    taxAmount: 0,
    total: 50.0,
    notes: 'Keynote speaking event invoice.',
    terms: 'Payment received via Mastercard.',
    client: INITIAL_CLIENTS[0],
    items: [{ id: 'item-ref-1', invoiceId: 'demo-ref-1', description: 'Event Speaker Session', quantity: 1, rate: 50.0, amount: 50.0 }],
    createdAt: new Date('2024-10-11').toISOString(),
    updatedAt: new Date('2024-10-11').toISOString(),
  },
  {
    id: 'demo-ref-2',
    userId: 'u1',
    clientId: 'c-ref-6',
    invoiceNumber: 'INV-007',
    status: 'draft',
    paymentMethod: 'Stripe',
    clientNumber: '#6',
    issueDate: new Date('2024-10-07').toISOString(),
    dueDate: new Date('2024-10-21').toISOString(),
    currency: 'USD',
    taxRate: 0,
    discount: 0,
    subtotal: 50.0,
    taxAmount: 0,
    total: 50.0,
    notes: 'Brand Consultation Milestone 1.',
    terms: 'Draft statement pending sign-off.',
    client: INITIAL_CLIENTS[1],
    items: [{ id: 'item-ref-2', invoiceId: 'demo-ref-2', description: 'Brand Workshop Retainer', quantity: 1, rate: 50.0, amount: 50.0 }],
    createdAt: new Date('2024-10-07').toISOString(),
    updatedAt: new Date('2024-10-07').toISOString(),
  },
  {
    id: 'demo-ref-3',
    userId: 'u1',
    clientId: 'c-ref-5',
    invoiceNumber: 'INV-0067',
    status: 'paid',
    paymentMethod: 'Visa',
    clientNumber: '#5',
    issueDate: new Date('2024-10-07').toISOString(),
    dueDate: new Date('2024-10-21').toISOString(),
    currency: 'USD',
    taxRate: 0,
    discount: 0,
    subtotal: 50.0,
    taxAmount: 0,
    total: 50.0,
    notes: 'Event Stage & Visual Direction.',
    terms: 'Settled via Visa Business Card.',
    client: INITIAL_CLIENTS[2],
    items: [{ id: 'item-ref-3', invoiceId: 'demo-ref-3', description: 'Production Direction', quantity: 1, rate: 50.0, amount: 50.0 }],
    createdAt: new Date('2024-10-07').toISOString(),
    updatedAt: new Date('2024-10-07').toISOString(),
  },
  {
    id: 'demo-ref-4',
    userId: 'u1',
    clientId: 'c-ref-4',
    invoiceNumber: 'INV-0055',
    status: 'paid',
    paymentMethod: 'PayPal',
    clientNumber: '#4',
    issueDate: new Date('2024-10-07').toISOString(),
    dueDate: new Date('2024-10-21').toISOString(),
    currency: 'USD',
    taxRate: 0,
    discount: 0,
    subtotal: 50.0,
    taxAmount: 0,
    total: 50.0,
    notes: 'Spatial Audio Design.',
    terms: 'Settled via PayPal.',
    client: INITIAL_CLIENTS[3],
    items: [{ id: 'item-ref-4', invoiceId: 'demo-ref-4', description: 'Audio Engineering', quantity: 1, rate: 50.0, amount: 50.0 }],
    createdAt: new Date('2024-10-07').toISOString(),
    updatedAt: new Date('2024-10-07').toISOString(),
  },
  {
    id: 'demo-ref-5',
    userId: 'u1',
    clientId: 'c-ref-3',
    invoiceNumber: 'INV-0034',
    status: 'paid',
    paymentMethod: 'Stripe',
    clientNumber: '#3',
    issueDate: new Date('2024-10-07').toISOString(),
    dueDate: new Date('2024-10-21').toISOString(),
    currency: 'USD',
    taxRate: 0,
    discount: 0,
    subtotal: 50.0,
    taxAmount: 0,
    total: 50.0,
    notes: 'Creative Partnership Retainer.',
    terms: 'Settled via Stripe Checkout.',
    client: INITIAL_CLIENTS[4],
    items: [{ id: 'item-ref-5', invoiceId: 'demo-ref-5', description: 'Creative Advisory', quantity: 1, rate: 50.0, amount: 50.0 }],
    createdAt: new Date('2024-10-07').toISOString(),
    updatedAt: new Date('2024-10-07').toISOString(),
  },
  {
    id: 'demo-ref-6',
    userId: 'u1',
    clientId: 'c-ref-2',
    invoiceNumber: 'INV-0022',
    status: 'draft',
    paymentMethod: 'Wise',
    clientNumber: '#2',
    issueDate: new Date('2024-10-07').toISOString(),
    dueDate: new Date('2024-10-21').toISOString(),
    currency: 'USD',
    taxRate: 0,
    discount: 0,
    subtotal: 50.0,
    taxAmount: 0,
    total: 50.0,
    notes: 'European Event Sponsorship.',
    terms: 'Awaiting Wise transfer confirmation.',
    client: INITIAL_CLIENTS[5],
    items: [{ id: 'item-ref-6', invoiceId: 'demo-ref-6', description: 'Event Sponsorship Tier A', quantity: 1, rate: 50.0, amount: 50.0 }],
    createdAt: new Date('2024-10-07').toISOString(),
    updatedAt: new Date('2024-10-07').toISOString(),
  },
  {
    id: 'demo-ref-7',
    userId: 'u1',
    clientId: 'c-ref-1',
    invoiceNumber: 'INV-0012',
    status: 'paid',
    paymentMethod: 'American E.',
    clientNumber: '#1',
    issueDate: new Date('2024-10-07').toISOString(),
    dueDate: new Date('2024-10-21').toISOString(),
    currency: 'USD',
    taxRate: 0,
    discount: 0,
    subtotal: 50.0,
    taxAmount: 0,
    total: 50.0,
    notes: 'Marketing Strategy Package.',
    terms: 'Settled via American Express.',
    client: INITIAL_CLIENTS[6],
    items: [{ id: 'item-ref-7', invoiceId: 'demo-ref-7', description: 'Marketing Review', quantity: 1, rate: 50.0, amount: 50.0 }],
    createdAt: new Date('2024-10-07').toISOString(),
    updatedAt: new Date('2024-10-07').toISOString(),
  },
  {
    id: 'demo-1',
    userId: 'u1',
    clientId: 'c1',
    invoiceNumber: 'INV-1001',
    status: 'draft',
    paymentMethod: 'Stripe',
    clientNumber: '#8',
    issueDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    currency: 'USD',
    taxRate: 0,
    discount: 0,
    subtotal: 68750,
    taxAmount: 0,
    total: 68750,
    notes: 'Thank you for your partnership! Please send payment within 14 days.',
    terms: 'Payment due upon receipt.',
    client: INITIAL_CLIENTS[0],
    items: [
      { id: 'item-1', invoiceId: 'demo-1', description: 'Design System & Tokenization', quantity: 1, rate: 38750, amount: 38750 },
      { id: 'item-2', invoiceId: 'demo-1', description: 'Mobile App Wireframing', quantity: 1, rate: 30000, amount: 30000 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    userId: 'u1',
    clientId: 'c3',
    invoiceNumber: 'INV-1002',
    status: 'sent',
    issueDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 4 * 86400000).toISOString(),
    currency: 'USD',
    taxRate: 0,
    discount: 0,
    subtotal: 21480,
    taxAmount: 0,
    total: 21480,
    notes: 'Sprint 14 backend deliverable.',
    terms: 'Net 30 days.',
    client: INITIAL_CLIENTS[2],
    items: [{ id: 'item-3', invoiceId: 'demo-2', description: 'Backend API Integration & Microservices', quantity: 1, rate: 21480, amount: 21480 }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    userId: 'u1',
    clientId: 'c2',
    invoiceNumber: 'INV-1003',
    status: 'sent',
    issueDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    currency: 'USD',
    taxRate: 0,
    discount: 0,
    subtotal: 47980,
    taxAmount: 0,
    total: 47980,
    notes: 'Full-cycle design and development sprint.',
    terms: 'Payable via Stripe or Bank Transfer.',
    client: INITIAL_CLIENTS[1],
    items: [
      { id: 'item-4', invoiceId: 'demo-3', description: 'UI/UX Design Retainer', quantity: 1, rate: 15990, amount: 15990 },
      { id: 'item-5', invoiceId: 'demo-3', description: 'Next.js Frontend Engineering', quantity: 1, rate: 21250, amount: 21250 },
      { id: 'item-6', invoiceId: 'demo-3', description: 'QA & E2E Testing Suite', quantity: 1, rate: 10740, amount: 10740 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-4',
    userId: 'u1',
    clientId: 'c4',
    invoiceNumber: 'INV-1004',
    status: 'overdue',
    issueDate: new Date(Date.now() - 35 * 86400000).toISOString(),
    dueDate: new Date(Date.now() - 5 * 86400000).toISOString(),
    currency: 'USD',
    taxRate: 5,
    discount: 1000,
    subtotal: 54000,
    taxAmount: 2650,
    total: 55650,
    notes: 'Overdue balance for Q1 financial portal build.',
    terms: 'Immediate settlement required.',
    client: INITIAL_CLIENTS[3],
    items: [{ id: 'item-7', invoiceId: 'demo-4', description: 'Fintech Trading Dashboard V1', quantity: 1, rate: 54000, amount: 54000 }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-5',
    userId: 'u1',
    clientId: 'c1',
    invoiceNumber: 'INV-1005',
    status: 'paid',
    issueDate: new Date(Date.now() - 15 * 86400000).toISOString(),
    dueDate: new Date(Date.now() - 1 * 86400000).toISOString(),
    currency: 'USD',
    taxRate: 0,
    discount: 0,
    subtotal: 35000,
    taxAmount: 0,
    total: 35000,
    notes: 'Paid in full via Stripe.',
    terms: 'Receipt generated.',
    client: INITIAL_CLIENTS[0],
    items: [{ id: 'item-8', invoiceId: 'demo-5', description: 'Brand Identity & Guidelines', quantity: 1, rate: 35000, amount: 35000 }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    userId: 'u1',
    vendor: 'Figma Professional',
    category: 'Software & Tools',
    amount: 15,
    currency: 'USD',
    expenseDate: '2026-03-01',
    notes: 'Annual design subscription',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'exp-2',
    userId: 'u1',
    vendor: 'Hostinger Cloud VPS',
    category: 'Hosting & Servers',
    amount: 29.99,
    currency: 'USD',
    expenseDate: '2026-03-03',
    notes: 'Production server hosting',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'exp-3',
    userId: 'u1',
    vendor: 'OpenAI API Credit',
    category: 'AI & Services',
    amount: 50,
    currency: 'USD',
    expenseDate: '2026-03-05',
    notes: 'LLM token usage for automation',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'exp-4',
    userId: 'u1',
    vendor: 'WeWork Hotdesk',
    category: 'Office & Workspace',
    amount: 120,
    currency: 'USD',
    expenseDate: '2026-03-06',
    notes: 'Monthly co-working space pass',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const STORAGE_KEYS = {
  INVOICES: 'invoiceflow_local_invoices_v2',
  CLIENTS: 'invoiceflow_local_clients_v2',
  EXPENSES: 'invoiceflow_local_expenses_v1',
  SETTINGS: 'invoiceflow_local_settings_v1',
};

export const DemoStorage = {
  getInvoices: (): Invoice[] => {
    if (typeof window === 'undefined') return INITIAL_INVOICES;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.INVOICES);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
        return INITIAL_INVOICES;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_INVOICES;
    }
  },

  saveInvoice: (invoice: Invoice): Invoice[] => {
    const list = DemoStorage.getInvoices();
    const existingIndex = list.findIndex((i) => i.id === invoice.id);
    let updated: Invoice[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = invoice;
    } else {
      updated = [invoice, ...list];
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(updated));
    }
    return updated;
  },

  updateInvoiceStatus: (id: string, status: Invoice['status']): Invoice | null => {
    const list = DemoStorage.getInvoices();
    const index = list.findIndex((i) => i.id === id);
    if (index === -1) return null;
    list[index] = { ...list[index], status };
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(list));
    }
    return list[index];
  },

  getClients: (): Client[] => {
    if (typeof window === 'undefined') return INITIAL_CLIENTS;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(INITIAL_CLIENTS));
        return INITIAL_CLIENTS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_CLIENTS;
    }
  },

  saveClient: (client: Client): Client[] => {
    const list = DemoStorage.getClients();
    const updated = [client, ...list];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(updated));
    }
    return updated;
  },

  deleteClient: (id: string): Client[] => {
    const list = DemoStorage.getClients().filter((c) => c.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(list));
    }
    return list;
  },

  getExpenses: (): Expense[] => {
    if (typeof window === 'undefined') return INITIAL_EXPENSES;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
        return INITIAL_EXPENSES;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_EXPENSES;
    }
  },

  saveExpense: (expense: Expense): Expense[] => {
    const list = DemoStorage.getExpenses();
    const updated = [expense, ...list];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated));
    }
    return updated;
  },

  deleteExpense: (id: string): Expense[] => {
    const list = DemoStorage.getExpenses().filter((e) => e.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(list));
    }
    return list;
  },

  getSettings: (): CompanySettings => {
    const defaultSettings: CompanySettings = {
      userId: 'u1',
      companyName: 'Finnova Studio Inc.',
      email: 'billing@finnova.io',
      phone: '+1 (555) 019-2834',
      address: 'Suite 400, 100 Montgomery St, San Francisco, CA',
      currency: 'USD',
      taxRate: 5,
      invoicePrefix: 'INV-',
      nextSeq: 1006,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (typeof window === 'undefined') return defaultSettings;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
        return defaultSettings;
      }
      return JSON.parse(stored);
    } catch {
      return defaultSettings;
    }
  },

  saveSettings: (settings: Partial<CompanySettings>): CompanySettings => {
    const current = DemoStorage.getSettings();
    const updated = { ...current, ...settings, updatedAt: new Date().toISOString() };
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    }
    return updated;
  },
};
