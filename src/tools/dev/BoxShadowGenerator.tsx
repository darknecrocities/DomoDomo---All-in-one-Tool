import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export const BoxShadowGeneratorTool = () => {
  const [hOffset, setHOffset] = useState(10);
  const [vOffset, setVOffset] = useState(10);
  const [blur, setBlur] = useState(15);
  const [spread, setSpread] = useState(0);
  const [color, setColor] = useState('#000000');
  const [opacity, setOpacity] = useState(30); // in percent
  const [inset, setInset] = useState(false);
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

  const rgbaColor = hexToRgba(color, opacity);
  const boxShadowCss = `${inset ? 'inset ' : ''}${hOffset}px ${vOffset}px ${blur}px ${spread}px ${rgbaColor}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`box-shadow: ${boxShadowCss};`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 items-center justify-center min-h-[350px] relative overflow-hidden bg-[#090D16]">
          {/* Backdrop colorful decoration for contrast */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,#1e293b_0%,transparent_100%)] opacity-30 pointer-events-none" />
          
          <div
            className="w-48 h-48 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center text-xs font-semibold text-slate-400 select-none z-10 transition-all"
            style={{
              boxShadow: boxShadowCss
            }}
          >
            Preview Box
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3">Parameters</h3>
          
          <div className="flex flex-col gap-3 text-xs">
            {/* Horizontal Offset */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-semibold"><span className="text-slate-400">Horizontal Offset</span><span className="text-slate-300">{hOffset}px</span></div>
              <input type="range" min="-100" max="100" value={hOffset} onChange={(e) => setHOffset(parseInt(e.target.value))} className="w-full accent-[#4E8E5E] cursor-pointer" />
            </div>

            {/* Vertical Offset */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-semibold"><span className="text-slate-400">Vertical Offset</span><span className="text-slate-300">{vOffset}px</span></div>
              <input type="range" min="-100" max="100" value={vOffset} onChange={(e) => setVOffset(parseInt(e.target.value))} className="w-full accent-[#4E8E5E] cursor-pointer" />
            </div>

            {/* Blur Radius */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-semibold"><span className="text-slate-400">Blur Radius</span><span className="text-slate-300">{blur}px</span></div>
              <input type="range" min="0" max="150" value={blur} onChange={(e) => setBlur(parseInt(e.target.value))} className="w-full accent-[#4E8E5E] cursor-pointer" />
            </div>

            {/* Spread Radius */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-semibold"><span className="text-slate-400">Spread Radius</span><span className="text-slate-300">{spread}px</span></div>
              <input type="range" min="-50" max="50" value={spread} onChange={(e) => setSpread(parseInt(e.target.value))} className="w-full accent-[#4E8E5E] cursor-pointer" />
            </div>

            {/* Shadow Color */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-slate-400">Shadow Color</label>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full h-8 bg-transparent border border-slate-800 cursor-pointer rounded" />
            </div>

            {/* Opacity */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-semibold"><span className="text-slate-400">Shadow Opacity</span><span className="text-slate-300">{opacity}%</span></div>
              <input type="range" min="0" max="100" value={opacity} onChange={(e) => setOpacity(parseInt(e.target.value))} className="w-full accent-[#4E8E5E] cursor-pointer" />
            </div>

            {/* Inset */}
            <label className="flex items-center gap-2 font-semibold text-slate-400 cursor-pointer py-1.5 border-t border-slate-850/60 mt-1">
              <input type="checkbox" checked={inset} onChange={(e) => setInset(e.target.checked)} className="accent-[#4E8E5E]" />
              <span>Inset Shadow</span>
            </label>
          </div>

          <div className="flex flex-col gap-2 mt-2 border-t border-slate-800 pt-3">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">CSS Code Output</span>
            <pre className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 font-mono text-[10px] text-emerald-400 overflow-x-auto whitespace-pre-wrap select-all leading-normal">
              <code>{`box-shadow: ${boxShadowCss};`}</code>
            </pre>
            <button onClick={handleCopy} className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-1.5 mt-1">
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied ✓' : 'Copy CSS Box Shadow'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
