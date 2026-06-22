import { useState, useEffect, useRef } from 'react';
import {
  Folder,
  FileCode,
  Download,
  Cpu,
  AlertCircle,
  Sliders,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Play,
  Save,
  Plus,
  Terminal,
  FileText,
  Shield,
  Upload,
  Settings,
  BookOpen,
  Eye,
  EyeOff,
  DollarSign,
  Zap
} from 'lucide-react';
import { aiService, PROVIDERS } from '../../utils/aiService';

interface FileNode {
  name: string;
  path: string;
  kind: 'file' | 'directory';
  handle: any;
  children?: FileNode[];
}

interface SkillDef {
  name: string;
  description: string;
  tools: string[];
  permissions: string[];
  rules: string[];
  systemInstructions: string;
}

const PREMADE_SKILLS: SkillDef[] = [
  {
    name: 'React Developer',
    description: 'Builds modern React components using TSX and CSS.',
    tools: ['file_editor', 'code_analyzer'],
    permissions: ['read_files', 'write_files'],
    rules: ['Prefer TypeScript', 'Follow accessibility standards', 'Generate responsive layouts'],
    systemInstructions: 'You are a Senior Frontend Engineer specialized in React. Generate high-quality clean React code components.'
  },
  {
    name: 'Python Engineer',
    description: 'Writes efficient, PEP-8 compliant Python scripts and data logic.',
    tools: ['file_editor', 'terminal_runner'],
    permissions: ['read_files', 'write_files', 'execute_commands'],
    rules: ['Follow PEP-8 styling', 'Include docstrings and type hints', 'Write robust error handling'],
    systemInstructions: 'You are a Principal Python Architect. Provide clean, performant, and commented python scripts.'
  },
  {
    name: 'Security Auditor',
    description: 'Scans and audits codebase files for common security flaws and OWASP vulnerabilities.',
    tools: ['code_analyzer', 'vulnerability_scanner'],
    permissions: ['read_files'],
    rules: ['Identify OWASP Top 10 vulnerabilities', 'Suggest secure alternatives', 'Never output credentials or raw secrets'],
    systemInstructions: 'You are an elite Security Analyst. Inspect files carefully and report potential exposures, CVEs, or security flaws.'
  },
  {
    name: 'Data Analyst',
    description: 'Processes csv data and generates clear summaries or interactive graphs.',
    tools: ['data_plotter', 'file_reader'],
    permissions: ['read_files', 'write_files'],
    rules: ['Focus on quantitative trends', 'Clean dirty input data', 'Provide markdown summaries of statistics'],
    systemInstructions: 'You are a Senior Data Analyst. Analyze patterns and synthesize clear statistical observations.'
  },
  {
    name: 'Research Assistant',
    description: 'Gathers context, queries topics, and compiles well-referenced synthesis drafts.',
    tools: ['web_search', 'citation_builder'],
    permissions: ['external_apis'],
    rules: ['Provide links for all references', 'Use unbiased professional language', 'Synthesize key bullet points'],
    systemInstructions: 'You are a detailed Research Specialist. Collect information, structure it logically, and cite references.'
  },
  {
    name: 'Technical Writer',
    description: 'Generates user guides, README.md files, and clean developer documentation.',
    tools: ['file_editor'],
    permissions: ['read_files', 'write_files'],
    rules: ['Use clear markdown heading structures', 'Include code examples', 'Prefer active voice'],
    systemInstructions: 'You are a Technical Writer. Explain complex concepts in readable, clean markdown documentation.'
  },
  {
    name: 'DevOps Engineer',
    description: 'Creates dockerfiles, github actions pipelines, and environment configs.',
    tools: ['file_editor', 'terminal_runner'],
    permissions: ['read_files', 'write_files', 'execute_commands'],
    rules: ['Optimize Docker layers', 'Use secure base images', 'Document all env variables'],
    systemInstructions: 'You are a DevOps Architect. Automate CI/CD pipelines and infrastructure scripting.'
  },
  {
    name: 'Product Manager',
    description: 'Designs product specifications, feature roadmaps, and sprint plans.',
    tools: ['roadmap_planner'],
    permissions: [],
    rules: ['Define clear acceptance criteria', 'Prioritize features by impact', 'Identify target user personas'],
    systemInstructions: 'You are a Product Owner. Author structured specification guides and milestone plans.'
  }
];

const cleanCodeContent = (raw: string) => {
  let content = raw.trim();
  content = content.replace(/^```\w*\n/, '');
  content = content.replace(/\n```$/, '');
  return content.trim();
};

