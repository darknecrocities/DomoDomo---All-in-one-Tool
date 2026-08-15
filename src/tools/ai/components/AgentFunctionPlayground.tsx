import React, { useState } from 'react';
import { Zap, Play } from 'lucide-react';

interface FunctionTool {
  name: string;
  description: string;
  parameters: string;
}

interface AgentFunctionPlaygroundProps {
  selectedModel?: string;
  models?: string[];
}

export const AgentFunctionPlayground: React.FC<AgentFunctionPlaygroundProps> = () => {
  const [tools] = useState<FunctionTool[]>([
    {
      name: 'get_weather',
      description: 'Fetch real-time temperature and weather conditions for a city.',
      parameters: JSON.stringify({ type: 'object', properties: { location: { type: 'string' } }, required: ['location'] }),
    },
    {
      name: 'calculate_expression',
      description: 'Evaluate a mathematical string expression in JS sandbox.',
      parameters: JSON.stringify({ type: 'object', properties: { expression: { type: 'string' } }, required: ['expression'] }),
    },
  ]);

  const [userPrompt, setUserPrompt] = useState<string>('What is the weather in Tokyo and what is 144 divided by 12?');
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  const runFunctionCallingTest = async () => {
    setIsExecuting(true);
    setExecutionLogs([]);

    const addLog = (msg: string) => setExecutionLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

    addLog(`Sending prompt to model: "${userPrompt}"`);
    addLog(`Attached ${tools.length} function tools: ${tools.map((t) => t.name).join(', ')}`);
    await new Promise((resolve) => setTimeout(resolve, 800));

    addLog(`Model output tool call request -> get_weather({"location": "Tokyo"})`);
    await new Promise((resolve) => setTimeout(resolve, 600));

    addLog(`Sandboxed Function Executed: get_weather -> Result: {"temperature": "22°C", "condition": "Sunny"}`);
    await new Promise((resolve) => setTimeout(resolve, 600));

    addLog(`Model output tool call request -> calculate_expression({"expression": "144 / 12"})`);
    addLog(`Sandboxed Function Executed: calculate_expression -> Result: 12`);
    await new Promise((resolve) => setTimeout(resolve, 600));

    addLog(`Final Model Response: "The weather in Tokyo is 22°C and Sunny. 144 divided by 12 equals 12."`);
    setIsExecuting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-[#ECEBE9] flex items-center gap-2">
            <Zap className="text-[#3C6B4D]" size={20} /> AI Tool &amp; Function Calling Playground
          </h2>
          <p className="text-xs text-[#72706C]">
            Define custom agent function definitions and inspect RPC execution trace logs.
          </p>
        </div>
        <button
          onClick={runFunctionCallingTest}
          disabled={isExecuting}
          className="px-4 py-2 bg-[#3C6B4D] hover:bg-[#2E533B] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-[#3C6B4D]/20"
        >
          <Play size={14} />
          <span>{isExecuting ? 'Simulating Call...' : 'Test Function Tool Call'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tool Schemas & Input */}
        <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-3">
          <label className="text-xs font-bold text-[#72706C] uppercase">User Prompt</label>
          <textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            rows={2}
            className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D] resize-none"
          />

          <label className="text-xs font-bold text-[#72706C] uppercase block pt-2">Registered Tool Definitions</label>
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-none">
            {tools.map((t) => (
              <div key={t.name} className="bg-[#111213] border border-[#2A2D30] p-3 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#3C6B4D] font-mono">{t.name}()</span>
                  <span className="text-[10px] text-[#72706C]">JSON Schema</span>
                </div>
                <p className="text-[11px] text-[#A3A09B]">{t.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trace Logger */}
        <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-2">
          <label className="text-xs font-bold text-[#72706C] uppercase">Execution Trace Log</label>
          <div className="w-full min-h-[300px] bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] font-mono space-y-1 overflow-x-auto">
            {executionLogs.length > 0 ? (
              executionLogs.map((log, idx) => (
                <div key={idx} className={log.includes('Result') ? 'text-emerald-400 font-bold' : 'text-[#ECEBE9]'}>
                  {log}
                </div>
              ))
            ) : (
              <span className="text-[#72706C]">// Click "Test Function Tool Call" to view sandbox RPC trace log.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
