import { useState, useEffect, useCallback } from 'react';
import {
  Search, Download, Check, CheckCircle, AlertTriangle, Loader2,
  Globe, Key, Star, Eye, Layers, HardDrive,
  ExternalLink, X, Info
} from 'lucide-react';
import { aiService } from '../../../utils/aiService';

interface HFModel {
  modelId: string;
  author?: string;
  tags?: string[];
  pipeline_tag?: string;
  downloads?: number;
  likes?: number;
  lastModified?: string;
  private?: boolean;
  library_name?: string;
}

interface HFModelDetail {
  modelId: string;
  author?: string;
  tags?: string[];
  pipeline_tag?: string;
  downloads?: number;
  likes?: number;
  siblings?: { rfilename: string; size?: number }[];
  config?: any;
  cardData?: any;
}

interface Props {
  ollamaModels: string[];
  onModelPulled?: () => void;
}

const POPULAR_GGUF_REPOS = [
  { id: 'bartowski/Llama-3.2-3B-Instruct-GGUF', name: 'Llama 3.2 3B Instruct (GGUF)', params: '3B', author: 'bartowski' },
  { id: 'bartowski/Qwen2.5-7B-Instruct-GGUF', name: 'Qwen 2.5 7B Instruct (GGUF)', params: '7B', author: 'bartowski' },
  { id: 'bartowski/gemma-2-9b-it-GGUF', name: 'Gemma 2 9B IT (GGUF)', params: '9B', author: 'bartowski' },
  { id: 'bartowski/Mistral-7B-Instruct-v0.3-GGUF', name: 'Mistral 7B v0.3 (GGUF)', params: '7B', author: 'bartowski' },
  { id: 'bartowski/Phi-3.5-mini-instruct-GGUF', name: 'Phi-3.5 Mini (GGUF)', params: '3.8B', author: 'bartowski' },
  { id: 'bartowski/Meta-Llama-3.1-8B-Instruct-GGUF', name: 'Llama 3.1 8B Instruct (GGUF)', params: '8B', author: 'bartowski' },
  { id: 'bartowski/DeepSeek-R1-Distill-Qwen-7B-GGUF', name: 'DeepSeek R1 Distill 7B (GGUF)', params: '7B', author: 'bartowski' },
  { id: 'bartowski/codegemma-7b-it-GGUF', name: 'CodeGemma 7B IT (GGUF)', params: '7B', author: 'bartowski' },
];

const QUANT_OPTIONS = [
  { id: 'Q4_K_M', label: 'Q4_K_M', desc: 'Best balance of size & quality', badge: 'Recommended' },
  { id: 'Q5_K_M', label: 'Q5_K_M', desc: 'Higher quality, larger size', badge: '' },
  { id: 'Q8_0', label: 'Q8_0', desc: 'Near-lossless quality', badge: '' },
  { id: 'IQ2_M', label: 'IQ2_M', desc: 'Ultra-compact, lower quality', badge: 'Smallest' },
  { id: 'Q6_K', label: 'Q6_K', desc: 'High quality, moderate size', badge: '' },
];

const formatNumber = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

