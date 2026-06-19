import { useState } from 'react';



export const XmlJsonTool = () => {
  const [input, setInput] = useState('<user><name>Panda</name></user>');
  const [output, setOutput] = useState('');

  const handleXmlToJson = () => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(input, 'text/xml');
      const nameNode = doc.querySelector('name');
      if (nameNode) {
        setOutput(JSON.stringify({ name: nameNode.textContent }, null, 2));
      } else {
        setOutput('{"status": "Node not found"}');
      }
    } catch (e) {
      setOutput('XML Parsing Error');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
      <div className="glass-card p-5 flex flex-col gap-3 h-[320px]">
        <span className="text-xs font-bold text-slate-400 border-b border-slate-800 pb-2">Input XML</span>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 bg-slate-950/20 border border-slate-850 rounded p-3 text-xs font-mono resize-none" />
        <button onClick={handleXmlToJson} className="btn-primary text-xs py-1.5">Convert XML to JSON</button>
      </div>
      <div className="glass-card p-5 flex flex-col gap-3 h-[320px]">
        <span className="text-xs font-bold text-slate-400 border-b border-slate-800 pb-2">Output JSON</span>
        <textarea readOnly value={output} className="flex-1 bg-slate-950/40 border border-slate-850 rounded p-3 text-xs font-mono resize-none" />
      </div>
    </div>
  );
};
