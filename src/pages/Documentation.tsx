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
      { id: 'pdf-text-edit', name: 'Edit PDF Text', engine: 'PDF.js + Canvas2D Layering', details: 'Leverages PDF.js core library to parse font glyph maps and text position coordinates. Renders a high-fidelity interaction canvas where text strings are overlaid with editable input blocks, compiling output edits back into standard PDF stream updates via incremental catalog revisions.' },
      { id: 'pdf-merge', name: 'Merge PDFs', engine: 'pdf-lib (WASM Compiler)', details: 'Ingests multiple document ArrayBuffers, mapping and copying page dictionaries, cross-reference tables, and font resources into a unified binary structure. Re-builds the object tree under a single PDF catalog writer entirely client-side.' },
      { id: 'pdf-split', name: 'Split PDF', engine: 'pdf-lib (WASM Compiler)', details: 'Parses the document\'s catalog hierarchy and cross-reference table. Creates a clean, empty document container and clones specific pages with their resource dictionaries (fonts, XObjects) before writing a serialized PDF byte stream.' },
      { id: 'pdf-compress', name: 'Compress PDF', engine: 'pdf-lib Optimization API', details: 'Locates resource streams in the object table, traversing image streams to downsample high-resolution raster objects and running standard deflate compression on text streams while stripping redundant XML metadata and creator attributes.' },
      { id: 'pdf-to-img', name: 'PDF → Image', engine: 'PDF.js Render Target', details: 'Executes PDF page rasterization by compiling page operators into standard 2D canvas drawing sequences at custom device-pixel-ratio scales, yielding clean base64 data URLs in PNG or JPEG format.' },
      { id: 'img-to-pdf', name: 'Image → PDF', engine: 'pdf-lib Image Embedder', details: 'Decodes raw image headers to match dimensions, instantiates a new PDF catalog structure, registers the image stream as a page content resource, and draws the bounding box on the graphics context.' },
      { id: 'pdf-watermark', name: 'Add Watermark', engine: 'pdf-lib Text overlays', details: 'Parses page dimensions, injects a standard translucent font state matrix, and appends a text draw operator stream directly at calculated relative coordinates without modifying underlying document layers.' },
      { id: 'pdf-sign', name: 'Sign PDF', engine: 'pdf-lib Graphics Context', details: 'Captures mouse or touch coordinates on an HTML5 canvas to produce a vector stroke path, converting coordinates into a standard PDF path description and drawing the vector overlay directly onto the target page stream.' },
      { id: 'pdf-protect', name: 'Protect PDF', engine: 'pdf-lib Encryption Standard', details: 'Applies client-side security algorithms to encrypt the PDF document structure. Sets permission bitmasks to block printing, copying, or modifying, and formats standard user/owner challenge strings in the trailer.' },
      { id: 'pdf-ocr', name: 'Extract Text (OCR)', engine: 'PDF.js Text Content Parser', details: 'Processes page text streams, resolving font maps, spacing arrays, and carriage return operators to extract clean, ordered plain-text strings directly from vector streams without external API requests.' }
    ]
  },
  photo: {
    title: 'Photo & Image Suite',
    desc: 'Client-side raster image filtering, transformations, background removal, and dimension adjustments.',
    list: [
      { id: 'background-remover', name: 'Background Remover', engine: 'Canvas2D + Color Distance Analytics', details: 'Extracts raw RGBA pixel matrices from an image, executing color distance formulas (e.g. Delta E) on target chroma boundaries to dynamically inject zero-alpha transparency values into matching background pixel coordinates.' },
      { id: 'image-resizer', name: 'Image Resizer', engine: 'Canvas Scaling (Lanczos/Bilinear)', details: 'Draws source images onto an OffscreenCanvas container configured with target dimensions, utilizing bilinear or bicubic interpolation algorithms in browser rendering engines to prevent aliasing artifacts.' },
      { id: 'image-compressor', name: 'Image Compressor', engine: 'Canvas JPEG/WebP Quantization', details: 'Extracts raw CanvasImageData, executing discrete cosine transforms (DCT) and quantization matrices using configured quality indices, and encodes the output into compressed JPEG or WebP data blobs.' },
      { id: 'crop-rotate', name: 'Crop & Rotate Tool', engine: 'Canvas 2D Transform Matrices', details: 'Applies affine translation, rotation, and clipping matrices to a CanvasRenderingContext2D canvas, then draws the cropped section from pixel coordinate bounds to yield a newly oriented asset.' },
      { id: 'ai-enhancer', name: 'AI Image Enhancer', engine: 'Canvas ImageData Filter Kernels', details: 'Applies multi-pass digital filters including contrast stretching, gamma adjustments, and customized pixel-convolution kernels to optimize sharpness, brightness, and color balance directly in-memory.' },
      { id: 'watermark-tool', name: 'Watermark Tool', engine: 'Canvas Layering & Compositing', details: 'Uses globalAlpha composite operations to draw logo PNGs or custom text strings onto a baseline image matrix, matching target dimensions and position vectors before compiling to an output blob.' },
      { id: 'image-upscaler', name: 'Image Upscaler', engine: 'Canvas Bilinear Interpolation', details: 'Iterates image scale increments using OffscreenCanvas, mapping target dimensions with interpolation filters and color adjustments to construct smooth upscaled outputs.' },
      { id: 'palette-extractor', name: 'Color Palette Extractor', engine: 'Canvas Pixel Quantization (Median Cut)', details: 'Samples pixel clusters, executing a median-cut color quantization algorithm to isolate color spaces and identify dominant hex codes, outputting a curated palette array.' },
      { id: 'collage-maker', name: 'Collage Maker', engine: 'Canvas Grid Compositing', details: 'Calculates layout bounds based on template files, draws multiple input image structures onto relative sub-rectangles, and applies customizable borders, margins, and padding offsets.' },
      { id: 'format-converter', name: 'Format Converter', engine: 'Canvas toBlob Serialization', details: 'Loads input files into a browser Image element, draws the element to canvas context, and serializes the binary content into PNG, JPEG, WebP, or AVIF formats using specific MIME parameters.' }
    ]
  },
  document: {
    title: 'Document Suite',
    desc: 'Local text editors, document template generators, academic citations, and dictionaries.',
    list: [
      { id: 'rich-text', name: 'Rich Text Editor', engine: 'HTML5 contentEditable API + DOM Compiler', details: 'Manages custom styling ranges using document selection ranges, rendering styled DOM nodes in real-time and exporting results as styled CSS-inline HTML, raw TXT, or PDF layouts.' },
      { id: 'markdown-editor', name: 'Markdown Editor', engine: 'Markdown Parse Compiler', details: 'Tokenizes Markdown strings using clean regex parsers, compiling elements like lists, tables, code blocks, and headers into structured HTML strings rendered directly in the editor workspace.' },
      { id: 'ocr-scanner', name: 'OCR Scanner', engine: 'Tesseract.js WASM Engine', details: 'Loads a Tesseract WebAssembly engine inside a Web Worker. Passes rasterized image buffers to run neural OCR character recognition, outputting coordinates and bounding box text structures.' },
      { id: 'resume-builder', name: 'Resume Builder', engine: 'Local Schema Compiler', details: 'Binds user form fields into a normalized JSON CV schema, merging data structures with local CSS layouts and rendering printable PDF views via window.print CSS rules.' },
      { id: 'invoice-gen', name: 'Invoice Generator', engine: 'Local Arithmetic Compiler', details: 'Performs float arithmetic calculations on invoice tables, computing line-item sums, tax rates, discounts, and formatting structured receipts ready for local storage saving or printing.' },
      { id: 'summarizer', name: 'Summarizer', engine: 'Frequency Heuristic TF-IDF Parser', details: 'Tokenizes text into sentences, stripping common stopwords and computing local TF-IDF weights to identify high-importance phrases, compiling a concise summary structure.' },
      { id: 'translator', name: 'Translator', engine: 'Local Dictionary Mapping', details: 'Performs client-side string translations using dictionary mappings, looking up vocabulary and syntactic templates to handle text conversions offline.' },
      { id: 'grammar-fixer', name: 'Grammar Fixer', engine: 'Regex Match Pattern Engine', details: 'Executes multiple regular expressions checking for common grammatical mistakes, double spaces, and capitalization errors, showing highlighting selectors for corrections.' },
      { id: 'citation-gen', name: 'Citation Generator', engine: 'Citation Format Standardizer', details: 'Compiles bibliography entries (APA, MLA, Chicago styles) by mapping input metadata strings to style rules and outputting sorted HTML strings.' },
      { id: 'code-notes', name: 'Code Notes Editor', engine: 'DOM Syntax Highlight Parser', details: 'Renders dynamic text input with synchronized syntax highlighting overlays, parsing statements and comments into styled span tokens for readability.' }
    ]
  },
  converter: {
    title: 'Converter Suite',
    desc: 'File format conversions, e-book compiles, Base64 translations, and ZIP archive extraction.',
    list: [
      { id: 'jpg-png', name: 'JPG ↔ PNG Converter', engine: 'Canvas MIME Serialization', details: 'Loads source image data, scales it to an OffscreenCanvas, and compiles the byte arrays using browser-native PNG or JPEG encoders.' },
      { id: 'webp-jpg', name: 'WebP ↔ JPG Converter', engine: 'Canvas MIME Serialization', details: 'Converts modern WebP buffers or JPEG containers by running them through canvas context rendering pipelines and exporting targeted file formats.' },
      { id: 'mp4-gif', name: 'MP4 ↔ GIF Converter', engine: 'FFmpeg WASM Subprocessor', details: 'Launches an FFmpeg WASM worker in-browser, parsing video frames into sequence arrays, applying color quantization tables, and assembling standard animated GIF frames.' },
      { id: 'mp3-wav', name: 'MP3 ↔ WAV Converter', engine: 'Web Audio AudioContext', details: 'Decodes MP3 binaries to PCM AudioBuffers, instantiates a WAV writer, writes standard RIFF headers, and writes PCM float arrays as 16-bit signed integers.' },
      { id: 'csv-json', name: 'CSV ↔ JSON Converter', engine: 'Structured String Array Parser', details: 'Splits CSV tables with regex considering escape quotes, maps column headers to JSON keys, or flattens nested JSON hierarchies back into comma-separated arrays.' },
      { id: 'xml-json', name: 'XML ↔ JSON Converter', engine: 'Browser DOMParser Engine', details: 'Parses XML markup strings into standard XML DOM structures using DOMParser, recursively traversing nodes to compile a corresponding JSON schema.' },
      { id: 'docx-txt', name: 'DOCX ↔ TXT Converter', engine: 'JSZip XML Traverser', details: 'Unpacks word document archives, extracts core file content (word/document.xml), and filters out text contents from tag annotations.' },
      { id: 'epub-pdf', name: 'EPUB → PDF Converter', engine: 'JSZip HTML Compiler', details: 'Extracts EPUB container HTML files, processes embedded CSS properties, and formats the text layouts into multi-page PDF documents via pdf-lib.' },
      { id: 'base64-tool', name: 'Base64 Converter', engine: 'FileReader API Binary Serializer', details: 'Uses FileReader to read local binary files, compiling them as base64-encoded strings, or decodes them back to binary arrays using standard browser APIs.' },
      { id: 'zip-extractor', name: 'ZIP Extractor', engine: 'JSZip File Decompressor', details: 'Parses the central directory header of uploaded ZIP archives, extracting compression properties and writing individual file blobs.' }
    ]
  },
  qr: {
    title: 'QR & Barcode Suite',
    desc: 'Visual matrix generators, contactless payment codes, WiFi tags, and webcam scanners.',
    list: [
      { id: 'qr-generator', name: 'QR Code Generator', engine: 'qrcode.js Canvas Engine', details: 'Generates binary QR matrices (error correction levels L/M/Q/H) from text strings, rendering them on a canvas element.' },
      { id: 'qr-scanner', name: 'QR Scanner', engine: 'WebRTC Stream + jsQR WASM Decoder', details: 'Captures webcam video frames, extracts image pixel matrices, and runs jsQR image processing to locate and decode QR identifiers.' },
      { id: 'wifi-qr', name: 'WiFi QR Generator', engine: 'WIFI Credential Format Standardizer', details: 'Serializes network parameters to standard protocol text, encoding it into custom-colored QR graphics.' },
      { id: 'vcard-qr', name: 'vCard QR Generator', engine: 'vCard Schema Standardizer', details: 'Assembles contact details into standard vCard specifications and generates corresponding QR codes.' },
      { id: 'event-qr', name: 'Event QR Generator', engine: 'iCalendar Standardizer', details: 'Converts event details into standard iCalendar configurations, rendering them as QR code matrices.' },
      { id: 'payment-qr', name: 'Payment QR Generator', engine: 'Banking QR Protocol Standardizer', details: 'Formats transaction details according to global banking QR systems, outputting scannable codes.' },
      { id: 'barcode-gen', name: 'Barcode Generator', engine: 'JsBarcode SVG Engine', details: 'Translates input data into Code128, EAN, or UPC barcode representations, drawing clean SVG vectors.' },
      { id: 'barcode-scan', name: 'Barcode Scanner', engine: 'WebRTC Camera + Barcode Detector API', details: 'Utilizes native browser BarcodeDetector APIs or WASM libraries to process camera streams and decode barcodes.' },
      { id: 'bulk-qr', name: 'Bulk QR Generator', engine: 'qrcode Batch Engine', details: 'Iterates through CSV datasets, compiling separate QR codes in batch and packing them into downloadable ZIP archives.' },
      { id: 'qr-designer', name: 'QR Designer', engine: 'Canvas Custom Styling Compositor', details: 'Renders QR code patterns with modern gradient fills, rounded alignment eyes, and overlays logo images in the center.' }
    ]
  },
  video: {
    title: 'Video Suite',
    desc: 'Local browser video trimming, container changes, subtitles injection, and frame exports.',
    list: [
      { id: 'trim-video', name: 'Trim Video', engine: 'FFmpeg WASM Subprocessor', details: 'Instructs FFmpeg WASM to seek target start times and execute copy operations without re-encoding video channels.' },
      { id: 'compress-video', name: 'Compress Video', engine: 'FFmpeg WASM Transcoder', details: 'Runs FFmpeg WebAssembly to transcode input streams to modern container types (H.264/AAC), adjusting output bitrates.' },
      { id: 'merge-videos', name: 'Merge Videos', engine: 'FFmpeg WASM Concatenator', details: 'Generates sequential file listings in FFmpeg WASM space, appending video tracks with matching structures.' },
      { id: 'convert-video', name: 'Convert Video', engine: 'FFmpeg WASM Container Exporter', details: 'Unpacks stream formats in FFmpeg WASM memory, remuxing tracks into MP4, WebM, or MKV containers.' },
      { id: 'extract-audio', name: 'Extract Audio', engine: 'FFmpeg WASM Demuxer', details: 'Demuxes audio streams from video containers, copying the audio data directly to MP3 or WAV files.' },
      { id: 'add-subtitles', name: 'Add Subtitles', engine: 'FFmpeg WASM Subtitle Burner', details: 'Burns subtitle strings (SRT or VTT) onto video streams using FFmpeg WASM filtering pipelines.' },
      { id: 'speed-control', name: 'Speed Control', engine: 'FFmpeg WASM Filter Engine', details: 'Applies video and audio filters to accelerate or slow down video streams without changing pitch.' },
      { id: 'crop-video', name: 'Crop Video', engine: 'FFmpeg WASM Bounding Box Cropper', details: 'Trims video coordinate heights and widths to custom aspect ratios.' },
      { id: 'gif-maker', name: 'GIF Maker', engine: 'FFmpeg WASM GIF Encoder', details: 'Extracts frame sets, generates custom color palette matrices, and exports animated GIFs.' },
      { id: 'thumbnail-gen', name: 'Thumbnail Generator', engine: 'HTML5 Video Canvas Frame Grabber', details: 'Loads video source objects, seeks to targeted frames, and grabs pixel frames onto a canvas canvas.' }
    ]
  },
  audio: {
    title: 'Audio Suite',
    desc: 'Sound wave editing, decibel amplification, voice recorders, and real-time visualizers.',
    list: [
      { id: 'audio-cutter', name: 'Audio Cutter', engine: 'Web Audio AudioContext Slice Engine', details: 'Loads audio binaries, decodes them to raw PCM buffer objects, trims target segments, and encodes outputs to WAV.' },
      { id: 'audio-merge', name: 'Audio Merge', engine: 'AudioBuffer Concatenator', details: 'Assembles multiple decibel arrays together into a single AudioBuffer container, exporting files client-side.' },
      { id: 'noise-removal', name: 'Noise Removal', engine: 'Web Audio BiquadFilter Engine', details: 'Applies lowpass, highpass, or bandpass biquad filters to target audio, stripping ambient frequencies.' },
      { id: 'audio-convert', name: 'Convert Audio', engine: 'Web Audio AudioBuffer Encoder', details: 'Loads audio formats and decodes/re-encodes them into WAV or MP3 files.' },
      { id: 'voice-recorder', name: 'Voice Recorder', engine: 'MediaRecorder API', details: 'Binds to microphone streams, capturing audio segments and serializing output to WAV/WEBM format.' },
      { id: 'speech-to-text', name: 'Speech-to-Text', engine: 'Web Speech Recognition Engine', details: 'Leverages the native browser speech engine to transcribe speech segments into text strings in real-time.' },
      { id: 'tts-fallback', name: 'Text-to-Speech', engine: 'Web SpeechSynthesis Engine', details: 'Invokes local browser speech synthesis tools, customizing voice accents and speeds.' },
      { id: 'volume-booster', name: 'Volume Booster', engine: 'Web Audio GainNode', details: 'Routes AudioContext streams through a GainNode structure, amplifying signal decibels beyond standard ceilings.' },
      { id: 'podcast-editor', name: 'Podcast Editor', engine: 'Web Audio Mixer Engine', details: 'Overlays multiple audio tracks onto a single master layout, mixing sound channels together.' },
      { id: 'audio-visualizer', name: 'Audio Visualizer', engine: 'Web Audio AnalyserNode', details: 'Extracts real-time Fast Fourier Transform (FFT) frequencies, drawing dynamic audio wave graphics.' }
    ]
  },
  dev: {
    title: 'Developer Utilities',
    desc: 'Formatters, token decoders, random key generators, SHA hashing, and URL parameters.',
    list: [
      { id: 'json-format', name: 'JSON Formatter', engine: 'JSON.parse / JSON.stringify Engine', details: 'Validates structure strings, formatting raw text into clean nested hierarchies with customizable indent sizes.' },
      { id: 'jwt-decode', name: 'JWT Decoder', engine: 'Base64URL Decoder', details: 'Splits JSON Web Tokens at delimiters, decoding payloads into formatted JSON strings.' },
      { id: 'dev-base64', name: 'Base64 Tool', engine: 'window.atob / window.btoa', details: 'Converts plain-text to base64 formatting, or reads base64 files back to original binaries.' },
      { id: 'regex-tester', name: 'Regex Tester', engine: 'RegExp Object Pattern Tester', details: 'Evaluates regular expressions against strings, highlighting match groups and replacement parameters.' },
      { id: 'uuid-gen', name: 'UUID Generator', engine: 'window.crypto.randomUUID', details: 'Uses native cryptographically secure random number generators to output unique UUIDv4 keys.' },
      { id: 'hash-gen', name: 'Hash Generator', engine: 'WebCrypto SubtleCrypto Digests', details: 'Computes SHA-1, SHA-256, or SHA-512 hashes from input string arrays offline.' },
      { id: 'api-tester', name: 'API Tester', engine: 'fetch Client API', details: 'Dispatches client HTTP requests, measuring response timings, header parameters, and data payloads.' },
      { id: 'url-encoder', name: 'URL Encoder', engine: 'encodeURIComponent / decodeURIComponent', details: 'Encodes parameter values to safe URL formatting or decodes them.' },
      { id: 'html-minify', name: 'HTML Minifier', engine: 'Regex Minification Engine', details: 'Strips document whitespaces, carriage returns, and comment layouts from code strings.' },
      { id: 'color-converter', name: 'Color Converter', engine: 'Color Conversion Formulas', details: 'Computes conversion equations to map color definitions between HEX, RGB, HSL, and CMYK formats.' }
    ]
  },
  ai: {
    title: 'Local AI Suite',
    desc: 'Local model connection pipelines, summarization, OCR formatters, and translation.',
    list: [
      { id: 'ai-chat', name: 'AI Chat', engine: 'Ollama Client REST Pipeline', details: 'Streams message structures to local Ollama ports, rendering response markdown content.' },
      { id: 'ai-summarizer', name: 'Summarizer', engine: 'Ollama Model Summarizer Pipeline', details: 'Sends text content to local LLMs with custom instructions to create structured summaries.' },
      { id: 'caption-gen', name: 'Caption Generator', engine: 'Ollama Vision Pipeline', details: 'Encodes image uploads as base64 parameters, transmitting details to local vision LLMs for captioning.' },
      { id: 'ocr-assistant', name: 'OCR Assistant', engine: 'Ollama Layout Formatting Pipeline', details: 'Sends noisy text from OCR tools to local LLMs to format clean document configurations.' },
      { id: 'prompt-enhancer', name: 'Prompt Enhancer', engine: 'Ollama Prompt Optimization Pipeline', details: 'Assembles prompt elements, utilizing local LLMs to expand concepts into detailed instructions.' },
      { id: 'image-classifier', name: 'Image Classifier', engine: 'Ollama Image Classification Pipeline', details: 'Sends image parameters to local vision LLMs, returning tag listings and classification percentages.' },
      { id: 'text-rewriter', name: 'Text Rewriter', engine: 'Ollama Tone Transformation Pipeline', details: 'Applies style templates using local models, rewriting paragraphs into alternative tones.' },
      { id: 'ai-translator', name: 'Translator', engine: 'Ollama Translation Pipeline', details: 'Directs local LLMs to translate text strings, maintaining structure and context.' },
      { id: 'ai-stt', name: 'Speech-to-Text', engine: 'Ollama Audio Transcription Pipeline', details: 'Processes audio files through local models to generate text transcriptions.' },
      { id: 'semantic-search', name: 'Semantic Search', engine: 'Ollama Embedding Engine', details: 'Passes document texts to embedding models, storing vectors to perform similarity searches.' }
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
                  <rect x="37" y="80" width="90" height="50" rx="8" fill="#111213" stroke="#2A2D30" />
                  <text x="82" y="105" fill="#ECEBE9" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">User Files</text>
                  <text x="82" y="120" fill="#72706C" fontSize="8" fontFamily="monospace" textAnchor="middle">File / Image Blobs</text>

                  {/* Arrow 1 */}
                  <path d="M127 105 H167" stroke="#3C6B4D" strokeWidth="2" markerEnd="url(#arrow)" />

                  {/* Memory Iframe Cache */}
                  <rect x="167" y="60" width="220" height="90" rx="8" fill="#111213" stroke="#3C6B4D" strokeWidth="1.5" />
                  <text x="277" y="85" fill="#ECEBE9" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">DomoDomo Engines</text>
                  <text x="277" y="102" fill="#3C6B4D" fontSize="9" fontFamily="monospace" textAnchor="middle">IndexedDB / Memory Cache</text>
                  <text x="277" y="122" fill="#A3A09B" fontSize="9" fontFamily="sans-serif" textAnchor="middle">WASM Runtimes & Canvas</text>
                  <text x="277" y="137" fill="#E29E2D" fontSize="8" fontFamily="monospace" textAnchor="middle">WebGPU (LLM Queries)</text>

                  {/* Arrow 2 */}
                  <path d="M387 105 H427" stroke="#3C6B4D" strokeWidth="2" markerEnd="url(#arrow)" />

                  {/* Local compilation output */}
                  <rect x="427" y="80" width="90" height="50" rx="8" fill="#111213" stroke="#2A2D30" />
                  <text x="472" y="105" fill="#ECEBE9" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Output Buffers</text>
                  <text x="472" y="120" fill="#72706C" fontSize="8" fontFamily="monospace" textAnchor="middle">ArrayBuffer Stream</text>

                  {/* Arrow 3 */}
                  <path d="M517 105 H543" stroke="#3C6B4D" strokeWidth="2" markerEnd="url(#arrow)" />

                  {/* Browser Download Node */}
                  <circle cx="565" cy="105" r="18" fill="#111213" stroke="#3C6B4D" strokeWidth="1.5" />
                  <path d="M565 97 V107 M560 102 L565 107 L570 102 M559 111 H571" stroke="#ECEBE9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <text x="565" y="138" fill="#ECEBE9" fontSize="9" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Download</text>
                  <text x="565" y="149" fill="#72706C" fontSize="8" fontFamily="monospace" textAnchor="middle">Local Save</text>

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
