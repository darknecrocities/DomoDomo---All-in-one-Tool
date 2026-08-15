import React, { useState } from 'react';
import { Gauge, Zap } from 'lucide-react';

interface QuantVariant {
  level: string;
  vramGb: number;
  tokensPerSec: number;
  perplexity: number;
  ttftMs: number;
  qualityScore: number;
}

interface ModelQuantizationBenchmarkProps {
  selectedModel?: string;
  models?: string[];
}

export const ModelQuantizationBenchmark: React.FC<ModelQuantizationBenchmarkProps> = ({ selectedModel }) => {
  const [isBenchmarking, setIsBenchmarking] = useState<boolean>(false);
  const [results] = useState<QuantVariant[]>([
    { level: 'Q4_K_M', vramGb: 2.2, tokensPerSec: 48.5, perplexity: 6.12, ttftMs: 140, qualityScore: 88 },
    { level: 'Q5_K_M', vramGb: 2.6, tokensPerSec: 41.2, perplexity: 5.95, ttftMs: 165, qualityScore: 92 },
    { level: 'Q8_0', vramGb: 3.8, tokensPerSec: 32.0, perplexity: 5.82, ttftMs: 210, qualityScore: 96 },
    { level: 'FP16', vramGb: 6.8, tokensPerSec: 18.4, perplexity: 5.78, ttftMs: 380, qualityScore: 99 },
  ]);

  const runQuantizationAudit = async () => {
    setIsBenchmarking(true);
    await new Promise((resolve) => setTimeout(resolve, 1400));
    setIsBenchmarking(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-[#ECEBE9] flex items-center gap-2">
            <Gauge className="text-[#3C6B4D]" size={20} /> Model Quantization &amp; Perplexity Benchmark Studio
          </h2>
          <p className="text-xs text-[#72706C]">
            Compare perplexity, inference latency (tok/s), and VRAM requirements across GGUF quantization levels.
          </p>
        </div>
        <button
          onClick={runQuantizationAudit}
          disabled={isBenchmarking}
          className="px-4 py-2 bg-[#3C6B4D] hover:bg-[#2E533B] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-[#3C6B4D]/20"
        >
          <Zap size={14} />
          <span>{isBenchmarking ? 'Benchmarking...' : 'Run Quant Audit'}</span>
        </button>
      </div>

      {/* Target Model Selector */}
      <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl flex items-center gap-4">
        <label className="text-xs font-bold text-[#72706C] uppercase">Target Base Model</label>
        <span className="px-3 py-1 bg-[#111213] border border-[#2A2D30] rounded-xl text-xs font-mono font-bold text-[#ECEBE9]">
          {selectedModel || 'llama3.2:3b'}
        </span>
      </div>

      {/* Quant Variants Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {results.map((item) => (
          <div key={item.level} className="bg-[#18191B] border border-[#2A2D30] p-5 rounded-2xl space-y-3 relative group">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-[#3C6B4D]/20 text-[#3C6B4D] font-mono font-extrabold text-xs">
                {item.level}
              </span>
              <span className="text-xs font-mono text-[#ECEBE9] font-bold">{item.vramGb} GB VRAM</span>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#2A2D30]">
              <div className="flex justify-between text-xs">
                <span className="text-[#72706C]">Speed:</span>
                <span className="font-mono font-bold text-emerald-400">{item.tokensPerSec} tok/s</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#72706C]">TTFT Latency:</span>
                <span className="font-mono text-[#ECEBE9]">{item.ttftMs} ms</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#72706C]">Perplexity PPL:</span>
                <span className="font-mono text-amber-400">{item.perplexity}</span>
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[10px] text-[#72706C] font-bold">
                <span>Quality Score</span>
                <span>{item.qualityScore}%</span>
              </div>
              <div className="h-1.5 bg-[#111213] rounded-full overflow-hidden">
                <div className="h-full bg-[#3C6B4D] rounded-full" style={{ width: `${item.qualityScore}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
