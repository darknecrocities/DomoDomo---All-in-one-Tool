import { useState } from 'react';



export const SummarizerTool = () => {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');

  const handleSummarize = () => {
    if (!text.trim()) return;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
    const keySentences = sentences.slice(0, 2).map(s => `• ${s.trim()}.`).join('\n');
    setSummary(keySentences || 'Text is too short to summarize.');
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">Text Summarizer</h3>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste text to summarize..." className="bg-slate-900 border border-slate-800 rounded p-3 text-xs h-24 text-slate-200 resize-none focus:outline-none" />
      <button onClick={handleSummarize} className="btn-primary w-full py-2 text-xs">Summarize Text</button>
      {summary && (
        <div className="bg-slate-950 p-3 rounded text-xs text-slate-350 border border-slate-850 mt-2 whitespace-pre-wrap">{summary}</div>
      )}
    </div>
  );
};
