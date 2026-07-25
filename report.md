# Science Club Website — Code & Performance Report

_Audit date: 2026-07-25 · Next.js 16.2.3 · React 19.2.4 · Tailwind v4 · Framer Motion 12 · GSAP 3.14 · Lenis 1.3.21_

This report covers the two reported scroll bugs (now **fixed** — see §1), plus a
prioritized list of correctness bugs, performance issues, and optimization
opportunities found while auditing the whole `src/` tree.

---

## 0. Executive summary

| Area | Status | Notes |
|------|--------|-------|
| Reported scroll bugs | ✅ **Fixed** | Root cause: Lenis ↔ GSAP ScrollTrigger fighting over the window scroll. See §1. |
| Image performance (LCP/CLS) | ✅ **Fixed** | Migrated to `next/image` (AVIF/WebP, responsive srcset, long cache). See §3.1. |
| Font loading | ✅ **Fixed** | Playfair moved to `next/font`; render-blocking `@import` removed. See §3.2. |
| Video (about hero) | ✅ **Fixed** | Poster + `preload="metadata"`, removed per-render `.play()`. See §2.3. |
| Broken internal links / routes | 🟢 Deferred | `/news/*` and `/join` are pages still to be built — intentionally left. See §2. |
| Resize robustness of pinned sections | ✅ **Fixed** | `ExecomSection` now uses `matchMedia`. See §1.3. |
| Accessibility | 🟠 Open | Missing labels, low-contrast text, non-semantic buttons. See §5. |
| Dead/stray files | 🟡 Open | Root `index.html` scratch file, boilerplate `README.md`. See §6. |

> **Performance pass (this round):** every raw `<img>` that could be optimized now
> goes through `next/image`; [next.config.ts](next.config.ts) enables AVIF/WebP and
> a 30-day optimizer cache; the about-page video and the third font were fixed.
> Verified end-to-end against `next start`: the optimizer serves a **40 KB AVIF**
> for the hero (down from a ~300 KB JPEG) with a 1-year `Cache-Control`. Details in
> §2.3, §3.1, §3.2 (marked **✅ FIXED**).

The build is green: `npm run build` compiles all 7 routes as static content with no
type errors.

---

## 1. The scroll bugs (FIXED)

Both reported symptoms trace back to **one architectural fault**: two independent
smooth-scroll systems trying to own the same `window` scroll position at the same
time — **Lenis** (the site-wide smooth scroller in
[`SmoothScroll.tsx`](src/components/SmoothScroll.tsx)) and **GSAP ScrollTrigger**
(pinning/scrubbing in [`ExecomSection.tsx`](src/components/ExecomSection.tsx) and
[`info/about/page.tsx`](src/app/info/about/page.tsx)).

### 1.1 "It scrolls back/forward on its own when I'm not even scrolling"

**Root cause:** `ExecomSection` created a ScrollTrigger with a `snap` config
([old ExecomSection.tsx:217](src/components/ExecomSection.tsx)). ScrollTrigger's
`snap` works by animating the **native** scroll position to snap to the nearest
panel once the wheel stops. But Lenis *also* owns that scroll position and is
running its own requestAnimationFrame loop. When you stop scrolling near the
pinned Execom carousel, ScrollTrigger yanks the scroll toward a snap point, Lenis
reads the jump and eases back, ScrollTrigger snaps again → the page oscillates
back and forth with no user input. This is the single most common documented
Lenis + ScrollTrigger incompatibility.

**Fix applied:** Removed the `snap` block entirely and left Lenis as the sole
owner of the scroll. The horizontal track still scrubs smoothly; it just no
longer fights for the scroll position.

### 1.2 "Some pages stop scrolling after a bit once I switch pages"

**Root cause:** three compounding issues in the route-change handler of
[`SmoothScroll.tsx`](src/components/SmoothScroll.tsx):

1. **Stale Lenis `limit`.** Lenis caches the maximum scrollable distance
   (`limit`). Pinned sections use `pin: true` + `pinSpacing: true`, which inject a
   pin-spacer that changes the document height *after* Lenis measured it. The old
   code never called `lenis.resize()`, so after navigating to a page whose height
   changed, Lenis kept an out-of-date ceiling and refused to scroll past it —
   the page "stopped scrolling" partway down.
