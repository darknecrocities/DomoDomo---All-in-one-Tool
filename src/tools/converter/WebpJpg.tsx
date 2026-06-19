import { triggerFileDownload } from '../../utils/sharedHelpers';
import { useState, useRef } from 'react';



export const WebpJpgTool = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleConvert = () => {
    const c = canvasRef.current;
    if (!c || !imageUrl || !file) return;
    const ctx = c.getContext('2d');
    const img = new Image();
    img.onload = () => {
      c.width = img.width;
      c.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const targetMime = file.type === 'image/webp' ? 'image/jpeg' : 'image/webp';
      const ext = targetMime === 'image/webp' ? 'webp' : 'jpg';
      fetch(c.toDataURL(targetMime)).then(res => res.blob()).then(blob => triggerFileDownload(blob, `converted.${ext}`));
    };
    img.src = imageUrl;
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">WebP ↔ JPG Converter</h3>
      <input type="file" accept="image/jpeg,image/webp" onChange={(e) => {
        if (e.target.files?.[0]) {
          setFile(e.target.files[0]);
          setImageUrl(URL.createObjectURL(e.target.files[0]));
        }
      }} className="text-xs" />
      {file && (
        <button onClick={handleConvert} className="btn-primary w-full py-2 text-xs">
          Convert to {file.type === 'image/webp' ? 'JPG' : 'WebP'}
        </button>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
