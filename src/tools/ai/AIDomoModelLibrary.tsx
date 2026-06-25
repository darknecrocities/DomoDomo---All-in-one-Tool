import { useState, useEffect, useCallback } from 'react';
import { 
  Cpu, Download, Copy, Check, Search, Settings, Info, 
  CheckCircle, Layers, Globe, Eye, Flame, 
  Zap, AlertTriangle, Loader2, Play, ChevronDown, ChevronUp
} from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { handleTextCopy } from '../../utils/sharedHelpers';

interface ModelFeature {
  contextWindow: string;
  multilingual: boolean;
  vision: boolean;
  speed: 'Very Fast' | 'Fast' | 'Moderate' | 'Slow';
  coding: 'Basic' | 'Good' | 'Excellent';
}

interface ModelInfo {
  id: string;
  name: string;
  parameters: string;
  size: string;
  description: string;
  tags: string[];
  features: ModelFeature;
  recommendation: string;
  ramRequired: string;
  categories: string[];
  purpose: string;
}

const MODELS_CATALOG: ModelInfo[] = [
  {
    id: 'llama3.2:1b',
    name: 'Meta Llama 3.2 1B',
    parameters: '1.2B',
    size: '1.3 GB',
    description: 'Meta\'s ultra-lightweight text model designed for local, resource-constrained execution. Ideal for fast task processing and mobile environments.',
    tags: ['Meta', 'Ultra-Lightweight', 'General Chat'],
    purpose: 'Personal assistants, text summarizing, rewriting, and quick question answering on low-resource machines.',
    features: {
      contextWindow: '128k',
      multilingual: true,
      vision: false,
      speed: 'Very Fast',
      coding: 'Basic'
    },
    recommendation: 'Highly recommended for budget laptops, old computers, or running entirely on low-end CPUs.',
    ramRequired: '4GB - 8GB RAM',
    categories: ['low-spec', 'general']
  },
  {
    id: 'llama3.2:3b',
    name: 'Meta Llama 3.2 3B',
    parameters: '3.2B',
    size: '2.0 GB',
    description: 'Meta\'s state-of-the-art compact text model offering an exceptional balance of reasoning accuracy, bilingual support, and speed.',
    tags: ['Meta', 'Balanced', 'Multilingual'],
    purpose: 'General chat, structured data output, smart agent reasoning, and interactive dialogue.',
    features: {
      contextWindow: '128k',
      multilingual: true,
      vision: false,
      speed: 'Fast',
      coding: 'Good'
    },
    recommendation: 'The gold standard for standard laptops and average consumer machines seeking smart offline chat.',
    ramRequired: '8GB - 16GB RAM',
    categories: ['balanced', 'general']
  },
  {
    id: 'qwen2.5:0.5b',
    name: 'Alibaba Qwen 2.5 0.5B',
    parameters: '490M',
    size: '350 MB',
    description: 'Alibaba\'s ultra-compact LLM with a minuscule RAM footprint. Performs surprisingly well for basic text parsing and structured outputs.',
    tags: ['Alibaba', 'Micro-Model', 'Multilingual'],
    purpose: 'Embedded systems, micro-agents, schema parsing, JSON extraction, and extremely low-spec configurations.',
    features: {
      contextWindow: '32k',
      multilingual: true,
      vision: false,
      speed: 'Very Fast',
      coding: 'Basic'
    },
    recommendation: 'Use when RAM is severely limited or when speed is the only metric that matters.',
    ramRequired: '2GB - 4GB RAM',
    categories: ['low-spec']
  },
  {
    id: 'qwen2.5:1.5b',
    name: 'Alibaba Qwen 2.5 1.5B',
    parameters: '1.5B',
    size: '900 MB',
    description: 'Alibaba\'s lightweight powerhouse. Offers impressive multilingual support and handles basic programming syntax beautifully.',
    tags: ['Alibaba', 'Lightweight', 'Coding-Capable'],
    purpose: 'Bilingual chat, quick code generation, email drafting, and formatting pipelines.',
    features: {
      contextWindow: '32k',
      multilingual: true,
      vision: false,
      speed: 'Very Fast',
      coding: 'Good'
    },
    recommendation: 'Excellent for users who want multi-language conversations and basic coding aid on dual-core laptops.',
    ramRequired: '4GB - 8GB RAM',
    categories: ['low-spec', 'coding']
  },
  {
    id: 'qwen2.5:7b',
    name: 'Alibaba Qwen 2.5 7B',
    parameters: '7.3B',
    size: '4.7 GB',
    description: 'A heavyweight champion in the 7B class, boasting advanced coding and mathematical logic alongside top-tier multilingual performance.',
    tags: ['Alibaba', 'Reasoning', 'Advanced Coding'],
    purpose: 'Complex software development assistance, mathematical problems, logical reasoning, and agent tool execution.',
    features: {
      contextWindow: '128k',
      multilingual: true,
      vision: false,
      speed: 'Moderate',
      coding: 'Excellent'
    },
    recommendation: 'Highly recommended for developers and power users with workstations or gaming rigs.',
    ramRequired: '16GB+ RAM',
    categories: ['high-perf', 'coding']
  },
  {
    id: 'phi3:3.8b',
    name: 'Microsoft Phi-3 3.8B',
    parameters: '3.8B',
    size: '2.2 GB',
    description: 'Microsoft\'s highly efficient Small Language Model (SLM) trained on heavy synthetic logic datasets. Outstanding performance for its compact size.',
    tags: ['Microsoft', 'SLM', 'High Logic'],
    purpose: 'Step-by-step reasoning, logical riddles, reading comprehension, and structured command generation.',
    features: {
      contextWindow: '128k',
      multilingual: false,
      vision: false,
      speed: 'Fast',
      coding: 'Good'
    },
    recommendation: 'Great for academic reasoning, text classification, and structured logical workflows on standard PCs.',
    ramRequired: '8GB - 16GB RAM',
    categories: ['balanced', 'general']
  },
  {
    id: 'gemma2:2b',
    name: 'Google Gemma 2 2B',
    parameters: '2.6B',
    size: '1.6 GB',
    description: 'Google\'s highly efficient open model featuring advanced architecture optimizations. Highly responsive with outstanding text formatting logic.',
    tags: ['Google', 'Tactical Text', 'Highly Accurate'],
    purpose: 'Creative writing assistance, summarization, prompt enhancement, and structured extraction.',
    features: {
      contextWindow: '8k',
      multilingual: true,
      vision: false,
      speed: 'Fast',
      coding: 'Basic'
    },
    recommendation: 'Perfect for content writers, bloggers, and prompt engineers seeking high-quality textual outputs.',
    ramRequired: '8GB RAM',
    categories: ['low-spec', 'general']
  },
  {
    id: 'gemma2:9b',
    name: 'Google Gemma 2 9B',
    parameters: '9.2B',
    size: '5.5 GB',
    description: 'A powerful Google LLM that frequently matches or beats larger models in benchmarks. Offers incredibly robust natural language understanding.',
    tags: ['Google', 'High Accuracy', 'Deep Analysis'],
    purpose: 'In-depth research assistance, complex text transformations, logic puzzles, and high-accuracy reviews.',
    features: {
      contextWindow: '8k',
      multilingual: true,
      vision: false,
      speed: 'Moderate',
      coding: 'Good'
    },
    recommendation: 'Excellent if you prioritize factual accuracy and depth of response, and have a GPU to accelerate it.',
    ramRequired: '16GB+ RAM',
    categories: ['high-perf', 'general']
  },
  {
    id: 'mistral:7b',
    name: 'Mistral AI 7B',
    parameters: '7.2B',
    size: '4.1 GB',
    description: 'The legendary open model that set the standard for 7B parameters. Highly versatile, creative, and widely compatible.',
    tags: ['Mistral', 'Versatile', 'Creative Writing'],
    purpose: 'Creative writing, storytelling, open-ended dialogues, and custom corporate instruction-following.',
    features: {
      contextWindow: '32k',
      multilingual: true,
      vision: false,
      speed: 'Moderate',
      coding: 'Good'
    },
    recommendation: 'A classic, highly adaptive choice for general tasks and creative prompt templates.',
    ramRequired: '16GB RAM',
    categories: ['high-perf', 'general']
  },
  {
    id: 'llava:7b',
    name: 'LLaVA 7B (Vision)',
    parameters: '7.2B',
    size: '4.7 GB',
    description: 'A multimodal model that bridges the gap between text and sight. Capable of analyzing image uploads and answering visual queries.',
    tags: ['Vision-Capable', 'Multimodal', 'Image OCR'],
    purpose: 'Image captioning, object identification, optical character recognition (OCR) of diagrams, and visual chat.',
    features: {
      contextWindow: '4k',
      multilingual: true,
      vision: true,
      speed: 'Moderate',
      coding: 'Basic'
    },
    recommendation: 'Must-have model if you want to test visual workflows or OCR formatting in local environments.',
    ramRequired: '16GB+ RAM (GPU strongly recommended)',
    categories: ['high-perf', 'vision']
  },
  {
    id: 'codegemma:7b',
    name: 'Google CodeGemma 7B',
    parameters: '7B',
    size: '4.8 GB',
    description: 'Google\'s specialized variant of Gemma optimized for software development. Built to assist in code completion and language-agnostic engineering tasks.',
    tags: ['Google', 'Coding Specialized', 'Code Autocomplete'],
    purpose: 'Autocompleting programming files, bug diagnostics, unit test writing, and repository navigation.',
    features: {
      contextWindow: '8k',
      multilingual: true,
      vision: false,
      speed: 'Moderate',
      coding: 'Excellent'
    },
    recommendation: 'Dedicated model for developers looking to integrate local IDE completions and review workflows.',
    ramRequired: '16GB RAM',
    categories: ['high-perf', 'coding']
  },
  {
    id: 'deepseek-coder:6.7b',
    name: 'DeepSeek Coder 6.7B',
    parameters: '6.7B',
    size: '3.8 GB',
    description: 'One of the best open-source coding assistants in the industry. Trained on massive codebase datasets to handle multi-file operations and refactoring.',
    tags: ['DeepSeek', 'Coding Specialized', 'Refactoring Master'],
    purpose: 'Advanced software design, algorithm generation, security patch reviews, and system scripting.',
    features: {
      contextWindow: '16k',
      multilingual: true,
      vision: false,
      speed: 'Moderate',
      coding: 'Excellent'
    },
    recommendation: 'Perfect local helper for programmers who write software offline and want premium code suggestions.',
    ramRequired: '12GB - 16GB RAM',
    categories: ['high-perf', 'coding']
  }
];

