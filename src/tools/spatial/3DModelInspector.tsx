import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FileUploadWrapper, triggerDownload } from '../../utils/sharedHelpers';
import { ZoomIn, ZoomOut, RotateCcw, Download, Eye, Box, Play, Pause, Layers } from 'lucide-react';

interface Point3D { x: number; y: number; z: number }
interface Face3D { v: number[]; color?: string }
interface MeshData { vertices: Point3D[]; faces: Face3D[]; name: string }

export const ModelInspector3DTool = () => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState({ x: 0.4, y: 0.6, z: 0 });
  const [isRotating, setIsRotating] = useState(true);
  const [renderMode, setRenderMode] = useState<'solid' | 'wireframe' | 'points' | 'normals'>('solid');
  const [meshColor, setMeshColor] = useState('#3C6B4D');
  const [lightPos, setLightPos] = useState({ x: 1, y: 1, z: 1 });
  const [presetMesh, setPresetMesh] = useState<'cube' | 'torus' | 'pyramid' | 'helmet'>('torus');
  const [customMesh, setCustomMesh] = useState<MeshData | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Generate Preset Meshes
  const getMesh = useCallback((): MeshData => {
    if (customMesh) return customMesh;
    if (presetMesh === 'cube') {
      const v: Point3D[] = [
        { x: -1, y: -1, z: -1 }, { x: 1, y: -1, z: -1 }, { x: 1, y: 1, z: -1 }, { x: -1, y: 1, z: -1 },
        { x: -1, y: -1, z: 1 },  { x: 1, y: -1, z: 1 },  { x: 1, y: 1, z: 1 },  { x: -1, y: 1, z: 1 }
      ];
      const f: Face3D[] = [
        { v: [0, 1, 2, 3] }, { v: [5, 4, 7, 6] }, { v: [4, 0, 3, 7] },
        { v: [1, 5, 6, 2] }, { v: [4, 5, 1, 0] }, { v: [3, 2, 6, 7] }
      ];
      return { vertices: v, faces: f, name: '3D Cube' };
    } else if (presetMesh === 'pyramid') {
      const v: Point3D[] = [
        { x: 0, y: 1.2, z: 0 }, { x: -1, y: -1, z: 1 }, { x: 1, y: -1, z: 1 },
        { x: 1, y: -1, z: -1 }, { x: -1, y: -1, z: -1 }
      ];
      const f: Face3D[] = [
        { v: [0, 1, 2] }, { v: [0, 2, 3] }, { v: [0, 3, 4] }, { v: [0, 4, 1] }, { v: [1, 4, 3, 2] }
      ];
      return { vertices: v, faces: f, name: '3D Pyramid' };
    } else if (presetMesh === 'helmet') {
      const v: Point3D[] = [
        { x: 0, y: 1.5, z: 0 }, { x: -1, y: 0, z: 1 }, { x: 1, y: 0, z: 1 },
        { x: 1, y: 0, z: -1 }, { x: -1, y: 0, z: -1 }, { x: 0, y: -1.5, z: 0 }
      ];
      const f: Face3D[] = [
        { v: [0, 1, 2] }, { v: [0, 2, 3] }, { v: [0, 3, 4] }, { v: [0, 4, 1] },
        { v: [5, 2, 1] }, { v: [5, 3, 2] }, { v: [5, 4, 3] }, { v: [5, 1, 4] }
      ];
      return { vertices: v, faces: f, name: 'Cyber Core Polyhedron' };
    } else {
      const v: Point3D[] = [];
      const f: Face3D[] = [];
      const R = 1.2, r = 0.5, segR = 16, segR2 = 12;
      for (let i = 0; i < segR; i++) {
        const u = (i / segR) * Math.PI * 2;
        for (let j = 0; j < segR2; j++) {
          const vAngle = (j / segR2) * Math.PI * 2;
          const x = (R + r * Math.cos(vAngle)) * Math.cos(u);
          const y = r * Math.sin(vAngle);
          const z = (R + r * Math.cos(vAngle)) * Math.sin(u);
          v.push({ x, y, z });
        }
      }
      for (let i = 0; i < segR; i++) {
        for (let j = 0; j < segR2; j++) {
          const nextI = (i + 1) % segR;
          const nextJ = (j + 1) % segR2;
          const idx1 = i * segR2 + j;
          const idx2 = nextI * segR2 + j;
          const idx3 = nextI * segR2 + nextJ;
          const idx4 = i * segR2 + nextJ;
          f.push({ v: [idx1, idx2, idx3, idx4] });
        }
      }
      return { vertices: v, faces: f, name: '3D Torus Donut' };
    }
  }, [presetMesh, customMesh]);

  // Auto Rotation loop
  useEffect(() => {
    if (!isRotating) return;
    const interval = setInterval(() => {
      setRotation(prev => ({ ...prev, y: prev.y + 0.015 }));
    }, 30);
    return () => clearInterval(interval);
  }, [isRotating]);

  // Render 3D Scene to Canvas
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

    const mesh = getMesh();
    const scale = (zoom / 100) * 90;
    const cosX = Math.cos(rotation.x), sinX = Math.sin(rotation.x);
    const cosY = Math.cos(rotation.y), sinY = Math.sin(rotation.y);

    const projected: { x: number; y: number; z: number }[] = mesh.vertices.map(pt => {
      const x1 = pt.x * cosY - pt.z * sinY;
      const z1 = pt.x * sinY + pt.z * cosY;
      const y2 = pt.y * cosX - z1 * sinX;
      const z2 = pt.y * sinX + z1 * cosX;
      return {
        x: width / 2 + x1 * scale,
        y: height / 2 - y2 * scale,
        z: z2
      };
    });

    const sortedFaces = mesh.faces.map(face => {
      const avgZ = face.v.reduce((sum, idx) => sum + (projected[idx]?.z || 0), 0) / face.v.length;
      return { ...face, avgZ };
    }).sort((a, b) => a.avgZ - b.avgZ);

    const lightLen = Math.hypot(lightPos.x, lightPos.y, lightPos.z) || 1;
    const lx = lightPos.x / lightLen, ly = lightPos.y / lightLen, lz = lightPos.z / lightLen;

    sortedFaces.forEach(face => {
      const pts = face.v.map(i => projected[i]);
      if (pts.length < 3) return;

      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.closePath();

      if (renderMode === 'solid' || renderMode === 'normals') {
        const v0 = mesh.vertices[face.v[0]];
        const v1 = mesh.vertices[face.v[1]];
        const v2 = mesh.vertices[face.v[2]];
        const ax = v1.x - v0.x, ay = v1.y - v0.y, az = v1.z - v0.z;
        const bx = v2.x - v0.x, by = v2.y - v0.y, bz = v2.z - v0.z;
        const nx = ay * bz - az * by;
        const ny = az * bx - ax * bz;
        const nz = ax * by - ay * bx;
        const nLen = Math.hypot(nx, ny, nz) || 1;

        if (renderMode === 'normals') {
          const r = Math.floor(((nx / nLen) + 1) * 127);
          const g = Math.floor(((ny / nLen) + 1) * 127);
          const b = Math.floor(((nz / nLen) + 1) * 127);
          ctx.fillStyle = `rgb(${r},${g},${b})`;
        } else {
          const dot = Math.max(0.1, (nx / nLen) * lx + (ny / nLen) * ly + (nz / nLen) * lz);
          ctx.fillStyle = meshColor;
          ctx.globalAlpha = 0.5 + dot * 0.5;
        }
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = '#18191B';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (renderMode === 'wireframe') {
        ctx.strokeStyle = meshColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });

    if (renderMode === 'points') {
      ctx.fillStyle = '#4E8E5E';
      projected.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

  }, [zoom, rotation, renderMode, meshColor, lightPos, getMesh]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    setRotation(prev => ({
      x: prev.x + dy * 0.008,
      y: prev.y + dx * 0.008,
      z: prev.z
    }));
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => { isDragging.current = false; };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const v: Point3D[] = [];
      const f: Face3D[] = [];
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts[0] === 'v' && parts.length >= 4) {
          v.push({ x: parseFloat(parts[1]), y: parseFloat(parts[2]), z: parseFloat(parts[3]) });
        } else if (parts[0] === 'f' && parts.length >= 4) {
          const indices = parts.slice(1).map(p => parseInt(p.split('/')[0], 10) - 1);
          f.push({ v: indices });
        }
      });
      if (v.length > 0) {
        setCustomMesh({ vertices: v, faces: f, name: file.name });
      }
    };
    reader.readAsText(file);
  };

  const handleExportOBJ = () => {
    const mesh = getMesh();
    let objText = `# DomoDomo 3D Model Export - ${mesh.name}\n`;
    mesh.vertices.forEach(v => { objText += `v ${v.x.toFixed(4)} ${v.y.toFixed(4)} ${v.z.toFixed(4)}\n`; });
    mesh.faces.forEach(f => { objText += `f ${f.v.map(i => i + 1).join(' ')}\n`; });
    const blob = new Blob([objText], { type: 'text/plain' });
    triggerDownload(URL.createObjectURL(blob), `${mesh.name.toLowerCase().replace(/\s+/g, '_')}.obj`);
  };

  const activeMesh = getMesh();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-8 glass-card p-6 flex flex-col justify-between relative min-h-[460px] overflow-hidden rounded-2xl border border-[#2A2D30]">
        
        {/* Top Floating Viewport Control Toolbar */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 bg-[#18191B]/80 backdrop-blur p-2.5 rounded-xl border border-[#2A2D30]">
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-[#3C6B4D]" />
            <span className="text-xs font-bold text-slate-200">{activeMesh.name}</span>
            <span className="text-[10px] bg-[#2A2D30] text-slate-400 px-2 py-0.5 rounded-full font-mono">
              {activeMesh.vertices.length} Verts | {activeMesh.faces.length} Faces
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#111213] p-1 rounded-lg border border-[#2A2D30]">
            <button onClick={() => setZoom(z => Math.max(30, z - 15))} className="p-1.5 hover:bg-[#2A2D30] rounded text-slate-400 hover:text-white" title="Zoom Out">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono font-semibold px-2 text-emerald-400">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(250, z + 15))} className="p-1.5 hover:bg-[#2A2D30] rounded text-slate-400 hover:text-white" title="Zoom In">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => { setZoom(100); setRotation({ x: 0.4, y: 0.6, z: 0 }); }} className="p-1.5 hover:bg-[#2A2D30] rounded text-slate-400 hover:text-white" title="Reset View">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3D Canvas Viewport */}
        <div 
          className="w-full flex-1 flex items-center justify-center cursor-grab active:cursor-grabbing my-12"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <canvas ref={canvasRef} width={640} height={380} className="w-full max-w-[640px] h-[380px] rounded-xl border border-[#2A2D30]/60 shadow-2xl" />
        </div>

        {/* Bottom Orbit Bar */}
        <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-[#2A2D30]">
          <span>Drag mouse inside canvas to orbit view</span>
          <button 
            onClick={() => setIsRotating(!isRotating)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#18191B] border border-[#2A2D30] hover:text-white"
          >
            {isRotating ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            {isRotating ? 'Pause Orbit' : 'Auto Rotate'}
          </button>
        </div>
      </div>

      {/* Right Control Sidebar */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 rounded-2xl border border-[#2A2D30]">
          <h3 className="text-emerald-400 font-bold border-b border-[#2A2D30] pb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
            <Eye className="w-4 h-4" /> 3D Viewport Shader Controls
          </h3>

          {/* Preset Selector */}
          <div className="flex flex-col gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">3D Mesh Geometry</span>
            <div className="grid grid-cols-4 gap-1.5">
              {(['torus', 'cube', 'pyramid', 'helmet'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => { setPresetMesh(p); setCustomMesh(null); }}
                  className={`py-1.5 text-xs font-bold rounded-lg capitalize border ${presetMesh === p && !customMesh ? 'bg-[#3C6B4D] text-white border-[#3C6B4D]' : 'bg-[#18191B] text-slate-400 border-[#2A2D30] hover:text-white'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Shading Mode */}
          <div className="flex flex-col gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Shading Mode</span>
            <div className="grid grid-cols-2 gap-2">
              {(['solid', 'wireframe', 'points', 'normals'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setRenderMode(mode)}
                  className={`py-2 text-xs font-bold rounded-lg capitalize border flex items-center justify-center gap-1.5 ${renderMode === mode ? 'bg-[#3C6B4D] text-white border-[#3C6B4D]' : 'bg-[#18191B] text-slate-400 border-[#2A2D30] hover:text-white'}`}
                >
                  <Layers className="w-3.5 h-3.5" /> {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Color & Lighting */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-slate-400 font-semibold">Material Tint</span>
              <input type="color" value={meshColor} onChange={e => setMeshColor(e.target.value)} className="w-full h-8 rounded border border-[#2A2D30] bg-transparent cursor-pointer" />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-slate-400 font-semibold">Sun Angle</span>
              <input type="range" min="-3" max="3" step="0.5" value={lightPos.x} onChange={e => setLightPos(p => ({ ...p, x: parseFloat(e.target.value) }))} className="w-full accent-emerald-500" />
            </div>
          </div>

          {/* Custom File Import */}
          <div className="flex flex-col gap-2 pt-2 border-t border-[#2A2D30]">
            <span className="text-xs text-slate-400 font-semibold">Import Custom OBJ Mesh</span>
            <FileUploadWrapper onUpload={handleFileUpload} accept=".obj" />
          </div>

          {/* Export Action */}
          <button
            onClick={handleExportOBJ}
            className="w-full py-3 bg-[#3C6B4D] hover:bg-[#4E8E5E] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <Download className="w-4 h-4" /> Export 3D OBJ Mesh File
          </button>
        </div>
      </div>
    </div>
  );
};
