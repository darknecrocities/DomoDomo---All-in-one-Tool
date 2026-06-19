import { triggerFileDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';




export const AudioCutterTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [start, setStart] = useState(0);

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">Audio Cutter</h3>
      <input type="file" accept="audio/*" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} className="text-xs" />
      {file && (
        <>
          <div className="text-xs text-slate-400">Trim Offset: {start}s</div>
          <input type="range" min="0" max="60" value={start} onChange={(e) => setStart(parseInt(e.target.value))} className="w-full accent-[#4E8E5E]" />
          <button onClick={() => triggerFileDownload(file, 'cut.mp3')} className="btn-primary w-full py-2 text-xs">Crop & Save Audio</button>
        </>
      )}
    </div>
  );
};
