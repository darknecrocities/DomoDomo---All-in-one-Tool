import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';



export const PDFMergeTool = () => {
  const [files, setFiles] = useState<{ id: string; file: File; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleMerge = async () => {
    if (files.length < 2) return;
    setLoading(true);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const item of files) {
        const fileBytes = await item.file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      const bytes = await mergedPdf.save();
      triggerBlobDownload(new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }), 'merged.pdf');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">Merge PDFs</h3>
      <input type="file" multiple accept=".pdf" onChange={(e) => {
        if (!e.target.files) return;
        const arr = Array.from(e.target.files).map(f => ({ id: Math.random().toString(), file: f, name: f.name }));
        setFiles(prev => [...prev, ...arr]);
      }} className="text-xs" />
      {files.map((item) => (
        <div key={item.id} className="flex justify-between items-center bg-slate-900/60 p-2 rounded border border-slate-850 text-xs">
          <span>{item.name}</span>
          <button onClick={() => setFiles(prev => prev.filter(i => i.id !== item.id))} className="text-rose-400 hover:underline">Remove</button>
        </div>
      ))}
      {files.length >= 2 && (
        <button onClick={handleMerge} disabled={loading} className="btn-primary w-full py-2 text-xs">
          {loading ? 'Merging...' : 'Merge PDFs'}
        </button>
      )}
    </div>
  );
};
