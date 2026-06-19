import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';



export const PDFSplitTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState('1');

  const handleSplit = async () => {
    if (!file) return;
    try {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const newPdf = await PDFDocument.create();
      
      const indices = pages.split(',').map(p => parseInt(p.trim()) - 1).filter(idx => idx >= 0 && idx < pdf.getPageCount());
      const copied = await newPdf.copyPages(pdf, indices);
      copied.forEach(p => newPdf.addPage(p));

      const newBytes = await newPdf.save();
      triggerBlobDownload(new Blob([new Uint8Array(newBytes)], { type: 'application/pdf' }), 'split.pdf');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">Split PDF</h3>
      <input type="file" accept=".pdf" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} className="text-xs" />
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-slate-400">Pages to extract (comma separated, e.g. 1, 3)</label>
        <input type="text" value={pages} onChange={(e) => setPages(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200" />
      </div>
      {file && <button onClick={handleSplit} className="btn-primary w-full py-2 text-xs">Extract Pages</button>}
    </div>
  );
};
