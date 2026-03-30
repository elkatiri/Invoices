import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import InvoiceFormClient from '../InvoiceFormClient';
import type { Client, Invoice, InvoiceItem } from '@/lib/types';

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: invoice }, { data: items }, { data: clients }] =
    await Promise.all([
      supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .eq('user_id', user!.id)
        .single(),
      supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', id)
        .eq('user_id', user!.id)
        .order('created_at'),
      supabase
        .from('clients')
        .select('*')
        .eq('user_id', user!.id)
        .order('name'),
    ]);

  if (!invoice) notFound();

  // Generate next number (not needed for edit but required by component)
  const { data: numberData } = await supabase.rpc('generate_invoice_number', {
    p_user_id: user!.id,
  });

  return (
    <InvoiceFormClient
      clients={(clients as Client[]) ?? []}
      nextInvoiceNumber={numberData ?? invoice.invoice_number}
      invoice={invoice as Invoice}
      existingItems={(items as InvoiceItem[]) ?? []}
    />
  );
}
