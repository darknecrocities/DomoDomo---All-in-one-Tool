import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { useState, useRef, useEffect } from 'react';
import { Grid, Trash2, Download, RefreshCw, Layout, ShieldAlert } from 'lucide-react';

export const CollageMakerTool = () => {
  const [images, setImages] = useState<string[]>([]);
  const [border, setBorder] = useState<number>(10);
  const [borderColor, setBorderColor] = useState<string>('#0B0F19');
  const [aspect, setAspect] = useState<'1:1' | '16:9' | '9:16' | '4:3'>('1:1');
  const [loading, setLoading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArr = Array.from(e.target.files).slice(0, 6);
    const urls = filesArr.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...urls].slice(0, 6));
  };

  // Draw and update the collage canvas preview in real-time
  const updateCollageCanvas = () => {
    const c = canvasRef.current;
    if (!c || images.length === 0) return;

    let width = 800;
    let height = 800;

    if (aspect === '16:9') {
      height = 450;
    } else if (aspect === '9:16') {
      height = 1422;
    } else if (aspect === '4:3') {
      height = 600;
    }

    c.width = width;
    c.height = height;

    const ctx = c.getContext('2d');
    if (!ctx) return;

    // Fill background border
    ctx.fillStyle = borderColor;
    ctx.fillRect(0, 0, width, height);

    const len = images.length;
    const loadedImgs: HTMLImageElement[] = [];
    let loadedCount = 0;

    images.forEach((url, idx) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        loadedImgs[idx] = img;
        loadedCount++;
        if (loadedCount === len) {
          // Draw layout depending on count
          if (len === 1) {
            drawImgFit(ctx, loadedImgs[0], border, border, width - 2 * border, height - 2 * border);
          } else if (len === 2) {
            // Side-by-side or top-bottom depending on aspect ratio
            const isVertical = aspect === '9:16';
            if (isVertical) {
              const innerW = width - 2 * border;
              const innerH = (height - 3 * border) / 2;
              drawImgFit(ctx, loadedImgs[0], border, border, innerW, innerH);
              drawImgFit(ctx, loadedImgs[1], border, 2 * border + innerH, innerW, innerH);
            } else {
              const innerW = (width - 3 * border) / 2;
              const innerH = height - 2 * border;
              drawImgFit(ctx, loadedImgs[0], border, border, innerW, innerH);
              drawImgFit(ctx, loadedImgs[1], 2 * border + innerW, border, innerW, innerH);
            }
          } else if (len === 3) {
            // 1 main column, 2 stacked columns
            const innerW = (width - 3 * border) / 2;
            const innerH1 = height - 2 * border;
            const innerH2 = (height - 3 * border) / 2;

            drawImgFit(ctx, loadedImgs[0], border, border, innerW, innerH1);
            drawImgFit(ctx, loadedImgs[1], 2 * border + innerW, border, innerW, innerH2);
            drawImgFit(ctx, loadedImgs[2], 2 * border + innerW, 2 * border + innerH2, innerW, innerH2);
          } else if (len === 4) {
            // 2x2 grid
            const innerW = (width - 3 * border) / 2;
            const innerH = (height - 3 * border) / 2;
            drawImgFit(ctx, loadedImgs[0], border, border, innerW, innerH);
            drawImgFit(ctx, loadedImgs[1], 2 * border + innerW, border, innerW, innerH);
            drawImgFit(ctx, loadedImgs[2], border, 2 * border + innerH, innerW, innerH);
            drawImgFit(ctx, loadedImgs[3], 2 * border + innerW, 2 * border + innerH, innerW, innerH);
          } else if (len === 5) {
            // 2 large columns, 3 footer columns
            const innerW2 = (width - 3 * border) / 2;
            const innerH2 = (height * 0.6) - border;
            const innerW3 = (width - 4 * border) / 3;
            const innerH3 = (height * 0.4) - 2 * border;

            drawImgFit(ctx, loadedImgs[0], border, border, innerW2, innerH2);
            drawImgFit(ctx, loadedImgs[1], 2 * border + innerW2, border, innerW2, innerH2);

            drawImgFit(ctx, loadedImgs[2], border, 2 * border + innerH2, innerW3, innerH3);
            drawImgFit(ctx, loadedImgs[3], 2 * border + innerW3, 2 * border + innerH2, innerW3, innerH3);
            drawImgFit(ctx, loadedImgs[4], 3 * border + 2 * innerW3, 2 * border + innerH2, innerW3, innerH3);
          } else if (len === 6) {
            // 3x2 grid
            const innerW = (width - 4 * border) / 3;
            const innerH = (height - 3 * border) / 2;
            
            drawImgFit(ctx, loadedImgs[0], border, border, innerW, innerH);
            drawImgFit(ctx, loadedImgs[1], 2 * border + innerW, border, innerW, innerH);
            drawImgFit(ctx, loadedImgs[2], 3 * border + 2 * innerW, border, innerW, innerH);

            drawImgFit(ctx, loadedImgs[3], border, 2 * border + innerH, innerW, innerH);
            drawImgFit(ctx, loadedImgs[4], 2 * border + innerW, 2 * border + innerH, innerW, innerH);
            drawImgFit(ctx, loadedImgs[5], 3 * border + 2 * innerW, 2 * border + innerH, innerW, innerH);
          }
        }
      };
      img.src = url;
    });
  };

  // Helper to draw image object-fit cover inside canvas coordinates
  const drawImgFit = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number
  ) => {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    const imgRatio = img.width / img.height;
    const targetRatio = w / h;

    let drawW = w;
    let drawH = h;
    let drawX = x;
    let drawY = y;

    if (imgRatio > targetRatio) {
      drawW = h * imgRatio;
      drawX = x - (drawW - w) / 2;
    } else {
      drawH = w / imgRatio;
      drawY = y - (drawH - h) / 2;
    }

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.restore();
  };

  // Update canvas on parameter updates
  useEffect(() => {
    updateCollageCanvas();
  }, [images, border, borderColor, aspect]);

  const handleDownload = () => {
    const c = canvasRef.current;
    if (!c || images.length === 0) return;
    setLoading(true);
    try {
      c.toBlob((blob) => {
        if (blob) {
          triggerBlobDownload(blob, 'collage.jpg');
        }
        setLoading(false);
      }, 'image/jpeg', 0.95);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Visual Preview Workspace */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden">
          {/* Abstract Grid background */}
          <div className="absolute inset-0 z-0 bg-[#0B0F19]" style={{
            backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)',
            backgroundSize: '16px 16px'
          }} />

          {images.length === 0 ? (
            <div className="z-10 flex flex-col items-center gap-3 py-10">
              <div className="p-4 bg-slate-900/80 rounded-full border border-slate-800 text-[#4E8E5E]">
                <Grid size={32} />
              </div>
              <label className="btn-primary cursor-pointer mt-2">
                <span>Upload Photos</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFile}
                  className="hidden"
                />
              </label>
              <p className="text-slate-500 text-xs">Supports up to 6 image files</p>
            </div>
          ) : (
            <div className="z-10 w-full flex flex-col items-center gap-4">
              {/* Responsive preview of the collage canvas */}
              <div className="relative max-w-full max-h-[420px] overflow-hidden border border-slate-800 rounded-2xl bg-slate-950/20 shadow-2xl p-1.5 flex items-center justify-center">
                <canvas ref={canvasRef} className="max-w-full max-h-[380px] object-contain rounded-xl" />
              </div>

              <div className="flex gap-2">
                <label className="btn-secondary text-xs cursor-pointer">
                  <span>Add images</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFile}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => setImages([])}
                  className="btn-secondary text-xs text-rose-400"
                >
                  <Trash2 size={14} />
                  <span>Clear grid</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Control Panel */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5">
          <div className="flex items-center gap-2 text-teal-400 font-semibold border-b border-slate-800 pb-3">
            <Layout size={18} />
            <span>Collage Settings</span>
          </div>

          {images.length > 0 ? (
            <div className="flex flex-col gap-4">
              {/* Aspect Ratio selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-400 uppercase font-semibold">Grid Ratio</label>
                <select
                  value={aspect}
                  onChange={(e) => setAspect(e.target.value as any)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none"
                >
                  <option value="1:1">Square (1:1)</option>
                  <option value="4:3">Standard (4:3)</option>
                  <option value="16:9">Wide Landscape (16:9)</option>
                  <option value="9:16">Mobile Portrait (9:16)</option>
                </select>
              </div>

              {/* Border slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">Border Spacing</span>
                  <span className="text-teal-400 font-semibold">{border}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={border}
                  onChange={(e) => setBorder(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#4E8E5E]"
                />
              </div>

              {/* Color picker */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-400 uppercase font-semibold">Border Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={borderColor}
                    onChange={(e) => setBorderColor(e.target.value)}
                    className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <span className="text-xs text-slate-350 font-mono uppercase">{borderColor}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={handleDownload}
                  disabled={loading}
                  className="btn-primary w-full py-3"
                >
                  {loading ? <RefreshCw className="animate-spin" size={18} /> : <Download size={18} />}
                  <span>{loading ? 'Compiling...' : 'Save Collage JPEG'}</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload photos on the workspace area to configure custom grids, margins, and layouts.
            </p>
          )}
        </div>

        {/* Local Processing Banner */}
        <div className="bg-[#151C2C]/50 border border-slate-800 rounded-2xl p-4 flex gap-3 text-slate-400 text-left">
          <ShieldAlert size={20} className="text-[#4E8E5E] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-slate-300">100% In-Browser Rendering</span>
            <span className="text-[10px] leading-relaxed">Images are loaded as local graphic nodes and stitched dynamically inside canvas memory arrays.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
