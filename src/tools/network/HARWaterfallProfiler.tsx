import React, { useState, useEffect } from 'react';
import { BarChart3, Cpu, Sparkles, RefreshCw, Upload, ZoomIn, ZoomOut, Maximize2, Search, Download } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { parseMarkdown } from '../../utils/markdownParser';

interface HarEntry {
  id: string;
  url: string;
  method: string;
  status: number;
  time: number;
  size: number;
  mimeType: string;
  dns?: number;
  connect?: number;
  ssl?: number;
  wait?: number;
  receive?: number;
}

export const HARWaterfallProfilerTool: React.FC = () => {
  const [harEntries, setHarEntries] = useState<HarEntry[]>([
    { id: '1', url: 'https://api.app.com/v1/auth/session', method: 'POST', status: 200, time: 145, size: 1024, mimeType: 'application/json', dns: 12, connect: 24, ssl: 30, wait: 60, receive: 19 },
    { id: '2', url: 'https://api.app.com/v1/dashboard/data', method: 'GET', status: 200, time: 420, size: 84500, mimeType: 'application/json', dns: 0, connect: 0, ssl: 0, wait: 350, receive: 70 },
    { id: '3', url: 'https://static.app.com/bundle.js', method: 'GET', status: 200, time: 890, size: 340000, mimeType: 'text/javascript', dns: 15, connect: 40, ssl: 45, wait: 200, receive: 590 },
    { id: '4', url: 'https://static.app.com/styles.css', method: 'GET', status: 200, time: 120, size: 28000, mimeType: 'text/css', dns: 0, connect: 0, ssl: 0, wait: 80, receive: 40 },
    { id: '5', url: 'https://api.app.com/v1/analytics/track', method: 'POST', status: 504, time: 2400, size: 0, mimeType: 'application/json', dns: 20, connect: 50, ssl: 60, wait: 2270, receive: 0 },
  ]);

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [zoom, setZoom] = useState(100);
  const [selectedEntry, setSelectedEntry] = useState<HarEntry | null>(null);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const entries = json.log?.entries || [];
        const parsed: HarEntry[] = entries.map((entry: any, idx: number) => {
          const timings = entry.timings || {};
          return {
            id: String(idx + 1),
            url: entry.request?.url || 'Unknown',
            method: entry.request?.method || 'GET',
            status: entry.response?.status || 0,
            time: Math.round(entry.time || 0),
            size: entry.response?.bodySize || entry.response?.content?.size || 0,
            mimeType: entry.response?.content?.mimeType || 'unknown',
            dns: Math.max(0, Math.round(timings.dns || 0)),
            connect: Math.max(0, Math.round(timings.connect || 0)),
            ssl: Math.max(0, Math.round(timings.ssl || 0)),
            wait: Math.max(0, Math.round(timings.wait || 0)),
            receive: Math.max(0, Math.round(timings.receive || 0)),
          };
        });
        if (parsed.length > 0) {
          setHarEntries(parsed.slice(0, 100));
        }
      } catch (err) {
        setError('Failed to parse HAR JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  const maxTime = Math.max(...harEntries.map((e) => e.time), 1000);
  const totalSizeKb = (harEntries.reduce((acc, e) => acc + e.size, 0) / 1024).toFixed(1);
  const avgTime = (harEntries.reduce((acc, e) => acc + e.time, 0) / (harEntries.length || 1)).toFixed(0);
  const errorCount = harEntries.filter((e) => e.status >= 400 || e.status === 0).length;

  const filteredEntries = harEntries.filter((e) => {
    const matchesSearch = e.url.toLowerCase().includes(searchQuery.toLowerCase()) || e.method.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterCategory === 'xhr' && !e.mimeType.includes('json') && !e.mimeType.includes('xml')) return false;
    if (filterCategory === 'js' && !e.mimeType.includes('javascript')) return false;
    if (filterCategory === 'css' && !e.mimeType.includes('css')) return false;
    if (filterCategory === 'media' && !e.mimeType.includes('image') && !e.mimeType.includes('video')) return false;

    if (filterStatus === 'errors' && (e.status < 400 && e.status !== 0)) return false;
    if (filterStatus === 'slow' && e.time <= 500) return false;
    return true;
  });

  const handleExportCsv = () => {
    const header = 'URL,Method,Status,Latency_ms,Size_Bytes,MimeType\n';
    const rows = harEntries.map((e) => `"${e.url}",${e.method},${e.status},${e.time},${e.size},"${e.mimeType}"`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = 'har_timing_summary.csv';
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRunAiHarAudit = async () => {
    if (!selectedModel) return;
    setIsAnalyzing(true);
    setError(null);

    const summaryData = {
      totalRequests: harEntries.length,
      totalSizeKb,
      avgLatencyMs: avgTime,
      errorCount,
      slowestRequests: harEntries.sort((a, b) => b.time - a.time).slice(0, 5),
    };

    const systemPrompt = `You are a Principal Web Performance Engineer & Browser Profiler Expert.
Har trace summary metrics:
- Total Requests: ${summaryData.totalRequests}
- Total Transferred: ${summaryData.totalSizeKb} KB
- Avg Latency: ${summaryData.avgLatencyMs} ms
- Errors: ${summaryData.errorCount}
Analyze slow HTTP requests, DNS/TTFB bottlenecks, asset optimization opportunities, HTTP/2 multiplexing, and caching headers.
Format with clean markdown tables and actionable recommendations.`;

    try {
      const response = await aiService.generateTextOllama(
        selectedModel,
        `Analyze network profile trace data:\n${JSON.stringify(summaryData, null, 2)}`,
        2048,
        systemPrompt
      );
      setAiOutput(response);
    } catch (err: any) {
      setError(err.message || 'Failed to query local AI model for HAR diagnosis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      {/* Header Card */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] flex flex-col gap-4 text-left rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/20 p-2.5 rounded-xl">
              <BarChart3 size={24} />
            </div>
            <div>
              <h3 className="font-bold text-[#ECEBE9] text-xl">AI HAR Performance Diagnostic Profiler</h3>
              <p className="text-[#A3A09B] text-xs mt-1">
                Upload browser .har trace files offline, inspect HTTP request latency waterfalls (DNS, SSL, TTFB), filter status codes, and audit bottlenecks with Local AI.
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

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 border-[#2A2D30] bg-[#18191B] rounded-2xl text-left">
          <p className="text-[10px] text-[#A3A09B]">Total Network Requests</p>
          <p className="text-xl font-bold text-[#ECEBE9] font-mono mt-1">{harEntries.length}</p>
        </div>
        <div className="glass-card p-4 border-[#2A2D30] bg-[#18191B] rounded-2xl text-left">
          <p className="text-[10px] text-[#A3A09B]">Total Transfer Size</p>
          <p className="text-xl font-bold text-[#3C6B4D] font-mono mt-1">{totalSizeKb} KB</p>
        </div>
        <div className="glass-card p-4 border-[#2A2D30] bg-[#18191B] rounded-2xl text-left">
          <p className="text-[10px] text-[#A3A09B]">Average Request Latency</p>
          <p className="text-xl font-bold text-[#ECEBE9] font-mono mt-1">{avgTime} ms</p>
        </div>
        <div className="glass-card p-4 border-[#2A2D30] bg-[#18191B] rounded-2xl text-left">
          <p className="text-[10px] text-[#A3A09B]">Failed / Error Requests</p>
          <p className={`text-xl font-bold font-mono mt-1 ${errorCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {errorCount} {errorCount > 0 ? 'Errors' : 'Clean'}
          </p>
        </div>
      </div>

      {/* Filter Bar & Controls */}
      <div className="glass-card p-4 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <label className="flex items-center gap-1.5 bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D] text-[#3C6B4D] text-xs px-3 py-2 rounded-xl cursor-pointer font-semibold transition">
            <Upload size={14} />
            Upload .har Trace File
            <input type="file" accept=".har,.json" onChange={handleFileUpload} className="hidden" />
          </label>

          <div className="relative flex-1 md:w-48">
            <Search className="absolute left-3 top-2.5 text-[#A3A09B]" size={14} />
            <input
              type="text"
              placeholder="Search URL / method..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs pl-8 pr-3 py-2 rounded-xl"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-2 rounded-xl cursor-pointer"
          >
            <option value="all">All Content Types</option>
            <option value="xhr">XHR / Fetch</option>
            <option value="js">JavaScript (.js)</option>
            <option value="css">CSS (.css)</option>
            <option value="media">Images / Media</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-2 rounded-xl cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="errors">Errors Only (4xx/5xx)</option>
            <option value="slow">Slow Requests (&gt; 500ms)</option>
          </select>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1 bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D] text-[#ECEBE9] text-xs px-3 py-2 rounded-xl font-semibold transition cursor-pointer"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Waterfall Visualizer Viewport */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-4 text-left">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#ECEBE9]">Interactive Network Waterfall Viewport</span>
          <div className="flex items-center gap-1 bg-[#111213] border border-[#2A2D30] px-2 py-1 rounded-lg">
            <button onClick={() => setZoom((z) => Math.max(50, z - 10))} className="p-1 text-[#A3A09B] hover:text-[#ECEBE9]">
              <ZoomOut size={14} />
            </button>
            <span className="text-[10px] text-[#ECEBE9] font-mono w-10 text-center">{zoom}%</span>
            <button onClick={() => setZoom((z) => Math.min(200, z + 10))} className="p-1 text-[#A3A09B] hover:text-[#ECEBE9]">
              <ZoomIn size={14} />
            </button>
            <button onClick={() => setZoom(100)} className="p-1 text-[#A3A09B] hover:text-[#ECEBE9]">
              <Maximize2 size={14} />
            </button>
          </div>
        </div>

        <div
          className="overflow-x-auto bg-[#111213] p-4 rounded-xl border border-[#2A2D30]"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'left top',
          }}
        >
          <div className="flex flex-col gap-2 min-w-[700px]">
            {filteredEntries.map((entry) => {
              const widthPct = Math.max(5, Math.min(100, (entry.time / maxTime) * 100));
              const isError = entry.status >= 400 || entry.status === 0;

              return (
                <div
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#18191B] hover:bg-[#2A2D30]/40 border border-[#2A2D30] cursor-pointer transition"
                >
                  <div className="w-1/3 flex items-center gap-2 overflow-hidden">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        entry.method === 'POST'
                          ? 'bg-purple-500/20 text-purple-400'
                          : entry.method === 'PUT'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {entry.method}
                    </span>
                    <span className="text-xs text-[#ECEBE9] font-mono truncate" title={entry.url}>
                      {entry.url.replace(/^https?:\/\/[^/]+/, '') || entry.url}
                    </span>
                  </div>

                  <div className="w-1/6 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        isError ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {entry.status}
                    </span>
                  </div>

                  <div className="w-1/2 flex items-center gap-3">
                    <div className="flex-1 bg-[#111213] h-3 rounded-full overflow-hidden border border-[#2A2D30] relative">
                      <div
                        className={`h-full rounded-full transition-all ${isError ? 'bg-rose-500' : 'bg-[#3C6B4D]'}`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-[#A3A09B] font-mono w-16 text-right">{entry.time} ms</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selectedEntry && (
          <div className="p-4 bg-[#111213] rounded-xl border border-[#2A2D30] flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#2A2D30] pb-2">
              <h5 className="font-bold text-[#ECEBE9] text-xs font-mono truncate">{selectedEntry.url}</h5>
              <button onClick={() => setSelectedEntry(null)} className="text-xs text-[#A3A09B] hover:text-[#ECEBE9]">
                Close
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-[#18191B] p-2 rounded-lg border border-[#2A2D30]">
                <p className="text-[10px] text-[#A3A09B]">DNS Lookup</p>
                <p className="font-mono text-[#ECEBE9]">{selectedEntry.dns || 0} ms</p>
              </div>
              <div className="bg-[#18191B] p-2 rounded-lg border border-[#2A2D30]">
                <p className="text-[10px] text-[#A3A09B]">SSL Handshake</p>
                <p className="font-mono text-[#ECEBE9]">{selectedEntry.ssl || 0} ms</p>
              </div>
              <div className="bg-[#18191B] p-2 rounded-lg border border-[#2A2D30]">
                <p className="text-[10px] text-[#A3A09B]">TTFB Wait</p>
                <p className="font-mono text-[#ECEBE9]">{selectedEntry.wait || 0} ms</p>
              </div>
              <div className="bg-[#18191B] p-2 rounded-lg border border-[#2A2D30]">
                <p className="text-[10px] text-[#A3A09B]">Content Download</p>
                <p className="font-mono text-[#ECEBE9]">{selectedEntry.receive || 0} ms</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Local AI HAR Profiler Diagnosis */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#3C6B4D]">
            <Sparkles size={18} />
            <h4 className="font-bold text-[#ECEBE9] text-sm">Local AI HAR Performance Diagnostic Auditor</h4>
          </div>
          <button
            onClick={handleRunAiHarAudit}
            disabled={isAnalyzing || !selectedModel}
            className="flex items-center gap-2 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
          >
            {isAnalyzing ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
            {isAnalyzing ? 'Analyzing HAR Trace...' : 'Run Local AI Performance Audit'}
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
