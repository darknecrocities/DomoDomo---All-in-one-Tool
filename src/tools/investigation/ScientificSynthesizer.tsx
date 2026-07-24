import React, { useState, useEffect } from 'react';
import { BookOpen, Cpu, FileText, Check, Copy } from 'lucide-react';
import { aiService } from '../../utils/aiService';

export const ScientificSynthesizer: React.FC = () => {
  const [text, setText] = useState('');
  const [depth, setDepth] = useState<'summary' | 'comprehensive' | 'critique'>('summary');
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

  const handleSynthesize = async () => {
    if (!text.trim()) return;
    setIsProcessing(true);
    setResult(null);

    const prompt = `You are an expert scientific literature reviewer. Please perform a ${depth} synthesis of the following scientific text. Extract:
1. Key Abstract & Overview
2. Core Hypotheses & Variables
3. Research Methodology (Data, Subjects, Controls)
4. Key Findings & Empirical Results
5. Limitations & Future Directions

Provide your analysis in clean, structured markdown format.

Scientific text:
${text}`;

    try {
      const response = await aiService.generateText(prompt, 1200, undefined, selectedModel, {
        systemPrompt: "You are a professional research scientist. Summarize literature objectively and rigorously."
      });
      setResult(response);
    } catch (err) {
      console.error(err);
      setResult("Error processing synthesis. Make sure local Ollama is active or use a different model.");
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
          <BookOpen size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold">Scientific Literature Synthesizer</h3>
          <p className="text-xs text-[#A3A09B]">Paste academic literature to extract hypotheses, methodology, and results locally.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <label className="text-xs font-semibold text-[#A3A09B]">Synthesis Mode Depth</label>
          <div className="flex gap-2">
            {(['summary', 'comprehensive', 'critique'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDepth(d)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                  depth === d
                    ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/45 text-[#ECEBE9]'
                    : 'bg-[#111213] border-[#2A2D30] text-[#A3A09B] hover:text-[#ECEBE9]'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-[#A3A09B]">Academic Text Input</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste scientific paper text, abstract, or clinical reporting sections here..."
          className="w-full min-h-[160px] bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] placeholder:text-[#72706C] focus:outline-none focus:border-[#3C6B4D]"
        />
      </div>

      <button
        onClick={handleSynthesize}
        disabled={isProcessing || !text.trim()}
        className="w-full btn-primary py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Cpu size={14} className={isProcessing ? 'animate-spin' : ''} />
        <span>{isProcessing ? 'Synthesizing Paper Offline...' : 'Synthesize Literature'}</span>
      </button>

      {result && (
        <div className="flex flex-col gap-2 mt-2 bg-[#111213] border border-[#2A2D30] rounded-xl p-4 relative animate-fadeIn">
          <div className="flex justify-between items-center border-b border-[#2A2D30] pb-2 mb-2">
            <span className="text-xs font-semibold text-[#A3A09B] flex items-center gap-1.5">
              <FileText size={12} />
              <span>Synthesis Output</span>
            </span>
            <button
              onClick={handleCopy}
              className="text-[#A3A09B] hover:text-[#ECEBE9] transition-colors p-1"
              title="Copy Output"
            >
              {copied ? <Check size={14} className="text-[#3C6C4D]" /> : <Copy size={14} />}
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

export const ScientificSynthesizerTool = {
  id: 'scientific-synthesizer',
  name: 'Scientific Literature Synthesizer',
  categories: ['investigation' as any],
  description: 'Paste academic literature to extract hypotheses, methodology, and results locally.',
  icon: 'BookOpen',
  run: async (input: any) => input,
  component: ScientificSynthesizer
};
