# Monochrome Branding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Swap the old logo with the new logo `/domodomo.png` and update the color scheme using CSS custom properties dynamically linked to Tailwind, defaulting to dark mode.

**Architecture:** 
1. Update `src/components/Logo.tsx` to render the image `/domodomo.png` instead of the legacy SVG.
2. Define custom color properties in `src/index.css` supporting light/dark variables, default root element to dark mode, and map them in `tailwind.config.js`.
3. Add a Toggle Theme button in `src/components/Shell.tsx` to toggle between light and dark monochrome palettes.

**Tech Stack:** React, Tailwind CSS, TypeScript, Lucide React

## Global Constraints
- Only change the colors, do not change any of the layouting, border-radii, spacing, or structural styles.
- By default, the application must be in dark mode.
- Swap all instances of the old logo (inline SVG) with the new logo `/domodomo.png`.

---

### Task 1: Update Logo Component

**Files:**
- Modify: `src/components/Logo.tsx`

**Interfaces:**
- Consumes: `LogoProps` (size, showText)
- Produces: React Element rendering the logo image with the new path `/domodomo.png`.

- [ ] **Step 1: Replace SVG logo with new image logo**
  Update `src/components/Logo.tsx` to use the image `/domodomo.png` styled with the provided `size` and standard transitions.

- [ ] **Step 2: Commit**
  ```bash
  git add src/components/Logo.tsx
  git commit -m "feat: update Logo component with the new branding image"
  ```

---

### Task 2: Configure Theme Variables and Tailwind

**Files:**
- Modify: `src/index.css`
- Modify: `tailwind.config.js`

- [ ] **Step 1: Define CSS Variables in `src/index.css`**
  Modify `src/index.css` to define the monochrome CSS variables under `:root` (representing light mode) and `:root:not(.light)` / `.dark` (representing default dark mode).

- [ ] **Step 2: Map Tailwind Theme to CSS Variables**
  Modify `tailwind.config.js` to map `background`, `card`, `primary`, `secondary`, and `accent` to the custom CSS variables.

- [ ] **Step 3: Commit**
  ```bash
  git add src/index.css tailwind.config.js
  git commit -m "feat: configure theme variables and tailwind mapping for monochrome bamboo"
  ```

---

### Task 3: Add Theme Toggle to Shell

**Files:**
- Modify: `src/components/Shell.tsx`

- [ ] **Step 1: Implement Theme State and Toggle Logic**
  Update `src/components/Shell.tsx` to check local storage for theme preference, default to `dark`, apply the class to `document.documentElement`, and render a Lucide Sun/Moon toggle button.

- [ ] **Step 2: Commit**
  ```bash
  git add src/components/Shell.tsx
  git commit -m "feat: add interactive theme toggle to shell header"
  ```

## Verification Plan

### Automated Tests
- Run `npm run build` to verify no TypeScript compilation errors.

### Manual Verification
- Launch the application, verify that the new logo is displayed, and test the light/dark mode toggle button in the header.
