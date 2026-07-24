import React, { useState, useEffect } from 'react';
import { Sparkles, Cpu, FileText, Check, Copy } from 'lucide-react';
import { aiService } from '../../utils/aiService';

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

  const handleGenerateHypotheses = async () => {
    if (!field.trim()) return;
    setIsProcessing(true);
    setResult(null);

    const prompt = `You are a visionary principal research scientist. Based on the target research field and input variables provided, brainstorm 5 testable, novel, and statistically valid research hypotheses. For each hypothesis, supply:
1. Hypothesis Statement (Null and Alternative)
2. Independent & Dependent Variables
3. Proposed Control & Confounding variables to watch
4. Suggested Experimental Method or Data Collection mechanism (e.g. Survey, RCT, Cohort Study, Simulation)
5. Expected outcome or scientific impact

Field of Research:
${field}

Target Variables / Inputs:
${variables || 'Open research design'}

Provide this in structured academic markdown output.`;

    try {
      const response = await aiService.generateText(prompt, 1200, undefined, selectedModel, {
        systemPrompt: "You are an expert scientific advisor. Generate testable, rigorous hypotheses with well-defined variables and controls."
      });
      setResult(response);
    } catch (err) {
      console.error(err);
      setResult("Error generating hypotheses. Please confirm local model availability.");
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
          <h3 className="text-lg font-bold">Research Hypothesis Generator</h3>
          <p className="text-xs text-[#A3A09B]">Brainstorm novel scientific hypotheses, define control variables, and design experimental structures offline.</p>
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

      <div className="grid grid-cols-1 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#A3A09B]">Field of Research / Topic</label>
          <input
            type="text"
            value={field}
            onChange={(e) => setField(e.target.value)}
            placeholder="e.g. Cognitive Psychology, Quantum Cryptography, Renewable Batteries..."
            className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#A3A09B]">Core Variables or Target Concepts (Optional)</label>
          <textarea
            value={variables}
            onChange={(e) => setVariables(e.target.value)}
            placeholder="e.g. Sleep quality, memory recall rates, temperature cycles, density ratios..."
            className="w-full min-h-[100px] bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] placeholder:text-[#72706C] focus:outline-none focus:border-[#3C6B4D]"
          />
        </div>
      </div>

      <button
        onClick={handleGenerateHypotheses}
        disabled={isProcessing || !field.trim()}
        className="w-full btn-primary py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Cpu size={14} className={isProcessing ? 'animate-spin' : ''} />
        <span>{isProcessing ? 'Brainstorming Scientific Hypotheses...' : 'Generate Research Hypotheses'}</span>
      </button>

      {result && (
        <div className="flex flex-col gap-2 mt-2 bg-[#111213] border border-[#2A2D30] rounded-xl p-4 relative animate-fadeIn">
          <div className="flex justify-between items-center border-b border-[#2A2D30] pb-2 mb-2">
            <span className="text-xs font-semibold text-[#A3A09B] flex items-center gap-1.5">
              <FileText size={12} />
              <span>Hypothesis Design Brief</span>
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

export const HypothesisGeneratorTool = {
  id: 'hypothesis-generator',
  name: 'Research Hypothesis Generator',
  categories: ['investigation' as any],
  description: 'Brainstorm novel scientific hypotheses, define control variables, and design experimental structures offline.',
  icon: 'Sparkles',
  run: async (input: any) => input,
  component: HypothesisGenerator
};
