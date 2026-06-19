import { useState } from 'react';



export const HTMLMinifierTool = () => {
  const [input, setInput] = useState('<!-- test comment -->\n<div class="test">\n  <span>hello</span>\n</div>');
  const [output, setOutput] = useState('');

  const handleMinify = () => {
    let minified = input
      .replace(/<!--[\s\S]*?-->/g, '') // remove comments
      .replace(/\s+/g, ' ') // collapse spacing
      .replace(/>\s+</g, '><'); // strip tags boundary spacing
    setOutput(minified.trim());
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">HTML Minifier</h3>
      <textarea value={input} onChange={(e) => setInput(e.target.value)} className="bg-slate-900 border border-slate-800 rounded p-3 text-xs h-20 text-slate-200 resize-none" />
      <button onClick={handleMinify} className="btn-primary w-full py-2 text-xs">Minify Code</button>
      {output && <textarea readOnly value={output} className="bg-slate-950 p-2.5 rounded border border-slate-850 text-xs font-mono text-emerald-400 h-16 resize-none mt-2" />}
    </div>
  );
};
