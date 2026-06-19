import { FileUploadWrapper } from '../../utils/sharedHelpers';
import { useState, useRef, useEffect } from 'react';

export const ColorPaletteExtractorTool = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [colors, setColors] = useState<string[]>([]);
  const [count, setCount] = useState(6);
  const [copyFeedback, setCopyFeedback] = useState('');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const extractColors = () => {
    const c = canvasRef.current;
    const imgElement = imageRef.current;
    if (!c || !imgElement) return;

    c.width = 50;
    c.height = 50;
    const ctx = c.getContext('2d');
    ctx?.drawImage(imgElement, 0, 0, 50, 50);
    const data = ctx?.getImageData(0, 0, 50, 50).data;
    if (!data) return;

    const counts: { [hex: string]: number } = {};
    for (let i = 0; i < data.length; i += 4 * 2) { // sample pixels
      const r = data[i];
      const g = data[i+1];
      const b = data[i+2];
      // Convert to hex
      const hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
      counts[hex] = (counts[hex] || 0) + 1;
    }
    
    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(e => e[0]);
    
    setColors(sorted);
  };

  useEffect(() => {
    if (imageUrl) {
      extractColors();
    }
  }, [count, imageUrl]);

  const handleUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      extractColors();
    };
    img.src = url;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(`Copied ${label}!`);
    setTimeout(() => setCopyFeedback(''), 2000);
  };

  const getCssExport = () => {
    return colors.map((c, i) => `--color-${i + 1}: ${c};`).join('\n');
  };

  const getJsonExport = () => {
    return JSON.stringify(colors, null, 2);
  };

  const getTailwindExport = () => {
    const obj: any = {};
    colors.forEach((c, i) => {
      obj[`color-${i + 1}`] = c;
    });
    return JSON.stringify({ theme: { extend: { colors: obj } } }, null, 2);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-8 glass-card p-6 flex flex-col justify-center min-h-[350px]">
        {!imageUrl ? (
          <FileUploadWrapper onUpload={handleUpload} />
        ) : (
          <img src={imageUrl} className="max-h-[320px] w-auto mx-auto rounded border border-slate-800" alt="Palette source" />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-teal-400 font-bold border-b border-slate-800 pb-2">Palette Extractor</h3>
          
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Swatches Count</span>
              <span className="text-slate-300 font-bold">{count} Colors</span>
            </div>
            <input type="range" min="3" max="12" value={count} onChange={(e) => setCount(parseInt(e.target.value))} className="w-full accent-[#4E8E5E] cursor-pointer" />
          </div>

          {colors.length > 0 ? (
            <div className="flex flex-col gap-4 mt-2">
              <div className="grid grid-cols-3 gap-2">
                {colors.map((hex, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => copyToClipboard(hex, hex)}
                    className="flex flex-col gap-1 items-center bg-slate-900/60 p-2 rounded border border-slate-850 hover:bg-slate-800 cursor-pointer active:scale-95 transition-transform"
                    title="Click to copy color code"
                  >
                    <div className="w-full h-8 rounded border border-slate-800" style={{ backgroundColor: hex }} />
                    <span className="text-[9px] font-mono text-slate-350">{hex}</span>
                  </button>
                ))}
              </div>

              {copyFeedback && (
                <div className="text-center text-xs text-emerald-400 font-bold bg-emerald-950/20 border border-emerald-800/30 py-1 rounded">
                  {copyFeedback}
                </div>
              )}

              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-2 border-t border-slate-850 pt-3">Export Configs</span>
              <div className="flex flex-col gap-2">
                <button onClick={() => copyToClipboard(getCssExport(), 'CSS Variables')} className="btn-secondary py-1.5 text-xs">Copy CSS Variables</button>
                <button onClick={() => copyToClipboard(getJsonExport(), 'JSON Array')} className="btn-secondary py-1.5 text-xs">Copy JSON Array</button>
                <button onClick={() => copyToClipboard(getTailwindExport(), 'Tailwind Extend Config')} className="btn-secondary py-1.5 text-xs">Copy Tailwind Theme Config</button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-6">Upload an image to extract palettes</p>
          )}
        </div>
      </div>
    </div>
  );
};
