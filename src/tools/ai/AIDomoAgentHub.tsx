import { useState, useEffect, useRef } from 'react';
import {
  Folder,
  FileCode,
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
  FileText
} from 'lucide-react';
import { aiService, PROVIDERS } from '../../utils/aiService';

// Extracted Sub-Components
import { AgentSkillsCreator } from './components/AgentSkillsCreator';
import type { SkillDef } from './components/AgentSkillsCreator';
import { AgentPermissionsManager } from './components/AgentPermissionsManager';
import { MultiIdeDashboard } from './components/MultiIdeDashboard';
import { McpConnectionManager } from './components/McpConnectionManager';

interface FileNode {
  name: string;
  path: string;
  kind: 'file' | 'directory';
  handle: any;
  children?: FileNode[];
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
  
  // Remove starting and ending markdown code block wrappers
  content = content.replace(/^```\w*\n/, '');
  content = content.replace(/\n```$/, '');
  
  // Strip off inner code fences if the model output them nested
  if (content.startsWith('```')) {
    const lines = content.split('\n');
    if (lines[0].startsWith('```')) {
      lines.shift();
    }
    if (lines[lines.length - 1] === '```') {
      lines.pop();
    }
    content = lines.join('\n');
  }
  
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
  cleaned = cleaned.replace(/^['"`\s]+|['"`\s]+$/g, '');
  cleaned = cleaned.replace(/\\/g, '/');
  // Strip any leading slashes or "./" to keep it relative within the workspace
  cleaned = cleaned.replace(/^(\.\/|\/)+/, '');
  if (cleaned.endsWith('.python')) cleaned = cleaned.slice(0, -7) + '.py';
  if (cleaned.endsWith('.javascript')) cleaned = cleaned.slice(0, -11) + '.js';
  if (cleaned.endsWith('.typescript')) cleaned = cleaned.slice(0, -11) + '.ts';
  if (cleaned.endsWith('.react')) cleaned = cleaned.slice(0, -6) + '.tsx';
  if (cleaned.endsWith('.css.css')) cleaned = cleaned.slice(0, -4);
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

  // MCP Client State
  const [mcpServerUrl, setMcpServerUrl] = useState<string>('http://localhost:3001/sse');
  const [mcpConnected, setMcpConnected] = useState<boolean>(false);
  const [mcpTools, setMcpTools] = useState<Array<{ name: string; description: string; inputSchema: any }>>([]);

  // Workspace Directory State
  const [dirHandle, setDirHandle] = useState<any>(null);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [activeFile, setActiveFile] = useState<{ path: string; handle: any; content: string } | null>(null);
  const [editorContent, setEditorContent] = useState<string>('');
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});

  // Options toggles
  const autosave = true;

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
      promptTemplate: 'You are the Domo Developer. Implement complete files based on structural specifications. Use the [WRITE_FILE: path] format. Place pure code inside the block without any markdown code block wrappers (like ```) or extra explanation comments/fillers.',
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

