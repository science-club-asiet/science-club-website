# Science Club Admin OS — Build Phases (prompts for Antigravity)

Hand these to the agent **one at a time**. Prepend the **SHARED CONTEXT** block to
each phase prompt (it starts cold every run). Each phase is self-contained and
ends with a working, verified feature.

---

## SHARED CONTEXT (prepend to every phase)

You are extending a working Next.js "Organization OS" admin for a college Science Club.

**Stack:** Next.js 16.2 (App Router), React 19, TypeScript, Tailwind v4 (tokens in `@theme inline` in `src/app/globals.css` — use `bg-navy`/`text-red`/`gold`, never hardcode hex), Framer Motion, `@dnd-kit`, Supabase (Postgres + Auth + **RLS**), UploadThing (image uploads), lucide-react, `cn()` in `src/lib/utils.ts`.

**Read first:** `AGENTS.md`, `cms.md` (product vision), `design.md`, and skim `src/lib/admin/` + `src/app/admin/(panel)/`.

**Conventions to reuse (do not reinvent):**
- Admin lives at `/admin` behind `requireAdmin()` (`src/lib/admin/auth.ts`); pages are Server Components using the cookie Supabase client; mutations are `"use server"` actions in `src/lib/admin/` that call `requireAdmin()` then `revalidatePath(...)`.
- CRUD is config-driven — see `src/lib/admin/resources.ts` + `src/app/admin/(panel)/[resource]/`. Drag-reorder pattern: `src/components/admin/SortableList.tsx` (uses a **key-remount**, never `setState` in an effect — the React Compiler errors otherwise). Editors: `ResourceForm.tsx`, `EditorForm.tsx`, `FormBuilder.tsx`, block builder in `src/components/admin/builder/`. Toasts: `src/components/ui/Toast.tsx` (`toast(msg, "success"|"error")`).
- **Migrations:** write SQL to `supabase/migrations/000N_*.sql`. **You cannot run DDL** (only REST keys exist) — the human runs it in the Supabase SQL editor. So: (a) add clear run instructions, and (b) make read code **defensive** — `select("*")` and read new columns as `row.x ?? default` so pages don't crash before the migration is applied.
- **RLS:** every new table needs policies. Follow `supabase/migrations/0001_init.sql`: public read of published rows via `is_published`/status, writes gated by `public.is_admin()` / `public.is_staff()`, anon inserts only for public form tables. Enable RLS on every new table.

**Hard rules:** keep `npx tsc --noEmit` and `npm run lint` at **0 errors** after every step. **Do not run `next build` while `next dev` is running.** Don't touch the public site's Lenis/GSAP scroll code. Match the admin aesthetic (Linear/Notion/Figma: crisp, subtle shadows, `rounded-lg/xl`, generous whitespace — NOT bubbly/heavy).

**Deliver:** a working, type-clean, lint-clean feature, verified by clicking through it in the running dev server.

---

## PHASE A — Applications as a Kanban Pipeline

Turn the flat `/admin/applications` list into a **drag-and-drop Kanban** (cms.md §Applications).

- **Data:** add a `stage` column to `membership_applications` (migration): `text` with values `submitted | under_review | interview | accepted | rejected`, default `submitted`. Backfill existing rows from the current `status` (pending→submitted, approved→accepted, rejected→rejected). Keep `status` in sync or derive it.
- **UI:** a board with a column per stage; cards show name, email, dept/year, submitted date, and a snippet of motivation. Drag a card between columns (`@dnd-kit`, like `SortableList`) → server action updates `stage` (+ `reviewed_by`) → `revalidatePath` → toast. Support drag-reorder within a column optionally.
- **Card detail:** clicking a card opens a side drawer/inspector with full motivation, contact, and quick actions (move stage, accept → also offer "grant membership" if the applicant has a linked profile).
- **Polish:** column counts, empty-column states, smooth card transitions, keyboard accessible.

Verify: create a couple of test applications (via the public Join form), drag them across stages, confirm persistence after refresh.

---

## PHASE B — Members CRM (profiles, participation, certificates)

Upgrade `/admin/members` from a role-toggle list into a **CRM** (cms.md §Members).

- **List:** searchable/filterable table (by role, membership, tag). Columns: name, email, dept/year, role, member badge, #events attended.
- **Member detail page** `/admin/members/[id]`: profile fields (editable: full_name, department, year_of_study), role + membership controls (owner-gated role like today), and tabs/sections for:
  - **Participation:** their `event_registrations` joined to `events` (title, date, attended, price paid, certificate id).
  - **Certificates:** list attended events with certificate ids; a "download certificate CSV for this member" action.
  - **History/Activity:** registrations over time.
- **Tags:** add `tags text[]` to `profiles` (migration); a tag editor on the detail page; filter the list by tag.
- **Exports:** "Export members CSV" (name, email, dept, year, role, is_member, tags).

Reuse the members server actions in `src/lib/admin/actions.ts` (`setRole`, `setMembership`) and add the new ones. RLS already lets admins read all profiles + registrations.

Verify: open a member who has registrations (use the temp-account flow), confirm participation + certificate data render.

---

## PHASE C — Executive Committee Workspace + Term Duplication

Make Execom a real year-based workspace (cms.md §Executive Committee), on top of the existing `execom_members` table (it already has `term`, `team_slug`, `role_type`, `display_order`).

