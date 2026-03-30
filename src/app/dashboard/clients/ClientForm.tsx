'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import type { Client } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';

export default function ClientForm({
  client,
  onSaved,
}: {
  client: Client | null;
  onSaved: (saved: Client) => void;
}) {
  const [name, setName] = useState(client?.name ?? '');
  const [email, setEmail] = useState(client?.email ?? '');
  const [phone, setPhone] = useState(client?.phone ?? '');
  const [address, setAddress] = useState(client?.address ?? '');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const { t } = useI18n();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error('Not authenticated');
      setLoading(false);
      return;
    }

    const payload = {
      name,
      email: email || null,
      phone: phone || null,
      address: address || null,
      user_id: user.id,
    };

    if (client) {
      const { data, error } = await supabase
        .from('clients')
        .update(payload)
        .eq('id', client.id)
        .select()
        .single();
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }
      toast.success(t.clients.updateSuccess);
      onSaved(data as Client);
    } else {
      const { data, error } = await supabase
        .from('clients')
        .insert(payload)
        .select()
        .single();
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }
      toast.success(t.clients.createSuccess);
      onSaved(data as Client);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label={t.clients.name}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t.clients.clientName}
        required
      />
      <Input
        label={t.clients.email}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="client@example.com"
      />
      <Input
        label={t.clients.phone}
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+1 234 567 890"
      />
      <TextArea
        label={t.clients.address}
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="123 Main St, City, Country"
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>
          {client ? t.clients.updateClient : t.clients.addClient}
        </Button>
      </div>
    </form>
  );
}
