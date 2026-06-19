import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { Upload, FileText, Check, ShieldAlert, Sliders, Type } from 'lucide-react';

export const PDFWatermarkTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [stamp, setStamp] = useState('CONFIDENTIAL');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Customization states
  const [fontSize, setFontSize] = useState<number>(48);
  const [opacity, setOpacity] = useState<number>(0.3);
  const [rotation, setRotation] = useState<number>(45);
  const [color, setColor] = useState('#7f1d1d'); // dark red hex
  const [position, setPosition] = useState<'center' | 'top-right' | 'bottom-right' | 'header' | 'footer'>('center');

  // Convert hex color to rgb
  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return { r, g, b };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSuccess(false);
    }
  };

  const handleStamp = async () => {
    if (!file) return;
    setLoading(true);
    setSuccess(false);
    try {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const font = await pdf.embedFont(StandardFonts.HelveticaBold);
      const pages = pdf.getPages();
      const { r, g, b } = hexToRgb(color);

      pages.forEach(page => {
        const w = page.getWidth();
        const h = page.getHeight();
        let x = w * 0.1;
        let y = h * 0.5;

        // Position mapping
        if (position === 'center') {
          x = w * 0.2;
          y = h * 0.5;
        } else if (position === 'top-right') {
          x = w - 200;
          y = h - 60;
        } else if (position === 'bottom-right') {
          x = w - 200;
          y = 40;
        } else if (position === 'header') {
          x = w * 0.3;
          y = h - 50;
        } else if (position === 'footer') {
          x = w * 0.3;
          y = 30;
        }

        page.drawText(stamp, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(r, g, b),
          opacity,
          rotate: degrees(position === 'center' ? rotation : 0)
        });
      });

      const stampedBytes = await pdf.save();
      triggerBlobDownload(
        new Blob([new Uint8Array(stampedBytes)], { type: 'application/pdf' }),
        `${file.name.replace(/\.[^/.]+$/, "")}_watermarked.pdf`
      );
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error(e);
      alert('Error embedding watermark.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Editor Panel */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 text-left">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Type className="text-[#4E8E5E]" size={22} />
              <span>PDF Watermark Studio</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">Overlay transparent text</span>
          </div>

          {!file ? (
            <div className="border border-dashed border-slate-800 rounded-2xl p-8 bg-slate-950/20 text-center flex flex-col items-center gap-3">
              <div className="p-4 bg-slate-900/60 rounded-full border border-slate-800 text-[#4E8E5E]">
                <Upload size={32} />
              </div>
              <label className="btn-primary cursor-pointer mt-1">
                <span>Choose PDF File</span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-slate-500 text-xs">Select PDF to stamp watermarks</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 bg-slate-900/30 p-4 rounded-xl border border-slate-850">
                <div className="flex items-center gap-3">
                  <FileText className="text-[#4E8E5E]" size={24} />
                  <div className="flex flex-col">
                    <span className="text-slate-200 text-xs font-bold">{file.name}</span>
                    <span className="text-[10px] text-slate-400">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-[10px] text-rose-400 hover:text-rose-350 font-bold self-start"
                >
                  Change PDF File
                </button>
              </div>

              {/* Watermark Input */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Watermark Text</label>
                <input
                  type="text"
                  value={stamp}
                  onChange={(e) => setStamp(e.target.value)}
                  className="w-full bg-[#151C2C]/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Control Panel */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 text-left">
          <div className="flex items-center gap-2 text-teal-400 font-semibold border-b border-slate-800 pb-3">
            <Sliders size={18} />
            <span>Watermark Layout</span>
          </div>

          {/* Size slider */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-medium">Font Size</span>
              <span className="text-teal-400 font-semibold">{fontSize}px</span>
            </div>
            <input
              type="range"
              min="12"
              max="100"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#4E8E5E]"
            />
          </div>

          {/* Opacity slider */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-medium">Opacity</span>
              <span className="text-teal-400 font-semibold">{Math.round(opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={opacity * 100}
              onChange={(e) => setOpacity(parseInt(e.target.value) / 100)}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#4E8E5E]"
            />
          </div>

          {/* Rotation slider */}
          {position === 'center' && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">Angle Rotation</span>
                <span className="text-teal-400 font-semibold">{rotation}°</span>
              </div>
              <input
                type="range"
                min="-90"
                max="90"
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#4E8E5E]"
              />
            </div>
          )}

          {/* Color Picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-medium">Watermark Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
              <span className="text-xs text-slate-350 font-mono uppercase">{color}</span>
            </div>
          </div>

          {/* Position */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-medium">Placement Position</label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="center">Center (Rotated)</option>
              <option value="top-right">Top Right (Header Corner)</option>
              <option value="bottom-right">Bottom Right (Footer Corner)</option>
              <option value="header">Header Center</option>
              <option value="footer">Footer Center</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={handleStamp}
              disabled={!file || loading}
              className="btn-primary w-full py-3"
            >
              {success ? <Check size={18} /> : <Type size={18} />}
              <span>{loading ? 'Embedding...' : success ? 'Stamped!' : 'Stamp Watermark'}</span>
            </button>
          </div>
        </div>

        {/* Local Processing Banner */}
        <div className="bg-[#151C2C]/50 border border-slate-800 rounded-2xl p-4 flex gap-3 text-slate-400 text-left">
          <ShieldAlert size={20} className="text-[#4E8E5E] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-slate-300">100% Client-Side Processing</span>
            <span className="text-[10px] leading-relaxed">No data leaves your computer. All overlays are stamped directly into the page stream.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
