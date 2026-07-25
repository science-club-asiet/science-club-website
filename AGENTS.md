<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

> Next 16 change already relevant here: Next **no longer overrides**
> `scroll-behavior` during navigation by default
> (`node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`).
> Do **not** add `data-scroll-behavior="smooth"` to `<html>` — it would make the
> router force native smooth scroll and fight Lenis.

---

# Contributor & agent guide

A single-page-style marketing site for a college Science Club, heavy on
scroll-driven motion. Read this before touching anything, then see
[design.md](design.md) for the visual language and [report.md](report.md) for the
known-issues backlog.

## Stack

- **Next.js 16.2.3** (App Router, Turbopack, all routes static) · **React 19.2.4** · **TypeScript**
- **Tailwind CSS v4** (config-less; tokens live in `@theme inline` inside [globals.css](src/app/globals.css))
- **Lenis 1.3** — site-wide smooth scroll
- **GSAP 3.14 + ScrollTrigger** — scrubbed / pinned scroll timelines
- **Framer Motion 12** — discrete UI animation
- `lucide-react` icons; `clsx` + `tailwind-merge` via the `cn()` helper ([lib/utils.ts](src/lib/utils.ts))

## Commands

```bash
npm run dev       # dev server (Turbopack) at http://localhost:3000
npm run build     # production build — RUN THIS before finishing scroll/layout work
npm run lint      # eslint (next config)
npx tsc --noEmit  # typecheck only
```

There is no test suite. Verify changes by building and by manually scrolling +
navigating between pages (the two historical bug classes — see below).

> **⚠️ Do not run `next build` (or `next start`) while `next dev` is running.**
> In Next 16 the build regenerates `.next` as production-only output and wipes the
> dev server's `.next/dev` cache out from under it. The dev server then 500s on
> every route with `MODULE_NOT_FOUND: ../chunks/ssr/[turbopack]_runtime.js`,
> missing `routes-manifest.json`, and `Persisting failed: Another write batch …`.
> If it happens: stop the dev server, `rm -rf .next`, then `npm run dev` again.
> To verify a production build, stop the dev server first.

## Project structure

```
src/
  app/
    layout.tsx          # root: fonts, <Loader/>, <SmoothScroll/> wrapper
    page.tsx            # home (hand-rolls Header + sticky-footer shell)
    globals.css         # design tokens + CSS keyframe animations
    events/page.tsx     # events (own shell)
    info/
      layout.tsx        # Header + Footer shell for all /info pages
      about|mission|join|execom/page.tsx
  components/           # all sections; every one is "use client"
  lib/
    events.ts           # event data + ScienceEvent type
    utils.ts            # cn()
```

The shell is duplicated (home + events hand-roll it; info uses a layout) — see
[report.md](report.md) §2.4 before adding another page.

## ⚠️ The scroll architecture — read before touching motion

Three scroll/motion systems coexist, and most bugs in this repo come from them
fighting over the window scroll. The rules:

1. **Lenis owns the scroll position. Nothing else may write it.**
   - Scroll programmatically with `window.__lenis?.scrollTo(...)`, never
     `window.scrollTo()` or a native `scrollTo` on the page scroller.
   - The Lenis instance is created once in
     [SmoothScroll.tsx](src/components/SmoothScroll.tsx) and exposed as the typed
     global `window.__lenis`.

2. **GSAP ScrollTrigger may only *read* scroll (scrub / pin) — never *drive* it.**
   - **Do not use ScrollTrigger `snap`.** It animates native scroll and oscillates
     against Lenis ("page scrolls back/forth on its own"). It was removed from
     [ExecomSection](src/components/ExecomSection.tsx); don't reintroduce it.
   - Sync is already wired in `SmoothScroll`
     (`lenis.on("scroll", ScrollTrigger.update)` + driving `lenis.raf` from
     `gsap.ticker`). Don't add a second RAF loop.

3. **Pinned sections change document height → Lenis' `limit` must be refreshed.**
   - After anything that changes page height (route change, pin creation), call
     **both** `lenis.resize()` and `ScrollTrigger.refresh()`. `SmoothScroll`'s
     route-change effect already does this (a rAF pass + a 350 ms late pass). If a
     new pinned section is created later than that, refresh again yourself.
   - Symptom of getting this wrong: a page "stops scrolling" partway down after you
     navigate to it.

4. **Locking scroll (modals / menus) = pause Lenis, not `body { overflow:hidden }`.**
   - `document.body.style.overflow = "hidden"` does nothing to Lenis.
   - Use `window.__lenis?.stop()` on open and `?.start()` on cleanup (see
     [EventModal.tsx](src/components/EventModal.tsx)); `.lenis-stopped` CSS turns
     that into a real lock. **Always** release on unmount.

5. **Clean up GSAP per-component with `gsap.context()` / `matchMedia().revert()`.**
   - Never `ScrollTrigger.getAll().kill()` — it nukes other components' triggers.
   - Desktop-only pins go behind `gsap.matchMedia("(min-width: 1024px)")` so they
     set up and revert correctly on resize (ExecomSection & the about page).

## Styling & component conventions

- **Merge classes with `cn(...)`** — it dedupes conflicting Tailwind classes. Use
  it for any conditional className.
- **Colors are tokens:** `bg-navy`, `text-red`, `gold`, etc., defined in
  [globals.css](src/app/globals.css). Don't hardcode brand hexes (a few off-whites
  like `#FAF9F8` are used inline — match existing usage).
- **Headings** are `font-oswald` + `uppercase` (enforced globally for `h1–h6`);
  body copy is `font-inter`. See [design.md](design.md) §2.
- **Every `src/components` file is a client component.** Keep new interactive
  sections `"use client"`; keep pure data/layout on the server where you can.
- **House easings:** `[0.22, 1, 0.36, 1]` (smooth) and `[0.76, 0, 0.24, 1]`
  (dramatic). Reveals use `whileInView` + `viewport={{ once: true }}` + staggered
  delays. Match the patterns in [design.md](design.md) §4.
- **Images:** the repo currently uses raw `<img>` to Unsplash (ESLint warns). New
  work should prefer `next/image` with explicit dimensions and register the host in
  `next.config.ts` `images.remotePatterns` — this also fixes layout-shift-induced
  scroll jumpiness (report §3.1).

## Do / Don't

**Do**
- Run `npm run build` after any scroll, layout, or pin change.
- Test by navigating home ↔ /info/about ↔ /events repeatedly and scrolling each —
  the pinned execom (home) and pinned hero/story (about) are the fragile spots.
- Keep red scarce (one accent element per view).

**Don't**
- Run `next build` / `next start` while `next dev` is live (corrupts `.next/dev` — see the Commands note above).
- Add ScrollTrigger `snap`, a second RAF loop, or a native `scrollTo` on the page.
- Lock scroll with body `overflow`.
- `kill()` all ScrollTriggers globally.
- Point links at `/news/*` or `/join` — those routes don't exist yet (report §2.1).

## Known issues

The current backlog (broken `/news` + `/join` routes, dead `#news` anchor, image
performance, third-font `@import`, a11y gaps, stray root `index.html`) is tracked
in [report.md](report.md). Check it before starting so you don't re-report or
collide with a known fix.
