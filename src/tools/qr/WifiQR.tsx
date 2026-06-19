import { triggerDownload } from '../../utils/sharedHelpers';
import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Wifi, Eye, EyeOff } from 'lucide-react';

export const WifiQRTool = () => {
  const [ssid, setSsid] = useState('MyHomeNetwork');
  const [pass, setPass] = useState('password123');
  const [encryption, setEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [hidden, setHidden] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [qrUrl, setQrUrl] = useState('');

  const generate = async () => {
    try {
      // WiFi payload standard: WIFI:S:SSID;T:WPA;P:PASSWORD;H:true;;
      const payload = `WIFI:S:${ssid};T:${encryption};P:${encryption === 'nopass' ? '' : pass};${hidden ? 'H:true' : ''};`;
      const url = await QRCode.toDataURL(payload, { 
        width: 300, 
        margin: 2,
        color: { dark: '#4E8E5E', light: '#0B0F19' } 
      });
      setQrUrl(url);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { generate(); }, [ssid, pass, encryption, hidden]);

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-5 text-left">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="font-bold text-white flex items-center gap-2 text-lg">
          <Wifi className="text-[#4E8E5E]" size={20} />
          <span>WiFi Network QR Generator</span>
        </h3>
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Credentials Card</span>
      </div>

      {/* SSID */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-slate-400 font-semibold">Network SSID Name</label>
        <input
          type="text"
          placeholder="e.g. Home_Network"
          value={ssid}
          onChange={(e) => setSsid(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
        />
      </div>

      {/* Password */}
      {encryption !== 'nopass' && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400 font-semibold">Network Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="e.g. wpa2password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-3 pr-10 py-2 text-xs text-slate-200 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      )}

      {/* Encryption Type */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-slate-400 font-semibold">Security Encryption</label>
        <select
          value={encryption}
          onChange={(e) => setEncryption(e.target.value as any)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
        >
          <option value="WPA">WPA / WPA2 (Recommended)</option>
          <option value="WEP">WEP (Legacy)</option>
          <option value="nopass">Unsecured (No Password)</option>
        </select>
      </div>

      {/* Hidden network */}
      <div className="flex items-center gap-2 mt-1">
        <input
          type="checkbox"
          id="hiddenSsid"
          checked={hidden}
          onChange={(e) => setHidden(e.target.checked)}
          className="w-4 h-4 bg-slate-900 border-slate-800 rounded text-[#4E8E5E] focus:ring-0 focus:ring-offset-0"
        />
        <label htmlFor="hiddenSsid" className="text-xs text-slate-400 cursor-pointer select-none">
          This is a hidden network (Broadcast disabled)
        </label>
      </div>

      {qrUrl && (
        <div className="flex flex-col items-center gap-4 pt-4 border-t border-slate-800/80">
          <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl flex items-center justify-center">
            <img src={qrUrl} className="w-44 h-44 rounded-xl border border-slate-800" alt="WiFi QR" />
          </div>
          <button onClick={() => triggerDownload(qrUrl, 'wifi_qr.png')} className="btn-primary w-full py-3 text-xs font-bold">
            Download WiFi QR
          </button>
        </div>
      )}
    </div>
  );
};
