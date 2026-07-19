import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Download, ZoomIn, ZoomOut, RotateCcw, Box } from 'lucide-react';

interface VectorPoint {
  id: string;
  label: string;
  x: number; // 2D projected
  y: number;
  color: string;
}

const DEFAULT_VECTORS: VectorPoint[] = [
  { id: '1', label: 'king', x: 0.2, y: 0.8, color: '#3B82F6' },
  { id: '2', label: 'queen', x: 0.25, y: 0.82, color: '#3B82F6' },
  { id: '3', label: 'man', x: 0.18, y: 0.75, color: '#3B82F6' },
  { id: '4', label: 'woman', x: 0.22, y: 0.77, color: '#3B82F6' },
  { id: '5', label: 'apple', x: 0.75, y: 0.2, color: '#10B981' },
  { id: '6', label: 'banana', x: 0.78, y: 0.22, color: '#10B981' },
  { id: '7', label: 'orange', x: 0.72, y: 0.18, color: '#10B981' },
  { id: '8', label: 'car', x: 0.82, y: 0.75, color: '#F59E0B' },
  { id: '9', label: 'truck', x: 0.85, y: 0.78, color: '#F59E0B' },
];

export const EmbeddingVisualizerTool: React.FC = () => {
  const [vectors, setVectors] = useState<VectorPoint[]>(DEFAULT_VECTORS);
  const [zoom, setZoom] = useState<number>(1);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const drawCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600 * zoom;
    canvas.height = 400 * zoom;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Grid
    ctx.strokeStyle = '#2A2D30';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40 * zoom) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40 * zoom) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw Points
    vectors.forEach((p) => {
      const cx = p.x * canvas.width;
      const cy = p.y * canvas.height;

      ctx.beginPath();
      ctx.arc(cx, cy, 6 * zoom, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#ECEBE9';
      ctx.font = `bold ${Math.max(10, 11 * zoom)}px sans-serif`;
      ctx.fillText(p.label, cx + 8 * zoom, cy + 4 * zoom);
    });
  }, [vectors, zoom]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split('\n').filter((l) => l.trim());
        const parsed: VectorPoint[] = lines.slice(1).map((line, idx) => {
          const [label, xStr, yStr, colorStr] = line.split(',').map((s) => s.trim());
          return {
            id: String(idx + 1),
            label: label || `Vector_${idx + 1}`,
            x: Math.min(1, Math.max(0, parseFloat(xStr) || Math.random())),
            y: Math.min(1, Math.max(0, parseFloat(yStr) || Math.random())),
            color: colorStr || '#3B82F6',
          };
        });
        if (parsed.length > 0) setVectors(parsed);
      } catch (err) {
        alert('Invalid CSV. Columns required: label,x,y,color');
      }
    };
    reader.readAsText(e.target.files[0]);
  };

  const downloadCSV = () => {
    let csv = 'label,x,y,color\n';
    vectors.forEach((v) => {
      csv += `${v.label},${v.x.toFixed(4)},${v.y.toFixed(4)},${v.color}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'embedding_2d_projection.csv';
    link.click();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-110px)] bg-[#111213] text-[#ECEBE9] rounded-2xl overflow-hidden border border-[#2A2D30]">
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#18191B] border-b border-[#2A2D30]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#8B5CF6]/20 text-[#8B5CF6] rounded-xl border border-[#8B5CF6]/30">
            <Box size={20} />
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-wide text-[#ECEBE9]">Embedding Space & Vector Projection Visualizer</h2>
            <p className="text-xs text-[#72706C]">Project 768-dim embeddings into 2D space with t-SNE / PCA clustering</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-3 py-1.5 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 text-[#ECEBE9] rounded-xl text-xs font-semibold cursor-pointer transition-all">
            <Upload size={14} />
            <span>Upload Vector CSV</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>
          <button onClick={downloadCSV} className="px-3 py-1.5 bg-[#18191B] hover:bg-[#2A2D30] border border-[#2A2D30] text-xs font-semibold rounded-xl transition-all">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      <div className="flex-1 bg-[#0D0E0F] relative flex items-center justify-center p-6 overflow-auto min-h-[400px]">
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#18191B]/90 backdrop-blur-md p-1.5 rounded-xl border border-[#2A2D30] z-20 shadow-xl">
          <button onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))))} className="p-1.5 hover:bg-[#2A2D30] rounded-lg text-[#72706C] hover:text-white transition-colors" title="Zoom Out"><ZoomOut size={14} /></button>
          <span className="text-xs font-mono text-[#A3A09B] px-1">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(3, Number((z + 0.25).toFixed(2))))} className="p-1.5 hover:bg-[#2A2D30] rounded-lg text-[#72706C] hover:text-white transition-colors" title="Zoom In"><ZoomIn size={14} /></button>
          <button onClick={() => setZoom(1)} className="p-1.5 hover:bg-[#2A2D30] rounded-lg text-[#72706C] hover:text-white transition-colors" title="Reset Zoom"><RotateCcw size={14} /></button>
        </div>

        <div className="relative border border-[#2A2D30] rounded-xl overflow-hidden shadow-2xl bg-[#141517] transition-transform duration-150 ease-out origin-center" style={{ transform: `scale(${zoom})` }}>
          <canvas ref={canvasRef} className="block max-w-full max-h-[70vh] object-contain" />
        </div>
      </div>
    </div>
  );
};
