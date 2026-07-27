import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cpu, Sparkles, RefreshCw, Copy, Check, Search } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { parseMarkdown } from '../../utils/markdownParser';

interface HttpStatusItem {
  code: number;
  name: string;
  category: '1xx' | '2xx' | '3xx' | '4xx' | '5xx';
  desc: string;
  solution: string;
}

const HTTP_CODES_DB: HttpStatusItem[] = [
  { code: 200, name: 'OK', category: '2xx', desc: 'Standard successful HTTP response.', solution: 'No action required.' },
  { code: 201, name: 'Created', category: '2xx', desc: 'Resource successfully created on server.', solution: 'Return Location header pointing to new URI.' },
  { code: 301, name: 'Moved Permanently', category: '3xx', desc: 'Resource permanently moved to a new URI.', solution: 'Update client bookmarks and use 308 for POST redirects.' },
  { code: 400, name: 'Bad Request', category: '4xx', desc: 'Server cannot process request due to client error.', solution: 'Validate JSON request payload schema and headers.' },
  { code: 401, name: 'Unauthorized', category: '4xx', desc: 'Authentication credentials missing or invalid.', solution: 'Send valid Authorization Bearer token header.' },
  { code: 403, name: 'Forbidden', category: '4xx', desc: 'Server understood request but refuses authorization.', solution: 'Verify user RBAC role permissions.' },
  { code: 404, name: 'Not Found', category: '4xx', desc: 'Requested URI endpoint does not exist.', solution: 'Verify API routing paths and parameters.' },
  { code: 429, name: 'Too Many Requests', category: '4xx', desc: 'Rate limit threshold exceeded.', solution: 'Implement Retry-After backoff headers.' },
  { code: 500, name: 'Internal Server Error', category: '5xx', desc: 'Generic unhandled server crash.', solution: 'Inspect server runtime logs and stack trace.' },
  { code: 502, name: 'Bad Gateway', category: '5xx', desc: 'Upstream server sent invalid response to proxy.', solution: 'Check Nginx backend application service status.' },
  { code: 504, name: 'Gateway Timeout', category: '5xx', desc: 'Upstream server timed out.', solution: 'Optimize slow SQL queries or extend proxy timeout.' },
];

export const HTTPStatusDebuggerTool: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCode, setSelectedCode] = useState<HttpStatusItem>(HTTP_CODES_DB[6]);
  const [corsOrigin, setCorsOrigin] = useState('*');
  const [copied, setCopied] = useState(false);

  // Local AI State
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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

  const filteredCodes = HTTP_CODES_DB.filter(
    (c) => String(c.code).includes(search) || c.name.toLowerCase().includes(search.toLowerCase())
  );

  const expressCorsSnippet = `app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "${corsOrigin}");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});`;

  const copyCors = () => {
    navigator.clipboard.writeText(expressCorsSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunAiCorsAudit = async () => {
    if (!selectedModel) return;
    setIsAnalyzing(true);
    setError(null);

    const systemPrompt = `You are a Principal API Security & HTTP Protocol Debugging Specialist.
Target Status: HTTP ${selectedCode.code} (${selectedCode.name}). CORS Origin: "${corsOrigin}".
Provide CORS preflight request debugging steps and Nginx/Express security header configuration guidance.`;

    try {
      const response = await aiService.generateTextOllama(selectedModel, `Debug HTTP ${selectedCode.code} status and CORS configuration`, 2048, systemPrompt);
      setAiOutput(response);
    } catch (err: any) {
      setError(err.message || 'Failed to query local AI model.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] flex flex-col gap-4 text-left rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/20 p-2.5 rounded-xl">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-bold text-[#ECEBE9] text-xl">AI HTTP Status & CORS Diagnostic Studio</h3>
              <p className="text-[#A3A09B] text-xs mt-1">
                Lookup HTTP 1xx-5xx status codes, debug CORS headers, generate Express/Nginx CORS middleware, and prompt Local AI.
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
        {/* Status Database Selector */}
        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-4 text-left">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-[#A3A09B]" size={14} />
            <input
              type="text"
              placeholder="Search status code (e.g. 404, 500)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs pl-8 pr-3 py-2 rounded-xl"
            />
          </div>

          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
            {filteredCodes.map((item) => (
              <button
                key={item.code}
                onClick={() => setSelectedCode(item)}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono transition cursor-pointer ${
                  selectedCode.code === item.code ? 'bg-[#3C6B4D]/20 border-[#3C6B4D] text-[#3C6B4D]' : 'bg-[#111213] border-[#2A2D30] text-[#ECEBE9] hover:border-[#3C6B4D]'
                }`}
              >
                <span className="font-bold">HTTP {item.code} - {item.name}</span>
                <span className="text-[10px] text-[#A3A09B] uppercase">{item.category}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Code Details & CORS Snippet */}
        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col justify-between text-left">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#2A2D30] pb-2">
              <span className="text-xl font-bold font-mono text-[#3C6B4D]">HTTP {selectedCode.code}</span>
              <span className="text-sm font-semibold text-[#ECEBE9]">{selectedCode.name}</span>
            </div>

            <div className="bg-[#111213] p-3 rounded-xl border border-[#2A2D30] text-xs text-[#ECEBE9]">
              <p className="text-[10px] text-[#A3A09B] mb-1 font-semibold">Description:</p>
              <p>{selectedCode.desc}</p>
            </div>

            <div className="bg-[#111213] p-3 rounded-xl border border-[#2A2D30] text-xs text-[#ECEBE9]">
              <p className="text-[10px] text-[#3C6B4D] mb-1 font-semibold">Recommended Fix:</p>
              <p>{selectedCode.solution}</p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="text-xs text-[#A3A09B]">CORS Allowed Origin Header:</label>
              <button onClick={copyCors} className="text-xs text-[#3C6B4D] hover:underline font-semibold flex items-center gap-1 cursor-pointer">
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy Express CORS'}
              </button>
            </div>

            <input
              type="text"
              value={corsOrigin}
              onChange={(e) => setCorsOrigin(e.target.value)}
              className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-2 rounded-lg font-mono"
            />
          </div>
        </div>
      </div>

      {/* Local AI Advisor */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#3C6B4D]">
            <Sparkles size={18} />
            <h4 className="font-bold text-[#ECEBE9] text-sm">Local AI HTTP & CORS Debugger</h4>
          </div>
          <button
            onClick={handleRunAiCorsAudit}
            disabled={isAnalyzing || !selectedModel}
            className="flex items-center gap-2 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
          >
            {isAnalyzing ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
            {isAnalyzing ? 'Debugging HTTP Status...' : 'Run Local AI Debugger'}
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
