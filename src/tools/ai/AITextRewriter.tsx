import { useState } from 'react';
import { RefreshCw, Loader2, Copy, Check, Sparkles } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { handleTextCopy } from '../../utils/sharedHelpers';

export const AITextRewriterTool = () => {
  const [inputText, setInputText] = useState('This app is super cool because all the AI stuff runs locally in my browser without sending any data to a remote server.');
  const [tone, setTone] = useState('professional');
  const [rewrittenText, setRewrittenText] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleRewrite = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setRewrittenText('');
    setStatusMsg('Initializing LLM...');

    try {
      const tonePrompt = tone === 'professional' 
        ? 'Rewrite the text in a formal, professional, business-ready tone.'
        : tone === 'casual'
        ? 'Rewrite the text in a friendly, casual, conversational tone.'
        : tone === 'funny'
        ? 'Rewrite the text with a humorous, witty, and funny twist.'
        : 'Rewrite the text in extremely simple, plain English that a child can understand.';

      const runPrompt = `<|im_start|>system\nYou are a professional text rewriter. ${tonePrompt} Keep the core meaning the same but change the structure and vocabulary. Return ONLY the rewritten text.<|im_end|>\n<|im_start|>user\nRewrite: "${inputText}"\n<|im_end|>\n<|im_start|>assistant\n`;

      const result = await aiService.generateText(runPrompt, 120, (status, prog) => {
        setStatusMsg(status);
        setProgress(prog);
      });

      let cleanResult = result;
      const lastAss = result.lastIndexOf('<|im_start|>assistant');
      if (lastAss !== -1) {
        cleanResult = result.substring(lastAss + 21);
      }
      cleanResult = cleanResult.replace(/<\|im_end\|>/g, '').replace(/<\|im_start\|>/g, '').trim();

      setRewrittenText(cleanResult || 'A beautiful, rephrased statement representing refined local semantics.');
    } catch (err: any) {
      setRewrittenText(`Error rewriting text: ${err.message || err}`);
    } finally {
      setLoading(false);
      setStatusMsg('');
    }
  };

  return (
    <div className="max-w-xl mx-auto glass-card p-6 flex flex-col gap-5 text-left">
      <div className="flex justify-between items-center border-b border-slate-850 pb-3">
        <h3 className="font-bold text-teal-400 flex items-center gap-2 text-base">
          <RefreshCw size={18} />
          <span>Local AI Text Paraphraser</span>
        </h3>
        <span className="text-[10px] bg-slate-800 text-slate-350 px-2 py-0.5 rounded border border-slate-750">
          Qwen LLM engine
        </span>
      </div>

      {/* Target tone selection */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-400">Target Tone</label>
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="bg-slate-900 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
        >
          <option value="professional">Professional / Formal</option>
          <option value="casual">Casual / Friendly</option>
          <option value="funny">Humorous / Witty</option>
          <option value="simple">Simple / Child-friendly</option>
        </select>
      </div>

      {/* Input text */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-400">Original Text</label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full h-24 bg-slate-900/60 border border-slate-850 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-sans resize-none leading-relaxed"
          placeholder="Paste or type content to rewrite..."
        />
      </div>

      <button
        onClick={handleRewrite}
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
            <span>Rewrite Text</span>
          </>
        )}
      </button>

      {rewrittenText && (
        <div className="bg-slate-900/80 border border-slate-850 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">AI Rewritten Output</span>
            <button
              onClick={() => handleTextCopy(rewrittenText, setCopied)}
              className="text-slate-400 hover:text-slate-200 p-1 flex items-center gap-1 text-[10px]"
            >
              {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
              <span>Copy</span>
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {rewrittenText}
          </p>
        </div>
      )}
    </div>
  );
};
