import { Cpu, Globe, Layers, Shield, ShieldAlert, Sparkles, Terminal, Zap, Users, Copy, ChevronDown, Check } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { BRAND_KIT } from '../utils/BrandKit';
import domodomoLogo from '../assets/domodomo.png';
import domodomoWinkLogo from '../assets/domodomo_wink.png';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Documentation } from './Documentation';

const stats = [
  { label: 'Web Utilities', value: '100+', detail: 'Local tools for files, media, code, AI, and documents.', icon: Layers },
  { label: 'Active Users', value: '7,876', detail: 'Developers & creators running DomoDomo offline globally.', icon: Users },
  { label: 'Categories', value: '11', detail: 'Photo, PDF, text, converter, QR, video, audio, dev, and API suites.', icon: Globe },
  { label: 'License', value: '100%', detail: 'Free, open-source, inspectable, and self-hostable.', icon: Sparkles }
];

const testimonials = [
  {
    name: 'Mary Anne',
    role: 'Digital Content Manager',
    quote: 'DomoDomo has completely replaced multiple online file converters for me. Knowing my sensitive PDFs and client photos are processed 100% locally in my browser gives me complete peace of mind.'
  },
  {
    name: 'James Mendoza',
    role: 'Software Engineer',
    quote: 'A masterclass in local-first browser engineering. DomoDomo proves that you don\'t need heavy cloud infrastructures to build robust, secure, and incredibly fast tools.'
  },
  {
    name: 'Emmanuel Millave',
    role: 'Maker',
    quote: 'solid neto'
  },
  {
    name: 'Diana Vanessa',
    role: 'Fullstack Engineer',
    quote: 'Omg! this so useful! Thanks for this!'
  },
  {
    name: 'Dale Ogbac',
    role: 'proud vibe coder 🤪',
    quote: 'support to this!!! very helpful and still keeps growing.🔥💪'
  },
  {
    name: 'Ant Real',
    role: 'Maker',
    quote: 'Nice to see DomoDomo getting more visibility here too! 🙌 The strong community feedback and its privacy-first, local-first direction really stood out — that’s why it is currently listed as a Featured Pick on Stage by Ant.'
  },
  {
    name: 'fox hub',
    role: 'Maker',
    quote: 'ang dami paid tools out there but this app has it alll, tysm'
  },
  {
    name: 'gerald domingo',
    role: 'Maker',
    quote: 'usefull opensource project'
  },
  {
    name: 'elmer gonzales',
    role: 'Maker',
    quote: 'this app helps me a lot and i like the jarvis features, kudos to the dev team🙏'
  }
];

export const AboutApplication = ({ defaultTab = 'about' }: { defaultTab?: 'about' | 'updates' | 'docs' }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryTab = searchParams.get('tab') as 'about' | 'updates' | 'docs';
  const [activeTab, setActiveTab] = useState<'about' | 'updates' | 'docs'>(queryTab || defaultTab);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const itemsPerView = windowWidth >= 1024 ? 3 : windowWidth >= 768 ? 2 : 1;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => {
        if (prev >= testimonials.length - itemsPerView) {
          return 0;
        }
        return prev + 1;
      });
    }, 4500);
    return () => clearInterval(timer);
  }, [itemsPerView]);

  // Sync tab state with query parameters
  useEffect(() => {
    if (queryTab && queryTab !== activeTab) {
      setActiveTab(queryTab);
    }
  }, [queryTab]);

  const handleTabChange = (tab: 'about' | 'updates' | 'docs') => {
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
            
            {/* AppBuilders PH Product Hunt Badge */}
            <a
              href="https://www.appbuildersph.com/apps/domodomo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF6154]/10 border border-[#FF6154]/25 hover:border-[#FF6154]/50 hover:bg-[#FF6154]/20 text-[#FF6154] hover:text-[#ECEBE9] rounded-lg transition-all text-[11px] font-bold shadow-sm animate-pulse"
              title="Featured on App Builders PH"
            >
              <span>▲</span>
              <span className="font-extrabold">#2 on the Leaderboards of All Time on AppBuilders PH</span>
            </a>
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
            className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 border ${
              activeTab === 'about'
                ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/45 text-[#ECEBE9]'
                : 'border-transparent text-[#A3A09B] hover:bg-[#111213] hover:text-[#ECEBE9]'
            }`}
          >
            <Shield size={14} className={activeTab === 'about' ? 'text-[#3C6B4D]' : 'text-[#72706C]'} />
            <span>About Page</span>
          </button>
          
          <button
            onClick={() => handleTabChange('updates')}
            className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 border ${
              activeTab === 'updates'
                ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/45 text-[#ECEBE9]'
                : 'border-transparent text-[#A3A09B] hover:bg-[#111213] hover:text-[#ECEBE9]'
            }`}
          >
            <Sparkles size={14} className={activeTab === 'updates' ? 'text-[#3C6B4D]' : 'text-[#72706C]'} />
            <span>Updates & Patches</span>
          </button>
          
          <button
            onClick={() => handleTabChange('docs')}
            className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 border ${
              activeTab === 'docs'
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

              {/* Real Testimonials Block */}
              <section className="glass-card p-6 border-[#2A2D30] bg-[#18191B] space-y-5">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/20 text-xs font-semibold w-fit mb-2">
                    <Users size={12} />
                    <span>Real Community Testimonials</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-extrabold text-[#ECEBE9] tracking-tight">
                    What Our Users Say About DomoDomo
                  </h2>
                </div>

                <div className="relative overflow-hidden w-full pt-1">
                  <div 
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ 
                      transform: `translateX(-${currentIdx * (100 / itemsPerView)}%)`,
                      width: `${(testimonials.length / itemsPerView) * 100}%` 
                    }}
                  >
                    {testimonials.map((test, idx) => (
                      <div 
                        key={idx} 
                        className="px-2.5 shrink-0"
                        style={{ width: `${100 / testimonials.length}%` }}
                      >
                        <div className="bg-[#111213] p-5 rounded-2xl border border-[#2A2D30] hover:border-[#3C6B4D]/25 transition-colors flex flex-col justify-between gap-4 min-h-[175px] text-left">
                          <p className="text-xs text-[#A3A09B] italic leading-relaxed line-clamp-5">
                            "{test.quote}"
                          </p>
                          <div>
                            <span className="block text-xs font-bold text-[#ECEBE9]">{test.name}</span>
                            <span className="block text-[10px] text-[#72706C]">{test.role}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Indicators dots */}
                  <div className="flex justify-center gap-1.5 mt-4">
                    {Array.from({ length: testimonials.length - itemsPerView + 1 }).map((_, dIdx) => (
                      <button
                        key={dIdx}
                        onClick={() => setCurrentIdx(dIdx)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          currentIdx === dIdx ? 'bg-[#3C6B4D] w-3.5' : 'bg-[#2A2D30] hover:bg-[#72706C]'
                        }`}
                        title={`Go to slide ${dIdx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </section>

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
                    version: "v1.2.0 (Latest)",
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
