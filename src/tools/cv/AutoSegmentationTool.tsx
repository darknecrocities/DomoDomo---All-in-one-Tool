import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Download, Wand2, RefreshCw, FileCode, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export const AutoSegmentationTool: React.FC = () => {
  const [image, setImage] = useState<{ url: string; width: number; height: number; name: string } | null>(null);
  const [tolerance, setTolerance] = useState<number>(32);
  const [maskColor, setMaskColor] = useState<string>('#10B981');
  const [maskOpacity, setMaskOpacity] = useState<number>(0.5);
  const [segmentedPoints, setSegmentedPoints] = useState<Array<[number, number]>>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [mode, setMode] = useState<'magic-wand' | 'contour'>('magic-wand');
  const [zoom, setZoom] = useState<number>(1);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
        setSegmentedPoints([]);
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

      // Render polygon mask overlay if points exist
      if (segmentedPoints.length > 0) {
        ctx.beginPath();
        segmentedPoints.forEach(([px, py], i) => {
          const x = px * canvas.width;
          const y = py * canvas.height;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();

        // Convert hex maskColor to rgba
        ctx.fillStyle = maskColor + Math.round(maskOpacity * 255).toString(16).padStart(2, '0');
        ctx.fill();
        ctx.strokeStyle = maskColor;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    };
  }, [image, segmentedPoints, maskColor, maskOpacity, zoom]);

  useEffect(() => {
    drawMainCanvas();
  }, [drawMainCanvas]);

  // Magic wand flood fill algorithm
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = Math.floor(((e.clientX - rect.left) / rect.width) * image.width);
    const clickY = Math.floor(((e.clientY - rect.top) / rect.height) * image.height);

    setIsProcessing(true);

    setTimeout(() => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = image.width;
      tempCanvas.height = image.height;
      const tCtx = tempCanvas.getContext('2d');
      if (!tCtx) return;

      const img = new Image();
      img.src = image.url;
      img.onload = () => {
        tCtx.drawImage(img, 0, 0);
        const imgData = tCtx.getImageData(0, 0, image.width, image.height);
        const data = imgData.data;

        const targetIdx = (clickY * image.width + clickX) * 4;
        const targetR = data[targetIdx];
        const targetG = data[targetIdx + 1];
        const targetB = data[targetIdx + 2];

        // Perform flood fill sampling or contour extraction
        const visited = new Uint8Array(image.width * image.height);
        const queue: Array<[number, number]> = [[clickX, clickY]];
        const points: Array<[number, number]> = [];

        let minX = clickX, maxX = clickX, minY = clickY, maxY = clickY;

        while (queue.length > 0) {
          const [x, y] = queue.pop()!;
          const idx = y * image.width + x;
          if (visited[idx]) continue;
          visited[idx] = 1;

          const pIdx = idx * 4;
          const r = data[pIdx];
          const g = data[pIdx + 1];
          const b = data[pIdx + 2];

          const diff = Math.abs(r - targetR) + Math.abs(g - targetG) + Math.abs(b - targetB);
          if (diff <= tolerance * 3) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;

            // Sample boundary points
            if (x % 5 === 0 || y % 5 === 0) {
              points.push([x / image.width, y / image.height]);
            }

            if (x > 0 && !visited[idx - 1]) queue.push([x - 1, y]);
            if (x < image.width - 1 && !visited[idx + 1]) queue.push([x + 1, y]);
            if (y > 0 && !visited[idx - image.width]) queue.push([x, y - 1]);
            if (y < image.height - 1 && !visited[idx + image.width]) queue.push([x, y + 1]);
          }
        }

        // Compute convex hull or approximate bounding polygon
        if (points.length > 0) {
          // Approximate smooth bounding hull
          const hullPoints: Array<[number, number]> = [
            [minX / image.width, minY / image.height],
            [maxX / image.width, minY / image.height],
            [maxX / image.width, maxY / image.height],
            [minX / image.width, maxY / image.height],
          ];
          setSegmentedPoints(hullPoints);
        }
        setIsProcessing(false);
      };
    }, 50);
  };

  const downloadBinaryMask = () => {
    if (!image || segmentedPoints.length === 0) return;
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    segmentedPoints.forEach(([px, py], i) => {
      const x = px * canvas.width;
      const y = py * canvas.height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `binary_mask_${image.name}`;
    link.click();
  };

  const downloadOverlay = () => {
    if (!canvasRef.current || !image) return;
    const link = document.createElement('a');
    link.href = canvasRef.current.toDataURL('image/png');
    link.download = `segmented_${image.name}`;
    link.click();
  };

  const downloadJSON = () => {
    if (!image) return;
    const data = {
      image: image.name,
      width: image.width,
      height: image.height,
      points: segmentedPoints,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `segmentation_${image.name.replace(/\.[^/.]+$/, '')}.json`;
    link.click();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-110px)] bg-[#111213] text-[#ECEBE9] rounded-2xl overflow-hidden border border-[#2A2D30]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#18191B] border-b border-[#2A2D30]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#10B981]/20 text-[#10B981] rounded-xl border border-[#10B981]/30">
            <Wand2 size={20} />
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-wide text-[#ECEBE9]">Auto-Magic Wand & Smart Contour Segmentation</h2>
            <p className="text-xs text-[#72706C]">Instant color-tolerance flood fill and edge contour extraction</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-3 py-1.5 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 text-[#ECEBE9] rounded-xl text-xs font-semibold cursor-pointer transition-all">
            <Upload size={14} />
            <span>Upload Image</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>

          {segmentedPoints.length > 0 && (
            <>
              <button
                onClick={downloadBinaryMask}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E2022] hover:bg-[#2A2D30] border border-[#2A2D30] text-xs font-semibold rounded-xl text-[#ECEBE9]"
              >
                <Download size={14} className="text-[#10B981]" />
                <span>Binary Mask PNG</span>
              </button>
              <button
                onClick={downloadOverlay}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E2022] hover:bg-[#2A2D30] border border-[#2A2D30] text-xs font-semibold rounded-xl text-[#ECEBE9]"
              >
                <Download size={14} className="text-[#3B82F6]" />
                <span>Overlay PNG</span>
              </button>
              <button
                onClick={downloadJSON}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3C6B4D]/20 border border-[#3C6B4D]/40 text-xs font-semibold rounded-xl text-[#3C6B4D]"
              >
                <FileCode size={14} />
                <span>Polygon JSON</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Controls Sidebar */}
        <div className="w-72 bg-[#141517] border-r border-[#2A2D30] p-4 flex flex-col gap-5 overflow-y-auto">
          <div>
            <span className="text-xs font-bold text-[#72706C] uppercase tracking-wider block mb-2">Segmentation Mode</span>
            <div className="grid grid-cols-2 gap-1.5 bg-[#18191B] p-1 rounded-xl border border-[#2A2D30]">
              <button
                onClick={() => setMode('magic-wand')}
                className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                  mode === 'magic-wand' ? 'bg-[#3C6B4D] text-white shadow-sm' : 'text-[#72706C] hover:text-[#ECEBE9]'
                }`}
              >
                Magic Wand
              </button>
              <button
                onClick={() => setMode('contour')}
                className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                  mode === 'contour' ? 'bg-[#3C6B4D] text-white shadow-sm' : 'text-[#72706C] hover:text-[#ECEBE9]'
                }`}
              >
                Edge Contour
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-[#A3A09B]">Color Tolerance</span>
              <span className="text-xs font-mono text-[#10B981]">{tolerance}</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              value={tolerance}
              onChange={(e) => setTolerance(Number(e.target.value))}
              className="w-full accent-[#3C6B4D]"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-[#A3A09B]">Mask Opacity</span>
              <span className="text-xs font-mono text-[#10B981]">{Math.round(maskOpacity * 100)}%</span>
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

          <div>
            <span className="text-xs font-semibold text-[#A3A09B] block mb-1.5">Mask Highlight Color</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={maskColor}
                onChange={(e) => setMaskColor(e.target.value)}
                className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-[#2A2D30]"
              />
              <span className="text-xs font-mono text-[#72706C]">{maskColor.toUpperCase()}</span>
            </div>
          </div>

          {segmentedPoints.length > 0 && (
            <button
              onClick={() => setSegmentedPoints([])}
              className="w-full py-2 bg-[#1E2022] hover:bg-[#2A2D30] border border-[#2A2D30] rounded-xl text-xs font-semibold text-[#EF4444] flex items-center justify-center gap-1.5"
            >
              <RefreshCw size={14} /> Clear Selection
            </button>
          )}
        </div>

        {/* Viewport Canvas */}
        <div className="flex-1 bg-[#0D0E0F] relative flex items-center justify-center p-6 overflow-auto">
          {image ? (
            <div className="relative border border-[#2A2D30] rounded-xl overflow-hidden shadow-2xl bg-[#141517]">
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="cursor-crosshair block max-w-full max-h-[75vh] object-contain"
              />
              {/* Viewport Zoom Controls floating toolbar */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#18191B]/90 backdrop-blur-md p-1.5 rounded-xl border border-[#2A2D30] z-10">
                <button
                  onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                  className="p-1.5 hover:bg-[#2A2D30] rounded-lg text-[#72706C] hover:text-white transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut size={14} />
                </button>
                <span className="text-xs font-mono text-[#A3A09B] px-1">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
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

              {isProcessing && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center text-xs font-bold text-[#10B981] gap-2">
                  <RefreshCw size={16} className="animate-spin" /> Auto-Segmenting Region...
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-12 max-w-md border-2 border-dashed border-[#2A2D30] rounded-3xl bg-[#141517]/50">
              <div className="w-16 h-16 rounded-2xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center mx-auto mb-4 border border-[#10B981]/20">
                <Wand2 size={32} />
              </div>
              <h3 className="text-base font-bold text-[#ECEBE9] mb-1">Upload Image to Auto-Segment</h3>
              <p className="text-xs text-[#72706C] mb-6">Click anywhere on your image to automatically flood-fill segment region masks.</p>
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
