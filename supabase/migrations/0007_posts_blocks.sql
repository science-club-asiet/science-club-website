-- Add blocks jsonb array to posts table for the Block Builder
alter table public.posts
  add column if not exists blocks jsonb not null default '[]'::jsonb;
