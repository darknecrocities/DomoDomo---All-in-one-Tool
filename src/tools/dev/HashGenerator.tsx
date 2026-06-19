import { useState } from 'react';



export const HashGeneratorTool = () => {
  const [text, setText] = useState('DomoDomo');
  const [hash, setHash] = useState('');

  const handleHash = async () => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    setHash(hashHex);
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">SHA-256 Hash Generator</h3>
      <input type="text" value={text} onChange={(e) => setText(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200" />
      <button onClick={handleHash} className="btn-primary w-full py-2 text-xs">Generate SHA-256 Hash</button>
      {hash && <textarea readOnly value={hash} className="bg-slate-950 p-2.5 rounded border border-slate-850 text-xs font-mono text-slate-300 h-16 resize-none" />}
    </div>
  );
};
