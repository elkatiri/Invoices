import { createClient } from '@/lib/supabase/server';
import InvoicesPageClient from './InvoicesPageClient';
import type { Invoice } from '@/lib/types';

export default async function InvoicesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, client:clients(name)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false });

  return <InvoicesPageClient initialInvoices={(invoices as Invoice[]) ?? []} />;
}
