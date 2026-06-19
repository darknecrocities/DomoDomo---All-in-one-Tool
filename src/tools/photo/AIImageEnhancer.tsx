import { FileUploadWrapper, triggerDownload } from '../../utils/sharedHelpers';
import { useState, useRef } from 'react';
import { Download, RefreshCw } from 'lucide-react';

export const AIImageEnhancerTool = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturate, setSaturate] = useState(100);
  const [sepia, setSepia] = useState(0);
  const [grayscale, setGrayscale] = useState(0);
  const [invert, setInvert] = useState(0);
  const [blur, setBlur] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) sepia(${sepia}%) grayscale(${grayscale}%) invert(${invert}%) blur(${blur}px)`;

  const handleReset = () => {
    setBrightness(100);
    setContrast(100);
    setSaturate(100);
    setSepia(0);
    setGrayscale(0);
    setInvert(0);
    setBlur(0);
  };

  const handleDownload = () => {
    const c = canvasRef.current;
    if (!c || !imageUrl) return;
    const ctx = c.getContext('2d');
    const img = new Image();
    img.onload = () => {
      c.width = img.width;
      c.height = img.height;
      if (!ctx) return;
      ctx.filter = filterString;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      triggerDownload(c.toDataURL('image/jpeg'), 'enhanced.jpg');
    };
    img.src = imageUrl;
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
                <span className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-wider">Before (Original)</span>
                <img src={imageUrl} className="max-h-[250px] md:max-h-[300px] w-auto mx-auto rounded border border-slate-800/80 object-contain" alt="Original preview" />
              </div>
              <div className="flex flex-col gap-2 bg-slate-950/20 p-3 rounded border border-slate-850/50">
                <span className="text-[10px] font-bold text-teal-400 text-center uppercase tracking-wider">After (Enhanced)</span>
                <img 
                  src={imageUrl} 
                  style={{ filter: filterString }} 
                  className="max-h-[250px] md:max-h-[300px] w-auto mx-auto rounded border border-slate-800/80 object-contain" 
                  alt="Enhanced preview" 
                />
              </div>
            </div>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-teal-400 font-bold border-b border-slate-800 pb-2 flex justify-between items-center">
            <span>AI Enhancer Filter</span>
            {imageUrl && (
              <button onClick={handleReset} className="text-[10px] text-slate-450 hover:text-rose-400 flex items-center gap-1">
                <RefreshCw size={10} /> Reset
              </button>
            )}
          </h3>

          <div className="flex flex-col gap-3">
            {/* Brightness */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Brightness</span>
                <span className="text-slate-300">{brightness}%</span>
              </div>
              <input type="range" min="50" max="200" value={brightness} onChange={(e) => setBrightness(parseInt(e.target.value))} className="w-full accent-[#4E8E5E] cursor-pointer" />
            </div>

            {/* Contrast */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Contrast</span>
                <span className="text-slate-300">{contrast}%</span>
              </div>
              <input type="range" min="50" max="200" value={contrast} onChange={(e) => setContrast(parseInt(e.target.value))} className="w-full accent-[#4E8E5E] cursor-pointer" />
            </div>

            {/* Saturation */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Saturation</span>
                <span className="text-slate-300">{saturate}%</span>
              </div>
              <input type="range" min="0" max="200" value={saturate} onChange={(e) => setSaturate(parseInt(e.target.value))} className="w-full accent-[#4E8E5E] cursor-pointer" />
            </div>

            {/* Sepia */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Sepia Tone</span>
                <span className="text-slate-300">{sepia}%</span>
              </div>
              <input type="range" min="0" max="100" value={sepia} onChange={(e) => setSepia(parseInt(e.target.value))} className="w-full accent-[#4E8E5E] cursor-pointer" />
            </div>

            {/* Grayscale */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Grayscale</span>
                <span className="text-slate-300">{grayscale}%</span>
              </div>
              <input type="range" min="0" max="100" value={grayscale} onChange={(e) => setGrayscale(parseInt(e.target.value))} className="w-full accent-[#4E8E5E] cursor-pointer" />
            </div>

            {/* Invert */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Invert Colors</span>
                <span className="text-slate-300">{invert}%</span>
              </div>
              <input type="range" min="0" max="100" value={invert} onChange={(e) => setInvert(parseInt(e.target.value))} className="w-full accent-[#4E8E5E] cursor-pointer" />
            </div>

            {/* Blur */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Gaussian Blur</span>
                <span className="text-slate-300">{blur}px</span>
              </div>
              <input type="range" min="0" max="10" step="0.5" value={blur} onChange={(e) => setBlur(parseFloat(e.target.value))} className="w-full accent-[#4E8E5E] cursor-pointer" />
            </div>
          </div>

          {imageUrl && (
            <button onClick={handleDownload} className="btn-primary w-full text-xs mt-3 flex items-center justify-center gap-1.5">
              <Download size={14} /> Download Enhanced JPG
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
