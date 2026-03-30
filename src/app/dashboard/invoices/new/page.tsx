import { createClient } from '@/lib/supabase/server';
import InvoiceFormClient from '../InvoiceFormClient';
import type { Client } from '@/lib/types';

export default async function NewInvoicePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user!.id)
    .order('name');

  // Generate next invoice number
  const { data: numberData } = await supabase.rpc('generate_invoice_number', {
    p_user_id: user!.id,
  });

  return (
    <InvoiceFormClient
      clients={(clients as Client[]) ?? []}
      nextInvoiceNumber={numberData ?? 'INV-0001'}
    />
  );
}
