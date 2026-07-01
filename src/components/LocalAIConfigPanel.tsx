import { useState, useEffect } from 'react';
import { Cpu, Settings, Sliders, ChevronDown, ChevronUp, AlertCircle, Info, Sparkles, Brain, Trash2, History } from 'lucide-react';
import { aiService } from '../utils/aiService';
import { localMemory, type MemoryEvent } from '../utils/localMemory';

export interface AIConfigOptions {
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}

interface LocalAIConfigPanelProps {
  systemPrompt: string;
  onSystemPromptChange?: (val: string) => void;
  temperature: number;
  onTemperatureChange?: (val: number) => void;
  maxTokens: number;
  onMaxTokensChange?: (val: number) => void;
  selectedModel: string;
  onModelChange?: (val: string) => void;
  defaultMaxTokens?: number;
}

export const LocalAIConfigPanel = ({
  systemPrompt,
  onSystemPromptChange,
  temperature,
  onTemperatureChange,
  maxTokens,
  onMaxTokensChange,
  selectedModel,
  onModelChange,
}: LocalAIConfigPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [hasOllama, setHasOllama] = useState(false);
  const [hardware, setHardware] = useState<any>(null);
  const [memoryEnabled, setMemoryEnabled] = useState(localMemory.isEnabled());
  const [memoryEvents, setMemoryEvents] = useState<MemoryEvent[]>(localMemory.getEvents());

  useEffect(() => {
    const handleUpdate = () => {
      setMemoryEnabled(localMemory.isEnabled());
      setMemoryEvents(localMemory.getEvents());
    };
    window.addEventListener('domodomo_memory_updated', handleUpdate);
    return () => window.removeEventListener('domodomo_memory_updated', handleUpdate);
  }, []);

  const handleToggleMemory = () => {
    localMemory.setEnabled(!memoryEnabled);
  };

  const handleClearMemory = () => {
    localMemory.clearMemory();
  };

  // Load Ollama status on mount
  useEffect(() => {
    const checkOllama = async () => {
      try {
        const res = await aiService.checkOllama();
        setHasOllama(res.status);
        setOllamaModels(res.models);
        if (res.status && res.models.length > 0 && !selectedModel) {
          const saved = aiService.getSelectedOllamaModel();
          const initial = saved && res.models.includes(saved) ? saved : res.models[0];
          if (onModelChange) onModelChange(initial);
        }
      } catch (err) {
        console.warn('Ollama status check error:', err);
      }
    };

    checkOllama();
  }, [selectedModel, onModelChange]);

  // Update hardware recommendation dynamically when models list resolves
  useEffect(() => {
    setHardware(aiService.getHardwareRecommendation(ollamaModels));
  }, [ollamaModels]);

  const handleModelChange = (model: string) => {
    if (onModelChange) onModelChange(model);
    aiService.setSelectedOllamaModel(model);
  };

  return (
    <div className="w-full bg-slate-900/60 border border-slate-850 rounded-xl overflow-hidden shadow-lg transition-all duration-200">
      {/* Header bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-850/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings size={16} className={`text-teal-400 ${isOpen ? 'rotate-45' : ''} transition-transform duration-300`} />
          <span className="text-xs font-semibold text-slate-350">
            AI Controls & Hardware Metrics
          </span>
          {selectedModel && (
            <span className="text-[9px] font-mono bg-teal-950/40 text-teal-400 px-2 py-0.5 rounded border border-teal-900/30">
              {selectedModel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {isOpen ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
        </div>
      </button>

      {/* Expanded panel body */}
      {isOpen && (
        <div className="px-4 pb-4 border-t border-slate-850 bg-slate-950/20 flex flex-col gap-4 text-xs">
          {/* Hardware Advisor & Model Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3.5">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-slate-400 flex items-center gap-1.5">
                <Cpu size={13} className="text-teal-400 animate-pulse" />
                <span>Ollama Model Selection</span>
              </label>
              
              {hasOllama ? (
                ollamaModels.length > 0 ? (
                  <select
                    value={selectedModel}
                    onChange={(e) => handleModelChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
                  >
                    {ollamaModels.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="bg-amber-950/20 border border-amber-900/30 text-amber-400 p-2 rounded flex items-center gap-2">
                    <AlertCircle size={14} />
                    <span>No models installed. Pull one from the dashboard!</span>
                  </div>
                )
              ) : (
                <div className="bg-rose-950/20 border border-rose-900/30 text-rose-400 p-2 rounded flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>Ollama is offline. Start it on port 11434.</span>
                </div>
              )}
            </div>

            {/* Hardware banner */}
            {hardware && (
              <div className="bg-slate-900/40 border border-slate-850 p-2.5 rounded-lg flex flex-col gap-1 text-[11px]">
                <div className="font-semibold text-slate-350 flex items-center gap-1">
                  <Info size={12} className="text-teal-400" />
                  <span>System Benchmarks</span>
                </div>
                <div className="text-slate-400 flex justify-between py-0.5">
                  <span>Client RAM Estimate:</span>
                  <span className="text-slate-200 font-mono">{hardware.ram}</span>
                </div>
                <div className="text-slate-400 flex justify-between py-0.5">
                  <span>CPU Cores Count:</span>
                  <span className="text-slate-200 font-mono">{hardware.cores} threads</span>
                </div>
                <div className="text-slate-400 flex justify-between py-0.5">
                  <span>Hardware WebGPU:</span>
                  <span className={`font-mono ${hardware.hasWebGPU ? 'text-green-400 font-bold' : 'text-slate-500'}`}>
                    {hardware.hasWebGPU ? 'Supported' : 'Not Detected'}
                  </span>
                </div>
                <div className="mt-1 border-t border-slate-850 pt-1.5 flex flex-col gap-0.5">
                  <span className="text-[10px] text-teal-400 font-semibold flex items-center gap-0.5">
                    <Sparkles size={10} /> Recommended Model: <code className="bg-slate-900 px-1 rounded text-slate-200 font-mono text-[9px]">{hardware.recommendedModel}</code>
                  </span>
                  <span className="text-[10px] text-slate-500 italic leading-snug">
                    {hardware.explanation}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Prompt parameters slider controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-850 pt-3.5">
            {/* Temperature Slider */}
            {onTemperatureChange && (
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[11px] font-semibold text-slate-450">
                  <span className="flex items-center gap-1">
                    <Sliders size={12} className="text-teal-400" /> Temperature (Creativity)
                  </span>
                  <span className="text-slate-300 font-mono bg-slate-900 px-1 rounded">{temperature.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.5"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
                  className="w-full accent-teal-500 bg-slate-900 rounded-lg appearance-none h-1 cursor-pointer"
                />
                <span className="text-[9px] text-slate-500">
                  Lower is precise/focused, higher is creative/abstract.
                </span>
              </div>
            )}

            {/* Max Output Token Slider */}
            {onMaxTokensChange && (
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[11px] font-semibold text-slate-450">
                  <span className="flex items-center gap-1">
                    <Sliders size={12} className="text-teal-400" /> Max Tokens Limit
                  </span>
                  <span className="text-slate-300 font-mono bg-slate-900 px-1 rounded">{maxTokens} tokens</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="10"
                  value={maxTokens}
                  onChange={(e) => onMaxTokensChange(parseInt(e.target.value))}
                  className="w-full accent-teal-500 bg-slate-900 rounded-lg appearance-none h-1 cursor-pointer"
                />
                <span className="text-[9px] text-slate-500">
                  Limits the maximum characters/length of generated response.
                </span>
              </div>
            )}
          </div>

          {/* System Prompt Customizer */}
          {onSystemPromptChange && (
            <div className="flex flex-col gap-2 border-t border-slate-850 pt-3.5">
              <label className="font-semibold text-slate-400 flex items-center justify-between">
                <span>System Role override prompt</span>
                <span className="text-[9px] text-slate-500">Guides character behavior & constraints</span>
              </label>
              <textarea
                value={systemPrompt}
                onChange={(e) => onSystemPromptChange(e.target.value)}
                className="w-full h-14 bg-slate-900 border border-slate-800 rounded p-2 text-[11px] text-slate-200 focus:outline-none focus:border-teal-500 resize-none font-mono"
                placeholder="You are a helpful AI assistant..."
              />
            </div>
          )}

          {/* Continuous Local Memory Section */}
          <div className="flex flex-col gap-3 border-t border-slate-850 pt-3.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-400 flex items-center gap-1.5">
                <Brain size={13} className="text-amber-400" />
                <span>Continuous Local AI Memory</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500">
                  {memoryEnabled ? 'Active' : 'Disabled'}
                </span>
                <button
                  onClick={handleToggleMemory}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                    memoryEnabled ? 'bg-teal-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ${
                      memoryEnabled ? 'translate-x-4.5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 leading-snug">
              Automatically captures your tools utilization history locally in browser storage, allowing local AI models to recall what tools you were recently running.
            </p>

            {memoryEnabled && (
              <div className="bg-slate-900/50 border border-slate-850 rounded-lg p-2.5 flex flex-col gap-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-850/60">
                  <span className="text-[10px] text-slate-450 font-semibold flex items-center gap-1">
                    <History size={11} className="text-teal-400" />
                    <span>Logged Workspace Context ({memoryEvents.length} events)</span>
                  </span>
                  {memoryEvents.length > 0 && (
                    <button
                      onClick={handleClearMemory}
                      className="text-rose-400 hover:text-rose-350 transition-colors flex items-center gap-0.5 text-[9px] font-bold font-sans"
                    >
                      <Trash2 size={10} />
                      <span>Wipe Logs</span>
                    </button>
                  )}
                </div>

                {memoryEvents.length > 0 ? (
                  <div className="max-h-24 overflow-y-auto font-mono text-[9px] text-slate-400 space-y-1">
                    {memoryEvents.map((e, idx) => {
                      const t = new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      return (
                        <div key={idx} className="flex gap-1.5 py-0.5 hover:bg-slate-850/30 px-1 rounded transition-colors text-left">
                          <span className="text-teal-500 font-bold shrink-0">[{t}]</span>
                          <span className="text-slate-350">{e.action}</span>
                          <span className="text-slate-550">&gt;</span>
                          <span className="text-amber-450 font-medium">{e.category}</span>
                          {e.detail && (
                            <>
                              <span className="text-slate-600">/</span>
                              <span className="text-slate-300 italic truncate max-w-[150px]">{e.detail}</span>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-500 italic py-1 text-center">
                    Memory is clean. Start visiting tools to build context!
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
