import React, { useState } from 'react';
import {
  Sparkles,
  ExternalLink,
  Terminal,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  RefreshCw,
  Layers,
  ArrowUpRight,
  Shield,
  Code2,
  Globe,
  Cpu,
  ChevronRight
} from 'lucide-react';

interface AgentTarget {
  id: string;
  name: string;
  badge: string;
  path: string;
  tagline: string;
}

const SUPPORTED_AGENTS: AgentTarget[] = [
  { id: 'antigravity', name: 'Google Antigravity', badge: 'Recommended', path: '.agents/skills/', tagline: 'Google Advanced Agentic Coding' },
  { id: 'claude', name: 'Claude Code', badge: 'Anthropic', path: '.claude/skills/', tagline: 'Anthropic Terminal Agent' },
  { id: 'cursor', name: 'Cursor IDE', badge: 'Popular', path: '.cursor/rules/', tagline: 'AI Code Editor & Rules' },
  { id: 'opencode', name: 'OpenCode', badge: 'Open Source', path: '.opencode/skills/', tagline: 'Universal Open Agent' },
  { id: 'codex', name: 'OpenAI Codex', badge: 'OpenAI', path: '.codex/skills/', tagline: 'Frontier Agent Synthesis' },
  { id: 'gemini', name: 'Gemini CLI', badge: 'Google', path: '.gemini/skills/', tagline: 'Google Multi-Agent Framework' },
  { id: 'windsurf', name: 'Windsurf Cascade', badge: 'Cascade', path: '.windsurf/skills/', tagline: 'Cascade Flow Agent IDE' },
];

interface SkillSample {
  id: string;
  name: string;
  category: string;
  description: string;
  version: string;
}

const FEATURED_SKILLS: SkillSample[] = [
  { id: 'react-performance', name: 'React Performance', category: 'Frontend', description: 'Profiler inspection, memoization audits, and rerender reduction techniques.', version: 'v1.4.2' },
  { id: 'owasp-agent-guardian', name: 'OWASP Agent Guardian', category: 'Security', description: 'Real-time detection of prompt injection, secrets leak, and insecure dependencies.', version: 'v3.0.1' },
  { id: 'fastapi-pro', name: 'FastAPI Pro Architect', category: 'Backend', description: 'Pydantic v2 schemas, asynchronous routers, dependency injection patterns.', version: 'v2.1.0' },
  { id: 'docker-architect', name: 'Docker Multi-Stage Builder', category: 'DevOps', description: 'Minimalist container setups, multi-stage builds, and non-root security standards.', version: 'v1.2.0' },
  { id: 'design-tokens-sync', name: 'Design Tokens Sync', category: 'Design', description: 'Automated token translation between CSS variables, Tailwind, and Figma specs.', version: 'v1.1.4' },
  { id: 'rag-vector-search', name: 'RAG Vector Search Guide', category: 'AI & Data', description: 'Chunking strategies, hybrid BM25 + cosine ranking, and metadata filtering.', version: 'v2.0.0' },
];

const DOMAINS = [
  { id: 'frontend', name: 'Frontend', desc: 'React, Next.js, Vue, Tailwind, client UI', count: '48 skills', color: 'from-blue-500/20 to-cyan-500/10' },
  { id: 'design', name: 'UI / UX / Design', desc: 'Design systems, tokens, micro-interactions', count: '32 skills', color: 'from-fuchsia-500/20 to-pink-500/10' },
  { id: 'backend', name: 'Backend', desc: 'Node.js, FastAPI, Go, GraphQL, REST APIs', count: '42 skills', color: 'from-emerald-500/20 to-teal-500/10' },
  { id: 'fullstack', name: 'Fullstack', desc: 'Monorepos, server actions, state sync', count: '28 skills', color: 'from-indigo-500/20 to-purple-500/10' },
  { id: 'security', name: 'Security', desc: 'OWASP, threat modeling, dependency auditing', count: '24 skills', color: 'from-rose-500/20 to-red-500/10' },
  { id: 'devops', name: 'DevOps', desc: 'Docker, Kubernetes, CI/CD pipelines', count: '26 skills', color: 'from-amber-500/20 to-yellow-500/10' },
  { id: 'cloud', name: 'Cloud & Infra', desc: 'AWS, GCP, Azure, Terraform, serverless', count: '22 skills', color: 'from-sky-500/20 to-blue-500/10' },
];

