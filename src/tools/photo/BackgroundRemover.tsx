import { FileUploadWrapper, triggerDownload } from '../../utils/sharedHelpers';
import React, { useState, useRef, useEffect } from 'react';
import { Download, Upload } from 'lucide-react';

export const BackgroundRemoverTool = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [tolerance, setTolerance] = useState(32);
  const [brushSize, setBrushSize] = useState(20);
  const [activeTool, setActiveTool] = useState<'key' | 'eraser'>('key');
  const [selectedColor, setSelectedColor] = useState<{r:number, g:number, b:number} | null>(null);
  
  // Background replacement settings
  const [bgMode, setBgMode] = useState<'transparent' | 'color' | 'image'>('transparent');
  const [bgColor, setBgColor] = useState('#4E8E5E');
  const [bgImageUrl, setBgImageUrl] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const origCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.onload = () => {
      const c = canvasRef.current;
      const oc = origCanvasRef.current;
      if (!c || !oc) return;
      c.width = img.width > 800 ? 800 : img.width;
      c.height = (c.width / img.width) * img.height;
      oc.width = c.width;
      oc.height = c.height;
      c.getContext('2d')?.drawImage(img, 0, 0, c.width, c.height);
      oc.getContext('2d')?.drawImage(img, 0, 0, c.width, c.height);
      applyChromaKey();
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const applyChromaKey = () => {
    const c = canvasRef.current;
    const oc = origCanvasRef.current;
    if (!c || !oc) return;
    const ctx = c.getContext('2d');
    const octx = oc.getContext('2d');
    if (!ctx || !octx) return;

    // 1. Get original image data from origCanvas
    const imgData = octx.getImageData(0, 0, c.width, c.height);
    const data = imgData.data;

    // 2. Perform keying if selected
    if (selectedColor) {
      const { r: kr, g: kg, b: kb } = selectedColor;
      for (let i = 0; i < data.length; i += 4) {
        const dist = Math.sqrt((data[i]-kr)**2 + (data[i+1]-kg)**2 + (data[i+2]-kb)**2);
        if (dist < tolerance) data[i+3] = 0;
      }
    }

    // 3. Render background on canvas
    ctx.clearRect(0, 0, c.width, c.height);
    
    if (bgMode === 'color') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, c.width, c.height);
    } else if (bgMode === 'image' && bgImageUrl) {
      const bgImg = new Image();
      bgImg.onload = () => {
        ctx.drawImage(bgImg, 0, 0, c.width, c.height);
        // Draw the keyed transparency overlay
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = c.width;
        tempCanvas.height = c.height;
        tempCanvas.getContext('2d')?.putImageData(imgData, 0, 0);
        ctx.drawImage(tempCanvas, 0, 0);
      };
      bgImg.src = bgImageUrl;
      return;
    }

    // Draw transparent cutout directly
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = c.width;
    tempCanvas.height = c.height;
    tempCanvas.getContext('2d')?.putImageData(imgData, 0, 0);
    ctx.drawImage(tempCanvas, 0, 0);
  };

  useEffect(() => {
    applyChromaKey();
  }, [selectedColor, tolerance, bgMode, bgColor, bgImageUrl]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== 'key') return;
    const c = canvasRef.current;
    if (!c) return;
    const rect = c.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * c.width;
    const y = ((e.clientY - rect.top) / rect.height) * c.height;
    const pixel = c.getContext('2d')?.getImageData(x, y, 1, 1).data;
    if (pixel) setSelectedColor({ r: pixel[0], g: pixel[1], b: pixel[2] });
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || activeTool !== 'eraser') return;
    const c = canvasRef.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    const rect = c.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * c.width;
    const y = ((e.clientY - rect.top) / rect.height) * c.height;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-8 glass-card p-6 flex flex-col justify-center min-h-[350px] relative overflow-hidden">
        <div className="absolute inset-0 bg-[#0B0F19]" style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
        {!imageUrl ? (
          <FileUploadWrapper onUpload={(file) => { setImageUrl(URL.createObjectURL(file)); }} />
        ) : (
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseDown={(e) => { if (activeTool === 'eraser') { isDrawing.current = true; draw(e); } }}
            onMouseMove={draw}
            onMouseUp={() => { isDrawing.current = false; }}
            className="z-10 max-w-full h-auto rounded border border-slate-800 shadow-xl cursor-crosshair mx-auto bg-checkered"
          />
        )}
        <canvas ref={origCanvasRef} className="hidden" />
      </div>

      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-teal-400 font-bold border-b border-slate-800 pb-2">Background Remover</h3>
          
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Mask Controls</span>
          <div className="flex gap-2">
            <button onClick={() => setActiveTool('key')} className={`flex-1 py-1.5 rounded text-xs font-bold ${activeTool === 'key' ? 'bg-[#4E8E5E] text-white' : 'bg-slate-900 text-slate-450 border border-slate-850'}`}>Chroma Key</button>
            <button onClick={() => setActiveTool('eraser')} className={`flex-1 py-1.5 rounded text-xs font-bold ${activeTool === 'eraser' ? 'bg-[#4E8E5E] text-white' : 'bg-slate-900 text-slate-450 border border-slate-850'}`}>Eraser Brush</button>
          </div>

          {activeTool === 'key' ? (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs"><span className="text-slate-400">Match Tolerance</span><span className="text-slate-300">{tolerance}</span></div>
              <input type="range" min="5" max="150" value={tolerance} onChange={(e) => setTolerance(parseInt(e.target.value))} className="w-full accent-[#4E8E5E]" />
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs"><span className="text-slate-400">Brush Size</span><span className="text-slate-300">{brushSize}px</span></div>
              <input type="range" min="5" max="80" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="w-full accent-[#4E8E5E]" />
            </div>
          )}

          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-2 border-t border-slate-850 pt-3">Background Mode</span>
          <div className="grid grid-cols-3 gap-1">
            {(['transparent', 'color', 'image'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setBgMode(m)}
                className={`py-1 rounded text-[10px] font-bold ${bgMode === m ? 'bg-[#4E8E5E] text-white' : 'bg-slate-900 text-slate-450 border border-slate-850'}`}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>

          {bgMode === 'color' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-semibold uppercase">Color Fill</label>
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full h-8 bg-transparent border border-slate-800 cursor-pointer rounded" />
            </div>
          )}

          {bgMode === 'image' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-semibold uppercase">Upload Background</label>
              <label className="btn-secondary cursor-pointer py-1.5 flex items-center justify-center gap-1 text-xs">
                <Upload size={12} /> Choose Image
                <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && setBgImageUrl(URL.createObjectURL(e.target.files[0]))} className="hidden" />
              </label>
            </div>
          )}

          {imageUrl && (
            <button onClick={() => canvasRef.current && triggerDownload(canvasRef.current.toDataURL('image/png'), 'no_bg.png')} className="btn-primary w-full text-xs mt-3 flex items-center justify-center gap-1">
              <Download size={14} /> Download Final Image
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
