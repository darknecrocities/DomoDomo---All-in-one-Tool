import { triggerTextDownload } from '../../utils/sharedHelpers';
import { parseMarkdown } from '../../utils/markdownParser';
import { useState, useRef } from 'react';
import { FileText, Bold, Italic, Link, Code, List, Heading, Download, Eye, Columns, CheckSquare, Quote, Table, Image, Trash2, Copy, Check } from 'lucide-react';

const templates = {
  readme: `# Project Title

A brief description of what this project does and who it's for.

## Features
- **Modern UI**: Dark mode, gradients, glassmorphism.
- *Extremely Fast*: Powered by React client-side rendering.

## Setup Instructions
\`\`\`bash
# Install dependencies
npm install

# Start local server
npm run dev
\`\`\`

## Contribution Guidelines
> Please open an issue first to discuss what you would like to change.

| Contributor | Role |
|---|---|
| DomoDomo AI | Lead Engineer |
| User | Product Designer |
`,
  meeting: `# Meeting Notes: Weekly Sync

Date: \${new Date().toLocaleDateString()}
Time: 10:00 AM

## Agenda
- [x] Review previous action items
- [ ] Product roadmap alignment
- [ ] Staging environment checks

## Key Discussion Points
- Discussion on PDF Sign Tool responsive enhancements.
- Feedback on Background Remover pointer-event fixes.

## Action Items
- [ ] **Engineering**: Implement Markdown Editor themes and templates.
- [ ] **Design**: Iterate on mobile layouts.
`,
  spec: `# Technical Specification: Premium UI Design

Author: DomoDomo Architect
Status: Draft

## 1. Overview
This document outlines the visual system tokens for our application toolbox.

## 2. Design System
We utilize a unified CSS configuration utilizing tailored HSL tokens.

> "A consistent visual language builds trust with developers and users alike."

| Component | Theme Class | Purpose |
|---|---|---|
| Card Container | \`glass-card\` | Backdrops |
| Active Badge | \`bg-teal-500/20\` | Success cues |
| Error Alert | \`bg-rose-500/20\` | Warning cues |
`
};

