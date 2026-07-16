alter table public.proposals
add column section_understanding text,
add column section_recommendation text,
add column section_scope text,
add column section_assumptions text,
add column section_exclusions text,
add column section_next_steps text,
add column sections_updated_at timestamptz,
add column sections_updated_by_user_id uuid references public.users(id);

create index proposals_sections_updated_by_user_id_idx
on public.proposals(sections_updated_by_user_id);
