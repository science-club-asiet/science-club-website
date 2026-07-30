-- Phase E: Templates + Playbooks

CREATE TABLE IF NOT EXISTS public.templates (
    id uuid primary key default gen_random_uuid(),
    kind text not null check (kind in ('events', 'posts', 'forms', 'page')),
    name text not null,
    description text,
    payload jsonb not null default '{}'::jsonb,
    created_by uuid references auth.users(id),
    created_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.tasks (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    is_completed boolean not null default false,
    entity_type text,
    entity_id uuid,
    created_by uuid references auth.users(id),
    created_at timestamptz not null default now()
);

-- Enable RLS
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Allow admin access
CREATE POLICY "Admin template access" ON public.templates
    FOR ALL USING (public.is_admin());

CREATE POLICY "Admin task access" ON public.tasks
    FOR ALL USING (public.is_admin());

-- To apply this manually: 
-- Copy this file into the Supabase SQL Editor and run it.
