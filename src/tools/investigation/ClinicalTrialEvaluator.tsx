import React, { useState, useEffect } from 'react';
import { ShieldAlert, Cpu, FileText, Check, Copy } from 'lucide-react';
import { aiService } from '../../utils/aiService';

export const ClinicalTrialEvaluator: React.FC = () => {
  const [text, setText] = useState('');
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

  const handleEvaluate = async () => {
    if (!text.trim()) return;
    setIsProcessing(true);
    setResult(null);

    const prompt = `You are a clinical trials auditor and medical research analyst. Evaluate the clinical trial details or report text provided below. Extract and outline the following:
1. Trial Phase (Phase I, II, III, IV, or Pre-clinical)
2. Target Indication (Condition/Disease)
3. Subject Cohort Size & Demographics
4. Control Group & Blinding (e.g. Double-blind, Placebo-controlled, Randomized)
5. Primary & Secondary Endpoints
6. Efficacy Findings & Adverse Events / Side Effects

Provide a precise, tabbed markdown evaluation structure.

Clinical trial report text:
${text}`;

    try {
      const response = await aiService.generateText(prompt, 1200, undefined, selectedModel, {
        systemPrompt: "You are an objective clinical trial evaluator. Extract statistical cohorts, endpoints, and adverse events without clinical bias."
      });
      setResult(response);
    } catch (err) {
      console.error(err);
      setResult("Error evaluating trial. Please confirm your local AI model status.");
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
          <ShieldAlert size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold">Clinical Trial Evaluator</h3>
          <p className="text-xs text-[#A3A09B]">Extract trial phase, sample sizes, control groups, and endpoints from medical research text.</p>
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

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-[#A3A09B]">Trial Text or Protocol Summary</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste medical study text, trial description, or drug safety statistics here..."
          className="w-full min-h-[160px] bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] placeholder:text-[#72706C] focus:outline-none focus:border-[#3C6B4D]"
        />
      </div>

      <button
        onClick={handleEvaluate}
        disabled={isProcessing || !text.trim()}
        className="w-full btn-primary py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Cpu size={14} className={isProcessing ? 'animate-spin' : ''} />
        <span>{isProcessing ? 'Evaluating Clinical Protocol Offline...' : 'Evaluate Clinical Trial'}</span>
      </button>

      {result && (
        <div className="flex flex-col gap-2 mt-2 bg-[#111213] border border-[#2A2D30] rounded-xl p-4 relative animate-fadeIn">
          <div className="flex justify-between items-center border-b border-[#2A2D30] pb-2 mb-2">
            <span className="text-xs font-semibold text-[#A3A09B] flex items-center gap-1.5">
              <FileText size={12} />
              <span>Trial Evaluation Report</span>
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

export const ClinicalTrialEvaluatorTool = {
  id: 'clinical-evaluator',
  name: 'Clinical Trial Evaluator',
  categories: ['investigation' as any],
  description: 'Extract trial phase, sample sizes, control groups, and endpoints from medical research text.',
  icon: 'ShieldAlert',
  run: async (input: any) => input,
  component: ClinicalTrialEvaluator
};
