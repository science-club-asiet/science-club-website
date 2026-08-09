-- ============================================================================
-- Migration 0012: Add term-wise scoping to events and posts,
-- and dynamic custom categories for events and posts.
-- ============================================================================

-- 1. Add `term` column to `events` and `posts`
alter table if exists public.events
  add column if not exists term text default '2025-26';

alter table if exists public.posts
  add column if not exists term text default '2025-26';

create index if not exists events_term_idx on public.events(term);
create index if not exists posts_term_idx on public.posts(term);

-- 2. Custom Event Categories table
create table if not exists public.event_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  tagline     text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Seed default event categories if empty
insert into public.event_categories (name, slug, tagline, sort_order)
values
  ('Talk & Seminar', 'talk', 'Expert keynotes, tech talks, and guest lectures', 1),
  ('Hands-on Workshop', 'workshop', 'Interactive technical building sessions', 2),
  ('Gaming & Hackathon', 'game', 'Competitions, LAN parties, and hackathons', 3),
  ('Field Trip & Visit', 'trip', 'Industrial visits and outdoor tech excursions', 4)
on conflict (slug) do nothing;

-- 3. Custom Post Categories table
create table if not exists public.post_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  tagline     text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Seed default post categories if empty
insert into public.post_categories (name, slug, tagline, sort_order)
values
  ('Latest News', 'news', 'Official club updates and press releases', 1),
  ('Tech Article', 'article', 'Deep dives, tutorials, and tech write-ups', 2),
  ('Research Paper', 'paper', 'Academic research and paper publications', 3),
  ('Member Blog', 'blog', 'Student stories, experiences, and opinions', 4),
  ('Announcement', 'announcement', 'Important notices and deadlines', 5)
on conflict (slug) do nothing;

-- RLS Grants & Policies
alter table public.event_categories enable row level security;
alter table public.post_categories enable row level security;

do $$ begin
  create policy "Public read event_categories" on public.event_categories for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admin write event_categories" on public.event_categories for all using (public.is_admin());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Public read post_categories" on public.post_categories for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admin write post_categories" on public.post_categories for all using (public.is_admin());
exception when duplicate_object then null; end $$;
