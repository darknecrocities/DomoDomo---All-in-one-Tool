import { 
  Cpu, Globe, Layers, Shield, ShieldAlert, Sparkles, Terminal, Zap, Users, Copy, 
  ChevronDown, Check, LayoutGrid, Image, FileText, AlignLeft, RefreshCw, QrCode, 
  Video, Music, Code, Database, Eye, Activity, Box, Search, ArrowRight, Lightbulb,
  Trophy, Award, Crown
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { BRAND_KIT } from '../utils/BrandKit';
import domodomoLogo from '../assets/domodomo.png';
import domodomoWinkLogo from '../assets/domodomo_wink.png';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Documentation } from './Documentation';
import { TOOLS } from '../engine/registry';
import { CATEGORIES } from './Dashboard';
import { CommunityTestimonials } from '../components/CommunityTestimonials';

const stats = [
  { label: 'Web Utilities', value: `${TOOLS.length}`, detail: 'Local tools for files, media, code, AI, computer vision, and documents.', icon: Layers },
  { label: 'Active Users', value: '7,876', detail: 'Developers & creators running DomoDomo offline globally.', icon: Users },
  { label: 'Categories', value: `${CATEGORIES.length - 2}`, detail: 'Photo, PDF, text, converter, QR, video, audio, dev, data, computer vision, 3D spatial, investigative research, and security.', icon: Globe },
  { label: 'License', value: '100%', detail: 'Free, open-source, inspectable, and self-hostable.', icon: Sparkles }
];

