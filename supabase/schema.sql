-- ============================================================
-- InVoices SaaS — Full Supabase SQL Schema
-- ============================================================

-- 1. PROFILES
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  company_name text,
  address text,
  phone text,
  logo_url text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. CLIENTS
create table public.clients (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  email text,
  phone text,
  address text,
  created_at timestamptz default now() not null
);

create index idx_clients_user_id on public.clients(user_id);

alter table public.clients enable row level security;

create policy "Users can view own clients"
  on public.clients for select
  using (auth.uid() = user_id);

create policy "Users can insert own clients"
  on public.clients for insert
  with check (auth.uid() = user_id);

create policy "Users can update own clients"
  on public.clients for update
  using (auth.uid() = user_id);

create policy "Users can delete own clients"
  on public.clients for delete
  using (auth.uid() = user_id);


-- 3. INVOICES
create type invoice_status as enum ('draft', 'sent', 'paid', 'overdue', 'cancelled');

create table public.invoices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  client_id uuid references public.clients on delete set null,
  invoice_number text not null,
  project_name text,
  description text,
  total numeric(12,2) default 0 not null,
  status invoice_status default 'draft' not null,
  currency text default 'USD' not null,
  notes text,
  tax_rate numeric(5,2) default 0 not null,
  discount numeric(12,2) default 0 not null,
  issued_date date default current_date not null,
  due_date date,
  is_public boolean default true not null,
  created_at timestamptz default now() not null
);

create index idx_invoices_user_id on public.invoices(user_id);
create index idx_invoices_client_id on public.invoices(client_id);
create unique index idx_invoices_number_user on public.invoices(user_id, invoice_number);

alter table public.invoices enable row level security;

create policy "Users can view own invoices"
  on public.invoices for select
  using (auth.uid() = user_id);

create policy "Public invoices viewable by anyone"
  on public.invoices for select
  using (is_public = true);

create policy "Users can insert own invoices"
  on public.invoices for insert
  with check (auth.uid() = user_id);

create policy "Users can update own invoices"
  on public.invoices for update
  using (auth.uid() = user_id);

create policy "Users can delete own invoices"
  on public.invoices for delete
  using (auth.uid() = user_id);


-- 4. INVOICE ITEMS
create table public.invoice_items (
  id uuid default gen_random_uuid() primary key,
  invoice_id uuid references public.invoices on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  description text not null,
  quantity numeric(10,2) default 1 not null,
  price numeric(12,2) default 0 not null,
  created_at timestamptz default now() not null
);

create index idx_invoice_items_invoice_id on public.invoice_items(invoice_id);
create index idx_invoice_items_user_id on public.invoice_items(user_id);

alter table public.invoice_items enable row level security;

create policy "Users can view own invoice items"
  on public.invoice_items for select
  using (auth.uid() = user_id);

create policy "Public invoice items viewable"
  on public.invoice_items for select
  using (
    exists (
      select 1 from public.invoices
      where invoices.id = invoice_items.invoice_id
      and invoices.is_public = true
    )
  );

create policy "Users can insert own invoice items"
  on public.invoice_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update own invoice items"
  on public.invoice_items for update
  using (auth.uid() = user_id);

create policy "Users can delete own invoice items"
  on public.invoice_items for delete
  using (auth.uid() = user_id);


-- 5. AUTO-RECALCULATE INVOICE TOTAL
create or replace function public.recalculate_invoice_total()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  subtotal numeric(12,2);
  inv_tax_rate numeric(5,2);
  inv_discount numeric(12,2);
  final_total numeric(12,2);
begin
  select coalesce(sum(quantity * price), 0)
  into subtotal
  from public.invoice_items
  where invoice_id = coalesce(new.invoice_id, old.invoice_id);

  select coalesce(tax_rate, 0), coalesce(discount, 0)
  into inv_tax_rate, inv_discount
  from public.invoices
  where id = coalesce(new.invoice_id, old.invoice_id);

  final_total := (subtotal - inv_discount) * (1 + inv_tax_rate / 100);
  if final_total < 0 then final_total := 0; end if;

  update public.invoices
  set total = final_total
  where id = coalesce(new.invoice_id, old.invoice_id);

  return coalesce(new, old);
end;
$$;

create trigger recalc_total_insert
  after insert on public.invoice_items
  for each row execute procedure public.recalculate_invoice_total();

create trigger recalc_total_update
  after update on public.invoice_items
  for each row execute procedure public.recalculate_invoice_total();

create trigger recalc_total_delete
  after delete on public.invoice_items
  for each row execute procedure public.recalculate_invoice_total();


-- 6. GENERATE INVOICE NUMBER
create or replace function public.generate_invoice_number(p_user_id uuid)
returns text
language plpgsql
security definer set search_path = ''
as $$
declare
  next_num integer;
  year_str text;
begin
  year_str := to_char(current_date, 'YYYY');
  select coalesce(max(
    cast(split_part(invoice_number, '-', 3) as integer)
  ), 0) + 1
  into next_num
  from public.invoices
  where user_id = p_user_id
  and invoice_number like 'INV-' || year_str || '-%';

  return 'INV-' || year_str || '-' || lpad(next_num::text, 4, '0');
end;
$$;


-- 7. STORAGE BUCKET FOR LOGOS
insert into storage.buckets (id, name, public) values ('logos', 'logos', true);

create policy "Users can upload own logo"
  on storage.objects for insert
  with check (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update own logo"
  on storage.objects for update
  using (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own logo"
  on storage.objects for delete
  using (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Anyone can view logos"
  on storage.objects for select
  using (bucket_id = 'logos');
