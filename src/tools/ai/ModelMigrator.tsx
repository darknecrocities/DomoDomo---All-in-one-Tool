import { useState, useEffect, useCallback } from 'react';
import { 
  FolderSync, Database, Download, Upload, Info, Check,
  CheckCircle, AlertTriangle, Loader2, RefreshCw, FileCheck, HelpCircle, HardDrive, FolderOpen, BookOpen, Code, Eye, Globe
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

interface CatalogModel {
  id: string;
  name: string;
  parameters: string;
  downloadSize: string;
  vramRequired: string;
  contextWindow: string;
  capabilities: string[];
  useCase: string;
  description: string;
  iconType: 'general' | 'code' | 'vision';
}

const REGISTRY_MODELS: CatalogModel[] = [
  // ─── Existing Models ────────────────────────────────────────────────────────
  {
    id: 'llama3.2:1b',
    name: 'Meta Llama 3.2 1B',
    parameters: '1.2B',
    downloadSize: '1.3 GB',
    vramRequired: '2GB - 4GB RAM',
    contextWindow: '128k context',
    capabilities: ['Multilingual', 'Fast Inference', 'Text Summarization'],
    useCase: 'Ultra-lightweight helper, highly suitable for simple prompts, edge computing, or low-memory CPU devices.',
    description: 'Meta\'s compact model engineered for edge computing and localized low-memory configurations.',
    iconType: 'general'
  },
  {
    id: 'llama3.2:3b',
    name: 'Meta Llama 3.2 3B',
    parameters: '3.2B',
    downloadSize: '2.0 GB',
    vramRequired: '6GB - 8GB RAM',
    contextWindow: '128k context',
    capabilities: ['High Reasoning Accuracy', 'Creative Text Writing', 'Coding Basics'],
    useCase: 'Best performance-to-size balance for typical personal workstations and localized developer assistants.',
    description: 'The standard choice for local assistants, offering strong instructions-following and high memory capacity.',
    iconType: 'general'
  },
  {
    id: 'qwen2.5:0.5b',
    name: 'Alibaba Qwen 2.5 0.5B',
    parameters: '0.5B',
    downloadSize: '397 MB',
    vramRequired: '1GB - 2GB RAM',
    contextWindow: '32k context',
    capabilities: ['Extremely Fast', 'Bilingual (EN/ZH)', 'Basic Text Tasks'],
    useCase: 'Perfect for microcontrollers, system monitoring scripts, and background text triggers with minimal overhead.',
    description: 'Alibaba\'s lightest multilingual generative model, optimized for maximum speeds.',
    iconType: 'general'
  },
  {
    id: 'qwen2.5:7b',
    name: 'Alibaba Qwen 2.5 7B',
    parameters: '7.6B',
    downloadSize: '4.7 GB',
    vramRequired: '12GB - 16GB RAM',
    contextWindow: '128k context',
    capabilities: ['Advanced Programming', 'Complex RAG', 'Math Processing'],
    useCase: 'Advanced system automation, codebase audits, and translation workflows across multiple foreign languages.',
    description: 'One of the best-performing open 7B parameter models for technical, math, and computational reasoning.',
    iconType: 'code'
  },
  {
    id: 'gemma2:2b',
    name: 'Google Gemma 2 2B',
    parameters: '2.6B',
    downloadSize: '1.6 GB',
    vramRequired: '4GB - 6GB RAM',
    contextWindow: '8k context',
    capabilities: ['Excellent QA Precision', 'Structured Formatting', 'Google Gemini DNA'],
    useCase: 'Factual query analysis, text styling, and prompt templates needing strict format adherence.',
    description: 'Google\'s open model utilizing structural innovations from the Gemini family to punch far above its weight.',
    iconType: 'general'
  },
  {
    id: 'gemma2:9b',
    name: 'Google Gemma 2 9B',
    parameters: '9.2B',
    downloadSize: '5.4 GB',
    vramRequired: '16GB RAM',
    contextWindow: '8k context',
    capabilities: ['Logical Reasoning', 'Textbook-Style Synthesis', 'Complex Analytics'],
    useCase: 'In-depth textual research, coding architecture suggestions, and high-precision scientific outputs.',
    description: 'Google\'s state-of-the-art 9B model, rivaling much larger proprietary models in language tasks.',
    iconType: 'general'
  },
  {
    id: 'phi3:latest',
    name: 'Microsoft Phi-3 3.8B',
    parameters: '3.8B',
    downloadSize: '2.2 GB',
    vramRequired: '8GB - 12GB RAM',
    contextWindow: '128k context',
    capabilities: ['Logical Math Ratios', 'Long-Context Manuals', 'Academic QA'],
    useCase: 'Academic question answering, textbook learning, and parsing massive manuals offline.',
    description: 'Microsoft\'s heavily safety-tuned small language model optimized for mathematical and logical rigor.',
    iconType: 'general'
  },
  {
    id: 'mistral:latest',
    name: 'Mistral AI 7B',
    parameters: '7.2B',
    downloadSize: '4.1 GB',
    vramRequired: '12GB - 16GB RAM',
    contextWindow: '32k context',
    capabilities: ['Creative Narrative', 'Open Dialogue', 'Highly Adaptable'],
    useCase: 'A popular general-purpose choice for local prompt engineering templates and roleplay scenarios.',
    description: 'The legendary open model setting standards for 7B parameters. Highly versatile.',
    iconType: 'general'
  },
  {
    id: 'llava:latest',
    name: 'LLaVA 7B (Vision)',
    parameters: '7.2B',
    downloadSize: '4.7 GB',
    vramRequired: '16GB RAM (GPU Needed)',
    contextWindow: '4k context',
    capabilities: ['Image Analysis', 'Diagram OCR', 'Object Identification'],
    useCase: 'Analyzing system diagrams, extracting text from screenshots, and image questioning.',
    description: 'A multimodal visual model combining a visual encoder with Llama to read files and pictures.',
    iconType: 'vision'
  },
  {
    id: 'deepseek-coder:6.7b',
    name: 'DeepSeek Coder 6.7B',
    parameters: '6.7B',
    downloadSize: '3.8 GB',
    vramRequired: '12GB - 16GB RAM',
    contextWindow: '16k context',
    capabilities: ['Full-stack Programming', 'Repo Navigation', 'Security Audits'],
    useCase: 'Advanced programming diagnostics, automated script creation, and refactoring directory code bases locally.',
    description: 'One of the industry\'s best open coding models, trained specifically on large codebase indices.',
    iconType: 'code'
  },

  // ─── 20 New Models (16GB RAM Optimized) ─────────────────────────────────────

  {
    id: 'llama3.1:8b',
    name: 'Meta Llama 3.1 8B',
    parameters: '8.0B',
    downloadSize: '4.7 GB',
    vramRequired: '10GB - 16GB RAM',
    contextWindow: '128k context',
    capabilities: ['Function Calling', 'Code Generation', 'Multilingual'],
    useCase: 'Versatile instruction-following for coding agents, tool-use pipelines, and multilingual text generation.',
    description: 'Meta\'s flagship 8B model with a massive 128k context window and excellent instruction tuning.',
    iconType: 'general'
  },
  {
    id: 'codellama:7b',
    name: 'Meta Code Llama 7B',
    parameters: '7.0B',
    downloadSize: '3.8 GB',
    vramRequired: '8GB - 16GB RAM',
    contextWindow: '100k context',
    capabilities: ['Code Completion', 'Bug Detection', 'Multi-language'],
    useCase: 'IDE-style code completions, unit test generation, and inline documentation writing across Python, JS, C++.',
    description: 'Meta\'s dedicated coding model built on Llama 2 fine-tuned on 500B tokens of code.',
    iconType: 'code'
  },
  {
    id: 'codellama:13b',
    name: 'Meta Code Llama 13B',
    parameters: '13.0B',
    downloadSize: '7.4 GB',
    vramRequired: '16GB RAM',
    contextWindow: '100k context',
    capabilities: ['Complex Refactoring', 'Architecture Review', 'Infilling'],
    useCase: 'Deep codebase analysis, multi-file refactoring, and technical design reviews within 16GB RAM budget.',
    description: 'The stronger Code Llama variant with significantly improved code reasoning and infill accuracy.',
    iconType: 'code'
  },
  {
    id: 'qwen2.5-coder:7b',
    name: 'Qwen 2.5 Coder 7B',
    parameters: '7.6B',
    downloadSize: '4.3 GB',
    vramRequired: '10GB - 16GB RAM',
    contextWindow: '128k context',
    capabilities: ['Code Generation', 'Debugging', 'SQL & Scripts'],
    useCase: 'State-of-the-art open coding model for full-stack generation, data scripts, DevOps automation, and SQL.',
    description: 'Alibaba\'s purpose-built coding model trained on 5.5T tokens — outperforms GPT-3.5 on coding tasks.',
    iconType: 'code'
  },
  {
    id: 'qwen2.5-coder:14b',
    name: 'Qwen 2.5 Coder 14B',
    parameters: '14.8B',
    downloadSize: '8.2 GB',
    vramRequired: '16GB RAM',
    contextWindow: '128k context',
    capabilities: ['Enterprise Code Review', 'Multi-repo Analysis', 'API Design'],
    useCase: 'Production-grade code analysis, large API surface refactoring, and enterprise-level documentation generation.',
    description: 'The most powerful open coding model at the 16GB boundary — rivals GitHub Copilot on benchmarks.',
    iconType: 'code'
  },
  {
    id: 'deepseek-coder-v2:16b',
    name: 'DeepSeek Coder V2 16B',
    parameters: '16.0B',
    downloadSize: '8.9 GB',
    vramRequired: '16GB RAM',
    contextWindow: '128k context',
    capabilities: ['236 Languages', 'Math + Code', 'Tool Calling'],
    useCase: 'Handles 236 programming languages, advanced math proofs, competitive coding, and agentic tool calls.',
    description: 'DeepSeek\'s breakthrough V2 coding model using MoE architecture — matches Claude 3 Sonnet on HumanEval.',
    iconType: 'code'
  },
  {
    id: 'starcoder2:7b',
    name: 'BigCode StarCoder2 7B',
    parameters: '7.0B',
    downloadSize: '4.0 GB',
    vramRequired: '8GB - 16GB RAM',
    contextWindow: '16k context',
    capabilities: ['80+ Languages', 'Repository Awareness', 'Fill-in-Middle'],
    useCase: 'Advanced code completion with fill-in-middle, supporting 80+ programming languages for broad polyglot projects.',
    description: 'Trained on 600+ programming languages with The Stack v2 dataset. Transparent, permissive license.',
    iconType: 'code'
  },
  {
    id: 'codegemma:7b',
    name: 'Google CodeGemma 7B',
    parameters: '7.0B',
    downloadSize: '5.0 GB',
    vramRequired: '10GB - 16GB RAM',
    contextWindow: '8k context',
    capabilities: ['Python Specialist', 'JavaScript/TS', 'Code Chat'],
    useCase: 'Google-quality Python and web development assistance, ideal for Flask/FastAPI, React, and Node.js workflows.',
    description: 'Google\'s specialized coding model built on the Gemma architecture, pretrained on 500B code tokens.',
    iconType: 'code'
  },
  {
    id: 'granite-code:8b',
    name: 'IBM Granite Code 8B',
    parameters: '8.0B',
    downloadSize: '4.6 GB',
    vramRequired: '10GB - 16GB RAM',
    contextWindow: '4k context',
    capabilities: ['Enterprise Java', 'COBOL Migration', 'DevOps Scripts'],
    useCase: 'Enterprise code modernization — Java, COBOL, mainframe migration, security vulnerability scanning.',
    description: 'IBM\'s enterprise-grade coding model. Built for businesses migrating legacy codebases to modern stacks.',
    iconType: 'code'
  },
  {
    id: 'phi4:latest',
    name: 'Microsoft Phi-4 14B',
    parameters: '14.7B',
    downloadSize: '8.9 GB',
    vramRequired: '16GB RAM',
    contextWindow: '16k context',
    capabilities: ['STEM Reasoning', 'Complex Math', 'Code Analysis'],
    useCase: 'Solving advanced math, physics problems, and coding challenges that require deep structured reasoning.',
    description: 'Microsoft\'s flagship small model — Phi-4 outperforms GPT-4o on STEM benchmarks despite being 14B.',
    iconType: 'general'
  },
  {
    id: 'mistral-nemo:latest',
    name: 'Mistral Nemo 12B',
    parameters: '12.2B',
    downloadSize: '7.1 GB',
    vramRequired: '14GB - 16GB RAM',
    contextWindow: '128k context',
    capabilities: ['Long Context', 'Tool Use', 'Instruction Following'],
    useCase: 'Large document processing, RAG pipelines, and long-form text analysis with up to 128k token context.',
    description: 'Built with NVIDIA. Mistral Nemo delivers 128k context at 12B — a major jump in usable context size.',
    iconType: 'general'
  },
  {
    id: 'deepseek-r1:7b',
    name: 'DeepSeek-R1 7B',
    parameters: '7.6B',
    downloadSize: '4.7 GB',
    vramRequired: '10GB - 16GB RAM',
    contextWindow: '64k context',
    capabilities: ['Chain-of-Thought', 'Math Proofs', 'Self-Reasoning'],
    useCase: 'Logical step-by-step problem decomposition, mathematics, scientific reasoning, and algorithm design.',
    description: 'DeepSeek\'s reasoning-first model — uses chain-of-thought to think before answering, like o1-mini.',
    iconType: 'general'
  },
  {
    id: 'deepseek-r1:14b',
    name: 'DeepSeek-R1 14B',
    parameters: '14.8B',
    downloadSize: '9.0 GB',
    vramRequired: '16GB RAM',
    contextWindow: '64k context',
    capabilities: ['Advanced Reasoning', 'Agentic Tasks', 'Planning'],
    useCase: 'Complex multi-step planning, autonomous agent workflows, and research-grade analytical tasks.',
    description: 'The most powerful reasoning model you can run on 16GB RAM — matches o1-preview on AIME benchmarks.',
    iconType: 'general'
  },
  {
    id: 'solar:10.7b',
    name: 'Upstage SOLAR 10.7B',
    parameters: '10.7B',
    downloadSize: '6.1 GB',
    vramRequired: '12GB - 16GB RAM',
    contextWindow: '4k context',
    capabilities: ['Instruction Following', 'QA Systems', 'Text Summarization'],
    useCase: 'High-quality instruction-tuned model for customer support bots, knowledge base Q&A, and document summarization.',
    description: 'Award-winning 10.7B model using Depth-Up-Scaling technique. Ranked #1 on OpenLLM leaderboard on release.',
    iconType: 'general'
  },
  {
    id: 'llama3.2:11b',
    name: 'Meta Llama 3.2 11B Vision',
    parameters: '11.0B',
    downloadSize: '7.9 GB',
    vramRequired: '16GB RAM',
    contextWindow: '128k context',
    capabilities: ['Image Understanding', 'Chart Reading', 'Visual QA'],
    useCase: 'Analyzing screenshots, reading chart data, understanding UI layouts, and visual document comprehension.',
    description: 'Meta\'s multimodal Llama 3.2 — combines powerful language reasoning with vision capabilities.',
    iconType: 'vision'
  },
  {
    id: 'bakllava:latest',
    name: 'BakLLaVA 7B (Vision)',
    parameters: '7.0B',
    downloadSize: '4.5 GB',
    vramRequired: '12GB - 16GB RAM',
    contextWindow: '4k context',
    capabilities: ['Image Captioning', 'UI Understanding', 'Visual Conversations'],
    useCase: 'Screenshot captioning, visual debugging of UI components, and conversational image-based Q&A workflows.',
    description: 'Enhanced LLaVA built on Mistral backbone — better conversational abilities with visual inputs.',
    iconType: 'vision'
  },
  {
    id: 'nomic-embed-text:latest',
    name: 'Nomic Embed Text',
    parameters: '137M',
    downloadSize: '274 MB',
    vramRequired: '1GB RAM',
    contextWindow: '8k context',
    capabilities: ['Semantic Search', 'RAG Embeddings', 'Similarity Scoring'],
    useCase: 'Vector database embedding generation for local RAG systems, semantic document search, and similarity scoring.',
    description: 'State-of-the-art text embedding model for local vector search — matches OpenAI embeddings at zero cost.',
    iconType: 'general'
  },
  {
    id: 'mxbai-embed-large:latest',
    name: 'MixBread Embed Large',
    parameters: '335M',
    downloadSize: '670 MB',
    vramRequired: '2GB RAM',
    contextWindow: '512 tokens',
    capabilities: ['MTEB #1 Embeddings', 'Code Embeddings', 'Cross-lingual Search'],
    useCase: 'Best-in-class embedding model for building local knowledge bases, code search engines, and multilingual RAG.',
    description: 'Achieved #1 on MTEB leaderboard for text embeddings — outperforms OpenAI text-embedding-3-large.',
    iconType: 'general'
  },
  {
    id: 'qwen2.5:14b',
    name: 'Alibaba Qwen 2.5 14B',
    parameters: '14.8B',
    downloadSize: '8.2 GB',
    vramRequired: '16GB RAM',
    contextWindow: '128k context',
    capabilities: ['Advanced Reasoning', 'Code + Math', 'Long Documents'],
    useCase: 'Best all-rounder at the 16GB RAM limit — coding, math, long documents, and multilingual support in one model.',
    description: 'Qwen\'s top open model before the MoE variants. Competitive with GPT-4o-mini on most benchmarks.',
    iconType: 'code'
  },
  {
    id: 'wizardlm2:7b',
    name: 'WizardLM 2 7B',
    parameters: '7.0B',
    downloadSize: '4.1 GB',
    vramRequired: '10GB - 16GB RAM',
    contextWindow: '32k context',
    capabilities: ['Complex Instructions', 'Role-Play Agents', 'Long Conversations'],
    useCase: 'Handling complex multi-turn instructions, agent-style role execution, and rich conversational workflows.',
    description: 'Microsoft\'s Evol-Instruct model — specifically trained to follow difficult, multi-step instructions precisely.',
    iconType: 'general'
  },
  {
    id: 'dolphin-mistral:latest',
    name: 'Dolphin Mistral 7B',
    parameters: '7.2B',
    downloadSize: '4.1 GB',
    vramRequired: '10GB - 16GB RAM',
    contextWindow: '32k context',
    capabilities: ['Uncensored Responses', 'Code Generation', 'Creative Writing'],
    useCase: 'Uncensored creative writing, security research, and penetration testing tasks requiring unrestricted output.',
    description: 'Eric Hartford\'s Dolphin fine-tune on Mistral — removes guardrails for maximum flexibility in research.',
    iconType: 'general'
  }
];


export const ModelMigrator = () => {
  const [mcpOnline, setMcpOnline] = useState(mcpClient.isOnline());
  const [ollamaOnline, setOllamaOnline] = useState<boolean | null>(null);
  const [customOllamaPath, setCustomOllamaPath] = useState('');
  
  // Model lists
  const [localModels, setLocalModels] = useState<LocalModel[]>([]);
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'pull' | 'directory'>('export');
  const [directorySearch, setDirectorySearch] = useState('');
  
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
  const [pullExportDestination, setPullExportDestination] = useState('');
  const [isAutoExporting, setIsAutoExporting] = useState(false);

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
      const statusCheck = await aiService.checkOllama();
      setOllamaOnline(statusCheck.status);

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

  // Folder picker — MCP bridge gives full absolute path (preferred).
  // Browser showDirectoryPicker is fallback-only but CANNOT return the full path due to browser security.
  const selectDirectory = async (onSelected: (path: string) => void) => {
    // If MCP server is online, use it — it runs a native PowerShell/osascript dialog
    // and returns the full absolute path (e.g. D:\OllamaBackups)
    if (mcpOnline) {
      try {
        const response = await mcpClient.callTool('select_local_directory', {});
        const selectedPath = response.content?.[0]?.text?.trim();
        if (selectedPath) {
          onSelected(selectedPath);
          showAlert('success', `Folder selected: ${selectedPath}`);
        } else {
          showAlert('error', 'No folder was selected or the dialog was cancelled.');
        }
      } catch (err: any) {
        showAlert('error', err.message || 'Failed to open folder dialog.');
      }
      return;
    }

    // MCP offline — fall back to browser picker with a clear limitation warning
    if ('showDirectoryPicker' in window) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
        const folderName = dirHandle.name;
        onSelected(folderName);
        showAlert('error',
          `⚠️ Only the folder name "${folderName}" was captured — browsers cannot read the full drive path. ` +
          `Please manually type the complete path (e.g. D:\\${folderName}) into the field, ` +
          `or start the Domo MCP server (npm run mcp) for automatic full-path selection.`
        );
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return; // user cancelled
      }
    }

    // Neither available
    showAlert('error', 'Start the Domo MCP server (run "npm run mcp" in your terminal) to enable visual folder selection with full path support.');
  };

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

  const handlePullModel = async (modelTagToPull?: string) => {
    const modelTag = (modelTagToPull || pullModelName).trim();
    if (!modelTag) {
      showAlert('error', 'Please specify a model name/tag to pull.');
      return;
    }

    setPullModelName(modelTag);
    setIsPulling(true);
    setPullProgress(0);
    setPullError(null);

    const hddPath = pullExportDestination.trim();

    // ── Direct-to-HDD mode ──────────────────────────────────────────────────
    // Spawns ollama pull with OLLAMA_MODELS=hddPath — downloads directly to Seagate.
    // Returns immediately with a job ID, then polls check_pull_status for live progress.
    if (hddPath && mcpOnline) {
      setPullStatus(`Starting download to ${hddPath}...`);
      try {
        const response = await mcpClient.callTool('pull_model_direct', {
          modelTag,
          destinationPath: hddPath
        });
        const result = response.content?.[0]?.text ? JSON.parse(response.content[0].text) : null;

        if (!result?.success || !result?.statusFile) {
          setPullError(result?.error || 'Failed to start download process.');
          showAlert('error', result?.error || 'Could not start direct HDD download.');
          setIsPulling(false);
          return;
        }

        // Poll the status file every 2 seconds for live progress
        setPullStatus(`Downloading to ${hddPath} (via ollama)...`);
        const statusFile = result.statusFile;

        await new Promise<void>((resolve) => {
          const interval = setInterval(async () => {
            try {
              const pollResp = await mcpClient.callTool('check_pull_status', { statusFile });
              const status = pollResp.content?.[0]?.text ? JSON.parse(pollResp.content[0].text) : null;
              if (!status) return;

              if (status.lastLine) {
                setPullStatus(`→ ${status.lastLine.slice(0, 80)}`);
              }

              if (status.status === 'done') {
                clearInterval(interval);
                showAlert('success', `✅ ${modelTag} saved directly to your Seagate: ${hddPath}`);
                setPullStatus(`Saved to ${hddPath}`);
                setPullModelName('');
                await loadLocalModels();
                resolve();
              } else if (status.status === 'error') {
                clearInterval(interval);
                setPullError(status.error || 'Download failed.');
                showAlert('error', `Direct download failed: ${status.error}`);
                resolve();
              }
            } catch {
              // poll errors are non-fatal, keep retrying
            }
          }, 2000);
        });

      } catch (err: any) {
        setPullError(err.message || 'Failed to start direct HDD download.');
        showAlert('error', 'Direct HDD download failed. Make sure Ollama is installed and running.');
      } finally {
        setIsPulling(false);
        setIsAutoExporting(false);
      }
      return;
    }

    // ── Standard mode (no HDD path set) ─────────────────────────────────────
    // Uses Ollama HTTP API with streaming progress.
    setPullStatus('Connecting to Ollama registry...');
    try {
      await aiService.pullOllamaModel(modelTag, (status, progress) => {
        setPullStatus(status);
        setPullProgress(progress);
      });

      showAlert('success', `Model ${modelTag} downloaded to local Ollama!`);
      await loadLocalModels();
      setPullModelName('');
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

  // Helper matching states to directory models
  const isModelInstalled = (catalogId: string) => {
    return localModels.some(m => {
      const fullName = `${m.name}:${m.tag}`;
      return fullName.toLowerCase() === catalogId.toLowerCase() || 
             m.name.toLowerCase() === catalogId.toLowerCase() ||
             (catalogId.endsWith(':latest') && m.name.toLowerCase() === catalogId.replace(':latest', '').toLowerCase());
    });
  };

  const getMatchingInstalledModel = (catalogId: string) => {
    return localModels.find(m => {
      const fullName = `${m.name}:${m.tag}`;
      return fullName.toLowerCase() === catalogId.toLowerCase() || 
             m.name.toLowerCase() === catalogId.toLowerCase() ||
             (catalogId.endsWith(':latest') && m.name.toLowerCase() === catalogId.replace(':latest', '').toLowerCase());
    });
  };

  const filteredCatalog = REGISTRY_MODELS.filter(m => 
    m.name.toLowerCase().includes(directorySearch.toLowerCase()) ||
    m.capabilities.some(c => c.toLowerCase().includes(directorySearch.toLowerCase())) ||
    m.useCase.toLowerCase().includes(directorySearch.toLowerCase())
  );

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
            onClick={() => selectDirectory(setCustomOllamaPath)}
            className="px-3.5 py-2 bg-[#3C6B4D]/10 border border-[#3C6B4D]/30 hover:bg-[#3C6B4D]/20 text-[#3C6B4D] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            title="Open native folder browser"
          >
            <FolderOpen size={13} />
            <span>Browse...</span>
          </button>
          <button 
            onClick={loadLocalModels}
            className="px-4 py-2 bg-[#18191B] border border-[#2A2D30] hover:border-[#3C6B4D]/40 text-[#ECEBE9] rounded-xl text-xs font-bold transition-all"
          >
            Apply Path
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex flex-wrap gap-2 font-mono">
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
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
            activeTab === 'directory'
              ? 'bg-[#3C6B4D]/10 text-[#3C6B4D] border-[#3C6B4D]/40 shadow-sm'
              : 'bg-[#18191B] border-[#2A2D30] text-[#A3A09B] hover:text-[#ECEBE9]'
          }`}
        >
          <BookOpen size={13} /> Model Directory (Specs & Use Cases)
        </button>
      </div>

      {/* Main Action Workspace */}
      {activeTab !== 'directory' ? (
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
                      value={selectedModel ? localModels.indexOf(selectedModel) : ''}
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
                      <button 
                        onClick={() => selectDirectory(setExportDestination)}
                        className="px-3.5 py-2 bg-[#3C6B4D]/10 border border-[#3C6B4D]/30 hover:bg-[#3C6B4D]/20 text-[#3C6B4D] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <FolderOpen size={13} />
                        <span>Browse...</span>
                      </button>
                    </div>
                    <span className="text-[10px] text-[#72706C] italic font-sans pl-1">
                      Click <strong className="text-[#ECEBE9]">Browse...</strong> to pick a drive folder visually. The full path (e.g. <code className="font-mono text-[#3C6B4D] bg-[#111213] px-0.5 rounded">D:\OllamaBackups</code>) will be auto-filled or you can type it manually.
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
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={importSource}
                        onChange={(e) => setImportSource(e.target.value)}
                        placeholder="e.g. D:\OllamaBackups\llama3.2-3b"
                        className="flex-1 bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] font-mono rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#3C6B4D]/50 transition-colors"
                      />
                      <button 
                        onClick={() => selectDirectory(setImportSource)}
                        className="px-3.5 py-2 bg-[#3C6B4D]/10 border border-[#3C6B4D]/30 hover:bg-[#3C6B4D]/20 text-[#3C6B4D] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                        title="Browse drive storage folder"
                      >
                        <FolderOpen size={13} />
                        <span>Browse...</span>
                      </button>
                    </div>
                    <span className="text-[10px] text-[#72706C] italic font-sans pl-1">
                      Click <strong className="text-[#ECEBE9]">Browse...</strong> to pick the exported model folder. If on an external drive, confirm the full path (e.g. <code className="font-mono text-[#3C6B4D] bg-[#111213] px-0.5 rounded">D:\OllamaBackups\llama3.2-3b</code>).
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
                    <span className="text-[#A3A09B] font-mono font-bold">Model Registry Tag:</span>
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

                  {/* Save directly to HDD */}
                  <div className="flex flex-col gap-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[#A3A09B] font-mono font-bold">Auto-Save to External Drive (Optional):</span>
                      <span className="text-[10px] text-[#3C6B4D] bg-[#3C6B4D]/10 border border-[#3C6B4D]/30 px-2 py-0.5 rounded-full font-mono">NEW</span>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={pullExportDestination}
                        onChange={(e) => setPullExportDestination(e.target.value)}
                        placeholder="e.g. E:\OllamaModels  (your Seagate drive path)"
                        className="flex-1 bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] font-mono rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#3C6B4D]/50 transition-colors"
                      />
                      <button 
                        onClick={() => selectDirectory(setPullExportDestination)}
                        className="px-3.5 py-2 bg-[#3C6B4D]/10 border border-[#3C6B4D]/30 hover:bg-[#3C6B4D]/20 text-[#3C6B4D] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                        title="Browse to your Seagate or external HDD"
                      >
                        <FolderOpen size={13} />
                        <span>Browse...</span>
                      </button>
                    </div>
                    <span className="text-[10px] text-[#72706C] italic font-sans pl-1">
                      If set, model is automatically copied to your Seagate/USB after download. Leave blank to only install locally.
                    </span>
                  </div>

                  <button
                    onClick={() => handlePullModel()}
                    disabled={isPulling || isAutoExporting || !ollamaOnline || !pullModelName}
                    className="w-full bg-[#3C6B4D] hover:bg-[#2E533B] disabled:opacity-40 disabled:hover:bg-[#3C6B4D] text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
                  >
                    {isPulling ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Downloading... {pullProgress}%</span>
                      </>
                    ) : isAutoExporting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Copying to Seagate HDD...</span>
                      </>
                    ) : (
                      <>
                        <Download size={14} />
                        <span>{pullExportDestination ? 'Download + Save to Seagate' : 'Download to Local Ollama'}</span>
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
                  <li>Use <span className="font-semibold text-[#ECEBE9]">Browse...</span> to select the target drive folder and click <span className="font-semibold text-[#ECEBE9]">Export</span>.</li>
                  <li>Once done, eject the USB drive.</li>
                  <li>Plug it into the target offline computer running DomoDomo.</li>
                  <li>Open this tool on that computer and browse the folder path under the <span className="font-semibold text-[#ECEBE9]">Import</span> tab.</li>
                  <li>Hit <span className="font-semibold text-[#ECEBE9]">Import</span> to finish installing!</li>
                </ol>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* Model Catalog directory Tab */
        <div className="space-y-6">
          <div className="glass-card p-5 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div className="space-y-0.5">
                <h3 className="font-bold text-[#ECEBE9] text-sm font-mono flex items-center gap-1.5">
                  <BookOpen size={16} className="text-[#3C6B4D]" />
                  <span>Ollama Registry Model Directory</span>
                </h3>
                <p className="text-[11px] text-[#A3A09B]">
                  Browse model details, storage footprint, and RAM specifications to select profiles suited to your hardware.
                </p>
              </div>
              
              {/* Directory search input */}
              <input
                type="text"
                placeholder="Search specs, use cases, or capabilities..."
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                className="w-full md:w-80 bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#3C6B4D]/50 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {filteredCatalog.map((model, idx) => {
                const installed = isModelInstalled(model.id);
                const matchingModel = getMatchingInstalledModel(model.id);

                return (
                  <div key={idx} className="bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D]/50 rounded-xl p-4 flex flex-col justify-between transition-all gap-4">
                    <div className="space-y-2.5">
                      
                      {/* Catalog Header */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-0.5">
                          <h4 className="font-extrabold text-xs text-[#ECEBE9] flex items-center gap-1.5">
                            {model.iconType === 'code' && <Code size={13} className="text-[#3C6B4D]" />}
                            {model.iconType === 'vision' && <Eye size={13} className="text-[#3C6B4D]" />}
                            {model.iconType === 'general' && <Globe size={13} className="text-[#3C6B4D]" />}
                            <span>{model.name}</span>
                          </h4>
                          <div className="flex items-center gap-2 text-[10px] text-[#A3A09B] font-mono">
                            <span>Params: {model.parameters}</span>
                            <span>•</span>
                            <span>Context: {model.contextWindow}</span>
                          </div>
                        </div>

                        {installed ? (
                          <span className="bg-[#3C6B4D]/10 border border-[#3C6B4D]/30 text-[#3C6B4D] px-2 py-0.5 rounded-lg text-[9px] font-bold font-mono flex items-center gap-1">
                            <Check size={9} /> Installed
                          </span>
                        ) : (
                          <span className="bg-[#18191B] border border-[#2A2D30] text-[#72706C] px-2 py-0.5 rounded-lg text-[9px] font-mono">
                            Registry
                          </span>
                        )}
                      </div>

                      {/* Storage specs grid */}
                      <div className="grid grid-cols-2 gap-2 bg-[#18191B] border border-[#2A2D30]/40 rounded-lg p-2 text-[10.5px] font-mono text-[#A3A09B]">
                        <div>
                          File Size: <strong className="text-[#ECEBE9]">{model.downloadSize}</strong>
                        </div>
                        <div>
                          RAM Req: <strong className="text-[#ECEBE9]">{model.vramRequired}</strong>
                        </div>
                      </div>

                      {/* Capabilities tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {model.capabilities.map((cap, cIdx) => (
                          <span key={cIdx} className="bg-[#18191B] border border-[#2A2D30] px-2 py-0.5 rounded-md text-[9px] font-mono text-[#72706C]">
                            {cap}
                          </span>
                        ))}
                      </div>

                      {/* Description */}
                      <div className="space-y-1 text-xs">
                        <p className="text-[#ECEBE9] text-[11px] leading-relaxed">
                          {model.description}
                        </p>
                        <p className="text-[10px] text-[#A3A09B] italic leading-relaxed pt-0.5">
                          <strong className="text-[#ECEBE9] font-sans not-italic">Use Case:</strong> {model.useCase}
                        </p>
                      </div>
                    </div>

                    {/* Catalog Actions */}
                    <div className="pt-2 border-t border-[#2A2D30]/65 flex gap-2">
                      {installed ? (
                        <button
                          onClick={() => {
                            if (matchingModel) {
                              setSelectedModel(matchingModel);
                            } else {
                              // Fallback construct
                              setSelectedModel({
                                registry: 'registry.ollama.ai',
                                namespace: 'library',
                                name: model.id.split(':')[0],
                                tag: model.id.split(':')[1] || 'latest',
                                sizeBytes: 0,
                                layersCount: 0,
                                manifestPath: ''
                              });
                            }
                            setActiveTab('export');
                          }}
                          className="flex-1 bg-[#18191B] hover:bg-[#2A2D30] border border-[#2A2D30] text-[#ECEBE9] py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1"
                        >
                          <Upload size={11} />
                          <span>Go to Export Panel</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setPullModelName(model.id);
                            setActiveTab('pull');
                            handlePullModel(model.id);
                          }}
                          disabled={isPulling}
                          className="flex-1 bg-[#3C6B4D] hover:bg-[#2E533B] text-white py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1"
                        >
                          <Download size={11} />
                          <span>Pull & Install Model</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
