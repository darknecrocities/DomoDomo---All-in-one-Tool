import { triggerDownload } from '../../utils/sharedHelpers';
import { useState, useRef } from 'react';
import { Grid } from 'lucide-react';

export const CollageMakerTool = () => {
  const [images, setImages] = useState<string[]>([]);
  const [border, setBorder] = useState(10); // border in pixels
  const [borderColor, setBorderColor] = useState('#0B0F19');
  const [aspect, setAspect] = useState<'1:1' | '16:9' | '9:16'>('1:1');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const arr = Array.from(e.target.files).slice(0, 4).map(file => URL.createObjectURL(file));
    setImages(arr);
  };

  const drawCollage = () => {
    const c = canvasRef.current;
    if (!c || images.length === 0) return;

    let width = 800;
    let height = 800;
    if (aspect === '16:9') {
      height = 450;
    } else if (aspect === '9:16') {
      height = 1422;
    }

    c.width = width;
    c.height = height;

    const ctx = c.getContext('2d');
    if (!ctx) return;

    // Fill background with border color
    ctx.fillStyle = borderColor;
    ctx.fillRect(0, 0, width, height);

    const len = images.length;
    const loadedImgs: HTMLImageElement[] = [];
    let loadedCount = 0;

    images.forEach((url, idx) => {
      const img = new Image();
      img.onload = () => {
        loadedImgs[idx] = img;
        loadedCount++;
        if (loadedCount === len) {
          if (len === 1) {
            const innerW = width - 2 * border;
            const innerH = height - 2 * border;
            ctx.drawImage(loadedImgs[0], border, border, innerW, innerH);
          } else if (len === 2) {
            const innerW = (width - 3 * border) / 2;
            const innerH = height - 2 * border;
            ctx.drawImage(loadedImgs[0], border, border, innerW, innerH);
            ctx.drawImage(loadedImgs[1], 2 * border + innerW, border, innerW, innerH);
          } else {
            // 3 or 4 grids
            const innerW = (width - 3 * border) / 2;
            const innerH = (height - 3 * border) / 2;
            
            // Grid 1
            ctx.drawImage(loadedImgs[0], border, border, innerW, innerH);
            // Grid 2
            ctx.drawImage(loadedImgs[1], 2 * border + innerW, border, innerW, innerH);
            // Grid 3
            if (loadedImgs[2]) {
              ctx.drawImage(loadedImgs[2], border, 2 * border + innerH, innerW, innerH);
            }
            // Grid 4
            if (loadedImgs[3]) {
              ctx.drawImage(loadedImgs[3], 2 * border + innerW, 2 * border + innerH, innerW, innerH);
            }
          }
          triggerDownload(c.toDataURL('image/jpeg'), 'collage.jpg');
        }
      };
      img.src = url;
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-8 glass-card p-6 flex flex-col justify-center min-h-[350px]">
        {images.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <div className="p-4 bg-slate-900/60 rounded-full border border-slate-800 text-[#4E8E5E]">
              <Grid size={32} />
            </div>
            <label className="btn-primary cursor-pointer mt-2">
              <span>Choose up to 4 Images</span>
              <input type="file" multiple accept="image/*" onChange={handleFile} className="hidden" />
            </label>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full">
            <div className="grid grid-cols-2 gap-2 max-w-[320px] mx-auto p-2 bg-slate-950/20 border border-slate-850 rounded">
              {images.map((url, idx) => (
                <img key={idx} src={url} className="w-full h-24 object-cover rounded border border-slate-800" alt="Collage part" />
              ))}
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-2">{images.length} files selected for compilation</span>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-teal-400 font-bold border-b border-slate-800 pb-2">Collage Maker</h3>
          
          {images.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 uppercase font-semibold">Grid Layout Ratio</label>
                <select value={aspect} onChange={(e) => setAspect(e.target.value as any)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-200 text-xs font-semibold focus:outline-none">
                  <option value="1:1">Square Grid (1:1)</option>
                  <option value="16:9">Landscape Grid (16:9)</option>
                  <option value="9:16">Portrait Grid (9:16)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Border Thickness</span>
                  <span className="text-slate-350">{border}px</span>
                </div>
                <input type="range" min="0" max="40" value={border} onChange={(e) => setBorder(parseInt(e.target.value))} className="w-full accent-[#4E8E5E] cursor-pointer" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-400 uppercase font-semibold">Border Color</label>
                <input type="color" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} className="w-full h-8 bg-transparent border border-slate-800 cursor-pointer rounded" />
              </div>

              <div className="flex flex-col gap-2 border-t border-slate-850 pt-3">
                <button onClick={drawCollage} className="btn-primary w-full text-xs">Compile & Save Collage</button>
                <button onClick={() => setImages([])} className="btn-secondary w-full text-xs">Clear Grid Selection</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
