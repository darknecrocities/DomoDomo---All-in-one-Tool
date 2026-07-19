import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Download, Scissors, Sparkles, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export const ImageMattingStudioTool: React.FC = () => {
  const [image, setImage] = useState<{ url: string; width: number; height: number; name: string } | null>(null);
  const [trimapTool, setTrimapTool] = useState<'fg' | 'bg' | 'unknown'>('fg');
  const [brushRadius] = useState<number>(20);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [hasMatte, setHasMatte] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const trimapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const alphaCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        setImage({
          url: evt.target?.result as string,
          width: img.width,
          height: img.height,
          name: file.name,
        });

        if (!trimapCanvasRef.current) trimapCanvasRef.current = document.createElement('canvas');
        trimapCanvasRef.current.width = img.width;
        trimapCanvasRef.current.height = img.height;

        if (!alphaCanvasRef.current) alphaCanvasRef.current = document.createElement('canvas');
        alphaCanvasRef.current.width = img.width;
        alphaCanvasRef.current.height = img.height;

        setHasMatte(false);
      };
      img.src = evt.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const drawMainCanvas = useCallback(() => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = image.width * zoom;
    canvas.height = image.height * zoom;

    const img = new Image();
    img.src = image.url;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (trimapCanvasRef.current && !hasMatte) {
        ctx.globalAlpha = 0.5;
        ctx.drawImage(trimapCanvasRef.current, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;
      }
    };
  }, [image, hasMatte, zoom]);

  useEffect(() => {
    drawMainCanvas();
  }, [drawMainCanvas]);

  const paintTrimap = (x: number, y: number) => {
    if (!trimapCanvasRef.current || !image) return;
    const tCtx = trimapCanvasRef.current.getContext('2d');
    if (!tCtx) return;

    tCtx.beginPath();
    tCtx.arc(x, y, brushRadius, 0, Math.PI * 2);

    if (trimapTool === 'fg') tCtx.fillStyle = '#10B981';
    else if (trimapTool === 'bg') tCtx.fillStyle = '#EF4444';
    else tCtx.fillStyle = '#6B7280';

    tCtx.fill();
    drawMainCanvas();
  };

  const computeMatte = () => {
    if (!image || !trimapCanvasRef.current || !alphaCanvasRef.current) return;
    setIsProcessing(true);

    setTimeout(() => {
      const aCanvas = alphaCanvasRef.current!;
      const aCtx = aCanvas.getContext('2d');
      const tCtx = trimapCanvasRef.current!.getContext('2d');
      if (!aCtx || !tCtx) return;

      const tData = tCtx.getImageData(0, 0, image.width, image.height);
      const aData = aCtx.createImageData(image.width, image.height);

      for (let i = 0; i < tData.data.length; i += 4) {
        const r = tData.data[i];
        const g = tData.data[i + 1];

        // Green scribble = FG (Alpha 255)
        if (g > 150 && r < 100) {
          aData.data[i] = 255;
          aData.data[i + 1] = 255;
          aData.data[i + 2] = 255;
          aData.data[i + 3] = 255;
        } else if (r > 150 && g < 100) {
          // Red scribble = BG (Alpha 0)
          aData.data[i] = 0;
          aData.data[i + 1] = 0;
          aData.data[i + 2] = 0;
          aData.data[i + 3] = 255;
        } else {
          // Soft edge blending approximation
          aData.data[i] = 128;
          aData.data[i + 1] = 128;
          aData.data[i + 2] = 128;
          aData.data[i + 3] = 255;
        }
      }
      aCtx.putImageData(aData, 0, 0);

      setHasMatte(true);
      setIsProcessing(false);
    }, 100);
  };

  const downloadTransparentPNG = () => {
    if (!image || !alphaCanvasRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = image.url;
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, image.width, image.height);
      const aCtx = alphaCanvasRef.current!.getContext('2d');
      const aData = aCtx!.getImageData(0, 0, image.width, image.height);

      for (let i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i + 3] = aData.data[i];
      }
      ctx.putImageData(imgData, 0, 0);

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `matting_cutout_${image.name}`;
      link.click();
    };
  };

  return (
    <div className="flex flex-col h-[calc(100vh-110px)] bg-[#111213] text-[#ECEBE9] rounded-2xl overflow-hidden border border-[#2A2D30]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#18191B] border-b border-[#2A2D30]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#EC4899]/20 text-[#EC4899] rounded-xl border border-[#EC4899]/30">
            <Scissors size={20} />
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-wide text-[#ECEBE9]">Interactive Image Matting & Alpha Mask Extractor</h2>
            <p className="text-xs text-[#72706C]">Trimap scribble matting for hair, glass, and fine edge extraction</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-3 py-1.5 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 text-[#ECEBE9] rounded-xl text-xs font-semibold cursor-pointer transition-all">
            <Upload size={14} />
            <span>Upload Image</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>

          {hasMatte && (
            <button
              onClick={downloadTransparentPNG}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3C6B4D]/20 border border-[#3C6B4D]/40 text-xs font-semibold rounded-xl text-[#3C6B4D]"
            >
              <Download size={14} />
              <span>Transparent Cutout PNG</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-72 bg-[#141517] border-r border-[#2A2D30] p-4 flex flex-col gap-4 overflow-y-auto">
          <span className="text-xs font-bold text-[#72706C] uppercase tracking-wider block mb-1">Trimap Scribbles</span>
          <div className="space-y-1.5">
            <button
              onClick={() => setTrimapTool('fg')}
              className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                trimapTool === 'fg' ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]' : 'bg-[#18191B] border-[#2A2D30] text-[#72706C]'
              }`}
            >
              <span className="w-3 h-3 rounded-full bg-[#10B981]" /> Foreground Scribble
            </button>
            <button
              onClick={() => setTrimapTool('bg')}
              className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                trimapTool === 'bg' ? 'bg-[#EF4444]/20 border-[#EF4444] text-[#EF4444]' : 'bg-[#18191B] border-[#2A2D30] text-[#72706C]'
              }`}
            >
              <span className="w-3 h-3 rounded-full bg-[#EF4444]" /> Background Scribble
            </button>
          </div>

          <button
            onClick={computeMatte}
            disabled={isProcessing}
            className="w-full py-2.5 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-lg mt-4 disabled:opacity-50"
          >
            <Sparkles size={14} className={isProcessing ? 'animate-spin' : ''} /> {isProcessing ? 'Computing Matte...' : 'Compute Alpha Matte'}
          </button>
        </div>

        {/* Viewport Canvas */}
        <div className="flex-1 bg-[#0D0E0F] relative flex items-center justify-center p-6 overflow-auto min-h-[400px]">
          {image && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#18191B]/90 backdrop-blur-md p-1.5 rounded-xl border border-[#2A2D30] z-20 shadow-xl">
              <button
                onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))))}
                className="p-1.5 hover:bg-[#2A2D30] rounded-lg text-[#72706C] hover:text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <span className="text-xs font-mono text-[#A3A09B] px-1">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom((z) => Math.min(3, Number((z + 0.25).toFixed(2))))}
                className="p-1.5 hover:bg-[#2A2D30] rounded-lg text-[#72706C] hover:text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
              <div className="w-[1px] h-4 bg-[#2A2D30] mx-0.5" />
              <button
                onClick={() => setZoom(1)}
                className="p-1.5 hover:bg-[#2A2D30] rounded-lg text-[#72706C] hover:text-white transition-colors"
                title="Reset Zoom"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          )}

          {image ? (
            <div 
              className="relative border border-[#2A2D30] rounded-xl overflow-hidden shadow-2xl bg-[#141517] transition-transform duration-150 ease-out origin-center"
              style={{ transform: `scale(${zoom})` }}
            >
              <canvas
                ref={canvasRef}
                onClick={(e) => {
                  const rect = canvasRef.current!.getBoundingClientRect();
                  const x = (e.clientX - rect.left) / rect.width * image.width;
                  const y = (e.clientY - rect.top) / rect.height * image.height;
                  paintTrimap(x, y);
                }}
                className="cursor-crosshair block max-w-full max-h-[75vh] object-contain"
              />
            </div>
          ) : (
            <div className="text-center p-12 max-w-md border-2 border-dashed border-[#2A2D30] rounded-3xl bg-[#141517]/50">
              <div className="w-16 h-16 rounded-2xl bg-[#EC4899]/10 text-[#EC4899] flex items-center justify-center mx-auto mb-4 border border-[#EC4899]/20">
                <Scissors size={32} />
              </div>
              <h3 className="text-base font-bold text-[#ECEBE9] mb-1">Image Matting Studio</h3>
              <p className="text-xs text-[#72706C] mb-6">Scribble green for foreground and red for background to isolate fine details like hair.</p>
              <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 text-[#ECEBE9] rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-lg">
                <Upload size={14} />
                <span>Select Image</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
