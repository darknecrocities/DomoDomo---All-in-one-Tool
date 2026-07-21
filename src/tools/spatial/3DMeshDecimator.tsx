import { useState, useRef, useEffect } from 'react';
import { triggerDownload } from '../../utils/sharedHelpers';
import { ZoomIn, ZoomOut, RotateCcw, Download, Scissors, Sliders } from 'lucide-react';

interface Vertex { x: number; y: number; z: number }
interface Face { v: number[] }

export const MeshDecimator3DTool = () => {
  const [targetRatio, setTargetRatio] = useState(50); // % target detail
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState({ x: 0.4, y: 0.5 });
  const [showHeatmap, setShowHeatmap] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate sphere high density mesh
  const generateMesh = (ratio: number) => {
    const rawV: Vertex[] = [];
    const rawF: Face[] = [];

    const latBands = Math.max(4, Math.floor(24 * (ratio / 100)));
    const longBands = Math.max(4, Math.floor(24 * (ratio / 100)));
    const radius = 1.2;

    for (let latNumber = 0; latNumber <= latBands; latNumber++) {
      const theta = (latNumber * Math.PI) / latBands;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      for (let longNumber = 0; longNumber <= longBands; longNumber++) {
        const phi = (longNumber * 2 * Math.PI) / longBands;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        const x = cosPhi * sinTheta * radius;
        const y = cosTheta * radius;
        const z = sinPhi * sinTheta * radius;
        rawV.push({ x, y, z });
      }
    }

    for (let latNumber = 0; latNumber < latBands; latNumber++) {
      for (let longNumber = 0; longNumber < longBands; longNumber++) {
        const first = latNumber * (longBands + 1) + longNumber;
        const second = first + longBands + 1;
        rawF.push({ v: [first, second, first + 1] });
        rawF.push({ v: [second, second + 1, first + 1] });
      }
    }

    return { vertices: rawV, faces: rawF };
  };

  const origMesh = generateMesh(100);
  const decimatedMesh = generateMesh(targetRatio);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#111213';
    ctx.fillRect(0, 0, width, height);

    const scale = (zoom / 100) * 110;
    const cosX = Math.cos(rotation.x);
    const cosY = Math.cos(rotation.y), sinY = Math.sin(rotation.y);

    const projected = decimatedMesh.vertices.map(pt => {
      const x1 = pt.x * cosY - pt.z * sinY;
      const z1 = pt.x * sinY + pt.z * cosY;
      const y2 = pt.y * cosX - z1 * Math.sin(rotation.x);
      const z2 = pt.y * Math.sin(rotation.x) + z1 * cosX;
      return {
        x: width / 2 + x1 * scale,
        y: height / 2 - y2 * scale,
        z: z2
      };
    });

    const sortedFaces = decimatedMesh.faces.map(face => {
      const avgZ = face.v.reduce((sum, idx) => sum + (projected[idx]?.z || 0), 0) / face.v.length;
      return { ...face, avgZ };
    }).sort((a, b) => a.avgZ - b.avgZ);

    sortedFaces.forEach(face => {
      const pts = face.v.map(i => projected[i]);
      if (!pts[0] || !pts[1] || !pts[2]) return;

      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      ctx.lineTo(pts[1].x, pts[1].y);
      ctx.lineTo(pts[2].x, pts[2].y);
      ctx.closePath();

      if (showHeatmap) {
        // Reduction Heatmap Color: green (high detail) to red/amber (decimated)
        const heatHue = (targetRatio / 100) * 120; // 0=red, 120=green
        ctx.fillStyle = `hsla(${heatHue}, 70%, 45%, 0.75)`;
      } else {
        ctx.fillStyle = '#3C6B4D';
        ctx.globalAlpha = 0.8;
      }
      ctx.fill();
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = '#18191B';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

  }, [targetRatio, zoom, rotation, showHeatmap, decimatedMesh]);

  const handleExportOBJ = () => {
    let objText = `# DomoDomo Decimated Mesh Target: ${targetRatio}%\n`;
    decimatedMesh.vertices.forEach(v => { objText += `v ${v.x.toFixed(4)} ${v.y.toFixed(4)} ${v.z.toFixed(4)}\n`; });
    decimatedMesh.faces.forEach(f => { objText += `f ${f.v.map(i => i + 1).join(' ')}\n`; });
    const blob = new Blob([objText], { type: 'text/plain' });
    triggerDownload(URL.createObjectURL(blob), `decimated_mesh_${targetRatio}pct.obj`);
  };

  const vertexReductionPct = (100 - (decimatedMesh.vertices.length / origMesh.vertices.length) * 100).toFixed(1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-8 glass-card p-6 flex flex-col justify-between relative min-h-[460px] rounded-2xl border border-[#2A2D30]">
        
        {/* Top Control Overlay */}
        <div className="flex justify-between items-center bg-[#18191B]/80 backdrop-blur p-3 rounded-xl border border-[#2A2D30] z-10">
          <div className="flex items-center gap-3">
            <Scissors className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-200">3D Poly-Decimator Engine</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-mono font-bold">
              -{vertexReductionPct}% Poly Reduction
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#111213] p-1 rounded-lg border border-[#2A2D30]">
            <button onClick={() => setZoom(z => Math.max(40, z - 15))} className="p-1.5 hover:bg-[#2A2D30] rounded text-slate-400 hover:text-white" title="Zoom Out">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono font-semibold px-2 text-emerald-400">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(200, z + 15))} className="p-1.5 hover:bg-[#2A2D30] rounded text-slate-400 hover:text-white" title="Zoom In">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => { setZoom(100); setRotation({ x: 0.4, y: 0.5 }); }} className="p-1.5 hover:bg-[#2A2D30] rounded text-slate-400 hover:text-white" title="Reset View">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Canvas Render Area */}
        <div className="w-full flex-1 flex items-center justify-center my-6">
          <canvas ref={canvasRef} width={620} height={360} className="w-full max-w-[620px] h-[360px] rounded-xl border border-[#2A2D30]" />
        </div>

        {/* Bottom Metrics Bar */}
        <div className="grid grid-cols-3 gap-4 text-center pt-3 border-t border-[#2A2D30] bg-[#111213]/60 p-3 rounded-xl">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Original Mesh</div>
            <div className="text-sm font-bold text-slate-200 font-mono">{origMesh.vertices.length} Verts</div>
          </div>
          <div>
            <div className="text-[10px] text-emerald-400 uppercase font-semibold">Decimated Target</div>
            <div className="text-sm font-bold text-emerald-400 font-mono">{decimatedMesh.vertices.length} Verts</div>
          </div>
          <div>
            <div className="text-[10px] text-amber-400 uppercase font-semibold">Bandwidth Saved</div>
            <div className="text-sm font-bold text-amber-400 font-mono">{vertexReductionPct}% lighter</div>
          </div>
        </div>
      </div>

      {/* Control Sidebar */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 rounded-2xl border border-[#2A2D30]">
          <h3 className="text-emerald-400 font-bold border-b border-[#2A2D30] pb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
            <Sliders className="w-4 h-4" /> Decimation Controls
          </h3>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold uppercase">Target Poly Density</span>
              <span className="text-emerald-400 font-bold font-mono">{targetRatio}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={targetRatio}
              onChange={e => setTargetRatio(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#18191B] border border-[#2A2D30]">
            <span className="text-xs text-slate-300 font-semibold">Density Heatmap Overlay</span>
            <input
              type="checkbox"
              checked={showHeatmap}
              onChange={e => setShowHeatmap(e.target.checked)}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          <button
            onClick={handleExportOBJ}
            className="w-full py-3 bg-[#3C6B4D] hover:bg-[#4E8E5E] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <Download className="w-4 h-4" /> Export Decimated OBJ
          </button>
        </div>
      </div>
    </div>
  );
};
