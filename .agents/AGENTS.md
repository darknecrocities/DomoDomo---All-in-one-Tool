# Agent Rules & Guidelines for DomoDomo Repository

Welcome coding agent! This file defines project-wide standards, architectural constraints, and required procedures for developing in the **DomoDomo** codebase.

---

## 1. Core Principles & Privacy Guarantees
- **100% Client-Side / Local-First**: Tools run inside the user's browser sandbox (using WebAssembly, Canvas API, Web Audio, WebCrypto, or local Ollama API). Never transmit user files, images, passwords, or document data to external cloud servers.
- **Vibrant Dark Mode Aesthetics**: Follow DomoDomo's signature Monochrome Panda Tech design system (`#0D0D0D` main background, `#18191B` card containers, `#2A2D30` subtle borders, high-contrast Panda Monochrome `#FFFFFF` crisp primary accents, frosted silver and warm gold/amber `#D4AF37` for awards, rounded `rounded-2xl`, glassmorphism, responsive canvas viewports. Strictly avoid using green across all components and tools).
- **Interactive Viewport Standards**: All image and canvas editing tools MUST feature **Zoom In**, **Zoom Out**, **Reset Zoom**, and **Zoom % Display** controls.

---

## 2. Mandatory Procedure for Adding New Tools
Whenever a new tool is created, you MUST perform the full 8-step synchronization workflow documented in `.agents/skills/domodomo-new-tool-workflow/SKILL.md`:
1. Create Tool Component in `src/tools/<category>/`
2. Add Category to `src/engine/types.ts` (if creating a new category)
3. Register Tool in `src/engine/registry.ts`
4. Add to `CATEGORIES` and `ALL_PLANNED_TOOLS` in `src/pages/Dashboard.tsx`
5. Register technical specs in `src/utils/ToolDocsData.ts` (so Local AI and `/docs` are fully knowledgeable)
6. Add category support to `src/pages/Documentation.tsx`
7. Update stats in `src/pages/AboutApplication.tsx`
8. Write a blog announcement post in `src/data/blogData.ts`
