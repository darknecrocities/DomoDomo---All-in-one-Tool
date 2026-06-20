import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Cpu, Shield, Terminal, Settings, GitBranch, Lock, Server, Layers } from 'lucide-react';

type SectionId = 'intro' | 'sys-archi' | 'offline-flow' | 'tools-ref' | 'setup-guide' | 'core-engines' | 'compliance';
type ToolCategory = 'pdf' | 'photo' | 'document' | 'converter' | 'qr' | 'video' | 'audio' | 'dev' | 'ai';

interface ToolDoc {
  id: string;
  name: string;
  engine: string;
  details: string;
}

const TOOLS_DOCS: Record<ToolCategory, { title: string; desc: string; list: ToolDoc[] }> = {
  pdf: {
    title: 'PDF Document Suite',
    desc: 'Local browser compilation of vector documents, overlays, signature drawing, and text manipulation.',
    list: [
      { id: 'pdf-text-edit', name: 'Edit PDF Text', engine: 'PDF.js + Canvas2D Layering', details: 'Draws interactive form inputs over PDF text coordinates, allowing users to modify or replace characters before compiling changes into standard PDF bytes.' },
      { id: 'pdf-merge', name: 'Merge PDFs', engine: 'pdf-lib (WASM Compiler)', details: 'Combines multiple PDF document ArrayBuffers client-side, compiling a unified page registry in seconds.' },
      { id: 'pdf-split', name: 'Split PDF', engine: 'pdf-lib (WASM Compiler)', details: 'Extracts pages from a source PDF ArrayBuffer and outputs separate document blobs without server calls.' },
      { id: 'pdf-compress', name: 'Compress PDF', engine: 'pdf-lib Optimization API', details: 'Shrinks PDF file sizes by compressing page streams, removing redundant XML metadata and structural headers.' },
      { id: 'pdf-to-img', name: 'PDF → Image', engine: 'PDF.js Render Target', details: 'Renders PDF pages onto an HTML5 Canvas container, exporting high-resolution PNG data URLs.' },
      { id: 'img-to-pdf', name: 'Image → PDF', engine: 'pdf-lib Image Embedder', details: 'Embeds PNG/JPG graphics directly into new PDF page dimensions in the browser.' },
      { id: 'pdf-watermark', name: 'Add Watermark', engine: 'pdf-lib Text overlays', details: 'Draws transparent text strings on page vector layers at configured coordinates.' },
      { id: 'pdf-sign', name: 'Sign PDF', engine: 'pdf-lib Graphics Context', details: 'Overlays a vector canvas containing hand-drawn signature coordinates directly onto PDF streams.' },
      { id: 'pdf-protect', name: 'Protect PDF', engine: 'pdf-lib Encryption Standard', details: 'Encrypts the PDF catalog using client-side password locks and usage permissions.' },
      { id: 'pdf-ocr', name: 'Extract Text (OCR)', engine: 'pdf-lib Stream Parser', details: 'Scans vector streams on selected pages to parse and extract text strings.' }
    ]
  },
  photo: {
    title: 'Photo & Image Suite',
    desc: 'Client-side raster image filtering, transformations, background removal, and dimension adjustments.',
    list: [
      { id: 'background-remover', name: 'Background Remover', engine: 'Canvas2D Pixel Matching', details: 'Analyzes image pixel arrays to locate and transparentize background color ranges.' },
      { id: 'image-resizer', name: 'Image Resizer', engine: 'Canvas scaling algorithm', details: 'Resamples image coordinates to user-specified width and height values.' },
      { id: 'image-compressor', name: 'Image Compressor', engine: 'Canvas JPEG encoder', details: 'Quantizes image color values using custom quality ratios to output smaller JPG files.' },
      { id: 'crop-rotate', name: 'Crop & Rotate Tool', engine: 'Canvas coordinate matrices', details: 'Crops or rotates images using 2D transform matrices in memory.' },
      { id: 'ai-enhancer', name: 'AI Image Enhancer', engine: 'Canvas ImageData filter', details: 'Applies local contrast, gamma correction, and color matrix transformations to raw image pixels.' },
      { id: 'watermark-tool', name: 'Watermark Tool', engine: 'Canvas layering system', details: 'Draws watermark images or text layers over custom positions with opacity settings.' },
      { id: 'image-upscaler', name: 'Image Upscaler', engine: 'Canvas bilinear interpolation', details: 'Upscales image dimensions using browser-native bilinear or bicubic rendering algorithms.' },
      { id: 'palette-extractor', name: 'Color Palette Extractor', engine: 'Canvas pixel grouping', details: 'Samples image pixels to extract dominant colors and compile hex palettes.' },
      { id: 'collage-maker', name: 'Collage Maker', engine: 'Canvas grid composite', details: 'Draws multiple input images onto a configured collage template grid.' },
      { id: 'format-converter', name: 'Format Converter', engine: 'Canvas toBlob API', details: 'Decodes images and exports them as PNG, JPEG, or WebP formats.' }
    ]
  },
  document: {
    title: 'Document Suite',
    desc: 'Local text editors, document template generators, academic citations, and dictionaries.',
    list: [
      { id: 'rich-text', name: 'Rich Text Editor', engine: 'HTML5 contentEditable API', details: 'Enables rich text document editing and exports files locally as TXT or HTML.' },
      { id: 'markdown-editor', name: 'Markdown Editor', engine: 'Markdown parse compiler', details: 'Translates Markdown headers and lists to styled HTML nodes in real-time.' },
      { id: 'ocr-scanner', name: 'OCR Scanner', engine: 'Canvas character recognition', details: 'Parses text characters from uploaded raster screenshots offline.' },
      { id: 'resume-builder', name: 'Resume Builder', engine: 'Local template parser', details: 'Takes template data and compiles a clean, standardized developer CV.' },
      { id: 'invoice-gen', name: 'Invoice Generator', engine: 'Local format templates', details: 'Computes line item amounts and formats printable business invoices.' },
      { id: 'summarizer', name: 'Summarizer', engine: 'Client text extraction parser', details: 'Uses client heuristics to pull key sentences and headings from text.' },
      { id: 'translator', name: 'Translator', engine: 'Static dictionary mapping', details: 'Translates common words and structures using local dictionary arrays.' },
      { id: 'grammar-fixer', name: 'Grammar Fixer', engine: 'Regex matching rules', details: 'Highlights spelling and grammar issues based on standard language rules.' },
      { id: 'citation-gen', name: 'Citation Generator', engine: 'APA/MLA/Chicago standardizer', details: 'Generates citations for academic papers, articles, and websites.' },
      { id: 'code-notes', name: 'Code Notes Editor', engine: 'Custom Code highlighting', details: 'Renders code panels with basic line numbering for developer logging.' }
    ]
  },
  converter: {
    title: 'Converter Suite',
    desc: 'File format conversions, e-book compiles, Base64 translations, and ZIP archive extraction.',
    list: [
      { id: 'jpg-png', name: 'JPG ↔ PNG Converter', engine: 'Canvas toBlob API', details: 'Decodes JPG images and compiles them as PNGs, and vice versa.' },
      { id: 'webp-jpg', name: 'WebP ↔ JPG Converter', engine: 'Canvas decoding context', details: 'Converts modern WebP images to standard JPEG formats.' },
      { id: 'mp4-gif', name: 'MP4 ↔ GIF Converter', engine: 'HTML5 Video + GIF encoder', details: 'Unpacks video frames in sequence and encodes them as a GIF loop.' },
      { id: 'mp3-wav', name: 'MP3 ↔ WAV Converter', engine: 'Web Audio AudioContext', details: 'Converts compressed MP3 streams to raw WAV PCM channels.' },
      { id: 'csv-json', name: 'CSV ↔ JSON Converter', engine: 'Structured string parser', details: 'Converts comma-separated spreadsheet data into JSON arrays, and vice versa.' },
      { id: 'xml-json', name: 'XML ↔ JSON Converter', engine: 'Browser DOMParser API', details: 'Parses XML tags and nests them into JSON tree structures.' },
      { id: 'docx-txt', name: 'DOCX ↔ TXT Converter', engine: 'JSZip XML extractor', details: 'Extracts plain text XML from word document ZIP wrappers.' },
      { id: 'epub-pdf', name: 'EPUB → PDF Converter', engine: 'pdf-lib formatting', details: 'Converts EPUB ebook content into PDF pages.' },
      { id: 'base64-tool', name: 'Base64 Converter', engine: 'window.atob / window.btoa', details: 'Encodes text and files into base64 strings or decodes them back to binary.' },
      { id: 'zip-extractor', name: 'ZIP Extractor', engine: 'JSZip Decompressor', details: 'Unpacks ZIP files and lists content directories offline.' }
    ]
  },
  qr: {
    title: 'QR & Barcode Suite',
    desc: 'Visual matrix generators, contactless payment codes, WiFi tags, and webcam scanners.',
    list: [
      { id: 'qr-generator', name: 'QR Code Generator', engine: 'qrcode canvas renderer', details: 'Renders QR codes for links, text, and custom payloads.' },
      { id: 'qr-scanner', name: 'QR Scanner', engine: 'WebRTC stream + jsQR library', details: 'Captures camera frames and decodes QR codes offline.' },
      { id: 'wifi-qr', name: 'WiFi QR Generator', engine: 'qrcode tag formatter', details: 'Encodes network identifiers and passwords into scan-to-connect QR codes.' },
      { id: 'vcard-qr', name: 'vCard QR Generator', engine: 'qrcode contact parser', details: 'Encodes corporate contact cards (vCard format) into QR codes.' },
      { id: 'event-qr', name: 'Event QR Generator', engine: 'qrcode calendar standard', details: 'Encodes event details and schedules for calendar integration.' },
      { id: 'payment-qr', name: 'Payment QR Generator', engine: 'qrcode banking protocols', details: 'Encodes payment parameters for banking applications.' },
      { id: 'barcode-gen', name: 'Barcode Generator', engine: 'JsBarcode SVG generator', details: 'Generates Code128, EAN, and UPC barcodes.' },
      { id: 'barcode-scan', name: 'Barcode Scanner', engine: 'WebRTC camera + barcode parser', details: 'Scans and decodes barcode symbols using the camera.' },
      { id: 'bulk-qr', name: 'Bulk QR Generator', engine: 'qrcode bulk processor', details: 'Generates a batch of QR codes from CSV rows.' },
      { id: 'qr-designer', name: 'QR Designer', engine: 'qrcode customizable grids', details: 'Generates custom QR codes with color gradients and logo inserts.' }
    ]
  },
  video: {
    title: 'Video Suite',
    desc: 'Local browser video trimming, container changes, subtitles injection, and frame exports.',
    list: [
      { id: 'trim-video', name: 'Trim Video', engine: 'WASM video processor', details: 'Clips video segments between custom timestamps.' },
      { id: 'compress-video', name: 'Compress Video', engine: 'WASM video compression', details: 'Reduces video file sizes by adjusting quality levels.' },
      { id: 'merge-videos', name: 'Merge Videos', engine: 'WASM video concatenator', details: 'Merges multiple video files together in sequence.' },
      { id: 'convert-video', name: 'Convert Video', engine: 'WASM container exporter', details: 'Converts video container formats.' },
      { id: 'extract-audio', name: 'Extract Audio', engine: 'Audio track demuxer', details: 'Strips audio tracks from video files.' },
      { id: 'add-subtitles', name: 'Add Subtitles', engine: 'WASM text burning', details: 'Burns subtitle overlay files directly onto video streams.' },
      { id: 'speed-control', name: 'Speed Control', engine: 'WASM playback rate changer', details: 'Speeds up or slows down video playback.' },
      { id: 'crop-video', name: 'Crop Video', engine: 'WASM layout cropper', details: 'Crops video dimensions to square or wide ratios.' },
      { id: 'gif-maker', name: 'GIF Maker', engine: 'WASM frame animation', details: 'Converts video segments into animated GIF loops.' },
      { id: 'thumbnail-gen', name: 'Thumbnail Generator', engine: 'HTML5 Video frames capture', details: 'Captures frames from video files as JPEG images.' }
    ]
  },
  audio: {
    title: 'Audio Suite',
    desc: 'Sound wave editing, decibel amplification, voice recorders, and real-time visualizers.',
    list: [
      { id: 'audio-cutter', name: 'Audio Cutter', engine: 'Web Audio AudioContext', details: 'Cuts audio files using start and end timestamps.' },
      { id: 'audio-merge', name: 'Audio Merge', engine: 'AudioBuffer merging', details: 'Joins multiple audio files together.' },
      { id: 'noise-removal', name: 'Noise Removal', engine: 'Web Audio low/high pass filters', details: 'Filters background hiss and noise from audio.' },
      { id: 'audio-convert', name: 'Convert Audio', engine: 'Web Audio export formats', details: 'Converts audio files between MP3 and WAV.' },
      { id: 'voice-recorder', name: 'Voice Recorder', engine: 'MediaRecorder API', details: 'Records audio from microphones and downloads it.' },
      { id: 'speech-to-text', name: 'Speech-to-Text', engine: 'Web Speech Recognition API', details: 'Transcribes spoken audio into text.' },
      { id: 'tts-fallback', name: 'Text-to-Speech', engine: 'Web SpeechSynthesis API', details: 'Synthesizes text into spoken audio.' },
      { id: 'volume-booster', name: 'Volume Booster', engine: 'GainNode amplification', details: 'Amplifies audio volume levels.' },
      { id: 'podcast-editor', name: 'Podcast Editor', engine: 'Multi-track AudioBuffer mixer', details: 'Mixes vocal recordings with background music.' },
      { id: 'audio-visualizer', name: 'Audio Visualizer', engine: 'AnalyserNode rendering', details: 'Renders real-time visual frequency bars.' }
    ]
  },
  dev: {
    title: 'Developer Utilities',
    desc: 'Formatters, token decoders, random key generators, SHA hashing, and URL parameters.',
    list: [
      { id: 'json-format', name: 'JSON Formatter', engine: 'JSON parsing libraries', details: 'Beautifies, checks, and validates JSON structures.' },
      { id: 'jwt-decode', name: 'JWT Decoder', engine: 'Base64URL decoding context', details: 'Decodes JWT header and payload details client-side.' },
      { id: 'dev-base64', name: 'Base64 Tool', engine: 'window.atob / window.btoa', details: 'Encodes and decodes base64 strings.' },
      { id: 'regex-tester', name: 'Regex Tester', engine: 'RegExp test & match APIs', details: 'Tests regular expressions against matching strings.' },
      { id: 'uuid-gen', name: 'UUID Generator', engine: 'crypto.randomUUID API', details: 'Generates unique random UUIDv4 keys.' },
      { id: 'hash-gen', name: 'Hash Generator', engine: 'WebCrypto SubtleCrypto digest', details: 'Generates SHA-256 hashes of text strings.' },
      { id: 'api-tester', name: 'API Tester', engine: 'fetch request client', details: 'Sends HTTP requests to local API endpoints.' },
      { id: 'url-encoder', name: 'URL Encoder', engine: 'encodeURIComponent / decodeURIComponent', details: 'Encodes or decodes URL parameter values.' },
      { id: 'html-minify', name: 'HTML Minifier', engine: 'Regex minification', details: 'Minifies HTML code strings.' },
      { id: 'color-converter', name: 'Color Converter', engine: 'Color space conversion formulas', details: 'Converts hex values to RGB, HSL, and CMYK.' }
    ]
  },
  ai: {
    title: 'Local AI Suite',
    desc: 'Local model connection pipelines, summarization, OCR formatters, and translation.',
    list: [
      { id: 'ai-chat', name: 'AI Chat', engine: 'Ollama client API connection', details: 'Connects to locally running LLMs for private chat.' },
      { id: 'ai-summarizer', name: 'Summarizer', engine: 'Ollama text summarization models', details: 'Summarizes long text documents using local models.' },
      { id: 'caption-gen', name: 'Caption Generator', engine: 'Ollama vision models', details: 'Generates descriptive captions for uploaded images.' },
      { id: 'ocr-assistant', name: 'OCR Assistant', engine: 'Ollama formatting models', details: 'Formats raw OCR text output into clean layouts.' },
      { id: 'prompt-enhancer', name: 'Prompt Enhancer', engine: 'Ollama prompt expansion models', details: 'Enhances simple prompts into detailed descriptions.' },
      { id: 'image-classifier', name: 'Image Classifier', engine: 'Ollama classification models', details: 'Classifies objects in images locally.' },
      { id: 'text-rewriter', name: 'Text Rewriter', engine: 'Ollama rewriter models', details: 'Rewrites text in professional, casual, or concise tones.' },
      { id: 'ai-translator', name: 'Translator', engine: 'Ollama translation models', details: 'Translates text between languages locally.' },
      { id: 'ai-stt', name: 'Speech-to-Text', engine: 'Ollama audio transcription models', details: 'Transcribes audio recordings locally.' },
      { id: 'semantic-search', name: 'Semantic Search', engine: 'Ollama text embedding models', details: 'Indexes and searches documents using similarity matching.' }
    ]
  }
};

