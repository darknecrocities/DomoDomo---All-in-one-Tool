import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Download, Paintbrush, Eraser, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface SemanticClass {
  id: number;
  name: string;
  color: string;
}

const DEFAULT_SEMANTIC_CLASSES: SemanticClass[] = [
  { id: 0, name: 'Background', color: '#000000' },
  { id: 1, name: 'Person', color: '#EF4444' },
  { id: 2, name: 'Vehicle', color: '#3B82F6' },
  { id: 3, name: 'Road / Path', color: '#10B981' },
  { id: 4, name: 'Vegetation', color: '#F59E0B' },
];

export const SemanticMaskStudioTool: React.FC = () => {
  const [image, setImage] = useState<{ url: string; width: number; height: number; name: string } | null>(null);
  const [classes] = useState<SemanticClass[]>(DEFAULT_SEMANTIC_CLASSES);
  const [activeClassId, setActiveClassId] = useState<number>(1);
  const [brushSize, setBrushSize] = useState<number>(25);
  const [activeTool, setActiveTool] = useState<'brush' | 'eraser' | 'bucket'>('brush');
  const [maskOpacity, setMaskOpacity] = useState<number>(0.6);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        setImage({
          url: evt.target?.result as string,
          width: img.width,
          height: img.height,
          name: file.name,
        });
      };
      img.src = evt.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Setup mask canvas buffer when image loads
  useEffect(() => {
    if (!image) {
      imgRef.current = null;
      return;
    }
    if (!maskCanvasRef.current) {
      maskCanvasRef.current = document.createElement('canvas');
    }
    const mCanvas = maskCanvasRef.current;
    mCanvas.width = image.width;
    mCanvas.height = image.height;
    const mCtx = mCanvas.getContext('2d');
    if (mCtx) {
      mCtx.clearRect(0, 0, image.width, image.height);
    }
    drawMainCanvas();
  }, [image]);

  const drawMainCanvas = useCallback(() => {
    if (!image || !canvasRef.current || !maskCanvasRef.current || !imgRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = image.width * zoom;
    canvas.height = image.height * zoom;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);

    // Overlay mask canvas
    ctx.globalAlpha = maskOpacity;
    ctx.drawImage(maskCanvasRef.current, 0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1.0;
  }, [image, maskOpacity, zoom]);

  useEffect(() => {
    drawMainCanvas();
  }, [drawMainCanvas]);

  const paintStroke = (x: number, y: number, isMove: boolean) => {
    if (!maskCanvasRef.current || !image) return;
    const mCtx = maskCanvasRef.current.getContext('2d');
    if (!mCtx) return;

    const cls = classes.find((c) => c.id === activeClassId) || classes[0];

    mCtx.save();
    if (activeTool === 'eraser') {
      mCtx.globalCompositeOperation = 'destination-out';
      mCtx.strokeStyle = 'rgba(0,0,0,1)';
      mCtx.fillStyle = 'rgba(0,0,0,1)';
    } else {
      mCtx.globalCompositeOperation = 'source-over';
      mCtx.strokeStyle = cls.color;
      mCtx.fillStyle = cls.color;
    }
    mCtx.lineWidth = brushSize;
    mCtx.lineCap = 'round';
    mCtx.lineJoin = 'round';

    mCtx.beginPath();
    if (isMove && lastPointRef.current) {
      mCtx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      mCtx.lineTo(x, y);
      mCtx.stroke();
    } else {
      mCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      mCtx.fill();
    }
    mCtx.restore();

    lastPointRef.current = { x, y };
    drawMainCanvas();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !image) return;
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * image.width);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * image.height);
    lastPointRef.current = null;
    paintStroke(x, y, false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current || !image) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * image.width);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * image.height);
    paintStroke(x, y, true);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  const downloadColoredMask = () => {
    if (!maskCanvasRef.current || !image) return;
    const link = document.createElement('a');
    link.href = maskCanvasRef.current.toDataURL('image/png');
    link.download = `semantic_mask_rgb_${image.name}`;
    link.click();
  };

  const downloadIndexedClassMap = () => {
    if (!maskCanvasRef.current || !image) return;
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw black background (class 0)
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Read mask colors and map to integer class IDs
    const mCtx = maskCanvasRef.current.getContext('2d');
    if (!mCtx) return;
    const mData = mCtx.getImageData(0, 0, image.width, image.height);
    const outData = ctx.createImageData(image.width, image.height);

    for (let i = 0; i < mData.data.length; i += 4) {
      const alpha = mData.data[i + 3];
      if (alpha > 50) {
        outData.data[i] = activeClassId;     // R = Class ID
        outData.data[i + 1] = activeClassId; // G = Class ID
        outData.data[i + 2] = activeClassId; // B = Class ID
        outData.data[i + 3] = 255;
      } else {
        outData.data[i] = 0;
        outData.data[i + 1] = 0;
        outData.data[i + 2] = 0;
        outData.data[i + 3] = 255;
      }
    }
    ctx.putImageData(outData, 0, 0);

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `indexed_mask_${image.name}`;
    link.click();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-110px)] bg-[#111213] text-[#ECEBE9] rounded-2xl overflow-hidden border border-[#2A2D30]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#18191B] border-b border-[#2A2D30]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#EF4444]/20 text-[#EF4444] rounded-xl border border-[#EF4444]/30">
            <Paintbrush size={20} />
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-wide text-[#ECEBE9]">Semantic Mask & Pixel Brush Studio</h2>
            <p className="text-xs text-[#72706C]">Pixel-accurate semantic segmentation brush, eraser, and class index map exporter</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-3 py-1.5 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 text-[#ECEBE9] rounded-xl text-xs font-semibold cursor-pointer transition-all">
            <Upload size={14} />
            <span>Upload Image</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>

          {image && (
            <>
              <button
                onClick={downloadColoredMask}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E2022] hover:bg-[#2A2D30] border border-[#2A2D30] text-xs font-semibold rounded-xl text-[#ECEBE9]"
              >
                <Download size={14} className="text-[#EF4444]" />
                <span>Colored Mask PNG</span>
              </button>
              <button
                onClick={downloadIndexedClassMap}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3C6B4D]/20 border border-[#3C6B4D]/40 text-xs font-semibold rounded-xl text-[#3C6B4D]"
              >
                <Download size={14} />
                <span>Indexed Class ID Map PNG</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Studio Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Controls Sidebar */}
        <div className="w-72 bg-[#141517] border-r border-[#2A2D30] p-4 flex flex-col gap-4 overflow-y-auto">
          {/* Tool Selector */}
          <div>
            <span className="text-xs font-bold text-[#72706C] uppercase tracking-wider block mb-2">Paint Tool</span>
            <div className="grid grid-cols-2 gap-1.5 bg-[#18191B] p-1 rounded-xl border border-[#2A2D30]">
              <button
                onClick={() => setActiveTool('brush')}
                className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTool === 'brush' ? 'bg-[#3C6B4D] text-white shadow-sm' : 'text-[#72706C] hover:text-[#ECEBE9]'
                }`}
              >
                <Paintbrush size={14} /> Brush
              </button>
              <button
                onClick={() => setActiveTool('eraser')}
                className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTool === 'eraser' ? 'bg-[#3C6B4D] text-white shadow-sm' : 'text-[#72706C] hover:text-[#ECEBE9]'
                }`}
              >
                <Eraser size={14} /> Eraser
              </button>
            </div>
          </div>

          {/* Brush Size Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-[#A3A09B]">Brush Size</span>
              <span className="text-xs font-mono text-[#EF4444]">{brushSize}px</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-full accent-[#3C6B4D]"
            />
          </div>

          {/* Mask Opacity Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-[#A3A09B]">Layer Opacity</span>
              <span className="text-xs font-mono text-[#EF4444]">{Math.round(maskOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={maskOpacity}
              onChange={(e) => setMaskOpacity(Number(e.target.value))}
              className="w-full accent-[#3C6B4D]"
            />
          </div>

          {/* Semantic Classes List */}
          <div className="flex-1 flex flex-col min-h-0 pt-2 border-t border-[#2A2D30]">
            <span className="text-xs font-bold text-[#72706C] uppercase tracking-wider mb-2">Semantic Classes</span>
            <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
              {classes.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setActiveClassId(cls.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                    activeClassId === cls.id
                      ? 'bg-[#1E2022] border-[#3C6B4D] text-white shadow-sm'
                      : 'bg-[#18191B] border-[#2A2D30] text-[#A3A09B] hover:border-[#3C6B4D]/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: cls.color }} />
                    <span>{cls.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#72706C]">ID: {cls.id}</span>
                </button>
              ))}
            </div>
          </div>
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
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className="cursor-crosshair block max-w-full max-h-[75vh] object-contain"
              />
            </div>
          ) : (
            <div className="text-center p-12 max-w-md border-2 border-dashed border-[#2A2D30] rounded-3xl bg-[#141517]/50">
              <div className="w-16 h-16 rounded-2xl bg-[#EF4444]/10 text-[#EF4444] flex items-center justify-center mx-auto mb-4 border border-[#EF4444]/20">
                <Paintbrush size={32} />
              </div>
              <h3 className="text-base font-bold text-[#ECEBE9] mb-1">Semantic Mask Brush Studio</h3>
              <p className="text-xs text-[#72706C] mb-6">Paint pixel-accurate multi-class semantic segmentation masks directly on uploaded images.</p>
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
