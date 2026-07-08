alter table public.opportunity_pricing
add column labour_rate_type text not null default 'hourly',
add column labour_people_count numeric(10,2) not null default 1,
add column labour_units numeric(10,2) not null default 0,
add column labour_fixed_cost numeric(10,2) not null default 0;

alter table public.opportunity_pricing
add constraint opportunity_pricing_labour_rate_type_check check (
  labour_rate_type in ('hourly', 'daily', 'fixed')
);

alter table public.opportunity_pricing
add constraint opportunity_pricing_new_labour_values_check check (
  labour_people_count >= 0
  and labour_units >= 0
  and labour_fixed_cost >= 0
);
