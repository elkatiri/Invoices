'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Plus, Trash2, ArrowLeft, Upload, User } from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import Select from '@/components/ui/Select';
import type { Client, Invoice, InvoiceItem } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';

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
  { value: 'DH', label: 'Dirham (DH)' },
];

export default function InvoiceFormClient({
  clients,
  nextInvoiceNumber,
  invoice,
  existingItems,
  logoUrl: initialLogoUrl,
}: {
  clients: Client[];
  nextInvoiceNumber: string;
  invoice?: Invoice;
  existingItems?: InvoiceItem[];
  logoUrl?: string | null;
}) {
  const isEdit = !!invoice;
  const router = useRouter();
  const supabase = createClient();
  const { t } = useI18n();

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
  const [taxRate, setTaxRate] = useState(String(invoice?.tax_rate ?? 0));
  const [discount, setDiscount] = useState(String(invoice?.discount ?? 0));
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl ?? '');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PNG, JPEG, WebP, and SVG files are allowed');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploading(false); return; }

    const ext = file.name.split('.').pop();
    const filePath = `${user.id}/logo.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error('Upload failed: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(filePath);

    await supabase.from('profiles').update({ logo_url: publicUrl }).eq('id', user.id);

    setLogoUrl(publicUrl);
    setUploading(false);
    toast.success('Logo uploaded');
  };

  const [items, setItems] = useState<ItemDraft[]>(
    existingItems?.map((i) => ({
      id: i.id,
      description: i.description,
      quantity: String(i.quantity),
      price: String(i.price),
    })) ?? [{ description: '', quantity: '1', price: '0' }]
  );

  const subtotal = items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    return sum + qty * price;
  }, 0);

  const discountNum = parseFloat(discount) || 0;
  const taxRateNum = parseFloat(taxRate) || 0;
  const afterDiscount = Math.max(subtotal - discountNum, 0);
  const taxAmount = afterDiscount * (taxRateNum / 100);
  const total = afterDiscount + taxAmount;

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
      toast.error(t.invoices.addAtLeastOneItem);
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error(t.invoices.notAuthenticated);
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
      tax_rate: parseFloat(taxRate) || 0,
      discount: parseFloat(discount) || 0,
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

    toast.success(isEdit ? t.invoices.updateSuccess : t.invoices.createSuccess);
    router.push('/dashboard/invoices');
    router.refresh();
  };

  const clientOptions = [
    { value: '', label: t.invoices.selectClient },
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
            {isEdit ? t.invoices.editInvoice : t.invoices.newInvoice}
          </h1>
          <p className="text-sm text-dark-700 dark:text-light-300 mt-1">
            {isEdit ? t.invoices.updateDetails : t.invoices.createDetails}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Logo */}
        <Card>
          <h2 className="text-lg font-semibold text-dark-800 dark:text-light-50 mb-4">
            {t.invoices.companyLogo}
          </h2>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-xl border-2 border-dashed border-light-200 dark:border-dark-700 flex items-center justify-center overflow-hidden bg-light-50 dark:bg-dark-900">
              {logoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <User size={28} className="text-light-300 dark:text-dark-700" />
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                loading={uploading}
              >
                <Upload size={14} />
                {logoUrl ? t.invoices.replaceLogo : t.invoices.uploadLogo}
              </Button>
              <p className="text-xs text-dark-700 dark:text-light-300 mt-2">
                {t.invoices.logoHint}
              </p>
            </div>
          </div>
        </Card>

        {/* Invoice Details */}
        <Card>
          <h2 className="text-lg font-semibold text-dark-800 dark:text-light-50 mb-4">
            {t.invoices.invoiceDetails}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t.invoices.invoiceNumberLabel}
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              required
            />
            <Select
              label={t.invoices.client}
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              options={clientOptions}
            />
            <Input
              label={t.invoices.projectName}
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Website Redesign"
            />
            <Select
              label={t.invoices.statusLabel}
              value={status}
              onChange={(e) => setStatus(e.target.value as Invoice['status'])}
              options={statusOptions}
            />
            <Select
              label={t.invoices.currency}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              options={currencyOptions}
            />
            <Input
              label={t.invoices.issuedDate}
              type="date"
              value={issuedDate}
              onChange={(e) => setIssuedDate(e.target.value)}
              required
            />
            <Input
              label={t.invoices.dueDate}
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
                {t.invoices.publiclyVisible}
              </label>
            </div>
          </div>
          <div className="mt-4">
            <TextArea
              label={t.invoices.description}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.invoices.descriptionPlaceholder}
            />
          </div>
          <div className="mt-4">
            <TextArea
              label={t.invoices.notes}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.invoices.notesPlaceholder}
            />
          </div>
        </Card>

        {/* Line Items */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-dark-800 dark:text-light-50">
              {t.invoices.lineItems}
            </h2>
            <Button type="button" variant="secondary" onClick={addItem}>
              <Plus size={14} />
              {t.invoices.addItem}
            </Button>
          </div>

          <div className="space-y-3">
            {/* Header */}
            <div className="hidden sm:grid grid-cols-12 gap-3 text-xs font-medium text-dark-700 dark:text-light-300 uppercase px-1">
              <div className="col-span-5">{t.invoices.description}</div>
              <div className="col-span-2">{t.invoices.quantity}</div>
              <div className="col-span-3">{t.invoices.price}</div>
              <div className="col-span-1 text-right">{t.invoices.total}</div>
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
                      placeholder={t.invoices.itemDescription}
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
                      placeholder={t.invoices.qty}
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
                      placeholder={t.invoices.price}
                      value={item.price}
                      onChange={(e) =>
                        updateItem(index, 'price', e.target.value)
                      }
                    />
                  </div>
                  <div className="sm:col-span-1 flex items-center justify-end h-9.5">
                    <span className="text-sm font-medium text-dark-800 dark:text-light-50">
                      ${lineTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="sm:col-span-1 flex items-center justify-end h-9.5">
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

          {/* Totals */}
          <div className="mt-6 pt-4 border-t border-light-200 dark:border-dark-700">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Tax & Discount inputs */}
              <div className="sm:col-span-6 grid grid-cols-2 gap-3">
                <Input
                  label={t.invoices.discountLabel}
                  type="number"
                  step="0.01"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="0.00"
                />
                <Input
                  label={t.invoices.taxRate}
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  placeholder="0"
                />
              </div>
              {/* Breakdown */}
              <div className="sm:col-span-6 space-y-1 text-right">
                <div className="flex justify-end gap-4 text-sm text-dark-700 dark:text-light-300">
                  <span>{t.invoices.subtotal}</span>
                  <span className="w-28 text-right">${subtotal.toFixed(2)}</span>
                </div>
                {discountNum > 0 && (
                  <div className="flex justify-end gap-4 text-sm text-dark-700 dark:text-light-300">
                    <span>{t.invoices.discount}</span>
                    <span className="w-28 text-right text-error">-${discountNum.toFixed(2)}</span>
                  </div>
                )}
                {taxRateNum > 0 && (
                  <div className="flex justify-end gap-4 text-sm text-dark-700 dark:text-light-300">
                    <span>{t.invoices.tax} ({taxRateNum}%)</span>
                    <span className="w-28 text-right">${taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-end gap-4 pt-2 border-t border-light-200 dark:border-dark-700">
                  <span className="text-sm font-semibold text-dark-800 dark:text-light-50">{t.invoices.total}</span>
                  <span className="w-28 text-right text-2xl font-bold text-dark-800 dark:text-light-50">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link href="/dashboard/invoices">
            <Button type="button" variant="secondary">
              {t.common.cancel}
            </Button>
          </Link>
          <Button type="submit" loading={loading}>
            {isEdit ? t.invoices.updateInvoice : t.invoices.createInvoice}
          </Button>
        </div>
      </form>
    </div>
  );
}
