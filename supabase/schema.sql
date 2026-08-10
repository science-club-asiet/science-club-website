-- ============================================================================
-- Science Club Platform — Complete Consolidated Database Schema
-- Aligned to SRS & System Design v1.0 and all migrations (0001 through 0016).
--
-- Storage: images live in UploadThing (per SRS) — every *_url / img / photo
-- column stores the URL string. Supabase never stores the raw file itself.
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

-- ─── Shared Helper: updated_at ──────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- profiles (mirrors auth.users; holds role, membership, and member CRM tags)
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
  tags                   text[]      not null default '{}',
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

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
-- teams (team-level copy for Execom carousel headers)
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
-- execom_members (current + historical office-bearers, by term)
-- ============================================================================
create table if not exists public.execom_members (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid references public.profiles(id) on delete set null,  -- linked login, if any
  name          text not null,
  position      text not null,               -- 'Chairperson', 'Tech Lead', …
  role_type     execom_role_type not null default 'student',
  team_slug     text references public.teams(slug) on delete set null,
  term          text not null,               -- '2025-26'
  bio           text,
  photo_url     text,
  email         text,
  linkedin      text,
  socials       jsonb not null default '{}'::jsonb,
  display_order int not null default 0,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists execom_members_term_idx    on public.execom_members(term);
create index if not exists execom_members_team_idx    on public.execom_members(team_slug);
create index if not exists execom_members_profile_idx on public.execom_members(profile_id);

-- ============================================================================
-- terms (Dynamic Academic Terms Management)
-- ============================================================================
create table if not exists public.terms (
  id           uuid primary key default gen_random_uuid(),
  name         text not null unique,
  is_published boolean not null default false,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);

-- ============================================================================
-- event_categories & post_categories (Dynamic custom categories)
-- ============================================================================
create table if not exists public.event_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  tagline     text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.post_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  tagline     text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================================
-- Generic form-builder engine (Forms, Fields, Submissions, Categories)
-- ============================================================================
create table if not exists public.form_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  description text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.forms (
  id                        uuid primary key default gen_random_uuid(),
  title                     text not null,
  slug                      text unique,
  description               text,
  purpose                   form_purpose not null default 'generic',
  is_active                 boolean not null default true,
  category                  text not null default 'General',
  is_template               boolean not null default false,
  layout                    jsonb,
  nexus_data                jsonb,
  confirmation_message      text default 'Thank you! Your response has been recorded.',
  closed_message            text default 'This form is no longer accepting responses.',
  close_at                  timestamptz,
  max_responses             integer,
  limit_one_per_user        boolean not null default false,
  show_submit_another       boolean not null default true,
  collect_email_type        text not null default 'DO_NOT_COLLECT',
  header_image_url          text,
  google_sheets_webhook_url text,
  created_by                uuid references public.profiles(id) on delete set null,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create table if not exists public.form_fields (
  id              uuid primary key default gen_random_uuid(),
  form_id         uuid not null references public.forms(id) on delete cascade,
  label           text not null,
  field_key       text not null,             -- machine key used in submission jsonb
  field_type      text not null default 'text', -- supports text, number, date, section, scale, file, time etc.
  required        boolean not null default false,
  placeholder     text,
  help_text       text,
  options         jsonb not null default '[]'::jsonb,   -- for select/radio/multiselect
  image_url       text,
  validation_rule jsonb not null default '{}'::jsonb,
  allow_other     boolean not null default false,
  shuffle_options boolean not null default false,
  scale_min       integer default 1,
  scale_max       integer default 5,
  scale_min_label text,
  scale_max_label text,
  grid_rows       jsonb not null default '[]'::jsonb,
  grid_columns    jsonb not null default '[]'::jsonb,
  file_types      jsonb not null default '[]'::jsonb,
  max_file_size   text default '10MB',
  max_files       integer default 1,
  upload_folder   text default 'forms',
  display_order   int not null default 0,
  unique (form_id, field_key)
);

create index if not exists form_fields_form_idx on public.form_fields(form_id, display_order);

-- ============================================================================
-- media_albums / media_images (gallery + event "finished" photo grids)
-- ============================================================================
create table if not exists public.media_albums (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  event_id        uuid, -- circular FK wired after events table
  category        text, -- 'talk' | 'workshop' | 'game' | 'trip' | 'execom' | …
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

-- ============================================================================
-- events (upcoming/finished derived from event_date; block & visual builder data)
-- ============================================================================
create table if not exists public.events (
  id                   uuid primary key default gen_random_uuid(),
  title                text not null,
  slug                 text unique,
  category             event_category not null default 'talk',
  description          text,
  event_date           timestamptz,
  location             text,
  member_price         numeric(10,2) not null default 0,
  non_member_price     numeric(10,2) not null default 0,
  cover_image_url      text,
  speaker              text,
  speaker_role         text,
  seats_remaining      int,
  agenda               jsonb not null default '[]'::jsonb,   -- [{time,title,description}]
  prerequisites        text[] not null default '{}',
  status               text not null default 'open' check (status in ('open', 'closed', 'finished', 'draft')),
  gallery_images       text[] not null default '{}',
  attachments          jsonb not null default '[]'::jsonb,
  term                 text default '2025-26',
  blocks               jsonb not null default '[]'::jsonb,
  layout               jsonb,
  nexus_data           jsonb,
  registration_form_id uuid references public.forms(id) on delete set null,
  registration_code    text,                          -- optional access/join code
  album_id             uuid references public.media_albums(id) on delete set null,
  is_published         boolean not null default true,
  created_by           uuid references public.profiles(id) on delete set null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists events_date_idx      on public.events(event_date);
create index if not exists events_category_idx  on public.events(category);
create index if not exists events_term_idx      on public.events(term);
create index if not exists events_status_idx    on public.events(status);
create index if not exists events_reg_form_idx  on public.events(registration_form_id);

-- Wire foreign key from media_albums to events if not present
do $$ begin
  alter table public.media_albums
    add constraint media_albums_event_fk foreign key (event_id)
    references public.events(id) on delete set null;
exception when duplicate_object then null; end $$;

-- ============================================================================
-- event_registrations (one per user per event; price computed server-side)
-- ============================================================================
create table if not exists public.event_registrations (
  id             uuid primary key default gen_random_uuid(),
  event_id       uuid not null references public.events(id) on delete cascade,
  profile_id     uuid not null references public.profiles(id) on delete cascade,
  price_paid     numeric(10,2) not null default 0,   -- server-computed, never trusted from client
  attended       boolean not null default false,     -- source for certificate CSV
  certificate_id text,                                -- assigned at export time
  form_data      jsonb,                               -- answers if the event had a custom form
  registered_at  timestamptz not null default now(),
  unique (event_id, profile_id)
);

create index if not exists registrations_event_idx   on public.event_registrations(event_id);
create index if not exists registrations_profile_idx on public.event_registrations(profile_id);

-- ============================================================================
-- posts (news / articles / papers / blogs / announcements — builder-enabled)
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
  term          text default '2025-26',
  blocks        jsonb not null default '[]'::jsonb,
  layout        jsonb,
  nexus_data    jsonb,
  created_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists posts_type_status_idx on public.posts(type, status, published_at desc);
create index if not exists posts_term_idx        on public.posts(term);

-- ============================================================================
-- form_submissions (records responses from custom forms)
-- ============================================================================
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

-- ============================================================================
-- Public submissions (insert-only for public; admins read/manage)
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
  stage         text not null default 'submitted', -- Kanban pipeline: submitted | review | interview | accepted | rejected
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
-- media_assets (Media Library)
-- ============================================================================
create table if not exists public.media_assets (
  id         uuid primary key default gen_random_uuid(),
  url        text not null,
  name       text not null,
  mime       text not null,
  size       bigint not null,
  width      int,
  height     int,
  folder     text not null default 'general',
  alt        text,
  tags       text[] not null default '{}',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- ============================================================================
-- templates & tasks (Templates + Playbooks System)
-- ============================================================================
create table if not exists public.templates (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('events', 'posts', 'forms', 'page')),
  name        text not null,
  description text,
  payload     jsonb not null default '{}'::jsonb,
  created_by  uuid references auth.users(id),
  created_at  timestamptz not null default now()
);

create table if not exists public.tasks (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  is_completed boolean not null default false,
  entity_type  text,
  entity_id    uuid,
  created_by   uuid references auth.users(id),
  created_at   timestamptz not null default now()
);

-- ============================================================================
-- pages (Visual Page Builder standalone pages)
-- ============================================================================
create table if not exists public.pages (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text unique,
  layout       jsonb,
  nexus_data   jsonb,
  is_published boolean not null default false,
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ============================================================================
-- CMS Collections, Fields, and Items
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
  type          text not null default 'text',  -- FieldType
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

-- ============================================================================
-- CMS Marketing Content (Editable in-site)
-- ============================================================================
create table if not exists public.pillars (
  id           uuid primary key default gen_random_uuid(),
  num          text not null,
  icon         text,
  title        text not null,
  short        text,
  detail       text,
  image        text,
  tag          text,
  sort_order   int not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.goals (
  id           uuid primary key default gen_random_uuid(),
  target_year  text,
  title        text not null,
  description  text,
  status       text,
  progress     int not null default 0,
  category     text,
  image        text,
  sort_order   int not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.impact_stories (
  id           uuid primary key default gen_random_uuid(),
  quote        text not null,
  author       text not null,
  role         text,
  tag          text,
  image        text,
  sort_order   int not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.story_eras (
  id           uuid primary key default gen_random_uuid(),
  year         text not null,
  title        text not null,
  description  text,
  img          text,
  sort_order   int not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.perks (
  id           uuid primary key default gen_random_uuid(),
  text         text not null,
  sort_order   int not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.faqs (
  id           uuid primary key default gen_random_uuid(),
  question     text not null,
  answer       text not null,
  sort_order   int not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.achievements (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  subtitle     text,
  icon         text,
  sort_order   int not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.site_content (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- Triggers: updated_at
-- ============================================================================
do $$
declare t text;
begin
  foreach t in array array[
    'execom_members',
    'events',
    'media_albums',
    'posts',
    'forms',
    'pillars',
    'goals',
    'impact_stories',
    'story_eras',
    'perks',
    'faqs',
    'achievements',
    'pages',
    'collections',
    'collection_items',
    'event_categories',
    'post_categories',
    'form_categories'
  ] loop
    execute format('drop trigger if exists set_updated_at on public.%I;', t);
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function public.set_updated_at();', t);
  end loop;
end $$;

-- ============================================================================
-- Default Lookup Data / Seed Presets
-- ============================================================================
insert into public.terms (name, is_published, sort_order)
values
  ('2025-26', true, 0),
  ('2023-24', false, 1),
  ('2022-23', false, 2),
  ('2021-22', false, 3)
on conflict (name) do nothing;

insert into public.event_categories (name, slug, tagline, sort_order)
values
  ('Talk & Seminar', 'talk', 'Expert keynotes, tech talks, and guest lectures', 1),
  ('Hands-on Workshop', 'workshop', 'Interactive technical building sessions', 2),
  ('Gaming & Hackathon', 'game', 'Competitions, LAN parties, and hackathons', 3),
  ('Field Trip & Visit', 'trip', 'Industrial visits and outdoor tech excursions', 4)
on conflict (slug) do nothing;

insert into public.post_categories (name, slug, tagline, sort_order)
values
  ('Latest News', 'news', 'Official club updates and press releases', 1),
  ('Tech Article', 'article', 'Deep dives, tutorials, and tech write-ups', 2),
  ('Research Paper', 'paper', 'Academic research and paper publications', 3),
  ('Member Blog', 'blog', 'Student stories, experiences, and opinions', 4),
  ('Announcement', 'announcement', 'Important notices and deadlines', 5)
on conflict (slug) do nothing;

insert into public.form_categories (name, slug, description, sort_order)
values
  ('General', 'general', 'Default category for standard club forms', 1),
  ('Registrations', 'registrations', 'Event, workshop, and hackathon registration forms', 2),
  ('Recruitment', 'recruitment', 'Membership intake and Execom recruitment applications', 3),
  ('Feedback', 'feedback', 'Post-event feedback, polls, and opinion surveys', 4),
  ('Competitions', 'competitions', 'Submission forms for hackathons and project contests', 5)
on conflict (slug) do nothing;

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================
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
    execute format('alter table public.%I enable row level security;', t);
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

-- ── teams ────────────────────────────────────────────────────────────────────
drop policy if exists "public read" on public.teams;
create policy "public read" on public.teams
  for select using (true);

drop policy if exists "admin write" on public.teams;
create policy "admin write" on public.teams
  for all using (public.is_admin()) with check (public.is_admin());

-- ── execom_members ───────────────────────────────────────────────────────────
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

-- ── events ───────────────────────────────────────────────────────────────────
drop policy if exists "public read published" on public.events;
create policy "public read published" on public.events
  for select using (is_published or public.is_admin());

drop policy if exists "admin write" on public.events;
create policy "admin write" on public.events
  for all using (public.is_admin()) with check (public.is_admin());

-- ── event_registrations ──────────────────────────────────────────────────────
drop policy if exists "read own or admin" on public.event_registrations;
create policy "read own or admin" on public.event_registrations
  for select using (profile_id = auth.uid() or public.is_admin());

drop policy if exists "admin manage" on public.event_registrations;
create policy "admin manage" on public.event_registrations
  for all using (public.is_admin()) with check (public.is_admin());

-- ── event_categories ─────────────────────────────────────────────────────────
drop policy if exists "Public read event_categories" on public.event_categories;
create policy "Public read event_categories" on public.event_categories
  for select using (true);

drop policy if exists "Admin write event_categories" on public.event_categories;
create policy "Admin write event_categories" on public.event_categories
  for all using (public.is_admin()) with check (public.is_admin());

-- ── media_albums & media_images ──────────────────────────────────────────────
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

-- ── media_assets ─────────────────────────────────────────────────────────────
drop policy if exists "Public media read access" on public.media_assets;
create policy "Public media read access" on public.media_assets
  for select using (true);

drop policy if exists "Admin media write access" on public.media_assets;
create policy "Admin media write access" on public.media_assets
  for all using (public.is_admin()) with check (public.is_admin());

-- ── posts ────────────────────────────────────────────────────────────────────
drop policy if exists "public read published" on public.posts;
create policy "public read published" on public.posts
  for select using (status = 'published' or public.is_admin());

drop policy if exists "admin write" on public.posts;
create policy "admin write" on public.posts
  for all using (public.is_admin()) with check (public.is_admin());

-- ── post_categories ──────────────────────────────────────────────────────────
drop policy if exists "Public read post_categories" on public.post_categories;
create policy "Public read post_categories" on public.post_categories
  for select using (true);

drop policy if exists "Admin write post_categories" on public.post_categories;
create policy "Admin write post_categories" on public.post_categories
  for all using (public.is_admin()) with check (public.is_admin());

-- ── forms & form_fields ──────────────────────────────────────────────────────
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

-- ── form_submissions ─────────────────────────────────────────────────────────
drop policy if exists "anyone submit" on public.form_submissions;
create policy "anyone submit" on public.form_submissions
  for insert to anon, authenticated with check (true);

drop policy if exists "read own or admin" on public.form_submissions;
create policy "read own or admin" on public.form_submissions
  for select using (profile_id = auth.uid() or public.is_admin());

drop policy if exists "admin manage" on public.form_submissions;
create policy "admin manage" on public.form_submissions
  for all using (public.is_admin()) with check (public.is_admin());

-- ── form_categories ──────────────────────────────────────────────────────────
drop policy if exists "Public read form_categories" on public.form_categories;
create policy "Public read form_categories" on public.form_categories
  for select using (true);

drop policy if exists "Admin write form_categories" on public.form_categories;
create policy "Admin write form_categories" on public.form_categories
  for all using (public.is_admin()) with check (public.is_admin());

-- ── Public Submissions ───────────────────────────────────────────────────────
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

-- ── Simple CMS Content ───────────────────────────────────────────────────────
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

-- ── site_content ─────────────────────────────────────────────────────────────
drop policy if exists "public read" on public.site_content;
create policy "public read" on public.site_content
  for select using (true);

drop policy if exists "admin write" on public.site_content;
create policy "admin write" on public.site_content
  for all using (public.is_admin()) with check (public.is_admin());

-- ── templates & tasks ─────────────────────────────────────────────────────────
drop policy if exists "Admin template access" on public.templates;
create policy "Admin template access" on public.templates
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admin task access" on public.tasks;
create policy "Admin task access" on public.tasks
  for all using (public.is_admin()) with check (public.is_admin());

-- ── pages ────────────────────────────────────────────────────────────────────
drop policy if exists "public read published" on public.pages;
create policy "public read published" on public.pages
  for select using (is_published or public.is_admin());

drop policy if exists "admin write" on public.pages;
create policy "admin write" on public.pages
  for all using (public.is_admin()) with check (public.is_admin());

-- ── CMS collections, collection_fields & collection_items ─────────────────────
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

-- ── terms ────────────────────────────────────────────────────────────────────
drop policy if exists "terms public read" on public.terms;
create policy "terms public read" on public.terms
  for select using (true);

drop policy if exists "terms admin write" on public.terms;
create policy "terms admin write" on public.terms
  for all using (public.is_admin()) with check (public.is_admin());
