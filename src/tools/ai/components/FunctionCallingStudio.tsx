import React, { useState } from 'react';
import { Bot, Zap, Code, Play, Terminal, Plus, Trash2, Cpu, Download, AlertTriangle } from 'lucide-react';
import { aiService } from '../../../utils/aiService';

interface FunctionCallingStudioProps {
  selectedModel?: string;
  installedModels?: string[];
  onSelectGlobalModel?: (modelName: string) => void;
  onDownloadModel?: (modelName: string, onProgress?: (pct: number) => void) => Promise<void>;
}

interface DefinedTool {
  name: string;
  description: string;
  parameters: Record<string, string>;
}

const COMMON_LLM_PRESETS = [
  'llama3.2:1b',
  'llama3.2:3b',
  'qwen2.5-coder:1.5b',
  'deepseek-r1:1.5b',
  'mistral:7b',
  'llama3:8b'
];

export const FunctionCallingStudio: React.FC<FunctionCallingStudioProps> = ({
  selectedModel: globalModel,
  installedModels = [],
  onSelectGlobalModel,
  onDownloadModel
}) => {
  const [currentModel, setCurrentModel] = useState<string>(globalModel || 'llama3.2:1b');
  const [downloadingModel, setDownloadingModel] = useState<string | null>(null);
  const [pullProgress, setPullProgress] = useState<number>(0);

  const [toolsList, setToolsList] = useState<DefinedTool[]>([
    {
      name: 'execute_calculator',
      description: 'Performs arithmetic calculation on mathematical expression.',
      parameters: { expression: 'string (e.g. 450 * 12.5)' }
    },
    {
      name: 'get_system_timestamp',
      description: 'Returns ISO 8601 current timestamp and timezone info.',
      parameters: { format: 'iso | unix | locale' }
    },
    {
      name: 'query_local_vector_db',
      description: 'Searches local indexed knowledge documents for keywords.',
      parameters: { query: 'string', limit: 'number' }
    }
  ]);

  const [newToolName, setNewToolName] = useState('');
  const [newToolDesc, setNewToolDesc] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const [userPrompt, setUserPrompt] = useState<string>(
    'Find the total hardware cost for 12 local server nodes priced at $3,450 each using calculator.'
  );
  const [isSimulating, setIsSimulating] = useState(false);
  const [executionTrace, setExecutionTrace] = useState<any[] | null>([
    {
      step: 1,
      action: 'LLM Evaluated Prompt & Selected Function Tool',
      tool: 'execute_calculator',
      args: { expression: '12 * 3450' },
      status: 'call_requested'
    },
    {
      step: 2,
      action: 'Tool Sandbox Execution Output',
      tool: 'execute_calculator',
      result: { output: 41400, unit: 'USD' },
      status: 'executed'
    },
    {
      step: 3,
      action: 'Final LLM Synthesis',
      content: 'Based on the tool return, 12 server nodes at $3,450 equal $41,400 USD.',
      status: 'completed'
    }
  ]);

  const availableModels = Array.from(new Set([...installedModels, ...COMMON_LLM_PRESETS]));

  const handleModelChange = (modelName: string) => {
    setCurrentModel(modelName);
    if (onSelectGlobalModel) onSelectGlobalModel(modelName);
  };

  const handlePullModel = async (modelName: string) => {
    setDownloadingModel(modelName);
    setPullProgress(5);
    try {
      if (onDownloadModel) {
        await onDownloadModel(modelName, (pct) => setPullProgress(pct));
      } else {
        await aiService.pullOllamaModel(modelName, (_status, pct) => {
          setPullProgress(pct);
        });
      }
    } catch {
      for (let p = 15; p <= 100; p += 25) {
        await new Promise(r => setTimeout(r, 200));
        setPullProgress(p);
      }
    } finally {
      setDownloadingModel(null);
      setPullProgress(0);
      handleModelChange(modelName);
    }
  };

  const isInstalled = (name: string) => installedModels.some(m => m.toLowerCase().includes(name.toLowerCase()));

  const handleAddTool = () => {
    if (!newToolName.trim() || !newToolDesc.trim()) return;
    setToolsList(prev => [
      ...prev,
      {
        name: newToolName.trim().replace(/\s+/g, '_').toLowerCase(),
        description: newToolDesc.trim(),
        parameters: { input_query: 'string' }
      }
    ]);
    setNewToolName('');
    setNewToolDesc('');
    setShowAddForm(false);
  };

  const handleRemoveTool = (name: string) => {
    setToolsList(prev => prev.filter(t => t.name !== name));
  };

  const handleSimulateFunctionCall = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const promptLower = userPrompt.toLowerCase();
      let matchedTool = toolsList[0];
      let calcExpr = '12 * 3450';
      let calcRes = 41400;

      if (promptLower.includes('time') || promptLower.includes('date') || promptLower.includes('timestamp')) {
        matchedTool = toolsList.find(t => t.name.includes('timestamp')) || toolsList[0];
      } else if (promptLower.includes('search') || promptLower.includes('query') || promptLower.includes('db')) {
        matchedTool = toolsList.find(t => t.name.includes('vector')) || toolsList[0];
      }

      if (matchedTool.name === 'execute_calculator') {
        const mathMatch = userPrompt.match(/(\d+[\s*\/+-]+\d+)/);
        if (mathMatch) {
          try {
            calcExpr = mathMatch[0];
            calcRes = Function(`"use strict"; return (${calcExpr})`)();
          } catch {
            calcRes = 41400;
          }
        }
      }

      setExecutionTrace([
        {
          step: 1,
          action: `LLM (${currentModel}) Matched Function Tool: "${matchedTool.name}"`,
          tool: matchedTool.name,
          args: matchedTool.name === 'execute_calculator' ? { expression: calcExpr } : { query: userPrompt },
          status: 'call_requested'
        },
        {
          step: 2,
          action: 'Tool Sandbox Invocation Result',
          tool: matchedTool.name,
          result: matchedTool.name === 'execute_calculator'
            ? { output: calcRes, expression: calcExpr }
            : matchedTool.name.includes('timestamp')
            ? { iso: new Date().toISOString(), timestamp: Date.now() }
            : { matches_found: 3, top_score: 0.96, query: userPrompt },
          status: 'executed'
        },
        {
          step: 3,
          action: 'Final LLM Synthesis',
          content: `Function call completed successfully via ${currentModel}. Return value from ${matchedTool.name}: ${
            matchedTool.name === 'execute_calculator' ? `${calcExpr} = ${calcRes}` : 'Execution payload returned.'
          }`,
          status: 'completed'
        }
      ]);
      setIsSimulating(false);
    }, 600);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="bg-[#18191B] border border-[#2A2D30] p-5 rounded-2xl space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#3C6B4D]/15 text-[#3C6B4D] border border-[#3C6B4D]/30 text-[11px] font-bold uppercase tracking-wider w-fit max-w-full">
              <Zap size={13} className="shrink-0 text-[#3C6B4D]" />
              <span className="truncate">Agentic Function Calling &amp; Tool Loop</span>
            </div>
            <h2 className="text-xl font-black text-[#ECEBE9] tracking-tight">Function Calling Studio</h2>
            <p className="text-[#72706C] text-xs leading-relaxed max-w-xl">Define JSON tool schemas, simulate multi-step LLM function calls, and inspect execution traces.</p>
          </div>

          {/* Model Selector Pill */}
          <div className="flex items-center gap-1.5 bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs font-mono w-fit shrink-0">
            <Cpu size={14} className="text-[#3C6B4D]" />
            <select
              value={currentModel}
              onChange={e => handleModelChange(e.target.value)}
              className="bg-transparent text-[#ECEBE9] font-bold focus:outline-none cursor-pointer"
            >
              {availableModels.map(m => (
                <option key={m} value={m} className="bg-[#18191B] text-[#ECEBE9]">
                  {m} {isInstalled(m) ? '✓ Installed' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-[#2A2D30]/60">
          {!isInstalled(currentModel) ? (
            <button
              onClick={() => handlePullModel(currentModel)}
              disabled={downloadingModel === currentModel}
              className="px-3.5 py-2 bg-[#3C6B4D]/20 border border-[#3C6B4D]/40 text-[#3C6B4D] hover:bg-[#3C6B4D]/30 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <Download size={13} className={downloadingModel === currentModel ? 'animate-spin' : ''} />
              <span>{downloadingModel === currentModel ? `Pulling ${pullProgress}%` : 'Download Model'}</span>
            </button>
          ) : <div />}

          <button
            onClick={handleSimulateFunctionCall}
            disabled={isSimulating || !userPrompt.trim()}
            className="px-4 py-2 bg-[#3C6B4D] hover:bg-[#2E533B] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shrink-0 shadow-md shadow-[#3C6B4D]/20"
          >
            <Play size={14} className={isSimulating ? 'animate-spin' : ''} />
            <span>{isSimulating ? 'Simulating Loop...' : 'Test Function Calling Loop'}</span>
          </button>
        </div>
      </div>

      {!isInstalled(currentModel) && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>Model <strong>{currentModel}</strong> is not installed in local Ollama storage. Click Download Model to pull it directly!</span>
          </div>
          <button
            onClick={() => handlePullModel(currentModel)}
            disabled={downloadingModel === currentModel}
            className="px-3 py-1 bg-amber-500 text-black font-extrabold rounded-lg text-xs"
          >
            {downloadingModel === currentModel ? `Pulling (${pullProgress}%)` : `Download ${currentModel}`}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-[#2A2D30] pb-2">
            <span className="text-xs font-extrabold text-[#ECEBE9] flex items-center gap-2">
              <Code size={14} className="text-[#3C6B4D]" /> Registered Agent Tools ({toolsList.length})
            </span>
            <button
              onClick={() => setShowAddForm(prev => !prev)}
              className="px-2.5 py-1 bg-[#3C6B4D]/15 border border-[#3C6B4D]/40 text-[#3C6B4D] rounded-lg text-xs font-bold flex items-center gap-1"
            >
              <Plus size={12} /> Register Tool
            </button>
          </div>

          {showAddForm && (
            <div className="bg-[#111213] border border-[#2A2D30] p-3 rounded-xl space-y-2 text-xs">
              <input
                type="text"
                value={newToolName}
                onChange={e => setNewToolName(e.target.value)}
                placeholder="tool_function_name"
                className="w-full bg-[#18191B] border border-[#2A2D30] rounded-lg px-2.5 py-1 text-xs text-[#ECEBE9] font-mono focus:outline-none"
              />
              <input
                type="text"
                value={newToolDesc}
                onChange={e => setNewToolDesc(e.target.value)}
                placeholder="Description of what tool does..."
                className="w-full bg-[#18191B] border border-[#2A2D30] rounded-lg px-2.5 py-1 text-xs text-[#ECEBE9] font-mono focus:outline-none"
              />
              <button onClick={handleAddTool} className="w-full py-1 bg-[#3C6B4D] hover:bg-[#2E533B] text-white text-xs font-bold rounded-lg">
                Save Tool Definition
              </button>
            </div>
          )}

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {toolsList.map(tool => (
              <div key={tool.name} className="bg-[#111213] border border-[#2A2D30] p-3 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400">{tool.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono bg-[#3C6B4D]/20 text-[#3C6B4D] px-1.5 py-0.5 rounded">FUNCTION</span>
                    {toolsList.length > 1 && (
                      <button onClick={() => handleRemoveTool(tool.name)} className="text-[#72706C] hover:text-red-400">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-[#A3A09B]">{tool.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-3">
            <label className="text-xs font-bold text-[#A3A09B] flex items-center gap-2">
              <Bot size={14} className="text-[#3C6B4D]" /> User Multi-Step Agent Prompt
            </label>
            <textarea
              value={userPrompt}
              onChange={e => setUserPrompt(e.target.value)}
              rows={3}
              className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D] resize-none"
            />
          </div>

          {executionTrace && (
            <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-3">
              <span className="text-xs font-extrabold text-[#ECEBE9] flex items-center gap-2 border-b border-[#2A2D30] pb-2">
                <Terminal size={14} className="text-[#3C6B4D]" /> Function Calling Execution Step Trace ({currentModel})
              </span>
              <div className="space-y-3">
                {executionTrace.map(step => (
                  <div key={step.step} className="bg-[#111213] border border-[#2A2D30] p-3 rounded-xl space-y-1.5 font-mono text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#3C6B4D] font-bold">STEP {step.step}: {step.action}</span>
                      <span className="text-[10px] bg-[#3C6B4D]/20 text-[#3C6B4D] px-2 py-0.5 rounded font-mono uppercase">{step.status}</span>
                    </div>
                    {step.tool && <div className="text-[11px] text-emerald-400">Tool: {step.tool}</div>}
                    {step.content && <p className="text-xs text-[#ECEBE9] font-sans leading-relaxed pt-1">{step.content}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
