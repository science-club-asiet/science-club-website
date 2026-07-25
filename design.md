# Science Club Website — Design System

_A reverse-engineered reference of the visual language, motion system, and layout
patterns used across the site. Use this to keep new work visually consistent._

The aesthetic is **editorial / brutalist-sport**: huge condensed uppercase
headlines, a tight three-colour palette, rounded-3xl "card" panels floating over
each other with heavy soft shadows, and cinematic scroll-driven motion. Think a
university club styled like a premium sports or fashion brand.

---

## 1. Brand palette

Defined as CSS variables in [globals.css](src/app/globals.css) and exposed to
Tailwind v4 via `@theme inline`.

| Token | Hex | Tailwind class | Role |
|-------|-----|----------------|------|
| Navy | `#001C58` | `navy` (`bg-navy`, `text-navy`) | Primary brand / dark surfaces, ink |
| Red | `#DA291C` | `red` (`bg-red`, `text-red`) | Accent, CTAs, "live"/breaking, active state |
| Gold | `#C8A059` | `gold` | Rare tertiary accent (stellar nodes) |
| Background | `#FFFFFF` | `background` | Base page surface |
| Off-white | `#FAF9F8` / `#FCFCFD` | inline hex | Section alternation (execom, about story) |
| Foreground | `#111111` | `foreground` | Default body ink |

**Usage rules observed:**
- Navy and white are the structural pair; **red is used sparingly** as the single
  attention colour (one CTA, one active dot, one "breaking" ping at a time).
- Dark sections are pure `navy`; light sections alternate white / `#FAF9F8` to
  create rhythm without borders.
- Selection is themed everywhere: `selection:bg-red selection:text-white`.
- `brand-gradient` (navy → transparent, bottom-up) overlays hero imagery.

---

## 2. Typography

Two primary fonts loaded via `next/font/google` in [layout.tsx](src/app/layout.tsx),
plus one accent font that should be migrated (see report §3.2).

| Font | Variable | Used for |
|------|----------|----------|
| **Oswald** | `--font-oswald` | All headings, labels, buttons, numbers. Condensed, **always `UPPERCASE`**. |
| **Inter** | `--font-inter` (`font-sans`) | Body copy, descriptions, form fields. |
| Playfair Display | (ad-hoc `@import`) | Italic emphasis words in the about-page manifesto only. |

