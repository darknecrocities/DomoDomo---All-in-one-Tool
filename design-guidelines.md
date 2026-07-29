# DomoDomo — Design Guidelines
> **Version:** 1.0 · Derived from a thorough audit of the live codebase · Last updated: July 2026

This document is the authoritative reference for all UI/UX decisions, visual design, typography, color usage, spacing, component anatomy, animation, and multimedia/branding asset standards in the **DomoDomo All-in-One Tool Hub** project.

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing & Layout](#4-spacing--layout)
5. [Component Library](#5-component-library)
6. [Borders & Radius](#6-borders--radius)
7. [Elevation & Shadow](#7-elevation--shadow)
8. [Motion & Animation](#8-motion--animation)
9. [Iconography](#9-iconography)
10. [Dark Mode & Light Mode](#10-dark-mode--light-mode)
11. [Status & Feedback Patterns](#11-status--feedback-patterns)
12. [Multimedia & Brand Assets](#12-multimedia--brand-assets)
13. [Responsive Design](#13-responsive-design)
14. [Accessibility](#14-accessibility)
15. [Consistency Audit & Known Issues](#15-consistency-audit--known-issues)

---

## 1. Design Philosophy

DomoDomo's visual identity is built on the metaphor of a **local-first workshop** — a dark, industrial, yet premium digital workbench. Every design decision should reinforce these five principles:

| Principle | Description |
|---|---|
| **Privacy-First Aesthetic** | The UI should feel like a secure, enclosed space. Dark backgrounds, solid cards, and minimal external references reinforce the offline-local promise. |
| **Premium Tactility** | Cards behave like physical objects: they lift on hover (`-translate-y-0.5`), have subtle shadows, and react to interaction. No flat, lifeless elements. |
| **Structural Minimalism** | Decoration is purposeful. Grid lines, rivets, and bracing in the splash screen are not noise — they express the "workshop" metaphor. |
| **Information Density with Clarity** | 110+ tools must coexist without cognitive overload. Dense grids are made legible through consistent card anatomy and strong typographic hierarchy. |
| **Dual-Mode Integrity** | Every color, shadow, and gradient must look intentional in both **Dark (Panda Charcoal)** and **Light (Monochrome Bamboo)** modes. |

---

## 2. Color System

### 2.1 CSS Custom Properties (Source of Truth)

All colors are defined as CSS custom properties in `src/index.css` and mapped to Tailwind tokens via `tailwind.config.js`. **Always use these semantic tokens over raw hex values.**

#### Dark Mode — "Panda Charcoal" (Default)

| Token | CSS Variable | Hex Value | Usage |
|---|---|---|---|
| Background | `--background` | `#0d0d0d` | Page / shell background |
| Card | `--card` | `#18191B` | All card surfaces |
| Surface Dim | `--surface-dim` | `#111213` | Recessed areas, input backgrounds, footer |
| Surface Container | `--surface-container` | `#222325` | Hover states on secondary surfaces |
| Text Primary | `--text` | `#f9f9f9` | Headings, body, critical labels |
| Text Secondary | `--text-secondary` | `#c7c6c6` | Supporting text, nav labels |
| Text Tertiary | `--text-tertiary` | `#858383` | Placeholder text, timestamps, muted metadata |
| Border | `--border` | `#2A2D30` | All borders at rest |
| Primary | `--primary` | `#ffffff` | Primary action text / icon in dark mode |
| Primary Hover | `--primary-hover` | `#e5e2e1` | Hover state of primary elements |
| Primary Glow | `--primary-glow` | `rgba(255,255,255,0.05)` | Radial gradient on `<body>` |

#### Light Mode — "Monochrome Bamboo"

| Token | CSS Variable | Hex Value | Usage |
|---|---|---|---|
| Background | `--background` | `#f9f9f9` | Page background |
| Card | `--card` | `#ffffff` | Cards |
| Surface Dim | `--surface-dim` | `#f3f3f3` | Recessed surfaces |
| Surface Container | `--surface-container` | `#eeeeee` | Hover states |
| Text Primary | `--text` | `#1a1c1c` | Headings, body |
| Text Secondary | `--text-secondary` | `#444748` | Supporting text |
| Text Tertiary | `--text-tertiary` | `#747878` | Muted text |
| Border | `--border` | `#c4c7c7` | Borders |
| Primary | `--primary` | `#000000` | Primary actions |

### 2.2 Brand Accent Colors

These are **hardcoded semantic accents** that remain constant across themes — they are not inverted in light mode.

| Color Name | Hex Value | Usage |
|---|---|---|
| **Forest Green** (Primary Accent) | `#3C6B4D` | Active states, CTAs, icon containers, nav active, progress bars |
| **Forest Green Hover** | `#2E533B` | Hover state of Forest Green elements |
| **Forest Green Light** | `#4E8E5E` | Secondary variant, used in some legacy components |
| **Amber Gold** | `#E29E2D` | Warnings, feedback badge, secondary attention (nav icons) |
| **Royal Gold** | `#D4AF37` | "Popular" tool badge, shining border animation gradient |
| **Ko-fi Red** | `#FF5E5B` | Ko-fi support button only |
| **Error Red** | `rose-500 / rose-400` | Errors, destructive actions, download errors |
| **Emerald (PWA)** | `emerald-400 / emerald-500` | Install PWA prompt button only |

### 2.3 Color Application Rules

- **Never** use a raw hex value directly in JSX. Map it to the semantic CSS variable or Tailwind token.
- The `src/index.css` utility layer contains `!important` overrides to map static Tailwind hex classes (e.g., `.bg-[#18191B]`) to dynamic CSS variables. Rely on this system when legacy hex values appear in older components.
- **Forest Green** (`#3C6B4D`) is the interaction color. Every interactive state (focus ring, active nav, active filter tab, progress, hover border) should resolve to this color.
- **Amber Gold** (`#E29E2D`) signals attention or secondary action. Use sparingly — maximum one instance per visible screen area.
- **Opacity patterns for accents:**
  - Background tint: `/10` opacity (e.g., `bg-[#3C6B4D]/10`)
  - Border hint: `/20` to `/35` opacity
  - Border hover: `/50` to `/60` opacity
  - Solid fill: no opacity modifier

### 2.4 Gradient Usage

| Gradient | Usage |
|---|---|
| `radial-gradient(at 50% 0%, var(--primary-glow) 0px, transparent 60%)` | Subtle body background radial glow, always `fixed` |
| `linear-gradient(to right/bottom, var(--border) 1px, transparent 1px)` repeated | Background grid decoration, max `opacity-[0.15]` |
| `[mask-image:radial-gradient(ellipse 60% 50% at 50% 0%, #000 70%, transparent 100%)]` | Mask for fading grid lines |
| Gold shimmer: `linear-gradient(90deg, #d4af37, #ffe58f, #d4af37, #966f1c, #d4af37)` | `.gold-shining-border` — AppBuilders PH badge only |

---

## 3. Typography

### 3.1 Font Stack

| Role | Font | Weights Used | Tailwind Class |
|---|---|---|---|
| **Body / UI** | Inter | 300, 400, 500, 600, 700 | `font-sans` (default) |
| **Headings** | Sora (primary), Space Grotesk (fallback) | 300–800 | `font-heading` |
| **Monospace** | System mono (no custom import) | — | `font-mono` |

All fonts are loaded from Google Fonts in `src/index.css`. Never load them from another source.

### 3.2 Type Scale

| Usage | Size | Weight | Class Pattern |
|---|---|---|---|
| Page Hero H1 | `text-3xl md:text-5xl` | `font-extrabold` | `tracking-tight leading-tight` |
| Section H2 (footer) | `text-4xl sm:text-5xl` | `font-black` | `tracking-tight leading-none` |
| Card Title (H3) | `text-lg` | `font-bold` | — |
| Panel Heading (H2) | `text-xl` | `font-bold` | `tracking-tight` |
| Body / Description | `text-sm md:text-base` | `font-normal` | `leading-relaxed` |
| Card Description | `text-xs` | `font-normal` | `leading-relaxed` |
| Nav Labels | `text-xs` | `font-bold` | `tracking-wide` |
| Pill / Badge | `text-[10px]` | `font-bold` | `uppercase tracking-widest` |
| Footer Section Titles | `text-[11px]` | `font-bold` | `uppercase tracking-wider` |
| Metadata / Timestamps | `text-[10px]` | `font-semibold` | `font-mono` or `font-sans` |
| Terminal / Code | `text-[10px]–text-[11px]` | `font-semibold` | `font-mono` |
| Micro-labels (9px) | `text-[9px]` | `font-bold` | `uppercase tracking-wider` |

### 3.3 Typography Rules

- **Headings** always use `font-heading` (Sora). Never use Inter for `<h1>`–`<h6>`.
- **Tight tracking** (`tracking-tight`) is mandatory on all headings.
- **Monospace** text is used exclusively for: code snippets, terminal commands, model names, version strings, and keyboard shortcuts (`<kbd>`).
- **Line heights:** Use `leading-none` for large display text, `leading-tight` for headings, `leading-relaxed` for body paragraphs.
- **Do not** use `text-base` or `text-lg` for descriptive card copy — keep it at `text-xs` or `text-sm`.
- **Logo wordmark:** "**Domo**" is `font-extrabold`, "Domo" suffix is `font-semibold`. Both in `font-sans` (Inter), `text-2xl`.

---

## 4. Spacing & Layout

### 4.1 Container

The global content container is `max-w-7xl mx-auto px-4 sm:px-6`. All pages use this through the `<main>` tag in `Shell.tsx`.

### 4.2 Section Spacing

| Context | Spacing |
|---|---|
| Gap between major page sections | `gap-8` (flex column) |
| Hero section internal padding | `p-8 md:p-12` |
| Standard card padding | `p-6` |
| Compact card padding | `p-5` |
| Panel / info block padding | `p-4` to `p-5` |
| Inner section padding | `p-3` to `p-3.5` |
| Footer top padding | `pt-16 pb-8` |
| Main content top/bottom padding | `py-6 sm:py-8` |

### 4.3 Grid Systems

| Usage | Grid |
|---|---|
| Hero banner (text + console) | `grid-cols-1 lg:grid-cols-12` / `lg:col-span-7` + `lg:col-span-5` |
| Footer (brand + links) | `grid-cols-1 lg:grid-cols-12` / `lg:col-span-5` + `lg:col-span-7` |
| Footer link columns | `grid-cols-1 sm:grid-cols-3` |
| Tool cards | `grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3` |
| Model download cards | `grid-cols-1 md:grid-cols-3` |
| OS setup blocks | `grid-cols-1 md:grid-cols-3` |

### 4.4 Gap Conventions

- `gap-1` to `gap-2`: Tight icon/text pairs
- `gap-3`: Standard inline groups (badges, icon+label)
- `gap-4`: Between cards, between form elements
- `gap-6` to `gap-8`: Between major section groupings
- `gap-12`: Between footer major blocks

---

## 5. Component Library

### 5.1 Cards

**Standard Glass Card** — `.glass-card`

```css
background-color: var(--card);       /* #18191B dark */
border: 1px solid var(--border);     /* #2A2D30 dark */
border-radius: 24px;                 /* rounded-card */
transition: all 200ms;
box-shadow: sm shadow-black/10;
```

**Interactive Card** — `.glass-card.glass-card-hover`

- On hover: `shadow-md shadow-black/20` + `-translate-y-0.5`
- Border transitions to `rgba(var(--primary-rgb), 0.4)`
- Background changes to `var(--surface-dim)`

**Popular Tool Card** — Extended variant

- Border: `border-[#D4AF37]/35` at rest
- Hover border: `border-[#D4AF37]`
- Hover shadow: `shadow-[0_0_20px_rgba(212,175,55,0.08)]`
- Icon container: `bg-[#D4AF37]/10 border-[#D4AF37]/25 text-[#D4AF37]`
- Title hover color: `text-[#D4AF37]`

**Planned/Disabled Card** — Greyed state

```
opacity-60 border-dashed border-[#2A2D30] select-none bg-[#111213]/40
```

### 5.2 Buttons

**Primary Button** — `.btn-primary`

```css
background-color: var(--primary);
color: var(--background);
border: 1px solid rgba(var(--primary-rgb), 0.2);
border-radius: 12px; /* rounded-xl */
padding: 8px 16px;
font-weight: 600;
/* hover: opacity-90, active: scale-[0.98] */
```

> In dark mode this is white-on-black. In light mode it is black-on-white. Do not override this behavior.

**Secondary Button** — `.btn-secondary`

```css
background-color: var(--surface-dim);
color: var(--text-secondary);
border: 1px solid var(--border);
border-radius: 12px;
padding: 8px 16px;
font-weight: 600;
/* hover: bg → surface-container, text → var(--text) */
```

**Icon Buttons (Navbar)** — `h-8 w-8 rounded-lg`

- Background: `bg-[#111213]` (surface-dim)
- Border: `border-[#2A2D30]` at rest
- Hover border: `border-[#3C6B4D]/40`
- Text color: `text-[#A3A09B]` → `hover:text-[#ECEBE9]`

**Accent Pill Buttons (Navbar)**

- Feedback (amber): `bg-[#E29E2D]/10 border-[#E29E2D]/35 text-[#E29E2D]`
- Social (green): `bg-[#3C6B4D]/10 border-[#3C6B4D]/35 text-[#3C6B4D]`
- Support (red): `bg-[#FF5E5B]/10 border-[#FF5E5B]/35 text-[#FF5E5B]`

**Category Filter Tabs**

- Active: `bg-[#3C6B4D] text-[#ECEBE9] border-[#3C6B4D] shadow-sm`
- Inactive: `bg-[#18191B] border-[#2A2D30] text-[#A3A09B]`
- Unavailable: `bg-[#18191B]/40 border-[#2A2D30] text-[#72706C]`

### 5.3 Badges & Pills

| Type | Pattern |
|---|---|
| **Ready** | `bg-[#3C6B4D]/10 text-[#3C6B4D] border-[#3C6B4D]/20` |
| **Popular** | `bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20` |
| **Needs Local AI** | `bg-[#E29E2D]/10 text-[#E29E2D] border-[#E29E2D]/20` |
| **Planned** | `bg-[#111213] text-[#72706C] border-[#2A2D30]` |
| **Recommended** | `bg-[#3C6B4D]/10 text-[#3C6B4D] border-[#3C6B4D]/20` (absolute positioned) |
| **Ollama Active** | Same as Ready badge |

All badges use: `text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded`

### 5.4 Inputs & Form Controls

**Text Input (standard)**

```css
background: var(--surface-dim);   /* bg-[#111213] */
border: 1px solid var(--border);  /* border-[#2A2D30] */
border-radius: 12px;              /* rounded-xl */
padding: 8px 12px;
color: var(--text);
font-size: text-xs;
focus: border-[#3C6B4D], outline-none;
placeholder-color: var(--text-tertiary);
```

**Select Dropdown**

Same as input, with `rounded-xl px-3.5 py-2 text-xs font-semibold`.

**Keyboard Shortcut Display** — `<kbd>`

```
px-1.5 py-0.5 text-[9px] font-mono bg-[#18191B] border border-[#2A2D30] text-[#72706C] rounded shadow-sm
```

### 5.5 Icon Containers

Standard icon container anatomy (used on cards, panels, section headings):

```
p-3 rounded-xl border bg-[ACCENT]/10 border-[ACCENT]/25 text-[ACCENT]
```

- On hover with `glass-card-hover`: `group-hover:scale-[1.03] transition-transform`

### 5.6 Terminal / Code Block

```
bg-[#111213] border border-[#2A2D30] rounded-2xl p-4
font-mono text-[10px]–text-[11px] text-[#A3A09B]
```

Terminal header bar: `bg-[#18191B] border-b border-[#2A2D30] px-4 py-2.5`
Mac-style traffic lights: `w-2.5 h-2.5 rounded-full` in `rose-500/80`, `amber-500/80`, `emerald-500/80`

### 5.7 Progress Bar

```
w-full bg-[#18191B] rounded-full h-2 overflow-hidden border border-[#2A2D30]
-> inner fill: bg-[#3C6B4D] transition-all duration-300
```

### 5.8 Alert / Info Banners

**Green Info Banner:**
```
bg-[#3C6B4D]/10 border border-[#3C6B4D]/35 rounded-2xl p-4
```

**Amber Warning Banner:**
```
bg-[#E29E2D]/10 border border-[#E29E2D]/20 rounded-2xl p-5
```

**Red Error Banner:**
```
bg-rose-500/10 border border-rose-500/25 rounded-xl p-4
text-rose-400 (or text-rose-500)
```

### 5.9 Navigation Bar (Shell Header)

- Sticky, `z-50`
- Background: `bg-[#18191B]`
- Bottom border: `border-b border-[#2A2D30]`
- Height: `py-3.5` (comfortable click targets)
- Max width: `max-w-7xl mx-auto`
- Nav links: `text-xs font-bold tracking-wide`
- Active link: `text-[#3C6B4D]`
- Inactive link: `text-[#A3A09B]` → `hover:text-[#ECEBE9]`

### 5.10 Footer

- Background: `bg-[#111213]` (surface-dim, same as page bg)
- Top border: `border-t border-[#2A2D30]`
- Section title label: `text-[11px] font-bold uppercase tracking-wider text-[#72706C]`
- Link items: `text-xs text-[#A3A09B] font-semibold`
- Link hover: `hover:text-[#ECEBE9]`
- Copyright bar border: `border-t border-[#2A2D30]/30`

---

## 6. Borders & Radius

### 6.1 Border Width

- **Standard:** `border` (1px)
- **Shining border:** `border-1.5px` (`.gold-shining-border` only)
- **Never** use `border-2` or thicker borders except for interactive highlights (`emerald-500/30 → hover:border-emerald-400`).

### 6.2 Border Color at Rest

Always `border-[#2A2D30]` (mapped to `var(--border)`). Exceptions:
- Dashed borders on disabled cards: `border-dashed border-[#2A2D30]`
- Partially transparent in sub-footer: `border-[#2A2D30]/30`
- Card footer dividers: `border-[#2A2D30]/65`

### 6.3 Border Radius Scale

| Size | Tailwind Class | Usage |
|---|---|---|
| `24px` | `rounded-3xl` / `rounded-card` | Hero banner, primary large cards, modal panels |
| `16px` | `rounded-2xl` | Secondary cards, info banners, mobile menu container, command bar |
| `12px` | `rounded-xl` | Buttons, inputs, icon containers, compact panels, code blocks |
| `8px` | `rounded-lg` | Navbar icon buttons, small inline containers |
| `6px` | `rounded` | Keyboard shortcut `<kbd>` elements |
| `full` | `rounded-full` | Progress bar track, step indicators, traffic lights, status dots |

**Rule:** Nesting is allowed and encouraged. A `rounded-3xl` card can contain `rounded-xl` buttons and `rounded-2xl` sub-panels.

---

## 7. Elevation & Shadow

DomoDomo uses a minimal, purposeful shadow system. Shadows are always dark-tinted (`shadow-black/N`).

| Level | Class | Usage |
|---|---|---|
| **Resting card** | `shadow-sm shadow-black/10` | All `.glass-card` at rest |
| **Hover card** | `shadow-md shadow-black/20` | `.glass-card-hover` on hover |
| **Command bar** | `shadow-2xl shadow-black/50` | Sticky search/category bar |
| **Console panel** | `shadow-xl shadow-black/30` | Terminal-style panels |
| **Popular hover** | `shadow-[0_0_20px_rgba(212,175,55,0.08)]` | Ambient gold glow, popular cards only |
| **Gold border** | `box-shadow: 0 0 10px rgba(212,175,55,0.4)` | `.gold-shining-border:hover` |
| **Modal overlay** | `shadow-2xl` | Update modal panel |

> **Never** use colored glow shadows on generic cards. The gold and green glows are reserved for exceptional states (popular badge, gold border).

---

## 8. Motion & Animation

### 8.1 Transition Standards

| Property | Duration | Easing | Class |
|---|---|---|---|
| Color changes (text, border, bg) | `150ms` | `ease` | `transition-colors duration-150` |
| Layout micro-interactions | `200ms` | `ease` | `transition-all duration-200` |
| Card hover lift | `200ms` | `ease` | (part of `glass-card-hover`) |
| Door splash opening | `1200ms` | `cubic-bezier(0.85, 0, 0.15, 1)` | Inline style only |
| Slide-in panel | `300ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | `animation-slide-in-right` |
| Fade in | `200ms–300ms` | `ease-out` | `animate-fade-in` / `animate-fadeIn` |
| Icon scale on hover | `200ms` | `ease` | `group-hover:scale-[1.03] transition-transform` |
| Button click press | — | — | `active:scale-[0.98]` |
| Nav arrow translate | — | `ease` | `group-hover:translate-x-1 transition-transform` |
| ChevronDown rotate | — | `ease` | `transform transition-transform` |

### 8.2 Keyframe Animations

| Name | Behavior | Usage |
|---|---|---|
| `pulse-slow` | `opacity: 0.5 → 0.8 → 0.5`, 5s infinite | Decorative ambient pulse on background blobs |
| `marquee` | `translateX(0% → -50%)`, 35s linear infinite | Tool tag/category marquee strip, pauses on hover |
| `gold-shine-sweep` | Sweeping gradient on border, 4s linear infinite | `.gold-shining-border` badge |
| `fade-in` | `opacity: 0 → 1` | Toast, panel appearance |
| `slide-in-right` | `translateX(100% → 0)` | Side panel open |
| `fade-out` | `opacity: 1 → 0` | Panel disappearance |

### 8.3 Animation Rules

- **Never auto-animate on page load** unless it is the splash screen or a one-time onboarding event.
- `animate-pulse` (Tailwind default) is used sparingly for: Ollama status dots, install button, loading states. **Do not overuse.**
- `animate-bounce` is reserved for the Download button icon only.
- `animate-spin` is for loading spinners only (CPU icon during AI connection).
- All hover/focus animations should use CSS transitions, not JS-driven state changes.

---

## 9. Iconography

### 9.1 Icon Library

**Primary:** [Lucide React](https://lucide.dev) — all icons are SVG, strokeWidth `2`, consistent sizing.

**Do not** mix icon libraries (no Heroicons, no FontAwesome). Custom SVG icons are permitted only when no Lucide equivalent exists (see `GithubIcon`, `FacebookIcon` in Shell.tsx).

### 9.2 Icon Sizes

| Context | Size |
|---|---|
| Navbar action icons | `size={14}` |
| Mobile menu icons | `size={16}` |
| Card icon container (standard) | `size={22}` |
| Panel header icon | `size={18}–24` |
| Badge inline icon | `size={10}–12` |
| CTA button icon | `size={13}–18` |
| Footer social icons | `size={16}` |
| Empty state | `size={32}` |

### 9.3 Icon Container Pattern

```jsx
<div className="p-3 rounded-xl border bg-[#3C6B4D]/10 border-[#3C6B4D]/25 text-[#3C6B4D]">
  <IconName size={22} />
</div>
```

Apply `group-hover:scale-[1.03] transition-transform` on the container when inside a hoverable card.

---

## 10. Dark Mode & Light Mode

### 10.1 Theme Toggle Mechanism

- Class-based: `dark` or `light` applied to `<html>` element.
- Default: **Dark mode** (`:root:not(.light)` selector).
- Persisted in `localStorage` under `'domo-theme'`.

### 10.2 What Changes Between Modes

- All `var(--*)` CSS tokens remap automatically.
- Hard-coded Tailwind hex classes (e.g., `bg-[#18191B]`) are overridden via `@layer utilities` with `!important` rules — this is legacy compatibility, not preferred practice.

### 10.3 Invariants (Same in Both Modes)

- **Brand accent colors** (Forest Green, Amber Gold, Royal Gold, Ko-fi Red) do not change.
- `text-white` on buttons, links, and colored-background elements is preserved in light mode via scoped overrides.
- The scrollbar thumb changes between `var(--border)` and `var(--primary)` on hover.

### 10.4 Mode-Specific Guidance

- In **light mode**, `.btn-primary` renders as black-on-white — ensure sufficient contrast for all button text.
- In **light mode**, card borders (`#c4c7c7`) are lighter — do not rely on border visibility for structure; use background-color differentiation.

---

## 11. Status & Feedback Patterns

### 11.1 Status Indicators (Dots)

```jsx
// Active/Online
<span className="w-2 h-2 rounded-full bg-[#3C6B4D] animate-pulse" />
// Error/Offline
<span className="w-2 h-2 rounded-full bg-rose-500" />
// Warning/Loading
<span className="w-2 h-2 rounded-full bg-[#E29E2D] animate-pulse" />
// Live/Deploying
<span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
```

### 11.2 Loading States

- Spinner: `animate-spin` on a border-clipped `<div>` or an icon
- Inline spinner: `w-3 h-3 border-2 border-[#3C6B4D] border-t-transparent rounded-full animate-spin`
- Progress bar: `bg-[#3C6B4D] h-full transition-all duration-300` with percentage width
- Pulsing text: `animate-pulse text-emerald-400 font-bold`

### 11.3 Copy-to-Clipboard

- Default: `<Copy size={10} />`
- Confirmed: `<Check size={10} className="text-[#3C6B4D]" />`
- Timeout: 1500ms reset

### 11.4 Update Notification Banner

Shown conditionally, always above main content:
- Container: `rounded-2xl bg-[#3C6B4D]/10 border border-[#3C6B4D]/35 animate-fadeIn`
- Icon: `<Zap>` with `animate-bounce`
- CTA: `bg-[#3C6B4D] hover:bg-[#2E533B]` — standard green CTA button

---

## 12. Multimedia & Brand Assets

### 12.1 Existing Assets

| File | Format | Usage | Notes |
|---|---|---|---|
| `domodomo.png` | PNG | Primary logo mark (owl character) | Used in `<Logo>` component and footer |
| `domodomo_wink.png` | PNG | Alternate logo variant (winking) | Used in `AboutApplication` page |
| `bettergov.png` / `bettergovph.jpg` | PNG/JPG | Partner badge | Used in hero banner |
| `hero.png` | PNG | Hero illustration | Small (13KB), currently minimal use |
| `react.svg` / `vite.svg` | SVG | Boilerplate (not used in production UI) | Can be removed |

### 12.2 Logo Usage Guidelines

The **DomoDomo owl logomark** should:

- Always be displayed with a `rounded-xl` clipping mask: `rounded-xl overflow-hidden`
- Include a subtle border: `border border-secondary/20`
- Have `hover:scale-105` scale animation with `transition-transform duration-300`
- Minimum size: `32px x 32px`
- Standard nav size: `40px x 40px`
- Footer large size: `36px x 36px`

The **wordmark** alongside the logo:
- "**Domo**" in `font-extrabold` + "Domo" in `font-semibold`, same `text-2xl` size
- Tagline: `text-[9px] uppercase tracking-[0.18em] text-[#72706C] font-bold`

### 12.3 Asset Creation Guidelines (New Assets)

When creating **new multimedia assets** for DomoDomo, follow these principles:

#### Screenshots & Previews
- Use the dark mode (`#0d0d0d` background) as the baseline for screenshots.
- Cards in screenshots must show the `rounded-3xl` radius and `#18191B` card color.
- Terminal previews must include the macOS-style traffic lights (red/amber/green dots).
- Use a consistent 16:9 ratio for OG/social images.

#### Illustrations & Icons
- Use a **flat illustration style** with no photorealistic elements.
- Prefer SVG over raster for any in-app illustrations.
- Keep a maximum of 3 colors from the brand palette per illustration.
- Accent color for highlight elements: Forest Green (`#3C6B4D`) or Amber Gold (`#E29E2D`).

#### Video / GIF Demos
- Record at minimum 1280x800 resolution in dark mode.
- Background must be `#0d0d0d`.
- Crop to remove browser chrome; show only the application frame.
- Maximum GIF duration: 8 seconds for tool demos, 3 seconds for micro-interactions.

#### Social Media Assets
- OG Image: `1200x630px`, dark background, show the logo + app name + key tagline.
- Twitter Card: `summary_large_image` format.
- Primary brand color on social: Forest Green `#3C6B4D` on dark.

#### Favicon / App Icons
- Base: `domodomo.png` (the owl)
- Ensure the owl is visible at `16x16px` (simplify detail if needed).
- PWA manifest icons: `192x192`, `512x512` at minimum.

### 12.4 Third-Party Asset Rules

- Partner logos (BetterGov.ph, etc.) should be displayed with `w-8 h-8 object-contain rounded-md`.
- External images should have `alt` text that describes their purpose, not their appearance.
- Do not display third-party logos larger than `36px` in the hero or nav context.

---

## 13. Responsive Design

### 13.1 Breakpoints

Standard Tailwind breakpoints apply:

| Prefix | Min Width | Usage |
|---|---|---|
| (default) | 0px | Mobile-first base styles |
| `sm:` | 640px | Tablet portrait, multi-column adjustments |
| `md:` | 768px | Tablet landscape, most grid changes |
| `lg:` | 1024px | Desktop, 12-column layout |
| `xl:` | 1280px | Not currently used; `max-w-7xl` handles containment |

### 13.2 Mobile Patterns

- Navigation collapses to hamburger menu at `md:` breakpoint.
- Tool grid is `grid-cols-2` from mobile up (never single column).
- Category filter bar uses horizontal scroll with chevron buttons on mobile.
- Hero banner stacks vertically on mobile (terminal console below text).
- Footer link columns collapse to single column on mobile.

### 13.3 Touch Targets

- Minimum touch target: `h-8 w-8` (32x32px) for icon-only buttons.
- Preferred touch target for text buttons: `py-2.5 px-3` minimum.
- Nav links on mobile: `py-2.5` padding to meet 44px height guideline.

---

## 14. Accessibility

### 14.1 Current Practices

- `title` attributes on all icon-only buttons and links.
- `aria-label` on mobile hamburger toggle.
- `alt` text on all `<img>` tags.
- `focus:outline-none focus:border-[#3C6B4D]` on inputs (custom focus ring using border).
- `disabled:opacity-40` on buttons when action is unavailable.
- Keyboard shortcut (`⌘K` / `/`) for search focus.

### 14.2 Contrast Guidelines

| Text Type | Minimum Contrast | Target Tokens |
|---|---|---|
| Body / UI text | 4.5:1 | `var(--text)` on `var(--card)` |
| Secondary text | 3:1 | `var(--text-secondary)` on `var(--card)` |
| Placeholder / muted | 2.5:1 (non-critical) | `var(--text-tertiary)` |
| Button text | 4.5:1 | Checked for `.btn-primary` in both modes |

> **Known Gap:** Forest Green (`#3C6B4D`) on dark card (`#18191B`) achieves ~3.5:1 contrast — acceptable for large/bold text (badges, nav links) but insufficient for small body text. Do not use `text-[#3C6B4D]` for body paragraphs.

### 14.3 Motion Accessibility

- No looping animations on critical content (only `.animate-pulse-slow` on decorative blobs).
- No automatic page navigation or content changes without user trigger (except testimonial carousel with 4.5s auto-advance).
- The splash screen is purely visual — it does not block user input after 3.1 seconds.

---

## 15. Consistency Audit & Known Issues

The following inconsistencies were identified during the codebase audit and should be addressed in future iterations:

### High Priority

| Issue | Location | Recommended Fix |
|---|---|---|
| Hard-coded hex values in JSX | Throughout `Shell.tsx`, `Dashboard.tsx` | Replace with CSS variable tokens or Tailwind semantic classes |
| Mixed `rounded-2xl` vs `rounded-xl` on similar elements | Code blocks across Dashboard | Standardize: use `rounded-xl` for compact blocks, `rounded-2xl` for panels |
| `text-rose-450` class used (non-standard Tailwind) | `Shell.tsx` L726, `Dashboard.tsx` L807 | Replace with `text-rose-400` or `text-rose-500` |

### Medium Priority

| Issue | Location | Recommended Fix |
|---|---|---|
| `.btn-indigo` retained as legacy (maps to surface-dim, not indigo) | `index.css` L116 | Rename to `.btn-surface` or deprecate entirely |
| `glow-text-teal` and `glow-text-indigo` class names are semantically incorrect | `index.css` L123–131 | Rename to `.accent-text-primary` / `.accent-text-secondary` |
| Amber Gold (`#E29E2D`) is mapped to `var(--secondary)` in dark mode but is unrelated to secondary text | `index.css` L261 | Use a dedicated `--accent-gold` token |
| `react.svg` and `vite.svg` still in `src/assets/` | — | Remove boilerplate files |
| `hero.png` (13KB) exists but is minimally utilized | — | Either integrate properly or remove |

### Low Priority

| Issue | Location | Recommended Fix |
|---|---|---|
| Testimonial carousel has no pause-on-focus for screen readers | `AboutApplication.tsx` | Add `aria-live="polite"` and pause-on-focus |
| `window.confirm()` and `window.alert()` for AI data purge | `Shell.tsx` | Replace with a custom modal component using `.glass-card` |
| Social link in footer points to `https://facebook.com` (generic) | `Shell.tsx` L643 | Update to the official DomoDomo Facebook page URL |

---

## Appendix: Quick Reference Cheatsheet

### Color Quick Reference

```
Forest Green (Active/CTA):  #3C6B4D  | hover: #2E533B
Amber Gold (Attention):     #E29E2D
Royal Gold (Popular/Award): #D4AF37
Background Dark:            #0d0d0d
Card Dark:                  #18191B
Border Dark:                #2A2D30
Text Primary Dark:          #f9f9f9   (#ECEBE9 in legacy refs)
Text Secondary Dark:        #c7c6c6   (#A3A09B in legacy refs)
Text Tertiary Dark:         #858383   (#72706C in legacy refs)
```

### Radius Quick Reference

```
xl:   12px  buttons, inputs, icon containers, compact panels
2xl:  16px  info banners, modals, command bar
3xl:  24px  hero cards, primary cards (rounded-card)
full: pill   status dots, badges, progress bars
```

### Font Quick Reference

```
Headings:  Sora (font-heading), weights 600-800, tracking-tight
Body/UI:   Inter (font-sans), weights 400-600, leading-relaxed
Mono/Code: System mono (font-mono), text-[10px]-text-[11px]
```

---

*This document should be updated whenever new design patterns are introduced to the codebase. When in doubt, the `src/index.css` CSS custom properties are the authoritative source of truth for all color tokens.*
