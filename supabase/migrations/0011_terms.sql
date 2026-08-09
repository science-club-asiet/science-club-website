-- 0011_terms.sql: Dynamic Academic Terms Management

create table if not exists public.terms (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.terms enable row level security;

-- Policies
drop policy if exists "terms public read" on public.terms;
create policy "terms public read" on public.terms
  for select using (true);

drop policy if exists "terms admin write" on public.terms;
create policy "terms admin write" on public.terms
  for all using (public.is_admin()) with check (public.is_admin());

-- Initial seed data
insert into public.terms (name, is_published, sort_order)
values
  ('2025-26', true, 0),
  ('2023-24', false, 1),
  ('2022-23', false, 2),
  ('2021-22', false, 3)
on conflict (name) do nothing;
