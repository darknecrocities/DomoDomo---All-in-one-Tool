import { useState, useRef, useEffect, useCallback } from 'react';
import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { Upload, Image, Download, Loader2, Play, Pause } from 'lucide-react';

export const VideoGifMakerTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [clipDuration, setClipDuration] = useState(3);
  const [width, setWidth] = useState(480);
  const [fps, setFps] = useState(10);
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewFrames, setPreviewFrames] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewIdx, setPreviewIdx] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewTimer = useRef<number>(0);



  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onMeta = () => {
      setDuration(v.duration);
      setClipDuration(Math.min(5, v.duration));
    };
    v.addEventListener('loadedmetadata', onMeta);
    return () => v.removeEventListener('loadedmetadata', onMeta);
  }, [videoUrl]);

  useEffect(() => {
    setFrameCount(Math.floor(clipDuration * fps));
  }, [clipDuration, fps]);

  // Animate preview frames
  useEffect(() => {
    if (previewFrames.length === 0) return;
    if (isPlaying) {
      previewTimer.current = window.setInterval(() => {
        setPreviewIdx(i => (i + 1) % previewFrames.length);
      }, 1000 / fps);
    }
    return () => clearInterval(previewTimer.current);
  }, [isPlaying, previewFrames, fps]);

  const captureFrames = useCallback(async (): Promise<string[]> => {
    const v = videoRef.current;
    if (!v) return [];
    const frames: string[] = [];
    const interval = 1 / fps;
    const total = Math.floor(clipDuration * fps);
    const canvas = document.createElement('canvas');
    const scale = { low: 0.5, medium: 0.75, high: 1.0 }[quality];
    const targetW = Math.round(width * scale);
    const targetH = Math.round((v.videoHeight / v.videoWidth) * targetW);
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d')!;

    for (let i = 0; i < total; i++) {
      await new Promise<void>((resolve) => {
        v.currentTime = startTime + i * interval;
        v.onseeked = () => {
          ctx.drawImage(v, 0, 0, targetW, targetH);
          frames.push(canvas.toDataURL('image/png'));
          setProgress(Math.round(((i + 1) / total) * 80));
          resolve();
        };
      });
    }
    return frames;
  }, [startTime, clipDuration, fps, width, quality]);

  // Build animated WebP via canvas frames encoded as APNG-style WebP blob
  const buildAnimatedWebP = useCallback(async (frames: string[]): Promise<Blob> => {
    // We'll create an animated WebP using a workaround: encode frames as individual
    // WebP images and concatenate in an ANIM-compatible format.
    // Since native browser doesn't have APNG/GIF encoder, we use WebM as animated format.
    // Actually encode frames into an animated WebM (video/webm) which plays like GIF.
    const canvas = document.createElement('canvas');
    const firstImg = new window.Image();
    await new Promise((r) => { firstImg.onload = r; firstImg.src = frames[0]; });
    canvas.width = firstImg.naturalWidth;
    canvas.height = firstImg.naturalHeight;
    const ctx = canvas.getContext('2d')!;

    const stream = canvas.captureStream(fps);
    const chunks: BlobPart[] = [];
    const mr = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm',
      videoBitsPerSecond: { low: 500000, medium: 1500000, high: 3000000 }[quality],
    });
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

    return new Promise<Blob>((resolve) => {
      let frameIdx = 0;
      const frameInterval = 1000 / fps;
      let timer: number;

      mr.onstart = () => {
        const drawFrame = async () => {
          if (frameIdx >= frames.length) {
            mr.stop();
            return;
          }
          const img = new window.Image();
          await new Promise((r) => { img.onload = r; img.src = frames[frameIdx]; });
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setProgress(80 + Math.round((frameIdx / frames.length) * 20));
          frameIdx++;
          timer = window.setTimeout(drawFrame, frameInterval);
        };
        drawFrame();
      };

      mr.onstop = () => {
        clearTimeout(timer);
        resolve(new Blob(chunks, { type: 'video/webm' }));
      };

      mr.start(100);
    });
  }, [fps, quality]);

  const handleGenerate = useCallback(async () => {
    if (!file) return;
    setGenerating(true);
    setProgress(0);
    setPreviewFrames([]);
    try {
      const frames = await captureFrames();
      setPreviewFrames(frames);
      setIsPlaying(true);
      setPreviewIdx(0);
      setProgress(80);
      const blob = await buildAnimatedWebP(frames);
      triggerBlobDownload(blob, `${file.name.replace(/\.[^.]+$/, '')}_animated.webm`);
      setProgress(100);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
      setProgress(0);
    }
  }, [file, captureFrames, buildAnimatedWebP]);

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="max-w-2xl mx-auto glass-card p-6 flex flex-col gap-5 text-left">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Image size={18} className="text-teal-400" />
        <h3 className="font-bold text-teal-400 text-sm">GIF / Animated WebM Maker</h3>
        <span className="ml-auto text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full">Canvas Frame Capture</span>
      </div>

      {!file ? (
        <label className="flex flex-col items-center gap-3 py-10 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-teal-500/50 transition-colors">
          <Upload size={32} className="text-teal-400" />
          <span className="text-slate-300 text-sm font-medium">Drop or click to upload video</span>
          <span className="text-slate-500 text-xs">MP4, WebM, MOV, AVI</span>
          <input type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
        </label>
      ) : (
        <>
          <video ref={videoRef} src={videoUrl} className="w-full rounded-lg bg-black aspect-video object-contain" preload="metadata" controls muted />

          <div className="grid grid-cols-2 gap-3 bg-slate-900/50 rounded-lg p-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Start Time: {fmt(startTime)}</label>
              <input type="range" min={0} max={Math.max(0, duration - clipDuration)} step={0.1} value={startTime}
                onChange={(e) => setStartTime(parseFloat(e.target.value))}
                className="w-full accent-teal-500" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Duration: {clipDuration.toFixed(1)}s</label>
              <input type="range" min={0.5} max={Math.min(15, duration)} step={0.5} value={clipDuration}
                onChange={(e) => setClipDuration(parseFloat(e.target.value))}
                className="w-full accent-teal-500" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Width (px)</label>
              <select value={width} onChange={(e) => setWidth(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 text-xs px-2 py-1.5 rounded text-slate-200">
                <option value={240}>240px (Tiny)</option>
                <option value={320}>320px (Small)</option>
                <option value={480}>480px (Medium)</option>
                <option value={640}>640px (Large)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Frame Rate (FPS)</label>
              <select value={fps} onChange={(e) => setFps(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 text-xs px-2 py-1.5 rounded text-slate-200">
                <option value={5}>5 FPS (Choppy)</option>
                <option value={10}>10 FPS (GIF-like)</option>
                <option value={15}>15 FPS (Smooth)</option>
                <option value={24}>24 FPS (Cinema)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-xs text-slate-400">Quality</label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map(q => (
                  <button key={q}
                    onClick={() => setQuality(q)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all capitalize ${
                      quality === q ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-700 bg-slate-800 text-slate-400'
                    }`}>{q}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-3 text-xs text-slate-400 flex-wrap">
            <span className="bg-slate-900 px-2 py-1 rounded">{frameCount} frames</span>
            <span className="bg-slate-900 px-2 py-1 rounded">{clipDuration.toFixed(1)}s clip</span>
            <span className="bg-slate-900 px-2 py-1 rounded">~{width}px wide</span>
            <span className="bg-slate-900 px-2 py-1 rounded">{fps} FPS</span>
          </div>

          {/* Frame preview */}
          {previewFrames.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-400">Animation Preview ({previewIdx + 1}/{previewFrames.length})</label>
                <button onClick={() => setIsPlaying(!isPlaying)} className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300">
                  {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
              </div>
              <img src={previewFrames[previewIdx]} alt="frame" className="w-full rounded-lg bg-black" style={{ imageRendering: 'pixelated' }} />
            </div>
          )}

          {generating && (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>{progress < 80 ? 'Capturing frames…' : 'Encoding animation…'}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <button onClick={handleGenerate} disabled={generating}
            className="btn-primary flex items-center justify-center gap-2 py-2.5 text-xs font-bold disabled:opacity-50">
            {generating ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {generating ? `Generating… ${progress}%` : `Generate Animation (${frameCount} frames)`}
          </button>
        </>
      )}
    </div>
  );
};
