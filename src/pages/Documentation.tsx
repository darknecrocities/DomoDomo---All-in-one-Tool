import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Cpu, Shield, Terminal, Settings, GitBranch, Lock, Server } from 'lucide-react';

type SectionId = 'intro' | 'sys-archi' | 'offline-flow' | 'setup-guide' | 'core-engines' | 'compliance';

export const Documentation = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SectionId>('intro');

  const menuItems = [
    { id: 'intro', label: 'Introduction', icon: BookOpen },
    { id: 'sys-archi', label: 'System Architecture', icon: GitBranch },
    { id: 'offline-flow', label: 'Offline Flowchart', icon: Cpu },
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
                  <path d="M130 105 H170" stroke="#3C6B4D" strokeWidth="2" markerEnd="url(#arrow)" />

                  {/* Memory Iframe Cache */}
                  <rect x="180" y="60" width="160" height="90" rx="8" fill="#111213" stroke="#3C6B4D" strokeWidth="1.5" />
                  <text x="260" y="85" fill="#ECEBE9" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">DomoDomo Engines</text>
                  <text x="260" y="102" fill="#3C6B4D" fontSize="9" fontFamily="monospace" textAnchor="middle">IndexedDB / Memory Cache</text>
                  <text x="260" y="122" fill="#A3A09B" fontSize="9" fontFamily="sans-serif" textAnchor="middle">WASM Runtimes & Canvas</text>
                  <text x="260" y="137" fill="#E29E2D" fontSize="8" fontFamily="monospace" textAnchor="middle">WebGPU (LLM Queries)</text>

                  {/* Arrow 2 */}
                  <path d="M340 105 H380" stroke="#3C6B4D" strokeWidth="2" markerEnd="url(#arrow)" />

                  {/* Local compilation output */}
                  <rect x="390" y="80" width="100" height="50" rx="8" fill="#111213" stroke="#2A2D30" />
                  <text x="440" y="105" fill="#ECEBE9" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Output Buffers</text>
                  <text x="440" y="120" fill="#72706C" fontSize="8" fontFamily="monospace" textAnchor="middle">ArrayBuffer Stream</text>

                  {/* Arrow 3 */}
                  <path d="M490 105 H530" stroke="#3C6B4D" strokeWidth="2" markerEnd="url(#arrow)" />

                  {/* Browser Download Anchor */}
                  <circle cx="550" cy="105" r="20" fill="#3C6B4D" opacity="0.1" />
                  <path d="M545 100 L550 105 L555 100 M550 93 V113" stroke="#3C6B4D" strokeWidth="2" strokeLinecap="round" />
                  <text x="550" y="140" fill="#ECEBE9" fontSize="9" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Download</text>

                  {/* Bottom blocked Cloud server */}
                  <rect x="180" y="185" width="220" height="40" rx="8" fill="#111213" stroke="#E29E2D" strokeDasharray="4 4" />
                  <path d="M200 205 L210 215 M210 205 L200 215" stroke="#E29E2D" strokeWidth="2" />
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
                <svg width="450" height="380" viewBox="0 0 450 380" fill="none" className="min-w-[400px]">
                  {/* Step 1 */}
                  <rect x="125" y="10" width="200" height="45" rx="8" fill="#18191B" stroke="#2A2D30" />
                  <text x="225" y="36" fill="#ECEBE9" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="semibold">1. Input File Selected</text>
                  <path d="M225 55 V90" stroke="#2A2D30" strokeWidth="1.5" markerEnd="url(#flow-arrow)" />

                  {/* Step 2 */}
                  <rect x="125" y="90" width="200" height="45" rx="8" fill="#18191B" stroke="#2A2D30" />
                  <text x="225" y="116" fill="#ECEBE9" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="semibold">2. Parsed into File Blob</text>
                  <path d="M225 135 V170" stroke="#2A2D30" strokeWidth="1.5" markerEnd="url(#flow-arrow)" />

                  {/* Step 3 */}
                  <polygon points="225,170 325,192.5 225,215 125,192.5" fill="#18191B" stroke="#3C6B4D" strokeWidth="1.5" />
                  <text x="225" y="196" fill="#ECEBE9" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">3. Network Call?</text>
                  
                  {/* Yes Branch */}
                  <path d="M325 192.5 H375 V235" stroke="#E29E2D" strokeWidth="1.5" markerEnd="url(#flow-arrow)" />
                  <text x="350" y="185" fill="#E29E2D" fontSize="10" fontFamily="sans-serif" fontWeight="bold">Yes</text>
                  <rect x="305" y="235" width="130" height="45" rx="8" fill="#18191B" stroke="#E29E2D" />
                  <text x="370" y="260" fill="#E29E2D" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="semibold">Operation Blocked</text>

                  {/* No Branch */}
                  <path d="M225 215 V260" stroke="#3C6B4D" strokeWidth="1.5" markerEnd="url(#flow-arrow)" />
                  <text x="240" y="235" fill="#3C6B4D" fontSize="10" fontFamily="sans-serif" fontWeight="bold">No</text>
                  
                  {/* Step 4 */}
                  <rect x="110" y="260" width="230" height="45" rx="8" fill="#18191B" stroke="#3C6B4D" strokeWidth="1.5" />
                  <text x="225" y="286" fill="#ECEBE9" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="semibold">4. Sandboxed Compilation</text>
                  <path d="M225 305 V335" stroke="#2A2D30" strokeWidth="1.5" markerEnd="url(#flow-arrow)" />

                  {/* Step 5 */}
                  <rect x="125" y="335" width="200" height="35" rx="18" fill="#3C6B4D" />
                  <text x="225" y="356" fill="#ECEBE9" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">5. Local Download Triggered</text>

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
