import { useState, useEffect, useCallback } from 'react';
import { 
  FolderSync, Database, Download, Upload, Info,
  CheckCircle, AlertTriangle, Loader2, RefreshCw, FileCheck, HelpCircle, HardDrive
} from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { mcpClient } from '../../utils/mcpClient';

interface LocalModel {
  registry: string;
  namespace: string;
  name: string;
  tag: string;
  sizeBytes: number;
  layersCount: number;
  manifestPath: string;
}

export const ModelMigrator = () => {
  const [mcpOnline, setMcpOnline] = useState(mcpClient.isOnline());
  const [ollamaOnline, setOllamaOnline] = useState<boolean | null>(null);
  const [customOllamaPath, setCustomOllamaPath] = useState('');
  
  // Model lists
  const [localModels, setLocalModels] = useState<LocalModel[]>([]);
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'pull'>('export');
  
  // State for Export
  const [selectedModel, setSelectedModel] = useState<LocalModel | null>(null);
  const [exportDestination, setExportDestination] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<any>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  // State for Import
  const [importSource, setImportSource] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // State for Pull
  const [pullModelName, setPullModelName] = useState('');
  const [isPulling, setIsPulling] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const [pullStatus, setPullStatus] = useState('');
  const [pullError, setPullError] = useState<string | null>(null);

  // Global loading
  const [isLoadingPath, setIsLoadingPath] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync MCP connection status
  useEffect(() => {
    const handleStatus = (online: boolean) => {
      setMcpOnline(online);
    };
    mcpClient.addStatusListener(handleStatus);
    return () => mcpClient.removeStatusListener(handleStatus);
  }, []);

  const showAlert = (type: 'success' | 'error', text: string) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  // Check Ollama tags via aiService & fetch local models from disk via MCP
  const loadLocalModels = useCallback(async () => {
    setIsLoadingPath(true);
    try {
      // 1. Check Ollama API Status
      const statusCheck = await aiService.checkOllama();
      setOllamaOnline(statusCheck.status);

      // 2. Query manifests list via MCP Server if online
      if (mcpClient.isOnline()) {
        const response = await mcpClient.callTool('list_ollama_models', {
          ollamaPath: customOllamaPath || undefined
        });
        
        if (response.content?.[0]?.text) {
          const parsed = JSON.parse(response.content[0].text);
          setLocalModels(parsed.models || []);
          if (!customOllamaPath && parsed.modelsPath) {
            setCustomOllamaPath(parsed.modelsPath);
          }
        }
      }
    } catch (err: any) {
      console.error('Failed loading local models list:', err);
    } finally {
      setIsLoadingPath(false);
    }
  }, [customOllamaPath]);

  // Load models on load
  useEffect(() => {
    loadLocalModels();
  }, [mcpOnline]);

  const handleExport = async () => {
    if (!selectedModel) {
      showAlert('error', 'Please select a model to export.');
      return;
    }
    if (!exportDestination.trim()) {
      showAlert('error', 'Please specify a destination export directory path.');
      return;
    }

    setIsExporting(true);
    setExportResult(null);
    setExportError(null);

    try {
      const response = await mcpClient.callTool('export_ollama_model', {
        modelName: selectedModel.name,
        modelTag: selectedModel.tag,
        destinationPath: exportDestination.trim(),
        ollamaPath: customOllamaPath || undefined
      });

      if (response.content?.[0]?.text) {
        const parsed = JSON.parse(response.content[0].text);
        if (parsed.success) {
          setExportResult(parsed);
          showAlert('success', 'Model exported successfully to target path!');
        } else {
          setExportError('Export finished but some layers were missing.');
        }
      }
    } catch (err: any) {
      setExportError(err.message || 'An error occurred during model export.');
      showAlert('error', 'Model export failed.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importSource.trim()) {
      showAlert('error', 'Please specify a source directory containing the exported model.');
      return;
    }

    setIsImporting(true);
    setImportResult(null);
    setImportError(null);

    try {
      const response = await mcpClient.callTool('import_ollama_model', {
        sourceFolderPath: importSource.trim(),
        ollamaPath: customOllamaPath || undefined
      });

      if (response.content?.[0]?.text) {
        const parsed = JSON.parse(response.content[0].text);
        if (parsed.success) {
          setImportResult(parsed);
          showAlert('success', 'Model imported successfully into local Ollama.');
          await loadLocalModels();
        } else {
          setImportError('Failed to import manifest layers.');
        }
      }
    } catch (err: any) {
      setImportError(err.message || 'An error occurred during model import.');
      showAlert('error', 'Model import failed.');
    } finally {
      setIsImporting(false);
    }
  };

  const handlePullModel = async () => {
    const modelTag = pullModelName.trim();
    if (!modelTag) {
      showAlert('error', 'Please specify a model name/tag to pull.');
      return;
    }

    setIsPulling(true);
    setPullProgress(0);
    setPullStatus('Connecting to registry...');
    setPullError(null);

    try {
      await aiService.pullOllamaModel(modelTag, (status, progress) => {
        setPullStatus(status);
        setPullProgress(progress);
      });
      showAlert('success', `Model ${modelTag} pulled successfully!`);
      setPullModelName('');
      await loadLocalModels();
    } catch (err: any) {
      setPullError(err.message || 'Failed to pull model.');
      showAlert('error', 'Model download failed.');
    } finally {
      setIsPulling(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes <= 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 text-left select-none">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2A2D30] pb-5">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-[#ECEBE9] flex items-center gap-2">
            <HardDrive className="text-[#3C6B4D]" />
            <span>Ollama Model Migrator</span>
          </h2>
          <p className="text-xs text-[#A3A09B] mt-1 font-sans">
            Back up your installed local Ollama models, write them to external USB or HDD paths, and import them offline on other machines.
          </p>
        </div>

        {/* Status Indicators HUD */}
        <div className="flex flex-wrap items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold border ${
            mcpOnline 
              ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/30 text-[#3C6B4D]' 
              : 'bg-rose-950/20 border-rose-900/30 text-rose-450'
          }`}>
            <FolderSync size={11} className={mcpOnline ? '' : 'animate-pulse'} />
            <span>Domo Bridge: {mcpOnline ? 'Online' : 'Offline'}</span>
          </div>

          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold border ${
            ollamaOnline 
              ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/30 text-[#3C6B4D]' 
              : 'bg-rose-950/20 border-rose-900/30 text-rose-450'
          }`}>
            <Database size={11} className={ollamaOnline ? '' : 'animate-pulse'} />
            <span>Ollama Engine: {ollamaOnline ? 'Online' : 'Offline'}</span>
          </div>

          <button 
            onClick={loadLocalModels} 
            disabled={isLoadingPath}
            className="p-2 bg-[#18191B] hover:bg-[#2A2D30] border border-[#2A2D30] text-[#ECEBE9] rounded-xl transition-all"
            title="Refresh local model files"
          >
            <RefreshCw size={13} className={isLoadingPath ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {alertMsg && (
        <div className={`p-4 rounded-xl text-xs font-mono border flex items-center gap-2 transition-all ${
          alertMsg.type === 'success' 
            ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/30 text-[#3C6B4D]' 
            : 'bg-rose-950/20 border-rose-900/30 text-rose-400'
        }`}>
          <Info size={14} />
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* Ollama Folder Config Bar */}
      <div className="glass-card p-4 flex flex-col gap-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#ECEBE9] font-bold font-mono">
            <Info size={14} className="text-[#3C6B4D]" />
            <span>Ollama Models Storage Path</span>
          </div>
          <p className="text-[10px] text-[#A3A09B]">
            Ensure this points to your active Ollama model folders. Standard folder is <code className="bg-[#111213] px-1 py-0.5 rounded text-[#3C6B4D] font-mono">~/.ollama/models</code>
          </p>
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={customOllamaPath} 
            onChange={(e) => setCustomOllamaPath(e.target.value)}
            placeholder="Default path auto-detected by local server" 
            className="flex-1 bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] font-mono rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#3C6B4D]/50 transition-colors"
          />
          <button 
            onClick={loadLocalModels}
            className="px-4 py-2 bg-[#18191B] border border-[#2A2D30] hover:border-[#3C6B4D]/40 text-[#ECEBE9] rounded-xl text-xs font-bold transition-all"
          >
            Apply Path
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex gap-2 font-mono">
        <button
          onClick={() => setActiveTab('export')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
            activeTab === 'export'
              ? 'bg-[#3C6B4D]/10 text-[#3C6B4D] border-[#3C6B4D]/40 shadow-sm'
              : 'bg-[#18191B] border-[#2A2D30] text-[#A3A09B] hover:text-[#ECEBE9]'
          }`}
        >
          <Upload size={13} /> Export Model (To USB/HDD)
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
            activeTab === 'import'
              ? 'bg-[#3C6B4D]/10 text-[#3C6B4D] border-[#3C6B4D]/40 shadow-sm'
              : 'bg-[#18191B] border-[#2A2D30] text-[#A3A09B] hover:text-[#ECEBE9]'
          }`}
        >
          <Download size={13} /> Import Model (From USB/HDD)
        </button>
        <button
          onClick={() => setActiveTab('pull')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
            activeTab === 'pull'
              ? 'bg-[#3C6B4D]/10 text-[#3C6B4D] border-[#3C6B4D]/40 shadow-sm'
              : 'bg-[#18191B] border-[#2A2D30] text-[#A3A09B] hover:text-[#ECEBE9]'
          }`}
        >
          <RefreshCw size={13} /> Pull Model from Registry
        </button>
      </div>

      {/* Main Action Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Form & Controller */}
        <div className="lg:col-span-2 space-y-6">
          
          {activeTab === 'export' && (
            <div className="glass-card p-5 flex flex-col gap-5">
              <div className="space-y-1">
                <h3 className="font-bold text-[#ECEBE9] text-sm font-mono flex items-center gap-1.5">
                  <Upload size={16} className="text-[#3C6B4D]" />
                  <span>Export Offline Model Profile</span>
                </h3>
                <p className="text-[11px] text-[#A3A09B]">
                  Select an installed model on your machine and specify a portable path (such as a USB disk root) to copy all parameters.
                </p>
              </div>

              {!mcpOnline && (
                <div className="bg-rose-950/20 border border-rose-900/35 text-rose-400 p-4 rounded-xl text-xs flex items-start gap-2 leading-relaxed">
                  <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Local Bridge Offline:</span> Real file operations require the Domo MCP server to be active. Run <code className="bg-[#111213] text-[#ECEBE9] px-1 py-0.5 rounded font-mono">npm run mcp</code> in your local terminal, then refresh this panel.
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1 text-xs">
                  <span className="text-[#A3A09B] font-mono font-bold">Select Installed Model:</span>
                  <select 
                    onChange={(e) => {
                      const idx = parseInt(e.target.value);
                      setSelectedModel(isNaN(idx) ? null : localModels[idx]);
                    }}
                    defaultValue=""
                    className="w-full bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] rounded-xl p-2.5 outline-none focus:border-[#3C6B4D]/50 transition-colors"
                  >
                    <option value="">-- Choose Installed Model ({localModels.length} available) --</option>
                    {localModels.map((model, idx) => (
                      <option key={idx} value={idx}>
                        {model.name}:{model.tag} ({formatSize(model.sizeBytes)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1 text-xs">
                  <span className="text-[#A3A09B] font-mono font-bold">Target USB / HDD Folder Path:</span>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={exportDestination}
                      onChange={(e) => setExportDestination(e.target.value)}
                      placeholder="e.g. D:\OllamaBackups  or  E:\Transfer"
                      className="flex-1 bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] font-mono rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#3C6B4D]/50 transition-colors"
                    />
                  </div>
                  <span className="text-[10px] text-[#72706C] italic font-sans pl-1">
                    Tip: Ensure the directory has enough free space to match the model size.
                  </span>
                </div>

                <button
                  onClick={handleExport}
                  disabled={isExporting || !mcpOnline || !selectedModel || !exportDestination}
                  className="w-full bg-[#3C6B4D] hover:bg-[#2E533B] disabled:opacity-40 disabled:hover:bg-[#3C6B4D] text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
                >
                  {isExporting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Copying model blobs (may take a minute)...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      <span>Back Up & Export Model</span>
                    </>
                  )}
                </button>
              </div>

              {exportError && (
                <div className="bg-rose-950/25 border border-rose-900/35 text-rose-450 p-3 rounded-xl text-[11px] font-mono flex items-start gap-1.5">
                  <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                  <span>{exportError}</span>
                </div>
              )}

              {exportResult && (
                <div className="bg-[#3C6B4D]/10 border border-[#3C6B4D]/30 text-[#ECEBE9] p-4 rounded-xl space-y-2 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-[#3C6B4D] font-bold">
                    <FileCheck size={14} />
                    <span>Export Completed Successfully!</span>
                  </div>
                  <div className="text-[11px] text-[#A3A09B] space-y-1 pt-1">
                    <div>Output Path: <code className="text-[#ECEBE9]">{exportResult.exportPath}</code></div>
                    <div>Blobs Transferred: <strong className="text-[#ECEBE9]">{exportResult.copiedLayers} layers</strong></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'import' && (
            <div className="glass-card p-5 flex flex-col gap-5">
              <div className="space-y-1">
                <h3 className="font-bold text-[#ECEBE9] text-sm font-mono flex items-center gap-1.5">
                  <Download size={16} className="text-[#3C6B4D]" />
                  <span>Import Offline Model Profile</span>
                </h3>
                <p className="text-[11px] text-[#A3A09B]">
                  Select the folder on your external HDD or USB drive containing the exported Ollama model files to restore it to this machine.
                </p>
              </div>

              {!mcpOnline && (
                <div className="bg-rose-950/20 border border-rose-900/35 text-rose-400 p-4 rounded-xl text-xs flex items-start gap-2 leading-relaxed">
                  <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Local Bridge Offline:</span> Real file operations require the Domo MCP server to be active. Run <code className="bg-[#111213] text-[#ECEBE9] px-1 py-0.5 rounded font-mono">npm run mcp</code> in your local terminal.
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1 text-xs">
                  <span className="text-[#A3A09B] font-mono font-bold">Source Folder Path:</span>
                  <input 
                    type="text" 
                    value={importSource}
                    onChange={(e) => setImportSource(e.target.value)}
                    placeholder="e.g. D:\OllamaBackups\llama3.2-3b"
                    className="w-full bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] font-mono rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#3C6B4D]/50 transition-colors"
                  />
                  <span className="text-[10px] text-[#72706C] italic font-sans pl-1">
                    Point to the directory containing metadata.json, manifest, and blobs/
                  </span>
                </div>

                <button
                  onClick={handleImport}
                  disabled={isImporting || !mcpOnline || !importSource}
                  className="w-full bg-[#3C6B4D] hover:bg-[#2E533B] disabled:opacity-40 disabled:hover:bg-[#3C6B4D] text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
                >
                  {isImporting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Restoring manifests and copying blobs locally...</span>
                    </>
                  ) : (
                    <>
                      <Download size={14} />
                      <span>Restore & Import Model</span>
                    </>
                  )}
                </button>
              </div>

              {importError && (
                <div className="bg-rose-950/25 border border-rose-900/35 text-rose-450 p-3 rounded-xl text-[11px] font-mono flex items-start gap-1.5">
                  <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                  <span>{importError}</span>
                </div>
              )}

              {importResult && (
                <div className="bg-[#3C6B4D]/10 border border-[#3C6B4D]/30 text-[#ECEBE9] p-4 rounded-xl space-y-2 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-[#3C6B4D] font-bold">
                    <CheckCircle size={14} />
                    <span>Model Restored Successfully!</span>
                  </div>
                  <div className="text-[11px] text-[#A3A09B] space-y-1 pt-1">
                    <div>Model ID: <strong className="text-[#ECEBE9]">{importResult.model}</strong></div>
                    <div>Local Manifest: <code className="text-[#ECEBE9]">{importResult.manifestPath}</code></div>
                    <div>Blobs Restored: <strong className="text-[#ECEBE9]">{importResult.importedBlobsCount} layers</strong></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'pull' && (
            <div className="glass-card p-5 flex flex-col gap-5">
              <div className="space-y-1">
                <h3 className="font-bold text-[#ECEBE9] text-sm font-mono flex items-center gap-1.5">
                  <RefreshCw size={16} className="text-[#3C6B4D]" />
                  <span>Pull Model from Ollama Registry</span>
                </h3>
                <p className="text-[11px] text-[#A3A09B]">
                  If the model is not on this machine yet, download it from the Ollama library so you can export it to your portable drive.
                </p>
              </div>

              {!ollamaOnline && (
                <div className="bg-rose-950/20 border border-rose-900/35 text-rose-400 p-4 rounded-xl text-xs flex items-start gap-2 leading-relaxed">
                  <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Ollama Offline:</span> Direct model pulling requires the local Ollama daemon to be active. Check connection status in the top bar.
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1 text-xs">
                  <span className="text-[#A3A09B] font-mono font-bold">Model Registry Tag name:</span>
                  <input 
                    type="text" 
                    value={pullModelName}
                    onChange={(e) => setPullModelName(e.target.value)}
                    placeholder="e.g. llama3.2:3b  or  deepseek-coder:6.7b"
                    className="w-full bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] font-mono rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#3C6B4D]/50 transition-colors"
                  />
                  <span className="text-[10px] text-[#72706C] italic font-sans pl-1">
                    Check tags on <a href="https://ollama.com/library" target="_blank" rel="noreferrer" className="text-[#3C6B4D] underline">ollama.com/library</a>
                  </span>
                </div>

                <button
                  onClick={handlePullModel}
                  disabled={isPulling || !ollamaOnline || !pullModelName}
                  className="w-full bg-[#3C6B4D] hover:bg-[#2E533B] disabled:opacity-40 disabled:hover:bg-[#3C6B4D] text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
                >
                  {isPulling ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Pulling Model ({pullProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Download size={14} />
                      <span>Start Downloading</span>
                    </>
                  )}
                </button>
              </div>

              {isPulling && (
                <div className="bg-[#111213] border border-[#2A2D30] p-4 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono text-[#A3A09B]">
                    <span>Status: {pullStatus}</span>
                    <span className="font-bold text-[#ECEBE9]">{pullProgress}%</span>
                  </div>
                  <div className="w-full bg-[#18191B] rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-[#3C6B4D] h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${pullProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {pullError && (
                <div className="bg-rose-950/25 border border-rose-900/35 text-rose-450 p-3 rounded-xl text-[11px] font-mono flex items-start gap-1.5">
                  <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                  <span>{pullError}</span>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Column: Local Model Inventory */}
        <div className="space-y-6">
          
          <div className="glass-card p-4 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#2A2D30]">
              <h3 className="font-bold text-[#ECEBE9] text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Database size={13} className="text-[#3C6B4D]" />
                <span>Installed Inventory ({localModels.length})</span>
              </h3>
            </div>

            {localModels.length === 0 ? (
              <div className="text-[10px] text-slate-500 italic text-center py-10 border border-dashed border-[#2A2D30] rounded-xl flex items-center justify-center">
                {isLoadingPath ? 'Scanning storage paths...' : 'No models detected locally.'}
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
                {localModels.map((model, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 bg-[#111213] border hover:border-[#3C6B4D]/40 rounded-xl flex justify-between items-start transition-all cursor-pointer ${
                      selectedModel?.name === model.name && selectedModel?.tag === model.tag ? 'border-[#3C6B4D]/80 bg-[#3C6B4D]/5 shadow-sm' : 'border-[#2A2D30]'
                    }`}
                    onClick={() => {
                      if (activeTab === 'export') {
                        setSelectedModel(model);
                      }
                    }}
                  >
                    <div className="flex flex-col gap-0.5 text-left overflow-hidden">
                      <span className="text-[11px] font-bold text-[#ECEBE9] truncate" title={`${model.name}:${model.tag}`}>
                        {model.name}:{model.tag}
                      </span>
                      <span className="text-[9px] text-[#A3A09B] font-mono">
                        Layers: {model.layersCount} • Size: {formatSize(model.sizeBytes)}
                      </span>
                    </div>
                    <span className="text-[9px] bg-[#18191B] border border-[#2A2D30] px-1.5 py-0.5 rounded text-[#A3A09B] font-mono capitalize">
                      {model.namespace}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card p-4 text-xs space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-[#ECEBE9] font-mono">
              <HelpCircle size={14} className="text-[#3C6B4D]" />
              <span>Offline Migration Guide</span>
            </div>
            <div className="text-[11.5px] text-[#A3A09B] space-y-2.5 leading-relaxed font-sans">
              <p>
                To migrate a model to an offline computer:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-[10.5px]">
                <li>Plug a USB drive into this computer.</li>
                <li>Select the model under the <span className="font-semibold text-[#ECEBE9]">Export</span> tab.</li>
                <li>Enter the USB drive path as the Target Folder and hit <span className="font-semibold text-[#ECEBE9]">Export</span>.</li>
                <li>Once done, eject the USB drive.</li>
                <li>Plug it into the target offline computer running DomoDomo.</li>
                <li>Open this tool on that computer and paste the folder path under the <span className="font-semibold text-[#ECEBE9]">Import</span> tab.</li>
                <li>Hit <span className="font-semibold text-[#ECEBE9]">Import</span> to finish installing!</li>
              </ol>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
