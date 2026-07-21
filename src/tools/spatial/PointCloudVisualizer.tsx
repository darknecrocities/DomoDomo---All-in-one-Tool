import { useState, useRef, useEffect, useMemo } from 'react';
import { triggerDownload } from '../../utils/sharedHelpers';
import { ZoomIn, ZoomOut, RotateCcw, Download, Cpu, Sliders } from 'lucide-react';

interface CloudPoint { x: number; y: number; z: number; intensity?: number }

export const PointCloudVisualizerTool = () => {
  const [pointSize, setPointSize] = useState(3);
  const [colorMode, setColorMode] = useState<'rainbow' | 'thermal' | 'emerald' | 'white'>('rainbow');
  const [clipZ, setClipZ] = useState(1.0); // 0 to 1 clipping plane
  const [zoom, setZoom] = useState(100);
  const [rotation] = useState({ x: 0.3, y: 0.5 });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate Demo LiDAR Point Cloud (Spiral Helix Galaxy / Spatial Scan)
  const cloud = useMemo((): CloudPoint[] => {
    const pts: CloudPoint[] = [];
    const count = 1200;
    for (let i = 0; i < count; i++) {
      const u = (i / count) * Math.PI * 12;
      const r = (i / count) * 1.5;
      const x = Math.cos(u) * r;
      const z = Math.sin(u) * r;
      const y = (Math.sin(u * 2) * 0.3) + ((Math.random() - 0.5) * 0.1);
      pts.push({ x, y, z, intensity: i / count });
    }
    return pts;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#111213';
    ctx.fillRect(0, 0, w, h);

    const scale = (zoom / 100) * 100;
    const cosX = Math.cos(rotation.x), sinX = Math.sin(rotation.x);
    const cosY = Math.cos(rotation.y), sinY = Math.sin(rotation.y);

    cloud.forEach(pt => {
      if ((pt.intensity || 0) > clipZ) return; // Clipping plane filtering

      const x1 = pt.x * cosY - pt.z * sinY;
      const z1 = pt.x * sinY + pt.z * cosY;
      const y2 = pt.y * cosX - z1 * sinX;

      const px = w / 2 + x1 * scale;
      const py = h / 2 - y2 * scale;

      ctx.beginPath();
      ctx.arc(px, py, pointSize, 0, Math.PI * 2);

      if (colorMode === 'rainbow') {
        const hue = (pt.intensity || 0) * 280;
        ctx.fillStyle = `hsl(${hue}, 85%, 60%)`;
      } else if (colorMode === 'thermal') {
        const hue = (pt.intensity || 0) * 60; // Red to Yellow
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      } else if (colorMode === 'emerald') {
        ctx.fillStyle = '#4E8E5E';
      } else {
        ctx.fillStyle = '#F7FAFC';
      }
      ctx.fill();
    });

  }, [cloud, pointSize, colorMode, clipZ, zoom, rotation]);

  const handleExportPLY = () => {
    let ply = `ply\nformat ascii 1.0\nelement vertex ${cloud.length}\nproperty float x\nproperty float y\nproperty float z\nend_header\n`;
    cloud.forEach(p => { ply += `${p.x.toFixed(4)} ${p.y.toFixed(4)} ${p.z.toFixed(4)}\n`; });
    const blob = new Blob([ply], { type: 'text/plain' });
    triggerDownload(URL.createObjectURL(blob), 'point_cloud_scan.ply');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-8 glass-card p-6 flex flex-col justify-between rounded-2xl border border-[#2A2D30]">
        <div className="flex justify-between items-center bg-[#18191B] p-3 rounded-xl border border-[#2A2D30] z-10">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-200">3D Point Cloud LiDAR Visualizer</span>
            <span className="text-[10px] bg-[#2A2D30] text-slate-400 px-2 py-0.5 rounded-full font-mono">{cloud.length} Points</span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#111213] p-1 rounded-lg border border-[#2A2D30]">
            <button onClick={() => setZoom(z => Math.max(40, z - 15))} className="p-1 text-slate-400 hover:text-white"><ZoomOut className="w-3.5 h-3.5" /></button>
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
            <Sliders className="w-4 h-4" /> Point Cloud Settings
          </h3>

          <div className="flex flex-col gap-2">
            <span className="text-xs text-slate-300 font-semibold uppercase">Point Attenuation Size ({pointSize}px)</span>
            <input type="range" min="1" max="8" value={pointSize} onChange={e => setPointSize(parseInt(e.target.value, 10))} className="w-full accent-emerald-500" />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs text-slate-300 font-semibold uppercase">Height Clipping Plane</span>
            <input type="range" min="0.1" max="1.0" step="0.05" value={clipZ} onChange={e => setClipZ(parseFloat(e.target.value))} className="w-full accent-emerald-500" />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs text-slate-300 font-semibold uppercase">Elevation Spectrum Ramp</span>
            <div className="grid grid-cols-2 gap-2">
              {(['rainbow', 'thermal', 'emerald', 'white'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setColorMode(mode)}
                  className={`py-1.5 text-xs font-bold rounded-lg capitalize border ${colorMode === mode ? 'bg-[#3C6B4D] text-white border-[#3C6B4D]' : 'bg-[#18191B] text-slate-400 border-[#2A2D30]'}`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleExportPLY} className="w-full py-3 bg-[#3C6B4D] hover:bg-[#4E8E5E] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg">
            <Download className="w-4 h-4" /> Export Point Cloud PLY
          </button>
        </div>
      </div>
    </div>
  );
};
