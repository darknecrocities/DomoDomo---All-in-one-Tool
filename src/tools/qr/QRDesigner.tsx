import { triggerDownload } from '../../utils/sharedHelpers';
import { useState, useEffect } from 'react';
import QRCode from 'qrcode';




export const QRDesignerTool = () => {
  const [text, setText] = useState('Designed QR');
  const [color, setColor] = useState('#4E8E5E');
  const [qrUrl, setQrUrl] = useState('');

  const generate = async () => {
    const url = await QRCode.toDataURL(text, { width: 300, color: { dark: color, light: '#0B0F19' } });
    setQrUrl(url);
  };

  useEffect(() => { generate(); }, [text, color]);

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">QR Designer</h3>
      <input type="text" value={text} onChange={(e) => setText(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200" />
      <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-8 bg-transparent border border-slate-800 cursor-pointer" />
      {qrUrl && (
        <div className="flex flex-col items-center gap-3">
          <img src={qrUrl} className="w-40 h-40 border border-slate-800 rounded" alt="Designed QR" />
          <button onClick={() => triggerDownload(qrUrl, 'designed_qr.png')} className="btn-primary w-full py-2 text-xs">Download designed QR</button>
        </div>
      )}
    </div>
  );
};
