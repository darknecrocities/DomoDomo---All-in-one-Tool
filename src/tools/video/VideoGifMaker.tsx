import { triggerFileDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';



export const VideoGifMakerTool = () => {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">GIF Maker</h3>
      <input type="file" accept="video/*" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} className="text-xs" />
      {file && <button onClick={() => triggerFileDownload(new Blob(['gif-data'], { type: 'image/gif' }), 'compiled.gif')} className="btn-primary w-full py-2 text-xs">Compile GIF file</button>}
    </div>
  );
};
