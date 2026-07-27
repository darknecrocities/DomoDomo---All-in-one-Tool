import React, { useState, useEffect } from 'react';
import { Terminal, Cpu, Sparkles, RefreshCw, Copy, Check } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { parseMarkdown } from '../../utils/markdownParser';

export const GraphQLQueryStudioTool: React.FC = () => {
  const [queryInput, setQueryInput] = useState(`query GetUserProfile($userId: ID!) {
  user(id: $userId) {
    id
    name
    email
    orders(first: 5) {
      id
      totalAmount
      createdAt
    }
  }
}`);
  const [variablesInput, setVariablesInput] = useState('{\n  "userId": "usr_99182"\n}');
  const [copied, setCopied] = useState(false);

  // Local AI State
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      const { status, models } = await aiService.checkOllama();
      if (status && models.length > 0) {
        setModels(models);
        const saved = aiService.getSelectedOllamaModel();
        if (saved && models.includes(saved)) {
          setSelectedModel(saved);
        } else {
          setSelectedModel(models[0]);
        }
      }
    };
    fetchModels();
  }, []);

  const depth = (queryInput.match(/\{/g) || []).length;
  const fieldCount = (queryInput.match(/[a-zA-Z0-9_]+\s*\{/g) || []).length + 3;

  const copyQuery = () => {
    navigator.clipboard.writeText(queryInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunAiGqlOptimizer = async () => {
    if (!selectedModel) return;
    setIsGenerating(true);
    setError(null);

    const systemPrompt = `You are a Principal GraphQL Architect & Query Complexity Auditor.
GraphQL Query Input:
${queryInput}

Provide an architectural audit:
1. Query depth and N+1 query problem risk analysis.
2. Query complexity score calculation and rate limiting advice.
3. TypeScript type generation snippet for the response payload.
Format with clean markdown tables and code blocks.`;

    try {
      const response = await aiService.generateTextOllama(selectedModel, `Optimize GraphQL query and calculate complexity cost`, 2048, systemPrompt);
      setAiOutput(response);
    } catch (err: any) {
      setError(err.message || 'Failed to query local AI model.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] flex flex-col gap-4 text-left rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/20 p-2.5 rounded-xl">
              <Terminal size={24} />
            </div>
            <div>
              <h3 className="font-bold text-[#ECEBE9] text-xl">AI GraphQL Schema & Query Optimizer</h3>
              <p className="text-[#A3A09B] text-xs mt-1">
                Format GraphQL queries, evaluate nested field depth complexity, generate TypeScript response types, and prompt Local AI.
              </p>
            </div>
          </div>
          {models.length > 0 && (
            <div className="flex items-center gap-2 bg-[#111213] p-2 rounded-xl border border-[#2A2D30]">
              <Cpu size={16} className="text-[#3C6B4D]" />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-transparent text-xs text-[#ECEBE9] focus:outline-none cursor-pointer"
              >
                {models.map((m) => (
                  <option key={m} value={m} className="bg-[#18191B] text-[#ECEBE9]">
                    {m}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Query */}
        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-4 text-left">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-[#ECEBE9]">GraphQL Query Document</h4>
            <button onClick={copyQuery} className="text-xs text-[#3C6B4D] hover:underline font-semibold flex items-center gap-1 cursor-pointer">
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy Query'}
            </button>
          </div>

          <textarea
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            rows={10}
            className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-3.5 rounded-xl font-mono resize-none focus:outline-none focus:border-[#3C6B4D]"
          />
        </div>

        {/* Variables & Metrics */}
        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col justify-between text-left">
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-[#ECEBE9]">Query Variables (JSON)</h4>
            <textarea
              value={variablesInput}
              onChange={(e) => setVariablesInput(e.target.value)}
              rows={5}
              className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-3.5 rounded-xl font-mono resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#2A2D30]">
            <div className="bg-[#111213] p-3 rounded-xl border border-[#2A2D30]">
              <p className="text-[10px] text-[#A3A09B]">Selection Depth</p>
              <p className="text-sm font-bold text-[#3C6B4D] font-mono mt-1">{depth} Levels</p>
            </div>
            <div className="bg-[#111213] p-3 rounded-xl border border-[#2A2D30]">
              <p className="text-[10px] text-[#A3A09B]">Est. Complexity</p>
              <p className="text-sm font-bold text-[#ECEBE9] font-mono mt-1">Cost: {fieldCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Local AI Advisor */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#3C6B4D]">
            <Sparkles size={18} />
            <h4 className="font-bold text-[#ECEBE9] text-sm">Local AI GraphQL Query Optimizer</h4>
          </div>
          <button
            onClick={handleRunAiGqlOptimizer}
            disabled={isGenerating || !selectedModel}
            className="flex items-center gap-2 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
          >
            {isGenerating ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
            {isGenerating ? 'Optimizing Query...' : 'Run Query Complexity Optimizer'}
          </button>
        </div>

        {error && <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">{error}</div>}

        {aiOutput && (
          <div
            className="bg-[#111213] p-5 rounded-xl border border-[#2A2D30] text-[#ECEBE9] text-xs leading-relaxed overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(aiOutput) }}
          />
        )}
      </div>
    </div>
  );
};
