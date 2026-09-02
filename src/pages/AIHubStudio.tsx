import { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Bot,
  Sparkles,
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
  ChevronDown,
  ChevronUp,
  Zap,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Terminal,
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
  Eye,
  Globe,
  Activity,
  Network,
  ExternalLink
} from 'lucide-react';
import { aiService } from '../utils/aiService';
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
import { LocalAgentSwarmOrchestrator } from '../tools/ai/components/LocalAgentSwarmOrchestrator';
import { PromptOptimizationStudio } from '../tools/ai/components/PromptOptimizationStudio';
import { AudioSpeechStudio } from '../tools/ai/components/AudioSpeechStudio';
import { SyntheticDataGenerator } from '../tools/ai/components/SyntheticDataGenerator';
import { RAGVectorLabVisualizer } from '../tools/ai/components/RAGVectorLabVisualizer';
import { ModelQuantizationBenchmark } from '../tools/ai/components/ModelQuantizationBenchmark';
import { ContextWindowCompressor } from '../tools/ai/components/ContextWindowCompressor';
import { GGUFModelfileGenerator } from '../tools/ai/components/GGUFModelfileGenerator';
import { ModelTelemetryDashboard } from '../tools/ai/components/ModelTelemetryDashboard';
import { JsonSchemaFormGenerator } from '../tools/ai/components/JsonSchemaFormGenerator';
import { MultimodalDocumentExtractor } from '../tools/ai/components/MultimodalDocumentExtractor';
import { AgentFunctionPlayground } from '../tools/ai/components/AgentFunctionPlayground';
import { HallucinationAuditStudio } from '../tools/ai/components/HallucinationAuditStudio';
import { CodeRefactorTestStudio } from '../tools/ai/components/CodeRefactorTestStudio';
import { MultilingualTranslationMatrix } from '../tools/ai/components/MultilingualTranslationMatrix';
import { HardwareQuantCalculator } from '../tools/ai/components/HardwareQuantCalculator';
import { ModelManagerStudio } from '../tools/ai/components/ModelManagerStudio';
import { HuggingFaceModelHub } from '../tools/ai/components/HuggingFaceModelHub';
import { AdvancedFineTuneStudio } from '../tools/ai/components/AdvancedFineTuneStudio';
import { parseMarkdown } from '../utils/markdownParser';

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
  category: 'low-spec' | 'balanced' | 'coding' | 'vision' | 'heavy' | 'embedding';
}

