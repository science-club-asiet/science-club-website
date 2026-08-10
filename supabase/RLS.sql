-- ============================================================================
-- Row Level Security (RLS) Policies for Science Club Platform
-- Comprehensive consolidated policies covering all tables from 
-- migrations 0001_init.sql through 0016_form_categories_and_presets_seed.sql
-- ============================================================================

-- ─── Helper Functions ────────────────────────────────────────────────────────
-- Role checks. SECURITY DEFINER so they read profiles without tripping RLS recursion.

create or replace function public.is_owner()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'owner');
$$;

create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','owner'));
$$;

create or replace function public.is_execom()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('execom','admin','owner'));
$$;

-- ─── Enable RLS Across All Tables ───────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'profiles',
    'teams',
    'execom_members',
    'events',
    'event_registrations',
    'event_categories',
    'media_albums',
    'media_images',
    'media_assets',
    'posts',
    'post_categories',
    'forms',
    'form_fields',
    'form_submissions',
    'form_categories',
    'membership_applications',
    'contact_submissions',
    'newsletter_subscribers',
    'pillars',
    'goals',
    'impact_stories',
    'story_eras',
    'perks',
    'faqs',
    'achievements',
    'site_content',
    'templates',
    'tasks',
    'pages',
    'collections',
    'collection_fields',
    'collection_items',
    'terms'
  ] loop
    execute format('alter table if exists public.%I enable row level security;', t);
  end loop;
end $$;

-- ─── 1. profiles ─────────────────────────────────────────────────────────────
drop policy if exists "read own or admin" on public.profiles;
create policy "read own or admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "update own or admin" on public.profiles;
create policy "update own or admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

drop policy if exists "owner deletes profiles" on public.profiles;
create policy "owner deletes profiles" on public.profiles
  for delete using (public.is_owner());

-- ─── 2. teams ────────────────────────────────────────────────────────────────
drop policy if exists "public read" on public.teams;
create policy "public read" on public.teams
  for select using (true);

drop policy if exists "admin write" on public.teams;
create policy "admin write" on public.teams
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── 3. execom_members ───────────────────────────────────────────────────────
drop policy if exists "public read published" on public.execom_members;
create policy "public read published" on public.execom_members
  for select using (is_published or public.is_admin());

drop policy if exists "admin write" on public.execom_members;
create policy "admin write" on public.execom_members
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "execom edits own" on public.execom_members;
create policy "execom edits own" on public.execom_members
  for update using (profile_id = auth.uid() and public.is_execom())
  with check (profile_id = auth.uid() and public.is_execom());

-- ─── 4. events ───────────────────────────────────────────────────────────────
drop policy if exists "public read published" on public.events;
create policy "public read published" on public.events
  for select using (is_published or public.is_admin());

drop policy if exists "admin write" on public.events;
create policy "admin write" on public.events
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── 5. event_registrations ──────────────────────────────────────────────────
-- User reads own, admin manages all. Direct client INSERTs are prevented
-- because pricing/registration is processed server-side via service role.
drop policy if exists "read own or admin" on public.event_registrations;
create policy "read own or admin" on public.event_registrations
  for select using (profile_id = auth.uid() or public.is_admin());

drop policy if exists "admin manage" on public.event_registrations;
create policy "admin manage" on public.event_registrations
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── 6. event_categories ─────────────────────────────────────────────────────
drop policy if exists "Public read event_categories" on public.event_categories;
create policy "Public read event_categories" on public.event_categories
  for select using (true);

drop policy if exists "Admin write event_categories" on public.event_categories;
create policy "Admin write event_categories" on public.event_categories
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── 7. media_albums & media_images ──────────────────────────────────────────
drop policy if exists "public read published" on public.media_albums;
create policy "public read published" on public.media_albums
  for select using (is_published or public.is_admin());

drop policy if exists "admin write" on public.media_albums;
create policy "admin write" on public.media_albums
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read published" on public.media_images;
create policy "public read published" on public.media_images
  for select using (is_published or public.is_admin());

drop policy if exists "admin write" on public.media_images;
create policy "admin write" on public.media_images
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── 8. media_assets (Media Library) ─────────────────────────────────────────
drop policy if exists "Public media read access" on public.media_assets;
create policy "Public media read access" on public.media_assets
  for select using (true);

drop policy if exists "Admin media write access" on public.media_assets;
create policy "Admin media write access" on public.media_assets
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── 9. posts ────────────────────────────────────────────────────────────────
drop policy if exists "public read published" on public.posts;
create policy "public read published" on public.posts
  for select using (status = 'published' or public.is_admin());

