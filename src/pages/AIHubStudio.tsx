import { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Bot,
  Sparkles,
  Cpu,
  Play,
  Trash2,
  RefreshCw,
  Send,
  MessageSquare,
  Wand2,
  Download,
  Activity,
  BarChart2,
  FileCode,
  Sliders as SlidersIcon,
  Database,
  Workflow,
  Plus,
  X,
  BookOpen,
  Code,
  Copy,
  Check,
  HardDrive,
  Search,
  FolderOpen,
  Layers,
  ChevronRight,
  Clock,
  Zap,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Edit2,
  ArrowUp,
  ArrowDown,
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
  Lock,
  EyeOff
} from 'lucide-react';
import { triggerBlobDownload } from '../utils/sharedHelpers';

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

interface AutomationNode {
  id: string;
  type: 'trigger' | 'prompt' | 'llm' | 'formatter' | 'export';
  title: string;
  config: string;
  status: 'idle' | 'running' | 'completed';
  output?: string;
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
  const [activeTab, setActiveTab] = useState<'chat' | 'library' | 'train' | 'eval' | 'workflow' | 'docs'>('chat');

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

  // Fine-Tune (Unsloth Studio) State
  const [baseModel, setBaseModel] = useState<string>('unsloth/llama-3.2-3b-Instruct');
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

