import React, { useState } from 'react';
import { Gauge, CheckCircle2, AlertTriangle, Cpu, HardDrive, Download } from 'lucide-react';

interface HardwareQuantCalculatorProps {
  selectedModel?: string;
  installedModels?: string[];
  onSelectGlobalModel?: (modelName: string) => void;
  onDownloadModel?: (modelName: string) => Promise<void>;
}

const MODEL_PRESETS = [
  { name: 'Llama 3.2 1B', params: 1, layers: 16 },
  { name: 'Llama 3.2 3B', params: 3, layers: 28 },
  { name: 'Qwen 2.5 1.5B Coder', params: 1.5, layers: 28 },
  { name: 'DeepSeek R1 1.5B', params: 1.5, layers: 28 },
  { name: 'Mistral 7B / Llama 3 8B', params: 8, layers: 32 },
  { name: 'DeepSeek R1 / Qwen 14B', params: 14, layers: 48 },
  { name: 'Llama 3 70B / DeepSeek 70B', params: 70, layers: 80 }
];

const HARDWARE_PRESETS = [
  { name: 'MacBook M1/M2/M3 Base (8 GB)', ram: 8, isApple: true },
  { name: 'MacBook M1/M2/M3 Pro (16 GB)', ram: 16, isApple: true },
  { name: 'MacBook M3/M4 Pro (36 GB)', ram: 36, isApple: true },
  { name: 'MacBook M3/M4 Max (64 GB)', ram: 64, isApple: true },
  { name: 'NVIDIA RTX 3060 (12 GB VRAM)', ram: 12, isApple: false },
  { name: 'NVIDIA RTX 4080 / 4090 (16-24 GB VRAM)', ram: 24, isApple: false }
];

const COMMON_LLM_PRESETS = [
  'llama3.2:1b',
  'llama3.2:3b',
  'qwen2.5-coder:1.5b',
  'deepseek-r1:1.5b',
  'mistral:7b',
  'llama3:8b'
];

