'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Plus, Users, Pencil, Trash2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import ClientForm from './ClientForm';
import type { Client } from '@/lib/types';

export default function ClientsPageClient({
  initialClients,
}: {
  initialClients: Client[];
}) {
  const [clients, setClients] = useState(initialClients);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this client? This cannot be undone.')) return;

    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete client');
      return;
    }
    setClients((prev) => prev.filter((c) => c.id !== id));
    toast.success('Client deleted');
  };

  const handleSaved = () => {
    setModalOpen(false);
    setEditing(null);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-800 dark:text-light-50">
            Clients
          </h1>
          <p className="text-sm text-dark-700 dark:text-light-300 mt-1">
            Manage your client list
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
          <Plus size={16} />
          Add Client
        </Button>
      </div>

      {clients.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Users size={48} />}
            title="No clients yet"
            description="Add your first client to start creating invoices."
            action={
              <Button onClick={() => setModalOpen(true)}>
                <Plus size={16} />
                Add Client
              </Button>
            }
          />
        </Card>
      ) : (
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-light-200 dark:border-dark-700 bg-light-50 dark:bg-dark-900/50">
                  <th className="text-left py-3 px-4 font-medium text-dark-700 dark:text-light-300">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-dark-700 dark:text-light-300 hidden sm:table-cell">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-dark-700 dark:text-light-300 hidden md:table-cell">
                    Phone
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-dark-700 dark:text-light-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-200 dark:divide-dark-700">
                {clients.map((client) => (
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
        title={editing ? 'Edit Client' : 'Add Client'}
      >
        <ClientForm client={editing} onSaved={handleSaved} />
      </Modal>
    </div>
  );
}