export const DomoSkillsMarketplaceTool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'cli' | 'domains'>('marketplace');
  const [selectedAgent, setSelectedAgent] = useState<string>('antigravity');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['react-performance', 'owasp-agent-guardian']);
  const [copiedCLI, setCopiedCLI] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [iframeKey, setIframeKey] = useState<number>(1);

  const targetAgent = SUPPORTED_AGENTS.find(a => a.id === selectedAgent) || SUPPORTED_AGENTS[0];
  const cliCommand = `npx domoskills add ${selectedSkills.join(' ')}`;

  const handleCopyCLI = () => {
    navigator.clipboard.writeText(cliCommand);
    setCopiedCLI(true);
    setTimeout(() => setCopiedCLI(false), 2000);
  };

  const toggleSkill = (skillId: string) => {
    if (selectedSkills.includes(skillId)) {
      if (selectedSkills.length > 1) {
        setSelectedSkills(selectedSkills.filter(s => s !== skillId));
      }
    } else {
      setSelectedSkills([...selectedSkills, skillId]);
    }
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 10, 70));
  const handleResetZoom = () => setZoomLevel(100);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 text-left font-sans">
      {/* Top Hero Banner */}
      <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#2a2d30_1px,transparent_1px),linear-gradient(to_bottom,#2a2d30_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.12] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3C6B4D]/20 text-emerald-400 border border-[#3C6B4D]/40 text-[11px] font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Official Domo Ecosystem Partner
              </span>
              <span className="text-[11px] font-mono text-[#72706C] border border-[#2A2D30] bg-[#111213] px-2.5 py-0.5 rounded-full">
                200+ Verified Agent Skills
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#ECEBE9] tracking-tight flex items-center gap-3">
              <span>DOMOSKILLS<span className="text-[#3C6B4D]">_</span></span>
              <span className="text-xs font-mono font-normal text-[#A3A09B] bg-[#111213] border border-[#2A2D30] px-2.5 py-1 rounded-lg hidden sm:inline">
                Open Agent Skills Marketplace
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-[#A3A09B] leading-relaxed">
              Discover, stack, and install modular open-source capabilities for your AI coding agents in a single CLI command. Built for Google Antigravity, Claude Code, Cursor, OpenCode, Codex, Gemini CLI, and Windsurf.
            </p>
          </div>

          {/* Quick Outbound Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 z-10">
            <a
              href="https://web-beta-six-81.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3C6B4D] hover:bg-[#2E533B] text-white text-xs font-bold transition-all shadow-lg shadow-[#3C6B4D]/20 group"
              title="Open DomoSkills Marketplace in a new tab"
            >
              <span>Open Webapp</span>
              <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            <a
              href="https://web-beta-six-81.vercel.app/submit"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#111213] hover:bg-[#1E2022] text-[#ECEBE9] border border-[#2A2D30] hover:border-[#3C6B4D]/50 text-xs font-bold transition-all"
              title="Submit a new capability to DomoSkills"
            >
              <Sparkles size={13} className="text-emerald-400" />
              <span>Submit Skill</span>
            </a>

            <a
              href="https://github.com/darknecrocities/DomoSkills"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#111213] hover:bg-[#1E2022] text-[#A3A09B] hover:text-[#ECEBE9] border border-[#2A2D30] hover:border-[#3C6B4D]/50 text-xs font-bold transition-all"
              title="View DomoSkills on GitHub"
            >
              <Code2 size={14} />
              <span>GitHub</span>
            </a>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-[#2A2D30] overflow-x-auto">
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-2 ${
              activeTab === 'marketplace'
                ? 'bg-[#3C6B4D] text-white shadow-md'
                : 'bg-[#111213] text-[#A3A09B] hover:text-[#ECEBE9] border border-[#2A2D30]'
            }`}
          >
            <Globe size={13} />
            <span>Live Marketplace Hub</span>
          </button>

          <button
            onClick={() => setActiveTab('cli')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-2 ${
              activeTab === 'cli'
                ? 'bg-[#3C6B4D] text-white shadow-md'
                : 'bg-[#111213] text-[#A3A09B] hover:text-[#ECEBE9] border border-[#2A2D30]'
            }`}
          >
            <Terminal size={13} />
            <span>CLI Generator & Stacker</span>
          </button>

          <button
            onClick={() => setActiveTab('domains')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-2 ${
              activeTab === 'domains'
                ? 'bg-[#3C6B4D] text-white shadow-md'
                : 'bg-[#111213] text-[#A3A09B] hover:text-[#ECEBE9] border border-[#2A2D30]'
            }`}
          >
            <Layers size={13} />
            <span>Explore Domains</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Live Marketplace Hub */}
      {activeTab === 'marketplace' && (
        <div className="space-y-4">
          {/* Viewport Control Bar */}
          <div className="bg-[#18191B] border border-[#2A2D30] rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2 text-xs text-[#A3A09B]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-mono text-[11px] text-[#ECEBE9] font-bold">https://web-beta-six-81.vercel.app/</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom Controls (Mandatory Viewport Standards) */}
              <div className="flex items-center bg-[#111213] border border-[#2A2D30] rounded-lg p-0.5">
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 hover:bg-[#1E2022] text-[#A3A09B] hover:text-[#ECEBE9] rounded transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut size={13} />
                </button>
                <span className="px-2 font-mono text-[11px] text-[#ECEBE9] font-bold min-w-[42px] text-center">
                  {zoomLevel}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 hover:bg-[#1E2022] text-[#A3A09B] hover:text-[#ECEBE9] rounded transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn size={13} />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="p-1.5 hover:bg-[#1E2022] text-[#A3A09B] hover:text-[#ECEBE9] rounded border-l border-[#2A2D30] transition-colors ml-0.5"
                  title="Reset Zoom (100%)"
                >
                  <RotateCcw size={12} />
                </button>
              </div>

              {/* Refresh Frame */}
              <button
                onClick={() => setIframeKey(k => k + 1)}
                className="p-2 bg-[#111213] border border-[#2A2D30] hover:bg-[#1E2022] text-[#A3A09B] hover:text-[#ECEBE9] rounded-lg transition-colors"
                title="Reload Frame"
              >
                <RefreshCw size={13} />
              </button>

              {/* Fullscreen toggle */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 bg-[#111213] border border-[#2A2D30] hover:bg-[#1E2022] text-[#A3A09B] hover:text-[#ECEBE9] rounded-lg transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}
              >
                {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              </button>

              <a
                href="https://web-beta-six-81.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#3C6B4D]/15 hover:bg-[#3C6B4D]/25 border border-[#3C6B4D]/40 text-emerald-400 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span>Direct Open</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Embedded Iframe Container */}
          <div
            className={`w-full rounded-2xl border border-[#2A2D30] bg-[#111213] overflow-hidden shadow-2xl relative transition-all duration-300 ${
              isFullscreen ? 'fixed inset-4 z-50 rounded-2xl max-w-none' : 'h-[750px]'
            }`}
          >
            <div
              style={{
                width: `${100 * (100 / zoomLevel)}%`,
                height: `${100 * (100 / zoomLevel)}%`,
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top left',
              }}
              className="w-full h-full"
            >
              <iframe
                key={iframeKey}
                src="https://web-beta-six-81.vercel.app/"
                title="DomoSkills — The Open Agent Skills Marketplace"
                className="w-full h-full border-none bg-[#111213]"
                allow="clipboard-write"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: CLI Generator & Stacker */}
      {activeTab === 'cli' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Target Agent & Skill Selection */}
          <div className="lg:col-span-6 space-y-5">
            {/* Agent Selector */}
            <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#2A2D30]">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#ECEBE9]">
                  <Cpu size={14} className="text-[#3C6B4D]" />
                  <span>1. Select Target Coding Agent</span>
                </div>
                <span className="text-[10px] font-mono text-[#72706C]">Auto-syncs target path</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUPPORTED_AGENTS.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      selectedAgent === agent.id
                        ? 'bg-[#3C6B4D]/15 border-[#3C6B4D] shadow-md ring-1 ring-[#3C6B4D]/30'
                        : 'bg-[#111213] border-[#2A2D30] hover:border-[#3C6B4D]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#ECEBE9]">{agent.name}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#2A2D30] text-[#A3A09B]">
                        {agent.badge}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#72706C] mt-1 line-clamp-1">{agent.tagline}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Skill Catalog Stacker */}
            <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#2A2D30]">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#ECEBE9]">
                  <Layers size={14} className="text-[#3C6B4D]" />
                  <span>2. Stack Verified Skills</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">
                  {selectedSkills.length} selected
                </span>
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {FEATURED_SKILLS.map(skill => {
                  const isChecked = selectedSkills.includes(skill.id);
                  return (
                    <div
                      key={skill.id}
                      onClick={() => toggleSkill(skill.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/60'
                          : 'bg-[#111213] border-[#2A2D30] hover:border-[#3C6B4D]/40'
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        isChecked ? 'bg-[#3C6B4D] border-[#3C6B4D] text-white' : 'border-[#2A2D30] bg-[#18191B]'
                      }`}>
                        {isChecked && <Check size={11} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-bold text-[#ECEBE9] truncate">{skill.name}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[9px] font-mono text-[#72706C]">{skill.version}</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#2A2D30] text-[#A3A09B]">
                              {skill.category}
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-[#A3A09B] mt-1 leading-snug">{skill.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Terminal Preview */}
          <div className="lg:col-span-6 space-y-5">
            <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl overflow-hidden shadow-2xl">
              {/* Terminal Title Bar */}
              <div className="bg-[#111213] border-b border-[#2A2D30] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[11px] font-mono text-[#72706C] ml-2">domoskills-terminal — zsh</span>
                </div>

                <button
                  onClick={handleCopyCLI}
                  className="px-3 py-1 bg-[#18191B] hover:bg-[#2A2D30] border border-[#2A2D30] hover:border-[#3C6B4D]/50 text-[#ECEBE9] rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  {copiedCLI ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copiedCLI ? 'Copied!' : 'Copy Command'}</span>
                </button>
              </div>

              {/* Terminal Body */}
              <div className="p-5 font-mono text-xs space-y-3 bg-[#0D0E0F]">
                <div className="text-[#72706C]"># Run this inside your workspace root:</div>
                <div className="p-3 rounded-xl bg-[#18191B] border border-[#2A2D30] text-[#ECEBE9] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 overflow-x-auto">
                    <span className="text-emerald-400 font-bold">$</span>
                    <span className="font-semibold text-emerald-300">{cliCommand}</span>
                  </div>
                  <button
                    onClick={handleCopyCLI}
                    className="shrink-0 p-1.5 text-[#72706C] hover:text-[#ECEBE9] transition-colors"
                    title="Copy command"
                  >
                    {copiedCLI ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>
                </div>

                {/* Simulated CLI Output */}
                <div className="pt-2 text-[11px] text-[#A3A09B] space-y-1.5 border-t border-[#2A2D30]/60">
                  <div className="text-[#ECEBE9] font-bold">DOMOSKILLS_ — The Open Agent Skills Registry</div>
                  <div className="text-cyan-400">ℹ Target Agent: {targetAgent.name}</div>
                  <div className="text-cyan-400">ℹ Target Directory: {targetAgent.path}</div>
                  {selectedSkills.map(skillId => (
                    <div key={skillId} className="text-emerald-400 flex items-center gap-1.5">
                      <Check size={11} />
                      <span>{skillId} <span className="text-[#72706C]">[Official • Verified]</span></span>
                    </div>
                  ))}
                  <div className="text-[#72706C] pt-2">
                    Installed capabilities:
                    <pre className="mt-1 text-[#A3A09B] text-[10px] leading-relaxed">
                      {targetAgent.path}
                      {selectedSkills.map((s, i) => (
                        `\n${i === selectedSkills.length - 1 ? '└──' : '├──'} ${s}/\n    └── SKILL.md`
                      ))}
                    </pre>
                  </div>
                  <div className="text-[#ECEBE9] pt-2 flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✔</span>
                    <span>Ready! Your agent now has enhanced capabilities.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Information Card */}
            <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 space-y-2 text-xs text-[#A3A09B]">
              <div className="flex items-center gap-2 font-bold text-[#ECEBE9]">
                <Shield size={14} className="text-[#3C6B4D]" />
                <span>Zero-Cloud Security Guarantee</span>
              </div>
              <p className="leading-relaxed">
                Every skill on DomoSkills is pure markdown (<code className="text-emerald-400 font-mono text-[10px]">SKILL.md</code>) defining prompts, tool constraints, and workflows. No executable code or binaries are installed into your runtime.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Domain Catalog Explorer */}
      {activeTab === 'domains' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-[#ECEBE9]">Browse Capabilities by Domain</h2>
              <p className="text-xs text-[#A3A09B]">Deep-link directly to categorized capability stacks on DomoSkills.</p>
            </div>
            <a
              href="https://web-beta-six-81.vercel.app/explore"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <span>View full directory on web</span>
              <ArrowUpRight size={13} />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DOMAINS.map(domain => (
              <a
                key={domain.id}
                href={`https://web-beta-six-81.vercel.app/explore?category=${domain.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#18191B] border border-[#2A2D30] hover:border-[#3C6B4D]/60 hover:bg-[#1E2022] p-5 rounded-2xl transition-all group flex flex-col justify-between shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#72706C]">
                      {domain.id}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-[#3C6B4D]/15 px-2 py-0.5 rounded-md border border-[#3C6B4D]/30">
                      {domain.count}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-[#ECEBE9] group-hover:text-white transition-colors flex items-center justify-between">
                    <span>{domain.name}</span>
                    <ArrowUpRight size={14} className="text-[#72706C] group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </h3>
                  <p className="text-xs text-[#A3A09B] mt-2 leading-relaxed">{domain.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#2A2D30] flex items-center justify-between text-[11px] text-[#72706C] group-hover:text-[#A3A09B]">
                  <span>Explore capabilities</span>
                  <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default DomoSkillsMarketplaceTool;
