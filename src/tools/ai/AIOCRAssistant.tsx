import { useState } from 'react';
import { Eye, FileText, Loader2, Copy, Check, Sparkles } from 'lucide-react';
import { handleTextCopy, triggerTextDownload } from '../../utils/sharedHelpers';

export const AIOCRAssistantTool = () => {
  const [imagePreview, setImagePreview] = useState<string>('');
  const [extractedText, setExtractedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [progressPct, setProgressPct] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(selected);
  };

  const handleRunOCR = async () => {
    if (!imagePreview) return;
    setLoading(true);
    setProgressMsg('Loading Tesseract.js OCR engine...');
    setProgressPct(10);

    try {
      // Dynamically import Tesseract.js ESM bundle from CDN via variable to bypass TS compiler warnings
      const ocrModuleUrl = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.0.5/dist/tesseract.esm.min.js';
      const { createWorker } = await import(/* @vite-ignore */ ocrModuleUrl);

      const worker = await createWorker('eng', 1, {
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            setProgressMsg('Recognizing text characters...');
            setProgressPct(Math.round(m.progress * 100));
          } else {
            setProgressMsg(m.status || 'Loading OCR weights...');
          }
        }
      });

      const ret = await worker.recognize(imagePreview);
      setExtractedText(ret.data.text || 'No readable text found in image.');
      await worker.terminate();

    } catch (err: any) {
      setExtractedText(`OCR Error: ${err.message || err}`);
    } finally {
      setLoading(false);
      setProgressMsg('');
      setProgressPct(0);
    }
  };

  return (
    <div className="max-w-xl mx-auto glass-card p-6 flex flex-col gap-5 text-left">
      <div className="flex justify-between items-center border-b border-slate-850 pb-3">
        <h3 className="font-bold text-teal-400 flex items-center gap-2 text-base">
          <Eye size={18} />
          <span>Local OCR Text Assistant</span>
        </h3>
        <span className="text-[10px] bg-slate-800 text-slate-350 px-2 py-0.5 rounded border border-slate-750">
          Tesseract.js Engine (ESM)
        </span>
      </div>

      {/* Select Document Image */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-400">Upload Image / Document</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="bg-slate-900 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
        />
      </div>

      {imagePreview && (
        <div className="flex items-center justify-center border border-slate-850 rounded-xl overflow-hidden bg-slate-950/40 p-4 max-h-48">
          <img src={imagePreview} alt="OCR Source" className="max-h-full max-w-full object-contain rounded" />
        </div>
      )}

      {imagePreview && (
        <button
          onClick={handleRunOCR}
          disabled={loading}
          className="btn-primary py-2 text-xs flex items-center justify-center gap-1.5"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin text-teal-400" />
              <span>{progressMsg} {progressPct > 0 ? `(${progressPct}%)` : ''}</span>
            </>
          ) : (
            <>
              <Sparkles size={14} />
              <span>Extract Text from Image</span>
            </>
          )}
        </button>
      )}

      {extractedText && (
        <div className="flex flex-col gap-2.5 animate-fadeIn">
          <div className="flex justify-between items-center pb-1">
            <label className="text-xs font-semibold text-slate-400 font-mono flex items-center gap-1.5">
              <FileText size={13} className="text-teal-400" />
              <span>Extracted Text</span>
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleTextCopy(extractedText, setCopied)}
                className="text-slate-400 hover:text-slate-200 p-1 flex items-center gap-1 text-[10px]"
              >
                {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                <span>Copy</span>
              </button>
              <button
                onClick={() => triggerTextDownload(extractedText, 'extracted-ocr-text.txt')}
                className="text-teal-400 hover:text-teal-350 p-1 text-[10px] font-medium"
              >
                Download (.txt)
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={extractedText}
            className="w-full h-36 bg-slate-900/60 border border-slate-850 rounded-lg p-3 text-xs text-slate-200 focus:outline-none font-mono resize-none leading-relaxed"
          />
        </div>
      )}
    </div>
  );
};
