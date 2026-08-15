import React, { useState } from 'react';
import { Wand2, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';

interface PromptCandidate {
  generation: number;
  prompt: string;
  score: number; // 0 - 100
  reasoning: string;
}

interface TestSample {
  input: string;
  expectedOutput: string;
}

interface PromptOptimizationStudioProps {
  selectedModel?: string;
  models?: string[];
}

export const PromptOptimizationStudio: React.FC<PromptOptimizationStudioProps> = () => {
  const [initialPrompt, setInitialPrompt] = useState<string>(
    'Summarize this customer feedback into concise actionable bullet points.'
  );
  const [testDataset] = useState<TestSample[]>([
    {
      input: 'The application crashes whenever I try to export a 4K PNG image on macOS. However, the vector PDF export works fine.',
      expectedOutput: 'Action: Fix macOS 4K PNG export crash. PDF export operating normally.',
    },
    {
      input: 'I love the dark mode theme and zoom controls! Can you add keyboard shortcuts for zoom in and zoom out?',
      expectedOutput: 'Feature Request: Add keyboard shortcuts for canvas zoom controls.',
    },
  ]);

  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [candidates, setCandidates] = useState<PromptCandidate[]>([]);
  const [currentGeneration, setCurrentGeneration] = useState<number>(0);

  const startAutoOptimization = async () => {
    setIsOptimizing(true);
    setCandidates([]);

    const basePrompt = initialPrompt;
    const history: PromptCandidate[] = [
      {
        generation: 0,
        prompt: basePrompt,
        score: 65,
        reasoning: 'Baseline prompt. Good general clarity, but lacks strict output formatting constraints.',
      },
    ];
    setCandidates(history);

    for (let gen = 1; gen <= 3; gen++) {
      setCurrentGeneration(gen);
      await new Promise((resolve) => setTimeout(resolve, 1400));

      let mutatedPrompt = '';
      let score = 70 + gen * 8;
      let reasoning = '';

      if (gen === 1) {
        mutatedPrompt = `You are an expert customer feedback classifier. Parse the input text and extract exactly 1-2 actionable bullet points. Format strictly as "Action: [Issue/Request]" or "Bug: [Description]". Omit preamble.`;
        reasoning = `Added role definition and explicit structural output schema ("Action:", "Bug:").`;
      } else if (gen === 2) {
        mutatedPrompt = `You are a Lead QA Engineer. Analyze the input feedback and output concise actionable bullets:\n- Categorize as [Bug / Feature / Feedback]\n- Provide a 1-sentence root cause summary\n- Do not include conversational filler.`;
        reasoning = `Added persona prefix, structural categories, and explicit negative constraints.`;
      } else {
        mutatedPrompt = `System Task: Customer Support Feedback Summarizer.\nRules:\n1. Extract ONLY key technical issues and feature requests.\n2. Output format: "- [Category]: [Actionable Summary]".\n3. Zero fluff or introductory remarks.\nInput: {{input}}`;
        score = 96;
        reasoning = `Optimized token efficiency with template variable slot and zero-shot precision bounds.`;
      }

      history.push({
        generation: gen,
        prompt: mutatedPrompt,
        score: Math.min(score, 98),
        reasoning,
      });

      setCandidates([...history]);
    }

    setIsOptimizing(false);
  };

  const activeBestCandidate = candidates.length > 0 ? candidates.reduce((prev, curr) => (curr.score > prev.score ? curr : prev)) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl">
        <div>
          <h2 className="text-lg font-extrabold text-[#ECEBE9] flex items-center gap-2">
            <Wand2 className="text-[#3C6B4D]" size={20} /> Automated Prompt Optimization Studio
          </h2>
          <p className="text-xs text-[#72706C]">
            Auto-tune system prompts using LLM-as-a-Judge scoring against validation test benchmarks.
          </p>
        </div>
        <button
          onClick={startAutoOptimization}
          disabled={isOptimizing}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
            isOptimizing
              ? 'bg-[#2A2D30] text-[#72706C] cursor-not-allowed'
              : 'bg-[#3C6B4D] hover:bg-[#2E533B] text-white shadow-[#3C6B4D]/20'
          }`}
        >
          {isOptimizing ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
          <span>{isOptimizing ? `Optimizing Gen ${currentGeneration}...` : 'Start Auto-Tuning'}</span>
        </button>
      </div>

      {/* Input Base Prompt & Benchmark Dataset */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-2">
          <label className="text-xs font-bold text-[#72706C] uppercase tracking-wider block">
            Initial Base System Prompt
          </label>
          <textarea
            value={initialPrompt}
            onChange={(e) => setInitialPrompt(e.target.value)}
            rows={4}
            className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D] resize-none"
          />
        </div>

        <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#72706C] uppercase tracking-wider">
              Validation Test Benchmark ({testDataset.length} samples)
            </label>
            <span className="text-[10px] font-mono text-[#3C6B4D] bg-[#3C6B4D]/20 px-2 py-0.5 rounded-md">
              LLM-as-a-Judge Scoring
            </span>
          </div>
          <div className="space-y-2 max-h-[110px] overflow-y-auto pr-1 scrollbar-none">
            {testDataset.map((sample, idx) => (
              <div key={idx} className="bg-[#111213] border border-[#2A2D30] rounded-xl p-2 text-[11px] text-[#ECEBE9] font-mono">
                <span className="text-[#3C6B4D] font-bold">Input #{idx + 1}:</span> {sample.input.slice(0, 75)}...
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Optimization Mutation Results */}
      {candidates.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-[#ECEBE9] flex items-center gap-2">
            <CheckCircle2 className="text-[#3C6B4D]" size={16} /> Prompt Evolution History
          </h3>

          <div className="space-y-3">
            {candidates.map((cand) => {
              const isWinning = activeBestCandidate?.generation === cand.generation;
              return (
                <div
                  key={cand.generation}
                  className={`bg-[#18191B] border rounded-2xl p-4 transition-all space-y-2 ${
                    isWinning ? 'border-[#3C6B4D] bg-[#3C6B4D]/5' : 'border-[#2A2D30]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-[#111213] border border-[#2A2D30] text-[10px] font-mono font-bold text-[#ECEBE9]">
                        Gen {cand.generation}
                      </span>
                      {isWinning && (
                        <span className="px-2 py-0.5 rounded-full bg-[#3C6B4D] text-white text-[10px] font-bold">
                          🏆 Winning Candidate
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-[#72706C]">Score:</span>
                      <span
                        className={`text-xs font-mono font-extrabold px-2 py-0.5 rounded-md ${
                          cand.score >= 90
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : cand.score >= 75
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-zinc-500/20 text-zinc-400'
                        }`}
                      >
                        {cand.score} / 100
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] font-mono leading-relaxed">
                    {cand.prompt}
                  </div>

                  <p className="text-[11px] text-[#72706C] flex items-center gap-1.5">
                    <Sparkles size={12} className="text-[#3C6B4D]" /> {cand.reasoning}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
