'use client';

import { useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Plus, Users, Pencil, Trash2, Search } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import ClientForm from './ClientForm';
import type { Client } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';

export default function ClientsPageClient({
  initialClients,
}: {
  initialClients: Client[];
}) {
  const [clients, setClients] = useState(initialClients);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const { t } = useI18n();

  const filtered = useMemo(() => {
    if (!search.trim()) return clients;
    const q = search.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q)
    );
  }, [clients, search]);

  const handleDelete = async (id: string) => {
    if (!confirm(t.clients.deleteConfirm)) return;

    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) {
      toast.error(t.clients.deleteFailed);
      return;
    }
    setClients((prev) => prev.filter((c) => c.id !== id));
    toast.success(t.clients.deleteSuccess);
  };

  const handleSaved = (saved: Client) => {
    if (editing) {
      setClients((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
    } else {
      setClients((prev) => [saved, ...prev]);
    }
    setModalOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-800 dark:text-light-50">
            {t.clients.title}
          </h1>
          <p className="text-sm text-dark-700 dark:text-light-300 mt-1">
            {t.clients.subtitle}
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
          <Plus size={16} />
          {t.clients.addClient}
        </Button>
      </div>

      {/* Search */}
      {clients.length > 0 && (
        <div className="relative">
          <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-light-300 dark:text-dark-700" />
          <input
            type="text"
            placeholder={t.clients.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:max-w-sm ps-9 pe-3 py-2 rounded-lg border border-light-200 dark:border-dark-700 bg-white dark:bg-dark-900 text-dark-800 dark:text-light-50 placeholder-light-300 dark:placeholder-dark-700 focus:outline-none focus:ring-2 focus:ring-orange-brand/50 focus:border-orange-brand transition-colors text-sm"
          />
        </div>
      )}

      {clients.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Users size={48} />}
            title={t.clients.noClientsTitle}
            description={t.clients.noClientsDesc}
            action={
              <Button onClick={() => setModalOpen(true)}>
                <Plus size={16} />
                {t.clients.addClient}
              </Button>
            }
          />
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Search size={48} />}
            title={t.clients.noMatchesTitle}
            description={t.clients.noMatchesDesc}
          />
        </Card>
      ) : (
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-light-200 dark:border-dark-700 bg-light-50 dark:bg-dark-900/50">
                  <th className="text-start py-3 px-4 font-medium text-dark-700 dark:text-light-300">
                    {t.clients.name}
                  </th>
                  <th className="text-start py-3 px-4 font-medium text-dark-700 dark:text-light-300 hidden sm:table-cell">
                    {t.clients.email}
                  </th>
                  <th className="text-start py-3 px-4 font-medium text-dark-700 dark:text-light-300 hidden md:table-cell">
                    {t.clients.phone}
                  </th>
                  <th className="text-end py-3 px-4 font-medium text-dark-700 dark:text-light-300">
                    {t.common.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-200 dark:divide-dark-700">
                {filtered.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-light-50 dark:hover:bg-dark-700/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-dark-800 dark:text-light-50">
                      {client.name}
                    </td>
                    <td className="py-3 px-4 text-dark-700 dark:text-light-300 hidden sm:table-cell">
                      {client.email ?? '—'}
                    </td>
                    <td className="py-3 px-4 text-dark-700 dark:text-light-300 hidden md:table-cell">
                      {client.phone ?? '—'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditing(client);
                            setModalOpen(true);
                          }}
                          className="p-2 rounded-lg hover:bg-light-100 dark:hover:bg-dark-700 transition-colors"
                        >
                          <Pencil
                            size={14}
                            className="text-dark-700 dark:text-light-300"
                          />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 size={14} className="text-error" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        title={editing ? t.clients.editClient : t.clients.addClient}
      >
        <ClientForm client={editing} onSaved={handleSaved} />
      </Modal>
    </div>
  );
}
