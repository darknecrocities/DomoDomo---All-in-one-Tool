import { useState, useRef, useEffect, useCallback } from 'react';
import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { Layers, Download, Film, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface VideoItem {
  id: string;
  file: File;
  url: string;
  duration: number;
  w: number;
  h: number;
}

export const VideoMergeTool = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [outputWidth, setOutputWidth] = useState(1280);
  const [outputHeight, setOutputHeight] = useState(720);
  const [bitrate, setBitrate] = useState(4000000);
  const [fps, setFps] = useState(30);
  const [transitionFrames, setTransitionFrames] = useState(15);
  const [merging, setMerging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentMerge, setCurrentMerge] = useState('');
  const hiddenVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return () => videos.forEach(v => URL.revokeObjectURL(v.url));
  }, []);

  const addVideos = (files: FileList | null) => {
    if (!files) return;
    const newItems: VideoItem[] = Array.from(files).map(f => ({
      id: `${f.name}-${Date.now()}-${Math.random()}`,
      file: f,
      url: URL.createObjectURL(f),
      duration: 0,
      w: 0,
      h: 0,
    }));
    // Load meta for each
    newItems.forEach((item) => {
      const tmpV = document.createElement('video');
      tmpV.src = item.url;
      tmpV.preload = 'metadata';
      tmpV.onloadedmetadata = () => {
        setVideos(prev => prev.map(v =>
          v.id === item.id ? { ...v, duration: tmpV.duration, w: tmpV.videoWidth, h: tmpV.videoHeight } : v
        ));
      };
    });
    setVideos(prev => [...prev, ...newItems]);
  };

  const removeVideo = (id: string) => {
    setVideos(prev => {
      const item = prev.find(v => v.id === id);
      if (item) URL.revokeObjectURL(item.url);
      return prev.filter(v => v.id !== id);
    });
  };

  const moveVideo = (id: string, dir: -1 | 1) => {
    setVideos(prev => {
      const idx = prev.findIndex(v => v.id === id);
      if (idx < 0) return prev;
      const next = idx + dir;
      if (next < 0 || next >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });
  };

  const playVideoOnCanvas = async (
    videoItem: VideoItem,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    _mediaRecorder: MediaRecorder,
    onProgress: (p: number) => void,
    totalDuration: number,
    timeOffset: number
  ): Promise<void> => {
    return new Promise((resolve) => {
      const v = hiddenVideoRef.current!;
      v.src = videoItem.url;
      v.playbackRate = 1;
      v.muted = false;

      let rafId: number;
      const render = () => {
        if (v.ended || v.currentTime >= videoItem.duration) {
          cancelAnimationFrame(rafId);
          resolve();
          return;
        }
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
        const elapsed = timeOffset + v.currentTime;
        onProgress(Math.min(99, (elapsed / totalDuration) * 100));
        rafId = requestAnimationFrame(render);
      };

      v.oncanplay = () => { v.play(); render(); };
      v.onended = () => { cancelAnimationFrame(rafId); resolve(); };
    });
  };

  const handleMerge = useCallback(async () => {
    if (videos.length < 2) return;
    setMerging(true);
    setProgress(0);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext('2d')!;
      const stream = canvas.captureStream(fps);

      const audioCtx = new AudioContext();
      const dest = audioCtx.createMediaStreamDestination();
      stream.addTrack(dest.stream.getAudioTracks()[0]);

      const chunks: BlobPart[] = [];
      const mr = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : 'video/webm',
        videoBitsPerSecond: bitrate,
      });
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      const totalDuration = videos.reduce((sum, v) => sum + v.duration, 0);
      mr.start(200);

      let timeOffset = 0;
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        setCurrentMerge(`Merging clip ${i + 1}/${videos.length}: ${video.file.name}`);

        // Fade-in transition (draw black frame)
        if (i > 0 && transitionFrames > 0) {
          for (let f = 0; f < transitionFrames; f++) {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            await new Promise(r => setTimeout(r, 1000 / fps));
          }
        }

        await playVideoOnCanvas(video, canvas, ctx, mr, setProgress, totalDuration, timeOffset);
        timeOffset += video.duration;
      }

      mr.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        triggerBlobDownload(blob, 'merged_video.webm');
        setMerging(false);
        setProgress(0);
        setCurrentMerge('');
        audioCtx.close();
      };
      mr.stop();
    } catch (err) {
      console.error(err);
      setMerging(false);
    }
  }, [videos, outputWidth, outputHeight, bitrate, fps, transitionFrames]);

  const totalDuration = videos.reduce((sum, v) => sum + (v.duration || 0), 0);
  const fmt = (s: number) => s > 60 ? `${(s / 60).toFixed(1)}m` : `${s.toFixed(1)}s`;

  return (
    <div className="max-w-2xl mx-auto glass-card p-6 flex flex-col gap-5 text-left">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Layers size={18} className="text-teal-400" />
        <h3 className="font-bold text-teal-400 text-sm">Video Merger / Joiner</h3>
        <span className="ml-auto text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full">Canvas Sequential Render</span>
      </div>

      <video ref={hiddenVideoRef} className="hidden" />

      <label className="flex items-center gap-3 py-4 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-teal-500/50 transition-colors justify-center">
        <Plus size={18} className="text-teal-400" />
        <span className="text-slate-300 text-sm font-medium">Add Video Clips</span>
        <input type="file" multiple accept="video/*" className="hidden" onChange={(e) => addVideos(e.target.files)} />
      </label>

      {videos.length > 0 && (
        <div className="flex flex-col gap-2">
          {videos.map((v, i) => (
            <div key={v.id} className="flex items-center gap-2 bg-slate-900/80 rounded-lg p-3">
              <span className="text-teal-400 font-bold text-xs w-5 shrink-0">#{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-slate-200 font-medium truncate">{v.file.name}</div>
                <div className="text-xs text-slate-500">
                  {v.w > 0 ? `${v.w}×${v.h}` : '…'} · {v.duration > 0 ? fmt(v.duration) : '…'}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => moveVideo(v.id, -1)} disabled={i === 0} className="p-1 text-slate-400 hover:text-white disabled:opacity-30">
                  <ArrowUp size={12} />
                </button>
                <button onClick={() => moveVideo(v.id, 1)} disabled={i === videos.length - 1} className="p-1 text-slate-400 hover:text-white disabled:opacity-30">
                  <ArrowDown size={12} />
                </button>
                <button onClick={() => removeVideo(v.id)} className="p-1 text-red-400 hover:text-red-300">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className="flex gap-3 text-xs text-slate-400 flex-wrap">
            <span className="bg-slate-900 px-2 py-1 rounded">{videos.length} clips</span>
            <span className="bg-slate-900 px-2 py-1 rounded">Total: {fmt(totalDuration)}</span>
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="grid grid-cols-2 gap-3 bg-slate-900/50 rounded-lg p-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">Output Resolution</label>
          <select
            onChange={(e) => {
              const [w, h] = e.target.value.split('x').map(Number);
              setOutputWidth(w); setOutputHeight(h);
            }}
            value={`${outputWidth}x${outputHeight}`}
            className="bg-slate-800 border border-slate-700 text-xs px-2 py-1.5 rounded text-slate-200">
            <option value="640x360">640×360 (360p)</option>
            <option value="1280x720">1280×720 (720p HD)</option>
            <option value="1920x1080">1920×1080 (1080p)</option>
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
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">Bitrate</label>
          <select value={bitrate} onChange={(e) => setBitrate(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 text-xs px-2 py-1.5 rounded text-slate-200">
            <option value={2000000}>2 Mbps</option>
            <option value={4000000}>4 Mbps</option>
            <option value={8000000}>8 Mbps</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">Black Transition Frames</label>
          <input type="number" min={0} max={60} value={transitionFrames}
            onChange={(e) => setTransitionFrames(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 text-xs px-2 py-1.5 rounded text-slate-200" />
        </div>
      </div>

      {merging && (
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span className="truncate">{currentMerge}</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <button
        onClick={handleMerge}
        disabled={merging || videos.length < 2}
        className="btn-primary flex items-center justify-center gap-2 py-2.5 text-xs font-bold disabled:opacity-50"
      >
        {merging ? <Film size={14} className="animate-spin" /> : <Download size={14} />}
        {merging ? `Merging… ${progress.toFixed(0)}%` : `Merge ${videos.length} Clips`}
      </button>
    </div>
  );
};
