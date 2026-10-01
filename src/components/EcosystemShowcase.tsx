import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowUpRight,
  X,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Pause,
  Play,
  BookOpen,
  Terminal,
  Layers,
  Shield,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface EcosystemApp {
  id: string;
  name: string;
  tagline: string;
  category: string;
  badge: string;
  logoSrc: string;
  url: string;
  blogSlug: string;
  internalPath?: string;
  shortDesc: string;
  description: string;
  whyRecommended: string[];
  features: string[];
  stats: { label: string; value: string }[];
  highlightColor?: string;
}

export const ECOSYSTEM_APPS: EcosystemApp[] = [
  {
    id: 'domoscope',
    name: 'DomoScope',
    tagline: 'GitHub Repository Inspection, Architecture Visualization & Security Intelligence',
    category: 'Reverse Engineer Platform',
    badge: 'Official Ecosystem Partner',
    logoSrc: '/ecosystem-logos/domoscope.png',
    url: 'https://domoscope.vercel.app/',
    blogSlug: 'announcing-domoscope-github-repository-inspection-visualization',
    shortDesc: 'Deep GitHub repository inspection — visual AST architecture graphs, automated database ERDs, API catalogs & security audits.',
    description:
      'DomoScope allows developers, security researchers, and software architects to paste any public GitHub repository URL and instantly reverse-engineer its entire system topology. Without cloning or running untrusted local code, DomoScope maps out AST dependency connections, visualizes database entity-relationship models (Prisma, Drizzle, SQL, Supabase), indexes API route catalogs, audits code for security vulnerabilities, and synthesizes complete reverse-engineering specifications.',
    whyRecommended: [
      'Rapidly onboard onto complex open-source repositories and legacy codebases without manual file crawling.',
      'Auto-generate interactive Entity-Relationship Diagrams (ERD) from Prisma, Drizzle, SQL, and Supabase models.',
      'Consolidate API endpoints across Next.js App Router, Express, FastAPI, and NestJS in a structured catalog.',
      'Identify critical CWE security flaws (eval execution, unvalidated inputs, exposed secrets) using client-side static analysis.',
      'Connect autonomous AI coding agents (Google Antigravity, Claude Code, Cursor) using DomoScope’s native Model Context Protocol (MCP) server.'
    ],
    features: [
      'Interactive AST Architecture Graph',
      'Automated Database Schema ERD',
      'Complete API Route Catalog',
      'Static Security Vulnerability Audit',
      'Reverse Engineering System Blueprint',
      'Built-in MCP Server for Coding Agents',
      'Scoped AI Repository Assistant'
    ],
    stats: [
      { label: 'Ecosystem Role', value: 'Code Intelligence' },
      { label: 'Analysis Mode', value: 'Zero-Clone AST' },
      { label: 'Agent Protocol', value: 'Native MCP' }
    ]
  },
  {
    id: 'codepyne',
    name: 'Codepyne.io',
    tagline: 'Engineering & Data Science AI/ML Technical Upskilling Platform',
    category: 'Learning Platform',
    badge: 'Official Ecosystem Partner',
    logoSrc: '/ecosystem-logos/codepyne.png',
    url: 'https://codepyne-io.vercel.app/',
    blogSlug: 'announcing-codepyne-io-ai-machine-learning-upskilling-platform',
    shortDesc: 'Hands-on technical upskilling — learn by orchestrating, training & building real AI systems from scratch.',
    description:
      'Codepyne.io bridges theoretical mathematics and modern production engineering. Rather than reading passive theory or using high-level wrapper APIs that hide the underlying mechanics, developers learn by building autograd computational graphs from pure Python, fine-tuning transformer architectures, orchestrating multi-agent networks, and earning verifiable skill certifications.',
    whyRecommended: [
      'Master fundamental machine learning mechanics by implementing backpropagation and autograd from scratch.',
      'Interactive, hands-on browser code sandboxes with instant execution and unit test verification.',
      'Deep dive into modern frontier AI architectures including multi-agent swarms, tokenizers, and model deployment.',
      'Earn verifiable cryptographic certificates to demonstrate verifiable machine learning competencies.'
    ],
    features: [
      'Autograd Engine from Scratch',
      'Transformer Fine-Tuning & Attention',
      'Multi-Agent Coordination Systems',
      'Verifiable Skill Certifications',
      'Interactive Python Sandboxes',
      'Production Model Deployment Pipelines'
    ],
    stats: [
      { label: 'Ecosystem Role', value: 'AI/ML Upskilling' },
      { label: 'Methodology', value: 'Code-First Sandbox' },
      { label: 'Credentials', value: 'Verifiable Badges' }
    ]
  },
  {
    id: 'domoskills',
    name: 'DomoSkills',
    tagline: 'The Open Agent Skills Marketplace & CLI Capability Hub',
    category: 'Skills Marketplace',
    badge: 'Official Ecosystem Partner',
    logoSrc: '/ecosystem-logos/domoskills.png',
    url: 'https://web-beta-six-81.vercel.app/',
    internalPath: '/tool/domoskills',
    blogSlug: 'announcing-domoskills-open-agent-skills-marketplace',
    shortDesc: '200+ verified capabilities for AI coding assistants. Single-command CLI installation for Antigravity, Claude, Cursor & Codex.',
    description:
      'DomoSkills is the open-source capability hub and package ecosystem for autonomous AI coding agents. Instead of dealing with rigid system prompts, DomoSkills equips assistants with modular, audited SKILL.md capability packs spanning React performance, cloud pipelines, threat modeling, database migrations, and testing. It features an interactive web marketplace and a unified CLI to install capabilities directly into your project in seconds.',
    whyRecommended: [
      'Supercharge coding assistants (Google Antigravity, Claude Code, Cursor, OpenCode, Codex, Gemini CLI) with verified domain skills.',
      'One-command installation with target directory detection (npx domoskills add <skill-name>).',
      'Every skill is audited for safety, preventing prompt injection attacks and malicious code execution.',
      'Deeply integrated into DomoDomo with an embedded In-App Tool Hub and zoomable interactive sandbox.'
    ],
    features: [
      '200+ Verified Agent Skills',
      'Unified CLI: npx domoskills add',
      'Multi-Assistant Native Compatibility',
      'In-App Interactive Tool Hub',
      'Security Audited SKILL.md Packages',
      'Open Community Registry'
    ],
    stats: [
      { label: 'Ecosystem Role', value: 'Agent Skills Hub' },
      { label: 'Capabilities', value: '200+ Verified' },
      { label: 'Installation', value: '1-Command CLI' }
    ]
  },
  {
    id: 'domonote',
    name: 'DomoNote',
    tagline: 'Personal AI Local Secretary & Offline Productivity Suite',
    category: 'AI Secretary',
    badge: 'Official Ecosystem Partner',
    logoSrc: '/ecosystem-logos/domonote.png',
    url: 'https://domonote.vercel.app/',
    blogSlug: 'announcing-domonote-personal-ai-local-secretary',
    shortDesc: 'Your intelligent offline-first personal secretary — smart notes, AI reminders & voice capture with 0% cloud data leakage.',
    description:
      'DomoNote is a 100% client-side personal AI secretary web application. Operating entirely inside the browser sandbox using local Ollama LLMs and IndexedDB persistence, DomoNote provides natural language reminders, audio speech transcription, meeting minutes summarization, and context-aware document drafting while ensuring your private notes and schedules never touch cloud servers.',
    whyRecommended: [
      '100% offline-first architecture with zero accounts, zero cloud servers, and complete data sovereignty.',
      'Natural language smart reminders that automatically parse times, dates, and recurring frequencies.',
      'Local AI assistant running on your device via Ollama for bullet summarization, rewriting, and drafting.',
      'Hands-free voice capture with synchronized speech-to-text audio playback.'
    ],
    features: [
      '100% Offline-First Architecture',
      'Local AI Assistant (Ollama Powered)',
      'Natural Language Reminder Parser',
      'Real-Time Voice Speech Capture',
      'Action Item Extraction from Notes',
      'Zero Cloud Data Telemetry'
    ],
    stats: [
      { label: 'Ecosystem Role', value: 'Personal AI Secretary' },
      { label: 'Storage', value: 'Local IndexedDB' },
      { label: 'Cloud Leakage', value: 'Zero (0%)' }
    ]
  }
];

