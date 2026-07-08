import React from 'react';
import { Plus, Play, FileCode, DollarSign, Sparkles } from 'lucide-react';
import type { SkillDef } from '../data/premadeSkills';

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
  attachedSkillId?: string;
}

interface MultiIdeDashboardProps {
  agents: AgentConfig[];
  handleAddAgent: () => void;
  handleRemoveAgent: (id: string) => void;
  handleUpdateAgent: (id: string, field: keyof AgentConfig, val: any) => void;
  orchestrationMode: 'sequential' | 'simultaneous' | 'hybrid';
  setOrchestrationMode: (mode: 'sequential' | 'simultaneous' | 'hybrid') => void;
  downloadedModels: string[];
  orchestratorPrompt: string;
  setOrchestratorPrompt: (prompt: string) => void;
  isOrchestrating: boolean;
  handleOrchestrate: () => void;
  handleAutoGenAgents: () => void;
  blackboardLogs: Array<{ agentName: string; text: string; role: 'system' | 'agent'; timestamp: string }>;
  artifacts: Array<{ id: string; name: string; content: string; agentName: string }>;
  activeArtifact: { id: string; name: string; content: string; agentName: string } | null;
  setActiveArtifact: (art: any) => void;
  dirHandle: any;
  mcpConnected: boolean;
  handleWriteArtifactToWorkspace: (art: any) => void;
  highlightCode: (code: string) => string;
  handleMountDirectory: () => void;
  customSkills: SkillDef[];
  premadeSkills: SkillDef[];
  unifiedMemory: string;
  setUnifiedMemory: (val: string) => void;
}