2. **Refresh race.** `SmoothScroll` fired `ScrollTrigger.refresh()` on a fixed
   `setTimeout(…, 100)`, while each incoming page created its pins on *its own*
   `setTimeout(…, 100)` ([ExecomSection](src/components/ExecomSection.tsx),
   [about page](src/app/info/about/page.tsx)). The two 100 ms timers raced, so
   pin-spacer heights were sometimes measured against the wrong layout.
3. **Native/Lenis fight on reset.** It called `window.scrollTo(0, 0)` *and*
   `lenis.scrollTo(0, …)`, momentarily desyncing Lenis' internal position from
   the real DOM scroll right as pins were being built.

**Fix applied** ([`SmoothScroll.tsx`](src/components/SmoothScroll.tsx)):
- Reset scroll through Lenis only (`lenis.scrollTo(0, { immediate: true, force: true })`) — no more native `window.scrollTo`.
- On every route change, call `lenis.resize()` **and** `ScrollTrigger.refresh()`
  twice: once on the next animation frame (after paint) and once after 350 ms
  (after the pages' deferred pin timers have fired). This keeps Lenis' `limit`
  and every pin-spacer height in sync with the new page.

### 1.3 Secondary contributor: modal scroll-lock did nothing

[`EventModal.tsx`](src/components/EventModal.tsx) locked the background with
`document.body.style.overflow = "hidden"`. Because Lenis drives scrolling via its
own wheel handling, that CSS has no effect — **the page scrolled behind the open
modal**. Worse, if a modal was open across a route change, its cleanup ran
`overflow = "unset"`, which could clobber unrelated overflow state.

**Fix applied:** the modal now calls `window.__lenis?.stop()` on open and
`?.start()` on cleanup. Lenis adds a `.lenis-stopped` class that the existing CSS
([globals.css:48](src/app/globals.css#L48)) already turns into a real
`overflow: hidden`, so the lock actually works, and it always releases on unmount.

### 1.4 Resize robustness (fixed as part of the above)

The old `ExecomSection` guarded its animation with a one-time
`if (window.innerWidth < 1024) return`. It never re-ran on resize, so resizing
across the 1024 px breakpoint left either a broken pin or a stuck scroll height.
It now uses `gsap.matchMedia("(min-width: 1024px)")` (the same pattern the about
page already uses), which sets up and reverts the pin automatically as the
viewport crosses the breakpoint.

### 1.5 Files changed

- [`src/components/SmoothScroll.tsx`](src/components/SmoothScroll.tsx) — route-change reset + resize/refresh sequencing.
- [`src/components/ExecomSection.tsx`](src/components/ExecomSection.tsx) — removed ScrollTrigger `snap`; switched to `matchMedia`.
- [`src/components/EventModal.tsx`](src/components/EventModal.tsx) — Lenis-aware scroll lock.

---

## 2. Correctness bugs (open)

### 2.1 🔴 Broken routes — links that 404

There is **no `/news` route** in `src/app`, yet several links point into it:

| Link | Location | Result |
|------|----------|--------|
| `/news`, `/news/${id}` | [NewsSection.tsx](src/components/NewsSection.tsx) ("Read Full Story", "View All News") | 404 |
| `/news/latest`, `/news/research`, `/news/alumni` | [Header.tsx](src/components/Header.tsx) NEWS mega-menu | 404 |
| `/join` | [about page CTA](src/app/info/about/page.tsx) ("Join the Movement") | 404 — the real route is `/info/join` |

**Fix:** either create the `/news` route group + a `[slug]` page, or repoint the
links. Change the about page's `/join` → `/info/join`.

### 2.2 🟠 Dead anchor links

- The top-level **NEWS** nav item links to `#news`, but no element has
  `id="news"` (the [NewsSection](src/components/NewsSection.tsx) `<section>` has no
  id). Clicking it does nothing.
- The header's **Join Us** button and mobile "Join the club" link to `#join`.
  `id="join"` lives on [CtaSection.tsx:21](src/components/CtaSection.tsx#L21),
  which only renders on `/` and `/events`. On the info pages the anchor is dead.

**Fix:** add `id="news"` to the NewsSection wrapper; make the "Join" CTA a real
`Link` to `/info/join` instead of a fragment anchor (or ensure the target exists
on every page it appears on).

### 2.3 ✅ FIXED — `<video>` `.play()` called on every render + eager preload

[about page hero video](src/app/info/about/page.tsx) used a ref callback
`ref={(el) => { if (el) el.play()… }}` that ran on every render, plus
`preload="auto"` which eagerly downloaded the whole clip.

**Fix applied:** removed the ref callback (native `autoPlay muted playsInline`
starts it), switched to `preload="metadata"`, and added a `poster` still so the
hero paints instantly instead of staying black while the video buffers.

### 2.4 🟡 Duplicated layout shell

`/` ([page.tsx](src/app/page.tsx)) and `/events` ([events/page.tsx](src/app/events/page.tsx))
hand-roll `<Header/> … <Footer/>` with the sticky-footer-reveal wrapper, while the
info pages get theirs from [info/layout.tsx](src/app/info/layout.tsx). This is
three copies of the same shell that can drift apart. Consider a shared layout or
a `<SiteShell>` component.

---

## 3. Performance issues (open)

### 3.1 ✅ FIXED — Images: raw `<img>` → `next/image`

Previously every content image was a raw `<img src="https://images.unsplash.com/…">`
with no responsive `srcset`, no AVIF, and no intrinsic dimensions (CLS).

**Fix applied:**
- Migrated all optimizable images to `next/image` with `fill` + `sizes` (they all
  live in positioned, aspect-ratio containers): [Hero](src/components/Hero.tsx)
  (also `priority`, since it's the LCP), [EventCenter](src/components/EventCenter.tsx),
  [NewsSection](src/components/NewsSection.tsx), [AboutSection](src/components/AboutSection.tsx),
  [ExecomSection](src/components/ExecomSection.tsx) avatars, and the
  [about](src/app/info/about/page.tsx) / [execom](src/app/info/execom/page.tsx) /
  [join](src/app/info/join/page.tsx) pages.
- [next.config.ts](next.config.ts): `formats: ["image/avif","image/webp"]`,
  `minimumCacheTTL: 30 days`, and `remotePatterns` for `images.unsplash.com` +
  `i.pravatar.cc`.
- **Verified in production** (`next start`): the hero now serves a 40 KB AVIF
  (was a ~300 KB JPEG), `Vary: Accept`, `Cache-Control: max-age=31536000`.

**Intentionally left as `<img>`:**
- The event **card → modal** images ([EventGridCard](src/components/EventGridCard.tsx),
  [EventModal](src/components/EventModal.tsx)) — they use a Framer Motion
  `layoutId` shared-element morph that `next/image` would break. They already load
  a CDN-sized Unsplash URL (`w=800&q=80`).
- The **brand-logo SVGs** on the about page (`cdn.simpleicons.org`) — SVGs
  shouldn't go through the raster optimizer; they're ~1 KB each. (These are the
  only remaining `no-img-element` lint warnings, and they're expected.)

### 3.2 ✅ FIXED — Third font imported from inside a component

[about page](src/app/info/about/page.tsx) injected
`<style>@import url('…Playfair Display…')</style>` via `dangerouslySetInnerHTML`
on every render — a render-blocking CSS `@import` that bypassed `next/font`.

**Fix applied:** Playfair now loads via `next/font/google` in
[layout.tsx](src/app/layout.tsx) (self-hosted, preloaded, swap, `--font-playfair`
variable); the `.font-playfair` / `.stroke-white` helpers moved to
[globals.css](src/app/globals.css); the inline `<style>`/`@import` was deleted.
Also added `preconnect` hints for the video + logo CDNs used on that page.

### 3.3 🟡 `will-change` left on permanently

[globals.css](src/app/globals.css) sets `will-change` on several *infinite*
animations (`.text-shine`, `.astrolabe-spin`, `.cosmic-orbit-*`, `.stellar-node*`).
`will-change` permanently promotes those elements to their own GPU layers, costing
memory even when off-screen. Use it sparingly or toggle it around interactions
rather than on always-running keyframes.

### 3.4 🟡 Heavy client bundles / everything is `"use client"`

Every section is a client component (Framer Motion / GSAP). The pages are static
shells that could keep more markup on the server and hydrate only the interactive
bits. Not urgent for a marketing site, but the about and execom pages are large
(686 and 1294 lines) and ship a lot of JS.

### 3.5 🟡 Animation timers run regardless of tab visibility

The auto-advancing carousel ([EventCenter](src/components/EventCenter.tsx)) and
news accordion ([NewsSection](src/components/NewsSection.tsx)) run `setInterval`
timers that keep firing when the tab is backgrounded. EventCenter already gates on
`useInView`; consider also pausing on `document.visibilitychange`.

---

## 4. Optimization opportunities

- **Consolidate `gsap.registerPlugin(ScrollTrigger)`** — registered in 3 files
  ([SmoothScroll](src/components/SmoothScroll.tsx),
  [ExecomSection](src/components/ExecomSection.tsx),
  [about page](src/app/info/about/page.tsx)). Harmless (idempotent) but could live
  in one shared module.
- **Extract event data & carousel logic** — [EventCenter](src/components/EventCenter.tsx)
  reimplements an infinite carousel with clone bookkeeping (~200 lines) that
  overlaps with the execom page's carousels. A shared `<Carousel>` would cut
  duplication and the class of off-by-one clone bugs.
- **`key={i}` on mapped lists** — EventCenter's `displayEvents` and the indicator
  dots key by array index; fine for static data but fragile if the list ever
  becomes dynamic. Prefer stable ids (events already have `event.id`).
- **`metadata` per page** — only `/` and `/events` set titles; info pages inherit
  the root title. Add `metadata` exports for SEO.

---

## 5. Accessibility

- **Unlabeled icon buttons** — the search pill and user button in
  [Header.tsx](src/components/Header.tsx) have no `aria-label`; the hamburger and
  logo are fine.
- **Low-contrast text** — `text-white/40`, `text-white/50` on navy/red fails WCAG
  AA for body text in several places (footer, about accents).
- **Focus states** — many interactive elements use `focus:outline-none` with no
  replacement focus ring (carousel dots, nav). Keyboard users get no visible
  focus.
- **`prefers-reduced-motion`** — none of the GSAP/Framer/Lenis motion is gated on
  reduced-motion. This is both an a11y and a comfort issue given how much of the
  site is scroll-driven. Lenis can be disabled and ScrollTriggers skipped when
  `matchMedia('(prefers-reduced-motion: reduce)')` matches.
- **Modal semantics** — [EventModal](src/components/EventModal.tsx) has no
  `role="dialog"`, `aria-modal`, focus trap, or Escape-to-close.

---

## 6. Housekeeping / stray files

- **`index.html`** at the repo root is an unrelated "EXECOM Typography" scratch
  page (loads the Anton font from a CDN). It is not part of the Next app and
  should be deleted or moved out of the repo.
- **`README.md`** is the untouched `create-next-app` boilerplate — it even claims
  the project uses the Geist font (it uses Oswald + Inter). Replace with real
  setup/run instructions.
- **`next.config.ts`** is empty; it will need `images.remotePatterns` once §3.1 is
  addressed.
- **Unused import** — `Calendar` is imported but unused in
  [EventModal.tsx](src/components/EventModal.tsx) (ESLint warning).

---

## 7. Prioritized action list

1. ✅ **Done** — Fix the two scroll bugs (§1).
2. ✅ **Done** — Migrate images to `next/image` + AVIF/WebP + caching config (§3.1).
3. ✅ **Done** — Optimize the about-page hero video (§2.3).
4. ✅ **Done** — Move Playfair to `next/font`; add CDN preconnects (§3.2).
5. 🟢 **Deferred (by request)** — `/news/*` and `/join` routes (§2.1) are pages still to be built.
6. 🟠 **Accessibility pass** — labels, focus rings, `prefers-reduced-motion`, modal semantics (§5). _Still open._
7. 🟡 **De-duplicate the page shell & carousels; remove stray files** (§2.4, §4, §6). _Still open._

_All findings reference `file_path` and line numbers as of the audit date. Scroll
fixes are in §1.5; the performance pass (§2.3, §3.1, §3.2) was verified with
`npm run build`, `npx tsc --noEmit`, `npm run lint`, and a live `next start`
image-optimizer check._
