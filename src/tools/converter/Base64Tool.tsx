import { useState } from 'react';



export const Base64Tool = () => {
  const [input, setInput] = useState('Hello');
  const [output, setOutput] = useState('');

  const handleProcess = () => {
    try {
      setOutput(btoa(input));
    } catch (e) {
      setOutput('Base64 Encoding Error');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
      <div className="glass-card p-5 flex flex-col gap-3 h-[320px]">
        <span className="text-xs font-bold text-slate-400 border-b border-slate-800 pb-2">Input String</span>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 bg-slate-950/20 border border-slate-850 rounded p-3 text-xs font-mono resize-none" />
        <button onClick={handleProcess} className="btn-primary text-xs py-1.5">Encode String</button>
      </div>
      <div className="glass-card p-5 flex flex-col gap-3 h-[320px]">
        <span className="text-xs font-bold text-slate-400 border-b border-slate-800 pb-2">Base64 Output</span>
        <textarea readOnly value={output} className="flex-1 bg-slate-950/40 border border-slate-850 rounded p-3 text-xs font-mono resize-none" />
      </div>
    </div>
  );
};
