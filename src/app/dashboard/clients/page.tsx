import { createClient } from '@/lib/supabase/server';
import ClientsPageClient from './ClientsPageClient';
import type { Client } from '@/lib/types';

export default async function ClientsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false });

  return <ClientsPageClient initialClients={(clients as Client[]) ?? []} />;
}
