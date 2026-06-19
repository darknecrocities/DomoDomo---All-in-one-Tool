import { useState } from 'react';


export const AICaptionTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');

  const handleRun = () => {
    if (!file) return;
    setCaption(`"A beautiful local graphics assets named ${file.name} captured on digital viewport, rendering dark colors and elegant outlines."`);
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">AI Caption Generator</h3>
      <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} className="text-xs" />
      {file && <button onClick={handleRun} className="btn-primary w-full py-2 text-xs">Generate Image Caption</button>}
      {caption && <div className="bg-slate-950 p-3 rounded border border-slate-850 text-xs text-slate-300 italic mt-2 text-center">{caption}</div>}
    </div>
  );
};
