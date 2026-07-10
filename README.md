# 🐼 DomoDomo — All-in-One Local Toolbox

DomoDomo is a 100% client-side, offline-first web utility application. Built as a high-performance, private, zero-server architecture toolbox, all operations run completely inside your browser sandbox. Your data, images, PDFs, and files never leave your computer—no servers, no APIs, and no external clouds are ever touched.

[👥 View Contributors](CONTRIBUTORS.md) | [🛠️ Contributing Guidelines](CONTRIBUTING.md)

---
## 🛠️ Codebase Architecture & Design Philosophy

DomoDomo operates on a **zero-leak mandate**. Standard SaaS utilities require uploading sensitive business contracts or personal photos to remote cloud servers. DomoDomo compiles and processes all assets locally on your CPU/GPU using modern browser sandboxing.

### Component-Based Architecture
- **`/src/engine`**: Contains the core registry (`registry.ts`) registering all 100 functional tools.
- **`/src/pages`**: Handles routing, the primary tool frame containers, and the main visual dashboard.
- **`/src/tools`**: Categorized directory holding React/TypeScript components for all utility modules.
- **`/src/utils`**: Core service files containing brand tokens, helpers, and singleton API layers.
- **`/backend`**: FastAPI Python server providing local persistence, vector searches, and caching.

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
4. **Adaptive Model recommendation Engine**:
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

### AI, Machine Learning & Local Models
- **Generative LLMs (Ollama Integration)**: Supports various models like `llama3.2:1b` (recommended for medium setups), `qwen2.5:0.5b` (for low specs), and `deepseek-coder` for code generation. Operations happen locally on port `11434`.
- **Text Classification & Embeddings**: Uses [Transformers.js (`@xenova/transformers`)](https://huggingface.co/docs/transformers.js) executing inside the browser via WebAssembly.
  - **Models utilized**: `all-MiniLM-L6-v2` for semantic search/embeddings and `distilbert` for text classification.
- **Facial Recognition & Tracking**: Utilizes [MediaPipe Tasks Vision](https://developers.google.com/mediapipe) loaded dynamically via CDN.
  - **Models utilized**: `blaze_face_short_range.tflite` for real-time video face detection and auto-blurring. GPU-accelerated via WebGL.
- **Optical Character Recognition (OCR)**: [Tesseract.js](https://tesseract.projectnaptha.com/) running via WebAssembly to extract text from images natively.

### Media & Document Processing Engine
- **Video & Audio Processing**:
  - [FFmpeg.wasm](https://ffmpegwasm.netlify.app/): WebAssembly port of FFmpeg enabling local video cropping, trimming, subtitle hardcoding, and audio extraction.
  - **Web Audio API**: Native operating system audio synthesis, recording, visual frequency parsing, and speed modulation.
- **PDF Manipulation & Security**:
  - [pdf-lib](https://pdf-lib.js.org/): Client-side parser to merge, split, watermark, compress, and modify PDF byte arrays.
  - [pdfjs-dist](https://mozilla.github.io/pdf.js/): Mozilla's core library for rendering PDF documents into Canvas/HTML elements natively.
  - [@pdfsmaller/pdf-encrypt](https://www.npmjs.com/package/@pdfsmaller/pdf-encrypt): Local utility enabling client-side password encryption (AES) and permission restrictions on PDF exports.
- **Image & Photo Utilities**:
  - [exifr](https://mutiny.cz/exifr/): High-performance, memory-efficient EXIF parser to read/strip metadata from photos.
  - **Canvas API**: Extensive use of the HTML5 Canvas for collage making, image compression, format conversion (WebP/JPG/PNG), and pixel manipulations.

### Barcode & Networking Tools
- **QR Code & Barcode**: 
  - [qrcode](https://www.npmjs.com/package/qrcode): Used for rendering and generating styled QR codes.
  - [jsqr](https://github.com/cozmo/jsQR): Native JavaScript library for scanning and decoding QR codes from camera feeds.
- **Local Storage & Caching**: IndexedDB and localStorage persistent browser cache allowing high-performance sandbox operations, large file handling, and API rate-limit caching without server bloat.

---

## 🤖 Local Ollama Integration & Domo Agent Hub

To ensure complete privacy without external API subscription costs, DomoDomo integrates directly with local **Ollama** runtimes on `http://localhost:11434`.

### 🧠 Domo Agent Hub & Multi-Agent Orchestrator
The Domo Agent Hub is a local-first custom IDE workspace that hooks directly to your local folders using browser file system handles. It is designed specifically for users who want a lightweight coding, rapid debugging, and streamlined environment without the heavy complexity and bloat of traditional setups.
- **Multi-Agent Orchestrator:** Configure, name, and assign distinct LLM models to multiple specialized agent personas (e.g., Domo Architect, Domo Hacker, Domo Auditor) to work simultaneously or sequentially.
  - *Sequential Chain:* Flows agent outputs downstream as context to the next agent (optimal for low VRAM specs).
  - *Parallel Evaluation:* Processes agent responses concurrently to compare perspectives.
- **Debounced Autosave & Auto-write:** Includes automatic saving as you edit files, and an optional auto-write compiler that automatically writes generated agent artifacts straight to your mounted directory.
- **Live Coding simulation:** Offers a visual typing simulation of generated code that can be toggled on/off to display output instantly.
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
