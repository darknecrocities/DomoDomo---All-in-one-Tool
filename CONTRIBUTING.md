# Contributing to DomoDomo

We are thrilled that you want to help improve **DomoDomo — All-in-One Local Toolbox**! By contributing, you help make the developer utility ecosystem more private, fast, and accessible.

---

## 📜 Development Guidelines

To maintain clean and high-quality code across our 90 client-side tools, please adhere to the following rules:

### 1. Zero-Server Architecture
- All features **must** run entirely client-side.
- Do not add any backend dependencies, external APIs, cloud integrations, databases (use IndexedDB if required), or authentication systems.

### 2. File Organization
- Every tool has its dedicated component file under `src/tools/<category>/<ToolName>.tsx`.
- Avoid consolidated suites. If you create a new utility, add it as a separate module and import it into `src/engine/registry.ts`.
- Store any reusable operations inside `src/utils/sharedHelpers.tsx`.

### 3. TypeScript Rules
- Code must compile with zero errors using `npx tsc -b`.
- Use explicit type declarations; avoid `any` where possible.
- Wrap dynamic canvas elements or refs securely to avoid null reference exceptions.

### 4. Styling & Branding
- Keep components responsive and clean.
- Use our signature Panda Brandkit scheme (Primary color: `#4E8E5E`).
- Use smooth micro-animations on interactive states.

---

## 🛠️ How to Contribute

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
5. **Open a Pull Request** (PR) detailing your modifications and verifying that your code builds locally via `npm run build`.

Thank you for contributing to DomoDomo! 🐼
