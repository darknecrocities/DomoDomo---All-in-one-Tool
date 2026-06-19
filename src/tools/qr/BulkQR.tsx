import { useState } from 'react';
import QRCode from 'qrcode';




export const BulkQRTool = () => {
  const [csv, setCsv] = useState('URL1\nURL2');
  const [result, setResult] = useState<string[]>([]);

  const handleGenerate = async () => {
    const urls = csv.split('\n').filter(Boolean);
    const arr = [];
    for (const url of urls) {
      const dataUrl = await QRCode.toDataURL(url, { width: 150 });
      arr.push(dataUrl);
    }
    setResult(arr);
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">Bulk QR Code Generator</h3>
      <textarea value={csv} onChange={(e) => setCsv(e.target.value)} placeholder="One item per line..." className="bg-slate-900 border border-slate-800 rounded p-3 text-xs h-24 text-slate-200 resize-none" />
      <button onClick={handleGenerate} className="btn-primary w-full py-2 text-xs">Generate Pack</button>
      {result.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-2">
          {result.map((url, idx) => (
            <img key={idx} src={url} className="w-full h-auto border border-slate-800 rounded" alt="bulk qr" />
          ))}
        </div>
      )}
    </div>
  );
};