**Global rule** ([globals.css:53](src/app/globals.css#L53)): every `h1–h6` and
`.font-heading` is forced to `font-oswald` + `text-transform: uppercase`. Headings
never carry sentence case.

**Type characteristics:**
- Display headlines are enormous and tightly tracked: `text-6xl … text-[12rem]`,
  `tracking-tight` / `tracking-tighter`, `leading-[0.85]`–`leading-none`.
- Eyebrow labels: small Oswald, `uppercase`, `tracking-[0.2em]`–`tracking-[0.3em]`,
  often bracketed by a short red rule (`<span class="w-6 h-[2px] bg-red" />`).
- Outline/stroke text is a recurring motif: `WebkitTextStroke` for ghosted giant
  words (about page eras, "Ready To Build?", "Operational Directives").
- Body copy is muted: `text-gray-500/600` on light, `text-white/60–80` on dark.

---

## 3. Layout & surface language

### 3.1 The floating card system
The signature move: content sits on **white panels with `rounded-3xl` /
`rounded-b-3xl` corners and large soft shadows**, layered over darker content
behind them via z-index.

- Home `<main>` is `rounded-b-3xl` with `shadow-[0_15px_40px_rgba(0,0,0,0.12)]`
  and `z-10`, sitting above the footer ([page.tsx:19](src/app/page.tsx#L19)).
- [EventCenter](src/components/EventCenter.tsx) is a `max-w-[95%]` rounded card
  pulled up over the hero with a negative margin (`-mt-16 sm:-mt-24`) and its own
  shadow — it visually overlaps the section above it.
- Shadows are always soft, low-opacity, large-radius (`rgba(0,0,0,0.06–0.12)`),
  never hard.

### 3.2 Sticky footer reveal
On desktop the footer is revealed as the content scrolls up past it:
```
<div className="md:sticky md:bottom-0 md:z-0 z-10 relative"><Footer/></div>
```
The `<main>` above it (`z-10`, rounded bottom) slides over a pinned `z-0` footer.
On mobile it falls back to normal flow. Replicated on `/` and `/events`.

### 3.3 Section rhythm & full-bleed breakers
Standard section padding is generous: `py-24`–`py-48`. Dark navy sections act as
full-bleed "breakers" between light content, frequently decorated with:
- faint grid backgrounds (`linear-gradient` 1px lines at `4rem`/`40px` spacing),
- radial dot fields (`radial-gradient(#001C58 1px, transparent 1px)`),
- large blurred colour blobs (`blur-[100px]` red/white circles),
- giant ghosted background numerals/words (`text-gray-100/40`, `mix-blend-multiply`).

### 3.4 Containers
`container mx-auto px-4 lg:px-8` is the default gutter. Carousels and marquees
deliberately break out of the container to run edge-to-edge.

---

## 4. Motion system

Three motion engines are used deliberately, each for a different job. **This
layering is the most bug-prone part of the codebase — see [report.md](report.md)
§1 and the scroll rules in [AGENTS.md](AGENTS.md).**

| Engine | Job | Where |
|--------|-----|-------|
| **Lenis** | Site-wide smooth scrolling (the scroll itself) | [SmoothScroll.tsx](src/components/SmoothScroll.tsx) |
| **GSAP + ScrollTrigger** | Scroll-*scrubbed* timelines & pinning (horizontal tracks, parallax, counters, velocity marquees) | [ExecomSection](src/components/ExecomSection.tsx), [about page](src/app/info/about/page.tsx) |
| **Framer Motion** | Discrete UI animation (enter/exit, hover/tap, layout, `useInView` reveals) | almost every component |

### 4.1 Signature easings
- `cubic-bezier(0.22, 1, 0.36, 1)` — the house "smooth ease-out", used everywhere
  (`ease-[0.22,1,0.36,1]`, Framer `ease: [0.22, 1, 0.36, 1]`).
- `cubic-bezier(0.76, 0, 0.24, 1)` — the "expo in-out" used for the loader and
  hero headline reveal.
- GSAP scrubbed sections use `scrub: 1`–`2` for long, buttery parallax.

### 4.2 Recurring Framer patterns
- **Reveal on view:** `initial={{opacity:0, y:40}} whileInView / animate={inView …}`
  with `viewport={{ once: true }}` and staggered `delay: i * 0.05–0.15`.
- **Masked text rise:** headline words wrapped in `overflow-hidden` spans, inner
  span animates `y: "100%" → 0` (hero, execom).
- **Hover micro-interactions:** `whileHover={{ scale, y: -2 }}`,
  `whileTap={{ scale: 0.97 }}`, shimmer sweeps (`translate-x-[-100%] → [100%]`),
  arrows that nudge (`group-hover:translate-x-1`) or rotate 45°.
- **`layoutId` shared-element transitions:** the event card → modal morph
  (`layoutId={card-${id}}`, `img-…`, `title-…`) and the tab pill/active dot
  (`layoutId="active-tab"`, `"active-pip"`).
- **Loader:** full-screen navy overlay, red progress line, exits `y: "-100%"`
  after 2 s; hero content is timed to start at ~2.2–2.4 s so it appears as the
  loader lifts.

### 4.3 Pure-CSS ambient motion
Defined in [globals.css](src/app/globals.css) for "always-on" background life,
GPU-accelerated and JS-free: `text-shine`, `active-dot-ping`, `cosmic-orbit-*`,
`stellar-pulse`, `astrolabe-spin`. (These carry permanent `will-change` — see
report §3.3.)

---

## 5. Component design patterns

- **Cards** (`EventCenter`, `EventGridCard`, execom): full-bleed background image,
  layered navy gradient (`from-navy via-navy/50 to-transparent`), floating
  `backdrop-blur` status/type pills top-left, content anchored bottom (`mt-auto`),
  meta row that rises/reveals on hover (`translate-y-8 → 0`, `opacity-0 → 100`),
  red-for-upcoming / navy-for-completed accent logic.
- **Carousels:** horizontal `overflow-x-auto snap-x snap-mandatory` with
  `hide-scrollbar`, cloned edge items for infinite looping, auto-advance gated by
  `useInView`, morphing circle→pill progress indicators.
- **Accordion** (`NewsSection`): vertical slices that expand
  `h-20 → h-[550px]` with an 800 ms `transition-[height]`, cinematic image bleed
  at ~35 % behind navy, animated progress fill bar during auto-cycle.
- **Mega-menu** (`Header`): hover-intent dropdown with a `closeTimer` grace
  period, full-viewport dimmer backdrop, scroll-reactive colour (transparent→navy
  on home, white→navy on subpages) driven by Framer `useTransform(scrollY)`.
- **Buttons/CTAs:** pill (`rounded-full`), Oswald uppercase, a colour panel that
  slides in from `translate-y-full` on hover, an arrow that rotates/nudges.

---

## 6. Page-by-page character

| Page | Personality |
|------|-------------|
| **Home** ([page.tsx](src/app/page.tsx)) | The showcase reel: hero → event carousel card → marquee → news accordion → about → **pinned horizontal execom** → red CTA → map → contact, over a sticky footer. |
| **About** ([info/about](src/app/info/about/page.tsx)) | The most cinematic: pinned parallax hero video, pinned split-screen story timeline (clip-path image wipes), 3D manifesto word reveal, animated stat counters, velocity-reactive brand marquee. Dark, film-grain overlay, "laboratory" voice. |
| **Execom** ([info/execom](src/app/info/execom/page.tsx)) | Roster/dossier system: clip-path "cutout" avatar cards, team panels, timelines. Light, structured, editorial. |
| **Events** ([events](src/app/events/page.tsx)) | Navy grid hero + filterable card grid (`AnimatePresence` popLayout) + shared-element modal. |
| **Mission / Join** ([info](src/app/info/)) | Simpler navy hero + content, same shell. |

---

## 7. Responsive strategy

- Breakpoints: Tailwind defaults; **`lg` (1024px) is the desktop cutoff** for the
  most complex behaviour (horizontal pin in execom, mega-menu).
- Complex desktop motion degrades to **native vertical stacks on mobile** — the
  execom horizontal pin becomes a stacked list; the about split-screen becomes a
  stacked image+text flow. Handled via `gsap.matchMedia()` (about, and now
  execom) or `hidden lg:block` / `lg:hidden` twins.
- Fluid sizing on dense sections uses `clamp()` tied to `vh` (execom dossier
  cards) so nothing clips on shorter laptop screens.
- `overflow-x: hidden` on `body` + `html` guards against horizontal scroll from
  the many negative-margin / breakout elements.

---

## 8. Quick-reference cheatsheet for new work

```
Heading:      font-oswald uppercase tracking-tight(er) text-navy   (or text-white on dark)
Eyebrow:      <span class="w-6 h-[2px] bg-red"/> + Oswald uppercase tracking-[0.2em] text-red
Body:         font-inter text-gray-600  (light)  /  text-white/70  (dark)
Card panel:   rounded-3xl overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.12)]
CTA:          bg-red text-white rounded-full uppercase font-oswald + slide-up hover panel
Ease:         [0.22, 1, 0.36, 1]  (smooth)  /  [0.76, 0, 0.24, 1]  (dramatic)
Reveal:       whileInView + viewport={{ once: true }} + stagger delay i*0.1
Accent color: exactly one red element per view — protect its scarcity
```

Keep red scarce, keep headings condensed + uppercase, layer white cards over dark
breakers, and let motion be scroll-driven and unhurried.
