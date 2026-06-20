import { triggerDownload } from '../../utils/sharedHelpers';
import { useState, useEffect, useRef } from 'react';
import { Download, ShieldAlert, Barcode, Palette } from 'lucide-react';

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

const CODABAR_MAP: Record<string, string> = {
  '0': 'n n n n n w w n',
  '1': 'n n n n w w n n',
  '2': 'n n n w n n w n',
  '3': 'w w n n n n n n',
  '4': 'n n w n n w n n',
  '5': 'w n n n n w n n',
  '6': 'n w n n n n w n',
  '7': 'n w n n w n n n',
  '8': 'n w w n n n n n',
  '9': 'w n n w n n n n',
  '-': 'n n n w w n n n',
  '$': 'n n w w n n n n',
  ':': 'w n n n w n w n',
  '/': 'w n w n n n w n',
  '.': 'w n w n w n n n',
  '+': 'n n w n w n w n',
  'A': 'n n w w n w n n',
  'B': 'n w n w n n w n',
  'C': 'n n n w n w w n',
  'D': 'n n n w w n w n'
};

const CODE39_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%';

const calculateCode39Checksum = (data: string): string => {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    const idx = CODE39_CHARS.indexOf(data[i]);
    if (idx !== -1) sum += idx;
  }
  return CODE39_CHARS[sum % 43];
};

