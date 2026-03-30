import { createClient } from '@/lib/supabase/server';
import InvoiceFormClient from '../InvoiceFormClient';
import type { Client } from '@/lib/types';

export default async function NewInvoicePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: clients }, { data: numberData }, { data: profile }] =
    await Promise.all([
      supabase
        .from('clients')
        .select('*')
        .eq('user_id', user!.id)
        .order('name'),
      supabase.rpc('generate_invoice_number', {
        p_user_id: user!.id,
      }),
      supabase
        .from('profiles')
        .select('logo_url')
        .eq('id', user!.id)
        .single(),
    ]);

  return (
    <InvoiceFormClient
      clients={(clients as Client[]) ?? []}
      nextInvoiceNumber={numberData ?? 'INV-0001'}
      logoUrl={profile?.logo_url ?? null}
    />
  );
}
