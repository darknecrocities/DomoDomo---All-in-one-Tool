import { triggerDownload } from '../../utils/sharedHelpers';
import React, { useState, useRef } from 'react';
import { Download, Upload, Trash2 } from 'lucide-react';

export const FormatConverterTool = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [targetFormat, setTargetFormat] = useState('image/png');
  const [converting, setConverting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const arr = Array.from(e.target.files);
      setFiles(prev => [...prev, ...arr]);
    }
  };

  const handleRemove = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const convertFile = (file: File): Promise<void> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const c = canvasRef.current;
        if (!c) {
          resolve();
          return;
        }
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        
        const ext = targetFormat === 'image/png' ? 'png' : targetFormat === 'image/webp' ? 'webp' : 'jpg';
        const outputName = `${file.name.replace(/\.[^/.]+$/, "")}_converted.${ext}`;
        triggerDownload(c.toDataURL(targetFormat), outputName);
        resolve();
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleConvertAll = async () => {
    if (files.length === 0) return;
    setConverting(true);
    for (const file of files) {
      await convertFile(file);
    }
    setConverting(false);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-8 glass-card p-6 flex flex-col justify-center min-h-[350px]">
        {files.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <div className="p-4 bg-slate-900/60 rounded-full border border-slate-800 text-[#4E8E5E]">
              <Upload size={32} />
            </div>
            <label className="btn-primary cursor-pointer mt-2">
              <span>Choose Images</span>
              <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
            <p className="text-slate-550 text-xs">Upload multiple images to convert in bulk</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 w-full max-h-[350px] overflow-y-auto pr-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Queue ({files.length} Files)</span>
            {files.map((file, idx) => (
              <div key={idx} className="flex justify-between items-center bg-slate-950/30 p-2.5 rounded border border-slate-850 text-xs">
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-200 truncate max-w-[250px] md:max-w-[400px]">{file.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{formatSize(file.size)} | {file.type.split('/')[1].toUpperCase()}</span>
                </div>
                <button onClick={() => handleRemove(idx)} className="text-rose-400 hover:text-rose-300 p-1">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-teal-400 font-bold border-b border-slate-800 pb-2">Format Converter</h3>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400 uppercase font-semibold">Target Format</label>
            <select value={targetFormat} onChange={(e) => setTargetFormat(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-200 text-xs font-semibold focus:outline-none">
              <option value="image/png">PNG Format</option>
              <option value="image/jpeg">JPEG Format</option>
              <option value="image/webp">WebP Format</option>
            </select>
          </div>

          {files.length > 0 && (
            <div className="flex flex-col gap-2 mt-2 border-t border-slate-850 pt-3">
              <button 
                onClick={handleConvertAll} 
                disabled={converting}
                className="btn-primary w-full text-xs flex items-center justify-center gap-1.5"
              >
                <Download size={14} /> {converting ? 'Converting Queue...' : `Convert All to ${targetFormat.split('/')[1].toUpperCase()}`}
              </button>
              <button onClick={() => setFiles([])} className="btn-secondary w-full text-xs">Clear Queue</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
