create extension if not exists pgcrypto;

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  address_line_1 text,
  address_line_2 text,
  town text,
  postcode text,
  subscription_status text not null default 'trial',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint businesses_subscription_status_check check (
    subscription_status in ('trial', 'active', 'past_due', 'cancelled')
  )
);

create table public.users (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id),
  auth_user_id uuid not null references auth.users(id),
  name text,
  email text not null,
  role text not null,
  status text not null default 'active',
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint users_auth_user_id_unique unique (auth_user_id),
  constraint users_role_check check (role in ('owner', 'office', 'operative')),
  constraint users_status_check check (status in ('active', 'invited', 'disabled'))
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id),
  user_id uuid references public.users(id),
  entity_type text not null,
  entity_id uuid,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index users_business_id_idx on public.users(business_id);
create index users_auth_user_id_idx on public.users(auth_user_id);
create index audit_logs_business_id_idx on public.audit_logs(business_id);
create index audit_logs_user_id_idx on public.audit_logs(user_id);
create index audit_logs_entity_idx on public.audit_logs(entity_type, entity_id);
create index audit_logs_created_at_idx on public.audit_logs(created_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger businesses_set_updated_at
before update on public.businesses
for each row
execute function public.set_updated_at();

create trigger users_set_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

create or replace function public.current_user_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select u.id
  from public.users u
  where u.auth_user_id = auth.uid()
    and u.status = 'active'
    and u.archived_at is null
  limit 1;
$$;

create or replace function public.current_business_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select u.business_id
  from public.users u
  where u.auth_user_id = auth.uid()
    and u.status = 'active'
    and u.archived_at is null
  limit 1;
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select u.role
  from public.users u
  where u.auth_user_id = auth.uid()
    and u.status = 'active'
    and u.archived_at is null
  limit 1;
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'owner', false);
$$;

alter table public.businesses enable row level security;
alter table public.users enable row level security;
alter table public.audit_logs enable row level security;

create policy "Users can read their own business"
on public.businesses
for select
to authenticated
using (id = public.current_business_id());

create policy "Owners can update their own business"
on public.businesses
for update
to authenticated
using (id = public.current_business_id() and public.is_owner())
with check (id = public.current_business_id() and public.is_owner());

create policy "Users can read users in their business"
on public.users
for select
to authenticated
using (business_id = public.current_business_id());

create policy "Owners can create users in their business"
on public.users
for insert
to authenticated
with check (business_id = public.current_business_id() and public.is_owner());

create policy "Owners can update users in their business"
on public.users
for update
to authenticated
using (business_id = public.current_business_id() and public.is_owner())
with check (business_id = public.current_business_id() and public.is_owner());

create policy "Users can read audit logs in their business"
on public.audit_logs
for select
to authenticated
using (business_id = public.current_business_id());

create policy "Users can create audit logs in their business"
on public.audit_logs
for insert
to authenticated
with check (
  business_id = public.current_business_id()
  and (
    user_id is null
    or user_id = public.current_user_id()
  )
);

