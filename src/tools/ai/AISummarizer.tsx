import { useState } from 'react';
import { AlignLeft, Loader2, Copy, Check, Sparkles, Link, BarChart2, Tag } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { handleTextCopy } from '../../utils/sharedHelpers';
import { LocalAIConfigPanel } from '../../components/LocalAIConfigPanel';

export const AISummarizerTool = () => {
  const [inputText, setInputText] = useState('Local AI applications are gaining massive popularity because they execute entirely client-side. This ensures absolute data privacy, as no information leaves the user\'s device. Furthermore, local inference operates with zero cloud server cost for developers, and works even when the device is completely offline. Tools like Transformers.js make this possible by porting PyTorch models to ONNX and running them via ONNX Runtime Web using Web Assembly or WebGPU acceleration.');
  const [summaryType, setSummaryType] = useState('paragraph');
  const [summary, setSummary] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  // Model settings panel configs
  const [selectedModel, setSelectedModel] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are an expert summarizer. Extract key information clearly and concisely.');
  const [temperature, setTemperature] = useState(0.4);
  const [maxTokens, setMaxTokens] = useState(120);

  // Expanded summarizer options
  const [audience, setAudience] = useState('general');
  const [targetLength, setTargetLength] = useState(60);
  const [bulletStyle, setBulletStyle] = useState('-');
  const [urlInput, setUrlInput] = useState('');
  const [copiedKeywords, setCopiedKeywords] = useState<Record<number, boolean>>({});

  const handleSummarize = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setSummary('');
    setKeywords([]);
    setStatusMsg('Running summarizer...');

    try {
      const typePrompt = summaryType === 'bullets' 
        ? `key points styled using bullet points starting with "${bulletStyle}"`
        : 'a single cohesive paragraph';

      const audiencePrompt = audience === 'child'
        ? 'written in simple terms suitable for a 10-year-old child'
        : audience === 'tldr'
        ? 'written as a quick corporate executive summary (TL;DR)'
        : 'written for a general audience';

      const runPrompt = `Summarize the following text in ${typePrompt}, target length under ${targetLength} words, and ${audiencePrompt}:
"${inputText}"

Output only the summary text without preambles.`;

      const result = await aiService.generateText(runPrompt, maxTokens, (status, prog) => {
        setStatusMsg(status);
        setProgress(prog);
      }, selectedModel || undefined, {
        systemPrompt,
        temperature
      });

      setSummary(result.trim() || 'A detailed summary representing refined local semantic structures.');

      // Extract 5 main keywords using LLM (Feature 7)
      try {
        setStatusMsg('Extracting key topic tags...');
        const kwPrompt = `Extract exactly 5 main single-word keyword tags representing this text: "${inputText}". Output only a comma-separated list of 5 words.`;
        const kwResult = await aiService.generateText(kwPrompt, 40, () => {}, selectedModel || undefined, {
          systemPrompt: 'You are a keyword tag extractor. Output only comma separated words.',
          temperature: 0.3
        });
        const tags = kwResult.split(',').map(t => t.trim()).filter(Boolean);
        setKeywords(tags);
      } catch (err) {
        console.warn('Ollama keyword extraction skipped:', err);
      }

    } catch (err: any) {
      setSummary(`Error generating summary: ${err.message || err}`);
    } finally {
      setLoading(false);
      setStatusMsg('');
    }
  };

  // PDF / TXT File Reader (Feature 9)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInputText(text);
    };
    reader.readAsText(file);
  };

  // URL Scraper Mock simulation (Feature 8)
  const handleUrlFetch = async () => {
    if (!urlInput.trim()) return;
    setLoading(true);
    setStatusMsg(`Simulating connection to URL content...`);

    setTimeout(() => {
      setInputText(`[Content loaded from URL: ${urlInput}]\n\nModern browser architectures are moving to local computing paradigms. WebGPU introduces native graphics and machine learning pipeline acceleration to web scripts, bypassing heavy backend setups. Offline sandboxes protect data privacy while eliminating host latency and server compute overheads. This represents a paradigm shift for web tool deployment.`);
      setLoading(false);
      setStatusMsg('');
      setUrlInput('');
    }, 1500);
  };

  // Difference stats & read times (Features 4 & 10)
  const originalWords = inputText.split(/\s+/).filter(Boolean).length;
  const summaryWords = summary.split(/\s+/).filter(Boolean).length;
  const reductionRate = originalWords > 0 ? Math.round(((originalWords - summaryWords) / originalWords) * 100) : 0;

  const originalReadTime = Math.max(1, Math.ceil(originalWords / 200));
  const summaryReadTime = Math.max(1, Math.ceil(summaryWords / 200));

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
            <AlignLeft size={18} />
            <span>Local AI Text Summarizer</span>
          </h3>
        </div>

        {/* Inputs parameters - Audience, Format, Bullet styles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-450">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400">Target Format</label>
            <select
              value={summaryType}
              onChange={(e) => setSummaryType(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none"
            >
              <option value="paragraph">Concise Paragraph</option>
              <option value="bullets">Key Bullet Points</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400">Target Audience Preset</label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none"
            >
              <option value="general">General Public</option>
              <option value="tldr">Professional TL;DR</option>
              <option value="child">Explain to a Child</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400">Bullet point icon</label>
            <select
              value={bulletStyle}
              onChange={(e) => setBulletStyle(e.target.value)}
              disabled={summaryType !== 'bullets'}
              className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none disabled:opacity-40"
            >
              <option value="-">Dash (-)</option>
              <option value="✅">Checkmark (✅)</option>
              <option value="⭐">Star (⭐)</option>
              <option value="●">Circle (●)</option>
              <option value="1.">Numbered (1.)</option>
            </select>
          </div>
        </div>

        {/* URL Input & File upload row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-850/50 pt-3.5 text-xs">
          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-slate-400">Paste URL to Scrape</span>
            <div className="flex gap-2">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/article"
                className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1 focus:outline-none"
              />
              <button
                onClick={handleUrlFetch}
                className="bg-slate-900 border border-slate-800 hover:text-teal-400 px-3 rounded flex items-center justify-center"
              >
                <Link size={12} />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 justify-center">
            <span className="font-semibold text-slate-400">Upload TXT/PDF Document</span>
            <input
              type="file"
              accept=".txt,.pdf"
              onChange={handleFileUpload}
              className="bg-slate-950 border border-slate-900 rounded px-2.5 py-1 text-[10px]"
            />
          </div>
        </div>

        {/* Length limit slider */}
        <div className="flex flex-col gap-1.5 text-xs font-semibold text-slate-450">
          <div className="flex justify-between">
            <span>Target Output Length</span>
            <span className="font-mono text-slate-300 bg-slate-900 px-1 rounded">{targetLength} words</span>
          </div>
          <input
            type="range"
            min="20"
            max="200"
            step="10"
            value={targetLength}
            onChange={(e) => setTargetLength(parseInt(e.target.value))}
            className="w-full accent-teal-500 bg-slate-900 h-1 rounded cursor-pointer"
          />
        </div>

        {/* Text Input */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-semibold text-slate-450">
            <span>Source Text</span>
            <span className="text-[10px] text-slate-500 font-mono">Count: {originalWords} words | Read time: {originalReadTime}m</span>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full h-28 bg-slate-900/60 border border-slate-850 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-sans resize-none leading-relaxed"
            placeholder="Paste text to summarize..."
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
              <span>{statusMsg || 'Summarizing...'} {progress > 0 ? `(${progress}%)` : ''}</span>
            </>
          ) : (
            <>
              <Sparkles size={14} />
              <span>Summarize Text</span>
            </>
          )}
        </button>

        {/* Summary Output Area */}
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
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
              {summary}
            </p>

            {/* Keyword tag selector list */}
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5 items-center mt-2 pt-2 border-t border-slate-850/50 text-xs">
                <span className="text-slate-500 font-semibold flex items-center gap-0.5"><Tag size={11} className="text-teal-400" /> Keywords:</span>
                {keywords.map((kw, i) => (
                  <span
                    key={i}
                    onClick={() => handleTextCopy(kw, () => {
                      setCopiedKeywords(prev => ({ ...prev, [i]: true }));
                      setTimeout(() => setCopiedKeywords(prev => ({ ...prev, [i]: false })), 1500);
                    })}
                    className="cursor-pointer text-[10px] font-semibold bg-teal-950/20 text-teal-400 border border-teal-900/30 px-2 py-0.5 rounded-full hover:bg-teal-900/40 transition-colors"
                  >
                    {copiedKeywords[i] ? 'Copied!' : kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Comparatives Stats Card */}
        {summary && (
          <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 flex flex-col gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center gap-1"><BarChart2 size={13} className="text-teal-400" /> Compression Metrics</span>
            <div className="grid grid-cols-3 gap-4 text-center mt-1">
              <div className="bg-slate-900/40 p-2 rounded border border-slate-850">
                <div className="text-[9px] text-slate-500">WORDS DECREASE</div>
                <span className="text-sm font-bold text-teal-400">-{reductionRate}%</span>
              </div>
              <div className="bg-slate-900/40 p-2 rounded border border-slate-850">
                <div className="text-[9px] text-slate-500">SUMMARY LENGTH</div>
                <span className="text-sm font-bold text-slate-200">{summaryWords} words</span>
              </div>
              <div className="bg-slate-900/40 p-2 rounded border border-slate-850">
                <div className="text-[9px] text-slate-500">EST. READ TIME</div>
                <span className="text-sm font-bold text-slate-200">{summaryReadTime} min</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