  // Dispatch calls directly to host-level MCP server if connected
  const callMcpTool = async (toolName: string, toolArgs: Record<string, any>): Promise<any> => {
    const msgUrl = mcpServerUrl.replace('/sse', '/message');
    const res = await fetch(msgUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: toolArgs
        },
        id: Math.floor(Math.random() * 1000)
      })
    });
    if (!res.ok) throw new Error(`MCP tool call failed: ${res.statusText}`);
    const data = await res.json();
    return data.result;
  };

  interface ToolCall {
    type: 'read_file' | 'write_file' | 'execute_command' | 'list_directory';
    target: string;
    content?: string;
  }

  const parseToolCalls = (text: string): ToolCall[] => {
    const list: ToolCall[] = [];
    
    // 1. Bracketed WRITE_FILE: [WRITE_FILE: path] ... [END_WRITE_FILE] (or next block tag)
    const writeBracketRegex = /\[WRITE_FILE:\s*([^\s\]]+)\]([\s\S]*?)(?:\[END_WRITE_FILE\]|(?=\[WRITE_FILE:)|(?=\[READ_FILE:)|(?=\[EXECUTE_COMMAND:)|$)/gi;
    let match;
    while ((match = writeBracketRegex.exec(text)) !== null) {
      list.push({
        type: 'write_file',
        target: getCorrectedFilePath(match[1]),
        content: cleanCodeContent(match[2])
      });
    }

    // 2. Plain WRITE_FILE (if no bracketed write was found)
    if (list.filter(c => c.type === 'write_file').length === 0) {
      const writePlainRegex = /(?:^|\n)(?:WRITE_FILE|\[WRITE_FILE\])[:\s]*([^\s\n\]]+)\]?[\s\n]*([\s\S]*?)(?=(?:\n(?:WRITE_FILE|\[WRITE_FILE\]|READ_FILE|EXECUTE_COMMAND))|$)/gi;
      while ((match = writePlainRegex.exec(text)) !== null) {
        list.push({
          type: 'write_file',
          target: getCorrectedFilePath(match[1]),
          content: cleanCodeContent(match[2])
        });
      }
    }

    // 3. READ_FILE
    const readRegex = /(?:\[READ_FILE:\s*([^\s\]]+)\]|(?:\bREAD_FILE\b[:\s]+)([^\s\n]+))/gi;
    while ((match = readRegex.exec(text)) !== null) {
      const path = getCorrectedFilePath(match[1] || match[2]);
      if (path) {
        list.push({ type: 'read_file', target: path });
      }
    }

    // 4. EXECUTE_COMMAND
    const execRegex = /(?:\[EXECUTE_COMMAND:\s*([^\]]+)\]|(?:\bEXECUTE_COMMAND\b[:\s]+)([^\n]+))/gi;
    while ((match = execRegex.exec(text)) !== null) {
      const cmd = (match[1] || match[2]).trim();
      if (cmd) {
        list.push({ type: 'execute_command', target: cmd });
      }
    }

    // 5. LIST_DIRECTORY
    const listDirRegex = /(?:\[LIST_DIRECTORY\]|\bLIST_DIRECTORY\b)/gi;
    if (listDirRegex.test(text)) {
      list.push({ type: 'list_directory', target: '' });
    }

    return list;
  };

  const executeAgentTool = async (
    type: 'read_file' | 'write_file' | 'execute_command' | 'list_directory',
    target: string,
    content = '',
    agentName: string,
    permissions: string[]
  ): Promise<string> => {
    if (type === 'read_file') {
      const canRead = globalPermissions.read_files && permissions.includes('read_files');
      if (!canRead) return `Error: Permission denied. Read permission not granted to agent ${agentName}.`;
      
      if (mcpConnected && mcpTools.some(t => t.name === 'read_file')) {
        try {
          const result = await callMcpTool('read_file', { path: target });
          return result?.content?.[0]?.text || `Error: File is empty or read failed.`;
        } catch (e: any) {
          return `Error reading file via MCP: ${e.message}`;
        }
      }
      return `Error: Read file tool requires MCP server to be active.`;
    }

    if (type === 'write_file') {
      const canWrite = globalPermissions.write_files && permissions.includes('write_files');
      if (!canWrite) return `Error: Permission denied. Write permission not granted to agent ${agentName}.`;

      if (mcpConnected && mcpTools.some(t => t.name === 'write_file')) {
        try {
          await callMcpTool('write_file', { path: target, content });
          addActivityLog('success', `[Agent Write] Wrote file successfully via MCP: "${target}"`);
          return `Success: Successfully wrote content to ${target}`;
        } catch (e: any) {
          return `Error writing file via MCP: ${e.message}`;
        }
      }
      if (dirHandle) {
        try {
          const newArtifact = { id: 'temp', name: target, content, agentName };
          await handleWriteArtifactToWorkspace(newArtifact, true);
          return `Success: Successfully wrote content to ${target} (via filesystem picker)`;
        } catch (e: any) {
          return `Error writing file via workspace picker: ${e.message}`;
        }
      }
      return `Error: No workspace connected. Please connect the MCP server or mount a local folder.`;
    }

    if (type === 'execute_command') {
      const canExec = globalPermissions.execute_commands && permissions.includes('execute_commands');
      if (!canExec) return `Error: Permission denied. Execute Command permission is disabled or not granted to agent ${agentName}.`;

      if (mcpConnected && mcpTools.some(t => t.name === 'execute_command')) {
        try {
          addActivityLog('analyze', `[Agent Command Exec] Running: "${target}"`);
          const result = await callMcpTool('execute_command', { command: target });
          if (result?.isError) {
            return `Command execution failed:\n${result?.content?.[0]?.text || ''}`;
          }
          return `Command executed successfully. Output:\n${result?.content?.[0]?.text || ''}`;
        } catch (e: any) {
          return `Error executing command via MCP: ${e.message}`;
        }
      }
      return `Error: Command execution requires MCP server to be active.`;
    }

    if (type === 'list_directory') {
      const canRead = globalPermissions.read_files && permissions.includes('read_files');
      if (!canRead) return `Error: Permission denied. Read/List directory permission not granted to agent ${agentName}.`;

      if (mcpConnected && mcpTools.some(t => t.name === 'list_directory')) {
        try {
          const result = await callMcpTool('list_directory', {});
          if (result?.content?.[0]?.text) {
            const list = JSON.parse(result.content[0].text);
            const formatNode = (nodes: FileNode[], depth = 0): string => {
              let out = '';
              for (const n of nodes) {
                out += `${'  '.repeat(depth)}- ${n.name} (${n.kind})\n`;
                if (n.children) out += formatNode(n.children, depth + 1);
              }
              return out;
            };
            return `Workspace files list:\n${formatNode(list)}`;
          }
        } catch (e: any) {
          return `Error listing workspace via MCP: ${e.message}`;
        }
      }
      return `Error: List directory requires MCP server to be active.`;
    }

    return `Error: Unknown tool type: ${type}`;
  };

  // Multi-Agent pipeline executor (Multi-IDE layout)
  const handleOrchestrate = async () => {
    if (!orchestratorPrompt.trim() || isOrchestrating) return;
    setIsOrchestrating(true);
    setBlackboardLogs([]);
    setArtifacts([]);
    setActiveArtifact(null);

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

    logToBlackboard('System', `🚀 Starting Agentic Orchestrator (${orchestrationMode.toUpperCase()} mode)`, 'system');

    try {
      if (orchestrationMode === 'sequential' || orchestrationMode === 'hybrid') {
        let currentContext = orchestratorPrompt;
        
        for (let i = 0; i < agents.length; i++) {
          const agent = agents[i];
          
          setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, isExecuting: true, ideContent: '// Booting agent workspace and starting execution loop...' } : a));
          
          const agentModel = agent.model || selectedModel || (downloadedModels.length > 0 ? downloadedModels[0] : 'qwen2.5:0.5b');
          logToBlackboard('System', `⏱️ Running agentic workspace loop on ${agent.name} (${agent.role}) using ${agentModel}...`, 'system');
          
          const systemPrompt = `${agent.promptTemplate}

You have active access to the local workspace via these tool call tags:
- To read a file: [READ_FILE: relative/path/to/file]
- To write/create/update a file: [WRITE_FILE: relative/path/to/file]\n\`\`\`\ncontent\n\`\`\`
- To list directory contents: [LIST_DIRECTORY]
- To run a terminal command (compile, test, run scripts): [EXECUTE_COMMAND: command]

Examples of how to use tools:
1. To write a file:
[WRITE_FILE: src/index.html]
<!DOCTYPE html>
<html>
  <body>Hello</body>
</html>
[END_WRITE_FILE]

2. To run a command:
[EXECUTE_COMMAND: npm run build]

You can invoke multiple tools in your output. The system will execute them for you and reply with the outputs. Proceed iteratively (e.g. read files, make edits, run tests, fix errors) until you are finished.
When you are fully finished with your task (or if no tool calls are needed), output a final summary of your changes and do NOT make any further tool calls.`;

          let initialUserPrompt = `Task Goal: ${orchestratorPrompt}\n\n`;
          if (agent.id === 'agent-2') {
            initialUserPrompt += `You are the Domo Developer. The Planner has designed the specifications and file list. You MUST now implement and write these files in the local workspace. Please create or update each file using the [WRITE_FILE: path] tool call format. Do NOT just output a summary of your actions; you must write the actual files.\n\nPlanner Specifications:\n"""\n${currentContext}\n"""`;
          } else if (agent.id === 'agent-3') {
            initialUserPrompt += `You are the Domo Auditor. Review the files generated by the Developer for security and compilation correctness. Run compiler commands, test commands or read files if needed. If fixes are required, write or update files using [WRITE_FILE: path].\n\nDeveloper Output / Code Context:\n"""\n${currentContext}\n"""`;
          } else {
            initialUserPrompt += `Context / Previous Agent Output:\n"""\n${currentContext}\n"""`;
          }

          let agentHistory = [initialUserPrompt];

          let loopCount = 0;
          let agentFinished = false;
          let lastResponseText = '';

          while (!agentFinished && loopCount < 5) {
            loopCount++;
            const runStartTime = Date.now();
            const historyPrompt = agentHistory.join('\n\n');
            
            const responseText = await aiService.generateText(historyPrompt, 1000, () => {}, agentModel, { systemPrompt });
            const runEndTime = Date.now();
            lastResponseText = responseText;

            const stats = aiService.estimateCost(historyPrompt, responseText, agentModel);
            const duration = runEndTime - runStartTime;

            // Animate/show on IDE
            animateAgentIDE(agent.id, responseText, duration, stats.tokens, stats.cost);
            logToBlackboard(agent.name, responseText, 'agent', agent.id);

            // Parse tool calls
            const toolCalls = parseToolCalls(responseText);
            if (toolCalls.length === 0) {
              agentFinished = true;
              break;
            }

            let toolOutputs = [];
            for (const call of toolCalls) {
              const toolResult = await executeAgentTool(call.type, call.target, call.content || '', agent.name, agent.permissions);
              toolOutputs.push(`[TOOL RESULT: ${call.type.toUpperCase()} ${call.target || ''}]\n${toolResult}`);
            }

            const combinedToolOutput = toolOutputs.join('\n\n');
            agentHistory.push(`Agent Output:\n${responseText}`);
            agentHistory.push(`System Tool Output:\n${combinedToolOutput}\n\nPlease proceed based on the above tool results.`);
            
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }

          currentContext = lastResponseText;
          
          // Refresh tree & extract final artifacts list
          await extractOrchestratedArtifacts(currentContext, agent.name);
          
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      } else {
        // Parallel mode (simultaneous single-step tool run)
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
          
          await extractOrchestratedArtifacts(responseText, agent.name);
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

  const extractOrchestratedArtifacts = async (text: string, agentName: string) => {
    // Robust extraction supporting standard bracketed, non-bracketed, and codeblock-prefixed patterns
    const bracketRegex = /\[WRITE_FILE:\s*([^\s\]]+)\]([\s\S]*?)(?:\[END_WRITE_FILE\]|(?=\[WRITE_FILE:)|$)/gi;
    const plainRegex = /(?:^|\n)(?:WRITE_FILE|\[WRITE_FILE\])[:\s]*([^\s\n\]]+)\]?[\s\n]*([\s\S]*?)(?=(?:\n(?:WRITE_FILE|\[WRITE_FILE\]))|$)/gi;

    let match;
    const foundFiles = new Map<string, string>();

    // 1. Try bracketed format first
    while ((match = bracketRegex.exec(text)) !== null) {
      const fileName = getCorrectedFilePath(match[1].trim());
      const content = cleanCodeContent(match[2]);
      if (fileName && content.trim()) {
        foundFiles.set(fileName, content);
      }
    }

    // 2. If nothing found, try plain text format
    if (foundFiles.size === 0) {
      plainRegex.lastIndex = 0;
      while ((match = plainRegex.exec(text)) !== null) {
        const fileName = getCorrectedFilePath(match[1].trim());
        const content = cleanCodeContent(match[2]);
        if (fileName && content.trim()) {
          foundFiles.set(fileName, content);
        }
      }
    }

    for (const [fileName, content] of foundFiles.entries()) {
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

      if (autosave) {
        if (mcpConnected && mcpTools.some(t => t.name === 'write_file')) {
          // Direct local write via MCP server
          try {
            await callMcpTool('write_file', { path: fileName, content });
            addActivityLog('success', `[MCP Write] Wrote file successfully to host: "${fileName}"`);
          } catch (e: any) {
            addActivityLog('error', `[MCP Write Failed] falling back to workspace picker...`);
            if (dirHandle) await handleWriteArtifactToWorkspace(newArtifact, true);
          }
        } else if (dirHandle) {
          await handleWriteArtifactToWorkspace(newArtifact, true);
        }
      }
    }

    if (foundFiles.size > 0) {
      // Refresh tree to display the new files immediately
      await refreshFileTree();
    }
  };

  const handleWriteArtifactToWorkspace = async (artifact: { id: string; name: string; content: string; agentName: string } | null, silent = false) => {
    if (!globalPermissions.write_files) {
      setErrorMsg('Write permissions are globally locked.');
      return;
    }
    if (!artifact) return;

    // Use MCP write if connected
    if (mcpConnected && mcpTools.some(t => t.name === 'write_file')) {
      try {
        await callMcpTool('write_file', { path: artifact.name, content: artifact.content });
        addActivityLog('success', `[MCP Write] Wrote file to host disk: "${artifact.name}"`);
        if (!silent) alert(`✅ Successfully wrote "${artifact.name}" to host!`);
        return;
      } catch (err: any) {
        console.warn('MCP write failed, trying local handles...', err);
      }
    }

    if (!dirHandle) {
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
        if (mcpConnected && mcpTools.some(t => t.name === 'write_file')) {
          await callMcpTool('write_file', { path, content });
          setActiveFile((prev) => prev && prev.path === path ? { ...prev, content } : prev);
          addActivityLog('write', `Autosaved file (MCP): ${path}`);
          return;
        }
        if (fileHandle) {
          const writable = await fileHandle.createWritable();
          await writable.write(content);
          await writable.close();
          setActiveFile((prev) => prev && prev.path === path ? { ...prev, content } : prev);
          addActivityLog('write', `Autosaved file: ${path}`);
        }
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

  useEffect(() => {
    let eventSource: EventSource | null = null;
    const connectMcp = () => {
      try {
        eventSource = new EventSource(mcpServerUrl);
        eventSource.onopen = async () => {
          setMcpConnected(true);
          try {
            const msgUrl = mcpServerUrl.replace('/sse', '/message');
            const res = await fetch(msgUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'tools/list',
                id: 1
              })
            });
            if (res.ok) {
              const data = await res.json();
              const toolsList = data.result?.tools || [];
              setMcpTools(toolsList);
            }
          } catch (err) {
            console.error('Error fetching initial MCP tools:', err);
          }
        };

        eventSource.onerror = () => {
          setMcpConnected(false);
          if (eventSource) eventSource.close();
        };
      } catch (err) {
        console.error('Error establishing initial MCP SSE link:', err);
      }
    };

    connectMcp();
    return () => {
      if (eventSource) eventSource.close();
    };
  }, [mcpServerUrl]);

  useEffect(() => {
    if (mcpConnected) {
      refreshFileTree();
      setChatLog((prev) => [
        ...prev,
        { role: 'system', text: `🔌 Connected to local Domo MCP Server. Offline workspace auto-mounted.` }
      ]);
    }
  }, [mcpConnected, mcpTools]);

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
    if (mcpConnected && mcpTools.some(t => t.name === 'list_directory')) {
      try {
        const result = await callMcpTool('list_directory', {});
        if (result && result.content?.[0]?.text) {
          const tree = JSON.parse(result.content[0].text);
          setFileTree(tree);
          return;
        }
      } catch (err) {
        console.warn('Failed listing directory via MCP:', err);
      }
    }
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
    if (!isCurrentlyOpen && (!node.children || node.children.length === 0) && node.handle) {
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
      if (mcpConnected && mcpTools.some(t => t.name === 'read_file')) {
        const result = await callMcpTool('read_file', { path: node.path });
        if (result && result.content?.[0]?.text) {
          const content = result.content[0].text;
          setActiveFile({ path: node.path, handle: node.handle || null, content });
          setEditorContent(content);
          return;
        }
      }
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
      if (mcpConnected && mcpTools.some(t => t.name === 'write_file')) {
        await callMcpTool('write_file', { path: activeFile.path, content: editorContent });
        setActiveFile((prev) => prev ? { ...prev, content: editorContent } : null);
        setChatLog((prev) => [
          ...prev,
          { role: 'system', text: `💾 Saved changes to: ${activeFile.path} (via MCP)` }
        ]);
        return;
      }
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
    if (!newFileName.trim()) return;
    try {
      const filePath = getCorrectedFilePath(newFileName);
      if (mcpConnected && mcpTools.some(t => t.name === 'write_file')) {
        await callMcpTool('write_file', { path: filePath, content: '' });
        setNewFileName('');
        setShowNewFileHUD(false);
        await refreshFileTree();
        setActiveFile({ path: filePath, handle: null, content: '' });
        setEditorContent('');
        return;
      }
      if (!dirHandle) {
        setErrorMsg('Workspace directory not mounted.');
        return;
      }
      const parts = filePath.split('/');
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
      setActiveFile({ path: filePath, handle: fileHandle, content: '' });
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
    const writeRegex = /\[WRITE_FILE:\s*([^\s\]]+)\]([\s\S]*?)\[END_WRITE_FILE\]/g;
    let match;
    while ((match = writeRegex.exec(text)) !== null) {
      const filePath = match[1].trim();
      const codeContent = match[2];
      try {
        if (mcpConnected && mcpTools.some(t => t.name === 'write_file')) {
          await callMcpTool('write_file', { path: filePath, content: codeContent });
          addActivityLog('success', `[MCP Write] Wrote file successfully: "${filePath}"`);
        } else if (dirHandle) {
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
        }
      } catch (e: any) {
        addActivityLog('error', `Failed writing file "${filePath}"`);
      }
    }
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
             tab === 'models' ? 'MCP & Catalog' : 'Setup Guide'}
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
                {(dirHandle || (mcpConnected && fileTree.length > 0)) ? renderTreeNode(fileTree) : (
                  <div className="text-center py-12 space-y-4">
                    <Folder size={32} className="mx-auto text-[#72706C]" />
                    <button onClick={handleMountDirectory} className="btn-primary text-xs py-1.5 w-full">Mount Folder</button>
                  </div>
                )}
              </div>
            </div>
            {(dirHandle || mcpConnected) && (
              <button onClick={handleMountDirectory} className="btn-secondary text-[11px] py-1.5 w-full flex items-center justify-center gap-1 mt-4">
                <Folder size={12} />
                <span>Switch Directory</span>
              </button>
            )}
          </div>

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

      {/* Orchestrator Tab (Subcomponent) */}
      {activeTab === 'orchestrator' && (
        <MultiIdeDashboard
          agents={agents}
          handleAddAgent={handleAddAgent}
          handleRemoveAgent={handleRemoveAgent}
          handleUpdateAgent={handleUpdateAgent}
          orchestrationMode={orchestrationMode}
          setOrchestrationMode={setOrchestrationMode}
          downloadedModels={downloadedModels}
          orchestratorPrompt={orchestratorPrompt}
          setOrchestratorPrompt={setOrchestratorPrompt}
          isOrchestrating={isOrchestrating}
          handleOrchestrate={handleOrchestrate}
          blackboardLogs={blackboardLogs}
          artifacts={artifacts}
          activeArtifact={activeArtifact}
          setActiveArtifact={setActiveArtifact}
          dirHandle={dirHandle}
          mcpConnected={mcpConnected}
          handleWriteArtifactToWorkspace={handleWriteArtifactToWorkspace}
          highlightCode={highlightCode}
          handleMountDirectory={handleMountDirectory}
        />
      )}

      {/* Skills Tab (Subcomponent) */}
      {activeTab === 'skills' && (
        <AgentSkillsCreator
          skillForm={skillForm}
          setSkillForm={setSkillForm}
          premadeSkills={PREMADE_SKILLS}
        />
      )}

      {/* Permissions Tab (Subcomponent) */}
      {activeTab === 'permissions' && (
        <AgentPermissionsManager
          globalPermissions={globalPermissions}
          setGlobalPermissions={setGlobalPermissions}
        />
      )}

      {/* MCP & Catalog Tab */}
      {activeTab === 'models' && (
        <div className="space-y-6 animate-fadeIn">
          {/* MCP Integration connection manager */}
          <McpConnectionManager
            mcpServerUrl={mcpServerUrl}
            setMcpServerUrl={setMcpServerUrl}
            mcpConnected={mcpConnected}
            setMcpConnected={setMcpConnected}
            mcpTools={mcpTools}
            setMcpTools={setMcpTools}
          />

          {/* API Key management */}
          <div className="glass-card bg-[#18191B] p-5 border border-[#2A2D30] space-y-4 text-left">
            <h3 className="text-sm font-bold text-[#ECEBE9] flex items-center gap-1.5 pb-2 border-b border-[#2A2D30]">
              <Sliders className="text-[#3C6B4D]" size={16} />
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
                        {isVisible ? <Sliders size={12} /> : <Sliders size={12} />}
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
              <Sliders className="text-[#3C6B4D]" size={16} />
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
