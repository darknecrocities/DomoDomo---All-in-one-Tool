# Contributing to DomoDomo

We are thrilled that you want to help improve **DomoDomo — All-in-One Local Toolbox**! By contributing, you help make the developer utility ecosystem more private, fast, and accessible.

---

## 📂 Folder Structure Overview

DomoDomo is structured cleanly as a client-side React + Vite project. Below is an overview of the key directories:

```
DomoDomo---All-in-one-Tool/
├── public/                 # Static assets (favicons, site metadata, robots.txt)
├── src/
│   ├── components/         # Reusable global UI components (e.g. DynamicIcon, Navbar)
│   ├── engine/             # Core execution engine
│   │   ├── registry.ts     # Main tools registry mapping IDs to React components
│   │   └── types.ts        # Common TypeScript interfaces (Tool, ToolCategory, etc.)
│   ├── pages/
│   │   ├── Dashboard.tsx   # Dashboard displaying categories and all available tools
│   │   └── ToolWorkspace.tsx # Workspace rendering active tools and documentation
│   ├── tools/              # Specialized modules grouped by category
│   │   ├── audio/          # Audio Web utilities
│   │   ├── converter/      # Local file converter scripts
│   │   ├── dev/            # Developer-specific diagnostics & utilities
│   │   ├── document/       # Text converters and local OCR/markdown editors
│   │   ├── pdf/            # Client-side PDF-lib and PDF.js tools
│   │   ├── photo/          # High-performance canvas filters and tools
│   │   ├── qr/             # Wifi, VCard, and Payment QR generators
│   │   ├── security/       # Encryption, hash check, and local AI threat audits
│   │   └── video/          # WASM frame manipulators and tracking
│   ├── utils/              # Shared helper functions and branding variables
│   │   ├── BrandKit.ts     # Theme colors, styling tokens, and design constants
│   │   ├── sharedHelpers.tsx # Common canvas drawing, upload wrappers, and helpers
│   │   └── ToolDocsData.ts # Documentation data for each tool
│   ├── App.css             # Main styling rules and glassmorphism definitions
│   ├── App.tsx             # Route management and layout wrappers
│   └── main.tsx            # React application entry point
├── package.json            # Node dependency configurations
└── tsconfig.json           # TypeScript configuration
```

---

## 🛠️ Guide: How to Create and Register a New Tool

Follow these step-by-step instructions to create a new tool and add it to the DomoDomo toolbox:

### Step 1: Create the Component File
Create your new React component under the appropriate category inside `src/tools/<category>/`. 
For example, if you are adding an image filter called `CoolFilter`, create:
`src/tools/photo/CoolFilter.tsx`

```tsx
import React, { useState } from 'react';
import { Sparkles } from 'lucide-react'; // Import clean icons

export const CoolFilterTool = () => {
  return (
    <div className="glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="text-teal-400 font-bold border-b border-slate-800 pb-2">Cool Filter</h3>
      <p className="text-sm text-slate-355">Implement your client-side logic here!</p>
    </div>
  );
};
```

### Step 2: Register the Tool in the Execution Engine
Open `src/engine/registry.ts`:
1. **Import** your new component at the top of the file:
   ```typescript
   import { CoolFilterTool } from '../tools/photo/CoolFilter';
   ```
2. **Add** the tool metadata object to the `tools` array. Ensure it satisfies the `Tool` interface:
   ```typescript
   {
     id: 'cool-filter',
     name: 'Cool Filter',
     category: 'photo',
     description: 'Apply high-performance local filters to your graphics.',
     icon: 'Sparkles',
     run: async (i) => i, // Default pass-through action runner
     component: CoolFilterTool
   }
   ```

### Step 3: Add to Dashboard Cards
Open `src/pages/Dashboard.tsx` and append your tool metadata to `ALL_PLANNED_TOOLS` so it displays on the homepage. Match the `id`, `name`, `category`, and `description` exactly:
```typescript
{ 
  id: 'cool-filter', 
  name: 'Cool Filter', 
  category: 'photo', 
  description: 'Apply high-performance local filters to your graphics.', 
  icon: 'Sparkles', 
  status: 'functional' 
}
```

### Step 4: Add Technical Documentation
Open `src/utils/ToolDocsData.ts` and add detailed documentation for your tool under the appropriate suite mapping. This helps users understand how the client-side execution processes their data:
```typescript
{
  id: 'cool-filter',
  name: 'Cool Filter',
  details: 'Leverages HTML5 Canvas 2D Context color transformation matrixes to process pixels locally.',
  functionality: 'Modifies hues, saturation, and contrast. Outputs clean transparent PNGs.',
  howItWorks: '1. Loads image. 2. Processes pixel arrays on-device. 3. Redraws canvas.',
  technicalSpecs: 'Execution takes ~0.2s for standard 1080p images.'
}
```

---

## 📜 Development Guidelines

To maintain clean and high-quality code across our client-side tools, please adhere to the following rules:

### 1. Zero-Server Architecture
- All features **must** run entirely client-side.
- Do not add any backend dependencies, external APIs, cloud integrations, databases (use IndexedDB if required), or third-party authentication systems.

### 2. Styling & Branding
- Keep components responsive. Ensure layouts fit nicely on mobile screens and large viewports.
- Use our signature Domo Brandkit scheme. (Primary highlight color: `#4E8E5E` / Tailwind `emerald-500` shades).
- Use smooth micro-animations for hover states and transitions.
- Build interfaces using the styling structures defined in `src/App.css` (e.g. `.glass-card`).

### 3. TypeScript Rules
- Code must compile with zero errors. Verify compilation locally:
  ```bash
  npm run build
  ```
- Use explicit type declarations; avoid `any` where possible.
- Wrap dynamic canvas elements or refs securely to avoid null reference exceptions.

---

## 🧪 CI/CD & Testing Requirements

To ensure project stability and prevent regression across the toolbox's 110+ client-side utilities, all pull requests (PRs) must meet the following automated verification criteria before they can be merged:

### 1. Compilation & Build Safety
All code changes must compile with zero syntax or type errors on the frontend and the local Python/Node modules. Run the compilation tests locally before submitting a PR:
```bash
# Verify React/Vite/TypeScript compilation
npm run build

# Verify the Node MCP server build compiles
npm --prefix mcp-server run build
```

### 2. Static Analysis & Linting
We enforce formatting and ESLint rules. Ensure your files are free of formatting and syntax violations:
```bash
# Run the linter
npm run lint
```
*   Ensure all React hooks, dependencies, and state bindings comply with eslint specifications.
*   Remove any unused variables or dead imports from your modifications.

### 3. Backend & DB Migration Safety
If modifying the local FastAPI server (`backend/main.py`):
*   Ensure that all endpoint logic handles cross-origin policies (CORS) safely.
*   Avoid adding any schema changes that break backward compatibility with users' existing SQLite databases.
*   All API responses should be structured correctly, handling network failures gracefully on the client side.

---

## 🚀 How to Submit Your Contribution

1. **Fork** the repository on GitHub.
2. **Create a branch** for your features or fixes:
   ```bash
   git checkout -b feature/cool-new-tool
   ```
3. **Commit** your changes with clear, descriptive commit messages:
   ```bash
   git commit -m "feat(photo): add advanced image filter options"
   ```
4. **Push** your branch:
   ```bash
   git push origin feature/cool-new-tool
   ```
5. **Open a Pull Request** (PR) detailing your modifications.

Thank you for contributing to DomoDomo!