export const CATEGORY_DETAILS = [
  {
    id: 'photo',
    name: 'Photo & Image',
    icon: Image,
    badge: 'Canvas & WASM Accelerated',
    tagline: 'Client-side photo editing, format converting, and background removal.',
    useCase: 'Essential for content creators, web developers, and UI designers needing instant background keying, WebP/AVIF conversion, image resizing, and EXIF metadata stripping without uploading assets to third-party servers.',
    highlights: ['Background Remover', 'Image Resizer', 'Format Converter', 'Color Extractor']
  },
  {
    id: 'pdf',
    name: 'PDF Document',
    icon: FileText,
    badge: '100% Private Sandbox',
    tagline: 'Merge, split, compress, encrypt, and manage PDF documents locally.',
    useCase: 'Designed for legal teams, administrative personnel, and students handling sensitive contracts, financial statements, medical records, or confidential papers that must strictly avoid cloud server uploads.',
    highlights: ['PDF Merger', 'PDF Splitter', 'PDF Encrypt & Decrypt', 'PDF Compressor']
  },
  {
    id: 'document',
    name: 'Text & Doc',
    icon: AlignLeft,
    badge: 'Markdown & Regex Engine',
    tagline: 'Rich text formatting, difference auditing, and word metrics.',
    useCase: 'Ideal for technical writers, copywriters, and bloggers who need clean Markdown editing, character frequency counting, text diff comparison, case transformation, and lorem ipsum generation.',
    highlights: ['Markdown Editor', 'Text Diff Comparison', 'Word Counter', 'Case Converter']
  },
  {
    id: 'converter',
    name: 'File Converter',
    icon: RefreshCw,
    badge: 'Multi-Format Transformer',
    tagline: 'Seamlessly convert between JSON, CSV, YAML, Base64, and media formats.',
    useCase: 'Empowers software engineers, DevOps specialists, and data managers to instantly reshape data formats, encode/decode Base64 strings, convert CSV files to JSON schemas, and extract archives client-side.',
    highlights: ['JSON-to-YAML', 'CSV-to-JSON', 'Base64 Encoder', 'Media Converter']
  },
  {
    id: 'qr',
    name: 'QR & Barcode',
    icon: QrCode,
    badge: 'Vector & Raster Generator',
    tagline: 'Generate high-density QR codes and scan product barcodes instantly.',
    useCase: 'Perfect for marketers, event coordinators, and inventory managers generating custom Wi-Fi/VCard QR codes or scanning product barcodes directly via web camera video feeds.',
    highlights: ['QR Code Generator', 'Barcode Scanner', 'WiFi QR Builder', 'VCard Generator']
  },
  {
    id: 'video',
    name: 'Video WASM',
    icon: Video,
    badge: 'FFmpeg WebAssembly',
    tagline: 'Browser-based video trimming, MP4-to-GIF conversion, and scaling.',
    useCase: 'Useful for video editors and social media managers who want fast video clip trimming, resolution downsizing, frame extraction, and GIF conversion without installing heavy desktop software.',
    highlights: ['Video Trimmer', 'MP4 to GIF Converter', 'Resolution Downscaler', 'Audio Stripper']
  },
  {
    id: 'audio',
    name: 'Audio Web',
    icon: Music,
    badge: 'WebAudio API Engine',
    tagline: 'Trim audio tracks, visualize waveforms, boost gain, and convert formats.',
    useCase: 'Built for podcasters, sound engineers, and musicians needing quick audio slicing, format conversion, volume normalization, tone generation, and visual spectrum analysis.',
    highlights: ['Audio Cutter', 'Waveform Visualizer', 'Audio Converter', 'Gain Booster']
  },
  {
    id: 'dev',
    name: 'Developer Tools',
    icon: Code,
    badge: 'Frontend & Backend Utilities',
    tagline: 'Code formatters, Cron parsers, Regex testers, and CSS builders.',
    useCase: 'Crucial for fullstack engineers needing instant JSON prettifying, SQL formatting, Glassmorphism CSS generation, Cron syntax inspection, and Base number conversion.',
    highlights: ['JSON Prettifier', 'SQL Formatter', 'Glassmorphism Designer', 'Cron Parser']
  },
  {
    id: 'data',
    name: 'Data & Visualizer',
    icon: Database,
    badge: 'In-Memory SQL & Charting',
    tagline: 'Analyze CSV/JSON datasets, execute SQL queries, and build charts.',
    useCase: 'Tailored for data analysts and business intelligence teams running client-side SQL queries over raw CSV files and generating instant Bar, Line, or Pie chart visualizations.',
    highlights: ['SQL Data Workbench', 'Chart Generator', 'CSV Data Cleaner', 'JSON Inspector']
  },
  {
    id: 'ai',
    name: 'Local AI',
    icon: Cpu,
    badge: 'Ollama LLM Integration',
    tagline: 'Private AI chat, document summarization, and local multi-agent loops.',
    useCase: 'Essential for privacy-minded users running local LLMs (Ollama) for code explaining, text summarization, multi-agent research campaigns, and confidential drafting with zero data leaks.',
    highlights: ['Local AI Chat', 'Research Orchestrator', 'Code Explainer', 'Document Summarizer']
  },
  {
    id: 'security',
    name: 'Developer Security',
    icon: ShieldAlert,
    badge: 'Cryptographic Suite',
    tagline: 'JWT debugging, cryptographic hashing, vulnerability auditing, and passwords.',
    useCase: 'Targeted at DevOps engineers, cybersecurity specialists, and web developers auditing JWT tokens, calculating SHA-256/bcrypt hashes, generating secrets, and reviewing code vulnerabilities.',
    highlights: ['JWT Debugger', 'Crypto Hash Generator', 'Code Security Auditor', 'Password Builder']
  },
  {
    id: 'cv',
    name: 'Computer Vision',
    icon: Eye,
    badge: 'Dataset Annotation Engine',
    tagline: 'Bounding box annotation, magic wand segmenting, and optical flow tracking.',
    useCase: 'Designed for ML engineers and computer vision researchers annotating bounding boxes, drawing semantic masks, tagging COCO pose skeletons, and building training datasets.',
    highlights: ['Polygon Annotator', 'Magic Wand Segmenter', 'COCO Pose Skeleton', 'Optical Flow Tracker']
  },
  {
    id: 'ml',
    name: 'Machine Learning',
    icon: Activity,
    badge: 'Statistical Model Auditor',
    tagline: 'Evaluate confusion matrices, ROC curves, SHAP explainability, and t-SNE.',
    useCase: 'Empowers data scientists to evaluate ML classification metrics, analyze ROC/PR curves, project 3D embedding vectors, measure ONNX latency, and audit model feature drift.',
    highlights: ['Confusion Matrix Evaluator', 'ROC/PR Curve Analyzer', 'SHAP Explainer', 't-SNE Visualizer']
  },
  {
    id: 'spatial',
    name: 'Spatial 3D & Web',
    icon: Box,
    badge: 'WebGL & Three.js Canvas',
    tagline: 'Inspect 3D GLTF/OBJ models, analyze poly-counts, and view textures.',
    useCase: 'Built for 3D artists, WebGL developers, and game creators previewing 3D assets, measuring mesh polygon counts, evaluating textures, and testing camera lighting.',
    highlights: ['GLTF 3D Viewer', 'Mesh Poly Analyzer', 'Texture Inspector', 'Bounding Box Calc']
  },
  {
    id: 'investigation',
    name: 'Investigative Research',
    icon: Search,
    badge: 'Local AI & Expert System',
    tagline: 'Multi-paper synthesis, PICO trial evaluation, patent trees, and meta-analysis.',
    useCase: 'Crafted for academics, clinicians, patent attorneys, and grant writers conducting literature synthesis, Cochrane trial bias audits, patent claim trees, and SVG forest plot meta-analysis.',
    highlights: ['Literature Synthesizer', 'PICO Trial Evaluator', 'Patent Claim Tree', 'SVG Forest Plot Meta-Analysis']
  }
];

