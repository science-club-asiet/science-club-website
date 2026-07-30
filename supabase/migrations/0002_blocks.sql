-- ============================================================================
-- Block builder: a jsonb block tree on events and posts.
-- Run after 0001_init.sql + seed. Existing RLS policies already cover new
-- columns, so nothing else changes.
-- ============================================================================

alter table public.events add column if not exists blocks jsonb not null default '[]'::jsonb;
alter table public.posts  add column if not exists blocks jsonb not null default '[]'::jsonb;
