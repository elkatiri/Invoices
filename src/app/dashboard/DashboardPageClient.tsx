'use client';

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
import { useI18n } from '@/lib/i18n/context';

type DashboardData = {
  clientCount: number;
  invoiceCount: number;
  paidTotal: number;
  pendingTotal: number;
  invoices: (Invoice & { client: { name: string } | null })[];
};

export default function DashboardPageClient({ data }: { data: DashboardData }) {
  const { t } = useI18n();

  const stats = [
    {
      label: t.dashboard.totalClients,
      value: data.clientCount,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: t.dashboard.totalInvoices,
      value: data.invoiceCount,
      icon: FileText,
      color: 'text-orange-brand',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      label: t.dashboard.paidRevenue,
      value: `$${data.paidTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-success',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      label: t.dashboard.pendingAmount,
      value: `$${data.pendingTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: Clock,
      color: 'text-warning',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-800 dark:text-light-50">
          {t.dashboard.title}
        </h1>
        <p className="text-sm text-dark-700 dark:text-light-300 mt-1">
          {t.dashboard.subtitle}
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
            {t.dashboard.recentInvoices}
          </h2>
          <Link
            href="/dashboard/invoices"
            className="text-sm text-orange-brand hover:underline"
          >
            {t.common.viewAll}
          </Link>
        </div>

        {data.invoices && data.invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-light-200 dark:border-dark-700">
                  <th className="text-start py-3 px-2 font-medium text-dark-700 dark:text-light-300">
                    {t.dashboard.invoice}
                  </th>
                  <th className="text-start py-3 px-2 font-medium text-dark-700 dark:text-light-300">
                    {t.dashboard.client}
                  </th>
                  <th className="text-start py-3 px-2 font-medium text-dark-700 dark:text-light-300">
                    {t.dashboard.amount}
                  </th>
                  <th className="text-start py-3 px-2 font-medium text-dark-700 dark:text-light-300">
                    {t.dashboard.status}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-200 dark:divide-dark-700">
                {data.invoices.map((invoice) => (
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
            {t.dashboard.noInvoicesYet}{' '}
            <Link
              href="/dashboard/invoices/new"
              className="text-orange-brand hover:underline"
            >
              {t.dashboard.createFirst}
            </Link>
          </p>
        )}
      </Card>
    </div>
  );
}