- **Landing** `/admin/execom` (or repurpose the current execom resource): a **term switcher** (distinct terms from `execom_members` + `site_content.current_term`), and an **org-chart / grouped view** by team (Core, Technical, Media, Events) with faculty advisors shown separately (`role_type = faculty_advisor`).
- **Inline management:** add/edit/reorder members within the selected term using the block/drag patterns; each member card edits photo (UploadThing), role, bio, socials, visibility, display order.
- **End-of-year playbook — "Start new committee":** a server action that **duplicates** all `execom_members` of the current term into a new term (e.g. `2026-27`) as `is_published=false`, lets you replace/edit members, then **publish** (sets `site_content.current_term` to the new term). This is the flow: *Duplicate → Replace Members → Publish.*
- Set the current term also updates what the public site shows (it reads `current_term`).

Verify: duplicate the current term to a new one, edit a member, publish, and confirm the public `/info/execom` + home carousel reflect the change (after revalidation).

---

## PHASE D — Media Library (DAM over UploadThing)

Build the asset manager (cms.md §Media Library). Upload infra already exists (`src/app/api/uploadthing/`, `useUploadThing`).

- **Data:** new table `media_assets` (migration + RLS): `id uuid`, `url text`, `name text`, `mime text`, `size int`, `width int`, `height int`, `folder text default 'general'`, `alt text`, `tags text[]`, `created_by uuid`, `created_at`. RLS: `is_admin()` full; optional public read. On every upload via the app, also insert a `media_assets` row (extend the UploadThing `onUploadComplete` or the client complete handler).
- **UI** `/admin/media`: folder sidebar (Events, Posts, People, Sponsors, Brand, Documents, general…), a responsive asset **grid** with drag-drop upload zone, search + tag filter, and an asset **detail drawer** (preview, copy-URL, alt text editor, tags, folder move, delete, "where used" is a stretch).
- **Reuse from library:** upgrade `ImageUploader` / `InspectorImage` with a "Choose from library" tab (a modal picking an existing `media_assets` URL) alongside the current drag-drop upload.

Verify: upload a few images, tag/move them, and pick one from the library inside a content form.

---

## PHASE E — Templates + Playbooks (the differentiator)

From cms.md §Templates and §Playbooks — creation should launch **workflows**, not blank records.

- **Templates:** a `templates` table (`id, kind text('event'|'post'|'form'|'page'), name, description, payload jsonb, created_by`). "Save as template" on events/posts/forms; a template picker in the Create flow that prefills a new record from `payload` (including block trees for events/posts once the block builder covers them).
- **Playbooks** (server actions that create several linked records in one shot, each ending with a toast + links to what was made):
  - **Organize Workshop:** creates an Event (draft) + a Registration Form (from the default event template) linked via `registration_form_id` + a draft Announcement post + a checklist (store as a `tasks`/`checklists` table or block). 
  - **New Member Intake:** ensures the membership Application form exists + seeds the Applications pipeline.
  - **Publish Research:** creates a `paper`-type Post with authors + attachments (PDF via UploadThing) + citation/DOI fields (post `meta`).
- Surface playbooks in the sidebar **Create** menu and the ⌘K palette (e.g. "Organize Workshop").

Verify: run "Organize Workshop", confirm the event + form + announcement all get created and linked.

---

## PHASE F — Builder Expansion (more blocks, Posts, preview/undo)

Extend the block builder (`src/lib/blocks/registry.ts`, `src/components/blocks/`, `src/components/admin/builder/`). **Requires migration `0002_blocks.sql` to be applied.**

- **New blocks:** Speakers (list: photo/name/role), Sponsors (logo grid), Map (embed URL), Video (embed/URL), **Registration Form** (renders a chosen form inline via a form-id picker), Divider/Spacer, Custom HTML (sanitized). Add each to the registry with defaults + inspector fields, and a shared render component used by canvas + public.
- **Migrate Posts onto the builder:** add a "Design" link on the posts admin list → `/admin/builder/post/[id]` (the route is already generic via `[kind]`), and render `posts.blocks` on the public `/news/[slug]` page (fall back to the current markdown body when empty).
- **Editor upgrades:** device-preview toggle (desktop/tablet/mobile widths on the canvas), **undo/redo** (block-tree history stack), block **duplicate**, drag from the library panel directly onto the canvas, and per-section background/padding controls in the inspector.

Verify: build a post page with mixed blocks, preview at mobile width, undo a change, and view `/news/[slug]`.

---

## PHASE G — Command Palette live search + Session switcher + Settings

- **⌘K live search:** beyond static create/navigate commands, search **members, events, posts, forms** live (debounced Supabase queries) and jump to their edit pages; add "recent items."
- **Session switcher:** make the topbar term chip functional — switching term filters term-scoped views (execom, and anything term-aware) and updates a client context; "set as current" writes `site_content.current_term`.
- **Settings** `/admin/settings`: real sections — General (club name/brand from `site_content`), Users & roles, Email (confirmation on/off note + templates), Storage (UploadThing usage), and a Logs/Activity stub. Keep it consistent with the workspace shell.

Verify: ⌘K search finds a member by name and opens them; switching term changes the execom view.

---

### Suggested order
A (Kanban) → B (Members CRM) → C (Execom + duplication) → F (builder blocks + Posts) → D (Media) → E (Playbooks) → G (palette/session/settings).

Do **one phase per run**, verify green + click-through, then move on.
