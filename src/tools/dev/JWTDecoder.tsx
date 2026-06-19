import { useState } from 'react';



export const JWTDecoderTool = () => {
  const [token, setToken] = useState('header.payload.signature');
  const [header, setHeader] = useState('');
  const [payload, setPayload] = useState('');

  const handleDecode = () => {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return;
      const hDecoded = atob(parts[0].replace(/-/g, '+').replace(/_/g, '/'));
      const pDecoded = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      setHeader(JSON.stringify(JSON.parse(hDecoded), null, 2));
      setPayload(JSON.stringify(JSON.parse(pDecoded), null, 2));
    } catch (e) {
      setHeader('Invalid JWT Structure');
      setPayload('');
    }
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">JWT Decoder</h3>
      <input type="text" value={token} onChange={(e) => setToken(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200" />
      <button onClick={handleDecode} className="btn-primary w-full py-2 text-xs">Decode Token</button>
      {header && (
        <div className="flex flex-col gap-2 mt-2">
          <span className="text-[10px] text-slate-500 font-bold">Header</span>
          <textarea readOnly value={header} className="bg-slate-950 p-2.5 text-xs font-mono rounded border border-slate-850 text-slate-300 h-20 resize-none" />
          <span className="text-[10px] text-slate-500 font-bold">Payload</span>
          <textarea readOnly value={payload} className="bg-slate-950 p-2.5 text-xs font-mono rounded border border-slate-850 text-slate-300 h-24 resize-none" />
        </div>
      )}
    </div>
  );
};
