import { createClient } from '@/lib/supabase/server';
import type { Invoice } from '@/lib/types';
import DashboardPageClient from './DashboardPageClient';

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

  return (
    <DashboardPageClient
      data={{
        clientCount: clientCount ?? 0,
        invoiceCount: invoiceCount ?? 0,
        paidTotal,
        pendingTotal,
        invoices: (invoices ?? []) as (Invoice & { client: { name: string } | null })[],
      }}
    />
  );
}