export const HuggingFaceModelHub = ({ ollamaModels, onModelPulled }: Props) => {
  // Token state
  const [hfToken, setHfToken] = useState(() => aiService.getHuggingFaceToken());
  const [hfStatus, setHfStatus] = useState<'idle' | 'checking' | 'connected' | 'error'>('idle');
  const [hfUsername, setHfUsername] = useState('');
  const [showToken, setShowToken] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<HFModel[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFilter, setSearchFilter] = useState<'all' | 'gguf' | 'text-generation' | 'text2text-generation'>('gguf');
  const [sortBy, setSortBy] = useState<'downloads' | 'likes' | 'lastModified'>('downloads');

  // Model detail
  const [selectedModel, setSelectedModel] = useState<HFModelDetail | null>(null);
  const [modelFiles, setModelFiles] = useState<any[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Download state
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState('');
  const [selectedQuant, setSelectedQuant] = useState('Q4_K_M');

  // Popular models (shown by default)
  const [showPopular, setShowPopular] = useState(true);

  // Check HF connection on token change
  const checkConnection = useCallback(async () => {
    if (!hfToken.trim()) {
      setHfStatus('idle');
      setHfUsername('');
      return;
    }
    setHfStatus('checking');
    aiService.setHuggingFaceToken(hfToken);
    const result = await aiService.checkHuggingFaceConnection();
    if (result.status) {
      setHfStatus('connected');
      setHfUsername(result.username);
    } else {
      setHfStatus('error');
      setHfUsername('');
    }
  }, [hfToken]);

  useEffect(() => {
    if (hfToken.trim()) {
      checkConnection();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Search HuggingFace models
  const handleSearch = async () => {
    setIsSearching(true);
    setShowPopular(false);
    let filter = '';
    if (searchFilter === 'gguf') filter = 'gguf';
    else if (searchFilter !== 'all') filter = searchFilter;
    const results = await aiService.searchHuggingFaceModels(searchQuery || 'gguf', {
      filter,
      sort: sortBy,
      limit: 24
    });
    setSearchResults(results);
    setIsSearching(false);
  };

  // Load model details
  const handleViewModel = async (modelId: string) => {
    setIsLoadingDetail(true);
    setSelectedModel(null);
    setModelFiles([]);
    const info = await aiService.getHuggingFaceModelInfo(modelId);
    if (info) {
      setSelectedModel(info);
      const files = await aiService.getHuggingFaceModelFiles(modelId);
      setModelFiles(files);
    }
    setIsLoadingDetail(false);
  };

  // Pull model to Ollama
  const handlePullToOllama = async (modelId: string, quant: string) => {
    setDownloadingId(modelId);
    setDownloadProgress(0);
    setDownloadStatus('Starting...');
    try {
      await aiService.pullHuggingFaceModelToOllama(modelId, quant, (status, progress) => {
        setDownloadStatus(status);
        setDownloadProgress(progress);
      });
      setDownloadStatus('Complete!');
      setDownloadProgress(100);
      onModelPulled?.();
    } catch (err: any) {
      setDownloadStatus(`Error: ${err.message}`);
    }
    setTimeout(() => {
      setDownloadingId(null);
      setDownloadProgress(0);
      setDownloadStatus('');
    }, 3000);
  };

  const ggufFiles = modelFiles.filter(f =>
    f.rfilename?.endsWith('.gguf') && !f.rfilename?.includes('mmproj')
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Globe size={12} />
              <span>HuggingFace Integration</span>
            </div>
            <h2 className="text-lg font-extrabold text-[#ECEBE9]">HuggingFace Model Hub</h2>
            <p className="text-[#72706C] text-xs mt-0.5">Browse, search, and pull HuggingFace models directly into your local Ollama instance. Token is optional for public models.</p>
          </div>
          <div className="flex items-center gap-2">
            {hfStatus === 'connected' && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                <CheckCircle size={11} /> Connected as {hfUsername}
              </span>
            )}
            {hfStatus === 'error' && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-full border border-red-500/20">
                <AlertTriangle size={11} /> Invalid Token
              </span>
            )}
          </div>
        </div>

        {/* Token Configuration */}
        <div className="mt-4 pt-4 border-t border-[#2A2D30]">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-bold text-[#72706C] uppercase tracking-wider flex items-center gap-1">
                <Key size={10} /> HuggingFace Token (Optional)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={hfToken}
                    onChange={e => setHfToken(e.target.value)}
                    placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-amber-500/50 pr-8"
                  />
                  <button
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#72706C] hover:text-[#ECEBE9]"
                  >
                    <Eye size={13} />
                  </button>
                </div>
                <button
                  onClick={() => {
                    aiService.setHuggingFaceToken(hfToken);
                    checkConnection();
                  }}
                  disabled={hfStatus === 'checking'}
                  className="px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold hover:bg-amber-500/25 disabled:opacity-50 transition-all flex items-center gap-1.5 shrink-0"
                >
                  {hfStatus === 'checking' ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                  Verify
                </button>
              </div>
              <p className="text-[9px] text-[#72706C]">
                Get your token at{' '}
                <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">
                  huggingface.co/settings/tokens
                </a>
                . Required for gated models, optional for public repositories.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#72706C]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search HuggingFace models (e.g. llama, qwen, gemma, mistral)..."
              className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#ECEBE9] focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value as any)}
              className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-[10px] text-[#ECEBE9] font-mono focus:outline-none"
            >
              <option value="gguf">GGUF Models</option>
              <option value="text-generation">Text Generation</option>
              <option value="text2text-generation">Text2Text</option>
              <option value="all">All Models</option>
            </select>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-[10px] text-[#ECEBE9] font-mono focus:outline-none"
            >
              <option value="downloads">Most Downloads</option>
              <option value="likes">Most Likes</option>
              <option value="lastModified">Recently Updated</option>
            </select>
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold hover:bg-amber-500/25 disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              {isSearching ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
              Search
            </button>
          </div>
        </div>

        {/* Results or Popular Models */}
        {showPopular && searchResults.length === 0 && (
          <div>
            <h3 className="text-xs font-extrabold text-[#A3A09B] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Star size={12} className="text-amber-400" /> Popular GGUF Models (Ollama-Ready)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {POPULAR_GGUF_REPOS.map(model => {
                const isDownloading = downloadingId === model.id;
                return (
                  <div key={model.id} className="bg-[#111213] border border-[#2A2D30] rounded-xl p-4 hover:border-amber-500/30 transition-all group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-extrabold text-[#ECEBE9] truncate">{model.name}</h4>
                          <span className="text-[9px] font-mono bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded font-bold shrink-0">{model.params}</span>
                        </div>
                        <p className="text-[10px] text-[#72706C] mt-0.5 font-mono truncate">{model.id}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleViewModel(model.id)}
                          className="p-1.5 rounded-lg bg-[#18191B] border border-[#2A2D30] text-[#72706C] hover:text-[#ECEBE9] hover:border-amber-500/30 transition-all"
                          title="View model details"
                        >
                          <Info size={12} />
                        </button>
                        <button
                          onClick={() => handlePullToOllama(model.id, selectedQuant)}
                          disabled={!!downloadingId}
                          className="p-1.5 rounded-lg bg-[#3C6B4D]/15 border border-[#3C6B4D]/30 text-[#3C6B4D] hover:bg-[#3C6B4D]/25 hover:border-[#3C6B4D]/50 disabled:opacity-40 transition-all"
                          title="Pull to Ollama"
                        >
                          {isDownloading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                        </button>
                      </div>
                    </div>
                    {isDownloading && (
                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-center justify-between text-[9px]">
                          <span className="text-[#72706C] truncate">{downloadStatus}</span>
                          <span className="text-[#3C6B4D] font-bold">{downloadProgress}%</span>
                        </div>
                        <div className="h-1.5 bg-[#111213] rounded-full overflow-hidden border border-[#2A2D30]">
                          <div className="h-full bg-[#3C6B4D] transition-all duration-300 rounded-full" style={{ width: `${downloadProgress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-extrabold text-[#A3A09B] uppercase tracking-wider flex items-center gap-1.5">
                <Search size={12} className="text-amber-400" /> Search Results ({searchResults.length})
              </h3>
              <button onClick={() => { setSearchResults([]); setShowPopular(true); }} className="text-[10px] text-[#72706C] hover:text-[#ECEBE9]">
                <X size={12} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
              {searchResults.map((model: any) => {
                const id = model.modelId || model.id;
                const isDownloading = downloadingId === id;
                return (
                  <div key={id} className="bg-[#111213] border border-[#2A2D30] rounded-xl p-4 hover:border-amber-500/30 transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-extrabold text-[#ECEBE9] truncate">{id}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          {model.pipeline_tag && (
                            <span className="text-[8px] font-mono bg-[#2A2D30] text-[#A3A09B] px-1.5 py-0.5 rounded uppercase">{model.pipeline_tag}</span>
                          )}
                          {model.downloads != null && (
                            <span className="text-[9px] text-[#72706C] flex items-center gap-0.5">
                              <Download size={9} /> {formatNumber(model.downloads)}
                            </span>
                          )}
                          {model.likes != null && (
                            <span className="text-[9px] text-[#72706C] flex items-center gap-0.5">
                              <Star size={9} /> {formatNumber(model.likes)}
                            </span>
                          )}
                        </div>
                        {model.tags && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {model.tags.slice(0, 4).map((tag: string) => (
                              <span key={tag} className="text-[8px] bg-[#18191B] border border-[#2A2D30] text-[#72706C] px-1.5 py-0.5 rounded">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleViewModel(id)}
                          className="p-1.5 rounded-lg bg-[#18191B] border border-[#2A2D30] text-[#72706C] hover:text-[#ECEBE9] hover:border-amber-500/30 transition-all"
                        >
                          <Info size={12} />
                        </button>
                        <button
                          onClick={() => handlePullToOllama(id, selectedQuant)}
                          disabled={!!downloadingId}
                          className="p-1.5 rounded-lg bg-[#3C6B4D]/15 border border-[#3C6B4D]/30 text-[#3C6B4D] hover:bg-[#3C6B4D]/25 disabled:opacity-40 transition-all"
                        >
                          {isDownloading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                        </button>
                      </div>
                    </div>
                    {isDownloading && (
                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-center justify-between text-[9px]">
                          <span className="text-[#72706C] truncate">{downloadStatus}</span>
                          <span className="text-[#3C6B4D] font-bold">{downloadProgress}%</span>
                        </div>
                        <div className="h-1.5 bg-[#111213] rounded-full overflow-hidden border border-[#2A2D30]">
                          <div className="h-full bg-[#3C6B4D] transition-all duration-300 rounded-full" style={{ width: `${downloadProgress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Quantization Selector */}
      <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5">
        <h3 className="text-xs font-extrabold text-[#ECEBE9] flex items-center gap-2 mb-3">
          <Layers size={14} className="text-amber-400" /> Default Quantization for Downloads
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {QUANT_OPTIONS.map(q => (
            <button
              key={q.id}
              onClick={() => setSelectedQuant(q.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedQuant === q.id
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                  : 'bg-[#111213] border-[#2A2D30] text-[#72706C] hover:border-amber-500/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">{q.label}</span>
                {q.badge && <span className="text-[7px] font-bold bg-amber-500/20 text-amber-400 px-1 py-0.5 rounded uppercase">{q.badge}</span>}
              </div>
              <p className="text-[9px] mt-0.5 opacity-70">{q.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Model Detail Panel */}
      {(isLoadingDetail || selectedModel) && (
        <div className="bg-[#18191B] border border-amber-500/20 rounded-2xl p-5 space-y-4">
          {isLoadingDetail ? (
            <div className="flex items-center justify-center py-8 gap-2 text-[#72706C]">
              <Loader2 size={16} className="animate-spin text-amber-400" />
              <span className="text-xs">Loading model details...</span>
            </div>
          ) : selectedModel && (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-[#ECEBE9]">{selectedModel.modelId}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedModel.pipeline_tag && (
                      <span className="text-[9px] font-mono bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded uppercase font-bold">{selectedModel.pipeline_tag}</span>
                    )}
                    {selectedModel.downloads != null && (
                      <span className="text-[9px] text-[#72706C] flex items-center gap-0.5"><Download size={9} /> {formatNumber(selectedModel.downloads)} downloads</span>
                    )}
                    {selectedModel.likes != null && (
                      <span className="text-[9px] text-[#72706C] flex items-center gap-0.5"><Star size={9} /> {formatNumber(selectedModel.likes)} likes</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://huggingface.co/${selectedModel.modelId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-[#111213] border border-[#2A2D30] text-[#72706C] hover:text-amber-400 transition-all"
                  >
                    <ExternalLink size={13} />
                  </a>
                  <button onClick={() => { setSelectedModel(null); setModelFiles([]); }} className="p-1.5 rounded-lg bg-[#111213] border border-[#2A2D30] text-[#72706C] hover:text-red-400 transition-all">
                    <X size={13} />
                  </button>
                </div>
              </div>

              {/* Tags */}
              {selectedModel.tags && selectedModel.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedModel.tags.slice(0, 12).map(tag => (
                    <span key={tag} className="text-[8px] bg-[#111213] border border-[#2A2D30] text-[#72706C] px-1.5 py-0.5 rounded font-mono">{tag}</span>
                  ))}
                </div>
              )}

              {/* GGUF Files */}
              {ggufFiles.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-[#A3A09B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <HardDrive size={11} /> Available GGUF Variants ({ggufFiles.length})
                  </h4>
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {ggufFiles.map((file: any) => {
                      const name = file.rfilename;
                      const sizeGB = file.size ? (file.size / (1024 * 1024 * 1024)).toFixed(2) : '?';
                      const isDownloading = downloadingId === `${selectedModel.modelId}:${name}`;
                      return (
                        <div key={name} className="flex items-center justify-between bg-[#111213] border border-[#2A2D30] rounded-lg px-3 py-2 hover:border-amber-500/20 transition-all">
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-mono text-[#ECEBE9] truncate block">{name}</span>
                            <span className="text-[9px] text-[#72706C]">{sizeGB} GB</span>
                          </div>
                          <button
                            onClick={() => {
                              // Extract quant from filename
                              const quantMatch = name.match(/(Q\d+_K_[MSL]|IQ\d+_[MSL]|Q\d+_\d+|F\d+)/i);
                              const quant = quantMatch?.[1] || selectedQuant;
                              handlePullToOllama(selectedModel.modelId, quant);
                            }}
                            disabled={!!downloadingId}
                            className="px-3 py-1.5 rounded-lg bg-[#3C6B4D]/15 border border-[#3C6B4D]/30 text-[#3C6B4D] text-[10px] font-bold hover:bg-[#3C6B4D]/25 disabled:opacity-40 transition-all flex items-center gap-1 shrink-0"
                          >
                            {isDownloading ? <Loader2 size={10} className="animate-spin" /> : <Download size={10} />}
                            Pull to Ollama
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {ggufFiles.length === 0 && modelFiles.length > 0 && (
                <div className="bg-[#111213] border border-amber-500/20 rounded-xl p-4 text-center">
                  <AlertTriangle size={16} className="text-amber-400 mx-auto mb-2" />
                  <p className="text-xs text-[#A3A09B] font-bold">No GGUF Files Found</p>
                  <p className="text-[10px] text-[#72706C] mt-1">This model doesn't have GGUF variants. You may need to convert it using llama.cpp or use it directly through the HuggingFace Inference API.</p>
                  <button
                    onClick={() => handlePullToOllama(selectedModel.modelId, selectedQuant)}
                    disabled={!!downloadingId}
                    className="mt-3 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold hover:bg-amber-500/25 disabled:opacity-50 transition-all flex items-center gap-1.5 mx-auto"
                  >
                    <Download size={12} /> Try Pull via Ollama Native HF Support
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Currently pulled HF models in Ollama */}
      {ollamaModels.some(m => m.includes('hf.co') || m.includes('huggingface')) && (
        <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5">
          <h3 className="text-xs font-extrabold text-[#ECEBE9] flex items-center gap-2 mb-3">
            <CheckCircle size={14} className="text-[#3C6B4D]" /> HuggingFace Models in Local Ollama
          </h3>
          <div className="space-y-1.5">
            {ollamaModels.filter(m => m.includes('hf.co') || m.includes('huggingface')).map(m => (
              <div key={m} className="flex items-center justify-between bg-[#111213] border border-[#2A2D30] rounded-lg px-3 py-2">
                <span className="text-[10px] font-mono text-[#ECEBE9]">{m}</span>
                <span className="text-[8px] font-bold text-[#3C6B4D] bg-[#3C6B4D]/10 px-1.5 py-0.5 rounded uppercase">Local</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
