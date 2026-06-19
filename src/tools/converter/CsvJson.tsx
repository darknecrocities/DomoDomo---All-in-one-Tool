import { useState } from 'react';



export const CsvJsonTool = () => {
  const [input, setInput] = useState('name,age\nDomoDomo,1');
  const [output, setOutput] = useState('');

  const handleCsvToJson = () => {
    const lines = input.split('\n');
    const headers = lines[0].split(',');
    const list = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i]) continue;
      const values = lines[i].split(',');
      const obj: any = {};
      headers.forEach((h, idx) => {
        obj[h.trim()] = values[idx]?.trim();
      });
      list.push(obj);
    }
    setOutput(JSON.stringify(list, null, 2));
  };

  const handleJsonToCsv = () => {
    try {
      const parsed = JSON.parse(input);
      if (!Array.isArray(parsed)) return;
      const headers = Object.keys(parsed[0]);
      const csvLines = [headers.join(',')];
      parsed.forEach((obj: any) => {
        csvLines.push(headers.map(h => obj[h]).join(','));
      });
      setOutput(csvLines.join('\n'));
    } catch (e) {
      setOutput('Error parsing JSON string');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
      <div className="glass-card p-5 flex flex-col gap-3 h-[380px]">
        <span className="text-xs font-bold text-slate-400 border-b border-slate-800 pb-2">Input Area</span>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 bg-slate-950/20 border border-slate-850 rounded p-3 text-xs font-mono resize-none focus:outline-none" />
        <div className="flex gap-2">
          <button onClick={handleCsvToJson} className="btn-primary flex-1 text-xs py-1.5">CSV → JSON</button>
          <button onClick={handleJsonToCsv} className="btn-secondary flex-1 text-xs py-1.5">JSON → CSV</button>
        </div>
      </div>
      <div className="glass-card p-5 flex flex-col gap-3 h-[380px]">
        <span className="text-xs font-bold text-slate-400 border-b border-slate-800 pb-2">Output</span>
        <textarea readOnly value={output} className="flex-1 bg-slate-950/40 border border-slate-850 rounded p-3 text-xs font-mono resize-none" />
      </div>
    </div>
  );
};
