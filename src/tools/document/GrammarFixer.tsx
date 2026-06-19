import { useState } from 'react';



export const GrammarFixerTool = () => {
  const [text, setText] = useState('i runs the code.');
  const [fixed, setFixed] = useState('');

  const handleFix = () => {
    let output = text;
    // Basic heuristics rule fixes
    output = output.replace(/\bi runs\b/gi, 'I run');
    output = output.replace(/\bi is\b/gi, 'I am');
    setFixed(output);
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">Grammar Fixer</h3>
      <textarea value={text} onChange={(e) => setText(e.target.value)} className="bg-slate-900 border border-slate-800 rounded p-3 text-xs h-20 text-slate-200 resize-none focus:outline-none" />
      <button onClick={handleFix} className="btn-primary w-full py-2 text-xs">Fix Grammar</button>
      {fixed && (
        <div className="bg-slate-950 p-3 rounded text-xs text-emerald-400 border border-slate-850 mt-2">{fixed}</div>
      )}
    </div>
  );
};
