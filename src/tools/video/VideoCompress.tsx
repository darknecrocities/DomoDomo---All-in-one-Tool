import { useState, useRef, useEffect, useCallback } from 'react';
import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { Upload, Zap, Download, Film, Info } from 'lucide-react';

interface CompressPreset { label: string; bitrate: number; scale: number; fps: number; }

const PRESETS: Record<string, CompressPreset> = {
  ultra: { label: 'Ultra (Lossless-like)', bitrate: 8000000, scale: 1.0, fps: 30 },
  high: { label: 'High Quality', bitrate: 4000000, scale: 1.0, fps: 30 },
  medium: { label: 'Medium (Balanced)', bitrate: 2000000, scale: 0.75, fps: 24 },
  low: { label: 'Low (Max Compress)', bitrate: 800000, scale: 0.5, fps: 15 },
  tiny: { label: 'Tiny (Web Sharing)', bitrate: 400000, scale: 0.5, fps: 12 },
};

export const VideoCompressTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [preset, setPreset] = useState('medium');
  const [customBitrate, setCustomBitrate] = useState(2000000);
  const [customScale, setCustomScale] = useState(0.75);
  const [customFps, setCustomFps] = useState(24);
  const [useCustom, setUseCustom] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [originalSize, setOriginalSize] = useState(0);
  const [estimatedSize, setEstimatedSize] = useState(0);
  const [videoMeta, setVideoMeta] = useState({ w: 0, h: 0, duration: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setOriginalSize(file.size);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onMeta = () => {
      setVideoMeta({ w: v.videoWidth, h: v.videoHeight, duration: v.duration });
    };
    v.addEventListener('loadedmetadata', onMeta);
    return () => v.removeEventListener('loadedmetadata', onMeta);
  }, [videoUrl]);

  useEffect(() => {
    const p = useCustom ? { bitrate: customBitrate, scale: customScale, fps: customFps } : PRESETS[preset];
    if (videoMeta.duration > 0) {
      const estBytes = (p.bitrate / 8) * videoMeta.duration;
      setEstimatedSize(estBytes);
    }
  }, [preset, customBitrate, customScale, customFps, useCustom, videoMeta]);

  const fmtSize = (bytes: number) => bytes > 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;

  const handleCompress = useCallback(async () => {
    const v = videoRef.current;
    if (!v || !file) return;
    const p = useCustom ? { bitrate: customBitrate, scale: customScale, fps: customFps } : PRESETS[preset];

    setCompressing(true);
    setProgress(0);

    try {
      const w = Math.round(videoMeta.w * p.scale);
      const h = Math.round(videoMeta.h * p.scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;

      const stream = canvas.captureStream(p.fps);
      const audioCtx = new AudioContext();
      const dest = audioCtx.createMediaStreamDestination();
      const src = audioCtx.createMediaElementSource(v);
      src.connect(dest);
      src.connect(audioCtx.destination);
      stream.addTrack(dest.stream.getAudioTracks()[0]);

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus' : 'video/webm';

      const chunks: BlobPart[] = [];
      const mr = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: p.bitrate });
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      const totalDuration = v.duration;
      let rafId: number;

      const render = () => {
        if (v.ended || v.currentTime >= totalDuration) {
          mr.stop();
          return;
        }
        ctx.drawImage(v, 0, 0, w, h);
        setProgress(Math.min(99, (v.currentTime / totalDuration) * 100));
        rafId = requestAnimationFrame(render);
      };

      mr.onstart = () => { v.currentTime = 0; v.play(); render(); };
      mr.onstop = () => {
        cancelAnimationFrame(rafId);
        v.pause();
        const blob = new Blob(chunks, { type: 'video/webm' });
        triggerBlobDownload(blob, `compressed_${preset}.webm`);
        setProgress(100);
        setCompressing(false);
        src.disconnect();
        audioCtx.close();
      };

      mr.start(200);
    } catch (err) {
      console.error(err);
      setCompressing(false);
    }
  }, [file, preset, customBitrate, customScale, customFps, useCustom, videoMeta]);

  const reduction = originalSize > 0 && estimatedSize > 0 ? ((1 - estimatedSize / originalSize) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto glass-card p-6 flex flex-col gap-5 text-left">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Zap size={18} className="text-teal-400" />
        <h3 className="font-bold text-teal-400 text-sm">Video Compressor</h3>
        <span className="ml-auto text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full">Canvas Re-encode</span>
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
          <video ref={videoRef} src={videoUrl} className="w-full rounded-lg bg-black aspect-video object-contain" preload="metadata" muted />

          {videoMeta.w > 0 && (
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs bg-slate-900 px-2 py-1 rounded text-slate-300">
                {videoMeta.w}×{videoMeta.h}
              </span>
              <span className="text-xs bg-slate-900 px-2 py-1 rounded text-slate-300">
                {videoMeta.duration.toFixed(1)}s
              </span>
              <span className="text-xs bg-slate-900 px-2 py-1 rounded text-slate-300">
                Original: {fmtSize(originalSize)}
              </span>
              {estimatedSize > 0 && (
                <span className={`text-xs px-2 py-1 rounded font-bold ${reduction > 0 ? 'bg-teal-900/50 text-teal-400' : 'bg-slate-900 text-slate-300'}`}>
                  Est. {fmtSize(estimatedSize)} {reduction > 0 ? `(~${reduction.toFixed(0)}% smaller)` : ''}
                </span>
              )}
            </div>
          )}

          {/* Preset Selector */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-400 font-medium">Compression Preset</label>
              <button
                onClick={() => setUseCustom(!useCustom)}
                className={`text-xs px-2 py-0.5 rounded transition-colors ${useCustom ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400'}`}
              >
                Custom
              </button>
            </div>
            {!useCustom ? (
              <div className="grid grid-cols-5 gap-1.5">
                {Object.entries(PRESETS).map(([key, p]) => (
                  <button
                    key={key}
                    onClick={() => setPreset(key)}
                    className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg text-xs transition-all border ${
                      preset === key
                        ? 'border-teal-500 bg-teal-500/10 text-teal-400'
                        : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <span className="font-bold capitalize">{key}</span>
                    <span className="text-[10px] opacity-70">{p.fps}fps</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 bg-slate-900/50 rounded-lg p-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400">Bitrate (Mbps)</label>
                  <input type="number" min={0.1} max={20} step={0.1} value={(customBitrate / 1000000).toFixed(1)}
                    onChange={(e) => setCustomBitrate(Math.round(parseFloat(e.target.value) * 1000000))}
                    className="bg-slate-800 border border-slate-700 text-xs px-2 py-1.5 rounded text-slate-200 w-full" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400">Scale ({Math.round(customScale * 100)}%)</label>
                  <input type="range" min={0.25} max={1} step={0.05} value={customScale}
                    onChange={(e) => setCustomScale(parseFloat(e.target.value))}
                    className="w-full accent-teal-500 mt-1" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400">FPS</label>
                  <select value={customFps} onChange={(e) => setCustomFps(Number(e.target.value))}
                    className="bg-slate-800 border border-slate-700 text-xs px-2 py-1.5 rounded text-slate-200">
                    <option value={12}>12 FPS</option>
                    <option value={15}>15 FPS</option>
                    <option value={24}>24 FPS</option>
                    <option value={30}>30 FPS</option>
                    <option value={60}>60 FPS</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-start gap-2 bg-slate-900/50 rounded-lg p-3 text-xs text-slate-400">
            <Info size={12} className="text-teal-400 mt-0.5 shrink-0" />
            <span>Re-encodes in real-time using your browser's Canvas + MediaRecorder. Actual output size depends on video complexity.</span>
          </div>

          {compressing && (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Compressing…</span>
                <span>{progress.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <button
            onClick={handleCompress}
            disabled={compressing}
            className="btn-primary flex items-center justify-center gap-2 py-2.5 text-xs font-bold disabled:opacity-50"
          >
            {compressing ? <Film size={14} className="animate-spin" /> : <Download size={14} />}
            {compressing ? `Compressing… ${progress.toFixed(0)}%` : 'Compress & Download'}
          </button>
        </>
      )}
    </div>
  );
};
