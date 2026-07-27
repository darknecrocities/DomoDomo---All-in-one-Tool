---
name: domodomo-new-tool-workflow
description: Mandatory end-to-end procedure for adding or materially changing a DomoDomo tool or category. Use when creating a tool under src/tools, registering it in the local engine and dashboard, updating Local AI knowledge and technical documentation, changing About metrics, or publishing the related blog announcement.
---

# DomoDomo New Tool & Category Workflow

Complete every applicable step for a new or materially changed tool. Keep utilities browser-first and local-first: do not introduce cloud uploads, external APIs, authentication, telemetry, or a server dependency unless the feature explicitly requires a local DomoDomo service.

## 1. Scope and inspect

- Search for a comparable implementation in `src/tools/<category>/` and reuse its UX, file-handling, and export patterns.
- Read the related registry, dashboard, documentation, About, and blog data before editing so identifiers and counts stay consistent.
- Use an existing category unless a new category is genuinely necessary.

## 2. Implement the tool

- Create a standalone React functional component at `src/tools/<category>/<ToolName>.tsx`.
- Use explicit TypeScript types, Lucide icons, existing DomoDomo dark/glass styling, responsive layouts, and accessible labels.
- Keep processing on-device. Clean up object URLs, workers, listeners, streams, and timers.
- Handle empty, invalid, cancelled, and large inputs. Show progress for long-running work.
- Include single and batch file selection when the workflow supports them.
- Provide useful local outputs: preview, copy, download, or export. Offer raw annotation formats, masks, or dataset ZIPs when relevant.
- Add floating Zoom In, Zoom Out, and Reset Zoom controls to every canvas, image, visualizer, or 3D viewport.

## 3. Register the implementation

### Type declarations — `src/engine/types.ts`

- Add the category string to `ToolCategory` only for a genuinely new category.

### Central engine — `src/engine/registry.ts`

- Import the component.
- Add one complete `Tool` object to `TOOLS` with a stable kebab-case `id`, human-readable `name`, valid `categories`, concise local-processing `description`, available Lucide `icon`, and the component.
- Keep the same `id`, name, category, and description intent across every registration surface.

```ts
{
  id: 'tool-id-name',
  name: 'Human Readable Name',
  categories: ['category_id'],
  description: 'Describe the on-device workflow.',
  icon: 'LucideIconName',
  run: async (input) => input,
  component: ToolComponent,
}
```

### Dashboard — `src/pages/Dashboard.tsx`

- Add a category card and category metadata when creating a category.
- Add or update the corresponding entry in `ALL_PLANNED_TOOLS` with status `'functional'`.
- Verify the tool is discoverable through the dashboard category, search, and direct tool route.

## 4. Rewire Local AI and technical documentation

### Technical source — `src/utils/ToolDocsData.ts`

- Update its category union/mapping when a category is new.
- Add or revise the `TOOLS_DOCS` record with the registered `id`, name, engine, local processing details, functionality, ordered `howItWorks`, and concrete technical specifications.
- State browser APIs, local services, model requirements, supported formats, export types, and meaningful limits. This is the Local AI agent's product knowledge source.

### Documentation UI — `src/pages/Documentation.tsx`

- Add the category to every interactive category picker, sidebar, filter, or routing map when a category is new.
- Confirm the tool documentation can be found and rendered from the documentation page.

## 5. Keep product surfaces accurate

### About page — `src/pages/AboutApplication.tsx`

- Update the Web Utilities count after adding a functional tool.
- Update the Categories count only when adding a new category.
- Update any category-specific, suite, or capability metric affected by the feature. Do not change unrelated statistics.

### Blog — `src/data/blogData.ts`

- Add a release post in `BLOG_POSTS` for each meaningful new tool, category, or feature set.
- Explain user value, the private/local processing model, technical architecture, supported inputs, and exports.
- Use a unique slug, accurate date, and the existing post schema. Do not claim cloud AI, server processing, or capabilities the implementation does not provide.

### Supporting content

- Update `README.md`, `CONTRIBUTING.md`, SEO data, sitemap inputs, or download content only when the feature changes the information those files present.
- Do not update product copy merely to repeat the technical documentation.

## 6. Verify before handoff

1. Check component, registry, dashboard, documentation, About, and blog identifiers and counts for consistency.
2. Run `npm run build` and fix all TypeScript or Vite failures.
3. Run `npm run lint` when frontend code changes.
4. Run `npm --prefix mcp-server run build` if the tool changes MCP integration.
5. Test the changed workflow with valid, invalid, and cancelled input; test exports when present.
6. Review the diff and preserve unrelated working-tree changes.

Do not consider a new tool complete until all applicable product surfaces above have been updated.
