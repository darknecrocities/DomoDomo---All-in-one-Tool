import { useState } from 'react';
import { Tag, Sparkles, Loader2, BarChart2 } from 'lucide-react';
import { aiService } from '../../utils/aiService';

export const AIClassifierTool = () => {
  const [inputText, setInputText] = useState('Absolutely amazing experience! The local system loaded the models instantly and the results are fast.');
  const [sentiment, setSentiment] = useState<{ label: string; score: number } | null>(null);
  const [category, setCategory] = useState<string>('');
  const [isSpam, setIsSpam] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [progress, setProgress] = useState(0);

  const handleClassify = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setSentiment(null);
    setCategory('');
    setIsSpam('');
    setStatusMsg('Initializing models...');

    try {
      // 1. Run Sentiment Classification (DistilBERT)
      setStatusMsg('Loading sentiment model...');
      const sentimentResult = await aiService.classify(inputText);
      if (sentimentResult && sentimentResult.length > 0) {
        setSentiment(sentimentResult[0]);
      }

      // 2. Run Category and Spam zero-shot classification using Qwen LLM
      setStatusMsg('Analyzing categories via LLM...');
      const prompt = `<|im_start|>system\nYou are a precise text classifier. Answer in exactly this format:\nCategory: [single-word topic like Tech, Sports, Finance, Health, or Entertainment]\nSpam: [Yes or No]\n<|im_end|>\n<|im_start|>user\nClassify this text: "${inputText}"\n<|im_end|>\n<|im_start|>assistant\n`;

      const llmResult = await aiService.generateText(prompt, 40, (status, prog) => {
        setStatusMsg(status);
        setProgress(prog);
      });

      // Parse LLM response
      let cleanLlm = llmResult;
      const lastAss = llmResult.lastIndexOf('<|im_start|>assistant');
      if (lastAss !== -1) {
        cleanLlm = llmResult.substring(lastAss + 21);
      }
      cleanLlm = cleanLlm.replace(/<\|im_end\|>/g, '').replace(/<\|im_start\|>/g, '').trim();

      const lines = cleanLlm.split('\n');
      lines.forEach(line => {
        if (line.toLowerCase().includes('category:')) {
          setCategory(line.replace(/category:/i, '').trim());
        }
        if (line.toLowerCase().includes('spam:')) {
          setIsSpam(line.replace(/spam:/i, '').trim());
        }
      });

      if (!category) setCategory('General/Misc');
      if (!isSpam) setIsSpam('No');

    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
      setStatusMsg('');
    }
  };

  return (
    <div className="max-w-xl mx-auto glass-card p-6 flex flex-col gap-5 text-left">
      <div className="flex justify-between items-center border-b border-slate-850 pb-3">
        <h3 className="font-bold text-teal-400 flex items-center gap-2 text-base">
          <Tag size={18} />
          <span>Local AI Text Classifier</span>
        </h3>
        <span className="text-[10px] bg-slate-800 text-slate-350 px-2 py-0.5 rounded border border-slate-750">
          DistilBERT + Qwen LLM
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-400 font-mono">Input Text</label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full h-24 bg-slate-900/60 border border-slate-850 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-sans resize-none"
          placeholder="Paste or type content to classify..."
          maxLength={1000}
        />
      </div>

      <button
        onClick={handleClassify}
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
            <span>Analyze Text</span>
          </>
        )}
      </button>

      {(sentiment || category || isSpam) && (
        <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-4.5 flex flex-col gap-3.5 mt-1 animate-fadeIn">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
              <BarChart2 size={13} className="text-teal-400" />
              <span>Classification Report</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
            {/* Sentiment Metric */}
            {sentiment && (
              <div className="bg-slate-900/50 border border-slate-850 rounded-lg p-3 text-center flex flex-col justify-center">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-medium">Sentiment</div>
                <div className={`text-sm font-bold ${sentiment.label === 'POSITIVE' ? 'text-green-400' : 'text-red-400'}`}>
                  {sentiment.label}
                </div>
                <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                  {(sentiment.score * 100).toFixed(1)}% Confidence
                </div>
              </div>
            )}

            {/* Category Metric */}
            {category && (
              <div className="bg-slate-900/50 border border-slate-850 rounded-lg p-3 text-center flex flex-col justify-center">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-medium">Topic / Domain</div>
                <div className="text-sm font-bold text-indigo-400 truncate px-1">
                  {category}
                </div>
                <div className="text-[9px] text-slate-500 font-mono mt-0.5">Zero-Shot LLM</div>
              </div>
            )}

            {/* Spam Check Metric */}
            {isSpam && (
              <div className="bg-slate-900/50 border border-slate-850 rounded-lg p-3 text-center flex flex-col justify-center">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-medium">Spam Check</div>
                <div className={`text-sm font-bold ${isSpam.toLowerCase() === 'yes' ? 'text-red-400 animate-pulse' : 'text-teal-400'}`}>
                  {isSpam.toUpperCase()}
                </div>
                <div className="text-[9px] text-slate-500 font-mono mt-0.5">Content Scan</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
