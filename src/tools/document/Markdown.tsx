import { triggerTextDownload } from '../../utils/sharedHelpers';
import { useState, useRef } from 'react';
import { FileText, Bold, Italic, Link, Code, List, Heading, Download, Eye, Columns } from 'lucide-react';

export const MarkdownTool = () => {
  const [markdown, setMarkdown] = useState(`# DomoDomo Markdown Note

Use this offline board to write and preview markdown documents.

## Key Features
- **Zero server dependencies**: Saves fully locally.
- *Micro-format templates*: Export instantly.

---
\`\`\`javascript
const greeting = "Hello DomoDomo!";
console.log(greeting);
\`\`\`
`);
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Simple client-side Markdown to HTML converter
  const parseMarkdown = (md: string) => {
    let html = md
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-slate-950 p-3 rounded-lg border border-slate-850 font-mono text-[11px] text-indigo-300 overflow-x-auto my-3"><code>$2</code></pre>');
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-900 px-1.5 py-0.5 rounded font-mono text-emerald-400">$1</code>');
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h4 class="text-sm font-bold text-slate-100 mt-4 mb-2">$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h3 class="text-base font-bold text-slate-100 mt-5 mb-2 border-b border-slate-850 pb-1">$1</h3>');
    html = html.replace(/^# (.*$)/gim, '<h2 class="text-lg font-bold text-white mt-2 mb-3">$1</h2>');

    // Horizontal Rule
    html = html.replace(/^\s*---\s*$/gim, '<hr class="border-slate-800 my-4" />');

    // Bold and Italics
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Lists
    html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="ml-4 list-disc text-slate-300">$1</li>');

    // Paragraphs (split by double newline, skip headers/codeblocks)
    const lines = html.split('\n');
    let inList = false;
    const finalLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('<li')) {
        if (!inList) {
          inList = true;
          return '<ul class="my-2">' + line;
        }
        return line;
      } else {
        if (inList) {
          inList = false;
          return '</ul>' + (trimmed ? `<p class="my-2 text-slate-300 leading-relaxed">${line}</p>` : '');
        }
      }
      if (trimmed && !trimmed.startsWith('<h') && !trimmed.startsWith('<hr') && !trimmed.startsWith('<pre') && !trimmed.startsWith('<code') && !trimmed.startsWith('</pre') && !trimmed.startsWith('</code') && !trimmed.startsWith('</ul')) {
        return `<p class="my-2 text-slate-350 leading-relaxed text-xs">${line}</p>`;
      }
      return line;
    });

    return finalLines.join('\n');
  };

  const insertSnippet = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    
    const replacement = prefix + selected + suffix;
    setMarkdown(text.substring(0, start) + replacement + text.substring(end));
    
    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 50);
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="glass-card p-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="text-[#4E8E5E]" size={22} />
            <span>Markdown Sandbox Workspace</span>
          </h2>
          
          <div className="flex items-center gap-2">
            <div className="flex p-0.5 bg-slate-900 border border-slate-800 rounded-lg text-xs">
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1 rounded-md font-semibold flex items-center gap-1.5 ${viewMode === 'split' ? 'bg-[#4E8E5E] text-white' : 'text-slate-450 hover:text-slate-200'}`}
              >
                <Columns size={12} />
                <span>Split View</span>
              </button>
              <button
                onClick={() => setViewMode('edit')}
                className={`px-3 py-1 rounded-md font-semibold flex items-center gap-1.5 ${viewMode === 'edit' ? 'bg-[#4E8E5E] text-white' : 'text-slate-450 hover:text-slate-200'}`}
              >
                <span>Edit</span>
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 rounded-md font-semibold flex items-center gap-1.5 ${viewMode === 'preview' ? 'bg-[#4E8E5E] text-white' : 'text-slate-450 hover:text-slate-200'}`}
              >
                <Eye size={12} />
                <span>Preview</span>
              </button>
            </div>
            <button
              onClick={() => triggerTextDownload(markdown, 'notes.md')}
              className="btn-secondary py-1.5 px-3 text-xs"
              title="Download MD"
            >
              <Download size={14} />
            </button>
          </div>
        </div>

        {/* Insert formatting toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-900/60 rounded-xl border border-slate-850">
          <button onClick={() => insertSnippet('**', '**')} className="p-2 hover:bg-slate-800 rounded text-slate-350 hover:text-white" title="Bold"><Bold size={15} /></button>
          <button onClick={() => insertSnippet('*', '*')} className="p-2 hover:bg-slate-800 rounded text-slate-350 hover:text-white" title="Italic"><Italic size={15} /></button>
          <button onClick={() => insertSnippet('# ')} className="p-2 hover:bg-slate-800 rounded text-slate-350 hover:text-white" title="Heading"><Heading size={15} /></button>
          <button onClick={() => insertSnippet('[', '](https://)')} className="p-2 hover:bg-slate-800 rounded text-slate-350 hover:text-white" title="Insert Link"><Link size={15} /></button>
          <button onClick={() => insertSnippet('```javascript\n', '\n```')} className="p-2 hover:bg-slate-800 rounded text-slate-350 hover:text-white" title="Code Block"><Code size={15} /></button>
          <button onClick={() => insertSnippet('- ')} className="p-2 hover:bg-slate-800 rounded text-slate-350 hover:text-white" title="List Item"><List size={15} /></button>
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
            />
          )}

          {/* Preview panel */}
          {(viewMode === 'split' || viewMode === 'preview') && (
            <div
              className="w-full h-full bg-slate-950/35 border border-slate-850 rounded-2xl p-5 overflow-y-auto leading-relaxed text-xs text-slate-200"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(markdown) }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
