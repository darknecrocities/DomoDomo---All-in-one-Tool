import { useState } from 'react';
import { RefreshCw, Loader2, Copy, Check, Sparkles, Layers, BookOpen } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { handleTextCopy } from '../../utils/sharedHelpers';
import { LocalAIConfigPanel } from '../../components/LocalAIConfigPanel';

export const AITextRewriterTool = () => {
  const [inputText, setInputText] = useState('This app is super cool because all the AI stuff runs locally in my browser without sending any data to a remote server.');
  const [tone, setTone] = useState('professional');
  const [rewrittenText, setRewrittenText] = useState('');
  const [variations, setVariations] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [progress] = useState(0);
  const [copied, setCopied] = useState<Record<number, boolean>>({});

  // Model settings panel configs
  const [selectedModel, setSelectedModel] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are an expert editor. Rewrite text to match specified tones and styles perfectly.');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(120);

  // Expanded rewriter features
  const [intensity, setIntensity] = useState('medium');
  const [platform, setPlatform] = useState('general');
  const [charLimit, setCharLimit] = useState(280);
  const [vocabLevel, setVocabLevel] = useState('standard');
  const [customGuide, setCustomGuide] = useState('');
  const [selectedVariationIdx, setSelectedVariationIdx] = useState(0);

  const handleRewrite = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setRewrittenText('');
    setVariations([]);
    setStatusMsg('Initializing LLM...');

    try {
      const platformPrompt = platform !== 'general' 
        ? `optimized for publication on ${platform}`
        : '';

      const intensityPrompt = intensity === 'high'
        ? 'completely restructuring sentences and paraphrasing fully'
        : intensity === 'low'
        ? 'making only minor word adjustments while keeping the original sentence structure'
        : 'paraphrasing moderately';

      const vocabPrompt = vocabLevel === 'advanced'
        ? 'using sophisticated, scholarly vocabulary terms'
        : vocabLevel === 'simple'
        ? 'using simple, child-friendly terminology'
        : 'using standard natural language';

      const promptBase = `Paraphrase this text: "${inputText}".
Tone: ${tone}.
Platform: ${platformPrompt}.
Intensity: ${intensityPrompt}.
Vocabulary Level: ${vocabPrompt}.
Character Limit: strictly keep the output under ${charLimit} characters.
${customGuide ? `Custom Guide: ${customGuide}` : ''}

Output only the paraphrased text without preambles or tags.`;

      // Generate 3 variations side-by-side (Feature 7)
      const optionsResults: string[] = [];
      const temperatures = [temperature - 0.15, temperature, temperature + 0.15];

      for (let i = 0; i < 3; i++) {
        setStatusMsg(`Generating paraphrase option ${i + 1}/3...`);
        const result = await aiService.generateText(promptBase, maxTokens, () => {}, selectedModel || undefined, {
          systemPrompt,
          temperature: Math.min(1.4, Math.max(0.1, temperatures[i]))
        });
        optionsResults.push(result.trim());
      }

      setVariations(optionsResults);
      setRewrittenText(optionsResults[0]);
      setSelectedVariationIdx(0);

    } catch (err: any) {
      setRewrittenText(`Error rewriting text: ${err.message || err}`);
    } finally {
      setLoading(false);
      setStatusMsg('');
    }
  };

  const handleSelectVariation = (idx: number) => {
    setSelectedVariationIdx(idx);
    setRewrittenText(variations[idx]);
  };

  const copyVariation = (txt: string, idx: number) => {
    handleTextCopy(txt, () => {
      setCopied(prev => ({ ...prev, [idx]: true }));
      setTimeout(() => setCopied(prev => ({ ...prev, [idx]: false })), 1500);
    });
  };

  // Compare original vs rewritten words (Feature 8 Diff)
  const renderDiffHighlight = () => {
    if (!rewrittenText) return null;
    const origWords = inputText.toLowerCase().split(/\s+/).filter(Boolean);
    const rewWords = rewrittenText.split(/\s+/).filter(Boolean);

    return (
      <div className="flex flex-wrap gap-1 bg-slate-950/40 p-3 rounded-lg border border-slate-900 leading-relaxed text-xs">
        {rewWords.map((word, idx) => {
          const cleanWord = word.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
          const isNew = !origWords.includes(cleanWord);
          return (
            <span
              key={idx}
              className={isNew ? 'bg-green-950/40 text-green-400 border border-green-900/30 px-1 rounded font-semibold' : 'text-slate-350'}
            >
              {word}
            </span>
          );
        })}
      </div>
    );
  };

  // Readability / Complexity Diagnostics (Feature 9)
  const computeReadability = () => {
    if (!inputText) return 'N/A';
    const words = inputText.split(/\s+/).filter(Boolean).length;
    const sentences = inputText.split(/[.!?]+/).filter(Boolean).length || 1;
    const score = Math.round(206.835 - 1.015 * (words / sentences));
    
    if (score > 80) return 'Easy (5th Grade level)';
    if (score > 50) return 'Standard (High School level)';
    return 'Complex (College graduate level)';
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
            <RefreshCw size={18} />
            <span>Local AI Text Paraphraser</span>
          </h3>
        </div>

        {/* Tone, intensity, and platform configs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-450">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400">Target Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none"
            >
              <option value="professional">Professional / Formal</option>
              <option value="casual">Casual / Friendly</option>
              <option value="funny">Humorous / Witty</option>
              <option value="simple">Simple / Child-friendly</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400">Paraphrase Intensity</label>
            <select
              value={intensity}
              onChange={(e) => setIntensity(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none"
            >
              <option value="low">Mild (Keep Structure)</option>
              <option value="medium">Medium Paraphrase</option>
              <option value="high">High (Full Restructure)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400">Target Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none"
            >
              <option value="general">General / Web</option>
              <option value="LinkedIn">LinkedIn Post</option>
              <option value="Twitter/X">Twitter/X Thread</option>
              <option value="Slack">Slack Message</option>
              <option value="Academic">Academic Paper</option>
            </select>
          </div>
        </div>

        {/* Vocab level and char limits sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-450 border-t border-slate-850/50 pt-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400">Vocabulary Level</label>
            <select
              value={vocabLevel}
              onChange={(e) => setVocabLevel(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none"
            >
              <option value="simple">Simple Terms</option>
              <option value="standard">Standard English</option>
              <option value="advanced">Sophisticated / Academic</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 justify-center">
            <div className="flex justify-between font-semibold">
              <span>Output Character Limit</span>
              <span className="font-mono text-slate-350 bg-slate-900 px-1 rounded">{charLimit} chars</span>
            </div>
            <input
              type="range"
              min="50"
              max="500"
              step="10"
              value={charLimit}
              onChange={(e) => setCharLimit(parseInt(e.target.value))}
              className="w-full accent-teal-500 bg-slate-900 h-1 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Custom Guidelines */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400">Custom Rewriting Guide (Optional)</label>
          <input
            type="text"
            value={customGuide}
            onChange={(e) => setCustomGuide(e.target.value)}
            placeholder="e.g. rewrite as a pirate, use active voice only..."
            className="bg-slate-900 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Text Input */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-semibold text-slate-450">
            <span>Original Text</span>
            <span className="text-[10px] text-slate-500 font-mono">Complexity: {computeReadability()}</span>
          </div>
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
              <span>{statusMsg || 'Generating options...'} {progress > 0 ? `(${progress}%)` : ''}</span>
            </>
          ) : (
            <>
              <Sparkles size={14} />
              <span>Paraphrase Text</span>
            </>
          )}
        </button>

        {/* Variations side-by-side selector */}
        {variations.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-850 pt-4 animate-fadeIn">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Layers size={11} className="text-teal-400" /> Paraphrase Options
            </span>
            <div className="flex gap-2">
              {variations.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectVariation(idx)}
                  className={`flex-1 py-1 text-xs rounded border transition-colors ${selectedVariationIdx === idx ? 'bg-teal-950/30 text-teal-400 border-teal-900/30 font-semibold' : 'bg-slate-950/20 text-slate-400 border-slate-900'}`}
                >
                  Option {idx + 1}
                </button>
              ))}
            </div>

            <div className="bg-slate-900/80 border border-slate-850 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Option {selectedVariationIdx + 1} Output</span>
                <button
                  onClick={() => copyVariation(rewrittenText, selectedVariationIdx)}
                  className="text-slate-400 hover:text-slate-200 p-1 flex items-center gap-1 text-[10px]"
                >
                  {copied[selectedVariationIdx] ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                  <span>Copy Option {selectedVariationIdx + 1}</span>
                </button>
              </div>
              <p className="text-xs text-slate-350 leading-relaxed font-sans">
                {rewrittenText}
              </p>
            </div>

            {/* Word Diff visual checker */}
            <div className="flex flex-col gap-2 mt-1">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <BookOpen size={11} /> Changed words map (Highlighted in Green)
              </span>
              {renderDiffHighlight()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
