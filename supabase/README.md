# Backend setup

Platform backend per the SRS & System Design v1.0.

- **Supabase** — Postgres (all relational data) + Auth + RLS.
- **UploadThing** — image storage (event covers, gallery, execom headshots).
  Every image column in the DB just holds an UploadThing URL; Supabase never
  stores files (keeps us off Supabase's thin free-tier storage).

## One-time setup

1. **Supabase project** at [supabase.com](https://supabase.com) → note the
   Project URL, `anon` key, and `service_role` key (Settings → API).

2. **UploadThing app** at [uploadthing.com](https://uploadthing.com) → note the
   `UPLOADTHING_TOKEN`.

3. **Env** — copy `.env.local.example` → `.env.local`, fill in all values,
   restart `npm run dev`.

4. **Schema then seed** — Supabase Dashboard → SQL Editor, run in order:
   1. `supabase/migrations/0001_init.sql`
   2. `supabase/seed.sql`

   (or via CLI: `supabase db push` then `psql "$DATABASE_URL" -f supabase/seed.sql`)

5. **Owner account** — the **first** user to sign up is auto-assigned `owner`
   (see the `handle_new_user` trigger). Everyone after is `member`. Sign up once
   via the admin login (built later) or Dashboard → Authentication → Add user,
   then confirm `public.profiles.role = 'owner'`.

## Roles

| Role     | Can |
|----------|-----|
| `owner`  | Everything, incl. managing admins + site settings |
| `admin`  | Manage all content: events, execom, posts, gallery, forms; attendance; CSV export |
| `execom` | Member rights **+ edit their own execom profile** |
| `member` | Register for events (member pricing), view own registrations, edit own profile |
| Guest    | Browse; submit contact + membership forms |

Membership (`is_member`) is a separate flag an admin flips after confirming the
fee offline; it only affects event pricing. Roles and `is_member` are protected
by a trigger — non-admins can edit their own profile but not their own role or
membership.

## Schema at a glance

- **People/membership:** `profiles`, `teams`, `execom_members` (term-based history).
- **Events:** `events` (upcoming/finished derived from `event_date`; optional
  `registration_form_id` + `registration_code`), `event_registrations`
  (`unique(event_id, profile_id)`, `attended`, `certificate_id`).
- **Posts (template-based):** `posts` (`type` = news/article/paper/blog/announcement,
  `status` draft/published, type-specific `meta` jsonb).
- **Gallery:** `media_albums` / `media_images` (an event's finished photo grid
  reuses its album).
- **Form builder:** `forms` / `form_fields` / `form_submissions` (powers per-event
  registration forms and the Join page).
- **Public submissions:** `membership_applications`, `contact_submissions`,
  `newsletter_subscribers`.
- **Editable page content (CMS):** `pillars`, `goals`, `impact_stories`,
  `story_eras`, `perks`, `faqs`, `achievements`, and `site_content` (singletons
  like hero copy, marquee, stats, contact, location, footer, current term).

## Notes

- **RLS is on everywhere, deny-by-default.** Public reads only see published rows;
  the two public form tables accept anonymous inserts but only admins read them.
- **Event registration pricing is never trusted from the client** — it's computed
  in a server route using the service-role key, which is why direct client inserts
  into `event_registrations` are not allowed by RLS.
- **Re-seeding** truncates the content tables (and, by cascade, registrations and
  form submissions). Safe for initial/dev loads only.