export const AIDomoModelLibrary = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'catalog' | 'troubleshoot'>('catalog');
  
  // Connection states
  const [isOllamaOnline, setIsOllamaOnline] = useState<boolean | null>(null);
  const [installedModels, setInstalledModels] = useState<string[]>([]);
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(true);
  const [customEndpoint, setCustomEndpoint] = useState<string>('');
  const [hardwareInfo, setHardwareInfo] = useState<any>(null);

  // Pull / Download states
  const [activePullId, setActivePullId] = useState<string | null>(null);
  const [pullProgress, setPullProgress] = useState<number>(0);
  const [pullStatusMsg, setPullStatusMsg] = useState<string>('');
  const [pullError, setPullError] = useState<string | null>(null);

  // Copy success indicator
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [chatSuccessId, setChatSuccessId] = useState<string | null>(null);

  // Troubleshooting accordion states
  const [accordionOpen, setAccordionOpen] = useState<Record<string, boolean>>({
    cors: false,
    hardware: false,
    mac: false,
    win: false,
  });

  // Query Ollama local API tags for status and list of installed models
  const checkLocalOllama = useCallback(async () => {
    setIsCheckingStatus(true);
    try {
      const result = await aiService.checkOllama();
      setIsOllamaOnline(result.status);
      setInstalledModels(result.models);
    } catch (err) {
      console.warn('Ollama response error during check:', err);
      setIsOllamaOnline(false);
      setInstalledModels([]);
    } finally {
      setIsCheckingStatus(false);
    }
  }, []);

  // Initialize status check and endpoint
  useEffect(() => {
    const savedEndpoint = aiService.getCustomEndpoint('ollama') || 'http://localhost:11434';
    setCustomEndpoint(savedEndpoint);
    setHardwareInfo(aiService.getHardwareRecommendation());
    checkLocalOllama();
  }, [checkLocalOllama]);

  // Handle setting a custom endpoint and re-checking Ollama status
  const handleEndpointChange = (endpointVal: string) => {
    setCustomEndpoint(endpointVal);
    aiService.setCustomEndpoint('ollama', endpointVal);
    checkLocalOllama();
  };

  // Perform model pull using stream
  const pullModel = async (modelId: string) => {
    if (activePullId) return; // Prevent concurrent pulls
    setActivePullId(modelId);
    setPullProgress(0);
    setPullStatusMsg('Connecting to Ollama registry...');
    setPullError(null);

    try {
      await aiService.pullOllamaModel(modelId, (status, progress) => {
        setPullStatusMsg(status);
        setPullProgress(progress);
      });
      
      // Pull completed successfully, refresh installed list
      await checkLocalOllama();
      setPullProgress(100);
      setPullStatusMsg('Installation completed successfully!');
      setTimeout(() => {
        setActivePullId(null);
        setPullProgress(0);
        setPullStatusMsg('');
      }, 3000);
    } catch (err: any) {
      console.error('Failed pulling model:', err);
      setPullError(err.message || 'Connection lost. Check if CORS is enabled or model exists.');
      setTimeout(() => {
        setActivePullId(null);
        setPullError(null);
      }, 6000);
    }
  };

  // Select model for direct use in the Chat tab
  const selectModelForChat = (modelId: string) => {
    aiService.setSelectedOllamaModel(modelId);
    setChatSuccessId(modelId);
    setTimeout(() => setChatSuccessId(null), 2500);
  };

  // Copy standard terminal pull/run commands
  const copyTerminalCommand = (modelId: string) => {
    const cmd = `ollama run ${modelId}`;
    handleTextCopy(cmd, () => {
      setCopiedId(modelId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Filter logic
  const filteredModels = MODELS_CATALOG.filter(model => {
    const matchesSearch = 
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    if (selectedCategory === 'all') return matchesSearch;
    if (selectedCategory === 'low-spec') return matchesSearch && model.categories.includes('low-spec');
    if (selectedCategory === 'balanced') return matchesSearch && model.categories.includes('balanced');
    if (selectedCategory === 'high-perf') return matchesSearch && model.categories.includes('high-perf');
    if (selectedCategory === 'coding') return matchesSearch && model.categories.includes('coding');
    if (selectedCategory === 'vision') return matchesSearch && model.categories.includes('vision');
    return matchesSearch;
  });

  const toggleAccordion = (key: string) => {
    setAccordionOpen(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 text-left">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-850 pb-5">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Layers className="text-teal-400" />
            <span>Local Domo Model Library</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse offline-compatible LLM profiles, see recommended hardware requirements, and pull models directly.
          </p>
        </div>

        {/* Global Connection HUD */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1 text-[11px] shrink-0">
            <span className="text-slate-400 text-right font-medium">Ollama Service Port:</span>
            <input 
              type="text" 
              value={customEndpoint} 
              onChange={(e) => handleEndpointChange(e.target.value)}
              className="bg-slate-950 border border-slate-850 text-slate-300 font-mono rounded px-2.5 py-1 text-[10px] text-right focus:outline-none focus:border-teal-500 w-44" 
            />
          </div>
          <button 
            onClick={checkLocalOllama} 
            disabled={isCheckingStatus}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
              isCheckingStatus 
                ? 'bg-slate-900 border-slate-850 text-slate-400 cursor-not-allowed'
                : isOllamaOnline 
                  ? 'bg-teal-950/30 border-teal-900/40 text-teal-400 hover:bg-teal-900/10'
                  : 'bg-rose-950/30 border-rose-900/40 text-rose-400 hover:bg-rose-900/10'
            }`}
          >
            {isCheckingStatus ? (
              <Loader2 size={13} className="animate-spin text-teal-400" />
            ) : isOllamaOnline ? (
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            )}
            <span>
              {isCheckingStatus ? 'Checking...' : isOllamaOnline ? 'Ollama Online' : 'Ollama Offline'}
            </span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
            activeTab === 'catalog'
              ? 'bg-teal-950/20 text-teal-400 border-teal-900/40 shadow-sm'
              : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200'
          }`}
        >
          📚 Model Catalog
        </button>
        <button
          onClick={() => setActiveTab('troubleshoot')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
            activeTab === 'troubleshoot'
              ? 'bg-teal-950/20 text-teal-400 border-teal-900/40 shadow-sm'
              : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200'
          }`}
        >
          🔧 Connection & CORS Setup Guide
        </button>
      </div>

      {activeTab === 'catalog' ? (
        <>
          {/* Hardware Advisor HUD */}
          {hardwareInfo && (
            <div className="glass-card p-5 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2 space-y-2">
                <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                  <Cpu size={16} className="animate-pulse" />
                  <span>Domo Hardware Diagnostics</span>
                </div>
                <p className="text-[11px] text-slate-350 leading-relaxed">
                  We scanned your system benchmarks: We estimated your RAM size at{' '}
                  <strong className="text-slate-100 font-mono">{hardwareInfo.ram}</strong> running with{' '}
                  <strong className="text-slate-100 font-mono">{hardwareInfo.cores} CPU cores</strong>.{' '}
                  {hardwareInfo.hasWebGPU ? (
                    <span className="text-green-400 font-medium">WebGPU context acceleration detected.</span>
                  ) : (
                    <span className="text-slate-500">Accelerated WebGPU is disabled.</span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-[10px] font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-850 text-slate-400">
                    Target hardware level: <strong className="text-teal-400 font-semibold">{hardwareInfo.tier.toUpperCase()}</strong>
                  </span>
                  <span className="text-[10px] font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-850 text-slate-400">
                    Recommended Model: <strong className="text-teal-400 font-semibold">{hardwareInfo.recommendedModel}</strong>
                  </span>
                </div>
              </div>
              <div className="bg-slate-950/60 border border-slate-850/80 p-3.5 rounded-xl space-y-1 text-[11px]">
                <div className="flex items-center gap-1.5 font-bold text-slate-300">
                  <Info size={12} className="text-amber-400" />
                  <span>Domo Recommendation Tip</span>
                </div>
                <p className="text-slate-450 text-[10px] italic leading-snug">
                  "{hardwareInfo.explanation}"
                </p>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Category tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none flex-wrap">
              {[
                { id: 'all', label: 'All Models' },
                { id: 'low-spec', label: 'Low Spec (≤3B)' },
                { id: 'balanced', label: 'Balanced (3B-7B)' },
                { id: 'high-perf', label: 'High Performance (≥7B)' },
                { id: 'coding', label: 'Coding Specialized' },
                { id: 'vision', label: 'Vision / Multimodal' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                    selectedCategory === tab.id
                      ? 'bg-teal-950/40 text-teal-400 border-teal-900/50 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-850 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search models, tags, creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 focus:border-teal-500 focus:outline-none rounded-xl pl-9.5 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Model Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredModels.length > 0 ? (
              filteredModels.map(model => {
                const isInstalled = installedModels.some(m => m.startsWith(model.id) || model.id.startsWith(m.split(':')[0]));
                const isRecommendation = hardwareInfo?.recommendedModel?.startsWith(model.id.split(':')[0]);
                const isModelPulling = activePullId === model.id;

                return (
                  <div 
                    key={model.id} 
                    className={`glass-card p-5 flex flex-col gap-4 relative group transition-all ${
                      isRecommendation ? 'border-teal-900/60 bg-gradient-to-br from-slate-900 to-teal-950/10' : 'hover:border-slate-800'
                    }`}
                  >
                    {/* Recommendation Flag Badge */}
                    {isRecommendation && (
                      <span className="absolute -top-2 right-4 text-[9px] font-bold font-mono bg-teal-500 text-slate-950 px-2 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
                        <Zap size={10} fill="currentColor" /> Recommended for You
                      </span>
                    )}

                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-1.5">
                          {model.name}
                          {isInstalled && (
                            <span className="text-[9px] bg-green-950/60 text-green-400 border border-green-900/50 px-1.5 py-0.2 rounded font-mono font-medium">
                              Installed
                            </span>
                          )}
                        </h3>
                        <span className="text-[10px] text-slate-450 font-mono flex items-center gap-2">
                          <span>Params: <strong className="text-slate-350">{model.parameters}</strong></span>
                          <span>•</span>
                          <span>Download: <strong className="text-slate-350">{model.size}</strong></span>
                          <span>•</span>
                          <span>RAM: <strong className="text-slate-350">{model.ramRequired}</strong></span>
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[11px] text-slate-350 leading-relaxed font-sans min-h-[44px]">
                      {model.description}
                    </p>

                    {/* Purpose Details */}
                    <div className="bg-slate-950/40 rounded-lg p-2.5 border border-slate-850/50 space-y-1">
                      <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">Best Used For</span>
                      <p className="text-[10px] text-slate-350 leading-relaxed italic">
                        "{model.purpose}"
                      </p>
                    </div>

                    {/* Specs / Features Grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-slate-850/60 pt-3 text-[10px] text-slate-400">
                      <div className="flex justify-between border-b border-slate-900 pb-1">
                        <span className="flex items-center gap-1"><Layers size={11} className="text-slate-500" /> Context Window</span>
                        <span className="font-mono text-slate-300 font-semibold">{model.features.contextWindow}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-900 pb-1">
                        <span className="flex items-center gap-1"><Globe size={11} className="text-slate-500" /> Multilingual</span>
                        <span className={`font-semibold ${model.features.multilingual ? 'text-teal-400' : 'text-slate-500'}`}>
                          {model.features.multilingual ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-900 pb-1">
                        <span className="flex items-center gap-1"><Eye size={11} className="text-slate-500" /> Vision (Images)</span>
                        <span className={`font-semibold ${model.features.vision ? 'text-teal-400' : 'text-slate-500'}`}>
                          {model.features.vision ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-900 pb-1">
                        <span className="flex items-center gap-1"><Flame size={11} className="text-slate-500" /> Coding Support</span>
                        <span className={`font-semibold font-mono ${
                          model.features.coding === 'Excellent' ? 'text-teal-400 font-bold' : 
                          model.features.coding === 'Good' ? 'text-slate-300' : 'text-slate-500'
                        }`}>
                          {model.features.coding}
                        </span>
                      </div>
                    </div>

                    {/* Tags List */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {model.tags.map(t => (
                        <span key={t} className="text-[9px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-850 font-medium">
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Actions Panel */}
                    <div className="mt-auto border-t border-slate-850/60 pt-3.5 flex items-center gap-2">
                      {isModelPulling ? (
                        /* Pull Progress Bar */
                        <div className="flex-1 space-y-2 bg-slate-950 p-2.5 rounded-xl border border-slate-850 animate-pulse">
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-teal-400 flex items-center gap-1">
                              <Loader2 size={11} className="animate-spin text-teal-400" />
                              <span className="truncate max-w-[160px]">{pullStatusMsg}</span>
                            </span>
                            <span className="text-slate-300 font-bold">{pullProgress}%</span>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-teal-500 h-1.5 rounded-full transition-all duration-300" 
                              style={{ width: `${pullProgress}%` }}
                            />
                          </div>
                        </div>
                      ) : pullError && activePullId === model.id ? (
                        <div className="flex-1 bg-rose-950/20 border border-rose-900/30 text-rose-400 p-2.5 rounded-xl text-[10px] flex items-start gap-1.5 leading-snug">
                          <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                          <span>{pullError}</span>
                        </div>
                      ) : (
                        <>
                          {isOllamaOnline ? (
                            isInstalled ? (
                              <button
                                onClick={() => selectModelForChat(model.id)}
                                className={`flex-1 flex items-center justify-center gap-1 text-xs font-bold py-2 px-3 rounded-xl border transition-all ${
                                  chatSuccessId === model.id
                                    ? 'bg-green-950 border-green-900 text-green-400'
                                    : 'bg-teal-950/30 border-teal-900/40 text-teal-400 hover:bg-teal-900/15'
                                }`}
                              >
                                {chatSuccessId === model.id ? (
                                  <>
                                    <CheckCircle size={13} className="text-green-400" />
                                    <span>Selected!</span>
                                  </>
                                ) : (
                                  <>
                                    <Play size={13} className="text-teal-400" />
                                    <span>Set as Active Chat Model</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <button
                                onClick={() => pullModel(model.id)}
                                disabled={!!activePullId}
                                className="flex-1 flex items-center justify-center gap-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-750 text-slate-200 font-bold py-2 px-3 rounded-xl text-xs transition-all disabled:opacity-40 disabled:pointer-events-none"
                              >
                                <Download size={13} className="text-teal-400" />
                                <span>Download to Ollama</span>
                              </button>
                            )
                          ) : (
                            /* Offline Mode Command Helper */
                            <div className="flex-1 flex flex-col gap-1">
                              <span className="text-[9px] text-slate-500 font-semibold font-mono">CLI Alternative Command</span>
                              <div className="flex items-center justify-between bg-slate-950 border border-slate-850/80 rounded-lg px-2.5 py-1 text-[10px] font-mono text-slate-350">
                                <span>ollama run {model.id}</span>
                                <button 
                                  onClick={() => copyTerminalCommand(model.id)}
                                  className="text-slate-500 hover:text-teal-400 transition-colors p-0.5"
                                  title="Copy command to clipboard"
                                >
                                  {copiedId === model.id ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center text-slate-500 text-xs">
                No models match your search or filter requirements.
              </div>
            )}
          </div>
        </>
      ) : (
        /* Troubleshooting Guide Section */
        <div className="glass-card p-6 space-y-6">
          <div className="space-y-2 border-b border-slate-850 pb-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Settings size={16} className="text-teal-400" />
              <span>Ollama Connectivity & CORS Origin Help</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Because Domo is a secure, offline application running in your browser sandbox, it communicates directly with the Ollama server on your machine via HTTP fetch requests. By default, browsers block these cross-origin requests unless Ollama is started with CORS headers allowed.
            </p>
          </div>

          <div className="space-y-4">
            {/* Accordion 1: CORS Config */}
            <div className="border border-slate-850 rounded-xl overflow-hidden">
              <button 
                onClick={() => toggleAccordion('cors')}
                className="w-full px-4 py-3 bg-slate-900/40 hover:bg-slate-900 flex justify-between items-center text-left text-xs font-semibold text-slate-200 transition-colors"
              >
                <span>How to fix connection errors (Allowing CORS Origins)</span>
                {accordionOpen.cors ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
              </button>
              {accordionOpen.cors && (
                <div className="p-4 bg-slate-950/20 border-t border-slate-850 text-xs text-slate-350 space-y-2.5 leading-relaxed">
                  <p>
                    If the connection status button shows <span className="text-rose-400 font-bold">Ollama Offline</span> despite Ollama running in your taskbar, it is likely due to the browser blocking the connection because of missing CORS origins headers.
                  </p>
                  <p>
                    To resolve this, you need to configure the environment variable <code className="bg-slate-950 border border-slate-800 text-slate-200 px-1 py-0.5 rounded font-mono text-[10px]">OLLAMA_ORIGINS="*"</code> and restart your Ollama service.
                  </p>
                </div>
              )}
            </div>

            {/* Accordion 2: macOS Setup */}
            <div className="border border-slate-850 rounded-xl overflow-hidden">
              <button 
                onClick={() => toggleAccordion('mac')}
                className="w-full px-4 py-3 bg-slate-900/40 hover:bg-slate-900 flex justify-between items-center text-left text-xs font-semibold text-slate-200 transition-colors"
              >
                <span>Configuration Instructions for macOS</span>
                {accordionOpen.mac ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
              </button>
              {accordionOpen.mac && (
                <div className="p-4 bg-slate-950/20 border-t border-slate-850 text-xs text-slate-350 space-y-3.5 leading-relaxed">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-200 text-[11px]">Option A: Terminal Execution (Temporary)</span>
                    <p className="text-[10px] text-slate-400">Close the Ollama application from your status bar, then open your Terminal and run:</p>
                    <div className="bg-slate-950 border border-slate-850 rounded-lg p-2.5 font-mono text-[10px] text-teal-300 relative group flex justify-between items-center">
                      <span>OLLAMA_ORIGINS="*" ollama serve</span>
                      <button 
                        onClick={() => handleTextCopy('OLLAMA_ORIGINS="*" ollama serve', () => {})}
                        className="text-slate-500 hover:text-teal-400 transition-colors"
                      >
                        <Copy size={11} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 pt-1.5">
                    <span className="font-bold text-slate-200 text-[11px]">Option B: Persistent Launchctl Service</span>
                    <p className="text-[10px] text-slate-400">To make this change permanent so it works when starting Ollama normally, execute this command in Terminal:</p>
                    <div className="bg-slate-950 border border-slate-850 rounded-lg p-2.5 font-mono text-[10px] text-teal-300 relative group flex justify-between items-center">
                      <span className="truncate pr-4">launchctl setenv OLLAMA_ORIGINS "*"</span>
                      <button 
                        onClick={() => handleTextCopy('launchctl setenv OLLAMA_ORIGINS "*"', () => {})}
                        className="text-slate-500 hover:text-teal-400 transition-colors shrink-0"
                      >
                        <Copy size={11} />
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 italic mt-1">Note: After running this command, fully quit and restart the Ollama desktop app.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 3: Windows Setup */}
            <div className="border border-slate-850 rounded-xl overflow-hidden">
              <button 
                onClick={() => toggleAccordion('win')}
                className="w-full px-4 py-3 bg-slate-900/40 hover:bg-slate-900 flex justify-between items-center text-left text-xs font-semibold text-slate-200 transition-colors"
              >
                <span>Configuration Instructions for Windows</span>
                {accordionOpen.win ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
              </button>
              {accordionOpen.win && (
                <div className="p-4 bg-slate-950/20 border-t border-slate-850 text-xs text-slate-350 space-y-3.5 leading-relaxed">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-200 text-[11px]">Step-by-step Environment Setup:</span>
                    <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400">
                      <li>Quit the <strong className="text-slate-300">Ollama</strong> app by clicking its tray icon in the taskbar and choosing Quit.</li>
                      <li>Open the Start Menu, search for <strong className="text-slate-300">"Environment Variables"</strong> and open it.</li>
                      <li>Click on <strong className="text-slate-300">"Environment Variables..."</strong> (bottom button).</li>
                      <li>Under "User variables" (or "System variables" for all users), click <strong className="text-slate-300">"New..."</strong>.</li>
                      <li>Set Variable Name to: <code className="bg-slate-950 px-1 py-0.2 rounded font-mono text-[10px] text-slate-200">OLLAMA_ORIGINS</code></li>
                      <li>Set Variable Value to: <code className="bg-slate-950 px-1 py-0.2 rounded font-mono text-[10px] text-slate-200">*</code></li>
                      <li>Click OK on all windows to apply the changes.</li>
                      <li>Relaunch <strong className="text-slate-300">Ollama</strong> from your desktop or start menu.</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 4: RAM Specifications */}
            <div className="border border-slate-850 rounded-xl overflow-hidden">
              <button 
                onClick={() => toggleAccordion('hardware')}
                className="w-full px-4 py-3 bg-slate-900/40 hover:bg-slate-900 flex justify-between items-center text-left text-xs font-semibold text-slate-200 transition-colors"
              >
                <span>Understanding Model Sizes & System Memory (RAM)</span>
                {accordionOpen.hardware ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
              </button>
              {accordionOpen.hardware && (
                <div className="p-4 bg-slate-950/20 border-t border-slate-850 text-xs text-slate-350 space-y-2.5 leading-relaxed">
                  <p>
                    When choosing a model to run offline, the number of parameters determine how smart it is, but also how much system memory (RAM/VRAM) it occupies:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-400">
                    <li><strong className="text-slate-200 font-mono">0.5B - 2B parameters</strong>: Requires ~4GB RAM. Extremely fast, works easily on basic laptops.</li>
                    <li><strong className="text-slate-200 font-mono">3B - 4B parameters</strong>: Requires ~8GB RAM. Very usable on typical workstations and standard PCs.</li>
                    <li><strong className="text-slate-200 font-mono">7B - 9B parameters</strong>: Requires ~16GB RAM. Excellent logic accuracy, but can slow down without a GPU.</li>
                    <li><strong className="text-slate-200 font-mono">13B+ parameters</strong>: Requires 32GB+ RAM. Intended for powerful workstation and server hardware setups.</li>
                  </ul>
                  <p className="text-slate-450 italic text-[10px]">
                    Tip: If you have a dedicated graphics card (NVIDIA, Apple Silicon M-series, or AMD with ROCm), Ollama automatically loads the model parameters onto your graphics card VRAM, accelerating response rates.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
