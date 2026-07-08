create table public.opportunity_pricing (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id),
  customer_id uuid not null references public.customers(id),
  property_id uuid not null references public.properties(id),
  opportunity_id uuid not null references public.opportunities(id),
  created_by_user_id uuid references public.users(id),
  updated_by_user_id uuid references public.users(id),
  work_type text,
  customer_outcome text,
  scope_notes text,
  labour_hours numeric(10,2) not null default 0,
  labour_rate numeric(10,2) not null default 0,
  materials_cost numeric(10,2) not null default 0,
  plant_cost numeric(10,2) not null default 0,
  waste_cost numeric(10,2) not null default 0,
  subcontractor_cost numeric(10,2) not null default 0,
  other_cost numeric(10,2) not null default 0,
  risk_allowance_percent numeric(5,2) not null default 0,
  target_margin_percent numeric(5,2) not null default 30,
  assumptions text,
  exclusions text,
  proposal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint opportunity_pricing_opportunity_id_unique unique (opportunity_id),
  constraint opportunity_pricing_non_negative_values check (
    labour_hours >= 0
    and labour_rate >= 0
    and materials_cost >= 0
    and plant_cost >= 0
    and waste_cost >= 0
    and subcontractor_cost >= 0
    and other_cost >= 0
    and risk_allowance_percent >= 0
    and target_margin_percent >= 0
    and target_margin_percent < 100
  )
);

create index opportunity_pricing_business_id_idx
on public.opportunity_pricing(business_id);

create index opportunity_pricing_customer_id_idx
on public.opportunity_pricing(customer_id);

create index opportunity_pricing_property_id_idx
on public.opportunity_pricing(property_id);

create index opportunity_pricing_opportunity_id_idx
on public.opportunity_pricing(opportunity_id);

create trigger opportunity_pricing_set_updated_at
before update on public.opportunity_pricing
for each row
execute function public.set_updated_at();

alter table public.opportunity_pricing enable row level security;

create policy "Users can read opportunity pricing in their business"
on public.opportunity_pricing
for select
to authenticated
using (
  business_id = public.current_business_id()
  and archived_at is null
);

create policy "Owners can create opportunity pricing in their business"
on public.opportunity_pricing
for insert
to authenticated
with check (
  business_id = public.current_business_id()
  and created_by_user_id = public.current_user_id()
  and public.is_owner()
  and exists (
    select 1
    from public.opportunities o
    where o.id = opportunity_id
      and o.customer_id = customer_id
      and o.property_id = property_id
      and o.business_id = business_id
      and o.archived_at is null
  )
  and exists (
    select 1
    from public.properties p
    where p.id = property_id
      and p.customer_id = customer_id
      and p.business_id = business_id
      and p.archived_at is null
  )
);

create policy "Owners can update opportunity pricing in their business"
on public.opportunity_pricing
for update
to authenticated
using (
  business_id = public.current_business_id()
  and archived_at is null
  and public.is_owner()
)
with check (
  business_id = public.current_business_id()
  and archived_at is null
  and public.is_owner()
  and (
    updated_by_user_id is null
    or updated_by_user_id = public.current_user_id()
  )
  and exists (
    select 1
    from public.opportunities o
    where o.id = opportunity_id
      and o.customer_id = customer_id
      and o.property_id = property_id
      and o.business_id = business_id
      and o.archived_at is null
  )
  and exists (
    select 1
    from public.properties p
    where p.id = property_id
      and p.customer_id = customer_id
      and p.business_id = business_id
      and p.archived_at is null
  )
);
