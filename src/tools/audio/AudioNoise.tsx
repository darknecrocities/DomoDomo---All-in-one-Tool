import { triggerFileDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';




export const AudioNoiseTool = () => {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">Noise Removal</h3>
      <input type="file" accept="audio/*" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} className="text-xs" />
      {file && <button onClick={() => triggerFileDownload(file, 'cleaned.mp3')} className="btn-primary w-full py-2 text-xs">Remove Ambient Hiss</button>}
    </div>
  );
};
