import { useState } from 'react';
import { parseZipFiles } from '../../utils/sharedHelpers';

export const ZipExtractorTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [list, setList] = useState<string[]>([]);

  const handleInspect = async () => {
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      const files = parseZipFiles(buffer);
      setList(files);
    } catch (e) {
      setList(['Failed to parse ZIP directory headers.']);
    }
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">ZIP Extractor</h3>
      <input type="file" accept=".zip" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} className="text-xs" />
      {file && <button onClick={handleInspect} className="btn-primary w-full py-2 text-xs">Inspect Zip Package</button>}
      {list.length > 0 && (
        <div className="flex flex-col gap-1.5 mt-2 bg-slate-950/60 p-3 rounded border border-slate-850 text-xs text-slate-300 font-mono">
          {list.map((f, idx) => <span key={idx}>📄 {f}</span>)}
        </div>
      )}
    </div>
  );
};
