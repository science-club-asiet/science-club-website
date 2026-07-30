-- Phase D: Media Library

CREATE TABLE IF NOT EXISTS public.media_assets (
    id uuid primary key default gen_random_uuid(),
    url text not null,
    name text not null,
    mime text not null,
    size bigint not null,
    width int,
    height int,
    folder text not null default 'general',
    alt text,
    tags text[] not null default '{}',
    created_by uuid references auth.users(id),
    created_at timestamptz not null default now()
);

-- Enable RLS
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- Allow public read access (the URLs are public anyway, this allows frontend consumption)
CREATE POLICY "Public media read access" ON public.media_assets
    FOR SELECT USING (true);

-- Allow authenticated admins/execom to insert/update/delete
CREATE POLICY "Admin media write access" ON public.media_assets
    FOR ALL USING (public.is_admin());
