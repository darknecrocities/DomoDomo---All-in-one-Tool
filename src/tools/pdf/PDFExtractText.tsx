import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { extractPrintableStrings } from '../../utils/sharedHelpers';

export const PDFExtractTextTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');

  const handleExtract = async () => {
    if (!file) return;
    try {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const extracted = extractPrintableStrings(bytes);
      const textOutput = `PDF Document: ${file.name}\nPages count: ${pdf.getPageCount()}\n\n--- Extracted Text/Metadata Streams ---\n${extracted}`;
      setText(textOutput);
    } catch (e) {
      console.error(e);
      setText('Failed to parse PDF text content.');
    }
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">Extract Structural Text</h3>
      <input type="file" accept=".pdf" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} className="text-xs" />
      {file && <button onClick={handleExtract} className="btn-primary w-full py-2 text-xs">Run Text Extractor</button>}
      {text && (
        <textarea readOnly value={text} className="bg-slate-950 p-3 text-xs font-mono h-32 rounded border border-slate-800 text-slate-350 resize-none mt-2" />
      )}
    </div>
  );
};
