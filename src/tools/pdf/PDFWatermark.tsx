import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';



export const PDFWatermarkTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [stamp, setStamp] = useState('CONFIDENTIAL');

  const handleStamp = async () => {
    if (!file) return;
    try {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const font = await pdf.embedFont(StandardFonts.HelveticaBold);
      const pages = pdf.getPages();
      pages.forEach(page => {
        page.drawText(stamp, {
          x: page.getWidth() * 0.1,
          y: page.getHeight() * 0.5,
          size: 50,
          font,
          color: rgb(0.7, 0.2, 0.2),
          opacity: 0.35,
          rotate: degrees(45)
        });
      });
      const stampedBytes = await pdf.save();
      triggerBlobDownload(new Blob([new Uint8Array(stampedBytes)], { type: 'application/pdf' }), 'watermarked.pdf');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">PDF Watermark</h3>
      <input type="file" accept=".pdf" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} className="text-xs" />
      <input type="text" value={stamp} onChange={(e) => setStamp(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200" />
      {file && <button onClick={handleStamp} className="btn-primary w-full py-2 text-xs">Stamp PDF Pages</button>}
    </div>
  );
};
