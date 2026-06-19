import { triggerFileDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';



export const VideoSubtitlesTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [sub, setSub] = useState('Welcome to DomoDomo');

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">Add Subtitles</h3>
      <input type="file" accept="video/*" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} className="text-xs" />
      <input type="text" value={sub} onChange={(e) => setSub(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200" />
      {file && <button onClick={() => triggerFileDownload(file, 'subtitled.mp4')} className="btn-primary w-full py-2 text-xs">Overlay Subtitles</button>}
    </div>
  );
};
