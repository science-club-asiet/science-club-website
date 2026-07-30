# Visual Polish Pass — Science Club (Admin OS + Public Site)

> Prompt for an agentic coding assistant (e.g. Antigravity). Paste this in whole.
> Ask it to **audit + present a plan first**, then edit **admin first**.

You are doing a **visual-polish pass** on an existing, fully-working Next.js app for a college **Science Club** — a public marketing site **plus** a custom admin CMS ("Organization OS"). The logic works; your job is to make **every surface look and feel world-class**. You may add missing logic where it serves polish (skeletons, toasts, transitions, empty/loading/error states), but **you must not break existing functionality**.

## The bar

Reference quality: **Linear, Notion, Framer, Figma, Arc, Vercel dashboard, Stripe**. The admin especially must feel like a premium product, not a Bootstrap/WordPress/generic-SaaS dashboard. Every screen should look intentionally designed: rhythm, hierarchy, restraint, and delightful micro-motion.

## Stack & where things live (read these first)

- **Next.js 16.2 (App Router, Turbopack), React 19.2, TypeScript, Tailwind CSS v4 (config-less — design tokens live in `@theme inline` inside `src/app/globals.css`), Framer Motion 12, GSAP 3.14 + ScrollTrigger, Lenis 1.3 (smooth scroll), lucide-react, `cn()` in `src/lib/utils.ts`.**
- **Read `AGENTS.md`, `design.md`, `report.md`, and `cms.md` before writing any code.** `cms.md` is the north-star vision for the admin (workspaces not tables, blocks not forms, command palette, live preview). `AGENTS.md` documents the fragile scroll architecture.
- Public pages: `src/app/page.tsx` (home), `src/app/events/`, `src/app/info/{about,mission,execom,join}`, `src/app/gallery/`, `src/app/news/`, `src/app/forms/`. Sections in `src/components/`.
- Admin: `src/app/admin/(panel)/` (workspace shell), `src/components/admin/` (AdminShell, AdminSidebar, AdminTopbar, CommandPalette, ResourceForm, SortableList, EditorForm, FormBuilder, block builder in `builder/`). Block system in `src/components/blocks/` + `src/lib/blocks/`.

## Design system you MUST honor (do not reinvent)

- **Colors are tokens** — use `bg-navy`, `text-red`, `gold`, etc. from `globals.css`. **Never hardcode brand hexes.** If you need new shades/greys, add them as tokens in `@theme inline` and reuse them everywhere.
- **Type:** headings are `font-oswald` + `uppercase` (globally enforced on h1–h6); body is `font-inter`; Playfair is the About-page accent. Keep this. Establish a consistent type scale and use it.
- **House easings:** `[0.22, 1, 0.36, 1]` (smooth) and `[0.76, 0, 0.24, 1]` (dramatic). Reveals use Framer Motion `whileInView` + `viewport={{ once: true }}` + staggered delays. Match these patterns.
- **Admin aesthetic:** white / navy / Science-Club-red / soft-grey. **Avoid glassmorphism, neon, random gradients, generic SaaS blues.** Clean borders, soft shadows, generous whitespace, rounded corners, crisp hover/active/focus states.

## HARD CONSTRAINTS — breaking these breaks the app

1. **Do not touch the scroll architecture.** Lenis owns the window scroll. Never use `window.scrollTo` / native `scrollTo` — use `window.__lenis?.scrollTo(...)`. GSAP ScrollTrigger may only **read** scroll (scrub/pin), never drive it — **never add ScrollTrigger `snap`**. Modals/menus lock scroll via `window.__lenis?.stop()` / `?.start()`, **never** `body { overflow:hidden }`. After anything that changes page height, the existing `SmoothScroll` handles `lenis.resize()` + `ScrollTrigger.refresh()` — don't add a second RAF loop or duplicate this. (Note: Lenis/Loader are already gated off `/admin` via `SiteChrome`, so this constraint mainly protects the public site.)
2. **Don't regress functionality.** Forms still submit, auth/registration still works, the admin CRUD/builder/command-palette still work, RLS-bound data still loads. Preserve all props, server actions, and data flow. Refactor for looks, not behavior.
3. **Keep it type-safe and green.** Run `npx tsc --noEmit` and `npm run lint` after each module; both must stay clean (0 errors). **Do NOT run `next build` while `next dev` is running** (it corrupts `.next/dev` — see AGENTS.md); verify visually against the running dev server instead.
4. **Accessibility is part of "polished":** add visible focus rings (many elements use `focus:outline-none` with no replacement — fix that), `aria-label`s on icon-only buttons, and **gate motion on `prefers-reduced-motion`** (currently none of the GSAP/Framer/Lenis motion respects it — add a reduced-motion path).
5. **Responsive & consistent:** every screen must be flawless from 360px to ultrawide. No horizontal body scroll. Consistent spacing scale, corner radii, shadow elevations, and border colors across the whole app.

