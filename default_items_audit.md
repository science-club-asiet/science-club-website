# Codebase Audit & Custom Theme CSS Guide: Default Items, Textboxes & Alerts

This document compiles all **default items** found across the codebase (excluding SQL schema defaults as requested) and provides **custom theme CSS** for every default element to seamlessly align with the Science Club design language (**Brand Navy** `#001C58`, **Brand Red** `#DA291C`, **Brand Gold** `#C8A059`, **Oswald** heading typography, and **Inter** body typography).

---

## 🎨 Science Club Custom Theme CSS Token System

Add or reference these unified CSS utility classes from `src/app/globals.css` across all default elements:

```css
/* ─── Science Club Theme Form Controls & Alert Utilities ─── */

/* Custom Input Field (Light Theme) */
.sc-input {
  width: 100%;
  background-color: #ffffff;
  border: 1px solid #E5E7EB;
  border-radius: 0.75rem; /* 12px */
  padding: 0.625rem 0.875rem;
  font-size: 0.875rem;
  color: var(--brand-navy);
  font-family: var(--font-inter);
  transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
}

.sc-input::placeholder {
  color: #9CA3AF;
}

.sc-input:focus {
  outline: none;
  border-color: var(--brand-red);
  box-shadow: 0 0 0 3px rgba(218, 41, 28, 0.15);
}

/* Custom Input Field (Dark Theme / Glassmorphism) */
.sc-input-dark {
  width: 100%;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #ffffff;
  font-family: var(--font-inter);
  transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}

.sc-input-dark::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.sc-input-dark:focus {
  outline: none;
  border-color: var(--brand-red);
  box-shadow: 0 0 0 3px rgba(218, 41, 28, 0.3);
}

/* Custom Select Dropdown */
.sc-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23001C58'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1.25rem;
  padding-right: 2.5rem;
}

/* Custom Checkbox & Radio Controls */
.sc-checkbox {
  accent-color: var(--brand-red);
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 0.25rem;
  cursor: pointer;
}

/* Custom Alert & Toast Styles */
.sc-alert-error {
  background-color: rgba(218, 41, 28, 0.08);
  border: 1px solid rgba(218, 41, 28, 0.25);
  color: var(--brand-red);
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.sc-alert-success {
  background-color: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.25);
  color: #047857;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Science Club Custom Action Button */
.sc-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: var(--brand-red);
  color: #ffffff;
  font-family: var(--font-oswald);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 700;
  border-radius: 9999px;
  padding: 0.75rem 1.75rem;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.sc-btn-primary:hover {
  background-color: var(--brand-navy);
  transform: translateY(-1px);
}
```

---

## 1. Public Site UI Defaults & Custom CSS

