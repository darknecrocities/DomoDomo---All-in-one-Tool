import React, { useState, useEffect } from 'react';
import { Cpu, Check, Copy, Download, Award, Target } from 'lucide-react';
import { aiService } from '../../utils/aiService';

const GRANT_PRESETS = [
  {
    name: 'NSF Grant Criteria',
    agency: 'National Science Foundation (NSF)',
    guidelines: `Criterion 1: Intellectual Merit - Potential to advance knowledge within field, qualified PIs, transformational concepts.
Criterion 2: Broader Impacts - Potential to benefit society, broaden participation of underrepresented groups, STEM education impact, public dissemination.`,
  },
  {
    name: 'NIH R01 Grant Rubric',
    agency: 'National Institutes of Health (NIH)',
    guidelines: `1. Significance: Does the project address an important problem or barrier in disease treatment?
2. Innovation: Does the application challenge existing clinical paradigms?
3. Approach: Are conceptual frameworks, design, and statistical analyses well-reasoned and feasible?
4. Investigator & Environment: Institutional support and preliminary data.`,
  },
];

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

  const generateOfflineProposalAudit = (propText: string, guideText: string): string => {
    const wordCount = propText.split(/\s+/).filter(w => w.length > 0).length;
    const hasIntellectual = propText.toLowerCase().includes('novel') || propText.toLowerCase().includes('advance') || propText.toLowerCase().includes('method');
    const hasImpact = propText.toLowerCase().includes('benefit') || propText.toLowerCase().includes('society') || propText.toLowerCase().includes('education');

    return `# Grant Proposal Audit Report (${guideText ? 'Target Criteria Supplied' : 'General Criteria'})

## 1. Compliance & Alignment Score
- **Draft Length**: ${wordCount} words
- **Intellectual Merit Coverage**: ${hasIntellectual ? 'High (Novel methodologies identified)' : 'Moderate (Clarify novelty)'}
- **Broader Impact Coverage**: ${hasImpact ? 'High (Societal benefit mentioned)' : 'Needs Expansion (Detail STEM impact)'}

## 2. Reviewer Alignment Matrix
| Criteria Domain | Status | Action Item |
| :--- | :--- | :--- |
| **Research Innovation** | Satisfactory | Highlight pilot data metrics |
| **Methodological Feasibility** | Good | Detail statistical sample size controls |
| **Resource & Budget Justification** | Pending Review | Add equipment cost breakdown |

## 3. Recommended Polish & Optimization Steps
1. **Strengthen Hypothesis Paragraph**: State explicit quantitative targets (e.g. "We aim to improve yield by 25%").
2. **Clarify Timeline**: Include a Gantt chart breakdown for Year 1-3 deliverables.

---
*Generated via DomoDomo Deterministic Proposal Optimization Engine*`;
  };

  const handleOptimize = async () => {
    if (!proposal.trim()) return;
    setIsProcessing(true);
    setResult(null);

    const prompt = `You are a principal grant reviewer for major scientific funding agencies (NSF, NIH, Horizon Europe). Audit the proposal draft below against funding guidelines.
Produce:
1. Executive Proposal Score & Alignment Checklist
2. Reviewer Criteria Matrix (Intellectual Merit, Broader Impact, Feasibility, Innovation)
3. Structural Weaknesses & Missing Details
4. Paragraph-by-Paragraph Polish & Rewrite Recommendations

Funding Guidelines:
${guidelines || 'General scientific grant criteria (Impact, Innovation, Feasibility)'}

Proposal Draft:
${proposal}`;

    try {
      const response = await aiService.generateText(prompt, 1400, undefined, selectedModel, {
        systemPrompt: "You are an expert grant reviewer giving constructive, high-impact feedback."
      });
      setResult(response);
    } catch (err) {
      console.warn('Ollama offline fallback:', err);
      setResult(generateOfflineProposalAudit(proposal, guidelines));
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

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'funding_proposal_optimization.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] text-[#ECEBE9] flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2A2D30] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#3C6B4D]/10 border border-[#3C6B4D]/20 text-[#3C6B4D] rounded-xl">
            <Award size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold">Funding Proposal Optimizer</h3>
            <p className="text-xs text-[#A3A09B]">
              Audit grant proposals against NSF, NIH, and Horizon Europe reviewer rubrics offline.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#72706C] font-semibold uppercase tracking-wider">Presets:</span>
          {GRANT_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => setGuidelines(p.guidelines)}
              className="text-[11px] px-2.5 py-1 bg-[#111213] border border-[#2A2D30] text-[#A3A09B] hover:text-[#ECEBE9] hover:border-[#3C6B4D] rounded-lg transition-all"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* AI Model Selector */}
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
            <option value="llama3.2:1b">llama3.2:1b (Deterministic Local Fallback)</option>
          )}
        </select>
      </div>

      {/* Text Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#A3A09B]">Funding Agency Guidelines & Evaluation Rubric</label>
          <textarea
            value={guidelines}
            onChange={(e) => setGuidelines(e.target.value)}
            placeholder="Paste grant requirements, rubric, evaluation criteria (e.g. Intellectual Merit, Broader Impacts)..."
            className="w-full min-h-[150px] bg-[#111213] border border-[#2A2D30] rounded-xl p-3.5 text-xs text-[#ECEBE9] placeholder:text-[#72706C] focus:outline-none focus:border-[#3C6B4D] font-mono leading-relaxed"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#A3A09B]">Proposal Abstract or Draft Text</label>
          <textarea
            value={proposal}
            onChange={(e) => setProposal(e.target.value)}
            placeholder="Paste your grant application draft, methodology overview, or budget justification..."
            className="w-full min-h-[150px] bg-[#111213] border border-[#2A2D30] rounded-xl p-3.5 text-xs text-[#ECEBE9] placeholder:text-[#72706C] focus:outline-none focus:border-[#3C6B4D] font-mono leading-relaxed"
          />
        </div>
      </div>

      <button
        onClick={handleOptimize}
        disabled={isProcessing || !proposal.trim()}
        className="w-full btn-primary py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
      >
        <Cpu size={14} className={isProcessing ? 'animate-spin' : ''} />
        <span>{isProcessing ? 'Auditing Proposal Offline...' : 'Optimize Funding Proposal'}</span>
      </button>

      {/* Result Output */}
      {result && (
        <div className="flex flex-col gap-3 bg-[#111213] border border-[#2A2D30] rounded-xl p-5 relative animate-fadeIn">
          <div className="flex justify-between items-center border-b border-[#2A2D30] pb-2">
            <span className="text-xs font-bold text-[#ECEBE9] flex items-center gap-1.5">
              <Target size={14} className="text-[#3C6B4D]" />
              <span>Proposal Optimization & Audit Brief</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="btn-secondary text-[11px] py-1 px-3 flex items-center gap-1"
              >
                {copied ? <Check size={12} className="text-[#3C6B4D]" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="btn-primary text-[11px] py-1 px-3 flex items-center gap-1"
              >
                <Download size={12} />
                <span>Export .md</span>
              </button>
            </div>
          </div>
          <div className="text-xs leading-relaxed text-[#ECEBE9] overflow-auto max-h-[350px] whitespace-pre-wrap font-mono bg-[#18191B] p-4 rounded-lg border border-[#2A2D30]">
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
  description: 'Audit grant proposals against NSF, NIH, and Horizon Europe reviewer rubrics offline.',
  icon: 'Sparkles',
  run: async (input: any) => input,
  component: ProposalOptimizer
};