export const Documentation = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SectionId>('intro');
  const [activeToolCategory, setActiveToolCategory] = useState<ToolCategory>('pdf');

  const menuItems = [
    { id: 'intro', label: 'Introduction', icon: BookOpen },
    { id: 'sys-archi', label: 'System Architecture', icon: GitBranch },
    { id: 'offline-flow', label: 'Offline Flowchart', icon: Cpu },
    { id: 'tools-ref', label: 'Tools Reference', icon: Layers },
    { id: 'setup-guide', label: 'Setup & Install', icon: Terminal },
    { id: 'core-engines', label: 'Core Web Engines', icon: Settings },
    { id: 'compliance', label: 'Security & Compliance', icon: Shield },
  ] as const;

  return (
    <div className="flex flex-col gap-8 text-left">
      {/* Docs Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-[#2A2D30]">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#72706C] uppercase tracking-wider">
            <span>DomoDomo Hub</span>
            <span>/</span>
            <span className="text-[#A3A09B]">Documentation</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#ECEBE9] font-heading tracking-tight mt-1">
            Technical Specification & Guides
          </h1>
          <p className="text-[#A3A09B] text-sm max-w-2xl leading-relaxed">
            Understand how DomoDomo executes complex file modifications, neural queries, and compression pipelines locally inside your browser sandbox.
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="btn-secondary py-2 px-4 text-xs font-bold shrink-0"
        >
          <ArrowLeft size={14} />
          <span>Dashboard</span>
        </button>
      </div>

      {/* Docs Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar Keywords */}
        <div className="lg:col-span-3 flex flex-col gap-2 bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl lg:sticky lg:top-24">
          <span className="text-[10px] uppercase tracking-wider text-[#72706C] font-bold px-3 mb-2 block">Keywords & Topics</span>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all ${
                  isActive
                    ? 'bg-[#3C6B4D]/10 text-[#ECEBE9] border border-[#3C6B4D]/40'
                    : 'text-[#A3A09B] hover:text-[#ECEBE9] hover:bg-[#111213] border border-transparent'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-[#3C6B4D]' : 'text-[#72706C]'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Content Pane */}
        <div className="lg:col-span-9 bg-[#18191B] border border-[#2A2D30] p-6 md:p-8 rounded-3xl min-h-[550px] flex flex-col gap-6">
          {activeSection === 'intro' && (
            <div className="flex flex-col gap-5">
              <h2 className="text-xl font-bold text-[#ECEBE9] border-b border-[#2A2D30] pb-3">Introduction</h2>
              <p className="text-[#A3A09B] text-xs md:text-sm leading-relaxed">
                DomoDomo is designed as a **Local-First Web Workshop**. Unlike typical SaaS productivity tools that process your media assets, documents, and private credentials on remote cloud servers, DomoDomo compiles and executes all operations client-side inside the user's browser sandbox.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="bg-[#111213] border border-[#2A2D30] p-4 rounded-xl">
                  <h3 className="text-[#3C6B4D] font-bold text-xs mb-1 uppercase tracking-wide">Device Privacy</h3>
                  <p className="text-[#A3A09B] text-[11px] leading-relaxed">
                    Zero data packets representing your documents or input coordinates leave your local device. Work on sensitive company datasets or credentials with complete peace of mind.
                  </p>
                </div>
                <div className="bg-[#111213] border border-[#2A2D30] p-4 rounded-xl">
                  <h3 className="text-[#3C6B4D] font-bold text-xs mb-1 uppercase tracking-wide">Offline Native</h3>
                  <p className="text-[#A3A09B] text-[11px] leading-relaxed">
                    The entire dashboard compiles down to client assets. Once cached, the application functions fully with no internet connections or router access.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'sys-archi' && (
            <div className="flex flex-col gap-5">
              <h2 className="text-xl font-bold text-[#ECEBE9] border-b border-[#2A2D30] pb-3">System Architecture</h2>
              <p className="text-[#A3A09B] text-xs md:text-sm leading-relaxed">
                DomoDomo operates within a **sandboxed container namespace** provided by modern web browser security engines. The diagram below illustrates the relationship between components:
              </p>

              {/* Architecture SVG diagram */}
              <div className="bg-[#111213] border border-[#2A2D30] p-6 rounded-2xl flex items-center justify-center overflow-x-auto">
                <svg width="600" height="260" viewBox="0 0 600 260" fill="none" className="min-w-[500px]">
                  {/* Browser Sandbox Frame */}
                  <rect x="10" y="10" width="580" height="240" rx="12" fill="#18191B" stroke="#2A2D30" strokeWidth="2" />
                  <text x="30" y="32" fill="#72706C" fontSize="10" fontFamily="monospace" fontWeight="bold">BROWSER SANDBOX (ISOLATED CLIENT NODE)</text>

                  {/* Input Source */}
                  <rect x="30" y="80" width="100" height="50" rx="8" fill="#111213" stroke="#2A2D30" />
                  <text x="80" y="105" fill="#ECEBE9" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">User Files</text>
                  <text x="80" y="120" fill="#72706C" fontSize="8" fontFamily="monospace" textAnchor="middle">File / Image Blobs</text>

                  {/* Arrow 1 */}
                  <path d="M130 105 H180" stroke="#3C6B4D" strokeWidth="2" markerEnd="url(#arrow)" />

                  {/* Memory Iframe Cache */}
                  <rect x="180" y="60" width="240" height="90" rx="8" fill="#111213" stroke="#3C6B4D" strokeWidth="1.5" />
                  <text x="300" y="85" fill="#ECEBE9" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">DomoDomo Engines</text>
                  <text x="300" y="102" fill="#3C6B4D" fontSize="9" fontFamily="monospace" textAnchor="middle">IndexedDB / Memory Cache</text>
                  <text x="300" y="122" fill="#A3A09B" fontSize="9" fontFamily="sans-serif" textAnchor="middle">WASM Runtimes & Canvas</text>
                  <text x="300" y="137" fill="#E29E2D" fontSize="8" fontFamily="monospace" textAnchor="middle">WebGPU (LLM Queries)</text>

                  {/* Arrow 2 */}
                  <path d="M420 105 H470" stroke="#3C6B4D" strokeWidth="2" markerEnd="url(#arrow)" />

                  {/* Local compilation output */}
                  <rect x="470" y="80" width="100" height="50" rx="8" fill="#111213" stroke="#2A2D30" />
                  <text x="520" y="105" fill="#ECEBE9" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Output Buffers</text>
                  <text x="520" y="120" fill="#72706C" fontSize="8" fontFamily="monospace" textAnchor="middle">ArrayBuffer Stream</text>

                  {/* Arrow 3 */}
                  <path d="M570 105" stroke="#3C6B4D" strokeWidth="2" markerEnd="url(#arrow)" />

                  {/* Bottom blocked Cloud server */}
                  <rect x="190" y="185" width="220" height="40" rx="8" fill="#111213" stroke="#E29E2D" strokeDasharray="4 4" />
                  <path d="M205 205 L215 215 M215 205 L205 215" stroke="#E29E2D" strokeWidth="2" />
                  <text x="310" y="208" fill="#E29E2D" fontSize="10" fontFamily="sans-serif" fontWeight="bold">NO OUTBOUND WAN TRAFFIC</text>

                  {/* Markers definition */}
                  <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#3C6B4D" />
                    </marker>
                  </defs>
                </svg>
              </div>
            </div>
          )}

          {activeSection === 'offline-flow' && (
            <div className="flex flex-col gap-5">
              <h2 className="text-xl font-bold text-[#ECEBE9] border-b border-[#2A2D30] pb-3">Offline Flowchart</h2>
              <p className="text-[#A3A09B] text-xs md:text-sm leading-relaxed">
                This flowchart visualizes the sequence of events executed during local file operations (e.g. compressing a PDF, resizing an image, or generating code blocks):
              </p>

              {/* Flowchart SVG */}
              <div className="bg-[#111213] border border-[#2A2D30] p-6 rounded-2xl flex items-center justify-center overflow-x-auto">
                <svg width="600" height="420" viewBox="0 0 600 420" fill="none" className="min-w-[500px]">
                  {/* Step 1 */}
                  <rect x="200" y="10" width="200" height="45" rx="8" fill="#18191B" stroke="#2A2D30" />
                  <text x="300" y="36" fill="#ECEBE9" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="semibold">1. Input File Selected</text>
                  <path d="M300 55 V90" stroke="#2A2D30" strokeWidth="1.5" markerEnd="url(#flow-arrow)" />

                  {/* Step 2 */}
                  <rect x="200" y="90" width="200" height="45" rx="8" fill="#18191B" stroke="#2A2D30" />
                  <text x="300" y="116" fill="#ECEBE9" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="semibold">2. Parsed into File Blob</text>
                  <path d="M300 135 V170" stroke="#2A2D30" strokeWidth="1.5" markerEnd="url(#flow-arrow)" />

                  {/* Step 3 */}
                  <polygon points="300,170 420,195 300,220 180,195" fill="#18191B" stroke="#3C6B4D" strokeWidth="1.5" />
                  <text x="300" y="199" fill="#ECEBE9" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">3. Network Call?</text>
                  
                  {/* Yes Branch */}
                  <path d="M420 195 H500 V240" stroke="#E29E2D" strokeWidth="1.5" markerEnd="url(#flow-arrow)" />
                  <text x="455" y="185" fill="#E29E2D" fontSize="10" fontFamily="sans-serif" fontWeight="bold">Yes</text>
                  <rect x="425" y="240" width="150" height="45" rx="8" fill="#18191B" stroke="#E29E2D" />
                  <text x="500" y="266" fill="#E29E2D" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="semibold">Operation Blocked</text>

                  {/* No Branch */}
                  <path d="M300 220 V260" stroke="#3C6B4D" strokeWidth="1.5" markerEnd="url(#flow-arrow)" />
                  <text x="315" y="240" fill="#3C6B4D" fontSize="10" fontFamily="sans-serif" fontWeight="bold">No</text>
                  
                  {/* Step 4 */}
                  <rect x="185" y="260" width="230" height="45" rx="8" fill="#18191B" stroke="#3C6B4D" strokeWidth="1.5" />
                  <text x="300" y="286" fill="#ECEBE9" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="semibold">4. Sandboxed Compilation</text>
                  <path d="M300 305 V335" stroke="#2A2D30" strokeWidth="1.5" markerEnd="url(#flow-arrow)" />

                  {/* Step 5 */}
                  <rect x="200" y="335" width="200" height="45" rx="22" fill="#3C6B4D" />
                  <text x="300" y="361" fill="#ECEBE9" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">5. Local Download Triggered</text>

                  {/* Markers definition */}
                  <defs>
                    <marker id="flow-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#2A2D30" />
                    </marker>
                  </defs>
                </svg>
              </div>
            </div>
          )}

          {activeSection === 'tools-ref' && (
            <div className="flex flex-col gap-6">
              <h2 className="text-xl font-bold text-[#ECEBE9] border-b border-[#2A2D30] pb-3">Tools Reference Guide</h2>
              <p className="text-[#A3A09B] text-xs leading-relaxed">
                Explore technical specifications, operational execution runtimes, and local engine details for each registered tool in the workshop:
              </p>

              {/* Tools Category Mini Tabs */}
              <div className="flex flex-wrap gap-2 border-b border-[#2A2D30]/65 pb-3">
                {Object.entries(TOOLS_DOCS).map(([key, data]) => (
                  <button
                    key={key}
                    onClick={() => setActiveToolCategory(key as ToolCategory)}
                    className={`py-1.5 px-3 rounded-lg text-[11px] font-bold transition-all border ${
                      activeToolCategory === key
                        ? 'bg-[#3C6B4D]/10 text-[#3C6B4D] border-[#3C6B4D]/25'
                        : 'bg-[#111213] text-[#72706C] border-[#2A2D30] hover:text-[#A3A09B]'
                    }`}
                  >
                    {data.title.split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* Active Category Header */}
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-[#ECEBE9] text-base">{TOOLS_DOCS[activeToolCategory].title}</h3>
                <p className="text-[#A3A09B] text-xs leading-relaxed">{TOOLS_DOCS[activeToolCategory].desc}</p>
              </div>

              {/* Tools Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {TOOLS_DOCS[activeToolCategory].list.map((tool) => (
                  <div key={tool.id} className="bg-[#111213] border border-[#2A2D30] p-4 rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-3">
                      <span className="font-bold text-[#ECEBE9] text-xs font-mono">{tool.name}</span>
                      <span className="px-2 py-0.5 bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/25 rounded text-[8px] font-mono shrink-0">
                        {tool.engine}
                      </span>
                    </div>
                    <p className="text-[#A3A09B] text-[10px] leading-relaxed">
                      {tool.details}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'setup-guide' && (
            <div className="flex flex-col gap-5">
              <h2 className="text-xl font-bold text-[#ECEBE9] border-b border-[#2A2D30] pb-3">Setup & Installation Guide</h2>
              <p className="text-[#A3A09B] text-xs md:text-sm leading-relaxed">
                Run DomoDomo offline on your local network setup. This ensures that cross-origin browser queries can successfully talk to local backend services (like Ollama AI).
              </p>

              <div className="flex flex-col gap-4 text-xs">
                {/* Step 1 */}
                <div className="flex flex-col gap-2">
                  <h3 className="font-bold text-[#ECEBE9] text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#3C6B4D]/10 border border-[#3C6B4D]/30 text-[#3C6B4D] flex items-center justify-center text-xs font-mono">1</span>
                    <span>Clone & Install Dev Assets</span>
                  </h3>
                  <div className="bg-[#111213] p-4 rounded-xl border border-[#2A2D30] font-mono text-[11px] text-[#ECEBE9] relative group">
                    <pre className="overflow-x-auto">
{`git clone https://github.com/darknecrocities/DomoDomo---All-in-one-Tool.git
cd DomoDomo---All-in-one-Tool
npm install`}
                    </pre>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col gap-2 border-t border-[#2A2D30]/60 pt-4">
                  <h3 className="font-bold text-[#ECEBE9] text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#3C6B4D]/10 border border-[#3C6B4D]/30 text-[#3C6B4D] flex items-center justify-center text-xs font-mono">2</span>
                    <span>Launch Local Dev Server</span>
                  </h3>
                  <div className="bg-[#111213] p-4 rounded-xl border border-[#2A2D30] font-mono text-[11px] text-[#ECEBE9] relative group">
                    <pre className="overflow-x-auto">
{`npm run dev`}
                    </pre>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col gap-2 border-t border-[#2A2D30]/60 pt-4">
                  <h3 className="font-bold text-[#ECEBE9] text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#3C6B4D]/10 border border-[#3C6B4D]/30 text-[#3C6B4D] flex items-center justify-center text-xs font-mono">3</span>
                    <span>Configure Local Ollama AI Origins</span>
                  </h3>
                  <p className="text-[#A3A09B] text-xs leading-relaxed">
                    By default, browsers block network traffic to local ports unless appropriate Cross-Origin Resource Sharing (CORS) headers are sent. Configure the environment variable <code className="text-[#3C6B4D] font-mono">OLLAMA_ORIGINS="*"</code> before launching Ollama:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#111213] border border-[#2A2D30] p-3.5 rounded-xl">
                      <span className="text-[#E29E2D] font-bold text-[10px] uppercase tracking-wider">macOS</span>
                      <pre className="text-[10px] text-[#A3A09B] font-mono mt-1 overflow-x-auto whitespace-pre-wrap">
{`launchctl setenv OLLAMA_ORIGINS "*"`}
                      </pre>
                      <p className="text-[9px] text-[#72706C] mt-2">Restart the Ollama app afterward.</p>
                    </div>
                    <div className="bg-[#111213] border border-[#2A2D30] p-3.5 rounded-xl">
                      <span className="text-[#E29E2D] font-bold text-[10px] uppercase tracking-wider">Windows Powershell</span>
                      <pre className="text-[10px] text-[#A3A09B] font-mono mt-1 overflow-x-auto whitespace-pre-wrap">
{`[Environment]::SetEnvironmentVariable("OLLAMA_ORIGINS", "*", "User")`}
                      </pre>
                      <p className="text-[9px] text-[#72706C] mt-2">Close and re-open Ollama from taskbar tray.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'core-engines' && (
            <div className="flex flex-col gap-5">
              <h2 className="text-xl font-bold text-[#ECEBE9] border-b border-[#2A2D30] pb-3">Core Web Engines</h2>
              <p className="text-[#A3A09B] text-xs md:text-sm leading-relaxed">
                To process binaries locally in-browser without sending credentials to backends, DomoDomo utilizes several modern client-side APIs:
              </p>
              <div className="flex flex-col gap-4 text-xs">
                <div className="flex gap-4 p-4 bg-[#111213] rounded-2xl border border-[#2A2D30]">
                  <div className="p-3 bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/25 rounded-xl shrink-0 h-fit">
                    <Cpu size={20} />
                  </div>
                  <div className="flex flex-col gap-1 text-left">
                    <span className="font-bold text-[#ECEBE9] text-sm">WebAssembly Compilation (WASM)</span>
                    <span className="text-[#A3A09B] leading-relaxed">Used for complex file operations, compiling low-level byte arrays, signing documents, or evaluating PDF streams. Enables tools like `pdf-lib` to execute near native compile speeds.</span>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-[#111213] rounded-2xl border border-[#2A2D30]">
                  <div className="p-3 bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/25 rounded-xl shrink-0 h-fit">
                    <Settings size={20} />
                  </div>
                  <div className="flex flex-col gap-1 text-left">
                    <span className="font-bold text-[#ECEBE9] text-sm">HTML5 Canvas Layout Matrices</span>
                    <span className="text-[#A3A09B] leading-relaxed">Manipulates image pixels, resizing bounding dimensions, placing watermarks, and evaluating visual layouts directly inside browser memory without uploading raw graphics buffers.</span>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-[#111213] rounded-2xl border border-[#2A2D30]">
                  <div className="p-3 bg-[#E29E2D]/10 text-[#E29E2D] border border-[#E29E2D]/25 rounded-xl shrink-0 h-fit">
                    <Lock size={20} />
                  </div>
                  <div className="flex flex-col gap-1 text-left">
                    <span className="font-bold text-[#ECEBE9] text-sm">Hardware-Accelerated WebGPU / WebGL</span>
                    <span className="text-[#A3A09B] leading-relaxed">Connects browser scripts directly to client GPU resources to accelerate floating-point queries during offline LLM token execution or media graphics processing.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'compliance' && (
            <div className="flex flex-col gap-5">
              <h2 className="text-xl font-bold text-[#ECEBE9] border-b border-[#2A2D30] pb-3">Security & Compliance</h2>
              
              <div className="bg-[#3C6B4D]/10 border border-[#3C6B4D]/20 p-4 rounded-xl flex items-start gap-3">
                <Shield size={20} className="text-[#3C6B4D] shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1 text-left">
                  <span className="text-[#ECEBE9] font-bold text-sm">100% Zero-Telemetry Policy</span>
                  <p className="text-[#A3A09B] text-xs leading-relaxed">
                    DomoDomo does not utilize tracking scripts, cookie managers, Google Analytics hooks, or log dumpers. What is loaded into memory is fully isolated within your browser tab namespace.
                  </p>
                </div>
              </div>

              <p className="text-[#A3A09B] text-xs md:text-sm leading-relaxed">
                Large corporations often enforce strict visual privacy guidelines. Employees are blocked from using external, unverified SaaS services to translate confidential PDF contracts, analyze client database lists, or generate business invoices.
              </p>

              <div className="flex flex-col gap-3 p-4 bg-[#111213] rounded-2xl border border-[#2A2D30] text-xs text-left">
                <h3 className="font-bold text-[#ECEBE9] flex items-center gap-2">
                  <Server size={14} className="text-[#3C6B4D]" />
                  <span>Corporate Self-Hosting Deployments</span>
                </h3>
                <p className="text-[#A3A09B] leading-relaxed">
                  Due to the zero-server architecture of the application, admins can bundle the static outputs and host it behind firewalls (e.g. <code>https://toolbox.internal.company.com</code>). Because the logic executes client-side on employee browser threads, corporate admins do not need to scale hosting resources or allocate database storage.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
