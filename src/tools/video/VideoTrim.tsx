import { useState, useRef, useEffect, useCallback } from 'react';
import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { Upload, Scissors, Play, Pause, Download, Film } from 'lucide-react';

export const VideoTrimTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(10);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trimming, setTrimming] = useState(false);
  const [progress, setProgress] = useState(0);
  const [format, setFormat] = useState('video/webm');
  const [videoBitrate, setVideoBitrate] = useState(2500000);
  const videoRef = useRef<HTMLVideoElement>(null);

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
      setEnd(Math.min(v.duration, 30));
    };
    const onTime = () => setCurrentTime(v.currentTime);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    v.addEventListener('loadedmetadata', onMeta);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    return () => {
      v.removeEventListener('loadedmetadata', onMeta);
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
    };
  }, [videoUrl]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.currentTime = start;
      v.play();
    } else {
      v.pause();
    }
  };

  const seek = (t: number) => {
    if (videoRef.current) videoRef.current.currentTime = t;
  };

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

  const handleTrim = useCallback(async () => {
    const v = videoRef.current;
    if (!v || !file) return;
    setTrimming(true);
    setProgress(0);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = v.videoWidth;
      canvas.height = v.videoHeight;
      const ctx = canvas.getContext('2d')!;
      const stream = canvas.captureStream(30);

      // Add audio
      const audioCtx = new AudioContext();
      const dest = audioCtx.createMediaStreamDestination();
      const src = audioCtx.createMediaElementSource(v);
      src.connect(dest);
      src.connect(audioCtx.destination);
      stream.addTrack(dest.stream.getAudioTracks()[0]);

      const chunks: BlobPart[] = [];
      const mr = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : 'video/webm',
        videoBitsPerSecond: videoBitrate,
      });
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      const trimDuration = end - start;
      let rafId: number;

      const render = () => {
        if (v.currentTime >= end) {
          mr.stop();
          v.pause();
          return;
        }
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
        const elapsed = v.currentTime - start;
        setProgress(Math.min(100, (elapsed / trimDuration) * 100));
        rafId = requestAnimationFrame(render);
      };

      mr.onstart = () => {
        v.currentTime = start;
        v.play();
        render();
      };

      mr.onstop = () => {
        cancelAnimationFrame(rafId);
        v.pause();
        const ext = format === 'video/mp4' ? 'mp4' : 'webm';
        triggerBlobDownload(new Blob(chunks, { type: format }), `trimmed.${ext}`);
        setTrimming(false);
        setProgress(0);
        src.disconnect();
        audioCtx.close();
      };

      mr.start(100);
    } catch (e) {
      console.error(e);
      setTrimming(false);
    }
  }, [file, start, end, format, videoBitrate]);

  return (
    <div className="max-w-2xl mx-auto glass-card p-6 flex flex-col gap-5 text-left">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Scissors size={18} className="text-teal-400" />
        <h3 className="font-bold text-teal-400 text-sm">Video Trim</h3>
        <span className="ml-auto text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full">Canvas + MediaRecorder</span>
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
          <video ref={videoRef} src={videoUrl} className="w-full rounded-lg bg-black aspect-video object-contain" preload="metadata" />

          {/* Timeline */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>{fmt(start)}</span>
              <span className="text-teal-400 font-bold">Trim: {fmt(end - start)}</span>
              <span>{fmt(end)}</span>
            </div>
            <div className="relative h-10 bg-slate-900 rounded-lg overflow-hidden">
              {/* In region */}
              <div
                className="absolute top-0 h-full bg-teal-500/20 border-x border-teal-500"
                style={{ left: `${(start / duration) * 100}%`, width: `${((end - start) / duration) * 100}%` }}
              />
              {/* Playhead */}
              <div
                className="absolute top-0 h-full w-0.5 bg-white"
                style={{ left: `${(currentTime / duration) * 100}%` }}
              />
              {/* Clickable seek */}
              <div
                className="absolute inset-0 cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const t = ((e.clientX - rect.left) / rect.width) * duration;
                  seek(Math.max(start, Math.min(end, t)));
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Start: {fmt(start)}</label>
                <input type="range" min={0} max={duration} step={0.1} value={start}
                  onChange={(e) => { const v = parseFloat(e.target.value); setStart(v); if (v >= end) setEnd(Math.min(duration, v + 1)); seek(v); }}
                  className="w-full accent-teal-500" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">End: {fmt(end)}</label>
                <input type="range" min={0} max={duration} step={0.1} value={end}
                  onChange={(e) => { const v = parseFloat(e.target.value); setEnd(v); if (v <= start) setStart(Math.max(0, v - 1)); seek(v); }}
                  className="w-full accent-teal-500" />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-2 gap-3 bg-slate-900/50 rounded-lg p-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Output Format</label>
              <select value={format} onChange={(e) => setFormat(e.target.value)} className="bg-slate-800 border border-slate-700 text-xs px-2 py-1.5 rounded text-slate-200">
                <option value="video/webm">WebM (VP9)</option>
                <option value="video/mp4">MP4</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Video Bitrate</label>
              <select value={videoBitrate} onChange={(e) => setVideoBitrate(Number(e.target.value))} className="bg-slate-800 border border-slate-700 text-xs px-2 py-1.5 rounded text-slate-200">
                <option value={1000000}>1 Mbps (Small)</option>
                <option value={2500000}>2.5 Mbps (Medium)</option>
                <option value={5000000}>5 Mbps (High)</option>
                <option value={8000000}>8 Mbps (Ultra)</option>
              </select>
            </div>
          </div>

          {trimming && (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Rendering trim…</span>
                <span>{progress.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={togglePlay} className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              {isPlaying ? 'Pause' : 'Preview'}
            </button>
            <button
              onClick={handleTrim}
              disabled={trimming || end <= start}
              className="flex-1 btn-primary flex items-center justify-center gap-2 py-2 text-xs font-bold disabled:opacity-50"
            >
              {trimming ? <Film size={14} className="animate-spin" /> : <Download size={14} />}
              {trimming ? `Rendering… ${progress.toFixed(0)}%` : `Export Trim (${fmt(end - start)})`}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
