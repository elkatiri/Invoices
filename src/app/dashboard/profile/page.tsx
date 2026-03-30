import { createClient } from '@/lib/supabase/server';
import ProfilePageClient from './ProfilePageClient';
import type { Profile } from '@/lib/types';

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single();

  return <ProfilePageClient profile={profile as Profile} />;
}
