import { triggerDownload } from '../../utils/sharedHelpers';
import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { User } from 'lucide-react';



export const VCardQRTool = () => {
  const [name, setName] = useState('Arron Parejas');
  const [phone, setPhone] = useState('+6391234567');
  const [qrUrl, setQrUrl] = useState('');

  const generate = async () => {
    const payload = `BEGIN:VCARD\nVERSION:3.0\nN:${name}\nTEL:${phone}\nEND:VCARD`;
    const url = await QRCode.toDataURL(payload, { width: 300, color: { dark: '#4E8E5E', light: '#0B0F19' } });
    setQrUrl(url);
  };

  useEffect(() => { generate(); }, [name, phone]);

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2 flex items-center gap-2">
        <User size={16} /> vCard Contact QR
      </h3>
      <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200" />
      <input type="text" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200" />
      {qrUrl && (
        <div className="flex flex-col items-center gap-3">
          <img src={qrUrl} className="w-40 h-40 border border-slate-800 rounded" alt="vCard QR" />
          <button onClick={() => triggerDownload(qrUrl, 'vcard_qr.png')} className="btn-primary w-full py-2 text-xs">Download PNG</button>
        </div>
      )}
    </div>
  );
};
