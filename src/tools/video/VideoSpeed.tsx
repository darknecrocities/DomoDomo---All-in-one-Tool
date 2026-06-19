import { triggerFileDownload } from '../../utils/sharedHelpers';
import { useState, useRef, useEffect } from 'react';



export const VideoSpeedTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [speed, setSpeed] = useState(1.5);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = speed;
  }, [speed, file]);

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">Speed Control</h3>
      <input type="file" accept="video/*" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} className="text-xs" />
      {file && (
        <>
          <div className="flex gap-2">
            <button onClick={() => setSpeed(0.5)} className={`flex-1 py-1.5 text-xs font-bold rounded ${speed === 0.5 ? 'bg-[#4E8E5E]' : 'bg-slate-900'}`}>0.5x</button>
            <button onClick={() => setSpeed(1)} className={`flex-1 py-1.5 text-xs font-bold rounded ${speed === 1 ? 'bg-[#4E8E5E]' : 'bg-slate-900'}`}>1x</button>
            <button onClick={() => setSpeed(1.5)} className={`flex-1 py-1.5 text-xs font-bold rounded ${speed === 1.5 ? 'bg-[#4E8E5E]' : 'bg-slate-900'}`}>1.5x</button>
            <button onClick={() => setSpeed(2)} className={`flex-1 py-1.5 text-xs font-bold rounded ${speed === 2 ? 'bg-[#4E8E5E]' : 'bg-slate-900'}`}>2x</button>
          </div>
          <button onClick={() => triggerFileDownload(file, 'speed_adjusted.mp4')} className="btn-primary w-full py-2 text-xs">Download speed video</button>
        </>
      )}
    </div>
  );
};
