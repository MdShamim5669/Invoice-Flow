'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import {
  useCompanySettingsQuery,
  useUpdateCompanySettingsMutation,
} from '@/hooks/queries/useCompany';
import { UpdateCompanySettingsInput } from '@/types/user';
import { Save, Building2, Shield, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { data: serverSettings, isLoading } = useCompanySettingsQuery();
  const updateSettingsMutation = useUpdateCompanySettingsMutation();
  const isSaving = updateSettingsMutation.isPending;

  const [formData, setFormData] = useState<UpdateCompanySettingsInput>({
    companyName: 'Finnova Studio Inc.',
    email: 'billing@finnova.io',
    phone: '',
    address: 'Suite 400, 100 Montgomery St, San Francisco, CA',
    currency: 'USD',
    taxRate: 5,
    invoicePrefix: 'INV-',
  });

  useEffect(() => {
    if (serverSettings) {
      setFormData({
        companyName: serverSettings.companyName || '',
        email: serverSettings.email || '',
        phone: serverSettings.phone || '',
        address: serverSettings.address || '',
        currency: serverSettings.currency || 'USD',
        taxRate: Number(serverSettings.taxRate) || 0,
        invoicePrefix: serverSettings.invoicePrefix || 'INV-',
      });
    }
  }, [serverSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettingsMutation.mutateAsync(formData);
      toast.success('Company settings saved successfully!');
    } catch (err: any) {
      toast.error(err?.customMessage || 'Failed to save settings');
    }
  };

  return (
    <form onSubmit={handleSave} className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white font-sans">
            Company & Billing Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Configure default agency profile, currency, tax rates, and invoice numbering.
          </p>
        </div>

        <Button type="submit" isLoading={isSaving} className="gap-2 shadow-sm">
          <Save className="w-4 h-4" />
          Save Settings
        </Button>
      </div>

      <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Building2 className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Business Profile & Legal Entity
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Company / Agency Name"
            placeholder="e.g. Finnova Studio Inc."
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            required
          />
          <Input
            label="Business Billing Email"
            type="email"
            placeholder="billing@finnova.io"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <PhoneInput
            label="Business Phone"
            value={formData.phone}
            onChange={(val) => setFormData({ ...formData, phone: val })}
            defaultCountryCode="BD"
          />
          <Input
            label="Office / Headquarters Address"
            placeholder="Suite 400, 100 Montgomery St, San Francisco, CA"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>
      </Card>

      <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Shield className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Invoicing Defaults & Tax Configuration (PRD Section 3.5)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Default Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500"
            >
              <option value="USD">USD ($) - US Dollar</option>
              <option value="BDT">BDT (৳) - Bangladeshi Taka</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="GBP">GBP (£) - British Pound</option>
              <option value="INR">INR (₹) - Indian Rupee</option>
            </select>
          </div>

          <Input
            label="Default Tax Rate (%)"
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={formData.taxRate || ''}
            onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })}
          />

          <Input
            label="Invoice Prefix"
            placeholder="INV-"
            value={formData.invoicePrefix}
            onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
          />
        </div>
      </Card>

      <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0" />
        <p className="text-xs text-slate-600 dark:text-slate-300">
          All changes apply immediately to newly generated invoices, client receipts, and automated PDF exports.
        </p>
      </div>
    </form>
  );
}