export const EcosystemShowcase: React.FC = () => {
  const navigate = useNavigate();
  const [selectedApp, setSelectedApp] = useState<EcosystemApp | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'left' | 'right'>('left');

  // Duplicate apps array twice in each track to ensure full coverage across all desktop and mobile viewports
  const carouselApps = [...ECOSYSTEM_APPS, ...ECOSYSTEM_APPS];

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedApp) {
        setSelectedApp(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedApp]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedApp) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedApp]);

  const renderAppCard = (app: EcosystemApp, uniqueKey: string, isAriaHidden = false) => (
    <div
      key={uniqueKey}
      onClick={() => setSelectedApp(app)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setSelectedApp(app);
        }
      }}
      tabIndex={isAriaHidden ? -1 : 0}
      role="button"
      aria-label={`View ${app.name} details`}
      className="w-[280px] sm:w-[320px] shrink-0 p-4 sm:p-5 rounded-2xl bg-[#111213]/90 backdrop-blur-md border border-[#2A2D30] hover:border-white/40 hover:bg-[#161719] cursor-pointer transition-all duration-300 group/card relative flex flex-col justify-between shadow-lg hover:shadow-2xl hover:shadow-white/5 focus:outline-none focus:ring-2 focus:ring-white/40 overflow-hidden"
    >
      {/* Subtle Top Highlight Line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover/card:via-white/30 transition-all duration-500" />

      {/* Card Top: Frameless Floating B&W App Logo + Category */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3.5">
          {/* Frameless Floating B&W Logo with Ambient Light */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
            {/* Ambient soft glow backdrop */}
            <div className="absolute inset-0 bg-white/5 rounded-full blur-xl opacity-40 group-hover/card:opacity-100 group-hover/card:bg-white/10 transition-all duration-300 pointer-events-none" />
            <img
              src={app.logoSrc}
              alt={`${app.name} logo`}
              className="w-12 h-12 sm:w-14 sm:h-14 object-contain filter grayscale contrast-125 brightness-110 group-hover/card:contrast-140 group-hover/card:brightness-125 drop-shadow-[0_4px_12px_rgba(255,255,255,0.06)] group-hover/card:drop-shadow-[0_8px_24px_rgba(255,255,255,0.22)] group-hover/card:scale-110 transition-all duration-300 relative z-10"
              loading="lazy"
            />
          </div>

          {/* Official Badge Pill */}
          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-white/5 border border-[#2A2D30] text-[#A3A09B] group-hover/card:text-[#ECEBE9] group-hover/card:border-white/20 transition-colors">
            {app.category}
          </span>
        </div>

        {/* App Title & Tagline */}
        <h3 className="text-base sm:text-lg font-extrabold text-[#ECEBE9] group-hover/card:text-white transition-colors flex items-center gap-1.5">
          <span>{app.name}</span>
          <ArrowUpRight
            size={14}
            className="text-[#72706C] group-hover/card:text-white group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5 transition-all"
          />
        </h3>

        <p className="text-xs text-[#A3A09B] mt-1.5 line-clamp-2 leading-relaxed">
          {app.shortDesc}
        </p>
      </div>

      {/* Card Bottom: Sleek Interactive Indicator */}
      <div className="mt-4 pt-3 border-t border-[#2A2D30]/80 flex items-center justify-between text-[11px] font-mono text-[#72706C]">
        <span className="flex items-center gap-1 text-amber-300/90 font-medium">
          <Zap size={11} />
          <span>Quick View</span>
        </span>
        <span className="text-[#A3A09B] group-hover/card:text-white transition-colors flex items-center gap-1 font-semibold">
          <span>View</span>
          <ChevronRight size={12} className="group-hover/card:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </div>
  );

  return (
    <section className="w-full relative my-2">
      {/* Main Card Container */}
      <div className="rounded-2xl bg-[#18191B] border border-[#2A2D30] hover:border-white/30 transition-all p-5 sm:p-7 relative overflow-hidden shadow-2xl text-left group/showcase">
        {/* Ambient Top Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mb-20" />

        {/* Top Header Bar */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#2A2D30]/80">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
              <Sparkles size={12} className="text-amber-300 animate-pulse" />
              <span>Explore The Domo Ecosystem</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#ECEBE9] tracking-tight flex items-center gap-2.5">
              <span>Connected Platforms &amp; Autonomous Tools</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#A3A09B] mt-1 max-w-2xl leading-relaxed">
              Integrated, privacy-first companion applications engineered for modern developers, security analysts, and AI agents. Click any application below to view technical architecture and launch.
            </p>
          </div>

          {/* Controls & Indicators */}
          <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
            {/* Play/Pause continuous loop toggle */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111213] border border-[#2A2D30] hover:border-white/40 text-[#ECEBE9] text-xs font-mono transition-all"
              title={isPaused ? 'Resume non-stop loop' : 'Pause non-stop loop'}
              aria-label={isPaused ? 'Resume loop' : 'Pause loop'}
            >
              {isPaused ? (
                <>
                  <Play size={12} className="text-amber-300" />
                  <span className="text-[11px]">Resume Loop</span>
                </>
              ) : (
                <>
                  <Pause size={12} className="text-[#A3A09B]" />
                  <span className="text-[11px] text-[#A3A09B]">Hover to Pause</span>
                </>
              )}
            </button>

            {/* Direction toggle buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setScrollDirection('left')}
                className={`p-1.5 rounded-xl bg-[#111213] border transition-all ${
                  scrollDirection === 'left' ? 'border-white/40 text-white' : 'border-[#2A2D30] text-[#A3A09B] hover:text-white'
                }`}
                title="Glide left"
                aria-label="Glide left"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setScrollDirection('right')}
                className={`p-1.5 rounded-xl bg-[#111213] border transition-all ${
                  scrollDirection === 'right' ? 'border-white/40 text-white' : 'border-[#2A2D30] text-[#A3A09B] hover:text-white'
                }`}
                title="Glide right"
                aria-label="Glide right"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Continuous Automatic Carousel Track Viewport */}
        <div className="relative mt-5 -mx-5 sm:-mx-7 px-5 sm:px-7 overflow-hidden marquee-wrapper">
          {/* Edge Fade Gradients for Seamless Visual Flow */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-[#18191B] via-[#18191B]/80 to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-[#18191B] via-[#18191B]/80 to-transparent z-10" />

          {/* Dual Seamless Continuous Tracks */}
          <div className="flex select-none py-2 w-max">
            {/* Primary Track */}
            <div
              className={`flex items-stretch gap-4 sm:gap-5 pr-4 sm:pr-5 shrink-0 ${
                scrollDirection === 'left' ? 'animate-marquee-continuous' : 'animate-marquee-continuous-reverse'
              }`}
              style={{
                animationDuration: '38s',
                animationPlayState: (isPaused || selectedApp !== null) ? 'paused' : undefined,
              }}
            >
              {carouselApps.map((app, index) => renderAppCard(app, `track-a-${app.id}-${index}`))}
            </div>

            {/* Twin Seamless Clone Track (ensures zero-jump continuous loop) */}
            <div
              aria-hidden="true"
              className={`flex items-stretch gap-4 sm:gap-5 pr-4 sm:pr-5 shrink-0 ${
                scrollDirection === 'left' ? 'animate-marquee-continuous' : 'animate-marquee-continuous-reverse'
              }`}
              style={{
                animationDuration: '38s',
                animationPlayState: (isPaused || selectedApp !== null) ? 'paused' : undefined,
              }}
            >
              {carouselApps.map((app, index) => renderAppCard(app, `track-b-${app.id}-${index}`, true))}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Popup Animation Card (Modal Dialog) */}
      {selectedApp && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ecosystem-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedApp(null)}
        >
          {/* Animated Modal Card */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'popupScaleIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
            className="relative w-full max-w-2xl bg-[#18191B] border border-[#2A2D30] rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 overflow-hidden text-left max-h-[90vh] flex flex-col focus:outline-none"
          >
            {/* Subtle Top Highlight Line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

            {/* Top Close Button */}
            <button
              onClick={() => setSelectedApp(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-xl bg-[#111213] border border-[#2A2D30] text-[#A3A09B] hover:text-white hover:border-white/40 transition-all z-20 cursor-pointer"
              title="Close modal (Esc)"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {/* Modal Header: Frameless App Logo with Ambient Glow + Title + Badge */}
            <div className="flex items-start gap-4 sm:gap-5 pb-5 border-b border-[#2A2D30] shrink-0 pr-10">
              {/* Frameless Floating B&W Logo with Ambient Glow */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shrink-0">
                <div className="absolute inset-0 bg-white/10 rounded-full blur-xl pointer-events-none" />
                <img
                  src={selectedApp.logoSrc}
                  alt={`${selectedApp.name} logo`}
                  className="w-14 h-14 sm:w-16 sm:h-16 object-contain relative z-10 filter grayscale contrast-125 brightness-110 drop-shadow-[0_8px_24px_rgba(255,255,255,0.2)]"
                />
              </div>

              <div className="space-y-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                  <Shield size={10} />
                  <span>{selectedApp.badge}</span>
                </div>
                <h3
                  id="ecosystem-modal-title"
                  className="text-xl sm:text-2xl font-extrabold text-[#ECEBE9] tracking-tight"
                >
                  {selectedApp.name}
                </h3>
                <p className="text-xs sm:text-sm text-[#A3A09B] font-medium leading-snug">
                  {selectedApp.tagline}
                </p>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1 sm:pr-2 scrollbar-none">
              {/* Description */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#72706C] font-bold mb-2 flex items-center gap-1.5">
                  <Layers size={13} />
                  <span>About This Platform</span>
                </h4>
                <p className="text-xs sm:text-sm text-[#ECEBE9] leading-relaxed bg-[#111213] border border-[#2A2D30] p-4 rounded-xl">
                  {selectedApp.description}
                </p>
              </div>

              {/* Why We Recommend It */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#72706C] font-bold mb-2.5 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-300" />
                  <span>Why We Recommend It</span>
                </h4>
                <div className="space-y-2">
                  {selectedApp.whyRecommended.map((point, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-[#A3A09B] leading-relaxed"
                    >
                      <CheckCircle2
                        size={15}
                        className="text-white shrink-0 mt-0.5"
                      />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Features Pill Cloud */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#72706C] font-bold mb-2 flex items-center gap-1.5">
                  <Zap size={13} />
                  <span>Key Architectural Features</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedApp.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-[11px] font-mono"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats Summary Bar */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#111213] border border-[#2A2D30] text-center">
                {selectedApp.stats.map((stat, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <span className="block text-[10px] font-mono text-[#72706C] uppercase">
                      {stat.label}
                    </span>
                    <span className="block text-xs sm:text-sm font-bold text-[#ECEBE9]">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="pt-4 border-t border-[#2A2D30] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
              <div className="text-[11px] font-mono text-[#72706C] hidden sm:block">
                Press <kbd className="px-1.5 py-0.5 rounded bg-[#111213] border border-[#2A2D30] text-[#ECEBE9]">Esc</kbd> to close
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-stretch gap-2">
                {/* In-App Tool Hub button if available */}
                {selectedApp.internalPath && (
                  <button
                    onClick={() => {
                      const path = selectedApp.internalPath!;
                      setSelectedApp(null);
                      navigate(path);
                    }}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#111213] hover:bg-[#1E2022] text-[#ECEBE9] border border-[#2A2D30] hover:border-white/40 text-xs font-bold transition-all"
                  >
                    <Terminal size={14} className="text-amber-300" />
                    <span>In-App Tool Hub</span>
                  </button>
                )}

                {/* Read Announcement Blog */}
                <a
                  href={`/blog/${selectedApp.blogSlug}`}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#111213] hover:bg-[#1E2022] text-[#ECEBE9] border border-[#2A2D30] hover:border-white/40 text-xs font-bold transition-all text-center"
                >
                  <BookOpen size={14} />
                  <span>Read Announcement</span>
                </a>

                {/* Primary CTA: Open App Directly */}
                <a
                  href={selectedApp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-all shadow-lg shadow-white/5 group/cta"
                >
                  <span>Open {selectedApp.name}</span>
                  <ArrowUpRight
                    size={15}
                    className="group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5 transition-transform"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
