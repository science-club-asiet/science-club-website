-- Migration 0013: Add event status, gallery_images, and registration_form_id FK

-- 1. Add status column to events
alter table if exists public.events
  add column if not exists status text not null default 'open';

-- 2. Add gallery_images column to events
alter table if exists public.events
  add column if not exists gallery_images text[] not null default '{}';

-- 3. Ensure constraint for status values if not existing
do $$ begin
  alter table public.events
    add constraint events_status_check check (status in ('open', 'closed', 'finished', 'draft'));
exception when duplicate_object then null; end $$;

-- 4. Create indexes
create index if not exists events_status_idx on public.events(status);
create index if not exists events_reg_form_idx on public.events(registration_form_id);
