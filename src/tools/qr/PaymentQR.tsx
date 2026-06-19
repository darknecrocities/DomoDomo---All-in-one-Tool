import { triggerDownload } from '../../utils/sharedHelpers';
import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { CreditCard } from 'lucide-react';

export const PaymentQRTool = () => {
  const [paymentType, setPaymentType] = useState<'upi' | 'paypal'>('upi');
  const [account, setAccount] = useState('merchant@bank');
  const [name, setName] = useState('DomoDomo Store');
  const [amount, setAmount] = useState('10.00');
  const [note, setNote] = useState('Utility invoice');
  const [qrUrl, setQrUrl] = useState('');

  const generate = async () => {
    try {
      let payload = '';
      if (paymentType === 'upi') {
        payload = `upi://pay?pa=${encodeURIComponent(account)}&pn=${encodeURIComponent(name)}&am=${amount}&tn=${encodeURIComponent(note)}`;
      } else {
        payload = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${encodeURIComponent(account)}&item_name=${encodeURIComponent(note)}&amount=${amount}&currency_code=USD`;
      }
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

  useEffect(() => { generate(); }, [paymentType, account, name, amount, note]);

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-5 text-left">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="font-bold text-white flex items-center gap-2 text-lg">
          <CreditCard className="text-[#4E8E5E]" size={20} />
          <span>Payment QR Generator</span>
        </h3>
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">UPI / PayPal</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-slate-400 font-semibold">Payment Gateway Mode</label>
        <select
          value={paymentType}
          onChange={(e) => setPaymentType(e.target.value as any)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
        >
          <option value="upi">UPI (India standard payment link)</option>
          <option value="paypal">PayPal Link generation</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-slate-400 font-semibold">
          {paymentType === 'upi' ? 'UPI Address (VPA)' : 'PayPal Email/ID'}
        </label>
        <input
          type="text"
          placeholder={paymentType === 'upi' ? 'e.g. merchant@upi' : 'e.g. sales@paypal.com'}
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
        />
      </div>

      {paymentType === 'upi' && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400 font-semibold">Payee Name</label>
          <input
            type="text"
            placeholder="e.g. DomoDomo Inc"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400 font-semibold">Amount</label>
          <input
            type="number"
            placeholder="e.g. 10.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400 font-semibold">Description / Note</label>
          <input
            type="text"
            placeholder="e.g. Invoice #1024"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
          />
        </div>
      </div>

      {qrUrl && (
        <div className="flex flex-col items-center gap-4 pt-4 border-t border-slate-800/80">
          <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl flex items-center justify-center">
            <img src={qrUrl} className="w-44 h-44 rounded-xl border border-slate-800" alt="Payment QR" />
          </div>
          <button onClick={() => triggerDownload(qrUrl, 'payment_qr.png')} className="btn-primary w-full py-3 text-xs font-bold">
            Download Payment QR
          </button>
        </div>
      )}
    </div>
  );
};
