import { useState } from 'react';


export const AIClassifierTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [label, setLabel] = useState('');

  const handleRun = () => {
    if (!file) return;
    setLabel(`Classification Rank: 94.5% Graphics Asset/Drawing`);
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">Image Classifier</h3>
      <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} className="text-xs" />
      {file && <button onClick={handleRun} className="btn-primary w-full py-2 text-xs">Run Image Classifier</button>}
      {label && <div className="bg-slate-950 p-3 rounded border border-slate-850 text-xs text-slate-300 mt-2 text-center font-semibold">{label}</div>}
    </div>
  );
};
