export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  address: string | null;
  phone: string | null;
  logo_url: string | null;
  created_at: string;
};

export type Client = {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
};

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export type Invoice = {
  id: string;
  user_id: string;
  client_id: string | null;
  invoice_number: string;
  project_name: string | null;
  description: string | null;
  total: number;
  status: InvoiceStatus;
  currency: string;
  notes: string | null;
  issued_date: string;
  due_date: string | null;
  is_public: boolean;
  created_at: string;
  // Joined
  client?: Client;
  items?: InvoiceItem[];
};

export type InvoiceItem = {
  id: string;
  invoice_id: string;
  user_id: string;
  description: string;
  quantity: number;
  price: number;
  created_at: string;
};
