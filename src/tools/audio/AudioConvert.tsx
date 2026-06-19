import { triggerFileDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';




export const AudioConvertTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState('wav');

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">Convert Audio Format</h3>
      <input type="file" accept="audio/*" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} className="text-xs" />
      <select value={format} onChange={(e) => setFormat(e.target.value)} className="bg-slate-900 border border-slate-800 text-xs px-3 py-1.5 rounded text-slate-200">
        <option value="wav">WAV Format</option>
        <option value="mp3">MP3 Format</option>
      </select>
      {file && <button onClick={() => triggerFileDownload(file, `converted.${format}`)} className="btn-primary w-full py-2 text-xs">Convert</button>}
    </div>
  );
};
