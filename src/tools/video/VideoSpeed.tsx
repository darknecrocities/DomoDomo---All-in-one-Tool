import { useState, useRef, useEffect, useCallback } from 'react';
import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { Upload, Gauge, Download, Film, Play, Pause } from 'lucide-react';

const SPEED_PRESETS = [
  { label: '0.25×', value: 0.25 },
  { label: '0.5×', value: 0.5 },
  { label: '0.75×', value: 0.75 },
  { label: '1×', value: 1 },
  { label: '1.25×', value: 1.25 },
  { label: '1.5×', value: 1.5 },
  { label: '2×', value: 2 },
  { label: '4×', value: 4 },
];

export const VideoSpeedTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [speed, setSpeed] = useState(1.5);
  const [customSpeed, setCustomSpeed] = useState(1.5);
  const [useCustom, setUseCustom] = useState(false);
  const [pitch, setPitch] = useState(true); // preserve pitch
  const [bitrate, setBitrate] = useState(4000000);
  const [fps, setFps] = useState(30);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const activeSpeed = useCustom ? customSpeed : speed;

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
    const onMeta = () => setDuration(v.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    v.addEventListener('loadedmetadata', onMeta);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    return () => {
      v.removeEventListener('loadedmetadata', onMeta);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
    };
  }, [videoUrl]);

  // Apply live speed to preview
  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = activeSpeed;
  }, [activeSpeed]);

  const handleExport = useCallback(async () => {
    const v = videoRef.current;
    if (!v || !file) return;
    setExporting(true);
    setProgress(0);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = v.videoWidth;
      canvas.height = v.videoHeight;
      const ctx = canvas.getContext('2d')!;

      // For speed changes, we capture frames at intervals matching the speed
      // and use MediaRecorder at the standard rate to encode faster/slower output
      const effectiveFps = fps;
      const stream = canvas.captureStream(effectiveFps);

      const audioCtx = new AudioContext();
      const dest = audioCtx.createMediaStreamDestination();
      const mediaSrc = audioCtx.createMediaElementSource(v);
      mediaSrc.connect(dest);
      mediaSrc.connect(audioCtx.destination);
      stream.addTrack(dest.stream.getAudioTracks()[0]);

      const chunks: BlobPart[] = [];
      const mr = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : 'video/webm',
        videoBitsPerSecond: bitrate,
      });
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      let rafId: number;
      const render = () => {
        if (v.ended || v.currentTime >= duration) { mr.stop(); return; }
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
        setProgress(Math.min(99, (v.currentTime / duration) * 100));
        rafId = requestAnimationFrame(render);
      };

      mr.onstart = () => {
        v.currentTime = 0;
        v.playbackRate = activeSpeed;
        v.play();
        render();
      };

      mr.onstop = () => {
        cancelAnimationFrame(rafId);
        v.pause();
        const blob = new Blob(chunks, { type: 'video/webm' });
        const speedStr = activeSpeed.toString().replace('.', '_');
        triggerBlobDownload(blob, `${file.name.replace(/\.[^.]+$/, '')}_${speedStr}x.webm`);
        setExporting(false);
        setProgress(0);
        mediaSrc.disconnect();
        audioCtx.close();
      };

      mr.start(200);
    } catch (err) {
      console.error(err);
      setExporting(false);
    }
  }, [file, activeSpeed, bitrate, fps, duration]);

  const fmt = (s: number) => s > 60 ? `${(s / 60).toFixed(1)}m` : `${s.toFixed(1)}s`;

  return (
    <div className="max-w-2xl mx-auto glass-card p-6 flex flex-col gap-5 text-left">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Gauge size={18} className="text-teal-400" />
        <h3 className="font-bold text-teal-400 text-sm">Video Speed Controller</h3>
        <span className="ml-auto text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full">MediaRecorder</span>
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
          <div className="relative">
            <video ref={videoRef} src={videoUrl} className="w-full rounded-lg bg-black aspect-video object-contain" preload="metadata" />
            <div className="absolute bottom-2 right-2 bg-black/70 text-teal-400 text-xs font-bold px-2 py-1 rounded-full">
              {activeSpeed}×
            </div>
          </div>

          {/* Speed label stats */}
          {duration > 0 && (
            <div className="flex gap-2 flex-wrap text-xs">
              <span className="bg-slate-900 px-2 py-1 rounded text-slate-400">Original: {fmt(duration)}</span>
              <span className="bg-teal-900/50 text-teal-400 font-bold px-2 py-1 rounded">
                Output: {fmt(duration / activeSpeed)}
              </span>
              <span className="bg-slate-900 px-2 py-1 rounded text-slate-400">
                {activeSpeed > 1 ? `${((1 - 1/activeSpeed) * 100).toFixed(0)}% shorter` : activeSpeed < 1 ? `${((1/activeSpeed - 1) * 100).toFixed(0)}% longer` : 'Same length'}
              </span>
            </div>
          )}

          {/* Presets */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-400 font-medium">Speed</label>
              <button
                onClick={() => setUseCustom(!useCustom)}
                className={`text-xs px-2 py-0.5 rounded transition-colors ${useCustom ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400'}`}
              >
                Custom
              </button>
            </div>
            {!useCustom ? (
              <div className="grid grid-cols-4 gap-1.5">
                {SPEED_PRESETS.map(p => (
                  <button key={p.value}
                    onClick={() => setSpeed(p.value)}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      speed === p.value
                        ? 'border-teal-500 bg-teal-500/10 text-teal-400'
                        : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'
                    }`}>{p.label}</button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Custom Speed: {customSpeed}×</label>
                <input type="range" min={0.1} max={8} step={0.05} value={customSpeed}
                  onChange={(e) => setCustomSpeed(parseFloat(e.target.value))}
                  className="w-full accent-teal-500" />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>0.1× (Slow)</span>
                  <span>1× (Normal)</span>
                  <span>8× (Fast)</span>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="grid grid-cols-2 gap-3 bg-slate-900/50 rounded-lg p-3">
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
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Frame Rate</label>
              <select value={fps} onChange={(e) => setFps(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 text-xs px-2 py-1.5 rounded text-slate-200">
                <option value={24}>24 FPS</option>
                <option value={30}>30 FPS</option>
                <option value={60}>60 FPS</option>
              </select>
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <input type="checkbox" id="pitch-preserve" checked={pitch} onChange={(e) => setPitch(e.target.checked)}
                className="accent-teal-500" />
              <label htmlFor="pitch-preserve" className="text-xs text-slate-400">Preserve audio pitch (browser-native)</label>
            </div>
          </div>

          {/* Preview controls */}
          <div className="flex gap-2">
            <button
              onClick={() => { const v = videoRef.current; if (v) v.paused ? v.play() : v.pause(); }}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              Preview at {activeSpeed}×
            </button>
          </div>

          {exporting && (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Exporting at {activeSpeed}×…</span><span>{progress.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <button onClick={handleExport} disabled={exporting}
            className="btn-primary flex items-center justify-center gap-2 py-2.5 text-xs font-bold disabled:opacity-50">
            {exporting ? <Film size={14} className="animate-spin" /> : <Download size={14} />}
            {exporting ? `Exporting… ${progress.toFixed(0)}%` : `Export at ${activeSpeed}× Speed`}
          </button>
        </>
      )}
    </div>
  );
};
