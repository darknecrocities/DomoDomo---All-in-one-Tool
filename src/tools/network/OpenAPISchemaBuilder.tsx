import React, { useState, useEffect } from 'react';
import { Terminal, Cpu, Sparkles, RefreshCw, Copy, Check, Download } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { parseMarkdown } from '../../utils/markdownParser';

export const OpenAPISchemaBuilderTool: React.FC = () => {
  const [apiTitle, setApiTitle] = useState('DomoDomo Local API Service');
  const [apiVersion, setApiVersion] = useState('1.0.0');
  const [endpointPath, setEndpointPath] = useState('/v1/tools');
  const [httpMethod, setHttpMethod] = useState<'get' | 'post' | 'put' | 'delete'>('get');

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

  const openApiSpecObj = {
    openapi: '3.0.3',
    info: {
      title: apiTitle,
      version: apiVersion,
      description: 'OpenAPI 3.0 specification generated client-side by DomoDomo Studio.',
    },
    paths: {
      [endpointPath]: {
        [httpMethod]: {
          summary: `Execute ${httpMethod.toUpperCase()} ${endpointPath}`,
          responses: {
            '200': {
              description: 'Successful Response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      timestamp: { type: 'string', example: '2026-07-27T14:30:00Z' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  const formattedSpec = JSON.stringify(openApiSpecObj, null, 2);

  const copySpec = () => {
    navigator.clipboard.writeText(formattedSpec);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSpec = () => {
    const blob = new Blob([formattedSpec], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = 'openapi_3_0_spec.json';
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRunAiOpenApiArchitect = async () => {
    if (!selectedModel) return;
    setIsGenerating(true);
    setError(null);

    const systemPrompt = `You are a Principal API Schema Architect & OpenAPI 3.0/3.1 Design Specialist.
API Title: ${apiTitle}, Endpoint: ${endpointPath} (${httpMethod.toUpperCase()}).
Provide full OpenAPI YAML specification, TypeScript DTO type definitions, and Swagger UI integration setup.`;

    try {
      const response = await aiService.generateTextOllama(selectedModel, `Synthesize complete OpenAPI 3.0 YAML spec for ${apiTitle} endpoint ${endpointPath}`, 2048, systemPrompt);
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
              <h3 className="font-bold text-[#ECEBE9] text-xl">AI OpenAPI 3.0 & Swagger Schema Studio</h3>
              <p className="text-[#A3A09B] text-xs mt-1">
                Construct OpenAPI 3.0 JSON/YAML specifications, generate TypeScript API response contracts, export Swagger schemas, and prompt Local AI.
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
        {/* Input Parameters */}
        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-4 text-left">
          <h4 className="text-sm font-semibold text-[#ECEBE9]">API Meta & Endpoint Configuration</h4>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#A3A09B]">API Title</label>
            <input
              type="text"
              value={apiTitle}
              onChange={(e) => setApiTitle(e.target.value)}
              className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-2.5 rounded-lg font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-[#A3A09B]">API Version</label>
              <input
                type="text"
                value={apiVersion}
                onChange={(e) => setApiVersion(e.target.value)}
                className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-2.5 rounded-lg font-mono"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-[#A3A09B]">HTTP Method</label>
              <select
                value={httpMethod}
                onChange={(e) => setHttpMethod(e.target.value as any)}
                className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-2.5 rounded-lg font-mono uppercase cursor-pointer"
              >
                <option value="get">GET</option>
                <option value="post">POST</option>
                <option value="put">PUT</option>
                <option value="delete">DELETE</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#A3A09B]">Endpoint Path Route</label>
            <input
              type="text"
              value={endpointPath}
              onChange={(e) => setEndpointPath(e.target.value)}
              className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-2.5 rounded-lg font-mono"
            />
          </div>
        </div>

        {/* Viewport Output Spec */}
        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col justify-between text-left">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-[#ECEBE9]">Generated OpenAPI 3.0 Specification</h4>
              <div className="flex items-center gap-2">
                <button onClick={copySpec} className="text-xs text-[#3C6B4D] hover:underline font-semibold flex items-center gap-1 cursor-pointer">
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy Spec'}
                </button>
                <button onClick={handleDownloadSpec} className="text-xs text-[#3C6B4D] hover:underline font-semibold flex items-center gap-1 cursor-pointer">
                  <Download size={12} />
                  Download
                </button>
              </div>
            </div>

            <pre className="bg-[#111213] p-4 rounded-xl border border-[#2A2D30] font-mono text-xs text-[#ECEBE9] overflow-x-auto min-h-[220px]">
              {formattedSpec}
            </pre>
          </div>
        </div>
      </div>

      {/* Local AI Advisor */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#3C6B4D]">
            <Sparkles size={18} />
            <h4 className="font-bold text-[#ECEBE9] text-sm">Local AI OpenAPI Schema Architect</h4>
          </div>
          <button
            onClick={handleRunAiOpenApiArchitect}
            disabled={isGenerating || !selectedModel}
            className="flex items-center gap-2 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
          >
            {isGenerating ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
            {isGenerating ? 'Synthesizing Spec...' : 'Run Local AI Schema Architect'}
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
