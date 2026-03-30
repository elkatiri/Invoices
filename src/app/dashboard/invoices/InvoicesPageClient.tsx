'use client';

import { useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Plus, FileText, Trash2, Eye, ExternalLink, Search } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import type { Invoice, InvoiceStatus } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';

export default function InvoicesPageClient({
  initialInvoices,
}: {
  initialInvoices: Invoice[];
}) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const router = useRouter();
  const supabase = createClient();
  const { t } = useI18n();

  const statusFilters = [
    { value: 'all', label: t.invoices.allStatuses },
    { value: 'draft', label: t.invoices.draft },
    { value: 'sent', label: t.invoices.sent },
    { value: 'paid', label: t.invoices.paid },
    { value: 'overdue', label: t.invoices.overdue },
    { value: 'cancelled', label: t.invoices.cancelled },
  ];

  const filtered = useMemo(() => {
    let result = invoices;
    if (statusFilter !== 'all') {
      result = result.filter((i) => i.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.invoice_number.toLowerCase().includes(q) ||
          (i as Invoice & { client?: { name: string } | null }).client?.name?.toLowerCase().includes(q) ||
          i.project_name?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [invoices, search, statusFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm(t.invoices.deleteConfirm)) return;

    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (error) {
      toast.error(t.invoices.deleteFailed);
      return;
    }
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    toast.success(t.invoices.deleteSuccess);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-800 dark:text-light-50">
            {t.invoices.title}
          </h1>
          <p className="text-sm text-dark-700 dark:text-light-300 mt-1">
            {t.invoices.subtitle}
          </p>
        </div>
        <Link href="/dashboard/invoices/new">
          <Button>
            <Plus size={16} />
            {t.invoices.newInvoice}
          </Button>
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-light-300 dark:text-dark-700" />
          <input
            type="text"
            placeholder={t.invoices.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full ps-9 pe-3 py-2 rounded-lg border border-light-200 dark:border-dark-700 bg-white dark:bg-dark-900 text-dark-800 dark:text-light-50 placeholder-light-300 dark:placeholder-dark-700 focus:outline-none focus:ring-2 focus:ring-orange-brand/50 focus:border-orange-brand transition-colors text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-light-200 dark:border-dark-700 bg-white dark:bg-dark-900 text-dark-800 dark:text-light-50 focus:outline-none focus:ring-2 focus:ring-orange-brand/50 focus:border-orange-brand transition-colors text-sm"
        >
          {statusFilters.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FileText size={48} />}
            title={t.invoices.noInvoicesTitle}
            description={t.invoices.noInvoicesDesc}
            action={
              <Link href="/dashboard/invoices/new">
                <Button>
                  <Plus size={16} />
                  {t.invoices.newInvoice}
                </Button>
              </Link>
            }
          />
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Search size={48} />}
            title={t.invoices.noMatchesTitle}
            description={t.invoices.noMatchesDesc}
          />
        </Card>
      ) : (
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-light-200 dark:border-dark-700 bg-light-50 dark:bg-dark-900/50">
                  <th className="text-start py-3 px-4 font-medium text-dark-700 dark:text-light-300">
                    {t.invoices.invoiceNumber}
                  </th>
                  <th className="text-start py-3 px-4 font-medium text-dark-700 dark:text-light-300 hidden sm:table-cell">
                    {t.invoices.client}
                  </th>
                  <th className="text-start py-3 px-4 font-medium text-dark-700 dark:text-light-300 hidden md:table-cell">
                    {t.invoices.project}
                  </th>
                  <th className="text-end py-3 px-4 font-medium text-dark-700 dark:text-light-300">
                    {t.invoices.amount}
                  </th>
                  <th className="text-start py-3 px-4 font-medium text-dark-700 dark:text-light-300">
                    {t.invoices.status}
                  </th>
                  <th className="text-end py-3 px-4 font-medium text-dark-700 dark:text-light-300">
                    {t.common.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-200 dark:divide-dark-700">
                {filtered.map((invoice: Invoice & { client?: { name: string } | null }) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-light-50 dark:hover:bg-dark-700/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-dark-800 dark:text-light-50">
                      {invoice.invoice_number}
                    </td>
                    <td className="py-3 px-4 text-dark-700 dark:text-light-300 hidden sm:table-cell">
                      {invoice.client?.name ?? '—'}
                    </td>
                    <td className="py-3 px-4 text-dark-700 dark:text-light-300 hidden md:table-cell">
                      {invoice.project_name ?? '—'}
                    </td>
                    <td className="py-3 px-4 text-end font-medium text-dark-800 dark:text-light-50">
                      ${Number(invoice.total).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={invoice.status as InvoiceStatus} />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/dashboard/invoices/${invoice.id}`}
                          className="p-2 rounded-lg hover:bg-light-100 dark:hover:bg-dark-700 transition-colors"
                        >
                          <Eye
                            size={14}
                            className="text-dark-700 dark:text-light-300"
                          />
                        </Link>
                        <Link
                          href={`/invoice/${invoice.id}`}
                          target="_blank"
                          className="p-2 rounded-lg hover:bg-light-100 dark:hover:bg-dark-700 transition-colors"
                        >
                          <ExternalLink
                            size={14}
                            className="text-dark-700 dark:text-light-300"
                          />
                        </Link>
                        <button
                          onClick={() => handleDelete(invoice.id)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 size={14} className="text-error" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
