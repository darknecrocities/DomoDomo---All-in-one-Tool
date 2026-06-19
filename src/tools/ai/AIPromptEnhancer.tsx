import { useState } from 'react';


export const AIPromptEnhancerTool = () => {
  const [prompt, setPrompt] = useState('make a landing page');
  const [output, setOutput] = useState('');

  const handleRun = () => {
    setOutput(`Act as a senior frontend engineer. Design a clean, modern, minimal dark-mode landing page featuring glassmorphism cards, HSL tailwind colors, responsive flex layouts, and smooth CSS micro-interactions for a premium feel: "${prompt}"`);
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">AI Prompt Enhancer</h3>
      <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200" />
      <button onClick={handleRun} className="btn-primary w-full py-2 text-xs">Enhance Prompt</button>
      {output && <textarea readOnly value={output} className="bg-slate-950 p-2.5 rounded border border-slate-850 text-xs text-slate-300 h-24 resize-none mt-2" />}
    </div>
  );
};
