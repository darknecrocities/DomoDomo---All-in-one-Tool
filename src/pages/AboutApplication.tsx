import { Cpu, Globe, Layers, Shield, ShieldAlert, Sparkles, Terminal, Zap } from 'lucide-react';
import { Logo } from '../components/Logo';
import { BRAND_KIT } from '../utils/BrandKit';

const stats = [
  { label: 'Web Utilities', value: '100+', detail: 'Local tools for files, media, code, AI, and documents.', icon: Layers },
  { label: 'Categories', value: '11', detail: 'Photo, PDF, text, converter, QR, video, audio, dev, and API suites.', icon: Globe },
  { label: 'Runtime', value: 'WASM', detail: 'Browser-native execution with WebAssembly and client APIs.', icon: Cpu },
  { label: 'License', value: '100%', detail: 'Free, open-source, inspectable, and self-hostable.', icon: Sparkles }
];

const techStack = [
  'React',
  'TypeScript',
  'Tailwind CSS',
  'WebAssembly',
  'Ollama',
  'Vite',
  'Transformers.js',
  'FFmpeg.wasm',
  'pdf-lib',
  'Tesseract.js',
  'IndexedDB',
  'Web Audio API',
  'ONNX Runtime',
  'WebGPU'
];

export const AboutApplication = () => {
  return (
    <div className="flex flex-col gap-8 text-left">
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-3xl bg-[#18191B] border border-[#2A2D30] p-8 md:p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#2a2d30_1px,transparent_1px),linear-gradient(to_bottom,#2a2d30_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.12] pointer-events-none" />
        <div className="lg:col-span-8 z-10 flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#ECEBE9]/5 text-[#ECEBE9] border border-[#2A2D30] text-xs font-semibold w-fit">
            <Shield size={12} />
            <span>About DomoDomo</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#ECEBE9] tracking-tight leading-tight font-heading">
            Everything About the Local-First Application
          </h1>
          <p className="text-[#A3A09B] text-sm md:text-base leading-relaxed max-w-3xl">
            {BRAND_KIT.philosophy} Unlike cloud utilities, DomoDomo keeps processing in your browser sandbox so private documents, images, audio, video, and AI inputs stay on your machine.
          </p>
        </div>
        <div className="lg:col-span-4 z-10 flex justify-center lg:justify-end">
          <div className="bg-[#111213] border border-[#2A2D30] rounded-2xl p-6">
            <Logo size={128} showText={false} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ label, value, detail, icon: Icon }) => (
          <div key={label} className="glass-card p-6 border-[#2A2D30] bg-[#18191B]">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-white w-fit">
              <Icon size={22} />
            </div>
            <div className="mt-6">
              <span className="text-4xl font-extrabold text-[#ECEBE9] tracking-tight">{value}</span>
              <h2 className="font-bold text-base text-[#ECEBE9] mt-2">{label}</h2>
              <p className="text-[#A3A09B] text-xs mt-1.5 leading-relaxed">{detail}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Recent Updates & Expansion Log */}
      <section className="glass-card p-6 md:p-8 border-[#2A2D30] bg-[#18191B] space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#ECEBE9]/5 text-[#ECEBE9] border border-[#2A2D30] text-xs font-semibold w-fit">
          <Sparkles size={12} />
          <span>Latest Release Updates</span>
        </div>
        <h2 className="text-xl md:text-2xl font-extrabold text-[#ECEBE9] tracking-tight">
          What's New in DomoDomo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="bg-[#111213] p-5 rounded-xl border border-[#2A2D30] space-y-2">
            <span className="text-white font-bold text-sm block">10 New Developer Utilities</span>
            <p className="text-xs text-[#A3A09B] leading-relaxed">
              Added powerful local-first developer tools under the Dev suite, including Cron Expression Parser, SQL Formatter, YAML-JSON Converter, Markdown Table Builder, Side-by-Side Diff Checker, Keyboard Event Finder, CSS Box Shadow & Glassmorphism Designers, Number Base Converter, and Screen Telemetry diagnostics.
            </p>
          </div>
          <div className="bg-[#111213] p-5 rounded-xl border border-[#2A2D30] space-y-2">
            <span className="text-white font-bold text-sm block">Library API Hub (1,480+ Integrations)</span>
            <p className="text-xs text-[#A3A09B] leading-relaxed">
              A comprehensive directory of verified public APIs with dynamic client-side pagination, search indexing, category groupings, and immediate code generation (JavaScript fetch, Python, and cURL requests) for streamlined development.
            </p>
          </div>
          <div className="bg-[#111213] p-5 rounded-xl border border-[#2A2D30] space-y-2">
            <span className="text-white font-bold text-sm block">Domo Agent Hub & Explainer</span>
            <p className="text-xs text-[#A3A09B] leading-relaxed">
              A local-first offline IDE with browser folder mounting, Multi-Agent sequential/parallel orchestration, file writing commands, Autosave, Live Coding simulation toggles, correct extension mapping, and custom markdown responses.
            </p>
          </div>
        </div>
      </section>

      <section className="glass-card p-8 border-[#2A2D30] bg-[#18191B]">
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#ECEBE9]/5 text-[#ECEBE9] border border-[#2A2D30] text-xs font-semibold w-fit mb-3">
            <Sparkles size={12} />
            <span>Mission & Core Purpose</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#ECEBE9] tracking-tight">
            Designed for Developers, Creators, and Power Users
          </h2>
          <p className="text-[#A3A09B] text-sm md:text-base mt-2.5 leading-relaxed">
            DomoDomo solves the friction of traditional web utilities. Instead of uploading sensitive files to remote servers, it compiles the processing logic directly inside the browser.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            ['Uncompromising Security', 'Zero data tracking, zero uploads, and zero server databases. Your files never leave your computer.', Shield],
            ['Local AI & WebAssembly', 'Runs local AI helpers and compiled modules directly on your device for private, fast workflows.', Cpu],
            ['All-in-One Utility Hub', 'Edit PDFs, compress media, build documents, scan QRs, and format code inside one cohesive system.', Zap]
          ].map(([title, detail, Icon]) => (
            <div key={title as string} className="flex gap-4">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-white h-fit shrink-0">
                <Icon size={20} />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-[#ECEBE9] text-base">{title as string}</h3>
                <p className="text-[#A3A09B] text-xs leading-relaxed">{detail as string}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B]">
          <h2 className="font-bold text-lg text-[#ECEBE9] mb-4 flex items-center gap-2">
            <Shield className="text-white" size={20} />
            <span>Why Local-First Processing Wins</span>
          </h2>
          <div className="flex flex-col gap-3 text-xs text-[#A3A09B]">
            <p><strong>Absolute Privacy:</strong> sensitive files never traverse network servers.</p>
            <p><strong>No Upload Limits:</strong> large PDFs, images, audio, or video are limited mainly by device hardware.</p>
            <p><strong>Offline Resilience:</strong> the app keeps working once assets are loaded and cached.</p>
            <p><strong>Fast Execution:</strong> local CPU, Canvas, and WebAssembly avoid cloud queues.</p>
          </div>
        </div>

        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B]">
          <h2 className="font-bold text-lg text-[#ECEBE9] mb-4 flex items-center gap-2">
            <Cpu className="text-[#E29E2D]" size={20} />
            <span>Under the Hood Architecture</span>
          </h2>
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            {['ONNX Runtime', 'FFmpeg WASM', 'IndexedDB Storage', 'Web Speech Engine'].map((item) => (
              <div key={item} className="bg-[#111213] p-3 rounded-lg border border-[#2A2D30]">
                <div className="font-bold text-[#ECEBE9]">{item}</div>
                <div className="text-[#72706C] text-[10px] mt-0.5">Runs inside the browser sandbox without app servers.</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How DomoDomo Works Offline */}
      <section className="glass-card p-6 flex flex-col gap-5 border-[#2A2D30] bg-[#18191B]">
        <h2 className="text-xl font-bold text-[#ECEBE9] flex items-center gap-2 border-b border-[#2A2D30] pb-3">
          <Cpu className="text-white" size={20} />
          <span>How DomoDomo Works Offline</span>
        </h2>
        
        <div className="flex flex-col gap-4 text-xs">
          <div className="flex gap-3 items-start">
            <div className="w-6 h-6 rounded-full bg-[#ECEBE9]/5 border border-[#2A2D30] text-[#ECEBE9] flex items-center justify-center font-bold shrink-0">1</div>
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-[#ECEBE9]">Local File Blob Loading</span>
              <span className="text-[#A3A09B] leading-relaxed">Your files are converted into browser-native File blobs. No packets are uploaded or cached on any remote servers.</span>
            </div>
          </div>

          <div className="flex gap-3 items-start border-t border-[#2A2D30] pt-3">
            <div className="w-6 h-6 rounded-full bg-[#E29E2D]/15 border border-[#E29E2D]/30 text-[#E29E2D] flex items-center justify-center font-bold shrink-0">2</div>
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-[#ECEBE9]">Sandboxed CPU & GPU Execution</span>
              <span className="text-[#A3A09B] leading-relaxed">High-performance algorithms (using WebAssembly, Canvas matrices, and local WebGPU frameworks) process the binary arrays inside your browser tab sandbox.</span>
            </div>
          </div>

          <div className="flex gap-3 items-start border-t border-[#2A2D30] pt-3">
            <div className="w-6 h-6 rounded-full bg-[#ECEBE9]/5 border border-[#2A2D30] text-[#ECEBE9] flex items-center justify-center font-bold shrink-0">3</div>
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-[#ECEBE9]">Immediate Local Compilation</span>
              <span className="text-[#A3A09B] leading-relaxed">The browser bundles the output bytes and triggers an immediate local download directly to your downloads folder.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Self-Hosting & Compliance */}
      <section className="glass-card p-6 flex flex-col gap-4 border-[#2A2D30] bg-[#18191B]">
        <h2 className="text-xl font-bold text-[#ECEBE9] flex items-center gap-2 border-b border-[#2A2D30] pb-3">
          <Shield size={20} className="text-white" />
          <span>Enterprise Self-Hosting & Compliance</span>
        </h2>
        <p className="text-[#A3A09B] text-xs leading-relaxed">
          Large corporations often block employees from uploading sensitive blueprints, customer datasets, or confidential contracts to external cloud utility webs. Since DomoDomo has <strong>zero server overhead</strong> and is licensed under the MIT permissive license, system administrators can deploy it on an internal private network domain (e.g. <code>toolbox.internal.company.com</code>). This guarantees employees have access to premium converters while ensuring zero outbound bytes traverse corporate firewalls.
        </p>
      </section>

      <section className="glass-card p-8 border-[#2A2D30] bg-[#18191B]">
        <h2 className="text-2xl font-bold text-[#ECEBE9] tracking-tight mb-5 flex items-center gap-2">
          <ShieldAlert size={22} className="text-white" />
          <span>Leak-Free Security Audit & Isolation Guarantee</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            ['IndexedDB Sandbox', 'Files can be handled in browser-local storage and are isolated to the browser namespace.'],
            ['No Backend Endpoints', 'The tool suite is built as a client-side application without upload routes for file operations.'],
            ['Inspector Ready', 'Open DevTools Network while using file tools to verify that processing stays local.']
          ].map(([title, detail]) => (
            <div key={title} className="bg-[#111213] p-5 rounded-xl border border-[#2A2D30] space-y-2 text-left">
              <span className="text-white font-bold text-sm">{title}</span>
              <span className="text-[11px] text-[#A3A09B] leading-relaxed">{detail}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-card p-6 border-[#2A2D30] bg-[#18191B]">
        <h2 className="text-xl font-bold text-[#ECEBE9] mb-4">Powered by Modern Browser Tech & Frameworks</h2>
        <div className="flex flex-wrap gap-2">
          {techStack.map((tech) => (
            <span key={tech} className="px-3 py-2 bg-[#111213] border border-[#2A2D30] rounded-lg text-xs font-semibold text-[#A3A09B]">
              {tech}
            </span>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 glass-card p-6 border-[#2A2D30] bg-[#18191B]">
          <h2 className="text-xl font-bold text-[#ECEBE9] flex items-center gap-2 border-b border-[#2A2D30] pb-3">
            <Globe size={20} className="text-white" />
            <span>Cloud SaaS vs. DomoDomo Local Matrix</span>
          </h2>
          <div className="overflow-x-auto mt-5">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#2A2D30] text-[#A3A09B]">
                  <th className="py-2.5 font-bold uppercase tracking-wider">Capability</th>
                  <th className="py-2.5 font-bold uppercase tracking-wider px-3">Traditional SaaS</th>
                  <th className="py-2.5 font-bold uppercase tracking-wider text-white px-3">DomoDomo Local</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2D30]/60 text-[#A3A09B]">
                {[
                  ['Data Security', 'Uploaded to cloud servers', 'Client-side sandbox'],
                  ['File Size Limits', 'Often capped by plan tiers', 'Limited mostly by device hardware'],
                  ['Pricing', 'Subscription tiers', 'Free and open-source'],
                  ['Offline Usability', 'Requires network connection', 'Works offline once cached'],
                  ['Queue Times', 'Cloud queues and upload waits', 'Immediate local execution']
                ].map(([capability, cloud, local]) => (
                  <tr key={capability}>
                    <td className="py-3 font-semibold text-[#ECEBE9]">{capability}</td>
                    <td className="py-3 px-3">{cloud}</td>
                    <td className="py-3 text-[#A3A09B] font-medium px-3">{local}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 glass-card p-6 border-[#2A2D30] bg-[#18191B]">
          <h2 className="text-xl font-bold text-[#ECEBE9] border-b border-[#2A2D30] pb-3">Domo Brandkit</h2>
          <div className="flex flex-col gap-4 mt-5">
            {Object.entries(BRAND_KIT.colors).map(([key, color]) => (
              <div key={key} className="flex items-center gap-3 bg-[#111213] p-3 rounded-xl border border-[#2A2D30]">
                <div className="w-8 h-8 rounded border border-[#2A2D30]" style={{ backgroundColor: color.hex }} />
                <div>
                  <span className="text-xs font-bold text-[#ECEBE9] block">{color.name}</span>
                  <span className="text-[10px] text-[#72706C] font-mono">{color.hex}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B]">
          <h2 className="text-xl font-bold text-[#ECEBE9] flex items-center gap-2 border-b border-[#2A2D30] pb-3">
            <Terminal size={20} className="text-white" />
            <span>Local Installation Guide</span>
          </h2>
          <div className="flex flex-col gap-3 font-mono text-[11px] bg-[#111213] p-4 rounded-xl border border-[#2A2D30] text-[#A3A09B] mt-5">
            <span className="text-[#72706C]"># 1. Clone the repository</span>
            <span>git clone https://github.com/darknecrocities/DomoDomo---All-in-one-Tool.git</span>
            <span>cd DomoDomo---All-in-one-Tool</span>
            <span className="text-[#72706C] border-t border-[#2A2D30] pt-3"># 2. Install dependencies</span>
            <span>npm install</span>
            <span className="text-[#72706C] border-t border-[#2A2D30] pt-3"># 3. Start development server</span>
            <span>npm run dev</span>
            <span className="text-[#72706C] border-t border-[#2A2D30] pt-3"># 4. Build production bundle</span>
            <span>npm run build</span>
          </div>
        </div>

        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B]">
          <h2 className="text-xl font-bold text-[#ECEBE9] flex items-center gap-2 border-b border-[#2A2D30] pb-3">
            <ShieldAlert size={20} className="text-white" />
            <span>Frequently Asked Questions</span>
          </h2>
          <div className="flex flex-col gap-4 text-xs text-left mt-5">
            <div className="p-3 bg-[#111213] rounded-xl border border-[#2A2D30]">
              <span className="font-bold text-[#ECEBE9] text-sm block">Is DomoDomo really free?</span>
              <span className="text-[#A3A09B] leading-relaxed">Yes. It is free, open-source, and does not require accounts or subscriptions.</span>
            </div>
            <div className="p-3 bg-[#111213] rounded-xl border border-[#2A2D30]">
              <span className="font-bold text-[#ECEBE9] text-sm block">How do I verify there are no data leaks?</span>
              <span className="text-[#A3A09B] leading-relaxed">Use the browser Network tab while running tools and check that file operations do not upload to remote servers.</span>
            </div>
            <div className="p-3 bg-[#111213] rounded-xl border border-[#2A2D30]">
              <span className="font-bold text-[#ECEBE9] text-sm block">Can teams self-host it?</span>
              <span className="text-[#A3A09B] leading-relaxed">Yes. Because it is a static client-side app, teams can host it on internal networks for stricter environments.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
