import React, { useState } from 'react';
import { Cpu, CpuIcon, Download, Check, Sparkles, HardDrive, Layers, ChevronRight, ChevronDown } from 'lucide-react';
import { detectHardwareSpecs, getToolHardwareRecommendation } from '../../../utils/hardwareRecommender';

interface HardwareRecommendationBannerProps {
  activeTab: string;
  selectedModel: string;
  installedModels: string[];
  onSelectGlobalModel?: (modelName: string) => void;
  onDownloadModel?: (modelName: string, onProgress?: (pct: number) => void) => Promise<void>;
  compact?: boolean;
}

export const HardwareRecommendationBanner: React.FC<HardwareRecommendationBannerProps> = ({
  activeTab,
  selectedModel,
  installedModels,
  onSelectGlobalModel,
  onDownloadModel,
  compact = false
}) => {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const specs = detectHardwareSpecs();
  const rec = getToolHardwareRecommendation(activeTab, installedModels);
  const isCurrentlySelected = selectedModel.toLowerCase().includes(rec.recommendedModelId.split(':')[0]);

  const handleApplyRecommended = () => {
    if (onSelectGlobalModel) {
      onSelectGlobalModel(rec.recommendedModelId);
    }
  };

  const handleDownloadRecommended = async () => {
    if (!onDownloadModel) return;
    setDownloading(true);
    setProgress(0);
    try {
      await onDownloadModel(rec.recommendedModelId, (pct) => setProgress(pct));
      if (onSelectGlobalModel) {
        onSelectGlobalModel(rec.recommendedModelId);
      }
    } catch (err) {
      console.error('Failed downloading recommended model:', err);
    } finally {
      setDownloading(false);
    }
  };

  if (compact) {
    return (
      <div className="bg-[#18191B] border border-[#3C6B4D]/30 p-2.5 rounded-xl flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 truncate">
          <Sparkles size={14} className="text-amber-400 shrink-0 animate-pulse" />
          <span className="text-[#ECEBE9] font-bold truncate">
            {rec.badgeText}: <code className="text-[#3C6B4D] font-mono">{rec.recommendedModelId}</code>
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {rec.isInstalled ? (
            <button
              onClick={handleApplyRecommended}
              disabled={isCurrentlySelected}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                isCurrentlySelected
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-[#3C6B4D] text-white hover:bg-[#2E533B]'
              }`}
            >
              {isCurrentlySelected ? '✓ Active Model' : 'Use Model'}
            </button>
          ) : (
            <button
              onClick={handleDownloadRecommended}
              disabled={downloading}
              className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1"
            >
              <Download size={12} className={downloading ? 'animate-spin' : ''} />
              <span>{downloading ? `${progress}%` : 'Install Model'}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#18191B] border border-[#3C6B4D]/40 p-4 rounded-2xl space-y-3 shadow-lg relative overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#3C6B4D]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header: System Spec Detection & Tier Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2A2D30] pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#3C6B4D]/15 border border-[#3C6B4D]/30 text-[#3C6B4D]">
            <Cpu size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-[#ECEBE9]">Hardware-Aware Model Recommender</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#3C6B4D]/20 text-[#3C6B4D] border border-[#3C6B4D]/30 font-mono">
                {specs.tierLabel}
              </span>
            </div>
            <p className="text-[11px] text-[#72706C] mt-0.5 flex items-center gap-2">
              <span>💻 Detected Hardware: <strong>{specs.ramGB} GB RAM</strong> · <strong>{specs.cpuCores} CPU Cores</strong> {specs.hasWebGPU ? '· WebGPU Acceleration Ready' : ''}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[11px] font-bold text-[#72706C] hover:text-[#ECEBE9] flex items-center gap-1 self-start sm:self-center transition-colors cursor-pointer"
        >
          <span>{expanded ? 'Hide Hardware Analysis' : 'Hardware Details'}</span>
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {/* Recommended Model for Active Tab */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-[#111213] border border-[#2A2D30] rounded-xl">
        <div className="flex items-start gap-3">
          <Sparkles size={16} className="text-amber-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#ECEBE9]">{rec.badgeText}:</span>
              <code className="text-xs font-mono font-bold text-[#3C6B4D] bg-[#3C6B4D]/15 px-2 py-0.5 rounded">
                {rec.recommendedModelId}
              </code>
              <span className="text-[10px] text-[#72706C] font-mono">({rec.ramRequirement})</span>
            </div>
            <p className="text-[11px] text-[#A3A09B]">{rec.reason}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {rec.isInstalled ? (
            <button
              onClick={handleApplyRecommended}
              disabled={isCurrentlySelected}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isCurrentlySelected
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 opacity-90'
                  : 'bg-[#3C6B4D] hover:bg-[#2E533B] text-white shadow-md'
              }`}
            >
              <Check size={13} />
              <span>{isCurrentlySelected ? 'Selected for Tool' : `Use ${rec.recommendedModelId}`}</span>
            </button>
          ) : (
            <button
              onClick={handleDownloadRecommended}
              disabled={downloading}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <Download size={14} className={downloading ? 'animate-spin' : ''} />
              <span>{downloading ? `Pulling ${progress}%` : `1-Click Install ${rec.recommendedModelId}`}</span>
            </button>
          )}
        </div>
      </div>

      {/* Expanded Hardware Analysis Grid */}
      {expanded && (
        <div className="pt-2 border-t border-[#2A2D30] grid grid-cols-1 md:grid-cols-3 gap-3 text-xs animate-fadeIn">
          <div className="p-3 bg-[#111213] border border-[#2A2D30] rounded-xl space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#72706C] block">System Memory (RAM)</span>
            <div className="text-sm font-extrabold text-[#ECEBE9] flex items-center gap-1.5">
              <HardDrive size={14} className="text-[#3C6B4D]" />
              <span>{specs.ramGB} GB RAM</span>
            </div>
            <p className="text-[10px] text-[#72706C]">
              {specs.ramGB >= 16 ? 'High capacity. Fits 7B - 14B models with FP16 weights.' : specs.ramGB >= 8 ? 'Balanced capacity. Fits 3B - 4B models cleanly.' : 'Low memory. Recommending 0.5B - 1.5B quantized models.'}
            </p>
          </div>

          <div className="p-3 bg-[#111213] border border-[#2A2D30] rounded-xl space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#72706C] block">CPU Compute Cores</span>
            <div className="text-sm font-extrabold text-[#ECEBE9] flex items-center gap-1.5">
              <CpuIcon size={14} className="text-[#3C6B4D]" />
              <span>{specs.cpuCores} Cores</span>
            </div>
            <p className="text-[10px] text-[#72706C]">
              {specs.cpuCores >= 8 ? 'Multi-core parallelism active for high throughput token streams.' : 'Standard core count. Optimized for low thread contention.'}
            </p>
          </div>

          <div className="p-3 bg-[#111213] border border-[#2A2D30] rounded-xl space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#72706C] block">WebGPU Acceleration</span>
            <div className="text-sm font-extrabold text-[#ECEBE9] flex items-center gap-1.5">
              <Layers size={14} className={specs.hasWebGPU ? 'text-emerald-400' : 'text-amber-400'} />
              <span>{specs.hasWebGPU ? 'WebGPU Enabled' : 'CPU Offload Mode'}</span>
            </div>
            <p className="text-[10px] text-[#72706C]">
              {specs.hasWebGPU ? 'Hardware WebGPU pipeline supported for browser-native matrix acceleration.' : 'Direct local HTTP Ollama daemon proxy recommended.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
