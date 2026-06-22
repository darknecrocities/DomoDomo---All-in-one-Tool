# Spec: Monochrome Branding and Logo Update

This spec describes the plan to swap the brand logo and integrate the new high-contrast "Monochrome Bamboo" color palette into the application with interactive dark-mode/light-mode toggling, defaulting to dark mode.

## Goal

- Replace the legacy inline SVG logo with the new branding logo (`/domodomo.png`).
- Implement the "Monochrome Bamboo" color palette.
- Support both dark and light modes, with **dark mode as the default**.
- Maintain the original layout, structure, spacing, and shapes without modification.

## Design Decisions

- **Logo Swap**: The logo element in `src/components/Logo.tsx` will load `/domodomo.png` and match the size prop.
- **Theme Default**: The document root will default to the `dark` class unless the user explicitly toggles it to `light`.
- **CSS Variables for Color Swapping**:
  We will map CSS variables in `src/index.css` under `:root` (light mode) and `.dark` / `:root:not(.light)` classes:
  - `--background`: Background color of the app
  - `--card`: Card backgrounds
  - `--text`: Main text color
  - `--text-secondary`: Secondary text color
  - `--primary`: Primary color (accent/forest green replacement)
  - `--primary-hover`: Hover state for primary color
  - `--border`: Border color
- **Tailwind Extension**: Map the colors in `tailwind.config.js` to use these CSS variables.
