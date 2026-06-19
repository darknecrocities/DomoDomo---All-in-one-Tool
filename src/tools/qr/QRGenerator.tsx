import { triggerDownload } from '../../utils/sharedHelpers';
import { useState, useEffect } from 'react';
import QRCode from 'qrcode';




export const QRGeneratorTool = () => {
  const [text, setText] = useState('https://github.com/arronkianparejas');
  const [qrUrl, setQrUrl] = useState('');

  const generate = async () => {
    try {
      const url = await QRCode.toDataURL(text || 'DomoDomo', {
        width: 400,
        margin: 4,
        color: { dark: '#4E8E5E', light: '#0B0F19' }
      });
      setQrUrl(url);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { generate(); }, [text]);

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">QR Code Generator</h3>
      <input type="text" value={text} onChange={(e) => setText(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200" />
      {qrUrl && (
        <div className="flex flex-col items-center gap-3">
          <img src={qrUrl} className="w-48 h-48 border border-slate-800 rounded" alt="QR code" />
          <button onClick={() => triggerDownload(qrUrl, 'qrcode.png')} className="btn-primary w-full py-2 text-xs">Download PNG</button>
        </div>
      )}
    </div>
  );
};
