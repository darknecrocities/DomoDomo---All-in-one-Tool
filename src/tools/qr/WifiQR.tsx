import { triggerDownload, generateDesignedQR } from '../../utils/sharedHelpers';
import { useState, useEffect } from 'react';
import { Wifi, Eye, EyeOff, Download, Printer, ShieldAlert, Sparkles } from 'lucide-react';
import { QRStylingPanel } from '../../components/QRStylingPanel';
import type { QRStyleSettings } from '../../components/QRStylingPanel';

type CardTheme = 'minimalist' | 'polaroid' | 'cafe' | 'corporate';

export const WifiQRTool = () => {
  const [ssid, setSsid] = useState('MyHomeNetwork');
  const [pass, setPass] = useState('password123');
  const [encryption, setEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [hidden, setHidden] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  
  // 10 Features variables
  const [cardTheme, setCardTheme] = useState<CardTheme>('minimalist');
  const [cardHeader, setCardHeader] = useState('SCAN TO CONNECT');
  const [showCredentialsOnCard, setShowCredentialsOnCard] = useState(true);
  const [guestSsid, setGuestSsid] = useState('Guest_Network');
  const [guestPass, setGuestPass] = useState('guestpass123');
  const [dualNetworkMode, setDualNetworkMode] = useState(false);
  const [guestQrUrl, setGuestQrUrl] = useState('');
  const [wifiLogo, setWifiLogo] = useState('wifi');
  const [moduleStyle, setModuleStyle] = useState<'square' | 'circle' | 'rounded'>('rounded');

  const [settings, setSettings] = useState<QRStyleSettings>({
    fgColor: '#4E8E5E',
    bgColor: '#0B0F19',
    margin: 2,
    errorCorrection: 'Q',
    size: 400,
    format: 'png',
    logoPreset: 'wifi',
    theme: 'emerald'
  });

  const generate = async () => {
    try {
      const mainPayload = `WIFI:S:${ssid};T:${encryption};P:${encryption === 'nopass' ? '' : pass};${hidden ? 'H:true' : ''};`;
      const mainUrl = await generateDesignedQR(mainPayload, {
        ...settings,
        moduleStyle,
        logoPreset: wifiLogo
      });
      setQrUrl(mainUrl);

      if (dualNetworkMode) {
        const guestPayload = `WIFI:S:${guestSsid};T:WPA;P:${guestPass};;`;
        const guestUrl = await generateDesignedQR(guestPayload, {
          ...settings,
          moduleStyle,
          logoPreset: wifiLogo
        });
        setGuestQrUrl(guestUrl);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    generate();
  }, [ssid, pass, encryption, hidden, settings, dualNetworkMode, guestSsid, guestPass, cardTheme, cardHeader, wifiLogo, moduleStyle]);

  // Network Security diagnostics checking
  const isWep = encryption === 'WEP';
  const isNoPass = encryption === 'nopass';
  const passTooShort = encryption !== 'nopass' && pass.length < 8;

  // Print Card layout trigger
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let themeStyles = '';
    if (cardTheme === 'polaroid') {
      themeStyles = 'background: #f7fafc; border: 12px solid #fff; border-bottom: 45px solid #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.15);';
    } else if (cardTheme === 'cafe') {
      themeStyles = 'background: linear-gradient(135deg, #efebe9 0%, #d7ccc8 100%); color: #4e342e; border: 4px solid #8d6e63;';
    } else if (cardTheme === 'corporate') {
      themeStyles = 'background: #111827; color: #f3f4f6; border: 2px solid #374151;';
    } else {
      themeStyles = 'background: #ffffff; color: #111827; border: 2px solid #e5e7eb;';
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>WiFi Access Standee Card</title>
          <style>
            body { font-family: system-ui, sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #fafafa; }
            .card { padding: 30px; border-radius: 16px; text-align: center; width: 340px; box-sizing: border-box; ${themeStyles} }
            .header { font-size: 22px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 20px; }
            .qr-wrapper { background: #fff; padding: 12px; border-radius: 12px; display: inline-block; margin-bottom: 15px; box-shadow: inset 0 1px 3px rgba(0,0,0,0.05); }
            .qr-img { width: 180px; height: 180px; display: block; }
            .details { font-size: 13px; margin-top: 15px; line-height: 1.6; }
            .ssid-label { font-weight: 700; }
            .pass-label { font-family: monospace; font-size: 12px; background: rgba(0,0,0,0.05); padding: 2px 6px; border-radius: 4px; }
            .dual-grid { display: flex; gap: 20px; justify-content: center; }
            .dual-card { width: 200px; }
            .dual-qr-img { width: 140px; height: 140px; }
          </style>
        </head>
        <body>
          <div class="card ${dualNetworkMode ? 'dual-card' : ''}">
            <div class="header">${cardHeader}</div>
            
            ${dualNetworkMode ? `
              <div class="dual-grid">
                <div>
                  <div class="qr-wrapper"><img src="${qrUrl}" class="dual-qr-img" /></div>
                  <div class="details">
                    <span class="ssid-label">SSID:</span> ${ssid}<br/>
                    ${showCredentialsOnCard ? `<span class="ssid-label">PASS:</span> <span class="pass-label">${pass}</span>` : ''}
                  </div>
                </div>
                <div>
                  <div class="qr-wrapper"><img src="${guestQrUrl}" class="dual-qr-img" /></div>
                  <div class="details">
                    <span class="ssid-label">SSID (Guest):</span> ${guestSsid}<br/>
                    ${showCredentialsOnCard ? `<span class="ssid-label">PASS:</span> <span class="pass-label">${guestPass}</span>` : ''}
                  </div>
                </div>
              </div>
            ` : `
              <div class="qr-wrapper"><img src="${qrUrl}" class="qr-img" /></div>
              <div class="details">
                <span class="ssid-label">Network Name (SSID):</span> ${ssid}<br/>
                ${showCredentialsOnCard && encryption !== 'nopass' ? `<span class="ssid-label">Security Key:</span> <span class="pass-label">${pass}</span>` : ''}
              </div>
            `}
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
      {/* Settings Panel */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white flex items-center gap-2 text-lg">
              <Wifi className="text-[#4E8E5E]" size={20} />
              <span>WiFi Network QR Generator</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Credentials Standee Card</span>
          </div>

          {/* Core WiFi Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold">Network SSID Name</label>
              <input
                type="text"
                placeholder="e.g. Home_Network"
                value={ssid}
                onChange={(e) => setSsid(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold">Security Encryption</label>
              <select
                value={encryption}
                onChange={(e) => setEncryption(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
              >
                <option value="WPA">WPA / WPA2 (Recommended)</option>
                <option value="WEP">WEP (Legacy)</option>
                <option value="nopass">Unsecured (No Password)</option>
              </select>
            </div>
          </div>

          {/* Password Input */}
          {encryption !== 'nopass' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold font-medium">Network Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="e.g. wpa2password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-3 pr-10 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-550 hover:text-slate-350"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* Security alerts indicator */}
          {(isWep || isNoPass || passTooShort) && (
            <div className="text-amber-400 text-xs font-semibold bg-amber-950/20 border border-amber-900/40 p-2.5 rounded-xl flex items-start gap-2">
              <ShieldAlert size={15} className="shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="font-bold">Security Diagnostics Alert</span>
                <span className="text-[10px] text-slate-400">
                  {isNoPass && 'Unsecured network requires no authentication, leaving traffic open.'}
                  {isWep && 'WEP encryption is cryptographically broken and easily hacked.'}
                  {passTooShort && 'Passwords must contain at least 8 characters for minimum standard security.'}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hiddenSsid"
              checked={hidden}
              onChange={(e) => setHidden(e.target.checked)}
              className="w-4 h-4 bg-slate-900 border-slate-800 rounded text-[#4E8E5E] focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <label htmlFor="hiddenSsid" className="text-xs text-slate-400 cursor-pointer select-none">
              This is a hidden network (Broadcast SSID disabled)
            </label>
          </div>

          {/* Dual Network guest toggle */}
          <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-850 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-200">Dual Network Mode</span>
                <span className="text-[10px] text-slate-500">Provide Guest WiFi alongside primary</span>
              </div>
              <input
                type="checkbox"
                checked={dualNetworkMode}
                onChange={(e) => setDualNetworkMode(e.target.checked)}
                className="w-4 h-4 bg-slate-900 border-slate-800 rounded text-[#4E8E5E] focus:ring-0 cursor-pointer"
              />
            </div>

            {dualNetworkMode && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-slate-900">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 font-semibold">Guest SSID Name</label>
                  <input
                    type="text"
                    value={guestSsid}
                    onChange={(e) => setGuestSsid(e.target.value)}
                    className="bg-slate-900 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 font-semibold">Guest Password</label>
                  <input
                    type="password"
                    value={guestPass}
                    onChange={(e) => setGuestPass(e.target.value)}
                    className="bg-slate-900 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Standee card customizations */}
          <div className="bg-slate-900/50 p-4 border border-slate-800 rounded-2xl flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Sparkles className="text-[#4E8E5E]" size={15} />
              <span className="text-[10px] font-bold text-slate-350 uppercase tracking-wider">Printable Standee Customizer</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-500 font-bold uppercase">Card Layout theme</label>
                <select
                  value={cardTheme}
                  onChange={(e) => setCardTheme(e.target.value as any)}
                  className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="minimalist">Minimalist White</option>
                  <option value="polaroid">Polaroid Frame</option>
                  <option value="cafe">Cozy Cafe Coffee</option>
                  <option value="corporate">Sleek Dark Mode</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-500 font-bold uppercase">Card Header Title</label>
                <input
                  type="text"
                  value={cardHeader}
                  onChange={(e) => setCardHeader(e.target.value)}
                  className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-500 font-bold uppercase">WiFi Center Icon</label>
                <select
                  value={wifiLogo}
                  onChange={(e) => setWifiLogo(e.target.value)}
                  className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="wifi">📶 WiFi arcs</option>
                  <option value="link">🔗 Link Icon</option>
                  <option value="star">★ Star Icon</option>
                  <option value="none">None (Clean)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-500 font-bold uppercase">QR Pixel dot style</label>
                <select
                  value={moduleStyle}
                  onChange={(e) => setModuleStyle(e.target.value as any)}
                  className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="square">Square Blocks</option>
                  <option value="circle">Circular Dots</option>
                  <option value="rounded">Rounded Squares</option>
                </select>
              </div>

              <div className="flex items-center gap-2 select-none cursor-pointer mt-3">
                <input
                  type="checkbox"
                  id="showCredsOnCard"
                  checked={showCredentialsOnCard}
                  onChange={(e) => setShowCredentialsOnCard(e.target.checked)}
                  className="w-3.5 h-3.5 bg-slate-900 border-slate-800 rounded text-[#4E8E5E] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="showCredsOnCard" className="text-xs text-slate-400 cursor-pointer select-none">
                  Display Password value text on card
                </label>
              </div>
            </div>
          </div>

          <QRStylingPanel settings={settings} onChange={setSettings} />
        </div>
      </div>

      {/* Output Panel */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 items-center justify-between text-center min-h-[350px]">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-3 w-full">Card standee preview</h3>

          {qrUrl && (
            <div className="flex flex-col items-center gap-4 w-full">
              {/* Styled Mock Standee Card */}
              <div 
                className={`p-5 rounded-2xl text-center w-full max-w-[240px] border shadow-xl transition-all ${
                  cardTheme === 'polaroid' ? 'bg-slate-50 border-white text-slate-900 border-b-[40px]' :
                  cardTheme === 'cafe' ? 'bg-amber-100/90 text-amber-900 border-amber-800' :
                  cardTheme === 'corporate' ? 'bg-slate-950 text-slate-100 border-slate-850' :
                  'bg-white text-slate-900 border-slate-200'
                }`}
              >
                <span className="text-xs font-black uppercase tracking-wider block mb-3">{cardHeader}</span>
                
                {dualNetworkMode ? (
                  <div className="flex flex-col gap-3 items-center">
                    <div className="p-2 bg-white rounded-xl">
                      <img src={qrUrl} className="w-24 h-24 block" alt="Primary QR" />
                    </div>
                    <span className="text-[9px] font-bold block">SSID: {ssid}</span>
                    
                    <div className="p-2 bg-white rounded-xl mt-1">
                      <img src={guestQrUrl} className="w-24 h-24 block" alt="Guest QR" />
                    </div>
                    <span className="text-[9px] font-bold block">SSID: {guestSsid}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-2.5 bg-white rounded-xl shadow-inner border border-slate-100">
                      <img src={qrUrl} className="w-32 h-32 block" alt="WiFi QR" />
                    </div>
                    <div className="text-[10px] mt-1 text-left w-full leading-normal">
                      <div><span className="font-bold">SSID:</span> {ssid}</div>
                      {showCredentialsOnCard && encryption !== 'nopass' && (
                        <div className="truncate"><span className="font-bold">Password:</span> {pass}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 w-full mt-2">
                <button 
                  onClick={handlePrint}
                  className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 bg-[#4E8E5E]/10 hover:bg-[#4E8E5E]/20 text-[#4E8E5E] border border-[#4E8E5E]/40"
                >
                  <Printer size={14} />
                  <span>Print WiFi Standee Card</span>
                </button>
                
                <button 
                  onClick={() => triggerDownload(qrUrl, `wifi_qr.${settings.format}`)} 
                  className="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Download size={15} />
                  <span>Download {settings.format.toUpperCase()}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
