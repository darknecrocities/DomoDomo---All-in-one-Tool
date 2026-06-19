import { useState } from 'react';


export const AITextRewriterTool = () => {
  const [text, setText] = useState('i want to fix coding.');
  const [style, setStyle] = useState('corporate');
  const [output, setOutput] = useState('');

  const handleRun = () => {
    if (style === 'corporate') {
      setOutput('I am looking to optimize and resolve structural codebase inconsistencies.');
    } else {
      setOutput('Let’s refactor and fix these bugs!');
    }
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">AI Text Rewriter</h3>
      <input type="text" value={text} onChange={(e) => setText(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200" />
      <select value={style} onChange={(e) => setStyle(e.target.value)} className="bg-slate-900 border border-slate-800 text-xs px-3 py-1.5 rounded text-slate-200">
        <option value="corporate">Corporate Tone</option>
        <option value="casual">Casual Tone</option>
      </select>
      <button onClick={handleRun} className="btn-primary w-full py-2 text-xs">Rewrite Text</button>
      {output && <textarea readOnly value={output} className="bg-slate-950 p-2.5 rounded border border-slate-850 text-xs text-slate-300 h-16 resize-none mt-2" />}
    </div>
  );
};
