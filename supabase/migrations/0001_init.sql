-- ============================================================================
-- Science Club platform — initial schema, roles, RLS
-- Aligned to the SRS & System Design v1.0 (membership + events + posts + CMS).
-- Run this first (SQL editor or `supabase db push`), then supabase/seed.sql.
--
-- Storage: images live in UploadThing (per SRS) — every *_url / img / photo
-- column just holds a URL string. Supabase never stores the file itself.
--
-- Roles (user_role): owner > admin > execom > member (guests are unauthenticated).
--   owner  → everything, incl. managing other admins + site settings
--   admin  → manage all content: events, execom, posts, gallery, forms,
--            attendance, CSV export
--   execom → member rights + edit their OWN execom_members entry
--   member → register for events (member pricing), view own registrations,
--            edit own profile
-- First account to sign up is bootstrapped as `owner`; everyone else `member`.
-- ============================================================================

create extension if not exists "pgcrypto";  -- gen_random_uuid()

-- ─── Enums ──────────────────────────────────────────────────────────────────
do $$ begin create type user_role         as enum ('member','execom','admin','owner');                exception when duplicate_object then null; end $$;
do $$ begin create type event_category    as enum ('talk','workshop','game','trip');                  exception when duplicate_object then null; end $$;
do $$ begin create type execom_role_type  as enum ('student','faculty_advisor');                      exception when duplicate_object then null; end $$;
do $$ begin create type post_type         as enum ('news','article','paper','blog','announcement');   exception when duplicate_object then null; end $$;
do $$ begin create type post_status       as enum ('draft','published','archived');                   exception when duplicate_object then null; end $$;
do $$ begin create type form_purpose      as enum ('membership','event','generic');                   exception when duplicate_object then null; end $$;
do $$ begin create type form_field_type   as enum ('text','textarea','email','phone','number','select','multiselect','checkbox','radio','date'); exception when duplicate_object then null; end $$;
do $$ begin create type application_status as enum ('pending','approved','rejected');                 exception when duplicate_object then null; end $$;

-- ─── Shared helper: updated_at ──────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