export const HardwareQuantCalculator: React.FC<HardwareQuantCalculatorProps> = ({
  selectedModel: globalModel,
  installedModels = [],
  onSelectGlobalModel,
  onDownloadModel
}) => {
  const [currentModel, setCurrentModel] = useState<string>(globalModel || 'llama3.2:1b');
  const [downloadingModel, setDownloadingModel] = useState<string | null>(null);
  const [pullProgress, setPullProgress] = useState<number>(0);

  const [selectedModel, setSelectedModel] = useState(MODEL_PRESETS[0]);
  const [paramSize, setParamSize] = useState<number>(1);
  const [quantLevel, setQuantLevel] = useState<string>('Q4_K_M');
  const [contextWindow, setContextWindow] = useState<number>(4096);
  const [hardwareRamGb, setHardwareRamGb] = useState<number>(16);

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
        await onDownloadModel(modelName);
      } else {
        const res = await fetch('http://localhost:11434/api/pull', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: modelName, stream: true })
        });
        if (res.ok && res.body) {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            for (const line of decoder.decode(value).split('\n').filter(Boolean)) {
              try {
                const parsed = JSON.parse(line);
                if (parsed.total && parsed.completed) {
                  setPullProgress(Math.round((parsed.completed / parsed.total) * 100));
                }
              } catch {}
            }
          }
        }
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

  const handleSelectModelPreset = (preset: typeof MODEL_PRESETS[0]) => {
    setSelectedModel(preset);
    setParamSize(preset.params);
  };

  const handleSelectHardwarePreset = (hw: typeof HARDWARE_PRESETS[0]) => {
    setHardwareRamGb(hw.ram);
  };

  const getQuantBits = () => {
    switch (quantLevel) {
      case 'Q2_K': return 2.5;
      case 'Q4_K_M': return 4.5;
      case 'Q8_0': return 8.5;
      case 'FP16': return 16;
      default: return 4.5;
    }
  };

  const modelWeightGb = (paramSize * getQuantBits()) / 8;
  const kvCacheGb = (contextWindow * paramSize * 0.00002);
  const cudaOverheadGb = 0.6;
  const totalVramGb = parseFloat((modelWeightGb + kvCacheGb + cudaOverheadGb).toFixed(2));
  const isCompatible = totalVramGb <= hardwareRamGb;

  const totalLayers = selectedModel.layers || Math.round(paramSize * 4);
  const recommendedOffloadLayers = isCompatible
    ? totalLayers
    : Math.max(0, Math.floor(totalLayers * (hardwareRamGb / totalVramGb)));

  const estimatedTokSec = isCompatible
    ? Math.round(Math.max(12, 120 / Math.sqrt(paramSize)))
    : Math.round(Math.max(3, 30 / Math.sqrt(paramSize)));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="bg-[#18191B] border border-[#2A2D30] p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#3C6B4D]/15 text-[#3C6B4D] text-[10px] font-bold uppercase tracking-wider mb-1">
            <Gauge size={12} />
            <span>GGUF Quantization &amp; VRAM Profiler</span>
          </div>
          <h2 className="text-lg font-extrabold text-[#ECEBE9]">Quantization &amp; VRAM Calculator</h2>
          <p className="text-[#72706C] text-xs mt-0.5">Calculate RAM/VRAM requirements, context window overhead, and hardware offload layer recommendations for local LLMs.</p>
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

      {/* Model Family & Hardware Presets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-2">
          <span className="text-xs font-bold text-[#A3A09B] flex items-center gap-2">
            <Cpu size={14} className="text-[#3C6B4D]" /> Model Family Presets
          </span>
          <div className="flex flex-wrap gap-1.5">
            {MODEL_PRESETS.map(m => (
              <button
                key={m.name}
                onClick={() => handleSelectModelPreset(m)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                  paramSize === m.params
                    ? 'bg-[#3C6B4D]/20 text-[#3C6B4D] border-[#3C6B4D]/40'
                    : 'bg-[#111213] text-[#72706C] border-[#2A2D30] hover:text-[#ECEBE9]'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-2">
          <span className="text-xs font-bold text-[#A3A09B] flex items-center gap-2">
            <HardDrive size={14} className="text-[#3C6B4D]" /> Hardware Machine Presets
          </span>
          <div className="flex flex-wrap gap-1.5">
            {HARDWARE_PRESETS.map(hw => (
              <button
                key={hw.name}
                onClick={() => handleSelectHardwarePreset(hw)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                  hardwareRamGb === hw.ram
                    ? 'bg-[#3C6B4D]/20 text-[#3C6B4D] border-[#3C6B4D]/40'
                    : 'bg-[#111213] text-[#72706C] border-[#2A2D30] hover:text-[#ECEBE9]'
                }`}
              >
                {hw.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-[#18191B] border border-[#2A2D30] p-5 rounded-2xl space-y-4">
          <span className="text-xs font-extrabold text-[#ECEBE9] border-b border-[#2A2D30] pb-2 block">
            Model &amp; Hardware Controls
          </span>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-[#A3A09B] font-bold mb-1">
                <span>Model Parameters</span>
                <span className="font-mono text-[#3C6B4D]">{paramSize}B Parameters</span>
              </div>
              <input
                type="range" min={0.5} max={70} step={0.5} value={paramSize}
                onChange={e => setParamSize(Number(e.target.value))}
                className="w-full accent-[#3C6B4D]"
              />
            </div>

            <div>
              <label className="text-[#A3A09B] font-bold block mb-1">Quantization Format (GGUF)</label>
              <select
                value={quantLevel}
                onChange={e => setQuantLevel(e.target.value)}
                className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D]"
              >
                <option value="Q2_K">Q2_K (Extreme Compression · ~2.5 bits)</option>
                <option value="Q4_K_M">Q4_K_M (Recommended Standard · ~4.5 bits)</option>
                <option value="Q8_0">Q8_0 (High Precision · ~8.5 bits)</option>
                <option value="FP16">FP16 (Unquantized Full Precision · 16 bits)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-[#A3A09B] font-bold mb-1">
                <span>Context Window (Tokens)</span>
                <span className="font-mono text-[#3C6B4D]">{contextWindow.toLocaleString()} tokens</span>
              </div>
              <input
                type="range" min={2048} max={32768} step={2048} value={contextWindow}
                onChange={e => setContextWindow(Number(e.target.value))}
                className="w-full accent-[#3C6B4D]"
              />
            </div>

            <div>
              <div className="flex justify-between text-[#A3A09B] font-bold mb-1">
                <span>Your Hardware RAM / VRAM Limit</span>
                <span className="font-mono text-[#3C6B4D]">{hardwareRamGb} GB</span>
              </div>
              <input
                type="range" min={4} max={128} step={4} value={hardwareRamGb}
                onChange={e => setHardwareRamGb(Number(e.target.value))}
                className="w-full accent-[#3C6B4D]"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 bg-[#18191B] border border-[#2A2D30] p-5 rounded-2xl space-y-4">
          <span className="text-xs font-extrabold text-[#ECEBE9] border-b border-[#2A2D30] pb-2 block">
            Memory &amp; Offload Recommendation ({currentModel})
          </span>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-[#111213] border border-[#2A2D30] p-3 rounded-xl">
              <span className="text-[10px] text-[#72706C] uppercase font-bold">Weights Memory</span>
              <p className="text-sm font-mono font-extrabold text-[#ECEBE9]">{modelWeightGb.toFixed(2)} GB</p>
            </div>
            <div className="bg-[#111213] border border-[#2A2D30] p-3 rounded-xl">
              <span className="text-[10px] text-[#72706C] uppercase font-bold">KV Cache</span>
              <p className="text-sm font-mono font-extrabold text-[#3C6B4D]">{kvCacheGb.toFixed(2)} GB</p>
            </div>
            <div className="bg-[#111213] border border-[#2A2D30] p-3 rounded-xl">
              <span className="text-[10px] text-[#72706C] uppercase font-bold">Est. Speed</span>
              <p className="text-sm font-mono font-extrabold text-amber-300">~{estimatedTokSec} tok/s</p>
            </div>
          </div>

          <div className="bg-[#111213] border border-[#2A2D30] p-4 rounded-xl space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#A3A09B]">Total VRAM Required:</span>
              <span className="text-emerald-400 font-extrabold text-sm">{totalVramGb} GB</span>
            </div>

            <div className="flex items-center justify-between text-[#ECEBE9] pt-2 border-t border-[#2A2D30]">
              <span>Recommended <code className="text-amber-300">--n-gpu-layers</code>:</span>
              <span className="text-amber-300 font-bold">{recommendedOffloadLayers} / {totalLayers} layers</span>
            </div>

            <div className={`p-3 rounded-xl border text-xs font-sans flex items-center gap-2 mt-2 ${
              isCompatible
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}>
              {isCompatible ? <CheckCircle2 size={16} className="shrink-0" /> : <AlertTriangle size={16} className="shrink-0" />}
              <span className="font-bold">
                {isCompatible
                  ? `Fully Compatible! Model fits within your ${hardwareRamGb} GB memory with ${(hardwareRamGb - totalVramGb).toFixed(1)} GB headroom.`
                  : `Requires ${totalVramGb} GB memory, exceeding your ${hardwareRamGb} GB limit. Offload ${recommendedOffloadLayers} layers to GPU and spill remainder to RAM.`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
