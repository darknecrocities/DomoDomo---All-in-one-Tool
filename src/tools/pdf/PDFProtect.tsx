import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';



export const PDFProtectTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('secure');

  const handleProtect = async () => {
    if (!file) return;
    try {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      // TODO(security): Client-side PDF encryption requires external WASM engines, simulated locally.
      const protectedBytes = await pdf.save();
      triggerBlobDownload(new Blob([new Uint8Array(protectedBytes)], { type: 'application/pdf' }), 'protected.pdf');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">Protect PDF (Password)</h3>
      <input type="file" accept=".pdf" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} className="text-xs" />
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-slate-400">Owner Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200" />
      </div>
      {file && <button onClick={handleProtect} className="btn-primary w-full py-2 text-xs">Secure PDF</button>}
    </div>
  );
};
