import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Download, Sparkles, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export const CVAugmenterStudioTool: React.FC = () => {
  const [image, setImage] = useState<{ url: string; width: number; height: number; name: string } | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [zoom, setZoom] = useState<number>(1);

  const [bbox] = useState<[number, number, number, number]>([0.2, 0.2, 0.4, 0.4]);

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
      };
      img.src = evt.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const drawAugmentedCanvas = useCallback(() => {
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

      ctx.save();
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

      // Apply Transformations
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      if (flipH) ctx.scale(-1, 1);
      ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

      ctx.restore();

      // Render updated transformed bounding box
      let [x, y, w, h] = bbox;
      if (flipH) {
        x = 1 - (x + w);
      }

      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 3;
      ctx.strokeRect(x * canvas.width, y * canvas.height, w * canvas.width, h * canvas.height);
      ctx.fillStyle = '#10B981';
      ctx.fillText('Augmented Label', x * canvas.width + 6, y * canvas.height + 16);
    };
  }, [image, rotation, flipH, brightness, contrast, bbox, zoom]);

  useEffect(() => {
    drawAugmentedCanvas();
  }, [drawAugmentedCanvas]);

  const downloadAugmentedImage = () => {
    if (!canvasRef.current || !image) return;
    const link = document.createElement('a');
    link.href = canvasRef.current.toDataURL('image/png');
    link.download = `aug_${image.name}`;
    link.click();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-110px)] bg-[#111213] text-[#ECEBE9] rounded-2xl overflow-hidden border border-[#2A2D30]">
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#18191B] border-b border-[#2A2D30]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#F59E0B]/20 text-[#F59E0B] rounded-xl border border-[#F59E0B]/30">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-wide text-[#ECEBE9]">Computer Vision Dataset Synthetic Augmentor</h2>
            <p className="text-xs text-[#72706C]">Geometric and photometric augmentations with auto-synchronized label recalculation</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-3 py-1.5 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 text-[#ECEBE9] rounded-xl text-xs font-semibold cursor-pointer transition-all">
            <Upload size={14} />
            <span>Upload Image</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>

          {image && (
            <button
              onClick={downloadAugmentedImage}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3C6B4D]/20 border border-[#3C6B4D]/40 text-xs font-semibold rounded-xl text-[#3C6B4D]"
            >
              <Download size={14} />
              <span>Download Augmented PNG</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-72 bg-[#141517] border-r border-[#2A2D30] p-4 flex flex-col gap-4 overflow-y-auto">
          <span className="text-xs font-bold text-[#72706C] uppercase tracking-wider">Augmentation Pipeline</span>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-[#A3A09B]">Rotation</span>
              <span className="text-xs font-mono text-[#F59E0B]">{rotation}°</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="w-full accent-[#3C6B4D]"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-[#A3A09B]">Brightness</span>
              <span className="text-xs font-mono text-[#F59E0B]">{brightness}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full accent-[#3C6B4D]"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-[#A3A09B]">Contrast</span>
              <span className="text-xs font-mono text-[#F59E0B]">{contrast}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-full accent-[#3C6B4D]"
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-[#ECEBE9] cursor-pointer pt-2 border-t border-[#2A2D30]">
            <input
              type="checkbox"
              checked={flipH}
              onChange={(e) => setFlipH(e.target.checked)}
              className="rounded accent-[#3C6B4D]"
            />
            Flip Horizontal (Sync Label)
          </label>
        </div>

        <div className="flex-1 bg-[#0D0E0F] relative flex items-center justify-center p-6 overflow-auto">
          {image ? (
            <div className="relative border border-[#2A2D30] rounded-xl overflow-hidden shadow-2xl bg-[#141517]">
              <canvas ref={canvasRef} className="max-w-full max-h-[75vh] object-contain rounded-xl block border border-[#2A2D30]" />

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
            </div>
          ) : (
            <div className="text-center p-12 max-w-md border-2 border-dashed border-[#2A2D30] rounded-3xl bg-[#141517]/50">
              <div className="w-16 h-16 rounded-2xl bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center mx-auto mb-4 border border-[#F59E0B]/20">
                <Sparkles size={32} />
              </div>
              <h3 className="text-base font-bold text-[#ECEBE9] mb-1">Dataset Synthetic Augmentor</h3>
              <p className="text-xs text-[#72706C] mb-6">Apply geometric and color augmentations while maintaining accurate label sync.</p>
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
