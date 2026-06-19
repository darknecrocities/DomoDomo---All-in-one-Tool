import { triggerFileDownload } from '../../utils/sharedHelpers';
import { useState, useRef, useEffect } from 'react';



export const VideoThumbnailTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (file) {
      const u = URL.createObjectURL(file);
      setUrl(u);
      return () => URL.revokeObjectURL(u);
    }
  }, [file]);

  const capture = () => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext('2d')?.drawImage(v, 0, 0, c.width, c.height);
    triggerFileDownload(new Blob([c.toDataURL('image/jpeg')], { type: 'image/jpeg' }), 'thumbnail.jpg');
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">Thumbnail Generator</h3>
      <input type="file" accept="video/*" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} className="text-xs" />
      {url && (
        <div className="flex flex-col gap-3">
          <video ref={videoRef} src={url} controls className="w-full h-auto rounded bg-black" />
          <button onClick={capture} className="btn-primary w-full py-2 text-xs">Capture frame JPEG</button>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
