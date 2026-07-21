import { useState, useRef, useEffect } from 'react';
import { triggerDownload } from '../../utils/sharedHelpers';
import { ZoomIn, ZoomOut, RotateCcw, Download, Box, Palette } from 'lucide-react';

interface VoxelBlock { x: number; y: number; z: number; color: string }

export const VoxelStudioConverterTool = () => {
  const [activeColor, setActiveColor] = useState('#3C6B4D');
  const [zoom, setZoom] = useState(100);
  const [rotation] = useState({ x: 0.5, y: 0.6 });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Default initial voxel sculpture (Space Invader / Cyber Heart)
  const [voxels] = useState<VoxelBlock[]>(() => {
    const v: VoxelBlock[] = [];
    // 3D Cyber Cube Sculpture
    for (let x = -2; x <= 2; x++) {
      for (let y = -2; y <= 2; y++) {
        for (let z = -2; z <= 2; z++) {
          if (Math.abs(x) === 2 || Math.abs(y) === 2 || Math.abs(z) === 2) {
            v.push({ x, y, z, color: (x + y + z) % 2 === 0 ? '#3C6B4D' : '#4E8E5E' });
          }
        }
      }
    }
    return v;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#111213';
    ctx.fillRect(0, 0, w, h);

    const scale = (zoom / 100) * 22;
    const cosX = Math.cos(rotation.x), sinX = Math.sin(rotation.x);
    const cosY = Math.cos(rotation.y), sinY = Math.sin(rotation.y);

    // Painter's algorithm depth sort
    const transformed = voxels.map(v => {
      const x1 = v.x * cosY - v.z * sinY;
      const z1 = v.x * sinY + v.z * cosY;
      const y2 = v.y * cosX - z1 * sinX;
      const z2 = v.y * sinX + z1 * cosX;
      return { ...v, px: w / 2 + x1 * scale, py: h / 2 - y2 * scale, pz: z2 };
    }).sort((a, b) => a.pz - b.pz);

    transformed.forEach(v => {
      ctx.fillStyle = v.color;
      ctx.fillRect(v.px - scale / 2, v.py - scale / 2, scale, scale);
      ctx.strokeStyle = '#18191B';
      ctx.lineWidth = 1;
      ctx.strokeRect(v.px - scale / 2, v.py - scale / 2, scale, scale);
    });

  }, [voxels, zoom, rotation]);

  const handleExportOBJ = () => {
    let objText = `# DomoDomo Voxel Mesh Export\n`;
    let vertIdx = 1;
    voxels.forEach(v => {
      const s = 0.5;
      objText += `v ${v.x - s} ${v.y - s} ${v.z - s}\n`;
      objText += `v ${v.x + s} ${v.y - s} ${v.z - s}\n`;
      objText += `v ${v.x + s} ${v.y + s} ${v.z - s}\n`;
      objText += `v ${v.x - s} ${v.y + s} ${v.z - s}\n`;
      objText += `f ${vertIdx} ${vertIdx + 1} ${vertIdx + 2} ${vertIdx + 3}\n`;
      vertIdx += 4;
    });
    const blob = new Blob([objText], { type: 'text/plain' });
    triggerDownload(URL.createObjectURL(blob), 'voxel_art_sculpture.obj');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-8 glass-card p-6 flex flex-col justify-between rounded-2xl border border-[#2A2D30]">
        <div className="flex justify-between items-center bg-[#18191B] p-3 rounded-xl border border-[#2A2D30] z-10">
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-200">Voxel Studio 3D Converter</span>
            <span className="text-[10px] bg-[#2A2D30] text-slate-400 px-2 py-0.5 rounded-full font-mono">{voxels.length} Voxels</span>
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
            <Palette className="w-4 h-4" /> Voxel Palette & Tools
          </h3>

          <div className="flex flex-col gap-2">
            <span className="text-xs text-slate-300 font-semibold uppercase">Active Voxel Block Color</span>
            <input type="color" value={activeColor} onChange={e => setActiveColor(e.target.value)} className="w-full h-9 rounded border border-[#2A2D30] bg-transparent cursor-pointer" />
          </div>

          <div className="grid grid-cols-4 gap-2">
            {['#3C6B4D', '#4E8E5E', '#319795', '#D69E2E', '#E53E3E', '#805AD5', '#3182CE', '#EDF2F7'].map(c => (
              <button key={c} onClick={() => setActiveColor(c)} className="h-7 rounded border border-[#2A2D30]" style={{ backgroundColor: c }} />
            ))}
          </div>

          <button onClick={handleExportOBJ} className="w-full py-3 bg-[#3C6B4D] hover:bg-[#4E8E5E] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg">
            <Download className="w-4 h-4" /> Export Voxel OBJ File
          </button>
        </div>
      </div>
    </div>
  );
};
