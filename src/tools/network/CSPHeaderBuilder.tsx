import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cpu, Sparkles, Copy, Check, RefreshCw, AlertTriangle, Shield, Download, CheckCircle2 } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { parseMarkdown } from '../../utils/markdownParser';

const CSP_PRESETS = [
  {
    name: 'Strict SPA (Hardened)',
    defaultSrc: "'self'",
    scriptSrc: "'self'",
    styleSrc: "'self'",
    imgSrc: "'self' data:",
    connectSrc: "'self'",
    frameAncestors: "'none'",
    objectSrc: "'none'",
  },
  {
    name: 'WordPress / CMS',
    defaultSrc: "'self'",
    scriptSrc: "'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
    styleSrc: "'self' 'unsafe-inline' https://fonts.googleapis.com",
    imgSrc: "'self' data: https:",
    connectSrc: "'self' https:",
    frameAncestors: "'self'",
    objectSrc: "'none'",
  },
  {
    name: 'Public API Server',
    defaultSrc: "'none'",
    scriptSrc: "'none'",
    styleSrc: "'none'",
    imgSrc: "'none'",
    connectSrc: "'self'",
    frameAncestors: "'none'",
    objectSrc: "'none'",
  },
];

export const CSPHeaderBuilderTool: React.FC = () => {
  const [defaultSrc, setDefaultSrc] = useState("'self'");
  const [scriptSrc, setScriptSrc] = useState("'self' 'unsafe-inline' https://cdn.jsdelivr.net");
  const [styleSrc, setStyleSrc] = useState("'self' 'unsafe-inline' https://fonts.googleapis.com");
  const [imgSrc, setImgSrc] = useState("'self' data: https:");
  const [connectSrc, setConnectSrc] = useState("'self' http://localhost:11434");
  const [frameAncestors, setFrameAncestors] = useState("'none'");
  const [objectSrc, setObjectSrc] = useState("'none'");
  const [reportUri, setReportUri] = useState('/api/csp-report');

  const [serverFormat, setServerFormat] = useState<'raw' | 'nginx' | 'apache' | 'caddy' | 'meta' | 'json'>('raw');
  const [copied, setCopied] = useState(false);

  // Local AI State
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isAuditing, setIsAuditing] = useState(false);
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

  const rawHeaderValue = `default-src ${defaultSrc}; script-src ${scriptSrc}; style-src ${styleSrc}; img-src ${imgSrc}; connect-src ${connectSrc}; frame-ancestors ${frameAncestors}; object-src ${objectSrc};${
    reportUri ? ` report-uri ${reportUri};` : ''
  }`;

  const formattedHeader =
    serverFormat === 'raw'
      ? `Content-Security-Policy: ${rawHeaderValue}`
      : serverFormat === 'nginx'
      ? `add_header Content-Security-Policy "${rawHeaderValue}";`
      : serverFormat === 'apache'
      ? `Header set Content-Security-Policy "${rawHeaderValue}"`
      : serverFormat === 'caddy'
      ? `header Content-Security-Policy "${rawHeaderValue}"`
      : serverFormat === 'meta'
      ? `<meta http-equiv="Content-Security-Policy" content="${rawHeaderValue}">`
      : JSON.stringify({ headers: [{ key: 'Content-Security-Policy', value: rawHeaderValue }] }, null, 2);

  // Calculate Security Score
  let securityScore = 100;
  const warnings: string[] = [];

  if (scriptSrc.includes('unsafe-inline')) {
    securityScore -= 30;
    warnings.push("script-src allows 'unsafe-inline' (High XSS Risk)");
  }
  if (scriptSrc.includes('unsafe-eval')) {
    securityScore -= 20;
    warnings.push("script-src allows 'unsafe-eval' (Eval injection risk)");
  }
  if (styleSrc.includes('unsafe-inline')) {
    securityScore -= 10;
    warnings.push("style-src allows 'unsafe-inline'");
  }
  if (scriptSrc.includes('*')) {
    securityScore -= 25;
    warnings.push('script-src allows wildcard * source');
  }
  if (frameAncestors !== "'none'") {
    securityScore -= 10;
    warnings.push("frame-ancestors allows embedding (Clickjacking risk)");
  }

  securityScore = Math.max(10, securityScore);

  const copyHeader = () => {
    navigator.clipboard.writeText(formattedHeader);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadConf = () => {
    const ext = serverFormat === 'nginx' ? 'conf' : serverFormat === 'apache' ? 'htaccess' : serverFormat === 'json' ? 'json' : 'txt';
    const blob = new Blob([formattedHeader], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = `security_headers.${ext}`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyPreset = (p: typeof CSP_PRESETS[0]) => {
    setDefaultSrc(p.defaultSrc);
    setScriptSrc(p.scriptSrc);
    setStyleSrc(p.styleSrc);
    setImgSrc(p.imgSrc);
    setConnectSrc(p.connectSrc);
    setFrameAncestors(p.frameAncestors);
    setObjectSrc(p.objectSrc);
  };

  const handleRunAiAudit = async () => {
    if (!selectedModel) return;
    setIsAuditing(true);
    setError(null);

    const systemPrompt = `You are a Principal Cyber Security Architect & Web App Hardening Specialist.
Current CSP Policy Header:
"${rawHeaderValue}"

Perform an in-depth XSS & Clickjacking security audit:
1. Identify all security weaknesses (unsafe-inline, unsafe-eval, wildcards).
2. Recommend nonce-based or hash-based CSP 3 strict rules.
3. Provide hardened Nginx / Cloudflare security header snippets.
Format with clean markdown tables and bullet points.`;

    try {
      const response = await aiService.generateTextOllama(selectedModel, `Audit CSP Header policy: ${rawHeaderValue}`, 2048, systemPrompt);
      setAiOutput(response);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to local AI for CSP audit.');
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      {/* Header Card */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] flex flex-col gap-4 text-left rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/20 p-2.5 rounded-xl">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-bold text-[#ECEBE9] text-xl">AI Security Header & CSP Policy Architect</h3>
              <p className="text-[#A3A09B] text-xs mt-1">
                Configure Content Security Policy (CSP) directives visually, audit XSS/Clickjacking risks, generate Nginx/Apache headers, and run Local AI audits.
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

      {/* Preset Picker */}
      <div className="glass-card p-4 border-[#2A2D30] bg-[#18191B] rounded-2xl flex items-center justify-between overflow-x-auto text-left gap-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-[#A3A09B] font-semibold whitespace-nowrap mr-1">Policy Presets:</span>
          {CSP_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => handleApplyPreset(p)}
              className="bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D] text-[#ECEBE9] text-xs px-3 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer"
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Security Score Badge */}
        <div className="flex items-center gap-2 bg-[#111213] px-3 py-1.5 rounded-xl border border-[#2A2D30]">
          <Shield size={14} className={securityScore >= 80 ? 'text-emerald-400' : 'text-amber-400'} />
          <span className="text-xs font-bold text-[#ECEBE9] font-mono">Score: {securityScore} / 100</span>
        </div>
      </div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Directives Form */}
        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-4 text-left">
          <h4 className="text-sm font-semibold text-[#ECEBE9]">CSP Policy Directives</h4>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#A3A09B]">default-src (Fallback)</label>
            <input
              type="text"
              value={defaultSrc}
              onChange={(e) => setDefaultSrc(e.target.value)}
              className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-2.5 rounded-lg font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#A3A09B]">script-src (Executable JS)</label>
            <input
              type="text"
              value={scriptSrc}
              onChange={(e) => setScriptSrc(e.target.value)}
              className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-2.5 rounded-lg font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#A3A09B]">style-src (CSS Stylesheets)</label>
            <input
              type="text"
              value={styleSrc}
              onChange={(e) => setStyleSrc(e.target.value)}
              className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-2.5 rounded-lg font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#A3A09B]">connect-src (Fetch / WebSockets / Ollama)</label>
            <input
              type="text"
              value={connectSrc}
              onChange={(e) => setConnectSrc(e.target.value)}
              className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-2.5 rounded-lg font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#A3A09B]">frame-ancestors</label>
              <input
                type="text"
                value={frameAncestors}
                onChange={(e) => setFrameAncestors(e.target.value)}
                className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-2.5 rounded-lg font-mono"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#A3A09B]">object-src</label>
              <input
                type="text"
                value={objectSrc}
                onChange={(e) => setObjectSrc(e.target.value)}
                className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-2.5 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#A3A09B]">report-uri (Violation Telemetry)</label>
            <input
              type="text"
              value={reportUri}
              onChange={(e) => setReportUri(e.target.value)}
              placeholder="/api/csp-report"
              className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-2.5 rounded-lg font-mono"
            />
          </div>
        </div>

        {/* Output Header & Security Audit Warnings */}
        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col justify-between text-left">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-[#ECEBE9]">Generated Server Header</h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyHeader}
                  className="flex items-center gap-1 text-xs text-[#3C6B4D] hover:underline font-semibold cursor-pointer"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy Header'}
                </button>
                <button
                  onClick={handleDownloadConf}
                  className="flex items-center gap-1 text-xs text-[#3C6B4D] hover:underline font-semibold cursor-pointer"
                >
                  <Download size={14} />
                  Download
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {(['raw', 'nginx', 'apache', 'caddy', 'meta', 'json'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setServerFormat(fmt)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-mono uppercase transition cursor-pointer ${
                    serverFormat === fmt ? 'bg-[#3C6B4D] text-white font-bold' : 'bg-[#111213] border border-[#2A2D30] text-[#A3A09B] hover:text-[#ECEBE9]'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            <div className="bg-[#111213] p-4 rounded-xl border border-[#2A2D30] font-mono text-xs text-[#ECEBE9] overflow-x-auto min-h-[140px]">
              <pre className="whitespace-pre-wrap break-all">{formattedHeader}</pre>
            </div>

            {/* Security Audit Warnings */}
            <div className="mt-4 pt-4 border-t border-[#2A2D30] flex flex-col gap-2">
              <p className="text-xs font-semibold text-[#ECEBE9]">Static Security Risk Findings:</p>
              {warnings.length > 0 ? (
                warnings.map((w, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px] text-amber-400 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                    <AlertTriangle size={14} className="shrink-0" />
                    <span>{w}</span>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                  <CheckCircle2 size={14} className="shrink-0" />
                  <span>No obvious inline XSS vulnerabilities detected in policy!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Local AI Security Audit */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#3C6B4D]">
            <Sparkles size={18} />
            <h4 className="font-bold text-[#ECEBE9] text-sm">Local AI Security Policy Auditor</h4>
          </div>
          <button
            onClick={handleRunAiAudit}
            disabled={isAuditing || !selectedModel}
            className="flex items-center gap-2 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
          >
            {isAuditing ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
            {isAuditing ? 'Auditing Policy...' : 'Run Local AI Security Audit'}
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
