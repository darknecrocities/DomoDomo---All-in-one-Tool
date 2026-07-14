import React, { useState, useEffect } from 'react';
import {
  Brain,
  BookOpen,
  Layers,
  Settings,
  Play,
  Download,
  Copy,
  Check,
  FileText,
  AlertTriangle,
  UserCheck,
  Plus,
  Trash2,
  Database,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { PREMADE_SKILLS } from './data/premadeSkills';
import type { SkillDef } from './data/premadeSkills';

interface ResearchAgent {
  id: string;
  name: string;
  role: string;
  skill?: SkillDef;
  model: string;
  instructions: string;
  memory: string[];
}

interface ResearchPhase {
  name: string;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  output: string;
  durationMs?: number;
}

interface DecisionLog {
  id: string;
  agentName: string;
  decisionText: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected' | 'custom_typed';
  userInput?: string;
}

export const AIResearchOrchestrationHub: React.FC = () => {
  // Config States
  const [researchTopic, setResearchTopic] = useState('Deep Analysis on Client-Side Local-First Databases & RAG Architectures');
  const [selectedModel, setSelectedModel] = useState('llama3.2:1b');
  const [downloadedModels, setDownloadedModels] = useState<string[]>([]);
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  
  // Custom Agent Creation Form
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentRole, setNewAgentRole] = useState('');
  const [newAgentInstructions, setNewAgentInstructions] = useState('');

  // Unified Memory Store
  const [unifiedMemory, setUnifiedMemory] = useState<string[]>([
    'RAG systems utilize vector similarity math to pull context blocks from IndexedDB.',
    'Local inference models run strictly client-side on local machine hardware.'
  ]);
  const [newMemoryInput, setNewMemoryInput] = useState('');

  // Interactive Decisions & Logs
  const [decisionLogs, setDecisionLogs] = useState<DecisionLog[]>([]);
  const [customResponseInput, setCustomResponseInput] = useState('');
  const [activeDecisionId, setActiveDecisionId] = useState<string | null>(null);

  // Orchestration Setup
  const [agents, setAgents] = useState<ResearchAgent[]>([
    {
      id: 'agent-researcher',
      name: 'Deep Researcher',
      role: 'Literature & Source Analyst',
      model: 'llama3.2:1b',
      instructions: 'Analyze background context, retrieve data points, cite relevant concepts, and identify structural facts.',
      memory: ['Loaded Tagalog dictionaries list.', 'Indexed initial Philippine address PSGC structures.']
    },
    {
      id: 'agent-synthesizer',
      name: 'Synthesizer AI',
      role: 'Core Integration Specialist',
      model: 'llama3.2:1b',
      instructions: 'Synthesize raw findings into a cohesive, structured report with clear arguments, comparisons, and structural details.',
      memory: ['Organized data matrices layout guidelines.']
    },
    {
      id: 'agent-critic',
      name: 'Adversarial Reviewer',
      role: 'Validation & Integrity Guard',
      model: 'llama3.2:1b',
      instructions: 'Audit the synthesis findings for conflicts, logical fallacies, data gaps, or hallucination risks.',
      memory: ['Verified integrity of locally extracted records.']
    }
  ]);

  // Selected Agent for Editing
  const [editingAgentId, setEditingAgentId] = useState<string>('agent-researcher');

  // Loop Planning Phases
  const [phases, setPhases] = useState<ResearchPhase[]>([
    { name: 'Source Inspection & Extraction', status: 'idle', output: '' },
    { name: 'Core Synthesis & Draft Writing', status: 'idle', output: '' },
    { name: 'Fact-Check & Conflict Analysis', status: 'idle', output: '' },
    { name: 'Final Production Report Generation', status: 'idle', output: '' }
  ]);

  const [currentPhaseIdx, setCurrentPhaseIdx] = useState<number | null>(null);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Render variables
  const activeAgent = agents.find(a => a.id === editingAgentId) || agents[0];

  useEffect(() => {
    checkOllamaConnection();
  }, []);

  const checkOllamaConnection = async () => {
    setOllamaStatus('checking');
    try {
      const res = await aiService.checkOllama();
      if (res.status) {
        setOllamaStatus('online');
        setDownloadedModels(res.models);
        if (res.models.length > 0) {
          setSelectedModel(res.models[0]);
          setAgents(prev => prev.map(a => ({ ...a, model: res.models[0] })));
        }
      } else {
        setOllamaStatus('offline');
      }
    } catch {
      setOllamaStatus('offline');
    }
  };

  const handleUpdateAgent = (updated: Partial<ResearchAgent>) => {
    setAgents(prev => prev.map(a => a.id === editingAgentId ? { ...a, ...updated } : a));
  };

  const handleAttachSkill = (skill: SkillDef | undefined) => {
    if (!skill) {
      handleUpdateAgent({
        skill: undefined,
        instructions: 'Analyze background context, retrieve data points, cite relevant concepts, and identify structural facts.'
      });
      return;
    }
    handleUpdateAgent({
      skill,
      instructions: skill.systemInstructions.slice(0, 300) + '...'
    });
  };

  // Add a new custom agent
  const handleAddNewAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName.trim() || !newAgentRole.trim()) return;

    const newAgent: ResearchAgent = {
      id: `agent-${Date.now()}`,
      name: newAgentName,
      role: newAgentRole,
      model: selectedModel,
      instructions: newAgentInstructions.trim() || 'Execute general workflow tasks under supervisor direction.',
      memory: ['Initialized empty node memory.']
    };

    setAgents(prev => [...prev, newAgent]);
    setEditingAgentId(newAgent.id);
    
    // Dynamically append QA check phase if it is a QA agent
    if (newAgentRole.toLowerCase().includes('qa') || newAgentName.toLowerCase().includes('qa') || newAgentName.toLowerCase().includes('quality')) {
      setPhases(prev => {
        // Insert QA verification before the final draft phase
        const updated = [...prev];
        updated.splice(3, 0, { name: `${newAgentName} Verification Check`, status: 'idle', output: '' });
        return updated;
      });
    }

    setNewAgentName('');
    setNewAgentRole('');
    setNewAgentInstructions('');
  };

  // Delete custom agent
  const handleDeleteAgent = (id: string) => {
    if (agents.length <= 1) return;
    setAgents(prev => prev.filter(a => a.id !== id));
    if (editingAgentId === id) {
      const remaining = agents.filter(a => a.id !== id);
      setEditingAgentId(remaining[0].id);
    }
  };

  // Unified memory actions
  const handleAddUnifiedMemory = () => {
    if (!newMemoryInput.trim()) return;
    setUnifiedMemory(prev => [...prev, newMemoryInput.trim()]);
    setNewMemoryInput('');
  };

  // Individual memory actions
  const handleAddAgentMemory = (agentId: string, memoryText: string) => {
    if (!memoryText.trim()) return;
    setAgents(prev => prev.map(a => a.id === agentId ? { ...a, memory: [...a.memory, memoryText.trim()] } : a));
  };

  const handleRemoveAgentMemory = (agentId: string, index: number) => {
    setAgents(prev => prev.map(a => a.id === agentId ? { ...a, memory: a.memory.filter((_, idx) => idx !== index) } : a));
  };

  // Interactive decision checkpoint helper
  const requestApprovalCheckpoint = (agentName: string, decisionText: string): Promise<{ status: 'approved' | 'rejected' | 'custom_typed'; input?: string }> => {
    return new Promise((resolve) => {
      const logId = `decision-${Date.now()}`;
      const newLog: DecisionLog = {
        id: logId,
        agentName,
        decisionText,
        timestamp: new Date().toLocaleTimeString(),
        status: 'pending'
      };

      setDecisionLogs(prev => [...prev, newLog]);
      setActiveDecisionId(logId);

      // We will poll until the status is no longer pending
      const interval = setInterval(() => {
        setDecisionLogs(currentLogs => {
          const log = currentLogs.find(l => l.id === logId);
          if (log && log.status !== 'pending') {
            clearInterval(interval);
            setActiveDecisionId(null);
            resolve({ status: log.status, input: log.userInput });
          }
          return currentLogs;
        });
      }, 500);
    });
  };

  const submitDecisionResponse = (status: 'approved' | 'rejected' | 'custom_typed', text?: string) => {
    if (!activeDecisionId) return;
    setDecisionLogs(prev => prev.map(l => l.id === activeDecisionId ? { ...l, status, userInput: text } : l));
  };

  // Run structured loop pipeline with approval checks and individual memories
  const startResearchOrchestration = async () => {
    if (!researchTopic.trim()) return;
    setIsOrchestrating(true);
    setCurrentPhaseIdx(0);
    
    // Reset phases
    const resetPhases: ResearchPhase[] = phases.map(p => ({
      ...p,
      status: 'idle',
      output: ''
    }));
    setPhases(resetPhases);

    // Iterative Execution Loop
    for (let i = 0; i < resetPhases.length; i++) {
      setCurrentPhaseIdx(i);
      setPhases(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'running' } : p));
      
      const startTime = Date.now();
      let prompt = '';
      let systemPrompt = '';
      
      const researcher = agents[0];
      const synthesizer = agents[1];
      const critic = agents[2];

      // Build context strings from Individual Memories and Unified Memory
      const unifiedMemString = unifiedMemory.map(m => `- ${m}`).join('\n');
      
      if (i === 0) {
        // Phase 1: Research Extraction
        const indMemString = researcher.memory.map(m => `- ${m}`).join('\n');
        systemPrompt = `Role: ${researcher.name} (${researcher.role}). Instructions: ${researcher.instructions}. ${researcher.skill?.systemInstructions || ''}\n\nIndividual Memory:\n${indMemString}\n\nUnified Shared Memory:\n${unifiedMemString}`;
        prompt = `Perform research planning and source extraction on: "${researchTopic}". Detail 4 primary research vectors, keywords, key questions, and preliminary structures.`;
      } else if (i === 1) {
        // Phase 2: Synthesis
        const sourceData = resetPhases[0].output || 'No background logs found.';
        const indMemString = synthesizer.memory.map(m => `- ${m}`).join('\n');
        systemPrompt = `Role: ${synthesizer.name} (${synthesizer.role}). Instructions: ${synthesizer.instructions}. ${synthesizer.skill?.systemInstructions || ''}\n\nIndividual Memory:\n${indMemString}\n\nUnified Shared Memory:\n${unifiedMemString}`;
        prompt = `Based on the extraction data:\n${sourceData}\n\nSynthesize a structured report for "${researchTopic}". Include detailed sections, comparisons, and recommendations.`;
      } else if (i === 2) {
        // Phase 3: Conflict Analysis
        const draftData = resetPhases[1].output || 'No draft found.';
        const indMemString = critic.memory.map(m => `- ${m}`).join('\n');
        systemPrompt = `Role: ${critic.name} (${critic.role}). Instructions: ${critic.instructions}. ${critic.skill?.systemInstructions || ''}\n\nIndividual Memory:\n${indMemString}\n\nUnified Shared Memory:\n${unifiedMemString}`;
        prompt = `Audit the synthesized draft:\n${draftData}\n\nAnalyze if there are contradictions, logical fallacies, data gaps, or unverified claims. Output a verification summary.`;
      } else if (phases[i].name.toLowerCase().includes('verification') || phases[i].name.toLowerCase().includes('qa')) {
        // Dynamic Dynamic QA phase if added
        const draftData = resetPhases[1].output || '';
        const qaAgent = agents.find(a => a.role.toLowerCase().includes('qa') || a.name.toLowerCase().includes('qa')) || critic;
        const indMemString = qaAgent.memory.map(m => `- ${m}`).join('\n');
        systemPrompt = `Role: ${qaAgent.name} (${qaAgent.role}). Instructions: ${qaAgent.instructions}.\n\nIndividual Memory:\n${indMemString}\n\nUnified Shared Memory:\n${unifiedMemString}`;
        prompt = `Perform a comprehensive Quality Assurance verification on: "${researchTopic}". Report highlights, typos, structural alignment scores, and fixes required.\nDraft:\n${draftData}`;
      } else {
        // Final Phase
        const draftIdx = resetPhases.findIndex(p => p.name.includes('Synthesis'));
        const criticIdx = resetPhases.findIndex(p => p.name.includes('Conflict'));
        const draftData = resetPhases[draftIdx !== -1 ? draftIdx : 1].output || '';
        const critiqueData = resetPhases[criticIdx !== -1 ? criticIdx : 2].output || '';
        systemPrompt = `Role: ${synthesizer.name} (${synthesizer.role}). Final Polish.`;
        prompt = `Produce the final, polished comprehensive research paper on "${researchTopic}". Incorporate the critique feedback:\nCritique:\n${critiqueData}\n\nDraft:\n${draftData}`;
      }

      // Checkpoint before executing this phase: Request user decision approval!
      setPhases(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'paused' } : p));
      const approval = await requestApprovalCheckpoint(
        i === 0 ? researcher.name : i === 1 ? synthesizer.name : critic.name,
        `Proceeding to execute phase ${i + 1} ("${resetPhases[i].name}") for topic "${researchTopic}". Approve to run local inference.`
      );

      if (approval.status === 'rejected') {
        resetPhases[i] = {
          ...resetPhases[i],
          status: 'failed',
          output: 'Execution rejected by the user at approval checkpoint.'
        };
        setPhases([...resetPhases]);
        break;
      }

      // If user typed custom instructions, append them
      let finalPrompt = prompt;
      if (approval.status === 'custom_typed' && approval.input) {
        finalPrompt += `\n\nUser Custom Guidance (Direct Command Override):\n${approval.input}`;
      }

      setPhases(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'running' } : p));

      try {
        const response = await aiService.generateText(
          finalPrompt,
          1200,
          undefined,
          selectedModel,
          { systemPrompt }
        );

        const duration = Date.now() - startTime;
        resetPhases[i] = {
          ...resetPhases[i],
          status: 'completed',
          output: response,
          durationMs: duration
        };

        // Add key output summaries to active agent's memory
        const summary = `Generated outputs for phase "${resetPhases[i].name}".`;
        const targetAgentId = i === 0 ? 'agent-researcher' : i === 1 ? 'agent-synthesizer' : 'agent-critic';
        handleAddAgentMemory(targetAgentId, summary);

        setPhases([...resetPhases]);
      } catch (err: any) {
        resetPhases[i] = {
          ...resetPhases[i],
          status: 'failed',
          output: `Execution failed: ${err.message || 'Check Ollama server connection.'}`
        };
        setPhases([...resetPhases]);
        break; 
      }
    }

    setIsOrchestrating(false);
    setCurrentPhaseIdx(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Convert output markdown string to styled elements
  const formatOutput = (text: string) => {
    if (!text) return <p className="text-xs text-[#A3A09B] italic">No output generated yet.</p>;

    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-3" />;

      if (trimmed.startsWith('# ')) {
        return <h2 key={idx} className="text-lg font-black text-[#ECEBE9] mt-6 mb-2 border-b border-[#2A2D30] pb-2 font-heading">{trimmed.slice(2)}</h2>;
      }
      if (trimmed.startsWith('## ')) {
        return <h3 key={idx} className="text-sm font-extrabold text-[#ECEBE9] mt-4 mb-1.5">{trimmed.slice(3)}</h3>;
      }
      if (trimmed.startsWith('### ')) {
        return <h4 key={idx} className="text-xs font-bold text-[#ECEBE9]/90 mt-3 mb-1">{trimmed.slice(4)}</h4>;
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return <li key={idx} className="ml-4 list-disc text-xs text-[#A3A09B] leading-relaxed mb-1">{trimmed.slice(2)}</li>;
      }
      if (/^\d+\.\s/.test(trimmed)) {
        return <li key={idx} className="ml-4 list-decimal text-xs text-[#A3A09B] leading-relaxed mb-1">{trimmed.replace(/^\d+\.\s/, '')}</li>;
      }
      if (trimmed.startsWith('> ')) {
        return (
          <blockquote key={idx} className="border-l-2 border-[#3C6B4D] bg-[#111213]/40 pl-3 py-1.5 my-3 text-xs italic text-[#A3A09B] rounded-r">
            {trimmed.slice(2)}
          </blockquote>
        );
      }

      return <p key={idx} className="text-xs text-[#A3A09B] leading-relaxed mb-2.5">{line}</p>;
    });
  };

  const downloadReport = (content: string, titleSuffix: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `domo-research-${titleSuffix}-${researchTopic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-[#111213] text-[#ECEBE9] font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-[#2A2D30] pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/20">
            <Brain size={28} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              AI Research Orchestration Hub
              <span className="text-[9px] font-bold bg-[#3C6B4D]/20 text-[#3C6B4D] px-2 py-0.5 rounded border border-[#3C6B4D]/30 uppercase tracking-wider">Multi-Agent Sandbox</span>
            </h1>
            <p className="text-xs text-[#A3A09B]">
              Orchestrate structured, loop-based research campaigns with specialized local AI agents, model selectors, and conflict checks.
            </p>
          </div>
        </div>

        {/* Ollama Connection Indicator */}
        <div className="flex items-center gap-2">
          {ollamaStatus === 'checking' && (
            <span className="text-[10px] font-bold text-[#E29E2D] bg-[#E29E2D]/10 px-3 py-1 rounded-xl border border-[#E29E2D]/20 animate-pulse">Checking Local Server...</span>
          )}
          {ollamaStatus === 'online' && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#3C6B4D] bg-[#3C6B4D]/10 px-3 py-1.5 rounded-xl border border-[#3C6B4D]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3C6B4D] animate-ping" />
              <span>Ollama Online</span>
            </div>
          )}
          {ollamaStatus === 'offline' && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-400 bg-red-400/10 px-3 py-1.5 rounded-xl border border-red-400/20">
              <AlertTriangle size={12} />
              <span>Ollama Offline</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Orchestrator Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Topic & Agent Configs */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Section: Topic & Model Setup */}
          <div className="bg-[#18191B] border border-[#2A2D30] rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-xs font-bold tracking-widest text-[#A3A09B] uppercase flex items-center gap-2">
              <Settings size={14} className="text-[#3C6B4D]" />
              Campaign Setup
            </h2>

            <div>
              <label className="text-[10px] font-black text-[#A3A09B] uppercase block mb-1">Research Subject / Topic</label>
              <textarea
                value={researchTopic}
                onChange={(e) => setResearchTopic(e.target.value)}
                disabled={isOrchestrating}
                rows={3}
                className="w-full bg-[#111213] text-xs font-semibold px-4 py-3 border border-[#2A2D30] rounded-2xl text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D] resize-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-[#A3A09B] uppercase block mb-1">Inference Model</label>
              {ollamaStatus === 'online' ? (
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={isOrchestrating}
                  className="w-full bg-[#111213] text-xs font-semibold px-4 py-2 border border-[#2A2D30] rounded-xl text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D] disabled:opacity-50"
                >
                  {downloadedModels.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              ) : (
                <div className="text-[10px] text-red-400 bg-red-400/10 p-3 rounded-xl border border-red-400/20 font-semibold">
                  Start Ollama local app to power agents.
                </div>
              )}
            </div>

            <button
              onClick={startResearchOrchestration}
              disabled={isOrchestrating || ollamaStatus !== 'online' || !researchTopic.trim()}
              className="w-full py-3 bg-[#3C6B4D] hover:bg-[#467c59] text-[#ECEBE9] text-xs font-bold rounded-2xl transition-all shadow-md shadow-[#3C6B4D]/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isOrchestrating ? (
                <>
                  <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Iterating Loop...</span>
                </>
              ) : (
                <>
                  <Play size={14} />
                  <span>Launch Research Loop</span>
                </>
              )}
            </button>
          </div>

          {/* Section: Agent Roles & Pre-made Skills */}
          <div className="bg-[#18191B] border border-[#2A2D30] rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-xs font-bold tracking-widest text-[#A3A09B] uppercase flex items-center justify-between w-full">
              <span className="flex items-center gap-2">
                <UserCheck size={14} className="text-[#3C6B4D]" />
                Agent Orchestration
              </span>
            </h2>

            {/* List with Delete option */}
            <div className="flex flex-wrap gap-1.5 bg-[#111213]/40 p-2 rounded-xl border border-[#2A2D30]/40">
              {agents.map(a => (
                <div key={a.id} className="flex items-center bg-[#111213] rounded-lg p-0.5 border border-[#2A2D30]">
                  <button
                    onClick={() => setEditingAgentId(a.id)}
                    className={`text-[9px] px-2.5 py-1.5 font-bold rounded transition-all ${
                      editingAgentId === a.id ? 'bg-[#3C6B4D] text-[#ECEBE9]' : 'text-[#A3A09B] hover:text-[#ECEBE9]'
                    }`}
                  >
                    {a.name}
                  </button>
                  {agents.length > 1 && (
                    <button
                      onClick={() => handleDeleteAgent(a.id)}
                      className="p-1 hover:text-red-400 text-[#72706C] transition-colors"
                      title="Remove Agent"
                    >
                      <Trash2 size={10} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Current Editing Agent Form */}
            <div className="space-y-3 bg-[#111213]/40 p-4 rounded-2xl border border-[#2A2D30]/40">
              <div>
                <label className="text-[9px] font-bold text-[#A3A09B] uppercase block mb-1">Agent Name</label>
                <input
                  type="text"
                  value={activeAgent.name}
                  onChange={(e) => handleUpdateAgent({ name: e.target.value })}
                  disabled={isOrchestrating}
                  className="w-full bg-[#111213] text-xs font-semibold px-3 py-1.5 border border-[#2A2D30] rounded-xl text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D] disabled:opacity-50"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-[#A3A09B] uppercase block mb-1">Assigned Role</label>
                <input
                  type="text"
                  value={activeAgent.role}
                  onChange={(e) => handleUpdateAgent({ role: e.target.value })}
                  disabled={isOrchestrating}
                  className="w-full bg-[#111213] text-xs font-semibold px-3 py-1.5 border border-[#2A2D30] rounded-xl text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D] disabled:opacity-50"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-[#A3A09B] uppercase block mb-1">Premade Skill Blueprint</label>
                <select
                  value={activeAgent.skill?.name || ''}
                  onChange={(e) => {
                    const sk = PREMADE_SKILLS.find(s => s.name === e.target.value);
                    handleAttachSkill(sk);
                  }}
                  disabled={isOrchestrating}
                  className="w-full bg-[#111213] text-xs font-semibold px-3 py-1.5 border border-[#2A2D30] rounded-xl text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D] disabled:opacity-50"
                >
                  <option value="">No custom skill (General Assistant)</option>
                  {PREMADE_SKILLS.map(sk => (
                    <option key={sk.name} value={sk.name}>{sk.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold text-[#A3A09B] uppercase block mb-1">System Instructions</label>
                <textarea
                  value={activeAgent.instructions}
                  onChange={(e) => handleUpdateAgent({ instructions: e.target.value })}
                  disabled={isOrchestrating}
                  rows={3}
                  className="w-full bg-[#111213] text-xs font-semibold px-3 py-2 border border-[#2A2D30] rounded-xl text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D] resize-none disabled:opacity-50"
                />
              </div>

              {/* Individual Agent Memory Node Panel */}
              <div className="border-t border-[#2A2D30]/60 pt-3">
                <label className="text-[9px] font-bold text-[#3C6B4D] uppercase block mb-1">Individual Agent Memory Nodes</label>
                <div className="space-y-1.5 max-h-24 overflow-y-auto mb-2 pr-1">
                  {activeAgent.memory.map((m, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[10px] bg-[#111213] border border-[#2A2D30]/50 px-2.5 py-1 rounded-lg text-[#A3A09B]">
                      <span className="truncate">{m}</span>
                      <button
                        onClick={() => handleRemoveAgentMemory(activeAgent.id, idx)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    id="newAgentMem"
                    placeholder="Log memory node..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const target = e.currentTarget;
                        handleAddAgentMemory(activeAgent.id, target.value);
                        target.value = '';
                      }
                    }}
                    className="flex-grow bg-[#111213] text-[10px] px-3 py-1.5 border border-[#2A2D30] rounded-xl focus:outline-none focus:border-[#3C6B4D]"
                  />
                </div>
              </div>
            </div>

            {/* Create Custom Agent Form Section */}
            <form onSubmit={handleAddNewAgent} className="bg-[#111213]/40 border border-[#2A2D30]/40 p-4 rounded-2xl space-y-2">
              <span className="text-[10px] font-black text-[#A3A09B] uppercase block">Add Dynamic Agent (e.g. QA, Reviewer)</span>
              <input
                type="text"
                placeholder="Agent Name (e.g. QA Auditor)"
                value={newAgentName}
                onChange={(e) => setNewAgentName(e.target.value)}
                required
                className="w-full bg-[#111213] text-xs px-3 py-1.5 border border-[#2A2D30] rounded-xl focus:outline-none focus:border-[#3C6B4D]"
              />
              <input
                type="text"
                placeholder="Role (e.g. Quality Assurance Auditor)"
                value={newAgentRole}
                onChange={(e) => setNewAgentRole(e.target.value)}
                required
                className="w-full bg-[#111213] text-xs px-3 py-1.5 border border-[#2A2D30] rounded-xl focus:outline-none focus:border-[#3C6B4D]"
              />
              <textarea
                placeholder="Agent instructions..."
                rows={2}
                value={newAgentInstructions}
                onChange={(e) => setNewAgentInstructions(e.target.value)}
                className="w-full bg-[#111213] text-xs px-3 py-1.5 border border-[#2A2D30] rounded-xl focus:outline-none focus:border-[#3C6B4D] resize-none"
              />
              <button
                type="submit"
                className="w-full py-1.5 bg-[#3C6B4D]/15 hover:bg-[#3C6B4D]/25 border border-[#3C6B4D]/30 text-[#3C6B4D] text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1"
              >
                <Plus size={10} />
                <span>Append Agent Blueprint</span>
              </button>
            </form>
          </div>

          {/* Section: Unified Memory Controller */}
          <div className="bg-[#18191B] border border-[#2A2D30] rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-xs font-bold tracking-widest text-[#A3A09B] uppercase flex items-center gap-2">
              <Database size={14} className="text-[#3C6B4D]" />
              Unified Memory Store
            </h2>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {unifiedMemory.map((m, idx) => (
                <div key={idx} className="text-[10px] bg-[#111213] border border-[#2A2D30] p-2.5 rounded-xl text-[#A3A09B] leading-normal flex items-start gap-1">
                  <ArrowRight size={10} className="mt-0.5 text-[#3C6B4D] flex-shrink-0" />
                  <span>{m}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newMemoryInput}
                onChange={(e) => setNewMemoryInput(e.target.value)}
                placeholder="Log shared memory fact..."
                className="flex-grow bg-[#111213] text-xs px-3 py-1.5 border border-[#2A2D30] rounded-xl focus:outline-none focus:border-[#3C6B4D]"
              />
              <button
                onClick={handleAddUnifiedMemory}
                className="px-3 bg-[#3C6B4D] text-[#ECEBE9] rounded-xl hover:bg-[#467c59] transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Execution loop status & outputs */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Interactive Checkpoint Approvals Panel */}
          {activeDecisionId && (
            <div className="bg-[#18191B] border border-[#E29E2D]/50 rounded-3xl p-6 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-2 text-[#E29E2D]">
                <HelpCircle size={18} className="animate-bounce" />
                <h3 className="text-xs font-black uppercase tracking-wider">Agent Interactive Checkpoint Decision Needed!</h3>
              </div>
              <p className="text-xs text-[#ECEBE9] font-bold">
                {decisionLogs.find(l => l.id === activeDecisionId)?.decisionText}
              </p>
              
              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black uppercase text-[#A3A09B]">Provide Custom Response Guidance (Optional)</label>
                  <input
                    type="text"
                    value={customResponseInput}
                    onChange={(e) => setCustomResponseInput(e.target.value)}
                    placeholder="e.g. Make sure to structure it strictly with 4 code examples. or type guidance..."
                    className="bg-[#111213] border border-[#2A2D30] text-xs px-4 py-2.5 rounded-xl text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D]"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      submitDecisionResponse('approved');
                      setCustomResponseInput('');
                    }}
                    className="flex-1 py-2 bg-[#3C6B4D] text-xs font-bold rounded-xl hover:bg-[#467c59] text-white transition-all text-center"
                  >
                    Yes, Approve Action
                  </button>
                  <button
                    onClick={() => {
                      submitDecisionResponse('rejected');
                      setCustomResponseInput('');
                    }}
                    className="flex-1 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold rounded-xl hover:bg-red-500/20 transition-all text-center"
                  >
                    No, Cancel Loop
                  </button>
                  {customResponseInput.trim() && (
                    <button
                      onClick={() => {
                        submitDecisionResponse('custom_typed', customResponseInput);
                        setCustomResponseInput('');
                      }}
                      className="py-2 px-5 bg-[#E29E2D] hover:bg-[#d89222] text-[#111213] text-xs font-bold rounded-xl transition-all"
                    >
                      Override Guidance & Proceed
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pipeline Progress Loop Map */}
          <div className="bg-[#18191B] border border-[#2A2D30] rounded-3xl p-6 shadow-xl">
            <h2 className="text-xs font-bold tracking-widest text-[#A3A09B] uppercase mb-4 flex items-center gap-2">
              <Layers size={14} className="text-[#3C6B4D]" />
              Research Execution Loop Planners
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {phases.map((phase, idx) => {
                const statusColor = 
                  phase.status === 'completed' ? 'border-[#3C6B4D]/60 bg-[#3C6B4D]/5 text-[#3C6B4D]' :
                  phase.status === 'running' ? 'border-[#E29E2D]/60 bg-[#E29E2D]/5 text-[#E29E2D]' :
                  phase.status === 'paused' ? 'border-amber-400 bg-amber-400/5 text-amber-300' :
                  phase.status === 'failed' ? 'border-red-500/60 bg-red-500/5 text-red-400' :
                  'border-[#2A2D30] bg-[#111213]/40 text-[#72706C]';

                return (
                  <div key={idx} className={`border rounded-2xl p-4 flex flex-col justify-between transition-all ${statusColor}`}>
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[9px] font-black tracking-wider uppercase opacity-75">Phase {idx + 1}</span>
                        {phase.status === 'completed' && <Check size={12} />}
                        {phase.status === 'running' && <span className="w-1.5 h-1.5 rounded-full bg-[#E29E2D] animate-ping" />}
                      </div>
                      <h4 className="text-xs font-bold tracking-tight text-[#ECEBE9] truncate">{phase.name}</h4>
                    </div>
                    {phase.durationMs && (
                      <span className="text-[8px] font-mono block mt-2 opacity-65">Done in {(phase.durationMs / 1000).toFixed(1)}s</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Research Compilation & Output */}
          <div className="bg-[#18191B] border border-[#2A2D30] rounded-3xl p-6 shadow-xl flex-grow flex flex-col justify-between min-h-[500px]">
            <div>
              <div className="flex justify-between items-center mb-6 border-b border-[#2A2D30]/65 pb-4">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-[#3C6B4D]" />
                  <h3 className="text-sm font-extrabold tracking-tight text-[#ECEBE9]">Research Compile Output Console</h3>
                </div>

                <div className="flex items-center gap-2">
                  {phases.map((p, idx) => (
                    p.output && (
                      <button
                        key={idx}
                        onClick={() => downloadReport(p.output, `phase-${idx + 1}`)}
                        className="text-[9px] font-bold px-2 py-1 bg-[#111213] border border-[#2A2D30] text-[#A3A09B] hover:text-[#ECEBE9] rounded-lg transition-all flex items-center gap-1"
                        title={`Download Phase ${idx + 1} Markdown`}
                      >
                        <Download size={10} />
                        <span>P{idx + 1}</span>
                      </button>
                    )
                  ))}
                  {phases[phases.length - 1].output && (
                    <>
                      <button
                        onClick={() => copyToClipboard(phases[phases.length - 1].output)}
                        className="p-2 bg-[#111213] border border-[#2A2D30] rounded-xl hover:text-[#ECEBE9] text-[#A3A09B] transition-colors"
                        title="Copy Raw Markdown"
                      >
                        {isCopied ? <Check size={14} className="text-[#3C6B4D]" /> : <Copy size={14} />}
                      </button>
                      <button
                        onClick={() => downloadReport(phases[phases.length - 1].output, 'final')}
                        className="p-2 bg-[#111213] border border-[#2A2D30] rounded-xl hover:text-[#ECEBE9] text-[#A3A09B] transition-colors"
                        title="Download Final Report"
                      >
                        <Download size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Compilation results display */}
              <div className="bg-[#111213]/40 border border-[#2A2D30]/40 rounded-2xl p-6 min-h-[400px] overflow-y-auto select-text select-all">
                {isOrchestrating && !phases[phases.length - 1].output ? (
                  <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 text-center">
                    <span className="w-8 h-8 border-3 border-[#3C6B4D]/25 border-t-[#3C6B4D] rounded-full animate-spin" />
                    <p className="text-xs text-[#ECEBE9] font-bold">Orchestrating Loop Processing...</p>
                    <p className="text-[10px] text-[#A3A09B] max-w-sm">
                      Executing Phase {currentPhaseIdx !== null ? currentPhaseIdx + 1 : 1}: {currentPhaseIdx !== null ? phases[currentPhaseIdx].name : ''}
                    </p>
                  </div>
                ) : (
                  <div>
                    {phases[phases.length - 1].output ? (
                      formatOutput(phases[phases.length - 1].output)
                    ) : (
                      <div className="text-center py-20">
                        <FileText size={48} className="text-[#2A2D30] mx-auto mb-3" />
                        <p className="text-xs text-[#A3A09B]">No compilation generated yet. Setup your topic and click "Launch Research Loop" to start.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Decision Activity Log Timeline */}
            <div className="mt-6 border-t border-[#2A2D30]/65 pt-6 space-y-3">
              <h4 className="text-xs font-bold text-[#ECEBE9] flex items-center gap-1.5 uppercase tracking-wider">
                <Database size={14} className="text-[#3C6B4D]" />
                Loop Decision & Activity Logs
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {decisionLogs.map(log => (
                  <div key={log.id} className="bg-[#111213]/60 border border-[#2A2D30]/60 p-3 rounded-2xl flex justify-between items-center text-[10px]">
                    <div className="space-y-1">
                      <span className="text-[#3C6B4D] font-bold">[{log.agentName}]</span>
                      <p className="text-[#A3A09B]">{log.decisionText}</p>
                      {log.userInput && (
                        <p className="text-[#E29E2D] italic font-semibold">Guidance Input: "{log.userInput}"</p>
                      )}
                    </div>
                    <div className="text-right space-y-1 flex-shrink-0 ml-4">
                      <span className="text-[9px] text-[#72706C] block">{log.timestamp}</span>
                      <span className={`px-2 py-0.5 rounded font-bold uppercase text-[8px] ${
                        log.status === 'approved' ? 'bg-[#3C6B4D]/15 text-[#3C6B4D]' :
                        log.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                        log.status === 'custom_typed' ? 'bg-[#E29E2D]/10 text-[#E29E2D]' :
                        'bg-amber-400/10 text-amber-400'
                      }`}>
                        {log.status === 'custom_typed' ? 'override' : log.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
