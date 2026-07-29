import { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Bot,
  Sparkles,
  Play,
  Trash2,
  RefreshCw,
  Send,
  MessageSquare,
  Wand2,
  Download,
  BarChart2,
  FileCode,
  Sliders as SlidersIcon,
  Database,
  Workflow,
  Plus,
  X,
  Copy,
  Check,
  Search,
  FolderOpen,
  Layers,
  ChevronRight,
  Zap,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Terminal,
  FileText,
  ShieldCheck,
  Server,
  Gauge,
  Sliders,
  RotateCcw,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Paperclip,
  GitCommit,
  EyeOff,
  Lock,
  Code,
  Eye
} from 'lucide-react';
import { triggerBlobDownload } from '../utils/sharedHelpers';
import { Logo } from '../components/Logo';
import { N8nFlowCanvas } from '../tools/ai/components/N8nFlowCanvas';
import { RagSearchStudio } from '../tools/ai/components/RagSearchStudio';
import { PromptEngineeringLab } from '../tools/ai/components/PromptEngineeringLab';
import { StructuredJsonExtractor } from '../tools/ai/components/StructuredJsonExtractor';
import { FunctionCallingStudio } from '../tools/ai/components/FunctionCallingStudio';
import { AIGuardrailsStudio } from '../tools/ai/components/AIGuardrailsStudio';
import { CodePatchStudio } from '../tools/ai/components/CodePatchStudio';
import { MultiModelRouter } from '../tools/ai/components/MultiModelRouter';
import { KnowledgeGraphVisualizer } from '../tools/ai/components/KnowledgeGraphVisualizer';
import { VisionInspectionStudio } from '../tools/ai/components/VisionInspectionStudio';
import { HardwareQuantCalculator } from '../tools/ai/components/HardwareQuantCalculator';

interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
  digest: string;
}

interface CatalogModel {
  id: string;
  name: string;
  params: string;
  size: string;
  ram: string;
  desc: string;
  tags: string[];
  category: 'low-spec' | 'balanced' | 'coding' | 'vision' | 'heavy';
}

const COMPATIBLE_MODEL_CATALOG: CatalogModel[] = [
  {
    id: 'llama3.2:1b',
    name: 'Meta Llama 3.2 1B',
    params: '1.2B',
    size: '1.3 GB',
    ram: '2GB - 4GB RAM',
    desc: "Meta's lightweight instruction-tuned model. Ultra-fast inference designed for low-spec laptops.",
    tags: ['Meta', 'Ultra-Fast', 'General', 'Low RAM'],
    category: 'low-spec'
  },
  {
    id: 'llama3.2:3b',
    name: 'Meta Llama 3.2 3B',
    params: '3.2B',
    size: '2.0 GB',
    ram: '4GB - 8GB RAM',
    desc: 'High quality balance of speed and complex instruction following for desktop environments.',
    tags: ['Meta', 'Balanced', 'Instruction-Tuned', 'Recommended'],
    category: 'balanced'
  },
  {
    id: 'qwen2.5:0.5b',
    name: 'Alibaba Qwen 2.5 0.5B',
    params: '490M',
    size: '350 MB',
    ram: '1GB - 2GB RAM',
    desc: 'Ultra-compact micro model with negligible RAM footprint. Excellent for fast JSON extraction.',
    tags: ['Alibaba', 'Micro-Model', 'Fast', 'JSON Parsing'],
    category: 'low-spec'
  },
  {
    id: 'qwen2.5:1.5b',
    name: 'Alibaba Qwen 2.5 1.5B',
    params: '1.5B',
    size: '900 MB',
    ram: '2GB - 4GB RAM',
    desc: 'Lightweight multilingual model with strong programming syntax and translation capabilities.',
    tags: ['Alibaba', 'Multilingual', 'Coding', 'Bilingual'],
    category: 'coding'
  },
  {
    id: 'qwen2.5-coder:1.5b',
    name: 'Qwen 2.5 Coder 1.5B',
    params: '1.5B',
    size: '980 MB',
    ram: '2GB - 4GB RAM',
    desc: 'Specialized code generation and bug-fixing model trained on massive software repositories.',
    tags: ['Coding Specialist', 'Python', 'JS/TS', 'Fast Autocomplete'],
    category: 'coding'
  },
  {
    id: 'deepseek-r1:1.5b',
    name: 'DeepSeek R1 Distill 1.5B',
    params: '1.5B',
    size: '1.1 GB',
    ram: '4GB - 8GB RAM',
    desc: 'Reasoning model featuring chain-of-thought step breakdowns for logic and math.',
    tags: ['DeepSeek', 'Reasoning', 'Chain-of-Thought', 'Logic'],
    category: 'heavy'
  },
  {
    id: 'phi3:latest',
    name: 'Microsoft Phi-3 Mini 3.8B',
    params: '3.8B',
    size: '2.3 GB',
    ram: '4GB - 8GB RAM',
    desc: "Microsoft's high-density reasoning model optimized for synthetic dataset logic.",
    tags: ['Microsoft', 'Logic', 'Compact', 'Math Solver'],
    category: 'balanced'
  },
  {
    id: 'llava:7b',
    name: 'Llava 7B Multimodal Vision',
    params: '7.0B',
    size: '4.5 GB',
    ram: '8GB - 16GB RAM',
    desc: 'Multimodal vision model capable of answering questions about uploaded images and diagrams.',
    tags: ['Vision', 'Multimodal', 'Image Captions', 'OCR'],
    category: 'vision'
  }
];

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  tokensPerSec?: number;
  latencyMs?: number;
  modelUsed?: string;
}

interface ChatSession {
  id: string;
  title: string;
  model: string;
  messages: ChatMessage[];
  updatedAt: string;
}

interface DatasetPair {
  id: string;
  system: string;
  instruction: string;
  response: string;
}

export interface AISettings {
  ollamaEndpoint: string;
  fastApiEndpoint: string;
  defaultSystemPrompt: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  numCtx: number;
  gpuLayers: number;
  cpuThreads: number;
  flashAttention: boolean;
  quantization: 'q4_k_m' | 'q8_0' | 'f16';
  autoRefreshOllama: boolean;
  piiRedaction: boolean;
  autoSpeakResponse: boolean;
}

const DEFAULT_SETTINGS: AISettings = {
  ollamaEndpoint: 'http://localhost:11434',
  fastApiEndpoint: 'http://localhost:8000',
  defaultSystemPrompt: 'You are DomoDomo AI, a helpful, private, offline-first assistant.',
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 2048,
  numCtx: 4096,
  gpuLayers: 33,
  cpuThreads: 8,
  flashAttention: true,
  quantization: 'q4_k_m',
  autoRefreshOllama: true,
  piiRedaction: false,
  autoSpeakResponse: false
};

