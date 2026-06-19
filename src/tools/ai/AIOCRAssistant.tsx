import { useState } from 'react';


export const AIOCRAssistantTool = () => {
  const [input, setInput] = useState('Scanned receipt data...');
  const [output, setOutput] = useState('');

  const handleRun = () => {
    const lines = input.split('\n').filter(l => l.trim().length > 0);
    let table = `| Item / Attribute | Parsed Detail |\n|------------------|---------------|\n`;
    lines.forEach((line, idx) => {
      const parts = line.split(/[:\t=]+/);
      if (parts.length > 1) {
        table += `| ${parts[0].trim()} | ${parts.slice(1).join(' ').trim()} |\n`;
      } else {
        table += `| Record ${idx + 1} | ${line.trim()} |\n`;
      }
    });
    setOutput(table);
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">AI OCR Assistant</h3>
      <textarea value={input} onChange={(e) => setInput(e.target.value)} className="bg-slate-900 border border-slate-800 rounded p-3 text-xs h-20 text-slate-200 resize-none focus:outline-none" />
      <button onClick={handleRun} className="btn-primary w-full py-2 text-xs">Format Scanned Text</button>
      {output && <textarea readOnly value={output} className="bg-slate-950 p-2.5 rounded border border-slate-850 text-xs font-mono text-slate-300 h-20 resize-none mt-2" />}
    </div>
  );
};
