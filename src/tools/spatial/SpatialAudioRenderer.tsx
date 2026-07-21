import { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Volume2, Play, Pause, Disc } from 'lucide-react';

interface SoundSource { id: string; name: string; x: number; y: number; z: number; freq: number; color: string }

export const SpatialAudioRendererTool = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [reverbAmount, setReverbAmount] = useState(0.4);
  const [zoom, setZoom] = useState(100);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const [sources, setSources] = useState<SoundSource[]>([
    { id: 's1', name: 'Synth Lead (Front Right)', x: 1.2, y: 0, z: 1.5, freq: 440, color: '#3C6B4D' },
    { id: 's2', name: 'Bass Line (Left Rear)', x: -1.5, y: 0, z: -1.0, freq: 110, color: '#319795' },
    { id: 's3', name: 'Ambient Pad (Center Front)', x: 0, y: 0.8, z: 2.0, freq: 330, color: '#D69E2E' }
  ]);

  const activeSourceIdx = useRef<number | null>(null);

  // Render 3D Sound Stage Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#111213';
    ctx.fillRect(0, 0, w, h);

    const centerX = w / 2;
    const centerY = h / 2;
    const scale = (zoom / 100) * 80;

    // Draw 3D Spatial Concentric Radar Orbits
    for (let r = 1; r <= 3; r++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, r * scale, 0, Math.PI * 2);
      ctx.strokeStyle = '#2A2D30';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw 3D Center Listener Head
    ctx.beginPath();
    ctx.arc(centerX, centerY, 16, 0, Math.PI * 2);
    ctx.fillStyle = '#18191B';
    ctx.fill();
    ctx.strokeStyle = '#4E8E5E';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw ears
    ctx.fillStyle = '#4E8E5E';
    ctx.fillRect(centerX - 20, centerY - 4, 4, 8);
    ctx.fillRect(centerX + 16, centerY - 4, 4, 8);

    // Draw Sound Sources with ripples
    sources.forEach(src => {
      const sx = centerX + src.x * scale;
      const sy = centerY - src.z * scale;

      if (isPlaying) {
        ctx.beginPath();
        ctx.arc(sx, sy, 24, 0, Math.PI * 2);
        ctx.strokeStyle = src.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.4;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }

      ctx.beginPath();
      ctx.arc(sx, sy, 10, 0, Math.PI * 2);
      ctx.fillStyle = src.color;
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#CBD5E0';
      ctx.font = '10px sans-serif';
      ctx.fillText(src.name, sx - 40, sy + 22);
    });

  }, [sources, isPlaying, zoom]);

  const toggleAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    setIsPlaying(!isPlaying);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = (zoom / 100) * 80;

    sources.forEach((src, i) => {
      const sx = centerX + src.x * scale;
      const sy = centerY - src.z * scale;
      if (Math.hypot(mx - sx, my - sy) < 16) {
        activeSourceIdx.current = i;
      }
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (activeSourceIdx.current === null) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = (zoom / 100) * 80;

    const newX = (mx - centerX) / scale;
    const newZ = (centerY - my) / scale;

    setSources(prev => prev.map((s, idx) => idx === activeSourceIdx.current ? { ...s, x: newX, z: newZ } : s));
  };

  const handleMouseUp = () => { activeSourceIdx.current = null; };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-8 glass-card p-6 flex flex-col justify-between rounded-2xl border border-[#2A2D30]">
        <div className="flex justify-between items-center bg-[#18191B] p-3 rounded-xl border border-[#2A2D30] z-10">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-200">3D Spatial Audio HRTF Soundfield</span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#111213] p-1 rounded-lg border border-[#2A2D30]">
            <button onClick={() => setZoom(z => Math.max(50, z - 15))} className="p-1 text-slate-400 hover:text-white"><ZoomOut className="w-3.5 h-3.5" /></button>
            <span className="text-[11px] font-mono font-semibold px-2 text-emerald-400">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(200, z + 15))} className="p-1 text-slate-400 hover:text-white"><ZoomIn className="w-3.5 h-3.5" /></button>
            <button onClick={() => setZoom(100)} className="p-1 text-slate-400 hover:text-white"><RotateCcw className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        <div 
          className="w-full flex-1 flex items-center justify-center my-6 cursor-pointer"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <canvas ref={canvasRef} width={620} height={360} className="w-full max-w-[620px] h-[360px] rounded-xl border border-[#2A2D30]" />
        </div>
      </div>

      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 rounded-2xl border border-[#2A2D30]">
          <h3 className="text-emerald-400 font-bold border-b border-[#2A2D30] pb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
            <Disc className="w-4 h-4" /> Spatial Audio Controls
          </h3>

          <button
            onClick={toggleAudio}
            className={`w-full py-3 font-bold rounded-xl flex items-center justify-center gap-2 border transition-all ${isPlaying ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-[#3C6B4D] text-white border-[#3C6B4D]'}`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Stop 3D Audio Engine' : 'Play 3D Spatial Binaural Synth'}
          </button>

          <div className="flex flex-col gap-2">
            <span className="text-xs text-slate-300 font-semibold uppercase">Acoustic Room Impulse Reverb</span>
            <input type="range" min="0" max="1" step="0.05" value={reverbAmount} onChange={e => setReverbAmount(parseFloat(e.target.value))} className="w-full accent-emerald-500" />
          </div>
        </div>
      </div>
    </div>
  );
};