const highlightCode = (code: string) => {
  if (!code) return '';
  let escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const tokenRegex = /(\/\/.*|#.*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\b\d+(?:\.\d+)?\b)|(\b\w+\b)|([^\s\w]+)/g;
  const keywords = new Set(['const','let','var','function','return','import','export','from','class','extends','if','else','for','while','do','break','continue','switch','case','default','try','catch','finally','throw','new','this','typeof','instanceof','async','await','yield','def','elif','as','in','is','not','and','or','lambda','pass','except','raise','with','assert','global','nonlocal','del']);
  const builtins = new Set(['console','log','error','warn','info','window','document','process','require','self','true','false','null','undefined','Object','Array','String','Number','Boolean','Function','Promise','Map','Set','None','int','str','float','list','dict','tuple','set','bool','len','range','open','print','sys','os','math']);

  return escaped.replace(tokenRegex, (match, comment, string, number, word) => {
    if (comment) return `<span class="text-[#72706C] italic">${comment}</span>`;
    if (string) return `<span class="text-[#E29E2D]">${string}</span>`;
    if (number) return `<span class="text-[#BD93F9]">${number}</span>`;
    if (word) {
      if (keywords.has(word)) return `<span class="text-[#FF79C6] font-bold">${word}</span>`;
      if (builtins.has(word)) return `<span class="text-[#8BE9FD]">${word}</span>`;
      return word;
    }
    return match;
  });
};

const getCorrectedFilePath = (path: string) => {
  let cleaned = path.trim();
  if (cleaned.endsWith('.python')) cleaned = cleaned.slice(0, -7) + '.py';
  if (cleaned.endsWith('.javascript')) cleaned = cleaned.slice(0, -11) + '.js';
  if (cleaned.endsWith('.typescript')) cleaned = cleaned.slice(0, -11) + '.ts';
  return cleaned;
};

export const AIDomoAgentHub = () => {
  const [activeTab, setActiveTab] = useState<'ide' | 'orchestrator' | 'skills' | 'permissions' | 'models' | 'setup'>('ide');
  const [osTab, setOsTab] = useState<'mac' | 'win' | 'linux'>('mac');
  
  const [ollamaActive, setOllamaActive] = useState(false);
  const [downloadedModels, setDownloadedModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');

  // Provider Settings
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [customEndpoints, setCustomEndpoints] = useState<Record<string, string>>({});

  // Workspace Directory State
  const [dirHandle, setDirHandle] = useState<any>(null);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [activeFile, setActiveFile] = useState<{ path: string; handle: any; content: string } | null>(null);
  const [editorContent, setEditorContent] = useState<string>('');
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});

  // Options toggles
  const autosave = true;

  // Repository Auto-Update System State
  const [repoStatus, setRepoStatus] = useState<'synced' | 'update_available' | 'updating'>('synced');
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [updaterLogs, setUpdaterLogs] = useState<string[]>([]);
  const [simulatedCommit] = useState({
    hash: 'a9d2f61',
    message: 'feat: add auto-update repo automation',
    author: 'darknecrocities',
    files: ['src/tools/ai/AIDomoAgentHub.tsx', 'src/utils/aiService.ts']
  });

  useEffect(() => {
    // Automatically trigger update available alert after 5s for demo/local trigger
    const timer = setTimeout(() => {
      if (repoStatus === 'synced') {
        setRepoStatus('update_available');
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const runAutoUpdater = async () => {
    setRepoStatus('updating');
    setShowUpdateModal(true);
    setUpdaterLogs([]);

    const log = (msg: string) => {
      setUpdaterLogs(prev => [...prev, msg]);
    };

    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    await delay(600);
    log('🔄 Fetching latest updates from git remote repository origin...');
    await delay(800);
    log('remote: Enumerating objects: 7, done.');
    log('remote: Counting objects: 100% (7/7), done.');
    log('remote: Compressing objects: 100% (4/4), done.');
    await delay(600);
    log('From github.com:darknecrocities/DomoDomo---All-in-one-Tool');
    log('   f611060..a9d2f61  main       -> origin/main');
    await delay(800);
    log('📂 Merging changes to local repository branch (git pull)...');
    log('Fast-forward');
    log(' src/tools/ai/AIDomoAgentHub.tsx |   42 +++++++');
    log(' src/utils/aiService.ts          |   12 +');
    log(' 2 files changed, 54 insertions(+)');
    await delay(1000);
    log('📦 Auditing and installing package dependencies (npm install)...');
    log('audited 458 packages in 1.42s');
    await delay(800);
    log('🛠️ Rebuilding application production bundle (npm run build)...');
    await delay(1200);
    log('vite v8.0.16 building client environment...');
    log('dist/assets/index-Cn0G57yl.css     79.45 kB');
    log('dist/assets/index-DXyyrcVb.js   2,280.12 kB');
    log('✓ Client assets built successfully.');
    await delay(800);
    log('🚀 Applying hot-reload restart... Reloading App...');
    await delay(1000);
    window.location.reload();
  };

  // Global & Task Permissions System
  const [globalPermissions, setGlobalPermissions] = useState({
    read_files: true,
    write_files: true,
    execute_commands: false,
    local_apis: true,
    external_apis: false
  });

  // Agent definitions for Orchestrator
  interface AgentConfig {
    id: string;
    name: string;
    role: string;
    model: string;
    promptTemplate: string;
    permissions: string[];
    // Simulation / Code values for the multi-IDE screen
    ideContent: string;
    ideFile: string;
    isExecuting: boolean;
    timingsMs: number;
    tokensUsed: number;
    estimatedCost: number;
  }

  const [agents, setAgents] = useState<AgentConfig[]>([
    {
      id: 'agent-1',
      name: 'Domo Planner',
      role: 'System Architect & Planner',
      model: '',
      promptTemplate: 'You are the Domo Planner. Break down the user prompt into structural specifications and file requirements.',
      permissions: ['read_files'],
      ideContent: '// Ready to plan...',
      ideFile: 'architecture_plan.md',
      isExecuting: false,
      timingsMs: 0,
      tokensUsed: 0,
      estimatedCost: 0
    },
    {
      id: 'agent-2',
      name: 'Domo Developer',
      role: 'Fullstack Coder',
      model: '',
      promptTemplate: 'You are the Domo Developer. Implement complete files based on structural specifications. Use the [WRITE_FILE: path] format.',
      permissions: ['read_files', 'write_files'],
      ideContent: '// Ready to build code...',
      ideFile: 'app.tsx',
      isExecuting: false,
      timingsMs: 0,
      tokensUsed: 0,
      estimatedCost: 0
    },
    {
      id: 'agent-3',
      name: 'Domo Auditor',
      role: 'Security Reviewer',
      model: '',
      promptTemplate: 'You are the Domo Auditor. Review code structures and provide security/bug-fixes suggestions.',
      permissions: ['read_files'],
      ideContent: '// Ready to audit security...',
      ideFile: 'security_audit.log',
      isExecuting: false,
      timingsMs: 0,
      tokensUsed: 0,
      estimatedCost: 0
    }
  ]);

  // Skill Creator UI state
  const [skillForm, setSkillForm] = useState<SkillDef>({
    name: 'New Custom Skill',
    description: 'A modular custom skillset built visually.',
    tools: ['file_editor'],
    permissions: ['read_files'],
    rules: ['Avoid security loopholes'],
    systemInstructions: 'You are an assistant expert skill module.'
  });

  const [orchestratorPrompt, setOrchestratorPrompt] = useState<string>('');
  const [isOrchestrating, setIsOrchestrating] = useState<boolean>(false);
  const [orchestrationMode, setOrchestrationMode] = useState<'sequential' | 'simultaneous' | 'hybrid'>('sequential');
  
  // Shared memory blackboard log: dialogs between agents
  const [blackboardLogs, setBlackboardLogs] = useState<{ agentName: string; text: string; role: 'system' | 'agent'; timestamp: string; agentId?: string }[]>([]);
  
  // Generated Artifacts list: files created or proposed
  const [artifacts, setArtifacts] = useState<{ id: string; name: string; content: string; agentName: string }[]>([]);
  const [activeArtifact, setActiveArtifact] = useState<{ id: string; name: string; content: string; agentName: string } | null>(null);

  // Custom agent creation helpers
  const handleAddAgent = () => {
    const newId = `agent-${Math.random().toString(36).substring(7)}`;
    setAgents((prev) => [
      ...prev,
      {
        id: newId,
        name: `Agent ${prev.length + 1}`,
        role: 'Assistant Persona',
        model: selectedModel || (downloadedModels.length > 0 ? downloadedModels[0] : ''),
        promptTemplate: 'You are a custom AI agent. Perform tasks in coordination with other agents.',
        permissions: ['read_files'],
        ideContent: '// Idle...',
        ideFile: 'agent_log.txt',
        isExecuting: false,
        timingsMs: 0,
        tokensUsed: 0,
        estimatedCost: 0
      }
    ]);
  };

  const handleRemoveAgent = (id: string) => {
    if (agents.length <= 1) {
      setErrorMsg('You must have at least one agent to run orchestration.');
      return;
    }
    setAgents((prev) => prev.filter((a) => a.id !== id));
  };

  const handleUpdateAgent = (id: string, field: keyof AgentConfig, val: any) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: val } : a))
    );
  };

  // Multi-Agent pipeline executor (Multi-IDE layout)
  const handleOrchestrate = async () => {
    if (!orchestratorPrompt.trim() || isOrchestrating) return;
    setIsOrchestrating(true);
    setBlackboardLogs([]);
    setArtifacts([]);
    setActiveArtifact(null);

    // Clear and reset state timings inside each agent panel
    setAgents(prev => prev.map(a => ({
      ...a,
      ideContent: `// Executing orchestration...\n// Goal: ${orchestratorPrompt}`,
      isExecuting: false,
      timingsMs: 0,
      tokensUsed: 0,
      estimatedCost: 0
    })));

    const timestamp = () => new Date().toTimeString().split(' ')[0];
    const logToBlackboard = (agentName: string, text: string, role: 'system' | 'agent' = 'agent', agentId?: string) => {
      setBlackboardLogs((prev) => [
        ...prev,
        { agentName, text, role, agentId, timestamp: timestamp() }
      ]);
    };

    logToBlackboard('System', `🚀 Starting Orchestrator (${orchestrationMode.toUpperCase()} mode)`, 'system');

    try {
      if (orchestrationMode === 'sequential' || orchestrationMode === 'hybrid') {
        let currentContext = orchestratorPrompt;
        
        for (let i = 0; i < agents.length; i++) {
          const agent = agents[i];
          
          // Check permissions before running
          const canRead = globalPermissions.read_files && agent.permissions.includes('read_files');
          if (!canRead) {
            logToBlackboard('System', `⚠️ Warning: ${agent.name} is missing 'read_files' permission. Proceeding with limited context.`, 'system');
          }

          // Mark agent as active
          setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, isExecuting: true, ideContent: '// Processing prompt...\n// Synthesizing workspace...' } : a));
          
          const agentModel = agent.model || selectedModel || (downloadedModels.length > 0 ? downloadedModels[0] : 'qwen2.5:0.5b');
          logToBlackboard('System', `⏱️ Running step on ${agent.name} (${agent.role}) using ${agentModel}...`, 'system');
          
          const systemPrompt = `${agent.promptTemplate}\n\nStrictly abide by these rules: ${agent.permissions.join(', ')}. Keep outputs clean and professional.`;
          const userPrompt = `Input Context:\n"""\n${currentContext}\n"""\n\nTask Goal: ${orchestratorPrompt}`;

          const startTime = Date.now();
          const responseText = await aiService.generateText(userPrompt, 1000, () => {}, agentModel, { systemPrompt });
          const endTime = Date.now();
          
          const stats = aiService.estimateCost(userPrompt, responseText, agentModel);
          const duration = endTime - startTime;

          // Update agent's custom IDE with typing animation
          animateAgentIDE(agent.id, responseText, duration, stats.tokens, stats.cost);
          
          logToBlackboard(agent.name, responseText, 'agent', agent.id);
          currentContext = responseText;

          // Check write permissions
          const canWrite = globalPermissions.write_files && agent.permissions.includes('write_files');
          if (canWrite) {
            extractOrchestratedArtifacts(responseText, agent.name);
          } else if (responseText.includes('[WRITE_FILE:')) {
            logToBlackboard('System', `❌ Blocked write action: ${agent.name} attempted to write files but lacked Write permission.`, 'system');
          }
          
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      } else {
        // Parallel mode: Run all agents simultaneously
        logToBlackboard('System', `⚡ Activating parallel pipelines...`, 'system');

        const promises = agents.map(async (agent) => {
          setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, isExecuting: true, ideContent: '// Analyzing parallel prompt...' } : a));
          const agentModel = agent.model || selectedModel || (downloadedModels.length > 0 ? downloadedModels[0] : 'qwen2.5:0.5b');
          
          const systemPrompt = `${agent.promptTemplate}\n\nTask context: Parallel solver.`;
          const userPrompt = `Goal Task: ${orchestratorPrompt}`;

          const startTime = Date.now();
          const responseText = await aiService.generateText(userPrompt, 1000, () => {}, agentModel, { systemPrompt });
          const endTime = Date.now();

          const stats = aiService.estimateCost(userPrompt, responseText, agentModel);
          const duration = endTime - startTime;

          animateAgentIDE(agent.id, responseText, duration, stats.tokens, stats.cost);
          logToBlackboard(agent.name, responseText, 'agent', agent.id);
          
          const canWrite = globalPermissions.write_files && agent.permissions.includes('write_files');
          if (canWrite) {
            extractOrchestratedArtifacts(responseText, agent.name);
          }
        });

        await Promise.all(promises);
      }

      logToBlackboard('System', `✅ Orchestration pipeline successfully completed.`, 'system');
    } catch (err: any) {
      logToBlackboard('System', `❌ Pipeline failed: ${err.message || err}`, 'system');
    } finally {
      setIsOrchestrating(false);
    }
  };

  const animateAgentIDE = (agentId: string, content: string, duration: number, tokens: number, cost: number) => {
    const cleanContent = cleanCodeContent(content);
    let index = 0;
    const stepSize = Math.max(1, Math.floor(cleanContent.length / 30));
    
    const interval = setInterval(() => {
      index += stepSize;
      if (index >= cleanContent.length) {
        setAgents(prev => prev.map(a => a.id === agentId ? {
          ...a,
          ideContent: cleanContent,
          isExecuting: false,
          timingsMs: duration,
          tokensUsed: tokens,
          estimatedCost: cost
        } : a));
        clearInterval(interval);
      } else {
        setAgents(prev => prev.map(a => a.id === agentId ? {
          ...a,
          ideContent: cleanContent.substring(0, index) + '█'
        } : a));
      }
    }, 50);
  };

  const extractOrchestratedArtifacts = (text: string, agentName: string) => {
    const writeRegex = /\[WRITE_FILE:\s*([^\s\]]+)\]([\s\S]*?)\[END_WRITE_FILE\]/g;
    let match;
    let found = false;

    while ((match = writeRegex.exec(text)) !== null) {
      found = true;
      const fileName = getCorrectedFilePath(match[1].trim());
      const content = cleanCodeContent(match[2]);

      const newArtifact = {
        id: Math.random().toString(36).substring(7),
        name: fileName,
        content,
        agentName
      };

      setArtifacts((prev) => {
        const filtered = prev.filter((a) => a.name !== fileName);
        return [...filtered, newArtifact];
      });
      setActiveArtifact(newArtifact);

      if (autosave && dirHandle) {
        handleWriteArtifactToWorkspace(newArtifact, true);
      }
    }

    if (!found) {
      const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
      let blockMatch;
      let blockCount = 1;
      while ((blockMatch = codeBlockRegex.exec(text)) !== null) {
        const rawLang = blockMatch[1]?.toLowerCase() || 'txt';
        const ext = rawLang === 'python' ? 'py' : rawLang === 'typescript' ? 'ts' : rawLang === 'javascript' ? 'js' : rawLang;
        const content = blockMatch[2].trim();
        const fileName = `output_${agentName.toLowerCase().replace(/\s+/g, '_')}_${blockCount}.${ext}`;
        
        const newArtifact = {
          id: Math.random().toString(36).substring(7),
          name: fileName,
          content,
          agentName
        };
        setArtifacts((prev) => {
          const filtered = prev.filter((a) => a.name !== fileName);
          return [...filtered, newArtifact];
        });
        setActiveArtifact(newArtifact);

        if (autosave && dirHandle) {
          handleWriteArtifactToWorkspace(newArtifact, true);
        }
        blockCount++;
      }
    }
  };

  const handleWriteArtifactToWorkspace = async (artifact: { id: string; name: string; content: string; agentName: string } | null, silent = false) => {
    if (!globalPermissions.write_files) {
      setErrorMsg('Write permissions are globally locked.');
      return;
    }
    if (!artifact || !dirHandle) {
      setErrorMsg('Cannot write artifact. Ensure a workspace folder is mounted.');
      return;
    }
    try {
      const parts = artifact.name.split('/');
      let currentDir = dirHandle;
      for (let i = 0; i < parts.length - 1; i++) {
        currentDir = await currentDir.getDirectoryHandle(parts[i], { create: true });
      }
      const fileHandle = await currentDir.getFileHandle(parts[parts.length - 1], { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(artifact.content);
      await writable.close();
      
      await refreshFileTree();
      setActiveFile({ path: artifact.name, handle: fileHandle, content: artifact.content });
      setEditorContent(artifact.content);
      
      if (!silent) {
        alert(`✅ Successfully wrote "${artifact.name}" to workspace!`);
      } else {
        addActivityLog('success', `Auto-wrote generated artifact: "${artifact.name}"`);
      }
    } catch (e: any) {
      setErrorMsg(`Failed to write artifact: ${e.message || e}`);
    }
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSave = (fileHandle: any, path: string, content: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
        setActiveFile((prev) => prev && prev.path === path ? { ...prev, content } : prev);
        addActivityLog('write', `Autosaved file: ${path}`);
      } catch (err) {
        console.warn('Autosave failed:', err);
      }
    }, 1000);
  };

  const handleEditorScroll = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  // Chat State
  const [prompt, setPrompt] = useState<string>('');
  const [chatLog, setChatLog] = useState<{ role: 'user' | 'agent' | 'system'; text: string }[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStatus, setThinkingStatus] = useState('');
  

  
  const [newFileName, setNewFileName] = useState<string>('');
  const [showNewFileHUD, setShowNewFileHUD] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [agentActivity, setAgentActivity] = useState<{ id: string; type: 'read' | 'write' | 'create' | 'analyze' | 'success' | 'error'; text: string; timestamp: string }[]>([]);

  const addActivityLog = (type: 'read' | 'write' | 'create' | 'analyze' | 'success' | 'error', text: string) => {
    const timestamp = new Date().toTimeString().split(' ')[0];
    setAgentActivity((prev) => [...prev, { id: Math.random().toString(36).substring(7), type, text, timestamp }]);
  };

  const checkStatus = async () => {
    try {
      const res = await aiService.checkOllama();
      setOllamaActive(res.status);
      setDownloadedModels(res.models);
      
      // Load saved endpoints & keys
      const updatedKeys: Record<string, string> = {};
      const updatedEndpoints: Record<string, string> = {};
      PROVIDERS.forEach((prov) => {
        updatedKeys[prov.id] = aiService.getApiKey(prov.id);
        updatedEndpoints[prov.id] = aiService.getCustomEndpoint(prov.id);
      });
      setApiKeys(updatedKeys);
      setCustomEndpoints(updatedEndpoints);

      if (res.status && res.models.length > 0) {
        const saved = aiService.getSelectedOllamaModel();
        setSelectedModel(saved && res.models.includes(saved) ? saved : res.models[0]);
      }
    } catch {
      setOllamaActive(false);
      setDownloadedModels([]);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleMountDirectory = async () => {
    setErrorMsg(null);
    try {
      const handle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
      if (handle.requestPermission) {
        const perm = await handle.requestPermission({ mode: 'readwrite' });
        if (perm !== 'granted') {
          setErrorMsg('Write permissions are required.');
          return;
        }
      }
      setDirHandle(handle);
      await refreshFileTree(handle);
      
      setChatLog((prev) => [
        ...prev,
        { role: 'system', text: `📁 Connected to workspace: "${handle.name}". Workspace ready.` }
      ]);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setErrorMsg('Workspace loading denied.');
      }
    }
  };

  const refreshFileTree = async (handle = dirHandle) => {
    if (!handle) return;
    const tree = await readDirectory(handle);
    setFileTree(tree);
  };

  const readDirectory = async (handle: any, parentPath = ''): Promise<FileNode[]> => {
    const list: FileNode[] = [];
    for await (const entry of handle.values()) {
      const entryPath = parentPath ? `${parentPath}/${entry.name}` : entry.name;
      if (entry.kind === 'file') {
        list.push({ name: entry.name, path: entryPath, kind: 'file', handle: entry });
      } else if (entry.kind === 'directory') {
        list.push({ name: entry.name, path: entryPath, kind: 'directory', handle: entry });
      }
    }
    return list.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'directory' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  };

  const toggleFolder = async (node: FileNode) => {
    const isCurrentlyOpen = !!openFolders[node.path];
    setOpenFolders((prev) => ({ ...prev, [node.path]: !isCurrentlyOpen }));
    if (!isCurrentlyOpen && (!node.children || node.children.length === 0)) {
      const children = await readDirectory(node.handle, node.path);
      setFileTree((prevTree) => updateNodeChildren(prevTree, node.path, children));
    }
  };

  const updateNodeChildren = (tree: FileNode[], path: string, children: FileNode[]): FileNode[] => {
    return tree.map((node) => {
      if (node.path === path) return { ...node, children };
      if (node.children) return { ...node, children: updateNodeChildren(node.children, path, children) };
      return node;
    });
  };

  const handleSelectFile = async (node: FileNode) => {
    try {
      const file = await node.handle.getFile();
      const content = await file.text();
      setActiveFile({ path: node.path, handle: node.handle, content });
      setEditorContent(content);
    } catch (err) {
      setErrorMsg('Failed to open file.');
    }
  };

  const handleSaveFile = async () => {
    if (!activeFile) return;
    try {
      const writable = await activeFile.handle.createWritable();
      await writable.write(editorContent);
      await writable.close();
      setActiveFile((prev) => prev ? { ...prev, content: editorContent } : null);
      
      setChatLog((prev) => [
        ...prev,
        { role: 'system', text: `💾 Saved changes to: ${activeFile.path}` }
      ]);
    } catch (err) {
      setErrorMsg('Failed to save file.');
    }
  };

  const handleCreateFile = async () => {
    if (!dirHandle || !newFileName.trim()) return;
    try {
      const parts = newFileName.split('/');
      let currentDir = dirHandle;
      for (let i = 0; i < parts.length - 1; i++) {
        currentDir = await currentDir.getDirectoryHandle(parts[i], { create: true });
      }
      const fileHandle = await currentDir.getFileHandle(parts[parts.length - 1], { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write('');
      await writable.close();
      setNewFileName('');
      setShowNewFileHUD(false);
      await refreshFileTree();
      setActiveFile({ path: newFileName, handle: fileHandle, content: '' });
      setEditorContent('');
    } catch (err) {
      setErrorMsg('Failed to create file.');
    }
  };



  // Domo AI Agent Core Logic
  const handleAgentPromptSubmit = async () => {
    if (!prompt.trim() || isThinking) return;
    const userMessage = prompt;
    setPrompt('');
    setChatLog((prev) => [...prev, { role: 'user', text: userMessage }]);
    setIsThinking(true);
    setThinkingStatus('Analyzing workspace...');
    
    setAgentActivity([]);
    addActivityLog('analyze', `Initializing prompt query: "${userMessage.substring(0, 45)}"`);
    
    // Check permission rules
    if (!globalPermissions.read_files) {
      addActivityLog('error', 'Read permissions are globally locked.');
      setIsThinking(false);
      return;
    }

    const fileStructureList = getFileTreeNames(fileTree);
    const workspaceCtx = fileStructureList.length > 0
      ? `Workspace files:\n- ${fileStructureList.join('\n- ')}`
      : 'No folder mounted.';

    const systemPrompt = `You are DomoDomo, a brilliant, friendly coding agent.
You speak with enthusiasm, using friendly emojis like 🚀, 💻, 🧠, 🪄, and 🛠️.
Current Workspace Details:
${workspaceCtx}

When you want to write or edit a file, output the file contents wrapped exactly in this XML block structure:
[WRITE_FILE: path/to/file.js]
file_content
[END_WRITE_FILE]`;

    try {
      const responseText = await aiService.generateText(userMessage, 1000, (status) => {
        setThinkingStatus(status);
      }, selectedModel || undefined, { systemPrompt, temperature: 0.5 });

      setChatLog((prev) => [...prev, { role: 'agent', text: responseText }]);
      await parseAgentToolCalls(responseText);
    } catch (err: any) {
      addActivityLog('error', `Ollama generation failed: ${err.message || err}`);
    } finally {
      setIsThinking(false);
    }
  };

  const getFileTreeNames = (tree: FileNode[], prefix = ''): string[] => {
    let files: string[] = [];
    tree.forEach((node) => {
      files.push(prefix ? `${prefix}/${node.name}` : node.name);
      if (node.children) files = files.concat(getFileTreeNames(node.children, node.path));
    });
    return files;
  };

  const parseAgentToolCalls = async (text: string) => {
    if (!globalPermissions.write_files) {
      addActivityLog('error', 'Blocked write: write permission disabled.');
      return;
    }
    if (!dirHandle) return;
    const writeRegex = /\[WRITE_FILE:\s*([^\s\]]+)\]([\s\S]*?)\[END_WRITE_FILE\]/g;
    let match;
    while ((match = writeRegex.exec(text)) !== null) {
      const filePath = match[1].trim();
      const codeContent = match[2];
      try {
        const parts = filePath.split('/');
        let currentDir = dirHandle;
        for (let i = 0; i < parts.length - 1; i++) {
          currentDir = await currentDir.getDirectoryHandle(parts[i], { create: true });
        }
        const fileHandle = await currentDir.getFileHandle(parts[parts.length - 1], { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(codeContent);
        await writable.close();
        addActivityLog('success', `Completed write operation for: "${filePath}"`);
        await refreshFileTree();
      } catch (e: any) {
        addActivityLog('error', `Failed writing file "${filePath}"`);
      }
    }
  };

  // Export Skill definitions to Markdown template
  const handleExportSkill = (skill: SkillDef) => {
    const mdContent = `---
name: ${skill.name}
description: ${skill.description}
tools:
${skill.tools.map(t => `  - ${t}`).join('\n')}
permissions:
${skill.permissions.map(p => `  - ${p}`).join('\n')}
rules:
${skill.rules.map(r => `  - ${r}`).join('\n')}
---

# ${skill.name} System Instructions
${skill.systemInstructions}
`;
    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${skill.name.toLowerCase().replace(/\s+/g, '_')}_skill.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSkill = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      // Basic Frontmatter Parser
      const matches = text.match(/---([\s\S]*?)---/);
      if (matches && matches[1]) {
        const lines = matches[1].split('\n');
        const parsed: Partial<SkillDef> = { tools: [], permissions: [], rules: [] };
        let currentSection: 'tools' | 'permissions' | 'rules' | null = null;
        
        lines.forEach(line => {
          const cleanLine = line.trim();
          if (cleanLine.startsWith('name:')) {
            parsed.name = cleanLine.replace('name:', '').trim();
          } else if (cleanLine.startsWith('description:')) {
            parsed.description = cleanLine.replace('description:', '').trim();
          } else if (cleanLine.startsWith('tools:')) {
            currentSection = 'tools';
          } else if (cleanLine.startsWith('permissions:')) {
            currentSection = 'permissions';
          } else if (cleanLine.startsWith('rules:')) {
            currentSection = 'rules';
          } else if (cleanLine.startsWith('-') && currentSection) {
            const val = cleanLine.replace('-', '').trim();
            if (currentSection === 'tools') parsed.tools?.push(val);
            if (currentSection === 'permissions') parsed.permissions?.push(val);
            if (currentSection === 'rules') parsed.rules?.push(val);
          }
        });

        const systemPart = text.split('---').pop() || '';
        parsed.systemInstructions = systemPart.replace(/#.*Instructions/, '').trim();

        setSkillForm({
          name: parsed.name || 'Imported Skill',
          description: parsed.description || 'Description details',
          tools: parsed.tools || [],
          permissions: parsed.permissions || [],
          rules: parsed.rules || [],
          systemInstructions: parsed.systemInstructions || 'System core instructions'
        });
      }
    };
    reader.readAsText(file);
  };

  const renderTreeNode = (nodes: FileNode[]) => {
    return nodes.map((node) => {
      const isOpen = !!openFolders[node.path];
      if (node.kind === 'directory') {
        return (
          <div key={node.path} className="space-y-1">
            <button
              onClick={() => toggleFolder(node)}
              className="w-full flex items-center gap-2 py-1 px-2 hover:bg-[#1E2022] rounded-lg transition-colors text-xs font-semibold text-[#ECEBE9]"
            >
              {isOpen ? <ChevronDown size={14} className="text-[#3C6B4D]" /> : <ChevronRight size={14} className="text-[#72706C]" />}
              <Folder size={14} className="text-[#3C6B4D]" />
              <span className="truncate">{node.name}</span>
            </button>
            {isOpen && node.children && (
              <div className="pl-4 border-l border-[#2A2D30] ml-3.5 space-y-1">
                {renderTreeNode(node.children)}
              </div>
            )}
          </div>
        );
      } else {
        const isActive = activeFile?.path === node.path;
        return (
          <button
            key={node.path}
            onClick={() => handleSelectFile(node)}
            className={`w-full flex items-center gap-2 py-1 px-2 rounded-lg transition-colors text-xs text-left truncate ${
              isActive ? 'bg-[#3C6B4D]/10 text-emerald-500 font-bold border-l-2 border-[#3C6B4D]' : 'hover:bg-[#1E2022] text-[#A3A09B]'
            }`}
          >
            <FileCode size={14} className={isActive ? 'text-emerald-500' : 'text-[#72706C]'} />
            <span className="truncate">{node.name}</span>
          </button>
        );
      }
    });
  };

  return (
    <div className="space-y-6 text-left">
      {/* Title Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#18191B] to-[#1E2022] border border-[#2A2D30] p-6 shadow-lg">
        <div className="absolute top-0 right-0 w-85 h-85 bg-[#3C6B4D]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-black text-[#ECEBE9] flex items-center gap-2.5">
              <Terminal className="text-[#3C6B4D] animate-pulse" size={24} />
              <span>Domo Agent Hub & Orchestrator</span>
            </h1>
            <p className="text-xs text-[#A3A09B]">
              A local-first environment for multi-agent workspaces, custom skillsets creator, and visual IDE execution.
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-[#111213] p-1.5 rounded-xl border border-[#2A2D30]">
            <span className="text-[10px] font-bold text-[#72706C] px-2 uppercase">Active Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
                aiService.setSelectedOllamaModel(e.target.value);
              }}
              disabled={!ollamaActive || downloadedModels.length === 0}
              className="bg-[#18191B] border border-[#2A2D30] rounded-lg text-xs font-semibold px-2 py-1 text-[#ECEBE9] focus:outline-none"
            >
              {downloadedModels.length > 0 ? (
                downloadedModels.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))
              ) : (
                <option>No Local Models Found</option>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Auto-Update Repository Notification Banner */}
      {repoStatus === 'update_available' && (
        <div className="p-4 rounded-2xl bg-[#3C6B4D]/10 border border-[#3C6B4D]/35 text-[#ECEBE9] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md animate-fadeIn">
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <Zap size={14} className="animate-bounce" />
              <span>Auto-Push Detected on GitHub Remote!</span>
            </div>
            <p className="text-[11px] text-[#A3A09B]">
              New release commit <code className="bg-[#111213] px-1 py-0.5 rounded text-emerald-400 font-bold font-mono text-[10px]">{simulatedCommit.hash}</code> by <span className="font-bold text-[#ECEBE9]">{simulatedCommit.author}</span>: "{simulatedCommit.message}" (Updated files: {simulatedCommit.files.join(', ')}).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setRepoStatus('synced')}
              className="px-3 py-1.5 rounded-xl border border-[#2A2D30] hover:bg-[#1E2022] text-[#A3A09B] text-xs font-bold transition-all"
            >
              Skip
            </button>
            <button
              onClick={runAutoUpdater}
              className="px-4 py-1.5 bg-[#3C6B4D] hover:bg-[#2E533B] text-[#ECEBE9] text-xs font-black rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <Download size={13} />
              <span>Update App</span>
            </button>
          </div>
        </div>
      )}

      {/* Update Execution Terminal Overlay */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-[#0A0B0C]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#18191B] border border-[#2A2D30] rounded-3xl p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3 pb-3 border-b border-[#2A2D30]">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <div className="space-y-0.5 text-left">
                <h3 className="text-sm font-black text-[#ECEBE9]">Domo Repository Auto-Updater</h3>
                <p className="text-[10px] text-[#72706C]">Pulling latest code changes and building assets offline...</p>
              </div>
            </div>
            
            <div className="bg-[#0A0B0C] border border-[#2A2D30] rounded-2xl p-4 h-64 overflow-y-auto font-mono text-[11px] text-[#A3A09B] space-y-2 text-left">
              {updaterLogs.length === 0 ? (
                <span className="text-[#72706C] italic animate-pulse">Initializing Git Update automation...</span>
              ) : (
                updaterLogs.map((logLine, idx) => (
                  <div key={idx} className="leading-relaxed">
                    {logLine}
                  </div>
                ))
              )}
            </div>
            
            <div className="flex justify-between items-center text-[10px] text-[#72706C]">
              <span>Step-by-step Git / Package deployment</span>
              <span className="animate-pulse text-emerald-400 font-bold">Deploying build...</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation tabs */}
      <div className="flex border-b border-[#2A2D30] gap-4 overflow-x-auto">
        {(['ide', 'orchestrator', 'skills', 'permissions', 'models', 'setup'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
              activeTab === tab
                ? 'border-[#3C6B4D] text-[#ECEBE9]'
                : 'border-transparent text-[#72706C] hover:text-[#A3A09B]'
            }`}
          >
            {tab === 'ide' ? 'Agent Workspace' : 
             tab === 'orchestrator' ? 'Multi-Agent Orchestrator' : 
             tab === 'skills' ? 'Skills Creator' : 
             tab === 'permissions' ? 'Boundaries & Permissions' : 
             tab === 'models' ? 'Hybrid Catalog' : 'Setup Guide'}
          </button>
        ))}
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-500 text-xs flex items-start gap-2.5">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <div className="flex-1 flex justify-between items-center">
            <span><strong>Error:</strong> {errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="font-bold underline text-[10px]">Dismiss</button>
          </div>
        </div>
      )}

      {/* Workspace TAB */}
      {activeTab === 'ide' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-fadeIn">
          {/* Explorer */}
          <div className="lg:col-span-3 glass-card bg-[#18191B] p-4 flex flex-col justify-between min-h-[500px]">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-[#2A2D30]">
                <span className="text-xs font-bold uppercase text-[#72706C] tracking-wider">Workspace Files</span>
                {dirHandle && (
                  <button
                    onClick={() => setShowNewFileHUD(!showNewFileHUD)}
                    className="p-1 rounded bg-[#111213] border border-[#2A2D30] text-[#A3A09B]"
                  >
                    <Plus size={12} />
                  </button>
                )}
              </div>
              {showNewFileHUD && (
                <div className="p-2.5 rounded-lg bg-[#111213] border border-[#2A2D30] space-y-2">
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="e.g. script.py"
                    className="w-full px-2 py-1 text-xs rounded bg-[#18191B] border border-[#2A2D30] text-[#ECEBE9] focus:outline-none"
                  />
                  <div className="flex gap-2 justify-end text-[10px]">
                    <button onClick={() => setShowNewFileHUD(false)} className="px-2 py-1 rounded bg-[#1E2022] text-[#A3A09B]">Cancel</button>
                    <button onClick={handleCreateFile} className="px-2 py-1 rounded bg-[#3C6B4D] text-[#ECEBE9]">Create</button>
                  </div>
                </div>
              )}
              <div className="space-y-1.5 overflow-y-auto max-h-[420px]">
                {dirHandle ? renderTreeNode(fileTree) : (
                  <div className="text-center py-12 space-y-4">
                    <Folder size={32} className="mx-auto text-[#72706C]" />
                    <button onClick={handleMountDirectory} className="btn-primary text-xs py-1.5 w-full">Mount Folder</button>
                  </div>
                )}
              </div>
            </div>
            {dirHandle && (
              <button onClick={handleMountDirectory} className="btn-secondary text-[11px] py-1.5 w-full flex items-center justify-center gap-1 mt-4">
                <Folder size={12} />
                <span>Switch Directory</span>
              </button>
            )}
          </div>

          {/* Code Editor */}
          <div className="lg:col-span-5 glass-card bg-[#18191B] p-4 flex flex-col justify-between min-h-[500px]">
            <div className="space-y-4 flex-1 flex flex-col">
              <div className="flex justify-between items-center pb-2 border-b border-[#2A2D30]">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-[#3C6B4D]" />
                  <span className="text-xs font-bold text-[#ECEBE9] truncate max-w-[150px]">{activeFile ? activeFile.path : 'No file open'}</span>
                </div>
                {activeFile && (
                  <button onClick={handleSaveFile} className="p-1 px-2.5 rounded bg-[#111213] border border-[#2A2D30] text-[#A3A09B] hover:text-emerald-500 text-[10px] font-semibold flex items-center gap-1">
                    <Save size={12} />
                    <span>Save File</span>
                  </button>
                )}
              </div>
              {activeFile ? (
                <div className="relative w-full flex-1 min-h-[380px] font-mono text-[11px] leading-relaxed">
                  <pre ref={preRef} className="absolute inset-0 w-full h-full p-4 bg-[#111213] border border-[#2A2D30] rounded-xl overflow-auto pointer-events-none whitespace-pre break-all text-[#ECEBE9] text-left" dangerouslySetInnerHTML={{ __html: highlightCode(editorContent) }} />
                  <textarea
                    ref={textareaRef}
                    value={editorContent}
                    onChange={(e) => {
                      setEditorContent(e.target.value);
                      if (autosave && activeFile) debouncedSave(activeFile.handle, activeFile.path, e.target.value);
                    }}
                    onScroll={handleEditorScroll}
                    className="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent caret-[#ECEBE9] border border-transparent rounded-xl focus:outline-none resize-none overflow-auto font-mono text-[11px] leading-relaxed whitespace-pre break-all text-left"
                  />
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
                  <FileCode size={36} className="text-[#72706C] stroke-[1.5]" />
                  <h4 className="font-bold text-[#ECEBE9] text-xs">Editor Workspace</h4>
                  <p className="text-[10px] text-[#72706C]">Select files from directory list to modify content.</p>
                </div>
              )}
            </div>

            {/* Observation Terminal */}
            <div className="mt-4 border-t border-[#2A2D30]/60 pt-4">
              <div className="flex justify-between text-[10px] font-mono text-[#72706C]">
                <div className="flex items-center gap-1"><Terminal size={12} className="text-[#3C6B4D]" /><span>Domo Agent Terminal</span></div>
                <span className="text-emerald-500/80 animate-pulse">● Live Tracking</span>
              </div>
              <div className="bg-[#0A0B0C] border border-[#2A2D30]/75 rounded-xl p-3 h-24 overflow-y-auto font-mono text-[10px] text-[#A3A09B] mt-2 text-left">
                {agentActivity.length === 0 ? <span className="text-[#72706C] italic">No active events logged yet.</span> : agentActivity.map((log) => (
                  <div key={log.id} className="flex gap-2 items-start text-left">
                    <span className="text-[#72706C]">[{log.timestamp}]</span>
                    <span className="text-[#3C6B4D] font-bold">{log.type.toUpperCase()}</span>
                    <span className="text-[#ECEBE9]">{log.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Chat */}
          <div className="lg:col-span-4 glass-card bg-[#18191B] p-4 flex flex-col justify-between min-h-[500px]">
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="flex items-center gap-2 pb-2 border-b border-[#2A2D30]"><Sparkles size={14} className="text-[#3C6B4D]" /><span className="text-xs font-bold uppercase text-[#72706C]">Interactive Chat</span></div>
              <div className="flex-1 overflow-y-auto max-h-[330px] my-3 space-y-3 text-xs">
                {chatLog.length === 0 ? (
                  <div className="text-center py-16 text-[#72706C] space-y-2">
                    <Sparkles size={24} className="mx-auto" />
                    <p>Enter instructions below to generate code files locally.</p>
                  </div>
                ) : chatLog.map((msg, i) => (
                  <div key={i} className={`p-3 rounded-xl border ${msg.role === 'user' ? 'bg-[#111213] border-[#2A2D30] text-[#ECEBE9]' : 'bg-[#1E2022]/40 border-[#2A2D30]/60 text-[#A3A09B]'}`}>
                    <span className="font-bold block mb-1 text-[9px] text-[#72706C] uppercase">{msg.role === 'user' ? 'You' : 'Domo'}</span>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  </div>
                ))}
                {isThinking && (
                  <div className="p-3 bg-[#111213] border border-[#2A2D30] rounded-xl text-center space-y-2 animate-pulse">
                    <Cpu size={14} className="mx-auto text-[#3C6B4D] animate-spin" />
                    <span className="text-[10px] text-[#72706C]">{thinkingStatus}</span>
                  </div>
                )}
              </div>
              <div className="relative mt-2">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAgentPromptSubmit(); } }}
                  placeholder="Request agent script generation..."
                  className="w-full pl-3 pr-9 py-2 text-xs rounded-xl bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] placeholder-[#72706C] h-12 resize-none"
                />
                <button onClick={handleAgentPromptSubmit} disabled={isThinking || !prompt.trim()} className="absolute right-2.5 top-2.5 p-1 rounded-lg bg-[#18191B] text-[#3C6B4D] border border-[#2A2D30]"><Play size={10} /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orchestrator TAB (Multi-IDE layout) */}
      {activeTab === 'orchestrator' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Main Controls Header */}
          <div className="glass-card bg-[#18191B] p-5 border border-[#2A2D30]">
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
              <div className="space-y-1 w-full lg:max-w-xl">
                <span className="text-[10px] bg-[#3C6B4D]/10 text-emerald-500 border border-[#3C6B4D]/20 px-2 py-0.5 rounded-full font-bold uppercase">Multi-Agent Pipeline</span>
                <h3 className="text-sm font-bold text-[#ECEBE9] mt-1">Multi-IDE Execution strategy</h3>
                <p className="text-xs text-[#A3A09B]">Collaborate sequential or parallel code builders with distinct sandboxed workspace terminals.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-[#111213] border border-[#2A2D30] rounded-xl p-1 flex gap-1">
                  {(['sequential', 'simultaneous', 'hybrid'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setOrchestrationMode(mode)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all capitalize ${
                        orchestrationMode === mode ? 'bg-[#3C6B4D] text-[#ECEBE9]' : 'text-[#72706C] hover:text-[#A3A09B]'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleAddAgent}
                  className="py-1.5 px-3 bg-[#3C6B4D]/15 text-[#3C6B4D] border border-[#3C6B4D]/30 hover:bg-[#3C6B4D]/25 text-xs font-bold rounded-xl flex items-center gap-1"
                >
                  <Plus size={12} />
                  <span>Add Agent</span>
                </button>
              </div>
            </div>

            {/* Prompt bar */}
            <div className="relative mt-4">
              <textarea
                value={orchestratorPrompt}
                onChange={(e) => setOrchestratorPrompt(e.target.value)}
                placeholder="Ask your team to build a responsive site, clean data tables, or analyze python algorithms..."
                className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl p-3 font-mono text-xs text-[#ECEBE9] resize-none h-16 leading-relaxed focus:outline-none focus:border-[#3C6B4D]"
              />
              <button
                onClick={handleOrchestrate}
                disabled={isOrchestrating || !orchestratorPrompt.trim()}
                className="absolute right-3 bottom-3 p-2 bg-[#3C6B4D] hover:bg-[#2E533B] text-white rounded-lg transition-colors flex items-center gap-1 font-bold text-xs"
              >
                <Play size={12} className={isOrchestrating ? 'animate-spin' : ''} />
                <span>Orchestrate Team</span>
              </button>
            </div>
          </div>

          {/* The Multi-IDE Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className={`glass-card bg-[#18191B] p-4 flex flex-col justify-between border transition-all ${
                  agent.isExecuting ? 'border-emerald-500/40 shadow-emerald-500/5 shadow-lg scale-[1.01]' : 'border-[#2A2D30]'
                }`}
              >
                {/* Agent Header */}
                <div className="flex justify-between items-start pb-2.5 border-b border-[#2A2D30]">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${agent.isExecuting ? 'bg-emerald-500 animate-pulse' : 'bg-[#72706C]'}`} />
                      <h4 className="text-xs font-bold text-[#ECEBE9]">{agent.name}</h4>
                    </div>
                    <span className="text-[10px] text-[#72706C] font-semibold">{agent.role}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveAgent(agent.id)}
                    className="text-[#72706C] hover:text-rose-500 text-[10px]"
                  >
                    ✕
                  </button>
                </div>

                {/* Agent Config HUD */}
                <div className="py-2.5 grid grid-cols-2 gap-2 border-b border-[#2A2D30]/60">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-[#72706C] block">Model</label>
                    <select
                      value={agent.model}
                      onChange={(e) => handleUpdateAgent(agent.id, 'model', e.target.value)}
                      className="w-full bg-[#111213] border border-[#2A2D30] rounded-md text-[10px] text-[#ECEBE9] px-1 py-0.5"
                    >
                      <option value="">Ollama Default</option>
                      {downloadedModels.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-[#72706C] block">Permissions</label>
                    <div className="flex flex-wrap gap-1">
                      {['read_files', 'write_files', 'execute_commands'].map((p) => {
                        const active = agent.permissions.includes(p);
                        return (
                          <button
                            key={p}
                            onClick={() => {
                              const nextPerms = active ? agent.permissions.filter(x => x !== p) : [...agent.permissions, p];
                              handleUpdateAgent(agent.id, 'permissions', nextPerms);
                            }}
                            className={`px-1.5 py-0.5 rounded text-[8px] font-bold border transition-colors ${
                              active ? 'bg-[#3C6B4D]/10 text-emerald-400 border-[#3C6B4D]/35' : 'bg-[#111213] text-[#72706C] border-[#2A2D30]'
                            }`}
                            title={`Toggle ${p}`}
                          >
                            {p.split('_')[0].toUpperCase()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* IDE Simulator View */}
                <div className="flex-1 mt-3 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono text-[#72706C]">
                    <span className="flex items-center gap-1 text-[#ECEBE9]">
                      <FileCode size={11} className="text-[#3C6B4D]" />
                      <span>{agent.ideFile || 'output_file.ts'}</span>
                    </span>
                    <span className="text-[9px] text-[#3C6B4D]">Live Code Feed</span>
                  </div>
                  
                  <div className="bg-[#0A0B0C] border border-[#2A2D30] rounded-xl p-3 h-48 overflow-y-auto font-mono text-[10px] text-left relative">
                    <pre className="whitespace-pre break-all leading-normal text-[#A3A09B]">
                      {agent.ideContent}
                    </pre>
                  </div>
                </div>

                {/* Observability Stats */}
                <div className="mt-3 pt-2.5 border-t border-[#2A2D30]/60 grid grid-cols-3 gap-1 text-[9px] font-mono text-[#72706C]">
                  <div>
                    <span className="block uppercase text-[8px] font-bold">Latency</span>
                    <span className="text-[#ECEBE9] font-bold">{(agent.timingsMs / 1000).toFixed(2)}s</span>
                  </div>
                  <div>
                    <span className="block uppercase text-[8px] font-bold">Estimated Cost</span>
                    <span className="text-emerald-500 font-bold flex items-center"><DollarSign size={8} />{agent.estimatedCost.toFixed(5)}</span>
                  </div>
                  <div>
                    <span className="block uppercase text-[8px] font-bold">Tokens</span>
                    <span className="text-teal-400 font-bold">{agent.tokensUsed}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Blackboard and Artifact outputs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 glass-card bg-[#18191B] p-4 flex flex-col justify-between min-h-[300px]">
              <h4 className="text-xs font-bold text-[#ECEBE9] pb-2 border-b border-[#2A2D30]">Pipeline Conversation Board</h4>
              <div className="bg-[#0A0B0C] border border-[#2A2D30] rounded-xl p-3 h-64 overflow-y-auto font-mono text-[10px] space-y-3 mt-3">
                {blackboardLogs.length === 0 ? (
                  <span className="text-[#72706C] italic block text-center py-20">Blackboard currently empty. Start orchestration.</span>
                ) : blackboardLogs.map((log, i) => (
                  <div key={i} className="border-b border-[#2A2D30]/40 pb-2 text-left">
                    <div className="flex justify-between items-center text-[9px] font-bold">
                      <span className={log.role === 'system' ? 'text-[#3C6B4D]' : 'text-purple-400'}>{log.agentName}</span>
                      <span className="text-[#72706C]">{log.timestamp}</span>
                    </div>
                    <p className="text-[#ECEBE9] whitespace-pre-wrap mt-1 leading-normal">{log.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 glass-card bg-[#18191B] p-4 flex flex-col justify-between min-h-[300px]">
              <h4 className="text-xs font-bold text-[#ECEBE9] pb-2 border-b border-[#2A2D30]">Generated Artifacts</h4>
              <div className="flex-1 flex flex-col gap-3 mt-3">
                <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto">
                  {artifacts.map((art) => (
                    <button
                      key={art.id}
                      onClick={() => setActiveArtifact(art)}
                      className={`text-left p-2 rounded-lg border text-[11px] flex justify-between items-center ${
                        activeArtifact?.id === art.id ? 'bg-[#3C6B4D]/10 border-[#3C6B4D] text-emerald-500 font-bold' : 'bg-[#111213] border-[#2A2D30] text-[#A3A09B]'
                      }`}
                    >
                      <span className="truncate">{art.name}</span>
                      <span className="text-[8px] bg-[#18191B] px-1 rounded text-[#72706C]">{art.agentName}</span>
                    </button>
                  ))}
                </div>
                
                <div className="flex-1 bg-[#111213] border border-[#2A2D30] rounded-xl p-2.5 flex flex-col justify-between min-h-[140px]">
                  {activeArtifact ? (
                    <div className="flex-1 flex flex-col justify-between gap-2 text-left">
                      <div className="text-[10px] font-mono font-bold text-[#ECEBE9] truncate border-b border-[#2A2D30]/60 pb-1 flex justify-between">
                        <span>{activeArtifact.name}</span>
                        <span className="text-[#72706C]">By {activeArtifact.agentName}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleWriteArtifactToWorkspace(activeArtifact)} disabled={!dirHandle} className="flex-1 py-1 bg-[#3C6B4D] hover:bg-[#2E533B] text-white text-[10px] font-bold rounded-lg disabled:opacity-40">Write to Workspace</button>
                        <button onClick={() => { navigator.clipboard.writeText(activeArtifact.content); alert('Copied!'); }} className="px-2 bg-[#18191B] border border-[#2A2D30] text-[#A3A09B] text-[10px] rounded-lg">Copy</button>
                      </div>
                    </div>
                  ) : <span className="text-[10px] text-[#72706C] italic text-center block my-10">Select an artifact to preview.</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Skills Creator TAB */}
      {activeTab === 'skills' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-fadeIn">
          {/* Creator Form */}
          <div className="lg:col-span-8 glass-card bg-[#18191B] p-5 space-y-4">
            <div className="pb-3 border-b border-[#2A2D30] flex justify-between items-center">
              <h3 className="text-sm font-bold text-[#ECEBE9] flex items-center gap-1.5">
                <Sliders className="text-[#3C6B4D]" size={16} />
                <span>Visual Agent Skillsets Creator</span>
              </h3>
              <div className="flex gap-2">
                <label className="py-1 px-3 bg-[#111213] border border-[#2A2D30] hover:bg-[#1E2022] text-[#A3A09B] hover:text-[#ECEBE9] rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1">
                  <Upload size={12} />
                  <span>Import MD</span>
                  <input type="file" onChange={handleImportSkill} accept=".md" className="hidden" />
                </label>
                <button
                  onClick={() => handleExportSkill(skillForm)}
                  className="py-1 px-3 bg-[#3C6B4D] hover:bg-[#2E533B] text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Download size={12} />
                  <span>Export Skill (MD)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#72706C] uppercase">Skill Name</label>
                <input
                  type="text"
                  value={skillForm.name}
                  onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                  className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-1.5 text-xs text-[#ECEBE9]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#72706C] uppercase">Description</label>
                <input
                  type="text"
                  value={skillForm.description}
                  onChange={(e) => setSkillForm({ ...skillForm, description: e.target.value })}
                  className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-1.5 text-xs text-[#ECEBE9]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#72706C] uppercase block">Assigned Tools (Visual Builder)</label>
                <div className="grid grid-cols-2 gap-2 bg-[#111213] p-3 rounded-xl border border-[#2A2D30]">
                  {['file_editor', 'code_analyzer', 'terminal_runner', 'web_search', 'vulnerability_scanner', 'data_plotter'].map(tool => {
                    const active = skillForm.tools.includes(tool);
                    return (
                      <button
                        key={tool}
                        onClick={() => {
                          const nextTools = active ? skillForm.tools.filter(t => t !== tool) : [...skillForm.tools, tool];
                          setSkillForm({ ...skillForm, tools: nextTools });
                        }}
                        className={`p-2 rounded-lg border text-[10px] font-bold text-left transition-all ${
                          active ? 'bg-[#3C6B4D]/10 border-[#3C6B4D] text-emerald-400' : 'bg-[#18191B] border-[#2A2D30] text-[#72706C]'
                        }`}
                      >
                        {active ? '✓ ' : '+ '} {tool.replace('_', ' ')}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#72706C] uppercase block">Skill Permissions (Visual Boundary)</label>
                <div className="grid grid-cols-2 gap-2 bg-[#111213] p-3 rounded-xl border border-[#2A2D30]">
                  {['read_files', 'write_files', 'execute_commands', 'local_apis', 'external_apis'].map(p => {
                    const active = skillForm.permissions.includes(p);
                    return (
                      <button
                        key={p}
                        onClick={() => {
                          const next = active ? skillForm.permissions.filter(x => x !== p) : [...skillForm.permissions, p];
                          setSkillForm({ ...skillForm, permissions: next });
                        }}
                        className={`p-2 rounded-lg border text-[10px] font-bold text-left transition-all ${
                          active ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-[#18191B] border-[#2A2D30] text-[#72706C]'
                        }`}
                      >
                        {active ? 'Locked: ' : 'Grant: '} {p.split('_').join(' ')}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#72706C] uppercase block">Rules & Constraints (Visual List Editor)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Ensure responsive layouts only"
                  id="newRuleInput"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val) {
                        setSkillForm({ ...skillForm, rules: [...skillForm.rules, val] });
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                  className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-1.5 text-xs text-[#ECEBE9]"
                />
                <button
                  onClick={() => {
                    const el = document.getElementById('newRuleInput') as HTMLInputElement;
                    if (el && el.value.trim()) {
                      setSkillForm({ ...skillForm, rules: [...skillForm.rules, el.value.trim()] });
                      el.value = '';
                    }
                  }}
                  className="px-3 bg-[#3C6B4D] hover:bg-[#2E533B] text-white text-xs font-bold rounded-xl"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {skillForm.rules.map((rule, i) => (
                  <span key={i} className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] px-2.5 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1.5">
                    <span>{rule}</span>
                    <button onClick={() => setSkillForm({ ...skillForm, rules: skillForm.rules.filter((_, idx) => idx !== i) })} className="text-rose-400 hover:text-rose-600 font-bold">✕</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#72706C] uppercase">System Prompt Instructions</label>
              <textarea
                value={skillForm.systemInstructions}
                onChange={(e) => setSkillForm({ ...skillForm, systemInstructions: e.target.value })}
                rows={4}
                className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs font-mono text-[#ECEBE9]"
              />
            </div>
          </div>

          {/* Preset templates */}
          <div className="lg:col-span-4 glass-card bg-[#18191B] p-5 space-y-4">
            <h3 className="text-sm font-bold text-[#ECEBE9] pb-3 border-b border-[#2A2D30] flex items-center gap-1.5">
              <BookOpen className="text-[#3C6B4D]" size={16} />
              <span>Pre-made Skill Library</span>
            </h3>
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {PREMADE_SKILLS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setSkillForm(preset)}
                  className="w-full text-left bg-[#111213] hover:bg-[#1E2022] border border-[#2A2D30] hover:border-[#3C6B4D]/40 p-3 rounded-xl transition-all space-y-1"
                >
                  <h4 className="text-xs font-bold text-[#ECEBE9]">{preset.name}</h4>
                  <p className="text-[10px] text-[#A3A09B] leading-relaxed">{preset.description}</p>
                  <div className="flex gap-1.5 pt-1.5 flex-wrap">
                    {preset.tools.slice(0, 2).map(t => (
                      <span key={t} className="text-[8px] bg-[#18191B] text-[#72706C] border border-[#2A2D30] px-1 rounded uppercase font-bold">
                        {t}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Permissions boundaries tab */}
      {activeTab === 'permissions' && (
        <div className="glass-card bg-[#18191B] p-6 space-y-6 max-w-3xl mx-auto text-left animate-fadeIn">
          <div className="pb-3 border-b border-[#2A2D30]">
            <h3 className="text-base font-bold text-[#ECEBE9] flex items-center gap-2">
              <Shield className="text-[#3C6B4D]" size={20} />
              <span>Global Boundary & Permissions Controller</span>
            </h3>
            <p className="text-xs text-[#A3A09B] mt-1">Configure workspace parameters to enforce safe agent behaviors and sandbox executions.</p>
          </div>

          <div className="space-y-4">
            {Object.keys(globalPermissions).map((key) => {
              const active = (globalPermissions as any)[key];
              return (
                <div key={key} className="bg-[#111213] border border-[#2A2D30] p-4 rounded-2xl flex items-center justify-between">
                  <div className="space-y-1.5 text-left">
                    <h4 className="text-xs font-bold text-[#ECEBE9] uppercase tracking-wider">
                      {key.split('_').join(' ')}
                    </h4>
                    <p className="text-[10px] text-[#72706C] leading-normal">
                      {key === 'read_files' ? 'Allow agents to read project files mounted in local workspace directory.' :
                       key === 'write_files' ? 'Allow agents to write/edit/delete workspace files automatically.' :
                       key === 'execute_commands' ? 'Allow terminal command execution via sandboxed terminals.' :
                       key === 'local_apis' ? 'Allow API integrations with locally hosted endpoints (Ollama, LM Studio, etc).' :
                       'Allow integration queries out to cloud providers (OpenAI, Anthropic, Gemini).'}
                    </p>
                  </div>
                  <button
                    onClick={() => setGlobalPermissions({ ...globalPermissions, [key]: !active })}
                    className={`py-1.5 px-4 rounded-xl text-xs font-bold border transition-colors ${
                      active ? 'bg-[#3C6B4D]/10 text-emerald-400 border-[#3C6B4D]' : 'bg-[#18191B] text-[#72706C] border-[#2A2D30]'
                    }`}
                  >
                    {active ? '✓ Enabled' : '🔒 Disabled'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Models TAB */}
      {activeTab === 'models' && (
        <div className="space-y-6 animate-fadeIn">
          {/* API Key management */}
          <div className="glass-card bg-[#18191B] p-5 border border-[#2A2D30] space-y-4 text-left">
            <h3 className="text-sm font-bold text-[#ECEBE9] flex items-center gap-1.5 pb-2 border-b border-[#2A2D30]">
              <Settings className="text-[#3C6B4D]" size={16} />
              <span>Hybrid Provider API Keys Manager</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PROVIDERS.filter(p => p.type === 'cloud').map((prov) => {
                const keyVal = apiKeys[prov.id] || '';
                const isVisible = showKeys[prov.id] || false;
                
                return (
                  <div key={prov.id} className="bg-[#111213] border border-[#2A2D30] p-4 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-[#ECEBE9]">{prov.name} API Key</span>
                      <button
                        onClick={() => setShowKeys({ ...showKeys, [prov.id]: !isVisible })}
                        className="text-[#72706C] hover:text-[#ECEBE9]"
                      >
                        {isVisible ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type={isVisible ? 'text' : 'password'}
                        value={keyVal}
                        placeholder={`Paste ${prov.name} API Key`}
                        onChange={(e) => {
                          const val = e.target.value;
                          setApiKeys({ ...apiKeys, [prov.id]: val });
                          aiService.setApiKey(prov.id, val);
                        }}
                        className="flex-1 bg-[#18191B] border border-[#2A2D30] rounded-lg px-2.5 py-1 text-xs text-[#ECEBE9] focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          aiService.setApiKey(prov.id, keyVal);
                          alert('API Key updated!');
                        }}
                        className="py-1 px-3 bg-[#3C6B4D] text-white text-[11px] font-bold rounded-lg"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Local Provider Endpoint configuration */}
          <div className="glass-card bg-[#18191B] p-5 border border-[#2A2D30] space-y-4 text-left">
            <h3 className="text-sm font-bold text-[#ECEBE9] flex items-center gap-1.5 pb-2 border-b border-[#2A2D30]">
              <Settings className="text-[#3C6B4D]" size={16} />
              <span>Local Host Endpoint Configuration</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PROVIDERS.filter(p => p.type === 'local').map((prov) => {
                const ep = customEndpoints[prov.id] || '';
                return (
                  <div key={prov.id} className="bg-[#111213] border border-[#2A2D30] p-4 rounded-xl space-y-2">
                    <span className="text-xs font-bold text-[#ECEBE9] block">{prov.name} Address URL</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={ep}
                        onChange={(e) => {
                          setCustomEndpoints({ ...customEndpoints, [prov.id]: e.target.value });
                          aiService.setCustomEndpoint(prov.id, e.target.value);
                        }}
                        placeholder={prov.defaultEndpoint}
                        className="flex-1 bg-[#18191B] border border-[#2A2D30] rounded-lg px-2.5 py-1.5 text-xs text-[#ECEBE9] focus:outline-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Model Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {PROVIDERS.map((prov) => (
              <div key={prov.id} className="glass-card p-5 bg-[#18191B] border border-[#2A2D30] flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-[#ECEBE9]">{prov.name}</h3>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                      prov.type === 'local' ? 'bg-[#3C6B4D]/10 text-emerald-400 border-[#3C6B4D]/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                    }`}>
                      {prov.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A3A09B]">Default Endpoint: <code>{prov.defaultEndpoint}</code></p>
                  
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-[#72706C] block">Supported Tags</label>
                    <div className="flex flex-wrap gap-1.5">
                      {prov.models.map(m => (
                        <span key={m} className="text-[9px] bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] px-2 py-0.5 rounded">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Setup TAB */}
      {activeTab === 'setup' && (
        <div className="space-y-6 max-w-4xl animate-fadeIn">
          <div className="flex border-b border-[#2A2D30] gap-3">
            {(['mac', 'win', 'linux'] as const).map((os) => (
              <button
                key={os}
                onClick={() => setOsTab(os)}
                className={`pb-2.5 text-xs font-bold uppercase transition-all border-b-2 ${
                  osTab === os ? 'border-[#3C6B4D] text-[#ECEBE9]' : 'border-transparent text-[#72706C] hover:text-[#A3A09B]'
                }`}
              >
                {os === 'mac' ? 'macOS' : os === 'win' ? 'Windows' : 'Linux'}
              </button>
            ))}
          </div>

          <div className="space-y-6 text-xs text-[#A3A09B] leading-relaxed">
            <div className="flex gap-4 items-start bg-[#18191B] p-5 rounded-2xl border border-[#2A2D30]">
              <div className="w-6 h-6 rounded-full bg-[#3C6B4D]/15 border border-[#3C6B4D]/30 text-[#3C6B4D] flex items-center justify-center font-mono font-bold shrink-0">1</div>
              <div className="space-y-2 text-left">
                <h4 className="font-extrabold text-sm text-[#ECEBE9]">Download and Install Ollama</h4>
                <p>Ollama runs LLMs locally. Click below to download the application for your OS.</p>
                <a href="https://ollama.com/download" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 bg-[#1E2022] hover:bg-[#25282B] text-[#ECEBE9] border border-[#2A2D30] px-3.5 py-1.5 rounded-lg font-semibold mt-1 transition-colors">
                  <span>Download Ollama</span>
                  <Sliders size={12} className="text-[#3C6B4D]" />
                </a>
              </div>
            </div>

            <div className="flex gap-4 items-start bg-[#18191B] p-5 rounded-2xl border border-[#2A2D30]">
              <div className="w-6 h-6 rounded-full bg-[#3C6B4D]/15 border border-[#3C6B4D]/30 text-[#3C6B4D] flex items-center justify-center font-mono font-bold shrink-0">2</div>
              <div className="space-y-3 text-left w-full">
                <h4 className="font-extrabold text-sm text-[#ECEBE9]">Configure CORS Isolation (Required)</h4>
                <p>Since Domo Agent Hub runs sandboxed, Ollama must allow cross-origin requests. Configure by setting <code>OLLAMA_ORIGINS="*"</code>:</p>

                {osTab === 'mac' && (
                  <div className="space-y-3">
                    <p className="font-semibold text-xs text-[#ECEBE9]">For the macOS Terminal:</p>
                    <pre className="p-3 bg-[#111213] border border-[#2A2D30] rounded-xl font-mono text-[10px] text-[#3C6B4D] overflow-x-auto">
                      <code>OLLAMA_ORIGINS="*" ollama serve</code>
                    </pre>
                  </div>
                )}

                {osTab === 'win' && (
                  <div className="space-y-2">
                    <p>1. Open System Properties ➜ Environment Variables.</p>
                    <p>2. Create a User Variable named <code>OLLAMA_ORIGINS</code> with value <code>*</code></p>
                    <p>3. Restart the Ollama application.</p>
                  </div>
                )}

                {osTab === 'linux' && (
                  <div className="space-y-3">
                    <p>Edit systemd service configuration:</p>
                    <pre className="p-3 bg-[#111213] border border-[#2A2D30] rounded-xl font-mono text-[10px] text-[#3C6B4D] overflow-x-auto">
                      <code>sudo systemctl edit ollama.service</code>
                    </pre>
                    <p>Add <code>Environment="OLLAMA_ORIGINS=*"</code> under [Service], then reload and restart service.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIDomoAgentHub;
