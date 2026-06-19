import { triggerDownload } from '../../utils/sharedHelpers';
import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Palette, Download } from 'lucide-react';

export const QRDesignerTool = () => {
  const [text, setText] = useState('https://github.com/arronkianparejas');
  const [fgColor, setFgColor] = useState('#4E8E5E');
  const [bgColor, setBgColor] = useState('#0B0F19');
  const [margin, setMargin] = useState(2);
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('Q');
  const width = 300;
  const [qrUrl, setQrUrl] = useState('');

  const generate = async () => {
    try {
      const url = await QRCode.toDataURL(text || 'DomoDomo', {
        width,
        margin,
        errorCorrectionLevel: errorCorrection,
        color: {
          dark: fgColor,
          light: bgColor
        }
      });
      setQrUrl(url);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { generate(); }, [text, fgColor, bgColor, margin, errorCorrection, width]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Settings Panel */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Palette className="text-[#4E8E5E]" size={22} />
              <span>QR Code Designer</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">Customize colors and scales</span>
          </div>

          {/* Text input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-semibold">QR Code Payload Content</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter link or text..."
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3 border-t border-slate-800/80">
            {/* Color controls */}
            <div className="flex flex-col gap-3">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Color Styling</span>
              
              <div className="flex items-center justify-between bg-slate-900/40 p-3 rounded-xl border border-slate-850">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-350">Foreground (Dark)</span>
                  <span className="text-[10px] text-slate-500">{fgColor}</span>
                </div>
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-10 h-8 bg-transparent border-0 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between bg-slate-900/40 p-3 rounded-xl border border-slate-850">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-350">Background (Light)</span>
                  <span className="text-[10px] text-slate-500">{bgColor}</span>
                </div>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-10 h-8 bg-transparent border-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Scale controls */}
            <div className="flex flex-col gap-3">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Format Layout</span>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Quiet Zone (Margin)</span>
                  <span className="text-slate-300 font-semibold">{margin}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#4E8E5E]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-500 font-semibold">Error Correction Level</label>
                <select
                  value={errorCorrection}
                  onChange={(e) => setErrorCorrection(e.target.value as any)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="L">Low (L) - 7% recovery</option>
                  <option value="M">Medium (M) - 15% recovery</option>
                  <option value="Q">Quartile (Q) - 25% recovery</option>
                  <option value="H">High (H) - 30% recovery</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Output preview panel */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 items-center justify-between text-center min-h-[300px]">
          <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3 w-full">Preview</h3>
          
          {qrUrl && (
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl flex items-center justify-center">
                <img src={qrUrl} className="w-44 h-44 rounded-xl border border-slate-800" alt="Designed QR" />
              </div>
              <button
                onClick={() => triggerDownload(qrUrl, 'custom_designer_qr.png')}
                className="btn-primary w-full py-3 text-xs font-bold"
              >
                <Download size={16} />
                <span>Download Designed QR</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
