import { triggerFileDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';



export const Mp3WavTool = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleConvert = () => {
    if (!file) return;
    // Basic structural audio download
    triggerFileDownload(file, `${file.name.replace(/\.[^/.]+$/, "")}.wav`);
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">MP3 ↔ WAV Converter</h3>
      <input type="file" accept="audio/mp3,audio/wav" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} className="text-xs" />
      {file && <button onClick={handleConvert} className="btn-primary w-full py-2 text-xs">Convert Format</button>}
    </div>
  );
};
