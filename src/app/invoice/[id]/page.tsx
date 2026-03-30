import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import type { Metadata } from 'next';
import type { Invoice, InvoiceItem, Client, Profile } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: invoice } = await supabase
    .from('invoices')
    .select('invoice_number, project_name, total')
    .eq('id', id)
    .eq('is_public', true)
    .single();

  if (!invoice) {
    return { title: 'Invoice Not Found' };
  }

  return {
    title: `Invoice ${invoice.invoice_number} | InVoices`,
    description: `Invoice ${invoice.invoice_number}${invoice.project_name ? ` — ${invoice.project_name}` : ''} — $${Number(invoice.total).toFixed(2)}`,
  };
}

export default async function PublicInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .eq('is_public', true)
    .single();

  if (!invoice) notFound();

  const [{ data: items }, { data: client }, { data: profile }] =
    await Promise.all([
      supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', id)
        .order('created_at'),
      invoice.client_id
        ? supabase
            .from('clients')
            .select('*')
            .eq('id', invoice.client_id)
            .single()
        : Promise.resolve({ data: null }),
      supabase
        .from('profiles')
        .select('*')
        .eq('id', invoice.user_id)
        .single(),
    ]);

  const inv = invoice as Invoice;
  const lineItems = (items as InvoiceItem[]) ?? [];
  const cl = client as Client | null;
  const prof = profile as Profile | null;

  const currencySymbol: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'C$',
    AUD: 'A$',
  };
  const sym = currencySymbol[inv.currency] ?? inv.currency;

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    sent: 'bg-blue-100 text-blue-700',
    paid: 'bg-emerald-100 text-emerald-700',
    overdue: 'bg-orange-100 text-orange-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* PDF download link */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className="text-sm text-gray-500 hover:text-orange-500">
            ← InVoices
          </Link>
          <Link
            href={`/api/invoice/${id}/pdf`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
          >
            Download PDF
          </Link>
        </div>

        {/* Invoice Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between gap-6">
              <div>
                {prof?.logo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={prof.logo_url}
                    alt="Logo"
                    className="h-12 w-auto object-contain mb-4"
                  />
                )}
                <h1 className="text-2xl font-bold text-gray-900">
                  {inv.invoice_number}
                </h1>
                {inv.project_name && (
                  <p className="text-gray-600 mt-1">{inv.project_name}</p>
                )}
              </div>
              <div className="text-right">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${statusColors[inv.status]}`}
                >
                  {inv.status}
                </span>
                <p className="text-3xl font-bold text-gray-900 mt-3">
                  {sym}
                  {Number(inv.total).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* From / To / Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-8 border-b border-gray-100">
            {/* From */}
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                From
              </p>
              {prof && (
                <div className="text-sm text-gray-700 space-y-0.5">
                  {prof.company_name && (
                    <p className="font-semibold">{prof.company_name}</p>
                  )}
                  {prof.full_name && <p>{prof.full_name}</p>}
                  <p>{prof.email}</p>
                  {prof.phone && <p>{prof.phone}</p>}
                  {prof.address && (
                    <p className="whitespace-pre-line">{prof.address}</p>
                  )}
                </div>
              )}
            </div>

            {/* To */}
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                Bill To
              </p>
              {cl ? (
                <div className="text-sm text-gray-700 space-y-0.5">
                  <p className="font-semibold">{cl.name}</p>
                  {cl.email && <p>{cl.email}</p>}
                  {cl.phone && <p>{cl.phone}</p>}
                  {cl.address && (
                    <p className="whitespace-pre-line">{cl.address}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400">—</p>
              )}
            </div>

            {/* Dates */}
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                Details
              </p>
              <div className="text-sm text-gray-700 space-y-1">
                <p>
                  <span className="text-gray-500">Issued:</span>{' '}
                  {format(new Date(inv.issued_date), 'MMM d, yyyy')}
                </p>
                {inv.due_date && (
                  <p>
                    <span className="text-gray-500">Due:</span>{' '}
                    {format(new Date(inv.due_date), 'MMM d, yyyy')}
                  </p>
                )}
                <p>
                  <span className="text-gray-500">Currency:</span> {inv.currency}
                </p>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="p-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 font-medium text-gray-500">
                    Description
                  </th>
                  <th className="text-right py-3 font-medium text-gray-500">
                    Qty
                  </th>
                  <th className="text-right py-3 font-medium text-gray-500">
                    Price
                  </th>
                  <th className="text-right py-3 font-medium text-gray-500">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lineItems.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 text-gray-800">{item.description}</td>
                    <td className="py-3 text-right text-gray-600">
                      {Number(item.quantity)}
                    </td>
                    <td className="py-3 text-right text-gray-600">
                      {sym}
                      {Number(item.price).toFixed(2)}
                    </td>
                    <td className="py-3 text-right font-medium text-gray-800">
                      {sym}
                      {(Number(item.quantity) * Number(item.price)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                {(() => {
                  const subtotal = lineItems.reduce(
                    (sum, item) => sum + Number(item.quantity) * Number(item.price),
                    0
                  );
                  const discountVal = Number(inv.discount) || 0;
                  const taxRateVal = Number(inv.tax_rate) || 0;
                  const afterDiscount = Math.max(subtotal - discountVal, 0);
                  const taxAmount = afterDiscount * (taxRateVal / 100);
                  return (
                    <>
                      <tr className="border-t border-gray-200">
                        <td colSpan={3} className="py-2 text-right text-sm text-gray-500">
                          Subtotal
                        </td>
                        <td className="py-2 text-right text-sm font-medium text-gray-700">
                          {sym}{subtotal.toFixed(2)}
                        </td>
                      </tr>
                      {discountVal > 0 && (
                        <tr>
                          <td colSpan={3} className="py-1 text-right text-sm text-gray-500">
                            Discount
                          </td>
                          <td className="py-1 text-right text-sm font-medium text-red-600">
                            -{sym}{discountVal.toFixed(2)}
                          </td>
                        </tr>
                      )}
                      {taxRateVal > 0 && (
                        <tr>
                          <td colSpan={3} className="py-1 text-right text-sm text-gray-500">
                            Tax ({taxRateVal}%)
                          </td>
                          <td className="py-1 text-right text-sm font-medium text-gray-700">
                            {sym}{taxAmount.toFixed(2)}
                          </td>
                        </tr>
                      )}
                      <tr className="border-t-2 border-gray-200">
                        <td colSpan={3} className="py-4 text-right font-semibold text-gray-700">
                          Total
                        </td>
                        <td className="py-4 text-right text-xl font-bold text-gray-900">
                          {sym}
                          {Number(inv.total).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    </>
                  );
                })()}
              </tfoot>
            </table>
          </div>

          {/* Notes / Description */}
          {(inv.description || inv.notes) && (
            <div className="px-8 pb-8 space-y-4">
              {inv.description && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                    Description
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {inv.description}
                  </p>
                </div>
              )}
              {inv.notes && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                    Notes
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {inv.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Powered by{' '}
          <Link href="/" className="text-orange-500 hover:underline">
            InVoices
          </Link>
        </p>
      </div>
    </div>
  );
}
