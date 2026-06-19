import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, Shield, Cpu, ShieldAlert, CpuIcon, Check, Copy } from 'lucide-react';
import { DynamicIcon } from '../components/DynamicIcon';
import { BRAND_KIT } from '../utils/BrandKit';

interface PlannedTool {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  status: 'functional' | 'planned';
}

const CATEGORIES = [
  { id: 'all', name: 'All Tools' },
  { id: 'photo', name: 'Photo & Image' },
  { id: 'pdf', name: 'PDF Document' },
  { id: 'document', name: 'Text & Doc' },
  { id: 'converter', name: 'File Converter' },
  { id: 'qr', name: 'QR & Barcode' },
  { id: 'video', name: 'Video WASM' },
  { id: 'audio', name: 'Audio Web' },
  { id: 'dev', name: 'Developer Tools' },
  { id: 'ai', name: 'Local AI' },
  { id: 'about', name: 'About DomoDomo' }
];

const ALL_PLANNED_TOOLS: PlannedTool[] = [
  // Photo (10)
  { id: 'background-remover', name: 'Background Remover', category: 'photo', description: 'Erase image backgrounds instantly. Click to key out matching colors, or use manual eraser.', icon: 'Image', status: 'functional' },
  { id: 'image-resizer', name: 'Image Resizer', category: 'photo', description: 'Resize images to precise dimensions using Canvas.', icon: 'Image', status: 'functional' },
  { id: 'image-compressor', name: 'Image Compressor', category: 'photo', description: 'Reduce image file sizes with real-time quality scale.', icon: 'Image', status: 'functional' },
  { id: 'crop-rotate', name: 'Crop & Rotate Tool', category: 'photo', description: 'Crop or rotate photos to standard ratios.', icon: 'Image', status: 'functional' },
  { id: 'ai-enhancer', name: 'AI Image Enhancer', category: 'photo', description: 'Enhance details using local contrast and color filters.', icon: 'Image', status: 'functional' },
  { id: 'watermark-tool', name: 'Watermark Tool', category: 'photo', description: 'Add logo or text watermarks overlay onto photos.', icon: 'Image', status: 'functional' },
  { id: 'image-upscaler', name: 'Image Upscaler', category: 'photo', description: 'Upscale dimensions using canvas bicubic interpolation.', icon: 'Image', status: 'functional' },
  { id: 'palette-extractor', name: 'Color Palette Extractor', category: 'photo', description: 'Extract key color swatches and hex codes.', icon: 'Image', status: 'functional' },
  { id: 'collage-maker', name: 'Collage Maker', category: 'photo', description: 'Combine multiple images in editable canvas grids.', icon: 'Image', status: 'functional' },
  { id: 'format-converter', name: 'Format Converter', category: 'photo', description: 'Convert image files to JPG, PNG, WebP locally.', icon: 'Image', status: 'functional' },

  // PDF (10)
  { id: 'pdf-merge', name: 'Merge PDFs', category: 'pdf', description: 'Combine multiple PDF files into a single document.', icon: 'FileText', status: 'functional' },
  { id: 'pdf-split', name: 'Split PDF', category: 'pdf', description: 'Extract pages from a PDF document into separate files.', icon: 'FileText', status: 'functional' },
  { id: 'pdf-compress', name: 'Compress PDF', category: 'pdf', description: 'Compress PDF size using structural optimization.', icon: 'FileText', status: 'functional' },
  { id: 'pdf-to-img', name: 'PDF → Image', category: 'pdf', description: 'Export PDF page views as high-res PNG images.', icon: 'FileText', status: 'functional' },
  { id: 'img-to-pdf', name: 'Image → PDF', category: 'pdf', description: 'Convert graphics and photos into PDF document pages.', icon: 'FileText', status: 'functional' },
  { id: 'pdf-watermark', name: 'Add Watermark', category: 'pdf', description: 'Overlay transparent text stamps onto PDFs.', icon: 'FileText', status: 'functional' },
  { id: 'pdf-sign', name: 'Sign PDF', category: 'pdf', description: 'Place transparent hand-drawn signatures on files.', icon: 'FileText', status: 'functional' },
  { id: 'pdf-protect', name: 'Protect PDF', category: 'pdf', description: 'Set passwords and encryption constraints on PDFs.', icon: 'FileText', status: 'functional' },
  { id: 'pdf-ocr', name: 'Extract Text (OCR)', category: 'pdf', description: 'Transcribe PDFs using structural parsing.', icon: 'FileText', status: 'functional' },
  { id: 'pdf-viewer', name: 'PDF Viewer', category: 'pdf', description: 'Read and view PDF books locally in frame.', icon: 'FileText', status: 'functional' },

  // Document (10)
  { id: 'rich-text', name: 'Rich Text Editor', category: 'document', description: 'Offline document generator with text formatting.', icon: 'FileText', status: 'functional' },
  { id: 'markdown-editor', name: 'Markdown Editor', category: 'document', description: 'Live preview Markdown syntax writing board.', icon: 'FileText', status: 'functional' },
  { id: 'ocr-scanner', name: 'OCR Scanner', category: 'document', description: 'Extract text from scanned pages using local OCR.', icon: 'FileText', status: 'functional' },
  { id: 'resume-builder', name: 'Resume Builder', category: 'document', description: 'Compile developer resumes to TXT instantly.', icon: 'FileText', status: 'functional' },
  { id: 'invoice-gen', name: 'Invoice Generator', category: 'document', description: 'Formulator for corporate invoice templates.', icon: 'FileText', status: 'functional' },
  { id: 'summarizer', name: 'Summarizer', category: 'document', description: 'Extract key points and summary from local text.', icon: 'FileText', status: 'functional' },
  { id: 'translator', name: 'Translator', category: 'document', description: 'Translate text locally via dictionary mapping.', icon: 'FileText', status: 'functional' },
  { id: 'grammar-fixer', name: 'Grammar Fixer', category: 'document', description: 'Fix syntax and grammatical spelling in browser.', icon: 'FileText', status: 'functional' },
  { id: 'citation-gen', name: 'Citation Generator', category: 'document', description: 'Generate APA formatted academic bibliographies.', icon: 'FileText', status: 'functional' },
  { id: 'code-notes', name: 'Code Notes Editor', category: 'document', description: 'Write down programming logs and code blocks.', icon: 'FileText', status: 'functional' },

  // Converter (10)
  { id: 'jpg-png', name: 'JPG ↔ PNG Converter', category: 'converter', description: 'Convert graphics between JPG and PNG formats.', icon: 'Hammer', status: 'functional' },
  { id: 'webp-jpg', name: 'WebP ↔ JPG Converter', category: 'converter', description: 'Convert WebP images to JPG standard.', icon: 'Hammer', status: 'functional' },
  { id: 'mp4-gif', name: 'MP4 ↔ GIF Converter', category: 'converter', description: 'Animate MP4 frames into GIF files locally.', icon: 'Hammer', status: 'functional' },
  { id: 'mp3-wav', name: 'MP3 ↔ WAV Converter', category: 'converter', description: 'Convert audio between MP3 and WAV streams.', icon: 'Hammer', status: 'functional' },
  { id: 'csv-json', name: 'CSV ↔ JSON Converter', category: 'converter', description: 'Translate spreadsheet CSV into JSON formats.', icon: 'Hammer', status: 'functional' },
  { id: 'xml-json', name: 'XML ↔ JSON Converter', category: 'converter', description: 'Translate XML trees into readable JSON structures.', icon: 'Hammer', status: 'functional' },
  { id: 'docx-txt', name: 'DOCX ↔ TXT Converter', category: 'converter', description: 'Extract plain text from word processing DOCX files.', icon: 'Hammer', status: 'functional' },
  { id: 'epub-pdf', name: 'EPUB → PDF Converter', category: 'converter', description: 'Convert e-books to standard PDF formats.', icon: 'Hammer', status: 'functional' },
  { id: 'base64-tool', name: 'Base64 Converter', category: 'converter', description: 'Convert text strings and assets to base64 arrays.', icon: 'Hammer', status: 'functional' },
  { id: 'zip-extractor', name: 'ZIP Extractor', category: 'converter', description: 'Outline and unpack local zip compression archives.', icon: 'Hammer', status: 'functional' },

  // QR / Barcode (10)
  { id: 'qr-generator', name: 'QR Code Generator', category: 'qr', description: 'Create customized QR codes for links, text, and credentials.', icon: 'QrCode', status: 'functional' },
  { id: 'qr-scanner', name: 'QR Scanner', category: 'qr', description: 'Scan QR codes using local browser webcam feed.', icon: 'QrCode', status: 'functional' },
  { id: 'wifi-qr', name: 'WiFi QR Generator', category: 'qr', description: 'Generate router network scan cards.', icon: 'QrCode', status: 'functional' },
  { id: 'vcard-qr', name: 'vCard QR Generator', category: 'qr', description: 'Encode business contact sheets in QR codes.', icon: 'QrCode', status: 'functional' },
  { id: 'event-qr', name: 'Event QR Generator', category: 'qr', description: 'Share event schedules and calendars in QR codes.', icon: 'QrCode', status: 'functional' },
  { id: 'payment-qr', name: 'Payment QR Generator', category: 'qr', description: 'Create scan-to-pay QR codes for UPI/bank channels.', icon: 'QrCode', status: 'functional' },
  { id: 'barcode-gen', name: 'Barcode Generator', category: 'qr', description: 'Generate Code128 and UPC barcodes.', icon: 'QrCode', status: 'functional' },
  { id: 'barcode-scan', name: 'Barcode Scanner', category: 'qr', description: 'Decode commercial item barcodes.', icon: 'QrCode', status: 'functional' },
  { id: 'bulk-qr', name: 'Bulk QR Generator', category: 'qr', description: 'Generate list of QR codes from CSV rows.', icon: 'QrCode', status: 'functional' },
  { id: 'qr-designer', name: 'QR Designer', category: 'qr', description: 'Customize modules and patterns in QR designs.', icon: 'QrCode', status: 'functional' },

  // Video (10)
  { id: 'trim-video', name: 'Trim Video', category: 'video', description: 'Clip video file frames between start and end slider ranges.', icon: 'Image', status: 'functional' },
  { id: 'compress-video', name: 'Compress Video', category: 'video', description: 'Reduce video track file sizes in the browser.', icon: 'Image', status: 'functional' },
  { id: 'merge-videos', name: 'Merge Videos', category: 'video', description: 'Combine multiple video files together.', icon: 'Image', status: 'functional' },
  { id: 'convert-video', name: 'Convert Video', category: 'video', description: 'Convert video files to WebM or MP4 format.', icon: 'Image', status: 'functional' },
  { id: 'extract-audio', name: 'Extract Audio', category: 'video', description: 'Strip audio tracks from video files.', icon: 'Image', status: 'functional' },
  { id: 'add-subtitles', name: 'Add Subtitles', category: 'video', description: 'Overlay closed caption tracks onto video screens.', icon: 'Image', status: 'functional' },
  { id: 'speed-control', name: 'Speed Control', category: 'video', description: 'Accelerate or slow down video playback rates.', icon: 'Image', status: 'functional' },
  { id: 'crop-video', name: 'Crop Video', category: 'video', description: 'Crop frames to square or wide dimensions.', icon: 'Image', status: 'functional' },
  { id: 'gif-maker', name: 'GIF Maker', category: 'video', description: 'Export video loops into animated GIF files.', icon: 'Image', status: 'functional' },
  { id: 'thumbnail-gen', name: 'Thumbnail Generator', category: 'video', description: 'Capture custom frames from videos as JPEG thumbnails.', icon: 'Image', status: 'functional' },

  // Audio (10)
  { id: 'audio-cutter', name: 'Audio Cutter', category: 'audio', description: 'Trim start and end offsets of audio tracks.', icon: 'FileText', status: 'functional' },
  { id: 'audio-merge', name: 'Audio Merge', category: 'audio', description: 'Concatenate multiple audio tracks.', icon: 'FileText', status: 'functional' },
  { id: 'noise-removal', name: 'Noise Removal', category: 'audio', description: 'Filter background hiss and clicks from audio feeds.', icon: 'FileText', status: 'functional' },
  { id: 'audio-convert', name: 'Convert Audio', category: 'audio', description: 'Convert audio files to MP3 or WAV formats.', icon: 'FileText', status: 'functional' },
  { id: 'voice-recorder', name: 'Voice Recorder', category: 'audio', description: 'Record microphone audio and download audio files.', icon: 'FileText', status: 'functional' },
  { id: 'speech-to-text', name: 'Speech-to-Text', category: 'audio', description: 'Transcribe speech into text using web speech APIs.', icon: 'FileText', status: 'functional' },
  { id: 'tts-fallback', name: 'Text-to-Speech', category: 'audio', description: 'Speak text phrases aloud using local synthesizer.', icon: 'FileText', status: 'functional' },
  { id: 'volume-booster', name: 'Volume Booster', category: 'audio', description: 'Amplify audio loudness levels.', icon: 'FileText', status: 'functional' },
  { id: 'podcast-editor', name: 'Podcast Editor', category: 'audio', description: 'Edit and compile multi-track audio podcasts.', icon: 'FileText', status: 'functional' },
  { id: 'audio-visualizer', name: 'Audio Visualizer', category: 'audio', description: 'Render real-time sound frequency bars.', icon: 'FileText', status: 'functional' },

  // Dev Tools (10)
  { id: 'json-format', name: 'JSON Formatter', category: 'dev', description: 'Beautify and validate JSON strings.', icon: 'Hammer', status: 'functional' },
  { id: 'jwt-decode', name: 'JWT Decoder', category: 'dev', description: 'Decode JWT headers and payloads offline.', icon: 'Hammer', status: 'functional' },
  { id: 'dev-base64', name: 'Base64 Tool', category: 'dev', description: 'Encode or decode base64 strings.', icon: 'Hammer', status: 'functional' },
  { id: 'regex-tester', name: 'Regex Tester', category: 'dev', description: 'Test expression matching patterns.', icon: 'Hammer', status: 'functional' },
  { id: 'uuid-gen', name: 'UUID Generator', category: 'dev', description: 'Generate unique random UUIDv4 keys.', icon: 'Hammer', status: 'functional' },
  { id: 'hash-gen', name: 'Hash Generator', category: 'dev', description: 'Generate SHA-256 hashes of text strings.', icon: 'Hammer', status: 'functional' },
  { id: 'api-tester', name: 'API Tester', category: 'dev', description: 'Send request calls to local endpoints.', icon: 'Hammer', status: 'functional' },
  { id: 'url-encoder', name: 'URL Encoder', category: 'dev', description: 'Encode or decode URL query paths.', icon: 'Hammer', status: 'functional' },
  { id: 'html-minify', name: 'HTML Minifier', category: 'dev', description: 'Minify code lines by stripping tags whitespaces.', icon: 'Hammer', status: 'functional' },
  { id: 'color-converter', name: 'Color Converter', category: 'dev', description: 'Convert color hex values to color spaces.', icon: 'Hammer', status: 'functional' },

  // AI Tools (10)
  { id: 'ai-chat', name: 'AI Chat', category: 'ai', description: 'Chat offline with local Panda assistant.', icon: 'Hammer', status: 'functional' },
  { id: 'ai-summarizer', name: 'Summarizer', category: 'ai', description: 'Summarize text documents using local parsing.', icon: 'Hammer', status: 'functional' },
  { id: 'caption-gen', name: 'Caption Generator', category: 'ai', description: 'Generate descriptive image captions.', icon: 'Hammer', status: 'functional' },
  { id: 'ocr-assistant', name: 'OCR Assistant', category: 'ai', description: 'Format OCR results into clean layouts.', icon: 'Hammer', status: 'functional' },
  { id: 'prompt-enhancer', name: 'Prompt Enhancer', category: 'ai', description: 'Enhance simple descriptions into descriptive prompts.', icon: 'Hammer', status: 'functional' },
  { id: 'image-classifier', name: 'Image Classifier', category: 'ai', description: 'Classify visual items of uploaded images.', icon: 'Hammer', status: 'functional' },
  { id: 'text-rewriter', name: 'Text Rewriter', category: 'ai', description: 'Rewrite text into corporate or casual tones.', icon: 'Hammer', status: 'functional' },
  { id: 'ai-translator', name: 'Translator', category: 'ai', description: 'Translate text arrays locally.', icon: 'Hammer', status: 'functional' },
  { id: 'ai-stt', name: 'Speech-to-Text', category: 'ai', description: 'Transcribe spoken audio inputs locally.', icon: 'Hammer', status: 'functional' },
  { id: 'semantic-search', name: 'Semantic Search', category: 'ai', description: 'Search local indexes using similarity matching.', icon: 'Hammer', status: 'functional' }
];

