import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { triggerTextDownload, handleTextCopy } from '../../utils/sharedHelpers';
import { Upload, FileText, Check, Copy, Download, ShieldAlert, FileSearch } from 'lucide-react';

// Dynamically load PDF.js script from a standard CDN
const loadPdfJs = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
      resolve(pdfjsLib);
    };
    script.onerror = () => reject(new Error('Failed to load PDF.js engine'));
    document.body.appendChild(script);
  });
};

export const PDFExtractTextTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [metadata, setMetadata] = useState<{ title?: string; author?: string; pages?: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setText('');
      setMetadata(null);
    }
  };

  const handleExtract = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Load standard metadata using pdf-lib
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const title = pdfDoc.getTitle() || 'None Specified';
      const author = pdfDoc.getAuthor() || 'None Specified';
      const pages = pdfDoc.getPageCount();
      setMetadata({ title, author, pages });

      // Load PDF.js to extract actual textual characters page-by-page
      const pdfjsLib = await loadPdfJs();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      let parsedText = '';
      for (let i = 1; i <= pages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Map string segments with a space to form words
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
          .replace(/\s+/g, ' ') // normalize whitespace
          .trim();

        parsedText += `--- PAGE ${i} ---\n${pageText || '[No readable text content on this page]'}\n\n`;
      }

      const textOutput = `--- DOCUMENT METADATA ---\nFilename: ${file.name}\nTitle: ${title}\nAuthor: ${author}\nTotal Pages: ${pages}\n\n${parsedText}`;
      setText(textOutput.trim());
    } catch (e) {
      console.error(e);
      setText('Failed to parse actual text characters from PDF. Please check if the file is secure/scanned image only.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Editor Panel */}
      <div className="lg:col-span-8 flex flex-col gap-6 text-left">
        <div className="glass-card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileSearch className="text-[#4E8E5E]" size={22} />
              <span>PDF Text Extractor</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">Scans layout characters offline</span>
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
              <p className="text-slate-500 text-xs">Select PDF to parse and copy text content</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 bg-slate-900/30 p-4 rounded-xl border border-slate-850">
                <div className="flex items-center gap-3">
                  <FileText className="text-[#4E8E5E]" size={24} />
                  <div className="flex flex-col">
                    <span className="text-slate-200 text-xs font-bold">{file.name}</span>
                    <span className="text-[10px] text-slate-400">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => { setFile(null); setText(''); setMetadata(null); }}
                  className="text-[10px] text-rose-450 hover:underline font-bold self-start"
                >
                  Change PDF File
                </button>
              </div>

              {text && (
                <div className="flex flex-col gap-3 mt-2">
                  <span className="text-xs text-slate-455 font-bold uppercase tracking-wider">Extracted Result</span>
                  <textarea
                    readOnly
                    value={text}
                    className="w-full bg-slate-950 p-4 text-xs font-mono h-64 rounded-2xl border border-slate-800 text-slate-350 focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Control Panel */}
      <div className="lg:col-span-4 flex flex-col gap-6 text-left">
        <div className="glass-card p-6 flex flex-col gap-5">
          <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3">Extraction Stats</h3>

          {metadata && (
            <div className="flex flex-col gap-3 bg-slate-900/40 p-4 rounded-xl border border-slate-850 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-450 font-medium">Document Title:</span>
                <span className="text-slate-200 font-semibold truncate max-w-[120px]">{metadata.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450 font-medium">Author Tag:</span>
                <span className="text-slate-200 font-semibold truncate max-w-[120px]">{metadata.author}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450 font-medium">Page Count:</span>
                <span className="text-slate-200 font-semibold">{metadata.pages}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2">
            {!text ? (
              <button
                onClick={handleExtract}
                disabled={!file || loading}
                className="btn-primary w-full py-3"
              >
                <FileSearch size={18} />
                <span>{loading ? 'Analyzing...' : 'Run Extractor'}</span>
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleTextCopy(text, setCopied)}
                  className="btn-primary w-full py-3"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Text'}</span>
                </button>
                <button
                  onClick={() => triggerTextDownload(text, `${file!.name.replace(/\.[^/.]+$/, "")}_text.txt`)}
                  className="btn-secondary w-full py-2.5 text-xs text-center"
                >
                  <Download size={14} />
                  <span>Download plain text TXT</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Local Processing Banner */}
        <div className="bg-[#151C2C]/50 border border-slate-800 rounded-2xl p-4 flex gap-3 text-slate-400">
          <ShieldAlert size={20} className="text-[#4E8E5E] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-slate-300">100% Secure Local Scan</span>
            <span className="text-[10px] leading-relaxed">No scanning data is uploaded. String decoding occurs entirely within browser sandboxed memory arrays.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
