import React, { useState } from 'react';
import { Bot, Zap, Code, Play, Terminal, Plus, Trash2 } from 'lucide-react';

interface DefinedTool {
  name: string;
  description: string;
  parameters: Record<string, string>;
}

export const FunctionCallingStudio: React.FC = () => {
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
          action: `LLM Matched Function Tool: "${matchedTool.name}"`,
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
          content: `Function call completed successfully. Return value from ${matchedTool.name}: ${
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
      {/* Header */}
      <div className="bg-[#18191B] border border-[#2A2D30] p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#3C6B4D]/15 text-[#3C6B4D] text-[10px] font-bold uppercase tracking-wider mb-1">
            <Zap size={12} />
            <span>Agentic Function Calling &amp; Tool Loop</span>
          </div>
          <h2 className="text-lg font-extrabold text-[#ECEBE9]">Function Calling Studio</h2>
          <p className="text-[#72706C] text-xs mt-0.5">Define JSON tool schemas, simulate multi-step LLM function calls, and inspect execution traces.</p>
        </div>
        <button
          onClick={handleSimulateFunctionCall}
          disabled={isSimulating || !userPrompt.trim()}
          className="px-4 py-2 bg-[#3C6B4D] hover:bg-[#2E533B] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shrink-0 shadow-md shadow-[#3C6B4D]/20"
        >
          <Play size={14} className={isSimulating ? 'animate-spin' : ''} />
          <span>{isSimulating ? 'Simulating Loop...' : 'Test Function Calling Loop'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Defined Tools Schema List */}
        <div className="lg:col-span-5 bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-[#2A2D30] pb-2">
            <span className="text-xs font-extrabold text-[#ECEBE9] flex items-center gap-2">
              <Code size={14} className="text-[#3C6B4D]" /> Registered Agent Tools ({toolsList.length})
            </span>
            <button
              onClick={() => setShowAddForm(prev => !prev)}
              className="px-2.5 py-1 bg-[#3C6B4D]/15 border border-[#3C6B4D]/40 text-[#3C6B4D] hover:bg-[#3C6B4D]/25 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
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
              <button
                onClick={handleAddTool}
                className="w-full py-1 bg-[#3C6B4D] hover:bg-[#2E533B] text-white text-xs font-bold rounded-lg transition-all"
              >
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
                <div className="text-[10px] font-mono text-[#72706C] bg-[#18191B] p-2 rounded border border-[#2A2D30]">
                  Params: {JSON.stringify(tool.parameters)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prompt Input & Execution Trace */}
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
              placeholder="Describe a task requiring tool calls..."
            />
          </div>

          {/* Execution Trace Timeline */}
          {executionTrace && (
            <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-3">
              <span className="text-xs font-extrabold text-[#ECEBE9] flex items-center gap-2 border-b border-[#2A2D30] pb-2">
                <Terminal size={14} className="text-[#3C6B4D]" /> Function Calling Execution Step Trace
              </span>

              <div className="space-y-3">
                {executionTrace.map(step => (
                  <div key={step.step} className="bg-[#111213] border border-[#2A2D30] p-3 rounded-xl space-y-1.5 font-mono text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#3C6B4D] font-bold">STEP {step.step}: {step.action}</span>
                      <span className="text-[10px] bg-[#3C6B4D]/20 text-[#3C6B4D] px-2 py-0.5 rounded font-mono uppercase">{step.status}</span>
                    </div>
                    {step.tool && <div className="text-[11px] text-emerald-400">Tool: {step.tool}</div>}
                    {step.args && <div className="text-[10px] text-[#A3A09B]">Args: {JSON.stringify(step.args)}</div>}
                    {step.result && <div className="text-[10px] text-amber-300">Return: {JSON.stringify(step.result)}</div>}
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
