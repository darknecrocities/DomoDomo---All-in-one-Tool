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
  const [activeTab, setActiveTab] = useState<'catalog' | 'diagnostics' | 'troubleshoot'>('catalog');
  
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

  // Copy/Success indicators
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

  // Evaluate dynamic model hardware compatibility
  const getModelCompatibility = (model: ModelInfo) => {
    if (!hardwareInfo) return { label: 'Unknown Spec', colorClass: 'bg-slate-900 border-slate-850 text-slate-450', details: 'Checking hardware configurations...' };

    // Extract numerical RAM size
    const ramMatch = hardwareInfo.ram.match(/\d+/);
    const systemRam = ramMatch ? parseInt(ramMatch[0]) : 8;

    // Check micro-models
    if (model.id === 'qwen2.5:0.5b' || model.id === 'qwen2.5:1.5b') {
      return { 
        label: 'Highly Compatible', 
        colorClass: 'bg-[#3C6B4D]/10 border-[#3C6B4D]/35 text-[#3C6B4D] font-bold', 
        details: 'Runs extremely fast offline. Negligible resource load.' 
      };
    }

    // Check vision multimodal model
    if (model.features.vision) {
      if (systemRam >= 16 && hardwareInfo.hasWebGPU) {
        return { 
          label: 'Fully Compatible', 
          colorClass: 'bg-[#3C6B4D]/15 border-[#3C6B4D]/40 text-[#3C6B4D] font-bold', 
          details: 'Vision layers are accelerated on WebGPU context.' 
        };
      } else if (systemRam >= 12) {
        return { 
          label: 'Compatible (Slow CPU)', 
          colorClass: 'bg-amber-950/20 border-amber-900/30 text-amber-400', 
          details: 'Model runs, but image analysis is slow without GPU context.' 
        };
      } else {
        return { 
          label: 'Memory Warning (Lag Risk)', 
          colorClass: 'bg-rose-950/20 border-rose-900/30 text-rose-400', 
          details: 'Vision model requires at least 16GB RAM for optimal usage.' 
        };
      }
    }

    // Determine target memory requirement based on parameter size
    const isHeavy = model.id.includes('7b') || model.id.includes('9b') || model.id.includes('6.7b');
    const isMedium = model.id.includes('3b') || model.id.includes('3.8b') || model.id.includes('2b');
    
    const requiredRam = isHeavy ? 16 : (isMedium ? 8 : 4);
    
    if (systemRam >= requiredRam) {
      if (isHeavy && !hardwareInfo.hasWebGPU) {
        return { 
          label: 'Compatible (Slow)', 
          colorClass: 'bg-amber-950/20 border-amber-900/30 text-amber-400', 
          details: 'Has enough RAM, but CPU-only inference speeds will be moderate.' 
        };
      }
      return { 
        label: 'Fully Compatible', 
        colorClass: 'bg-[#3C6B4D]/10 border-[#3C6B4D]/35 text-[#3C6B4D] font-bold', 
        details: `Meets system requirements. Estimated run speeds are ${model.features.speed}.` 
      };
    } else {
      return { 
        label: 'Insufficient RAM (Heavy)', 
        colorClass: 'bg-rose-950/20 border-rose-900/30 text-rose-400', 
        details: `Requires ${requiredRam}GB RAM. System has ${systemRam}GB RAM.` 
      };
    }
  };

  // Compile specific diagnostic matrix tiers
  const getMatrixTiers = () => {
    if (!hardwareInfo) return [];

    const ramMatch = hardwareInfo.ram.match(/\d+/);
    const systemRam = ramMatch ? parseInt(ramMatch[0]) : 8;

    return [
      {
        tier: 'Ultra-Lightweight (≤ 1.5B)',
        ram: '2GB - 4GB RAM',
        cores: '2+ CPU Threads',
        status: 'Highly Compatible (Very Fast)',
        compatible: true,
        style: 'bg-[#3C6B4D]/10 border-[#3C6B4D]/35 text-[#3C6B4D]'
      },
      {
        tier: 'Balanced Compact (2B - 4B)',
        ram: '8GB RAM',
        cores: '4+ CPU Threads',
        status: systemRam >= 8 ? 'Fully Compatible' : 'Resource Warning (Low RAM)',
        compatible: systemRam >= 8,
        style: systemRam >= 8 ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/30 text-[#3C6B4D]' : 'bg-amber-950/20 border-amber-900/30 text-amber-400'
      },
      {
        tier: 'Heavy Reasoning (7B - 9B)',
        ram: '16GB RAM',
        cores: '6+ CPU Threads',
        status: systemRam >= 16 ? 'Compatible (GPU recommended)' : (systemRam >= 8 ? 'Lag Risk (High CPU load)' : 'Not Recommended'),
        compatible: systemRam >= 16,
        warning: systemRam < 16 && systemRam >= 8,
        style: systemRam >= 16 
          ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/30 text-[#3C6B4D]' 
          : (systemRam >= 8 ? 'bg-amber-950/20 border-amber-900/30 text-amber-400' : 'bg-rose-950/20 border-rose-900/30 text-rose-400')
      },
      {
        tier: 'Vision Multimodal (7B + Vision)',
        ram: '16GB RAM + WebGPU',
        cores: '6+ Threads + GPU',
        status: (systemRam >= 16 && hardwareInfo.hasWebGPU) ? 'Fully Accelerated' : (systemRam >= 12 ? 'Compatible (Slow CPU)' : 'Not Recommended'),
        compatible: systemRam >= 16 && hardwareInfo.hasWebGPU,
        warning: systemRam >= 12 && !(systemRam >= 16 && hardwareInfo.hasWebGPU),
        style: (systemRam >= 16 && hardwareInfo.hasWebGPU)
          ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/30 text-[#3C6B4D]'
          : (systemRam >= 12 ? 'bg-amber-950/20 border-amber-900/30 text-amber-400' : 'bg-rose-950/20 border-rose-900/30 text-rose-400')
      }
    ];
  };

  const matrixTiers = getMatrixTiers();

  // Find the exact recommended model object from our catalog
  const getRecommendedModelObject = () => {
    if (!hardwareInfo) return null;
    const recId = hardwareInfo.recommendedModel;
    return MODELS_CATALOG.find(m => m.id === recId) || MODELS_CATALOG[1]; // fallback to Meta 3B
  };

  const recommendedModelObj = getRecommendedModelObject();
  const isRecInstalled = recommendedModelObj ? installedModels.some(m => m.startsWith(recommendedModelObj.id) || recommendedModelObj.id.startsWith(m.split(':')[0])) : false;
  const isRecPulling = recommendedModelObj ? activePullId === recommendedModelObj.id : false;

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 text-left">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2A2D30] pb-5">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-[#ECEBE9] flex items-center gap-2">
            <Layers className="text-[#3C6B4D]" />
            <span>Domo Model Library</span>
          </h2>
          <p className="text-xs text-[#A3A09B] mt-1 font-sans">
            Browse compatible offline LLM profiles, analyze system benchmarks, and pull models directly into your sandbox.
          </p>
        </div>

        {/* Global Connection HUD */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1 text-[11px] shrink-0 font-mono">
            <span className="text-[#A3A09B] text-right font-medium">Ollama Service Port:</span>
            <input 
              type="text" 
              value={customEndpoint} 
              onChange={(e) => handleEndpointChange(e.target.value)}
              className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] font-mono rounded px-2.5 py-1 text-[10px] text-right focus:outline-none focus:border-[#4E8E5E] w-44" 
            />
          </div>
          <button 
            onClick={checkLocalOllama} 
            disabled={isCheckingStatus}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
              isCheckingStatus 
                ? 'bg-[#111213] border-[#2A2D30] text-[#A3A09B] cursor-not-allowed'
                : isOllamaOnline 
                  ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/40 text-[#3C6B4D] hover:bg-[#3C6B4D]/15'
                  : 'bg-rose-950/20 border-rose-900/30 text-rose-450 hover:bg-rose-900/10'
            }`}
          >
            {isCheckingStatus ? (
              <Loader2 size={13} className="animate-spin text-[#3C6B4D]" />
            ) : isOllamaOnline ? (
              <span className="w-2 h-2 rounded-full bg-[#3C6B4D] animate-pulse" />
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
      <div className="flex gap-2 font-mono">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
            activeTab === 'catalog'
              ? 'bg-[#3C6B4D]/10 text-[#3C6B4D] border-[#3C6B4D]/40 shadow-sm'
              : 'bg-[#18191B] border-[#2A2D30] text-[#A3A09B] hover:text-[#ECEBE9]'
          }`}
        >
          📚 Model Catalog
        </button>
        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
            activeTab === 'diagnostics'
              ? 'bg-[#3C6B4D]/10 text-[#3C6B4D] border-[#3C6B4D]/40 shadow-sm'
              : 'bg-[#18191B] border-[#2A2D30] text-[#A3A09B] hover:text-[#ECEBE9]'
          }`}
        >
          💻 Hardware Diagnostics
        </button>
        <button
          onClick={() => setActiveTab('troubleshoot')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
            activeTab === 'troubleshoot'
              ? 'bg-[#3C6B4D]/10 text-[#3C6B4D] border-[#3C6B4D]/40 shadow-sm'
              : 'bg-[#18191B] border-[#2A2D30] text-[#A3A09B] hover:text-[#ECEBE9]'
          }`}
        >
          🔧 Connection & CORS Setup Guide
        </button>
      </div>

      {/* View switching based on active tab */}
      {activeTab === 'catalog' && (
        <>
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                    selectedCategory === tab.id
                      ? 'bg-[#3C6B4D]/10 text-[#3C6B4D] border-[#3C6B4D]/40 font-bold'
                      : 'bg-[#18191B] border-[#2A2D30] text-[#A3A09B] hover:text-[#ECEBE9]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A3A09B]" />
              <input
                type="text"
                placeholder="Search models, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111213] border border-[#2A2D30] focus:border-[#4E8E5E] focus:outline-none rounded-xl pl-9.5 pr-4 py-2 text-xs text-[#ECEBE9] placeholder:text-[#72706C] font-mono"
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
                const compatibility = getModelCompatibility(model);

                return (
                  <div 
                    key={model.id} 
                    className={`glass-card p-5 flex flex-col gap-4 relative group transition-all duration-300 ${
                      isRecommendation ? 'border-[#3C6B4D] bg-gradient-to-br from-[#18191B] to-[#111213]' : 'hover:border-[#5E5E5E]/40'
                    }`}
                  >
                    {/* Recommendation Flag Badge */}
                    {isRecommendation && (
                      <span className="absolute -top-2.5 right-4 text-[9px] font-bold font-mono bg-[#3C6B4D] text-[#111213] px-2 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
                        <Zap size={10} fill="currentColor" /> Brand Pick
                      </span>
                    )}

                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="font-extrabold text-sm text-[#ECEBE9] flex items-center gap-1.5 flex-wrap">
                          {model.name}
                          {isInstalled && (
                            <span className="text-[9px] bg-[#3C6B4D]/10 border border-[#3C6B4D]/30 px-1.5 py-0.2 rounded font-mono font-bold text-[#3C6B4D]">
                              Installed
                            </span>
                          )}
                        </h3>
                        <span className="text-[10px] text-[#A3A09B] font-mono flex items-center gap-2">
                          <span>Params: <strong className="text-[#ECEBE9]">{model.parameters}</strong></span>
                          <span>•</span>
                          <span>Download: <strong className="text-[#ECEBE9]">{model.size}</strong></span>
                          <span>•</span>
                          <span>RAM: <strong className="text-[#ECEBE9]">{model.ramRequired}</strong></span>
                        </span>
                      </div>
                    </div>

                    {/* Dynamic Compatibility Status Overlay */}
                    <div className="flex flex-col gap-1 border-b border-[#2A2D30]/60 pb-3">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-[#A3A09B] font-semibold">Local Performance:</span>
                        <span className={`px-2 py-0.5 rounded border ${compatibility.colorClass}`}>
                          {compatibility.label}
                        </span>
                      </div>
                      <p className="text-[9px] text-[#72706C] italic font-sans mt-0.5 leading-snug">
                        {compatibility.details}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-[11px] text-[#A3A09B] leading-relaxed font-sans min-h-[44px]">
                      {model.description}
                    </p>

                    {/* Purpose Details */}
                    <div className="bg-[#111213]/40 rounded-lg p-2.5 border border-[#2A2D30]/40 space-y-1">
                      <span className="text-[9px] font-bold font-mono text-[#A3A09B] uppercase tracking-wider block">Best Used For</span>
                      <p className="text-[10px] text-[#A3A09B] leading-relaxed italic font-sans">
                        "{model.purpose}"
                      </p>
                    </div>

                    {/* Specs / Features Grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-[#2A2D30]/40 pt-3 text-[10px] text-[#A3A09B] font-mono">
                      <div className="flex justify-between border-b border-[#2A2D30]/30 pb-1">
                        <span className="flex items-center gap-1"><Layers size={11} className="text-[#5E5E5E]" /> Context Window</span>
                        <span className="text-[#ECEBE9] font-bold">{model.features.contextWindow}</span>
                      </div>
                      <div className="flex justify-between border-b border-[#2A2D30]/30 pb-1">
                        <span className="flex items-center gap-1"><Globe size={11} className="text-[#5E5E5E]" /> Multilingual</span>
                        <span className={`font-bold ${model.features.multilingual ? 'text-[#3C6B4D]' : 'text-[#72706C]'}`}>
                          {model.features.multilingual ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-[#2A2D30]/30 pb-1">
                        <span className="flex items-center gap-1"><Eye size={11} className="text-[#5E5E5E]" /> Vision support</span>
                        <span className={`font-bold ${model.features.vision ? 'text-[#3C6B4D]' : 'text-[#72706C]'}`}>
                          {model.features.vision ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-[#2A2D30]/30 pb-1">
                        <span className="flex items-center gap-1"><Flame size={11} className="text-[#5E5E5E]" /> Code Assist</span>
                        <span className={`font-bold ${
                          model.features.coding === 'Excellent' ? 'text-[#3C6B4D]' : 
                          model.features.coding === 'Good' ? 'text-[#ECEBE9]' : 'text-[#72706C]'
                        }`}>
                          {model.features.coding}
                        </span>
                      </div>
                    </div>

                    {/* Tags List */}
                    <div className="flex flex-wrap gap-1.5 pt-1 font-mono">
                      {model.tags.map(t => (
                        <span key={t} className="text-[9px] bg-[#111213] text-[#A3A09B] px-2 py-0.5 rounded border border-[#2A2D30]">
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Actions Panel */}
                    <div className="mt-auto border-t border-[#2A2D30]/40 pt-3.5 flex items-center gap-2">
                      {isModelPulling ? (
                        /* Pull Progress Bar */
                        <div className="flex-1 space-y-2 bg-[#111213] p-2.5 rounded-xl border border-[#2A2D30] animate-pulse">
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-[#3C6B4D] flex items-center gap-1">
                              <Loader2 size={11} className="animate-spin text-[#3C6B4D]" />
                              <span className="truncate max-w-[160px]">{pullStatusMsg}</span>
                            </span>
                            <span className="text-[#ECEBE9] font-bold">{pullProgress}%</span>
                          </div>
                          <div className="w-full bg-[#18191B] rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-[#3C6B4D] h-1.5 rounded-full transition-all duration-300" 
                              style={{ width: `${pullProgress}%` }}
                            />
                          </div>
                        </div>
                      ) : pullError && activePullId === model.id ? (
                        <div className="flex-1 bg-rose-950/25 border border-rose-900/35 text-rose-450 p-2.5 rounded-xl text-[10px] flex items-start gap-1.5 leading-snug font-mono">
                          <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                          <span>{pullError}</span>
                        </div>
                      ) : (
                        <>
                          {isOllamaOnline ? (
                            isInstalled ? (
                              <button
                                onClick={() => selectModelForChat(model.id)}
                                className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 px-3 rounded-xl border transition-all duration-150 active:scale-[0.98] ${
                                  chatSuccessId === model.id
                                    ? 'bg-[#3C6B4D]/20 border-[#3C6B4D] text-[#3C6B4D]'
                                    : 'bg-[#18191B] hover:bg-[#3C6B4D]/10 border-[#3C6B4D]/30 text-[#3C6B4D]'
                                }`}
                              >
                                {chatSuccessId === model.id ? (
                                  <>
                                    <CheckCircle size={13} className="text-[#3C6B4D]" />
                                    <span>Selected for Chat</span>
                                  </>
                                ) : (
                                  <>
                                    <Play size={13} className="text-[#3C6B4D]" />
                                    <span>Set as Active Chat Model</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <button
                                onClick={() => pullModel(model.id)}
                                disabled={!!activePullId}
                                className="flex-1 flex items-center justify-center gap-1.5 bg-[#18191B] border border-[#2A2D30] hover:border-[#3C6B4D]/40 text-[#ECEBE9] font-semibold py-2 px-3 rounded-xl text-xs transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
                              >
                                <Download size={13} className="text-[#3C6B4D]" />
                                <span>Download to Ollama</span>
                              </button>
                            )
                          ) : (
                            /* Offline Mode Command Helper */
                            <div className="flex-1 flex flex-col gap-1">
                              <span className="text-[9px] text-[#72706C] font-bold font-mono">CLI Alternate Setup</span>
                              <div className="flex items-center justify-between bg-[#111213] border border-[#2A2D30]/80 rounded-lg px-2.5 py-1 text-[10px] font-mono text-[#A3A09B]">
                                <span>ollama run {model.id}</span>
                                <button 
                                  onClick={() => copyTerminalCommand(model.id)}
                                  className="text-[#A3A09B] hover:text-[#3C6B4D] transition-colors p-0.5"
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
              <div className="col-span-full py-12 text-center text-[#72706C] text-xs font-mono">
                No catalog models match your filters.
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'diagnostics' && (
        <div className="space-y-6">
          {/* Dynamic Hardware Advisor HUD */}
          {hardwareInfo && (
            <div className="glass-card p-5 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2 space-y-2">
                <div className="flex items-center gap-2 text-[#3C6B4D] font-bold text-sm font-mono">
                  <Cpu size={16} className="animate-pulse" />
                  <span>Domo System Hardware Diagnostics</span>
                </div>
                <p className="text-[11px] text-[#A3A09B] leading-relaxed font-sans">
                  We analyzed your local system benchmarks: Estimated system memory (RAM) is at{' '}
                  <strong className="text-[#ECEBE9] font-mono">{hardwareInfo.ram}</strong> running with{' '}
                  <strong className="text-[#ECEBE9] font-mono">{hardwareInfo.cores} CPU threads</strong>.{' '}
                  {hardwareInfo.hasWebGPU ? (
                    <span className="text-[#3C6B4D] font-bold">Accelerated WebGPU context detected.</span>
                  ) : (
                    <span className="text-[#72706C]">WebGPU hardware context is not detected.</span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2 pt-1 font-mono text-[10px]">
                  <span className="bg-[#111213] px-2.5 py-0.5 rounded border border-[#2A2D30] text-[#A3A09B]">
                    Hardware Level: <strong className="text-[#3C6B4D]">{hardwareInfo.tier.toUpperCase()}</strong>
                  </span>
                  <span className="bg-[#111213] px-2.5 py-0.5 rounded border border-[#2A2D30] text-[#A3A09B]">
                    Recommended Model: <strong className="text-[#3C6B4D]">{hardwareInfo.recommendedModel}</strong>
                  </span>
                </div>
              </div>
              <div className="bg-[#111213] border border-[#2A2D30] p-4 rounded-xl space-y-1.5 text-[11px]">
                <div className="flex items-center gap-1.5 font-bold text-[#ECEBE9] font-mono">
                  <Info size={12} className="text-[#3C6B4D]" />
                  <span>Advisor Recommendation</span>
                </div>
                <p className="text-[#A3A09B] text-[10px] italic leading-snug font-sans">
                  "{hardwareInfo.explanation}"
                </p>
              </div>
            </div>
          )}

          {/* Recommended Model Prominent Highlight Card */}
          {recommendedModelObj && (
            <div className="glass-card border-[#3C6B4D] bg-gradient-to-br from-[#18191B] to-[#111213] p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold font-mono bg-[#3C6B4D] text-[#111213] px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Recommended Model for your Machine
                  </span>
                  <h3 className="font-extrabold text-base text-[#ECEBE9] pt-1">
                    {recommendedModelObj.name} ({recommendedModelObj.parameters})
                  </h3>
                  <p className="text-xs text-[#A3A09B] leading-relaxed max-w-2xl font-sans pt-1">
                    {recommendedModelObj.description}
                  </p>
                </div>
                
                {/* Selection / Download trigger on recommendation */}
                <div className="shrink-0">
                  {isRecPulling ? (
                    <div className="flex items-center gap-2 bg-[#111213] border border-[#2A2D30] px-4 py-2 rounded-xl text-xs text-[#A3A09B] font-mono animate-pulse">
                      <Loader2 size={13} className="animate-spin text-[#3C6B4D]" />
                      <span>Pulling {pullProgress}%</span>
                    </div>
                  ) : isRecInstalled ? (
                    <button
                      onClick={() => selectModelForChat(recommendedModelObj.id)}
                      className={`flex items-center gap-1.5 text-xs font-bold py-2.5 px-4 rounded-xl border transition-all duration-150 active:scale-[0.98] font-mono ${
                        chatSuccessId === recommendedModelObj.id
                          ? 'bg-[#3C6B4D]/20 border-[#3C6B4D] text-[#3C6B4D]'
                          : 'bg-[#3C6B4D] border-[#3C6B4D] text-[#111213] hover:opacity-90'
                      }`}
                    >
                      <Play size={13} />
                      <span>{chatSuccessId === recommendedModelObj.id ? 'Selected' : 'Use in Chat'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => pullModel(recommendedModelObj.id)}
                      disabled={!!activePullId}
                      className="btn-primary py-2.5 px-4 text-xs font-mono disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <Download size={13} />
                      <span>Pull Recommended</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Quick specs for recommendation */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-[#2A2D30]/60 text-[10px] text-[#A3A09B] font-mono">
                <div>Disk Space: <strong className="text-[#ECEBE9]">{recommendedModelObj.size}</strong></div>
                <div>Context Size: <strong className="text-[#ECEBE9]">{recommendedModelObj.features.contextWindow}</strong></div>
                <div>Coding: <strong className="text-[#ECEBE9]">{recommendedModelObj.features.coding}</strong></div>
                <div>Speed: <strong className="text-[#ECEBE9]">{recommendedModelObj.features.speed}</strong></div>
              </div>
            </div>
          )}

          {/* Hardware Compatibility Matrix Grid */}
          <div className="glass-card p-5 space-y-3">
            <div className="text-[11px] font-bold font-mono text-[#ECEBE9] uppercase tracking-wider">
              Hardware Compatibility Matrix
            </div>
            <p className="text-[11px] text-[#A3A09B] leading-relaxed font-sans">
              Compare standard offline model size parameters against typical system hardware profiles to choose the correct model:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
              {matrixTiers.map((tierData, idx) => (
                <div 
                  key={idx} 
                  className="bg-[#111213] border border-[#2A2D30] rounded-xl p-3.5 flex flex-col gap-2 relative overflow-hidden"
                >
                  <div className="font-extrabold text-[11px] text-[#ECEBE9] font-mono">
                    {tierData.tier}
                  </div>
                  <div className="space-y-0.5 text-[9px] text-[#A3A09B] font-mono">
                    <div>Memory: {tierData.ram}</div>
                    <div>CPU: {tierData.cores}</div>
                  </div>
                  <div className={`mt-auto text-[9px] font-mono font-bold px-2 py-1 rounded border text-center ${tierData.style}`}>
                    {tierData.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Catalog Compatibility Lookup Table */}
          <div className="glass-card p-5 space-y-3">
            <div className="text-[11px] font-bold font-mono text-[#ECEBE9] uppercase tracking-wider">
              Full Catalog Compatibility Checklist
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] font-mono text-[#A3A09B] border-collapse">
                <thead>
                  <tr className="border-b border-[#2A2D30] text-[#ECEBE9]">
                    <th className="py-2.5 pr-4">Model Name</th>
                    <th className="py-2.5 px-4">Parameters</th>
                    <th className="py-2.5 px-4">RAM Recommendation</th>
                    <th className="py-2.5 px-4">Compatibility Status</th>
                    <th className="py-2.5 pl-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2D30]/40">
                  {MODELS_CATALOG.map(model => {
                    const compatibility = getModelCompatibility(model);
                    const isInstalled = installedModels.some(m => m.startsWith(model.id) || model.id.startsWith(m.split(':')[0]));

                    return (
                      <tr key={model.id} className="hover:bg-[#18191B]/40 transition-colors">
                        <td className="py-3 pr-4 font-bold text-[#ECEBE9]">{model.name}</td>
                        <td className="py-3 px-4">{model.parameters} ({model.size})</td>
                        <td className="py-3 px-4">{model.ramRequired}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded border text-[9px] ${compatibility.colorClass}`}>
                            {compatibility.label}
                          </span>
                        </td>
                        <td className="py-3 pl-4 text-right">
                          {isInstalled ? (
                            <span className="text-[#3C6B4D] font-bold text-[10px]">Installed ✓</span>
                          ) : (
                            <button
                              onClick={() => {
                                pullModel(model.id);
                                setActiveTab('catalog');
                              }}
                              className="text-[#3C6B4D] hover:underline font-bold text-[10px]"
                            >
                              Download
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'troubleshoot' && (
        /* Troubleshooting Guide Section */
        <div className="glass-card p-6 space-y-6">
          <div className="space-y-2 border-b border-[#2A2D30] pb-4">
            <h3 className="text-sm font-bold text-[#ECEBE9] flex items-center gap-2 font-mono">
              <Settings size={16} className="text-[#3C6B4D]" />
              <span>Ollama Connectivity & CORS Origin Help</span>
            </h3>
            <p className="text-xs text-[#A3A09B] leading-relaxed font-sans">
              Because Domo is a secure, offline application running in your browser sandbox, it communicates directly with the Ollama server on your machine via HTTP fetch requests. By default, browsers block these cross-origin requests unless Ollama is started with CORS headers allowed.
            </p>
          </div>

          <div className="space-y-4">
            {/* Accordion 1: CORS Config */}
            <div className="border border-[#2A2D30] rounded-xl overflow-hidden">
              <button 
                onClick={() => toggleAccordion('cors')}
                className="w-full px-4 py-3 bg-[#111213] hover:bg-[#18191B] flex justify-between items-center text-left text-xs font-semibold text-[#ECEBE9] transition-colors font-mono"
              >
                <span>How to fix connection errors (Allowing CORS Origins)</span>
                {accordionOpen.cors ? <ChevronUp size={14} className="text-[#A3A09B]" /> : <ChevronDown size={14} className="text-[#A3A09B]" />}
              </button>
              {accordionOpen.cors && (
                <div className="p-4 bg-[#111213]/40 border-t border-[#2A2D30] text-xs text-[#A3A09B] space-y-2.5 leading-relaxed font-sans">
                  <p>
                    If the connection status button shows <span className="text-rose-400 font-bold">Ollama Offline</span> despite Ollama running in your taskbar, it is likely due to the browser blocking the connection because of missing CORS origins headers.
                  </p>
                  <p>
                    To resolve this, you need to configure the environment variable <code className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] px-1.5 py-0.5 rounded font-mono text-[10px]">OLLAMA_ORIGINS="*"</code> and restart your Ollama service.
                  </p>
                </div>
              )}
            </div>

            {/* Accordion 2: macOS Setup */}
            <div className="border border-[#2A2D30] rounded-xl overflow-hidden">
              <button 
                onClick={() => toggleAccordion('mac')}
                className="w-full px-4 py-3 bg-[#111213] hover:bg-[#18191B] flex justify-between items-center text-left text-xs font-semibold text-[#ECEBE9] transition-colors font-mono"
              >
                <span>Configuration Instructions for macOS</span>
                {accordionOpen.mac ? <ChevronUp size={14} className="text-[#A3A09B]" /> : <ChevronDown size={14} className="text-[#A3A09B]" />}
              </button>
              {accordionOpen.mac && (
                <div className="p-4 bg-[#111213]/40 border-t border-[#2A2D30] text-xs text-[#A3A09B] space-y-3.5 leading-relaxed font-sans">
                  <div className="space-y-1">
                    <span className="font-bold text-[#ECEBE9] text-[11px] font-mono">Option A: Terminal Execution (Temporary)</span>
                    <p className="text-[10px] text-[#72706C]">Close the Ollama application from your status bar, then open your Terminal and run:</p>
                    <div className="bg-[#111213] border border-[#2A2D30] rounded-lg p-2.5 font-mono text-[10px] text-[#3C6B4D] relative group flex justify-between items-center">
                      <span>OLLAMA_ORIGINS="*" ollama serve</span>
                      <button 
                        onClick={() => handleTextCopy('OLLAMA_ORIGINS="*" ollama serve', () => {})}
                        className="text-[#5E5E5E] hover:text-[#3C6B4D] transition-colors"
                      >
                        <Copy size={11} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 pt-1.5">
                    <span className="font-bold text-[#ECEBE9] text-[11px] font-mono">Option B: Persistent Launchctl Service</span>
                    <p className="text-[10px] text-[#72706C]">To make this change permanent so it works when starting Ollama normally, execute this command in Terminal:</p>
                    <div className="bg-[#111213] border border-[#2A2D30] rounded-lg p-2.5 font-mono text-[10px] text-[#3C6B4D] relative group flex justify-between items-center">
                      <span className="truncate pr-4">launchctl setenv OLLAMA_ORIGINS "*"</span>
                      <button 
                        onClick={() => handleTextCopy('launchctl setenv OLLAMA_ORIGINS "*"', () => {})}
                        className="text-[#5E5E5E] hover:text-[#3C6B4D] transition-colors shrink-0"
                      >
                        <Copy size={11} />
                      </button>
                    </div>
                    <p className="text-[10px] text-[#72706C] italic mt-1 font-sans">Note: After running this command, fully quit and restart the Ollama desktop app.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 3: Windows Setup */}
            <div className="border border-[#2A2D30] rounded-xl overflow-hidden">
              <button 
                onClick={() => toggleAccordion('win')}
                className="w-full px-4 py-3 bg-[#111213] hover:bg-[#18191B] flex justify-between items-center text-left text-xs font-semibold text-[#ECEBE9] transition-colors font-mono"
              >
                <span>Configuration Instructions for Windows</span>
                {accordionOpen.win ? <ChevronUp size={14} className="text-[#A3A09B]" /> : <ChevronDown size={14} className="text-[#A3A09B]" />}
              </button>
              {accordionOpen.win && (
                <div className="p-4 bg-[#111213]/40 border-t border-[#2A2D30] text-xs text-[#A3A09B] space-y-3.5 leading-relaxed font-sans">
                  <div className="space-y-1">
                    <span className="font-bold text-[#ECEBE9] text-[11px] font-mono">Step-by-step Environment Setup:</span>
                    <ol className="list-decimal list-inside space-y-1 text-[11px] text-[#A3A09B] font-sans">
                      <li>Quit the <strong className="text-[#ECEBE9]">Ollama</strong> app by clicking its tray icon in the taskbar and choosing Quit.</li>
                      <li>Open the Start Menu, search for <strong className="text-[#ECEBE9]">"Environment Variables"</strong> and open it.</li>
                      <li>Click on <strong className="text-[#ECEBE9]">"Environment Variables..."</strong> (bottom button).</li>
                      <li>Under "User variables", click <strong className="text-[#ECEBE9]">"New..."</strong>.</li>
                      <li>Set Variable Name to: <code className="bg-[#111213] px-1 py-0.2 rounded font-mono text-[10px] text-[#ECEBE9]">OLLAMA_ORIGINS</code></li>
                      <li>Set Variable Value to: <code className="bg-[#111213] px-1 py-0.2 rounded font-mono text-[10px] text-[#ECEBE9]">*</code></li>
                      <li>Click OK on all windows to apply the changes.</li>
                      <li>Relaunch <strong className="text-[#ECEBE9]">Ollama</strong> from your desktop or start menu.</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 4: RAM Specifications */}
            <div className="border border-[#2A2D30] rounded-xl overflow-hidden">
              <button 
                onClick={() => toggleAccordion('hardware')}
                className="w-full px-4 py-3 bg-[#111213] hover:bg-[#18191B] flex justify-between items-center text-left text-xs font-semibold text-[#ECEBE9] transition-colors font-mono"
              >
                <span>Understanding Model Sizes & System Memory (RAM)</span>
                {accordionOpen.hardware ? <ChevronUp size={14} className="text-[#A3A09B]" /> : <ChevronDown size={14} className="text-[#A3A09B]" />}
              </button>
              {accordionOpen.hardware && (
                <div className="p-4 bg-[#111213]/40 border-t border-[#2A2D30] text-xs text-[#A3A09B] space-y-2.5 leading-relaxed font-sans">
                  <p>
                    When choosing a model to run offline, the number of parameters determine how smart it is, but also how much system memory (RAM/VRAM) it occupies:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-[#A3A09B] font-mono text-[11px]">
                    <li><strong className="text-[#ECEBE9]">0.5B - 2B parameters</strong>: Requires ~4GB RAM. Extremely fast, works easily on basic laptops.</li>
                    <li><strong className="text-[#ECEBE9]">3B - 4B parameters</strong>: Requires ~8GB RAM. Very usable on typical workstations and standard PCs.</li>
                    <li><strong className="text-[#ECEBE9]">7B - 9B parameters</strong>: Requires ~16GB RAM. Excellent logic accuracy, but can slow down without a GPU.</li>
                    <li><strong className="text-[#ECEBE9]">13B+ parameters</strong>: Requires 32GB+ RAM. Intended for powerful workstation and server hardware setups.</li>
                  </ul>
                  <p className="text-[#72706C] italic text-[10px] font-sans">
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