export const AboutApplication = ({ defaultTab = 'about' }: { defaultTab?: 'about' | 'categories' | 'updates' | 'docs' }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryTab = searchParams.get('tab') as 'about' | 'categories' | 'updates' | 'docs';
  const [activeTab, setActiveTab] = useState<'about' | 'categories' | 'updates' | 'docs'>(queryTab || defaultTab);

  const [categoryFilter, setCategoryFilter] = useState('');

  // Sync tab state with query parameters
  useEffect(() => {
    if (queryTab && queryTab !== activeTab) {
      setActiveTab(queryTab);
    }
  }, [queryTab]);

  const handleTabChange = (tab: 'about' | 'categories' | 'updates' | 'docs') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // FAQ state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const toggleFaq = (idx: number) => {
    setExpandedFaq(expandedFaq === idx ? null : idx);
  };

  // Clipboard copy state
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const handleCopyCommand = useCallback((command: string, index: number) => {
    navigator.clipboard.writeText(command);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  }, []);

  const handleNavigateToCategory = (catId: string) => {
    navigate(`/?category=${catId}`);
  };

  const filteredCategoryDetails = CATEGORY_DETAILS.filter((cat) => {
    if (!categoryFilter.trim()) return true;
    const query = categoryFilter.toLowerCase();
    return (
      cat.name.toLowerCase().includes(query) ||
      cat.tagline.toLowerCase().includes(query) ||
      cat.useCase.toLowerCase().includes(query) ||
      cat.highlights.some((h) => h.toLowerCase().includes(query))
    );
  });

  return (
    <div className="flex flex-col gap-8 text-left w-full animate-fadeIn">
      <Helmet>
        <title>About DomoDomo - Private & Secure Offline Toolbox</title>
        <meta name="description" content="Learn about DomoDomo's client-side, zero-server architecture. All tools run completely offline in your browser sandbox with absolute privacy." />
        <link rel="canonical" href="https://domodomo.site/about" />
      </Helmet>

      {/* Hero Welcome banner */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-3xl bg-[#18191B] border border-[#2A2D30] p-8 md:p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#2a2d30_1px,transparent_1px),linear-gradient(to_bottom,#2a2d30_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.12] pointer-events-none" />
        <div className="lg:col-span-8 z-10 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/20 text-xs font-semibold w-fit">
              <Shield size={12} />
              <span>About DomoDomo</span>
            </div>

            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[#d4af37]/40 bg-[#d4af37]/10 text-[#d4af37] shadow-sm font-extrabold text-xs"
              title="#1 All Time Overall Platform"
            >
              <Crown size={13} className="text-[#d4af37]" />
              <span>#1 All Time Overall</span>
            </div>

            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[#3C6B4D]/40 bg-[#3C6B4D]/10 text-[#4E8E5E] shadow-sm font-extrabold text-xs"
              title="#1 Product in AI & Local LLM Category"
            >
              <Cpu size={13} className="text-[#3C6B4D]" />
              <span>#1 in AI Category</span>
            </div>

            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[#3C6B4D]/40 bg-[#3C6B4D]/10 text-[#4E8E5E] shadow-sm font-extrabold text-xs"
              title="#1 Product in Productivity Category"
            >
              <Trophy size={13} className="text-[#3C6B4D]" />
              <span>#1 in Productivity</span>
            </div>

            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[#3C6B4D]/40 bg-[#3C6B4D]/10 text-[#4E8E5E] shadow-sm font-extrabold text-xs"
              title="#1 Product in Developer Tools Category"
            >
              <Award size={13} className="text-[#3C6B4D]" />
              <span>#1 in Developer Tools</span>
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#ECEBE9] tracking-tight leading-tight font-heading">
            Everything About the Local-First Application
          </h1>
          <p className="text-[#A3A09B] text-sm md:text-base leading-relaxed max-w-3xl">
            {BRAND_KIT.philosophy} Unlike cloud utilities, DomoDomo keeps processing in your browser sandbox so private documents, images, audio, video, and AI inputs stay on your machine.
          </p>
        </div>
        <div className="lg:col-span-4 z-10 flex justify-center lg:justify-end">
          <div className="bg-[#111213] border border-[#2A2D30] rounded-2xl p-6 w-44 h-44 relative group/wink cursor-pointer flex items-center justify-center">
            <img
              src={domodomoLogo}
              alt="Brand Logo"
              className="absolute w-32 h-32 rounded-2xl border border-secondary/20 shadow-md transition-all duration-300 group-hover/wink:opacity-0 group-hover/wink:rotate-12 group-hover/wink:scale-105"
            />
            <img
              src={domodomoWinkLogo}
              alt="Brand Logo Wink"
              className="absolute w-32 h-32 rounded-2xl border border-secondary/20 shadow-md transition-all duration-300 opacity-0 group-hover/wink:opacity-100 group-hover/wink:rotate-12 group-hover/wink:scale-105"
            />
          </div>
        </div>
      </section>

      {/* Side Navigation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
        {/* Sticky Sidebar Navigation */}
        <div className="lg:col-span-3 flex flex-col gap-2.5 bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl lg:sticky lg:top-24">
          <span className="text-[10px] uppercase tracking-wider text-[#72706C] font-bold px-3 mb-1 block">Navigation</span>

          <button
            onClick={() => handleTabChange('about')}
            className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 border ${activeTab === 'about'
              ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/45 text-[#ECEBE9]'
              : 'border-transparent text-[#A3A09B] hover:bg-[#111213] hover:text-[#ECEBE9]'
              }`}
          >
            <Shield size={14} className={activeTab === 'about' ? 'text-[#3C6B4D]' : 'text-[#72706C]'} />
            <span>About Page</span>
          </button>

          {/* NEW Category Navigation Card Button */}
          <button
            onClick={() => handleTabChange('categories')}
            className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 border ${activeTab === 'categories'
              ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/45 text-[#ECEBE9]'
              : 'border-transparent text-[#A3A09B] hover:bg-[#111213] hover:text-[#ECEBE9]'
              }`}
          >
            <LayoutGrid size={14} className={activeTab === 'categories' ? 'text-[#3C6B4D]' : 'text-[#72706C]'} />
            <span>Tool Categories</span>
          </button>

          <button
            onClick={() => handleTabChange('updates')}
            className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 border ${activeTab === 'updates'
              ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/45 text-[#ECEBE9]'
              : 'border-transparent text-[#A3A09B] hover:bg-[#111213] hover:text-[#ECEBE9]'
              }`}
          >
            <Sparkles size={14} className={activeTab === 'updates' ? 'text-[#3C6B4D]' : 'text-[#72706C]'} />
            <span>Updates & Patches</span>
          </button>

          <button
            onClick={() => handleTabChange('docs')}
            className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 border ${activeTab === 'docs'
              ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/45 text-[#ECEBE9]'
              : 'border-transparent text-[#A3A09B] hover:bg-[#111213] hover:text-[#ECEBE9]'
              }`}
          >
            <Terminal size={14} className={activeTab === 'docs' ? 'text-[#3C6B4D]' : 'text-[#72706C]'} />
            <span>Local Docs</span>
          </button>
        </div>

        {/* Dynamic Tab Content Pane */}
        <div className="lg:col-span-9 flex flex-col gap-8 w-full animate-fadeIn">
          {activeTab === 'about' && (
            <>
              {/* Stats Block */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(({ label, value, detail, icon: Icon }) => (
                  <div key={label} className="glass-card p-5 border-[#2A2D30] bg-[#18191B]">
                    <div className="p-2.5 rounded-xl bg-[#3C6B4D]/10 border border-[#3C6B4D]/20 text-[#3C6B4D] w-fit">
                      <Icon size={18} />
                    </div>
                    <div className="mt-4">
                      <span className="text-3xl font-extrabold text-[#ECEBE9] tracking-tight">{value}</span>
                      <h2 className="font-bold text-sm text-[#ECEBE9] mt-1">{label}</h2>
                      <p className="text-[#A3A09B] text-[11px] mt-1 leading-relaxed">{detail}</p>
                    </div>
                  </div>
                ))}
              </section>

              {/* Categories Teaser Banner on About tab */}
              <section className="glass-card p-6 border-[#2A2D30] bg-[#18191B] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="flex flex-col gap-2 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/20 text-xs font-semibold w-fit">
                    <LayoutGrid size={12} />
                    <span>Comprehensive Toolbox Directory</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-extrabold text-[#ECEBE9] tracking-tight">
                    Explore All 15 Tool Categories & Use Cases
                  </h2>
                  <p className="text-xs text-[#A3A09B] leading-relaxed">
                    From Photo processing and WASM video trimming to Machine Learning model evaluation and Local AI research campaigns—discover every category built into DomoDomo.
                  </p>
                </div>
                <button
                  onClick={() => handleTabChange('categories')}
                  className="btn-primary py-3 px-5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shrink-0 shadow-md"
                >
                  <span>View All Categories & Use Cases</span>
                  <ArrowRight size={14} />
                </button>
              </section>

              {/* Real Community Testimonials */}
              <CommunityTestimonials compact={true} />

              {/* Mission Block */}
              <section className="glass-card p-6 md:p-8 border-[#2A2D30] bg-[#18191B] space-y-6">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/20 text-xs font-semibold w-fit mb-2">
                    <Sparkles size={12} />
                    <span>Mission &amp; Core Purpose</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-extrabold text-[#ECEBE9] tracking-tight">
                    Designed for Developers, Creators, and Power Users
                  </h2>
                  <p className="text-[#A3A09B] text-xs md:text-sm leading-relaxed mt-2">
                    DomoDomo solves the friction of traditional web utilities. Instead of uploading sensitive files to remote servers, it compiles the processing logic directly inside the browser.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  {[
                    ['Uncompromising Security', 'Zero data tracking, zero uploads, and zero server databases. Your files never leave your computer.', Shield],
                    ['Local AI & WebAssembly', 'Runs local AI helpers and compiled modules directly on your device for private, fast workflows.', Cpu],
                    ['All-in-One Utility Hub', 'Edit PDFs, compress media, build documents, scan QRs, and format code inside one cohesive system.', Zap]
                  ].map(([title, detail, Icon]) => (
                    <div key={title as string} className="flex gap-3">
                      <div className="p-2.5 rounded-xl bg-[#3C6B4D]/10 border border-[#3C6B4D]/20 text-[#3C6B4D] h-fit shrink-0">
                        <Icon size={18} />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <h3 className="font-bold text-[#ECEBE9] text-sm">{title as string}</h3>
                        <p className="text-[#A3A09B] text-[11px] leading-relaxed">{detail as string}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Install and FAQ Grid */}
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Local Installation Guide */}
                <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B]">
                  <h2 className="text-lg font-bold text-[#ECEBE9] flex items-center gap-2 border-b border-[#2A2D30] pb-3">
                    <Terminal size={18} className="text-[#3C6B4D]" />
                    <span>Local Installation Guide</span>
                  </h2>
                  <div className="flex flex-col gap-3 mt-5 font-mono text-[11px]">
                    {[
                      { desc: "# 1. Clone the repository", cmd: "git clone https://github.com/darknecrocities/DomoDomo---All-in-one-Tool.git" },
                      { desc: "# 2. Navigate to directory", cmd: "cd DomoDomo---All-in-one-Tool" },
                      { desc: "# 3. Install dependencies", cmd: "npm install" },
                      { desc: "# 4. Start developer server", cmd: "npm run dev" },
                      { desc: "# 5. Build production bundle", cmd: "npm run build" }
                    ].map((step, idx) => (
                      <div key={idx} className="bg-[#111213] p-3 rounded-xl border border-[#2A2D30] flex justify-between items-center group/cmd">
                        <div className="flex flex-col gap-1 text-[#3C6B4D]">
                          <span className="text-[#72706C] font-semibold text-[10px]">{step.desc}</span>
                          <span className="text-[#ECEBE9] break-all">{step.cmd}</span>
                        </div>
                        <button
                          onClick={() => handleCopyCommand(step.cmd, idx)}
                          className="p-1.5 rounded bg-[#18191B] border border-[#2A2D30] text-[#72706C] hover:text-[#ECEBE9] hover:border-[#3C6B4D]/40 transition-all opacity-0 group-hover/cmd:opacity-100 shrink-0"
                          title="Copy command"
                        >
                          {copiedIndex === idx ? <Check size={12} className="text-[#3C6B4D]" /> : <Copy size={12} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Frequently Asked Questions (Accordion) */}
                <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B]">
                  <h2 className="text-lg font-bold text-[#ECEBE9] flex items-center gap-2 border-b border-[#2A2D30] pb-3">
                    <ShieldAlert size={18} className="text-[#3C6B4D]" />
                    <span>Frequently Asked Questions</span>
                  </h2>
                  <div className="flex flex-col gap-3 mt-5">
                    {[
                      {
                        q: "Is DomoDomo really free?",
                        a: "Yes. It is 100% free, open-source, and does not require accounts, sign-ups, or subscriptions."
                      },
                      {
                        q: "How do I verify there are no data leaks?",
                        a: "You can open your browser's DevTools (F12) Network tab while running any tool. You will see that all file conversions and AI processing happen strictly on your local machine with zero uploads."
                      },
                      {
                        q: "Can teams self-host it?",
                        a: "Yes. Because DomoDomo is a static client-side application, you can build it and host it on your own private enterprise server or intranet to comply with strict internal security regulations."
                      }
                    ].map((faq, idx) => {
                      const isOpen = expandedFaq === idx;
                      return (
                        <div key={idx} className="bg-[#111213] rounded-xl border border-[#2A2D30] overflow-hidden">
                          <button
                            onClick={() => toggleFaq(idx)}
                            className="w-full px-4 py-3 flex justify-between items-center text-left text-[#ECEBE9] hover:bg-[#18191B] font-bold text-xs md:text-sm transition-colors"
                          >
                            <span>{faq.q}</span>
                            <ChevronDown size={14} className={`text-[#72706C] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                          </button>
                          <div
                            className={`transition-all duration-200 ease-in-out ${isOpen ? 'max-h-32 opacity-100 border-t border-[#2A2D30]/65 p-4' : 'max-h-0 opacity-0'}`}
                            style={{ overflow: 'hidden' }}
                          >
                            <p className="text-[#A3A09B] text-xs leading-relaxed">{faq.a}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            </>
          )}

          {/* DEDICATED TOOL CATEGORIES TAB PANE */}
          {activeTab === 'categories' && (
            <section className="flex flex-col gap-6 animate-fadeIn w-full">
              {/* Header Banner */}
              <div className="glass-card p-6 md:p-8 border-[#2A2D30] bg-[#18191B] flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/20 text-xs font-semibold w-fit">
                    <LayoutGrid size={12} />
                    <span>Tool Categories Directory</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-[#ECEBE9] tracking-tight">
                    All Tool Categories & Practical Use Cases
                  </h2>
                  <p className="text-xs md:text-sm text-[#A3A09B] leading-relaxed">
                    Explore DomoDomo's 15 distinct categories powering {TOOLS.length} client-side web utilities. Filter categories below or jump straight to any workspace suite.
                  </p>
                </div>

                {/* Filter Input */}
                <div className="w-full md:w-72 shrink-0">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#72706C]" />
                    <input
                      type="text"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      placeholder="Filter categories or use cases..."
                      className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl pl-9 pr-3 py-2 text-xs text-[#ECEBE9] placeholder:text-[#72706C] focus:outline-none focus:border-[#3C6B4D] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Grid of Category Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {filteredCategoryDetails.map((cat) => {
                  const Icon = cat.icon;
                  // Dynamic tool count for this category
                  const toolCount = TOOLS.filter((t) => t.categories?.includes(cat.id as any)).length;

                  return (
                    <div
                      key={cat.id}
                      className="glass-card p-6 border-[#2A2D30] bg-[#18191B] hover:border-[#3C6B4D]/50 transition-all duration-300 flex flex-col justify-between gap-6 group/card"
                    >
                      <div className="flex flex-col gap-4">
                        {/* Header: Icon, Title, Badges */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-[#3C6B4D]/10 border border-[#3C6B4D]/20 text-[#3C6B4D] group-hover/card:scale-105 transition-transform">
                              <Icon size={22} />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-[#ECEBE9] group-hover/card:text-[#4E8E5E] transition-colors">
                                {cat.name}
                              </h3>
                              <span className="text-[10px] text-[#3C6B4D] font-mono font-bold">
                                {toolCount > 0 ? `${toolCount} Functional Tools` : 'Suite Active'}
                              </span>
                            </div>
                          </div>

                          <span className="px-2.5 py-1 rounded-lg bg-[#111213] border border-[#2A2D30] text-[10px] font-semibold text-[#A3A09B] shrink-0">
                            {cat.badge}
                          </span>
                        </div>

                        {/* Tagline */}
                        <p className="text-xs font-semibold text-[#ECEBE9]/90 border-b border-[#2A2D30] pb-3">
                          {cat.tagline}
                        </p>

                        {/* Practical Use Case */}
                        <div className="bg-[#111213] p-3.5 rounded-xl border border-[#2A2D30] flex flex-col gap-1.5">
                          <div className="flex items-center gap-1.5 text-[#3C6B4D] text-[11px] font-bold">
                            <Lightbulb size={13} />
                            <span>Primary Use Case & Target Audience</span>
                          </div>
                          <p className="text-[11px] text-[#A3A09B] leading-relaxed">
                            {cat.useCase}
                          </p>
                        </div>

                        {/* Feature Highlights Pills */}
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-bold text-[#72706C] uppercase tracking-wider">
                            Key Tools & Features Included:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {cat.highlights.map((item, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-[#18191B] border border-[#2A2D30] text-[10px] text-[#ECEBE9] font-mono"
                              >
                                • {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => handleNavigateToCategory(cat.id)}
                        className="w-full btn-secondary py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 group-hover/card:bg-[#3C6B4D]/15 group-hover/card:border-[#3C6B4D]/40 group-hover/card:text-[#ECEBE9] transition-all mt-2"
                      >
                        <span>Explore {cat.name} Suite</span>
                        <ArrowRight size={13} className="text-[#3C6B4D] group-hover/card:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {activeTab === 'updates' && (
            <section className="glass-card p-6 md:p-8 border-[#2A2D30] bg-[#18191B] space-y-6 animate-fadeIn">
              <div className="max-w-2xl border-b border-[#2A2D30] pb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/20 text-xs font-semibold w-fit mb-2">
                  <Sparkles size={12} />
                  <span>Release History & Patches</span>
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-[#ECEBE9] tracking-tight">
                  What's New in DomoDomo
                </h2>
                <p className="text-[#A3A09B] text-xs leading-relaxed mt-1.5">
                  Track our latest commits, updates, patches, and client-side feature rollouts.
                </p>
              </div>

              <div className="flex flex-col gap-6">
                {[
                  {
                    version: "v2.0.0 (Latest)",
                    date: "July 28, 2026",
                    title: "AI Hub Studio, Fine-Tune Multi-Format Analysis & Edge-to-Edge Layout",
                    changes: [
                      "AI Hub Studio Release: Integrated ChatGPT-style multi-thread chat interface, local Ollama model management, dual-model side-by-side benchmark evaluator, and interactive node workflow automation pipeline.",
                      "Fine-Tune Studio & Multi-Format Ingestion: Expanded fine-tuning capabilities to ingest .json, .csv, .pdf, .txt, .md, and .docx document files with live word & token analysis, automated Q&A instruction pair extraction, and GGUF/Modelfile exports.",
                      "1-Click Model Deployment: Integrated 1-click model registration to compile and load custom fine-tuned models directly into Ollama via /api/create for live testing in Chat.",
                      "Full-Bleed Responsive Design & Expanded API Docs: Upgraded AI Hub Studio with 100% edge-to-edge max-width responsive layout, full desktop hamburger navigation integration, and comprehensive code snippets for JavaScript, Python, cURL, React, LangChain, and LlamaIndex."
                    ]
                  },
                  {
                    version: "v1.6.0",
                    date: "July 19, 2026",
                    title: "Machine Learning Evaluation & Model Benchmark Suite",
                    changes: [
                      "10 Machine Learning Utilities: Added Classification Evaluator & Confusion Matrix Inspector, ROC & PR Curve Analyzer, Regression Metrics & Residual Diagnostics, Multi-Model Leaderboard & Comparator, Dataset Data Drift & Feature Shift Inspector, Feature Importance & SHAP Explainer, Embedding Space & Vector Visualizer, Loss Curve Inspector, ONNX/TFLite Latency Benchmarker, and LLM & RAG Benchmark Studio.",
                      "100% Serverless ML Auditing: All statistical evaluations, t-SNE embedding projections, confusion matrices, and latency profiles execute locally in client browser memory."
                    ]
                  },
                  {
                    version: "v1.5.0",
                    date: "July 19, 2026",
                    title: "Computer Vision Tools Suite & Dynamic Counter Automation",
                    changes: [
                      "10 Computer Vision Utilities: Added local-first Bounding Box & Polygon Annotator, Auto-Magic Wand Segmentation, Batch Image Tagger, Semantic Pixel Brush Studio, COCO Pose Skeleton Annotator, Image Matting Cutout, Optical Flow Tracker, Synthetic Augmentor, Annotation Format Converter, and Auto Region Proposal Inspector.",
                      "Viewport Zoom & Canvas Scaling: Integrated Zoom In/Out/Reset controls and smooth CSS transform scaling across image annotation viewports.",
                      "Automated Metric Tracking: Automated live web utilities and category counters on the About screen to dynamically compute tool metrics directly from the registry as contributors add tools.",
                      "Synchronous Canvas Rendering: Preloaded HTMLImageElement rendering buffers to eliminate asynchronous image loading flicker and provide smooth 60fps brush painting."
                    ]
                  },
                  {
                    version: "v1.4.0",
                    date: "July 14, 2026",
                    title: "AI Research Orchestration Hub Launch",
                    changes: [
                      "AI Research Orchestration Hub: An offline, multi-agent sandbox workspace designed to orchestrate structured, loop-based research campaigns. It enables users to deploy custom-defined research agents (such as Deep Researchers, Synthesizers, and QA Auditors) powered by local Ollama models. Supports individual/shared memory banks and APA 7th bibliography citations."
                    ]
                  },
                  {
                    version: "v1.3.0",
                    date: "July 13, 2026",
                    title: "Companion Chat Screen & Settings Enhancements",
                    changes: [
                      "Domo Companion Draggability: Make the entire floating chat dialog draggable on desktop from any non-interactive part of the viewport, with mobile gesture separation to preserve touch scroll behavior.",
                      "Rich Markdown & Code Rendering: Integrated a lightweight markdown parser inside chat bubbles to support bold text, inline code snippets, formatted bullet lists, and scrollable/copyable code blocks with language indicators.",
                      "Contrast & Visibility Fixes: Resolved user response contrast colors to dynamically adapt to light/dark themes, yielding clear readable text on all message bubbles.",
                      "Vercel Deployment Compatibility: Detects hosted production environments to automatically display a settings warning banner and disable local configuration adjustments."
                    ]
                  },
                  {
                    version: "v1.2.0",
                    date: "July 2, 2026",
                    title: "Security Suite & Onboarding Enhancements",
                    changes: [
                      "SQL Workbench & Data Analyzer: Added a client-side SQL editor running in-memory on CSV/JSON file buffers with automated visual charting.",
                      "Sandboxed Local Background Remover: Redesigned the tool dashboard to feature interactive sample presets, visual step-by-step tutorial sliders, contextual toolbars, and comparison interactions.",
                      "DomoGuard AI Security: Local security tools integrated connecting directly to offline Ollama models including Threat Intel Chat, Incident Reporting, and Code Auditing.",
                      "10 New Developer Tools: SQL Formatter, YAML-JSON Converter, Glassmorphism Designer, Cron Expression Parser, and Base Number Converter."
                    ]
                  },
                  {
                    version: "v1.1.0",
                    date: "June 20, 2026",
                    title: "API Directory & Cognitive Learning Loop",
                    changes: [
                      "Library API Hub: Integrated directory hosting 1,900+ public APIs with immediate client-side pagination, categories, cURL copy execution command generators.",
                      "Local AI Knowledge Loop: Created secure offline read/write learning databases to persist conversations and tool usage metrics locally in IndexedDB storage."
                    ]
                  },
                  {
                    version: "v1.0.0",
                    date: "June 1, 2026",
                    title: "Core Workshop Launch",
                    changes: [
                      "Client-Side PDF Engines: Encrypt/Decrypt, Merge, and Compress PDFs fully inside browser sandbox memory without server overhead.",
                      "WASM Media Tools: Local image compressors, format converters, audio builders, and QR code encoders/decoders."
                    ]
                  }
                ].map((rel, idx) => (
                  <div key={idx} className="flex gap-4 items-start border-l-2 border-[#2A2D30] pl-6 ml-2 relative">
                    <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-[#3C6B4D] border border-[#2A2D30]" />
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded bg-[#3C6B4D]/15 text-[#4E8E5E] border border-[#3C6B4D]/30 text-[10px] font-bold uppercase tracking-wider">{rel.version}</span>
                        <span className="text-[10px] font-semibold text-[#72706C]">{rel.date}</span>
                      </div>
                      <h3 className="text-sm font-bold text-[#ECEBE9]">{rel.title}</h3>
                      <ul className="list-disc pl-4 space-y-1.5 text-xs text-[#A3A09B] leading-relaxed">
                        {rel.changes.map((change, cIdx) => (
                          <li key={cIdx}>{change}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'docs' && (
            <div className="animate-fadeIn w-full">
              <Documentation integrated={true} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