export const Dashboard = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [copiedColor, setCopiedColor] = useState('');

  const filteredTools = ALL_PLANNED_TOOLS.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(''), 2000);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Hero Welcome banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-[#151C2C] to-slate-900 border border-slate-800 p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl">
        <div className="flex flex-col gap-3 max-w-xl z-10 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-semibold w-fit">
            <Sparkles size={12} />
            <span>100% Client-side Processing</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Your Local Processing <br />
            <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-[#4E8E5E] bg-clip-text text-transparent">
              Super-App has arrived.
            </span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            DomoDomo compiles heavy utility processing directly in your browser. All filters, merging, and conversions execute offline on your device.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full md:w-auto z-10">
          <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex items-center gap-3">
            <Shield size={24} className="text-green-400" />
            <div className="flex flex-col text-left">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Privacy</span>
              <span className="text-slate-200 font-semibold text-sm">Secure</span>
            </div>
          </div>
          <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex items-center gap-3">
            <Cpu size={24} className="text-indigo-400" />
            <div className="flex flex-col text-left">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Engine</span>
              <span className="text-slate-200 font-semibold text-sm">WASM / WebAPI</span>
            </div>
          </div>
        </div>
        
        {/* Abstract background blobs */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-green-500/5 rounded-full blur-[80px] pointer-events-none" />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Categories Scroller */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mb-2 scrollbar-none pr-4 shrink-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`py-2 px-4 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border shrink-0 ${
                activeCategory === cat.id
                  ? 'bg-[#4E8E5E] text-white border-[#4E8E5E] shadow-md shadow-green-500/10'
                  : 'bg-[#151C2C]/50 hover:bg-[#151C2C]/80 border-slate-800 text-slate-400 hover:text-slate-250'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search Field */}
        {activeCategory !== 'about' && (
          <div className="relative shrink-0 w-full md:w-80">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search local tools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#151C2C]/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E] transition-colors placeholder:text-slate-500"
            />
          </div>
        )}
      </div>

      {/* Grid of Tools OR About Section */}
      {activeCategory === 'about' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          {/* Brand Philosophy */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="glass-card p-6 flex flex-col gap-5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <ShieldAlert size={20} className="text-[#4E8E5E]" />
                <span>The DomoDomo Privacy Mandate</span>
              </h2>
              <p className="text-slate-350 text-sm leading-relaxed">
                {BRAND_KIT.philosophy} Unlike regular web apps that process your PDFs, images, and videos on cloud servers, <strong>DomoDomo compiles everything locally on your CPU/GPU</strong> using standard browser Sandboxing APIs.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl flex flex-col gap-1">
                  <span className="text-[#4E8E5E] font-bold text-xs">WebAssembly</span>
                  <span className="text-[11px] text-slate-400">Enables high-performance low-level modules like pdf-lib.</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl flex flex-col gap-1">
                  <span className="text-indigo-400 font-bold text-xs">Canvas APIs</span>
                  <span className="text-[11px] text-slate-400">Processes backgrounds, overlays, colors, and visual matrices instantly.</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl flex flex-col gap-1">
                  <span className="text-[#4E8E5E] font-bold text-xs">IndexedDB</span>
                  <span className="text-[11px] text-slate-400">Caches files locally in secure browser sandboxes.</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 flex flex-col gap-5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <CpuIcon size={20} className="text-indigo-400" />
                <span>Modern Typography Guidelines</span>
              </h2>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-slate-850">
                  <span className="text-slate-400">Primary Font</span>
                  <span className="text-slate-200 font-bold">{BRAND_KIT.typography.primary}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400">Secondary Font</span>
                  <span className="text-slate-200 font-bold">{BRAND_KIT.typography.secondary}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Color swatches */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-6 flex flex-col gap-5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <span>Panda Brandkit</span>
              </h2>
              <div className="flex flex-col gap-4">
                {Object.entries(BRAND_KIT.colors).map(([key, col]) => (
                  <div key={key} className="flex items-center justify-between bg-slate-900/40 p-3 rounded-xl border border-slate-850">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded border border-slate-700 shadow-inner" style={{ backgroundColor: col.hex }} />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-200">{col.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{col.hex}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopyColor(col.hex)}
                      className="p-1.5 bg-slate-950/60 rounded-lg hover:bg-slate-850 transition-colors text-slate-400 hover:text-white"
                      title="Copy Hex"
                    >
                      {copiedColor === col.hex ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => {
            const isReady = tool.status === 'functional';
            return (
              <div
                key={tool.id}
                onClick={() => isReady && navigate(`/tool/${tool.id}`)}
                className={`glass-card p-6 flex flex-col justify-between text-left relative overflow-hidden group ${
                  isReady
                    ? 'cursor-pointer glass-card-hover border-slate-800/80'
                    : 'opacity-50 border-dashed border-slate-850 select-none'
                }`}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-2xl border ${
                      isReady 
                        ? 'bg-green-500/15 border-green-500/30 text-green-400 group-hover:scale-105 transition-transform' 
                        : 'bg-slate-900 border-slate-850 text-slate-500'
                    }`}>
                      <DynamicIcon name={tool.icon} size={22} />
                    </div>
                    {isReady ? (
                      <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                        Ready
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-slate-800 text-slate-500">
                        Planned
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-bold text-lg text-slate-250 group-hover:text-white transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer badges */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-800/60">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">
                    {tool.category} Tool
                  </span>
                  
                  {isReady && (
                    <span className="text-xs font-semibold text-green-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      <span>Open</span>
                      <span>→</span>
                    </span>
                  )}
                </div>

                {/* Background gradient highlights for active items */}
                {isReady && (
                  <div className="absolute -right-12 -bottom-12 w-24 h-24 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-colors" />
                )}
              </div>
            );
          })}

          {filteredTools.length === 0 && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-500 gap-2">
              <Cpu size={32} className="opacity-40 animate-pulse" />
              <p className="text-sm">No local tools matched your selection.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
