import React, { useState, useEffect } from 'react';
import { aiService, PROVIDERS } from '../../utils/aiService';
import { Sparkles, Play, RefreshCw, Layers, Award, Clock } from 'lucide-react';

interface ArenaResult {
  modelName: string;
  response: string;
  tokensPerSec: number;
  latencyMs: number;
  totalTokens: number;
  cost: number;
  isLoading: boolean;
}

export const AISandboxArena: React.FC = () => {
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [modelA, setModelA] = useState('llama3.2:1b');
  const [modelB, setModelB] = useState('qwen2.5:0.5b');
  const [prompt, setPrompt] = useState('Explain quantum computing to a 10 year old in 3 bullet points.');
  const [resultA, setResultA] = useState<ArenaResult>({
    modelName: '', response: '', tokensPerSec: 0, latencyMs: 0, totalTokens: 0, cost: 0, isLoading: false
  });
  const [resultB, setResultB] = useState<ArenaResult>({
    modelName: '', response: '', tokensPerSec: 0, latencyMs: 0, totalTokens: 0, cost: 0, isLoading: false
  });

  const loadModels = async () => {
    try {
      const ollama = await aiService.checkOllama();
      // Combine local Ollama models with some default cloud options for selection
      const list = [...ollama.models];
      PROVIDERS.forEach(p => {
        if (p.type === 'cloud') {
          p.models.forEach(m => list.push(m));
        }
      });
      setModelOptions(Array.from(new Set(list)));
      
      if (ollama.models.length > 0) {
        setModelA(ollama.models[0]);
        setModelB(ollama.models[1] || ollama.models[0]);
      }
    } catch {
      // Fallback list
      setModelOptions(['llama3.2:1b', 'qwen2.5:0.5b', 'gpt-4o-mini', 'gemini-1.5-flash']);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  const runEvaluation = async () => {
    if (!prompt.trim()) return;

    // Reset A
    setResultA({
      modelName: modelA, response: '', tokensPerSec: 0, latencyMs: 0, totalTokens: 0, cost: 0, isLoading: true
    });
    // Reset B
    setResultB({
      modelName: modelB, response: '', tokensPerSec: 0, latencyMs: 0, totalTokens: 0, cost: 0, isLoading: true
    });

    const startA = Date.now();
    let ttftA = 0;
    let tokensCountA = 0;

    const promiseA = aiService.generateText(prompt, 500, undefined, modelA, {
      onStream: (chunk) => {
        if (ttftA === 0) {
          ttftA = Date.now() - startA;
        }
        tokensCountA = chunk.split(' ').length * 1.3; // estimate tokens
        const duration = (Date.now() - startA) / 1000;
        const speed = duration > 0 ? Math.round(tokensCountA / duration) : 0;
        
        setResultA(prev => ({
          ...prev,
          response: chunk,
          latencyMs: ttftA,
          tokensPerSec: speed,
          totalTokens: Math.round(tokensCountA)
        }));
      }
    }).then(finalRes => {
      const finalDuration = (Date.now() - startA) / 1000;
      const metrics = aiService.estimateCost(prompt, finalRes, modelA);
      setResultA(prev => ({
        ...prev,
        response: finalRes,
        totalTokens: metrics.tokens,
        cost: metrics.cost,
        tokensPerSec: finalDuration > 0 ? Math.round(metrics.tokens / finalDuration) : 0,
        isLoading: false
      }));
    }).catch(err => {
      setResultA(prev => ({
        ...prev,
        response: `Execution Error: ${err.message || String(err)}`,
        isLoading: false
      }));
    });

    const startB = Date.now();
    let ttftB = 0;
    let tokensCountB = 0;

    const promiseB = aiService.generateText(prompt, 500, undefined, modelB, {
      onStream: (chunk) => {
        if (ttftB === 0) {
          ttftB = Date.now() - startB;
        }
        tokensCountB = chunk.split(' ').length * 1.3; // estimate tokens
        const duration = (Date.now() - startB) / 1000;
        const speed = duration > 0 ? Math.round(tokensCountB / duration) : 0;

        setResultB(prev => ({
          ...prev,
          response: chunk,
          latencyMs: ttftB,
          tokensPerSec: speed,
          totalTokens: Math.round(tokensCountB)
        }));
      }
    }).then(finalRes => {
      const finalDuration = (Date.now() - startB) / 1000;
      const metrics = aiService.estimateCost(prompt, finalRes, modelB);
      setResultB(prev => ({
        ...prev,
        response: finalRes,
        totalTokens: metrics.tokens,
        cost: metrics.cost,
        tokensPerSec: finalDuration > 0 ? Math.round(metrics.tokens / finalDuration) : 0,
        isLoading: false
      }));
    }).catch(err => {
      setResultB(prev => ({
        ...prev,
        response: `Execution Error: ${err.message || String(err)}`,
        isLoading: false
      }));
    });

    await Promise.all([promiseA, promiseB]);
  };

  return (
    <div className="flex flex-col h-full bg-[#111213] text-[#ECEBE9] font-sans p-6 rounded-3xl border border-[#2A2D30] overflow-hidden">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-[#2A2D30] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/20">
              <Layers size={20} className="animate-pulse" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Local AI Sandbox Arena</h1>
          </div>
          <p className="text-xs text-[#A3A09B]">
            Compare latency, speed (tokens/sec), generation cost, and output quality of models side-by-side in parallel.
          </p>
        </div>

        <button
          onClick={runEvaluation}
          disabled={resultA.isLoading || resultB.isLoading || !prompt.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#3C6B4D] hover:bg-[#467c59] disabled:opacity-50 text-[#ECEBE9] text-xs font-bold rounded-xl transition-all shadow-md shadow-[#3C6B4D]/10 w-full md:w-auto justify-center"
        >
          {resultA.isLoading || resultB.isLoading ? <RefreshCw className="animate-spin" size={14} /> : <Play size={14} />}
          Run Side-by-Side Comparison
        </button>
      </div>

      {/* Main Layout Arena columns */}
      <div className="flex-grow flex flex-col min-h-0">
        {/* Model dropdown Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-[#18191B] border border-[#2A2D30] rounded-3xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <span className="text-xs font-black tracking-widest text-[#3C6B4D]">MODEL ARENA A</span>
            <select
              value={modelA}
              onChange={(e) => setModelA(e.target.value)}
              className="bg-[#111213] text-xs font-semibold px-4 py-2 border border-[#2A2D30] rounded-xl text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D] w-full md:w-48"
            >
              {modelOptions.map(opt => (
                <option key={`a_${opt}`} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="bg-[#18191B] border border-[#2A2D30] rounded-3xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <span className="text-xs font-black tracking-widest text-[#E29E2D]">MODEL ARENA B</span>
            <select
              value={modelB}
              onChange={(e) => setModelB(e.target.value)}
              className="bg-[#111213] text-xs font-semibold px-4 py-2 border border-[#2A2D30] rounded-xl text-[#ECEBE9] focus:outline-none focus:border-[#E29E2D] w-full md:w-48"
            >
              {modelOptions.map(opt => (
                <option key={`b_${opt}`} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Viewport side-by-side response outputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow min-h-0 overflow-y-auto mb-6">
          {/* Box A */}
          <div className="bg-[#18191B]/40 border border-[#2A2D30] rounded-3xl p-5 flex flex-col justify-between overflow-hidden">
            <div className="flex-grow overflow-y-auto min-h-0 mb-4 pr-1">
              {resultA.response ? (
                <p className="text-xs leading-relaxed text-[#ECEBE9]/90 font-mono whitespace-pre-wrap">
                  {resultA.response}
                </p>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-[#A3A09B] p-6">
                  <Sparkles size={24} className="text-[#2A2D30] mb-2" />
                  <span className="text-xs font-bold text-[#ECEBE9]/70">Waiting for model A execution...</span>
                </div>
              )}
            </div>

            {/* Metrics block A */}
            <div className="bg-[#18191B] border border-[#2A2D30]/60 p-4 rounded-2xl grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 text-[10px] text-[#A3A09B] mb-0.5"><Clock size={10} /> Latency</div>
                <div className="text-xs font-black text-[#ECEBE9]">{resultA.latencyMs ? `${resultA.latencyMs}ms` : '-'}</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-[10px] text-[#A3A09B] mb-0.5"><RefreshCw size={10} /> Speed</div>
                <div className="text-xs font-black text-[#3C6B4D]">{resultA.tokensPerSec ? `${resultA.tokensPerSec} t/s` : '-'}</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-[10px] text-[#A3A09B] mb-0.5"><Award size={10} /> Cost</div>
                <div className="text-xs font-black text-[#ECEBE9]">{resultA.cost === 0 ? 'FREE (Local)' : `$${resultA.cost.toFixed(5)}`}</div>
              </div>
            </div>
          </div>

          {/* Box B */}
          <div className="bg-[#18191B]/40 border border-[#2A2D30] rounded-3xl p-5 flex flex-col justify-between overflow-hidden">
            <div className="flex-grow overflow-y-auto min-h-0 mb-4 pr-1">
              {resultB.response ? (
                <p className="text-xs leading-relaxed text-[#ECEBE9]/90 font-mono whitespace-pre-wrap">
                  {resultB.response}
                </p>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-[#A3A09B] p-6">
                  <Sparkles size={24} className="text-[#2A2D30] mb-2" />
                  <span className="text-xs font-bold text-[#ECEBE9]/70">Waiting for model B execution...</span>
                </div>
              )}
            </div>

            {/* Metrics block B */}
            <div className="bg-[#18191B] border border-[#2A2D30]/60 p-4 rounded-2xl grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 text-[10px] text-[#A3A09B] mb-0.5"><Clock size={10} /> Latency</div>
                <div className="text-xs font-black text-[#ECEBE9]">{resultB.latencyMs ? `${resultB.latencyMs}ms` : '-'}</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-[10px] text-[#A3A09B] mb-0.5"><RefreshCw size={10} /> Speed</div>
                <div className="text-xs font-black text-[#E29E2D]">{resultB.tokensPerSec ? `${resultB.tokensPerSec} t/s` : '-'}</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-[10px] text-[#A3A09B] mb-0.5"><Award size={10} /> Cost</div>
                <div className="text-xs font-black text-[#ECEBE9]">{resultB.cost === 0 ? 'FREE (Local)' : `$${resultB.cost.toFixed(5)}`}</div>
              </div>
            </div>
          </div>
        </div>

        {/* User prompt textarea input */}
        <div className="bg-[#18191B] border border-[#2A2D30] rounded-3xl p-4 flex gap-4 items-center">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={2}
            className="flex-grow bg-[#111213] border border-[#2A2D30] rounded-2xl text-xs font-semibold px-4 py-3 text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D] resize-none"
            placeholder="Type comparison prompt here..."
          />
        </div>
      </div>
    </div>
  );
};
export default AISandboxArena;
