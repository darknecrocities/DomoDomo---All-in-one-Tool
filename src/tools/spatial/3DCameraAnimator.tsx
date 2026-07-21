import { useState, useRef, useEffect } from 'react';
import { triggerDownload } from '../../utils/sharedHelpers';
import { ZoomIn, ZoomOut, RotateCcw, Download, Camera, Play, Pause, Film } from 'lucide-react';

interface KeyframeItem { time: number; x: number; y: number; z: number; targetX: number; targetY: number; targetZ: number }

export const CameraAnimator3DTool = () => {
  const [currentTime, setCurrentTime] = useState(0); // 0 to 10s
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(100);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [keyframes] = useState<KeyframeItem[]>([
    { time: 0, x: 3, y: 2, z: 3, targetX: 0, targetY: 0, targetZ: 0 },
    { time: 3, x: 0, y: 4, z: 4, targetX: 0, targetY: 0, targetZ: 0 },
    { time: 7, x: -3, y: 2, z: 3, targetX: 0, targetY: 0, targetZ: 0 },
    { time: 10, x: 3, y: 2, z: 3, targetX: 0, targetY: 0, targetZ: 0 }
  ]);

  // Timeline Playback
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTime(t => (t >= 10 ? 0 : t + 0.1));
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Interpolate camera position
  const getCameraPosAtTime = (t: number) => {
    const sorted = [...keyframes].sort((a, b) => a.time - b.time);
    for (let i = 0; i < sorted.length - 1; i++) {
      if (t >= sorted[i].time && t <= sorted[i + 1].time) {
        const ratio = (t - sorted[i].time) / (sorted[i + 1].time - sorted[i].time);
        return {
          x: sorted[i].x + (sorted[i + 1].x - sorted[i].x) * ratio,
          y: sorted[i].y + (sorted[i + 1].y - sorted[i].y) * ratio,
          z: sorted[i].z + (sorted[i + 1].z - sorted[i].z) * ratio
        };
      }
    }
    return sorted[0];
  };

  const camPos = getCameraPosAtTime(currentTime);

  // Render Scene from Animated Camera View
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width, h = canvas.height;
    ctx.fillStyle = '#111213';
    ctx.fillRect(0, 0, w, h);

    const scale = (zoom / 100) * 70;

    // Draw central target 3D object (Cyber Pyramid)
    const pts = [
      { x: 0, y: 1.5, z: 0 },
      { x: -1, y: -1, z: 1 },
      { x: 1, y: -1, z: 1 },
      { x: 1, y: -1, z: -1 },
      { x: -1, y: -1, z: -1 }
    ];

    const proj = pts.map(p => {
      const dx = p.x - camPos.x;
      const dy = p.y - camPos.y;
      return { x: w / 2 + dx * scale, y: h / 2 - dy * scale };
    });

    ctx.strokeStyle = '#4E8E5E';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(proj[0].x, proj[0].y); ctx.lineTo(proj[1].x, proj[1].y);
    ctx.moveTo(proj[0].x, proj[0].y); ctx.lineTo(proj[2].x, proj[2].y);
    ctx.moveTo(proj[0].x, proj[0].y); ctx.lineTo(proj[3].x, proj[3].y);
    ctx.moveTo(proj[0].x, proj[0].y); ctx.lineTo(proj[4].x, proj[4].y);
    ctx.stroke();

  }, [camPos, zoom]);

  const handleExportJSON = () => {
    const data = JSON.stringify(keyframes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    triggerDownload(URL.createObjectURL(blob), 'camera_flight_path.json');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-8 glass-card p-6 flex flex-col justify-between rounded-2xl border border-[#2A2D30]">
        <div className="flex justify-between items-center bg-[#18191B] p-3 rounded-xl border border-[#2A2D30] z-10">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-200">3D Camera Flight Path Animator</span>
            <span className="text-[10px] bg-[#2A2D30] text-emerald-400 px-2 py-0.5 rounded-full font-mono">{currentTime.toFixed(1)}s / 10s</span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#111213] p-1 rounded-lg border border-[#2A2D30]">
            <button onClick={() => setZoom(z => Math.max(50, z - 15))} className="p-1 text-slate-400 hover:text-white"><ZoomOut className="w-3.5 h-3.5" /></button>
            <span className="text-[11px] font-mono font-semibold px-2 text-emerald-400">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(200, z + 15))} className="p-1 text-slate-400 hover:text-white"><ZoomIn className="w-3.5 h-3.5" /></button>
            <button onClick={() => setZoom(100)} className="p-1 text-slate-400 hover:text-white"><RotateCcw className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        <div className="w-full flex-1 flex items-center justify-center my-6">
          <canvas ref={canvasRef} width={620} height={360} className="w-full max-w-[620px] h-[360px] rounded-xl border border-[#2A2D30]" />
        </div>
      </div>

      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 rounded-2xl border border-[#2A2D30]">
          <h3 className="text-emerald-400 font-bold border-b border-[#2A2D30] pb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
            <Film className="w-4 h-4" /> Timeline Playback
          </h3>

          <div className="flex flex-col gap-2">
            <span className="text-xs text-slate-300 font-semibold uppercase">Timeline Scrubber ({currentTime.toFixed(1)}s)</span>
            <input type="range" min="0" max="10" step="0.1" value={currentTime} onChange={e => setCurrentTime(parseFloat(e.target.value))} className="w-full accent-emerald-500" />
          </div>

          <button onClick={() => setIsPlaying(!isPlaying)} className="w-full py-3 bg-[#3C6B4D] hover:bg-[#4E8E5E] text-white font-bold rounded-xl flex items-center justify-center gap-2">
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Pause Playback' : 'Play Camera Flight'}
          </button>

          <button onClick={handleExportJSON} className="w-full py-3 bg-[#18191B] hover:bg-[#2A2D30] text-slate-200 border border-[#2A2D30] font-bold rounded-xl flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Export Keyframes JSON
          </button>
        </div>
      </div>
    </div>
  );
};
