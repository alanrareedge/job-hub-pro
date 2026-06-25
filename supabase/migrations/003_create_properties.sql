create table public.properties (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id),
  customer_id uuid not null references public.customers(id),
  created_by_user_id uuid references public.users(id),
  property_name text,
  address_line_1 text not null,
  address_line_2 text,
  town text,
  county text,
  postcode text not null,
  access_notes text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create index properties_business_id_idx on public.properties(business_id);
create index properties_customer_id_idx on public.properties(customer_id);
create index properties_created_by_user_id_idx on public.properties(created_by_user_id);
create index properties_business_customer_idx on public.properties(business_id, customer_id);
create index properties_created_at_idx on public.properties(created_at);

create trigger properties_set_updated_at
before update on public.properties
for each row
execute function public.set_updated_at();

alter table public.properties enable row level security;

create policy "Users can read properties in their business"
on public.properties
for select
to authenticated
using (
  business_id = public.current_business_id()
  and archived_at is null
);

create policy "Owners can create properties in their business"
on public.properties
for insert
to authenticated
with check (
  business_id = public.current_business_id()
  and created_by_user_id = public.current_user_id()
  and public.is_owner()
  and exists (
    select 1
    from public.customers c
    where c.id = customer_id
      and c.business_id = business_id
      and c.archived_at is null
  )
);
