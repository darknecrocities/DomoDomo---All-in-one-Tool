import { triggerDownload } from '../../utils/sharedHelpers';
import { useState, useEffect, useRef } from 'react';





export const BarcodeGeneratorTool = () => {
  const [text, setText] = useState('12345678');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    c.width = 300;
    c.height = 100;
    ctx.fillStyle = '#0B0F19';
    ctx.fillRect(0, 0, 300, 100);
    // Draw simple stripes representing Code128 mock
    ctx.fillStyle = '#4E8E5E';
    for (let i = 15; i < 285; i += 6) {
      const width = (i % 4 === 0) ? 4 : 2;
      ctx.fillRect(i, 10, width, 60);
    }
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px Courier, monospace';
    ctx.fillText(text, 110, 85);
  }, [text]);

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">Barcode Generator</h3>
      <input type="text" value={text} onChange={(e) => setText(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200" />
      <div className="flex flex-col items-center gap-3 mt-2">
        <canvas ref={canvasRef} className="rounded border border-slate-850 max-w-full h-auto" />
        <button onClick={() => canvasRef.current && triggerDownload(canvasRef.current.toDataURL('image/png'), 'barcode.png')} className="btn-primary w-full py-2 text-xs">Download Barcode</button>
      </div>
    </div>
  );
};
