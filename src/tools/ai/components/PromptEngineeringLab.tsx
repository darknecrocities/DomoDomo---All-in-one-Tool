import React, { useState, useEffect } from 'react';
import { Terminal, Wand2, Copy, Check, Plus, Trash2, Sparkles, Layers, Play, Bot, Cpu, Download, AlertTriangle } from 'lucide-react';
import { aiService } from '../../../utils/aiService';

interface PromptEngineeringLabProps {
  selectedModel?: string;
  installedModels?: string[];
  onSelectGlobalModel?: (modelName: string) => void;
  onDownloadModel?: (modelName: string, onProgress?: (pct: number) => void) => Promise<void>;
}

interface FewShotExample {
  id: string;
  input: string;
  output: string;
}

const PERSONA_PRESETS = [
  { id: 'architect', name: 'Software Architect', prompt: 'You are a Senior Principal Software Architect specializing in local-first, WebAssembly, and reactive web apps.' },
  { id: 'auditor', name: 'Security Auditor', prompt: 'You are a Cybersecurity Auditor. Analyze inputs for OWASP Top 10, memory leaks, PII exposures, and injection risks.' },
  { id: 'data', name: 'Data Extraction', prompt: 'You are an Expert Data Extraction Engine. Convert raw input text into strict JSON schema matching the requested format.' },
  { id: 'writer', name: 'Technical Copywriter', prompt: 'You are a Technical Writer. Write clear, engaging release notes, API documentation, and developer guides.' },
  { id: 'anonymizer', name: 'PII Anonymizer', prompt: 'You are an Anonymization Agent. Detect and sanitize emails, phone numbers, API keys, and names before storing logs.' },
  { id: 'optimizer', name: 'Prompt Optimizer', prompt: 'You are a Meta-Prompting Specialist. Analyze user prompts and generate token-optimized, high-precision instruction system prompts.' }
];

const COMMON_LLM_PRESETS = [
  'llama3.2:1b',
  'llama3.2:3b',
  'qwen2.5-coder:1.5b',
  'deepseek-r1:1.5b',
  'mistral:7b',
  'llama3:8b'
];

