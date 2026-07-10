create sequence if not exists public.proposal_number_seq;

create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id),
  customer_id uuid not null references public.customers(id),
  property_id uuid not null references public.properties(id),
  opportunity_id uuid not null references public.opportunities(id),
  pricing_id uuid not null references public.opportunity_pricing(id),
  created_by_user_id uuid references public.users(id),
  updated_by_user_id uuid references public.users(id),
  proposal_number text not null default (
    'PR-' || lpad(nextval('public.proposal_number_seq')::text, 6, '0')
  ),
  version_number integer not null default 1,
  is_current boolean not null default true,
  status text not null default 'draft',
  title text not null,
  internal_reference text,
  structure_type text not null default 'single',
  recommended_option_number integer not null default 1,
  valid_until date not null,
  snapshot_business_name text not null,
  snapshot_business_trading_name text,
  snapshot_business_contact_email text,
  snapshot_business_contact_phone text,
  snapshot_business_address_line_1 text,
  snapshot_business_address_line_2 text,
  snapshot_business_town text,
  snapshot_business_county text,
  snapshot_business_postcode text,
  snapshot_business_country text,
  snapshot_business_company_registration_number text,
  snapshot_business_vat_registration_number text,
  snapshot_business_short_company_description text,
  snapshot_customer_first_name text not null,
  snapshot_customer_last_name text not null,
  snapshot_customer_email text,
  snapshot_customer_phone text,
  snapshot_property_name text,
  snapshot_property_address_line_1 text not null,
  snapshot_property_address_line_2 text,
  snapshot_property_town text,
  snapshot_property_county text,
  snapshot_property_postcode text not null,
  snapshot_opportunity_title text not null,
  snapshot_opportunity_description text,
  snapshot_opportunity_status text not null,
  snapshot_opportunity_estimated_value numeric(12,2),
  snapshot_opportunity_target_date date,
  snapshot_pricing_work_type text,
  snapshot_pricing_customer_outcome text,
  snapshot_pricing_scope_notes text,
  snapshot_pricing_assumptions text,
  snapshot_pricing_exclusions text,
  snapshot_pricing_proposal_notes text,
  snapshot_pricing_recommended_selling_price numeric(12,2) not null default 0,
  snapshot_pricing_cost_before_profit numeric(12,2) not null default 0,
  snapshot_pricing_projected_profit numeric(12,2) not null default 0,
  snapshot_pricing_profit_target_percent numeric(5,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint proposals_business_proposal_number_unique unique (business_id, proposal_number),
  constraint proposals_status_check check (
    status in (
      'draft',
      'ready_to_send',
      'sent',
      'viewed',
      'accepted',
      'declined',
      'expired',
      'archived'
    )
  ),
  constraint proposals_structure_type_check check (
    structure_type in ('single', 'two_options', 'three_options')
  ),
  constraint proposals_recommended_option_number_check check (
    recommended_option_number in (1, 2, 3)
  ),
  constraint proposals_version_number_check check (version_number > 0)
);

create table public.proposal_options (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id),
  proposal_id uuid not null references public.proposals(id),
  option_number integer not null,
  label text not null,
  title text not null,
  description text,
  price numeric(12,2) not null default 0,
  is_recommended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint proposal_options_option_number_check check (option_number in (1, 2, 3)),
  constraint proposal_options_price_check check (price >= 0),
  constraint proposal_options_proposal_option_number_unique unique (
    proposal_id,
    option_number
  )
);

create index proposals_business_id_idx on public.proposals(business_id);
create index proposals_customer_id_idx on public.proposals(customer_id);
create index proposals_property_id_idx on public.proposals(property_id);
create index proposals_opportunity_id_idx on public.proposals(opportunity_id);
create index proposals_pricing_id_idx on public.proposals(pricing_id);
create index proposals_current_opportunity_idx on public.proposals(opportunity_id, is_current);
create index proposals_created_at_idx on public.proposals(created_at);

create index proposal_options_business_id_idx on public.proposal_options(business_id);
create index proposal_options_proposal_id_idx on public.proposal_options(proposal_id);

create trigger proposals_set_updated_at
before update on public.proposals
for each row
execute function public.set_updated_at();

create trigger proposal_options_set_updated_at
before update on public.proposal_options
for each row
execute function public.set_updated_at();

alter table public.proposals enable row level security;
alter table public.proposal_options enable row level security;

create policy "Users can read proposals in their business"
on public.proposals
for select
to authenticated
using (
  business_id = public.current_business_id()
  and archived_at is null
);

create policy "Owners can create proposals in their business"
on public.proposals
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
      and o.business_id = business_id
      and o.customer_id = customer_id
      and o.property_id = property_id
      and o.archived_at is null
  )
  and exists (
    select 1
    from public.opportunity_pricing op
    where op.id = pricing_id
      and op.business_id = business_id
      and op.customer_id = customer_id
      and op.property_id = property_id
      and op.opportunity_id = opportunity_id
      and op.archived_at is null
  )
);

create policy "Owners can update proposals in their business"
on public.proposals
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
);

create policy "Users can read proposal options in their business"
on public.proposal_options
for select
to authenticated
using (
  business_id = public.current_business_id()
  and archived_at is null
);

create policy "Owners can create proposal options in their business"
on public.proposal_options
for insert
to authenticated
with check (
  business_id = public.current_business_id()
  and public.is_owner()
  and exists (
    select 1
    from public.proposals p
    where p.id = proposal_id
      and p.business_id = business_id
      and p.archived_at is null
  )
);

create policy "Owners can update proposal options in their business"
on public.proposal_options
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
  and exists (
    select 1
    from public.proposals p
    where p.id = proposal_id
      and p.business_id = business_id
      and p.archived_at is null
  )
);
