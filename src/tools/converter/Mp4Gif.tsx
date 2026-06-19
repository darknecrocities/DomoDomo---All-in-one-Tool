import { triggerFileDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';



export const Mp4GifTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConvert = () => {
    if (!file) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Simulate conversion
      triggerFileDownload(new Blob(['gif-mock-data'], { type: 'image/gif' }), 'animation.gif');
    }, 1500);
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">MP4 ↔ GIF Converter</h3>
      <input type="file" accept="video/mp4" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} className="text-xs" />
      {file && (
        <button onClick={handleConvert} disabled={loading} className="btn-primary w-full py-2 text-xs">
          {loading ? 'Processing frames...' : 'Convert to GIF'}
        </button>
      )}
    </div>
  );
};