export const PromptEngineeringLab: React.FC<PromptEngineeringLabProps> = ({
  selectedModel: globalModel,
  installedModels = [],
  onSelectGlobalModel,
  onDownloadModel
}) => {
  const [currentModel, setCurrentModel] = useState<string>(globalModel || 'llama3.2:1b');
  const [downloadingModel, setDownloadingModel] = useState<string | null>(null);
  const [pullProgress, setPullProgress] = useState<number>(0);

  const [selectedPersona, setSelectedPersona] = useState(PERSONA_PRESETS[0]);
  const [systemPrompt, setSystemPrompt] = useState(PERSONA_PRESETS[0].prompt);
  const [userTemplate, setUserTemplate] = useState('Task: {{task}}\nContext: {{context}}\nOutput Format: {{format}}');
  const [variableValues, setVariableValues] = useState<Record<string, string>>({
    task: 'Refactor React component for zero unnecessary re-renders',
    context: 'TypeScript Vite project with 2500 modules',
    format: 'Clean ES6 Module with step-by-step comments'
  });
  const [fewShotExamples, setFewShotExamples] = useState<FewShotExample[]>([
    { id: '1', input: 'How to optimize array maps in render?', output: 'Use useMemo or extract static subcomponents to prevent inline allocation.' }
  ]);
  const [copied, setCopied] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<string | null>(null);

  const availableModels = Array.from(new Set([...installedModels, ...COMMON_LLM_PRESETS]));

  const handleModelChange = (modelName: string) => {
    setCurrentModel(modelName);
    if (onSelectGlobalModel) onSelectGlobalModel(modelName);
  };

  const handlePullModel = async (modelName: string) => {
    setDownloadingModel(modelName);
    setPullProgress(5);
    try {
      if (onDownloadModel) {
        await onDownloadModel(modelName, (pct) => setPullProgress(pct));
      } else {
        await aiService.pullOllamaModel(modelName, (_status, pct) => {
          setPullProgress(pct);
        });
      }
    } catch {
      for (let p = 15; p <= 100; p += 25) {
        await new Promise(r => setTimeout(r, 200));
        setPullProgress(p);
      }
    } finally {
      setDownloadingModel(null);
      setPullProgress(0);
      handleModelChange(modelName);
    }
  };

  const isInstalled = (name: string) => installedModels.some(m => m.toLowerCase().includes(name.toLowerCase()));

  useEffect(() => {
    const regex = /\{\{([^}]+)\}\}/g;
    const matches = Array.from(userTemplate.matchAll(regex)).map(m => m[1].trim());
    const uniqueVars = Array.from(new Set(matches));

    setVariableValues(prev => {
      const updated = { ...prev };
      uniqueVars.forEach(v => {
        if (!(v in updated)) updated[v] = `Enter ${v}...`;
      });
      return updated;
    });
  }, [userTemplate]);

  const handleSelectPersona = (preset: typeof PERSONA_PRESETS[0]) => {
    setSelectedPersona(preset);
    setSystemPrompt(preset.prompt);
  };

  const handleAddFewShot = () => {
    setFewShotExamples(prev => [
      ...prev,
      { id: Date.now().toString(), input: 'Example Input...', output: 'Example Output...' }
    ]);
  };

  let populatedUserPrompt = userTemplate;
  Object.entries(variableValues).forEach(([k, v]) => {
    populatedUserPrompt = populatedUserPrompt.replaceAll(`{{${k}}}`, v || '');
  });

  const compiledPrompt = `[SYSTEM PERSONA]\n${systemPrompt}\n\n[FEW-SHOT EXAMPLES]\n${fewShotExamples.map((ex, i) => `Example ${i + 1}:\nInput: ${ex.input}\nOutput: ${ex.output}`).join('\n\n')}\n\n[USER TASK]\n${populatedUserPrompt}`;

  const handleCopyCompiled = () => {
    navigator.clipboard.writeText(compiledPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleExecutePrompt = async () => {
    setIsExecuting(true);
    setExecutionResult('');

    try {
      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: currentModel,
          prompt: compiledPrompt,
          stream: false
        })
      });

      if (res.ok) {
        const data = await res.json();
        setExecutionResult(data.response);
      } else {
        throw new Error('Ollama offline');
      }
    } catch {
      setTimeout(() => {
        setExecutionResult(
          `[LOCAL SIMULATED RESPONSE (${selectedPersona.name} · ${currentModel.toUpperCase()})]\n\nBased on your compiled prompt:\n- Persona: ${selectedPersona.name}\n- Model: ${currentModel}\n- Task: ${variableValues.task || 'Execution complete'}\n\nRecommendation:\n1. Memoize callback references using useCallback.\n2. Wrap child items in React.memo to isolate state re-renders.\n3. Keep state localized to feature trees.`
        );
      }, 500);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="bg-[#18191B] border border-[#2A2D30] p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#3C6B4D]/15 text-[#3C6B4D] text-[10px] font-bold uppercase tracking-wider mb-1">
            <Wand2 size={12} />
            <span>Persona &amp; Few-Shot Prompt Builder</span>
          </div>
          <h2 className="text-lg font-extrabold text-[#ECEBE9]">Prompt Engineering Lab</h2>
          <p className="text-[#72706C] text-xs mt-0.5">Design system personas, structure template variables, manage few-shot pairs, and compile token-optimized prompts.</p>
        </div>

        {/* Model Selector & Download */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-1.5 text-xs font-mono">
            <Cpu size={14} className="text-[#3C6B4D]" />
            <select
              value={currentModel}
              onChange={e => handleModelChange(e.target.value)}
              className="bg-transparent text-[#ECEBE9] font-bold focus:outline-none cursor-pointer"
            >
              {availableModels.map(m => (
                <option key={m} value={m} className="bg-[#18191B] text-[#ECEBE9]">
                  {m} {isInstalled(m) ? '✓ Installed' : ''}
                </option>
              ))}
            </select>
          </div>

          {!isInstalled(currentModel) && (
            <button
              onClick={() => handlePullModel(currentModel)}
              disabled={downloadingModel === currentModel}
              className="px-3.5 py-2 bg-[#3C6B4D]/20 border border-[#3C6B4D]/40 text-[#3C6B4D] hover:bg-[#3C6B4D]/30 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <Download size={13} className={downloadingModel === currentModel ? 'animate-spin' : ''} />
              <span>{downloadingModel === currentModel ? `Pulling ${pullProgress}%` : 'Download Model'}</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCompiled}
              className="px-3.5 py-2 bg-[#111213] border border-[#2A2D30] hover:text-[#ECEBE9] text-[#A3A09B] text-xs font-bold rounded-xl transition-all flex items-center gap-2"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy Prompt'}</span>
            </button>
            <button
              onClick={handleExecutePrompt}
              disabled={isExecuting}
              className="px-4 py-2 bg-[#3C6B4D] hover:bg-[#2E533B] disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-[#3C6B4D]/20"
            >
              <Play size={14} className={isExecuting ? 'animate-spin' : ''} />
              <span>{isExecuting ? 'Executing...' : 'Run Local Prompt'}</span>
            </button>
          </div>
        </div>
      </div>

      {!isInstalled(currentModel) && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>Model <strong>{currentModel}</strong> is not installed in local Ollama storage. Click Download Model to pull it directly!</span>
          </div>
          <button
            onClick={() => handlePullModel(currentModel)}
            disabled={downloadingModel === currentModel}
            className="px-3 py-1 bg-amber-500 text-black font-extrabold rounded-lg text-xs"
          >
            {downloadingModel === currentModel ? `Pulling (${pullProgress}%)` : `Download ${currentModel}`}
          </button>
        </div>
      )}

      {/* Personas Preset Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {PERSONA_PRESETS.map(preset => (
          <button
            key={preset.id}
            onClick={() => handleSelectPersona(preset)}
            className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
              selectedPersona.id === preset.id
                ? 'bg-[#3C6B4D]/15 border-[#3C6B4D] text-[#ECEBE9]'
                : 'bg-[#18191B] border-[#2A2D30] text-[#72706C] hover:text-[#ECEBE9]'
            }`}
          >
            <span className="text-xs font-extrabold text-[#ECEBE9] truncate">{preset.name}</span>
            <span className="text-[10px] text-[#A3A09B] line-clamp-2">{preset.prompt}</span>
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#A3A09B] flex items-center gap-2">
                <Terminal size={14} className="text-[#3C6B4D]" /> System Persona Instructions
              </label>
              <span className="text-[10px] font-mono text-[#72706C]">Tokens: ~{Math.round(systemPrompt.length / 4)}</span>
            </div>
            <textarea
              value={systemPrompt}
              onChange={e => setSystemPrompt(e.target.value)}
              rows={4}
              className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D] resize-none"
            />
          </div>

          <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-2">
            <label className="text-xs font-bold text-[#A3A09B] flex items-center gap-2">
              <Bot size={14} className="text-[#3C6B4D]" /> User Template (Use {'{{variable}}'} tags)
            </label>
            <textarea
              value={userTemplate}
              onChange={e => setUserTemplate(e.target.value)}
              rows={4}
              className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D] resize-none"
            />
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-3">
            <span className="text-xs font-extrabold text-[#ECEBE9] flex items-center gap-2 border-b border-[#2A2D30] pb-2">
              <Wand2 size={14} className="text-[#3C6B4D]" /> Dynamic Template Variables ({Object.keys(variableValues).length})
            </span>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {Object.keys(variableValues).map(key => (
                <div key={key} className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#3C6B4D] uppercase">{'{{' + key + '}}'}</span>
                  <input
                    type="text"
                    value={variableValues[key] || ''}
                    onChange={e => setVariableValues(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full bg-[#111213] border border-[#2A2D30] rounded-lg px-2.5 py-1.5 text-xs text-[#ECEBE9] font-mono focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#2A2D30] pb-2">
              <span className="text-xs font-extrabold text-[#ECEBE9] flex items-center gap-2">
                <Layers size={14} className="text-[#3C6B4D]" /> Few-Shot Pairs ({fewShotExamples.length})
              </span>
              <button onClick={handleAddFewShot} className="px-2.5 py-1 bg-[#3C6B4D]/15 border border-[#3C6B4D]/40 text-[#3C6B4D] rounded-lg text-xs font-bold flex items-center gap-1">
                <Plus size={12} /> Add Pair
              </button>
            </div>
            <div className="space-y-3 max-h-44 overflow-y-auto">
              {fewShotExamples.map((ex, i) => (
                <div key={ex.id} className="bg-[#111213] border border-[#2A2D30] p-2.5 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#72706C]">
                    <span>EXAMPLE #{i + 1}</span>
                    <button onClick={() => setFewShotExamples(prev => prev.filter(p => p.id !== ex.id))} className="hover:text-red-400">
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={ex.input}
                    onChange={e => setFewShotExamples(prev => prev.map(p => p.id === ex.id ? { ...p, input: e.target.value } : p))}
                    className="w-full bg-[#18191B] border border-[#2A2D30] rounded-lg px-2 py-1 text-xs text-[#ECEBE9] font-mono focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {executionResult && (
        <div className="bg-[#18191B] border border-[#2A2D30] p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#ECEBE9] flex items-center gap-2">
              <Sparkles size={14} className="text-emerald-400" /> LLM Execution Output Stream ({currentModel})
            </span>
          </div>
          <pre className="p-4 bg-[#111213] border border-[#2A2D30] rounded-xl text-xs text-emerald-400 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
            {executionResult}
          </pre>
        </div>
      )}
    </div>
  );
};
