import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Upload, FileText, Check, ShieldAlert, Scissors } from 'lucide-react';

export const PDFSplitTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [rangeInput, setRangeInput] = useState('1');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setSuccess(false);
      try {
        const bytes = await selected.arrayBuffer();
        const pdf = await PDFDocument.load(bytes);
        setPageCount(pdf.getPageCount());
      } catch (err) {
        console.error(err);
        alert('Invalid PDF file or format.');
        setFile(null);
        setPageCount(null);
      }
    }
  };

  const handleSplit = async () => {
    if (!file || !pageCount) return;
    setLoading(true);
    setSuccess(false);
    try {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const newPdf = await PDFDocument.create();

      // Parse rangeInput (e.g. "1, 3, 5-8")
      const pagesToExtract: number[] = [];
      const parts = rangeInput.split(',');

      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.includes('-')) {
          const [startStr, endStr] = trimmed.split('-');
          const start = parseInt(startStr);
          const end = parseInt(endStr);
          if (!isNaN(start) && !isNaN(end)) {
            for (let i = start; i <= end; i++) {
              pagesToExtract.push(i - 1); // 0-indexed indices
            }
          }
        } else {
          const num = parseInt(trimmed);
          if (!isNaN(num)) {
            pagesToExtract.push(num - 1);
          }
        }
      }

      // Filter valid indices
      const validIndices = pagesToExtract.filter(idx => idx >= 0 && idx < pageCount);
      if (validIndices.length === 0) {
        alert('No valid pages selected for extraction.');
        setLoading(false);
        return;
      }

      const copied = await newPdf.copyPages(pdf, validIndices);
      copied.forEach(p => newPdf.addPage(p));

      const newBytes = await newPdf.save();
      const cleanBaseName = file.name.replace(/\.[^/.]+$/, "");
      triggerBlobDownload(
        new Blob([new Uint8Array(newBytes)], { type: 'application/pdf' }),
        `${cleanBaseName}_extracted.pdf`
      );
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error(e);
      alert('Error splitting PDF file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Editor Panel */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 text-left">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Scissors className="text-[#4E8E5E]" size={22} />
              <span>Split PDF Document</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">Extract specific pages</span>
          </div>

          {!file ? (
            <div className="border border-dashed border-slate-800 rounded-2xl p-8 bg-slate-950/20 text-center flex flex-col items-center gap-3">
              <div className="p-4 bg-slate-900/60 rounded-full border border-slate-800 text-[#4E8E5E]">
                <Upload size={32} />
              </div>
              <label className="btn-primary cursor-pointer mt-1">
                <span>Choose PDF File</span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-slate-500 text-xs">Select a PDF file to extract pages</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 bg-slate-900/30 p-4 rounded-xl border border-slate-850">
              <div className="flex items-center gap-3">
                <FileText className="text-[#4E8E5E]" size={24} />
                <div className="flex flex-col">
                  <span className="text-slate-200 text-xs font-bold">{file.name}</span>
                  <span className="text-[10px] text-slate-400">
                    {(file.size / 1024).toFixed(1)} KB — {pageCount} {pageCount === 1 ? 'page' : 'pages'} total
                  </span>
                </div>
              </div>
              <button
                onClick={() => { setFile(null); setPageCount(null); }}
                className="text-[10px] text-rose-400 hover:text-rose-350 font-bold self-start"
              >
                Change PDF File
              </button>
            </div>
          )}

          {file && pageCount && (
            <div className="flex flex-col gap-3">
              <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Extraction Query</label>
              <div className="flex flex-col gap-1.5">
                <input
                  type="text"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  placeholder="e.g. 1, 3, 5-8"
                  className="w-full bg-[#151C2C]/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E] transition-colors placeholder:text-slate-650"
                />
                <p className="text-[10px] text-slate-500 leading-normal">
                  💡 Use numbers separated by commas or dash ranges. For example, <b>1, 3, 5-8</b> extracts pages 1, 3, 5, 6, 7, and 8.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings / Controls */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 text-left">
          <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3">Split Controls</h3>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={handleSplit}
              disabled={!file || loading}
              className="btn-primary w-full py-3"
            >
              {success ? <Check size={18} /> : <Scissors size={18} />}
              <span>{loading ? 'Processing...' : success ? 'Pages Extracted!' : 'Extract Pages'}</span>
            </button>
          </div>
        </div>

        {/* Local Processing Banner */}
        <div className="bg-[#151C2C]/50 border border-slate-800 rounded-2xl p-4 flex gap-3 text-slate-400 text-left">
          <ShieldAlert size={20} className="text-[#4E8E5E] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-slate-300">100% Client-Side Splitting</span>
            <span className="text-[10px] leading-relaxed">Splits pages fully in your local browser sandbox. No document contents are sent to external networks.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
