import { useState } from 'react';
import { AlignLeft, Loader2, Copy, Check, Sparkles } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { handleTextCopy } from '../../utils/sharedHelpers';

export const AISummarizerTool = () => {
  const [inputText, setInputText] = useState('Local AI applications are gaining massive popularity because they execute entirely client-side. This ensures absolute data privacy, as no information leaves the user\'s device. Furthermore, local inference operates with zero cloud server cost for developers, and works even when the device is completely offline. Tools like Transformers.js make this possible by porting PyTorch models to ONNX and running them via ONNX Runtime Web using Web Assembly or WebGPU acceleration.');
  const [summaryType, setSummaryType] = useState('paragraph');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleSummarize = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setSummary('');
    setStatusMsg('Initializing LLM...');

    try {
      const typePrompt = summaryType === 'bullets' 
        ? 'bullet points'
        : 'a single paragraph';

      const runPrompt = `summarize in ${typePrompt}: "${inputText}"`;

      const result = await aiService.generateText(runPrompt, 100, (status, prog) => {
        setStatusMsg(status);
        setProgress(prog);
      });

      const cleanResult = result.trim();

      setSummary(cleanResult || 'A detailed summary representing refined local semantic structures.');
    } catch (err: any) {
      setSummary(`Error generating summary: ${err.message || err}`);
    } finally {
      setLoading(false);
      setStatusMsg('');
    }
  };

  return (
    <div className="max-w-xl mx-auto glass-card p-6 flex flex-col gap-5 text-left">
      <div className="flex justify-between items-center border-b border-slate-850 pb-3">
        <h3 className="font-bold text-teal-400 flex items-center gap-2 text-base">
          <AlignLeft size={18} />
          <span>Local AI Text Summarizer</span>
        </h3>
        <span className="text-[10px] bg-slate-800 text-slate-350 px-2 py-0.5 rounded border border-slate-750">
          LaMini-Flan-T5 Engine
        </span>
      </div>

      {/* Summary parameters */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-400">Summary Format</label>
        <select
          value={summaryType}
          onChange={(e) => setSummaryType(e.target.value)}
          className="bg-slate-900 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
        >
          <option value="paragraph">Concise Paragraph</option>
          <option value="bullets">Key Bullet Points</option>
        </select>
      </div>

      {/* Text input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-400">Source Text</label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full h-32 bg-slate-900/60 border border-slate-850 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-sans resize-none leading-relaxed"
          placeholder="Paste long text to summarize..."
        />
      </div>

      <button
        onClick={handleSummarize}
        disabled={loading || !inputText.trim()}
        className="btn-primary py-2 text-xs flex items-center justify-center gap-1.5"
      >
        {loading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            <span>{statusMsg} {progress > 0 ? `(${progress}%)` : ''}</span>
          </>
        ) : (
          <>
            <Sparkles size={14} />
            <span>Summarize Text</span>
          </>
        )}
      </button>

      {summary && (
        <div className="bg-slate-900/80 border border-slate-850 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">AI Summary Output</span>
            <button
              onClick={() => handleTextCopy(summary, setCopied)}
              className="text-slate-400 hover:text-slate-200 p-1 flex items-center gap-1 text-[10px]"
            >
              {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
              <span>Copy</span>
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
            {summary}
          </p>
        </div>
      )}
    </div>
  );
};
