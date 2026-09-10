'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
import {
  Plus,
  Search,
  Mail,
  Phone,
  Building2,
  Trash2,
  Users,
  RefreshCw,
  User,
  MapPin,
  FileText,
  ShieldCheck,
  Briefcase,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function ClientsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { data: clientsData, refetch, isLoading, isRefetching } = useClientsQuery();
  const createClientMutation = useCreateClientMutation();
  const deleteClientMutation = useDeleteClientMutation();

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
    if (!isAuthenticated) {
      toast.error('Authentication required', {
        description: 'Please log in or register to add clients.',
        action: {
          label: 'Log In',
          onClick: () => router.push('/login?redirect=/clients'),
        },
      });
      return;
    }
    if (!formData.name) {
      toast.error('Client name is required');
      return;
    }

    try {
      const created = await createClientMutation.mutateAsync(formData);
      if (created && created.id?.startsWith('client_')) {
        toast.success('Client profile created successfully!', {
          description: 'Saved locally (Backend server on port 5000 is currently offline).',
        });
      } else {
        toast.success('Client added successfully');
      }
      setIsModalOpen(false);
      setFormData({ name: '', email: '', company: '', phone: '', address: '', notes: '' });
      refetch();
    } catch (err: any) {
      toast.error(err?.customMessage || 'Failed to create client');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!isAuthenticated) {
      toast.error('Authentication required', {
        description: 'Please log in or register to delete clients.',
        action: {
          label: 'Log In',
          onClick: () => router.push('/login?redirect=/clients'),
        },
      });
      return;
    }
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
    <div className="space-y-8 max-w-7xl mx-auto pb-16 text-slate-100">
      {/* 1. Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
              Client Directory
            </h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/[0.12] text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span>{clients.length} Active Accounts</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 font-normal">
            Manage institutional client portfolios, corporate billing entities, and automated receipt dispatches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="h-10 w-10 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/[0.1] flex items-center justify-center transition-all cursor-pointer shadow-sm"
            title="Refresh accounts"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading || isRefetching ? 'animate-spin' : ''}`} />
          </button>

          <Button
            onClick={() => {
              if (!isAuthenticated) {
                toast.error('Authentication required', {
                  description: 'Please sign in or register to add clients.',
                  action: {
                    label: 'Log In',
                    onClick: () => router.push('/login?redirect=/clients'),
                  },
                });
                return;
              }
              setIsModalOpen(true);
            }}
            className="gap-2 text-xs font-bold h-10 px-5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.35)] border border-indigo-400/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Client
          </Button>
        </div>
      </div>

      {/* 2. Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-white/[0.08] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by client name, corporate entity, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 text-xs bg-slate-950/80 border border-white/[0.1] rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-500 transition-all font-sans"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span>Showing</span>
          <span className="font-bold text-slate-200">{filteredClients.length}</span>
          <span>of {clients.length} profiles</span>
        </div>
      </div>

      {/* 3. Clients Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-6 rounded-3xl bg-slate-900/40 border border-white/[0.06] animate-pulse space-y-4 min-h-[220px]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/80" />
                <div className="space-y-2 flex-1">
                  <div className="w-32 h-4 bg-slate-800/80 rounded" />
                  <div className="w-20 h-3 bg-slate-800/60 rounded" />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="w-full h-3 bg-slate-800/40 rounded" />
                <div className="w-2/3 h-3 bg-slate-800/40 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
          <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-[0_0_16px_rgba(99,102,241,0.2)]">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white">
              No Client Accounts Found
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {search
                ? `No corporate records matching "${search}".`
                : 'Your client directory is currently empty. Add your first client profile to initiate invoicing and settlement tracking.'}
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="gap-2 text-xs font-bold mt-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              Add First Client
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map((client) => {
            const initial = client.name?.charAt(0).toUpperCase() || 'C';

            return (
              <div
                key={client.id}
                className="p-6 rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.35)] hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Specular Top Edge */}
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.2] to-transparent pointer-events-none" />

                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 text-white font-black text-lg flex items-center justify-center shadow-[0_4px_16px_rgba(99,102,241,0.35)] border border-white/20 shrink-0">
                        {initial}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {client.name}
                        </h3>
                        {client.company && (
                          <p className="text-xs text-indigo-300/80 font-medium font-mono mt-0.5">
                            {client.company}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(client.id, client.name)}
                      className="text-slate-500 hover:text-rose-400 p-2 cursor-pointer transition-colors rounded-xl hover:bg-rose-500/10"
                      title="Delete client"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-5 space-y-2.5 text-xs text-slate-400">
                    {client.email && (
                      <div className="flex items-center gap-2.5">
                        <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate text-slate-300 font-sans">{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-2.5">
                        <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="font-mono text-slate-300">{client.phone}</span>
                      </div>
                    )}
                    {client.address && (
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate text-slate-400">{client.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Card Action */}
                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">
                    {client._count?.invoices ?? 0} Invoices Billed
                  </span>

                  <Link
                    href={`/invoices/new?clientId=${client.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 transition-all hover:scale-105"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Bill Client
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Luxury Add Client Modal with Premium Color Grading */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Client Profile"
        description="Enter customer account details for tax-compliant billing and automated receipts."
        maxWidth="lg"
      >
        <form onSubmit={handleCreate} className="space-y-5">
          {/* Row 1: Full Name & Company Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Client Full Name *"
              placeholder="e.g. Md Samim"
              leftIcon={<User className="w-4 h-4" />}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <Input
              label="Company / Business Entity"
              placeholder="e.g. Jomuna Group"
              leftIcon={<Building2 className="w-4 h-4" />}
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
          </div>

          {/* Row 2: Email & Phone Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="samim@jomunagroup.com"
              leftIcon={<Mail className="w-4 h-4" />}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <PhoneInput
              label="Business Phone"
              value={formData.phone}
              onChange={(val) => setFormData({ ...formData, phone: val })}
              defaultCountryCode="BD"
            />
          </div>

          {/* Row 3: Billing Address */}
          <Input
            label="Billing & Tax Address"
            placeholder="e.g. Plot 4, Gulshan-2 Commercial Area, Dhaka 1212"
            leftIcon={<MapPin className="w-4 h-4" />}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          {/* Action Footer */}
          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              className="h-11 px-5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.1] text-xs font-semibold cursor-pointer transition-all"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createClientMutation.isPending}
              className="h-11 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(99,102,241,0.35)] border border-indigo-400/30 cursor-pointer transition-all"
            >
              Save Client Profile
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
