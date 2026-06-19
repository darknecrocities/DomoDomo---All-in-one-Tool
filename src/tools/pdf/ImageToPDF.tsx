import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';



export const ImageToPDFTool = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleConvert = async () => {
    if (!file) return;
    try {
      const pdf = await PDFDocument.create();
      const imgBytes = await file.arrayBuffer();
      let pageImage;
      if (file.type === 'image/png' || file.name.endsWith('.png')) {
        pageImage = await pdf.embedPng(imgBytes);
      } else {
        pageImage = await pdf.embedJpg(imgBytes);
      }
      const page = pdf.addPage([pageImage.width, pageImage.height]);
      page.drawImage(pageImage, { x: 0, y: 0, width: pageImage.width, height: pageImage.height });
      
      const bytes = await pdf.save();
      triggerBlobDownload(new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }), 'image.pdf');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">Image → PDF Converter</h3>
      <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} className="text-xs" />
      {file && <button onClick={handleConvert} className="btn-primary w-full py-2 text-xs">Convert to PDF</button>}
    </div>
  );
};
