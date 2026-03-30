'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Plus, FileText, Trash2, Eye, ExternalLink } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import type { Invoice, InvoiceStatus } from '@/lib/types';

export default function InvoicesPageClient({
  initialInvoices,
}: {
  initialInvoices: Invoice[];
}) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this invoice? This cannot be undone.')) return;

    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete invoice');
      return;
    }
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    toast.success('Invoice deleted');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-800 dark:text-light-50">
            Invoices
          </h1>
          <p className="text-sm text-dark-700 dark:text-light-300 mt-1">
            Create and manage your invoices
          </p>
        </div>
        <Link href="/dashboard/invoices/new">
          <Button>
            <Plus size={16} />
            New Invoice
          </Button>
        </Link>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FileText size={48} />}
            title="No invoices yet"
            description="Create your first invoice to get started."
            action={
              <Link href="/dashboard/invoices/new">
                <Button>
                  <Plus size={16} />
                  New Invoice
                </Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-light-200 dark:border-dark-700 bg-light-50 dark:bg-dark-900/50">
                  <th className="text-left py-3 px-4 font-medium text-dark-700 dark:text-light-300">
                    Invoice #
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-dark-700 dark:text-light-300 hidden sm:table-cell">
                    Client
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-dark-700 dark:text-light-300 hidden md:table-cell">
                    Project
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-dark-700 dark:text-light-300">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-dark-700 dark:text-light-300">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-dark-700 dark:text-light-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-200 dark:divide-dark-700">
                {invoices.map((invoice: Invoice & { client?: { name: string } | null }) => (
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
                    <td className="py-3 px-4 text-right font-medium text-dark-800 dark:text-light-50">
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
