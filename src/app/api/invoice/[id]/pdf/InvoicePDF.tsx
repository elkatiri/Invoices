import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import { format } from 'date-fns';
import type { Invoice, InvoiceItem, Client, Profile } from '@/lib/types';

const orange = '#FF8C00';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 50,
    objectFit: 'contain',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#111',
  },
  invoiceNumber: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  column: {
    width: '30%',
  },
  sectionLabel: {
    fontSize: 8,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
    fontFamily: 'Helvetica-Bold',
  },
  text: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#444',
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
    color: '#111',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    paddingBottom: 8,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f3f3',
    paddingVertical: 8,
  },
  colDesc: { width: '45%' },
  colQty: { width: '15%', textAlign: 'right' },
  colPrice: { width: '20%', textAlign: 'right' },
  colTotal: { width: '20%', textAlign: 'right' },
  headerText: {
    fontSize: 8,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Helvetica-Bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#e5e5e5',
  },
  totalLabel: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#666',
    marginRight: 20,
  },
  totalValue: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#111',
  },
  notesSection: {
    marginTop: 30,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#ccc',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: orange,
  },
});

const currencySymbol: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$',
};

export default function InvoicePDF({
  invoice,
  items,
  client,
  profile,
}: {
  invoice: Invoice;
  items: InvoiceItem[];
  client: Client | null;
  profile: Profile | null;
}) {
  const sym = currencySymbol[invoice.currency] ?? invoice.currency;

  const statusColors: Record<string, { bg: string; text: string }> = {
    draft: { bg: '#f3f4f6', text: '#666' },
    sent: { bg: '#dbeafe', text: '#1d4ed8' },
    paid: { bg: '#d1fae5', text: '#059669' },
    overdue: { bg: '#fed7aa', text: '#c2410c' },
    cancelled: { bg: '#fee2e2', text: '#dc2626' },
  };

  const sc = statusColors[invoice.status] ?? statusColors.draft;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.accentBar} fixed />

        {/* Header */}
        <View style={styles.header}>
          <View>
            {profile?.logo_url ? (
              <Image src={profile.logo_url} style={styles.logo} />
            ) : null}
            <Text style={styles.title}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
            {invoice.project_name && (
              <Text style={[styles.text, { marginTop: 4 }]}>
                {invoice.project_name}
              </Text>
            )}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: sc.bg },
              ]}
            >
              <Text
                style={{
                  fontSize: 9,
                  color: sc.text,
                  fontFamily: 'Helvetica-Bold',
                  textTransform: 'uppercase',
                }}
              >
                {invoice.status}
              </Text>
            </View>
            <Text style={[styles.totalValue, { marginTop: 12 }]}>
              {sym}
              {Number(invoice.total).toLocaleString('en-US', {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>
        </View>

        {/* From / To / Dates */}
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.sectionLabel}>From</Text>
            {profile && (
              <>
                {profile.company_name && (
                  <Text style={[styles.text, styles.bold]}>
                    {profile.company_name}
                  </Text>
                )}
                {profile.full_name && (
                  <Text style={styles.text}>{profile.full_name}</Text>
                )}
                <Text style={styles.text}>{profile.email}</Text>
                {profile.phone && (
                  <Text style={styles.text}>{profile.phone}</Text>
                )}
                {profile.address && (
                  <Text style={styles.text}>{profile.address}</Text>
                )}
              </>
            )}
          </View>

          <View style={styles.column}>
            <Text style={styles.sectionLabel}>Bill To</Text>
            {client ? (
              <>
                <Text style={[styles.text, styles.bold]}>{client.name}</Text>
                {client.email && (
                  <Text style={styles.text}>{client.email}</Text>
                )}
                {client.phone && (
                  <Text style={styles.text}>{client.phone}</Text>
                )}
                {client.address && (
                  <Text style={styles.text}>{client.address}</Text>
                )}
              </>
            ) : (
              <Text style={styles.text}>—</Text>
            )}
          </View>

          <View style={styles.column}>
            <Text style={styles.sectionLabel}>Details</Text>
            <Text style={styles.text}>
              Issued: {format(new Date(invoice.issued_date), 'MMM d, yyyy')}
            </Text>
            {invoice.due_date && (
              <Text style={styles.text}>
                Due: {format(new Date(invoice.due_date), 'MMM d, yyyy')}
              </Text>
            )}
            <Text style={styles.text}>Currency: {invoice.currency}</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.colDesc]}>Description</Text>
            <Text style={[styles.headerText, styles.colQty]}>Qty</Text>
            <Text style={[styles.headerText, styles.colPrice]}>Price</Text>
            <Text style={[styles.headerText, styles.colTotal]}>Total</Text>
          </View>

          {items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.text, styles.colDesc]}>
                {item.description}
              </Text>
              <Text style={[styles.text, styles.colQty]}>
                {Number(item.quantity)}
              </Text>
              <Text style={[styles.text, styles.colPrice]}>
                {sym}
                {Number(item.price).toFixed(2)}
              </Text>
              <Text style={[styles.text, styles.bold, styles.colTotal]}>
                {sym}
                {(Number(item.quantity) * Number(item.price)).toFixed(2)}
              </Text>
            </View>
          ))}

          {(() => {
            const subtotal = items.reduce(
              (sum, item) => sum + Number(item.quantity) * Number(item.price),
              0
            );
            const discountVal = Number(invoice.discount) || 0;
            const taxRateVal = Number(invoice.tax_rate) || 0;
            const afterDiscount = Math.max(subtotal - discountVal, 0);
            const taxAmount = afterDiscount * (taxRateVal / 100);
            return (
              <View style={{ marginTop: 16, borderTopWidth: 2, borderTopColor: '#e5e5e5', paddingTop: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 4 }}>
                  <Text style={{ fontSize: 10, color: '#666', marginRight: 20, width: 80, textAlign: 'right' }}>Subtotal</Text>
                  <Text style={{ fontSize: 10, color: '#444', width: 80, textAlign: 'right' }}>
                    {sym}{subtotal.toFixed(2)}
                  </Text>
                </View>
                {discountVal > 0 && (
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 4 }}>
                    <Text style={{ fontSize: 10, color: '#666', marginRight: 20, width: 80, textAlign: 'right' }}>Discount</Text>
                    <Text style={{ fontSize: 10, color: '#dc2626', width: 80, textAlign: 'right' }}>
                      -{sym}{discountVal.toFixed(2)}
                    </Text>
                  </View>
                )}
                {taxRateVal > 0 && (
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 4 }}>
                    <Text style={{ fontSize: 10, color: '#666', marginRight: 20, width: 80, textAlign: 'right' }}>Tax ({taxRateVal}%)</Text>
                    <Text style={{ fontSize: 10, color: '#444', width: 80, textAlign: 'right' }}>
                      {sym}{taxAmount.toFixed(2)}
                    </Text>
                  </View>
                )}
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#e5e5e5' }}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>
                    {sym}
                    {Number(invoice.total).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                </View>
              </View>
            );
          })()}
        </View>

        {/* Notes */}
        {(invoice.description || invoice.notes) && (
          <View style={styles.notesSection}>
            {invoice.description && (
              <>
                <Text style={[styles.sectionLabel, { marginBottom: 4 }]}>
                  Description
                </Text>
                <Text style={[styles.text, { marginBottom: 8 }]}>
                  {invoice.description}
                </Text>
              </>
            )}
            {invoice.notes && (
              <>
                <Text style={[styles.sectionLabel, { marginBottom: 4 }]}>
                  Notes
                </Text>
                <Text style={styles.text}>{invoice.notes}</Text>
              </>
            )}
          </View>
        )}

        <Text style={styles.footer} fixed>
          Generated by InVoices • {invoice.invoice_number}
        </Text>
      </Page>
    </Document>
  );
}
