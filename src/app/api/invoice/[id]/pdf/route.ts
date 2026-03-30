import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import InvoicePDF from './InvoicePDF';
import type { Invoice, InvoiceItem, Client, Profile } from '@/lib/types';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch invoice (public ones don't need auth)
  const { data: invoice } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .eq('is_public', true)
    .single();

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

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

  const buffer = await renderToBuffer(
    InvoicePDF({
      invoice: invoice as Invoice,
      items: (items as InvoiceItem[]) ?? [],
      client: client as Client | null,
      profile: profile as Profile | null,
    })
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${invoice.invoice_number}.pdf"`,
    },
  });
}
