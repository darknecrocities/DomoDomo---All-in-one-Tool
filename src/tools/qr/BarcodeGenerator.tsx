import { triggerDownload } from '../../utils/sharedHelpers';
import { useState, useEffect, useRef } from 'react';
import { Download, ShieldAlert, Barcode } from 'lucide-react';

const CODE39_MAP: Record<string, string> = {
  '0': 'n n n w w n w n n',
  '1': 'w n n w n n n n w',
  '2': 'n n w w n n n n w',
  '3': 'w n w w n n n n n',
  '4': 'n n n w w n n n w',
  '5': 'w n n w w n n n n',
  '6': 'n n w w w n n n n',
  '7': 'n n n w n n w n w',
  '8': 'w n n w n n w n n',
  '9': 'n n w w n n w n n',
  'A': 'w n n n n w n n w',
  'B': 'n n w n n w n n w',
  'C': 'w n w n n w n n n',
  'D': 'n n n n w w n n w',
  'E': 'w n n n w w n n n',
  'F': 'n n w n w w n n n',
  'G': 'n n n n n w w n w',
  'H': 'w n n n n w w n n',
  'I': 'n n w n n w w n n',
  'J': 'n n n n w w w n n',
  'K': 'w n n n n n n w w',
  'L': 'n n w n n n n w w',
  'M': 'w n w n n n n w n',
  'N': 'n n n n w n n w w',
  'O': 'w n n n w n n w n',
  'P': 'n n w n w n n w n',
  'Q': 'n n n n n n w w w',
  'R': 'w n n n n n w w n',
  'S': 'n n w n n n w w n',
  'T': 'n n n n w n w w n',
  'U': 'w w n n n n n n w',
  'V': 'n w w n n n n n w',
  'W': 'w w w n n n n n n',
  'X': 'n w n n w n n n w',
  'Y': 'w w n n w n n n n',
  'Z': 'n w w n w n n n n',
  '-': 'n w n n n n w n w',
  '.': 'w w n n n n w n n',
  ' ': 'n w w n n n w n n',
  '*': 'n w n n w n w n n',
  '$': 'n w n w n w n n n',
  '/': 'n w n w n n n w n',
  '+': 'n w n n n w n w n',
  '%': 'n n n w n w n w n'
};

export const BarcodeGeneratorTool = () => {
  const [text, setText] = useState('DOMO123');
  const [showText, setShowText] = useState(true);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawBarcode = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    setError('');
    const clean = text.toUpperCase().trim();
    if (!clean) {
      setError('Please input barcode content.');
      return;
    }

    // Code 39 characters validation
    const isValid = /^[A-Z0-9\-\.\s\$\/\+\%]+$/.test(clean);
    if (!isValid) {
      setError('Code 39 only supports A-Z, 0-9, spaces, and signs: - . $ / + %');
      return;
    }

    const full = `*${clean}*`;
    
    // Sizing calculations
    const narrowWidth = 2;
    const wideWidth = 5;
    const charGap = 3;
    
    // Estimate needed width
    let requiredWidth = 40; // margins
    for (let charIdx = 0; charIdx < full.length; charIdx++) {
      const char = full[charIdx];
      const pattern = CODE39_MAP[char];
      if (!pattern) continue;
      pattern.split(' ').forEach((type) => {
        requiredWidth += type === 'w' ? wideWidth : narrowWidth;
      });
      requiredWidth += charGap;
    }

    // Set canvas dimensions dynamically
    c.width = Math.max(380, requiredWidth);
    c.height = 140;

    // Fill background
    ctx.fillStyle = '#0B0F19';
    ctx.fillRect(0, 0, c.width, c.height);

    // Draw bars
    let x = (c.width - requiredWidth) / 2 + 10;
    
    for (let charIdx = 0; charIdx < full.length; charIdx++) {
      const char = full[charIdx];
      const pattern = CODE39_MAP[char];
      if (!pattern) continue;

      const elements = pattern.split(' ');
      for (let elemIdx = 0; elemIdx < elements.length; elemIdx++) {
        const type = elements[elemIdx];
        const isBar = elemIdx % 2 === 0;
        const width = type === 'w' ? wideWidth : narrowWidth;

        if (isBar) {
          ctx.fillStyle = '#4E8E5E';
          ctx.fillRect(x, 20, width, 70);
        }
        x += width;
      }
      x += charGap;
    }

    // Draw readable label text
    if (showText) {
      ctx.fillStyle = '#E2E8F0';
      ctx.font = '13px Courier, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(clean, c.width / 2, 115);
    }
  };

  useEffect(() => {
    drawBarcode();
  }, [text, showText]);

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-5 text-left">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="font-bold text-white flex items-center gap-2 text-lg">
          <Barcode className="text-[#4E8E5E]" size={20} />
          <span>Code 39 Barcode Generator</span>
        </h3>
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Industrial Code</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-slate-400 font-semibold">Barcode Value Content</label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. DOMO123"
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
        />
      </div>

      {error && (
        <div className="text-rose-400 text-xs font-semibold bg-rose-950/20 border border-rose-900/40 p-2.5 rounded-xl flex items-center gap-1.5">
          <ShieldAlert size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Settings toggle */}
      <div className="flex items-center gap-2 mt-1">
        <input
          type="checkbox"
          id="showLabel"
          checked={showText}
          onChange={(e) => setShowText(e.target.checked)}
          className="w-4 h-4 bg-slate-900 border-slate-800 rounded text-[#4E8E5E] focus:ring-0 focus:ring-offset-0"
        />
        <label htmlFor="showLabel" className="text-xs text-slate-400 cursor-pointer select-none">
          Display readable text label below barcode
        </label>
      </div>

      {!error && (
        <div className="flex flex-col items-center gap-4 pt-4 border-t border-slate-800/80">
          <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl flex items-center justify-center max-w-full overflow-x-auto scrollbar-none">
            <canvas ref={canvasRef} className="rounded-xl border border-slate-800" />
          </div>
          <button
            onClick={() => canvasRef.current && triggerDownload(canvasRef.current.toDataURL('image/png'), 'barcode.png')}
            className="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Download size={15} />
            <span>Download Barcode PNG</span>
          </button>
        </div>
      )}
    </div>
  );
};
