import { triggerFileDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';



export const VideoAudioTool = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleExtract = () => {
    if (!file) return;
    triggerFileDownload(new Blob(['audio-data'], { type: 'audio/mp3' }), 'extracted_audio.mp3');
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">Extract Audio track</h3>
      <input type="file" accept="video/*" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} className="text-xs" />
      {file && <button onClick={handleExtract} className="btn-primary w-full py-2 text-xs">Extract to MP3</button>}
    </div>
  );
};
