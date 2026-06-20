import { triggerDownload, generateDesignedQR } from '../../utils/sharedHelpers';
import { useState, useEffect } from 'react';
import { CreditCard, Download, Sparkles, AlertCircle, Printer } from 'lucide-react';
import { QRStylingPanel } from '../../components/QRStylingPanel';
import type { QRStyleSettings } from '../../components/QRStylingPanel';

type PaymentGateway = 'upi' | 'paypal' | 'bitcoin' | 'ethereum' | 'venmo';
type Currency = 'USD' | 'EUR' | 'GBP' | 'INR';

export const PaymentQRTool = () => {
  const [paymentType, setPaymentType] = useState<PaymentGateway>('upi');
  const [account, setAccount] = useState('merchant@bank');
  const [name, setName] = useState('DomoDomo Store');
  const [amount, setAmount] = useState('10.00');
  const [note, setNote] = useState('Utility invoice');
  const [qrUrl, setQrUrl] = useState('');

  // 10 Features States
  const [currency, setCurrency] = useState<Currency>('USD');
  const [tipRate, setTipRate] = useState<number>(0);
  const [refId, setRefId] = useState('REF-' + Math.floor(100000 + Math.random() * 900000));
  const [customLogoUrl, setCustomLogoUrl] = useState('');
  const [selectedLogoPreset, setSelectedLogoPreset] = useState('link');
  const [standeeTheme, setStandeeTheme] = useState<'emerald' | 'gold' | 'neon' | 'light'>('emerald');
  const [eyeFrameColor, setEyeFrameColor] = useState('#4E8E5E');
  const [eyeBallColor, setEyeBallColor] = useState('#4E8E5E');
  const [settings, setSettings] = useState<QRStyleSettings>({
    fgColor: '#4E8E5E',
    bgColor: '#0B0F19',
    margin: 2,
    errorCorrection: 'Q',
    size: 400,
    format: 'png',
    logoPreset: 'none',
    theme: 'emerald'
  });

  const getBaseAmount = () => {
    return parseFloat(amount) || 0;
  };

  const getTotalAmount = () => {
    const base = getBaseAmount();
    const tip = base * (tipRate / 100);
    return (base + tip).toFixed(2);
  };

  const getPaymentPayload = () => {
    const finalAmount = getTotalAmount();
    const cleanAccount = account.trim();

    if (paymentType === 'upi') {
      return `upi://pay?pa=${encodeURIComponent(cleanAccount)}&pn=${encodeURIComponent(name)}&am=${finalAmount}&tn=${encodeURIComponent(note)}&tr=${refId}`;
    } else if (paymentType === 'paypal') {
      return `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${encodeURIComponent(cleanAccount)}&item_name=${encodeURIComponent(note)}&amount=${finalAmount}&currency_code=${currency}`;
    } else if (paymentType === 'bitcoin') {
      return `bitcoin:${cleanAccount}?amount=${finalAmount}&label=${encodeURIComponent(name)}&message=${encodeURIComponent(note)}`;
    } else if (paymentType === 'ethereum') {
      return `ethereum:${cleanAccount}?value=${finalAmount}&label=${encodeURIComponent(name)}`;
    } else { // venmo
      return `venmo://paycharge?txn=pay&recipients=${encodeURIComponent(cleanAccount)}&amount=${finalAmount}&note=${encodeURIComponent(note)}`;
    }
  };

  const generate = async () => {
    try {
      const payload = getPaymentPayload();
      const url = await generateDesignedQR(payload, {
        ...settings,
        eyeFrameStyle: 'rounded',
        eyeBallStyle: 'circle',
        customEyeColor: true,
        eyeFrameColor,
        eyeBallColor,
        customLogoUrl,
        logoPreset: customLogoUrl ? 'none' : selectedLogoPreset,
        logoMask: true
      });
      setQrUrl(url);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    generate();
  }, [paymentType, account, name, amount, note, currency, tipRate, refId, customLogoUrl, selectedLogoPreset, eyeFrameColor, eyeBallColor, settings]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setCustomLogoUrl(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Limit check logic
  const isExceedingLimit = getBaseAmount() > 10000;

  // Print Checkout standee card layout trigger
  const handlePrintStandee = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let themeStyles = '';
    if (standeeTheme === 'gold') {
      themeStyles = 'background: linear-gradient(135deg, #1f1f1f 0%, #111 100%); color: #E29E2D; border: 4px solid #E29E2D;';
    } else if (standeeTheme === 'neon') {
      themeStyles = 'background: #09090E; color: #BC34FA; border: 4px solid #BC34FA; text-shadow: 0 0 5px #BC34FA;';
    } else if (standeeTheme === 'light') {
      themeStyles = 'background: #ffffff; color: #111827; border: 2px solid #e5e7eb;';
    } else { // emerald
      themeStyles = 'background: linear-gradient(135deg, #06170d 0%, #030805 100%); color: #4E8E5E; border: 4px solid #4E8E5E;';
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Scan To Pay Counter Checkout Card</title>
          <style>
            body { font-family: system-ui, sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #fafafa; }
            .card { padding: 40px; border-radius: 24px; text-align: center; width: 340px; box-sizing: border-box; box-shadow: 0 10px 30px rgba(0,0,0,0.15); ${themeStyles} }
            .title { font-size: 26px; font-weight: 900; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 25px; }
            .qr-container { background: #fff; padding: 16px; border-radius: 20px; display: inline-block; margin-bottom: 20px; box-shadow: inset 0 2px 5px rgba(0,0,0,0.05); }
            .qr-img { width: 180px; height: 180px; display: block; }
            .amount { font-size: 32px; font-weight: 800; margin: 10px 0; font-mono: monospace; }
            .details { font-size: 13px; line-height: 1.6; opacity: 0.85; }
            .ref { font-family: monospace; font-size: 11px; margin-top: 15px; opacity: 0.6; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="title">SCAN TO PAY</div>
            <div class="qr-container"><img src="${qrUrl}" class="qr-img" /></div>
            <div class="amount">${currency} ${getTotalAmount()}</div>
            <div class="details">
              <strong>Payee:</strong> ${name}<br/>
              <strong>Remarks:</strong> ${note}
            </div>
            <div class="ref">REF ID: ${refId}</div>
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
              <CreditCard className="text-[#4E8E5E]" size={20} />
              <span>Checkout Payment QR Generator</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Multi-Platform support</span>
          </div>

          {/* Gateway selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold">Payment Network Protocol</label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
              >
                <option value="upi">UPI (India payments standard)</option>
                <option value="paypal">PayPal Merchant Link</option>
                <option value="bitcoin">Bitcoin Wallet Address</option>
                <option value="ethereum">Ethereum ERC-20 Address</option>
                <option value="venmo">Venmo Username</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold">
                {paymentType === 'upi' ? 'UPI Address (VPA)' : paymentType === 'paypal' ? 'PayPal ID/Email' : paymentType === 'venmo' ? 'Venmo Recipient' : 'Crypto Wallet Address'}
              </label>
              <input
                type="text"
                placeholder={paymentType === 'upi' ? 'merchant@upi' : paymentType === 'paypal' ? 'sales@shop.com' : 'e.g. 0x... or bc1...'}
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
              />
            </div>
          </div>

          {/* Custom logo & details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold">Payee Store Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold">Upload Store Logo (overlay center)</label>
              <label className="btn-secondary cursor-pointer py-2 px-3 text-xs rounded-xl text-center">
                <span>{customLogoUrl ? 'Store Logo Uploaded' : 'Choose Logo File'}</span>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Amount and currency select */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold">Billing Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold">Currency Converter</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold">Transaction Reference ID</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={refId}
                  onChange={(e) => setRefId(e.target.value)}
                  className="bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none w-full"
                />
                <button
                  onClick={() => setRefId('REF-' + Math.floor(100000 + Math.random() * 900000))}
                  className="btn-secondary py-1 px-2.5 text-[10px] rounded-lg shrink-0"
                >
                  Gen
                </button>
              </div>
            </div>
          </div>

          {/* Gratuity tipping selector presets */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-450 font-semibold">Add Tip Gratuity Preset</label>
            <div className="flex gap-2">
              {[0, 5, 10, 15, 20].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setTipRate(rate)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    tipRate === rate ? 'bg-[#4E8E5E]/20 text-[#4E8E5E] border-[#4E8E5E]' : 'bg-slate-950/40 border-slate-850 text-slate-500'
                  }`}
                >
                  {rate === 0 ? 'No Tip' : `+${rate}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Warnings Panel */}
          {isExceedingLimit && (
            <div className="text-rose-400 text-xs font-semibold bg-rose-950/20 border border-rose-900/40 p-2.5 rounded-xl flex items-center gap-1.5">
              <AlertCircle size={15} />
              <span>Safety warning: Billing amount exceeds recommended limit ($10,000 / ₹1,00,000). Double-check value.</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-semibold">Remarks note</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
            />
          </div>

          {/* Card standee customization */}
          <div className="bg-slate-900/50 p-4 border border-slate-800 rounded-2xl flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Sparkles className="text-[#4E8E5E]" size={15} />
              <span className="text-[10px] font-bold text-slate-350 uppercase tracking-wider">Custom Layout Style & Corner eye color</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-500 font-bold uppercase">Standee Theme template</label>
                <select
                  value={standeeTheme}
                  onChange={(e) => setStandeeTheme(e.target.value as any)}
                  className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="emerald">Checkout Emerald</option>
                  <option value="gold">Corporate Gold</option>
                  <option value="neon">Vibrant Cyber Neon</option>
                  <option value="light">Plain White Stand</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-500 font-bold uppercase">Center Payment Icon</label>
                <select
                  value={selectedLogoPreset}
                  onChange={(e) => {
                    setSelectedLogoPreset(e.target.value);
                    setCustomLogoUrl('');
                  }}
                  className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="link">🔗 Chain Link</option>
                  <option value="star">★ Star Icon</option>
                  <option value="phone">📞 Phone Pay</option>
                  <option value="none">None (Clean)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-550 font-bold uppercase">Eye border color</label>
                <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-850">
                  <input
                    type="color"
                    value={eyeFrameColor}
                    onChange={(e) => setEyeFrameColor(e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-[9px] text-slate-400 font-mono uppercase">{eyeFrameColor}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-550 font-bold uppercase">Eye center color</label>
                <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-850">
                  <input
                    type="color"
                    value={eyeBallColor}
                    onChange={(e) => setEyeBallColor(e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-[9px] text-slate-400 font-mono uppercase">{eyeBallColor}</span>
                </div>
              </div>
            </div>
          </div>

          <QRStylingPanel settings={settings} onChange={setSettings} />
        </div>
      </div>

      {/* Output Panel with check stand preview */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 items-center justify-between text-center min-h-[350px]">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-3 w-full">Standee preview</h3>

          {qrUrl && (
            <div className="flex flex-col items-center gap-4 w-full">
              {/* Standee visual check */}
              <div 
                className={`p-5 rounded-2xl w-full max-w-[240px] text-center border shadow-xl flex flex-col items-center gap-3 ${
                  standeeTheme === 'gold' ? 'bg-zinc-950 text-amber-500 border-amber-600' :
                  standeeTheme === 'neon' ? 'bg-purple-950/20 text-fuchsia-400 border-fuchsia-700/60' :
                  standeeTheme === 'light' ? 'bg-white text-slate-900 border-slate-200' :
                  'bg-emerald-950/10 text-emerald-400 border-emerald-900/40'
                }`}
              >
                <span className="text-[10px] font-black tracking-widest uppercase">SCAN TO PAY CHECKOUT</span>
                
                <div className="p-2 bg-white rounded-2xl shadow-inner border border-slate-100">
                  <img src={qrUrl} className="w-32 h-32 block" alt="Payment QR" />
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-slate-450 leading-tight">Payee: {name}</span>
                  <span className="text-lg font-black font-mono leading-tight">{currency} {getTotalAmount()}</span>
                </div>
                
                <span className="text-[8px] font-mono opacity-50">REF: {refId}</span>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 w-full mt-2">
                <button
                  onClick={handlePrintStandee}
                  className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 bg-[#4E8E5E]/10 hover:bg-[#4E8E5E]/20 text-[#4E8E5E] border border-[#4E8E5E]/40"
                >
                  <Printer size={14} />
                  <span>Print Checkout Standee Card</span>
                </button>
                
                <button 
                  onClick={() => triggerDownload(qrUrl, `payment_qr.${settings.format}`)} 
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
