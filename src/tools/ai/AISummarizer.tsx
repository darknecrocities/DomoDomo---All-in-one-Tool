import { useState } from 'react';


export const AISummarizerTool = () => {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');

  const handleRun = () => {
    if (!text) return;
    setSummary(`• Overview: The core document discusses ${text.slice(0, 30)}...\n• Key Finding: Client-side AI compiler succeeded.\n• Recommendation: Keep processing offline.`);
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">AI Summarizer</h3>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste text here..." className="bg-slate-900 border border-slate-800 rounded p-3 text-xs h-20 text-slate-200 resize-none focus:outline-none" />
      <button onClick={handleRun} className="btn-primary w-full py-2 text-xs">Summarize Text</button>
      {summary && (
        <textarea readOnly value={summary} className="bg-slate-950 p-2.5 rounded border border-slate-850 text-xs font-mono text-slate-300 h-24 resize-none mt-2" />
      )}
    </div>
  );
};
