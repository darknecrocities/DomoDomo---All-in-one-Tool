# 🐼 DomoDomo — 100% Client-Side Agentic AI & Local-First Toolbox

DomoDomo is an open-source, **100% client-side, offline-first Agentic AI platform and productivity workshop**. Built as a high-performance, private, zero-server architecture toolbox, all operations—including autonomous multi-agent orchestration, local model context protocol (MCP) tool execution, document processing, and media suite tools—run completely inside your browser sandbox and local environment. Your data, code, images, PDFs, and files never leave your computer—no servers, no APIs, and no external clouds are ever touched.

[🐍 Codepyne.io](https://codepyne-io.vercel.app/) | [✨ DomoSkills Marketplace](https://web-beta-six-81.vercel.app/) | [💻 Download App](https://domodomo.site/download) | [👥 View Contributors](CONTRIBUTORS.md) | [🛠️ Contributing Guidelines](CONTRIBUTING.md)

---

## 🤖 Agentic Architecture & Zero-Leak Privacy Guarantee

DomoDomo operates on a strict **zero-leak agentic mandate**. Unlike cloud-based AI tools that upload sensitive code, contracts, or private data to remote servers, DomoDomo empowers autonomous **Agentic AI Workflows** running 100% locally on your hardware.

### Key Agentic Capabilities
- **Autonomous Multi-Agent Orchestration**: Execute multi-agent chains (Sequential & Parallel persona pipelines) locally using Ollama models.
- **Local Model Context Protocol (MCP) Server**: Provides local LLMs and agents with structured access to filesystem tools, codebase inspection, and local process controls via a local SSE server (`mcp-server/`).
- **Local Cognitive Journaling (`domo_journal.md`)**: Background AI agents automatically write reflective cognitive journal entries documenting internal reasoning, user interaction lessons, and code insights locally.
- **Browser-Side Vector Memory (RAG)**: Fast in-memory and IndexedDB vector embeddings (`all-MiniLM-L6-v2`) enable semantic search and document retrieval without cloud dependencies.

---

## 🌐 Domo Ecosystem & Explore Showcase

DomoDomo has expanded beyond standalone client-side tools into a connected, developer-native ecosystem. From hands-on Machine Learning mastery to open agent capability distribution and offline local execution, the Domo ecosystem bridges education, agent tooling, and productivity:

| Platform | Role in Ecosystem | Key Capabilities | Quick Links |
| :--- | :--- | :--- | :--- |
| **Codepyne.io** | Official Upskilling & Training Partner | Autograd from scratch, Transformer Attention & RoPE, Multi-Agent Systems, Fine-Tuning (LoRA/QLoRA), Verifiable AI Certifications | [Explore Codepyne.io](https://codepyne-io.vercel.app/) • [Read Announcement](/blog/announcing-codepyne-io-ai-machine-learning-upskilling-platform) |
| **DomoSkills** | Open Agent Skills Marketplace & CLI | 200+ verified capabilities (`SKILL.md`) for Antigravity, Claude Code, Cursor, OpenCode, Codex, Gemini CLI; one-command CLI package manager (`npx domoskills add`) | [Explore Marketplace](https://web-beta-six-81.vercel.app/) • [GitHub Repo](https://github.com/darknecrocities/DomoSkills) • [In-App Hub](/tool/domoskills) |
| **DomoDomo AI Hub** | Local-First AI Studio & Execution Sandbox | 16 dynamic offline AI modules, RAG Vector Search, Function Calling Sandbox, Guardrails Inspector, Modelfile/GGUF generator, n8n visual flow builder | [Launch AI Hub](/ai-hub) • [Technical Docs](/docs) |

### 🐍 Codepyne.io — AI & Machine Learning Upskilling Platform
**[Codepyne.io](https://codepyne-io.vercel.app/)** is the official AI & Machine Learning upskilling partner of the Domo ecosystem. Built on the conviction that deep engineering intuition requires coding models from first principles rather than relying on abstract slides or opaque wrapper APIs, Codepyne delivers an interactive, code-first engineering curriculum:
- **Python Fundamentals & Numerical Foundations**: Master tensor mathematics, vectorized NumPy computations, memory layout optimizations, and broadcasting from the ground up.
- **Autograd Engines & Backpropagation from Scratch**: Build computational graph engines, automatic differentiation tapes, and topological reverse-mode autodiff without relying on black-box frameworks.
- **Transformer Architectures & Attention Heads**: Deconstruct modern Large Language Models layer-by-layer—scaled dot-product attention, multi-head projections, rotary positional embeddings (RoPE), KV caching, and causal decoder loops.
- **Transformer Fine-Tuning & Quantization**: Parameter-Efficient Fine-Tuning (PEFT) with LoRA and QLoRA, conversational dataset curation, and 4-bit GGUF (Q4_K_M) quantization for local deployment with Ollama, llama.cpp, and vLLM.
- **Multi-Agent Systems & Tool Orchestration**: ReAct reasoning loops, function calling with JSON schemas, Model Context Protocol (MCP) integrations, hierarchical manager-worker pipelines, and agent consensus loops.
- **Verifiable AI Certifications**: Solve rigorous code-level challenges and benchmark evaluations to earn cryptographically verifiable AI certifications validating real-world machine learning proficiency.

### ✨ DomoSkills — The Open Agent Skills Marketplace & CLI
Created and engineered by **Arron Parejas**, **[DomoSkills](https://web-beta-six-81.vercel.app/)** is the developer-native open-source capability registry and CLI package manager designed specifically for autonomous AI coding agents:
- **200+ Verified Agent Capabilities**: Curated library of modular skills (`SKILL.md`) spanning 12 software engineering domains (frontend, backend, security, DevOps, performance, testing, AI/ML, and architecture).
- **Single-Command CLI Package Manager**: Install agent capabilities directly into any project repository with automatic workspace detection:
  ```bash
  # Initialize DomoSkills in your project
  npx domoskills init

  # Add skills for any supported agent
  npx domoskills add react-performance owasp-agent-guardian
  npx domoskills add fastapi-clean-architecture --agent cursor
  npx domoskills add docker-architect --agent claude

  # Run workspace health audits
  npx domoskills doctor
  npx domoskills audit
  ```
- **Universal Agent Compatibility**: Native support for **Google Antigravity**, **Claude Code**, **Cursor**, **OpenCode**, **Codex**, **Gemini CLI**, **Windsurf**, and **GitHub Copilot**.
- **Reproducible Team Workflows**: Commit `domoskills.json` lockfiles into git version control so teammates and CI/CD pipelines run `npx domoskills install` for 100% reproducible agent behaviors across environments.
- **In-App Tool Hub (`/tool/domoskills`)**: Browse the live marketplace directly inside DomoDomo with interactive viewport zoom controls (70%–150%), CLI generation wizards, category deep-links, and one-click submissions via the Domo Skill Creator bridge.

### 🚀 What's New in the Explore Catalog & Toolbox ("& etc")
DomoDomo's **Explore** catalog features 15 distinct categories powering 110+ client-side web utilities. Recent high-impact additions to the explore roster include:
- **Canon CR2 to PNG Batch Converter (`/tool/cr2-to-png`)**: A 100% client-side, professional-grade Canon RAW (`.CR2`) converter to lossless 24-bit PNGs. Features a proprietary zero-corruption dual-strategy parser (TIFF IFD traversal + DIGIC hardware JPEG stream carving) that prevents color distortion and memory bounds errors, Exif camera MakerNotes inspection (ISO, aperture, shutter speed, lens model), responsive zoom viewports, and one-click ZIP archive exports.
- **AI Hub Studio (`/ai-hub`)**: A dedicated central laboratory uniting 16 dynamic offline AI modules, Model Library, RAG Vector Search (TF-IDF and local embeddings), Prompt Engineering Lab (live `{{variable}}` substitution), Function Calling Sandbox, Multimodal Vision Downloader (Llava, Llama 3.2 Vision, Moondream), AI Guardrails Inspector (8 PII categories & jailbreak blocking), and GGUF VRAM Quantization Calculator.
- **Visual Flow Automation Canvas**: Drag-and-drop n8n-style visual graph flowchart board with pan/zoom viewport controls, curved Bezier port wiring, multi-workflow management, and real-time execution logs JSON payload inspection.
- **Universal Desktop Download Hub & Permissions Sandbox (`/download`)**: Direct desktop installers for Windows (`.exe` & portable zip), macOS (`.dmg` & universal app bundle), Linux (`.AppImage` & `.deb`), and 1-click PWA installer—paired with live Ollama CORS configuration scripts (`OLLAMA_ORIGINS="*"`) and interactive local hardware permissions testing.
- **Interactive Viewport Standards**: All media, canvas, and spatial tools strictly adhere to DomoDomo's interactive viewport guidelines with **Zoom In**, **Zoom Out**, **Reset 100%**, and **Pan** controls with zero cloud telemetry.

---

## 🛠️ Codebase Architecture & Design Philosophy

### Component-Based Architecture
- **`/src/engine`**: Contains the core registry (`registry.ts`) registering all 100+ functional tools.
- **`/src/pages`**: Handles routing, the primary tool frame containers, and the main visual dashboard.
- **`/src/tools`**: Categorized directory holding React/TypeScript components for all utility modules (AI, Video, Photo, Audio, PDF, Dev, Network, Security, Spatial 3D, and Investigation).
- **`/src/utils`**: Core service files containing brand tokens, helpers, and singleton API layers.
- **`/backend`**: FastAPI Python server providing local persistence, vector searches, and caching.
- **`/mcp-server`**: Model Context Protocol (MCP) server exposing local tool execution endpoints for local AI agents.

### 🧠 Unified Memory & Cognitive Core
DomoDomo coordinates memory and knowledge context across multiple local layers:
1. **Unified Memory Hub (IndexedDB + SQLite WAL)**: 
   * **Client Timeline**: Uses browser IndexedDB to cache user profiles and debounced activity events.
   * **SQLite WAL Database**: A lightweight SQL database running in Write-Ahead Logging (WAL) mode handles semantic vector tables (`thought` schema) and activity timeline tracking natively.
2. **Local AI Cognitive Journal (`domo_journal.md`)**:
   * Every time you use the AI chat, log a thought, or compile a story, DomoDomo schedules a background worker task.
   * The worker prompts the active local Ollama model to write a reflective cognitive journal entry in first-person (`I`) detailing its feelings, internal thoughts, and lessons learned.
   * Logs are appended to a root-level markdown file `domo_journal.md`. This file is listed under `.gitignore` to protect privacy.
3. **CORS-Free SSE Stream Proxy**:
   * The Python backend proxy `/api/chat` coordinates server-sent event (SSE) streams and NDJSON packages from Ollama.
   * It caches prompt queries (5-minute TTL) and yields tokens progressively, reducing the perceived initial loading latency to under 300ms.
4. **Adaptive Model Recommendation Engine**:
   * Inspects the user's downloaded local models dynamically and matches system RAM and CPU core threads to recommend the best instruct-tuned model variant available.

---

## ⚙️ Tech Stack & Core Libraries

DomoDomo is engineered using modern, lightweight frontend technologies to ensure security, native speed, and fully offline operation. Every library and model used is intentionally chosen to run completely offline.

### Core Architecture & Routing Stack
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vite.dev/) (For ultra-fast Hot Module Replacement and bundler efficiency)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict type safety across all utilities)
- **Routing**: [React Router DOM](https://reactrouter.com/) (Client-side routing)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/) (Fluid utilities matching the custom Domo Green theme)
- **Icons**: [Lucide React](https://lucide.dev/) (Scalable, lightweight vector icons)
- **Head Management**: [React Helmet Async](https://github.com/staylor/react-helmet-async) (SEO and dynamic meta tags)

### Agentic AI, Machine Learning & Local Models
- **Generative LLMs & Agentic Runtimes (Ollama Integration)**: Supports various models like `llama3.2:1b` (recommended for medium setups), `qwen2.5:0.5b` (for low specs), and `deepseek-coder` for agentic code generation. Operations happen locally on port `11434`.
- **Model Context Protocol (MCP)**: Custom MCP SSE server (`mcp-server/`) allowing local agents to interact with file contexts and developer tools securely.
- **Text Classification & Embeddings**: Uses [Transformers.js (`@xenova/transformers`)](https://huggingface.co/docs/transformers.js) executing inside the browser via WebAssembly.
  - **Models utilized**: `all-MiniLM-L6-v2` for semantic search/embeddings and `distilbert` for text classification.
- **Facial Recognition & Tracking**: Utilizes [MediaPipe Tasks Vision](https://developers.google.com/mediapipe) loaded dynamically via CDN.
  - **Models utilized**: `blaze_face_short_range.tflite` for real-time video face detection and auto-blurring. GPU-accelerated via WebGL.
- **Optical Character Recognition (OCR)**: [Tesseract.js](https://tesseract.projectnaptha.com/) running via WebAssembly to extract text from images natively.

### Media & Document Processing Engine
- **Video & Audio Processing**:
  - [FFmpeg.wasm](https://ffmpegwasm.netlify.app/): WebAssembly port of FFmpeg enabling local video cropping, background removal, subtitle hardcoding, and audio extraction.
  - **Web Audio API**: Native operating system audio synthesis, recording, visual frequency parsing, and speed modulation.
- **PDF Manipulation & Security**:
  - [pdf-lib](https://pdf-lib.js.org/): Client-side parser to merge, split, watermark, compress, and modify PDF byte arrays.
  - [pdfjs-dist](https://mozilla.github.io/pdf.js/): Mozilla's core library for rendering PDF documents into Canvas/HTML elements natively.
  - [@pdfsmaller/pdf-encrypt](https://www.npmjs.com/package/@pdfsmaller/pdf-encrypt): Local utility enabling client-side password encryption (AES) and permission restrictions on PDF exports.
- **Image & Photo Utilities**:
  - [exifr](https://mutiny.cz/exifr/): High-performance, memory-efficient EXIF parser to read/strip metadata from photos.
  - **Canvas API**: Extensive use of the HTML5 Canvas for collage making, background removal chroma keying, image compression, format conversion (WebP/JPG/PNG), and pixel manipulations.
  - **Canon RAW (.CR2) Dual-Strategy Binary Parser**: Resilient in-browser parser executing TIFF IFD traversal and DIGIC hardware JPEG stream carving to extract pristine full-resolution sensor pictures without server uploads.

### Barcode & Networking Tools
- **QR Code & Barcode**: 
  - [qrcode](https://www.npmjs.com/package/qrcode): Used for rendering and generating styled QR codes.
  - [jsqr](https://github.com/cozmo/jsQR): Native JavaScript library for scanning and decoding QR codes from camera feeds.
- **Local Storage & Caching**: IndexedDB and localStorage persistent browser cache allowing high-performance sandbox operations, large file handling, and API rate-limit caching without server bloat.

---

## 🤖 Agentic Domo Hub & Local AI Suite

To ensure complete privacy without external API subscription costs, DomoDomo integrates directly with local **Ollama** runtimes on `http://localhost:11434` and local MCP servers.

### 🧠 Domo Agent Hub & Multi-Agent Orchestrator
The Domo Agent Hub is a local-first agentic workspace that hooks directly to your local folders using browser file system handles and local MCP server tools. It is designed specifically for developers and creators who want an intelligent, agentic coding and debugging assistant without cloud subscription costs or telemetry.
- **Multi-Agent Orchestrator:** Configure, name, and assign distinct LLM models to multiple specialized agent personas (e.g., Domo Architect, Domo Hacker, Domo Auditor) to work simultaneously or sequentially.
  - *Sequential Chain:* Flows agent outputs downstream as context to the next agent (optimal for low VRAM specs).
  - *Parallel Evaluation:* Processes agent responses concurrently to compare perspectives.
- **Debounced Autosave & Auto-write:** Includes automatic saving as you edit files, and an optional auto-write compiler that automatically writes generated agent artifacts straight to your mounted directory.
- **Live Coding Simulation:** Offers a visual typing simulation of generated code that can be toggled on/off to display output instantly.
- **File Extension Correction:** Dynamically maps fallback code extensions (e.g., mapping `.python` -> `.py`, `.javascript` -> `.js`, `.typescript` -> `.ts`) when parsing block responses.

### Premium Offline AI Tool Suite (20 Tools Total)
The suite includes the original 10 offline AI utilities (Chat, Summarizer, Caption Generator, OCR Assistant, Prompt Enhancer, Image Classifier, Text Rewriter, Translator, Speech-to-Text, and Semantic Search), plus **10 brand-new tools** added to the line-up:
- **AI Code Explainer**: Paste code to get plain-English explanations, complexity scores, and translation.
- **AI Flashcard Maker**: Turn any text/topic into study Q&A flashcard decks with flip animations.
- **AI Sentiment Journal**: Private daily mood analyzer and emotion trend tracker.
- **AI Email Composer**: Compose or reply with tone, length, and subject generation.
- **AI Story Generator**: Story builder with plot twist and chapter continuation support.
- **AI Debate Assistant**: Argument builder for PRO/CON positions and steelman counters.
- **AI Math Solver**: Step-by-step solver and word problem parser with LaTeX notation.
- **AI Recipe Generator**: Plan recipes, nutrition profiles, and shopping lists from ingredients on hand.
- **AI Code Reviewer**: Audit code structure for security issues, bugs, and performance optimization.
- **AI Mind Mapper**: Organizes topics into visual indented hierarchy trees and outlines.

### 🛠️ Developer Tools Suite (30 Tools Total)
DomoDomo includes a comprehensive suite of offline developer utilities (beautifiers, encoders, generators, testers), plus **10 brand-new advanced tools** added to the line-up:
- **JWT Generator & Signer**: Create, sign, and verify JWT tokens locally using WebCrypto HS256.
- **Text Case Converter**: Convert text identifier cases between camel, Pascal, snake, kebab, CONSTANT, title, sentence, slug, toggle, and dot styles.
- **URL & Query String Parser**: Parse, edit query parameters, and validate URL paths in real-time.
- **CSS Flexbox & Grid Playground**: Interactive layout simulator to build and customize CSS flexbox/grid containers.
- **JS Code Sandbox & Console**: Run ES6 scripts in a sandboxed execution context with performance benchmarking.
- **Docker Compose Builder**: Visually configure service images, port/volume mappings, and download yml configurations.
- **SVG Optimizer & Editor**: Compress vector graphics size, override stroke/fill colors, and preview XML updates.
- **HTTP Header Inspector**: Analyze HTTP headers, audit security headers compliance scores, and compile CORS rules.
- **CIDR Subnet & Socket Calculator**: IPv4 subnet mask address calculator, binary bits viewer, and port socket database lookup.
- **Viewport & User-Agent Tester**: Simulate device screen views, check responsive breakpoints, and calculate download speeds.

### Direct Downloader & Stream Reader
When running locally, DomoDomo detects your system specifications (CPU threads and system RAM) using browser detection APIs to recommend the optimal LLM (e.g., `llama3.2:1b` for medium setups, `qwen2.5:0.5b` for low specs). You can download these models with a single click in the UI via the Fetch Stream Reader API which updates a live progress bar.

### CORS Setup
Ollama blocks browser origins by default. To connect DomoDomo to your local Ollama runtime, configure the `OLLAMA_ORIGINS` environment variable before starting the application:

#### macOS
```bash
launchctl setenv OLLAMA_ORIGINS "*"
# Restart the Ollama application afterward
```

#### Windows
1. Open **System Environment Variables**.
2. Add a new variable named `OLLAMA_ORIGINS` with the value `*`.
3. Restart the Ollama application from your system tray.

#### Linux
```bash
systemctl edit ollama.service
# Add under the [Service] section:
# Environment="OLLAMA_ORIGINS=*"
# Restart daemon and service:
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

---

## 💻 Local Installation

Get DomoDomo running locally in less than 2 minutes:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/darknecrocities/DomoDomo---All-in-one-Tool.git
   cd DomoDomo---All-in-one-Tool
   ```

2. **Install node dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

> [!NOTE]
> Running `npm run dev` automatically invokes a Python virtual environment controller. The system will detect your system's Python installation, configure a isolated `.venv/` virtualenv if it is missing, verify and install requirements from `backend/requirements.txt` dynamically if updated, and launch the Vite client, local MCP server, and FastAPI backend concurrently.

4. **Build for production & Prerender**:
   ```bash
   npm run build
   ```
   *Compiles strict type-checking checks, bundles static client assets, generates site maps, and prerenders static snapshots for all 377 tool variations.*

---

## 🐳 Docker Installation

There are two ways to run DomoDomo via Docker:

### Option A: Quick Start (No Cloning Required)
If you just want to run the app immediately without saving generated files to your local hard drive, you can pull and run the image directly:

```bash
docker run -d --name domodomo -p 5173:5173 -p 8000:8000 ghcr.io/darknecrocities/domodomo---all-in-one-tool:main
```
*Access the app at `http://localhost:5173`.*

### Option B: Persistent Setup (Cloning Required)
If you want files generated by the AI tools (like `domodomo_knowledge.json`) to automatically sync and save to your computer, use Docker Compose:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/darknecrocities/DomoDomo---All-in-one-Tool.git
   cd DomoDomo---All-in-one-Tool
   ```

2. **Start using Docker Compose**:
   ```bash
   cd docker
   docker compose up -d
   ```
   *This maps the container's output back to your local folder so files are permanently saved!*

3. **Rebuild/Update the Image** (after pulling latest code):
   ```bash
   docker compose up --build -d
   ```

---

## 📄 License
This project is licensed under the MIT License.
