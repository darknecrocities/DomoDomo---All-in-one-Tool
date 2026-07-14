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
  UserCheck
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
}

interface ResearchPhase {
  name: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  output: string;
  durationMs?: number;
}

export const AIResearchOrchestrationHub: React.FC = () => {
  // Config States
  const [researchTopic, setResearchTopic] = useState('Deep Analysis on Client-Side Local-First Databases & RAG Architectures');
  const [selectedModel, setSelectedModel] = useState('llama3.2:1b');
  const [downloadedModels, setDownloadedModels] = useState<string[]>([]);
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  
  // Orchestration Setup
  const [agents, setAgents] = useState<ResearchAgent[]>([
    {
      id: 'agent-researcher',
      name: 'Deep Researcher',
      role: 'Literature & Source Analyst',
      model: 'llama3.2:1b',
      instructions: 'Analyze background context, retrieve data points, cite relevant concepts, and identify structural facts.'
    },
    {
      id: 'agent-synthesizer',
      name: 'Synthesizer AI',
      role: 'Core Integration Specialist',
      model: 'llama3.2:1b',
      instructions: 'Synthesize raw findings into a cohesive, structured report with clear arguments, comparisons, and structural details.'
    },
    {
      id: 'agent-critic',
      name: 'Adversarial Reviewer',
      role: 'Validation & Integrity Guard',
      model: 'llama3.2:1b',
      instructions: 'Audit the synthesis findings for conflicts, logical fallacies, data gaps, or hallucination risks.'
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
          // Align agent default models to retrieved models
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

  // Run structured loop pipeline
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

      if (i === 0) {
        // Phase 1: Research Extraction
        systemPrompt = `Role: ${researcher.name} (${researcher.role}). Instructions: ${researcher.instructions}. ${researcher.skill?.systemInstructions || ''}`;
        prompt = `Perform research planning and source extraction on: "${researchTopic}". Detail 4 primary research vectors, keywords, key questions, and preliminary structures.`;
      } else if (i === 1) {
        // Phase 2: Synthesis
        const sourceData = resetPhases[0].output || 'No background logs found.';
        systemPrompt = `Role: ${synthesizer.name} (${synthesizer.role}). Instructions: ${synthesizer.instructions}. ${synthesizer.skill?.systemInstructions || ''}`;
        prompt = `Based on the extraction data:
---
${sourceData}
---
Synthesize a structured report for "${researchTopic}". Include detailed sections, comparisons, technical highlights, and recommendations.`;
      } else if (i === 2) {
        // Phase 3: Conflict Analysis
        const draftData = resetPhases[1].output || 'No draft found.';
        systemPrompt = `Role: ${critic.name} (${critic.role}). Instructions: ${critic.instructions}. ${critic.skill?.systemInstructions || ''}`;
        prompt = `Audit the following synthesized draft:
---
${draftData}
---
Analyze if there are contradictions, logical fallacies, data gaps, or unverified claims. Output a verification summary detailing warning elements and mitigation logs.`;
      } else {
        // Phase 4: Final Draft Production
        const draftData = resetPhases[1].output || 'No draft found.';
        const critiqueData = resetPhases[2].output || 'No feedback found.';
        systemPrompt = `Role: ${synthesizer.name} (${synthesizer.role}). Final Polish.`;
        prompt = `Produce the final, polished comprehensive research paper on "${researchTopic}". Incorporate the adversarial critique feedback and resolve conflicts.
Draft:
${draftData}

Critique feedback:
${critiqueData}

Provide a well-formatted, professional output with clean headers, structured bullet points, blockquotes, code blocks (if applicable), and citations.`;
      }

      try {
        const response = await aiService.generateText(
          prompt,
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
        setPhases([...resetPhases]);
      } catch (err: any) {
        resetPhases[i] = {
          ...resetPhases[i],
          status: 'failed',
          output: `Execution failed: ${err.message || 'Check Ollama server connection.'}`
        };
        setPhases([...resetPhases]);
        break; // stop loop on failure
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

      // Header H1
      if (trimmed.startsWith('# ')) {
        return <h2 key={idx} className="text-lg font-black text-[#ECEBE9] mt-6 mb-2 border-b border-[#2A2D30] pb-2 font-heading">{trimmed.slice(2)}</h2>;
      }
      // Header H2
      if (trimmed.startsWith('## ')) {
        return <h3 key={idx} className="text-sm font-extrabold text-[#ECEBE9] mt-4 mb-1.5">{trimmed.slice(3)}</h3>;
      }
      // Header H3
      if (trimmed.startsWith('### ')) {
        return <h4 key={idx} className="text-xs font-bold text-[#ECEBE9]/90 mt-3 mb-1">{trimmed.slice(4)}</h4>;
      }
      // Bullet point
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return <li key={idx} className="ml-4 list-disc text-xs text-[#A3A09B] leading-relaxed mb-1">{trimmed.slice(2)}</li>;
      }
      // Numbered point
      if (/^\d+\.\s/.test(trimmed)) {
        return <li key={idx} className="ml-4 list-decimal text-xs text-[#A3A09B] leading-relaxed mb-1">{trimmed.replace(/^\d+\.\s/, '')}</li>;
      }
      // Blockquotes
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

  const downloadReport = (content: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `domo-research-${researchTopic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
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
            <h2 className="text-xs font-bold tracking-widest text-[#A3A09B] uppercase flex items-center gap-2">
              <UserCheck size={14} className="text-[#3C6B4D]" />
              Agent Orchestration
            </h2>

            {/* Selector tabs for editing agent configurations */}
            <div className="grid grid-cols-3 gap-1 bg-[#111213] p-1 rounded-xl">
              {agents.map(a => (
                <button
                  key={a.id}
                  onClick={() => setEditingAgentId(a.id)}
                  className={`text-[9px] py-1.5 font-bold rounded-lg transition-all ${
                    editingAgentId === a.id ? 'bg-[#3C6B4D] text-[#ECEBE9]' : 'text-[#A3A09B] hover:text-[#ECEBE9]'
                  }`}
                >
                  {a.name}
                </button>
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
                  rows={4}
                  className="w-full bg-[#111213] text-xs font-semibold px-3 py-2 border border-[#2A2D30] rounded-xl text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D] resize-none disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Execution loop status & outputs */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Pipeline Progress Loop Map */}
          <div className="bg-[#18191B] border border-[#2A2D30] rounded-3xl p-6 shadow-xl">
            <h2 className="text-xs font-bold tracking-widest text-[#A3A09B] uppercase mb-4 flex items-center gap-2">
              <Layers size={14} className="text-[#3C6B4D]" />
              Research Execution Loop Planners
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {phases.map((phase, idx) => {
                const statusColor = 
                  phase.status === 'completed' ? 'border-[#3C6B4D]/60 bg-[#3C6B4D]/5 text-[#3C6B4D]' :
                  phase.status === 'running' ? 'border-[#E29E2D]/60 bg-[#E29E2D]/5 text-[#E29E2D]' :
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
                      <h4 className="text-xs font-bold tracking-tight text-[#ECEBE9]">{phase.name}</h4>
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

                {phases[3].output && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(phases[3].output)}
                      className="p-2 bg-[#111213] border border-[#2A2D30] rounded-xl hover:text-[#ECEBE9] text-[#A3A09B] transition-colors"
                      title="Copy Raw Markdown"
                    >
                      {isCopied ? <Check size={14} className="text-[#3C6B4D]" /> : <Copy size={14} />}
                    </button>
                    <button
                      onClick={() => downloadReport(phases[3].output)}
                      className="p-2 bg-[#111213] border border-[#2A2D30] rounded-xl hover:text-[#ECEBE9] text-[#A3A09B] transition-colors"
                      title="Download Markdown File"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Compilation results display */}
              <div className="bg-[#111213]/40 border border-[#2A2D30]/40 rounded-2xl p-6 min-h-[400px] overflow-y-auto select-text select-all">
                {isOrchestrating && !phases[3].output ? (
                  <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 text-center">
                    <span className="w-8 h-8 border-3 border-[#3C6B4D]/25 border-t-[#3C6B4D] rounded-full animate-spin" />
                    <p className="text-xs text-[#ECEBE9] font-bold">Orchestrating Loop Processing...</p>
                    <p className="text-[10px] text-[#A3A09B] max-w-sm">
                      Executing Phase {currentPhaseIdx !== null ? currentPhaseIdx + 1 : 1}: {currentPhaseIdx !== null ? phases[currentPhaseIdx].name : ''}
                    </p>
                  </div>
                ) : (
                  <div>
                    {phases[3].output ? (
                      formatOutput(phases[3].output)
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

            {/* Loop audit outputs review logs if available */}
            {phases[2].output && (
              <div className="mt-6 border-t border-[#2A2D30]/65 pt-6 space-y-3">
                <h4 className="text-xs font-bold text-[#E29E2D] flex items-center gap-1.5 uppercase tracking-wider">
                  <AlertTriangle size={14} />
                  Adversarial Critic Integrity Feedback
                </h4>
                <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-4 text-[11px] text-[#A3A09B] leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {phases[2].output}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
