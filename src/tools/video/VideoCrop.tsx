import { useState, useRef, useEffect, useCallback } from 'react';
import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { Upload, Crop, Download, Film } from 'lucide-react';

type AspectRatio = { label: string; w: number; h: number };
const RATIOS: AspectRatio[] = [
  { label: '1:1 Square', w: 1, h: 1 },
  { label: '16:9 Wide', w: 16, h: 9 },
  { label: '9:16 Vertical', w: 9, h: 16 },
  { label: '4:3 Classic', w: 4, h: 3 },
  { label: '21:9 Cinematic', w: 21, h: 9 },
  { label: '3:4 Portrait', w: 3, h: 4 },
];

export const VideoCropTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [ratio, setRatio] = useState(RATIOS[0]);
  const [offsetX, setOffsetX] = useState(0.5);
  const [offsetY, setOffsetY] = useState(0.5);
  const [bitrate, setBitrate] = useState(4000000);
  const [cropping, setCropping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoMeta, setVideoMeta] = useState({ w: 0, h: 0, duration: 0 });
  const [cropRect, setCropRect] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const previewAnimRef = useRef<number>(0);

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
    const onMeta = () => setVideoMeta({ w: v.videoWidth, h: v.videoHeight, duration: v.duration });
    v.addEventListener('loadedmetadata', onMeta);
    return () => v.removeEventListener('loadedmetadata', onMeta);
  }, [videoUrl]);

  // Calculate crop rect whenever ratio or offset changes
  useEffect(() => {
    if (!videoMeta.w || !videoMeta.h) return;
    const { w: srcW, h: srcH } = videoMeta;
    const targetAspect = ratio.w / ratio.h;
    const srcAspect = srcW / srcH;

    let cropW: number, cropH: number;
    if (targetAspect > srcAspect) {
      cropW = srcW;
      cropH = srcW / targetAspect;
    } else {
      cropH = srcH;
      cropW = srcH * targetAspect;
    }

    const maxX = srcW - cropW;
    const maxY = srcH - cropH;
    const x = Math.round(maxX * offsetX);
    const y = Math.round(maxY * offsetY);
    setCropRect({ x, y, w: Math.round(cropW), h: Math.round(cropH) });
  }, [ratio, offsetX, offsetY, videoMeta]);

  // Live preview
  useEffect(() => {
    const v = videoRef.current;
    const c = previewRef.current;
    if (!v || !c || !cropRect.w) return;
    const ctx = c.getContext('2d')!;
    c.width = cropRect.w;
    c.height = cropRect.h;
    const render = () => {
      ctx.drawImage(v, cropRect.x, cropRect.y, cropRect.w, cropRect.h, 0, 0, c.width, c.height);
      previewAnimRef.current = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(previewAnimRef.current);
  }, [cropRect]);

  const handleCrop = useCallback(async () => {
    const v = videoRef.current;
    if (!v || !file || !cropRect.w) return;
    setCropping(true);
    setProgress(0);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = cropRect.w;
      canvas.height = cropRect.h;
      const ctx = canvas.getContext('2d')!;
      const stream = canvas.captureStream(30);

      const audioCtx = new AudioContext();
      const dest = audioCtx.createMediaStreamDestination();
      const src = audioCtx.createMediaElementSource(v);
      src.connect(dest);
      src.connect(audioCtx.destination);
      stream.addTrack(dest.stream.getAudioTracks()[0]);

      const chunks: BlobPart[] = [];
      const mr = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : 'video/webm',
        videoBitsPerSecond: bitrate,
      });
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      let rafId: number;
      const render = () => {
        if (v.ended) { mr.stop(); return; }
        ctx.drawImage(v, cropRect.x, cropRect.y, cropRect.w, cropRect.h, 0, 0, canvas.width, canvas.height);
        setProgress(Math.min(99, (v.currentTime / videoMeta.duration) * 100));
        rafId = requestAnimationFrame(render);
      };

      mr.onstart = () => { v.currentTime = 0; v.play(); render(); };
      mr.onstop = () => {
        cancelAnimationFrame(rafId);
        v.pause();
        const blob = new Blob(chunks, { type: 'video/webm' });
        const baseName = file.name.replace(/\.[^.]+$/, '');
        triggerBlobDownload(blob, `${baseName}_cropped_${ratio.label.split(' ')[0]}.webm`);
        setCropping(false);
        setProgress(0);
        src.disconnect();
        audioCtx.close();
      };

      mr.start(200);
    } catch (err) {
      console.error(err);
      setCropping(false);
    }
  }, [file, cropRect, bitrate, videoMeta.duration, ratio]);

  return (
    <div className="max-w-2xl mx-auto glass-card p-6 flex flex-col gap-5 text-left">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Crop size={18} className="text-teal-400" />
        <h3 className="font-bold text-teal-400 text-sm">Video Crop & Aspect Ratio</h3>
        <span className="ml-auto text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full">Canvas Crop</span>
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
          {/* Hidden source video */}
          <video ref={videoRef} src={videoUrl} className="hidden" preload="metadata" loop />

          {/* Aspect Ratio Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-400 font-medium">Aspect Ratio</label>
            <div className="grid grid-cols-3 gap-2">
              {RATIOS.map((r) => (
                <button key={r.label} onClick={() => setRatio(r)}
                  className={`flex flex-col items-center gap-1 py-2 px-2 rounded-lg text-xs border transition-all ${
                    ratio.label === r.label
                      ? 'border-teal-500 bg-teal-500/10 text-teal-400 font-bold'
                      : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'
                  }`}>
                  <div
                    className="border-2 border-current"
                    style={{
                      width: `${Math.min(24, 24 * (r.w / r.h))}px`,
                      height: `${Math.min(24, 24 * (r.h / r.w))}px`,
                    }}
                  />
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Crop position sliders */}
          {videoMeta.w > 0 && (
            <div className="grid grid-cols-2 gap-3 bg-slate-900/50 rounded-lg p-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Horizontal Position</label>
                <input type="range" min={0} max={1} step={0.01} value={offsetX}
                  onChange={(e) => setOffsetX(parseFloat(e.target.value))}
                  className="w-full accent-teal-500" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Vertical Position</label>
                <input type="range" min={0} max={1} step={0.01} value={offsetY}
                  onChange={(e) => setOffsetY(parseFloat(e.target.value))}
                  className="w-full accent-teal-500" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Output Bitrate</label>
                <select value={bitrate} onChange={(e) => setBitrate(Number(e.target.value))}
                  className="bg-slate-800 border border-slate-700 text-xs px-2 py-1.5 rounded text-slate-200">
                  <option value={1000000}>1 Mbps</option>
                  <option value={2500000}>2.5 Mbps</option>
                  <option value={4000000}>4 Mbps</option>
                  <option value={8000000}>8 Mbps</option>
                </select>
              </div>
              <div className="flex flex-col gap-1 justify-end">
                <span className="text-xs text-teal-400 font-medium">
                  Output: {cropRect.w}×{cropRect.h}px
                </span>
                <span className="text-xs text-slate-400">
                  Crop from ({cropRect.x}, {cropRect.y})
                </span>
              </div>
            </div>
          )}

          {/* Live Preview */}
          {cropRect.w > 0 && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-400">Live Preview</label>
                <button
                  onClick={() => { const v = videoRef.current; if (v) v.paused ? v.play() : v.pause(); }}
                  className="text-xs text-teal-400 hover:text-teal-300"
                >
                  Toggle Playback
                </button>
              </div>
              <canvas
                ref={previewRef}
                className="w-full rounded-lg bg-black"
                style={{ maxHeight: '240px', objectFit: 'contain' }}
              />
            </div>
          )}

          {cropping && (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Rendering crop…</span><span>{progress.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <button onClick={handleCrop} disabled={cropping || !cropRect.w}
            className="btn-primary flex items-center justify-center gap-2 py-2.5 text-xs font-bold disabled:opacity-50">
            {cropping ? <Film size={14} className="animate-spin" /> : <Download size={14} />}
            {cropping ? `Cropping… ${progress.toFixed(0)}%` : `Crop to ${ratio.label}`}
          </button>
        </>
      )}
    </div>
  );
};
