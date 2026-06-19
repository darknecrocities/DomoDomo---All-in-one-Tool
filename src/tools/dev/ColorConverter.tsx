import { useState, useEffect } from 'react';
import { handleTextCopy } from '../../utils/sharedHelpers';
import { Clipboard, Check } from 'lucide-react';

interface ColorState {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  hsv: { h: number; s: number; v: number };
  cmyk: { c: number; m: number; y: number; k: number };
}

export const ColorConverterTool = () => {
  const [color, setColor] = useState('#4e8e5e');
  const [colorState, setColorState] = useState<ColorState>({
    hex: '#4e8e5e',
    rgb: { r: 78, g: 142, b: 94 },
    hsl: { h: 135, s: 29, l: 43 },
    hsv: { h: 135, s: 45, v: 56 },
    cmyk: { c: 45, m: 0, y: 34, k: 44 }
  });

  const [hexInput, setHexInput] = useState('#4e8e5e');
  const [rgbInput, setRgbInput] = useState('78, 142, 94');
  const [hslInput, setHslInput] = useState('135, 29%, 43%');
  const [hsvInput, setHsvInput] = useState('135, 45%, 56%');
  const [cmykInput, setCmykInput] = useState('45%, 0%, 34%, 44%');

  // WCAG Contrast Checker state
  const [textColor, setTextColor] = useState('#ffffff');
  const [contrastRatio, setContrastRatio] = useState(0);
  const [wcagAA, setWcagAA] = useState(false);
  const [wcagAAA, setWcagAAA] = useState(false);
  const [wcagAALarge, setWcagAALarge] = useState(false);
  const [wcagAAALarge, setWcagAAALarge] = useState(false);

  // Copy status
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Helper: Copy string
  const copyToClipboard = (text: string, field: string) => {
    handleTextCopy(text, () => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  // Convert Hex to RGB
  const hexToRgb = (hex: string) => {
    const clean = hex.replace(/^#/, '');
    if (clean.length === 3) {
      const r = parseInt(clean[0] + clean[0], 16);
      const g = parseInt(clean[1] + clean[1], 16);
      const b = parseInt(clean[2] + clean[2], 16);
      return { r, g, b };
    } else if (clean.length === 6) {
      const r = parseInt(clean.substring(0, 2), 16);
      const g = parseInt(clean.substring(2, 4), 16);
      const b = parseInt(clean.substring(4, 6), 16);
      return { r, g, b };
    }
    return null;
  };

  // Convert RGB to HEX
  const rgbToHex = (r: number, g: number, b: number) => {
    const clamp = (val: number) => Math.max(0, Math.min(255, val));
    const hr = clamp(r).toString(16).padStart(2, '0');
    const hg = clamp(g).toString(16).padStart(2, '0');
    const hb = clamp(b).toString(16).padStart(2, '0');
    return `#${hr}${hg}${hb}`;
  };

  // Convert RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  // Convert HSL to RGB
  const hslToRgb = (h: number, s: number, l: number) => {
    h /= 360;
    s /= 100;
    l /= 100;
    let r = l;
    let g = l;
    let b = l;

    if (s !== 0) {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  };

  // Convert RGB to HSV
  const rgbToHsv = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    const v = max;
    const d = max - min;
    const s = max === 0 ? 0 : d / max;

    if (max !== min) {
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100)
    };
  };

  // Convert HSV to RGB
  const hsvToRgb = (h: number, s: number, v: number) => {
    h /= 360;
    s /= 100;
    v /= 100;
    let r = 0, g = 0, b = 0;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  };

  // Convert RGB to CMYK
  const rgbToCmyk = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const k = 1 - Math.max(r, g, b);
    if (k === 1) {
      return { c: 0, m: 0, y: 0, k: 100 };
    }
    const c = (1 - r - k) / (1 - k);
    const m = (1 - g - k) / (1 - k);
    const y = (1 - b - k) / (1 - k);

    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100)
    };
  };

  // Convert CMYK to RGB
  const cmykToRgb = (c: number, m: number, y: number, k: number) => {
    c /= 100;
    m /= 100;
    y /= 100;
    k /= 100;
    const r = 255 * (1 - c) * (1 - k);
    const g = 255 * (1 - m) * (1 - k);
    const b = 255 * (1 - y) * (1 - k);

    return {
      r: Math.round(r),
      g: Math.round(g),
      b: Math.round(b)
    };
  };

  // Update all color formats and inputs from a base color (RGB)
  const updateAllFromRgb = (r: number, g: number, b: number) => {
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    const hsv = rgbToHsv(r, g, b);
    const cmyk = rgbToCmyk(r, g, b);

    setColor(hex);
    setColorState({ hex, rgb: { r, g, b }, hsl, hsv, cmyk });

    setHexInput(hex);
    setRgbInput(`${r}, ${g}, ${b}`);
    setHslInput(`${hsl.h}, ${hsl.s}%, ${hsl.l}%`);
    setHsvInput(`${hsv.h}, ${hsv.s}%, ${hsv.v}%`);
    setCmykInput(`${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%`);
  };

  // Parse custom user inputs
  const handleHexChange = (val: string) => {
    setHexInput(val);
    if (/^#?[0-9A-Fa-f]{3}$|^#?[0-9A-Fa-f]{6}$/.test(val)) {
      const rgb = hexToRgb(val);
      if (rgb) updateAllFromRgb(rgb.r, rgb.g, rgb.b);
    }
  };

  const handleRgbChange = (val: string) => {
    setRgbInput(val);
    const parts = val.split(',').map(x => parseInt(x.trim(), 10));
    if (parts.length === 3 && parts.every(p => !isNaN(p) && p >= 0 && p <= 255)) {
      updateAllFromRgb(parts[0], parts[1], parts[2]);
    }
  };

  const handleHslChange = (val: string) => {
    setHslInput(val);
    const parts = val.replace(/%/g, '').split(',').map(x => parseFloat(x.trim()));
    if (parts.length === 3 && !parts.some(isNaN)) {
      const h = Math.max(0, Math.min(360, parts[0]));
      const s = Math.max(0, Math.min(100, parts[1]));
      const l = Math.max(0, Math.min(100, parts[2]));
      const rgb = hslToRgb(h, s, l);
      updateAllFromRgb(rgb.r, rgb.g, rgb.b);
    }
  };

  const handleHsvChange = (val: string) => {
    setHsvInput(val);
    const parts = val.replace(/%/g, '').split(',').map(x => parseFloat(x.trim()));
    if (parts.length === 3 && !parts.some(isNaN)) {
      const h = Math.max(0, Math.min(360, parts[0]));
      const s = Math.max(0, Math.min(100, parts[1]));
      const v = Math.max(0, Math.min(100, parts[2]));
      const rgb = hsvToRgb(h, s, v);
      updateAllFromRgb(rgb.r, rgb.g, rgb.b);
    }
  };

  const handleCmykChange = (val: string) => {
    setCmykInput(val);
    const parts = val.replace(/%/g, '').split(',').map(x => parseFloat(x.trim()));
    if (parts.length === 4 && !parts.some(isNaN)) {
      const c = Math.max(0, Math.min(100, parts[0]));
      const m = Math.max(0, Math.min(100, parts[1]));
      const y = Math.max(0, Math.min(100, parts[2]));
      const k = Math.max(0, Math.min(100, parts[3]));
      const rgb = cmykToRgb(c, m, y, k);
      updateAllFromRgb(rgb.r, rgb.g, rgb.b);
    }
  };

  // Color harmonies generation
  const getHarmonies = () => {
    const { h, s, l } = colorState.hsl;

    // Complementary
    const compHex = rgbToHex(
      hslToRgb((h + 180) % 360, s, l).r,
      hslToRgb((h + 180) % 360, s, l).g,
      hslToRgb((h + 180) % 360, s, l).b
    );

    // Analogous
    const ana1Hex = rgbToHex(
      hslToRgb((h + 30) % 360, s, l).r,
      hslToRgb((h + 30) % 360, s, l).g,
      hslToRgb((h + 30) % 360, s, l).b
    );
    const ana2Hex = rgbToHex(
      hslToRgb((h + 330) % 360, s, l).r,
      hslToRgb((h + 330) % 360, s, l).g,
      hslToRgb((h + 330) % 360, s, l).b
    );

    // Monochromatic
    const mono1Hex = rgbToHex(
      hslToRgb(h, Math.max(0, s - 20), Math.min(100, l + 20)).r,
      hslToRgb(h, Math.max(0, s - 20), Math.min(100, l + 20)).g,
      hslToRgb(h, Math.max(0, s - 20), Math.min(100, l + 20)).b
    );
    const mono2Hex = rgbToHex(
      hslToRgb(h, Math.min(100, s + 20), Math.max(0, l - 20)).r,
      hslToRgb(h, Math.min(100, s + 20), Math.max(0, l - 20)).g,
      hslToRgb(h, Math.min(100, s + 20), Math.max(0, l - 20)).b
    );

    // Triadic
    const tri1Hex = rgbToHex(
      hslToRgb((h + 120) % 360, s, l).r,
      hslToRgb((h + 120) % 360, s, l).g,
      hslToRgb((h + 120) % 360, s, l).b
    );
    const tri2Hex = rgbToHex(
      hslToRgb((h + 240) % 360, s, l).r,
      hslToRgb((h + 240) % 360, s, l).g,
      hslToRgb((h + 240) % 360, s, l).b
    );

    // Tetradic
    const tet1Hex = rgbToHex(
      hslToRgb((h + 60) % 360, s, l).r,
      hslToRgb((h + 60) % 360, s, l).g,
      hslToRgb((h + 60) % 360, s, l).b
    );
    const tet2Hex = rgbToHex(
      hslToRgb((h + 180) % 360, s, l).r,
      hslToRgb((h + 180) % 360, s, l).g,
      hslToRgb((h + 180) % 360, s, l).b
    );
    const tet3Hex = rgbToHex(
      hslToRgb((h + 240) % 360, s, l).r,
      hslToRgb((h + 240) % 360, s, l).g,
      hslToRgb((h + 240) % 360, s, l).b
    );

    return [
      { name: 'Complementary', colors: [compHex] },
      { name: 'Analogous', colors: [ana2Hex, colorState.hex, ana1Hex] },
      { name: 'Monochromatic', colors: [mono1Hex, colorState.hex, mono2Hex] },
      { name: 'Triadic', colors: [colorState.hex, tri1Hex, tri2Hex] },
      { name: 'Tetradic', colors: [colorState.hex, tet1Hex, tet2Hex, tet3Hex] }
    ];
  };

  // WCAG Relative Luminance calculation
  const getRelativeLuminance = (r: number, g: number, b: number) => {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  // Calculate WCAG Contrast Ratio
  useEffect(() => {
    const baseRgb = colorState.rgb;
    const txtRgb = hexToRgb(textColor) || { r: 255, g: 255, b: 255 };

    const l1 = getRelativeLuminance(baseRgb.r, baseRgb.g, baseRgb.b);
    const l2 = getRelativeLuminance(txtRgb.r, txtRgb.g, txtRgb.b);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    const ratio = (lighter + 0.05) / (darker + 0.05);

    setContrastRatio(parseFloat(ratio.toFixed(2)));

    // AA normal text: 4.5:1
    setWcagAA(ratio >= 4.5);
    // AAA normal text: 7:1
    setWcagAAA(ratio >= 7);
    // AA large text: 3:1
    setWcagAALarge(ratio >= 3);
    // AAA large text: 4.5:1
    setWcagAAALarge(ratio >= 4.5);
  }, [colorState.rgb, textColor]);

  return (
    <div className="max-w-4xl mx-auto glass-card p-6 flex flex-col gap-6 text-left">
      <div className="flex justify-between items-center border-b border-slate-850 pb-3">
        <h3 className="font-bold text-teal-400 flex items-center gap-2 text-lg">
          Color Converter & Analyzer
        </h3>
        <span className="text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full font-medium">
          Offline Mode
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side: Color Picker and Color Input Conversions */}
        <div className="flex flex-col gap-4">
          <h4 className="font-semibold text-slate-200 text-sm">Inputs & Colorspaces</h4>
          <div className="flex gap-4 items-center">
            <div className="relative">
              <input
                type="color"
                value={color}
                onChange={(e) => {
                  const rgb = hexToRgb(e.target.value);
                  if (rgb) updateAllFromRgb(rgb.r, rgb.g, rgb.b);
                }}
                className="w-20 h-20 bg-transparent border border-slate-750 cursor-pointer rounded-xl overflow-hidden shadow-inner"
              />
            </div>
            <div className="flex-1">
              <div className="text-xs text-slate-400 mb-1">Color Preview</div>
              <div
                className="w-full h-12 rounded-lg border border-slate-700 shadow-md flex items-center justify-center font-mono font-bold text-sm tracking-wider"
                style={{
                  backgroundColor: colorState.hex,
                  color: colorState.hsl.l > 60 ? '#0f172a' : '#ffffff'
                }}
              >
                {colorState.hex.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3.5 mt-2">
            {/* HEX Input */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-400">HEX Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={hexInput}
                  onChange={(e) => handleHexChange(e.target.value)}
                  className="flex-1 bg-slate-900/60 border border-slate-850 rounded px-3 py-1.5 font-mono text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                />
                <button
                  onClick={() => copyToClipboard(colorState.hex, 'hex')}
                  className="p-2 rounded bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
                >
                  {copiedField === 'hex' ? <Check size={16} className="text-green-400" /> : <Clipboard size={16} />}
                </button>
              </div>
            </div>

            {/* RGB Input */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-400">RGB (Red, Green, Blue)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={rgbInput}
                  onChange={(e) => handleRgbChange(e.target.value)}
                  className="flex-1 bg-slate-900/60 border border-slate-850 rounded px-3 py-1.5 font-mono text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                />
                <button
                  onClick={() => copyToClipboard(`rgb(${colorState.rgb.r}, ${colorState.rgb.g}, ${colorState.rgb.b})`, 'rgb')}
                  className="p-2 rounded bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
                >
                  {copiedField === 'rgb' ? <Check size={16} className="text-green-400" /> : <Clipboard size={16} />}
                </button>
              </div>
            </div>

            {/* HSL Input */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-400">HSL (Hue, Saturation, Lightness)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={hslInput}
                  onChange={(e) => handleHslChange(e.target.value)}
                  className="flex-1 bg-slate-900/60 border border-slate-850 rounded px-3 py-1.5 font-mono text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                />
                <button
                  onClick={() => copyToClipboard(`hsl(${colorState.hsl.h}, ${colorState.hsl.s}%, ${colorState.hsl.l}%)`, 'hsl')}
                  className="p-2 rounded bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
                >
                  {copiedField === 'hsl' ? <Check size={16} className="text-green-400" /> : <Clipboard size={16} />}
                </button>
              </div>
            </div>

            {/* HSV Input */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-400">HSV (Hue, Saturation, Value)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={hsvInput}
                  onChange={(e) => handleHsvChange(e.target.value)}
                  className="flex-1 bg-slate-900/60 border border-slate-850 rounded px-3 py-1.5 font-mono text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                />
                <button
                  onClick={() => copyToClipboard(`hsv(${colorState.hsv.h}, ${colorState.hsv.s}%, ${colorState.hsv.v}%)`, 'hsv')}
                  className="p-2 rounded bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
                >
                  {copiedField === 'hsv' ? <Check size={16} className="text-green-400" /> : <Clipboard size={16} />}
                </button>
              </div>
            </div>

            {/* CMYK Input */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-400">CMYK (Cyan, Magenta, Yellow, Key/Black)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cmykInput}
                  onChange={(e) => handleCmykChange(e.target.value)}
                  className="flex-1 bg-slate-900/60 border border-slate-850 rounded px-3 py-1.5 font-mono text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                />
                <button
                  onClick={() => copyToClipboard(`cmyk(${colorState.cmyk.c}%, ${colorState.cmyk.m}%, ${colorState.cmyk.y}%, ${colorState.cmyk.k}%)`, 'cmyk')}
                  className="p-2 rounded bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
                >
                  {copiedField === 'cmyk' ? <Check size={16} className="text-green-400" /> : <Clipboard size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: WCAG Contrast Checker & Visual Analyzer */}
        <div className="flex flex-col gap-5 bg-slate-900/40 border border-slate-850/60 rounded-xl p-4.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="font-semibold text-slate-200 text-sm flex items-center gap-1.5">
              WCAG Contrast Analyzer
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">WCAG 2.1 Guidelines</span>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs font-medium text-slate-400">Text Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-9 h-9 bg-transparent border border-slate-750 cursor-pointer rounded-lg overflow-hidden flex-shrink-0"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  placeholder="#FFFFFF"
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 font-mono text-sm text-slate-200 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs font-medium text-slate-400">Background Color</label>
              <div
                className="w-full h-9 rounded-lg border border-slate-800 flex items-center justify-center font-mono text-xs text-slate-300"
                style={{ backgroundColor: colorState.hex }}
              >
                {colorState.hex.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Real-time Render Sandbox */}
          <div
            className="rounded-lg p-4 border border-slate-800/80 text-center font-semibold text-sm transition-all shadow-inner"
            style={{
              backgroundColor: colorState.hex,
              color: textColor
            }}
          >
            <div className="text-[11px] uppercase tracking-wider opacity-70 mb-1">Preview Text Rendering</div>
            <div className="text-lg font-bold">The quick brown fox jumps over the lazy dog.</div>
            <div className="text-xs font-normal mt-1 opacity-80">14pt / 18pt Large & Normal UI Text Elements</div>
          </div>

          {/* Score & Validation */}
          <div className="grid grid-cols-2 gap-3 mt-1">
            <div className="bg-slate-950/80 border border-slate-850 rounded-lg p-3 text-center flex flex-col justify-center">
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Contrast Ratio</div>
              <div className="text-2xl font-black text-teal-400 mt-1">{contrastRatio}:1</div>
            </div>
            <div className="bg-slate-950/80 border border-slate-850 rounded-lg p-3 flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">AA (Normal Text)</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${wcagAA ? 'bg-green-950 text-green-400' : 'bg-red-950 text-red-400'}`}>
                  {wcagAA ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">AAA (Normal Text)</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${wcagAAA ? 'bg-green-950 text-green-400' : 'bg-red-950 text-red-400'}`}>
                  {wcagAAA ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">AA (Large Text)</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${wcagAALarge ? 'bg-green-950 text-green-400' : 'bg-red-950 text-red-400'}`}>
                  {wcagAALarge ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">AAA (Large Text)</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${wcagAAALarge ? 'bg-green-950 text-green-400' : 'bg-red-950 text-red-400'}`}>
                  {wcagAAALarge ? 'PASS' : 'FAIL'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Color Harmonies & Palettes */}
      <div className="border-t border-slate-850 pt-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-slate-200 text-sm">Harmonic Palettes</h4>
          <span className="text-xs text-slate-400">Click any color swatch to select it</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {getHarmonies().map((harm, idx) => (
            <div key={idx} className="bg-slate-900/30 border border-slate-850 rounded-lg p-3 flex flex-col gap-2">
              <div className="text-xs font-semibold text-slate-400">{harm.name}</div>
              <div className="flex h-10 w-full rounded overflow-hidden shadow-sm">
                {harm.colors.map((c, cIdx) => (
                  <div
                    key={cIdx}
                    onClick={() => {
                      const rgb = hexToRgb(c);
                      if (rgb) updateAllFromRgb(rgb.r, rgb.g, rgb.b);
                    }}
                    className="flex-1 h-full cursor-pointer hover:opacity-90 active:scale-95 transition-all relative group"
                    style={{ backgroundColor: c }}
                    title={c.toUpperCase()}
                  >
                    <span className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-slate-200 font-mono tracking-tighter">
                      {c.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
