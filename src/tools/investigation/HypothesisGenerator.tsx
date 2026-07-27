import React, { useState, useEffect } from 'react';
import { Sparkles, Cpu, Check, Copy, Download, Compass } from 'lucide-react';
import { aiService } from '../../utils/aiService';

const HYPOTHESIS_PRESETS = [
  {
    name: 'Neuroscience & Sleep Memory',
    field: 'Cognitive Neuroscience',
    variables: 'REM sleep duration, slow-wave theta power, procedural memory consolidation score',
  },
  {
    name: 'Battery Energy Density',
    field: 'Solid-State Electrochemistry',
    variables: 'Lithium-lanthanum-zirconium oxide (LLZO) electrolyte thickness, ionic conductivity at 25°C, dendritic growth rate',
  },
  {
    name: 'LLM Quantization Fidelity',
    field: 'Machine Learning / AI Systems',
    variables: '4-bit NormalFloat (NF4) quantization, activation outlier clipping threshold, perplexity loss on GSM8K benchmark',
  },
];

export const HypothesisGenerator: React.FC = () => {
  const [field, setField] = useState('');
  const [variables, setVariables] = useState('');
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

  const generateOfflineHypotheses = (targetField: string, targetVars: string): string => {
    const varList = targetVars ? targetVars.split(',').map(v => v.trim()) : ['Variable A', 'Variable B', 'Performance Metric'];
    const iv = varList[0] || 'Independent Variable';
    const dv = varList[1] || 'Dependent Variable';
    const cv = varList[2] || 'Control Variable';

    return `# Scientific Research Hypothesis Design Brief: ${targetField}

## 1. 4-Quadrant Hypothesis Formulation Matrix
| Quadrant | Hypothesis Type | Formal Statement |
| :--- | :--- | :--- |
| **H₀ (Null)** | Statistical Baseline | There is no statistically significant relationship between ${iv} and ${dv} in ${targetField} (p > 0.05). |
| **H₁ (Alternative)** | Primary Research Claim | Increasing ${iv} results in a measurable, monotonic increase in ${dv}. |
| **H₂ (Operational)** | Experimental Design | In controlled trials with ${cv} held constant, a 20% increase in ${iv} will yield >= 15% optimization in ${dv}. |
| **H₃ (Conceptual)** | Theoretical Model | The underlying mechanism is governed by non-linear systemic coupling between ${iv} and targeted domain variables. |

## 2. Experimental Protocol & Variable Control
- **Independent Variable (IV)**: ${iv}
- **Dependent Variable (DV)**: ${dv}
- **Confounding Risk Mitigations**: Regulate ${cv} using double-blind control protocols.

## 3. Recommended Statistical Testing Suite
- **Primary Test**: Two-Way ANOVA or Welch's t-test depending on normality distribution.
- **Effect Size Metric**: Cohen's d / Partial Eta Squared (η²).

---
*Generated via DomoDomo Deterministic Scientific Hypothesis Engine*`;
  };

  const handleGenerateHypotheses = async () => {
    if (!field.trim()) return;
    setIsProcessing(true);
    setResult(null);

    const prompt = `You are a visionary principal research scientist. Based on the target research field and input variables below, generate 4 testable, novel, and statistically valid research hypotheses.
Output:
1. 4-Quadrant Hypothesis Formulation Matrix (Null H₀, Alternative H₁, Operational H₂, Conceptual H₃)
2. Variable Control & Protocol Specifications (IV, DV, Confounders)
3. Recommended Statistical Test Engine (ANOVA, Regression, Chi-Square)
4. Expected Scientific Impact & Publication Significance

Field of Research:
${field}

Target Variables:
${variables || 'Open research design'}`;

    try {
      const response = await aiService.generateText(prompt, 1400, undefined, selectedModel, {
        systemPrompt: "You are an expert scientific advisor generating testable hypotheses with well-defined variables."
      });
      setResult(response);
    } catch (err) {
      console.warn('Ollama offline fallback:', err);
      setResult(generateOfflineHypotheses(field, variables));
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
    a.download = 'research_hypothesis_brief.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] text-[#ECEBE9] flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2A2D30] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#3C6B4D]/10 border border-[#3C6B4D]/20 text-[#3C6B4D] rounded-xl">
            <Sparkles size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold">Research Hypothesis Generator</h3>
            <p className="text-xs text-[#A3A09B]">
              Formulate 4-quadrant scientific hypotheses, define variable controls, and select statistical tests offline.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#72706C] font-semibold uppercase tracking-wider">Presets:</span>
          {HYPOTHESIS_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => {
                setField(p.field);
                setVariables(p.variables);
              }}
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

      {/* Inputs */}
      <div className="grid grid-cols-1 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#A3A09B]">Field of Research / Topic</label>
          <input
            type="text"
            value={field}
            onChange={(e) => setField(e.target.value)}
            placeholder="e.g. Cognitive Neuroscience, Quantum Cryptography, Solid-State Batteries..."
            className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-3.5 py-2.5 text-xs text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D] font-mono"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#A3A09B]">Target Variables / Measured Indicators (Optional)</label>
          <textarea
            value={variables}
            onChange={(e) => setVariables(e.target.value)}
            placeholder="e.g. Independent variable, dependent variable, control thresholds..."
            className="w-full min-h-[90px] bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] placeholder:text-[#72706C] focus:outline-none focus:border-[#3C6B4D] font-mono"
          />
        </div>
      </div>

      <button
        onClick={handleGenerateHypotheses}
        disabled={isProcessing || !field.trim()}
        className="w-full btn-primary py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
      >
        <Cpu size={14} className={isProcessing ? 'animate-spin' : ''} />
        <span>{isProcessing ? 'Formulating 4-Quadrant Hypotheses Offline...' : 'Generate 4-Quadrant Research Hypotheses'}</span>
      </button>

      {/* Result Output */}
      {result && (
        <div className="flex flex-col gap-3 bg-[#111213] border border-[#2A2D30] rounded-xl p-5 relative animate-fadeIn">
          <div className="flex justify-between items-center border-b border-[#2A2D30] pb-2">
            <span className="text-xs font-bold text-[#ECEBE9] flex items-center gap-1.5">
              <Compass size={14} className="text-[#3C6B4D]" />
              <span>Hypothesis Design Brief</span>
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

export const HypothesisGeneratorTool = {
  id: 'hypothesis-generator',
  name: 'Research Hypothesis Generator',
  categories: ['investigation' as any],
  description: 'Formulate 4-quadrant scientific hypotheses, define variable controls, and select statistical tests offline.',
  icon: 'Sparkles',
  run: async (input: any) => input,
  component: HypothesisGenerator
};