const getLuminance = (hex: string) => {
  const c = hex.replace('#', '');
  if (c.length !== 6) return 0;
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  const a = [r, g, b].map(v => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

const getContrastRatio = (color1: string, color2: string) => {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
};

export const BarcodeGeneratorTool = () => {
  const [text, setText] = useState('DOMO123');
  const [showText, setShowText] = useState(true);
  const [error, setError] = useState('');
  const [fgColor, setFgColor] = useState('#4E8E5E');
  const [bgColor, setBgColor] = useState('#0B0F19');
  const [barHeight, setBarHeight] = useState(70);
  const [narrowWidth, setNarrowWidth] = useState(2);
  const [padding, setPadding] = useState(20);
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');

  // 10 Features States
  const [barcodeFormat, setBarcodeFormat] = useState<'code39' | 'codabar'>('code39');
  const [useChecksum, setUseChecksum] = useState(false);
  const [productTitle, setProductTitle] = useState('DOMODOMO GADGET');
  const [priceLabel, setPriceLabel] = useState('$19.99 USD');
  const [fontSize, setFontSize] = useState(12);
  const [fontFamily, setFontFamily] = useState<'monospace' | 'sans-serif' | 'serif'>('monospace');
  const [letterSpacing, setLetterSpacing] = useState(3);
  const [showIndicators, setShowIndicators] = useState(true);
  const [bulkInput, setBulkInput] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkResults, setBulkResults] = useState<string[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawBarcodeToCanvas = (canvas: HTMLCanvasElement, valueText: string) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const clean = valueText.toUpperCase().trim();
    if (!clean) return;

    let payload = clean;
    if (barcodeFormat === 'code39') {
      if (useChecksum) {
        payload += calculateCode39Checksum(clean);
      }
      payload = `*${payload}*`;
    } else { // codabar
      // codabar requires start/stop A, B, C or D
      if (!/^[A-D]/.test(payload)) payload = 'A' + payload;
      if (!/[A-D]$/.test(payload)) payload = payload + 'B';
    }

    const wideWidth = narrowWidth * 2.5;
    const charGap = narrowWidth * 1.5;
    
    // Calculate size
    let requiredWidth = padding * 2;
    const map = barcodeFormat === 'code39' ? CODE39_MAP : CODABAR_MAP;

    for (let charIdx = 0; charIdx < payload.length; charIdx++) {
      const char = payload[charIdx];
      const pattern = map[char];
      if (!pattern) continue;
      pattern.split(' ').forEach((type) => {
        requiredWidth += type === 'w' ? wideWidth : narrowWidth;
      });
      requiredWidth += charGap;
    }

    canvas.width = Math.max(380, requiredWidth);
    canvas.height = barHeight + (showText ? 65 : 40) + (productTitle ? 20 : 0);

    // Draw Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Product Title above
    let yOffset = 15;
    if (productTitle) {
      ctx.fillStyle = fgColor;
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(productTitle, canvas.width / 2, 20);
      yOffset = 30;
    }

    // Draw Bars
    let x = (canvas.width - requiredWidth) / 2 + padding;
    
    for (let charIdx = 0; charIdx < payload.length; charIdx++) {
      const char = payload[charIdx];
      const pattern = map[char];
      if (!pattern) continue;

      const elements = pattern.split(' ');
      for (let elemIdx = 0; elemIdx < elements.length; elemIdx++) {
        const type = elements[elemIdx];
        const isBar = elemIdx % 2 === 0;
        const width = type === 'w' ? wideWidth : narrowWidth;

        if (isBar) {
          ctx.fillStyle = fgColor;
          ctx.fillRect(x, yOffset, width, barHeight);
        }
        x += width;
      }
      x += charGap;
    }

    // Draw bottom details & price
    if (showText) {
      ctx.fillStyle = fgColor;
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.textAlign = 'center';
      
      let displayVal = clean;
      if (showIndicators && barcodeFormat === 'code39') {
        displayVal = `*${clean}*`;
      }
      
      // Implement manual character spacing on canvas for nice styling
      const textX = canvas.width / 2;
      const textY = yOffset + barHeight + fontSize + 6;
      ctx.fillText(displayVal.split('').join(String.fromCharCode(8202).repeat(letterSpacing)), textX, textY);

      if (priceLabel) {
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(priceLabel, canvas.width / 2, textY + 14);
      }
    }
  };

  const drawMain = () => {
    setError('');
    const c = canvasRef.current;
    if (!c) return;

    const clean = text.toUpperCase().trim();
    if (!clean) {
      setError('Please input barcode content.');
      return;
    }

    // Validation
    const regex = barcodeFormat === 'code39' ? /^[A-Z0-9\-\.\s\$\/\+\%]+$/ : /^[0-9\-\$\:\/\.\+]+$/;
    const isValid = regex.test(clean);
    if (!isValid) {
      if (barcodeFormat === 'code39') {
        setError('Code 39 only supports A-Z, 0-9, space, and: - . $ / + %');
      } else {
        setError('Codabar only supports digits 0-9, and: - $ : / . +');
      }
      return;
    }

    drawBarcodeToCanvas(c, text);
  };

  useEffect(() => {
    drawMain();
  }, [
    text, showText, fgColor, bgColor, barHeight, narrowWidth, padding,
    barcodeFormat, useChecksum, productTitle, priceLabel, fontSize, fontFamily,
    letterSpacing, showIndicators
  ]);

  // Bulk input trigger
  const handleBulkGenerate = () => {
    if (!bulkInput.trim()) return;
    const lines = bulkInput.split('\n').map(l => l.trim().toUpperCase()).filter(Boolean);
    setBulkResults(lines);
    setBulkMode(true);
  };

  // SVG Export function
  const handleSVGDownload = () => {
    try {
      const clean = text.toUpperCase().trim();
      let payload = clean;
      if (barcodeFormat === 'code39') {
        if (useChecksum) payload += calculateCode39Checksum(clean);
        payload = `*${payload}*`;
      } else {
        if (!/^[A-D]/.test(payload)) payload = 'A' + payload;
        if (!/[A-D]$/.test(payload)) payload = payload + 'B';
      }

      const wideWidth = narrowWidth * 2.5;
      const charGap = narrowWidth * 1.5;
      const map = barcodeFormat === 'code39' ? CODE39_MAP : CODABAR_MAP;

      let requiredWidth = padding * 2;
      for (let charIdx = 0; charIdx < payload.length; charIdx++) {
        const char = payload[charIdx];
        const pattern = map[char];
        if (!pattern) continue;
        pattern.split(' ').forEach((type) => {
          requiredWidth += type === 'w' ? wideWidth : narrowWidth;
        });
        requiredWidth += charGap;
      }

      const width = Math.max(380, requiredWidth);
      const height = barHeight + (showText ? 65 : 40);

      let paths = `<rect width="${width}" height="${height}" fill="${bgColor}" />\n`;
      let currentX = (width - requiredWidth) / 2 + padding;

      for (let charIdx = 0; charIdx < payload.length; charIdx++) {
        const char = payload[charIdx];
        const pattern = map[char];
        if (!pattern) continue;
        const elements = pattern.split(' ');
        for (let elemIdx = 0; elemIdx < elements.length; elemIdx++) {
          const type = elements[elemIdx];
          const isBar = elemIdx % 2 === 0;
          const w = type === 'w' ? wideWidth : narrowWidth;
          if (isBar) {
            paths += `<rect x="${currentX}" y="15" width="${w}" height="${barHeight}" fill="${fgColor}" />\n`;
          }
          currentX += w;
        }
        currentX += charGap;
      }

      if (showText) {
        paths += `<text x="${width / 2}" y="${barHeight + 32}" fill="${fgColor}" font-family="monospace" font-size="12" text-anchor="middle">${clean}</text>`;
      }

      const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
${paths}</svg>`;
      
      const blob = new Blob([svgStr], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      triggerDownload(url, 'barcode.svg');
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  // Contrast calculator
  const contrastRatio = getContrastRatio(fgColor, bgColor);
  const contrastStatus = contrastRatio >= 4.5 ? 'W3C Pass (Excellent)' : contrastRatio >= 3.0 ? 'Acceptable' : 'Low Contrast Warning';
  const contrastColor = contrastRatio >= 4.5 ? 'text-emerald-400 border-emerald-950/40 bg-emerald-950/10' : contrastRatio >= 3.0 ? 'text-amber-400 border-amber-950/40 bg-amber-950/10' : 'text-rose-400 border-rose-950/40 bg-rose-950/10';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
      {/* Settings Panel */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white flex items-center gap-2 text-lg">
              <Barcode className="text-[#4E8E5E]" size={20} />
              <span>Advanced Barcode Generator</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Multi-Format Suite</span>
          </div>

          {/* Format selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold">Barcode Standard Format</label>
              <select
                value={barcodeFormat}
                onChange={(e) => setBarcodeFormat(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
              >
                <option value="code39">Code 39 (Alphanumeric)</option>
                <option value="codabar">Codabar (Numeric & symbols)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 justify-center mt-3">
              {barcodeFormat === 'code39' && (
                <div className="flex items-center gap-2 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    id="code39Checksum"
                    checked={useChecksum}
                    onChange={(e) => setUseChecksum(e.target.checked)}
                    className="w-4 h-4 bg-slate-900 border-slate-800 rounded text-[#4E8E5E] focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="code39Checksum" className="text-xs text-slate-400 cursor-pointer select-none">
                    Auto-calculate Code 39 Mod-43 Check digit
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-semibold">Barcode Value Payload</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. DOMO123"
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
            />
          </div>

          {error && (
            <div className="text-rose-400 text-xs font-semibold bg-rose-950/20 border border-rose-900/40 p-2.5 rounded-xl flex items-center gap-1.5">
              <ShieldAlert size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* Custom Labels Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold">Product Title Label (Top)</label>
              <input
                type="text"
                placeholder="e.g. BRAND ITEM"
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold">Retail Price Label (Bottom)</label>
              <input
                type="text"
                placeholder="e.g. $19.99 USD"
                value={priceLabel}
                onChange={(e) => setPriceLabel(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
              />
            </div>
          </div>

          {/* Bulk Generation Textarea */}
          <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-2xl flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-slate-250">Batch Bulk Generator</span>
              <span className="text-[10px] text-slate-550">Input multiple values (one code per line)</span>
            </div>
            
            <textarea
              placeholder="CODE1&#10;CODE2&#10;CODE3"
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              className="w-full bg-[#151C2C]/60 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none h-16 resize-none"
            />
            <button
              onClick={handleBulkGenerate}
              className="btn-secondary w-full py-1.5 text-xs"
            >
              Render Bulk Barcodes List
            </button>
          </div>

          {/* Layout controls */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Palette className="text-[#4E8E5E]" size={15} />
              <span className="text-[10px] font-bold text-slate-350 uppercase tracking-wider">Style & Dimension Settings</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-550 font-bold uppercase">Bar color</label>
                <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-850">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-[10px] text-slate-400 font-mono uppercase">{fgColor}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-550 font-bold uppercase">Background</label>
                <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-850">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-[10px] text-slate-400 font-mono uppercase">{bgColor}</span>
                </div>
              </div>
            </div>

            {/* Height, narrow width and quiet zone padding sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase">
                  <span>Bar Height</span>
                  <span className="text-[#4E8E5E]">{barHeight}px</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="120"
                  value={barHeight}
                  onChange={(e) => setBarHeight(Number(e.target.value))}
                  className="w-full h-1 bg-slate-850 rounded accent-[#4E8E5E]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase">
                  <span>Narrow Width</span>
                  <span className="text-[#4E8E5E]">{narrowWidth}px</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={narrowWidth}
                  onChange={(e) => setNarrowWidth(Number(e.target.value))}
                  className="w-full h-1 bg-slate-850 rounded accent-[#4E8E5E]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase">
                  <span>Quiet Zone Padding</span>
                  <span className="text-[#4E8E5E]">{padding}px</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={padding}
                  onChange={(e) => setPadding(Number(e.target.value))}
                  className="w-full h-1 bg-slate-850 rounded accent-[#4E8E5E]"
                />
              </div>
            </div>

            {/* Font settings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-slate-900">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-500 font-bold uppercase">Font Family</label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value as any)}
                  className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="monospace">Monospace</option>
                  <option value="sans-serif">Sans-Serif</option>
                  <option value="serif">Serif</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-500 font-bold uppercase">Font Size</label>
                <input
                  type="number"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-500 font-bold uppercase">Char Spacing multiplier</label>
                <input
                  type="range"
                  min="0"
                  max="6"
                  value={letterSpacing}
                  onChange={(e) => setLetterSpacing(Number(e.target.value))}
                  className="w-full h-1 bg-slate-850 rounded accent-[#4E8E5E] mt-3"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="flex items-center gap-2 select-none cursor-pointer mt-3">
                <input
                  type="checkbox"
                  id="showLabel"
                  checked={showText}
                  onChange={(e) => setShowText(e.target.checked)}
                  className="w-4 h-4 bg-slate-900 border-slate-800 rounded text-[#4E8E5E] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="showLabel" className="text-xs text-slate-400 cursor-pointer select-none">
                  Display Value Labels below
                </label>
              </div>

              <div className="flex items-center gap-2 select-none cursor-pointer mt-3">
                <input
                  type="checkbox"
                  id="showBoundaryInd"
                  checked={showIndicators}
                  onChange={(e) => setShowIndicators(e.target.checked)}
                  className="w-4 h-4 bg-slate-900 border-slate-800 rounded text-[#4E8E5E] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="showBoundaryInd" className="text-xs text-slate-400 cursor-pointer select-none">
                  Show boundary indicators (* start/stop)
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 items-center justify-between text-center min-h-[350px]">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-3 w-full">Preview</h3>

          {bulkMode ? (
            <div className="flex flex-col gap-4 w-full text-left">
              <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Bulk Outputs ({bulkResults.length})</span>
                <button
                  onClick={() => setBulkMode(false)}
                  className="text-[10px] text-[#4E8E5E] hover:underline"
                >
                  Back to Main
                </button>
              </div>
              <div className="flex flex-col gap-4 max-h-[360px] overflow-y-auto pr-1">
                {bulkResults.map((codeText, index) => {
                  return (
                    <div key={index} className="p-2 border border-slate-850 rounded-xl bg-slate-950 flex flex-col items-center gap-2">
                      <canvas
                        ref={(el) => {
                          if (el) drawBarcodeToCanvas(el, codeText);
                        }}
                        className="max-w-full rounded border border-slate-900"
                      />
                      <span className="text-[10px] text-slate-500 font-mono">{codeText}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            !error && (
              <div className="flex flex-col items-center gap-4 w-full">
                {/* Contrast check indicator */}
                <div className={`w-full p-2.5 border rounded-xl text-left ${contrastColor} flex flex-col gap-0.5`}>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Contrast Ratio Check</span>
                    <span className="text-xs font-mono font-bold">{contrastRatio.toFixed(1)}:1</span>
                  </div>
                  <span className="text-[9px] font-medium leading-relaxed">{contrastStatus}</span>
                </div>

                <div 
                  className="p-3 border border-slate-850 rounded-2xl flex items-center justify-center max-w-full overflow-x-auto scrollbar-none"
                  style={{ backgroundColor: bgColor }}
                >
                  <canvas ref={canvasRef} className="rounded-xl border border-slate-800/10" />
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 w-full">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => canvasRef.current && triggerDownload(canvasRef.current.toDataURL(`image/${format}`), `barcode.${format}`)}
                      className="btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <Download size={14} />
                      <span>Download {format.toUpperCase()}</span>
                    </button>
                    
                    <button
                      onClick={handleSVGDownload}
                      className="btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 bg-sky-950/40 hover:bg-sky-950/80 border-sky-900/60"
                    >
                      <Download size={14} />
                      <span>Download SVG</span>
                    </button>
                  </div>

                  <div className="flex justify-between items-center gap-2 mt-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Format</span>
                    <select
                      value={format}
                      onChange={(e) => setFormat(e.target.value as any)}
                      className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1 text-[11px] text-slate-350 focus:outline-none"
                    >
                      <option value="png">PNG</option>
                      <option value="jpeg">JPEG</option>
                      <option value="webp">WebP</option>
                    </select>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
