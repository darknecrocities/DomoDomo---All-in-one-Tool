import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';



export const PDFCompressTool = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleCompress = async () => {
    if (!file) return;
    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const compressedBytes = await pdf.save({ useObjectStreams: true });
    triggerBlobDownload(new Blob([new Uint8Array(compressedBytes)], { type: 'application/pdf' }), 'compressed.pdf');
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">Compress PDF</h3>
      <input type="file" accept=".pdf" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} className="text-xs" />
      {file && <button onClick={handleCompress} className="btn-primary w-full py-2 text-xs">Rebuild & Optimize Size</button>}
    </div>
  );
};
