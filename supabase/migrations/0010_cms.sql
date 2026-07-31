-- ============================================================================
-- CMS: user-definable content types (Collections), their fields, and items.
-- Mirrors the existing RLS model: public reads published content, admins write.
-- ============================================================================

create table if not exists public.collections (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  singular   text,
  plural     text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.collection_fields (
  id            uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete cascade,
  name          text not null,                 -- data key (e.g. "title")
  label         text not null,
  type          text not null default 'text',  -- FieldType (text/textarea/richtext/number/boolean/select/image/date/tags/json)
  options       text[],                         -- for select
  required      boolean not null default false,
  sort_order    int not null default 0
);
create index if not exists collection_fields_collection_idx on public.collection_fields(collection_id);

create table if not exists public.collection_items (
  id            uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete cascade,
  slug          text,
  data          jsonb not null default '{}'::jsonb,
  is_published  boolean not null default true,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists collection_items_collection_idx on public.collection_items(collection_id);
create unique index if not exists collection_items_slug_idx on public.collection_items(collection_id, slug);

-- updated_at triggers (reuse existing helper)
create trigger set_collections_updated_at before update on public.collections
  for each row execute function public.set_updated_at();
create trigger set_collection_items_updated_at before update on public.collection_items
  for each row execute function public.set_updated_at();

-- RLS
alter table public.collections       enable row level security;
alter table public.collection_fields enable row level security;
alter table public.collection_items  enable row level security;

create policy "collections public read" on public.collections for select using (true);
create policy "collections admin write" on public.collections for all using (public.is_admin()) with check (public.is_admin());

create policy "fields public read" on public.collection_fields for select using (true);
create policy "fields admin write" on public.collection_fields for all using (public.is_admin()) with check (public.is_admin());

create policy "items public read published" on public.collection_items for select using (is_published or public.is_admin());
create policy "items admin write" on public.collection_items for all using (public.is_admin()) with check (public.is_admin());
