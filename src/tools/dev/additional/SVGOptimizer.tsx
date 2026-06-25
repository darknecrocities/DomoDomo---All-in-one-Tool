import { useState, useEffect } from 'react';
import { Copy, Check, Download, Sliders } from 'lucide-react';

export const SVGOptimizerTool = () => {
  const [svgInput, setSvgInput] = useState(`<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">\n  <!-- Created with Adobe Illustrator -->\n  <title>Domo Logo Icon</title>\n  <circle cx="50" cy="50" r="40" fill="#3C6B4D" stroke="#ffffff" stroke-width="4"/>\n  <polygon points="45,35 65,50 45,65" fill="#ffffff" />\n</svg>`);
  
  const [optimizedSvg, setOptimizedSvg] = useState('');
  const [copied, setCopied] = useState(false);

  // Settings
  const [stripComments, setStripComments] = useState(true);
  const [stripMetadata, setStripMetadata] = useState(true);
  const [stripEditorAttrs, setStripEditorAttrs] = useState(true);
  const [decimalPrecision, setDecimalPrecision] = useState(2);
  const [customFill, setCustomFill] = useState('');
  const [customStroke, setCustomStroke] = useState('');
  const [customStrokeWidth, setCustomStrokeWidth] = useState('');

  // Stats
  const [originalSize, setOriginalSize] = useState(0);
  const [optimizedSize, setOptimizedSize] = useState(0);
  const [savingsPercent, setSavingsPercent] = useState(0);
  const [nodeCount, setNodeCount] = useState(0);

  const optimizeSVG = (raw: string): string => {
    let clean = raw.trim();

    // 1. Strip comments
    if (stripComments) {
      clean = clean.replace(/<!--[\s\S]*?-->/g, '');
    }

    // 2. Strip XML metadata and doc declaration
    if (stripMetadata) {
      clean = clean
        .replace(/<\?xml[\s\S]*?\?>/gi, '')
        .replace(/<!DOCTYPE[\s\S]*?>/gi, '');
    }

    // 3. Strip editor namespace tags/attributes
    if (stripEditorAttrs) {
      clean = clean
        .replace(/xmlns:x="[^"]*"/g, '')
        .replace(/xmlns:i="[^"]*"/g, '')
        .replace(/xmlns:graph="[^"]*"/g, '')
        .replace(/x:xmldoc="[^"]*"/g, '')
        .replace(/i:view="[^"]*"/g, '')
        .replace(/metadata-writer="[^"]*"/g, '')
        .replace(/enable-background="[^"]*"/g, '');
    }

    // 4. Decimal precision correction for path coordinates
    const precisionRegex = /(\d+\.\d+)/g;
    clean = clean.replace(precisionRegex, (val) => {
      const parsed = parseFloat(val);
      return parsed.toFixed(decimalPrecision);
    });

    // 5. Replace fills / strokes if customized
    if (customFill) {
      clean = clean.replace(/fill="[^"]*"/g, `fill="${customFill}"`);
    }
    if (customStroke) {
      clean = clean.replace(/stroke="[^"]*"/g, `stroke="${customStroke}"`);
    }
    if (customStrokeWidth) {
      clean = clean.replace(/stroke-width="[^"]*"/g, `stroke-width="${customStrokeWidth}"`);
    }

    // 6. Clean up white spaces
    clean = clean
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim();

    return clean;
  };

  useEffect(() => {
    const clean = optimizeSVG(svgInput);
    setOptimizedSvg(clean);

    // Calculate stats
    const orig = new TextEncoder().encode(svgInput).length;
    const opt = new TextEncoder().encode(clean).length;
    setOriginalSize(orig);
    setOptimizedSize(opt);
    setSavingsPercent(orig > 0 ? ((orig - opt) / orig) * 100 : 0);

    // Count elements count
    const matches = clean.match(/<[a-zA-Z]+/g) || [];
    setNodeCount(matches.length);
  }, [svgInput, stripComments, stripMetadata, stripEditorAttrs, decimalPrecision, customFill, customStroke, customStrokeWidth]);

  const handleCopy = () => {
    navigator.clipboard.writeText(optimizedSvg);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    const blob = new Blob([optimizedSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'optimized_vector.svg';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        setSvgInput(text);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Editor Inputs */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="text-[#3C6B4D] font-bold">SVG Optimizer Board</h3>
            <label className="py-1 px-3 bg-slate-900 border border-slate-800 hover:bg-slate-850 rounded-lg text-xs font-semibold cursor-pointer text-slate-350 transition-colors">
              Upload SVG File
              <input type="file" accept=".svg" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Raw SVG Markup</span>
              <textarea
                value={svgInput}
                onChange={(e) => setSvgInput(e.target.value)}
                rows={10}
                className="bg-slate-950 border border-slate-850 rounded-xl p-3 text-slate-200 text-xs font-mono focus:outline-none focus:border-[#3C6B4D]"
              />
            </div>

            {/* Live rendered preview */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex justify-between">
                <span>Vector Preview Render</span>
                <span className="text-slate-500 font-mono text-[9px] font-normal">{nodeCount} elements parsed</span>
              </span>
              <div className="flex-1 flex items-center justify-center bg-black/50 border border-slate-850 rounded-xl overflow-hidden relative min-h-[220px] p-4">
                {optimizedSvg ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: optimizedSvg }}
                    className="max-w-full max-h-[200px] flex justify-center items-center object-contain"
                  />
                ) : (
                  <span className="text-slate-650 text-xs italic">No graphic parsed...</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Optimizations statistics */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Original Size', val: `${originalSize} B` },
            { label: 'Optimized Size', val: `${optimizedSize} B` },
            { label: 'File Size Saved', val: `${savingsPercent.toFixed(1)}%` }
          ].map((stat, idx) => (
            <div key={idx} className="glass-card p-4 flex flex-col gap-1 text-center justify-center">
              <span className="text-[9px] text-slate-500 font-bold uppercase">{stat.label}</span>
              <span className="text-lg font-bold text-slate-200 font-mono">{stat.val}</span>
            </div>
          ))}
        </div>

        {/* Output code viewer */}
        <div className="glass-card p-6 flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-slate-850 pb-2">
            <span className="text-xs text-slate-400 font-bold uppercase">Optimized SVG Markup Code</span>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="py-1 px-3 bg-slate-900 border border-slate-800 text-slate-350 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="py-1 px-3 bg-[#3C6B4D] hover:bg-[#3C6B4D]/90 text-white rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <Download size={12} /> Download
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={optimizedSvg}
            rows={5}
            className="bg-slate-950 border border-slate-850 rounded-xl p-3 text-slate-400 text-xs font-mono focus:outline-none"
          />
        </div>
      </div>

      {/* Configurations panel */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <span className="text-xs font-bold text-slate-350 uppercase tracking-wider border-b border-slate-850 pb-3 flex items-center gap-1.5"><Sliders size={14} className="text-[#3C6B4D]" /> Custom Attributes</span>
          
          <div className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Override Fill Color</label>
              <input
                type="text"
                value={customFill}
                onChange={(e) => setCustomFill(e.target.value)}
                placeholder="e.g. #3c6b4d or none"
                className="bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#3C6B4D]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Override Stroke Color</label>
              <input
                type="text"
                value={customStroke}
                onChange={(e) => setCustomStroke(e.target.value)}
                placeholder="e.g. #ffffff"
                className="bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#3C6B4D]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Override Stroke Width</label>
              <input
                type="text"
                value={customStrokeWidth}
                onChange={(e) => setCustomStrokeWidth(e.target.value)}
                placeholder="e.g. 2px"
                className="bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#3C6B4D]"
              />
            </div>
          </div>
        </div>

        {/* Optimizations rules checklist */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <span className="text-xs text-slate-400 font-bold uppercase border-b border-slate-850 pb-2">Optimization Rules</span>
          
          <div className="flex flex-col gap-3">
            {[
              { label: 'Strip comments', desc: 'Remove XML <!-- comments -->', val: stripComments, set: setStripComments },
              { label: 'Strip metadata', desc: 'Remove XML declarations/doc type', val: stripMetadata, set: setStripMetadata },
              { label: 'Strip editor attributes', desc: 'Remove Adobe/Inkscape tags', val: stripEditorAttrs, set: setStripEditorAttrs }
            ].map((rule, idx) => (
              <div key={idx} className="flex items-center justify-between bg-slate-950 border border-slate-850/80 rounded-xl p-3">
                <div className="flex flex-col pr-1">
                  <span className="text-xs text-slate-200 font-semibold">{rule.label}</span>
                  <span className="text-[9px] text-slate-500 leading-normal">{rule.desc}</span>
                </div>
                <button
                  onClick={() => rule.set(!rule.val)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none shrink-0 ${
                    rule.val ? 'bg-[#3C6B4D]' : 'bg-slate-700'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    rule.val ? 'translate-x-4.5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            ))}

            <div className="flex flex-col gap-2.5 border-t border-slate-850/80 pt-3">
              <div className="flex justify-between items-center text-[10px] text-slate-500">
                <span>Decimal Precision Scale</span>
                <span className="font-mono text-[#3C6B4D] font-bold">{decimalPrecision} decimals</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                value={decimalPrecision}
                onChange={(e) => setDecimalPrecision(Number(e.target.value))}
                className="w-full accent-[#3C6B4D]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
