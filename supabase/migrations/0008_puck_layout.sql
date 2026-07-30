-- ============================================================================
-- Universal visual builder (Puck): a `layout` jsonb tree on every buildable
-- entity. Run after the earlier migrations. Existing RLS covers new columns.
-- ============================================================================

alter table public.events add column if not exists layout jsonb;
alter table public.posts  add column if not exists layout jsonb;
alter table public.forms  add column if not exists layout jsonb;

-- Standalone pages (landing/about/etc.) built with the same engine.
create table if not exists public.pages (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text unique,
  layout       jsonb,
  is_published boolean not null default false,
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.pages enable row level security;

drop policy if exists "public read published" on public.pages;
create policy "public read published" on public.pages
  for select using (is_published or public.is_admin());

drop policy if exists "admin write" on public.pages;
create policy "admin write" on public.pages
  for all using (public.is_admin()) with check (public.is_admin());
