import { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Sparkles, Wind, Play, Pause } from 'lucide-react';

interface Particle { x: number; y: number; z: number; vx: number; vy: number; vz: number; life: number; color: string }

export const ParticleForceStudioTool = () => {
  const [particleCount, setParticleCount] = useState(1500);
  const [forceType, setForceType] = useState<'vortex' | 'gravity' | 'explosion' | 'attractor'>('vortex');
  const [zoom, setZoom] = useState(100);
  const [isSimulating, setIsSimulating] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);

  // Init Particles
  useEffect(() => {
    const pts: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      pts.push({
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 4,
        z: (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 0.02,
        vy: (Math.random() - 0.5) * 0.02,
        vz: (Math.random() - 0.5) * 0.02,
        life: Math.random(),
        color: i % 2 === 0 ? '#4E8E5E' : '#319795'
      });
    }
    particlesRef.current = pts;
  }, [particleCount]);

  // Simulation Loop
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      const pts = particlesRef.current;
      pts.forEach(p => {
        if (forceType === 'vortex') {
          const dist = Math.hypot(p.x, p.z) || 1;
          p.vx += -p.z * 0.005;
          p.vz += p.x * 0.005;
          p.vy += (Math.sin(dist * 4) * 0.002);
        } else if (forceType === 'gravity') {
          p.vy -= 0.003; // fall down
          if (p.y < -2) p.vy = 0.05;
        } else if (forceType === 'attractor') {
          p.vx += -p.x * 0.005;
          p.vy += -p.y * 0.005;
          p.vz += -p.z * 0.005;
        }
        p.x += p.vx; p.y += p.vy; p.z += p.vz;
        p.vx *= 0.98; p.vy *= 0.98; p.vz *= 0.98;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [isSimulating, forceType]);

  // Render Frame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width, h = canvas.height;
    ctx.fillStyle = '#111213';
    ctx.fillRect(0, 0, w, h);

    const scale = (zoom / 100) * 80;
    const pts = particlesRef.current;

    pts.forEach(p => {
      const px = w / 2 + p.x * scale;
      const py = h / 2 - p.y * scale;

      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    });

  }, [isSimulating, zoom]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-8 glass-card p-6 flex flex-col justify-between rounded-2xl border border-[#2A2D30]">
        <div className="flex justify-between items-center bg-[#18191B] p-3 rounded-xl border border-[#2A2D30] z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-200">3D Particle Force Field Engine</span>
            <span className="text-[10px] bg-[#2A2D30] text-slate-400 px-2 py-0.5 rounded-full font-mono">{particleCount} Particles</span>
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
            <Wind className="w-4 h-4" /> Force Field Mode
          </h3>

          <div className="grid grid-cols-2 gap-2">
            {(['vortex', 'gravity', 'attractor', 'explosion'] as const).map(f => (
              <button
                key={f}
                onClick={() => setForceType(f)}
                className={`py-2 text-xs font-bold rounded-lg capitalize border ${forceType === f ? 'bg-[#3C6B4D] text-white border-[#3C6B4D]' : 'bg-[#18191B] text-slate-400 border-[#2A2D30]'}`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs text-slate-300 font-semibold uppercase">Particle Count ({particleCount})</span>
            <input type="range" min="500" max="3000" step="250" value={particleCount} onChange={e => setParticleCount(parseInt(e.target.value, 10))} className="w-full accent-emerald-500" />
          </div>

          <button onClick={() => setIsSimulating(!isSimulating)} className="w-full py-3 bg-[#3C6B4D] hover:bg-[#4E8E5E] text-white font-bold rounded-xl flex items-center justify-center gap-2">
            {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isSimulating ? 'Pause Simulation' : 'Run Simulation'}
          </button>
        </div>
      </div>
    </div>
  );
};
