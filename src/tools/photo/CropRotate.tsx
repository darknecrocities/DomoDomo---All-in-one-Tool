import { FileUploadWrapper, triggerDownload } from '../../utils/sharedHelpers';
import React, { useState, useRef, useEffect } from 'react';
import { Download, RotateCcw, RotateCw, RefreshCw, FlipHorizontal, FlipVertical } from 'lucide-react';

export const CropRotateTool = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [rotate, setRotate] = useState<number>(0);
  const [aspect, setAspect] = useState<'free' | '1:1' | '16:9' | '4:3' | 'custom'>('free');
  const [customRatioW, setCustomRatioW] = useState<number>(2);
  const [customRatioH, setCustomRatioH] = useState<number>(3);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  
  // Crop coordinates in percentage of container (0 to 100)
  const [crop, setCrop] = useState({ x: 10, y: 10, w: 80, h: 80 });
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<string | null>(null);
  const dragStart = useRef({ x: 0, y: 0, cx: 0, cy: 0, cw: 0, ch: 0 });

  // Handle aspect ratio constraint updates
  useEffect(() => {
    if (aspect === 'free') return;
    const ratio = aspect === '1:1' ? 1 : aspect === '16:9' ? 16 / 9 : aspect === '4:3' ? 4 / 3 : customRatioW / customRatioH;
    setCrop((prev) => {
      let newW = prev.w;
      let newH = newW / ratio;
      if (newH > 100 - prev.y) {
        newH = 100 - prev.y;
        newW = newH * ratio;
      }
      return { ...prev, w: Math.min(100, newW), h: Math.min(100, newH) };
    });
  }, [aspect, customRatioW, customRatioH]);

  const handleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    isDragging.current = handle;
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      cx: crop.x,
      cy: crop.y,
      cw: crop.w,
      ch: crop.h
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    const currentDrag = isDragging.current;
    if (!currentDrag || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragStart.current.x) / rect.width) * 100;
    const dy = ((e.clientY - dragStart.current.y) / rect.height) * 100;
    
    setCrop((prev) => {
      let { cx, cy, cw, ch } = dragStart.current;
      let nx = prev.x;
      let ny = prev.y;
      let nw = prev.w;
      let nh = prev.h;

      if (currentDrag === 'move') {
        nx = Math.max(0, Math.min(100 - cw, cx + dx));
        ny = Math.max(0, Math.min(100 - ch, cy + dy));
      } else {
        const ratio = aspect === '1:1' ? 1 : aspect === '16:9' ? 16 / 9 : aspect === '4:3' ? 4 / 3 : aspect === 'custom' ? customRatioW / customRatioH : null;

        if (currentDrag.includes('right')) {
          nw = Math.max(10, Math.min(100 - cx, cw + dx));
        }
        if (currentDrag.includes('bottom')) {
          nh = Math.max(10, Math.min(100 - cy, ch + dy));
        }
        if (currentDrag.includes('left')) {
          const possibleW = Math.max(10, cw - dx);
          if (cx + cw - possibleW >= 0) {
            nx = cx + cw - possibleW;
            nw = possibleW;
          }
        }
        if (currentDrag.includes('top')) {
          const possibleH = Math.max(10, ch - dy);
          if (cy + ch - possibleH >= 0) {
            ny = cy + ch - possibleH;
            nh = possibleH;
          }
        }

        if (ratio) {
          if (currentDrag.includes('right') || currentDrag.includes('bottom')) {
            nh = nw / ratio;
            if (ny + nh > 100) {
              nh = 100 - ny;
              nw = nh * ratio;
            }
          } else {
            nw = nh * ratio;
            if (nx + nw > 100) {
              nw = 100 - nx;
              nh = nw / ratio;
            }
          }
        }
      }

      return { x: nx, y: ny, w: nw, h: nh };
    });
  };

  const handleMouseUp = () => {
    isDragging.current = null;
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [crop, aspect, customRatioW, customRatioH]);

  const handleReset = () => {
    setRotate(0);
    setAspect('free');
    setFlipH(false);
    setFlipV(false);
    setCrop({ x: 10, y: 10, w: 80, h: 80 });
  };

  const handleSave = () => {
    if (!imageUrl) return;
    const img = new Image();
    img.onload = () => {
      const rotCanvas = document.createElement('canvas');
      const rotCtx = rotCanvas.getContext('2d');
      if (!rotCtx) return;

      const is90 = rotate % 180 !== 0;
      rotCanvas.width = is90 ? img.height : img.width;
      rotCanvas.height = is90 ? img.width : img.height;

      rotCtx.translate(rotCanvas.width / 2, rotCanvas.height / 2);
      rotCtx.rotate((rotate * Math.PI) / 180);
      rotCtx.drawImage(img, -img.width / 2, -img.height / 2);

      const cropPx = {
        x: (crop.x / 100) * rotCanvas.width,
        y: (crop.y / 100) * rotCanvas.height,
        w: (crop.w / 100) * rotCanvas.width,
        h: (crop.h / 100) * rotCanvas.height
      };

      const cropCanvas = document.createElement('canvas');
      const cropCtx = cropCanvas.getContext('2d');
      if (!cropCtx) return;

      cropCanvas.width = cropPx.w;
      cropCanvas.height = cropPx.h;

      // Apply flips
      cropCtx.translate(cropCanvas.width / 2, cropCanvas.height / 2);
      cropCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      cropCtx.drawImage(
        rotCanvas,
        cropPx.x, cropPx.y, cropPx.w, cropPx.h,
        -cropCanvas.width / 2, -cropCanvas.height / 2, cropCanvas.width, cropCanvas.height
      );

      triggerDownload(cropCanvas.toDataURL('image/jpeg'), 'cropped.jpg');
    };
    img.src = imageUrl;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-8 glass-card p-6 flex flex-col justify-center min-h-[350px]">
        {!imageUrl ? (
          <FileUploadWrapper onUpload={(file) => setImageUrl(URL.createObjectURL(file))} />
        ) : (
          <div 
            ref={containerRef}
            className="relative max-h-[350px] max-w-[500px] mx-auto rounded border border-slate-800 bg-[#0B0F19] overflow-hidden select-none"
          >
            {/* Base Image with rotations & flips */}
            <img 
              src={imageUrl} 
              style={{ 
                transform: `rotate(${rotate}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})` 
              }} 
              className="max-h-[350px] w-auto mx-auto pointer-events-none transition-transform duration-300" 
              alt="Cropper target" 
            />

            {/* Draggable Cropping Box */}
            <div 
              style={{
                left: `${crop.x}%`,
                top: `${crop.y}%`,
                width: `${crop.w}%`,
                height: `${crop.h}%`,
              }}
              className="absolute border-2 border-emerald-400 bg-emerald-400/10 cursor-move z-20 group"
              onMouseDown={(e) => handleMouseDown(e, 'move')}
            >
              <div 
                className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-emerald-300 border border-emerald-600 rounded-full cursor-nwse-resize"
                onMouseDown={(e) => handleMouseDown(e, 'top-left')}
              />
              <div 
                className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-emerald-300 border border-emerald-600 rounded-full cursor-nesw-resize"
                onMouseDown={(e) => handleMouseDown(e, 'top-right')}
              />
              <div 
                className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-emerald-300 border border-emerald-600 rounded-full cursor-nesw-resize"
                onMouseDown={(e) => handleMouseDown(e, 'bottom-left')}
              />
              <div 
                className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-emerald-300 border border-emerald-600 rounded-full cursor-nwse-resize"
                onMouseDown={(e) => handleMouseDown(e, 'bottom-right')}
              />
            </div>
          </div>
        )}
      </div>
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-teal-400 font-bold border-b border-slate-800 pb-2 flex justify-between items-center">
            <span>Crop & Rotate</span>
            {imageUrl && (
              <button onClick={handleReset} className="text-[10px] text-slate-450 hover:text-rose-400 flex items-center gap-1">
                <RefreshCw size={10} /> Reset
              </button>
            )}
          </h3>
          
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Rotate Controls</span>
          <div className="flex gap-2">
            <button onClick={() => setRotate((prev) => (prev - 90) % 360)} className="btn-secondary flex-1 py-1.5 text-xs font-semibold flex items-center justify-center gap-1">
              <RotateCcw size={12} /> Left
            </button>
            <button onClick={() => setRotate((prev) => (prev + 90) % 360)} className="btn-secondary flex-1 py-1.5 text-xs font-semibold flex items-center justify-center gap-1">
              <RotateCw size={12} /> Right
            </button>
          </div>

          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Flip Controls</span>
          <div className="flex gap-2">
            <button onClick={() => setFlipH(p => !p)} className={`btn-secondary flex-1 py-1.5 text-xs font-semibold flex items-center justify-center gap-1 ${flipH ? 'border-emerald-500 text-emerald-400' : ''}`}>
              <FlipHorizontal size={12} /> Flip H
            </button>
            <button onClick={() => setFlipV(p => !p)} className={`btn-secondary flex-1 py-1.5 text-xs font-semibold flex items-center justify-center gap-1 ${flipV ? 'border-emerald-500 text-emerald-400' : ''}`}>
              <FlipVertical size={12} /> Flip V
            </button>
          </div>

          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Aspect Ratios</span>
          <div className="grid grid-cols-3 gap-2">
            {(['free', '1:1', '16:9', '4:3', 'custom'] as const).map((r) => (
              <button 
                key={r}
                onClick={() => setAspect(r)}
                className={`py-1 rounded text-[11px] font-bold ${aspect === r ? 'bg-[#4E8E5E] text-white' : 'bg-slate-900 text-slate-450 border border-slate-850 hover:bg-slate-800'}`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          {aspect === 'custom' && (
            <div className="flex gap-2 items-center text-xs mt-1">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-slate-400">Ratio W</label>
                <input 
                  type="number" 
                  min={1} 
                  value={customRatioW} 
                  onChange={(e) => setCustomRatioW(Math.max(1, Number(e.target.value)))}
                  className="bg-slate-900 text-slate-200 border border-slate-800 rounded px-2 py-1 focus:outline-none"
                />
              </div>
              <span className="pt-4 text-slate-400">:</span>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-slate-400">Ratio H</label>
                <input 
                  type="number" 
                  min={1} 
                  value={customRatioH} 
                  onChange={(e) => setCustomRatioH(Math.max(1, Number(e.target.value)))}
                  className="bg-slate-900 text-slate-200 border border-slate-800 rounded px-2 py-1 focus:outline-none"
                />
              </div>
            </div>
          )}

          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Precise Crop Bounds (%)</span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex flex-col gap-1">
              <label className="text-slate-400">Left (X)</label>
              <input 
                type="number" 
                min={0} 
                max={100 - crop.w} 
                value={Math.round(crop.x)} 
                onChange={(e) => {
                  const val = Math.max(0, Math.min(100 - crop.w, Number(e.target.value)));
                  setCrop(prev => ({ ...prev, x: val }));
                }}
                className="bg-slate-900 text-slate-200 border border-slate-800 rounded px-2 py-1 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-slate-450">Top (Y)</label>
              <input 
                type="number" 
                min={0} 
                max={100 - crop.h} 
                value={Math.round(crop.y)} 
                onChange={(e) => {
                  const val = Math.max(0, Math.min(100 - crop.h, Number(e.target.value)));
                  setCrop(prev => ({ ...prev, y: val }));
                }}
                className="bg-slate-900 text-slate-200 border border-slate-800 rounded px-2 py-1 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-slate-450">Width</label>
              <input 
                type="number" 
                min={10} 
                max={100 - crop.x} 
                value={Math.round(crop.w)} 
                onChange={(e) => {
                  const val = Math.max(10, Math.min(100 - crop.x, Number(e.target.value)));
                  setCrop(prev => {
                    const ratio = aspect === 'free' ? null : aspect === '1:1' ? 1 : aspect === '16:9' ? 16 / 9 : aspect === '4:3' ? 4 / 3 : customRatioW / customRatioH;
                    if (ratio) {
                      const newH = Math.min(100 - prev.y, val / ratio);
                      return { ...prev, w: newH * ratio, h: newH };
                    }
                    return { ...prev, w: val };
                  });
                }}
                className="bg-slate-900 text-slate-200 border border-slate-800 rounded px-2 py-1 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-slate-450">Height</label>
              <input 
                type="number" 
                min={10} 
                max={100 - crop.y} 
                value={Math.round(crop.h)} 
                onChange={(e) => {
                  const val = Math.max(10, Math.min(100 - crop.y, Number(e.target.value)));
                  setCrop(prev => {
                    const ratio = aspect === 'free' ? null : aspect === '1:1' ? 1 : aspect === '16:9' ? 16 / 9 : aspect === '4:3' ? 4 / 3 : customRatioW / customRatioH;
                    if (ratio) {
                      const newW = Math.min(100 - prev.x, val * ratio);
                      return { ...prev, w: newW, h: newW / ratio };
                    }
                    return { ...prev, h: val };
                  });
                }}
                className="bg-slate-900 text-slate-200 border border-slate-800 rounded px-2 py-1 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {imageUrl && (
            <button onClick={handleSave} className="btn-primary w-full text-xs mt-3 flex items-center justify-center gap-1.5">
              <Download size={14} /> Apply & Save Image
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
