import { triggerFileDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';



export const VideoTrimTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(10);

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">Trim Video</h3>
      <input type="file" accept="video/*" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} className="text-xs" />
      {file && (
        <>
          <div className="flex justify-between text-xs text-slate-400">
            <span>Start: {start}s</span>
            <span>End: {end}s</span>
          </div>
          <input type="range" min="0" max="60" value={start} onChange={(e) => setStart(parseInt(e.target.value))} className="w-full accent-[#4E8E5E]" />
          <input type="range" min="0" max="60" value={end} onChange={(e) => setEnd(parseInt(e.target.value))} className="w-full accent-[#4E8E5E]" />
          <button onClick={() => triggerFileDownload(file, 'trimmed.mp4')} className="btn-primary w-full py-2 text-xs">Download Trimmed Video</button>
        </>
      )}
    </div>
  );
};
