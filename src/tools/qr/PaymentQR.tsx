import { triggerDownload } from '../../utils/sharedHelpers';
import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { CreditCard } from 'lucide-react';



export const PaymentQRTool = () => {
  const [account, setAccount] = useState('merchant@bank');
  const [amount, setAmount] = useState('10.00');
  const [qrUrl, setQrUrl] = useState('');

  const generate = async () => {
    const payload = `upi://pay?pa=${account}&am=${amount}`;
    const url = await QRCode.toDataURL(payload, { width: 300, color: { dark: '#4E8E5E', light: '#0B0F19' } });
    setQrUrl(url);
  };

  useEffect(() => { generate(); }, [account, amount]);

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2 flex items-center gap-2">
        <CreditCard size={16} /> Payment UPI QR
      </h3>
      <input type="text" placeholder="Account ID" value={account} onChange={(e) => setAccount(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200" />
      <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200" />
      {qrUrl && (
        <div className="flex flex-col items-center gap-3">
          <img src={qrUrl} className="w-40 h-40 border border-slate-800 rounded" alt="Payment QR" />
          <button onClick={() => triggerDownload(qrUrl, 'payment_qr.png')} className="btn-primary w-full py-2 text-xs">Download PNG</button>
        </div>
      )}
    </div>
  );
};
