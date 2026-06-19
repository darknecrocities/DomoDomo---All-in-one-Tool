import { FileUploadWrapper, triggerDownload } from '../../utils/sharedHelpers';
import { useState, useRef, useEffect } from 'react';
import { Download } from 'lucide-react';

export const ImageUpscalerTool = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [scale, setScale] = useState(2);
  const [method, setMethod] = useState<'bicubic' | 'nearest'>('bicubic');
  const [previewUrl, setPreviewUrl] = useState('');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!imageUrl) return;
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Create high-res scaled canvas for rendering the preview
      c.width = img.width * scale;
      c.height = img.height * scale;
      
      ctx.imageSmoothingEnabled = method === 'bicubic';
      if (method === 'bicubic') {
        ctx.imageSmoothingQuality = 'high';
      }
      ctx.drawImage(img, 0, 0, c.width, c.height);
      setPreviewUrl(c.toDataURL('image/jpeg'));
    };
    img.src = imageUrl;
  }, [imageUrl, scale, method]);

  const handleDownload = () => {
    if (previewUrl) {
      triggerDownload(previewUrl, `upscaled_${scale}x.jpg`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-8 glass-card p-6 flex flex-col justify-center min-h-[350px]">
        {!imageUrl ? (
          <FileUploadWrapper onUpload={(file) => setImageUrl(URL.createObjectURL(file))} />
        ) : (
          <div className="flex flex-col gap-4 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="flex flex-col gap-2 bg-slate-950/20 p-3 rounded border border-slate-850/50">
                <span className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-wider">Before (1X Original)</span>
                <img src={imageUrl} className="max-h-[250px] md:max-h-[300px] w-auto mx-auto rounded border border-slate-800/80 object-contain" alt="Original preview" />
              </div>
              <div className="flex flex-col gap-2 bg-slate-950/20 p-3 rounded border border-slate-850/50">
                <span className="text-[10px] font-bold text-teal-400 text-center uppercase tracking-wider">After ({scale}X Upscaled)</span>
                {previewUrl ? (
                  <img src={previewUrl} className="max-h-[250px] md:max-h-[300px] w-auto mx-auto rounded border border-slate-800/80 object-contain" alt="Upscaled preview" />
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-xs text-slate-500">Processing...</div>
                )}
              </div>
            </div>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-teal-400 font-bold border-b border-slate-800 pb-2">Image Upscaler</h3>
          
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Scale Factor</span>
          <div className="grid grid-cols-4 gap-1">
            {([1.5, 2, 3, 4] as const).map((s) => (
              <button
                key={s}
                onClick={() => setScale(s)}
                className={`py-1.5 rounded text-xs font-bold ${scale === s ? 'bg-[#4E8E5E] text-white' : 'bg-slate-900 text-slate-450 border border-slate-850'}`}
              >
                {s}X
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-2">Smoothing Method</span>
          <div className="flex gap-2">
            <button 
              onClick={() => setMethod('bicubic')} 
              className={`flex-1 py-1.5 rounded text-xs font-bold ${method === 'bicubic' ? 'bg-[#4E8E5E]' : 'bg-slate-900 border border-slate-850'}`}
            >
              Bicubic (Smooth)
            </button>
            <button 
              onClick={() => setMethod('nearest')} 
              className={`flex-1 py-1.5 rounded text-xs font-bold ${method === 'nearest' ? 'bg-[#4E8E5E]' : 'bg-slate-900 border border-slate-850'}`}
            >
              Nearest (Pixel Art)
            </button>
          </div>

          {imageUrl && (
            <button onClick={handleDownload} className="btn-primary w-full text-xs mt-2 flex items-center justify-center gap-1.5">
              <Download size={14} /> Upscale & Save Image
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