  // Workflow Automation (Interactive Flowchart Node Editor) State
  const [nodes, setNodes] = useState<AutomationNode[]>([
    { id: 'n-1', type: 'trigger', title: 'Dataset Event Trigger', config: 'Fires on new user inputs or recipe generation', status: 'idle' },
    { id: 'n-2', type: 'prompt', title: 'System Prompt Injector', config: 'Inject system persona: "You are a code refactoring expert."', status: 'idle' },
    { id: 'n-3', type: 'llm', title: 'Ollama Model Inference', config: 'Process prompt through local LLM (llama3.2:3b)', status: 'idle' },
    { id: 'n-4', type: 'formatter', title: 'JSON Output Formatter', config: 'Extract clean JSON structure from markdown codeblocks', status: 'idle' },
    { id: 'n-5', type: 'export', title: 'Local File Exporter', config: 'Save output payload to unsloth_export.json', status: 'idle' }
  ]);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editConfig, setEditConfig] = useState('');
  const [isWorkflowRunning, setIsWorkflowRunning] = useState(false);
  const [workflowOutput, setWorkflowOutput] = useState<string | null>(null);

  // Code Integration Snippet State
  const [codeLang, setCodeLang] = useState<'javascript' | 'python' | 'curl' | 'react'>('javascript');
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
      aiSettings.ollamaEndpoint,
      'http://127.0.0.1:11434',
      'http://localhost:11434',
      '/ollama-proxy'
    ]));

    for (const endpoint of candidates) {
      try {
        const res = await fetch(`${endpoint}/api/tags`, { method: 'GET' });
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
      aiSettings.fastApiEndpoint,
      'http://127.0.0.1:8000',
      'http://localhost:8000',
      '/fastapi-proxy'
    ]));

    for (const endpoint of candidates) {
      try {
        const res = await fetch(`${endpoint}/api/ml/status`, { method: 'GET' });
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

  // Handle Model Pull / Download
  const handleDownloadModel = async (modelName: string) => {
    if (!modelName.trim()) return;
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

  // Workflow Interactive Node Flowchart Actions
  const handleAddNode = (type: AutomationNode['type']) => {
    const titles: Record<AutomationNode['type'], string> = {
      trigger: 'Custom Event Trigger',
      prompt: 'Prompt Template Injector',
      llm: 'Local Ollama LLM Engine',
      formatter: 'JSON/Regex Output Formatter',
      export: 'Local File Exporter'
    };
    const configs: Record<AutomationNode['type'], string> = {
      trigger: 'Fires when user initiates local pipeline task',
      prompt: 'System prompt: "Act as an expert code reviewer."',
      llm: `Run local inference using ${selectedModel}`,
      formatter: 'Extract clean markdown codeblocks & parse JSON',
      export: 'Save file output to local workspace'
    };

    const newNode: AutomationNode = {
      id: `n-${Date.now()}`,
      type,
      title: titles[type],
      config: configs[type],
      status: 'idle'
    };
    setNodes(prev => [...prev, newNode]);
  };

  const handleDeleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    if (editingNodeId === id) setEditingNodeId(null);
  };

  const handleMoveNode = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= nodes.length) return;
    const newNodes = [...nodes];
    const temp = newNodes[index];
    newNodes[index] = newNodes[targetIdx];
    newNodes[targetIdx] = temp;
    setNodes(newNodes);
  };

  const handleOpenEditNode = (node: AutomationNode) => {
    setEditingNodeId(node.id);
    setEditTitle(node.title);
    setEditConfig(node.config);
  };

  const handleSaveEditNode = () => {
    if (!editingNodeId) return;
    setNodes(prev =>
      prev.map(n =>
        n.id === editingNodeId ? { ...n, title: editTitle, config: editConfig } : n
      )
    );
    setEditingNodeId(null);
  };

  // Execute Workflow Automation Flowchart
  const handleRunWorkflow = async () => {
    setIsWorkflowRunning(true);
    setWorkflowOutput(null);

    setNodes(prev => prev.map(n => ({ ...n, status: 'idle', output: undefined })));

    let previousOutput = 'Sample Input Context: User initiated code refactoring workflow.';

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      setNodes(prev =>
        prev.map((n, idx) => (idx === i ? { ...n, status: 'running' } : n))
      );
      await new Promise(r => setTimeout(r, 650));

      let stepOutput = '';
      if (node.type === 'trigger') {
        stepOutput = `[Trigger Output] Event payload captured at ${new Date().toLocaleTimeString()}`;
      } else if (node.type === 'prompt') {
        stepOutput = `[Prompt Injected] Configured persona: "${node.config}" + Input: "${previousOutput.slice(0, 40)}..."`;
      } else if (node.type === 'llm') {
        stepOutput = `[Ollama Model Output] Generated response using ${selectedModel} (Latency: 240ms, 45 tok/s).`;
      } else if (node.type === 'formatter') {
        stepOutput = `[Formatted Output] { "status": "success", "processed_bytes": 1024, "clean_json": true }`;
      } else if (node.type === 'export') {
        stepOutput = `[File Exported] Wrote 1.2 KB output buffer to workspace folder successfully.`;
      }

      previousOutput = stepOutput;

      setNodes(prev =>
        prev.map((n, idx) => (idx === i ? { ...n, status: 'completed', output: stepOutput } : n))
      );
    }

    setWorkflowOutput(`✅ Flowchart Pipeline Executed Successfully! (${nodes.length} Nodes Processed)
- Trigger & Prompt Injected successfully.
- Local LLM inference executed without network leak.
- Output formatted and exported locally.`);
    setIsWorkflowRunning(false);
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
      return `// 1. JavaScript / Node.js fetch via local Ollama API
async function queryLocalAI(prompt) {
  const response = await fetch('${aiSettings.ollamaEndpoint}/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: '${selectedModel}',
      prompt: prompt,
      stream: false
    })
  });
  const data = await response.json();
  return data.response;
}

queryLocalAI("Explain Web Crypto API").then(console.log);`;
    }

    if (codeLang === 'python') {
      return `# 2. Python Requests / Ollama SDK
import requests

def generate_local(prompt: str) -> str:
    response = requests.post(
        "${aiSettings.ollamaEndpoint}/api/generate",
        json={
            "model": "${selectedModel}",
            "prompt": prompt,
            "stream": False
        }
    )
    return response.json()["response"]

print(generate_local("Write a Python decorator for memoization."))`;
    }

    if (codeLang === 'curl') {
      return `# 3. cURL CLI Request
curl ${aiSettings.ollamaEndpoint}/api/generate -d '{
  "model": "${selectedModel}",
  "prompt": "Why is local AI privacy superior?",
  "stream": false
}'`;
    }

    return `// 4. React Custom Hook (useOllama)
import { useState } from 'react';

export function useOllama(modelName = '${selectedModel}') {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async (prompt) => {
    setLoading(true);
    const res = await fetch('${aiSettings.ollamaEndpoint}/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: modelName, prompt, stream: false })
    });
    const data = await res.json();
    setResponse(data.response);
    setLoading(false);
  };

  return { generate, response, loading };
}`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <>
      <Helmet>
        <title>AI Hub Studio — Unsloth Fine-Tune &amp; Flow Automation Workspace | DomoDomo</title>
        <meta name="description" content="Comprehensive local AI Hub Studio: ChatGPT-style interface, Ollama LLM Downloader, Unsloth QLoRA fine-tuning, and interactive flow automations." />
        <link rel="canonical" href="https://domodomo.site/ai-hub" />
      </Helmet>

      {/* Full-height layout: sidebar + content */}
      <div className="flex h-[calc(100vh-56px)] overflow-hidden bg-[#111213]">

        {/* ── LEFT SIDEBAR ── */}
        <aside
          className={`flex flex-col shrink-0 bg-[#18191B] border-r border-[#2A2D30] transition-all duration-300 ${
            sidebarCollapsed ? 'w-14' : 'w-56'
          }`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-3 py-3 border-b border-[#2A2D30]">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#3C6B4D] flex items-center justify-center">
                  <Bot size={13} className="text-white" />
                </div>
                <span className="text-sm font-extrabold text-[#ECEBE9] tracking-tight">AI Hub</span>
                <span className="text-[9px] font-mono font-black bg-[#3C6B4D] text-white px-1.5 py-0.5 rounded-full">BETA</span>
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

          {/* Divider + Train section */}
          <div className="px-2 mt-1">
            {!sidebarCollapsed && (
              <p className="text-[10px] font-bold text-[#2A2D30] uppercase tracking-widest px-1 mb-1">Train & Flow</p>
            )}
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => setActiveTab('train')}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                  activeTab === 'train'
                    ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]'
                    : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                }`}
                title="Unsloth Fine-Tune"
              >
                <Wand2 size={15} className="shrink-0" />
                {!sidebarCollapsed && <span>Unsloth Fine-Tune</span>}
              </button>

              <button
                onClick={() => setActiveTab('eval')}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                  activeTab === 'eval'
                    ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]'
                    : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                }`}
                title="Eval Benchmarks"
              >
                <BarChart2 size={15} className="shrink-0" />
                {!sidebarCollapsed && <span>Eval Benchmarks</span>}
              </button>

              <button
                onClick={() => setActiveTab('workflow')}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                  activeTab === 'workflow'
                    ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]'
                    : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                }`}
                title="Flow Automation"
              >
                <Workflow size={15} className="shrink-0" />
                {!sidebarCollapsed && <span>Flow Automation</span>}
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

        {/* ── MAIN CONTENT ── */}
        <main ref={mainContainerRef} className="flex-1 overflow-y-auto">

          {/* Topbar inside content */}
          <div className="sticky top-0 z-10 bg-[#18191B]/95 backdrop-blur-sm border-b border-[#2A2D30] px-6 h-11 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-[#A3A09B]">
              <span className="text-[#72706C]">AI Hub</span>
              <ChevronRight size={14} className="text-[#2A2D30]" />
              <span className="text-[#ECEBE9]">
                {activeTab === 'chat' && 'Chat & Inference'}
                {activeTab === 'library' && 'Model Library & Downloader'}
                {activeTab === 'train' && 'Unsloth QLoRA Fine-Tune'}
                {activeTab === 'eval' && 'Test & Eval Benchmarks'}
                {activeTab === 'workflow' && 'Local AI Flow Studio'}
                {activeTab === 'docs' && 'Docs & Integration'}
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
                      className="px-3 py-1 rounded-xl bg-[#3C6B4D] hover:bg-[#2E533B] disabled:opacity-40 text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1"
                    >
                      <Download size={12} />
                      <span>Pull</span>
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
                            <span className="text-[9px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">INSTALLED</span>
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
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                              isInstalled
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 cursor-default'
                                : isDownloading
                                ? 'bg-[#3C6B4D]/15 text-[#3C6B4D] border border-[#3C6B4D]/30 cursor-wait'
                                : 'bg-[#3C6B4D] hover:bg-[#2E533B] text-white border-0'
                            }`}
                          >
                            {isInstalled ? <><Check size={12} /> Ready</> :
                             isDownloading ? <><Activity size={12} className="animate-spin" /> {downloadProgress}%</> :
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

            {/* ── TRAIN / FINE-TUNE TAB (Unsloth AI Studio) ── */}
            {activeTab === 'train' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#18191B] border border-[#2A2D30] p-5 rounded-2xl">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#3C6B4D]/15 text-[#3C6B4D] text-[10px] font-bold uppercase tracking-wider mb-1">
                      <Wand2 size={12} />
                      <span>Unsloth AI 2x-5x Faster Fine-Tuning</span>
                    </div>
                    <h2 className="text-lg font-extrabold text-[#ECEBE9]">Unsloth QLoRA Fine-Tune Studio</h2>
                    <p className="text-[#72706C] text-xs mt-0.5">Synthesize Alpaca/ShareGPT recipes, configure 4-bit LoRA matrices, and export Modelfiles &amp; GGUF weights.</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={handleExportModelfile} className="px-3 py-2 rounded-xl bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] hover:border-[#3C6B4D]/50 text-xs font-bold transition-all flex items-center gap-1.5">
                      <FileText size={13} className="text-[#3C6B4D]" />
                      <span>Export Modelfile</span>
                    </button>
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
                          disabled={isSynthesizing}
                          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-[#3C6B4D]/15 border border-[#3C6B4D]/40 text-[#3C6B4D] text-xs font-bold hover:bg-[#3C6B4D]/25 disabled:opacity-50 transition-all"
                        >
                          <Sparkles size={13} className={isSynthesizing ? 'animate-spin' : ''} />
                          {isSynthesizing ? 'Synthesizing...' : 'Synthesize Dataset'}
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
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#3C6B4D] hover:bg-[#2E533B] disabled:opacity-40 text-white text-sm font-black transition-all"
                    >
                      <Play size={14} className={isTrainingSim ? 'animate-pulse' : ''} />
                      {isTrainingSim ? 'Training in Progress...' : 'Start Unsloth QLoRA Training'}
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
                    disabled={isEvalRunning}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#3C6B4D] hover:bg-[#2E533B] disabled:opacity-40 text-white text-sm font-black transition-all"
                  >
                    <BarChart2 size={14} className={isEvalRunning ? 'animate-pulse' : ''} />
                    {isEvalRunning ? 'Running Benchmark...' : 'Run Side-by-Side Benchmark'}
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

            {/* ── FLOW AUTOMATION TAB (Interactive Node Flowchart) ── */}
            {activeTab === 'workflow' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#18191B] border border-[#2A2D30] p-5 rounded-2xl">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#ECEBE9]">Local AI Flow Studio</h2>
                    <p className="text-[#72706C] text-xs mt-0.5">Build, edit, connect, and execute custom interactive AI node flowcharts locally.</p>
                  </div>
                  <button
                    onClick={handleRunWorkflow}
                    disabled={isWorkflowRunning}
                    className="px-5 py-2.5 rounded-xl bg-[#3C6B4D] hover:bg-[#2E533B] disabled:opacity-40 text-white text-xs font-black transition-all flex items-center gap-2 shrink-0"
                  >
                    <Play size={14} className={isWorkflowRunning ? 'animate-pulse' : ''} />
                    <span>{isWorkflowRunning ? 'Executing Pipeline...' : 'Run Automation Pipeline'}</span>
                  </button>
                </div>

                <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 space-y-5">
                  {/* Palette: Add Nodes */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-[#72706C] uppercase tracking-wider">Add Node to Flowchart:</p>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => handleAddNode('trigger')} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D]/50 rounded-xl text-xs text-[#ECEBE9] transition-all">
                        <Zap size={12} className="text-amber-400" /> + Event Trigger
                      </button>
                      <button onClick={() => handleAddNode('prompt')} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D]/50 rounded-xl text-xs text-[#ECEBE9] transition-all">
                        <MessageSquare size={12} className="text-blue-400" /> + Prompt Injector
                      </button>
                      <button onClick={() => handleAddNode('llm')} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D]/50 rounded-xl text-xs text-[#ECEBE9] transition-all">
                        <Bot size={12} className="text-[#3C6B4D]" /> + Ollama Local LLM
                      </button>
                      <button onClick={() => handleAddNode('formatter')} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D]/50 rounded-xl text-xs text-[#ECEBE9] transition-all">
                        <Code size={12} className="text-purple-400" /> + Output Formatter
                      </button>
                      <button onClick={() => handleAddNode('export')} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D]/50 rounded-xl text-xs text-[#ECEBE9] transition-all">
                        <Download size={12} className="text-emerald-400" /> + File Exporter
                      </button>
                    </div>
                  </div>

                  {/* Flowchart Node Pipeline Display */}
                  <div className="space-y-3 pt-2">
                    <p className="text-[10px] font-bold text-[#72706C] uppercase tracking-wider">Flowchart Pipeline ({nodes.length} Nodes):</p>
                    <div className="space-y-2">
                      {nodes.map((node, i) => (
                        <div key={node.id} className="flex flex-col gap-2">
                          <div className={`p-4 rounded-2xl border transition-all ${
                            node.status === 'running' ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]' :
                            node.status === 'completed' ? 'bg-emerald-500/5 border-emerald-500/30' :
                            'bg-[#111213] border-[#2A2D30]'
                          }`}>
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <span className="text-[10px] font-mono font-bold text-[#72706C] bg-[#18191B] px-2 py-0.5 rounded border border-[#2A2D30]">
                                  #{i + 1}
                                </span>
                                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                  node.status === 'running' ? 'bg-[#3C6B4D] animate-ping' :
                                  node.status === 'completed' ? 'bg-emerald-500' : 'bg-[#2A2D30]'
                                }`} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-[#ECEBE9]">{node.title}</p>
                                  <p className="text-[11px] text-[#72706C] font-mono truncate">{node.config}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button onClick={() => handleMoveNode(i, 'up')} disabled={i === 0} className="p-1 text-[#72706C] hover:text-[#ECEBE9] disabled:opacity-20">
                                  <ArrowUp size={13} />
                                </button>
                                <button onClick={() => handleMoveNode(i, 'down')} disabled={i === nodes.length - 1} className="p-1 text-[#72706C] hover:text-[#ECEBE9] disabled:opacity-20">
                                  <ArrowDown size={13} />
                                </button>
                                <button onClick={() => handleOpenEditNode(node)} className="p-1 text-[#72706C] hover:text-[#3C6B4D]">
                                  <Edit2 size={13} />
                                </button>
                                <button onClick={() => handleDeleteNode(node.id)} className="p-1 text-[#72706C] hover:text-red-400">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>

                            {/* Live Execution Output for this Node */}
                            {node.output && (
                              <div className="mt-3 pt-2 border-t border-[#2A2D30]/60 text-[11px] font-mono text-emerald-400 bg-[#18191B] p-2.5 rounded-xl border border-emerald-500/20">
                                {node.output}
                              </div>
                            )}
                          </div>

                          {/* Connecting Arrow */}
                          {i < nodes.length - 1 && (
                            <div className="flex justify-center my-0.5">
                              <div className="h-4 w-px bg-[#3C6B4D]/40" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Inline Node Edit Drawer */}
                  {editingNodeId && (
                    <div className="bg-[#111213] border border-[#3C6B4D]/50 p-4 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#3C6B4D]">Edit Flowchart Node Config</span>
                        <button onClick={() => setEditingNodeId(null)} className="text-[#72706C] hover:text-[#ECEBE9]">
                          <X size={14} />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#72706C] uppercase">Node Title</label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          className="w-full bg-[#18191B] border border-[#2A2D30] rounded-xl px-3 py-1.5 text-xs text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#72706C] uppercase">Node Config / Prompt Template</label>
                        <textarea
                          value={editConfig}
                          onChange={e => setEditConfig(e.target.value)}
                          rows={2}
                          className="w-full bg-[#18191B] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D] resize-none"
                        />
                      </div>
                      <button onClick={handleSaveEditNode} className="px-4 py-1.5 bg-[#3C6B4D] text-white text-xs font-bold rounded-xl hover:bg-[#2E533B] transition-all">
                        Save Node Changes
                      </button>
                    </div>
                  )}

                  {workflowOutput && (
                    <div className="bg-[#111213] border border-emerald-500/30 rounded-xl p-4 text-xs text-emerald-400 font-mono whitespace-pre-line leading-relaxed">
                      {workflowOutput}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── DOCS TAB ── */}
            {activeTab === 'docs' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-extrabold text-[#ECEBE9]">Docs &amp; Integration Code</h2>
                  <p className="text-[#72706C] text-xs mt-0.5">Ready-to-use code snippets and local CORS setup guides for Ollama integration</p>
                </div>
                <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 space-y-4">
                  <div className="flex gap-2">
                    {(['javascript', 'python', 'curl', 'react'] as const).map(lang => (
                      <button key={lang} onClick={() => setCodeLang(lang)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        codeLang === lang
                          ? 'bg-[#3C6B4D]/20 text-[#3C6B4D] border-[#3C6B4D]/40'
                          : 'bg-[#111213] text-[#72706C] border-[#2A2D30] hover:text-[#ECEBE9]'
                      }`}>{lang}</button>
                    ))}
                    <button onClick={handleCopyCode} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#111213] border border-[#2A2D30] text-[#A3A09B] hover:text-[#ECEBE9] transition-all">
                      {copiedCode ? <><Check size={12} className="text-emerald-400" /> Copied!</> : <><Copy size={12} /> Copy</>}
                    </button>
                  </div>
                  <pre className="bg-[#111213] border border-[#2A2D30] rounded-xl p-4 text-[11px] text-[#ECEBE9] font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                    {getCodeSnippet()}
                  </pre>
                </div>
              </div>
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
                    value={aiSettings.defaultSystemPrompt}
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
                      <span className="font-mono text-[#3C6B4D] font-bold">{aiSettings.temperature}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={aiSettings.temperature}
                      onChange={e => {
                        const v = parseFloat(e.target.value);
                        setAiSettings(prev => ({ ...prev, temperature: v }));
                        setTemperature(v);
                      }}
                      className="w-full h-1 accent-[#3C6B4D]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-[#A3A09B]">Default Top-P</span>
                      <span className="font-mono text-[#3C6B4D] font-bold">{aiSettings.topP}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={aiSettings.topP}
                      onChange={e => {
                        const v = parseFloat(e.target.value);
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
                      value={aiSettings.maxTokens}
                      onChange={e => {
                        const v = parseInt(e.target.value) || 2048;
                        setAiSettings(prev => ({ ...prev, maxTokens: v }));
                        setMaxTokens(v);
                      }}
                      className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#A3A09B]">Context Window ($N_{ctx}$)</label>
                    <select
                      value={aiSettings.numCtx}
                      onChange={e => setAiSettings(prev => ({ ...prev, numCtx: parseInt(e.target.value) }))}
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
                    <label className="text-xs font-bold text-[#A3A09B]">GPU Offload Layers (`n_gpu_layers`)</label>
                    <input
                      type="number"
                      value={aiSettings.gpuLayers}
                      onChange={e => setAiSettings(prev => ({ ...prev, gpuLayers: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#A3A09B]">CPU Threads</label>
                    <input
                      type="number"
                      value={aiSettings.cpuThreads}
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
