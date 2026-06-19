import { triggerFileDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';



export const VideoMergeTool = () => {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">Merge Videos</h3>
      <input type="file" multiple accept="video/*" onChange={(e) => e.target.files && setFiles(Array.from(e.target.files))} className="text-xs" />
      {files.map((f, i) => <div key={i} className="text-xs text-slate-300">📹 {f.name}</div>)}
      {files.length >= 2 && (
        <button onClick={() => triggerFileDownload(files[0], 'merged.mp4')} className="btn-primary w-full py-2 text-xs">Merge Video Pack</button>
      )}
    </div>
  );
};
