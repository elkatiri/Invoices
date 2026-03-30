'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import Select from '@/components/ui/Select';
import type { Client, Invoice, InvoiceItem } from '@/lib/types';

type ItemDraft = {
  id?: string;
  description: string;
  quantity: string;
  price: string;
};

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' },
];

const currencyOptions = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CAD', label: 'CAD (C$)' },
  { value: 'AUD', label: 'AUD (A$)' },
];

export default function InvoiceFormClient({
  clients,
  nextInvoiceNumber,
  invoice,
  existingItems,
}: {
  clients: Client[];
  nextInvoiceNumber: string;
  invoice?: Invoice;
  existingItems?: InvoiceItem[];
}) {
  const isEdit = !!invoice;
  const router = useRouter();
  const supabase = createClient();

  const [invoiceNumber, setInvoiceNumber] = useState(
    invoice?.invoice_number ?? nextInvoiceNumber
  );
  const [clientId, setClientId] = useState(invoice?.client_id ?? '');
  const [projectName, setProjectName] = useState(invoice?.project_name ?? '');
  const [description, setDescription] = useState(invoice?.description ?? '');
  const [status, setStatus] = useState(invoice?.status ?? 'draft');
  const [currency, setCurrency] = useState(invoice?.currency ?? 'USD');
  const [notes, setNotes] = useState(invoice?.notes ?? '');
  const [issuedDate, setIssuedDate] = useState(
    invoice?.issued_date ?? new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState(invoice?.due_date ?? '');
  const [isPublic, setIsPublic] = useState(invoice?.is_public ?? true);
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState<ItemDraft[]>(
    existingItems?.map((i) => ({
      id: i.id,
      description: i.description,
      quantity: String(i.quantity),
      price: String(i.price),
    })) ?? [{ description: '', quantity: '1', price: '0' }]
  );

  const total = items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    return sum + qty * price;
  }, 0);

  const addItem = () => {
    setItems((prev) => [...prev, { description: '', quantity: '1', price: '0' }]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ItemDraft, value: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error('Add at least one item');
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error('Not authenticated');
      setLoading(false);
      return;
    }

    const invoicePayload = {
      user_id: user.id,
      client_id: clientId || null,
      invoice_number: invoiceNumber,
      project_name: projectName || null,
      description: description || null,
      status,
      currency,
      notes: notes || null,
      issued_date: issuedDate,
      due_date: dueDate || null,
      is_public: isPublic,
    };

    let invoiceId = invoice?.id;

    if (isEdit) {
      const { error } = await supabase
        .from('invoices')
        .update(invoicePayload)
        .eq('id', invoice!.id);
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      // Delete old items and re-insert
      await supabase.from('invoice_items').delete().eq('invoice_id', invoice!.id);
    } else {
      const { data, error } = await supabase
        .from('invoices')
        .insert(invoicePayload)
        .select('id')
        .single();
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }
      invoiceId = data.id;
    }

    // Insert items
    const itemPayloads = items
      .filter((item) => item.description.trim())
      .map((item) => ({
        invoice_id: invoiceId!,
        user_id: user.id,
        description: item.description,
        quantity: parseFloat(item.quantity) || 0,
        price: parseFloat(item.price) || 0,
      }));

    if (itemPayloads.length > 0) {
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemPayloads);
      if (itemsError) {
        toast.error('Failed to save items: ' + itemsError.message);
        setLoading(false);
        return;
      }
    }

    toast.success(isEdit ? 'Invoice updated' : 'Invoice created');
    router.push('/dashboard/invoices');
    router.refresh();
  };

  const clientOptions = [
    { value: '', label: 'Select a client' },
    ...clients.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/invoices"
          className="p-2 rounded-lg hover:bg-light-100 dark:hover:bg-dark-700 transition-colors"
        >
          <ArrowLeft size={20} className="text-dark-700 dark:text-light-300" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-dark-800 dark:text-light-50">
            {isEdit ? 'Edit Invoice' : 'New Invoice'}
          </h1>
          <p className="text-sm text-dark-700 dark:text-light-300 mt-1">
            {isEdit ? 'Update invoice details' : 'Create a new invoice'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice Details */}
        <Card>
          <h2 className="text-lg font-semibold text-dark-800 dark:text-light-50 mb-4">
            Invoice Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Invoice Number"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              required
            />
            <Select
              label="Client"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              options={clientOptions}
            />
            <Input
              label="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Website Redesign"
            />
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as Invoice['status'])}
              options={statusOptions}
            />
            <Select
              label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              options={currencyOptions}
            />
            <Input
              label="Issued Date"
              type="date"
              value={issuedDate}
              onChange={(e) => setIssuedDate(e.target.value)}
              required
            />
            <Input
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <div className="flex items-center gap-2 self-end pb-1">
              <input
                type="checkbox"
                id="is_public"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 accent-orange-brand"
              />
              <label
                htmlFor="is_public"
                className="text-sm text-dark-700 dark:text-light-300"
              >
                Publicly visible
              </label>
            </div>
          </div>
          <div className="mt-4">
            <TextArea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the work"
            />
          </div>
          <div className="mt-4">
            <TextArea
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Payment terms, thank you note, etc."
            />
          </div>
        </Card>

        {/* Line Items */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-dark-800 dark:text-light-50">
              Line Items
            </h2>
            <Button type="button" variant="secondary" onClick={addItem}>
              <Plus size={14} />
              Add Item
            </Button>
          </div>

          <div className="space-y-3">
            {/* Header */}
            <div className="hidden sm:grid grid-cols-12 gap-3 text-xs font-medium text-dark-700 dark:text-light-300 uppercase px-1">
              <div className="col-span-5">Description</div>
              <div className="col-span-2">Quantity</div>
              <div className="col-span-3">Price</div>
              <div className="col-span-1 text-right">Total</div>
              <div className="col-span-1" />
            </div>

            {items.map((item, index) => {
              const qty = parseFloat(item.quantity) || 0;
              const price = parseFloat(item.price) || 0;
              const lineTotal = qty * price;
              return (
                <div
                  key={index}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start"
                >
                  <div className="sm:col-span-5">
                    <Input
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) =>
                        updateItem(index, 'description', e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, 'quantity', e.target.value)
                      }
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) =>
                        updateItem(index, 'price', e.target.value)
                      }
                    />
                  </div>
                  <div className="sm:col-span-1 flex items-center justify-end h-[38px]">
                    <span className="text-sm font-medium text-dark-800 dark:text-light-50">
                      ${lineTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="sm:col-span-1 flex items-center justify-end h-[38px]">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 size={14} className="text-error" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div className="mt-6 pt-4 border-t border-light-200 dark:border-dark-700 flex justify-end">
            <div className="text-right">
              <p className="text-sm text-dark-700 dark:text-light-300">Total</p>
              <p className="text-2xl font-bold text-dark-800 dark:text-light-50">
                ${total.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link href="/dashboard/invoices">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
          <Button type="submit" loading={loading}>
            {isEdit ? 'Update Invoice' : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </div>
  );
}