-- ============================================================================
-- profiles  (mirrors auth.users; holds role + membership)
-- ============================================================================
create table if not exists public.profiles (
  id                     uuid primary key references auth.users(id) on delete cascade,
  full_name              text,
  email                  text,
  department             text,
  year_of_study          text,
  role                   user_role   not null default 'member',
  is_member              boolean     not null default false,   -- paid annual fee → discounted pricing
  membership_expires_at  date,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- Role checks. SECURITY DEFINER so they read profiles without tripping RLS
-- (the profiles policies themselves call these → avoids recursion).
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

-- First signup → owner, everyone else → member. Auto-creates the profile row.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    case when (select count(*) from public.profiles) = 0
         then 'owner'::user_role else 'member'::user_role end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Non-admins may edit their own profile but NOT their role / membership fields.
create or replace function public.protect_profile_columns()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    if new.role is distinct from old.role then
      raise exception 'Only admins can change role';
    end if;
    if new.is_member is distinct from old.is_member
       or new.membership_expires_at is distinct from old.membership_expires_at then
      raise exception 'Only admins can change membership status';
    end if;
  end if;
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists protect_profile_columns on public.profiles;
create trigger protect_profile_columns
  before update on public.profiles
  for each row execute function public.protect_profile_columns();

-- ============================================================================
-- teams  (team-level copy for the home Execom carousel headers)
-- ============================================================================
create table if not exists public.teams (
  slug        text primary key,        -- 'core' | 'tech' | 'media' | 'events'
  label       text not null,
  name        text not null,
  tagline     text,
  description text,
  sort_order  int not null default 0
);

-- ============================================================================
-- execom_members  (current + historical office-bearers, by term)
-- ============================================================================
create table if not exists public.execom_members (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid references public.profiles(id) on delete set null,  -- linked login, if any
  name         text not null,
  position     text not null,               -- 'Chairperson', 'Tech Lead', …
  role_type    execom_role_type not null default 'student',
  team_slug    text references public.teams(slug) on delete set null,
  term         text not null,               -- '2025-26'
  bio          text,
  photo_url    text,
  email        text,
  linkedin     text,
  socials      jsonb not null default '{}'::jsonb,
  display_order int not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists execom_members_term_idx  on public.execom_members(term);
create index if not exists execom_members_team_idx  on public.execom_members(team_slug);
create index if not exists execom_members_profile_idx on public.execom_members(profile_id);

-- ============================================================================
-- events  (upcoming/finished derived from event_date)
-- ============================================================================
create table if not exists public.events (
  id                   uuid primary key default gen_random_uuid(),
  title                text not null,
  slug                 text unique,
  category             event_category not null default 'talk',
  description          text,
  event_date           timestamptz,                 -- upcoming if in the future
  location             text,
  member_price         numeric(10,2) not null default 0,
  non_member_price     numeric(10,2) not null default 0,
  cover_image_url      text,
  -- Rich UI extras (kept from the existing design):
  speaker              text,
  speaker_role         text,
  seats_remaining      int,
  agenda               jsonb not null default '[]'::jsonb,   -- [{time,title,description}]
  prerequisites        text[] not null default '{}',
  -- Registration wiring (form builder + shareable code, per WhatsApp):
  registration_form_id uuid,                          -- FK added after forms table
  registration_code    text,                          -- optional access/join code
  album_id             uuid,                          -- FK added after media_albums
  is_published         boolean not null default true,
  created_by           uuid references public.profiles(id) on delete set null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index if not exists events_date_idx     on public.events(event_date);
create index if not exists events_category_idx on public.events(category);

-- ============================================================================
-- event_registrations  (one per user per event; price computed server-side)
-- ============================================================================
create table if not exists public.event_registrations (
  id             uuid primary key default gen_random_uuid(),
  event_id       uuid not null references public.events(id) on delete cascade,
  profile_id     uuid not null references public.profiles(id) on delete cascade,
  price_paid     numeric(10,2) not null default 0,   -- server-computed, never trusted from client
  attended       boolean not null default false,     -- source for the certificate CSV
  certificate_id text,                                -- assigned at export time
  form_data      jsonb,                               -- answers if the event had a custom form
  registered_at  timestamptz not null default now(),
  unique (event_id, profile_id)
);
create index if not exists registrations_event_idx   on public.event_registrations(event_id);
create index if not exists registrations_profile_idx on public.event_registrations(profile_id);

-- ============================================================================
-- media_albums / media_images  (gallery + event "finished" photo grids)
-- ============================================================================
create table if not exists public.media_albums (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  event_id        uuid references public.events(id) on delete set null,
  category        text,                    -- 'talk' | 'workshop' | 'game' | 'trip' | 'execom' | …
  term            text,
  cover_image_url text,
  description     text,
  display_order   int not null default 0,
  is_published    boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists albums_event_idx on public.media_albums(event_id);

create table if not exists public.media_images (
  id            uuid primary key default gen_random_uuid(),
  album_id      uuid not null references public.media_albums(id) on delete cascade,
  image_url     text not null,
  caption       text,
  display_order int not null default 0,
  is_published  boolean not null default true
);
create index if not exists images_album_idx on public.media_images(album_id);

-- Now that media_albums exists, wire events.album_id.
do $$ begin
  alter table public.events
    add constraint events_album_fk foreign key (album_id)
    references public.media_albums(id) on delete set null;
exception when duplicate_object then null; end $$;

-- ============================================================================
-- posts  (news / articles / papers / blogs / announcements — template-based)
-- ============================================================================
create table if not exists public.posts (
  id            uuid primary key default gen_random_uuid(),
  type          post_type not null default 'news',
  status        post_status not null default 'draft',
  title         text not null,
  slug          text unique,
  excerpt       text,
  body          text,                       -- markdown / rich text
  cover_image_url text,
  tag           text,
  author_id     uuid references public.profiles(id) on delete set null,
  meta          jsonb not null default '{}'::jsonb,  -- type-specific: paper→{pdf_url,doi,authors}, blog→{reading_time}
  is_featured   boolean not null default false,
  breaking      boolean not null default false,      -- news ticker
  display_order int not null default 0,
  published_at  timestamptz,
  created_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists posts_type_status_idx on public.posts(type, status, published_at desc);

-- ============================================================================
-- Generic form-builder engine  (Join page + per-event registration forms)
-- ============================================================================
create table if not exists public.forms (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text unique,
  description text,
  purpose     form_purpose not null default 'generic',
  is_active   boolean not null default true,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.form_fields (
  id            uuid primary key default gen_random_uuid(),
  form_id       uuid not null references public.forms(id) on delete cascade,
  label         text not null,
  field_key     text not null,             -- machine key used in submission jsonb
  field_type    form_field_type not null default 'text',
  required      boolean not null default false,
  placeholder   text,
  help_text     text,
  options       jsonb not null default '[]'::jsonb,   -- for select/radio/multiselect
  display_order int not null default 0,
  unique (form_id, field_key)
);
create index if not exists form_fields_form_idx on public.form_fields(form_id, display_order);

create table if not exists public.form_submissions (
  id         uuid primary key default gen_random_uuid(),
  form_id    uuid not null references public.forms(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  event_id   uuid references public.events(id) on delete set null,
  data       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists form_submissions_form_idx  on public.form_submissions(form_id);
create index if not exists form_submissions_event_idx on public.form_submissions(event_id);

-- Wire events.registration_form_id now that forms exists.
do $$ begin
  alter table public.events
    add constraint events_reg_form_fk foreign key (registration_form_id)
    references public.forms(id) on delete set null;
exception when duplicate_object then null; end $$;

-- ============================================================================
-- Public submissions (insert-only for the public; admins read/manage)
-- ============================================================================
create table if not exists public.membership_applications (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid references public.profiles(id) on delete set null,
  name          text not null,
  email         text not null,
  department    text,
  year_of_study text,
  motivation    text,
  status        application_status not null default 'pending',
  reviewed_by   uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now()
);

create table if not exists public.contact_submissions (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  email      text not null,
  subject    text,
  message    text not null,
  handled    boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- CMS content for the existing marketing UI (editable in-site)
-- ============================================================================
create table if not exists public.pillars (
  id uuid primary key default gen_random_uuid(),
  num text not null, icon text, title text not null, short text, detail text,
  image text, tag text,
  sort_order int not null default 0, is_published boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  target_year text, title text not null, description text, status text,
  progress int not null default 0, category text, image text,
  sort_order int not null default 0, is_published boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.impact_stories (
  id uuid primary key default gen_random_uuid(),
  quote text not null, author text not null, role text, tag text, image text,
  sort_order int not null default 0, is_published boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.story_eras (
  id uuid primary key default gen_random_uuid(),
  year text not null, title text not null, description text, img text,
  sort_order int not null default 0, is_published boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.perks (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  sort_order int not null default 0, is_published boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null, answer text not null,
  sort_order int not null default 0, is_published boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  title text not null, subtitle text, icon text,
  sort_order int not null default 0, is_published boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- Singletons: hero copy, marquee, stats, contact, location, footer, current_term…
create table if not exists public.site_content (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ─── updated_at triggers ────────────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'execom_members','events','media_albums','posts','forms','pillars','goals',
    'impact_stories','story_eras','perks','faqs','achievements'
  ] loop
    execute format('drop trigger if exists set_updated_at on public.%I;', t);
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function public.set_updated_at();', t);
  end loop;
end $$;

-- ============================================================================
-- Row Level Security  (deny-by-default; policies below open specific access)
-- ============================================================================
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','teams','execom_members','events','event_registrations',
    'media_albums','media_images','posts','forms','form_fields','form_submissions',
    'membership_applications','contact_submissions','newsletter_subscribers',
    'pillars','goals','impact_stories','story_eras','perks','faqs','achievements',
    'site_content'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
  end loop;
end $$;

-- ── Simple CMS content: public reads published rows, admins write. ───────────
do $$
declare t text;
begin
  foreach t in array array[
    'pillars','goals','impact_stories','story_eras','perks','faqs',
    'achievements','media_albums','media_images'
  ] loop
    execute format('drop policy if exists "public read published" on public.%I;', t);
    execute format('create policy "public read published" on public.%I
                      for select using (is_published or public.is_admin());', t);
    execute format('drop policy if exists "admin write" on public.%I;', t);
    execute format('create policy "admin write" on public.%I
                      for all using (public.is_admin()) with check (public.is_admin());', t);
  end loop;

  -- Fully public-read singletons/config.
  foreach t in array array['teams','site_content'] loop
    execute format('drop policy if exists "public read" on public.%I;', t);
    execute format('create policy "public read" on public.%I for select using (true);', t);
    execute format('drop policy if exists "admin write" on public.%I;', t);
    execute format('create policy "admin write" on public.%I
                      for all using (public.is_admin()) with check (public.is_admin());', t);
  end loop;
end $$;

-- ── profiles ─────────────────────────────────────────────────────────────────
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

-- ── execom_members: public reads published; admins write; execom edits own ──
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

-- ── events: public reads published; admins write. ───────────────────────────
drop policy if exists "public read published" on public.events;
create policy "public read published" on public.events
  for select using (is_published or public.is_admin());
drop policy if exists "admin write" on public.events;
create policy "admin write" on public.events
  for all using (public.is_admin()) with check (public.is_admin());

-- ── event_registrations: user reads own, admin all; INSERTS go through the
--    server route with the service role (which bypasses RLS) so price_paid
--    can't be tampered with. Admins update attendance. ────────────────────────
drop policy if exists "read own or admin" on public.event_registrations;
create policy "read own or admin" on public.event_registrations
  for select using (profile_id = auth.uid() or public.is_admin());
drop policy if exists "admin manage" on public.event_registrations;
create policy "admin manage" on public.event_registrations
  for all using (public.is_admin()) with check (public.is_admin());

-- ── posts: public reads published; admins write. ────────────────────────────
drop policy if exists "public read published" on public.posts;
create policy "public read published" on public.posts
  for select using (status = 'published' or public.is_admin());
drop policy if exists "admin write" on public.posts;
create policy "admin write" on public.posts
  for all using (public.is_admin()) with check (public.is_admin());

-- ── forms + fields: public reads active; admins build. ──────────────────────
drop policy if exists "public read active" on public.forms;
create policy "public read active" on public.forms
  for select using (is_active or public.is_admin());
drop policy if exists "admin write" on public.forms;
create policy "admin write" on public.forms
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read" on public.form_fields;
create policy "public read" on public.form_fields for select using (true);
drop policy if exists "admin write" on public.form_fields;
create policy "admin write" on public.form_fields
  for all using (public.is_admin()) with check (public.is_admin());

-- ── form_submissions: anyone submits; owner-of-submission or admin reads. ────
drop policy if exists "anyone submit" on public.form_submissions;
create policy "anyone submit" on public.form_submissions
  for insert to anon, authenticated with check (true);
drop policy if exists "read own or admin" on public.form_submissions;
create policy "read own or admin" on public.form_submissions
  for select using (profile_id = auth.uid() or public.is_admin());
drop policy if exists "admin manage" on public.form_submissions;
create policy "admin manage" on public.form_submissions
  for all using (public.is_admin()) with check (public.is_admin());

-- ── Public form tables: anyone inserts, admins read/manage. ─────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'membership_applications','contact_submissions','newsletter_subscribers'
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