### 1.1 Input Textboxes, Textareas & Search Bars
| Component / Location | Default Element & Placeholder | Source File | Custom CSS / Tailwind Classes |
|---|---|---|---|
| **Footer** | Email input (`placeholder="Enter your email"`) | [Footer.tsx:L128](file:///g:/Science%20Club/Website/science-club-website/src/components/Footer.tsx#L128) | `bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20 transition-all text-sm font-inter` |
| **EventHeroHorizon** | Search input (`placeholder="SEARCH EVENTS BY TITLE, TOPIC, OR SPEAKER..."`) | [EventHeroHorizon.tsx:L119](file:///g:/Science%20Club/Website/science-club-website/src/components/events/EventHeroHorizon.tsx#L119) | `bg-white/10 backdrop-blur-md text-white placeholder:text-white/40 pl-12 pr-4 py-3.5 rounded-full border border-white/20 focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20 font-oswald text-xs tracking-wider uppercase transition-all` |
| **ContactSection** | Full Name (`placeholder="John Doe"`) | [ContactSection.tsx:L130](file:///g:/Science%20Club/Website/science-club-website/src/components/ContactSection.tsx#L130) | `bg-transparent border-b border-white/20 pb-2 text-white font-inter text-lg focus:outline-none focus:border-red transition-colors w-full placeholder:text-white/30` |
| **ContactSection** | Email (`placeholder="john@example.com"`) | [ContactSection.tsx:L141](file:///g:/Science%20Club/Website/science-club-website/src/components/ContactSection.tsx#L141) | `bg-transparent border-b border-white/20 pb-2 text-white font-inter text-lg focus:outline-none focus:border-red transition-colors w-full placeholder:text-white/30` |
| **ContactSection** | Subject (`placeholder="How can we help?"`) | [ContactSection.tsx:L152](file:///g:/Science%20Club/Website/science-club-website/src/components/ContactSection.tsx#L152) | `bg-transparent border-b border-white/20 pb-2 text-white font-inter text-lg focus:outline-none focus:border-red transition-colors w-full placeholder:text-white/30` |
| **ContactSection** | Message (`placeholder="Tell us about your project or inquiry..."`) | [ContactSection.tsx:L163](file:///g:/Science%20Club/Website/science-club-website/src/components/ContactSection.tsx#L163) | `bg-transparent border-b border-white/20 pb-2 text-white font-inter text-lg focus:outline-none focus:border-red transition-colors w-full resize-none placeholder:text-white/30` |
| **FormRenderer** | Dynamic Input (`f.placeholder` schema default) | [FormRenderer.tsx:L11](file:///g:/Science%20Club/Website/science-club-website/src/components/FormRenderer.tsx#L11) | `w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:border-red focus:ring-2 focus:ring-red/10 transition-all duration-200 hover:border-gray-300 shadow-sm` |
| **Login Page** | Email & Password inputs | [login/page.tsx:L68-L76](file:///g:/Science%20Club/Website/science-club-website/src/app/login/page.tsx#L68-L76) | `bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20 transition-all` |

### 1.2 Default Alerts, Toasts & Button Statuses
| Component / Location | Trigger / Type | Default Text | Custom Theme Styling |
|---|---|---|---|
| **ContactSection** | Error Alert | `"Something went wrong — please try again."` | `<p className="bg-red/10 border border-red/30 text-red text-sm px-4 py-2.5 rounded-xl font-medium">...</p>` |
| **ContactSection** | Submit Button | `"Send Message"` / `"Sending..."` / `"Message Sent"` | `bg-white rounded-full font-oswald text-lg font-bold tracking-widest uppercase text-navy hover:bg-red hover:text-white transition-all` |
| **Footer** | Subscription Toast | `"Thanks — you're subscribed."` | `<p className="text-xs mt-3 text-emerald-400 font-medium tracking-wide">✓ Thanks — you're subscribed.</p>` |
| **Footer** | Error Status | `"Couldn't subscribe. Try again."` | `<p className="text-xs mt-3 text-red font-medium tracking-wide">✕ Couldn't subscribe. Try again.</p>` |
| **RegisterButton** | Button States | `"Register"` → `"Registering…"` → `"Registered ✓"` | `bg-red text-white px-8 py-3 rounded-full font-oswald uppercase tracking-widest text-sm font-bold hover:bg-navy transition-all duration-300 disabled:opacity-70 shadow-sm` |

---

## 2. Admin Panel & CMS Defaults & Custom CSS

### 2.1 Default Input Textboxes & Search Controls
| Component / Location | Default Element & Placeholder | Source File | Custom CSS / Tailwind Classes |
|---|---|---|---|
| **CommandPalette** | Search Bar (`placeholder="Search or jump to…"`) | [CommandPalette.tsx:L107](file:///g:/Science%20Club/Website/science-club-website/src/components/admin/CommandPalette.tsx#L107) | `w-full bg-transparent text-sm text-navy placeholder:text-gray-400 focus:outline-none font-medium py-4 px-2` |
| **FormBuilder** | Field Label & Key (`placeholder="Field label"`, `placeholder="field_key"`) | [FormBuilder.tsx:L50-L73](file:///g:/Science%20Club/Website/science-club-website/src/components/admin/FormBuilder.tsx#L50-L73) | `w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red/10 focus:border-red transition-all duration-200 hover:border-gray-300 shadow-sm` |
| **ImageUploader** | Paste URL (`placeholder="…or paste an image URL"`) | [ImageUploader.tsx:L90](file:///g:/Science%20Club/Website/science-club-website/src/components/admin/ImageUploader.tsx#L90) | `w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red/10 focus:border-red transition-all shadow-sm` |
| **SettingsGeneral** | Site Title, Tagline & Email (`placeholder="e.g. Science Club"`) | [SettingsGeneral.tsx:L51-L74](file:///g:/Science%20Club/Website/science-club-website/src/components/admin/settings/SettingsGeneral.tsx#L51-L74) | `w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red/10 focus:border-red transition-all shadow-sm` |
| **ExecomWorkspaceClient** | Category Name, Label & Slug (`placeholder="e.g. HARDWARE LAB"`) | [ExecomWorkspaceClient.tsx:L638-L650](file:///g:/Science%20Club/Website/science-club-website/src/components/admin/execom/ExecomWorkspaceClient.tsx#L638-L650) | `w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red/10 focus:border-red transition-all shadow-sm` |
| **MediaLibraryClient** | Search Assets (`placeholder="Search assets..."`) | [MediaLibraryClient.tsx:L171](file:///g:/Science%20Club/Website/science-club-website/src/components/admin/media/MediaLibraryClient.tsx#L171) | `w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red/10 focus:border-red transition-all shadow-sm` |
| **MemberList** | Search Member (`placeholder="Search name, email, or tags..."`) | [MemberList.tsx:L76](file:///g:/Science%20Club/Website/science-club-website/src/components/admin/members/MemberList.tsx#L76) | `w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red/10 focus:border-red transition-all shadow-sm` |
| **CollectionEditor** | Collection Name & Field Keys (`placeholder="e.g. Jobs"`) | [CollectionEditor.tsx:L74-L90](file:///g:/Science%20Club/Website/science-club-website/src/components/admin/cms/CollectionEditor.tsx#L74-L90) | `w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red/10 focus:border-red transition-all shadow-sm` |

### 2.2 Default Alerts, Prompts, Confirm Dialogs & Toasts
| Component / Location | Native Trigger | Message / Purpose | Custom Styled Replacement |
|---|---|---|---|
| **Toast.tsx** | Global Toast | Success & Error notifications | `bg-white border-gray-200 text-navy shadow-lg` (Success with emerald check) / `bg-red border-red text-white shadow-lg` (Error with brand red banner) ([Toast.tsx:L41-L55](file:///g:/Science%20Club/Website/science-club-website/src/components/ui/Toast.tsx#L41-L55)) |
| **DeleteButton** | `confirm()` | `"Delete this item permanently?"` | Custom Modal Dialog: `<div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">` with brand red confirm button (`bg-red text-white hover:bg-navy`). |
| **MediaLibraryClient** | `confirm()` | `"Are you sure you want to delete this asset?"` | Custom Modal Confirmation with red accent warning icon and Oswald action button. |
| **ExecomWorkspaceClient** | `confirm()` | `"Are you sure you want to publish the 2026-27 committee?"` | Custom Modal Banner with Brand Navy background and Brand Red confirm button. |
| **ExecomWorkspaceClient** | `prompt()` | `"Enter new term (e.g. 2026-27):"` | Custom Inline Form Input Modal styled with `.sc-input` and brand red border. |

---

## 3. Nexus Builder & Inspector Defaults & Custom CSS (`src/packages/nexus-builder`)

### 3.1 Inspector & Shell Control Textboxes
| Component / Location | Control Label | Default Placeholder | Custom Theme Styling |
|---|---|---|---|
| **StyleControls** | Image URL | `placeholder="url(...)"` | `w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs text-navy placeholder:text-gray-400 focus:outline-none focus:border-red focus:ring-1 focus:ring-red/20 font-mono` |
| **StyleControls** | Transform | `placeholder="rotate(0deg)"` | `w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs text-navy placeholder:text-gray-400 focus:outline-none focus:border-red focus:ring-1 focus:ring-red/20 font-mono` |
| **StyleControls** | Filter | `placeholder="blur(0px)"` | `w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs text-navy placeholder:text-gray-400 focus:outline-none focus:border-red focus:ring-1 focus:ring-red/20 font-mono` |
| **StyleControls** | Transition | `placeholder="all 0.3s ease"` | `w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs text-navy placeholder:text-gray-400 focus:outline-none focus:border-red focus:ring-1 focus:ring-red/20 font-mono` |
| **controls** | Dimension Input | `placeholder="auto"` or `"0"` | `w-full bg-transparent text-[10px] text-gray-700 text-center focus:outline-none focus:bg-white focus:ring-1 focus:ring-red/30 rounded` |
| **controls** | Color Hex | `placeholder="#000000"` | `w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs font-mono text-navy focus:outline-none focus:border-red` |
| **SidebarLeft** | Search Elements | `placeholder="Search elements..."` | `w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-navy placeholder:text-gray-400 focus:outline-none focus:border-red focus:ring-1 focus:ring-red/20` |

### 3.2 Canvas Alerts & Placeholders
| Component / Location | Canvas Element | Default Text | Custom Theme Styling |
|---|---|---|---|
| **TopBar** | Save Failure Banner | `<AlertCircle /> Save failed` | `<div className="flex items-center text-red font-medium text-xs bg-red/10 border border-red/20 px-2.5 py-1 rounded-md">` |
| **core (Media)** | Empty Image Component | `"No image selected"` | `<div className="w-full h-48 rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-xs font-medium text-gray-400 font-oswald uppercase tracking-wider">` |
| **core (Media)** | Empty Video Component | `"No video selected"` | `<div className="w-full h-48 rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-xs font-medium text-gray-400 font-oswald uppercase tracking-wider">` |

---

## 4. Block Registry Default Props & Custom CSS (`src/lib/blocks/registry.ts`)

All 15 predefined block component cards have been updated to use custom brand classes:

```tsx
// Example: Custom Hero Block Card Styling
const heroBlockCard = {
  badge: "bg-red/10 text-red font-oswald text-xs uppercase tracking-widest px-3 py-1 rounded-full border border-red/20",
  title: "font-oswald text-4xl lg:text-6xl font-bold uppercase text-navy tracking-tight",
  button: "bg-red text-white hover:bg-navy rounded-full font-oswald uppercase tracking-widest text-sm font-bold px-8 py-3.5 transition-all shadow-md"
};

// Example: Custom FAQ Accordion Block Card Styling
const faqBlockCard = {
  heading: "font-oswald text-3xl font-bold uppercase text-navy border-b-2 border-red pb-3 mb-6",
  question: "font-inter font-semibold text-lg text-navy hover:text-red transition-colors",
  answer: "font-inter text-gray-600 text-sm leading-relaxed"
};
```

---

## 5. Audit Summary & Applied Improvements
- **CSS Utility System**: Standardized `.sc-input`, `.sc-input-dark`, `.sc-select`, `.sc-checkbox`, `.sc-alert-error`, `.sc-alert-success`, and `.sc-btn-primary` in [globals.css](file:///g:/Science%20Club/Website/science-club-website/src/app/globals.css).
- **Public & Admin UI Inputs**: Standardized all `inputCls` and `btnPrimaryCls` definitions in [primitives.tsx](file:///g:/Science%20Club/Website/science-club-website/src/components/ui/primitives.tsx#L5-L12) with brand red focus rings, smooth transitions, and Oswald typography.
- **Toasts & Dialog Alerts**: Upgraded [Toast.tsx](file:///g:/Science%20Club/Website/science-club-website/src/components/ui/Toast.tsx#L41-L55) to use high-contrast Science Club brand borders and icons.
- **SQL Constraints**: Preserved as instructed without alterations.
