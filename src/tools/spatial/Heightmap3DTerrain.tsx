import { useState, useRef, useEffect } from 'react';
import { triggerDownload } from '../../utils/sharedHelpers';
import { ZoomIn, ZoomOut, RotateCcw, Download, Mountain, Palette } from 'lucide-react';

export const Heightmap3DTerrainTool = () => {
  const [waterLevel, setWaterLevel] = useState(0.25);
  const [terrainHeight, setTerrainHeight] = useState(1.5);
  const [biome, setBiome] = useState<'emerald' | 'alpine' | 'volcanic' | 'cyber'>('emerald');
  const [zoom, setZoom] = useState(100);
  const [rotation] = useState({ x: 0.5, y: 0.7 });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render 3D Heightmap Terrain
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#111213';
    ctx.fillRect(0, 0, w, h);

    const size = 32;
    const grid: number[][] = [];

    // Generate Procedural Perlin-like Elevation Grid
    for (let r = 0; r < size; r++) {
      grid[r] = [];
      for (let c = 0; c < size; c++) {
        const nx = r / size - 0.5;
        const ny = c / size - 0.5;
        const dist = Math.hypot(nx, ny);
        const elev = (Math.sin(nx * 8) * Math.cos(ny * 8) * 0.5 + 0.5) * (1 - dist * 0.8);
        grid[r][c] = Math.max(0, elev);
      }
    }

    const scale = (zoom / 100) * 12;
    const cosX = Math.cos(rotation.x), sinX = Math.sin(rotation.x);
    const cosY = Math.cos(rotation.y), sinY = Math.sin(rotation.y);

    // Transform Grid Vertices
    const projGrid: { x: number; y: number; z: number; h: number }[][] = [];
    for (let r = 0; r < size; r++) {
      projGrid[r] = [];
      for (let c = 0; c < size; c++) {
        const x = (r - size / 2) * 0.6;
        const y = grid[r][c] * terrainHeight;
        const z = (c - size / 2) * 0.6;

        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        projGrid[r][c] = {
          x: w / 2 + x1 * scale,
          y: h / 2 - y2 * scale,
          z: z2,
          h: grid[r][c]
        };
      }
    }

    // Color ramps for biomes
    const getBiomeColor = (elevation: number) => {
      if (elevation < waterLevel) return '#1A365D'; // Deep water
      if (biome === 'emerald') {
        if (elevation < 0.4) return '#2F855A';
        if (elevation < 0.7) return '#276749';
        return '#CBD5E0'; // Peak snow
      } else if (biome === 'volcanic') {
        if (elevation < 0.5) return '#2D3748';
        if (elevation < 0.8) return '#9B2C2C';
        return '#DD6B20'; // Lava peak
      } else if (biome === 'cyber') {
        if (elevation < 0.5) return '#319795';
        return '#D69E2E';
      } else {
        if (elevation < 0.5) return '#4A5568';
        return '#EDF2F7';
      }
    };

    // Render Quads
    for (let r = 0; r < size - 1; r++) {
      for (let c = 0; c < size - 1; c++) {
        const p1 = projGrid[r][c];
        const p2 = projGrid[r + 1][c];
        const p3 = projGrid[r + 1][c + 1];
        const p4 = projGrid[r][c + 1];

        const avgH = (p1.h + p2.h + p3.h + p4.h) / 4;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.closePath();

        ctx.fillStyle = getBiomeColor(avgH);
        ctx.fill();
        ctx.strokeStyle = '#18191B';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }

  }, [waterLevel, terrainHeight, biome, zoom, rotation]);

  const handleExportOBJ = () => {
    let objText = `# DomoDomo 3D Terrain Export\n`;
    for (let r = 0; r < 32; r++) {
      for (let c = 0; c < 32; c++) {
        objText += `v ${r} ${((r + c) % 5) * terrainHeight} ${c}\n`;
      }
    }
    const blob = new Blob([objText], { type: 'text/plain' });
    triggerDownload(URL.createObjectURL(blob), `terrain_3d_mesh.obj`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-8 glass-card p-6 flex flex-col justify-between rounded-2xl border border-[#2A2D30]">
        <div className="flex justify-between items-center bg-[#18191B] p-3 rounded-xl border border-[#2A2D30] z-10">
          <div className="flex items-center gap-2">
            <Mountain className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-200">Heightmap 3D Terrain Studio</span>
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
            <Palette className="w-4 h-4" /> Terrain Parameters
          </h3>

          <div className="flex flex-col gap-2">
            <span className="text-xs text-slate-300 font-semibold uppercase">Sea Level Water Plane</span>
            <input type="range" min="0.0" max="0.8" step="0.05" value={waterLevel} onChange={e => setWaterLevel(parseFloat(e.target.value))} className="w-full accent-emerald-500" />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs text-slate-300 font-semibold uppercase">Peak Elevation Relief</span>
            <input type="range" min="0.5" max="3.0" step="0.1" value={terrainHeight} onChange={e => setTerrainHeight(parseFloat(e.target.value))} className="w-full accent-emerald-500" />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs text-slate-300 font-semibold uppercase">Biome Color Gradient</span>
            <div className="grid grid-cols-2 gap-2">
              {(['emerald', 'alpine', 'volcanic', 'cyber'] as const).map(b => (
                <button
                  key={b}
                  onClick={() => setBiome(b)}
                  className={`py-2 text-xs font-bold rounded-lg capitalize border ${biome === b ? 'bg-[#3C6B4D] text-white border-[#3C6B4D]' : 'bg-[#18191B] text-slate-400 border-[#2A2D30]'}`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleExportOBJ} className="w-full py-3 bg-[#3C6B4D] hover:bg-[#4E8E5E] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg">
            <Download className="w-4 h-4" /> Export Terrain 3D OBJ
          </button>
        </div>
      </div>
    </div>
  );
};
