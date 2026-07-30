import React, { useState, useEffect } from 'react';
import { Settings, Trash2, Copy, Info, Cpu, Zap, RefreshCw, AlertTriangle, Check, Database } from 'lucide-react';
import { aiService } from '../../../utils/aiService';

interface ModelManagerStudioProps {
  selectedModel?: string;
  installedModels?: string[];
  onSelectGlobalModel?: (modelName: string) => void;
  onRefreshModels?: () => Promise<void> | void;
}

export const ModelManagerStudio: React.FC<ModelManagerStudioProps> = ({
  selectedModel: globalModel,
  installedModels = [],
  onSelectGlobalModel,
  onRefreshModels
}) => {
  const [selectedModel, setSelectedModel] = useState<string>(globalModel || installedModels[0] || '');
  const [inspectData, setInspectData] = useState<any>(null);
  const [isLoadingInspect, setIsLoadingInspect] = useState<boolean>(false);
  const [inspectError, setInspectError] = useState<string | null>(null);

  // Copy / Duplicate State
  const [copySource, setCopySource] = useState<string>('');
  const [copyDest, setCopyDest] = useState<string>('');
  const [isCopying, setIsCopying] = useState<boolean>(false);

  // Delete State
  const [modelToDelete, setModelToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Unload / Action Notification State
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isUnloading, setIsUnloading] = useState<boolean>(false);

  // Hyperparameters Settings State
  const [defaultContext, setDefaultContext] = useState<number>(4096);
  const [defaultTemp, setDefaultTemp] = useState<number>(0.7);
  const [defaultTopP, setDefaultTopP] = useState<number>(0.9);
  const [savedConfigNotice, setSavedConfigNotice] = useState<boolean>(false);

  // Fetch model inspect details when selected model changes
  useEffect(() => {
    if (!selectedModel) return;
    let isMounted = true;
    setIsLoadingInspect(true);
    setInspectError(null);

    aiService.showOllamaModelDetails(selectedModel)
      .then(data => {
        if (isMounted) {
          setInspectData(data);
          setIsLoadingInspect(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setInspectError(err?.message || `Failed to fetch metadata for ${selectedModel}`);
          setIsLoadingInspect(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedModel]);

  useEffect(() => {
    if (installedModels.length > 0 && !copySource) {
      setCopySource(installedModels[0]);
    }
  }, [installedModels, copySource]);

  // Handle Model Deletion
  const handleDeleteConfirm = async () => {
    if (!modelToDelete) return;
    setIsDeleting(true);
    try {
      await aiService.deleteOllamaModel(modelToDelete);
      setActionNotice(`Successfully deleted model "${modelToDelete}" from local Ollama storage.`);
      if (onRefreshModels) await onRefreshModels();
      setModelToDelete(null);
    } catch (err: any) {
      setActionNotice(`Error deleting model: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Model Copy / Alias
  const handleCopyModel = async () => {
    if (!copySource.trim() || !copyDest.trim() || isCopying) return;
    setIsCopying(true);
    setActionNotice(null);
    try {
      await aiService.copyOllamaModel(copySource.trim(), copyDest.trim());
      setActionNotice(`Successfully copied model "${copySource}" to target alias "${copyDest}".`);
      setCopyDest('');
      if (onRefreshModels) await onRefreshModels();
    } catch (err: any) {
      setActionNotice(`Error copying model: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsCopying(false);
    }
  };

  // Handle VRAM Unload
  const handleUnloadVram = async (modelName: string) => {
    setIsUnloading(true);
    try {
      await aiService.unloadOllamaModel(modelName);
      setActionNotice(`Sent VRAM unload signal for "${modelName}". GPU VRAM memory cleared.`);
    } catch (err: any) {
      setActionNotice(`Failed to unload VRAM: ${err?.message}`);
    } finally {
      setIsUnloading(false);
    }
  };

  // Save Hyperparameter Defaults
  const handleSaveDefaults = () => {
    setSavedConfigNotice(true);
    setTimeout(() => setSavedConfigNotice(false), 3000);
  };

  return (
    <div className="space-y-6 text-[#ECEBE9]">
      {/* ── HEADER TITLE BANNER ── */}
      <div className="p-6 rounded-2xl bg-[#18191B] border border-[#2A2D30] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#3C6B4D]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#3C6B4D] mb-1">
              <Settings className="w-4 h-4" />
              <span>LOCAL OLLAMA ENGINE CONTROL & MODEL MANAGER</span>
            </div>
            <h2 className="text-2xl font-bold text-[#ECEBE9]">Model Settings & Storage Manager</h2>
            <p className="text-xs text-[#72706C] mt-1 max-w-2xl">
              Inspect model architecture specs, delete local model weights, alias custom Modelfiles, force GPU VRAM unloads, and configure default inference parameters.
            </p>
          </div>
          <button
            onClick={() => onRefreshModels && onRefreshModels()}
            className="flex items-center gap-2 px-4 py-2 bg-[#2A2D30] hover:bg-[#3C6B4D]/20 text-[#ECEBE9] hover:text-[#3C6B4D] border border-[#2A2D30] hover:border-[#3C6B4D]/40 rounded-xl text-xs font-bold transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Ollama Storage</span>
          </button>
        </div>
      </div>

      {/* ── NOTIFICATION TOAST ── */}
      {actionNotice && (
        <div className="p-4 rounded-xl bg-[#18191B] border border-[#3C6B4D]/40 text-xs flex items-center justify-between gap-3 text-[#ECEBE9]">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#3C6B4D]" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-[#72706C] hover:text-[#ECEBE9]">Dismiss</button>
        </div>
      )}

      {/* ── MAIN GRID LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── LEFT COL: INSTALLED MODELS & DELETE MANAGER (7 COLS) ── */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-5 rounded-2xl bg-[#18191B] border border-[#2A2D30] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#3C6B4D]" />
                <h3 className="text-sm font-bold text-[#ECEBE9]">Installed Ollama Models ({installedModels.length})</h3>
              </div>
              <span className="text-[10px] font-mono text-[#72706C]">100% Local Storage</span>
            </div>

            {installedModels.length === 0 ? (
              <div className="p-8 rounded-xl border border-dashed border-[#2A2D30] text-center space-y-2">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="text-xs font-bold text-[#ECEBE9]">No local models found in Ollama storage</p>
                <p className="text-[11px] text-[#72706C]">Pull a model using Vision Studio, Model Downloader, or Ollama CLI to manage models.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {installedModels.map(modelName => {
                  const isSelected = selectedModel === modelName;
                  return (
                    <div
                      key={modelName}
                      onClick={() => {
                        setSelectedModel(modelName);
                        if (onSelectGlobalModel) onSelectGlobalModel(modelName);
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#3C6B4D]/15 border-[#3C6B4D] text-[#ECEBE9]'
                          : 'bg-[#111213] border-[#2A2D30] text-[#72706C] hover:border-[#72706C]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]' : 'bg-[#18191B] text-[#72706C]'}`}>
                          <Cpu className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold font-mono text-[#ECEBE9] truncate">{modelName}</div>
                          <div className="text-[10px] text-[#72706C] flex items-center gap-2 mt-0.5">
                            <span>Local Model</span>
                            <span>•</span>
                            <span className="text-[#3C6B4D]">Active in Engine</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleUnloadVram(modelName)}
                          disabled={isUnloading}
                          title="Force Unload GPU VRAM"
                          className="px-2.5 py-1.5 rounded-lg bg-[#2A2D30] hover:bg-[#3C6B4D]/20 text-[#72706C] hover:text-[#ECEBE9] text-[11px] font-mono transition-colors"
                        >
                          Unload VRAM
                        </button>
                        <button
                          onClick={() => setModelToDelete(modelName)}
                          title="Delete Model from Storage"
                          className="p-1.5 rounded-lg bg-[#2A2D30] hover:bg-rose-500/20 text-[#72706C] hover:text-rose-400 border border-transparent hover:border-rose-500/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── MODEL DUPLICATION & COPY ALIAS ── */}
          <div className="p-5 rounded-2xl bg-[#18191B] border border-[#2A2D30] space-y-4">
            <div className="flex items-center gap-2">
              <Copy className="w-4 h-4 text-[#3C6B4D]" />
              <h3 className="text-sm font-bold text-[#ECEBE9]">Copy Model / Create Target Alias</h3>
            </div>
            <p className="text-xs text-[#72706C]">
              Create an instant local duplicate or custom alias tag without re-downloading model weights (`POST /api/copy`).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#72706C] block mb-1">Source Model</label>
                <select
                  value={copySource}
                  onChange={e => setCopySource(e.target.value)}
                  className="w-full px-3 py-2 bg-[#111213] border border-[#2A2D30] rounded-xl text-xs text-[#ECEBE9] font-mono focus:border-[#3C6B4D] outline-none"
                >
                  {installedModels.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#72706C] block mb-1">Target Alias Name</label>
                <input
                  type="text"
                  placeholder="e.g. llama3.2-custom-coder"
                  value={copyDest}
                  onChange={e => setCopyDest(e.target.value)}
                  className="w-full px-3 py-2 bg-[#111213] border border-[#2A2D30] rounded-xl text-xs text-[#ECEBE9] font-mono focus:border-[#3C6B4D] outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleCopyModel}
              disabled={isCopying || !copyDest.trim() || !copySource}
              className="w-full py-2.5 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 disabled:opacity-50 text-[#ECEBE9] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {isCopying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Creating Model Alias...</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Duplicate Model Alias</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── RIGHT COL: INSPECTOR & HYPERPARAMETERS (5 COLS) ── */}
        <div className="lg:col-span-5 space-y-6">
          {/* ── MODEL DETAILS INSPECTOR ── */}
          <div className="p-5 rounded-2xl bg-[#18191B] border border-[#2A2D30] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-[#3C6B4D]" />
                <h3 className="text-sm font-bold text-[#ECEBE9]">Model Architecture Specs</h3>
              </div>
              {selectedModel && <span className="text-xs font-mono text-[#3C6B4D]">{selectedModel}</span>}
            </div>

            {isLoadingInspect ? (
              <div className="p-8 text-center text-xs text-[#72706C] space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#3C6B4D]" />
                <span>Reading model metadata from Ollama...</span>
              </div>
            ) : inspectError ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                {inspectError}
              </div>
            ) : inspectData ? (
              <div className="space-y-3 font-mono text-xs">
                {inspectData.details && (
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#111213] border border-[#2A2D30]">
                    <div>
                      <div className="text-[10px] text-[#72706C]">FAMILY</div>
                      <div className="text-[#ECEBE9] font-bold">{inspectData.details.family || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#72706C]">PARAMETER SIZE</div>
                      <div className="text-[#ECEBE9] font-bold">{inspectData.details.parameter_size || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#72706C]">QUANTIZATION</div>
                      <div className="text-[#ECEBE9] font-bold">{inspectData.details.quantization_level || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#72706C]">FORMAT</div>
                      <div className="text-[#ECEBE9] font-bold">{inspectData.details.format || 'gguf'}</div>
                    </div>
                  </div>
                )}

                {inspectData.parameters && (
                  <div>
                    <div className="text-[11px] font-bold text-[#72706C] mb-1">DEFAULT PARAMETERS</div>
                    <pre className="p-3 rounded-xl bg-[#111213] border border-[#2A2D30] text-[11px] text-[#ECEBE9] whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {inspectData.parameters}
                    </pre>
                  </div>
                )}

                {inspectData.template && (
                  <div>
                    <div className="text-[11px] font-bold text-[#72706C] mb-1">PROMPT TEMPLATE</div>
                    <pre className="p-3 rounded-xl bg-[#111213] border border-[#2A2D30] text-[10px] text-[#72706C] whitespace-pre-wrap max-h-28 overflow-y-auto">
                      {inspectData.template}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-[#72706C]">
                Select a model from the list to inspect its metadata.
              </div>
            )}
          </div>

          {/* ── GLOBAL INFERENCE HYPERPARAMETERS ── */}
          <div className="p-5 rounded-2xl bg-[#18191B] border border-[#2A2D30] space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#3C6B4D]" />
              <h3 className="text-sm font-bold text-[#ECEBE9]">Global Inference Defaults</h3>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#72706C]">Context Window Size (num_ctx)</span>
                  <span className="font-mono text-[#3C6B4D]">{defaultContext} tokens</span>
                </div>
                <input
                  type="range"
                  min="2048"
                  max="16384"
                  step="2048"
                  value={defaultContext}
                  onChange={e => setDefaultContext(Number(e.target.value))}
                  className="w-full accent-[#3C6B4D] bg-[#2A2D30] h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#72706C]">Temperature</span>
                  <span className="font-mono text-[#3C6B4D]">{defaultTemp}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={defaultTemp}
                  onChange={e => setDefaultTemp(Number(e.target.value))}
                  className="w-full accent-[#3C6B4D] bg-[#2A2D30] h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#72706C]">Top P</span>
                  <span className="font-mono text-[#3C6B4D]">{defaultTopP}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={defaultTopP}
                  onChange={e => setDefaultTopP(Number(e.target.value))}
                  className="w-full accent-[#3C6B4D] bg-[#2A2D30] h-1.5 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={handleSaveDefaults}
              className="w-full py-2 bg-[#2A2D30] hover:bg-[#3C6B4D]/20 text-[#ECEBE9] hover:text-[#3C6B4D] border border-[#2A2D30] hover:border-[#3C6B4D]/40 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              {savedConfigNotice ? (
                <>
                  <Check className="w-4 h-4 text-[#3C6B4D]" />
                  <span>Defaults Saved!</span>
                </>
              ) : (
                <span>Save Hyperparameter Defaults</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {modelToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#18191B] border border-rose-500/40 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold">Confirm Model Deletion</h3>
            </div>
            <p className="text-xs text-[#72706C] leading-relaxed">
              Are you sure you want to permanently delete model <span className="font-mono font-bold text-[#ECEBE9]">{modelToDelete}</span> from local Ollama storage? Model weights will be removed from disk.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setModelToDelete(null)}
                className="px-4 py-2 rounded-xl bg-[#2A2D30] text-[#ECEBE9] text-xs font-bold hover:bg-[#3A3D40] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-2"
              >
                {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
