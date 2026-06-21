import { FileUploadWrapper, triggerDownload } from '../../utils/sharedHelpers';
import { useState, useRef, useEffect } from 'react';
import { Download } from 'lucide-react';

export const ImageResizerTool = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(300);
  const [aspectRatio, setAspectRatio] = useState(true);
  const [origRatio, setOrigRatio] = useState(1);
  
  // Advanced features
  const [preset, setPreset] = useState<'custom' | 'insta-square' | 'fb-cover' | 'yt-thumb'>('custom');
  const [resizeMode, setResizeMode] = useState<'stretch' | 'pad'>('stretch');
  const [padColor, setPadColor] = useState('#000000');

  const [previewUrl, setPreviewUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (preset === 'custom') return;
    setAspectRatio(false);
    if (preset === 'insta-square') {
      setWidth(1080);
      setHeight(1080);
    } else if (preset === 'fb-cover') {
      setWidth(820);
      setHeight(312);
    } else if (preset === 'yt-thumb') {
      setWidth(1280);
      setHeight(720);
    }
  }, [preset]);

  useEffect(() => {
    if (!imageUrl) {
      setPreviewUrl('');
      return;
    }
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const targetW = width || 1;
      const targetH = height || 1;
      c.width = targetW;
      c.height = targetH;

      if (resizeMode === 'stretch') {
        ctx.drawImage(img, 0, 0, targetW, targetH);
      } else {
        // Fit & Pad
        ctx.fillStyle = padColor;
        ctx.fillRect(0, 0, targetW, targetH);

        const imgRatio = img.width / img.height;
        const targetRatio = targetW / targetH;
        let drawW = targetW;
        let drawH = targetH;
        let x = 0;
        let y = 0;

        if (imgRatio > targetRatio) {
          drawH = targetW / imgRatio;
          y = (targetH - drawH) / 2;
        } else {
          drawW = targetH * imgRatio;
          x = (targetW - drawW) / 2;
        }

        ctx.drawImage(img, x, y, drawW, drawH);
      }
      setPreviewUrl(c.toDataURL('image/jpeg'));
    };
    img.src = imageUrl;
  }, [imageUrl, width, height, resizeMode, padColor]);

  const handleUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    const img = new Image();
    img.onload = () => {
      setWidth(img.width);
      setHeight(img.height);
      setOrigRatio(img.width / img.height);
    };
    img.src = url;
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    setPreset('custom');
    if (aspectRatio) {
      setHeight(Math.round(val / origRatio));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    setPreset('custom');
    if (aspectRatio) {
      setWidth(Math.round(val * origRatio));
    }
  };

  const downloadResized = () => {
    if (previewUrl) {
      triggerDownload(previewUrl, 'resized.jpg');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-8 glass-card p-6 flex flex-col justify-center min-h-[350px]">
        {!imageUrl ? (
          <FileUploadWrapper onUpload={handleUpload} />
        ) : (
          <div className="flex flex-col items-center">
            {previewUrl ? (
              <img src={previewUrl} className="max-h-[320px] w-auto rounded border border-slate-800 shadow-lg object-contain bg-[#0F131E]" alt="Resize preview" />
            ) : (
              <div className="h-[320px] flex items-center justify-center text-xs text-slate-500">Processing...</div>
            )}
            <div className="text-[10px] text-slate-500 font-mono mt-2">Target Dimensions: {width} x {height} px</div>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-teal-400 font-bold border-b border-slate-800 pb-2">Image Resizer</h3>
          
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400 uppercase font-semibold">Dimension Presets</label>
            <select value={preset} onChange={(e) => setPreset(e.target.value as any)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-200 text-xs font-semibold focus:outline-none">
              <option value="custom">Custom Dimensions</option>
              <option value="insta-square">Instagram Square (1080x1080)</option>
              <option value="fb-cover">FB Cover Photo (820x312)</option>
              <option value="yt-thumb">YouTube Thumbnail (1280x720)</option>
            </select>
          </div>

          <div className="flex gap-2">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-[10px] text-slate-400 uppercase font-semibold">Width (px)</label>
              <input type="number" value={width} onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-200 text-xs font-mono focus:outline-none" />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-[10px] text-slate-400 uppercase font-semibold">Height (px)</label>
              <input type="number" value={height} onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-200 text-xs font-mono focus:outline-none" disabled={aspectRatio && preset === 'custom'} />
            </div>
          </div>

          {preset === 'custom' && (
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer py-1">
              <input type="checkbox" checked={aspectRatio} onChange={(e) => setAspectRatio(e.target.checked)} className="accent-[#4E8E5E]" />
              <span>Lock Aspect Ratio</span>
            </label>
          )}

          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-2 border-t border-slate-850 pt-3">Resize Method</span>
          <div className="flex gap-2">
            <button onClick={() => setResizeMode('stretch')} className={`flex-1 py-1.5 rounded text-xs font-bold ${resizeMode === 'stretch' ? 'bg-[#4E8E5E]' : 'bg-slate-900 border border-slate-850'}`}>Stretch</button>
            <button onClick={() => setResizeMode('pad')} className={`flex-1 py-1.5 rounded text-xs font-bold ${resizeMode === 'pad' ? 'bg-[#4E8E5E]' : 'bg-slate-900 border border-slate-850'}`}>Letterbox / Pad</button>
          </div>

          {resizeMode === 'pad' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 uppercase font-semibold">Pillarbox/Letterbox Color</label>
              <input type="color" value={padColor} onChange={(e) => setPadColor(e.target.value)} className="w-full h-8 bg-transparent border border-slate-800 cursor-pointer rounded" />
            </div>
          )}

          {imageUrl && (
            <button onClick={downloadResized} className="btn-primary w-full text-xs mt-2 flex items-center justify-center gap-1.5">
              <Download size={14} /> Resize & Save Image
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
