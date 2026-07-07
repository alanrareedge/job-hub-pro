create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id),
  customer_id uuid not null references public.customers(id),
  property_id uuid not null references public.properties(id),
  created_by_user_id uuid references public.users(id),
  title text not null,
  description text,
  status text not null default 'new',
  estimated_value numeric(12,2),
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint opportunities_status_check check (
    status in ('new', 'site_visit_required', 'pricing', 'proposal_sent', 'won', 'lost')
  )
);

create index opportunities_business_id_idx on public.opportunities(business_id);
create index opportunities_customer_id_idx on public.opportunities(customer_id);
create index opportunities_property_id_idx on public.opportunities(property_id);
create index opportunities_created_by_user_id_idx on public.opportunities(created_by_user_id);
create index opportunities_business_property_idx on public.opportunities(business_id, property_id);
create index opportunities_created_at_idx on public.opportunities(created_at);

create trigger opportunities_set_updated_at
before update on public.opportunities
for each row
execute function public.set_updated_at();

alter table public.opportunities enable row level security;

create policy "Users can read opportunities in their business"
on public.opportunities
for select
to authenticated
using (
  business_id = public.current_business_id()
  and archived_at is null
);

create policy "Owners can create opportunities in their business"
on public.opportunities
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
