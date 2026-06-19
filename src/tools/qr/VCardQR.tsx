import { triggerDownload } from '../../utils/sharedHelpers';
import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { User } from 'lucide-react';

export const VCardQRTool = () => {
  const [firstName, setFirstName] = useState('Arron Kian');
  const [lastName, setLastName] = useState('Parejas');
  const [phone, setPhone] = useState('+6391234567');
  const [email, setEmail] = useState('arron@domain.com');
  const [org, setOrg] = useState('DomoDomo Labs');
  const [title, setTitle] = useState('Lead Software Engineer');
  const [url, setUrl] = useState('https://github.com/arronkianparejas');
  const [qrUrl, setQrUrl] = useState('');

  const generate = async () => {
    try {
      const payload = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${lastName};${firstName};;;`,
        `FN:${firstName} ${lastName}`,
        `ORG:${org}`,
        `TITLE:${title}`,
        `TEL;TYPE=CELL:${phone}`,
        `EMAIL;TYPE=PREF,INTERNET:${email}`,
        `URL:${url}`,
        'END:VCARD'
      ].join('\n');

      const qrCodeUrl = await QRCode.toDataURL(payload, { 
        width: 300, 
        margin: 2,
        color: { dark: '#4E8E5E', light: '#0B0F19' } 
      });
      setQrUrl(qrCodeUrl);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { generate(); }, [firstName, lastName, phone, email, org, title, url]);

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-5 text-left">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="font-bold text-white flex items-center gap-2 text-lg">
          <User className="text-[#4E8E5E]" size={20} />
          <span>vCard Contact QR</span>
        </h3>
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Contact Card</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400 font-semibold">First Name</label>
          <input
            type="text"
            placeholder="e.g. John"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400 font-semibold">Last Name</label>
          <input
            type="text"
            placeholder="e.g. Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400 font-semibold">Phone Number</label>
          <input
            type="tel"
            placeholder="e.g. +1 555-0199"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400 font-semibold">Email Address</label>
          <input
            type="email"
            placeholder="e.g. john@doe.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400 font-semibold">Organization</label>
          <input
            type="text"
            placeholder="e.g. Acme Corp"
            value={org}
            onChange={(e) => setOrg(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400 font-semibold">Job Title</label>
          <input
            type="text"
            placeholder="e.g. Director"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-slate-400 font-semibold">Website URL</label>
        <input
          type="url"
          placeholder="e.g. https://domain.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
        />
      </div>

      {qrUrl && (
        <div className="flex flex-col items-center gap-4 pt-4 border-t border-slate-800/80">
          <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl flex items-center justify-center">
            <img src={qrUrl} className="w-44 h-44 rounded-xl border border-slate-800" alt="vCard QR" />
          </div>
          <button onClick={() => triggerDownload(qrUrl, 'vcard_qr.png')} className="btn-primary w-full py-3 text-xs font-bold">
            Download vCard QR
          </button>
        </div>
      )}
    </div>
  );
};
