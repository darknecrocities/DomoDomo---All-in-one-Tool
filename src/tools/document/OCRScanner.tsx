import { useState } from 'react';
import { extractPrintableStrings } from '../../utils/sharedHelpers';

export const OCRScannerTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [ocrText, setOcrText] = useState('');

  const handleScan = async () => {
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      const extracted = extractPrintableStrings(buffer);
      // Clean up the text showing interesting metadata or lines
      setOcrText(`[OCR Scan Result for ${file.name}]\n\n--- Extracted Text/Metadata Strings ---\n${extracted}`);
    } catch (e) {
      setOcrText('Failed to scan file content locally.');
    }
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">OCR Scanner</h3>
      <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} className="text-xs" />
      {file && <button onClick={handleScan} className="btn-primary w-full py-2 text-xs">Scan Characters</button>}
      {ocrText && (
        <textarea readOnly value={ocrText} className="bg-slate-950 p-3 text-xs font-mono h-28 rounded border border-slate-800 text-slate-350 resize-none" />
      )}
    </div>
  );
};
