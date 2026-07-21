import { useState, useRef, useEffect } from 'react';
import { triggerDownload } from '../../utils/sharedHelpers';
import { ZoomIn, ZoomOut, RotateCcw, Download, QrCode, Sparkles } from 'lucide-react';

export const ARMarkerCardStudioTool = () => {
  const [cardTitle, setCardTitle] = useState('Cyber AR Pass');
  const [cardColor, setCardColor] = useState('#3C6B4D');
  const [zoom, setZoom] = useState(100);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render AR Marker + Floating 3D Card
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width, h = canvas.height;
    ctx.fillStyle = '#111213';
    ctx.fillRect(0, 0, w, h);

    const scale = (zoom / 100);

    // Draw AR Target Marker (Black Thick Border + Hiro Inner Box)
    const markerSize = 160 * scale;
    const mx = w / 2 - markerSize - 20 * scale;
    const my = h / 2 - markerSize / 2;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(mx, my, markerSize, markerSize);
    ctx.fillStyle = '#000000';
    ctx.fillRect(mx + 20 * scale, my + 20 * scale, markerSize - 40 * scale, markerSize - 40 * scale);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(mx + 50 * scale, my + 50 * scale, markerSize - 100 * scale, markerSize - 100 * scale);

    // Draw Floating 3D AR Card Overlay (Right Side)
    const cx = w / 2 + 20 * scale;
    const cy = h / 2 - 90 * scale;
    const cw = 200 * scale;
    const ch = 180 * scale;

    ctx.shadowColor = cardColor;
    ctx.shadowBlur = 20;
    ctx.fillStyle = cardColor;
    ctx.fillRect(cx, cy, cw, ch);
    ctx.shadowBlur = 0;

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx, cy, cw, ch);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${Math.floor(14 * scale)}px sans-serif`;
    ctx.fillText(cardTitle, cx + 15 * scale, cy + 30 * scale);

    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = `${Math.floor(10 * scale)}px sans-serif`;
    ctx.fillText('Interactive WebXR Spatial Card', cx + 15 * scale, cy + 50 * scale);

  }, [cardTitle, cardColor, zoom]);

  const handleExportPNG = () => {
    if (!canvasRef.current) return;
    triggerDownload(canvasRef.current.toDataURL('image/png'), 'ar_marker_spatial_card.png');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-8 glass-card p-6 flex flex-col justify-between rounded-2xl border border-[#2A2D30]">
        <div className="flex justify-between items-center bg-[#18191B] p-3 rounded-xl border border-[#2A2D30] z-10">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-200">AR Spatial Target Marker & 3D Card</span>
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
            <Sparkles className="w-4 h-4" /> AR Card Settings
          </h3>

          <div className="flex flex-col gap-2">
            <span className="text-xs text-slate-300 font-semibold uppercase">3D Card Header Title</span>
            <input type="text" value={cardTitle} onChange={e => setCardTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-[#18191B] border border-[#2A2D30] text-xs text-slate-200" />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs text-slate-300 font-semibold uppercase">AR Card Glow Accent</span>
            <input type="color" value={cardColor} onChange={e => setCardColor(e.target.value)} className="w-full h-8 rounded border border-[#2A2D30] bg-transparent cursor-pointer" />
          </div>

          <button onClick={handleExportPNG} className="w-full py-3 bg-[#3C6B4D] hover:bg-[#4E8E5E] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg">
            <Download className="w-4 h-4" /> Download AR Marker & Card PNG
          </button>
        </div>
      </div>
    </div>
  );
};