## Scope & priority order

**Priority 1 — the Admin OS** (this is where the biggest visual jump is needed; make it feel like Linear/Figma):

- **AdminShell / Sidebar / Topbar:** refine spacing, active states, iconography, the Create button, the session chip; add subtle hover/press motion; polished user menu.
- **Command Palette (⌘K):** make it beautiful and fast — group headers, keyboard-nav highlight, icons, subtle open/close spring, recent items, empty state.
- **Home ("needs attention"):** elevate the cards, counts, quick-create; add tasteful entrance stagger.
- **CRUD lists & forms (ResourceForm, SortableList, EditorForm):** premium form styling, better inputs/labels/help text, drag affordances, row hover, badges, empty states, inline validation styling, "Saved ✓" feedback, and **toast notifications** for save/delete.
- **Form Builder & Block Builder (the 3-pane editor):** this must feel like Figma — refined block library, selection frames, drag handles, inspector controls, autosave indicator, hover toolbars, smooth reordering, device-preview affordance. Make the InspectorImage dropzone and list editors gorgeous.
- Applications, Members, Website hub, Media/Settings placeholders, Login page: all consistent and polished.

**Priority 2 — the public site (COSMETIC ONLY — high risk, tread carefully):** The public site's motion/scroll system (Lenis smooth-scroll + GSAP ScrollTrigger pins + Framer `whileInView` reveals + the EventModal/gallery lightbox) is **fragile and already works — do not modify it or the animations.** Restrict changes here to **static visual refinement only**: spacing, typography scale, color/token usage, borders, shadows, radii, `next/image` `sizes`/aspect-ratio handling, empty/loading states, and responsive fixes. **Do NOT** add or change any route/page transitions; do NOT touch, "refine," or add any scroll-linked or reveal animation; do NOT edit any `useScroll` / `useInView` / `whileInView` / ScrollTrigger / pin / `SmoothScroll` / `window.__lenis` code; do NOT alter the EventModal or gallery lightbox open/close/scroll-lock logic. If a visual improvement would require touching animation or scroll code, **skip it and add it to a written "suggestions" list instead of implementing it.**

## Concrete polish checklist (apply everywhere)

- **Micro-interactions:** hover, active/press, focus, disabled, loading states on every interactive element — with spring/easing from the house set.
- **Loading & empty states:** skeleton loaders for data areas; thoughtfully designed empty states (not bare "No items").
- **Feedback:** a lightweight **toast/notification** system for admin mutations (save/create/delete/errors). Build it if it doesn't exist.
- **Transitions:** smooth route/page transitions (respect reduced-motion); modal/dialog enter/exit; list add/remove animations.
- **Consistency audit:** unify button variants, input styles, card styles, badges, spacing, radii, shadows, and icon sizes into a small reusable set (`src/components/ui/` if helpful) and apply it across admin + public.
- **Detail:** optical alignment, consistent line-heights, truncation with ellipsis, tabular numbers for stats/counts, hover tooltips where useful, nicer scrollbars.

## Process

1. **Audit first:** explore the repo, read the four docs, inspect the running app (admin + public), and write a short prioritized polish plan **and show it before editing**.
2. Work **module by module**, admin first; after each, run `tsc --noEmit` + `npm run lint` (keep them green) and verify visually in the browser (scroll + navigate — the two historical bug classes are scroll-fighting and pinned sections breaking on navigation).
3. Reuse tokens/components; don't duplicate styles. Extract shared UI primitives.
4. Keep diffs behavior-preserving. If a change risks logic, isolate it and note it.

## Do NOT

- Do not hardcode colors, change the fonts, or alter the design tokens' meaning.
- Do not introduce glassmorphism/neon/random gradients or a different visual language.
- Do not add heavy new dependencies without need (Framer Motion + Tailwind + lucide already cover most of it).
- Do not touch Supabase schema, RLS, auth, or server actions except for cosmetic wiring (e.g., toasts).
- Do not break the Lenis/GSAP rules in constraint #1.

**Deliver:** a cohesive, premium visual system applied across the entire admin and public site — polished typography, spacing, color, motion, and micro-interactions — with the app still fully functional, type-clean, and lint-clean.
