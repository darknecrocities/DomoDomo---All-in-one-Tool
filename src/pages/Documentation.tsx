import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Cpu, Shield, Terminal, Settings, GitBranch, Lock, Server, Layers } from 'lucide-react';
import { TOOLS_DOCS } from '../utils/ToolDocsData';
import type { ToolCategory } from '../utils/ToolDocsData';

type SectionId = 'intro' | 'sys-archi' | 'offline-flow' | 'tools-ref' | 'setup-guide' | 'core-engines' | 'compliance';

export const Documentation = () => {
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
            <div className="flex flex-col gap-5">
              <h2 className="text-xl font-bold text-[#ECEBE9] border-b border-[#2A2D30] pb-3">System Architecture</h2>
              <p className="text-[#A3A09B] text-xs md:text-sm leading-relaxed">
                DomoDomo operates within a <strong className="font-bold text-[#ECEBE9]">sandboxed container namespace</strong> provided by modern web browser security engines. The diagram below illustrates the relationship between components:
              </p>

              {/* Architecture SVG diagram */}
              <div className="bg-[#111213] border border-[#2A2D30] p-6 rounded-2xl flex items-center justify-center overflow-x-auto">
                <svg width="600" height="260" viewBox="0 0 600 260" fill="none" className="min-w-[500px]">
                  {/* Browser Sandbox Frame */}
                  <rect x="10" y="10" width="580" height="240" rx="12" fill="#18191B" stroke="#2A2D30" strokeWidth="2" />
                  <text x="30" y="38" fill="#72706C" fontSize="10" fontFamily="monospace" fontWeight="bold" dominantBaseline="central">BROWSER SANDBOX (ISOLATED CLIENT NODE)</text>

                  {/* Input Source */}
                  <rect x="37" y="80" width="90" height="50" rx="8" fill="#111213" stroke="#2A2D30" />
                  <text x="82" y="98" fill="#ECEBE9" fontSize="11" fontFamily="sans-serif" textAnchor="middle" dominantBaseline="central" fontWeight="bold">User Files</text>
                  <text x="82" y="114" fill="#72706C" fontSize="8" fontFamily="monospace" textAnchor="middle" dominantBaseline="central">File / Image Blobs</text>

                  {/* Arrow 1 */}
                  <path d="M127 105 H167" stroke="#3C6B4D" strokeWidth="2" markerEnd="url(#arrow)" />

                  {/* Memory Iframe Cache */}
                  <rect x="167" y="60" width="220" height="90" rx="8" fill="#111213" stroke="#3C6B4D" strokeWidth="1.5" />
                  <text x="277" y="78" fill="#ECEBE9" fontSize="11" fontFamily="sans-serif" textAnchor="middle" dominantBaseline="central" fontWeight="bold">DomoDomo Engines</text>
                  <text x="277" y="96" fill="#3C6B4D" fontSize="9" fontFamily="monospace" textAnchor="middle" dominantBaseline="central">IndexedDB / Memory Cache</text>
                  <text x="277" y="114" fill="#A3A09B" fontSize="9" fontFamily="sans-serif" textAnchor="middle" dominantBaseline="central">WASM Runtimes & Canvas</text>
                  <text x="277" y="132" fill="#E29E2D" fontSize="8" fontFamily="monospace" textAnchor="middle" dominantBaseline="central">WebGPU (LLM Queries)</text>

                  {/* Arrow 2 */}
                  <path d="M387 105 H427" stroke="#3C6B4D" strokeWidth="2" markerEnd="url(#arrow)" />

                  {/* Local compilation output */}
                  <rect x="427" y="80" width="90" height="50" rx="8" fill="#111213" stroke="#2A2D30" />
                  <text x="472" y="98" fill="#ECEBE9" fontSize="11" fontFamily="sans-serif" textAnchor="middle" dominantBaseline="central" fontWeight="bold">Output Buffers</text>
                  <text x="472" y="114" fill="#72706C" fontSize="8" fontFamily="monospace" textAnchor="middle" dominantBaseline="central">ArrayBuffer Stream</text>

                  {/* Arrow 3 */}
                  <path d="M517 105 H543" stroke="#3C6B4D" strokeWidth="2" markerEnd="url(#arrow)" />

                  {/* Browser Download Node */}
                  <circle cx="565" cy="105" r="18" fill="#111213" stroke="#3C6B4D" strokeWidth="1.5" />
                  <path d="M565 97 V107 M560 102 L565 107 L570 102 M559 111 H571" stroke="#ECEBE9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <text x="565" y="138" fill="#ECEBE9" fontSize="9" fontFamily="sans-serif" textAnchor="middle" dominantBaseline="central" fontWeight="bold">Download</text>
                  <text x="565" y="153" fill="#72706C" fontSize="8" fontFamily="monospace" textAnchor="middle" dominantBaseline="central">Local Save</text>

                  {/* Bottom blocked Cloud server */}
                  <rect x="190" y="185" width="220" height="40" rx="8" fill="#111213" stroke="#E29E2D" strokeDasharray="4 4" />
                  <path d="M205 200 L215 210 M215 200 L205 210 M385 200 L395 210 M395 200 L385 210" stroke="#E29E2D" strokeWidth="2" />
                  <text x="300" y="205" fill="#E29E2D" fontSize="10" fontFamily="sans-serif" textAnchor="middle" dominantBaseline="central" fontWeight="bold">NO OUTBOUND WAN TRAFFIC</text>

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
                    onClick={() => handleCategoryChange(key as ToolCategory)}
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
                {TOOLS_DOCS[activeToolCategory].list.map((tool) => {
                  const isExpanded = expandedToolId === tool.id;
                  return (
                    <div
                      key={tool.id}
                      className={`bg-[#111213] border border-[#2A2D30] p-5 rounded-2xl flex flex-col gap-3 transition-all duration-300 ${
                        isExpanded ? 'col-span-1 md:col-span-2 border-[#3C6B4D]/60 bg-[#141618]' : 'hover:border-[#2A2D30]/80'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-[#ECEBE9] text-xs font-mono">{tool.name}</span>
                          <span className="text-[10px] text-[#72706C] font-mono">ID: {tool.id}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/25 rounded text-[8px] font-mono shrink-0">
                          {tool.engine}
                        </span>
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
