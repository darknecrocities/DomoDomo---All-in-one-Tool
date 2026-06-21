import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export const GlassmorphismGeneratorTool = () => {
  const [blur, setBlur] = useState(10);
  const [opacity, setOpacity] = useState(25); // in percent
  const [saturation, setSaturation] = useState(120); // in percent
  const [color, setColor] = useState('#ffffff');
  const [borderOpacity, setBorderOpacity] = useState(15); // in percent
  const [copied, setCopied] = useState(false);

  // Convert hex + opacity to rgba
  const hexToRgba = (hex: string, alphaPercent: number) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${(alphaPercent / 100).toFixed(2)})`;
  };

  const glassBg = hexToRgba(color, opacity);
  const glassBorder = hexToRgba(color, borderOpacity);
  const backdropFilter = `blur(${blur}px) saturate(${saturation}%)`;

  const cssOutput = `background: ${glassBg};
backdrop-filter: ${backdropFilter};
-webkit-backdrop-filter: ${backdropFilter};
border: 1px solid ${glassBorder};
border-radius: 16px;`;

  const handleCopy = () => {
    navigator.clipboard.writeText(cssOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col items-center justify-center min-h-[350px] relative overflow-hidden bg-slate-950">
          {/* Colorful abstract blobs in background to make glassmorphism pop */}
          <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 blur-xl opacity-60 animate-bounce" style={{ animationDuration: '6s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-gradient-to-tr from-teal-400 to-emerald-600 blur-xl opacity-60 animate-pulse" style={{ animationDuration: '4s' }} />
          
          <div
            className="w-72 h-44 z-10 p-6 flex flex-col justify-between transition-all"
            style={{
              background: glassBg,
              backdropFilter: backdropFilter,
              WebkitBackdropFilter: backdropFilter,
              border: `1px solid ${glassBorder}`,
              borderRadius: '16px'
            }}
          >
            <div className="flex justify-between items-start">
              <span className="text-sm font-bold text-white tracking-wide">Glassmorphism Card</span>
              <span className="text-[10px] bg-white/20 text-white border border-white/25 px-2 py-0.5 rounded-full font-bold">LIVE</span>
            </div>
            <p className="text-[11px] text-white/80 leading-relaxed font-semibold">
              Observe the blur and saturation backdrop filters layered over the color blobs in real-time.
            </p>
            <div className="text-[9px] font-mono text-white/50">DomoDomo Glass Engine</div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3">Glass Spec</h3>
          
          <div className="flex flex-col gap-3 text-xs">
            {/* Blur */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-semibold"><span className="text-slate-400">Blur Filter</span><span className="text-slate-300">{blur}px</span></div>
              <input type="range" min="0" max="40" value={blur} onChange={(e) => setBlur(parseInt(e.target.value))} className="w-full accent-[#4E8E5E] cursor-pointer" />
            </div>

            {/* Opacity */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-semibold"><span className="text-slate-400">Glass Opacity</span><span className="text-slate-300">{opacity}%</span></div>
              <input type="range" min="0" max="100" value={opacity} onChange={(e) => setOpacity(parseInt(e.target.value))} className="w-full accent-[#4E8E5E] cursor-pointer" />
            </div>

            {/* Saturation */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-semibold"><span className="text-slate-400">Backdrop Saturation</span><span className="text-slate-300">{saturation}%</span></div>
              <input type="range" min="0" max="250" value={saturation} onChange={(e) => setSaturation(parseInt(e.target.value))} className="w-full accent-[#4E8E5E] cursor-pointer" />
            </div>

            {/* Glass Color */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-slate-400">Glass Tint Color</label>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full h-8 bg-transparent border border-slate-800 cursor-pointer rounded" />
            </div>

            {/* Border Opacity */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-semibold"><span className="text-slate-400">Border Opacity</span><span className="text-slate-300">{borderOpacity}%</span></div>
              <input type="range" min="0" max="100" value={borderOpacity} onChange={(e) => setBorderOpacity(parseInt(e.target.value))} className="w-full accent-[#4E8E5E] cursor-pointer" />
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-2 border-t border-slate-800 pt-3">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">CSS Spec Code</span>
            <pre className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 font-mono text-[9px] text-emerald-400 overflow-x-auto whitespace-pre-wrap select-all leading-relaxed">
              <code>{cssOutput}</code>
            </pre>
            <button onClick={handleCopy} className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-1.5 mt-1">
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied CSS ✓' : 'Copy Glass Styles'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
