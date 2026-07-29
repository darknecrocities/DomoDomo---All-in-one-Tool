import React, { useState } from 'react';
import { Workflow, Cpu, Zap, CheckCircle2, Settings } from 'lucide-react';

interface RouteDecision {
  category: 'coding' | 'reasoning' | 'chat' | 'vision' | 'extraction';
  selectedModel: string;
  confidence: number;
  reason: string;
  ensembleVotes?: { model: string; vote: string; weight: number }[];
}

export const MultiModelRouter: React.FC = () => {
  const [promptText, setPromptText] = useState<string>(
    'Write a TypeScript function to parse JSON files asynchronously with fallback error handling.'
  );

  const [routingMatrix, setRoutingMatrix] = useState({
    coding: 'qwen2.5-coder:1.5b',
    reasoning: 'deepseek-r1:1.5b',
    vision: 'llava:7b',
    chat: 'llama3.2:1b',
    extraction: 'qwen2.5-coder:1.5b'
  });

  const [isRouting, setIsRouting] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [decision, setDecision] = useState<RouteDecision | null>({
    category: 'coding',
    selectedModel: 'qwen2.5-coder:1.5b',
    confidence: 0.96,
    reason: 'Detected code generation keyword "TypeScript function". Selected specialized coding LLM for optimal syntax accuracy.',
    ensembleVotes: [
      { model: 'qwen2.5-coder:1.5b', vote: 'Valid TS Async Function', weight: 0.96 },
      { model: 'llama3.2:1b', vote: 'Valid JS Function', weight: 0.88 },
      { model: 'deepseek-r1:1.5b', vote: 'Valid Async Promise Pattern', weight: 0.92 }
    ]
  });

  const handleRouteQuery = () => {
    setIsRouting(true);
    setTimeout(() => {
      const text = promptText.toLowerCase();
      let cat: 'coding' | 'reasoning' | 'chat' | 'vision' | 'extraction' = 'chat';
      let conf = 0.88;
      let reason = '';

      if (text.includes('image') || text.includes('diagram') || text.includes('photo') || text.includes('screenshot')) {
        cat = 'vision';
        conf = 0.98;
        reason = `Multimodal vision request detected. Routed to ${routingMatrix.vision}.`;
      } else if (text.includes('function') || text.includes('code') || text.includes('typescript') || text.includes('python') || text.includes('json')) {
        cat = 'coding';
        conf = 0.95;
        reason = `Programming or syntax intent detected. Routed to specialized coding model ${routingMatrix.coding}.`;
      } else if (text.includes('why') || text.includes('math') || text.includes('logic') || text.includes('prove') || text.includes('step by step')) {
        cat = 'reasoning';
        conf = 0.93;
        reason = `Step-by-step logic or reasoning requested. Routed to Chain-of-Thought model ${routingMatrix.reasoning}.`;
      } else if (text.includes('extract') || text.includes('parse') || text.includes('convert')) {
        cat = 'extraction';
        conf = 0.91;
        reason = `Data extraction intent detected. Routed to ${routingMatrix.extraction}.`;
      } else {
        cat = 'chat';
        conf = 0.85;
        reason = `General conversational query. Routed to low-latency fast chat model ${routingMatrix.chat}.`;
      }

      setDecision({
        category: cat,
        selectedModel: routingMatrix[cat],
        confidence: conf,
        reason,
        ensembleVotes: [
          { model: routingMatrix[cat], vote: 'Primary Candidate Match', weight: conf },
          { model: 'llama3.2:1b', vote: 'Fallback Consensus OK', weight: 0.84 },
          { model: 'deepseek-r1:1.5b', vote: 'Logical Consistency OK', weight: 0.89 }
        ]
      });
      setIsRouting(false);
    }, 450);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-[#18191B] border border-[#2A2D30] p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#3C6B4D]/15 text-[#3C6B4D] text-[10px] font-bold uppercase tracking-wider mb-1">
            <Workflow size={12} />
            <span>Intelligent Intent Classifier &amp; Ensemble Gateway</span>
          </div>
          <h2 className="text-lg font-extrabold text-[#ECEBE9]">Multi-Model Router Studio</h2>
          <p className="text-[#72706C] text-xs mt-0.5">Automatically classifies user intent and routes prompts to specialized local LLMs (Qwen Coder, DeepSeek R1, Llama 3.2, Llava).</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConfig(prev => !prev)}
            className="px-3.5 py-2 bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs font-bold rounded-xl transition-all flex items-center gap-2"
          >
            <Settings size={14} /> Matrix Config
          </button>
          <button
            onClick={handleRouteQuery}
            disabled={isRouting || !promptText.trim()}
            className="px-4 py-2 bg-[#3C6B4D] hover:bg-[#2E533B] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shrink-0 shadow-md shadow-[#3C6B4D]/20"
          >
            <Zap size={14} className={isRouting ? 'animate-spin' : ''} />
            <span>{isRouting ? 'Classifying Intent...' : 'Classify & Route Query'}</span>
          </button>
        </div>
      </div>

      {/* Config Drawer */}
      {showConfig && (
        <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-3 animate-fadeIn">
          <span className="text-xs font-extrabold text-[#ECEBE9] border-b border-[#2A2D30] pb-2 block">
            Custom Model Routing Matrix
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
            {Object.keys(routingMatrix).map(key => (
              <div key={key} className="space-y-1">
                <span className="text-[#72706C] uppercase font-bold text-[10px]">{key}</span>
                <input
                  type="text"
                  value={routingMatrix[key as keyof typeof routingMatrix]}
                  onChange={e => {
                    const val = e.target.value;
                    setRoutingMatrix(prev => ({ ...prev, [key]: val }));
                  }}
                  className="w-full bg-[#111213] border border-[#2A2D30] rounded-lg px-2 py-1 text-xs text-[#ECEBE9]"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Prompt Input */}
        <div className="lg:col-span-6 bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-3">
          <label className="text-xs font-bold text-[#A3A09B] flex items-center gap-2">
            <Cpu size={14} className="text-[#3C6B4D]" /> Test User Prompt Payload
          </label>
          <textarea
            value={promptText}
            onChange={e => setPromptText(e.target.value)}
            rows={5}
            className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D] resize-none"
            placeholder="Type any coding, math, vision, or general prompt..."
          />
        </div>

        {/* Routing Decision Result */}
        <div className="lg:col-span-6 bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-3">
          <span className="text-xs font-extrabold text-[#ECEBE9] flex items-center gap-2 border-b border-[#2A2D30] pb-2">
            <CheckCircle2 size={14} className="text-emerald-400" /> Optimal Routing Decision
          </span>

          {decision && (
            <div className="bg-[#111213] border border-[#2A2D30] p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#72706C]">Detected Category:</span>
                <span className="font-mono font-bold text-[#3C6B4D] uppercase bg-[#3C6B4D]/15 px-2 py-0.5 rounded border border-[#3C6B4D]/30">
                  {decision.category}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#72706C]">Target Local LLM:</span>
                <span className="font-mono font-bold text-emerald-400">{decision.selectedModel}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#72706C]">Classifier Confidence:</span>
                <span className="font-mono text-amber-300">{(decision.confidence * 100).toFixed(0)}%</span>
              </div>
              <p className="text-xs text-[#A3A09B] leading-relaxed pt-2 border-t border-[#2A2D30]">
                {decision.reason}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
