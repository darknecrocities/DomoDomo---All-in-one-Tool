import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { useState, useRef, useEffect } from 'react';
import { Grid, Trash2, Download, RefreshCw, Layout, ShieldAlert } from 'lucide-react';

interface CollageTemplate {
  id: string;
  name: string;
  slots: number;
}

const TEMPLATES: CollageTemplate[] = [
  { id: 'grid-2x2', name: '2x2 Grid', slots: 4 },
  { id: 'rows-3', name: '3 Rows', slots: 3 },
  { id: 'cols-3', name: '3 Columns', slots: 3 },
  { id: 'left-main', name: 'Left Focus', slots: 3 },
  { id: 'top-main', name: 'Top Focus', slots: 3 },
  { id: 't-shape', name: 'T-Shape Grid', slots: 4 },
  { id: 'grid-3x2', name: '3x2 Grid', slots: 6 },
  { id: 'split-3-right', name: 'Asymmetric 4', slots: 4 },
  { id: 'cols-4', name: '4 Columns', slots: 4 },
  { id: 'mixed-5', name: 'Mixed 5-Grid', slots: 5 }
];

export const CollageMakerTool = () => {
  const [images, setImages] = useState<string[]>([]);
  const [border, setBorder] = useState<number>(10);
  const [borderColor, setBorderColor] = useState<string>('#0B0F19');
  const [aspect, setAspect] = useState<'1:1' | '16:9' | '9:16' | '4:3'>('1:1');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('grid-2x2');
  const [loading, setLoading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArr = Array.from(e.target.files).slice(0, 10);
    const urls = filesArr.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...urls].slice(0, 10));
  };

  const getTemplateBoxes = (templateId: string, width: number, height: number, border: number) => {
    switch (templateId) {
      case 'grid-2x2': {
        const w = (width - 3 * border) / 2;
        const h = (height - 3 * border) / 2;
        return [
          { x: border, y: border, w, h },
          { x: 2 * border + w, y: border, w, h },
          { x: border, y: 2 * border + h, w, h },
          { x: 2 * border + w, y: 2 * border + h, w, h }
        ];
      }
      case 'rows-3': {
        const w = width - 2 * border;
        const h = (height - 4 * border) / 3;
        return [
          { x: border, y: border, w, h },
          { x: border, y: 2 * border + h, w, h },
          { x: border, y: 3 * border + 2 * h, w, h }
        ];
      }
      case 'cols-3': {
        const w = (width - 4 * border) / 3;
        const h = height - 2 * border;
        return [
          { x: border, y: border, w, h },
          { x: 2 * border + w, y: border, w, h },
          { x: 3 * border + 2 * w, y: border, w, h }
        ];
      }
      case 'left-main': {
        const w1 = (width - 3 * border) / 2;
        const h1 = height - 2 * border;
        const w2 = w1;
        const h2 = (height - 3 * border) / 2;
        return [
          { x: border, y: border, w: w1, h: h1 },
          { x: 2 * border + w1, y: border, w: w2, h: h2 },
          { x: 2 * border + w1, y: 2 * border + h2, w: w2, h: h2 }
        ];
      }
      case 'top-main': {
        const w1 = width - 2 * border;
        const h1 = (height - 3 * border) / 2;
        const w2 = (width - 3 * border) / 2;
        const h2 = h1;
        return [
          { x: border, y: border, w: w1, h: h1 },
          { x: border, y: 2 * border + h1, w: w2, h: h2 },
          { x: 2 * border + w2, y: 2 * border + h1, w: w2, h: h2 }
        ];
      }
      case 't-shape': {
        const w1 = width - 2 * border;
        const h1 = (height - 3 * border) / 2;
        const w2 = (width - 4 * border) / 3;
        const h2 = h1;
        return [
          { x: border, y: border, w: w1, h: h1 },
          { x: border, y: 2 * border + h1, w: w2, h: h2 },
          { x: 2 * border + w2, y: 2 * border + h1, w: w2, h: h2 },
          { x: 3 * border + 2 * w2, y: 2 * border + h1, w: w2, h: h2 }
        ];
      }
      case 'grid-3x2': {
        const w = (width - 4 * border) / 3;
        const h = (height - 3 * border) / 2;
        return [
          { x: border, y: border, w, h },
          { x: 2 * border + w, y: border, w, h },
          { x: 3 * border + 2 * w, y: border, w, h },
          { x: border, y: 2 * border + h, w, h },
          { x: 2 * border + w, y: 2 * border + h, w, h },
          { x: 3 * border + 2 * w, y: 2 * border + h, w, h }
        ];
      }
      case 'split-3-right': {
        const w1 = (width - 3 * border) * 0.6;
        const h1 = height - 2 * border;
        const w2 = (width - 3 * border) * 0.4;
        const h2 = (height - 4 * border) / 3;
        return [
          { x: border, y: border, w: w1, h: h1 },
          { x: 2 * border + w1, y: border, w: w2, h: h2 },
          { x: 2 * border + w1, y: 2 * border + h2, w: w2, h: h2 },
          { x: 2 * border + w1, y: 3 * border + 2 * h2, w: w2, h: h2 }
        ];
      }
      case 'cols-4': {
        const w = (width - 5 * border) / 4;
        const h = height - 2 * border;
        return [
          { x: border, y: border, w, h },
          { x: 2 * border + w, y: border, w, h },
          { x: 3 * border + 2 * w, y: border, w, h },
          { x: 4 * border + 3 * w, y: border, w, h }
        ];
      }
      case 'mixed-5': {
        const w2 = (width - 3 * border) / 2;
        const h2 = (height - 3 * border) / 2;
        const w3 = (width - 4 * border) / 3;
        const h3 = h2;
        return [
          { x: border, y: border, w: w2, h: h2 },
          { x: 2 * border + w2, y: border, w: w2, h: h2 },
          { x: border, y: 2 * border + h2, w: w3, h: h3 },
          { x: 2 * border + w3, y: 2 * border + h2, w: w3, h: h3 },
          { x: 3 * border + 2 * w3, y: 2 * border + h2, w: w3, h: h3 }
        ];
      }
      default:
        return [];
    }
  };

  const updateCollageCanvas = () => {
    const c = canvasRef.current;
    if (!c) return;

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

    // Fill background border color
    ctx.fillStyle = borderColor;
    ctx.fillRect(0, 0, width, height);

    const boxes = getTemplateBoxes(selectedTemplate, width, height, border);
    
    // Draw placeholders for slots first
    boxes.forEach((box, idx) => {
      ctx.fillStyle = '#1B2130';
      ctx.fillRect(box.x, box.y, box.w, box.h);
      
      // Draw plus in slot if no image is available
      if (idx >= images.length) {
        ctx.fillStyle = '#4A5568';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('+', box.x + box.w / 2, box.y + box.h / 2);
      }
    });

    if (images.length === 0) return;

    const len = Math.min(images.length, boxes.length);
    const loadedImgs: HTMLImageElement[] = [];
    let loadedCount = 0;

    images.slice(0, len).forEach((url, idx) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        loadedImgs[idx] = img;
        loadedCount++;
        if (loadedCount === len) {
          // Draw each loaded image inside its corresponding box layout
          for (let j = 0; j < len; j++) {
            const box = boxes[j];
            if (loadedImgs[j]) {
              drawImgFit(ctx, loadedImgs[j], box.x, box.y, box.w, box.h);
            }
          }
        }
      };
      img.src = url;
    });
  };

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

  useEffect(() => {
    updateCollageCanvas();
  }, [images, border, borderColor, aspect, selectedTemplate]);

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

  const renderTemplateThumbnail = (tId: string) => {
    const getGridStyles = (id: string) => {
      switch (id) {
        case 'grid-2x2': return 'grid grid-cols-2 grid-rows-2 gap-0.5';
        case 'rows-3': return 'flex flex-col gap-0.5';
        case 'cols-3': return 'flex gap-0.5';
        case 'left-main': return 'grid grid-cols-2 gap-0.5';
        case 'top-main': return 'flex flex-col gap-0.5';
        case 't-shape': return 'flex flex-col gap-0.5';
        case 'grid-3x2': return 'grid grid-cols-3 grid-rows-2 gap-0.5';
        case 'split-3-right': return 'flex gap-0.5';
        case 'cols-4': return 'flex gap-0.5';
        case 'mixed-5': return 'flex flex-col gap-0.5';
        default: return '';
      }
    };

    return (
      <div className={`w-8 h-8 rounded border border-slate-700 bg-slate-900 p-0.5 overflow-hidden shrink-0 ${getGridStyles(tId)}`}>
        {tId === 'grid-2x2' && [1, 2, 3, 4].map(n => <div key={n} className="bg-slate-500 rounded-sm" />)}
        {tId === 'rows-3' && [1, 2, 3].map(n => <div key={n} className="flex-1 bg-slate-500 rounded-sm" />)}
        {tId === 'cols-3' && [1, 2, 3].map(n => <div key={n} className="flex-1 bg-slate-500 rounded-sm" />)}
        {tId === 'left-main' && (
          <>
            <div className="bg-slate-500 rounded-sm row-span-2" />
            <div className="flex flex-col gap-0.5">
              <div className="flex-1 bg-slate-500 rounded-sm" />
              <div className="flex-1 bg-slate-500 rounded-sm" />
            </div>
          </>
        )}
        {tId === 'top-main' && (
          <>
            <div className="h-3 bg-slate-500 rounded-sm" />
            <div className="flex-1 flex gap-0.5">
              <div className="flex-1 bg-slate-500 rounded-sm" />
              <div className="flex-1 bg-slate-500 rounded-sm" />
            </div>
          </>
        )}
        {tId === 't-shape' && (
          <>
            <div className="h-3 bg-slate-500 rounded-sm" />
            <div className="flex-1 flex gap-0.5">
              <div className="flex-1 bg-slate-500 rounded-sm" />
              <div className="flex-1 bg-slate-500 rounded-sm" />
              <div className="flex-1 bg-slate-500 rounded-sm" />
            </div>
          </>
        )}
        {tId === 'grid-3x2' && [1, 2, 3, 4, 5, 6].map(n => <div key={n} className="bg-slate-500 rounded-sm" />)}
        {tId === 'split-3-right' && (
          <>
            <div className="w-5 bg-slate-500 rounded-sm" />
            <div className="flex-1 flex flex-col gap-0.5">
              <div className="flex-1 bg-slate-500 rounded-sm" />
              <div className="flex-1 bg-slate-500 rounded-sm" />
              <div className="flex-1 bg-slate-500 rounded-sm" />
            </div>
          </>
        )}
        {tId === 'cols-4' && [1, 2, 3, 4].map(n => <div key={n} className="flex-1 bg-slate-500 rounded-sm" />)}
        {tId === 'mixed-5' && (
          <>
            <div className="flex gap-0.5 h-3">
              <div className="flex-1 bg-slate-500 rounded-sm" />
              <div className="flex-1 bg-slate-500 rounded-sm" />
            </div>
            <div className="flex-1 flex gap-0.5">
              <div className="flex-1 bg-slate-500 rounded-sm" />
              <div className="flex-1 bg-slate-500 rounded-sm" />
              <div className="flex-1 bg-slate-500 rounded-sm" />
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Visual Preview Workspace */}
      <div className="lg:col-span-8 flex flex-col gap-6 animate-fadeIn">
        <div className="glass-card p-6 flex flex-col items-center justify-center min-h-[480px] relative overflow-hidden">
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
              <p className="text-slate-500 text-xs">Supports up to 10 image files</p>
            </div>
          ) : (
            <div className="z-10 w-full flex flex-col items-center gap-4">
              {/* Responsive preview of the collage canvas */}
              <div className="relative max-w-full max-h-[440px] overflow-hidden border border-slate-800 rounded-2xl bg-slate-950/20 shadow-2xl p-1.5 flex items-center justify-center">
                <canvas ref={canvasRef} className="max-w-full max-h-[400px] object-contain rounded-xl" />
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
                  className="btn-secondary text-xs text-rose-400 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10"
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

          <div className="flex flex-col gap-4">
            {/* Template Selector with Miniature previews */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-slate-400 uppercase font-semibold">Collage Layout Template</label>
              <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all ${
                      selectedTemplate === t.id
                        ? 'bg-[#3C6B4D]/10 border-[#3C6B4D] text-[#ECEBE9]'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {renderTemplateThumbnail(t.id)}
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold leading-tight">{t.name}</span>
                      <span className="text-[9px] text-slate-500">{t.slots} slots</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio selector */}
            <div className="flex flex-col gap-1.5 mt-2">
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
                <span className="text-xs text-slate-300 font-mono uppercase">{borderColor}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={handleDownload}
                disabled={loading || images.length === 0}
                className="btn-primary w-full py-3 disabled:opacity-40"
              >
                {loading ? <RefreshCw className="animate-spin" size={18} /> : <Download size={18} />}
                <span>{loading ? 'Compiling...' : 'Save Collage JPEG'}</span>
              </button>
            </div>
          </div>
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
