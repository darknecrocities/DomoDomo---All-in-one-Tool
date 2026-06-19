import { triggerDownload } from '../../utils/sharedHelpers';
import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Calendar } from 'lucide-react';



export const EventQRTool = () => {
  const [title, setTitle] = useState('Meeting');
  const [date, setDate] = useState('2026-06-19');
  const [qrUrl, setQrUrl] = useState('');

  const generate = async () => {
    const payload = `BEGIN:VEVENT\nSUMMARY:${title}\nDTSTART:${date.replace(/-/g, '')}T090000Z\nEND:VEVENT`;
    const url = await QRCode.toDataURL(payload, { width: 300, color: { dark: '#4E8E5E', light: '#0B0F19' } });
    setQrUrl(url);
  };

  useEffect(() => { generate(); }, [title, date]);

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2 flex items-center gap-2">
        <Calendar size={16} /> Event Calendar QR
      </h3>
      <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200" />
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200" />
      {qrUrl && (
        <div className="flex flex-col items-center gap-3">
          <img src={qrUrl} className="w-40 h-40 border border-slate-800 rounded" alt="Event QR" />
          <button onClick={() => triggerDownload(qrUrl, 'event_qr.png')} className="btn-primary w-full py-2 text-xs">Download PNG</button>
        </div>
      )}
    </div>
  );
};
