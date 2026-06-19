import { useState, useRef, useEffect, useCallback } from 'react';
import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { Upload, RefreshCw, Download, Film, Info } from 'lucide-react';

const FORMATS = [
  { value: 'video/webm;codecs=vp9,opus', label: 'WebM VP9', ext: 'webm' },
  { value: 'video/webm;codecs=vp8,opus', label: 'WebM VP8', ext: 'webm' },
  { value: 'video/webm', label: 'WebM (auto)', ext: 'webm' },
];

export const VideoConvertTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [targetFormat, setTargetFormat] = useState(FORMATS[0].value);
  const [scale, setScale] = useState(1.0);
  const [fps, setFps] = useState(30);
  const [bitrate, setBitrate] = useState(4000000);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoMeta, setVideoMeta] = useState({ w: 0, h: 0, duration: 0, type: '' });
  const [supportedFormats, setSupportedFormats] = useState<typeof FORMATS>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const supported = FORMATS.filter(f => MediaRecorder.isTypeSupported(f.value));
    setSupportedFormats(supported.length > 0 ? supported : [FORMATS[2]]);
    if (supported.length > 0) setTargetFormat(supported[0].value);
  }, []);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setVideoMeta(prev => ({ ...prev, type: file.type }));
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onMeta = () => setVideoMeta(prev => ({ ...prev, w: v.videoWidth, h: v.videoHeight, duration: v.duration }));
    v.addEventListener('loadedmetadata', onMeta);
    return () => v.removeEventListener('loadedmetadata', onMeta);
  }, [videoUrl]);

  const fmtSize = (b: number) => b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${(b / 1024).toFixed(0)} KB`;

  const handleConvert = useCallback(async () => {
    const v = videoRef.current;
    if (!v || !file) return;
    setConverting(true);
    setProgress(0);

    try {
      const w = Math.round(videoMeta.w * scale);
      const h = Math.round(videoMeta.h * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      const stream = canvas.captureStream(fps);

      const audioCtx = new AudioContext();
      const dest = audioCtx.createMediaStreamDestination();
      const src = audioCtx.createMediaElementSource(v);
      src.connect(dest);
      src.connect(audioCtx.destination);
      stream.addTrack(dest.stream.getAudioTracks()[0]);

      const fmtObj = FORMATS.find(f => f.value === targetFormat) ?? FORMATS[0];
      const chunks: BlobPart[] = [];
      const mr = new MediaRecorder(stream, { mimeType: targetFormat, videoBitsPerSecond: bitrate });
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      let rafId: number;
      const render = () => {
        if (v.ended || v.currentTime >= videoMeta.duration) { mr.stop(); return; }
        ctx.drawImage(v, 0, 0, w, h);
        setProgress(Math.min(99, (v.currentTime / videoMeta.duration) * 100));
        rafId = requestAnimationFrame(render);
      };

      mr.onstart = () => { v.currentTime = 0; v.play(); render(); };
      mr.onstop = () => {
        cancelAnimationFrame(rafId);
        v.pause();
        const blob = new Blob(chunks, { type: targetFormat });
        const baseName = file.name.replace(/\.[^.]+$/, '');
        triggerBlobDownload(blob, `${baseName}_converted.${fmtObj.ext}`);
        setProgress(100);
        setConverting(false);
        src.disconnect();
        audioCtx.close();
      };

      mr.start(200);
    } catch (err) {
      console.error(err);
      setConverting(false);
    }
  }, [file, targetFormat, scale, fps, bitrate, videoMeta]);

  return (
    <div className="max-w-2xl mx-auto glass-card p-6 flex flex-col gap-5 text-left">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <RefreshCw size={18} className="text-teal-400" />
        <h3 className="font-bold text-teal-400 text-sm">Video Format Converter</h3>
        <span className="ml-auto text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full">Canvas Re-encode</span>
      </div>

      {!file ? (
        <label className="flex flex-col items-center gap-3 py-10 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-teal-500/50 transition-colors">
          <Upload size={32} className="text-teal-400" />
          <span className="text-slate-300 text-sm font-medium">Drop or click to upload video</span>
          <span className="text-slate-500 text-xs">MP4, WebM, MOV, AVI, MKV</span>
          <input type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
        </label>
      ) : (
        <>
          <video ref={videoRef} src={videoUrl} className="w-full rounded-lg bg-black aspect-video object-contain" preload="metadata" muted />

          {videoMeta.w > 0 && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-900 rounded-lg p-3">
                <div className="text-slate-500 mb-1">Input</div>
                <div className="text-slate-200 font-medium">{file.name.replace(/.*\./, '').toUpperCase()}</div>
                <div className="text-slate-400">{videoMeta.w}×{videoMeta.h} · {videoMeta.duration.toFixed(1)}s · {fmtSize(file.size)}</div>
              </div>
              <div className="bg-slate-900 rounded-lg p-3">
                <div className="text-slate-500 mb-1">Output (estimated)</div>
                <div className="text-teal-400 font-medium">{(FORMATS.find(f => f.value === targetFormat)?.ext ?? 'webm').toUpperCase()}</div>
                <div className="text-slate-400">{Math.round(videoMeta.w * scale)}×{Math.round(videoMeta.h * scale)} · {fps} FPS</div>
              </div>
            </div>
          )}

          {/* Settings */}
          <div className="grid grid-cols-2 gap-3 bg-slate-900/50 rounded-lg p-3">
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-xs text-slate-400">Target Format</label>
              <div className="flex gap-2 flex-wrap">
                {supportedFormats.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setTargetFormat(f.value)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                      targetFormat === f.value
                        ? 'border-teal-500 bg-teal-500/10 text-teal-400 font-bold'
                        : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Resolution ({Math.round(scale * 100)}%)</label>
              <input type="range" min={0.25} max={1} step={0.05} value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full accent-teal-500" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Frame Rate</label>
              <select value={fps} onChange={(e) => setFps(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 text-xs px-2 py-1.5 rounded text-slate-200">
                <option value={12}>12 FPS (Minimal)</option>
                <option value={15}>15 FPS</option>
                <option value={24}>24 FPS (Cinema)</option>
                <option value={30}>30 FPS (Standard)</option>
                <option value={60}>60 FPS (Smooth)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Video Bitrate</label>
              <select value={bitrate} onChange={(e) => setBitrate(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 text-xs px-2 py-1.5 rounded text-slate-200">
                <option value={500000}>0.5 Mbps (Tiny)</option>
                <option value={1000000}>1 Mbps (Small)</option>
                <option value={2500000}>2.5 Mbps (Web)</option>
                <option value={4000000}>4 Mbps (HD)</option>
                <option value={8000000}>8 Mbps (Full HD)</option>
              </select>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-slate-900/50 rounded-lg p-3 text-xs text-slate-400">
            <Info size={12} className="text-teal-400 mt-0.5 shrink-0" />
            <span>Browser supports: {supportedFormats.map(f => f.label).join(', ')}. Native browser codecs are used — no upload required.</span>
          </div>

          {converting && (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Converting…</span><span>{progress.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <button onClick={handleConvert} disabled={converting}
            className="btn-primary flex items-center justify-center gap-2 py-2.5 text-xs font-bold disabled:opacity-50">
            {converting ? <Film size={14} className="animate-spin" /> : <Download size={14} />}
            {converting ? `Converting… ${progress.toFixed(0)}%` : 'Convert & Download'}
          </button>
        </>
      )}
    </div>
  );
};
