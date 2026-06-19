# 🐼 DomoDomo — All-in-One Local Toolbox

DomoDomo is a 100% client-side, offline-first web utility application. Built as a high-performance, private, zero-server architecture toolbox, all operations run completely inside your browser sandbox. Your data, images, PDFs, and files never leave your computer—no servers, no APIs, and no external clouds are ever touched.

---

## 🛠️ Tech Stack & Core Libraries

DomoDomo is engineered using modern, lightweight frontend technologies to ensure security, native speed, and fully offline operation.

### Core Stack
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vite.dev/) (For ultra-fast Hot Module Replacement and bundler efficiency)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strictly typed code configuration)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/) (Fluid utilities matching the custom Panda Green aesthetic `#4E8E5E`)
- **Routing**: [React Router v7](https://reactrouter.com/) (Single Page Navigation)

### Utility & Processing Libraries
- **[`pdf-lib`](https://pdf-lib.js.org/)**: Standard client-side parser to merge, split, encrypt, watermark, and modify PDF byte arrays directly in the browser.
- **[`qrcode`](https://www.npmjs.com/package/qrcode)**: Handles rendering of custom QR codes, vCards, event coordinates, and network configuration sheets.
- **[`lucide-react`](https://lucide.dev/)**: Dynamic SVG iconography across all 90 modular tools.
- **Canvas / WebAPIs**: Low-level browser graphic layers utilized for chroma key background removal, crop/rotate, bilinear/bicubic image upscaling, palette extractors, and live compression ratios.

---

## 🚀 Key Features

- **90 Specialized Tools** across 9 categories (Photo, PDF, Document, Converter, QR/Barcode, Video, Audio, Dev Utilities, Local AI Helpers).
- **Zero Server Overhead**: Fast, secure processing on your local CPU/GPU using modern WebAssembly, Canvas, and Web Worker APIs.
- **Secure Sandboxing**: Complete privacy. Since there is no database or cloud storage connection, your assets remain private and safe.

---

## 💻 Local Installation

Get DomoDomo running locally in less than 2 minutes:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/darknecrocities/DomoDomo---All-in-one-Tool.git
   cd DomoDomo---All-in-one-Tool
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📄 License
This project is licensed under the MIT License.