drop policy if exists "admin write" on public.posts;
create policy "admin write" on public.posts
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── 10. post_categories ────────────────────────────────────────────────────
drop policy if exists "Public read post_categories" on public.post_categories;
create policy "Public read post_categories" on public.post_categories
  for select using (true);

drop policy if exists "Admin write post_categories" on public.post_categories;
create policy "Admin write post_categories" on public.post_categories
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── 11. forms & form_fields ────────────────────────────────────────────────
drop policy if exists "public read active" on public.forms;
create policy "public read active" on public.forms
  for select using (is_active or public.is_admin());

drop policy if exists "admin write" on public.forms;
create policy "admin write" on public.forms
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read" on public.form_fields;
create policy "public read" on public.form_fields
  for select using (true);

drop policy if exists "admin write" on public.form_fields;
create policy "admin write" on public.form_fields
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── 12. form_submissions ───────────────────────────────────────────────────
drop policy if exists "anyone submit" on public.form_submissions;
create policy "anyone submit" on public.form_submissions
  for insert to anon, authenticated with check (true);

drop policy if exists "read own or admin" on public.form_submissions;
create policy "read own or admin" on public.form_submissions
  for select using (profile_id = auth.uid() or public.is_admin());

drop policy if exists "admin manage" on public.form_submissions;
create policy "admin manage" on public.form_submissions
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── 13. form_categories ────────────────────────────────────────────────────
drop policy if exists "Public read form_categories" on public.form_categories;
create policy "Public read form_categories" on public.form_categories
  for select using (true);

drop policy if exists "Admin write form_categories" on public.form_categories;
create policy "Admin write form_categories" on public.form_categories
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── 14. Public Submissions (Applications, Contact, Newsletter) ──────────────
do $$
declare t text;
begin
  foreach t in array array[
    'membership_applications',
    'contact_submissions',
    'newsletter_subscribers'
  ] loop
    execute format('drop policy if exists "anyone submit" on public.%I;', t);
    execute format('create policy "anyone submit" on public.%I
                      for insert to anon, authenticated with check (true);', t);

    execute format('drop policy if exists "admin read" on public.%I;', t);
    execute format('create policy "admin read" on public.%I
                      for select using (public.is_admin());', t);

    execute format('drop policy if exists "admin manage" on public.%I;', t);
    execute format('create policy "admin manage" on public.%I
                      for all using (public.is_admin()) with check (public.is_admin());', t);
  end loop;
end $$;

-- ─── 15. Simple Marketing CMS Content ────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'pillars',
    'goals',
    'impact_stories',
    'story_eras',
    'perks',
    'faqs',
    'achievements'
  ] loop
    execute format('drop policy if exists "public read published" on public.%I;', t);
    execute format('create policy "public read published" on public.%I
                      for select using (is_published or public.is_admin());', t);

    execute format('drop policy if exists "admin write" on public.%I;', t);
    execute format('create policy "admin write" on public.%I
                      for all using (public.is_admin()) with check (public.is_admin());', t);
  end loop;
end $$;

-- ─── 16. site_content ───────────────────────────────────────────────────────
drop policy if exists "public read" on public.site_content;
create policy "public read" on public.site_content
  for select using (true);

drop policy if exists "admin write" on public.site_content;
create policy "admin write" on public.site_content
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── 17. templates & tasks ───────────────────────────────────────────────────
drop policy if exists "Admin template access" on public.templates;
create policy "Admin template access" on public.templates
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admin task access" on public.tasks;
create policy "Admin task access" on public.tasks
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── 18. pages (Visual Page Builder) ─────────────────────────────────────────
drop policy if exists "public read published" on public.pages;
create policy "public read published" on public.pages
  for select using (is_published or public.is_admin());

drop policy if exists "admin write" on public.pages;
create policy "admin write" on public.pages
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── 19. CMS collections, collection_fields & collection_items ───────────────
drop policy if exists "collections public read" on public.collections;
create policy "collections public read" on public.collections
  for select using (true);

drop policy if exists "collections admin write" on public.collections;
create policy "collections admin write" on public.collections
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "fields public read" on public.collection_fields;
create policy "fields public read" on public.collection_fields
  for select using (true);

drop policy if exists "fields admin write" on public.collection_fields;
create policy "fields admin write" on public.collection_fields
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "items public read published" on public.collection_items;
create policy "items public read published" on public.collection_items
  for select using (is_published or public.is_admin());

drop policy if exists "items admin write" on public.collection_items;
create policy "items admin write" on public.collection_items
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── 20. terms ───────────────────────────────────────────────────────────────
drop policy if exists "terms public read" on public.terms;
create policy "terms public read" on public.terms
  for select using (true);

drop policy if exists "terms admin write" on public.terms;
create policy "terms admin write" on public.terms
  for all using (public.is_admin()) with check (public.is_admin());
