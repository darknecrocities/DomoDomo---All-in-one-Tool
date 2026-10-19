import React, { useState, useRef } from 'react';
import {
  Scissors,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Plus,
  Trash2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import {
  type ClipPoint,
  PRESET_SHAPES,
  formatClipPathCss,
  formatTailwindClipPath,
  formatSvgClipPath,
} from './clipPathHelper';

export const PRESETS = PRESET_SHAPES;
export type { ClipPoint };
export { PRESET_SHAPES, formatClipPathCss, formatTailwindClipPath, formatSvgClipPath };

export const CssClipPathStudioTool: React.FC = () => {
  const [points, setPoints] = useState<ClipPoint[]>([
    { id: 'p0', x: 25, y: 0 },
    { id: 'p1', x: 75, y: 0 },
    { id: 'p2', x: 100, y: 50 },
    { id: 'p3', x: 75, y: 100 },
    { id: 'p4', x: 25, y: 100 },
    { id: 'p5', x: 0, y: 50 },
  ]);
  const [activePointId, setActivePointId] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1.0);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [bgType, setBgType] = useState<'gradient' | 'gold' | 'monochrome'>('gradient');

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef<string | null>(null);

  const loadPreset = (key: string) => {
    const preset = PRESETS[key];
    if (preset) {
      setPoints(preset.points.map((pt, idx) => ({ id: `p${idx}`, x: pt.x, y: pt.y })));
      setActivePointId(null);
    }
  };

  const clipPathCss = formatClipPathCss(points);
  const tailwindClass = formatTailwindClipPath(points);
  const svgClipPath = formatSvgClipPath(points);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleMouseDown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePointId(id);
    draggingRef.current = id;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggingRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = ((e.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.round(Math.max(0, Math.min(100, rawX)));
    const clampedY = Math.round(Math.max(0, Math.min(100, rawY)));

    setPoints((prev) =>
      prev.map((pt) => (pt.id === draggingRef.current ? { ...pt, x: clampedX, y: clampedY } : pt))
    );
  };

  const handleMouseUp = () => {
    draggingRef.current = null;
  };

  const handleAddPoint = () => {
    const newId = `p${Date.now()}`;
    setPoints((prev) => [...prev, { id: newId, x: 50, y: 50 }]);
    setActivePointId(newId);
  };

  const handleDeleteActivePoint = () => {
    if (!activePointId || points.length <= 3) return;
    setPoints((prev) => prev.filter((p) => p.id !== activePointId));
    setActivePointId(null);
  };

  const polygonSvgPoints = points.map((p) => `${p.x * 3.4},${p.y * 3.4}`).join(' ');

  return (
    <div className="flex flex-col gap-6 text-left max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2A2D30] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#A3A09B] uppercase tracking-wider mb-1">
            <span>Design & UI Suite</span>
            <span>/</span>
            <span className="text-white">Vector Canvas</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Scissors className="text-[#D4AF37]" size={24} />
            <span>CSS Clip-Path & Polygon Studio</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Visual vector polygon and shape clipping studio with live vertex coordinates and CSS export.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleCopy(clipPathCss, 'css')}
            className="px-3 py-2 bg-[#18191B] border border-[#2A2D30] hover:bg-[#2A2D30] text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            {copiedType === 'css' ? <Check size={14} className="text-[#D4AF37]" /> : <Copy size={14} />}
            <span>{copiedType === 'css' ? 'Copied CSS' : 'Copy CSS'}</span>
          </button>
          <button
            type="button"
            onClick={() => handleCopy(tailwindClass, 'tailwind')}
            className="px-4 py-2 bg-white text-black hover:bg-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg"
          >
            {copiedType === 'tailwind' ? <Check size={14} /> : <Copy size={14} />}
            <span>Copy Tailwind</span>
          </button>
        </div>
      </div>

      {/* Preset Geometry Selector */}
      <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold text-[#ECEBE9] flex items-center gap-1.5 uppercase tracking-wider">
          <Sparkles size={14} className="text-[#D4AF37]" />
          <span>Geometric Presets</span>
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {Object.entries(PRESETS).map(([key, item]) => (
            <button
              key={key}
              type="button"
              onClick={() => loadPreset(key)}
              className="px-3 py-1.5 bg-[#111213] border border-[#2A2D30] hover:border-[#D4AF37] text-white rounded-xl text-xs font-medium transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Interactive Vector Canvas */}
        <div className="lg:col-span-8 bg-[#111213] border border-[#2A2D30] rounded-3xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#2A2D30] pb-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                Interactive Canvas (Drag Vertices)
              </span>
              <span className="text-[#A3A09B] font-mono bg-[#18191B] px-2 py-0.5 rounded border border-[#2A2D30]">
                {Math.round(scale * 100)}%
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setScale((s) => Math.max(s - 0.15, 0.5))}
                className="p-1.5 bg-[#18191B] border border-[#2A2D30] rounded-lg hover:bg-[#2A2D30] text-slate-300"
                title="Zoom Out"
              >
                <ZoomOut size={15} />
              </button>
              <button
                type="button"
                onClick={() => setScale(1.0)}
                className="p-1.5 bg-[#18191B] border border-[#2A2D30] rounded-lg hover:bg-[#2A2D30] text-slate-300"
                title="Reset Zoom"
              >
                <RotateCcw size={15} />
              </button>
              <button
                type="button"
                onClick={() => setScale((s) => Math.min(s + 0.15, 2.0))}
                className="p-1.5 bg-[#18191B] border border-[#2A2D30] rounded-lg hover:bg-[#2A2D30] text-slate-300"
                title="Zoom In"
              >
                <ZoomIn size={15} />
              </button>
            </div>
          </div>

          {/* Canvas Box */}
          <div className="w-full bg-[#0D0D0D] border border-[#2A2D30] rounded-2xl p-6 flex items-center justify-center overflow-auto min-h-[420px]">
            <div
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
                transition: 'transform 0.1s ease',
              }}
            >
              <div
                ref={canvasRef}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className="relative w-[340px] h-[340px] border border-[#2A2D30] rounded-xl select-none"
                style={{
                  backgroundImage: showGrid
                    ? 'radial-gradient(circle, #2A2D30 1px, transparent 1px)'
                    : 'none',
                  backgroundSize: '20px 20px',
                }}
              >
                {/* SVG Polygon Outline */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <polygon
                    points={polygonSvgPoints}
                    fill={
                      bgType === 'gradient'
                        ? 'url(#clipGrad)'
                        : bgType === 'gold'
                        ? '#D4AF37'
                        : '#ECEBE9'
                    }
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    fillOpacity="0.85"
                  />
                  <defs>
                    <linearGradient id="clipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#18191B" />
                      <stop offset="50%" stopColor="#2A2D30" />
                      <stop offset="100%" stopColor="#D4AF37" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Draggable Vertex Control Handles */}
                {points.map((pt, idx) => {
                  const isActive = activePointId === pt.id;
                  return (
                    <div
                      key={pt.id}
                      onMouseDown={(e) => handleMouseDown(pt.id, e)}
                      className={`absolute w-5 h-5 -ml-2.5 -mt-2.5 rounded-full cursor-grab active:cursor-grabbing border-2 flex items-center justify-center font-mono text-[9px] font-bold shadow-md transition-transform ${
                        isActive
                          ? 'bg-white border-amber-400 text-black scale-125 z-30'
                          : 'bg-[#18191B] border-white text-white hover:scale-110 z-20'
                      }`}
                      style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                    >
                      {idx + 1}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-[#A3A09B]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddPoint}
                className="py-1.5 px-3 bg-[#18191B] border border-[#2A2D30] hover:bg-[#2A2D30] text-white rounded-xl font-semibold flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Add Vertex</span>
              </button>
              <button
                type="button"
                onClick={handleDeleteActivePoint}
                disabled={!activePointId || points.length <= 3}
                className="py-1.5 px-3 bg-[#18191B] border border-[#2A2D30] hover:bg-red-500/10 hover:border-red-500/30 text-red-400 rounded-xl font-semibold flex items-center gap-1.5 disabled:opacity-30"
              >
                <Trash2 size={14} />
                <span>Delete Selected</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px]">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="rounded accent-white"
                />
                <span>Snapping Grid</span>
              </label>

              <select
                value={bgType}
                onChange={(e) => setBgType(e.target.value as any)}
                className="bg-[#18191B] border border-[#2A2D30] text-white rounded-lg px-2 py-1 text-[11px]"
              >
                <option value="gradient">Panda Gradient</option>
                <option value="gold">Gold Foil</option>
                <option value="monochrome">Pure White</option>
              </select>
            </div>
          </div>
        </div>

        {/* Vertex Coordinate Table & Code Inspector */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Coordinates Table */}
          <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-4 flex flex-col gap-3">
            <span className="font-bold text-[#ECEBE9] text-xs uppercase tracking-wider">
              Vertex Coordinates ({points.length} Nodes)
            </span>
            <div className="overflow-auto max-h-[220px] rounded-xl border border-[#2A2D30]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#111213] text-[#A3A09B] text-[10px] uppercase font-bold sticky top-0 border-b border-[#2A2D30]">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">X (%)</th>
                    <th className="py-2 px-3">Y (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2D30]/60 font-mono text-slate-300">
                  {points.map((pt, idx) => (
                    <tr
                      key={pt.id}
                      onClick={() => setActivePointId(pt.id)}
                      className={`cursor-pointer hover:bg-[#111213] ${
                        activePointId === pt.id ? 'bg-[#2A2D30]/60 text-white font-bold' : ''
                      }`}
                    >
                      <td className="py-1.5 px-3 text-[#D4AF37]">{idx + 1}</td>
                      <td className="py-1.5 px-3">{pt.x}%</td>
                      <td className="py-1.5 px-3">{pt.y}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Generated Code Blocks */}
          <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-4 flex flex-col gap-3">
            <span className="font-bold text-[#ECEBE9] text-xs uppercase tracking-wider">Export Syntax</span>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase text-slate-400 font-bold">Standard CSS</span>
                <pre className="p-2.5 bg-[#111213] border border-[#2A2D30] rounded-xl text-[11px] font-mono text-white overflow-x-auto">
                  {clipPathCss}
                </pre>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase text-slate-400 font-bold">SVG clipPath</span>
                <pre className="p-2.5 bg-[#111213] border border-[#2A2D30] rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap">
                  {svgClipPath}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Security */}
      <div className="flex items-center gap-2 p-3 bg-[#18191B] border border-[#2A2D30] rounded-xl text-[11px] text-[#A3A09B]">
        <ShieldCheck size={16} className="text-[#D4AF37] shrink-0" />
        <span>100% Client-side vector mathematics. Real-time GPU accelerated CSS polygon rendering.</span>
      </div>
    </div>
  );
};
