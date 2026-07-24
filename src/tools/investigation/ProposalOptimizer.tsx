import React, { useState, useEffect } from 'react';
import { Sparkles, Cpu, FileText, Check, Copy } from 'lucide-react';
import { aiService } from '../../utils/aiService';

export const ProposalOptimizer: React.FC = () => {
  const [proposal, setProposal] = useState('');
  const [guidelines, setGuidelines] = useState('');
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('llama3.2:1b');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      const { status, models } = await aiService.checkOllama();
      if (status && models.length > 0) {
        setModels(models);
        const saved = aiService.getSelectedOllamaModel();
        if (saved && models.includes(saved)) {
          setSelectedModel(saved);
        } else {
          setSelectedModel(models[0]);
        }
      }
    };
    loadModels();
  }, []);

  const handleOptimize = async () => {
    if (!proposal.trim()) return;
    setIsProcessing(true);
    setResult(null);

    const prompt = `You are a senior reviewer for major scientific grants (e.g. NSF, NIH, Horizon Europe). Audit the following research proposal draft against the provided funding guidelines/criteria.
Analyze and provide:
1. Alignment Score & Compliance Checklist (identify missing sections or requirements)
2. Structural Strengths & Weaknesses (clarity of objectives, methodology soundness)
3. Budget & Resource justification critique
4. Specific optimization/rewrite suggestions for key paragraphs to improve funding success probability.

Guidelines/Funding Criteria:
${guidelines || 'General scientific grant criteria (Impact, Innovation, Feasibility)'}

Proposal Draft text:
${proposal}`;

    try {
      const response = await aiService.generateText(prompt, 1200, undefined, selectedModel, {
        systemPrompt: "You are a professional grant reviewer. Critique funding proposals constructively, highlighting structural gaps and formatting alignment."
      });
      setResult(response);
    } catch (err) {
      console.error(err);
      setResult("Error optimizing proposal. Verify your local LLM service.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] text-[#ECEBE9] flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#3C6B4D]/10 text-[#3C6B4D] rounded-lg">
          <Sparkles size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold">Funding Proposal Optimizer</h3>
          <p className="text-xs text-[#A3A09B]">Review proposal drafts against grant guidelines and outline gaps in compliance offline.</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-[#A3A09B]">Local AI Model Selector</label>
        <select
          value={selectedModel}
          onChange={(e) => {
            setSelectedModel(e.target.value);
            aiService.setSelectedOllamaModel(e.target.value);
          }}
          className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#3C6B4D]"
        >
          {models.length > 0 ? (
            models.map((m) => <option key={m} value={m}>{m}</option>)
          ) : (
            <option value="llama3.2:1b">llama3.2:1b (Simulation Mode)</option>
          )}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#A3A09B]">Funding Agency Guidelines & Criteria</label>
          <textarea
            value={guidelines}
            onChange={(e) => setGuidelines(e.target.value)}
            placeholder="Paste grant requirements, rubric, evaluation criteria (e.g. intellectual merit, broader impacts)..."
            className="w-full min-h-[140px] bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] placeholder:text-[#72706C] focus:outline-none focus:border-[#3C6B4D]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#A3A09B]">Proposal Abstract or Draft</label>
          <textarea
            value={proposal}
            onChange={(e) => setProposal(e.target.value)}
            placeholder="Paste your grant application draft, methodology overview, or budget justification details..."
            className="w-full min-h-[140px] bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] placeholder:text-[#72706C] focus:outline-none focus:border-[#3C6B4D]"
          />
        </div>
      </div>

      <button
        onClick={handleOptimize}
        disabled={isProcessing || !proposal.trim()}
        className="w-full btn-primary py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Cpu size={14} className={isProcessing ? 'animate-spin' : ''} />
        <span>{isProcessing ? 'Optimizing Proposal...' : 'Optimize Funding Proposal'}</span>
      </button>

      {result && (
        <div className="flex flex-col gap-2 mt-2 bg-[#111213] border border-[#2A2D30] rounded-xl p-4 relative animate-fadeIn">
          <div className="flex justify-between items-center border-b border-[#2A2D30] pb-2 mb-2">
            <span className="text-xs font-semibold text-[#A3A09B] flex items-center gap-1.5">
              <FileText size={12} />
              <span>Proposal Evaluation Report</span>
            </span>
            <button
              onClick={handleCopy}
              className="text-[#A3A09B] hover:text-[#ECEBE9] transition-colors p-1"
            >
              {copied ? <Check size={14} className="text-[#3C6B4D]" /> : <Copy size={14} />}
            </button>
          </div>
          <div className="text-xs leading-relaxed text-[#ECEBE9] overflow-auto max-h-[300px] whitespace-pre-wrap font-mono">
            {result}
          </div>
        </div>
      )}
    </div>
  );
};

export const ProposalOptimizerTool = {
  id: 'proposal-optimizer',
  name: 'Funding Proposal Optimizer',
  categories: ['investigation' as any],
  description: 'Review proposal drafts against grant guidelines and outline gaps in compliance offline.',
  icon: 'Sparkles',
  run: async (input: any) => input,
  component: ProposalOptimizer
};
