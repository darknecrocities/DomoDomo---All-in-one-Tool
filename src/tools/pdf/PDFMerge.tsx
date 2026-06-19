import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Upload, ArrowUp, ArrowDown, Trash2, FileText, Check, ShieldAlert } from 'lucide-react';

export const PDFMergeTool = () => {
  const [files, setFiles] = useState<{ id: string; file: File; name: string; size: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [outputName, setOutputName] = useState('merged_document');
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const arr = Array.from(e.target.files).map(f => ({
      id: Math.random().toString(),
      file: f,
      name: f.name,
      size: (f.size / 1024 / 1024).toFixed(2) + ' MB'
    }));
    setFiles(prev => [...prev, ...arr]);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setFiles(prev => {
      const arr = [...prev];
      const temp = arr[index];
      arr[index] = arr[index - 1];
      arr[index - 1] = temp;
      return arr;
    });
  };

  const moveDown = (index: number) => {
    if (index === files.length - 1) return;
    setFiles(prev => {
      const arr = [...prev];
      const temp = arr[index];
      arr[index] = arr[index + 1];
      arr[index + 1] = temp;
      return arr;
    });
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    setLoading(true);
    setSuccess(false);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const item of files) {
        const fileBytes = await item.file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      const bytes = await mergedPdf.save();
      const cleanName = outputName.trim().replace(/[^a-zA-Z0-9_\-]/g, '_') || 'merged';
      triggerBlobDownload(
        new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }),
        `${cleanName}.pdf`
      );
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error(e);
      alert('Error merging PDFs. Please check if files are password protected.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Input / Queue Panel */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 text-left">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="text-[#4E8E5E]" size={22} />
              <span>Merge PDF Documents</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">Combine pages locally</span>
          </div>

          {/* Upload Area */}
          <div className="border border-dashed border-slate-800 rounded-2xl p-8 bg-slate-950/20 text-center flex flex-col items-center gap-3">
            <div className="p-4 bg-slate-900/60 rounded-full border border-slate-800 text-[#4E8E5E]">
              <Upload size={32} />
            </div>
            <label className="btn-primary cursor-pointer mt-1">
              <span>Choose PDF Files</span>
              <input
                type="file"
                multiple
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <p className="text-slate-500 text-xs">Upload 2 or more PDF documents to merge</p>
          </div>

          {/* Queue List */}
          {files.length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Queue Order</span>
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                {files.map((item, index) => (
                  <div key={item.id} className="flex justify-between items-center bg-slate-900/40 p-3 rounded-xl border border-slate-850 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="bg-slate-950 p-2 rounded text-slate-400 shrink-0">
                        <FileText size={16} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-slate-200 font-semibold truncate max-w-[200px] sm:max-w-md">{item.name}</span>
                        <span className="text-[10px] text-slate-500">{item.size}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className="p-1.5 bg-slate-950/60 rounded hover:bg-slate-800 text-slate-400 disabled:opacity-20 disabled:hover:bg-slate-950/60"
                        title="Move Up"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === files.length - 1}
                        className="p-1.5 bg-slate-950/60 rounded hover:bg-slate-800 text-slate-400 disabled:opacity-20 disabled:hover:bg-slate-950/60"
                        title="Move Down"
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        onClick={() => setFiles(prev => prev.filter(i => i.id !== item.id))}
                        className="p-1.5 bg-slate-950/60 rounded hover:bg-rose-950/30 text-rose-400 hover:text-rose-350 transition-colors"
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Control Panel */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 text-left">
          <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3">Merge Settings</h3>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-400 font-medium">Output Filename</label>
            <div className="relative">
              <input
                type="text"
                value={outputName}
                onChange={(e) => setOutputName(e.target.value)}
                className="w-full bg-[#151C2C]/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E] transition-colors"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">.pdf</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={handleMerge}
              disabled={files.length < 2 || loading}
              className="btn-primary w-full py-3"
            >
              {success ? <Check size={18} /> : <FileText size={18} />}
              <span>{loading ? 'Merging...' : success ? 'Merged & Downloaded!' : 'Merge PDFs'}</span>
            </button>
            <p className="text-[10px] text-slate-500 text-center leading-relaxed">
              Merging requires at least 2 files in the queue.
            </p>
          </div>
        </div>

        {/* Local Processing Banner */}
        <div className="bg-[#151C2C]/50 border border-slate-800 rounded-2xl p-4 flex gap-3 text-slate-400 text-left">
          <ShieldAlert size={20} className="text-[#4E8E5E] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-slate-300">100% Client-Side Merging</span>
            <span className="text-[10px] leading-relaxed">All file stream loading and page copying processes fully in-browser using standard javascript arrays.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
