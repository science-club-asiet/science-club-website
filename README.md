# Science Club ASIET — Platform & Web Application

A single-page-style marketing and administration platform for the Science Club at ASIET, built with Next.js 16, React 19, Tailwind CSS v4, Lenis smooth scrolling, GSAP ScrollTrigger, and Supabase.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16.2.3 (App Router, Turbopack)
- **UI & Motion**: React 19.2.4, Framer Motion 12, GSAP 3.14 + ScrollTrigger
- **Smooth Scroll**: Lenis 1.3
- **Styling**: Tailwind CSS v4 (inline theme tokens in `src/app/globals.css`)
- **Backend & Database**: Supabase (PostgreSQL, Auth, RLS, Realtime)
- **Typography**: Oswald (Headings) + Inter (Body Copy) via `next/font`

---

## 🚀 Available Commands

```bash
npm run dev       # Start Turbopack development server at http://localhost:3000
npm run build     # Compile production build
npm run lint      # Run ESLint validation checks
npx tsc --noEmit  # Typecheck TypeScript codebase
```

---

## 🏛️ Platform Architecture

- **Public Site**:
  - `/` — Main Hub (Parallax Hero, Club Highlights, Event Carousel, Execom Roster, Newsroom, Join CTA)
  - `/events` — Comprehensive Event Catalog with search, filters, modal popups, and registration
  - `/news` & `/news/[slug]` — Campus Newsroom, Announcements, Research Publications
  - `/info/about` — Founding Story, Timeline Eras, Core Pillars, Campus Laboratory Highlights
  - `/info/mission` — Club Manifesto, Strategic Goals, Impact Testimonials
  - `/info/execom` — Executive Committee Directory, Team Categories, Past Office Bearers
  - `/info/join` — Recruitment Portal, Perks, Membership FAQs, Interactive Application Form
  - `/gallery` — Photo Albums & Campus Event Candids

- **Admin Workspaces** (`/admin`):
  - **Events Workspace**: Event management, category filters, TablePagination, Nexus Visual Builder shortcuts
  - **Posts Workspace**: News & article publishing, draft/live status toggles, TablePagination
  - **Members & Execom**: RLS user role management (`owner`, `admin`, `execom`, `member`), department & year filters
  - **Recruitment Kanban**: Drag-and-drop applicant pipeline (*Submitted → Under Review → Interview → Accepted*)
  - **Site Content Hub**: Global branding variables, Mission pillars, Story eras, Join perks
  - **Form Builder**: Dynamic custom field schemas & template presets
  - **Media Library**: UploadThing CDN asset management
  - **CMS Workspace**: Custom data collection & field schema builder
  - **System Settings**: Database latency benchmarks, environment readiness indicators, multi-entity activity audit trail with category/role/date filters & shifting pagination

---

## 📜 Workspace Rules

1. **Scroll Architecture**:
   - Lenis owns the window scroll position (`window.__lenis?.scrollTo`).
   - GSAP ScrollTrigger reads scroll position only (no ScrollTrigger `snap`).
   - Modal locks pause Lenis (`window.__lenis?.stop()` / `?.start()`) rather than setting `body { overflow: hidden }`.
2. **UI Typography**:
   - Never use `//` in text or typography anywhere in the UI. Use clean bullet dots (`•`) or clean uppercase titles instead.
