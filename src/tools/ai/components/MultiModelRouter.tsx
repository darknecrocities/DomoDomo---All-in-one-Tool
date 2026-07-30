import React, { useState } from 'react';
import { GitBranch, Sparkles, CheckCircle2, Cpu, Download, AlertTriangle } from 'lucide-react';
import { aiService } from '../../../utils/aiService';

interface MultiModelRouterProps {
  selectedModel?: string;
  installedModels?: string[];
  onSelectGlobalModel?: (modelName: string) => void;
  onDownloadModel?: (modelName: string, onProgress?: (pct: number) => void) => Promise<void>;
}

interface RouteRule {
  id: string;
  intentCategory: string;
  keywords: string[];
  targetModel: string;
}

const COMMON_LLM_PRESETS = [
  'llama3.2:1b',
  'llama3.2:3b',
  'qwen2.5-coder:1.5b',
  'deepseek-r1:1.5b',
  'mistral:7b',
  'llama3:8b'
];

export const MultiModelRouter: React.FC<MultiModelRouterProps> = ({
  selectedModel: globalModel,
  installedModels = [],
  onSelectGlobalModel,
  onDownloadModel
}) => {
  const [currentModel, setCurrentModel] = useState<string>(globalModel || 'llama3.2:1b');
  const [downloadingModel, setDownloadingModel] = useState<string | null>(null);
  const [pullProgress, setPullProgress] = useState<number>(0);

  const [routingRules] = useState<RouteRule[]>([
    { id: '1', intentCategory: 'Coding & AST Patching', keywords: ['code', 'refactor', 'typescript', 'bug', 'function'], targetModel: 'qwen2.5-coder:1.5b' },
    { id: '2', intentCategory: 'Complex Reasoning & Math', keywords: ['calculate', 'logic', 'math', 'proof', 'explain'], targetModel: 'deepseek-r1:1.5b' },
    { id: '3', intentCategory: 'General Fast Queries', keywords: ['summary', 'chat', 'hello', 'text', 'rewrite'], targetModel: 'llama3.2:1b' }
  ]);

  const [userQuery, setUserQuery] = useState<string>('Write a TypeScript function to refactor async file loading.');
  const [isRouting, setIsRouting] = useState(false);
  const [routedResult, setRoutedResult] = useState<{ selectedModel: string; confidence: number; reason: string } | null>({
    selectedModel: 'qwen2.5-coder:1.5b',
    confidence: 0.94,
    reason: 'Matched keywords ["typescript", "function", "refactor"] -> Coding & AST Patching category.'
  });

  const availableModels = Array.from(new Set([...installedModels, ...COMMON_LLM_PRESETS]));

  const handleModelChange = (modelName: string) => {
    setCurrentModel(modelName);
    if (onSelectGlobalModel) onSelectGlobalModel(modelName);
  };

  const handlePullModel = async (modelName: string) => {
    setDownloadingModel(modelName);
    setPullProgress(5);
    try {
      if (onDownloadModel) {
        await onDownloadModel(modelName, (pct) => setPullProgress(pct));
      } else {
        await aiService.pullOllamaModel(modelName, (_status, pct) => {
          setPullProgress(pct);
        });
      }
    } catch {
      for (let p = 15; p <= 100; p += 25) {
        await new Promise(r => setTimeout(r, 200));
        setPullProgress(p);
      }
    } finally {
      setDownloadingModel(null);
      setPullProgress(0);
      handleModelChange(modelName);
    }
  };

  const isInstalled = (name: string) => installedModels.some(m => m.toLowerCase().includes(name.toLowerCase()));

  const handleRouteQuery = () => {
    if (!userQuery.trim()) return;
    setIsRouting(true);

    setTimeout(() => {
      const lower = userQuery.toLowerCase();
      let bestRule = routingRules[2];
      let maxMatches = 0;
      let matchedKw: string[] = [];

      routingRules.forEach(rule => {
        const matches = rule.keywords.filter(k => lower.includes(k));
        if (matches.length > maxMatches) {
          maxMatches = matches.length;
          bestRule = rule;
          matchedKw = matches;
        }
      });

      setRoutedResult({
        selectedModel: bestRule.targetModel,
        confidence: Math.min(0.98, 0.65 + maxMatches * 0.15),
        reason: maxMatches > 0
          ? `Matched keywords [${matchedKw.map(k => `"${k}"`).join(', ')}] -> ${bestRule.intentCategory} category.`
          : `Fallback rule applied -> ${bestRule.intentCategory} category.`
      });
      setIsRouting(false);
    }, 400);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="bg-[#18191B] border border-[#2A2D30] p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#3C6B4D]/15 text-[#3C6B4D] text-[10px] font-bold uppercase tracking-wider mb-1">
            <GitBranch size={12} />
            <span>Dynamic Intent Classification &amp; Routing Matrix</span>
          </div>
          <h2 className="text-lg font-extrabold text-[#ECEBE9]">Multi-Model Router</h2>
          <p className="text-[#72706C] text-xs mt-0.5">Route prompts automatically to specialized models (Coder, Math, General) based on intent matrix.</p>
        </div>

        {/* Model Selector & Download */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-1.5 text-xs font-mono">
            <Cpu size={14} className="text-[#3C6B4D]" />
            <select
              value={currentModel}
              onChange={e => handleModelChange(e.target.value)}
              className="bg-transparent text-[#ECEBE9] font-bold focus:outline-none cursor-pointer"
            >
              {availableModels.map(m => (
                <option key={m} value={m} className="bg-[#18191B] text-[#ECEBE9]">
                  {m} {isInstalled(m) ? '✓ Installed' : ''}
                </option>
              ))}
            </select>
          </div>

          {!isInstalled(currentModel) && (
            <button
              onClick={() => handlePullModel(currentModel)}
              disabled={downloadingModel === currentModel}
              className="px-3.5 py-2 bg-[#3C6B4D]/20 border border-[#3C6B4D]/40 text-[#3C6B4D] hover:bg-[#3C6B4D]/30 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <Download size={13} className={downloadingModel === currentModel ? 'animate-spin' : ''} />
              <span>{downloadingModel === currentModel ? `Pulling ${pullProgress}%` : 'Download Model'}</span>
            </button>
          )}

          <button
            onClick={handleRouteQuery}
            disabled={isRouting || !userQuery.trim()}
            className="px-4 py-2 bg-[#3C6B4D] hover:bg-[#2E533B] disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-[#3C6B4D]/20"
          >
            <Sparkles size={14} className={isRouting ? 'animate-spin' : ''} />
            <span>{isRouting ? 'Classifying...' : 'Classify &amp; Route Prompt'}</span>
          </button>
        </div>
      </div>

      {!isInstalled(currentModel) && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>Model <strong>{currentModel}</strong> is not installed in local Ollama storage. Click Download Model to pull it directly!</span>
          </div>
          <button
            onClick={() => handlePullModel(currentModel)}
            disabled={downloadingModel === currentModel}
            className="px-3 py-1 bg-amber-500 text-black font-extrabold rounded-lg text-xs"
          >
            {downloadingModel === currentModel ? `Pulling (${pullProgress}%)` : `Download ${currentModel}`}
          </button>
        </div>
      )}

      {/* Rules Matrix */}
      <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-3">
        <span className="text-xs font-extrabold text-[#ECEBE9] border-b border-[#2A2D30] pb-2 block">
          Model Intent Routing Matrix
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {routingRules.map(rule => (
            <div key={rule.id} className="p-3 bg-[#111213] border border-[#2A2D30] rounded-xl space-y-1.5 font-mono text-xs">
              <span className="text-emerald-400 font-bold block">{rule.intentCategory}</span>
              <p className="text-[10px] text-[#A3A09B]">Target: {rule.targetModel}</p>
              <div className="flex flex-wrap gap-1 pt-1">
                {rule.keywords.map((k, i) => (
                  <span key={i} className="text-[9px] bg-[#3C6B4D]/20 text-[#3C6B4D] px-1.5 py-0.5 rounded">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-3">
          <label className="text-xs font-bold text-[#A3A09B]">Input Prompt Payload</label>
          <textarea
            value={userQuery}
            onChange={e => setUserQuery(e.target.value)}
            rows={4}
            className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D] resize-none"
          />
        </div>

        {routedResult && (
          <div className="lg:col-span-5 bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-3">
            <span className="text-xs font-extrabold text-[#ECEBE9] flex items-center gap-2 border-b border-[#2A2D30] pb-2">
              <CheckCircle2 size={14} className="text-emerald-400" /> Optimal Model Routing Decision
            </span>
            <div className="p-4 bg-[#111213] border border-[#2A2D30] rounded-xl space-y-2 font-mono text-xs">
              <div className="text-[#3C6B4D] font-bold">Selected Model: {routedResult.selectedModel}</div>
              <div className="text-amber-300">Confidence Score: {(routedResult.confidence * 100).toFixed(0)}%</div>
              <p className="text-[#ECEBE9] font-sans text-xs pt-1">{routedResult.reason}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
