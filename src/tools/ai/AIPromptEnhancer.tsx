import { useState } from 'react';
import { Sparkles, Loader2, Copy, Check, Info } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { handleTextCopy } from '../../utils/sharedHelpers';

export const AIPromptEnhancerTool = () => {
  const [prompt, setPrompt] = useState('a mysterious library inside a tree trunk');
  const [style, setStyle] = useState('midjourney');
  const [enhanced, setEnhanced] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const styleTemplates: Record<string, string> = {
    midjourney: "an ultra-detailed, artistic Midjourney v6 style prompt with beautiful lighting, volumetric shadows, 8k resolution, photorealistic textures, and creative details.",
    photorealistic: "a realistic professional photograph captured on a 50mm lens, f/1.8, cinematic lighting, dramatic depth of field, rich textures, and award-winning composition details.",
    fantasy: "a breathtaking high-fantasy concept art illustration, magic glowing elements, vibrant color grading, intricate whimsical details, digital matte painting.",
    minimalist: "a modern minimalist vector art illustration, clean geometry, pastel flat color palette, elegant simple shapes, high aesthetic design."
  };

  const handleEnhance = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setStatusMsg('Initializing LLM...');

    try {
      const template = styleTemplates[style];
      const runPrompt = `<|im_start|>system\nYou are an expert prompt engineer. Expand the user's short prompt into ${template} Keep it to a single coherent paragraph.<|im_end|>\n<|im_start|>user\nExpand: "${prompt}"\n<|im_end|>\n<|im_start|>assistant\n`;

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

      setEnhanced(cleanResult || 'A beautiful, cinematic render representing refined prompt layout details.');
    } catch (err: any) {
      setEnhanced(`Error enhancing prompt: ${err.message || err}`);
    } finally {
      setLoading(false);
      setStatusMsg('');
    }
  };

  return (
    <div className="max-w-xl mx-auto glass-card p-6 flex flex-col gap-5 text-left">
      <div className="flex justify-between items-center border-b border-slate-850 pb-3">
        <h3 className="font-bold text-teal-400 flex items-center gap-2 text-base">
          <Sparkles size={18} />
          <span>Local AI Prompt Enhancer</span>
        </h3>
        <span className="text-[10px] bg-slate-800 text-slate-350 px-2 py-0.5 rounded border border-slate-750">
          Qwen LLM engine
        </span>
      </div>

      {/* Select style preset */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400">Target Style</label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="bg-slate-900 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="midjourney">Midjourney v6 Art</option>
            <option value="photorealistic">Cinematic Photo</option>
            <option value="fantasy">Epic Fantasy</option>
            <option value="minimalist">Minimalist Vector</option>
          </select>
        </div>
      </div>

      {/* Input prompt */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-400">Basic Prompt Idea</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full h-20 bg-slate-900/60 border border-slate-850 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-sans resize-none"
          placeholder="e.g. a cozy cabin in the woods..."
        />
      </div>

      <button
        onClick={handleEnhance}
        disabled={loading || !prompt.trim()}
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
            <span>Enhance Prompt</span>
          </>
        )}
      </button>

      {enhanced && (
        <div className="bg-slate-900/80 border border-slate-850 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Info size={11} className="text-teal-400" /> Enhanced Output
            </span>
            <button
              onClick={() => handleTextCopy(enhanced, setCopied)}
              className="text-slate-400 hover:text-slate-200 p-1 flex items-center gap-1 text-[10px]"
            >
              {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
              <span>Copy Prompt</span>
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950/40 p-2.5 rounded border border-slate-850/60">
            {enhanced}
          </p>
        </div>
      )}
    </div>
  );
};
