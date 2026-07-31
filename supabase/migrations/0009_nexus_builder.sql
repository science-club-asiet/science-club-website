-- ============================================================================
-- Custom visual builder (Nexus): adds a `nexus_data` jsonb column to every 
-- buildable entity. This namespaces the new Craft.js editor from the old Puck data.
-- ============================================================================

alter table public.events add column if not exists nexus_data jsonb;
alter table public.posts  add column if not exists nexus_data jsonb;
alter table public.forms  add column if not exists nexus_data jsonb;
alter table public.pages  add column if not exists nexus_data jsonb;
