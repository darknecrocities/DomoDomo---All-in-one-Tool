import React, { useState, useRef, useEffect } from 'react';
import {
  Eye,
  Upload,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Check,
} from 'lucide-react';
import {
  type CvdType,
  type CvdInfo,
  CVD_DATA,
  applyCvdToRgb,
  simulateHexColor,
} from './cvdHelper';

export type { CvdType, CvdInfo };
export { CVD_DATA, applyCvdToRgb, simulateHexColor };

export const ColorBlindnessSimulatorTool: React.FC = () => {
  const [selectedCvd, setSelectedCvd] = useState<CvdType>('deuteranopia');
  const [paletteColors, setPaletteColors] = useState<string[]>([
    '#D4AF37',
    '#EF4444',
    '#3B82F6',
    '#10B981',
    '#8B5CF6',
  ]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [scale, setScale] = useState<number>(1.0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);

  const cvdInfo = CVD_DATA[selectedCvd];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        originalImageRef.current = img;
        renderSimulatedImage();
      };
    }
  };

  const renderSimulatedImage = () => {
    const img = originalImageRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = Math.min(img.naturalWidth, 800);
    canvas.height = Math.round((canvas.width / img.naturalWidth) * img.naturalHeight);

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const m = cvdInfo.matrix;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      data[i] = r * m[0] + g * m[1] + b * m[2];
      data[i + 1] = r * m[3] + g * m[4] + b * m[5];
      data[i + 2] = r * m[6] + g * m[7] + b * m[8];
    }

    ctx.putImageData(imgData, 0, 0);
  };

  useEffect(() => {
    if (originalImageRef.current) {
      renderSimulatedImage();
    }
  }, [selectedCvd]);

  const handleDownloadSimulated = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `simulated-${selectedCvd}.png`;
    a.click();
  };

  const simulatedPalette = paletteColors.map((hex) => {
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    const sim = applyCvdToRgb(r, g, b, cvdInfo.matrix);
    return `#${sim.r.toString(16).padStart(2, '0')}${sim.g.toString(16).padStart(2, '0')}${sim.b
      .toString(16)
      .padStart(2, '0')}`;
  });

  return (
    <div className="flex flex-col gap-6 text-left max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2A2D30] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#A3A09B] uppercase tracking-wider mb-1">
            <span>Design & UI Suite</span>
            <span>/</span>
            <span className="text-white">Accessibility Auditor</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Eye className="text-[#D4AF37]" size={24} />
            <span>Color Blindness Simulator & Auditor</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Simulate 8 clinical color vision deficiencies on UI palettes and images using Brettel LMS matrices.
          </p>
        </div>

        {imageFile && (
          <button
            type="button"
            onClick={handleDownloadSimulated}
            className="px-4 py-2 bg-white text-black hover:bg-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg"
          >
            <Download size={14} />
            <span>Export Simulated PNG</span>
          </button>
        )}
      </div>

      {/* CVD Condition Picker */}
      <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 flex flex-col gap-3">
        <span className="text-xs font-bold text-[#ECEBE9] uppercase tracking-wider">
          Select Color Vision Deficiency (CVD) Condition
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {(Object.keys(CVD_DATA) as CvdType[]).map((type) => {
            const info = CVD_DATA[type];
            const isSelected = selectedCvd === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedCvd(type)}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  isSelected
                    ? 'bg-white text-black border-white shadow-lg'
                    : 'bg-[#111213] border-[#2A2D30] text-slate-300 hover:border-[#72706C]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{info.label}</span>
                  {isSelected && <Check size={14} className="text-black" />}
                </div>
                <span className={`text-[10px] ${isSelected ? 'text-slate-700' : 'text-slate-500'}`}>
                  {info.category} ({info.population})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Palette Simulation */}
      <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 flex flex-col gap-4">
        <span className="text-xs font-bold text-[#ECEBE9] uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles size={14} className="text-[#D4AF37]" />
          <span>Live Color Palette Simulation</span>
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Normal Vision */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] text-slate-400 font-bold uppercase">Original Normal Vision</span>
            <div className="flex items-center gap-2">
              {paletteColors.map((hex, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                  <input
                    type="color"
                    value={hex}
                    onChange={(e) => {
                      const updated = [...paletteColors];
                      updated[idx] = e.target.value;
                      setPaletteColors(updated);
                    }}
                    className="w-full h-14 rounded-xl cursor-pointer border border-[#2A2D30] bg-transparent p-0"
                  />
                  <span className="font-mono text-[10px] text-slate-400 uppercase">{hex}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Simulated Vision */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] text-[#D4AF37] font-bold uppercase">
              Simulated under {cvdInfo.label}
            </span>
            <div className="flex items-center gap-2">
              {simulatedPalette.map((hex, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                  <div
                    className="w-full h-14 rounded-xl border border-[#2A2D30] shadow-inner"
                    style={{ backgroundColor: hex }}
                  />
                  <span className="font-mono text-[10px] text-slate-400 uppercase">{hex}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Image Simulation Viewport */}
      <div className="bg-[#111213] border border-[#2A2D30] rounded-3xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#2A2D30] pb-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white uppercase tracking-wider text-[11px]">
              Full Image Simulation Viewport
            </span>
            <span className="text-[#A3A09B] font-mono bg-[#18191B] px-2 py-0.5 rounded border border-[#2A2D30]">
              {Math.round(scale * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(s - 0.15, 0.5))}
              className="p-1.5 bg-[#18191B] border border-[#2A2D30] rounded-lg hover:bg-[#2A2D30] text-slate-300"
              title="Zoom Out"
            >
              <ZoomOut size={15} />
            </button>
            <button
              type="button"
              onClick={() => setScale(1.0)}
              className="p-1.5 bg-[#18191B] border border-[#2A2D30] rounded-lg hover:bg-[#2A2D30] text-slate-300"
              title="Reset Zoom"
            >
              <RotateCcw size={15} />
            </button>
            <button
              type="button"
              onClick={() => setScale((s) => Math.min(s + 0.15, 2.0))}
              className="p-1.5 bg-[#18191B] border border-[#2A2D30] rounded-lg hover:bg-[#2A2D30] text-slate-300"
              title="Zoom In"
            >
              <ZoomIn size={15} />
            </button>
          </div>
        </div>

        {/* Upload or Canvas Render Area */}
        {!imageFile ? (
          <label className="border-2 border-dashed border-[#2A2D30] hover:border-white bg-[#0D0D0D] rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors">
            <div className="p-4 bg-[#18191B] rounded-2xl border border-[#2A2D30] text-white">
              <Upload size={28} />
            </div>
            <span className="text-sm font-bold text-white">Upload image or UI screenshot to simulate</span>
            <span className="text-xs text-slate-500">Supports PNG, JPG, and WebP</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        ) : (
          <div className="w-full bg-[#0D0D0D] border border-[#2A2D30] rounded-2xl p-4 flex items-center justify-center overflow-auto min-h-[380px]">
            <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
              <canvas ref={canvasRef} className="rounded-xl shadow-2xl block" />
            </div>
          </div>
        )}
      </div>

      {/* Footer Security */}
      <div className="flex items-center gap-2 p-3 bg-[#18191B] border border-[#2A2D30] rounded-xl text-[11px] text-[#A3A09B]">
        <ShieldCheck size={16} className="text-[#D4AF37] shrink-0" />
        <span>100% Client-side Brettel LMS matrix transformation. No image bytes leave your browser.</span>
      </div>
    </div>
  );
};
