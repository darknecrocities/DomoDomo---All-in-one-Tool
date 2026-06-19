import { useState } from 'react';



export const UUIDGeneratorTool = () => {
  const [uuid, setUuid] = useState('');

  const generate = () => {
    setUuid(crypto.randomUUID());
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">UUID Generator</h3>
      <button onClick={generate} className="btn-primary w-full py-2 text-xs">Generate UUIDv4</button>
      {uuid && <div className="bg-slate-950 p-3 rounded border border-slate-850 text-xs font-mono text-emerald-400 text-center select-all">{uuid}</div>}
    </div>
  );
};
