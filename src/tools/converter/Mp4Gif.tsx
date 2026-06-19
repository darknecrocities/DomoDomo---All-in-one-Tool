import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { useState, useRef, useEffect } from 'react';
import { Film, Upload, Check, ShieldAlert, Settings } from 'lucide-react';

export const Mp4GifTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  const [frameRate, setFrameRate] = useState<number>(10);
  const [progress, setProgress] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [collageCols, setCollageCols] = useState<number>(5);
  const [quality, setQuality] = useState<number>(0.9);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setStartTime(0);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration;
      setDuration(videoDuration);
      setEndTime(videoDuration);
    }
  };

  const handleConvert = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setLoading(true);
    setProgress(0);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Capture frames from video within range
    const activeDuration = endTime - startTime;
    const totalFrames = Math.min(60, Math.max(2, Math.floor(activeDuration * frameRate)));
    const step = activeDuration / totalFrames;
    const frames: string[] = [];

    for (let i = 0; i < totalFrames; i++) {
      const time = startTime + (i * step);
      video.currentTime = time;
      
      await new Promise<void>((resolve) => {
        const onSeeked = () => {
          video.removeEventListener('seeked', onSeeked);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          frames.push(canvas.toDataURL('image/jpeg', quality));
          setProgress(Math.round(((i + 1) / totalFrames) * 100));
          resolve();
        };
        video.addEventListener('seeked', onSeeked);
      });
    }

    // Compile into grid collage
    const collageCanvas = document.createElement('canvas');
    const cCtx = collageCanvas.getContext('2d');
    if (cCtx && frames.length > 0) {
      const cols = Math.min(collageCols, frames.length);
      const rows = Math.ceil(frames.length / cols);
      
      collageCanvas.width = cols * 160;
      collageCanvas.height = rows * 90;
      
      cCtx.fillStyle = '#151C2C';
      cCtx.fillRect(0, 0, collageCanvas.width, collageCanvas.height);

      const imgLoadPromises = frames.map((src, index) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            cCtx.drawImage(img, col * 160, row * 90, 160, 90);
            resolve();
          };
          img.src = src;
        });
      });

      await Promise.all(imgLoadPromises);
      collageCanvas.toBlob((blob) => {
        if (blob) {
          triggerBlobDownload(blob, `${file!.name.replace(/\.[^/.]+$/, "")}_frames_collage.jpg`);
        }
      }, 'image/jpeg', quality);
    }

    setLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Editor Panel */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 min-h-[400px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Film className="text-[#4E8E5E]" size={22} />
              <span>MP4 Video Frame Extractor</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">Extract frames offline</span>
          </div>

          {!file ? (
            <div className="border border-dashed border-slate-800 rounded-2xl p-8 bg-slate-950/20 text-center flex flex-col items-center gap-3">
              <div className="p-4 bg-slate-900/60 rounded-full border border-slate-800 text-[#4E8E5E]">
                <Upload size={32} />
              </div>
              <label className="btn-primary cursor-pointer mt-1">
                <span>Choose MP4 File</span>
                <input
                  type="file"
                  accept="video/mp4, video/quicktime, video/webm"
                  onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                  className="hidden"
                />
              </label>
              <p className="text-slate-500 text-xs">Supports MP4, WebM, and MOV videos</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center bg-slate-900/30 p-3 rounded-xl border border-slate-850 text-xs">
                <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                <button onClick={() => { setFile(null); setVideoUrl(''); }} className="text-rose-455 hover:underline font-bold">Remove</button>
              </div>

              {videoUrl && (
                <div className="relative border border-slate-800 rounded-2xl bg-slate-950/40 p-2 overflow-hidden flex flex-col items-center justify-center max-w-[420px] mx-auto shadow-2xl">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    onLoadedMetadata={handleLoadedMetadata}
                    controls
                    className="w-full rounded-lg mb-2"
                  />
                  <canvas ref={canvasRef} width={320} height={180} className="hidden" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Control panel */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5">
          <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-1.5">
            <Settings size={16} className="text-[#4E8E5E]" />
            <span>Extraction Settings</span>
          </h3>
          
          {/* Frame Rate */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 font-semibold">Sampling Frequency</span>
              <span className="text-slate-300 font-semibold">{frameRate} FPS</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={frameRate}
              onChange={(e) => setFrameRate(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#4E8E5E]"
            />
          </div>

          {/* Time Range Selectors */}
          {duration > 0 && (
            <div className="flex flex-col gap-3 pt-2 border-t border-slate-800">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-semibold">Start Time</span>
                  <span className="text-slate-300 font-semibold">{startTime.toFixed(1)}s</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={endTime}
                  step="0.1"
                  value={startTime}
                  onChange={(e) => setStartTime(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#4E8E5E]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-semibold">End Time</span>
                  <span className="text-slate-300 font-semibold">{endTime.toFixed(1)}s</span>
                </div>
                <input
                  type="range"
                  min={startTime}
                  max={duration}
                  step="0.1"
                  value={endTime}
                  onChange={(e) => setEndTime(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#4E8E5E]"
                />
              </div>
            </div>
          )}

          {/* Grid Layout Selection */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800">
            <label className="text-xs text-slate-500 font-semibold">Collage Layout Columns</label>
            <select
              value={collageCols}
              onChange={(e) => setCollageCols(Number(e.target.value))}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="3">3 Columns</option>
              <option value="4">4 Columns</option>
              <option value="5">5 Columns</option>
              <option value="6">6 Columns</option>
            </select>
          </div>

          {/* Quality selection */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 font-semibold">Output Quality</span>
              <span className="text-slate-300 font-semibold">{Math.round(quality * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={quality}
              onChange={(e) => setQuality(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#4E8E5E]"
            />
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={handleConvert}
              disabled={!file || loading}
              className="btn-primary w-full py-3"
            >
              {success ? <Check size={18} /> : <Film size={18} />}
              <span>{loading ? `Extracting ${progress}%` : success ? 'Collage Saved!' : 'Extract Video Collage'}</span>
            </button>
          </div>
        </div>

        {/* Local Processing Banner */}
        <div className="bg-[#151C2C]/50 border border-slate-800 rounded-2xl p-4 flex gap-3 text-slate-400">
          <ShieldAlert size={20} className="text-[#4E8E5E] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-slate-300">100% Secure local extract</span>
            <span className="text-[10px] leading-relaxed">No data leaves your computer. Video frames seek and render directly inside browser memory.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