export const MultiIdeDashboard: React.FC<MultiIdeDashboardProps> = ({
  agents,
  handleAddAgent,
  handleRemoveAgent,
  handleUpdateAgent,
  orchestrationMode,
  setOrchestrationMode,
  downloadedModels,
  orchestratorPrompt,
  setOrchestratorPrompt,
  isOrchestrating,
  handleOrchestrate,
  handleAutoGenAgents,
  blackboardLogs,
  artifacts,
  activeArtifact,
  setActiveArtifact,
  dirHandle,
  mcpConnected,
  handleWriteArtifactToWorkspace,
  highlightCode,
  handleMountDirectory,
  customSkills,
  premadeSkills,
  unifiedMemory,
  setUnifiedMemory
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Main Controls Header */}
      <div className="glass-card bg-[#18191B] p-5 border border-[#2A2D30]">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          <div className="space-y-1 w-full lg:max-w-xl">
            <span className="text-[10px] bg-[#3C6B4D]/10 text-emerald-500 border border-[#3C6B4D]/20 px-2 py-0.5 rounded-full font-bold uppercase">Multi-Agent Pipeline</span>
            <h3 className="text-sm font-bold text-[#ECEBE9] mt-1">Multi-IDE Execution strategy</h3>
            <p className="text-xs text-[#A3A09B]">Collaborate sequential or parallel code builders with distinct sandboxed workspace terminals.</p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {mcpConnected ? (
                <div className="flex items-center gap-1.5 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Workspace Connected: Local MCP (Host filesystem auto-mounted)</span>
                </div>
              ) : dirHandle ? (
                <div className="flex items-center gap-1.5 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Workspace Mounted: {dirHandle.name}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-0.5 rounded-full font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                    <span>No Workspace Connected (Writes disabled)</span>
                  </div>
                  <button
                    onClick={handleMountDirectory}
                    className="p-1 px-2 text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded transition-all font-mono font-bold"
                  >
                    Mount Directory
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 self-end lg:self-center shrink-0">
            <span className="text-xs text-[#72706C] font-semibold">Orchestration mode:</span>
            <div className="bg-[#111213] p-1.5 rounded-xl border border-[#2A2D30] flex gap-1">
              {(['sequential', 'simultaneous', 'hybrid'] as const).map((mode) => (
                <button
                  key={mode}
                  disabled={isOrchestrating}
                  onClick={() => setOrchestrationMode(mode)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                    orchestrationMode === mode
                      ? 'bg-[#3C6B4D] text-white'
                      : 'bg-transparent text-[#72706C] hover:text-[#A3A09B]'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <button
              onClick={handleAddAgent}
              disabled={isOrchestrating}
              className="p-2 px-3 bg-[#111213] border border-[#2A2D30] text-[#A3A09B] hover:text-[#ECEBE9] rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <Plus size={12} />
              <span>Add Agent</span>
            </button>
          </div>
        </div>

        {/* Prompt bar */}
        <div className="mt-4 space-y-2">
          <textarea
            value={orchestratorPrompt}
            onChange={(e) => setOrchestratorPrompt(e.target.value)}
            placeholder="Ask your team to build a responsive site, clean data tables, or analyze python algorithms..."
            className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl p-3 font-mono text-xs text-[#ECEBE9] resize-none h-16 leading-relaxed focus:outline-none focus:border-[#3C6B4D]"
          />
          <div className="flex justify-between items-center">
            <button
              onClick={handleAutoGenAgents}
              disabled={isOrchestrating || !orchestratorPrompt.trim()}
              className="px-3 py-1.5 bg-[#111213] hover:bg-[#1E2022] text-[#A3A09B] hover:text-[#ECEBE9] border border-[#2A2D30] rounded-xl transition-all flex items-center gap-1.5 font-bold text-xs"
            >
              <Sparkles size={12} className="text-amber-400" />
              <span>Optimize Workspace Roles</span>
            </button>
            <button
              onClick={handleOrchestrate}
              disabled={isOrchestrating || !orchestratorPrompt.trim()}
              className="px-4 py-1.5 bg-[#3C6B4D] hover:bg-[#2E533B] text-white rounded-xl transition-colors flex items-center gap-1.5 font-bold text-xs"
            >
              <Play size={12} className={isOrchestrating ? 'animate-spin' : ''} />
              <span>Orchestrate Team</span>
            </button>
          </div>
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
            {/* Agent Header (Inline Editable) */}
            <div className="flex justify-between items-start pb-2.5 border-b border-[#2A2D30] gap-2">
              <div className="space-y-1 w-full text-left">
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${agent.isExecuting ? 'bg-emerald-500 animate-pulse' : 'bg-[#72706C]'}`} />
                  <input
                    type="text"
                    value={agent.name}
                    onChange={(e) => handleUpdateAgent(agent.id, 'name', e.target.value)}
                    className="bg-transparent border-b border-transparent hover:border-[#2A2D30] focus:border-[#3C6B4D] text-xs font-bold text-[#ECEBE9] px-1 focus:outline-none w-full"
                    placeholder="Agent Name"
                  />
                </div>
                <input
                  type="text"
                  value={agent.role}
                  onChange={(e) => handleUpdateAgent(agent.id, 'role', e.target.value)}
                  className="bg-transparent border-b border-transparent hover:border-[#2A2D30] focus:border-[#3C6B4D] text-[10px] text-[#A3A09B] px-1 focus:outline-none w-full font-semibold"
                  placeholder="Agent Role / Responsibility"
                />
              </div>
              <button
                onClick={() => handleRemoveAgent(agent.id)}
                className="text-[#72706C] hover:text-rose-500 text-[10px] shrink-0 p-1"
                title="Remove Agent"
              >
                ✕
              </button>
            </div>

            {/* Agent Config HUD */}
            <div className="py-2.5 grid grid-cols-2 gap-2 border-b border-[#2A2D30]/60 text-left">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-[#72706C] block">Model</label>
                <select
                  value={agent.model}
                  onChange={(e) => handleUpdateAgent(agent.id, 'model', e.target.value)}
                  className="w-full bg-[#111213] border border-[#2A2D30] rounded-md text-[10px] text-[#ECEBE9] px-1 py-0.5 focus:outline-none"
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

            {/* Prompt Template & Attached Skill */}
            <div className="py-2.5 border-b border-[#2A2D30]/60 grid grid-cols-1 gap-2 text-left">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-[#72706C] block">Attached Skill (Optional)</label>
                <select
                  value={agent.attachedSkillId || ''}
                  onChange={(e) => handleUpdateAgent(agent.id, 'attachedSkillId', e.target.value)}
                  className="w-full bg-[#111213] border border-[#2A2D30] rounded-md text-[10px] text-[#ECEBE9] px-1.5 py-0.5 focus:outline-none"
                >
                  <option value="">None / Default</option>
                  <optgroup label="Pre-made Skills">
                    {premadeSkills.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                  </optgroup>
                  <optgroup label="Custom Library">
                    {customSkills.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                  </optgroup>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-[#72706C] block">Prompt Template</label>
                <textarea
                  value={agent.promptTemplate}
                  onChange={(e) => handleUpdateAgent(agent.id, 'promptTemplate', e.target.value)}
                  rows={2}
                  className="w-full bg-[#111213] border border-[#2A2D30] rounded-md text-[10px] text-[#ECEBE9] px-2 py-1 focus:outline-none focus:border-[#3C6B4D] resize-none leading-relaxed font-mono"
                  placeholder="System instruction prompt for this agent..."
                />
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
      </div>      {/* Blackboard, Unified Memory, and Artifact outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Unified Memory Panel */}
        <div className="lg:col-span-4 glass-card bg-[#18191B] p-4 flex flex-col justify-between min-h-[300px]">
          <div className="pb-2 border-b border-[#2A2D30] flex justify-between items-center">
            <h4 className="text-xs font-bold text-[#ECEBE9]">Unified Memory</h4>
            <span className="text-[8px] bg-[#3C6B4D]/10 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase">Shared Team Context</span>
          </div>
          <div className="flex-1 flex flex-col gap-2 mt-3 text-left">
            <label className="text-[9px] uppercase font-bold text-[#72706C] block">Write facts/context to keep in memory:</label>
            <textarea
              value={unifiedMemory}
              onChange={(e) => setUnifiedMemory(e.target.value)}
              placeholder="e.g. Target frameworks, design tokens, staging DB hosts, credentials to mock, or specific code formatting guidelines that all agents will remember."
              className="flex-1 w-full bg-[#111213] border border-[#2A2D30] rounded-xl p-3 font-mono text-[10px] text-[#ECEBE9] resize-none h-60 focus:outline-none focus:border-[#3C6B4D] leading-relaxed"
            />
          </div>
        </div>

        {/* Blackboard Logs Panel */}
        <div className="lg:col-span-5 glass-card bg-[#18191B] p-4 flex flex-col justify-between min-h-[300px]">
          <h4 className="text-xs font-bold text-[#ECEBE9] pb-2 border-b border-[#2A2D30] text-left">Pipeline Conversation Board</h4>
          <div className="bg-[#0A0B0C] border border-[#2A2D30] rounded-xl p-3 h-60 overflow-y-auto font-mono text-[10px] space-y-3 mt-3">
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

        {/* Generated Artifacts Panel */}
        <div className="lg:col-span-3 glass-card bg-[#18191B] p-4 flex flex-col justify-between min-h-[300px]">
          <h4 className="text-xs font-bold text-[#ECEBE9] pb-2 border-b border-[#2A2D30] text-left">Generated Artifacts</h4>
          <div className="flex-1 flex flex-col gap-3 mt-3">
            <div className="flex flex-col gap-1.5 max-h-24 overflow-y-auto">
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
                  
                  <div className="flex-1 overflow-auto max-h-[80px] font-mono text-[9px] text-[#A3A09B] bg-[#0A0B0C] p-2 rounded border border-[#2A2D30] my-1">
                    <pre dangerouslySetInnerHTML={{ __html: highlightCode(activeArtifact.content) }} />
                  </div>
 
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleWriteArtifactToWorkspace(activeArtifact)}
                      disabled={!dirHandle && !mcpConnected}
                      className="flex-1 py-1 bg-[#3C6B4D] hover:bg-[#2E533B] text-white text-[10px] font-bold rounded-lg disabled:opacity-40"
                    >
                      Write to Workspace
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(activeArtifact.content);
                        alert('Copied!');
                      }}
                      className="px-2 bg-[#18191B] border border-[#2A2D30] text-[#A3A09B] text-[10px] rounded-lg"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ) : (
                <span className="text-[10px] text-[#72706C] italic text-center block my-10">Select an artifact to preview.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
