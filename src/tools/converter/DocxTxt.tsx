import { triggerFileDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';



export const DocxTxtTool = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleConvert = () => {
    if (!file) return;
    triggerFileDownload(new Blob([`TXT extract of ${file.name}`], { type: 'text/plain' }), 'document.txt');
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">DOCX ↔ TXT Converter</h3>
      <input type="file" accept=".docx" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} className="text-xs" />
      {file && <button onClick={handleConvert} className="btn-primary w-full py-2 text-xs">Convert to TXT</button>}
    </div>
  );
};
