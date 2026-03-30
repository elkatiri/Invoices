import { createClient } from '@/lib/supabase/server';
import {
  Users,
  FileText,
  DollarSign,
  Clock,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import StatusBadge from '@/components/ui/StatusBadge';
import type { Invoice, InvoiceStatus } from '@/lib/types';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ count: clientCount }, { count: invoiceCount }, { data: invoices }] =
    await Promise.all([
      supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id),
      supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id),
      supabase
        .from('invoices')
        .select('*, client:clients(name)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

  const paidTotal =
    invoices
      ?.filter((i: Invoice) => i.status === 'paid')
      .reduce((sum: number, i: Invoice) => sum + Number(i.total), 0) ?? 0;

  const pendingTotal =
    invoices
      ?.filter((i: Invoice) => i.status !== 'paid' && i.status !== 'cancelled')
      .reduce((sum: number, i: Invoice) => sum + Number(i.total), 0) ?? 0;

  const stats = [
    {
      label: 'Total Clients',
      value: clientCount ?? 0,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Total Invoices',
      value: invoiceCount ?? 0,
      icon: FileText,
      color: 'text-orange-brand',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      label: 'Paid Revenue',
      value: `$${paidTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-success',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      label: 'Pending Amount',
      value: `$${pendingTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: Clock,
      color: 'text-warning',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-800 dark:text-light-50">
          Dashboard
        </h1>
        <p className="text-sm text-dark-700 dark:text-light-300 mt-1">
          Overview of your invoicing activity
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <div>
                <p className="text-sm text-dark-700 dark:text-light-300">
                  {stat.label}
                </p>
                <p className="text-xl font-bold text-dark-800 dark:text-light-50">
                  {stat.value}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Invoices */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-dark-800 dark:text-light-50">
            Recent Invoices
          </h2>
          <Link
            href="/dashboard/invoices"
            className="text-sm text-orange-brand hover:underline"
          >
            View all
          </Link>
        </div>

        {invoices && invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-light-200 dark:border-dark-700">
                  <th className="text-left py-3 px-2 font-medium text-dark-700 dark:text-light-300">
                    Invoice
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-dark-700 dark:text-light-300">
                    Client
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-dark-700 dark:text-light-300">
                    Amount
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-dark-700 dark:text-light-300">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-200 dark:divide-dark-700">
                {invoices.map((invoice: Invoice & { client: { name: string } | null }) => (
                  <tr key={invoice.id}>
                    <td className="py-3 px-2">
                      <Link
                        href={`/dashboard/invoices/${invoice.id}`}
                        className="font-medium text-dark-800 dark:text-light-50 hover:text-orange-brand"
                      >
                        {invoice.invoice_number}
                      </Link>
                    </td>
                    <td className="py-3 px-2 text-dark-700 dark:text-light-300">
                      {invoice.client?.name ?? '—'}
                    </td>
                    <td className="py-3 px-2 font-medium text-dark-800 dark:text-light-50">
                      ${Number(invoice.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-2">
                      <StatusBadge status={invoice.status as InvoiceStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-dark-700 dark:text-light-300 py-8 text-center">
            No invoices yet.{' '}
            <Link
              href="/dashboard/invoices/new"
              className="text-orange-brand hover:underline"
            >
              Create your first invoice
            </Link>
          </p>
        )}
      </Card>
    </div>
  );
}
