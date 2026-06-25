create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id),
  customer_id uuid not null references public.customers(id),
  property_id uuid not null references public.properties(id),
  created_by_user_id uuid references public.users(id),
  title text not null,
  reference text,
  description text,
  status text not null default 'new',
  priority text not null default 'normal',
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint jobs_status_check check (
    status in ('new', 'in_progress', 'completed', 'cancelled')
  ),
  constraint jobs_priority_check check (
    priority in ('low', 'normal', 'urgent')
  )
);

create index jobs_business_id_idx on public.jobs(business_id);
create index jobs_customer_id_idx on public.jobs(customer_id);
create index jobs_property_id_idx on public.jobs(property_id);
create index jobs_created_by_user_id_idx on public.jobs(created_by_user_id);
create index jobs_business_property_idx on public.jobs(business_id, property_id);
create index jobs_created_at_idx on public.jobs(created_at);

create trigger jobs_set_updated_at
before update on public.jobs
for each row
execute function public.set_updated_at();

alter table public.jobs enable row level security;

create policy "Users can read jobs in their business"
on public.jobs
for select
to authenticated
using (
  business_id = public.current_business_id()
  and archived_at is null
);

create policy "Owners can create jobs in their business"
on public.jobs
for insert
to authenticated
with check (
  business_id = public.current_business_id()
  and created_by_user_id = public.current_user_id()
  and public.is_owner()
  and exists (
    select 1
    from public.properties p
    where p.id = property_id
      and p.customer_id = customer_id
      and p.business_id = business_id
      and p.archived_at is null
  )
  and exists (
    select 1
    from public.customers c
    where c.id = customer_id
      and c.business_id = business_id
      and c.archived_at is null
  )
);
