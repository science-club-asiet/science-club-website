-- ============================================================================
-- Row Level Security (RLS) Policies for Science Club Platform
-- ============================================================================

-- profiles
create policy "read own or admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

create policy "update own or admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create policy "owner deletes profiles" on public.profiles
  for delete using (public.is_owner());

-- execom_members
create policy "public read published" on public.execom_members
  for select using (is_published or public.is_admin());

create policy "admin write" on public.execom_members
  for all using (public.is_admin()) with check (public.is_admin());

create policy "execom edits own" on public.execom_members
  for update using (profile_id = auth.uid() and public.is_execom())
  with check (profile_id = auth.uid() and public.is_execom());

-- events
create policy "public read published" on public.events
  for select using (is_published or public.is_admin());

create policy "admin write" on public.events
  for all using (public.is_admin()) with check (public.is_admin());

-- event_registrations
create policy "read own or admin" on public.event_registrations
  for select using (profile_id = auth.uid() or public.is_admin());

create policy "admin manage" on public.event_registrations
  for all using (public.is_admin()) with check (public.is_admin());

-- posts
create policy "public read published" on public.posts
  for select using (status = 'published' or public.is_admin());

create policy "admin write" on public.posts
  for all using (public.is_admin()) with check (public.is_admin());

-- forms & form_fields
create policy "public read active" on public.forms
  for select using (is_active or public.is_admin());

create policy "admin write" on public.forms
  for all using (public.is_admin()) with check (public.is_admin());

create policy "public read" on public.form_fields for select using (true);

create policy "admin write" on public.form_fields
  for all using (public.is_admin()) with check (public.is_admin());

-- form_submissions
create policy "anyone submit" on public.form_submissions
  for insert to anon, authenticated with check (true);

create policy "read own or admin" on public.form_submissions
  for select using (profile_id = auth.uid() or public.is_admin());

create policy "admin manage" on public.form_submissions
  for all using (public.is_admin()) with check (public.is_admin());

-- media_assets
alter table public.media_assets enable row level security;

create policy "Public media read access" on public.media_assets
  for select using (true);

create policy "Admin media write access" on public.media_assets
  for all using (public.is_admin());

-- tasks
alter table public.tasks enable row level security;

create policy "Admin task access" on public.tasks
  for all using (public.is_admin());

-- pages
alter table public.pages enable row level security;

create policy "public read published" on public.pages
  for select using (is_published or public.is_admin());

create policy "admin write" on public.pages
  for all using (public.is_admin()) with check (public.is_admin());

-- cms collections, fields & items
alter table public.collections       enable row level security;
alter table public.collection_fields enable row level security;
alter table public.collection_items  enable row level security;

create policy "collections public read" on public.collections for select using (true);
create policy "collections admin write" on public.collections for all using (public.is_admin()) with check (public.is_admin());

create policy "fields public read" on public.collection_fields for select using (true);
create policy "fields admin write" on public.collection_fields for all using (public.is_admin()) with check (public.is_admin());

create policy "items public read published" on public.collection_items for select using (is_published or public.is_admin());
create policy "items admin write" on public.collection_items for all using (public.is_admin()) with check (public.is_admin());

-- terms & custom_categories
alter table public.terms enable row level security;
alter table public.custom_categories enable row level security;

create policy "terms public read" on public.terms for select using (true);
create policy "terms admin write" on public.terms for all using (public.is_admin()) with check (public.is_admin());

create policy "categories public read" on public.custom_categories for select using (true);
create policy "categories admin write" on public.custom_categories for all using (public.is_admin()) with check (public.is_admin());
