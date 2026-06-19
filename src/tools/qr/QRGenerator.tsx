import { triggerDownload } from '../../utils/sharedHelpers';
import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { QrCode, Download } from 'lucide-react';

export const QRGeneratorTool = () => {
  const [text, setText] = useState('https://github.com/arronkianparejas');
  const [qrUrl, setQrUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    try {
      const url = await QRCode.toDataURL(text || 'DomoDomo', {
        width: 400,
        margin: 2,
        color: { dark: '#4E8E5E', light: '#0B0F19' }
      });
      setQrUrl(url);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { generate(); }, [text]);

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-5 text-left">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="font-bold text-white flex items-center gap-2 text-lg">
          <QrCode className="text-[#4E8E5E]" size={20} />
          <span>QR Code Generator</span>
        </h3>
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Quick Link</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-slate-405 font-semibold">QR Code Data / URL</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text or paste url link..."
          className="w-full bg-[#151C2C]/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E] h-20 resize-none outline-none leading-relaxed"
        />
      </div>

      {qrUrl && (
        <div className="flex flex-col items-center gap-4 pt-4 border-t border-slate-800/80">
          <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl flex items-center justify-center">
            <img src={qrUrl} className="w-44 h-44 rounded-xl border border-slate-800" alt="QR code" />
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={() => {
                navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="btn-secondary flex-1 py-2.5 text-xs"
            >
              {copied ? 'Link Copied!' : 'Copy Payload'}
            </button>
            <button onClick={() => triggerDownload(qrUrl, 'qrcode.png')} className="btn-primary flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5">
              <Download size={15} />
              <span>Save PNG</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
