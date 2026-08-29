# Science Club Platform — Supabase Connection Mapping

This document catalogues **every file in the codebase with an active Supabase database connection** (SELECT, INSERT, UPDATE, UPSERT, DELETE, RPC, or Auth), grouped into logical sections and subsections.

## 1. User-Facing (Public & Member) Section

### 1.1 Public Pages & App Routes (3 files)

- [src/app/certificates/[id]/page.tsx](file:///c:/Users/DELL/science-club-website/src/app/certificates/[id]/page.tsx)
  - **Database Tables**: `event_registrations`
  - **Operations**: SELECT

- [src/app/info/join/JoinView.tsx](file:///c:/Users/DELL/science-club-website/src/app/info/join/JoinView.tsx)
  - **Database Tables**: `membership_applications`
  - **Operations**: INSERT

- [src/app/p/[slug]/page.tsx](file:///c:/Users/DELL/science-club-website/src/app/p/[slug]/page.tsx)
  - **Database Tables**: `pages`
  - **Operations**: SELECT

### 1.2 User Account & Login Routes (4 files)

- [src/app/account/AccountClient.tsx](file:///c:/Users/DELL/science-club-website/src/app/account/AccountClient.tsx)
  - **Database Tables**: `profiles`
  - **Operations**: UPDATE

- [src/app/account/actions.ts](file:///c:/Users/DELL/science-club-website/src/app/account/actions.ts)
  - **Database Tables**: `site_content`, `profiles`
  - **Operations**: SELECT, UPDATE, AUTH

- [src/app/account/page.tsx](file:///c:/Users/DELL/science-club-website/src/app/account/page.tsx)
  - **Database Tables**: `profiles`, `event_registrations`
  - **Operations**: SELECT, AUTH

- [src/app/login/page.tsx](file:///c:/Users/DELL/science-club-website/src/app/login/page.tsx)
  - **Database Tables**: *No direct tables (Auth/Client factory)*
  - **Operations**: AUTH

### 1.3 Public Data Fetching Services (src/lib/data/) (7 files)

- [src/lib/data/content.ts](file:///c:/Users/DELL/science-club-website/src/lib/data/content.ts)
  - **Database Tables**: `pillars`, `goals`, `impact_stories`, `story_eras`, `perks`, `faqs`, `achievements`
  - **Operations**: SELECT

- [src/lib/data/events.ts](file:///c:/Users/DELL/science-club-website/src/lib/data/events.ts)
  - **Database Tables**: `events`, `site_content`
  - **Operations**: SELECT

- [src/lib/data/execom.ts](file:///c:/Users/DELL/science-club-website/src/lib/data/execom.ts)
  - **Database Tables**: `site_content`, `teams`, `execom_members`, `media_albums`, `media_images`
  - **Operations**: SELECT

- [src/lib/data/forms.ts](file:///c:/Users/DELL/science-club-website/src/lib/data/forms.ts)
  - **Database Tables**: `forms`, `form_fields`
  - **Operations**: SELECT

- [src/lib/data/gallery.ts](file:///c:/Users/DELL/science-club-website/src/lib/data/gallery.ts)
  - **Database Tables**: `media_albums`, `media_images`
  - **Operations**: SELECT

- [src/lib/data/posts.ts](file:///c:/Users/DELL/science-club-website/src/lib/data/posts.ts)
  - **Database Tables**: `posts`
  - **Operations**: SELECT

- [src/lib/data/site.ts](file:///c:/Users/DELL/science-club-website/src/lib/data/site.ts)
  - **Database Tables**: `site_content`
  - **Operations**: SELECT

### 1.4 Public UI Components & Interactive Widgets (7 files)

- [src/components/blocks/DataBlocks.tsx](file:///c:/Users/DELL/science-club-website/src/components/blocks/DataBlocks.tsx)
  - **Database Tables**: `site_content`, `execom_members`, `events`, `posts`
  - **Operations**: SELECT

- [src/components/blocks/DataBlocks2.tsx](file:///c:/Users/DELL/science-club-website/src/components/blocks/DataBlocks2.tsx)
  - **Database Tables**: `pillars`, `goals`, `story_eras`, `faqs`, `perks`, `media_images`, `site_content`
  - **Operations**: SELECT

- [src/components/ContactSection.tsx](file:///c:/Users/DELL/science-club-website/src/components/ContactSection.tsx)
  - **Database Tables**: `contact_submissions`
  - **Operations**: INSERT

- [src/components/CtaSection.tsx](file:///c:/Users/DELL/science-club-website/src/components/CtaSection.tsx)
  - **Database Tables**: *No direct tables (Auth/Client factory)*
  - **Operations**: AUTH

- [src/components/Footer.tsx](file:///c:/Users/DELL/science-club-website/src/components/Footer.tsx)
  - **Database Tables**: `execom_members`
  - **Operations**: SELECT

- [src/components/Header.tsx](file:///c:/Users/DELL/science-club-website/src/components/Header.tsx)
  - **Database Tables**: `events`, `profiles`
  - **Operations**: SELECT, AUTH

- [src/components/RegisterButton.tsx](file:///c:/Users/DELL/science-club-website/src/components/RegisterButton.tsx)
  - **Database Tables**: `site_content`, `profiles`
  - **Operations**: SELECT, AUTH

## 2. Admin & CMS Management Section

### 2.1 Admin Panel Pages & Dashboard Routes (22 files)

- [src/app/admin/(panel)/applications/page.tsx](file:///c:/Users/DELL/science-club-website/src/app/admin/(panel)/applications/page.tsx)
  - **Database Tables**: `membership_applications`
  - **Operations**: SELECT

- [src/app/admin/(panel)/cms/page.tsx](file:///c:/Users/DELL/science-club-website/src/app/admin/(panel)/cms/page.tsx)
  - **Database Tables**: `collections`
  - **Operations**: SELECT

- [src/app/admin/(panel)/events/[id]/edit/page.tsx](file:///c:/Users/DELL/science-club-website/src/app/admin/(panel)/events/[id]/edit/page.tsx)
  - **Database Tables**: `events`, `event_categories`, `terms`, `forms`
  - **Operations**: SELECT

- [src/app/admin/(panel)/events/new/page.tsx](file:///c:/Users/DELL/science-club-website/src/app/admin/(panel)/events/new/page.tsx)
  - **Database Tables**: `event_categories`, `terms`, `forms`
  - **Operations**: SELECT

- [src/app/admin/(panel)/events/page.tsx](file:///c:/Users/DELL/science-club-website/src/app/admin/(panel)/events/page.tsx)
  - **Database Tables**: `events`, `event_categories`, `terms`, `forms`
  - **Operations**: SELECT

- [src/app/admin/(panel)/execom/page.tsx](file:///c:/Users/DELL/science-club-website/src/app/admin/(panel)/execom/page.tsx)
  - **Database Tables**: `site_content`, `teams`, `terms`, `execom_members`
  - **Operations**: SELECT

- [src/app/admin/(panel)/forms/[id]/page.tsx](file:///c:/Users/DELL/science-club-website/src/app/admin/(panel)/forms/[id]/page.tsx)
  - **Database Tables**: `forms`, `form_categories`, `form_fields`
  - **Operations**: SELECT

- [src/app/admin/(panel)/forms/[id]/submissions/page.tsx](file:///c:/Users/DELL/science-club-website/src/app/admin/(panel)/forms/[id]/submissions/page.tsx)
  - **Database Tables**: `forms`, `form_fields`, `form_submissions`
  - **Operations**: SELECT

- [src/app/admin/(panel)/forms/page.tsx](file:///c:/Users/DELL/science-club-website/src/app/admin/(panel)/forms/page.tsx)
  - **Database Tables**: `forms`, `form_categories`
  - **Operations**: SELECT

- [src/app/admin/(panel)/layout.tsx](file:///c:/Users/DELL/science-club-website/src/app/admin/(panel)/layout.tsx)
  - **Database Tables**: `site_content`, `terms`, `execom_members`
  - **Operations**: SELECT

- [src/app/admin/(panel)/media/page.tsx](file:///c:/Users/DELL/science-club-website/src/app/admin/(panel)/media/page.tsx)
  - **Database Tables**: `media_assets`
  - **Operations**: SELECT

- [src/app/admin/(panel)/members/[id]/page.tsx](file:///c:/Users/DELL/science-club-website/src/app/admin/(panel)/members/[id]/page.tsx)
  - **Database Tables**: `profiles`, `event_registrations`
  - **Operations**: SELECT

- [src/app/admin/(panel)/members/page.tsx](file:///c:/Users/DELL/science-club-website/src/app/admin/(panel)/members/page.tsx)
  - **Database Tables**: `profiles`, `event_registrations`
  - **Operations**: SELECT

- [src/app/admin/(panel)/page.tsx](file:///c:/Users/DELL/science-club-website/src/app/admin/(panel)/page.tsx)
  - **Database Tables**: `events`, `posts`
  - **Operations**: SELECT

- [src/app/admin/(panel)/pages/page.tsx](file:///c:/Users/DELL/science-club-website/src/app/admin/(panel)/pages/page.tsx)
  - **Database Tables**: `pages`
  - **Operations**: SELECT

- [src/app/admin/(panel)/posts/[id]/edit/page.tsx](file:///c:/Users/DELL/science-club-website/src/app/admin/(panel)/posts/[id]/edit/page.tsx)
  - **Database Tables**: `posts`, `post_categories`, `terms`
  - **Operations**: SELECT

- [src/app/admin/(panel)/posts/new/page.tsx](file:///c:/Users/DELL/science-club-website/src/app/admin/(panel)/posts/new/page.tsx)
  - **Database Tables**: `post_categories`, `terms`
  - **Operations**: SELECT

- [src/app/admin/(panel)/posts/page.tsx](file:///c:/Users/DELL/science-club-website/src/app/admin/(panel)/posts/page.tsx)
  - **Database Tables**: `posts`, `post_categories`, `terms`
  - **Operations**: SELECT

- [src/app/admin/(panel)/registrations/[eventId]/page.tsx](file:///c:/Users/DELL/science-club-website/src/app/admin/(panel)/registrations/[eventId]/page.tsx)
  - **Database Tables**: `events`, `event_registrations`
  - **Operations**: SELECT

- [src/app/admin/(panel)/settings/page.tsx](file:///c:/Users/DELL/science-club-website/src/app/admin/(panel)/settings/page.tsx)
  - **Database Tables**: `site_content`, `profiles`, `media_assets`, `events`, `posts`, `membership_applications`, `event_registrations`, `forms`, `pages`
  - **Operations**: SELECT

- [src/app/admin/(panel)/site/page.tsx](file:///c:/Users/DELL/science-club-website/src/app/admin/(panel)/site/page.tsx)
  - **Database Tables**: `site_content`
  - **Operations**: SELECT

- [src/app/admin/(panel)/teams/page.tsx](file:///c:/Users/DELL/science-club-website/src/app/admin/(panel)/teams/page.tsx)
  - **Database Tables**: `teams`
  - **Operations**: SELECT

### 2.2 Admin Server Actions (src/lib/admin/) (15 files)

- [src/lib/admin/actions.ts](file:///c:/Users/DELL/science-club-website/src/lib/admin/actions.ts)
  - **Database Tables**: `site_content`, `teams`, `membership_applications`, `profiles`, `event_registrations`
  - **Operations**: INSERT, UPDATE, UPSERT, DELETE

- [src/lib/admin/auth.ts](file:///c:/Users/DELL/science-club-website/src/lib/admin/auth.ts)
  - **Database Tables**: `profiles`
  - **Operations**: SELECT, AUTH

- [src/lib/admin/cmsActions.ts](file:///c:/Users/DELL/science-club-website/src/lib/admin/cmsActions.ts)
  - **Database Tables**: `collections`, `collection_fields`, `collection_items`
  - **Operations**: SELECT, INSERT, UPDATE, DELETE

- [src/lib/admin/event-actions.ts](file:///c:/Users/DELL/science-club-website/src/lib/admin/event-actions.ts)
  - **Database Tables**: `events`, `event_categories`, `site_content`
  - **Operations**: INSERT, UPDATE, UPSERT, DELETE

- [src/lib/admin/execom-actions.ts](file:///c:/Users/DELL/science-club-website/src/lib/admin/execom-actions.ts)
  - **Database Tables**: `execom_members`, `site_content`, `teams`, `terms`
  - **Operations**: SELECT, INSERT, UPDATE, DELETE

- [src/lib/admin/formActions.ts](file:///c:/Users/DELL/science-club-website/src/lib/admin/formActions.ts)
  - **Database Tables**: `forms`, `form_fields`, `form_submissions`, `form_categories`
  - **Operations**: SELECT, INSERT, UPDATE, DELETE, AUTH

- [src/lib/admin/media-actions.ts](file:///c:/Users/DELL/science-club-website/src/lib/admin/media-actions.ts)
  - **Database Tables**: `media_assets`
  - **Operations**: SELECT, INSERT, UPDATE, DELETE

- [src/lib/admin/nexusActions.ts](file:///c:/Users/DELL/science-club-website/src/lib/admin/nexusActions.ts)
  - **Database Tables**: `form_submissions`
  - **Operations**: INSERT, UPDATE, AUTH

- [src/lib/admin/pageActions.ts](file:///c:/Users/DELL/science-club-website/src/lib/admin/pageActions.ts)
  - **Database Tables**: `pages`
  - **Operations**: SELECT, INSERT, UPDATE, DELETE

- [src/lib/admin/playbook-actions.ts](file:///c:/Users/DELL/science-club-website/src/lib/admin/playbook-actions.ts)
  - **Database Tables**: `events`, `forms`, `form_fields`, `posts`, `tasks`
  - **Operations**: SELECT, INSERT

- [src/lib/admin/post-actions.ts](file:///c:/Users/DELL/science-club-website/src/lib/admin/post-actions.ts)
  - **Database Tables**: `posts`, `post_categories`
  - **Operations**: INSERT, UPDATE, UPSERT, DELETE

- [src/lib/admin/search-actions.ts](file:///c:/Users/DELL/science-club-website/src/lib/admin/search-actions.ts)
  - **Database Tables**: `events`, `posts`, `profiles`
  - **Operations**: SELECT

- [src/lib/admin/session-actions.ts](file:///c:/Users/DELL/science-club-website/src/lib/admin/session-actions.ts)
  - **Database Tables**: `site_content`
  - **Operations**: UPSERT

- [src/lib/admin/settings-actions.ts](file:///c:/Users/DELL/science-club-website/src/lib/admin/settings-actions.ts)
  - **Database Tables**: `site_content`, `profiles`
  - **Operations**: UPDATE, UPSERT

- [src/lib/admin/template-actions.ts](file:///c:/Users/DELL/science-club-website/src/lib/admin/template-actions.ts)
  - **Database Tables**: `templates`
  - **Operations**: SELECT, INSERT

### 2.3 Admin Management Client Components (2 files)

- [src/components/admin/media/MediaPickerModal.tsx](file:///c:/Users/DELL/science-club-website/src/components/admin/media/MediaPickerModal.tsx)
  - **Database Tables**: `media_assets`
  - **Operations**: SELECT, DELETE

- [src/components/admin/SignOutButton.tsx](file:///c:/Users/DELL/science-club-website/src/components/admin/SignOutButton.tsx)
  - **Database Tables**: *No direct tables (Auth/Client factory)*
  - **Operations**: AUTH

### 2.4 Visual Page & Nexus Builder Modules (0 files)

*No files in this subsection.*

## 3. Backend API & Core Infrastructure Section

### 3.1 Serverless API Routes & Handlers (5 files)

- [src/app/api/admin/events/[id]/export/route.ts](file:///c:/Users/DELL/science-club-website/src/app/api/admin/events/[id]/export/route.ts)
  - **Database Tables**: `profiles`, `events`, `event_registrations`
  - **Operations**: SELECT, UPDATE, AUTH

- [src/app/api/events/[id]/register-group/route.ts](file:///c:/Users/DELL/science-club-website/src/app/api/events/[id]/register-group/route.ts)
  - **Database Tables**: `events`, `profiles`, `event_registrations`
  - **Operations**: SELECT, UPDATE, UPSERT, AUTH

- [src/app/api/events/[id]/register/route.ts](file:///c:/Users/DELL/science-club-website/src/app/api/events/[id]/register/route.ts)
  - **Database Tables**: `events`, `profiles`, `event_registrations`
  - **Operations**: SELECT, INSERT, AUTH

- [src/app/api/members/validate/route.ts](file:///c:/Users/DELL/science-club-website/src/app/api/members/validate/route.ts)
  - **Database Tables**: `profiles`
  - **Operations**: SELECT

- [src/app/api/uploadthing/core.ts](file:///c:/Users/DELL/science-club-website/src/app/api/uploadthing/core.ts)
  - **Database Tables**: `profiles`, `media_assets`
  - **Operations**: SELECT, INSERT, AUTH

### 3.2 Supabase Client Initialization & Middleware (5 files)

- [src/lib/supabase/admin.ts](file:///c:/Users/DELL/science-club-website/src/lib/supabase/admin.ts)
  - **Database Tables**: *No direct tables (Auth/Client factory)*
  - **Operations**: CONNECT

- [src/lib/supabase/client.ts](file:///c:/Users/DELL/science-club-website/src/lib/supabase/client.ts)
  - **Database Tables**: *No direct tables (Auth/Client factory)*
  - **Operations**: CONNECT

- [src/lib/supabase/middleware.ts](file:///c:/Users/DELL/science-club-website/src/lib/supabase/middleware.ts)
  - **Database Tables**: *No direct tables (Auth/Client factory)*
  - **Operations**: AUTH

- [src/lib/supabase/public.ts](file:///c:/Users/DELL/science-club-website/src/lib/supabase/public.ts)
  - **Database Tables**: *No direct tables (Auth/Client factory)*
  - **Operations**: CONNECT

- [src/lib/supabase/server.ts](file:///c:/Users/DELL/science-club-website/src/lib/supabase/server.ts)
  - **Database Tables**: *No direct tables (Auth/Client factory)*
  - **Operations**: CONNECT

