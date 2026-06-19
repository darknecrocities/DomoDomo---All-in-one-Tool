import { useState } from 'react';




export const PDFViewerTool = () => {
  const [url, setUrl] = useState('');

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div className="max-w-4xl mx-auto glass-card p-6 flex flex-col gap-4 text-left h-[500px]">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">PDF Local Viewer</h3>
      <input type="file" accept=".pdf" onChange={handleUpload} className="text-xs" />
      {url ? (
        <iframe src={url} className="w-full flex-1 rounded border border-slate-800 bg-white" />
      ) : (
        <div className="flex-1 flex items-center justify-center border border-slate-800 rounded bg-slate-950/20 text-xs text-slate-500">
          Upload PDF to open frame
        </div>
      )}
    </div>
  );
};
