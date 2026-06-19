import { triggerDownload } from '../../utils/sharedHelpers';
import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Wifi } from 'lucide-react';



export const WifiQRTool = () => {
  const [ssid, setSsid] = useState('MyNetwork');
  const [pass, setPass] = useState('password123');
  const [qrUrl, setQrUrl] = useState('');

  const generate = async () => {
    try {
      const payload = `WIFI:S:${ssid};T:WPA;P:${pass};;`;
      const url = await QRCode.toDataURL(payload, { width: 300, color: { dark: '#4E8E5E', light: '#0B0F19' } });
      setQrUrl(url);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { generate(); }, [ssid, pass]);

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2 flex items-center gap-2">
        <Wifi size={16} /> WiFi QR Generator
      </h3>
      <input type="text" placeholder="SSID" value={ssid} onChange={(e) => setSsid(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200" />
      <input type="text" placeholder="Password" value={pass} onChange={(e) => setPass(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200" />
      {qrUrl && (
        <div className="flex flex-col items-center gap-3">
          <img src={qrUrl} className="w-40 h-40 border border-slate-800 rounded" alt="WiFi QR" />
          <button onClick={() => triggerDownload(qrUrl, 'wifi_qr.png')} className="btn-primary w-full py-2 text-xs">Download PNG</button>
        </div>
      )}
    </div>
  );
};