const COMPATIBLE_MODEL_CATALOG: CatalogModel[] = [
  // ── LOW SPEC (≤3B) ──
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
    id: 'smollm2:1.7b',
    name: 'Hugging Face SmolLM2 1.7B',
    params: '1.7B',
    size: '1.0 GB',
    ram: '2GB - 4GB RAM',
    desc: 'Hugging Face compact model optimized for mobile and local browser environments.',
    tags: ['HuggingFace', 'SmolLM2', 'Mobile Friendly', 'Lightweight'],
    category: 'low-spec'
  },
  {
    id: 'gemma2:2b',
    name: 'Google Gemma 2 2B',
    params: '2.6B',
    size: '1.6 GB',
    ram: '4GB - 6GB RAM',
    desc: "Google's lightweight 2B parameter model built from Gemini technology research.",
    tags: ['Google', 'Gemma 2', 'Efficient', 'Fast Tokenizer'],
    category: 'low-spec'
  },
  {
    id: 'tinydolphin:2.8b',
    name: 'TinyDolphin 2.8B',
    params: '2.8B',
    size: '1.6 GB',
    ram: '4GB - 8GB RAM',
    desc: 'Cognitive Computation conversational model with fast chat responses on low-spec hardware.',
    tags: ['TinyDolphin', 'Conversational', 'Budget Laptops'],
    category: 'low-spec'
  },

  // ── BALANCED (3B - 7B) ──
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
    id: 'phi3:latest',
    name: 'Microsoft Phi-3 Mini 3.8B',
    params: '3.8B',
    size: '2.3 GB',
    ram: '4GB - 8GB RAM',
    desc: "Microsoft's high-density reasoning model optimized for synthetic dataset logic and math.",
    tags: ['Microsoft', 'Logic', 'Compact', 'Math Solver'],
    category: 'balanced'
  },
  {
    id: 'phi3.5:latest',
    name: 'Microsoft Phi-3.5 Mini 3.8B',
    params: '3.8B',
    size: '2.4 GB',
    ram: '4GB - 8GB RAM',
    desc: 'Updated Phi-3.5 Mini with improved 128k context and enhanced multi-turn dialogue logic.',
    tags: ['Microsoft', '128k Context', 'Multi-Turn', 'Reasoning'],
    category: 'balanced'
  },
  {
    id: 'qwen2.5:3b',
    name: 'Alibaba Qwen 2.5 3B',
    params: '3.0B',
    size: '1.9 GB',
    ram: '4GB - 8GB RAM',
    desc: 'Mid-range Qwen 2.5 with strong multilingual, math, and instruction capabilities.',
    tags: ['Alibaba', 'Multilingual', 'Balanced', 'Structured Data'],
    category: 'balanced'
  },
  {
    id: 'mistral:7b-instruct',
    name: 'Mistral 7B Instruct v0.3',
    params: '7.2B',
    size: '4.1 GB',
    ram: '8GB - 16GB RAM',
    desc: 'Classic 7B benchmark model with function calling and extended token vocabulary.',
    tags: ['Mistral AI', '7B Standard', 'Function Calling', 'Instruct'],
    category: 'balanced'
  },
  {
    id: 'stable-beluga:7b',
    name: 'Stable Beluga 7B',
    params: '7.0B',
    size: '3.8 GB',
    ram: '8GB - 16GB RAM',
    desc: 'Stability AI creative writing and conversational dialogue specialist.',
    tags: ['Stability AI', 'Creative Writing', 'Dialogue'],
    category: 'balanced'
  },

  // ── CODING SPECIALISTS ──
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
    id: 'qwen2.5-coder:7b',
    name: 'Qwen 2.5 Coder 7B',
    params: '7.6B',
    size: '4.7 GB',
    ram: '8GB - 16GB RAM',
    desc: 'Top-tier 7B programming LLM outperforming many closed API models on HumanEval benchmarks.',
    tags: ['Coding Leader', 'Multi-Language', 'Refactoring', 'SOTA 7B'],
    category: 'coding'
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
    id: 'deepseek-coder:1.3b',
    name: 'DeepSeek Coder 1.3B',
    params: '1.3B',
    size: '776 MB',
    ram: '2GB - 4GB RAM',
    desc: 'Fast inline code completion model trained on 2 trillion code tokens.',
    tags: ['DeepSeek', 'Inline Completion', 'Fast', 'Code Fill'],
    category: 'coding'
  },
  {
    id: 'deepseek-coder:6.7b',
    name: 'DeepSeek Coder 6.7B',
    params: '6.7B',
    size: '3.8 GB',
    ram: '8GB - 16GB RAM',
    desc: 'Powerful repository-level coding model supporting project-wide refactoring.',
    tags: ['DeepSeek', 'Repo Level', 'Debugging', 'Multi-Language'],
    category: 'coding'
  },
  {
    id: 'codellama:7b',
    name: 'Meta CodeLlama 7B',
    params: '7.0B',
    size: '3.8 GB',
    ram: '8GB - 16GB RAM',
    desc: "Meta's specialized CodeLlama fine-tuned for code generation and technical documentation.",
    tags: ['Meta', 'CodeLlama', 'Software Engineering', 'Infilling'],
    category: 'coding'
  },
  {
    id: 'codegemma:7b',
    name: 'Google CodeGemma 7B',
    params: '7.0B',
    size: '5.0 GB',
    ram: '8GB - 16GB RAM',
    desc: "Google's code-specialized Gemma model trained on code syntax and mathematical logic.",
    tags: ['Google', 'CodeGemma', 'Syntax Optimization', 'Math Logic'],
    category: 'coding'
  },

  // ── VISION / MULTIMODAL ──
  {
    id: 'llava:7b',
    name: 'Llava 7B Multimodal Vision',
    params: '7.0B',
    size: '4.5 GB',
    ram: '8GB - 16GB RAM',
    desc: 'Multimodal vision model capable of answering questions about uploaded images and diagrams.',
    tags: ['Vision', 'Multimodal', 'Image Captions', 'OCR'],
    category: 'vision'
  },
  {
    id: 'minicpm-v:8b',
    name: 'MiniCPM-V 8B Multimodal',
    params: '8.0B',
    size: '5.5 GB',
    ram: '10GB - 16GB RAM',
    desc: 'SOTA multimodal model with high-resolution image analysis and document OCR capabilities.',
    tags: ['OpenBMB', 'High-Res Vision', 'Document OCR', 'Chart QA'],
    category: 'vision'
  },
  {
    id: 'llama3.2-vision:11b',
    name: 'Meta Llama 3.2 11B Vision',
    params: '11.0B',
    size: '7.9 GB',
    ram: '16GB RAM',
    desc: "Meta's flagship vision-language model for complex image visual reasoning and document understanding.",
    tags: ['Meta', 'Llama 3.2 Vision', 'Chart Analysis', 'Flagship'],
    category: 'vision'
  },

  // ── HEAVY & REASONING (≥7B) ──
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
    id: 'deepseek-r1:7b',
    name: 'DeepSeek R1 Distill 7B',
    params: '7.0B',
    size: '4.7 GB',
    ram: '8GB - 16GB RAM',
    desc: '7B Reasoning powerhouse with step-by-step chain-of-thought verification for complex tasks.',
    tags: ['DeepSeek', 'R1 Reasoning', 'Math SOTA', 'CoT Thinking'],
    category: 'heavy'
  },
  {
    id: 'deepseek-r1:8b',
    name: 'DeepSeek R1 Distill Llama 8B',
    params: '8.0B',
    size: '4.9 GB',
    ram: '8GB - 16GB RAM',
    desc: 'DeepSeek R1 reasoning capability distilled into Meta Llama 3.1 8B architecture.',
    tags: ['DeepSeek', 'Llama Distill', 'Reasoning SOTA', 'CoT'],
    category: 'heavy'
  },
  {
    id: 'deepseek-r1:14b',
    name: 'DeepSeek R1 Distill 14B',
    params: '14.0B',
    size: '9.0 GB',
    ram: '16GB - 24GB RAM',
    desc: 'High-precision 14B reasoning model for advanced math proofs, coding logic, and strategy.',
    tags: ['DeepSeek', '14B Reasoning', 'Advanced Math', 'Strategy'],
    category: 'heavy'
  },
  {
    id: 'deepseek-r1:32b',
    name: 'DeepSeek R1 Distill 32B',
    params: '32.0B',
    size: '20.0 GB',
    ram: '32GB RAM',
    desc: 'Massive 32B reasoning distilled model rivaling frontier closed models on benchmark suites.',
    tags: ['DeepSeek', '32B Frontier', 'Expert Reasoning', 'Heavyweight'],
    category: 'heavy'
  },
  {
    id: 'llama3.1:8b',
    name: 'Meta Llama 3.1 8B',
    params: '8.0B',
    size: '4.7 GB',
    ram: '8GB - 16GB RAM',
    desc: "Meta's flagship 8B model with 128k context length and state-of-the-art instruction following.",
    tags: ['Meta', 'Llama 3.1', '128k Context', 'Workhorse'],
    category: 'heavy'
  },
  {
    id: 'gemma2:9b',
    name: 'Google Gemma 2 9B',
    params: '9.0B',
    size: '5.4 GB',
    ram: '10GB - 16GB RAM',
    desc: "Google's 9B model featuring sliding window attention and exceptional reasoning output.",
    tags: ['Google', 'Gemma 2 9B', 'High Accuracy', 'Research'],
    category: 'heavy'
  },
  {
    id: 'mistral-nemo:12b',
    name: 'Mistral NeMo 12B',
    params: '12.0B',
    size: '7.1 GB',
    ram: '16GB RAM',
    desc: 'Jointly developed by Mistral AI & NVIDIA. 128k context window and high multilingual performance.',
    tags: ['Mistral AI', 'NVIDIA', '128k Context', 'Multilingual'],
    category: 'heavy'
  },
  {
    id: 'command-r:35b',
    name: 'Cohere Command R 35B',
    params: '35.0B',
    size: '20.0 GB',
    ram: '32GB RAM',
    desc: "Cohere's enterprise RAG and tool-use model designed for complex multi-step workflows.",
    tags: ['Cohere', 'Enterprise RAG', 'Tool Use', '35B Heavy'],
    category: 'heavy'
  },

  // ── EMBEDDING & VECTOR MODELS ──
  {
    id: 'nomic-embed-text',
    name: 'Nomic Embed Text',
    params: '137M',
    size: '274 MB',
    ram: '1GB - 2GB RAM',
    desc: 'High-dimensional text embedding model tailored for RAG, vector search, and semantic similarity.',
    tags: ['Nomic', 'Embeddings', 'RAG Vector Search', 'Compact'],
    category: 'embedding'
  },
  {
    id: 'bge-small-en',
    name: 'BAAI BGE Small EN',
    params: '33M',
    size: '67 MB',
    ram: '512MB RAM',
    desc: 'Ultra-fast BAAI English embedding model for high-speed document indexing and search.',
    tags: ['BAAI', 'BGE Embeddings', 'Ultra-Fast', 'Low RAM'],
    category: 'embedding'
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
    'chat' | 'library' | 'huggingface' | 'train' | 'eval' | 'workflow' | 'docs' |
    'rag' | 'prompts' | 'extractor' | 'function-calling' | 'guardrails' |
    'code-patch' | 'router' | 'knowledge-graph' | 'vision-studio' | 'quant-calc' | 'model-settings' |
    'swarm' | 'prompt-opt' | 'audio-speech' | 'synth-data' | 'rag-lab' | 'quant-bench' | 'context-shrink' |
    'gguf-gen' | 'telemetry' | 'schema-form' | 'doc-extractor' | 'agent-func' | 'hallucination' | 'code-refactor' | 'multilingual'
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
  const [catalogFilter, setCatalogFilter] = useState<'all' | 'low-spec' | 'balanced' | 'coding' | 'vision' | 'heavy' | 'embedding'>('all');
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
  const [isChatHeaderMinimized, setIsChatHeaderMinimized] = useState<boolean>(false);
  const [showChatConfig, setShowChatConfig] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState(aiSettings.defaultSystemPrompt);
  const [temperature, setTemperature] = useState<number>(aiSettings.temperature);
  const [topP, setTopP] = useState<number>(aiSettings.topP);
  const [maxTokens, setMaxTokens] = useState<number>(aiSettings.maxTokens);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  // Save sessions to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('domodomo_aihub_sessions', JSON.stringify(sessions));
    } catch {}
  }, [sessions]);

  // Sync messages with active session
  useEffect(() => {
    if (isStreaming) return; // Do not thrash localStorage/sessions during token streaming
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
  }, [messages, activeSessionId, selectedModel, isStreaming]);

  // Handle New Chat Action
  const handleNewChat = () => {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: 'New Conversation',
      model: selectedModel,
      messages: [],
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    setMessages([]);
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



  // Accordion Collapsible Sections State (Emil Kowalski Design Engineering)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    train: false,
    vector: false,
    agent: false,
    safety: false,
    category_agents: false,
    category_prompt_data: false,
    category_multimodal: false,
    category_hardware: false,
    category_security_code: false,
    recents: false,
  });

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

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
  const checkOllama = useCallback(async (showCheckingState = false) => {
    if (showCheckingState) setOllamaStatus('checking');
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
          
          setModels(prev => {
            const prevStr = prev.map(m => `${m.name}:${m.size}`).join('|');
            const newStr = fetchedModels.map(m => `${m.name}:${m.size}`).join('|');
            if (prevStr === newStr) return prev;
            return fetchedModels;
          });

          if (fetchedModels.length > 0) {
            setSelectedModel(prev => {
              if (prev && fetchedModels.some(m => m.name === prev)) return prev;
              return fetchedModels[0].name;
            });
            setSecondaryModel(prev => {
              if (prev && fetchedModels.some(m => m.name === prev)) return prev;
              return fetchedModels[1]?.name || fetchedModels[0].name;
            });
          }
          setActiveOllamaUrl(endpoint);
          setOllamaStatus(prev => prev === 'connected' ? prev : 'connected');
          return;
        }
      } catch {
        // Try next candidate endpoint
      }
    }
    setOllamaStatus(prev => prev === 'offline' ? prev : 'offline');
  }, [aiSettings.ollamaEndpoint]);

  // Check Python FastAPI Backend Status across candidate endpoints
  const checkFastApi = useCallback(async (showCheckingState = false) => {
    if (showCheckingState) setFastApiStatus('checking');
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
          setFastApiStatus(prev => prev === 'connected' ? prev : 'connected');
          return;
        }
      } catch {
        // Try next candidate
      }
    }
    setFastApiStatus(prev => prev === 'offline' ? prev : 'offline');
  }, [aiSettings.fastApiEndpoint]);

  // Initial check & periodic status polling
  useEffect(() => {
    checkOllama(true);
    checkFastApi(true);

    const interval = setInterval(() => {
      checkOllama(false);
      checkFastApi(false);
    }, 15000);

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

// (Draw Loss Curve Canvas removed - handled inside AdvancedFineTuneStudio)

  const isOnlineWebHost = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

  // Handle Model Pull / Download
  const handleDownloadModel = async (modelName: string, onProgress?: (pct: number) => void) => {
    if (!modelName.trim()) return;
    if (isOnlineWebHost || ollamaStatus !== 'connected') {
      setShowLocalGuideModal(true);
      return;
    }
    setDownloadingModelId(modelName);
    setDownloadProgress(5);
    if (onProgress) onProgress(5);

    try {
      if (ollamaStatus === 'connected') {
        const response = await fetch(`${activeOllamaUrl}/api/pull`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: modelName, stream: true })
        });

        if (!response.ok) {
          throw new Error(`Failed to pull model: ${response.statusText}`);
        }

        if (response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          const layers: Record<string, { completed: number; total: number }> = {};

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.trim()) continue;
              try {
                const parsed = JSON.parse(line);
                if (parsed.error) {
                  throw new Error(parsed.error);
                }
                if (parsed.digest && parsed.total) {
                  layers[parsed.digest] = {
                    completed: parsed.completed || 0,
                    total: parsed.total || 0
                  };
                  const totalBytes = Object.values(layers).reduce((acc, l) => acc + l.total, 0);
                  const completedBytes = Object.values(layers).reduce((acc, l) => acc + l.completed, 0);
                  if (totalBytes > 0) {
                    const pct = Math.min(99, Math.max(1, Math.round((completedBytes / totalBytes) * 100)));
                    setDownloadProgress(pct);
                    if (onProgress) onProgress(pct);
                  }
                } else if (parsed.total && parsed.completed) {
                  const pct = Math.min(99, Math.max(1, Math.round((parsed.completed / parsed.total) * 100)));
                  setDownloadProgress(pct);
                  if (onProgress) onProgress(pct);
                } else if (parsed.status === 'success') {
                  setDownloadProgress(100);
                  if (onProgress) onProgress(100);
                }
              } catch (e: any) {
                if (e.message && !e.message.includes('JSON')) {
                  throw e;
                }
              }
            }
          }
        }
      } else {
        // Simulation progress for offline mode
        for (let p = 10; p <= 100; p += 15) {
          await new Promise(r => setTimeout(r, 250));
          setDownloadProgress(p);
          if (onProgress) onProgress(p);
        }
      }

      await checkOllama();
      setSelectedModel(modelName);
      setCustomPullInput('');
    } catch (err: any) {
      console.error('Error downloading model:', err);
      throw err;
    } finally {
      setDownloadingModelId(null);
      setDownloadProgress(0);
      if (onProgress) onProgress(0);
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
        let lastStateUpdate = 0;

        const flushThrottledState = (force = false) => {
          const now = performance.now();
          if (force || now - lastStateUpdate > 33) {
            lastStateUpdate = now;
            const currentSnapshot = fullText;
            setMessages(prev =>
              prev.map(m => (m.id === assistantMsgId ? { ...m, content: currentSnapshot } : m))
            );
          }
        };

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
                flushThrottledState(false);
              }
            } catch {
              // Ignore partial JSON chunks
            }
          }
        }
        flushThrottledState(true);

        const endTime = performance.now();
        const totalSec = (endTime - startTime) / 1000;
        const tps = totalSec > 0 ? Math.round(tokenCount / totalSec) : 0;
        const lat = Math.round(endTime - startTime);

        setMessages(prev =>
          prev.map(m => (m.id === assistantMsgId ? { ...m, content: fullText, tokensPerSec: tps, latencyMs: lat } : m))
        );

        if (aiSettings.autoSpeakResponse && fullText) {
          toggleSpeech(assistantMsgId, fullText);
        }
      } else {
        // Fallback simulation mode
        const simulatedResp = `[Local Offline Simulation · Model: ${selectedModel}] Here is the response to your prompt. When Ollama is running on ${aiSettings.ollamaEndpoint}, inference streams directly from your hardware without sending data to cloud servers.`;
        let currentText = '';

        for (let i = 0; i < simulatedResp.length; i += 3) {
          await new Promise(r => setTimeout(r, 20));
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
  "name": "domodomo-fine-tuned:latest",
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
                <button onClick={() => checkOllama(true)} className="p-0.5 text-[#72706C] hover:text-[#ECEBE9]" title="Refresh Ollama">
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
                <button onClick={() => checkFastApi(true)} className="p-0.5 text-[#72706C] hover:text-[#ECEBE9]" title="Check Python ML status">
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

            {/* DomoSkills Marketplace */}
            <a
              href="https://web-beta-six-81.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-2.5 py-2 rounded-lg text-[13px] font-semibold text-[#ECEBE9] bg-[#1E2022]/60 hover:bg-[#1E2022] border border-[#2A2D30] hover:border-[#3C6B4D]/50 transition-all group"
              title="DomoSkills — The Open Agent Skills Marketplace (External Webapp)"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Sparkles size={15} className="shrink-0 text-emerald-400 group-hover:rotate-12 transition-transform" />
                {!sidebarCollapsed && <span className="truncate">DomoSkills</span>}
              </div>
              {!sidebarCollapsed && (
                <ExternalLink size={12} className="text-[#72706C] group-hover:text-emerald-400 transition-colors" />
              )}
            </a>
          </nav>

          {/* Section: Train & Flow */}
          <div className="px-2 mt-1">
            {!sidebarCollapsed && (
              <button
                onClick={() => toggleSection('train')}
                className="w-full flex items-center justify-between text-[10px] font-bold text-[#72706C] hover:text-[#ECEBE9] uppercase tracking-widest px-1 py-1 mb-1 transition-colors cursor-pointer active:scale-[0.98]"
              >
                <span>Train &amp; Flow</span>
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-200 ease-[var(--ease-out)] ${
                    collapsedSections.train ? '-rotate-90 text-[#72706C]' : 'rotate-0 text-[#3C6B4D]'
                  }`}
                />
              </button>
            )}
            <div className={`emil-accordion-grid ${collapsedSections.train && !sidebarCollapsed ? 'collapsed' : ''}`}>
              <div className="emil-accordion-content flex flex-col gap-0.5">
                <button
                  onClick={() => setActiveTab('library')}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-160 ease-[var(--ease-out)] active:scale-[0.97] ${
                    activeTab === 'library'
                      ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]'
                      : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                  }`}
                  title="Model Library & Downloader"
                >
                  <Download size={14} className="shrink-0" />
                  {!sidebarCollapsed && <span>Model Library</span>}
                </button>

                <button
                  onClick={() => setActiveTab('huggingface')}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-160 ease-[var(--ease-out)] active:scale-[0.97] ${
                    activeTab === 'huggingface'
                      ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]'
                      : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                  }`}
                  title="HuggingFace Model Hub"
                >
                  <Globe size={14} className="shrink-0" />
                  {!sidebarCollapsed && <span>HuggingFace Hub</span>}
                </button>

                <button
                  onClick={() => setActiveTab('train')}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-160 ease-[var(--ease-out)] active:scale-[0.97] ${
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
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-160 ease-[var(--ease-out)] active:scale-[0.97] ${
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
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-160 ease-[var(--ease-out)] active:scale-[0.97] ${
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
          </div>

          {/* Section: Data & Vectors */}
          <div className="px-2 mt-2">
            {!sidebarCollapsed && (
              <button
                onClick={() => toggleSection('vector')}
                className="w-full flex items-center justify-between text-[10px] font-bold text-[#72706C] hover:text-[#ECEBE9] uppercase tracking-widest px-1 py-1 mb-1 transition-colors cursor-pointer active:scale-[0.98]"
              >
                <span>Vector &amp; Data</span>
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-200 ease-[var(--ease-out)] ${
                    collapsedSections.vector ? '-rotate-90 text-[#72706C]' : 'rotate-0 text-[#3C6B4D]'
                  }`}
                />
              </button>
            )}
            <div className={`emil-accordion-grid ${collapsedSections.vector && !sidebarCollapsed ? 'collapsed' : ''}`}>
              <div className="emil-accordion-content flex flex-col gap-0.5">
                <button
                  onClick={() => setActiveTab('rag')}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-160 ease-[var(--ease-out)] active:scale-[0.97] ${
                    activeTab === 'rag' ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]' : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                  }`}
                  title="RAG Vector Search Studio"
                >
                  <Database size={14} className="shrink-0 text-purple-400" />
                  {!sidebarCollapsed && <span>RAG Search Studio</span>}
                </button>

                <button
                  onClick={() => setActiveTab('extractor')}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-160 ease-[var(--ease-out)] active:scale-[0.97] ${
                    activeTab === 'extractor' ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]' : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                  }`}
                  title="Structured JSON Extractor"
                >
                  <FileCode size={14} className="shrink-0 text-blue-400" />
                  {!sidebarCollapsed && <span>JSON Extractor</span>}
                </button>

                <button
                  onClick={() => setActiveTab('knowledge-graph')}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-160 ease-[var(--ease-out)] active:scale-[0.97] ${
                    activeTab === 'knowledge-graph' ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]' : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                  }`}
                  title="Knowledge Graph Visualizer"
                >
                  <Layers size={14} className="shrink-0 text-amber-400" />
                  {!sidebarCollapsed && <span>Knowledge Graph</span>}
                </button>
              </div>
            </div>
          </div>

          {/* Section: Agent & Developer */}
          <div className="px-2 mt-2">
            {!sidebarCollapsed && (
              <button
                onClick={() => toggleSection('agent')}
                className="w-full flex items-center justify-between text-[10px] font-bold text-[#72706C] hover:text-[#ECEBE9] uppercase tracking-widest px-1 py-1 mb-1 transition-colors cursor-pointer active:scale-[0.98]"
              >
                <span>Agent &amp; Dev</span>
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-200 ease-[var(--ease-out)] ${
                    collapsedSections.agent ? '-rotate-90 text-[#72706C]' : 'rotate-0 text-[#3C6B4D]'
                  }`}
                />
              </button>
            )}
            <div className={`emil-accordion-grid ${collapsedSections.agent && !sidebarCollapsed ? 'collapsed' : ''}`}>
              <div className="emil-accordion-content flex flex-col gap-0.5">
                <button
                  onClick={() => setActiveTab('prompts')}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-160 ease-[var(--ease-out)] active:scale-[0.97] ${
                    activeTab === 'prompts' ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]' : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                  }`}
                  title="Prompt Engineering Lab"
                >
                  <Wand2 size={14} className="shrink-0 text-emerald-400" />
                  {!sidebarCollapsed && <span>Prompt Lab</span>}
                </button>

                <button
                  onClick={() => setActiveTab('function-calling')}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-160 ease-[var(--ease-out)] active:scale-[0.97] ${
                    activeTab === 'function-calling' ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]' : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                  }`}
                  title="Function Calling Studio"
                >
                  <Zap size={14} className="shrink-0 text-amber-400" />
                  {!sidebarCollapsed && <span>Function Calling</span>}
                </button>

                <button
                  onClick={() => setActiveTab('code-patch')}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-160 ease-[var(--ease-out)] active:scale-[0.97] ${
                    activeTab === 'code-patch' ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]' : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                  }`}
                  title="Code Refactoring & AI Patch"
                >
                  <Code size={14} className="shrink-0 text-cyan-400" />
                  {!sidebarCollapsed && <span>Code AI Patch</span>}
                </button>
              </div>
            </div>
          </div>

          {/* Section: Safety & System */}
          <div className="px-2 mt-2">
            {!sidebarCollapsed && (
              <button
                onClick={() => toggleSection('safety')}
                className="w-full flex items-center justify-between text-[10px] font-bold text-[#72706C] hover:text-[#ECEBE9] uppercase tracking-widest px-1 py-1 mb-1 transition-colors cursor-pointer active:scale-[0.98]"
              >
                <span>Safety &amp; Hardware</span>
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-200 ease-[var(--ease-out)] ${
                    collapsedSections.safety ? '-rotate-90 text-[#72706C]' : 'rotate-0 text-[#3C6B4D]'
                  }`}
                />
              </button>
            )}
            <div className={`emil-accordion-grid ${collapsedSections.safety && !sidebarCollapsed ? 'collapsed' : ''}`}>
              <div className="emil-accordion-content flex flex-col gap-0.5">
                <button
                  onClick={() => setActiveTab('guardrails')}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-160 ease-[var(--ease-out)] active:scale-[0.97] ${
                    activeTab === 'guardrails' ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]' : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                  }`}
                  title="AI Guardrails Inspector"
                >
                  <ShieldCheck size={14} className="shrink-0 text-rose-400" />
                  {!sidebarCollapsed && <span>AI Guardrails</span>}
                </button>

                <button
                  onClick={() => setActiveTab('router')}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-160 ease-[var(--ease-out)] active:scale-[0.97] ${
                    activeTab === 'router' ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]' : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                  }`}
                  title="Multi-Model Router"
                >
                  <Workflow size={14} className="shrink-0 text-teal-400" />
                  {!sidebarCollapsed && <span>Model Router</span>}
                </button>

                <button
                  onClick={() => setActiveTab('vision-studio')}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-160 ease-[var(--ease-out)] active:scale-[0.97] ${
                    activeTab === 'vision-studio' ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]' : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                  }`}
                  title="Vision & Multimodal Studio"
                >
                  <Eye size={14} className="shrink-0 text-indigo-400" />
                  {!sidebarCollapsed && <span>Vision Studio</span>}
                </button>

                <button
                  onClick={() => setActiveTab('quant-calc')}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-160 ease-[var(--ease-out)] active:scale-[0.97] ${
                    activeTab === 'quant-calc' ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]' : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                  }`}
                  title="Quantization & VRAM Calculator"
                >
                  <Gauge size={14} className="shrink-0 text-[#3C6B4D]" />
                  {!sidebarCollapsed && <span>VRAM Calculator</span>}
                </button>

                <button
                  onClick={() => setActiveTab('model-settings')}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-160 ease-[var(--ease-out)] active:scale-[0.97] ${
                    activeTab === 'model-settings' ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]' : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                  }`}
                  title="Model Settings & Storage Manager"
                >
                  <Settings size={14} className="shrink-0 text-amber-400" />
                  {!sidebarCollapsed && <span>Model Settings</span>}
                </button>
              </div>
            </div>
          </div>

          {/* Section 1: Multi-Agent & Orchestration */}
          <div className="px-2 mt-2">
            {!sidebarCollapsed && (
              <button
                onClick={() => toggleSection('category_agents')}
                className="w-full flex items-center justify-between text-[10px] font-bold text-[#72706C] hover:text-[#ECEBE9] uppercase tracking-widest px-1 py-1 mb-1 transition-colors cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Network size={12} className="text-purple-400 shrink-0" />
                  <span className="truncate">AGENT SWARMS</span>
                </div>
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-200 ease-[var(--ease-out)] shrink-0 ${
                    collapsedSections.category_agents ? '-rotate-90 text-[#72706C]' : 'rotate-0 text-[#3C6B4D]'
                  }`}
                />
              </button>
            )}
            <div className={`emil-accordion-grid ${collapsedSections.category_agents && !sidebarCollapsed ? 'collapsed' : ''}`}>
              <div className="emil-accordion-content flex flex-col gap-0.5">
                {[
                  { id: 'swarm', label: 'Agent Swarm', icon: Network, color: 'text-purple-400' },
                  { id: 'agent-func', label: 'Function Sandbox', icon: Zap, color: 'text-[#3C6B4D]' },
                ].map((tool) => {
                  const IconC = tool.icon;
                  const isActive = activeTab === tool.id;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => setActiveTab(tool.id as any)}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-160 ease-[var(--ease-out)] active:scale-[0.97] ${
                        isActive ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]' : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                      }`}
                      title={tool.label}
                    >
                      <IconC size={14} className={`shrink-0 ${tool.color}`} />
                      {!sidebarCollapsed && <span>{tool.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 2: Prompt & Data Engineering */}
          <div className="px-2 mt-2">
            {!sidebarCollapsed && (
              <button
                onClick={() => toggleSection('category_prompt_data')}
                className="w-full flex items-center justify-between text-[10px] font-bold text-[#72706C] hover:text-[#ECEBE9] uppercase tracking-widest px-1 py-1 mb-1 transition-colors cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Wand2 size={12} className="text-[#3C6B4D] shrink-0" />
                  <span className="truncate">PROMPT &amp; DATA</span>
                </div>
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-200 ease-[var(--ease-out)] shrink-0 ${
                    collapsedSections.category_prompt_data ? '-rotate-90 text-[#72706C]' : 'rotate-0 text-[#3C6B4D]'
                  }`}
                />
              </button>
            )}
            <div className={`emil-accordion-grid ${collapsedSections.category_prompt_data && !sidebarCollapsed ? 'collapsed' : ''}`}>
              <div className="emil-accordion-content flex flex-col gap-0.5">
                {[
                  { id: 'prompt-opt', label: 'Prompt Auto-Tuner', icon: Wand2, color: 'text-[#3C6B4D]' },
                  { id: 'synth-data', label: 'Dataset Synthesizer', icon: Database, color: 'text-blue-400' },
                  { id: 'schema-form', label: 'JSON Form Generator', icon: FileCode, color: 'text-teal-400' },
                ].map((tool) => {
                  const IconC = tool.icon;
                  const isActive = activeTab === tool.id;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => setActiveTab(tool.id as any)}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-160 ease-[var(--ease-out)] active:scale-[0.97] ${
                        isActive ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]' : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                      }`}
                      title={tool.label}
                    >
                      <IconC size={14} className={`shrink-0 ${tool.color}`} />
                      {!sidebarCollapsed && <span>{tool.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: RAG, Multimodal & Speech */}
          <div className="px-2 mt-2">
            {!sidebarCollapsed && (
              <button
                onClick={() => toggleSection('category_multimodal')}
                className="w-full flex items-center justify-between text-[10px] font-bold text-[#72706C] hover:text-[#ECEBE9] uppercase tracking-widest px-1 py-1 mb-1 transition-colors cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Layers size={12} className="text-emerald-400 shrink-0" />
                  <span className="truncate">RAG &amp; MULTIMODAL</span>
                </div>
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-200 ease-[var(--ease-out)] shrink-0 ${
                    collapsedSections.category_multimodal ? '-rotate-90 text-[#72706C]' : 'rotate-0 text-[#3C6B4D]'
                  }`}
                />
              </button>
            )}
            <div className={`emil-accordion-grid ${collapsedSections.category_multimodal && !sidebarCollapsed ? 'collapsed' : ''}`}>
              <div className="emil-accordion-content flex flex-col gap-0.5">
                {[
                  { id: 'rag-lab', label: 'RAG Vector Lab', icon: Layers, color: 'text-emerald-400' },
                  { id: 'audio-speech', label: 'Audio & STT/TTS', icon: Mic, color: 'text-amber-400' },
                  { id: 'doc-extractor', label: 'Vision OCR Parser', icon: Eye, color: 'text-indigo-400' },
                ].map((tool) => {
                  const IconC = tool.icon;
                  const isActive = activeTab === tool.id;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => setActiveTab(tool.id as any)}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-160 ease-[var(--ease-out)] active:scale-[0.97] ${
                        isActive ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]' : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                      }`}
                      title={tool.label}
                    >
                      <IconC size={14} className={`shrink-0 ${tool.color}`} />
                      {!sidebarCollapsed && <span>{tool.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 4: Hardware & Telemetry Profiling */}
          <div className="px-2 mt-2">
            {!sidebarCollapsed && (
              <button
                onClick={() => toggleSection('category_hardware')}
                className="w-full flex items-center justify-between text-[10px] font-bold text-[#72706C] hover:text-[#ECEBE9] uppercase tracking-widest px-1 py-1 mb-1 transition-colors cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Activity size={12} className="text-[#3C6B4D] shrink-0" />
                  <span className="truncate">HARDWARE &amp; TELEMETRY</span>
                </div>
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-200 ease-[var(--ease-out)] shrink-0 ${
                    collapsedSections.category_hardware ? '-rotate-90 text-[#72706C]' : 'rotate-0 text-[#3C6B4D]'
                  }`}
                />
              </button>
            )}
            <div className={`emil-accordion-grid ${collapsedSections.category_hardware && !sidebarCollapsed ? 'collapsed' : ''}`}>
              <div className="emil-accordion-content flex flex-col gap-0.5">
                {[
                  { id: 'telemetry', label: 'VRAM Telemetry', icon: Activity, color: 'text-[#3C6B4D]' },
                  { id: 'quant-bench', label: 'Quant Auditor', icon: Gauge, color: 'text-rose-400' },
                  { id: 'context-shrink', label: 'Context Shrinker', icon: Sliders, color: 'text-[#3C6B4D]' },
                  { id: 'gguf-gen', label: 'Modelfile Generator', icon: Terminal, color: 'text-cyan-400' },
                ].map((tool) => {
                  const IconC = tool.icon;
                  const isActive = activeTab === tool.id;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => setActiveTab(tool.id as any)}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-160 ease-[var(--ease-out)] active:scale-[0.97] ${
                        isActive ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]' : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                      }`}
                      title={tool.label}
                    >
                      <IconC size={14} className={`shrink-0 ${tool.color}`} />
                      {!sidebarCollapsed && <span>{tool.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 5: Security, Code & Localization */}
          <div className="px-2 mt-2">
            {!sidebarCollapsed && (
              <button
                onClick={() => toggleSection('category_security_code')}
                className="w-full flex items-center justify-between text-[10px] font-bold text-[#72706C] hover:text-[#ECEBE9] uppercase tracking-widest px-1 py-1 mb-1 transition-colors cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <ShieldCheck size={12} className="text-rose-400 shrink-0" />
                  <span className="truncate">SECURITY &amp; CODE</span>
                </div>
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-200 ease-[var(--ease-out)] shrink-0 ${
                    collapsedSections.category_security_code ? '-rotate-90 text-[#72706C]' : 'rotate-0 text-[#3C6B4D]'
                  }`}
                />
              </button>
            )}
            <div className={`emil-accordion-grid ${collapsedSections.category_security_code && !sidebarCollapsed ? 'collapsed' : ''}`}>
              <div className="emil-accordion-content flex flex-col gap-0.5">
                {[
                  { id: 'hallucination', label: 'Hallucination Audit', icon: ShieldCheck, color: 'text-rose-400' },
                  { id: 'code-refactor', label: 'Code & Unit Tests', icon: Code, color: 'text-blue-400' },
                  { id: 'multilingual', label: 'Translation Matrix', icon: Globe, color: 'text-purple-400' },
                ].map((tool) => {
                  const IconC = tool.icon;
                  const isActive = activeTab === tool.id;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => setActiveTab(tool.id as any)}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-160 ease-[var(--ease-out)] active:scale-[0.97] ${
                        isActive ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]' : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                      }`}
                      title={tool.label}
                    >
                      <IconC size={14} className={`shrink-0 ${tool.color}`} />
                      {!sidebarCollapsed && <span>{tool.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recents Sessions */}
          {!sidebarCollapsed && (
            <div className="px-2 mt-3 flex-1 overflow-y-auto">
              <div className="w-full flex items-center justify-between text-[10px] font-bold text-[#72706C] hover:text-[#ECEBE9] uppercase tracking-widest px-1 py-1 mb-1 transition-colors">
                <div
                  onClick={() => toggleSection('recents')}
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  <span>Recents</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleNewChat(); }}
                    className="p-0.5 text-[#72706C] hover:text-[#ECEBE9] transition-colors"
                    title="New Chat"
                  >
                    <Plus size={11} />
                  </button>
                  <button
                    onClick={() => toggleSection('recents')}
                    className="p-0.5 text-[#72706C] hover:text-[#ECEBE9] transition-colors"
                    title="Toggle Recents"
                  >
                    <ChevronDown
                      size={12}
                      className={`transition-transform duration-200 ease-[var(--ease-out)] ${
                        collapsedSections.recents ? '-rotate-90 text-[#72706C]' : 'rotate-0 text-[#3C6B4D]'
                      }`}
                    />
                  </button>
                </div>
              </div>
              <div className={`emil-accordion-grid ${collapsedSections.recents ? 'collapsed' : ''}`}>
                <div className="emil-accordion-content">
                  {sessions.length === 0 ? (
                    <p className="text-[11px] text-[#72706C] px-1 py-1">No saved sessions</p>
                  ) : (
                    <div className="flex flex-col gap-0.5">
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          onClick={() => handleSelectSession(session.id)}
                          className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] cursor-pointer transition-all duration-160 ease-[var(--ease-out)] active:scale-[0.97] ${
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
              </div>
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
                  <button onClick={() => checkOllama(true)} className="text-[#3C6B4D] font-bold">Refresh</button>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#72706C]">
                  <span>Python ML: {fastApiStatus}</span>
                  <button onClick={() => checkFastApi(true)} className="text-[#3C6B4D]">Check</button>
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
          <div className="sticky top-0 z-30 bg-[#18191B] border-b border-[#2A2D30] px-3 sm:px-4 md:px-6 h-11 flex items-center justify-between">
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
                {activeTab === 'huggingface' && 'HuggingFace Model Hub'}
                {activeTab === 'train' && 'Advanced Fine-Tune Studio'}
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
              <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border max-w-[140px] xs:max-w-[180px] sm:max-w-none ${
                ollamaStatus === 'connected'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-[#1E2022] border-[#2A2D30] text-[#72706C]'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ollamaStatus === 'connected' ? 'bg-emerald-500' : 'bg-[#2A2D30]'}`} />
                <span className="truncate">
                  {ollamaStatus === 'connected' ? `Ollama · ${selectedModel}` : 'Ollama Offline'}
                </span>
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

          {/* Mobile Quick Tab Switcher Strip */}
          <div className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-[#111213] border-b border-[#2A2D30] overflow-x-auto scrollbar-none shrink-0">
            {[
              { id: 'chat', label: 'Chat', icon: MessageSquare },
              { id: 'prompts', label: 'Prompt Lab', icon: Wand2 },
              { id: 'rag', label: 'RAG Search', icon: Database },
              { id: 'library', label: 'Models', icon: Download },
              { id: 'huggingface', label: 'HuggingFace', icon: Globe },
              { id: 'train', label: 'Fine-Tune', icon: Sparkles },
              { id: 'guardrails', label: 'Guardrails', icon: ShieldCheck },
              { id: 'code-patch', label: 'Code Patch', icon: Code },
              { id: 'vision-studio', label: 'Vision', icon: Eye },
              { id: 'workflow', label: 'Flow Studio', icon: Workflow },
              { id: 'extractor', label: 'JSON', icon: FileCode },
              { id: 'function-calling', label: 'Functions', icon: Zap },
              { id: 'quant-calc', label: 'VRAM Calc', icon: Gauge },
            ].map(item => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-[#3C6B4D] text-white shadow-sm'
                      : 'bg-[#18191B] border border-[#2A2D30] text-[#72706C] hover:text-[#ECEBE9]'
                  }`}
                >
                  <IconComp size={12} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB CONTENT — scrollable */}
          <div className="p-3 sm:p-5 md:p-6 space-y-4 sm:space-y-6">



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
              <div className="flex flex-col h-[calc(100dvh-130px)] md:h-[calc(100vh-148px)] min-h-[480px] gap-3 sm:gap-4">
                {/* Header Model Selection Bar for New Chat */}
                <div className="flex items-center justify-between gap-2 bg-[#18191B] border border-[#2A2D30] px-3 sm:px-4 py-2 rounded-2xl shrink-0 animate-fadeIn">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <button
                      onClick={handleNewChat}
                      className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#3C6B4D] hover:bg-[#2E533B] text-white text-xs font-bold transition-all shadow-md shrink-0"
                    >
                      <Plus size={14} />
                      <span className="hidden xs:inline">New Chat</span>
                      <span className="xs:hidden">New</span>
                    </button>
                    <div className="h-4 w-px bg-[#2A2D30] shrink-0" />
                    <select
                      value={selectedModel}
                      onChange={e => setSelectedModel(e.target.value)}
                      className="bg-[#111213] border border-[#2A2D30] rounded-xl px-2.5 py-1 text-xs text-[#ECEBE9] font-bold focus:outline-none focus:border-[#3C6B4D] truncate flex-1 max-w-[170px] sm:max-w-[260px]"
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

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setChatInput('Generate a conventional git commit message for these changes:\n- Add dynamic Ollama model selector\n- Add PII redaction guardrail\n- Add voice dictation and file drop context')}
                      className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D]/50 text-xs text-[#A3A09B] hover:text-[#ECEBE9] font-bold transition-all"
                      title="Git Commit Template"
                    >
                      <GitCommit size={13} className="text-[#3C6B4D]" />
                      <span>Git Commit</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('library')}
                      className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#3C6B4D]/15 border border-[#3C6B4D]/35 text-[#3C6B4D] hover:bg-[#3C6B4D]/25 text-xs font-bold transition-all"
                    >
                      <Download size={12} />
                      <span>Pull Model</span>
                    </button>

                    <button
                      onClick={() => setIsChatHeaderMinimized(p => !p)}
                      className="p-1.5 rounded-xl bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D]/50 text-[#72706C] hover:text-[#ECEBE9] transition-all"
                      title={isChatHeaderMinimized ? 'Expand Header' : 'Minimize Header'}
                    >
                      {isChatHeaderMinimized ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
                    </button>
                  </div>
                </div>

                {/* Chat Message List */}
                <div ref={chatListRef} className="flex-1 overflow-y-auto space-y-4 pr-1">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center min-h-[320px] h-full text-center gap-4 py-4 px-2 my-auto">
                      <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full bg-[#3C6B4D]/20 blur-xl animate-pulse-slow" />
                        <div className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#3C6B4D]/25 to-[#18191B] border border-[#3C6B4D]/40 flex items-center justify-center shadow-xl">
                          <Bot size={28} className="sm:hidden text-[#3C6B4D]" />
                          <Bot size={38} className="hidden sm:block text-[#3C6B4D]" />
                          <div className="absolute -top-1 -right-1 p-1 bg-[#18191B] border border-[#3C6B4D]/40 rounded-full">
                            <Sparkles size={11} className="text-amber-400" />
                          </div>
                        </div>
                      </div>

                      <div className="max-w-md px-2">
                        <h2 className="text-[#ECEBE9] font-black text-lg sm:text-xl tracking-tight leading-snug">What would you like to build today?</h2>
                        <p className="text-[#72706C] text-[11px] sm:text-xs mt-1 leading-relaxed">
                          Connected model: <span className="text-[#3C6B4D] font-mono font-bold">{selectedModel}</span> · 100% Client-Side Local Execution
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:gap-3 max-w-xl w-full mt-1">
                        {[
                          {
                            category: 'Engineering',
                            icon: Code,
                            title: 'Python Web Scraper',
                            prompt: 'Write an asynchronous Python script using Playwright for scraping with rate limiting & error retries.'
                          },
                          {
                            category: 'AI Architecture',
                            icon: Workflow,
                            title: 'LoRA vs RAG Guide',
                            prompt: 'Explain the technical differences between LoRA fine-tuning and RAG vector retrieval step-by-step.'
                          },
                          {
                            category: 'Security',
                            icon: ShieldCheck,
                            title: 'Code Security Audit',
                            prompt: 'Audit JavaScript code for common vulnerability patterns including XSS, prototype pollution, and SQL injection.'
                          },
                          {
                            category: 'Data Science',
                            icon: Database,
                            title: 'Pandas Data Cleaning',
                            prompt: 'Write a Pandas data pipeline to handle missing values, normalize timestamps, and detect outliers.'
                          }
                        ].map((card, idx) => {
                          const IconComp = card.icon;
                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                setChatInput(card.prompt);
                              }}
                              className="group p-3.5 rounded-2xl bg-[#18191B] border border-[#2A2D30] hover:border-[#3C6B4D]/60 hover:bg-[#1E2022] transition-all text-left flex flex-col justify-between gap-2 shadow-sm hover:shadow-md"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono font-bold text-[#3C6B4D] bg-[#3C6B4D]/10 px-2 py-0.5 rounded-full border border-[#3C6B4D]/20">
                                  {card.category}
                                </span>
                                <IconComp size={14} className="text-[#72706C] group-hover:text-[#3C6B4D] transition-colors" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-[#ECEBE9] group-hover:text-white transition-colors">{card.title}</p>
                                <p className="text-[11px] text-[#72706C] line-clamp-2 mt-0.5 leading-snug">{card.prompt}</p>
                              </div>
                            </button>
                          );
                        })}
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
                      <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#3C6B4D]/20 border border-[#3C6B4D]/30 text-[#ECEBE9] rounded-tr-sm'
                          : 'bg-[#18191B] border border-[#2A2D30] text-[#ECEBE9] rounded-tl-sm'
                      }`}>
                        {msg.sender === 'user' ? (
                          <p className="whitespace-pre-wrap font-sans">{msg.content}</p>
                        ) : (
                          <div
                            dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}
                            className="markdown-chat-content"
                          />
                        )}
                        {msg.sender === 'assistant' && (
                          <div className="mt-2 text-[10px] font-mono text-[#72706C] flex items-center justify-between border-t border-[#2A2D30]/60 pt-1.5">
                            <div className="flex items-center gap-3">
                              <span>Model: {msg.modelUsed || selectedModel}</span>
                              {msg.tokensPerSec !== undefined && <span>Speed: {msg.tokensPerSec} tok/s</span>}
                              {msg.latencyMs !== undefined && <span>Latency: {msg.latencyMs}ms</span>}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(msg.content);
                                  setCopiedMsgId(msg.id);
                                  setTimeout(() => setCopiedMsgId(null), 2000);
                                }}
                                className="p-1 text-[#72706C] hover:text-[#ECEBE9] transition-colors"
                                title="Copy message content"
                              >
                                {copiedMsgId === msg.id ? <Check size={12} className="text-[#3C6B4D]" /> : <Copy size={12} />}
                              </button>
                              <button
                                onClick={() => toggleSpeech(msg.id, msg.content)}
                                className="p-1 text-[#72706C] hover:text-[#ECEBE9] transition-colors"
                                title="Read out loud"
                              >
                                {speakingMsgId === msg.id ? <VolumeX size={12} className="text-[#3C6B4D]" /> : <Volume2 size={12} />}
                              </button>
                            </div>
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
                <div className="bg-[#18191B] border border-[#2A2D30] focus-within:border-[#3C6B4D]/70 focus-within:shadow-[0_0_20px_rgba(60,107,77,0.12)] rounded-2xl p-3 flex gap-3 items-end transition-all">
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
                      onClick={() => setShowChatConfig(prev => !prev)}
                      className={`p-2 rounded-xl transition-all ${
                        showChatConfig ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]' : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#2A2D30]'
                      }`}
                      title="Toggle Inference Options (Temperature, Tokens, PII)"
                    >
                      <SlidersIcon size={15} />
                    </button>

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
                {showChatConfig && (
                  <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#72706C] px-3 py-2 bg-[#18191B] border border-[#2A2D30] rounded-xl animate-fadeIn shrink-0">
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
                )}
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
                  <div className="flex flex-wrap gap-2">
                    {(['all', 'low-spec', 'balanced', 'coding', 'vision', 'heavy', 'embedding'] as const).map(f => (
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

            {/* ── HUGGINGFACE MODEL HUB TAB ── */}
            {activeTab === 'huggingface' && (
              <HuggingFaceModelHub
                ollamaModels={models.map(m => m.name)}
                onModelPulled={() => {
                  if (typeof window !== 'undefined') {
                    aiService.checkOllama().then(res => {
                      if (res.status) {
                        setModels(res.models.map(m => ({ name: m, size: 0, modified_at: '', digest: '' })));
                      }
                    });
                  }
                }}
              />
            )}

            {/* ── TRAIN / FINE-TUNE TAB (Advanced Fine-Tune Studio) ── */}
            {activeTab === 'train' && (
              <AdvancedFineTuneStudio
                selectedModel={selectedModel}
                models={models.map(m => m.name)}
                systemPrompt={systemPrompt}
                temperature={temperature}
                topP={topP}
                activeFastApiUrl={activeFastApiUrl}
                datasetPairs={datasetPairs}
                setDatasetPairs={setDatasetPairs}
              />
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
            {activeTab === 'model-settings' && (
              <ModelManagerStudio
                selectedModel={selectedModel}
                installedModels={models.map(m => m.name)}
                onSelectGlobalModel={setSelectedModel}
                onRefreshModels={() => checkOllama(true)}
              />
            )}
            {activeTab === 'swarm' && <LocalAgentSwarmOrchestrator selectedModel={selectedModel} models={models.map(m => m.name)} />}
            {activeTab === 'prompt-opt' && <PromptOptimizationStudio selectedModel={selectedModel} models={models.map(m => m.name)} />}
            {activeTab === 'audio-speech' && <AudioSpeechStudio selectedModel={selectedModel} models={models.map(m => m.name)} />}
            {activeTab === 'synth-data' && <SyntheticDataGenerator selectedModel={selectedModel} models={models.map(m => m.name)} />}
            {activeTab === 'rag-lab' && <RAGVectorLabVisualizer selectedModel={selectedModel} models={models.map(m => m.name)} />}
            {activeTab === 'quant-bench' && <ModelQuantizationBenchmark selectedModel={selectedModel} models={models.map(m => m.name)} />}
            {activeTab === 'context-shrink' && <ContextWindowCompressor selectedModel={selectedModel} models={models.map(m => m.name)} />}
            {activeTab === 'gguf-gen' && <GGUFModelfileGenerator selectedModel={selectedModel} models={models.map(m => m.name)} />}
            {activeTab === 'telemetry' && <ModelTelemetryDashboard selectedModel={selectedModel} models={models.map(m => m.name)} />}
            {activeTab === 'schema-form' && <JsonSchemaFormGenerator selectedModel={selectedModel} models={models.map(m => m.name)} />}
            {activeTab === 'doc-extractor' && <MultimodalDocumentExtractor selectedModel={selectedModel} models={models.map(m => m.name)} />}
            {activeTab === 'agent-func' && <AgentFunctionPlayground selectedModel={selectedModel} models={models.map(m => m.name)} />}
            {activeTab === 'hallucination' && <HallucinationAuditStudio selectedModel={selectedModel} models={models.map(m => m.name)} />}
            {activeTab === 'code-refactor' && <CodeRefactorTestStudio selectedModel={selectedModel} models={models.map(m => m.name)} />}
            {activeTab === 'multilingual' && <MultilingualTranslationMatrix selectedModel={selectedModel} models={models.map(m => m.name)} />}

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
                      onClick={() => checkOllama(true)}
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
                      onClick={() => checkFastApi(true)}
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
