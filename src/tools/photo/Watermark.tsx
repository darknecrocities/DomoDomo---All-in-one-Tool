import { FileUploadWrapper, triggerDownload } from '../../utils/sharedHelpers';
import { useState, useRef, useEffect } from 'react';
import { Download, RefreshCw, Upload } from 'lucide-react';

export const WatermarkTool = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [type, setType] = useState<'text' | 'logo'>('text');
  const [text, setText] = useState('DomoDomo Local');
  const [color, setColor] = useState('#FFFFFF');
  const [logoUrl, setLogoUrl] = useState('');
  const [position, setPosition] = useState<'top-left' | 'top-right' | 'center' | 'bottom-left' | 'bottom-right' | 'tiled'>('bottom-left');
  
  const [opacity, setOpacity] = useState(0.5);
  const [scale, setScale] = useState(6); // percentage of canvas width
  const [angle, setAngle] = useState(-30); // rotation angle
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleReset = () => {
    setType('text');
    setText('DomoDomo Local');
    setColor('#FFFFFF');
    setLogoUrl('');
    setPosition('bottom-left');
    setOpacity(0.5);
    setScale(6);
    setAngle(-30);
  };

  const getPositionCoords = (pos: string, w: number, h: number, targetW: number, targetH: number = targetW) => {
    const marginX = targetW / 2 + w * 0.04;
    const marginY = targetH / 2 + h * 0.04;
    switch (pos) {
      case 'top-left': return { x: marginX, y: marginY };
      case 'top-right': return { x: w - marginX, y: marginY };
      case 'center': return { x: w / 2, y: h / 2 };
      case 'bottom-right': return { x: w - marginX, y: h - marginY };
      case 'bottom-left':
      default:
        return { x: marginX, y: h - marginY };
    }
  };

  const renderWatermark = (ctx: CanvasRenderingContext2D, w: number, h: number, logoImg: HTMLImageElement | null) => {
    ctx.save();
    ctx.globalAlpha = opacity;

    const drawText = (x: number, y: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.fillText(text, 0, 0);
      ctx.restore();
    };

    const drawLogo = (x: number, y: number, logoW: number, logoH: number) => {
      if (!logoImg) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.drawImage(logoImg, -logoW / 2, -logoH / 2, logoW, logoH);
      ctx.restore();
    };

    if (type === 'text') {
      ctx.fillStyle = color;
      const fontSize = Math.round(w * (scale / 100));
      ctx.font = `${fontSize}px Outfit, sans-serif`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';

      if (position === 'tiled') {
        const stepX = w / 4;
        const stepY = h / 4;
        for (let x = stepX / 2; x < w; x += stepX) {
          for (let y = stepY / 2; y < h; y += stepY) {
            drawText(x, y);
          }
        }
      } else {
        const coords = getPositionCoords(position, w, h, fontSize);
        drawText(coords.x, coords.y);
      }
    } else if (type === 'logo' && logoImg) {
      const logoW = w * (scale / 100);
      const logoH = (logoW / logoImg.width) * logoImg.height;

      if (position === 'tiled') {
        const stepX = w / 4;
        const stepY = h / 4;
        for (let x = stepX / 2; x < w; x += stepX) {
          for (let y = stepY / 2; y < h; y += stepY) {
            drawLogo(x, y, logoW, logoH);
          }
        }
      } else {
        const coords = getPositionCoords(position, w, h, logoW, logoH);
        drawLogo(coords.x, coords.y, logoW, logoH);
      }
    }

    ctx.restore();
  };

  // Live preview loop
  useEffect(() => {
    if (!imageUrl) return;
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    const baseImg = new Image();
    baseImg.onload = () => {
      c.width = baseImg.width > 800 ? 800 : baseImg.width;
      c.height = (c.width / baseImg.width) * baseImg.height;
      ctx.drawImage(baseImg, 0, 0, c.width, c.height);

      if (type === 'logo' && logoUrl) {
        const logoImg = new Image();
        logoImg.onload = () => {
          renderWatermark(ctx, c.width, c.height, logoImg);
        };
        logoImg.src = logoUrl;
      } else {
        renderWatermark(ctx, c.width, c.height, null);
      }
    };
    baseImg.src = imageUrl;
  }, [imageUrl, type, text, color, logoUrl, position, opacity, scale, angle]);

  const handleDownload = () => {
    if (!imageUrl) return;
    const baseImg = new Image();
    baseImg.onload = () => {
      const outCanvas = document.createElement('canvas');
      const outCtx = outCanvas.getContext('2d');
      if (!outCtx) return;

      outCanvas.width = baseImg.width;
      outCanvas.height = baseImg.height;
      outCtx.drawImage(baseImg, 0, 0, outCanvas.width, outCanvas.height);

      if (type === 'logo' && logoUrl) {
        const logoImg = new Image();
        logoImg.onload = () => {
          renderWatermark(outCtx, outCanvas.width, outCanvas.height, logoImg);
          triggerDownload(outCanvas.toDataURL('image/jpeg'), 'watermarked.jpg');
        };
        logoImg.src = logoUrl;
      } else {
        renderWatermark(outCtx, outCanvas.width, outCanvas.height, null);
        triggerDownload(outCanvas.toDataURL('image/jpeg'), 'watermarked.jpg');
      }
    };
    baseImg.src = imageUrl;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-8 glass-card p-6 flex flex-col justify-center min-h-[350px]">
        {!imageUrl ? (
          <FileUploadWrapper onUpload={(file) => setImageUrl(URL.createObjectURL(file))} />
        ) : (
          <div className="relative mx-auto max-w-full">
            <canvas ref={canvasRef} className="max-w-full h-auto rounded border border-slate-800 shadow-xl mx-auto bg-[#0B0F19]" />
          </div>
        )}
      </div>
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-teal-400 font-bold border-b border-slate-800 pb-2 flex justify-between items-center">
            <span>Watermark Studio</span>
            {imageUrl && (
              <button onClick={handleReset} className="text-[10px] text-slate-455 hover:text-rose-450 flex items-center gap-1">
                <RefreshCw size={10} /> Reset
              </button>
            )}
          </h3>

          <div className="flex gap-2">
            <button onClick={() => setType('text')} className={`flex-1 py-1 rounded text-xs font-bold ${type === 'text' ? 'bg-[#4E8E5E] text-white' : 'bg-slate-900 text-slate-400 border border-slate-850'}`}>Text Stamp</button>
            <button onClick={() => setType('logo')} className={`flex-1 py-1 rounded text-xs font-bold ${type === 'logo' ? 'bg-[#4E8E5E] text-white' : 'bg-slate-900 text-slate-400 border border-slate-850'}`}>Logo Image</button>
          </div>

          {type === 'text' ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 uppercase font-semibold">Watermark Text</label>
                <input type="text" value={text} onChange={(e) => setText(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-200 text-xs font-medium focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 uppercase font-semibold">Text Color</label>
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full h-8 bg-transparent border border-slate-800 cursor-pointer rounded" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-slate-400 uppercase font-semibold">Upload Logo (PNG / transparent preferred)</label>
              <label className="btn-secondary cursor-pointer py-1.5 flex items-center justify-center gap-1.5 text-xs">
                <Upload size={12} /> Choose Logo Image
                <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && setLogoUrl(URL.createObjectURL(e.target.files[0]))} className="hidden" />
              </label>
              {logoUrl && <span className="text-[10px] text-emerald-400 text-center font-semibold">✓ Logo Loaded Successfully</span>}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400 uppercase font-semibold">Stamp Position</label>
            <select value={position} onChange={(e) => setPosition(e.target.value as any)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-200 text-xs font-medium focus:outline-none">
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-right">Bottom Right</option>
              <option value="top-left">Top Left</option>
              <option value="top-right">Top Right</option>
              <option value="center">Center Overlay</option>
              <option value="tiled">Tiled / Repeating Pattern</option>
            </select>
          </div>

          <div className="flex flex-col gap-3.5 border-t border-slate-850 pt-3.5">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Opacity</span>
                <span className="text-slate-300">{Math.round(opacity * 100)}%</span>
              </div>
              <input type="range" min="0.1" max="1" step="0.05" value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))} className="w-full accent-[#4E8E5E] cursor-pointer" />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Scale / Size</span>
                <span className="text-slate-300">{scale}%</span>
              </div>
              <input type="range" min="2" max="30" step="1" value={scale} onChange={(e) => setScale(parseInt(e.target.value))} className="w-full accent-[#4E8E5E] cursor-pointer" />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Rotation Angle</span>
                <span className="text-slate-300">{angle}°</span>
              </div>
              <input type="range" min="-180" max="180" step="5" value={angle} onChange={(e) => setAngle(parseInt(e.target.value))} className="w-full accent-[#4E8E5E] cursor-pointer" />
            </div>
          </div>

          {imageUrl && (
            <button onClick={handleDownload} className="btn-primary w-full text-xs mt-2 flex items-center justify-center gap-1.5">
              <Download size={14} /> Stamp & Save Image
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
