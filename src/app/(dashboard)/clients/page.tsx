'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { Modal } from '@/components/ui/modal';
import {
  useClientsQuery,
  useCreateClientMutation,
  useDeleteClientMutation,
} from '@/hooks/queries/useClients';
import { Client, CreateClientInput } from '@/types/client';
import { Plus, Search, Mail, Phone, Building, Trash2, Users, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function ClientsPage() {
  const { data: clientsData, refetch, isLoading, isRefetching } = useClientsQuery();
  const createClientMutation = useCreateClientMutation();
  const deleteClientMutation = useDeleteClientMutation();

  // Dynamic clients directly from backend
  const clients: Client[] = clientsData || [];

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');

  const [formData, setFormData] = useState<CreateClientInput>({
    name: '',
    email: '',
    company: '',
    phone: '',
    address: '',
    notes: '',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Client name is required');
      return;
    }

    try {
      await createClientMutation.mutateAsync(formData);
      toast.success('Client added successfully');
      setIsModalOpen(false);
      setFormData({ name: '', email: '', company: '', phone: '', address: '', notes: '' });
      refetch();
    } catch (err: any) {
      toast.error(err?.customMessage || 'Failed to create client');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? Existing invoices will be preserved.`)) return;
    try {
      await deleteClientMutation.mutateAsync(id);
      toast.success('Client deleted');
      refetch();
    } catch (err: any) {
      toast.error(err?.customMessage || 'Failed to delete client');
    }
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(search.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white font-sans">
              Client Directory
            </h1>
            <button
              onClick={() => refetch()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              title="Refresh from backend"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading || isRefetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Manage your accounts, billing contacts, and bill clients in one click.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add New Client
          </Button>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by client name, company, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100"
          />
        </div>

        <span className="text-xs text-slate-400 font-medium hidden sm:inline font-mono">
          {filteredClients.length} accounts found
        </span>
      </div>

      {/* Clients Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6 animate-pulse space-y-4 rounded-3xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                <div className="space-y-2">
                  <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="w-20 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : filteredClients.length === 0 ? (
        <Card className="p-16 text-center rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No clients found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {search
                ? `No records matching "${search}".`
                : 'Your client directory is currently empty. Add your first customer profile to start billing.'}
            </p>
            <Button onClick={() => setIsModalOpen(true)} className="gap-2 text-xs">
              <Plus className="w-3.5 h-3.5" />
              Add Client
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map((client) => {
            const initial = client.name?.charAt(0).toUpperCase() || 'C';

            return (
              <Card
                key={client.id}
                className="p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-black text-lg flex items-center justify-center shadow-sm shrink-0">
                        {initial}
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                          {client.name}
                        </h3>
                        {client.company && (
                          <p className="text-xs text-slate-500 font-medium">{client.company}</p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(client.id, client.name)}
                      className="text-slate-300 hover:text-rose-500 p-1.5 cursor-pointer transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Delete client"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-5 space-y-2 text-xs text-slate-500">
                    {client.email && (
                      <div className="flex items-center gap-2.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-2.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                    {client.address && (
                      <div className="flex items-center gap-2.5">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{client.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Card Action: "+ Bill Client" shortcut */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">
                    {client._count?.invoices ?? 0} Invoices Billed
                  </span>

                  <Link
                    href={`/invoices/new?clientId=${client.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Bill Client
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Client Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Client"
        description="Enter customer profile details for billing and automated receipts."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Client Full Name *"
            placeholder="e.g. Marcus Vance"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Company Name"
            placeholder="e.g. Vance Media Group"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email Address"
              type="email"
              placeholder="marcus@vancemedia.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <PhoneInput
              label="Phone"
              value={formData.phone}
              onChange={(val) => setFormData({ ...formData, phone: val })}
              defaultCountryCode="BD"
            />
          </div>
          <Input
            label="Billing Address"
            placeholder="450 West 33rd St, New York, NY"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={createClientMutation.isPending}>
              Save Client
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
