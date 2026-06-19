import { useState } from 'react';

export const MarkdownTool = () => {
  const [markdown, setMarkdown] = useState('# Hello Markdown\nStart typing content...');
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
      <div className="glass-card p-5 flex flex-col gap-3 h-[400px]">
        <span className="text-xs font-bold text-slate-400 border-b border-slate-800 pb-2">Markdown Editor</span>
        <textarea value={markdown} onChange={(e) => setMarkdown(e.target.value)} className="flex-1 bg-slate-950/20 border border-slate-850 rounded p-3 text-xs font-mono resize-none focus:outline-none focus:border-[#4E8E5E] text-slate-350" />
      </div>
      <div className="glass-card p-5 flex flex-col gap-3 h-[400px]">
        <span className="text-xs font-bold text-slate-400 border-b border-slate-800 pb-2">Live Preview</span>
        <div className="flex-1 bg-slate-950/40 border border-slate-850 rounded p-3 overflow-y-auto text-sm text-slate-300">
          <pre className="whitespace-pre-wrap">{markdown}</pre>
        </div>
      </div>
    </div>
  );
};
