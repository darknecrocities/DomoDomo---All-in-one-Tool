import { useState } from 'react';
import { Sparkles, Loader2, Copy, Check, Info, Clock } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { handleTextCopy } from '../../utils/sharedHelpers';
import { LocalAIConfigPanel } from '../../components/LocalAIConfigPanel';

interface EnhancerHistoryItem {
  basic: string;
  enhanced: string;
  negative: string;
  platform: string;
  timestamp: string;
}

const PLATFORM_TEMPLATES: Record<string, string> = {
  midjourney: "an ultra-detailed Midjourney v6 prompt style, focusing on cinematic lighting, volumetric shadows, intricate details, photorealistic textures, style raw",
  sdxl: "a Stable Diffusion XL (SDXL) detailed prompt style, high-resolution 4k, digital art masterpiece, realistic styling, volumetric lighting",
  dalle: "a DALL-E 3 clean prompt style, hyper-detailed fantasy/realistic scene composition, vivid color grading, clear focal point",
  flux: "a FLUX.1 high-fidelity modern prompt, sharp details, flawless text rendering constraints, ultra-realistic textures"
};

export const AIPromptEnhancerTool = () => {
  const [promptA, setPromptA] = useState('a mysterious library inside a tree trunk');
  const [promptB, setPromptB] = useState('');
  const [platform, setPlatform] = useState('midjourney');
  const [enhanced, setEnhanced] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [progress, setProgress] = useState(0);
  const [copiedEnhanced, setCopiedEnhanced] = useState(false);
  const [copiedNegative, setCopiedNegative] = useState(false);

  // Configuration settings config panel
  const [selectedModel, setSelectedModel] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are an expert prompt engineer for text-to-image models. Expand descriptions beautifully.');
  const [temperature, setTemperature] = useState(0.85); // Creative temperature
  const [maxTokens, setMaxTokens] = useState(150);

  // Extra prompt features
  const [generateNegative, setGenerateNegative] = useState(true);
  const [aspectRatio, setAspectRatio] = useState('none');
  const [weightedTerm, setWeightedTerm] = useState('');
  const [weightValue, setWeightValue] = useState(1.2);
  const [history, setHistory] = useState<EnhancerHistoryItem[]>([]);

  const handleEnhance = async () => {
    if (!promptA.trim()) return;
    setLoading(true);
    setStatusMsg('Running prompt enhancers...');
    setEnhanced('');
    setNegativePrompt('');

    try {
      const platformStyle = PLATFORM_TEMPLATES[platform];
      let inputIdea = promptA.trim();
      
      // Combine prompt A and Prompt B if present (Feature 8)
      if (promptB.trim()) {
        inputIdea += ` blended with ${promptB.trim()}`;
      }

      // Add weights tokens if present (Feature 9)
      if (weightedTerm.trim()) {
        inputIdea += `, featuring (${weightedTerm.trim()}:${weightValue})`;
      }

      const runPrompt = `Expand this image prompt concept into a descriptive prompt optimized for ${platformStyle}: "${inputIdea}".
Write only the descriptive prompt. Do not output tags like 'Prompt:' or preambles. Keep the length under ${maxTokens} words.`;

      const result = await aiService.generateText(runPrompt, maxTokens, (status, prog) => {
        setStatusMsg(status);
        setProgress(prog);
      }, selectedModel || undefined, {
        systemPrompt,
        temperature
      });

      let finalEnhanced = result.trim();

      // Append aspect ratio command (Feature 6)
      if (aspectRatio !== 'none') {
        const ratioMap: Record<string, string> = {
          '169': ' --ar 16:9',
          '916': ' --ar 9:16',
          '45': ' --ar 4:5',
          '11': ' --ar 1:1'
        };
        finalEnhanced += ratioMap[aspectRatio] || '';
      }
      setEnhanced(finalEnhanced);

      // Generate negative prompt if selected (Feature 4)
      if (generateNegative) {
        setStatusMsg('Generating negative prompt safeguards...');
        const negPrompt = `Create a list of unwanted elements or negative prompt constraints (things to avoid) for an image of: "${inputIdea}". Output only a comma-separated list of terms (e.g. blurry, deformed, low quality).`;
        const negResult = await aiService.generateText(negPrompt, 60, () => {}, selectedModel || undefined, {
          systemPrompt: 'You are a negative prompt generator. Output only comma separated words.',
          temperature: 0.5
        });
        setNegativePrompt(negResult.trim());
      }

      // Save to logs history
      setHistory(prev => [
        {
          basic: inputIdea,
          enhanced: finalEnhanced,
          negative: generateNegative ? negativePrompt : 'N/A',
          platform,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        ...prev.slice(0, 4)
      ]);

    } catch (err: any) {
      setEnhanced(`Error enhancing prompt: ${err.message || err}`);
    } finally {
      setLoading(false);
      setStatusMsg('');
    }
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-4 text-left">
      {/* Settings control panel */}
      <LocalAIConfigPanel
        systemPrompt={systemPrompt}
        onSystemPromptChange={setSystemPrompt}
        temperature={temperature}
        onTemperatureChange={setTemperature}
        maxTokens={maxTokens}
        onMaxTokensChange={setMaxTokens}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />

      <div className="glass-card p-6 flex flex-col gap-5">
        <div className="flex justify-between items-center border-b border-slate-850 pb-3">
          <h3 className="font-bold text-teal-400 flex items-center gap-2 text-base">
            <Sparkles size={18} />
            <span>Local AI Prompt Enhancer</span>
          </h3>
        </div>

        {/* Style Preset & Aspect Ratio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-450">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400">Target Art Generator Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none"
            >
              <option value="midjourney">Midjourney v6 Art</option>
              <option value="sdxl">Stable Diffusion (SDXL)</option>
              <option value="dalle">DALL-E 3 Premium</option>
              <option value="flux">FLUX.1 Ultra Realism</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400">Output Aspect Ratio Token</label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none font-mono"
            >
              <option value="none">Standard / default (None)</option>
              <option value="169">Widescreen 16:9 (--ar 16:9)</option>
              <option value="916">Vertical 9:16 (--ar 9:16)</option>
              <option value="45">Instagram 4:5 (--ar 4:5)</option>
              <option value="11">Square 1:1 (--ar 1:1)</option>
            </select>
          </div>
        </div>

        {/* Prompt Input A & B (Prompt Blender / Combiner) */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">Primary Concept Idea</label>
            <textarea
              value={promptA}
              onChange={(e) => setPromptA(e.target.value)}
              className="w-full h-16 bg-slate-900/60 border border-slate-850 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-sans resize-none"
              placeholder="e.g. a cozy cabin in the woods..."
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 flex items-center justify-between">
              <span>Secondary Concept Blend (Optional Blender)</span>
              <span className="text-[9px] text-slate-500 font-normal">Combines concepts together</span>
            </label>
            <input
              type="text"
              value={promptB}
              onChange={(e) => setPromptB(e.target.value)}
              className="bg-slate-900 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              placeholder="e.g. glowing neon mushrooms, cyberpunk atmosphere..."
            />
          </div>
        </div>

        {/* Token weights editor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-450 border-t border-slate-850/60 pt-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400">Boost Token (Weighting)</label>
            <input
              type="text"
              value={weightedTerm}
              onChange={(e) => setWeightedTerm(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              placeholder="e.g. cinematic dust particles"
            />
          </div>
          <div className="flex flex-col gap-1.5 justify-center">
            <div className="flex justify-between font-semibold">
              <span>Token Weight Factor</span>
              <span className="font-mono text-slate-350 bg-slate-900 px-1 rounded">:{weightValue}</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="1.7"
              step="0.05"
              value={weightValue}
              onChange={(e) => setWeightValue(parseFloat(e.target.value))}
              disabled={!weightedTerm.trim()}
              className="w-full accent-teal-500 bg-slate-900 h-1 rounded cursor-pointer disabled:opacity-40"
            />
          </div>
        </div>

        {/* Generate Negative Prompt toggle */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 pt-1">
          <input
            type="checkbox"
            id="gen-neg"
            checked={generateNegative}
            onChange={(e) => setGenerateNegative(e.target.checked)}
            className="accent-teal-500"
          />
          <label htmlFor="gen-neg" className="cursor-pointer">Generate Negative Prompt guidelines alongside enhanced text</label>
        </div>

        <button
          onClick={handleEnhance}
          disabled={loading || !promptA.trim()}
          className="btn-primary py-2.5 text-xs flex items-center justify-center gap-1.5"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>{statusMsg || 'Enhancing...'} {progress > 0 ? `(${progress}%)` : ''}</span>
            </>
          ) : (
            <>
              <Sparkles size={14} />
              <span>Enhance Prompt</span>
            </>
          )}
        </button>

        {/* Output Area */}
        {enhanced && (
          <div className="bg-slate-900/80 border border-slate-850 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Info size={11} className="text-teal-400" /> Primary Prompt
              </span>
              <button
                onClick={() => handleTextCopy(enhanced, setCopiedEnhanced)}
                className="text-slate-400 hover:text-slate-200 p-1 flex items-center gap-1 text-[10px]"
              >
                {copiedEnhanced ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                <span>Copy Prompt</span>
              </button>
            </div>
            <p className="text-xs text-slate-350 leading-relaxed font-mono bg-slate-950/40 p-2.5 rounded border border-slate-850/60 whitespace-pre-wrap">
              {enhanced}
            </p>

            {/* Negative Prompt display */}
            {generateNegative && negativePrompt && (
              <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-slate-850/60">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-slate-450 uppercase tracking-wider">Negative Prompt Guidelines</span>
                  <button
                    onClick={() => handleTextCopy(negativePrompt, setCopiedNegative)}
                    className="text-slate-450 hover:text-slate-255 p-1 flex items-center gap-1 text-[9px]"
                  >
                    {copiedNegative ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                    <span>Copy Negative</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 font-mono bg-slate-950/30 p-2 rounded border border-slate-900">
                  {negativePrompt}
                </p>
              </div>
            )}
          </div>
        )}

        {/* History Log logs */}
        {history.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-slate-850 pt-4">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Clock size={11} /> Prompt History
            </span>
            <div className="flex flex-col gap-1.5">
              {history.map((h, i) => (
                <div
                  key={i}
                  className="bg-slate-950/30 border border-slate-900 rounded p-2.5 text-[10px] flex flex-col gap-1 hover:border-slate-800 transition-colors"
                >
                  <div className="flex justify-between text-slate-500 text-[8px] font-mono border-b border-slate-900 pb-1">
                    <span>Platform: {h.platform.toUpperCase()}</span>
                    <span>{h.timestamp}</span>
                  </div>
                  <div className="text-slate-400 truncate mt-1">Idea: "{h.basic}"</div>
                  <div className="text-teal-400/90 font-mono truncate mt-0.5">Prompt: {h.enhanced}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
