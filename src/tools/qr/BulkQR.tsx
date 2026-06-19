import { triggerDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';
import QRCode from 'qrcode';
import { Layers, Download, Check, Sparkles } from 'lucide-react';

interface BulkQRItem {
  text: string;
  qrUrl: string;
}

export const BulkQRTool = () => {
  const [inputText, setInputText] = useState('https://github.com/arronkianparejas\nhttps://google.com\nHello DomoDomo!');
  const [result, setResult] = useState<BulkQRItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setResult([]);

    const items = inputText.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    const generated: BulkQRItem[] = [];

    try {
      for (const text of items) {
        const qrUrl = await QRCode.toDataURL(text, { 
          width: 300, 
          margin: 2,
          color: { dark: '#4E8E5E', light: '#0B0F19' } 
        });
        generated.push({ text, qrUrl });
      }
      setResult(generated);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAll = async () => {
    if (result.length === 0) return;
    setDownloadSuccess(true);
    
    for (let i = 0; i < result.length; i++) {
      const item = result[i];
      // Format a safe file name based on content
      const safeName = item.text.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 20) || 'qr_code';
      triggerDownload(item.qrUrl, `bulk_qr_${i + 1}_${safeName}.png`);
      // Brief delay to prevent browser blockages on consecutive downloads
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto glass-card p-6 flex flex-col gap-5 text-left">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="font-bold text-white flex items-center gap-2 text-lg">
          <Layers className="text-[#4E8E5E]" size={20} />
          <span>Bulk QR Code Generator</span>
        </h3>
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Batch Processing</span>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-slate-400 font-semibold">Inputs list (One payload per line)</label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="https://example1.com&#10;https://example2.com&#10;Some custom text payload"
          className="w-full bg-[#151C2C]/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E] h-28 resize-none outline-none leading-relaxed"
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || !inputText.trim()}
        className="btn-primary w-full py-3 flex items-center justify-center gap-1.5"
      >
        <Sparkles size={16} />
        <span>{loading ? 'Generating Pack...' : 'Generate Batch Pack'}</span>
      </button>

      {result.length > 0 && (
        <div className="flex flex-col gap-4 mt-2 pt-4 border-t border-slate-800/80">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Generated Pack ({result.length})</span>
            <button
              onClick={handleDownloadAll}
              className="py-1 px-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-350 hover:text-white flex items-center gap-1.5"
            >
              {downloadSuccess ? <Check size={14} className="text-green-400" /> : <Download size={14} />}
              <span>{downloadSuccess ? 'Downloaded!' : 'Download All PNGs'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto pr-1">
            {result.map((item, idx) => (
              <div key={idx} className="bg-slate-950/40 border border-slate-850 p-2.5 rounded-2xl flex flex-col items-center justify-between gap-2.5">
                <img src={item.qrUrl} className="w-24 h-24 border border-slate-800 rounded-xl" alt={`bulk qr ${idx}`} />
                <span className="text-[9px] text-slate-500 font-mono truncate w-full text-center" title={item.text}>
                  {item.text}
                </span>
                <button
                  onClick={() => {
                    const safeName = item.text.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 15) || 'qr';
                    triggerDownload(item.qrUrl, `qr_${idx + 1}_${safeName}.png`);
                  }}
                  className="text-[10px] text-[#4E8E5E] hover:underline font-bold"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