export const MarkdownTool = () => {
  const [markdown, setMarkdown] = useState(templates.readme);
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [theme, setTheme] = useState<'dark' | 'slate' | 'github' | 'retro'>('dark');
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);



  const insertSnippet = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    
    const replacement = prefix + selected + suffix;
    setMarkdown(text.substring(0, start) + replacement + text.substring(end));
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 50);
  };

  const handleCopyMd = () => {
    navigator.clipboard.writeText(markdown);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleCopyHtml = () => {
    const parsed = parseMarkdown(markdown);
    navigator.clipboard.writeText(parsed);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  const words = markdown.trim().split(/\s+/).filter(w => w).length;
  const chars = markdown.length;
  const readTime = Math.max(1, Math.round(words / 200));

  // Determine classes based on theme
  const getThemeClasses = () => {
    switch (theme) {
      case 'slate':
        return 'bg-slate-900 border-slate-700 text-slate-100 prose-slate';
      case 'github':
        return 'bg-white text-slate-800 border-slate-200 shadow-inner prose-github';
      case 'retro':
        return 'bg-black text-[#33FF33] border-[#33FF33]/30 font-mono';
      default:
        return 'bg-slate-950/35 border-slate-850 text-slate-200';
    }
  };

  const getFontFamilyStyle = () => {
    switch (fontFamily) {
      case 'serif':
        return { fontFamily: 'Georgia, Cambria, serif' };
      case 'mono':
        return { fontFamily: 'Fira Code, Courier New, monospace' };
      default:
        return { fontFamily: 'Inter, system-ui, sans-serif' };
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="glass-card p-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-3 gap-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="text-[#4E8E5E]" size={22} />
            <span>Markdown Sandbox Workspace</span>
          </h2>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex p-0.5 bg-slate-900 border border-slate-800 rounded-lg text-xs">
              {(['split', 'edit', 'preview'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 rounded-md font-semibold flex items-center gap-1.5 transition-all ${
                    viewMode === mode ? 'bg-[#4E8E5E] text-white shadow-md' : 'text-slate-450 hover:text-slate-200'
                  }`}
                >
                  {mode === 'split' && <Columns size={12} />}
                  {mode === 'preview' && <Eye size={12} />}
                  <span>{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => triggerTextDownload(markdown, 'notes.md')}
              className="btn-secondary py-1.5 px-3 text-xs flex items-center justify-center gap-1.5"
              title="Download Markdown File"
            >
              <Download size={14} />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Customization Toolbar & Template Presets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-slate-900/40 p-3 rounded-2xl border border-slate-850/80">
          {/* Templates */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Presets:</span>
            <div className="flex gap-1.5">
              <button onClick={() => setMarkdown(templates.readme)} className="px-2 py-1 bg-slate-800 border border-slate-700/80 rounded text-[10px] text-slate-300 hover:text-white font-semibold hover:bg-slate-750 transition-all">README</button>
              <button onClick={() => setMarkdown(templates.meeting)} className="px-2 py-1 bg-slate-800 border border-slate-700/80 rounded text-[10px] text-slate-300 hover:text-white font-semibold hover:bg-slate-750 transition-all">Meeting Agenda</button>
              <button onClick={() => setMarkdown(templates.spec)} className="px-2 py-1 bg-slate-800 border border-slate-700/80 rounded text-[10px] text-slate-300 hover:text-white font-semibold hover:bg-slate-750 transition-all">Tech Spec</button>
            </div>
          </div>

          {/* Theme & Fonts selectors */}
          <div className="flex items-center md:justify-end gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Theme:</span>
              <select value={theme} onChange={(e) => setTheme(e.target.value as any)} className="bg-slate-950 border border-slate-850 rounded px-2 py-1 text-[10px] text-slate-300 focus:outline-none">
                <option value="dark">Dark UI</option>
                <option value="slate">Slate Paper</option>
                <option value="github">Github Light</option>
                <option value="retro">Green Terminal</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Font:</span>
              <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value as any)} className="bg-slate-950 border border-slate-850 rounded px-2 py-1 text-[10px] text-slate-300 focus:outline-none">
                <option value="sans">Sans-Serif</option>
                <option value="serif">Classic Serif</option>
                <option value="mono">Fira Monospace</option>
              </select>
            </div>
          </div>
        </div>

        {/* Formatting Insert toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-900/60 rounded-xl border border-slate-850">
          <div className="flex flex-wrap items-center gap-1.5">
            <button onClick={() => insertSnippet('**', '**')} className="p-2 hover:bg-slate-800 rounded text-slate-350 hover:text-white transition-colors" title="Bold"><Bold size={14} /></button>
            <button onClick={() => insertSnippet('*', '*')} className="p-2 hover:bg-slate-800 rounded text-slate-350 hover:text-white transition-colors" title="Italic"><Italic size={14} /></button>
            <button onClick={() => insertSnippet('~~', '~~')} className="p-2 hover:bg-slate-800 rounded text-slate-350 hover:text-white transition-colors font-bold text-xs" title="Strikethrough">S</button>
            <button onClick={() => insertSnippet('# ')} className="p-2 hover:bg-slate-800 rounded text-slate-350 hover:text-white transition-colors" title="Heading"><Heading size={14} /></button>
            <button onClick={() => insertSnippet('[', '](https://)')} className="p-2 hover:bg-slate-800 rounded text-slate-350 hover:text-white transition-colors" title="Insert Link"><Link size={14} /></button>
            <button onClick={() => insertSnippet('```javascript\n', '\n```')} className="p-2 hover:bg-slate-800 rounded text-slate-350 hover:text-white transition-colors" title="Code Block"><Code size={14} /></button>
            <button onClick={() => insertSnippet('- ')} className="p-2 hover:bg-slate-800 rounded text-slate-350 hover:text-white transition-colors" title="Bullet List"><List size={14} /></button>
            <button onClick={() => insertSnippet('- [ ] ')} className="p-2 hover:bg-slate-800 rounded text-slate-350 hover:text-white transition-colors" title="Task List"><CheckSquare size={14} /></button>
            <button onClick={() => insertSnippet('> ')} className="p-2 hover:bg-slate-800 rounded text-slate-350 hover:text-white transition-colors" title="Quote Block"><Quote size={14} /></button>
            <button onClick={() => insertSnippet('| Header | Header |\\n|---|---|\\n| Cell | Cell |\\n')} className="p-2 hover:bg-slate-800 rounded text-slate-350 hover:text-white transition-colors" title="Table"><Table size={14} /></button>
            <button onClick={() => insertSnippet('![Alt Text](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400)')} className="p-2 hover:bg-slate-800 rounded text-slate-350 hover:text-white transition-colors" title="Image Link"><Image size={14} /></button>
          </div>

          <div className="flex gap-1">
            <button
              onClick={handleCopyMd}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded text-[10px] font-bold transition-all flex items-center gap-1"
              title="Copy Raw Markdown"
            >
              {copiedMd ? <Check size={10} className="text-teal-400" /> : <Copy size={10} />}
              <span>Copy MD</span>
            </button>
            <button
              onClick={handleCopyHtml}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded text-[10px] font-bold transition-all flex items-center gap-1"
              title="Copy Rendered HTML Output"
            >
              {copiedHtml ? <Check size={10} className="text-teal-400" /> : <Copy size={10} />}
              <span>Copy HTML</span>
            </button>
            <button
              onClick={() => setMarkdown('')}
              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-350 rounded border border-rose-500/20 transition-all"
              title="Clear Workspace"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Editor Workspace Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">
          {/* Edit panel */}
          {(viewMode === 'split' || viewMode === 'edit') && (
            <textarea
              ref={textareaRef}
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="w-full h-full bg-slate-950/20 border border-slate-850 rounded-2xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#4E8E5E] resize-none leading-relaxed outline-none"
              placeholder="Start typing your Markdown here..."
            />
          )}

          {/* Preview panel */}
          {(viewMode === 'split' || viewMode === 'preview') && (
            <div
              className={`w-full h-full border rounded-2xl p-5 overflow-y-auto leading-relaxed text-xs transition-all ${getThemeClasses()}`}
              style={getFontFamilyStyle()}
              dangerouslySetInnerHTML={{ __html: parseMarkdown(markdown) }}
            />
          )}
        </div>

        {/* Stats footer bar */}
        <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-500 font-mono mt-1 border-t border-slate-850 pt-2.5">
          <div>Words: <span className="text-slate-300 font-bold">{words}</span></div>
          <div>Characters: <span className="text-slate-300 font-bold">{chars}</span></div>
          <div>Estimated Read Time: <span className="text-[#4E8E5E] font-bold">{readTime} min</span></div>
        </div>
      </div>
    </div>
  );
};
