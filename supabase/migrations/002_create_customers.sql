create table public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id),
  created_by_user_id uuid references public.users(id),
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create index customers_business_id_idx on public.customers(business_id);
create index customers_created_by_user_id_idx on public.customers(created_by_user_id);
create index customers_created_at_idx on public.customers(created_at);

create trigger customers_set_updated_at
before update on public.customers
for each row
execute function public.set_updated_at();

alter table public.customers enable row level security;

create policy "Users can read customers in their business"
on public.customers
for select
to authenticated
using (
  business_id = public.current_business_id()
  and archived_at is null
);

create policy "Owners can create customers in their business"
on public.customers
for insert
to authenticated
with check (
  business_id = public.current_business_id()
  and created_by_user_id = public.current_user_id()
  and public.is_owner()
);

