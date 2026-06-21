import { useState, useEffect } from 'react';
import {
  Folder,
  FileCode,
  Download,
  Cpu,
  CheckCircle,
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
import { aiService } from '../../utils/aiService';

interface FileNode {
  name: string;
  path: string;
  kind: 'file' | 'directory';
  handle: any;
  children?: FileNode[];
}

interface ModelMeta {
  id: string;
  name: string;
  size: string;
  ramRequired: string;
  description: string;
  tag: string;
}

const POPULAR_MODELS: ModelMeta[] = [
  {
    id: 'qwen-tiny',
    name: 'Qwen 2.5 (0.5B)',
    tag: 'qwen2.5:0.5b',
    size: '397 MB',
    ramRequired: '4 GB+',
    description: 'Ultra-lightweight and extremely fast model. Ideal for low-spec computers or testing.'
  },
  {
    id: 'llama-1b',
    name: 'Llama 3.2 (1B)',
    tag: 'llama3.2:1b',
    size: '1.3 GB',
    ramRequired: '8 GB+',
    description: 'Meta\'s ultra-compact model. Highly responsive, balanced reasoning, low resource footprint.'
  },
  {
    id: 'llama-3b',
    name: 'Llama 3.2 (3B)',
    tag: 'llama3.2:3b',
    size: '2.0 GB',
    ramRequired: '8 GB - 12 GB',
    description: 'Excellent multi-lingual understanding, creative writing, and summarization capabilities.'
  },
  {
    id: 'gemma-2b',
    name: 'Gemma 2 (2B)',
    tag: 'gemma2:2b',
    size: '1.6 GB',
    ramRequired: '8 GB+',
    description: 'Google\'s highly capable lightweight model. Extremely strong general knowledge.'
  },
  {
    id: 'phi3-latest',
    name: 'Phi-3 (3.8B)',
    tag: 'phi3:latest',
    size: '2.2 GB',
    ramRequired: '12 GB+',
    description: 'Microsoft\'s logic-heavy compact model. Exceptional coding syntax and math reasoning.'
  },
  {
    id: 'llama3-latest',
    name: 'Llama 3 (8B)',
    tag: 'llama3:latest',
    size: '4.7 GB',
    ramRequired: '16 GB+',
    description: 'The standard benchmark for open-source AI. Advanced logical reasoning, complex workflows.'
  }
];

export const AIDomoAgentHub = () => {
  const [activeTab, setActiveTab] = useState<'ide' | 'models' | 'setup'>('ide');
  const [osTab, setOsTab] = useState<'mac' | 'win' | 'linux'>('mac');
  
  const [ollamaActive, setOllamaActive] = useState(false);
  const [downloadedModels, setDownloadedModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');

  // Workspace Directory State
  const [dirHandle, setDirHandle] = useState<any>(null);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [activeFile, setActiveFile] = useState<{ path: string; handle: any; content: string } | null>(null);
  const [editorContent, setEditorContent] = useState<string>('');
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});

  // Chat State
  const [prompt, setPrompt] = useState<string>('');
  const [chatLog, setChatLog] = useState<{ role: 'user' | 'agent' | 'system'; text: string }[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStatus, setThinkingStatus] = useState('');
  
  // Model Puller State
  const [pullingModel, setPullingModel] = useState<string | null>(null);
  const [pullStatus, setPullStatus] = useState<string>('');
  const [pullProgress, setPullProgress] = useState<number>(0);
  const [customModel, setCustomModel] = useState<string>('');
  
  const [newFileName, setNewFileName] = useState<string>('');
  const [showNewFileHUD, setShowNewFileHUD] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [agentActivity, setAgentActivity] = useState<{ id: string; type: 'read' | 'write' | 'create' | 'analyze' | 'success' | 'error'; text: string; timestamp: string }[]>([]);

  const addActivityLog = (type: 'read' | 'write' | 'create' | 'analyze' | 'success' | 'error', text: string) => {
    const timestamp = new Date().toTimeString().split(' ')[0];
    const newLog = {
      id: Math.random().toString(36).substring(7),
      type,
      text,
      timestamp
    };
    setAgentActivity((prev) => [...prev, newLog]);
  };

  const simulateLiveCoding = (fullContent: string) => {
    let index = 0;
    setEditorContent('');
    const cleanContent = fullContent.replace(/^```\w*\n/, '').replace(/\n```$/, '');
    const stepSize = Math.max(1, Math.floor(cleanContent.length / 40));
    
    const interval = setInterval(() => {
      index += stepSize;
      if (index >= cleanContent.length) {
        setEditorContent(cleanContent);
        clearInterval(interval);
      } else {
        setEditorContent(cleanContent.substring(0, index) + '█');
      }
    }, 45);
  };

  const checkStatus = async () => {
    try {
      const res = await aiService.checkOllama();
      setOllamaActive(res.status);
      setDownloadedModels(res.models);
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

  // Mount folder using File System Access API
  const handleMountDirectory = async () => {
    setErrorMsg(null);
    try {
      const handle = await (window as any).showDirectoryPicker({
        mode: 'readwrite'
      });
      // Explicitly request write permission on the handle inside this click handler to prevent user-activation requirements later
      if (handle.requestPermission) {
        const perm = await handle.requestPermission({ mode: 'readwrite' });
        if (perm !== 'granted') {
          setErrorMsg('Write permissions are required to create and modify files inside this folder.');
          return;
        }
      }
      setDirHandle(handle);
      await refreshFileTree(handle);
      
      setChatLog((prev) => [
        ...prev,
        { role: 'system', text: `📁 Connected to workspace folder: "${handle.name}". Read/Write permissions granted! You can now instruct Domo Agent to read/write files.` }
      ]);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setErrorMsg('File System Access API is not supported or write permission was denied.');
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
      // Lazy load children
      const children = await readDirectory(node.handle, node.path);
      // Inject children
      setFileTree((prevTree) => updateNodeChildren(prevTree, node.path, children));
    }
  };

  const updateNodeChildren = (tree: FileNode[], path: string, children: FileNode[]): FileNode[] => {
    return tree.map((node) => {
      if (node.path === path) {
        return { ...node, children };
      }
      if (node.children) {
        return { ...node, children: updateNodeChildren(node.children, path, children) };
      }
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
      setErrorMsg('Failed to open file. Check local permissions.');
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
      setErrorMsg('Failed to write changes to local disk.');
    }
  };

  const handleCreateFile = async () => {
    if (!dirHandle || !newFileName.trim()) return;
    setErrorMsg(null);
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
      
      // Auto-open created file
      const path = newFileName;
      setActiveFile({ path, handle: fileHandle, content: '' });
      setEditorContent('');
    } catch (err) {
      setErrorMsg('Failed to create file inside workspace directory.');
    }
  };

  // Pull local models
  const handlePullModel = async (modelTag: string) => {
    if (pullingModel) return;
    setErrorMsg(null);
    setPullingModel(modelTag);
    setPullStatus('Starting download...');
    setPullProgress(0);

    try {
      await aiService.pullOllamaModel(modelTag, (status, progress) => {
        setPullStatus(status);
        setPullProgress(progress);
      });
      setPullStatus('Download complete!');
      setPullProgress(100);
      setTimeout(() => {
        setPullingModel(null);
        checkStatus();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to pull model.');
      setPullingModel(null);
    }
  };

  // Domo AI Agent Core Logic
  const handleAgentPromptSubmit = async () => {
    if (!prompt.trim() || isThinking) return;
    setErrorMsg(null);
    const userMessage = prompt;
    setPrompt('');
    
    setChatLog((prev) => [...prev, { role: 'user', text: userMessage }]);
    setIsThinking(true);
    setThinkingStatus('Domo is analyzing workspace...');
    
    setAgentActivity([]); // Clear logs for new command
    addActivityLog('analyze', `Initializing prompt query: "${userMessage.substring(0, 45)}${userMessage.length > 45 ? '...' : ''}"`);
    addActivityLog('read', `Scanning workspace node tree...`);

    // Collect workspace file structures
    const fileStructureList = getFileTreeNames(fileTree);
    const workspaceCtx = fileStructureList.length > 0
      ? `Workspace folders mounted. Listed files:\n- ${fileStructureList.join('\n- ')}`
      : 'No local folders mounted yet.';

    if (fileStructureList.length > 0) {
      addActivityLog('read', `Read workspace directory context. Loaded details for ${fileStructureList.length} files.`);
    } else {
      addActivityLog('read', `No workspace folder mounted. Running in mock sandbox environment.`);
    }

    const systemPrompt = `You are DomoDomo, a brilliant, friendly coding agent.
You speak with enthusiasm, using friendly emojis like 🚀, 💻, 🧠, 🪄, and 🛠️.
You can read and modify files in the user's workspace.
Current Workspace Details:
${workspaceCtx}

When you want to write or edit a file, output the file contents wrapped exactly in this XML block structure:
[WRITE_FILE: path/to/file.js]
file_content
[END_WRITE_FILE]

Always write complete code files. DomoDomo handles the parsing and saves it locally.`;

    try {
      addActivityLog('analyze', `Sending query stream to local model: "${selectedModel || 'default'}"...`);
      const responseText = await aiService.generateText(userMessage, 800, (status) => {
        setThinkingStatus(status);
      }, selectedModel || undefined, { systemPrompt, temperature: 0.5 });

      addActivityLog('success', `Model response received. Processing instruction commands...`);
      setChatLog((prev) => [...prev, { role: 'agent', text: responseText }]);
      
      // Parse responseText for tool calls
      await parseAgentToolCalls(responseText);

    } catch (err: any) {
      addActivityLog('error', `Ollama generation failed: ${err.message || err}`);
      setErrorMsg(err.message || 'Ollama query failed.');
    } finally {
      setIsThinking(false);
    }
  };

  const getFileTreeNames = (tree: FileNode[], prefix = ''): string[] => {
    let files: string[] = [];
    tree.forEach((node) => {
      files.push(prefix ? `${prefix}/${node.name}` : node.name);
      if (node.children) {
        files = files.concat(getFileTreeNames(node.children, node.path));
      }
    });
    return files;
  };

  const parseAgentToolCalls = async (text: string) => {
    if (!dirHandle) {
      addActivityLog('error', `Cannot modify workspace files. No workspace folder mounted.`);
      return;
    }
    const writeRegex = /\[WRITE_FILE:\s*([^\s\]]+)\]([\s\S]*?)\[END_WRITE_FILE\]/g;
    let match;
    let foundCalls = false;
    
    while ((match = writeRegex.exec(text)) !== null) {
      foundCalls = true;
      const filePath = match[1].trim();
      const codeContent = match[2]; // keep exact formatting
      
      addActivityLog('create', `Parsing target write instruction for: "${filePath}"`);
      addActivityLog('write', `Writing bytes stream to workspace storage path: "${filePath}"...`);
      
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

        addActivityLog('success', `Completed write operation for: "${filePath}" (${codeContent.length} chars)`);

        setChatLog((prev) => [
          ...prev,
          { role: 'system', text: `🛠️ DomoDomo automatically created/modified file: "${filePath}"` }
        ]);

        await refreshFileTree();
        
        // Auto-open created file and simulate live typing
        setActiveFile({ path: filePath, handle: fileHandle, content: codeContent });
        simulateLiveCoding(codeContent);

      } catch (e: any) {
        addActivityLog('error', `Failed writing file "${filePath}": ${e.message || e}`);
        console.warn('Agent failed to write file:', filePath, e);
      }
    }

    if (!foundCalls) {
      addActivityLog('success', `Completed query analysis. No filesystem write operations requested.`);
    }
  };

  // Helper to render tree nodes recursively
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
      {/* Title HUD */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#18191B] to-[#1E2022] border border-[#2A2D30] p-6 shadow-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#3C6B4D]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-[#ECEBE9] flex items-center gap-2">
              <Terminal className="text-[#3C6B4D]" size={22} />
              <span>Domo Agent Hub & IDE</span>
            </h1>
            <p className="text-xs text-[#A3A09B]">
              A local-first visual IDE connected to your local directory. Mount project folders, edit code files, and instruct the Domo Agent to write code automatically.
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
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))
              ) : (
                <option>No Models Configured</option>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-[#2A2D30] gap-4">
        <button
          onClick={() => setActiveTab('ide')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'ide'
              ? 'border-[#3C6B4D] text-[#ECEBE9]'
              : 'border-transparent text-[#72706C] hover:text-[#A3A09B]'
          }`}
        >
          Domo Agent IDE Workspace
        </button>
        <button
          onClick={() => setActiveTab('models')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'models'
              ? 'border-[#3C6B4D] text-[#ECEBE9]'
              : 'border-transparent text-[#72706C] hover:text-[#A3A09B]'
          }`}
        >
          Domo Model Catalog
        </button>
        <button
          onClick={() => setActiveTab('setup')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'setup'
              ? 'border-[#3C6B4D] text-[#ECEBE9]'
              : 'border-transparent text-[#72706C] hover:text-[#A3A09B]'
          }`}
        >
          Ollama Setup Guide
        </button>
      </div>

      {/* Error Message banner */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-500 text-xs flex items-start gap-2.5">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Error:</span> {errorMsg}
          </div>
        </div>
      )}

      {activeTab === 'ide' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* File Tree Explorer (Col 3) */}
          <div className="lg:col-span-3 glass-card bg-[#18191B] p-4 flex flex-col justify-between min-h-[500px]">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-[#2A2D30]">
                <span className="text-xs font-bold uppercase text-[#72706C] tracking-wider">File Explorer</span>
                {dirHandle && (
                  <button
                    onClick={() => setShowNewFileHUD(!showNewFileHUD)}
                    className="p-1 rounded bg-[#111213] border border-[#2A2D30] text-[#A3A09B] hover:text-[#ECEBE9]"
                    title="Create new file"
                  >
                    <Plus size={12} />
                  </button>
                )}
              </div>

              {showNewFileHUD && (
                <div className="p-2.5 rounded-lg bg-[#111213] border border-[#2A2D30] space-y-2 animate-fadeIn">
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="e.g. index.html"
                    className="w-full px-2 py-1 text-xs rounded bg-[#18191B] border border-[#2A2D30] text-[#ECEBE9] focus:outline-none"
                  />
                  <div className="flex gap-2 justify-end text-[10px]">
                    <button
                      onClick={() => setShowNewFileHUD(false)}
                      className="px-2 py-1 rounded bg-[#1E2022] text-[#A3A09B]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateFile}
                      className="px-2 py-1 rounded bg-[#3C6B4D] text-[#ECEBE9]"
                    >
                      Create
                    </button>
                  </div>
                </div>
              )}

              {/* File Nodes */}
              <div className="space-y-1.5 overflow-y-auto max-h-[420px]">
                {dirHandle ? (
                  fileTree.length > 0 ? (
                    renderTreeNode(fileTree)
                  ) : (
                    <span className="text-xs text-[#72706C] italic block text-center py-6">Empty directory</span>
                  )
                ) : (
                  <div className="text-center py-12 space-y-4">
                    <Folder size={32} className="mx-auto text-[#72706C]" />
                    <button
                      onClick={handleMountDirectory}
                      className="btn-primary text-xs py-1.5 w-full"
                    >
                      <span>Mount Folder</span>
                    </button>
                    <span className="text-[10px] text-[#72706C] block leading-normal">
                      Connect a folder to read, edit, and write files locally.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {dirHandle && (
              <button
                onClick={handleMountDirectory}
                className="btn-secondary text-[11px] py-1.5 w-full flex items-center justify-center gap-1 mt-4"
              >
                <Folder size={12} />
                <span>Switch Folder</span>
              </button>
            )}
          </div>

          {/* Integrated Editor (Col 5) */}
          <div className="lg:col-span-5 glass-card bg-[#18191B] p-4 flex flex-col justify-between min-h-[500px]">
            <div className="space-y-4 flex-1 flex flex-col">
              <div className="flex justify-between items-center pb-2 border-b border-[#2A2D30]">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-[#3C6B4D]" />
                  <span className="text-xs font-bold text-[#ECEBE9] truncate max-w-xs">
                    {activeFile ? activeFile.path : 'No file open'}
                  </span>
                </div>
                {activeFile && (
                  <button
                    onClick={handleSaveFile}
                    className="p-1 rounded bg-[#111213] border border-[#2A2D30] text-[#A3A09B] hover:text-emerald-500 flex items-center gap-1 text-[10px] font-semibold"
                    title="Save changes"
                  >
                    <Save size={12} />
                    <span>Save</span>
                  </button>
                )}
              </div>

              {activeFile ? (
                <textarea
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  className="w-full flex-1 h-96 min-h-[350px] bg-[#111213] border border-[#2A2D30] rounded-xl p-4 font-mono text-[11px] text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D]/50 leading-relaxed resize-none"
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
                  <FileCode size={36} className="text-[#72706C] stroke-[1.5]" />
                  <h4 className="font-bold text-[#ECEBE9] text-xs">Editor Sandbox</h4>
                  <p className="text-[10px] text-[#72706C] max-w-xs leading-normal">
                    Select any file in the workspace directory to open it in this code panel.
                  </p>
                </div>
              )}
            </div>

            {/* Terminal Console */}
            <div className="mt-4 border-t border-[#2A2D30]/60 pt-4 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#72706C]">
                <div className="flex items-center gap-1.5">
                  <Terminal size={12} className="text-[#3C6B4D]" />
                  <span className="font-bold uppercase tracking-wider">Domo Agent Terminal</span>
                </div>
                <span className="text-emerald-500/80 animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Live Tracking</span>
                </span>
              </div>
              <div className="bg-[#0A0B0C] border border-[#2A2D30]/75 rounded-xl p-3 h-28 overflow-y-auto font-mono text-[10px] text-[#A3A09B] space-y-1.5 text-left select-none">
                {agentActivity.length === 0 ? (
                  <span className="text-[#72706C] italic">No active operations. Ask Domo Agent to write/read code to start logging live events.</span>
                ) : (
                  agentActivity.map((log) => (
                    <div key={log.id} className="flex gap-2 items-start leading-relaxed">
                      <span className="text-[#72706C] shrink-0">[{log.timestamp}]</span>
                      <span className={`font-bold shrink-0 ${
                        log.type === 'read' ? 'text-blue-400' :
                        log.type === 'write' ? 'text-amber-400' :
                        log.type === 'create' ? 'text-purple-400' :
                        log.type === 'analyze' ? 'text-teal-400' :
                        log.type === 'success' ? 'text-emerald-400' :
                        'text-rose-400'
                      }`}>
                        {log.type.toUpperCase()}
                      </span>
                      <span className="text-[#ECEBE9]">{log.text}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Domo Agent Chat Panel (Col 4) */}
          <div className="lg:col-span-4 glass-card bg-[#18191B] p-4 flex flex-col justify-between min-h-[500px]">
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="flex items-center gap-2 pb-2 border-b border-[#2A2D30]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3C6B4D] animate-ping" />
                <span className="text-xs font-bold uppercase text-[#72706C] tracking-wider">Domo Agent Chat</span>
              </div>

              {/* Chat log */}
              <div className="flex-1 overflow-y-auto max-h-[330px] my-3 space-y-3 pr-1 text-xs">
                {chatLog.length === 0 ? (
                  <div className="text-center py-12 space-y-2 text-[#72706C]">
                    <Sparkles size={28} className="mx-auto stroke-[1.5]" />
                    <h5 className="font-bold text-[#ECEBE9]">Ask DomoDomo</h5>
                    <p className="text-[10px] leading-relaxed max-w-xs mx-auto">
                      "Create a CSS file with styles", "Create a index.html page", or "Explain the open file calculate.js"
                    </p>
                  </div>
                ) : (
                  chatLog.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border ${
                        msg.role === 'user'
                          ? 'bg-[#111213] border-[#2A2D30] text-[#ECEBE9]'
                          : msg.role === 'system'
                          ? 'bg-[#3C6B4D]/5 border-[#3C6B4D]/25 text-[#3C6B4D] font-mono text-[10px]'
                          : 'bg-[#1E2022]/40 border-[#2A2D30]/60 text-[#A3A09B]'
                      }`}
                    >
                      <span className="font-bold block mb-1 text-[10px] text-[#72706C] uppercase font-mono">
                        {msg.role === 'user' ? 'You' : msg.role === 'system' ? 'System' : 'DomoDomo'}
                      </span>
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    </div>
                  ))
                )}

                {isThinking && (
                  <div className="p-3 bg-[#111213] border border-[#2A2D30] rounded-xl text-center space-y-2 animate-pulse">
                    <Cpu size={16} className="mx-auto text-[#3C6B4D] animate-spin" />
                    <span className="text-[10px] text-[#72706C] block">{thinkingStatus}</span>
                  </div>
                )}
              </div>

              {/* Input Chat bar */}
              <div className="relative mt-2">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAgentPromptSubmit();
                    }
                  }}
                  disabled={isThinking || !ollamaActive}
                  placeholder={
                    !ollamaActive
                      ? 'Local Ollama is offline...'
                      : 'Ask Domo to write or edit code...'
                  }
                  className="w-full pl-3 pr-9 py-2 text-xs rounded-xl bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] placeholder-[#72706C] focus:outline-none focus:border-[#3C6B4D]/50 resize-none h-12 leading-relaxed"
                />
                <button
                  onClick={handleAgentPromptSubmit}
                  disabled={isThinking || !prompt.trim() || !ollamaActive}
                  className="absolute right-2.5 top-2.5 p-1 rounded-lg bg-[#18191B] hover:bg-[#25282B] border border-[#2A2D30] text-[#3C6B4D] disabled:opacity-40"
                >
                  <Play size={10} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'models' && (
        <div className="space-y-6">
          {/* Custom Model puller */}
          <div className="glass-card p-5 bg-[#18191B] flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="space-y-1 text-left">
              <h3 className="text-sm font-bold text-[#ECEBE9]">Download Custom Ollama Model</h3>
              <p className="text-xs text-[#A3A09B]">
                Enter any official model tag from the Ollama library (e.g., <code>codegemma</code>, <code>mistral:7b-instruct</code>).
              </p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <input
                type="text"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder="e.g. codegemma"
                className="w-full md:w-60 px-4 py-2 text-xs rounded-xl bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] placeholder-[#72706C] focus:outline-none focus:border-[#3C6B4D]/50"
              />
              <button
                onClick={() => customModel && handlePullModel(customModel.trim())}
                disabled={!customModel || !!pullingModel}
                className="btn-primary py-2 px-4 text-xs"
              >
                <Download size={13} />
                <span>Pull Model</span>
              </button>
            </div>
          </div>

          {/* Download Progress Banner */}
          {pullingModel && (
            <div className="glass-card p-5 bg-[#18191B] border border-[#3C6B4D]/30 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#3C6B4D] animate-ping" />
                  <span className="font-bold text-[#ECEBE9]">Downloading model: {pullingModel}</span>
                </div>
                <span className="font-mono text-[#3C6B4D] font-bold">{pullProgress}%</span>
              </div>
              <div className="w-full bg-[#111213] h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#3C6B4D] h-full transition-all duration-300 rounded-full" 
                  style={{ width: `${pullProgress}%` }}
                />
              </div>
              <div className="text-[11px] text-[#A3A09B] font-mono leading-none">{pullStatus}</div>
            </div>
          )}

          {/* Model Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {POPULAR_MODELS.map((model) => {
              const isDownloaded = downloadedModels.includes(model.tag);
              return (
                <div
                  key={model.id}
                  className={`glass-card p-6 flex flex-col justify-between gap-5 bg-[#18191B] border transition-all ${
                    isDownloaded ? 'border-[#3C6B4D]/20 bg-[#18191B]/80' : 'border-[#2A2D30]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#111213] px-2 py-0.5 border border-[#2A2D30] rounded-md text-[#72706C]">
                          {model.tag}
                        </span>
                        <h3 className="text-base font-extrabold text-[#ECEBE9] mt-2">{model.name}</h3>
                      </div>
                      
                      {isDownloaded ? (
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle size={10} />
                          <span>Downloaded</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-[#A3A09B]">Size: {model.size}</span>
                      )}
                    </div>
                    
                    <p className="text-xs text-[#A3A09B] leading-relaxed">
                      {model.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#2A2D30]/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#72706C]">
                      <span>RAM Required:</span>
                      <span className="font-bold text-[#A3A09B]">{model.ramRequired}</span>
                    </div>

                    <button
                      onClick={() => handlePullModel(model.tag)}
                      disabled={isDownloaded || !!pullingModel || !ollamaActive}
                      className={`text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1.5 border transition-all ${
                        isDownloaded
                          ? 'bg-[#1E2022] text-[#72706C] border-[#2A2D30] cursor-default'
                          : !ollamaActive
                          ? 'bg-[#1E2022] text-[#72706C] border-[#2A2D30] cursor-not-allowed opacity-55'
                          : 'bg-[#3C6B4D] hover:bg-[#2E533B] text-[#ECEBE9] border-[#4a845f]/20 shadow-sm active:scale-95'
                      }`}
                    >
                      <Download size={12} />
                      <span>{isDownloaded ? 'Installed' : 'Download Offline'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'setup' && (
        <div className="space-y-6 max-w-4xl">
          <div className="flex border-b border-[#2A2D30] gap-3">
            {(['mac', 'win', 'linux'] as const).map((os) => (
              <button
                key={os}
                onClick={() => setOsTab(os)}
                className={`pb-2.5 text-xs font-bold uppercase transition-all border-b-2 ${
                  osTab === os
                    ? 'border-[#3C6B4D] text-[#ECEBE9]'
                    : 'border-transparent text-[#72706C] hover:text-[#A3A09B]'
                }`}
              >
                {os === 'mac' ? 'macOS' : os === 'win' ? 'Windows' : 'Linux'}
              </button>
            ))}
          </div>

          <div className="space-y-6 text-xs text-[#A3A09B] leading-relaxed">
            {/* Step 1 */}
            <div className="flex gap-4 items-start bg-[#18191B] p-5 rounded-2xl border border-[#2A2D30]">
              <div className="w-6 h-6 rounded-full bg-[#3C6B4D]/15 border border-[#3C6B4D]/30 text-[#3C6B4D] flex items-center justify-center font-mono font-bold shrink-0">1</div>
              <div className="space-y-2 text-left">
                <h4 className="font-extrabold text-sm text-[#ECEBE9]">Download and Install Ollama</h4>
                <p>
                  Ollama is a local-only runner for large language models. Click below to download the application for your operating system.
                </p>
                <a
                  href="https://ollama.com/download"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 bg-[#1E2022] hover:bg-[#25282B] text-[#ECEBE9] border border-[#2A2D30] px-3.5 py-1.5 rounded-lg font-semibold mt-1 transition-colors"
                >
                  <span>Go to Ollama Download Page</span>
                  <Sliders size={12} className="text-[#3C6B4D]" />
                </a>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 items-start bg-[#18191B] p-5 rounded-2xl border border-[#2A2D30]">
              <div className="w-6 h-6 rounded-full bg-[#3C6B4D]/15 border border-[#3C6B4D]/30 text-[#3C6B4D] flex items-center justify-center font-mono font-bold shrink-0">2</div>
              <div className="space-y-3 text-left w-full">
                <h4 className="font-extrabold text-sm text-[#ECEBE9]">Configure CORS Isolation (Required)</h4>
                <p>
                  Since DomoDomo runs fully sandboxed within your browser tab, the local Ollama server must allow cross-origin requests from browsers. Configure CORS by setting the environment variable <code>OLLAMA_ORIGINS="*"</code>:
                </p>

                {osTab === 'mac' && (
                  <div className="space-y-3">
                    <p className="font-semibold text-xs text-[#ECEBE9]">For the macOS Terminal:</p>
                    <pre className="p-3 bg-[#111213] border border-[#2A2D30] rounded-xl font-mono text-[10px] text-[#3C6B4D] overflow-x-auto">
                      <code>OLLAMA_ORIGINS="*" ollama serve</code>
                    </pre>
                    <p className="font-semibold text-xs text-[#ECEBE9] pt-1">For the GUI App (Permanent settings):</p>
                    <p>Open Terminal and run the following command to set environment variables permanently, then restart Ollama app:</p>
                    <pre className="p-3 bg-[#111213] border border-[#2A2D30] rounded-xl font-mono text-[10px] text-[#3C6B4D] overflow-x-auto">
                      <code>launchctl setenv OLLAMA_ORIGINS "*"</code>
                    </pre>
                  </div>
                )}

                {osTab === 'win' && (
                  <div className="space-y-2">
                    <p>1. Right-click on the Start Menu and select <strong>Settings ➜ System ➜ About</strong>.</p>
                    <p>2. Click <strong>Advanced system settings</strong> on the right.</p>
                    <p>3. In the System Properties window, click <strong>Environment Variables</strong>.</p>
                    <p>4. Under <strong>User Variables</strong> (or System Variables), click <strong>New...</strong></p>
                    <p>5. Enter variable name: <code className="text-emerald-500">OLLAMA_ORIGINS</code> and variable value: <code className="text-emerald-500">*</code></p>
                    <p>6. Click OK, close System Settings, and restart Ollama from the Windows System Tray.</p>
                  </div>
                )}

                {osTab === 'linux' && (
                  <div className="space-y-3">
                    <p>For systemd configurations (standard install), edit the service file:</p>
                    <pre className="p-3 bg-[#111213] border border-[#2A2D30] rounded-xl font-mono text-[10px] text-[#3C6B4D] overflow-x-auto">
                      <code>sudo systemctl edit ollama.service</code>
                    </pre>
                    <p>Add the following section under the editor, save, and exit:</p>
                    <pre className="p-3 bg-[#111213] border border-[#2A2D30] rounded-xl font-mono text-[10px] text-[#3C6B4D] overflow-x-auto">
                      <code>[Service]
Environment="OLLAMA_ORIGINS=*"</code>
                    </pre>
                    <p>Reload daemon settings and restart the service:</p>
                    <pre className="p-3 bg-[#111213] border border-[#2A2D30] rounded-xl font-mono text-[10px] text-[#3C6B4D] overflow-x-auto">
                      <code>sudo systemctl daemon-reload
sudo systemctl restart ollama</code>
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 items-start bg-[#18191B] p-5 rounded-2xl border border-[#2A2D30]">
              <div className="w-6 h-6 rounded-full bg-[#3C6B4D]/15 border border-[#3C6B4D]/30 text-[#3C6B4D] flex items-center justify-center font-mono font-bold shrink-0">3</div>
              <div className="space-y-2 text-left">
                <h4 className="font-extrabold text-sm text-[#ECEBE9]">Verify Offline Readiness</h4>
                <p>
                  Go to the <strong>Domo Agent IDE Workspace</strong> tab above and verify status indicators show connected. You are ready to start coding!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AIDomoAgentHub;
