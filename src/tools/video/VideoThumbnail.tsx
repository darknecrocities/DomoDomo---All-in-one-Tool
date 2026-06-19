import { useState, useRef, useEffect, useCallback } from 'react';
import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { Upload, Camera, Download, Layers, Grid } from 'lucide-react';

export const VideoThumbnailTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [capturedFrames, setCapturedFrames] = useState<{ url: string; time: number }[]>([]);
  const [outputFormat, setOutputFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const [outputQuality, setOutputQuality] = useState(0.92);
  const [outputWidth, setOutputWidth] = useState(0); // 0 = native
  const [captureMode, setCaptureMode] = useState<'single' | 'grid' | 'auto'>('single');
  const [gridCols, setGridCols] = useState(4);
  const [gridRows, setGridRows] = useState(4);
  const [autoCount, setAutoCount] = useState(8);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setCapturedFrames([]);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onMeta = () => { setDuration(v.duration); };
    const onTime = () => setCurrentTime(v.currentTime);
    v.addEventListener('loadedmetadata', onMeta);
    v.addEventListener('timeupdate', onTime);
    return () => {
      v.removeEventListener('loadedmetadata', onMeta);
      v.removeEventListener('timeupdate', onTime);
    };
  }, [videoUrl]);

  const captureFrame = useCallback((v: HTMLVideoElement): string => {
    const c = document.createElement('canvas');
    const w = outputWidth > 0 ? outputWidth : v.videoWidth;
    const scale = w / v.videoWidth;
    c.width = w;
    c.height = Math.round(v.videoHeight * scale);
    c.getContext('2d')?.drawImage(v, 0, 0, c.width, c.height);
    return c.toDataURL(`image/${outputFormat}`, outputQuality);
  }, [outputFormat, outputQuality, outputWidth]);

  const handleCaptureSingle = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const dataUrl = captureFrame(v);
    const time = v.currentTime;
    setCapturedFrames(prev => [{ url: dataUrl, time }, ...prev].slice(0, 20));
  }, [captureFrame]);

  const handleCaptureAuto = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;
    setGenerating(true);
    setProgress(0);
    const frames: { url: string; time: number }[] = [];
    const times = Array.from({ length: autoCount }, (_, i) => (duration / (autoCount + 1)) * (i + 1));

    for (let i = 0; i < times.length; i++) {
      await new Promise<void>((resolve) => {
        v.currentTime = times[i];
        v.onseeked = () => {
          frames.push({ url: captureFrame(v), time: times[i] });
          setProgress(Math.round(((i + 1) / times.length) * 100));
          resolve();
        };
      });
    }
    setCapturedFrames(frames);
    setGenerating(false);
    setProgress(0);
  }, [duration, autoCount, captureFrame]);

  const handleGridExport = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;
    setGenerating(true);
    setProgress(0);

    const total = gridCols * gridRows;
    const times = Array.from({ length: total }, (_, i) => (duration / (total + 1)) * (i + 1));
    const frameW = outputWidth > 0 ? outputWidth : Math.min(v.videoWidth, 320);
    const frameH = Math.round(v.videoHeight * (frameW / v.videoWidth));

    const gridCanvas = document.createElement('canvas');
    gridCanvas.width = frameW * gridCols;
    gridCanvas.height = frameH * gridRows;
    const ctx = gridCanvas.getContext('2d')!;
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, gridCanvas.width, gridCanvas.height);

    for (let i = 0; i < times.length; i++) {
      await new Promise<void>((resolve) => {
        v.currentTime = times[i];
        v.onseeked = () => {
          const col = i % gridCols;
          const row = Math.floor(i / gridCols);
          ctx.drawImage(v, col * frameW, row * frameH, frameW, frameH);
          // Timestamp overlay
          ctx.fillStyle = 'rgba(0,0,0,0.6)';
          ctx.fillRect(col * frameW, row * frameH, frameW, 18);
          ctx.fillStyle = '#4ade80';
          ctx.font = '11px monospace';
          ctx.fillText(`${times[i].toFixed(1)}s`, col * frameW + 4, row * frameH + 13);
          setProgress(Math.round(((i + 1) / total) * 100));
          resolve();
        };
      });
    }

    gridCanvas.toBlob((blob) => {
      if (blob) triggerBlobDownload(blob, `${file!.name.replace(/\.[^.]+$/, '')}_grid_${gridCols}x${gridRows}.${outputFormat}`);
      setGenerating(false);
      setProgress(0);
    }, `image/${outputFormat}`, outputQuality);
  }, [duration, gridCols, gridRows, outputWidth, outputFormat, outputQuality, file]);

  const downloadFrame = (frame: { url: string; time: number }, _idx: number) => {
    const link = document.createElement('a');
    link.href = frame.url;
    link.download = `${file!.name.replace(/\.[^.]+$/, '')}_frame_${frame.time.toFixed(2)}s.${outputFormat}`;
    link.click();
  };

  const downloadAll = () => {
    capturedFrames.forEach((f, i) => setTimeout(() => downloadFrame(f, i), i * 200));
  };

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toFixed(1).padStart(4, '0')}`;

  return (
    <div className="max-w-2xl mx-auto glass-card p-6 flex flex-col gap-5 text-left">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Camera size={18} className="text-teal-400" />
        <h3 className="font-bold text-teal-400 text-sm">Thumbnail & Frame Extractor</h3>
        <span className="ml-auto text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full">Canvas Capture</span>
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
          <video ref={videoRef} src={videoUrl} controls className="w-full rounded-lg bg-black aspect-video object-contain" preload="metadata" />
          <canvas ref={canvasRef} className="hidden" />

          <div className="text-xs text-slate-400 text-center">
            Current: <span className="text-teal-400 font-mono font-bold">{fmt(currentTime)}</span> / {fmt(duration)}
          </div>

          {/* Mode selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-400 font-medium">Capture Mode</label>
            <div className="flex gap-2">
              {([
                { value: 'single', label: 'Single Frame', icon: Camera },
                { value: 'auto', label: 'Auto Extract', icon: Layers },
                { value: 'grid', label: 'Contact Sheet', icon: Grid },
              ] as const).map(({ value, label, icon: Icon }) => (
                <button key={value}
                  onClick={() => setCaptureMode(value)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs rounded-lg border transition-all ${
                    captureMode === value ? 'border-teal-500 bg-teal-500/10 text-teal-400 font-bold' : 'border-slate-700 bg-slate-900 text-slate-400'
                  }`}>
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-2 gap-3 bg-slate-900/50 rounded-lg p-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Format</label>
              <div className="flex gap-1.5">
                {(['jpeg', 'png', 'webp'] as const).map(f => (
                  <button key={f}
                    onClick={() => setOutputFormat(f)}
                    className={`flex-1 py-1 text-xs font-bold rounded uppercase border transition-all ${
                      outputFormat === f ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-700 bg-slate-800 text-slate-400'
                    }`}>{f}</button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Quality: {Math.round(outputQuality * 100)}%</label>
              <input type="range" min={0.5} max={1} step={0.01} value={outputQuality}
                onChange={(e) => setOutputQuality(parseFloat(e.target.value))}
                className="w-full accent-teal-500 mt-1" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Width (0 = native)</label>
              <select value={outputWidth} onChange={(e) => setOutputWidth(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 text-xs px-2 py-1.5 rounded text-slate-200">
                <option value={0}>Native</option>
                <option value={320}>320px</option>
                <option value={640}>640px</option>
                <option value={1280}>1280px (HD)</option>
                <option value={1920}>1920px (FHD)</option>
              </select>
            </div>
            {captureMode === 'auto' && (
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Frames to Extract</label>
                <select value={autoCount} onChange={(e) => setAutoCount(Number(e.target.value))}
                  className="bg-slate-800 border border-slate-700 text-xs px-2 py-1.5 rounded text-slate-200">
                  <option value={4}>4 frames</option>
                  <option value={8}>8 frames</option>
                  <option value={12}>12 frames</option>
                  <option value={24}>24 frames</option>
                </select>
              </div>
            )}
            {captureMode === 'grid' && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400">Grid Columns</label>
                  <input type="number" min={2} max={8} value={gridCols}
                    onChange={(e) => setGridCols(Number(e.target.value))}
                    className="bg-slate-800 border border-slate-700 text-xs px-2 py-1.5 rounded text-slate-200" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400">Grid Rows</label>
                  <input type="number" min={2} max={8} value={gridRows}
                    onChange={(e) => setGridRows(Number(e.target.value))}
                    className="bg-slate-800 border border-slate-700 text-xs px-2 py-1.5 rounded text-slate-200" />
                </div>
              </>
            )}
          </div>

          {/* Progress */}
          {generating && (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Processing frames…</span><span>{progress}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Action button */}
          {captureMode === 'single' ? (
            <button onClick={handleCaptureSingle}
              className="btn-primary flex items-center justify-center gap-2 py-2.5 text-xs font-bold">
              <Camera size={14} /> Capture Frame at {fmt(currentTime)}
            </button>
          ) : captureMode === 'auto' ? (
            <button onClick={handleCaptureAuto} disabled={generating}
              className="btn-primary flex items-center justify-center gap-2 py-2.5 text-xs font-bold disabled:opacity-50">
              <Layers size={14} /> {generating ? `Extracting… ${progress}%` : `Extract ${autoCount} Frames Evenly`}
            </button>
          ) : (
            <button onClick={handleGridExport} disabled={generating}
              className="btn-primary flex items-center justify-center gap-2 py-2.5 text-xs font-bold disabled:opacity-50">
              <Grid size={14} /> {generating ? `Building grid… ${progress}%` : `Export ${gridCols}×${gridRows} Contact Sheet`}
            </button>
          )}

          {/* Frame gallery */}
          {capturedFrames.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-400">{capturedFrames.length} frame(s) captured</label>
                <button onClick={downloadAll} className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300">
                  <Download size={12} /> Download All
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {capturedFrames.map((frame, i) => (
                  <div key={i} className="relative group cursor-pointer" onClick={() => downloadFrame(frame, i)}>
                    <img src={frame.url} alt={`frame ${i}`} className="w-full rounded aspect-video object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                      <Download size={16} className="text-white" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-teal-400 text-[9px] font-mono text-center rounded-b py-0.5">
                      {frame.time.toFixed(1)}s
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
