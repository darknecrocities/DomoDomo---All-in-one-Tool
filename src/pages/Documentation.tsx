import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, BookOpen, Cpu, Shield, Terminal, Settings, GitBranch, Lock, Server, Layers, Brain } from 'lucide-react';
import { TOOLS_DOCS } from '../utils/ToolDocsData';
import type { ToolCategory } from '../utils/ToolDocsData';

type SectionId = 'intro' | 'sys-archi' | 'offline-flow' | 'local-ai-spec' | 'tools-ref' | 'setup-guide' | 'core-engines' | 'compliance';

export const Documentation = ({ integrated = false }: { integrated?: boolean }) => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SectionId>('intro');
  const [activeToolCategory, setActiveToolCategory] = useState<ToolCategory>('pdf');
  const [expandedToolId, setExpandedToolId] = useState<string | null>(null);

  const handleCategoryChange = (cat: ToolCategory) => {
    setActiveToolCategory(cat);
    setExpandedToolId(null);
  };

  const menuItems = [
    { id: 'intro', label: 'Introduction', icon: BookOpen },
    { id: 'sys-archi', label: 'System Architecture', icon: GitBranch },
    { id: 'offline-flow', label: 'Offline Flowchart', icon: Cpu },
    { id: 'local-ai-spec', label: 'Local AI & Cognitive Flow', icon: Brain },
    { id: 'tools-ref', label: 'Tools Reference', icon: Layers },
    { id: 'setup-guide', label: 'Setup & Install', icon: Terminal },
    { id: 'core-engines', label: 'Core Web Engines', icon: Settings },
    { id: 'compliance', label: 'Security & Compliance', icon: Shield },
  ] as const;

  return (
    <div className={integrated ? "w-full text-left" : "flex flex-col gap-8 text-left"}>
      {!integrated && (
        <>
          <Helmet>
            <title>DomoDomo Documentation - Technical Guides & Spec</title>
            <meta name="description" content="Read the technical specifications of DomoDomo. Understand how WebAssembly (WASM), WebGPU, Web Audio, and local browser sandboxes execute private tools offline." />
            <link rel="canonical" href="https://domodomo.site/docs" />
          </Helmet>
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
        </>
      )}

      {/* Docs Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
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
                DomoDomo is designed as a <strong className="font-bold text-[#ECEBE9]">Local-First Web Workshop</strong>. Unlike typical SaaS productivity tools that process your media assets, documents, and private credentials on remote cloud servers, DomoDomo compiles and executes all operations client-side inside the user's browser sandbox.
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
            <div className="flex flex-col gap-6">
              <h2 className="text-xl font-bold text-[#ECEBE9] border-b border-[#2A2D30] pb-3">System Architecture Spec</h2>
              <p className="text-[#A3A09B] text-xs md:text-sm leading-relaxed">
                DomoDomo executes functional scripts, local vector indexing, and neural operations inside a <strong className="font-bold text-[#ECEBE9]">telemetry-free client sandbox</strong>. Below is the multi-layered layout containing 24 distinct system components:
              </p>

              {/* Extended Architecture SVG Map */}
              <div className="bg-[#111213] border border-[#2A2D30] p-6 rounded-2xl flex items-center justify-center overflow-x-auto">
                <svg width="640" height="560" viewBox="0 0 640 560" fill="none" className="min-w-[620px]">
                  {/* Layer 1: Client Sandbox */}
                  <rect x="15" y="45" width="610" height="235" rx="10" fill="#141517" stroke="#2A2D30" strokeWidth="1.5" />
                  <text x="30" y="60" fill="#72706C" fontSize="8" fontFamily="monospace" fontWeight="bold">1. CLIENT BROWSER SANDBOX (REACT SPA / WEB ENVIRONMENT)</text>
                  
                  {/* Row 1 components */}
                  <rect x="30" y="75" width="70" height="35" rx="4" fill="#18191B" stroke="#2A2D30" />
                  <text x="65" y="95" fill="#ECEBE9" fontSize="8" textAnchor="middle">UI Viewport</text>
                  
                  <rect x="110" y="75" width="80" height="35" rx="4" fill="#18191B" stroke="#2A2D30" />
                  <text x="150" y="95" fill="#ECEBE9" fontSize="8" textAnchor="middle">Tool Registry</text>

                  <rect x="200" y="75" width="110" height="35" rx="4" fill="#18191B" stroke="#2A2D30" />
                  <text x="255" y="95" fill="#ECEBE9" fontSize="8" textAnchor="middle">Agent Orchestrator</text>

                  <rect x="320" y="75" width="75" height="35" rx="4" fill="#18191B" stroke="#2A2D30" />
                  <text x="357" y="95" fill="#ECEBE9" fontSize="8" textAnchor="middle">Auto Pilot</text>

                  <rect x="405" y="75" width="100" height="35" rx="4" fill="#18191B" stroke="#2A2D30" />
                  <text x="455" y="95" fill="#ECEBE9" fontSize="8" textAnchor="middle">IDB user_profile</text>

                  <rect x="515" y="75" width="95" height="35" rx="4" fill="#18191B" stroke="#2A2D30" />
                  <text x="562" y="95" fill="#ECEBE9" fontSize="8" textAnchor="middle">IDB event_history</text>

                  {/* Row 2 components */}
                  <rect x="30" y="125" width="85" height="35" rx="4" fill="#18191B" stroke="#2A2D30" />
                  <text x="72" y="145" fill="#A3A09B" fontSize="8" textAnchor="middle">Canvas Matrix</text>

                  <rect x="125" y="125" width="90" height="35" rx="4" fill="#18191B" stroke="#2A2D30" />
                  <text x="170" y="145" fill="#A3A09B" fontSize="8" textAnchor="middle">Web Audio API</text>

                  <rect x="225" y="125" width="95" height="35" rx="4" fill="#18191B" stroke="#3C6B4D" strokeWidth="1" />
                  <text x="272" y="145" fill="#3C6B4D" fontSize="8" textAnchor="middle" fontWeight="bold">pdf-lib (WASM)</text>

                  <rect x="330" y="125" width="105" height="35" rx="4" fill="#18191B" stroke="#3C6B4D" strokeWidth="1" />
                  <text x="382" y="145" fill="#3C6B4D" fontSize="8" textAnchor="middle" fontWeight="bold">Tesseract (WASM)</text>

                  <rect x="445" y="125" width="165" height="35" rx="4" fill="#18191B" stroke="#3C6B4D" strokeWidth="1" />
                  <text x="527" y="145" fill="#3C6B4D" fontSize="8" textAnchor="middle" fontWeight="bold">Transformers.js (Embedder)</text>

                  {/* Core engine integration box */}
                  <rect x="180" y="185" width="280" height="40" rx="6" fill="#111213" stroke="#3C6B4D" strokeWidth="1.5" />
                  <text x="320" y="205" fill="#ECEBE9" fontSize="10" textAnchor="middle" fontWeight="bold">DomoDomo Unified Memory Manager</text>

                  {/* Flow arrows */}
                  <path d="M70 110 V125" stroke="#2A2D30" strokeWidth="1.5" />
                  <path d="M150 110 V125" stroke="#2A2D30" strokeWidth="1.5" />
                  <path d="M357 110 V125" stroke="#2A2D30" strokeWidth="1.5" />
                  <path d="M320 225 V245" stroke="#3C6B4D" strokeWidth="1.5" markerEnd="url(#archi-arrow)" />


                  {/* Layer 2: Network transport & Security */}
                  <rect x="15" y="295" width="610" height="50" rx="10" fill="#141517" stroke="#2A2D30" strokeWidth="1.5" />
                  <text x="30" y="308" fill="#72706C" fontSize="8" fontFamily="monospace" fontWeight="bold">2. LOCAL TRANSPORT & CORS CONTROL BOUNDARY</text>
                  
                  <rect x="30" y="312" width="160" height="25" rx="4" fill="#18191B" stroke="#2A2D30" />
                  <text x="110" y="327" fill="#E29E2D" fontSize="8" textAnchor="middle">CORS Origin Validator</text>

                  <rect x="200" y="312" width="180" height="25" rx="4" fill="#18191B" stroke="#3C6B4D" strokeWidth="1" />
                  <text x="290" y="327" fill="#3C6B4D" fontSize="8" textAnchor="middle" fontWeight="bold">Fetch Stream Packet Reader</text>

                  <rect x="390" y="312" width="220" height="25" rx="4" fill="#18191B" stroke="#2A2D30" />
                  <text x="500" y="327" fill="#ECEBE9" fontSize="8" textAnchor="middle">Port Sockets (SSE / HTTP 3001 & 8000)</text>


                  {/* Layer 3: Python FastAPI Backend */}
                  <rect x="15" y="360" width="610" height="100" rx="10" fill="#141517" stroke="#3C6B4D" strokeWidth="1.5" />
                  <text x="30" y="373" fill="#72706C" fontSize="8" fontFamily="monospace" fontWeight="bold">3. LOCAL FASTAPI PY-ENGINE (PORT 8000 BACKEND CONTEXT)</text>

                  <rect x="30" y="380" width="130" height="30" rx="4" fill="#18191B" stroke="#2A2D30" />
                  <text x="95" y="398" fill="#ECEBE9" fontSize="8" textAnchor="middle">Uvicorn API Routing</text>

                  <rect x="170" y="380" width="130" height="30" rx="4" fill="#18191B" stroke="#2A2D30" />
                  <text x="235" y="398" fill="#ECEBE9" fontSize="8" textAnchor="middle">Prompt Caching Layer</text>

                  <rect x="310" y="380" width="135" height="30" rx="4" fill="#18191B" stroke="#E29E2D" strokeWidth="1" />
                  <text x="377" y="398" fill="#E29E2D" fontSize="8" textAnchor="middle" fontWeight="bold">Background Work Queue</text>

                  <rect x="455" y="380" width="155" height="30" rx="4" fill="#18191B" stroke="#2A2D30" />
                  <text x="532" y="398" fill="#ECEBE9" fontSize="8" textAnchor="middle">Similarity Dot-Evaluator</text>

                  <rect x="180" y="420" width="280" height="30" rx="4" fill="#111213" stroke="#3C6B4D" strokeWidth="1.5" />
                  <text x="320" y="438" fill="#3C6B4D" fontSize="9" textAnchor="middle" fontWeight="bold">SQLite WAL Database (activityevent & thought schemas)</text>


                  {/* Layer 4: Host Machine Runtimes */}
                  <rect x="15" y="475" width="610" height="70" rx="10" fill="#141517" stroke="#2A2D30" strokeWidth="1.5" />
                  <text x="30" y="488" fill="#72706C" fontSize="8" fontFamily="monospace" fontWeight="bold">4. HOST MACHINE WORKSPACE DIRECTORY & RUNTIMES</text>

                  <rect x="30" y="495" width="130" height="40" rx="4" fill="#18191B" stroke="#2A2D30" />
                  <text x="95" y="515" fill="#ECEBE9" fontSize="8" textAnchor="middle" fontWeight="bold">Ollama (Port 11434)</text>

                  <rect x="170" y="495" width="140" height="40" rx="4" fill="#18191B" stroke="#E29E2D" strokeWidth="1" />
                  <text x="240" y="515" fill="#E29E2D" fontSize="8" textAnchor="middle" fontWeight="bold">domo_journal.md</text>

                  <rect x="320" y="495" width="135" height="40" rx="4" fill="#18191B" stroke="#2A2D30" />
                  <text x="387" y="515" fill="#ECEBE9" fontSize="8" textAnchor="middle">Mounted Directories</text>

                  <rect x="465" y="495" width="145" height="40" rx="4" fill="#18191B" stroke="#3C6B4D" strokeWidth="1" />
                  <text x="537" y="515" fill="#3C6B4D" fontSize="8" textAnchor="middle" fontWeight="bold">start-backend controller</text>

                  {/* Connecting flow lines */}
                  <path d="M95 410 V475" stroke="#2A2D30" strokeWidth="1" strokeDasharray="2 2" />
                  <path d="M235 450 V495" stroke="#E29E2D" strokeWidth="1" strokeDasharray="2 2" />
                  <path d="M387 450 V495" stroke="#2A2D30" strokeWidth="1" strokeDasharray="2 2" />

                  <defs>
                    <marker id="archi-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#3C6B4D" />
                    </marker>
                  </defs>
                </svg>
              </div>

              {/* Advantages Spec */}
              <div className="flex flex-col gap-5 text-xs text-left mt-3">
                <h3 className="font-bold text-[#ECEBE9] text-sm">Key Architectural Highlights & Advantages</h3>
                <p className="text-[#A3A09B] leading-relaxed">
                  DomoDomo's decentralized multi-layer system architecture yields multiple operational, security, and performance benefits compared to traditional SaaS utilities:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#111213] border border-[#2A2D30] p-4.5 rounded-2xl flex flex-col gap-1.5">
                    <span className="font-bold text-[#3C6B4D]">🛡️ Zero data-leakage (Sovereign Privacy)</span>
                    <p className="text-[#A3A09B] leading-relaxed text-[11px]">
                      Because all binaries compile and process client-side inside isolated browser worker threads, no data packets containing credentials, documents, or photos cross network interfaces. This fully satisfies enterprise data classification boundaries.
                    </p>
                  </div>

                  <div className="bg-[#111213] border border-[#2A2D30] p-4.5 rounded-2xl flex flex-col gap-1.5">
                    <span className="font-bold text-[#3C6B4D]">⚡ Low-Latency Processing & SSE Streams</span>
                    <p className="text-[#A3A09B] leading-relaxed text-[11px]">
                      Bypassing external REST queries eliminates connection overhead. Local Python and Ollama responses stream directly via Server-Sent Events (SSE), reducing initial token loading response times from 20+ seconds to under 300ms.
                    </p>
                  </div>

                  <div className="bg-[#111213] border border-[#2A2D30] p-4.5 rounded-2xl flex flex-col gap-1.5">
                    <span className="font-bold text-[#E29E2D]">⚙️ Dual-Cache Memory Hub</span>
                    <p className="text-[#A3A09B] leading-relaxed text-[11px]">
                      Lightweight state settings and action timestamps sync inside IndexedDB tables, while large semantic vector models persist inside a local SQLite WAL database. Prompt requests carry top-3 RAG matches to eliminate model hallucinations.
                    </p>
                  </div>

                  <div className="bg-[#111213] border border-[#2A2D30] p-4.5 rounded-2xl flex flex-col gap-1.5">
                    <span className="font-bold text-[#E29E2D]">🔨 Automated Environment Setup</span>
                    <p className="text-[#A3A09B] leading-relaxed text-[11px]">
                      The Node virtualenv auto-bootstrapper removes the need for manual python environments setup. The launcher installs pip packages dynamically when requirements are modified, keeping workspace dependencies in sync.
                    </p>
                  </div>
                </div>
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

          {activeSection === 'local-ai-spec' && (
            <div className="flex flex-col gap-6">
              <h2 className="text-xl font-bold text-[#ECEBE9] border-b border-[#2A2D30] pb-3">Local AI & Cognitive Flow</h2>
              <p className="text-[#A3A09B] text-xs md:text-sm leading-relaxed">
                DomoDomo implements a zero-cloud local RAG (Retrieval-Augmented Generation) loop and a persistent, append-only markdown journal. This combines high-speed, CORS-free proxying with asynchronous AI cognitive logs.
              </p>

              {/* Cognitive Flow SVG Diagram */}
              <div className="bg-[#111213] border border-[#2A2D30] p-6 rounded-2xl flex flex-col items-center justify-center overflow-x-auto gap-4">
                <svg width="600" height="340" viewBox="0 0 600 340" fill="none" className="min-w-[500px]">
                  {/* Outer boundary */}
                  <rect x="10" y="10" width="580" height="320" rx="12" fill="#18191B" stroke="#2A2D30" strokeWidth="2" />
                  <text x="30" y="38" fill="#72706C" fontSize="9" fontFamily="monospace" fontWeight="bold">LOCAL COGNITIVE MEMORY & RAG PROCESS FLOW</text>

                  {/* Node 1: User Input */}
                  <rect x="30" y="130" width="110" height="60" rx="8" fill="#111213" stroke="#2A2D30" />
                  <text x="85" y="152" fill="#ECEBE9" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">User Request</text>
                  <text x="85" y="170" fill="#72706C" fontSize="8" fontFamily="monospace" textAnchor="middle">Chat / Log event</text>

                  {/* Arrow 1: User -> Ollama Proxy */}
                  <path d="M140 160 H210" stroke="#3C6B4D" strokeWidth="1.5" markerEnd="url(#cog-arrow)" />

                  {/* Node 2: Ollama Proxy */}
                  <rect x="210" y="125" width="130" height="70" rx="8" fill="#111213" stroke="#3C6B4D" strokeWidth="1.5" />
                  <text x="275" y="145" fill="#ECEBE9" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Ollama Proxy</text>
                  <text x="275" y="163" fill="#3C6B4D" fontSize="8" fontFamily="monospace" textAnchor="middle">FastAPI (Port 8000)</text>
                  <text x="275" y="178" fill="#A3A09B" fontSize="8" fontFamily="sans-serif" textAnchor="middle">Bypasses CORS & Caches</text>

                  {/* Arrow 2: Proxy -> SQLite Vector DB */}
                  <path d="M275 125 V75 H370" stroke="#3C6B4D" strokeWidth="1.5" markerEnd="url(#cog-arrow)" />
                  <text x="310" y="70" fill="#72706C" fontSize="8" fontFamily="sans-serif">Vector Search</text>

                  {/* Node 3: SQLite Vector Store */}
                  <rect x="370" y="45" width="180" height="60" rx="8" fill="#111213" stroke="#2A2D30" />
                  <text x="460" y="67" fill="#ECEBE9" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">SQLite DB (WAL Mode)</text>
                  <text x="460" y="85" fill="#72706C" fontSize="8" fontFamily="monospace" textAnchor="middle">Cosine Similarity / RAG</text>

                  {/* Arrow 3: SQLite -> Proxy (Context injection) */}
                  <path d="M370 90 H300 V125" stroke="#3C6B4D" strokeWidth="1.5" markerEnd="url(#cog-arrow)" />

                  {/* Arrow 4: Proxy -> Local Journal (Async task) */}
                  <path d="M275 195 V255 H370" stroke="#E29E2D" strokeWidth="1.5" strokeDasharray="3 3" markerEnd="url(#cog-arrow)" />
                  <text x="310" y="248" fill="#E29E2D" fontSize="8" fontFamily="sans-serif">Async Logging</text>

                  {/* Node 4: Cognitive Journal */}
                  <rect x="370" y="225" width="180" height="60" rx="8" fill="#111213" stroke="#E29E2D" />
                  <text x="460" y="247" fill="#ECEBE9" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">domo_journal.md</text>
                  <text x="460" y="265" fill="#E29E2D" fontSize="8" fontFamily="monospace" textAnchor="middle">Append-Only MD Logs</text>

                  {/* Return Arrow: Proxy -> User */}
                  <path d="M210 175 H140" stroke="#3C6B4D" strokeWidth="1.5" markerEnd="url(#cog-arrow)" />
                  <text x="175" y="188" fill="#3C6B4D" fontSize="8" fontFamily="sans-serif" textAnchor="middle">SSE Stream</text>

                  <defs>
                    <marker id="cog-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#3C6B4D" />
                    </marker>
                  </defs>
                </svg>

                {/* Storage Schema SVG */}
                <svg width="600" height="280" viewBox="0 0 600 280" fill="none" className="min-w-[500px] border-t border-[#2A2D30] pt-4">
                  <rect x="10" y="10" width="580" height="260" rx="12" fill="#18191B" stroke="#2A2D30" strokeWidth="2" />
                  <text x="30" y="38" fill="#72706C" fontSize="9" fontFamily="monospace" fontWeight="bold">COGNITIVE DATA STORES & STORAGE SCHEMAS</text>

                  {/* Group 1: Browser Storage */}
                  <rect x="30" y="65" width="160" height="180" rx="8" fill="#111213" stroke="#2A2D30" />
                  <text x="110" y="85" fill="#ECEBE9" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Browser client (IndexedDB)</text>
                  <rect x="45" y="105" width="130" height="30" rx="4" fill="#18191B" stroke="#2A2D30" />
                  <text x="110" y="123" fill="#A3A09B" fontSize="9" textAnchor="middle">User Identity / Profiles</text>
                  <rect x="45" y="145" width="130" height="30" rx="4" fill="#18191B" stroke="#2A2D30" />
                  <text x="110" y="163" fill="#A3A09B" fontSize="9" textAnchor="middle">Recent Action Timelines</text>
                  <rect x="45" y="185" width="130" height="30" rx="4" fill="#18191B" stroke="#2A2D30" />
                  <text x="110" y="203" fill="#A3A09B" fontSize="9" textAnchor="middle">Knowledge Vault Cache</text>

                  {/* Arrow IDB -> SQLite */}
                  <path d="M190 155 H230" stroke="#3C6B4D" strokeWidth="1.5" markerEnd="url(#schema-arrow)" />

                  {/* Group 2: Local Python SQL Database */}
                  <rect x="230" y="65" width="160" height="180" rx="8" fill="#111213" stroke="#3C6B4D" strokeWidth="1.5" />
                  <text x="310" y="85" fill="#ECEBE9" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Python Backend (SQLite)</text>
                  <rect x="245" y="105" width="130" height="40" rx="4" fill="#18191B" stroke="#2A2D30" />
                  <text x="310" y="121" fill="#A3A09B" fontSize="9" textAnchor="middle">Activity DB Events</text>
                  <text x="310" y="136" fill="#72706C" fontSize="8" fontFamily="monospace" textAnchor="middle">Table: activityevent</text>
                  <rect x="245" y="160" width="130" height="55" rx="4" fill="#18191B" stroke="#3C6B4D" strokeWidth="1" />
                  <text x="310" y="176" fill="#ECEBE9" fontSize="9" textAnchor="middle" fontWeight="bold">Vector Thoughts Table</text>
                  <text x="310" y="191" fill="#3C6B4D" fontSize="8" fontFamily="monospace" textAnchor="middle">content + embedding_json</text>
                  <text x="310" y="203" fill="#72706C" fontSize="7" fontFamily="monospace" textAnchor="middle">Table: thought</text>

                  {/* Arrow SQLite -> MD Journal */}
                  <path d="M390 155 H430" stroke="#E29E2D" strokeWidth="1.5" markerEnd="url(#schema-arrow)" />

                  {/* Group 3: Local Workspace File */}
                  <rect x="430" y="65" width="140" height="180" rx="8" fill="#111213" stroke="#E29E2D" strokeWidth="1" />
                  <text x="500" y="85" fill="#ECEBE9" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Local Workspace</text>
                  <rect x="442" y="115" width="116" height="85" rx="4" fill="#18191B" stroke="#E29E2D" />
                  <text x="500" y="140" fill="#ECEBE9" fontSize="10" textAnchor="middle" fontWeight="bold">domo_journal.md</text>
                  <text x="500" y="160" fill="#A3A09B" fontSize="8" textAnchor="middle">AI Cognitive Reflections</text>
                  <text x="500" y="175" fill="#72706C" fontSize="8" textAnchor="middle">Append-Only / Plain-text</text>

                  <defs>
                    <marker id="schema-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#3C6B4D" />
                    </marker>
                  </defs>
                </svg>

                {/* Vector Similarity Sequence SVG */}
                <svg width="600" height="300" viewBox="0 0 600 300" fill="none" className="min-w-[500px] border-t border-[#2A2D30] pt-4">
                  <rect x="10" y="10" width="580" height="280" rx="12" fill="#18191B" stroke="#2A2D30" strokeWidth="2" />
                  <text x="30" y="38" fill="#72706C" fontSize="9" fontFamily="monospace" fontWeight="bold">VECTOR EMBEDDING & COSINE SIMILARITY PIPELINE</text>

                  {/* Input Query */}
                  <rect x="30" y="125" width="100" height="50" rx="6" fill="#111213" stroke="#2A2D30" />
                  <text x="80" y="145" fill="#ECEBE9" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Input String</text>
                  <text x="80" y="160" fill="#72706C" fontSize="8" fontFamily="monospace" textAnchor="middle">"coding sports"</text>

                  {/* Arrow 1 */}
                  <path d="M130 150 H180" stroke="#3C6B4D" strokeWidth="1.5" markerEnd="url(#sim-arrow)" />

                  {/* Embedding Generator */}
                  <rect x="180" y="115" width="140" height="70" rx="8" fill="#111213" stroke="#3C6B4D" strokeWidth="1.5" />
                  <text x="250" y="135" fill="#ECEBE9" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Embedding Engine</text>
                  <text x="250" y="153" fill="#3C6B4D" fontSize="8" fontFamily="monospace" textAnchor="middle">all-MiniLM-L6-v2</text>
                  <text x="250" y="168" fill="#A3A09B" fontSize="8" fontFamily="sans-serif" textAnchor="middle">384-Dimension Vector</text>

                  {/* Arrow 2 */}
                  <path d="M320 150 H370" stroke="#3C6B4D" strokeWidth="1.5" markerEnd="url(#sim-arrow)" />

                  {/* Vector Array Output */}
                  <rect x="370" y="125" width="120" height="50" rx="6" fill="#111213" stroke="#2A2D30" />
                  <text x="430" y="143" fill="#ECEBE9" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">[0.12, -0.45, 0.78, ...]</text>
                  <text x="430" y="158" fill="#72706C" fontSize="8" fontFamily="sans-serif" textAnchor="middle">Float32 Bounding Array</text>

                  {/* Formula Calculation Box */}
                  <rect x="140" y="215" width="340" height="50" rx="8" fill="#111213" stroke="#E29E2D" strokeDasharray="3 3" />
                  <text x="310" y="235" fill="#ECEBE9" fontSize="9" fontFamily="monospace" textAnchor="middle">Cosine Similarity = (A • B) / (||A|| * ||B||)</text>
                  <text x="310" y="250" fill="#E29E2D" fontSize="8" fontFamily="sans-serif" textAnchor="middle">Evaluated in Python via SqlModel in &lt; 5ms</text>

                  {/* Link vector to formula */}
                  <path d="M430 175 V215" stroke="#E29E2D" strokeWidth="1" strokeDasharray="2 2" />
                  <path d="M250 185 V215" stroke="#E29E2D" strokeWidth="1" strokeDasharray="2 2" />

                  <defs>
                    <marker id="sim-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#3C6B4D" />
                    </marker>
                  </defs>
                </svg>
              </div>

              {/* Core Component Specifications Deep-Dives */}
              <div className="flex flex-col gap-6 text-xs text-left">
                {/* 1. Unified Memory Systems */}
                <div className="flex flex-col gap-2.5 bg-[#111213] border border-[#2A2D30] p-5 rounded-2xl">
                  <span className="text-xs uppercase tracking-wider text-[#3C6B4D] font-bold">1. Unified Memory Architecture</span>
                  <p className="text-[#A3A09B] leading-relaxed">
                    DomoDomo's memory layout coordinates browser-local caches and background SQL systems to ensure context continuity:
                  </p>
                  <ul className="list-disc list-inside text-[#A3A09B] flex flex-col gap-1.5 pl-2 mt-1 leading-relaxed">
                    <li><strong className="text-[#ECEBE9]">Dual-Database Synapse Model</strong>: Combines client-side IndexedDB databases (timelines, logs, settings) with a python-side SQLite database running in Write-Ahead Logging (WAL) mode for complex semantic vector operations and SQLModel schemas.</li>
                    <li><strong className="text-[#ECEBE9]">Cosine Similarity Mechanics</strong>: Calculates cosine similarities locally using dot product vector multiplication. Prompts trigger searches matching query vector A against database vector B to score similarity values.</li>
                    <li><strong className="text-[#ECEBE9]">Deterministic Array Fallbacks</strong>: Generates stable, deterministic float arrays if transformers.js or local ports hit a 3-second network deadline, maintaining logical stability.</li>
                  </ul>
                </div>

                {/* 2. Persistent Cognitive Journals */}
                <div className="flex flex-col gap-2.5 bg-[#111213] border border-[#2A2D30] p-5 rounded-2xl">
                  <span className="text-xs uppercase tracking-wider text-[#E29E2D] font-bold">2. Local AI Cognitive Journals</span>
                  <p className="text-[#A3A09B] leading-relaxed">
                    DomoDomo compiles user session reflections and AI insights into a persistent, append-only Markdown document <code className="text-[#E29E2D] font-mono text-[10px]">domo_journal.md</code> located in the root of your workspace:
                  </p>
                  <ul className="list-disc list-inside text-[#A3A09B] flex flex-col gap-1.5 pl-2 mt-1 leading-relaxed">
                    <li><strong className="text-[#ECEBE9]">Asynchronous Background Workers</strong>: Logs are written using FastAPI's <code className="text-[#ECEBE9] font-mono text-[10px]">BackgroundTasks</code> worker threads. Reflections compile after the server delivers the client stream, keeping response times snappy.</li>
                    <li><strong className="text-[#ECEBE9]">Model Reflection Persona</strong>: Prompts command Ollama to write in the first-person as a reflective, offline AI, recording its internal state, feelings, and learnings.</li>
                    <li><strong className="text-[#ECEBE9]">Git-Ignored Isolation</strong>: Listed under the root <code className="text-[#E29E2D] font-mono text-[10px] bg-[#18191B] px-1 py-0.5 rounded">.gitignore</code> file to prevent telemetry or private logging leaks to public version control.</li>
                  </ul>
                </div>

                {/* 3. Local Artifacts & Agent Knowledge */}
                <div className="flex flex-col gap-2.5 bg-[#111213] border border-[#2A2D30] p-5 rounded-2xl">
                  <span className="text-xs uppercase tracking-wider text-[#72706C] font-bold">3. Local Artifacts & Agent Knowledge</span>
                  <p className="text-[#A3A09B] leading-relaxed">
                    Local documents and parsed assets act as context artifacts that feed back into the AI. RAG searches retrieve matches from SQLite, inject them into the system prompt constraints, and guide the local model's responses:
                  </p>
                  <ul className="list-disc list-inside text-[#A3A09B] flex flex-col gap-1.5 pl-2 mt-1 leading-relaxed">
                    <li><strong className="text-[#ECEBE9]">RAG Prompt Constraints</strong>: Selects matching thought nodes with a similarity score greater than or equal to 0.35 and isolates the top 3 matches to keep prompt payloads under model context limits.</li>
                    <li><strong className="text-[#ECEBE9]">System Prompt Shielding</strong>: Injects memory blocks into the system prompt parameters instead of appending them to the user message. This protects smaller local models from context drift.</li>
                    <li><strong className="text-[#ECEBE9]">Document Parsing Artifacts</strong>: Parses files natively via WebAssembly (PDF stream readers) and HTML5 Canvas coordinate matrices. These strings serve as factual artifacts to augment chat responses.</li>
                  </ul>
                </div>

                {/* 4. Domo Companion (Floating AI Assistant) */}
                <div className="flex flex-col gap-2.5 bg-[#111213] border border-[#2A2D30] p-5 rounded-2xl">
                  <span className="text-xs uppercase tracking-wider text-[#3C6B4D] font-bold">4. Domo Companion (Floating AI Assistant)</span>
                  <p className="text-[#A3A09B] leading-relaxed">
                    DomoDomo incorporates a persistent, overlay companion assistant designed for interactive queries and workspace navigation. It runs completely offline and bridges active screen state with local LLM prompts:
                  </p>
                  <ul className="list-disc list-inside text-[#A3A09B] flex flex-col gap-1.5 pl-2 mt-1 leading-relaxed">
                    <li><strong className="text-[#ECEBE9]">Entire Chat Screen Draggability</strong>: Features high-fidelity layout dragging. Users can click and drag the companion anywhere on their desktop viewport from any non-interactive part of the chat interface. Dragging is automatically bypassed on inputs, buttons, and scrollbar zones to maintain standard widget interactivity.</li>
                    <li><strong className="text-[#ECEBE9]">Mobile Scroll-Drag Preservation</strong>: Employs intelligent gesture division on mobile/touch viewports. Dragging is allowed via the header/borders, while swipe gestures inside scrollable zones (like the messages log or prompts menu) execute local content scrolling.</li>
                    <li><strong className="text-[#ECEBE9]">Active Tab Context Sensing</strong>: The assistant tracks user routing in real time, automatically harvesting context data (e.g., specific active tool page metadata, system configuration states) to automatically feed into system instructions without cloud logs.</li>
                    <li><strong className="text-[#ECEBE9]">Custom Settings & Glowing Styles</strong>: Provides options in system configurations to override active model preferences (such as Ollama's <code className="text-[#ECEBE9] font-mono text-[10px]">llama3.2:1b</code>), assistant prompt personas, and floating glows (ranging from subtle pulse glows to high shadow alerts).</li>
                  </ul>
                </div>

                {/* Advantages section */}
                <h3 className="font-bold text-[#ECEBE9] text-sm mt-3">Comparison & Architecture Advantages</h3>
                <p className="text-[#A3A09B] leading-relaxed">
                  Compared to traditional cloud-based AI solutions (like ChatGPT Plus or Claude Web UI) or generic local wrappers, DomoDomo's localized cognitive architecture offers key security and performance advantages:
                </p>

                <div className="overflow-x-auto mt-2">
                  <table className="w-full text-left border-collapse border border-[#2A2D30] text-[11px]">
                    <thead>
                      <tr className="bg-[#111213] border-b border-[#2A2D30] text-[#ECEBE9]">
                        <th className="p-3 border-r border-[#2A2D30] font-bold">Feature Metric</th>
                        <th className="p-3 border-r border-[#2A2D30] font-bold text-[#3C6B4D]">DomoDomo Local RAG</th>
                        <th className="p-3 font-bold text-[#E29E2D]">Standard Cloud AI Systems</th>
                      </tr>
                    </thead>
                    <tbody className="text-[#A3A09B] divide-y divide-[#2A2D30]">
                      <tr className="hover:bg-[#111213]/40">
                        <td className="p-3 font-bold text-[#ECEBE9] border-r border-[#2A2D30]">Data Sovereignty</td>
                        <td className="p-3 border-r border-[#2A2D30] text-[#ECEBE9]">100% Client-Side. No files or chat entries leave localhost.</td>
                        <td className="p-3">Data transmitted to third-party endpoints, raising leak risks.</td>
                      </tr>
                      <tr className="hover:bg-[#111213]/40">
                        <td className="p-3 font-bold text-[#ECEBE9] border-r border-[#2A2D30]">Operational Cost</td>
                        <td className="p-3 border-r border-[#2A2D30] text-[#ECEBE9]">Zero subscription fees. Free unlimited local compute.</td>
                        <td className="p-3">Requires monthly subscriptions or pay-per-token API credits.</td>
                      </tr>
                      <tr className="hover:bg-[#111213]/40">
                        <td className="p-3 font-bold text-[#ECEBE9] border-r border-[#2A2D30]">Offline Capability</td>
                        <td className="p-3 border-r border-[#2A2D30] text-[#ECEBE9]">Runs fully offline. Network is not required to chat or query vectors.</td>
                        <td className="p-3">Becomes useless if internet connection drops or API servers go down.</td>
                      </tr>
                      <tr className="hover:bg-[#111213]/40">
                        <td className="p-3 font-bold text-[#ECEBE9] border-r border-[#2A2D30]">CORS & Loading Latency</td>
                        <td className="p-3 border-r border-[#2A2D30] text-[#ECEBE9]">Bypassed via local proxy. Streaming chunks render under 300ms.</td>
                        <td className="p-3">Blocked by browser CORS or high queuing latency during traffic peaks.</td>
                      </tr>
                      <tr className="hover:bg-[#111213]/40">
                        <td className="p-3 font-bold text-[#ECEBE9] border-r border-[#2A2D30]">Memory Persistence</td>
                        <td className="p-3 border-r border-[#2A2D30] text-[#ECEBE9]">Structured sqlite vector tables synced dynamically to a plain-text journal.</td>
                        <td className="p-3">Volatile memory or server-managed databases with no plain-text access.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
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
                {Object.entries(TOOLS_DOCS).map(([key]) => {
                  const labelMap: Record<string, string> = {
                    pdf: 'PDF',
                    photo: 'Photo',
                    document: 'Document',
                    converter: 'Converter',
                    qr: 'QR Code',
                    video: 'Video',
                    audio: 'Audio',
                    dev: 'Developer',
                    security: 'Security',
                    ai: 'Local AI',
                    data: 'Data',
                    cv: 'Computer Vision',
                    ml: 'Machine Learning',
                    spatial: 'Spatial 3D',
                  };
                  return (
                    <button
                      key={key}
                      onClick={() => handleCategoryChange(key as ToolCategory)}
                      className={`py-1.5 px-3 rounded-lg text-[11px] font-bold transition-all border ${
                        activeToolCategory === key
                          ? 'bg-[#3C6B4D]/10 text-[#3C6B4D] border-[#3C6B4D]/25 shadow-sm'
                          : 'bg-[#111213] text-[#72706C] border-[#2A2D30] hover:text-[#A3A09B]'
                      }`}
                    >
                      {labelMap[key] || key}
                    </button>
                  );
                })}
              </div>

              {/* Active Category Header */}
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-[#ECEBE9] text-base">{TOOLS_DOCS[activeToolCategory].title}</h3>
                <p className="text-[#A3A09B] text-xs leading-relaxed">{TOOLS_DOCS[activeToolCategory].desc}</p>
              </div>

              {/* Tools Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {TOOLS_DOCS[activeToolCategory].list.map((tool) => {
                  const isExpanded = expandedToolId === tool.id;
                  return (
                    <div
                      key={tool.id}
                      className={`bg-[#111213] border border-[#2A2D30] p-5 rounded-2xl flex flex-col gap-3 transition-all duration-300 ${
                        isExpanded ? 'col-span-1 md:col-span-2 border-[#3C6B4D]/60 bg-[#141618]' : 'hover:border-[#2A2D30]/80'
                      }`}
                    >
                      <div className="flex flex-col gap-1.5">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <span className="font-bold text-[#ECEBE9] text-xs font-mono leading-snug flex-1 min-w-[140px]">
                            {tool.name}
                          </span>
                          <span className="px-2 py-0.5 bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/25 rounded text-[9px] font-mono leading-tight whitespace-normal max-w-full">
                            {tool.engine}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#72706C] font-mono">ID: {tool.id}</span>
                      </div>
                      
                      <p className="text-[#A3A09B] text-[10px] leading-relaxed">
                        {tool.details}
                      </p>

                      {isExpanded && (
                        <div className="mt-2 pt-4 border-t border-[#2A2D30] flex flex-col gap-4">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] uppercase tracking-wider text-[#3C6B4D] font-bold">Key Functionality</span>
                            <p className="text-[11px] text-[#ECEBE9] leading-relaxed bg-[#111213] border border-[#2A2D30] p-3 rounded-xl">
                              {tool.functionality}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] uppercase tracking-wider text-[#E29E2D] font-bold">How It Works (Under the Hood)</span>
                            <p className="text-[11px] text-[#A3A09B] leading-relaxed bg-[#111213] border border-[#2A2D30] p-3 rounded-xl font-sans">
                              {tool.howItWorks}
                            </p>
                          </div>
                          {tool.technicalSpecs && (
                            <div className="flex flex-col gap-1.5">
                              <span className="text-[10px] uppercase tracking-wider text-[#72706C] font-bold">Technical Specifications & Constraints</span>
                              <p className="text-[11px] text-[#72706C] leading-relaxed bg-[#111213] border border-[#2A2D30] p-3 rounded-xl font-mono">
                                {tool.technicalSpecs}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      <button
                        onClick={() => setExpandedToolId(isExpanded ? null : tool.id)}
                        className={`text-left text-[10px] font-bold w-fit mt-1 flex items-center gap-1 transition-all ${
                          isExpanded ? 'text-[#E29E2D] hover:text-[#E29E2D]/80' : 'text-[#3C6B4D] hover:text-[#3C6B4D]/80'
                        }`}
                      >
                        <span>{isExpanded ? 'Collapse Details' : 'Expand Details & Mechanics'}</span>
                      </button>
                    </div>
                  );
                })}
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
