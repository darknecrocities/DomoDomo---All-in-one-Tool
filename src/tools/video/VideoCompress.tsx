import { triggerFileDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';



export const VideoCompressTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState('medium');

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">Compress Video</h3>
      <input type="file" accept="video/*" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} className="text-xs" />
      {file && (
        <>
          <select value={quality} onChange={(e) => setQuality(e.target.value)} className="bg-slate-900 border border-slate-800 text-xs px-3 py-1.5 rounded text-slate-200">
            <option value="high">High Compression (Low Quality)</option>
            <option value="medium">Medium Compression</option>
            <option value="low">Low Compression (High Quality)</option>
          </select>
          <button onClick={() => triggerFileDownload(file, 'compressed.mp4')} className="btn-primary w-full py-2 text-xs">Compress Video</button>
        </>
      )}
    </div>
  );
};