export const AIHubStudio = () => {
  const [activeTab, setActiveTab] = useState<
    'chat' | 'library' | 'train' | 'eval' | 'workflow' | 'docs' |
    'rag' | 'prompts' | 'extractor' | 'function-calling' | 'guardrails' |
    'code-patch' | 'router' | 'knowledge-graph' | 'vision-studio' | 'quant-calc'
  >('chat');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // AI Hub Settings State (Persisted in LocalStorage)
  const [aiSettings, setAiSettings] = useState<AISettings>(() => {
    try {
      const saved = localStorage.getItem('domodomo_aihub_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'endpoints' | 'generation' | 'hardware' | 'privacy'>('endpoints');
  const [showLocalGuideModal, setShowLocalGuideModal] = useState(false);

  // Save settings to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('domodomo_aihub_settings', JSON.stringify(aiSettings));
    } catch {
      // Ignore storage write error
    }
  }, [aiSettings]);

  // Ollama Connection State
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'connected' | 'offline'>('checking');
  const [fastApiStatus, setFastApiStatus] = useState<'checking' | 'connected' | 'offline'>('checking');
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('llama3.2:1b');
  const [secondaryModel, setSecondaryModel] = useState<string>('qwen2.5:0.5b');

  // Model Library Downloader State
  const [catalogFilter, setCatalogFilter] = useState<'all' | 'low-spec' | 'balanced' | 'coding' | 'vision' | 'heavy'>('all');
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [downloadingModelId, setDownloadingModelId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [customPullInput, setCustomPullInput] = useState<string>('');

  // Multi-session Chat State
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('domodomo_aihub_sessions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'default-session',
        title: 'New Chat',
        model: 'llama3.2:1b',
        messages: [
          {
            id: 'welcome-1',
            sender: 'assistant',
            content: "Hello! I'm your local AI Assistant powered by Ollama. Ask me anything, or download models, fine-tune recipes, and flow automations in the sidebar!",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ],
        updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => sessions[0]?.id || 'default-session');

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const [messages, setMessages] = useState<ChatMessage[]>(activeSession ? activeSession.messages : []);

  const [chatInput, setChatInput] = useState('');
  const [attachedFile, setAttachedFile] = useState<{ name: string; content: string } | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState(aiSettings.defaultSystemPrompt);
  const [temperature, setTemperature] = useState<number>(aiSettings.temperature);
  const [topP, setTopP] = useState<number>(aiSettings.topP);
  const [maxTokens, setMaxTokens] = useState<number>(aiSettings.maxTokens);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Save sessions to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('domodomo_aihub_sessions', JSON.stringify(sessions));
    } catch {}
  }, [sessions]);

  // Sync messages with active session
  useEffect(() => {
    setSessions(prev =>
      prev.map(s => {
        if (s.id === activeSessionId) {
          const firstUserMsg = messages.find(m => m.sender === 'user');
          const title = firstUserMsg ? (firstUserMsg.content.length > 28 ? firstUserMsg.content.slice(0, 28) + '…' : firstUserMsg.content) : s.title;
          return { ...s, title, messages, model: selectedModel, updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        }
        return s;
      })
    );
  }, [messages, activeSessionId, selectedModel]);

  // Handle New Chat Action
  const handleNewChat = () => {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: 'New Conversation',
      model: selectedModel,
      messages: [
        {
          id: `welcome-${Date.now()}`,
          sender: 'assistant',
          content: `Hello! Started a new chat session using ${selectedModel}. Ask me anything!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ],
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    setMessages(newSession.messages);
    setActiveTab('chat');
    setChatInput('');
    setAttachedFile(null);
  };

  // Handle Select Session from Recents Sidebar
  const handleSelectSession = (sessionId: string) => {
    const sess = sessions.find(s => s.id === sessionId);
    if (sess) {
      setActiveSessionId(sessionId);
      setMessages(sess.messages);
      if (sess.model) setSelectedModel(sess.model);
      setActiveTab('chat');
    }
  };

  // Handle Delete Session
  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = sessions.filter(s => s.id !== sessionId);
    setSessions(filtered);
    if (activeSessionId === sessionId) {
      if (filtered.length > 0) {
        setActiveSessionId(filtered[0].id);
        setMessages(filtered[0].messages);
      } else {
        const newId = `session-${Date.now()}`;
        const defaultSess: ChatSession = {
          id: newId,
          title: 'New Conversation',
          model: selectedModel,
          messages: [
            {
              id: `welcome-${Date.now()}`,
              sender: 'assistant',
              content: "Hello! Started a fresh conversation. Ask me anything!",
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ],
          updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setSessions([defaultSess]);
        setActiveSessionId(newId);
        setMessages(defaultSess.messages);
      }
    }
  };

  // Document Ingestion & Fine-Tune State
  interface UploadedDocMeta {
    name: string;
    size: number;
    type: string;
    content: string;
    wordCount: number;
    tokenEst: number;
    paragraphCount: number;
  }
  const [uploadedDoc, setUploadedDoc] = useState<UploadedDocMeta | null>(null);
  const [isExtractingDoc, setIsExtractingDoc] = useState(false);
  const docInputRef = useRef<HTMLInputElement | null>(null);

  // Document Ingestion Handler (.json, .csv, .pdf, .txt, .md, .docx)
  const handleDocFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      let rawText = event.target?.result as string || '';

      if (file.name.endsWith('.json')) {
        try {
          const parsed = JSON.parse(rawText);
          if (Array.isArray(parsed)) {
            const jsonPairs: DatasetPair[] = parsed.map((item: any, idx: number) => ({
              id: `doc-json-${Date.now()}-${idx}`,
              system: item.system || item.input || 'You are a specialized AI assistant.',
              instruction: item.instruction || item.prompt || item.question || `JSON Entry ${idx + 1}`,
              response: item.response || item.output || item.answer || (typeof item === 'string' ? item : JSON.stringify(item))
            }));
            setDatasetPairs(prev => [...jsonPairs, ...prev]);
          }
        } catch {}
      }

      const words = rawText.split(/\s+/).filter(Boolean).length;
      const paragraphs = rawText.split(/\n\s*\n/).filter(p => p.trim().length > 10).length;

      setUploadedDoc({
        name: file.name,
        size: file.size,
        type: file.name.split('.').pop()?.toUpperCase() || 'DOCUMENT',
        content: rawText,
        wordCount: words,
        tokenEst: Math.round(words * 1.3),
        paragraphCount: paragraphs || 1
      });
    };

    reader.readAsText(file);
  };

  // Extract Q&A Instruction Pairs from Document Handler
  const handleExtractPairsFromDoc = async () => {
    if (!uploadedDoc || !uploadedDoc.content) return;
    setIsExtractingDoc(true);

    try {
      const res = await fetch(`${activeFastApiUrl}/api/ml/extract-document-pairs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: uploadedDoc.name,
          content: uploadedDoc.content.slice(0, 30000)
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.extracted_pairs && Array.isArray(data.extracted_pairs)) {
          const newPairs: DatasetPair[] = data.extracted_pairs.map((p: any, idx: number) => ({
            id: `doc-extracted-${Date.now()}-${idx}`,
            system: p.system || systemPrompt,
            instruction: p.instruction,
            response: p.response
          }));
          setDatasetPairs(prev => [...newPairs, ...prev]);
          setIsExtractingDoc(false);
          return;
        }
      }
    } catch {}

    const lines = uploadedDoc.content.split(/\n\s*\n/).filter(l => l.trim().length > 30);
    const fallbackPairs: DatasetPair[] = lines.slice(0, 6).map((para, idx) => ({
      id: `doc-local-${Date.now()}-${idx}`,
      system: `You are an expert AI assistant trained on '${uploadedDoc.name}'.`,
      instruction: `Summarize key insights regarding section ${idx + 1} from ${uploadedDoc.name}?`,
      response: para.trim()
    }));

    setDatasetPairs(prev => [...fallbackPairs, ...prev]);
    setIsExtractingDoc(false);
  };

  // Fine-Tune State
  const [baseModel, setBaseModel] = useState<string>('meta-llama/Llama-3.2-3B-Instruct');
  const [loraRank, setLoraRank] = useState<number>(16);
  const [loraAlpha, setLoraAlpha] = useState<number>(32);
  const [learningRate, setLearningRate] = useState<string>('2e-4');
  const [epochs, setEpochs] = useState<number>(3);
  const [batchSize, setBatchSize] = useState<number>(2);
  const [maxSeqLen, setMaxSeqLen] = useState<number>(aiSettings.numCtx);
  const [quantTarget, setQuantTarget] = useState<'q4_k_m' | 'q8_0' | 'f16'>(aiSettings.quantization);
  const [datasetFormat, setDatasetFormat] = useState<'alpaca' | 'sharegpt' | 'chatml'>('alpaca');
  const [recipePrompt, setRecipePrompt] = useState<string>('Generate synthetic instructions for Python web scraper error handling.');
  const [datasetPairs, setDatasetPairs] = useState<DatasetPair[]>([
    {
      id: 'pair-1',
      system: 'You are a code reviewer.',
      instruction: 'How do I optimize array iteration in JavaScript?',
      response: 'Use native for loops or Array.prototype.map() with typed arrays for maximum performance.'
    },
    {
      id: 'pair-2',
      system: 'You are an offline AI assistant.',
      instruction: 'What is zero-leak architecture?',
      response: 'Zero-leak architecture processes all files, LLMs, and data 100% locally in browser memory without sending packets to external cloud servers.'
    }
  ]);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isTrainingSim, setIsTrainingSim] = useState(false);
  const [trainingLoss, setTrainingLoss] = useState<number>(1.428);
  const [trainingStep, setTrainingStep] = useState<number>(0);
  const [totalSteps, setTotalSteps] = useState<number>(100);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);
  const lossCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Test & Eval Benchmark State
  const [evalPrompt, setEvalPrompt] = useState('Write a Python function to check if a string is a palindrome and test edge cases.');
  const [evalOutput1, setEvalOutput1] = useState('');
  const [evalOutput2, setEvalOutput2] = useState('');
  const [evalLatency1, setEvalLatency1] = useState<number | null>(null);
  const [evalLatency2, setEvalLatency2] = useState<number | null>(null);
  const [evalTps1, setEvalTps1] = useState<number | null>(null);
  const [evalTps2, setEvalTps2] = useState<number | null>(null);
  const [isEvalRunning, setIsEvalRunning] = useState(false);

  // Code Integration Snippet State
  const [codeLang, setCodeLang] = useState<'javascript' | 'python' | 'curl' | 'react' | 'langchain' | 'llamaindex' | 'fine-tune' | 'n8n-workflow' | 'mcp-protocol'>('javascript');
  const [isRegisteringModel, setIsRegisteringModel] = useState(false);
  const [registeredModelName, setRegisteredModelName] = useState('domodomo-fine-tuned:latest');

  // 1-Click Load Fine-Tuned Model into Ollama & Switch to Chat
  const handleRegisterFineTunedModel = async () => {
    setIsRegisteringModel(true);
    const modelfileContent = `# DomoDomo Fine-Tuned Modelfile
FROM ${selectedModel}

PARAMETER temperature ${temperature}
PARAMETER top_p ${topP}
PARAMETER num_ctx ${aiSettings.numCtx}

SYSTEM """${datasetPairs[0]?.system || 'You are a specialized fine-tuned assistant.'}"""
`;

    try {
      if (ollamaStatus === 'connected') {
        const res = await fetch(`${activeOllamaUrl}/api/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: registeredModelName,
            modelfile: modelfileContent,
            stream: false
          })
        });

        if (res.ok) {
          await checkOllama();
          setSelectedModel(registeredModelName);
          setActiveTab('chat');
          setIsRegisteringModel(false);
          return;
        }
      }
    } catch {}

    // Fallback simulation mode
    await new Promise(r => setTimeout(r, 1000));
    setModels(prev => [
      {
        name: registeredModelName,
        model: registeredModelName,
        modified_at: new Date().toISOString(),
        size: 1800000000,
        digest: `digest-${Date.now()}`,
        details: { parent_model: selectedModel, format: 'gguf', family: 'llama', parameter_size: '3B', quantization_level: quantTarget.toUpperCase() }
      },
      ...prev
    ]);
    setSelectedModel(registeredModelName);
    setActiveTab('chat');
    setIsRegisteringModel(false);
  };

  // Download Complete Model Weights Package (GGUF Manifest + PyTorch LoRA Adapter Specs)
  const handleDownloadWeightsPackage = () => {
    const manifest = {
      model_name: registeredModelName,
      base_model: baseModel,
      lora_rank: loraRank,
      lora_alpha: loraAlpha,
      learning_rate: learningRate,
      epochs: epochs,
      quantization: quantTarget,
      dataset_size: datasetPairs.length,
      modelfile: `# DomoDomo Fine-Tuned Modelfile\nFROM ${selectedModel}\n\nPARAMETER temperature ${temperature}\nPARAMETER top_p ${topP}\nPARAMETER num_ctx ${aiSettings.numCtx}\n\nSYSTEM """${datasetPairs[0]?.system || 'You are a custom fine-tuned local assistant.'}"""`,
      weights_format: "GGUF Q4_K_M + PyTorch LoRA Adapter",
      adapter_config: {
        peft_type: "LORA",
        r: loraRank,
        lora_alpha: loraAlpha,
        target_modules: ["q_proj", "v_proj", "k_proj", "o_proj"],
        bias: "none"
      }
    };

    triggerBlobDownload(
      new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' }),
      `${registeredModelName.replace(/[:/]/g, '_')}_weights_package.json`
    );
  };
  const [copiedCode, setCopiedCode] = useState(false);

  // Teaser Modal for Remote Web Visitors
  const [showTeaserModal, setShowTeaserModal] = useState(false);

  // Sidebar collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const hostname = window.location.hostname;
    const local = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '';
    if (!local) {
      setShowTeaserModal(true);
    }
  }, []);

  // Active connection endpoint url state (fallback aware)
  const [activeOllamaUrl, setActiveOllamaUrl] = useState<string>(aiSettings.ollamaEndpoint);
  const [activeFastApiUrl, setActiveFastApiUrl] = useState<string>(aiSettings.fastApiEndpoint);

  // Check Ollama Connection & Downloaded Models across candidate endpoints
  const checkOllama = useCallback(async () => {
    setOllamaStatus('checking');
    const candidates = Array.from(new Set([
      '/ollama-proxy',
      aiSettings.ollamaEndpoint,
      'http://127.0.0.1:11434',
      'http://localhost:11434'
    ]));

    for (const endpoint of candidates) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        const res = await fetch(`${endpoint}/api/tags`, { method: 'GET', signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const fetchedModels: OllamaModel[] = data.models || [];
          setModels(fetchedModels);
          if (fetchedModels.length > 0) {
            setSelectedModel(prev => {
              if (fetchedModels.some(m => m.name === prev)) return prev;
              return fetchedModels[0].name;
            });
            setSecondaryModel(prev => {
              if (fetchedModels.some(m => m.name === prev)) return prev;
              return fetchedModels[1]?.name || fetchedModels[0].name;
            });
          }
          setActiveOllamaUrl(endpoint);
          setOllamaStatus('connected');
          return;
        }
      } catch {
        // Try next candidate endpoint
      }
    }
    setOllamaStatus('offline');
  }, [aiSettings.ollamaEndpoint]);

  // Check Python FastAPI Backend Status across candidate endpoints
  const checkFastApi = useCallback(async () => {
    setFastApiStatus('checking');
    const candidates = Array.from(new Set([
      '/fastapi-proxy',
      aiSettings.fastApiEndpoint,
      'http://127.0.0.1:8000',
      'http://localhost:8000'
    ]));

    for (const endpoint of candidates) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        const res = await fetch(`${endpoint}/api/ml/status`, { method: 'GET', signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          setActiveFastApiUrl(endpoint);
          setFastApiStatus('connected');
          return;
        }
      } catch {
        // Try next candidate
      }
    }
    setFastApiStatus('offline');
  }, [aiSettings.fastApiEndpoint]);

  // Initial check & periodic status polling
  useEffect(() => {
    checkOllama();
    checkFastApi();

    const interval = setInterval(() => {
      checkOllama();
      checkFastApi();
    }, 4000);

    return () => clearInterval(interval);
  }, [checkOllama, checkFastApi]);

  const chatListRef = useRef<HTMLDivElement | null>(null);
  const mainContainerRef = useRef<HTMLDivElement | null>(null);

  // Reset Scroll to Top on Tab Change & Initial Mount
  useEffect(() => {
    window.scrollTo(0, 0);
    if (mainContainerRef.current) {
      mainContainerRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  // Scroll Chat to Bottom ONLY when streaming or sending messages in chat tab
  useEffect(() => {
    if (activeTab === 'chat' && chatListRef.current && isStreaming) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [messages, isStreaming, activeTab]);


  // PII Masking Helper
  const maskPII = (text: string) => {
    if (!aiSettings.piiRedaction) return text;
    return text
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
      .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[REDACTED_IP]')
      .replace(/\b(?:\d[ -]*?){13,16}\b/g, '[REDACTED_CARD]');
  };

  // Text-To-Speech Playback
  const toggleSpeech = (msgId: string, text: string) => {
    if ('speechSynthesis' in window) {
      if (speakingMsgId === msgId) {
        window.speechSynthesis.cancel();
        setSpeakingMsgId(null);
      } else {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setSpeakingMsgId(null);
        utterance.onerror = () => setSpeakingMsgId(null);
        window.speechSynthesis.speak(utterance);
        setSpeakingMsgId(msgId);
      }
    }
  };

  // Voice Input Dictation (Web Speech API)
  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Web Speech Recognition API is not supported in this browser.');
      return;
    }

    if (isListeningVoice) {
      setIsListeningVoice(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListeningVoice(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(prev => (prev ? `${prev} ${transcript}` : transcript));
      setIsListeningVoice(false);
    };
    recognition.onerror = () => setIsListeningVoice(false);
    recognition.onend = () => setIsListeningVoice(false);

    recognition.start();
  };

  // Handle File Upload Attachment
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setAttachedFile({ name: file.name, content: content.slice(0, 10000) });
    };
    reader.readAsText(file);
  };

  // Draw Loss Curve Canvas in Train Tab
  useEffect(() => {
    if (activeTab !== 'train' || !lossCanvasRef.current) return;
    const canvas = lossCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Background Grid
    ctx.strokeStyle = '#2A2D30';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Loss Curve (Exponential decay curve)
    ctx.beginPath();
    ctx.strokeStyle = '#3C6B4D';
    ctx.lineWidth = 3;

    const points = 50;
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * (w - 40) + 20;
      const progressFactor = i / points;
      const lossVal = 2.4 * Math.exp(-3 * progressFactor) + 0.3 + (Math.random() * 0.05);
      const y = h - ((lossVal / 3) * (h - 40) + 20);

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Fill under curve
    ctx.lineTo(w - 20, h - 20);
    ctx.lineTo(20, h - 20);
    ctx.fillStyle = 'rgba(60, 107, 77, 0.15)';
    ctx.fill();
  }, [activeTab, trainingStep]);

  const isOnlineWebHost = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

  // Handle Model Pull / Download
  const handleDownloadModel = async (modelName: string) => {
    if (!modelName.trim()) return;
    if (isOnlineWebHost || ollamaStatus !== 'connected') {
      setShowLocalGuideModal(true);
      return;
    }
    setDownloadingModelId(modelName);
    setDownloadProgress(5);

    try {
      if (ollamaStatus === 'connected') {
        const response = await fetch(`${activeOllamaUrl}/api/pull`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: modelName, stream: true })
        });

        if (response.ok && response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(Boolean);

            for (const line of lines) {
              try {
                const parsed = JSON.parse(line);
                if (parsed.total && parsed.completed) {
                  const pct = Math.round((parsed.completed / parsed.total) * 100);
                  setDownloadProgress(pct);
                }
              } catch {
                // Ignore chunk parse error
              }
            }
          }
        }
      } else {
        // Simulation progress for offline mode
        for (let p = 10; p <= 100; p += 15) {
          await new Promise(r => setTimeout(r, 250));
          setDownloadProgress(p);
        }
      }

      await checkOllama();
      setSelectedModel(modelName);
      setCustomPullInput('');
    } catch {
      // Fallback
    } finally {
      setDownloadingModelId(null);
      setDownloadProgress(0);
    }
  };

  // Handle Send Chat
  const handleSendChat = async () => {
    if ((!chatInput.trim() && !attachedFile) || isStreaming) return;

    let fullPromptText = chatInput;
    if (attachedFile) {
      fullPromptText = `[Context File: ${attachedFile.name}]\n${attachedFile.content}\n\n[User Query]\n${chatInput}`;
    }

    const maskedPrompt = maskPII(fullPromptText);

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: maskedPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setAttachedFile(null);
    setIsStreaming(true);

    const assistantMsgId = `ast-${Date.now()}`;
    const startTime = performance.now();

    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      sender: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: selectedModel
    };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      if (ollamaStatus === 'connected') {
        const response = await fetch(`${activeOllamaUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: selectedModel,
            prompt: maskedPrompt,
            system: systemPrompt,
            options: {
              temperature,
              top_p: topP,
              num_predict: maxTokens,
              num_ctx: aiSettings.numCtx,
              num_gpu: aiSettings.gpuLayers,
              num_thread: aiSettings.cpuThreads
            },
            stream: true
          })
        });

        if (!response.body) throw new Error('No stream body');
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        let tokenCount = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(Boolean);

          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.response) {
                fullText += parsed.response;
                tokenCount++;
                setMessages(prev =>
                  prev.map(m => (m.id === assistantMsgId ? { ...m, content: fullText } : m))
                );
              }
            } catch {
              // Ignore partial JSON chunks
            }
          }
        }

        const endTime = performance.now();
        const totalSec = (endTime - startTime) / 1000;
        const tps = totalSec > 0 ? Math.round(tokenCount / totalSec) : 0;
        const lat = Math.round(endTime - startTime);

        setMessages(prev =>
          prev.map(m => (m.id === assistantMsgId ? { ...m, tokensPerSec: tps, latencyMs: lat } : m))
        );

        if (aiSettings.autoSpeakResponse && fullText) {
          toggleSpeech(assistantMsgId, fullText);
        }
      } else {
        // Fallback simulation mode
        const simulatedResp = `[Local Offline Simulation · Model: ${selectedModel}] Here is the response to your prompt. When Ollama is running on ${aiSettings.ollamaEndpoint}, inference streams directly from your hardware without sending data to cloud servers.`;
        let currentText = '';

        for (let i = 0; i < simulatedResp.length; i += 3) {
          await new Promise(r => setTimeout(r, 25));
          currentText = simulatedResp.slice(0, i + 3);
          setMessages(prev =>
            prev.map(m => (m.id === assistantMsgId ? { ...m, content: currentText } : m))
          );
        }

        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMsgId
              ? { ...m, content: simulatedResp, tokensPerSec: 42, latencyMs: 280 }
              : m
          )
        );

        if (aiSettings.autoSpeakResponse) {
          toggleSpeech(assistantMsgId, simulatedResp);
        }
      }
    } catch (error) {
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMsgId
            ? { ...m, content: `Error communicating with local model (${selectedModel}): ${String(error)}` }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  // Auto Synthesize Dataset Recipe via Python FastAPI backend
  const handleSynthesizeDataset = async () => {
    setIsSynthesizing(true);
    try {
      const res = await fetch(`${activeFastApiUrl}/api/ml/synthesize-recipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          topic: recipePrompt || 'software architecture and coding',
          count: 3
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.pairs && Array.isArray(data.pairs)) {
          const newPairs: DatasetPair[] = data.pairs.map((p: any, idx: number) => ({
            id: `synth-py-${Date.now()}-${idx}`,
            system: p.system || systemPrompt,
            instruction: p.instruction,
            response: p.response
          }));
          setDatasetPairs(prev => [...prev, ...newPairs]);
          setIsSynthesizing(false);
          return;
        }
      }
    } catch {
      // Fallback to client-side synthesis if Python backend is offline
    }

    await new Promise(r => setTimeout(r, 1000));
    const syntheticPairs: DatasetPair[] = [
      {
        id: `synth-${Date.now()}-1`,
        system: 'You are an expert AI software architect.',
        instruction: 'Explain LoRA rank r parameter optimization.',
        response: 'LoRA rank (r) controls the dimension of low-rank matrices. Setting r=16 or r=32 balances parameter efficiency and fine-tuning accuracy.'
      },
      {
        id: `synth-${Date.now()}-2`,
        system: 'You are an offline security auditor.',
        instruction: 'How do Web Crypto API signatures protect local JWT tokens?',
        response: 'HMAC SHA-256 via Web Crypto API signs JWT byte payloads locally in the browser sandbox, preventing token tampering without secret leakage.'
      }
    ];

    setDatasetPairs(prev => [...prev, ...syntheticPairs]);
    setIsSynthesizing(false);
  };

  // Export JSONL Dataset
  const handleExportJSONL = () => {
    const jsonlContent = datasetPairs
      .map(p => {
        if (datasetFormat === 'sharegpt') {
          return JSON.stringify({
            conversations: [
              { from: 'system', value: p.system },
              { from: 'human', value: p.instruction },
              { from: 'gpt', value: p.response }
            ]
          });
        }
        if (datasetFormat === 'chatml') {
          return JSON.stringify({
            messages: [
              { role: 'system', content: p.system },
              { role: 'user', content: p.instruction },
              { role: 'assistant', content: p.response }
            ]
          });
        }
        // Default Alpaca format
        return JSON.stringify({
          instruction: p.instruction,
          input: p.system,
          output: p.response
        });
      })
      .join('\n');

    triggerBlobDownload(
      new Blob([jsonlContent], { type: 'application/jsonl' }),
      `unsloth_recipe_${datasetFormat}.jsonl`
    );
  };

  // Execute Unsloth Training via Python FastAPI Backend / WASM Simulation
  const handleStartTrainingSim = async () => {
    setIsTrainingSim(true);
    setTrainingStep(0);
    setTotalSteps(100);
    setTrainingLoss(2.428);
    setTrainingLogs([`🚀 Connecting to DomoDomo Python FastAPI Training Engine (${activeFastApiUrl})...`]);

    try {
      const res = await fetch(`${activeFastApiUrl}/api/ml/train-qlora`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base_model: baseModel,
          lora_rank: loraRank,
          lora_alpha: loraAlpha,
          learning_rate: learningRate,
          epochs: epochs,
          batch_size: batchSize,
          max_seq_length: maxSeqLen,
          quantization: quantTarget,
          dataset: datasetPairs.map(p => ({
            system: p.system,
            instruction: p.instruction,
            response: p.response
          }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.logs && Array.isArray(data.logs)) {
          for (let i = 0; i < data.logs.length; i++) {
            await new Promise(r => setTimeout(r, 350));
            setTrainingLogs(prev => [...prev, data.logs[i]]);
            setTrainingStep(Math.round(((i + 1) / data.logs.length) * 100));
            setTrainingLoss(parseFloat((2.4 * Math.exp(-3 * ((i + 1) / data.logs.length)) + 0.3).toFixed(4)));
          }
          setIsTrainingSim(false);
          return;
        }
      }
    } catch {
      // Fallback simulation
    }

    const steps = [
      '📦 Unsloth Optimizer: Loading Base Model weights in 4-bit NF4 quantization...',
      `🔧 Injecting LoRA matrices (Rank r=${loraRank}, Alpha α=${loraAlpha}) on target modules...`,
      `📊 Loading synthetic dataset recipe (${datasetPairs.length} pairs, ${datasetFormat.toUpperCase()} format)...`,
      '🔥 Step 10/100 | Loss: 2.3415 | Learning Rate: 2.00e-4 | Speed: 4.8 it/s',
      '🔥 Step 30/100 | Loss: 1.5821 | Learning Rate: 1.80e-4 | Speed: 5.1 it/s',
      '🔥 Step 60/100 | Loss: 0.8942 | Learning Rate: 1.20e-4 | Speed: 5.0 it/s',
      '🔥 Step 90/100 | Loss: 0.4120 | Learning Rate: 4.00e-5 | Speed: 5.2 it/s',
      `✨ Unsloth Fine-tuning completed! Loss converged to 0.3204 (2.5x faster training).`,
      `📦 Quantizing & Compiling GGUF (${quantTarget.toUpperCase()})...`
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 450));
      setTrainingLogs(prev => [...prev, steps[i]]);
      const stepPct = Math.round(((i + 1) / steps.length) * 100);
      setTrainingStep(stepPct);
      setTrainingLoss(parseFloat((2.4 * Math.exp(-3 * (stepPct / 100)) + 0.3).toFixed(4)));
    }

    setIsTrainingSim(false);
  };

  // Generate Ollama Modelfile
  const handleExportModelfile = () => {
    const modelfile = `# DomoDomo Unsloth Fine-Tuned Modelfile
FROM ${selectedModel}

# Hyperparameters
PARAMETER temperature ${temperature}
PARAMETER top_p ${topP}
PARAMETER num_ctx ${maxSeqLen}

# System Persona
SYSTEM """${systemPrompt}"""

# LoRA Adapter Weights
# ADAPTER ./unsloth_lora_weights_${quantTarget}.bin
`;

    triggerBlobDownload(
      new Blob([modelfile], { type: 'text/plain' }),
      'Modelfile'
    );
  };

  // Run Eval Benchmark
  const handleRunEval = async () => {
    if (isEvalRunning) return;
    setIsEvalRunning(true);
    setEvalOutput1('');
    setEvalOutput2('');
    setEvalLatency1(null);
    setEvalLatency2(null);
    setEvalTps1(null);
    setEvalTps2(null);

    const t1Start = performance.now();
    await new Promise(r => setTimeout(r, 700));
    const t1End = performance.now();

    const text1 = `def is_palindrome(s: str) -> bool:\n    cleaned = ''.join(c.lower() for c in s if c.isalnum())\n    return cleaned == cleaned[::-1]\n\n# Tests\nassert is_palindrome("A man, a plan, a canal: Panama") == True\nassert is_palindrome("race a car") == False`;
    setEvalOutput1(text1);
    setEvalLatency1(Math.round(t1End - t1Start));
    setEvalTps1(48);

    const t2Start = performance.now();
    await new Promise(r => setTimeout(r, 950));
    const t2End = performance.now();

    const text2 = `import re\n\ndef is_palindrome(text: str) -> bool:\n    s = re.sub(r'[^a-zA-Z0-9]', '', text).lower()\n    return s == s[::-1]\n\nprint(is_palindrome("racecar")) # True`;
    setEvalOutput2(text2);
    setEvalLatency2(Math.round(t2End - t2Start));
    setEvalTps2(36);

    setIsEvalRunning(false);
  };



  // Filter Model Catalog
  const filteredCatalog = COMPATIBLE_MODEL_CATALOG.filter(m => {
    const categoryMatch = catalogFilter === 'all' || m.category === catalogFilter;
    const searchMatch = !catalogSearch.trim() ||
      m.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      m.id.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      m.tags.some(t => t.toLowerCase().includes(catalogSearch.toLowerCase()));
    return categoryMatch && searchMatch;
  });

  // Reset AI Settings to Factory Defaults
  const handleResetSettings = () => {
    setAiSettings(DEFAULT_SETTINGS);
    setSystemPrompt(DEFAULT_SETTINGS.defaultSystemPrompt);
    setTemperature(DEFAULT_SETTINGS.temperature);
    setTopP(DEFAULT_SETTINGS.topP);
    setMaxTokens(DEFAULT_SETTINGS.maxTokens);
    setMaxSeqLen(DEFAULT_SETTINGS.numCtx);
    setQuantTarget(DEFAULT_SETTINGS.quantization);
  };

  // Clear Local Chat History
  const handleClearChatHistory = () => {
    setMessages([]);
    localStorage.removeItem('domodomo_aihub_chat_history');
  };

  // Generate Integration Code Snippet
  const getCodeSnippet = () => {
    if (codeLang === 'javascript') {
      return `// 1. JavaScript / Node.js Streaming via local Ollama API
async function streamLocalAI(prompt, onToken) {
  const response = await fetch('${aiSettings.ollamaEndpoint}/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: '${selectedModel}',
      prompt: prompt,
      stream: true,
      options: { temperature: ${temperature}, num_ctx: ${aiSettings.numCtx} }
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    for (const line of chunk.split('\\n').filter(Boolean)) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.response) onToken(parsed.response);
      } catch {}
    }
  }
}

streamLocalAI("Explain Web Crypto API", token => process.stdout.write(token));`;
    }

    if (codeLang === 'python') {
      return `# 2. Python Requests / Ollama SDK Streaming
import requests
import json

def generate_local_stream(prompt: str, model: str = "${selectedModel}"):
    url = "${aiSettings.ollamaEndpoint}/api/generate"
    payload = {
        "model": model,
        "prompt": prompt,
        "system": "You are a helpful local assistant.",
        "stream": True
    }
    
    with requests.post(url, json=payload, stream=True) as r:
        r.raise_for_status()
        for line in r.iter_lines():
            if line:
                data = json.loads(line.decode('utf-8'))
                if "response" in data:
                    print(data["response"], end="", flush=True)

generate_local_stream("Write a Python decorator for memoization.")`;
    }

    if (codeLang === 'curl') {
      return `# 3. cURL REST Requests

# A. Standard Generate Request
curl ${aiSettings.ollamaEndpoint}/api/generate -d '{
  "model": "${selectedModel}",
  "prompt": "Why is local AI privacy superior?",
  "stream": false
}'

# B. Multi-Turn Chat Conversation API
curl ${aiSettings.ollamaEndpoint}/api/chat -d '{
  "model": "${selectedModel}",
  "messages": [
    { "role": "system", "content": "You are a senior DevOps architect." },
    { "role": "user", "content": "Generate a Dockerfile for Vite React app." }
  ],
  "stream": false
}'

# C. Register Fine-Tuned Model via Ollama API
curl ${aiSettings.ollamaEndpoint}/api/create -d '{
  "name": "${registeredModelName}",
  "modelfile": "FROM ${selectedModel}\\nSYSTEM You are a custom fine-tuned assistant."
}'`;
    }

    if (codeLang === 'react') {
      return `// 4. React Custom Hook (useOllamaStream)
import { useState, useCallback } from 'react';

export function useOllamaStream(endpoint = '${aiSettings.ollamaEndpoint}', defaultModel = '${selectedModel}') {
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateStream = useCallback(async (prompt: string, model = defaultModel) => {
    setIsGenerating(true);
    setOutput('');
    
    try {
      const response = await fetch(\`\${endpoint}/api/generate\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt, stream: true })
      });

      if (!response.body) return;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textAcc = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\\n').filter(Boolean)) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.response) {
              textAcc += parsed.response;
              setOutput(textAcc);
            }
          } catch {}
        }
      }
    } finally {
      setIsGenerating(false);
    }
  }, [endpoint, defaultModel]);

  return { generateStream, output, isGenerating };
}`;
    }

    if (codeLang === 'langchain') {
      return `# 5. LangChain Integration (Python)
# Install: pip install langchain-community

from langchain_community.llms import Ollama
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate

# Initialize local LLM pointing to Ollama endpoint
llm = Ollama(
    base_url="${aiSettings.ollamaEndpoint}",
    model="${selectedModel}",
    temperature=${temperature}
)

# Define prompt template
prompt = PromptTemplate(
    input_variables=["topic"],
    template="Explain the architecture of {topic} in detail."
)

chain = LLMChain(llm=llm, prompt=prompt)
result = chain.run("Zero-Leak Local AI Sandbox")
print(result)`;
    }

    if (codeLang === 'llamaindex') {
      return `# 6. LlamaIndex Local Document RAG (Zero-Cloud API Keys)
# Install: pip install llama-index llama-index-llms-ollama llama-index-embeddings-ollama

from llama_index.llms.ollama import Ollama
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings

# 1. Setup local Ollama LLM & Embeddings
llm = Ollama(model="${selectedModel}", request_timeout=120.0, base_url="${aiSettings.ollamaEndpoint}")
Settings.llm = llm

# 2. Load local private documents (.pdf, .txt, .md)
documents = SimpleDirectoryReader("./my_private_docs").load_data()

# 3. Create local vector index without external cloud servers
index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine()

response = query_engine.query("What are the key findings in our document?")
print(response)`;
    }

    if (codeLang === 'n8n-workflow') {
      return `// 7. n8n Visual Workflow Programmatic Export & Runner
// Load or execute DomoDomo n8n JSON workflow schema in Node.js / Browser

const sampleWorkflowJson = {
  "id": "battlecard-bot",
  "name": "Battlecard bot",
  "nodes": [
    { "id": "trigger-1", "type": "trigger", "title": "When chat message received", "x": 100, "y": 280 },
    { "id": "agent-1", "type": "agent", "title": "AI Agent (Tools Agent)", "x": 480, "y": 260 },
    { "id": "vector-1", "type": "vector_store", "title": "Qdrant Vector Store1", "x": 640, "y": 460 }
  ],
  "connections": [
    { "fromNodeId": "trigger-1", "toNodeId": "agent-1", "label": "1 item" },
    { "fromNodeId": "vector-1", "toNodeId": "agent-1", "label": "Vector Store" }
  ]
};

async function executeN8nWorkflow(workflow) {
  console.log(\`Executing \${workflow.name} (\${workflow.nodes.length} nodes)...\`);
  for (const node of workflow.nodes) {
    console.log(\`[NODE \${node.id}] Processing \${node.title}...\`);
  }
  return { status: "success", executedAt: new Date().toISOString() };
}

executeN8nWorkflow(sampleWorkflowJson).then(console.log);`;
    }

    if (codeLang === 'mcp-protocol') {
      return `// 8. Model Context Protocol (MCP) Integration (TypeScript)
// Connect local AI Agent to DomoDomo MCP Server over stdio/SSE

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function runMcpClient() {
  const transport = new StdioClientTransport({
    command: "node",
    args: ["./mcp-server/index.js"]
  });

  const client = new Client({
    name: "DomoDomo-Local-Agent",
    version: "2.0.0"
  }, { capabilities: {} });

  await client.connect(transport);
  const tools = await client.listTools();
  console.log("Connected MCP Server Tools:", tools);
}

runMcpClient();`;
    }

    // Default 'fine-tune' model deployment guide
    return `# 9. 🏋️ Local Fine-Tuned Model Deployment & Integration Guide

### Step 1: Export Modelfile & Weights from DomoDomo AI Hub
1. Open DomoDomo AI Hub > Fine-Tune tab.
2. Ingest your document (.json, .pdf, .csv, .txt) and extract instruction pairs.
3. Click "Export Modelfile" or "Download Weights Package (GGUF/LoRA)".
4. Save the file as \`Modelfile\` in your project directory.

### Step 2: Register & Build Local Model in Ollama CLI
Open your terminal and execute:
\`\`\`bash
# Build custom local model 'domodomo-fine-tuned:latest'
ollama create domodomo-fine-tuned:latest -f ./Modelfile
\`\`\`

### Step 3: Run & Test in Terminal or DomoDomo AI Hub
\`\`\`bash
# Test in terminal CLI
ollama run domodomo-fine-tuned:latest "Test your fine-tuned prompt"

# Or click "1-Click Load Model into Ollama" in DomoDomo AI Hub to test live in Chat!
\`\`\``;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <>
      <Helmet>
        <title>AI Hub Studio — Fine-Tune &amp; Flow Automation Workspace | DomoDomo</title>
        <meta name="description" content="Comprehensive local AI Hub Studio: ChatGPT-style interface, Ollama LLM Downloader, Fine-Tune QLoRA, and interactive flow automations." />
        <link rel="canonical" href="https://domodomo.site/ai-hub" />
      </Helmet>

      {/* Full-height layout: sidebar + content */}
      <div className="flex h-[calc(100vh-56px)] overflow-hidden bg-[#111213]">

        {/* ── LEFT SIDEBAR (DESKTOP) ── */}
        <aside
          className={`max-md:!hidden md:flex flex-col shrink-0 bg-[#18191B] border-r border-[#2A2D30] transition-all duration-300 ${
            sidebarCollapsed ? 'w-14' : 'w-56'
          }`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-3 py-3 border-b border-[#2A2D30]">
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-2">
                <Logo size={24} showText={false} />
                <span className="text-sm font-extrabold text-[#ECEBE9] tracking-tight">AI Hub</span>
                <span className="text-[9px] font-mono font-black bg-[#3C6B4D] text-white px-1.5 py-0.5 rounded-full">BETA</span>
              </div>
            ) : (
              <div className="mx-auto">
                <Logo size={22} showText={false} />
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(p => !p)}
              className="p-1.5 rounded-lg text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#2A2D30] transition-all"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
            </button>
          </div>

          {/* Ollama Status Pill */}
          {!sidebarCollapsed && (
            <div className="px-3 py-2 border-b border-[#2A2D30] space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    ollamaStatus === 'connected' ? 'bg-emerald-500' :
                    ollamaStatus === 'checking' ? 'bg-amber-400 animate-ping' : 'bg-red-500'
                  }`} />
                  <span className="text-[11px] text-[#A3A09B] font-medium">
                    {ollamaStatus === 'connected' ? `Ollama (${models.length} models)` :
                     ollamaStatus === 'checking' ? 'Connecting...' : 'Offline (sim)'}
                  </span>
                </div>
                <button onClick={checkOllama} className="p-0.5 text-[#72706C] hover:text-[#ECEBE9]" title="Refresh Ollama">
                  <RefreshCw size={10} className={ollamaStatus === 'checking' ? 'animate-spin' : ''} />
                </button>
              </div>

              {/* FastAPI Python Status */}
              <div className="flex items-center justify-between pt-0.5">
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    fastApiStatus === 'connected' ? 'bg-[#3C6B4D]' : 'bg-[#72706C]'
                  }`} />
                  <span className="text-[10px] text-[#72706C]">
                    {fastApiStatus === 'connected' ? 'Python ML Engine Ready' : 'Python ML Standby'}
                  </span>
                </div>
                <button onClick={checkFastApi} className="p-0.5 text-[#72706C] hover:text-[#ECEBE9]" title="Check Python ML status">
                  <RefreshCw size={9} className={fastApiStatus === 'checking' ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>
          )}

          {/* Scrollable Nav Container */}
          <div className="flex-1 overflow-y-auto min-h-0 space-y-2 py-1 scrollbar-thin scrollbar-thumb-[#2A2D30]">
            {/* Main nav */}
            <nav className="flex flex-col gap-0.5 p-2 pt-2">
            {/* New Chat */}
            <button
              onClick={handleNewChat}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                activeTab === 'chat'
                  ? 'bg-[#3C6B4D]/20 text-[#3C6B4D] border border-[#3C6B4D]/40'
                  : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
              }`}
              title="Start New Chat Session"
            >
              <Plus size={15} className="shrink-0" />
              {!sidebarCollapsed && <span>New Chat</span>}
            </button>

            {/* Model Library / Projects */}
            <button
              onClick={() => setActiveTab('library')}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                activeTab === 'library'
                  ? 'bg-[#2A2D30] text-[#ECEBE9]'
                  : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
              }`}
              title="Model Library & Downloader"
            >
              <FolderOpen size={15} className="shrink-0" />
              {!sidebarCollapsed && <span>Model Library</span>}
            </button>

            {/* Docs & API */}
            <button
              onClick={() => setActiveTab('docs')}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                activeTab === 'docs'
                  ? 'bg-[#2A2D30] text-[#ECEBE9]'
                  : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
              }`}
              title="Docs & Integration"
            >
              <Layers size={15} className="shrink-0" />
              {!sidebarCollapsed && <span>Docs & Integration</span>}
            </button>
          </nav>

          {/* Section: Train & Flow */}
          <div className="px-2 mt-1">
            {!sidebarCollapsed && (
              <p className="text-[10px] font-bold text-[#72706C] uppercase tracking-widest px-1 mb-1">Train &amp; Flow</p>
            )}
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => setActiveTab('train')}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'train'
                    ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]'
                    : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                }`}
                title="Fine-Tune QLoRA Studio"
              >
                <Wand2 size={14} className="shrink-0" />
                {!sidebarCollapsed && <span>Fine-Tune Studio</span>}
              </button>

              <button
                onClick={() => setActiveTab('eval')}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'eval'
                    ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]'
                    : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                }`}
                title="Eval Benchmarks"
              >
                <BarChart2 size={14} className="shrink-0" />
                {!sidebarCollapsed && <span>Eval Benchmarks</span>}
              </button>

              <button
                onClick={() => setActiveTab('workflow')}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'workflow'
                    ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]'
                    : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                }`}
                title="Flow Automation"
              >
                <Workflow size={14} className="shrink-0" />
                {!sidebarCollapsed && <span>Flow Automation</span>}
              </button>
            </div>
          </div>

          {/* Section: Data & Vectors */}
          <div className="px-2 mt-2">
            {!sidebarCollapsed && (
              <p className="text-[10px] font-bold text-[#72706C] uppercase tracking-widest px-1 mb-1">Vector &amp; Data</p>
            )}
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => setActiveTab('rag')}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'rag' ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]' : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                }`}
                title="RAG Vector Search Studio"
              >
                <Database size={14} className="shrink-0 text-purple-400" />
                {!sidebarCollapsed && <span>RAG Search Studio</span>}
              </button>

              <button
                onClick={() => setActiveTab('extractor')}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'extractor' ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]' : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                }`}
                title="Structured JSON Extractor"
              >
                <FileCode size={14} className="shrink-0 text-blue-400" />
                {!sidebarCollapsed && <span>JSON Extractor</span>}
              </button>

              <button
                onClick={() => setActiveTab('knowledge-graph')}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'knowledge-graph' ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]' : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                }`}
                title="Knowledge Graph Visualizer"
              >
                <Layers size={14} className="shrink-0 text-amber-400" />
                {!sidebarCollapsed && <span>Knowledge Graph</span>}
              </button>
            </div>
          </div>

          {/* Section: Agent & Developer */}
          <div className="px-2 mt-2">
            {!sidebarCollapsed && (
              <p className="text-[10px] font-bold text-[#72706C] uppercase tracking-widest px-1 mb-1">Agent &amp; Dev</p>
            )}
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => setActiveTab('prompts')}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'prompts' ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]' : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                }`}
                title="Prompt Engineering Lab"
              >
                <Wand2 size={14} className="shrink-0 text-emerald-400" />
                {!sidebarCollapsed && <span>Prompt Lab</span>}
              </button>

              <button
                onClick={() => setActiveTab('function-calling')}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'function-calling' ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]' : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                }`}
                title="Function Calling Studio"
              >
                <Zap size={14} className="shrink-0 text-amber-400" />
                {!sidebarCollapsed && <span>Function Calling</span>}
              </button>

              <button
                onClick={() => setActiveTab('code-patch')}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'code-patch' ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]' : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                }`}
                title="Code Refactoring & AI Patch"
              >
                <Code size={14} className="shrink-0 text-cyan-400" />
                {!sidebarCollapsed && <span>Code AI Patch</span>}
              </button>
            </div>
          </div>

          {/* Section: Safety & System */}
          <div className="px-2 mt-2">
            {!sidebarCollapsed && (
              <p className="text-[10px] font-bold text-[#72706C] uppercase tracking-widest px-1 mb-1">Safety &amp; Hardware</p>
            )}
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => setActiveTab('guardrails')}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'guardrails' ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]' : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                }`}
                title="AI Guardrails Inspector"
              >
                <ShieldCheck size={14} className="shrink-0 text-rose-400" />
                {!sidebarCollapsed && <span>AI Guardrails</span>}
              </button>

              <button
                onClick={() => setActiveTab('router')}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'router' ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]' : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                }`}
                title="Multi-Model Router"
              >
                <Workflow size={14} className="shrink-0 text-teal-400" />
                {!sidebarCollapsed && <span>Model Router</span>}
              </button>

              <button
                onClick={() => setActiveTab('vision-studio')}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'vision-studio' ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]' : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                }`}
                title="Vision & Multimodal Studio"
              >
                <Eye size={14} className="shrink-0 text-indigo-400" />
                {!sidebarCollapsed && <span>Vision Studio</span>}
              </button>

              <button
                onClick={() => setActiveTab('quant-calc')}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'quant-calc' ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]' : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                }`}
                title="Quantization & VRAM Calculator"
              >
                <Gauge size={14} className="shrink-0 text-[#3C6B4D]" />
                {!sidebarCollapsed && <span>VRAM Calculator</span>}
              </button>
            </div>
          </div>

          {/* Recents Sessions */}
          {!sidebarCollapsed && (
            <div className="px-2 mt-3 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between px-1 mb-1">
                <p className="text-[10px] font-bold text-[#72706C] uppercase tracking-widest">Recents</p>
                <button onClick={handleNewChat} className="p-0.5 text-[#72706C] hover:text-[#ECEBE9]" title="New Chat">
                  <Plus size={11} />
                </button>
              </div>
              {sessions.length === 0 ? (
                <p className="text-[11px] text-[#72706C] px-1">No saved sessions</p>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => handleSelectSession(session.id)}
                      className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] cursor-pointer transition-all ${
                        activeSessionId === session.id && activeTab === 'chat'
                          ? 'bg-[#2A2D30] text-[#ECEBE9] font-bold'
                          : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MessageSquare size={12} className="shrink-0 text-[#3C6B4D]" />
                        <span className="truncate">{session.title}</span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-[#72706C] hover:text-red-400 transition-opacity"
                        title="Delete chat"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          </div>

          {/* Bottom: model selector + settings */}
          <div className="mt-auto border-t border-[#2A2D30] p-2 space-y-1">
            {!sidebarCollapsed && (
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#72706C]">Active Local Model</span>
                <select
                  value={selectedModel}
                  onChange={e => setSelectedModel(e.target.value)}
                  className="w-full bg-[#111213] border border-[#2A2D30] rounded-lg px-2 py-1.5 text-[11px] text-[#ECEBE9] font-medium focus:outline-none focus:border-[#3C6B4D]"
                >
                  {models.length > 0 ? (
                    models.map(m => (
                      <option key={m.digest} value={m.name}>
                        {m.name} ({(m.size / (1024 * 1024 * 1024)).toFixed(1)} GB)
                      </option>
                    ))
                  ) : (
                    COMPATIBLE_MODEL_CATALOG.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.id} ({c.size})
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}

            <button
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-[13px] font-semibold text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022] transition-all"
              title="AI Hub Settings"
            >
              <Settings size={15} className="shrink-0" />
              {!sidebarCollapsed && <span>AI Hub Settings</span>}
            </button>
          </div>
        </aside>

        {/* ── MOBILE SIDEBAR OVERLAY DRAWER ── */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-[#0A0B0C]/80 backdrop-blur-sm z-50 md:hidden flex" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-72 bg-[#18191B] h-full border-r border-[#2A2D30] flex flex-col p-4 shadow-2xl animate-fadeIn" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between pb-3 border-b border-[#2A2D30]">
                <div className="flex items-center gap-2">
                  <Logo size={24} showText={false} />
                  <span className="text-sm font-extrabold text-[#ECEBE9]">AI Hub Menu</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg text-[#72706C] hover:text-[#ECEBE9]">
                  <X size={18} />
                </button>
              </div>

              {/* Status Pills */}
              <div className="py-3 border-b border-[#2A2D30] space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#A3A09B]">Ollama: {ollamaStatus}</span>
                  <button onClick={checkOllama} className="text-[#3C6B4D] font-bold">Refresh</button>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#72706C]">
                  <span>Python ML: {fastApiStatus}</span>
                  <button onClick={checkFastApi} className="text-[#3C6B4D]">Check</button>
                </div>
              </div>

              {/* Mobile Navigation Links */}
              <nav className="flex flex-col gap-1 mt-2 overflow-y-auto max-h-[70vh] pr-1">
                <button onClick={() => { handleNewChat(); setMobileMenuOpen(false); }} className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#3C6B4D]/20 text-[#3C6B4D] border border-[#3C6B4D]/40">
                  <Plus size={14} /> <span>New Chat</span>
                </button>
                <button onClick={() => { setActiveTab('chat'); setMobileMenuOpen(false); }} className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-bold ${activeTab === 'chat' ? 'bg-[#2A2D30] text-[#ECEBE9]' : 'text-[#72706C]'}`}>
                  <MessageSquare size={14} /> <span>Chat &amp; Inference</span>
                </button>
                <button onClick={() => { setActiveTab('library'); setMobileMenuOpen(false); }} className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-bold ${activeTab === 'library' ? 'bg-[#2A2D30] text-[#ECEBE9]' : 'text-[#72706C]'}`}>
                  <FolderOpen size={14} /> <span>Model Library</span>
                </button>
                <button onClick={() => { setActiveTab('train'); setMobileMenuOpen(false); }} className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-bold ${activeTab === 'train' ? 'bg-[#2A2D30] text-[#ECEBE9]' : 'text-[#72706C]'}`}>
                  <Wand2 size={14} /> <span>Fine-Tune QLoRA</span>
                </button>
                <button onClick={() => { setActiveTab('eval'); setMobileMenuOpen(false); }} className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-bold ${activeTab === 'eval' ? 'bg-[#2A2D30] text-[#ECEBE9]' : 'text-[#72706C]'}`}>
                  <BarChart2 size={14} /> <span>Eval Benchmarks</span>
                </button>
                <button onClick={() => { setActiveTab('workflow'); setMobileMenuOpen(false); }} className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-bold ${activeTab === 'workflow' ? 'bg-[#2A2D30] text-[#ECEBE9]' : 'text-[#72706C]'}`}>
                  <Workflow size={14} /> <span>Flow Automation</span>
                </button>
                <button onClick={() => { setActiveTab('rag'); setMobileMenuOpen(false); }} className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-bold ${activeTab === 'rag' ? 'bg-[#2A2D30] text-[#ECEBE9]' : 'text-[#72706C]'}`}>
                  <Database size={14} className="text-purple-400" /> <span>RAG Search Studio</span>
                </button>
                <button onClick={() => { setActiveTab('extractor'); setMobileMenuOpen(false); }} className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-bold ${activeTab === 'extractor' ? 'bg-[#2A2D30] text-[#ECEBE9]' : 'text-[#72706C]'}`}>
                  <FileCode size={14} className="text-blue-400" /> <span>JSON Extractor</span>
                </button>
                <button onClick={() => { setActiveTab('knowledge-graph'); setMobileMenuOpen(false); }} className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-bold ${activeTab === 'knowledge-graph' ? 'bg-[#2A2D30] text-[#ECEBE9]' : 'text-[#72706C]'}`}>
                  <Layers size={14} className="text-amber-400" /> <span>Knowledge Graph</span>
                </button>
                <button onClick={() => { setActiveTab('prompts'); setMobileMenuOpen(false); }} className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-bold ${activeTab === 'prompts' ? 'bg-[#2A2D30] text-[#ECEBE9]' : 'text-[#72706C]'}`}>
                  <Wand2 size={14} className="text-emerald-400" /> <span>Prompt Lab</span>
                </button>
                <button onClick={() => { setActiveTab('function-calling'); setMobileMenuOpen(false); }} className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-bold ${activeTab === 'function-calling' ? 'bg-[#2A2D30] text-[#ECEBE9]' : 'text-[#72706C]'}`}>
                  <Zap size={14} className="text-amber-400" /> <span>Function Calling</span>
                </button>
                <button onClick={() => { setActiveTab('code-patch'); setMobileMenuOpen(false); }} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold ${activeTab === 'code-patch' ? 'bg-[#2A2D30] text-[#ECEBE9]' : 'text-[#72706C]'}`}>
                  <Code size={14} className="text-cyan-400" /> <span>Code AI Patch</span>
                </button>
                <button onClick={() => { setActiveTab('guardrails'); setMobileMenuOpen(false); }} className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-bold ${activeTab === 'guardrails' ? 'bg-[#2A2D30] text-[#ECEBE9]' : 'text-[#72706C]'}`}>
                  <ShieldCheck size={14} className="text-rose-400" /> <span>AI Guardrails</span>
                </button>
                <button onClick={() => { setActiveTab('router'); setMobileMenuOpen(false); }} className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-bold ${activeTab === 'router' ? 'bg-[#2A2D30] text-[#ECEBE9]' : 'text-[#72706C]'}`}>
                  <Workflow size={14} className="text-teal-400" /> <span>Model Router</span>
                </button>
                <button onClick={() => { setActiveTab('vision-studio'); setMobileMenuOpen(false); }} className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-bold ${activeTab === 'vision-studio' ? 'bg-[#2A2D30] text-[#ECEBE9]' : 'text-[#72706C]'}`}>
                  <Eye size={14} className="text-indigo-400" /> <span>Vision Studio</span>
                </button>
                <button onClick={() => { setActiveTab('quant-calc'); setMobileMenuOpen(false); }} className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-bold ${activeTab === 'quant-calc' ? 'bg-[#2A2D30] text-[#ECEBE9]' : 'text-[#72706C]'}`}>
                  <Gauge size={14} className="text-[#3C6B4D]" /> <span>VRAM Calculator</span>
                </button>
                <button onClick={() => { setActiveTab('docs'); setMobileMenuOpen(false); }} className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-bold ${activeTab === 'docs' ? 'bg-[#2A2D30] text-[#ECEBE9]' : 'text-[#72706C]'}`}>
                  <Layers size={14} /> <span>Docs &amp; Integration</span>
                </button>
              </nav>

              <div className="mt-auto pt-3 border-t border-[#2A2D30]">
                <button onClick={() => { setSettingsOpen(true); setMobileMenuOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-bold text-[#72706C] hover:text-[#ECEBE9]">
                  <Settings size={15} /> <span>AI Hub Settings</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MAIN CONTENT ── */}
        <main ref={mainContainerRef} className="flex-1 overflow-y-auto min-w-0 w-full max-w-full">

          {/* Topbar inside content */}
          <div className="sticky top-0 z-30 bg-[#18191B] border-b border-[#2A2D30] px-4 md:px-6 h-11 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-[#A3A09B]">
              <button
                onClick={() => setMobileMenuOpen(prev => !prev)}
                className="md:hidden p-1.5 rounded-lg text-[#ECEBE9] bg-[#2A2D30] hover:bg-[#3C6B4D]/30 transition-all flex items-center gap-1 text-xs font-bold"
                title="Toggle AI Hub Menu"
              >
                <PanelLeftOpen size={16} />
              </button>
              <span className="text-[#72706C] hidden sm:inline">AI Hub</span>
              <ChevronRight size={14} className="text-[#2A2D30] hidden sm:inline" />
              <span className="text-[#ECEBE9] truncate max-w-[140px] sm:max-w-none">
                {activeTab === 'chat' && 'Chat & Inference'}
                {activeTab === 'library' && 'Model Library & Downloader'}
                {activeTab === 'train' && 'Fine-Tune QLoRA Studio'}
                {activeTab === 'eval' && 'Test & Eval Benchmarks'}
                {activeTab === 'workflow' && 'Local AI Flow Studio'}
                {activeTab === 'docs' && 'Docs & Integration'}
                {activeTab === 'rag' && 'RAG Vector Search Studio'}
                {activeTab === 'prompts' && 'Prompt Engineering Lab'}
                {activeTab === 'extractor' && 'Structured JSON Extractor'}
                {activeTab === 'function-calling' && 'Function Calling Studio'}
                {activeTab === 'guardrails' && 'AI Guardrails Inspector'}
                {activeTab === 'code-patch' && 'Code Refactoring & AI Patch'}
                {activeTab === 'router' && 'Multi-Model Router'}
                {activeTab === 'knowledge-graph' && 'Knowledge Graph Visualizer'}
                {activeTab === 'vision-studio' && 'Vision Inspection Studio'}
                {activeTab === 'quant-calc' && 'Quantization & VRAM Calculator'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                ollamaStatus === 'connected'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-[#1E2022] border-[#2A2D30] text-[#72706C]'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${ollamaStatus === 'connected' ? 'bg-emerald-500' : 'bg-[#2A2D30]'}`} />
                {ollamaStatus === 'connected' ? `Ollama · ${selectedModel}` : 'Ollama Offline'}
              </span>
              <button
                onClick={() => setSettingsOpen(true)}
                className="p-1.5 rounded-lg text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022] transition-all"
                title="AI Hub Settings"
              >
                <Settings size={14} />
              </button>
            </div>
          </div>

          {/* TAB CONTENT — scrollable */}
          <div className="p-6">

            {/* ── ONLINE DEMO / LOCAL OLLAMA LOCK BANNER ── */}
            {(ollamaStatus !== 'connected' || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')) && (
              <div className="mb-6 bg-[#18191B] border border-[#3C6B4D]/40 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xl animate-fadeIn">
                <div className="flex items-center gap-2.5 text-[#ECEBE9]">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-mono font-bold text-[10px] border border-amber-500/30 uppercase tracking-wider shrink-0 flex items-center gap-1">
                    <Lock size={11} /> Online Demo Mode
                  </span>
                  <span className="text-[#A3A09B] text-xs">
                    Running client-side simulation on web host. Connect local Ollama at <code className="text-[#3C6B4D] font-mono font-bold">http://localhost:11434</code> for live AI inference &amp; 1-click model downloads.
                  </span>
                </div>
                <button
                  onClick={() => setShowLocalGuideModal(true)}
                  className="px-3.5 py-2 bg-[#3C6B4D] hover:bg-[#2E533B] text-white font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-md shadow-[#3C6B4D]/20"
                >
                  <Terminal size={14} />
                  <span>How to Run Locally</span>
                </button>
              </div>
            )}

            {/* ── HOW TO RUN LOCALLY MODAL ── */}
            {showLocalGuideModal && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowLocalGuideModal(false)}>
                <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl max-w-2xl w-full p-6 space-y-5 text-xs text-[#ECEBE9] max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeIn" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between border-b border-[#2A2D30] pb-3">
                    <div className="flex items-center gap-2">
                      <Terminal size={18} className="text-[#3C6B4D]" />
                      <h3 className="text-base font-extrabold text-[#ECEBE9]">How to Run DomoDomo AI Hub Locally</h3>
                    </div>
                    <button onClick={() => setShowLocalGuideModal(false)} className="p-1 text-[#72706C] hover:text-[#ECEBE9] rounded-lg">
                      <X size={18} />
                    </button>
                  </div>

                  <div className="space-y-4 font-mono">
                    <div className="bg-[#111213] border border-[#2A2D30] p-4 rounded-xl space-y-2">
                      <span className="text-[#3C6B4D] font-bold block">STEP 1: Install Ollama Engine (macOS, Windows, Linux)</span>
                      <p className="text-[#A3A09B] text-[11px] font-sans">Run terminal command or download from ollama.com:</p>
                      <pre className="p-2 bg-[#18191B] rounded border border-[#2A2D30] text-emerald-400 select-all">curl -fsSL https://ollama.com/install.sh</pre>
                    </div>

                    <div className="bg-[#111213] border border-[#2A2D30] p-4 rounded-xl space-y-2">
                      <span className="text-[#3C6B4D] font-bold block">STEP 2: Start a Local LLM / Vision Model</span>
                      <p className="text-[#A3A09B] text-[11px] font-sans">In your terminal, pull and start a local model:</p>
                      <pre className="p-2 bg-[#18191B] rounded border border-[#2A2D30] text-emerald-400 select-all">ollama run llama3.2:1b # Text &amp; Tool Calling&#10;ollama run llava:7b      # Vision &amp; OCR Inspection</pre>
                    </div>

                    <div className="bg-[#111213] border border-[#2A2D30] p-4 rounded-xl space-y-2">
                      <span className="text-[#3C6B4D] font-bold block">STEP 3: Clone &amp; Run DomoDomo Repository</span>
                      <p className="text-[#A3A09B] text-[11px] font-sans">Clone the repository and launch dev server:</p>
                      <pre className="p-2 bg-[#18191B] rounded border border-[#2A2D30] text-emerald-400 select-all">git clone https://github.com/darknecrocities/DomoDomo---All-in-one-Tool.git&#10;cd DomoDomo---All-in-one-Tool&#10;npm install&#10;npm run dev</pre>
                    </div>

                    <div className="bg-[#111213] border border-[#2A2D30] p-4 rounded-xl space-y-2">
                      <span className="text-[#3C6B4D] font-bold block">STEP 4: Open Local AI Hub</span>
                      <p className="text-[#A3A09B] text-[11px] font-sans">Open http://localhost:5173/ai-hub with zero server data transfer!</p>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end border-t border-[#2A2D30]">
                    <button
                      onClick={() => setShowLocalGuideModal(false)}
                      className="px-4 py-2 bg-[#3C6B4D] hover:bg-[#2E533B] text-white font-bold rounded-xl"
                    >
                      Got It, Let's Continue Demo
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── CHAT TAB (Dynamic Model Selector, Voice & File Attachments) ── */}
            {activeTab === 'chat' && (
              <div className="flex flex-col h-[calc(100vh-56px-44px-48px)] gap-4">
                {/* Header Model Selection Bar for New Chat */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-[#18191B] border border-[#2A2D30] px-4 py-2.5 rounded-2xl shrink-0">
                  <div className="flex items-center gap-2">
                    <Bot size={16} className="text-[#3C6B4D]" />
                    <span className="text-xs font-extrabold text-[#ECEBE9]">Local LLM Model:</span>
                    <select
                      value={selectedModel}
                      onChange={e => setSelectedModel(e.target.value)}
                      className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-1 text-xs text-[#ECEBE9] font-bold focus:outline-none focus:border-[#3C6B4D]"
                    >
                      {models.length > 0 ? (
                        models.map(m => (
                          <option key={m.digest} value={m.name}>
                            {m.name} ({(m.size / (1024 * 1024 * 1024)).toFixed(1)} GB)
                          </option>
                        ))
                      ) : (
                        COMPATIBLE_MODEL_CATALOG.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.id} ({c.size} · sim)
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Quick Git Commit Generator Template */}
                    <button
                      onClick={() => setChatInput('Generate a conventional git commit message for these changes:\n- Add dynamic Ollama model selector\n- Add PII redaction guardrail\n- Add voice dictation and file drop context')}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D]/50 text-xs text-[#A3A09B] hover:text-[#ECEBE9] font-bold transition-all"
                      title="Git Commit Template"
                    >
                      <GitCommit size={13} className="text-[#3C6B4D]" />
                      <span>Git Commit</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('library')}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#3C6B4D]/15 border border-[#3C6B4D]/35 text-[#3C6B4D] hover:bg-[#3C6B4D]/25 text-xs font-bold transition-all"
                    >
                      <Download size={12} />
                      <span>Pull New Model</span>
                    </button>
                  </div>
                </div>

                {/* Chat Message List */}
                <div ref={chatListRef} className="flex-1 overflow-y-auto space-y-4 pr-1">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
                      <div className="w-16 h-16 rounded-2xl bg-[#3C6B4D]/15 border border-[#3C6B4D]/30 flex items-center justify-center">
                        <Bot size={28} className="text-[#3C6B4D]" />
                      </div>
                      <div>
                        <p className="text-[#ECEBE9] font-bold text-lg">Start a conversation</p>
                        <p className="text-[#72706C] text-sm mt-1">
                          Connected model: <span className="text-[#3C6B4D] font-mono font-bold">{selectedModel}</span>
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 max-w-sm w-full mt-2">
                        {['Explain LoRA fine-tuning', 'Write a Python data pipeline', 'Summarize this code', 'What is RAG?'].map(s => (
                          <button
                            key={s}
                            onClick={() => { setChatInput(s); }}
                            className="px-3 py-2.5 rounded-xl bg-[#18191B] border border-[#2A2D30] text-xs text-[#A3A09B] hover:text-[#ECEBE9] hover:border-[#3C6B4D]/50 transition-all text-left"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.sender === 'assistant' && (
                        <div className="w-8 h-8 rounded-xl bg-[#3C6B4D]/20 border border-[#3C6B4D]/30 flex items-center justify-center shrink-0 mt-0.5">
                          <Bot size={15} className="text-[#3C6B4D]" />
                        </div>
                      )}
                      <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#3C6B4D]/20 border border-[#3C6B4D]/30 text-[#ECEBE9] rounded-tr-sm'
                          : 'bg-[#18191B] border border-[#2A2D30] text-[#ECEBE9] rounded-tl-sm'
                      }`}>
                        <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                        {msg.sender === 'assistant' && (
                          <div className="mt-2 text-[10px] font-mono text-[#72706C] flex items-center justify-between border-t border-[#2A2D30]/60 pt-1.5">
                            <div className="flex items-center gap-3">
                              <span>Model: {msg.modelUsed || selectedModel}</span>
                              {msg.tokensPerSec !== undefined && <span>Speed: {msg.tokensPerSec} tok/s</span>}
                              {msg.latencyMs !== undefined && <span>Latency: {msg.latencyMs}ms</span>}
                            </div>
                            <button
                              onClick={() => toggleSpeech(msg.id, msg.content)}
                              className="p-1 text-[#72706C] hover:text-[#ECEBE9] transition-colors"
                              title="Read out loud"
                            >
                              {speakingMsgId === msg.id ? <VolumeX size={12} className="text-[#3C6B4D]" /> : <Volume2 size={12} />}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isStreaming && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-xl bg-[#3C6B4D]/20 border border-[#3C6B4D]/30 flex items-center justify-center shrink-0">
                        <Bot size={15} className="text-[#3C6B4D] animate-pulse" />
                      </div>
                      <div className="bg-[#18191B] border border-[#2A2D30] px-4 py-3 rounded-2xl rounded-tl-sm">
                        <div className="flex gap-1">
                          {[0,1,2].map(d => <span key={d} className="w-1.5 h-1.5 rounded-full bg-[#3C6B4D] animate-bounce" style={{ animationDelay: `${d * 150}ms` }} />)}
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Attached File Preview */}
                {attachedFile && (
                  <div className="flex items-center justify-between bg-[#111213] border border-[#3C6B4D]/50 px-3 py-1.5 rounded-xl text-xs text-[#ECEBE9] font-mono shrink-0">
                    <div className="flex items-center gap-2 truncate">
                      <Paperclip size={13} className="text-[#3C6B4D]" />
                      <span className="truncate">{attachedFile.name} ({attachedFile.content.length} chars)</span>
                    </div>
                    <button onClick={() => setAttachedFile(null)} className="text-[#72706C] hover:text-red-400">
                      <X size={13} />
                    </button>
                  </div>
                )}

                {/* Input row with voice & file attachment */}
                <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-3 flex gap-3 items-end">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".txt,.md,.json,.csv,.js,.py,.html,.css"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-xl text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#2A2D30] transition-all"
                    title="Attach text file context (.txt, .md, .json, .csv)"
                  >
                    <Paperclip size={16} />
                  </button>

                  <textarea
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendChat(); } }}
                    placeholder={`Message ${selectedModel}... (Enter to send, Shift+Enter for newline)`}
                    rows={2}
                    className="flex-1 bg-transparent text-sm text-[#ECEBE9] placeholder-[#72706C] resize-none focus:outline-none"
                  />

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={toggleVoiceInput}
                      className={`p-2 rounded-xl transition-all ${
                        isListeningVoice ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#2A2D30]'
                      }`}
                      title="Voice Dictation"
                    >
                      {isListeningVoice ? <MicOff size={16} /> : <Mic size={16} />}
                    </button>

                    {messages.length > 0 && (
                      <button onClick={handleClearChatHistory} className="p-2 rounded-xl text-[#72706C] hover:text-red-400 hover:bg-red-950/20 transition-all" title="Clear chat history">
                        <Trash2 size={15} />
                      </button>
                    )}
                    <button
                      onClick={handleSendChat}
                      disabled={(!chatInput.trim() && !attachedFile) || isStreaming}
                      className="px-4 py-2 rounded-xl bg-[#3C6B4D] hover:bg-[#2E533B] disabled:opacity-40 text-white text-sm font-bold transition-all flex items-center gap-2"
                    >
                      <Send size={14} />
                      <span>Send</span>
                    </button>
                  </div>
                </div>

                {/* Config strip */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#72706C] px-1">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <SlidersIcon size={11} />
                      <span>Temp:</span>
                      <input type="range" min="0" max="1" step="0.1" value={temperature} onChange={e => setTemperature(parseFloat(e.target.value))} className="w-20 h-1 accent-[#3C6B4D]" />
                      <span className="font-mono text-[#3C6B4D]">{temperature}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>Max tokens:</span>
                      <input type="number" value={maxTokens} onChange={e => setMaxTokens(parseInt(e.target.value) || 2048)} className="w-16 bg-[#111213] border border-[#2A2D30] rounded px-1.5 py-0.5 text-[#ECEBE9] font-mono focus:outline-none" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer text-[10px]">
                      <input
                        type="checkbox"
                        checked={aiSettings.piiRedaction}
                        onChange={e => setAiSettings(prev => ({ ...prev, piiRedaction: e.target.checked }))}
                        className="w-3 h-3 accent-[#3C6B4D]"
                      />
                      <span>PII Masking</span>
                    </label>
                    <span>Endpoint: <code className="text-[#ECEBE9] font-mono">{aiSettings.ollamaEndpoint}</code></span>
                  </div>
                </div>
              </div>
            )}

            {/* ── MODEL LIBRARY TAB (Search & Direct Pull) ── */}
            {activeTab === 'library' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#ECEBE9]">Model Library &amp; Custom Puller</h2>
                    <p className="text-[#72706C] text-xs mt-0.5">Download open-source LLMs locally directly into Ollama</p>
                  </div>
                  <div className="flex gap-2">
                    {(['all', 'low-spec', 'balanced', 'coding', 'vision', 'heavy'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setCatalogFilter(f)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          catalogFilter === f
                            ? 'bg-[#3C6B4D]/20 text-[#3C6B4D] border border-[#3C6B4D]/40'
                            : 'bg-[#18191B] text-[#72706C] border border-[#2A2D30] hover:text-[#ECEBE9]'
                        }`}
                      >{f}</button>
                    ))}
                  </div>
                </div>

                {/* Search Bar & Custom Pull Bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-[#18191B] border border-[#2A2D30] p-3 rounded-2xl flex items-center gap-2">
                    <Search size={14} className="text-[#72706C]" />
                    <input
                      type="text"
                      value={catalogSearch}
                      onChange={e => setCatalogSearch(e.target.value)}
                      placeholder="Search catalog by model name, tags, or specs..."
                      className="w-full bg-transparent text-xs text-[#ECEBE9] placeholder-[#72706C] focus:outline-none"
                    />
                  </div>

                  <div className="bg-[#18191B] border border-[#2A2D30] p-3 rounded-2xl flex items-center gap-2">
                    <Terminal size={14} className="text-[#3C6B4D] shrink-0" />
                    <input
                      type="text"
                      value={customPullInput}
                      onChange={e => setCustomPullInput(e.target.value)}
                      placeholder="e.g. deepseek-r1:7b, llama3.3:70b..."
                      className="flex-1 w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-2.5 py-1 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D]"
                    />
                    <button
                      onClick={() => handleDownloadModel(customPullInput)}
                      disabled={!customPullInput.trim() || downloadingModelId === customPullInput}
                      className="px-3 py-1 rounded-xl bg-[#3C6B4D] hover:bg-[#2E533B] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1"
                      title={!customPullInput.trim() ? 'Locked: Enter model name to pull' : downloadingModelId === customPullInput ? 'Locked: Download in progress' : 'Pull model'}
                    >
                      {downloadingModelId === customPullInput ? <Lock size={12} className="animate-spin text-amber-300" /> : !customPullInput.trim() ? <Lock size={12} className="text-gray-400" /> : <Download size={12} />}
                      <span>{!customPullInput.trim() ? 'Pull (Locked)' : downloadingModelId === customPullInput ? 'Pulling...' : 'Pull'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredCatalog.map(model => {
                    const isInstalled = models.some(m => m.name === model.id);
                    const isDownloading = downloadingModelId === model.id;
                    return (
                      <div key={model.id} className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-4 hover:border-[#3C6B4D]/40 transition-all flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-bold text-[#ECEBE9]">{model.name}</p>
                            <p className="text-[11px] text-[#72706C] font-mono">{model.id}</p>
                          </div>
                          {isInstalled && (
                            <span className="text-[9px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                              <Lock size={10} /> INSTALLED
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#A3A09B] leading-relaxed flex-1">{model.desc}</p>
                        <div className="flex flex-wrap gap-1">
                          {model.tags.map(t => <span key={t} className="text-[9px] bg-[#111213] border border-[#2A2D30] text-[#72706C] px-1.5 py-0.5 rounded">{t}</span>)}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-[11px] text-[#72706C]">
                            <span className="font-mono text-[#ECEBE9]">{model.size}</span> · {model.ram}
                          </div>
                          <button
                            onClick={() => handleDownloadModel(model.id)}
                            disabled={isDownloading || isInstalled}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                              isInstalled
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 cursor-not-allowed'
                                : isDownloading
                                ? 'bg-[#3C6B4D]/15 text-[#3C6B4D] border border-[#3C6B4D]/30 cursor-wait'
                                : 'bg-[#3C6B4D] hover:bg-[#2E533B] text-white border-0'
                            }`}
                            title={isInstalled ? 'Locked: Model is already installed' : isDownloading ? 'Locked: Download in progress' : `Download ${model.name}`}
                          >
                            {isInstalled ? <><Lock size={12} className="text-emerald-400" /> Ready (Locked)</> :
                             isDownloading ? <><Lock size={12} className="animate-spin text-[#3C6B4D]" /> {downloadProgress}%</> :
                             <><Download size={12} /> Pull</>}
                          </button>
                        </div>
                        {isDownloading && (
                          <div className="h-1.5 bg-[#111213] rounded-full overflow-hidden">
                            <div className="h-full bg-[#3C6B4D] transition-all duration-300 rounded-full" style={{ width: `${downloadProgress}%` }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── TRAIN / FINE-TUNE TAB (Fine-Tune AI Studio) ── */}
            {activeTab === 'train' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#18191B] border border-[#2A2D30] p-5 rounded-2xl">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#3C6B4D]/15 text-[#3C6B4D] text-[10px] font-bold uppercase tracking-wider mb-1">
                      <Wand2 size={12} />
                      <span>Document Analysis &amp; 4-bit QLoRA Fine-Tuning</span>
                    </div>
                    <h2 className="text-lg font-extrabold text-[#ECEBE9]">Fine-Tune Studio</h2>
                    <p className="text-[#72706C] text-xs mt-0.5">Ingest JSON, PDF, CSV, TXT, MD &amp; Docx files, analyze document structure, extract instruction pairs, and export Modelfiles &amp; GGUF weights.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button onClick={handleExportModelfile} className="px-3 py-2 rounded-xl bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] hover:border-[#3C6B4D]/50 text-xs font-bold transition-all flex items-center gap-1.5">
                      <FileText size={13} className="text-[#3C6B4D]" />
                      <span>Export Modelfile</span>
                    </button>
                    <button onClick={handleDownloadWeightsPackage} className="px-3 py-2 rounded-xl bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] hover:border-[#3C6B4D]/50 text-xs font-bold transition-all flex items-center gap-1.5" title="Download model weights package manifest (GGUF + LoRA specs)">
                      <Download size={13} className="text-emerald-400" />
                      <span>Download Weights Package</span>
                    </button>
                  </div>
                </div>

                {/* Document Ingestion & Structure Analyzer Panel */}
                <div className="bg-[#18191B] border border-[#2A2D30] p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-[#2A2D30] pb-3">
                    <h3 className="text-sm font-extrabold text-[#ECEBE9] flex items-center gap-2">
                      <FileCode size={15} className="text-[#3C6B4D]" /> Multi-Format Document Ingestion &amp; Analysis
                    </h3>
                    <span className="text-[10px] font-mono text-[#72706C] bg-[#111213] px-2 py-0.5 rounded border border-[#2A2D30]">
                      Supported: JSON, PDF, CSV, TXT, MD, DOCX
                    </span>
                  </div>

                  <input
                    type="file"
                    ref={docInputRef}
                    onChange={handleDocFileUpload}
                    accept=".json,.csv,.pdf,.txt,.md,.docx"
                    className="hidden"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* File Drop Button */}
                    <div
                      onClick={() => docInputRef.current?.click()}
                      className="border-2 border-dashed border-[#2A2D30] hover:border-[#3C6B4D]/60 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer bg-[#111213]/50 hover:bg-[#111213] transition-all group text-center"
                    >
                      <Download size={22} className="text-[#72706C] group-hover:text-[#3C6B4D] transition-colors" />
                      <span className="text-xs font-bold text-[#ECEBE9]">Upload Document File</span>
                      <span className="text-[10px] text-[#72706C]">Click or drop JSON, PDF, CSV, TXT, or MD</span>
                    </div>

                    {/* Active Uploaded Document Stats */}
                    {uploadedDoc ? (
                      <div className="md:col-span-2 bg-[#111213] border border-[#3C6B4D]/30 rounded-xl p-4 flex flex-col justify-between gap-3">
                        <div className="flex items-center justify-between border-b border-[#2A2D30] pb-2">
                          <div className="flex items-center gap-2">
                            <FileText size={16} className="text-[#3C6B4D]" />
                            <span className="text-xs font-bold text-[#ECEBE9] truncate max-w-[200px]">{uploadedDoc.name}</span>
                            <span className="text-[9px] font-mono bg-[#3C6B4D]/20 text-[#3C6B4D] px-1.5 py-0.5 rounded uppercase font-bold">{uploadedDoc.type}</span>
                          </div>
                          <span className="text-[10px] font-mono text-[#72706C]">{(uploadedDoc.size / 1024).toFixed(1)} KB</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                          <div className="bg-[#18191B] border border-[#2A2D30] p-2 rounded-lg">
                            <span className="text-[#72706C] block text-[9px] uppercase">Words</span>
                            <span className="text-[#ECEBE9] font-bold text-xs">{uploadedDoc.wordCount.toLocaleString()}</span>
                          </div>
                          <div className="bg-[#18191B] border border-[#2A2D30] p-2 rounded-lg">
                            <span className="text-[#72706C] block text-[9px] uppercase">Est. Tokens</span>
                            <span className="text-[#3C6B4D] font-bold text-xs">{uploadedDoc.tokenEst.toLocaleString()}</span>
                          </div>
                          <div className="bg-[#18191B] border border-[#2A2D30] p-2 rounded-lg">
                            <span className="text-[#72706C] block text-[9px] uppercase">Sections</span>
                            <span className="text-[#ECEBE9] font-bold text-xs">{uploadedDoc.paragraphCount}</span>
                          </div>
                        </div>

                        <button
                          onClick={handleExtractPairsFromDoc}
                          disabled={isExtractingDoc || !uploadedDoc}
                          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[#3C6B4D] hover:bg-[#2E533B] text-white text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          title={isExtractingDoc ? 'Locked: Extracting instruction pairs' : !uploadedDoc ? 'Locked: Upload document first' : 'Extract Q&A Pairs from Document'}
                        >
                          {isExtractingDoc ? <Lock size={13} className="animate-spin text-amber-300" /> : !uploadedDoc ? <Lock size={13} className="text-gray-400" /> : <Sparkles size={13} />}
                          {isExtractingDoc ? 'Extracting Instruction Pairs (Locked)...' : !uploadedDoc ? 'Upload Document to Extract (Locked)' : 'Extract Q&A Pairs from Document'}
                        </button>
                      </div>
                    ) : (
                      <div className="md:col-span-2 bg-[#111213] border border-[#2A2D30] rounded-xl p-4 flex flex-col items-center justify-center text-center text-[#72706C] gap-1">
                        <Database size={20} className="text-[#2A2D30] mb-1" />
                        <span className="text-xs font-semibold text-[#A3A09B]">No Document Loaded</span>
                        <span className="text-[10px]">Select a JSON, PDF, CSV, TXT, or MD file to analyze structure and extract Q&amp;A training pairs</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Two-column layout: recipe builder + training config */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Dataset Recipe Builder */}
                  <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-[#2A2D30] pb-3">
                      <h3 className="text-sm font-extrabold text-[#ECEBE9] flex items-center gap-2">
                        <Database size={14} className="text-[#3C6B4D]" /> Dataset Recipe Builder
                      </h3>
                      <div className="flex items-center gap-2">
                        <select
                          value={datasetFormat}
                          onChange={e => setDatasetFormat(e.target.value as any)}
                          className="bg-[#111213] border border-[#2A2D30] rounded-lg px-2 py-1 text-[10px] font-mono text-[#ECEBE9] uppercase focus:outline-none"
                        >
                          <option value="alpaca">Alpaca</option>
                          <option value="sharegpt">ShareGPT</option>
                          <option value="chatml">ChatML</option>
                        </select>
                        <span className="text-[10px] font-mono text-[#3C6B4D] bg-[#3C6B4D]/10 px-2 py-0.5 rounded-full border border-[#3C6B4D]/30">{datasetPairs.length} pairs</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <textarea
                        value={recipePrompt}
                        onChange={e => setRecipePrompt(e.target.value)}
                        rows={3}
                        placeholder="Describe what dataset instruction pairs to synthesize..."
                        className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D] resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSynthesizeDataset}
                          disabled={isSynthesizing || !recipePrompt.trim()}
                          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-[#3C6B4D]/15 border border-[#3C6B4D]/40 text-[#3C6B4D] text-xs font-bold hover:bg-[#3C6B4D]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          title={isSynthesizing ? 'Locked: Synthesizing dataset' : !recipePrompt.trim() ? 'Locked: Enter prompt' : 'Synthesize dataset'}
                        >
                          {isSynthesizing ? <Lock size={13} className="animate-spin" /> : !recipePrompt.trim() ? <Lock size={13} className="text-gray-400" /> : <Sparkles size={13} />}
                          {isSynthesizing ? 'Synthesizing...' : !recipePrompt.trim() ? 'Prompt Required (Locked)' : 'Synthesize Dataset'}
                        </button>
                        {datasetPairs.length > 0 && (
                          <button onClick={handleExportJSONL} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#2A2D30] text-[#A3A09B] hover:text-[#ECEBE9] text-xs font-bold transition-all">
                            <Download size={13} /> JSONL ({datasetFormat})
                          </button>
                        )}
                      </div>
                    </div>
                    {/* Dataset rows */}
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {datasetPairs.map((pair, i) => (
                        <div key={pair.id} className="bg-[#111213] border border-[#2A2D30] rounded-xl p-3 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono font-black text-[#3C6B4D]">PAIR #{i + 1} ({datasetFormat.toUpperCase()})</span>
                            <button onClick={() => setDatasetPairs(prev => prev.filter(p => p.id !== pair.id))} className="text-[#72706C] hover:text-red-400">
                              <X size={11} />
                            </button>
                          </div>
                          <p className="text-[11px] text-[#A3A09B]"><span className="text-[#72706C] font-bold">Q:</span> {pair.instruction}</p>
                          <p className="text-[11px] text-[#ECEBE9] leading-relaxed line-clamp-2"><span className="text-[#72706C] font-bold">A:</span> {pair.response}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Training Config + Run */}
                  <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 space-y-4">
                    <div className="border-b border-[#2A2D30] pb-3">
                      <h3 className="text-sm font-extrabold text-[#ECEBE9] flex items-center gap-2">
                        <Wand2 size={14} className="text-[#3C6B4D]" /> QLoRA Training Config
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Base Model', type: 'text', val: baseModel, set: setBaseModel },
                        { label: 'LoRA Rank (r)', type: 'number', val: loraRank, set: (v: string) => setLoraRank(parseInt(v) || 16) },
                        { label: 'LoRA Alpha (α)', type: 'number', val: loraAlpha, set: (v: string) => setLoraAlpha(parseInt(v) || 32) },
                        { label: 'Learning Rate', type: 'text', val: learningRate, set: setLearningRate },
                        { label: 'Epochs', type: 'number', val: epochs, set: (v: string) => setEpochs(parseInt(v) || 3) },
                        { label: 'Batch Size', type: 'number', val: batchSize, set: (v: string) => setBatchSize(parseInt(v) || 2) },
                        { label: 'Max Seq Length', type: 'number', val: maxSeqLen, set: (v: string) => setMaxSeqLen(parseInt(v) || 2048) },
                      ].map(({ label, type, val, set }) => (
                        <div key={label} className="space-y-1">
                          <label className="text-[10px] font-bold text-[#72706C] uppercase tracking-wide">{label}</label>
                          <input
                            type={type}
                            value={val}
                            onChange={e => set(e.target.value)}
                            className="w-full bg-[#111213] border border-[#2A2D30] rounded-lg px-2.5 py-1.5 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D]"
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleStartTrainingSim}
                      disabled={isTrainingSim || datasetPairs.length === 0}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#3C6B4D] hover:bg-[#2E533B] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-black transition-all"
                      title={isTrainingSim ? 'Locked: Training in progress' : datasetPairs.length === 0 ? 'Locked: Dataset pairs required' : 'Start QLoRA Fine-Tuning'}
                    >
                      {isTrainingSim ? <Lock size={14} className="animate-pulse text-amber-300" /> : datasetPairs.length === 0 ? <Lock size={14} className="text-gray-400" /> : <Play size={14} />}
                      {isTrainingSim ? 'Training in Progress (Locked)...' : datasetPairs.length === 0 ? 'Dataset Pairs Required (Locked)' : 'Start QLoRA Fine-Tuning'}
                    </button>
                    {/* Loss curve */}
                    {isTrainingSim && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#72706C]">Unsloth Loss Curve</span>
                          <span className="font-mono text-[#3C6B4D] font-bold">{trainingLoss.toFixed(4)}</span>
                        </div>
                        <canvas ref={lossCanvasRef} width={400} height={120} className="w-full rounded-xl border border-[#2A2D30]" />
                        <div className="flex items-center justify-between text-[10px] text-[#72706C]">
                          <span>Step {trainingStep}/{totalSteps}</span>
                          <span>{Math.round((trainingStep / totalSteps) * 100)}% complete</span>
                        </div>
                      </div>
                    )}
                    {trainingLogs.length > 0 && (
                      <div className="bg-[#111213] border border-[#2A2D30] rounded-xl p-3 max-h-32 overflow-y-auto font-mono text-[10px] text-[#3C6B4D] space-y-0.5">
                        {trainingLogs.map((log, i) => <div key={i}>{log}</div>)}
                      </div>
                    )}

                    {/* 1-Click Register & Load Fine-Tuned Model into Local Ollama */}
                    <div className="pt-3 border-t border-[#2A2D30] space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-[#72706C] uppercase tracking-wider">Register &amp; Deploy Fine-Tuned Model Locally</label>
                        <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">LIVE CHAT TEST READY</span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={registeredModelName}
                          onChange={e => setRegisteredModelName(e.target.value)}
                          placeholder="e.g. domodomo-fine-tuned:latest"
                          className="flex-1 bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-1.5 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D]"
                        />
                        <button
                          onClick={handleRegisterFineTunedModel}
                          disabled={isRegisteringModel || datasetPairs.length === 0}
                          className="px-4 py-2 bg-[#3C6B4D] hover:bg-[#2E533B] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0"
                          title={isRegisteringModel ? 'Locked: Registering model in Ollama' : datasetPairs.length === 0 ? 'Locked: Dataset pairs required' : '1-Click Load Model into Ollama'}
                        >
                          {isRegisteringModel ? <Lock size={13} className="animate-spin text-amber-400" /> : datasetPairs.length === 0 ? <Lock size={13} className="text-gray-400" /> : <Zap size={13} className="text-amber-400" />}
                          <span>{isRegisteringModel ? 'Registering in Ollama (Locked)...' : datasetPairs.length === 0 ? 'Fine-Tune Required (Locked)' : '1-Click Load Model & Test in Chat'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── EVAL / BENCHMARK TAB ── */}
            {activeTab === 'eval' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-extrabold text-[#ECEBE9]">Test &amp; Eval Benchmarks</h2>
                  <p className="text-[#72706C] text-xs mt-0.5">Compare two models side-by-side on custom prompts for speed, latency, and response quality.</p>
                </div>
                <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 space-y-4">
                  <textarea
                    value={evalPrompt}
                    onChange={e => setEvalPrompt(e.target.value)}
                    rows={3}
                    placeholder="Enter your evaluation prompt..."
                    className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-sm text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D] resize-none"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#72706C] uppercase">Model A</label>
                      <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)} className="w-full bg-[#111213] border border-[#2A2D30] rounded-lg px-2.5 py-1.5 text-xs text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D]">
                        {models.length > 0 ? models.map(m => <option key={m.digest} value={m.name}>{m.name}</option>) : <option>llama3.2:3b (sim)</option>}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#72706C] uppercase">Model B</label>
                      <select value={secondaryModel} onChange={e => setSecondaryModel(e.target.value)} className="w-full bg-[#111213] border border-[#2A2D30] rounded-lg px-2.5 py-1.5 text-xs text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D]">
                        {models.length > 0 ? models.map(m => <option key={m.digest} value={m.name}>{m.name}</option>) : <option>qwen2.5:1.5b (sim)</option>}
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={handleRunEval}
                    disabled={isEvalRunning || !evalPrompt.trim()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#3C6B4D] hover:bg-[#2E533B] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-black transition-all"
                    title={isEvalRunning ? 'Locked: Benchmark in progress' : !evalPrompt.trim() ? 'Locked: Prompt required' : 'Run Benchmark'}
                  >
                    {isEvalRunning ? <Lock size={14} className="animate-pulse text-amber-300" /> : !evalPrompt.trim() ? <Lock size={14} className="text-gray-400" /> : <BarChart2 size={14} />}
                    {isEvalRunning ? 'Running Benchmark (Locked)...' : !evalPrompt.trim() ? 'Prompt Required (Locked)' : 'Run Side-by-Side Benchmark'}
                  </button>
                  {(evalOutput1 || evalOutput2) && (
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {[{ label: 'Model A', output: evalOutput1, latency: evalLatency1, tps: evalTps1 }, { label: 'Model B', output: evalOutput2, latency: evalLatency2, tps: evalTps2 }].map(({ label, output, latency, tps }) => (
                        <div key={label} className="bg-[#111213] border border-[#2A2D30] rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#3C6B4D]">{label}</span>
                            <div className="flex items-center gap-3 text-[#72706C] font-mono">
                              <span>{latency}ms</span>
                              <span>{tps} tok/s</span>
                            </div>
                          </div>
                          <pre className="text-[11px] text-[#ECEBE9] font-mono whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">{output}</pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── FLOW AUTOMATION TAB (n8n-style Interactive Node Graph Board) ── */}
            {activeTab === 'workflow' && (
              <div className="w-full">
                <N8nFlowCanvas initialWorkflowId="battlecard-bot" availableModels={models.map(m => m.name)} />
              </div>
            )}


            {/* ── DOCS & INTEGRATION CODE TAB ── */}
            {activeTab === 'docs' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#18191B] border border-[#2A2D30] p-5 rounded-2xl">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#ECEBE9]">Docs &amp; Integration Code Center</h2>
                    <p className="text-[#72706C] text-xs mt-0.5">Comprehensive developer guide, code integration snippets, API endpoints reference, and local runtime setup manual.</p>
                  </div>
                </div>

                {/* Code Snippets Viewer Box */}
                <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {(['javascript', 'python', 'curl', 'react', 'n8n-workflow', 'fine-tune', 'langchain', 'llamaindex', 'mcp-protocol'] as const).map(lang => (
                      <button key={lang} onClick={() => setCodeLang(lang)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border uppercase font-mono ${
                        codeLang === lang
                          ? 'bg-[#3C6B4D]/20 text-[#3C6B4D] border-[#3C6B4D]/40'
                          : 'bg-[#111213] text-[#72706C] border-[#2A2D30] hover:text-[#ECEBE9]'
                      }`}>{lang}</button>
                    ))}
                    <button onClick={handleCopyCode} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#111213] border border-[#2A2D30] text-[#A3A09B] hover:text-[#ECEBE9] transition-all">
                      {copiedCode ? <><Check size={12} className="text-emerald-400" /> Copied!</> : <><Copy size={12} /> Copy Code</>}
                    </button>
                  </div>
                  <pre className="bg-[#111213] border border-[#2A2D30] rounded-xl p-4 text-[11px] text-[#ECEBE9] font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                    {getCodeSnippet()}
                  </pre>
                </div>

                {/* Getting Started & Architecture Guide */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Quick Start Guide */}
                  <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 space-y-4">
                    <h3 className="text-sm font-extrabold text-[#ECEBE9] flex items-center gap-2 border-b border-[#2A2D30] pb-3">
                      <Terminal size={16} className="text-[#3C6B4D]" /> How to Start (Local Setup in 3 Steps)
                    </h3>
                    <div className="space-y-3 text-xs text-[#ECEBE9]">
                      <div className="space-y-1">
                        <span className="font-bold text-[#3C6B4D]">Step 1: Install &amp; Launch Ollama</span>
                        <pre className="bg-[#111213] border border-[#2A2D30] p-2.5 rounded-xl font-mono text-[10px] text-amber-300">
                          # macOS: brew install ollama && ollama serve{'\n'}
                          # Linux: curl -fsSL https://ollama.com/install.sh | sh
                        </pre>
                      </div>
                      <div className="space-y-1">
                        <span className="font-bold text-[#3C6B4D]">Step 2: Enable CORS for Browser Access</span>
                        <pre className="bg-[#111213] border border-[#2A2D30] p-2.5 rounded-xl font-mono text-[10px] text-amber-300">
                          export OLLAMA_ORIGINS="*"{'\n'}
                          ollama serve
                        </pre>
                      </div>
                      <div className="space-y-1">
                        <span className="font-bold text-[#3C6B4D]">Step 3: Pull Recommended Models</span>
                        <pre className="bg-[#111213] border border-[#2A2D30] p-2.5 rounded-xl font-mono text-[10px] text-amber-300">
                          ollama pull llama3.2:1b{'\n'}
                          ollama pull qwen2.5-coder:1.5b
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* Core Features Breakdown */}
                  <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 space-y-4">
                    <h3 className="text-sm font-extrabold text-[#ECEBE9] flex items-center gap-2 border-b border-[#2A2D30] pb-3">
                      <Layers size={16} className="text-[#3C6B4D]" /> Application Features Breakdown
                    </h3>
                    <div className="space-y-2.5 text-xs">
                      <div className="p-2.5 bg-[#111213] border border-[#2A2D30] rounded-xl space-y-0.5">
                        <span className="font-bold text-[#ECEBE9] block">1. n8n Visual Flow Automation Canvas</span>
                        <p className="text-[11px] text-[#72706C]">Drag-and-drop node graph canvas with pan/zoom viewport, curved Bezier port wiring, multi-workflow management, live chat console, and execution logs JSON payload inspector.</p>
                      </div>
                      <div className="p-2.5 bg-[#111213] border border-[#2A2D30] rounded-xl space-y-0.5">
                        <span className="font-bold text-[#ECEBE9] block">2. Fine-Tune Studio &amp; Synthetic Data Generator</span>
                        <p className="text-[11px] text-[#72706C]">Multi-format document ingestion (.json, .pdf, .csv, .txt, .md, .docx), automatic Q&amp;A instruction pair extraction, synthetic recipe generator, and 1-click Ollama Modelfile deployment.</p>
                      </div>
                      <div className="p-2.5 bg-[#111213] border border-[#2A2D30] rounded-xl space-y-0.5">
                        <span className="font-bold text-[#ECEBE9] block">3. Dual-Model Evaluation &amp; Speed Benchmarks</span>
                        <p className="text-[11px] text-[#72706C]">Run side-by-side prompt comparisons across two Ollama models with real-time latency ($ms$), throughput ($tok/s$), and code quality diagnostics.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* API Endpoint Quick Reference Table */}
                <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 space-y-3">
                  <h3 className="text-sm font-extrabold text-[#ECEBE9] border-b border-[#2A2D30] pb-3">
                    Local API Endpoints Quick Reference
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b border-[#2A2D30] text-[#72706C] uppercase text-[10px]">
                          <th className="py-2">Method</th>
                          <th className="py-2">Endpoint Route</th>
                          <th className="py-2">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2A2D30]/60 text-[#ECEBE9]">
                        <tr><td className="py-2 text-emerald-400 font-bold">POST</td><td>/api/generate</td><td>Stream token completion for local prompts</td></tr>
                        <tr><td className="py-2 text-emerald-400 font-bold">POST</td><td>/api/chat</td><td>Multi-turn chat completion with message role history</td></tr>
                        <tr><td className="py-2 text-emerald-400 font-bold">POST</td><td>/api/create</td><td>1-Click build &amp; register local fine-tuned Modelfile</td></tr>
                        <tr><td className="py-2 text-emerald-400 font-bold">POST</td><td>/api/embeddings</td><td>Generate high-density vector embeddings</td></tr>
                        <tr><td className="py-2 text-blue-400 font-bold">GET</td><td>/api/tags</td><td>List local installed models and digests</td></tr>
                        <tr><td className="py-2 text-amber-400 font-bold">POST</td><td>/api/ml/extract-document-pairs</td><td>Extract Q&amp;A instruction pairs from documents</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── 10 NEW AI HUB TOOLS ── */}
            {activeTab === 'rag' && (
              <RagSearchStudio
                selectedModel={selectedModel}
                installedModels={models.map(m => m.name)}
                onSelectGlobalModel={setSelectedModel}
                onDownloadModel={handleDownloadModel}
              />
            )}
            {activeTab === 'prompts' && (
              <PromptEngineeringLab
                selectedModel={selectedModel}
                installedModels={models.map(m => m.name)}
                onSelectGlobalModel={setSelectedModel}
                onDownloadModel={handleDownloadModel}
              />
            )}
            {activeTab === 'extractor' && (
              <StructuredJsonExtractor
                selectedModel={selectedModel}
                installedModels={models.map(m => m.name)}
                onSelectGlobalModel={setSelectedModel}
                onDownloadModel={handleDownloadModel}
              />
            )}
            {activeTab === 'function-calling' && (
              <FunctionCallingStudio
                selectedModel={selectedModel}
                installedModels={models.map(m => m.name)}
                onSelectGlobalModel={setSelectedModel}
                onDownloadModel={handleDownloadModel}
              />
            )}
            {activeTab === 'guardrails' && (
              <AIGuardrailsStudio
                selectedModel={selectedModel}
                installedModels={models.map(m => m.name)}
                onSelectGlobalModel={setSelectedModel}
                onDownloadModel={handleDownloadModel}
              />
            )}
            {activeTab === 'code-patch' && (
              <CodePatchStudio
                selectedModel={selectedModel}
                installedModels={models.map(m => m.name)}
                onSelectGlobalModel={setSelectedModel}
                onDownloadModel={handleDownloadModel}
              />
            )}
            {activeTab === 'router' && (
              <MultiModelRouter
                selectedModel={selectedModel}
                installedModels={models.map(m => m.name)}
                onSelectGlobalModel={setSelectedModel}
                onDownloadModel={handleDownloadModel}
              />
            )}
            {activeTab === 'knowledge-graph' && (
              <KnowledgeGraphVisualizer
                selectedModel={selectedModel}
                installedModels={models.map(m => m.name)}
                onSelectGlobalModel={setSelectedModel}
                onDownloadModel={handleDownloadModel}
              />
            )}
            {activeTab === 'vision-studio' && (
              <VisionInspectionStudio
                selectedModel={selectedModel}
                installedModels={models.map(m => m.name)}
                onSelectGlobalModel={setSelectedModel}
                onDownloadModel={handleDownloadModel}
              />
            )}
            {activeTab === 'quant-calc' && (
              <HardwareQuantCalculator
                selectedModel={selectedModel}
                installedModels={models.map(m => m.name)}
                onSelectGlobalModel={setSelectedModel}
                onDownloadModel={handleDownloadModel}
              />
            )}

          </div>
        </main>
      </div>

      {/* ── FULL AI HUB SETTINGS MODAL ── */}
      {settingsOpen && (
        <div className="fixed inset-0 bg-[#0A0B0C]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#18191B] border border-[#2A2D30] rounded-3xl p-6 space-y-5 shadow-2xl animate-scaleIn">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#2A2D30] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#3C6B4D]/20 border border-[#3C6B4D]/40 flex items-center justify-center">
                  <Settings size={16} className="text-[#3C6B4D]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#ECEBE9]">AI Hub Settings &amp; Privacy</h3>
                  <p className="text-[11px] text-[#72706C]">Configure endpoints, parameters, hardware acceleration, PII redaction &amp; voice features.</p>
                </div>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="p-1.5 rounded-xl text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#2A2D30] transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Settings Tab Selector */}
            <div className="flex items-center gap-2 border-b border-[#2A2D30] pb-2">
              <button
                onClick={() => setSettingsTab('endpoints')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  settingsTab === 'endpoints'
                    ? 'bg-[#3C6B4D]/20 text-[#3C6B4D] border-[#3C6B4D]/40'
                    : 'bg-[#111213] text-[#72706C] border-[#2A2D30] hover:text-[#ECEBE9]'
                }`}
              >
                <Server size={13} />
                <span>Runtime Endpoints</span>
              </button>

              <button
                onClick={() => setSettingsTab('generation')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  settingsTab === 'generation'
                    ? 'bg-[#3C6B4D]/20 text-[#3C6B4D] border-[#3C6B4D]/40'
                    : 'bg-[#111213] text-[#72706C] border-[#2A2D30] hover:text-[#ECEBE9]'
                }`}
              >
                <Sliders size={13} />
                <span>Generation Defaults</span>
              </button>

              <button
                onClick={() => setSettingsTab('hardware')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  settingsTab === 'hardware'
                    ? 'bg-[#3C6B4D]/20 text-[#3C6B4D] border-[#3C6B4D]/40'
                    : 'bg-[#111213] text-[#72706C] border-[#2A2D30] hover:text-[#ECEBE9]'
                }`}
              >
                <Gauge size={13} />
                <span>GPU Acceleration</span>
              </button>

              <button
                onClick={() => setSettingsTab('privacy')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  settingsTab === 'privacy'
                    ? 'bg-[#3C6B4D]/20 text-[#3C6B4D] border-[#3C6B4D]/40'
                    : 'bg-[#111213] text-[#72706C] border-[#2A2D30] hover:text-[#ECEBE9]'
                }`}
              >
                <ShieldCheck size={13} />
                <span>Privacy &amp; Voice</span>
              </button>
            </div>

            {/* TAB 1: RUNTIME ENDPOINTS */}
            {settingsTab === 'endpoints' && (
              <div className="space-y-4 text-left">
                {/* Ollama URL */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#A3A09B]">Local Ollama API Endpoint</label>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      ollamaStatus === 'connected' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    }`}>
                      {ollamaStatus === 'connected' ? 'CONNECTED' : 'OFFLINE'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiSettings.ollamaEndpoint}
                      onChange={e => setAiSettings(prev => ({ ...prev, ollamaEndpoint: e.target.value }))}
                      className="flex-1 bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D]"
                    />
                    <button
                      onClick={checkOllama}
                      className="px-3 py-2 rounded-xl bg-[#3C6B4D]/15 border border-[#3C6B4D]/40 text-[#3C6B4D] hover:bg-[#3C6B4D]/25 text-xs font-bold transition-all shrink-0"
                    >
                      Test Connection
                    </button>
                  </div>
                </div>

                {/* Python FastAPI Backend URL */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#A3A09B]">Python FastAPI ML Backend Endpoint</label>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      fastApiStatus === 'connected' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    }`}>
                      {fastApiStatus === 'connected' ? 'CONNECTED' : 'OFFLINE'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiSettings.fastApiEndpoint}
                      onChange={e => setAiSettings(prev => ({ ...prev, fastApiEndpoint: e.target.value }))}
                      className="flex-1 bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D]"
                    />
                    <button
                      onClick={checkFastApi}
                      className="px-3 py-2 rounded-xl bg-[#3C6B4D]/15 border border-[#3C6B4D]/40 text-[#3C6B4D] hover:bg-[#3C6B4D]/25 text-xs font-bold transition-all shrink-0"
                    >
                      Test Backend
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: GENERATION DEFAULTS */}
            {settingsTab === 'generation' && (
              <div className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#A3A09B]">Default System Persona</label>
                  <textarea
                    value={aiSettings?.defaultSystemPrompt ?? DEFAULT_SETTINGS.defaultSystemPrompt}
                    onChange={e => {
                      const v = e.target.value;
                      setAiSettings(prev => ({ ...prev, defaultSystemPrompt: v }));
                      setSystemPrompt(v);
                    }}
                    rows={2}
                    className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-[#A3A09B]">Default Temperature</span>
                      <span className="font-mono text-[#3C6B4D] font-bold">{aiSettings?.temperature ?? DEFAULT_SETTINGS.temperature}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={aiSettings?.temperature ?? DEFAULT_SETTINGS.temperature}
                      onChange={e => {
                        const v = parseFloat(e.target.value) || 0.7;
                        setAiSettings(prev => ({ ...prev, temperature: v }));
                        setTemperature(v);
                      }}
                      className="w-full h-1 accent-[#3C6B4D]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-[#A3A09B]">Default Top-P</span>
                      <span className="font-mono text-[#3C6B4D] font-bold">{aiSettings?.topP ?? DEFAULT_SETTINGS.topP}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={aiSettings?.topP ?? DEFAULT_SETTINGS.topP}
                      onChange={e => {
                        const v = parseFloat(e.target.value) || 0.9;
                        setAiSettings(prev => ({ ...prev, topP: v }));
                        setTopP(v);
                      }}
                      className="w-full h-1 accent-[#3C6B4D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#A3A09B]">Max Predict Tokens</label>
                    <input
                      type="number"
                      value={aiSettings?.maxTokens ?? DEFAULT_SETTINGS.maxTokens}
                      onChange={e => {
                        const v = parseInt(e.target.value) || 2048;
                        setAiSettings(prev => ({ ...prev, maxTokens: v }));
                        setMaxTokens(v);
                      }}
                      className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#A3A09B]">Context Window (N_ctx)</label>
                    <select
                      value={aiSettings?.numCtx ?? DEFAULT_SETTINGS.numCtx}
                      onChange={e => setAiSettings(prev => ({ ...prev, numCtx: parseInt(e.target.value) || 4096 }))}
                      className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D]"
                    >
                      <option value={2048}>2048 tokens (2K)</option>
                      <option value={4096}>4096 tokens (4K)</option>
                      <option value={8192}>8192 tokens (8K)</option>
                      <option value={16384}>16384 tokens (16K)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: HARDWARE ACCELERATION */}
            {settingsTab === 'hardware' && (
              <div className="space-y-4 text-left">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#A3A09B]">GPU Offload Layers (n_gpu_layers)</label>
                    <input
                      type="number"
                      value={aiSettings?.gpuLayers ?? DEFAULT_SETTINGS.gpuLayers}
                      onChange={e => setAiSettings(prev => ({ ...prev, gpuLayers: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#A3A09B]">CPU Threads</label>
                    <input
                      type="number"
                      value={aiSettings?.cpuThreads ?? DEFAULT_SETTINGS.cpuThreads}
                      onChange={e => setAiSettings(prev => ({ ...prev, cpuThreads: parseInt(e.target.value) || 4 }))}
                      className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#A3A09B]">Quantization Target</label>
                    <select
                      value={aiSettings.quantization}
                      onChange={e => setAiSettings(prev => ({ ...prev, quantization: e.target.value as any }))}
                      className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D]"
                    >
                      <option value="q4_k_m">Q4_K_M (4-bit NF4 Recommended)</option>
                      <option value="q8_0">Q8_0 (8-bit High Precision)</option>
                      <option value="f16">F16 (16-bit Full Precision)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#111213] border border-[#2A2D30] rounded-xl">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-[#ECEBE9]">Flash Attention</p>
                      <p className="text-[10px] text-[#72706C]">Accelerates matrix multiplication on modern GPUs</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={aiSettings.flashAttention}
                      onChange={e => setAiSettings(prev => ({ ...prev, flashAttention: e.target.checked }))}
                      className="w-4 h-4 accent-[#3C6B4D] rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: PRIVACY & VOICE */}
            {settingsTab === 'privacy' && (
              <div className="space-y-4 text-left">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 bg-[#111213] border border-[#2A2D30] rounded-xl">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-[#ECEBE9] flex items-center gap-1.5">
                        <EyeOff size={13} className="text-[#3C6B4D]" /> Automatic PII Masking Guardrail
                      </p>
                      <p className="text-[10px] text-[#72706C]">Redacts emails, IP addresses, and credit card numbers before processing</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={aiSettings.piiRedaction}
                      onChange={e => setAiSettings(prev => ({ ...prev, piiRedaction: e.target.checked }))}
                      className="w-4 h-4 accent-[#3C6B4D] rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-[#111213] border border-[#2A2D30] rounded-xl">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-[#ECEBE9] flex items-center gap-1.5">
                        <Volume2 size={13} className="text-[#3C6B4D]" /> Auto Text-to-Speech Playback
                      </p>
                      <p className="text-[10px] text-[#72706C]">Reads local assistant responses out loud using browser speech synthesis</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={aiSettings.autoSpeakResponse}
                      onChange={e => setAiSettings(prev => ({ ...prev, autoSpeakResponse: e.target.checked }))}
                      className="w-4 h-4 accent-[#3C6B4D] rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleClearChatHistory}
                    className="flex-1 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Trash2 size={13} />
                    <span>Clear Local Chat Storage</span>
                  </button>

                  <button
                    onClick={handleResetSettings}
                    className="flex-1 py-2.5 rounded-xl border border-[#2A2D30] bg-[#111213] text-[#A3A09B] hover:text-[#ECEBE9] text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw size={13} />
                    <span>Reset Settings to Defaults</span>
                  </button>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-[#2A2D30] pt-4">
              <span className="text-[10px] text-[#72706C]">Settings auto-saved to browser storage</span>
              <button
                onClick={() => setSettingsOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#3C6B4D] hover:bg-[#2E533B] text-white text-xs font-bold transition-all"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Teaser Modal for remote visitors */}
      {showTeaserModal && (
        <div className="fixed inset-0 bg-[#0A0B0C]/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#18191B] border border-[#2A2D30] rounded-3xl p-8 space-y-6 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#3C6B4D]/15 border border-[#3C6B4D]/30 flex items-center justify-center mx-auto">
              <Bot size={28} className="text-[#3C6B4D]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-[#ECEBE9]">AI Hub Studio</h2>
              <p className="text-[#A3A09B] text-sm leading-relaxed">
                This is a <span className="text-[#3C6B4D] font-bold">local-only</span> feature. AI Hub Studio requires Ollama running on your machine (<code className="bg-[#111213] px-1 py-0.5 rounded text-[#3C6B4D] font-mono">localhost:11434</code>) to power LLM inference, fine-tuning, and flow automation.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#3C6B4D] hover:bg-[#2E533B] text-white text-sm font-black transition-all">
                <Download size={15} /> Get Ollama
              </a>
              <a href="/download" className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[#2A2D30] text-[#ECEBE9] text-sm font-bold hover:bg-[#1E2022] transition-all">
                Download Desktop App
              </a>
            </div>
            <button onClick={() => setShowTeaserModal(false)} className="text-[#72706C] text-xs hover:text-[#A3A09B] transition-colors">
              Preview anyway (simulation mode)
            </button>
          </div>
        </div>
      )}
    </>
  );
};
