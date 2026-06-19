import { useState } from 'react';



export const URLEncoderTool = () => {
  const [input, setInput] = useState('name=arron parejas&project=domodomo');
  const [output, setOutput] = useState('');

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">URL Encoder/Decoder</h3>
      <input type="text" value={input} onChange={(e) => setInput(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200" />
      <div className="flex gap-2">
        <button onClick={() => setOutput(encodeURIComponent(input))} className="btn-primary flex-1 py-2 text-xs">Encode URI</button>
        <button onClick={() => { try { setOutput(decodeURIComponent(input)); } catch (e) { setOutput('URI Error'); } }} className="btn-secondary flex-1 py-2 text-xs">Decode URI</button>
      </div>
      {output && <div className="bg-slate-950 p-3 rounded border border-slate-850 text-xs font-mono text-slate-300 mt-2 truncate">{output}</div>}
    </div>
  );
};
