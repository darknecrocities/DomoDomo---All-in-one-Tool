import { useState, useEffect } from 'react';
import { Copy, Check, ShieldCheck, ShieldAlert, Cpu, HelpCircle, FileText } from 'lucide-react';

interface HeaderItem {
  key: string;
  value: string;
  category: 'security' | 'caching' | 'cors' | 'general';
  description: string;
}

export const HeaderInspectorTool = () => {
  const [headersInput, setHeadersInput] = useState(`HTTP/1.1 200 OK\nContent-Type: text/html; charset=UTF-8\nCache-Control: no-cache, no-store, must-revalidate\nPragma: no-cache\nExpires: 0\nAccess-Control-Allow-Origin: *\nX-Frame-Options: SAMEORIGIN\nX-Content-Type-Options: nosniff\nReferrer-Policy: no-referrer`);
  
  const [parsedHeaders, setParsedHeaders] = useState<HeaderItem[]>([]);
  const [statusCode, setStatusCode] = useState<string>('200');
  const [statusText, setStatusText] = useState<string>('OK');
  const [copied, setCopied] = useState(false);

  // Security checks
  const [securityScore, setSecurityScore] = useState(0);
  const [securityReport, setSecurityReport] = useState<{ name: string; present: boolean; description: string }[]>([]);

  // CORS Generator helper states
  const [corsOrigin, setCorsOrigin] = useState('*');
  const [corsMethods, setCorsMethods] = useState('GET, POST, OPTIONS');
  const [corsHeaders, setCorsHeaders] = useState('Content-Type, Authorization');
  const [corsCredentials, setCorsCredentials] = useState(true);

  // HTTP Status definition lookup state
  const [lookupStatus, setLookupStatus] = useState('200');
  const [lookupResult, setLookupResult] = useState('OK: The request has succeeded.');

  const HTTP_STATUS_DESCRIPTIONS: Record<string, string> = {
    '200': 'OK: Request succeeded. Response body contains the requested resource.',
    '201': 'Created: Request succeeded and a new resource was successfully created.',
    '301': 'Moved Permanently: Resource URI has been permanently redirected to a new location.',
    '302': 'Found: Resource URI is temporarily located under a different address.',
    '400': 'Bad Request: Server cannot parse or process request due to malformed syntax.',
    '401': 'Unauthorized: Request requires client user authentication headers.',
    '403': 'Forbidden: Client does not have authorization permissions to access content.',
    '404': 'Not Found: Server cannot find the requested resource URI location.',
    '500': 'Internal Server Error: Server encountered an unexpected runtime failure.',
    '502': 'Bad Gateway: Server received an invalid response gateway from upstream router.',
    '503': 'Service Unavailable: Server is temporarily overloading or down for maintenance.',
  };

  const getHeaderDescription = (key: string): { desc: string; cat: 'security' | 'caching' | 'cors' | 'general' } => {
    const k = key.toLowerCase();
    if (k === 'cache-control') return { desc: 'Specifies caching directives for client/browser caches.', cat: 'caching' };
    if (k === 'pragma') return { desc: 'Legacy header for HTTP/1.0 caching control commands.', cat: 'caching' };
    if (k === 'expires') return { desc: 'Date/time after which the response is considered stale.', cat: 'caching' };
    if (k === 'content-type') return { desc: 'MIME type specifying the media format of the response.', cat: 'general' };
    if (k === 'access-control-allow-origin') return { desc: 'Specifies which domains can access resources via CORS.', cat: 'cors' };
    if (k === 'access-control-allow-methods') return { desc: 'Specifies allowed HTTP methods for CORS requests.', cat: 'cors' };
    if (k === 'access-control-allow-headers') return { desc: 'Specifies allowed custom request headers for CORS.', cat: 'cors' };
    if (k === 'x-frame-options') return { desc: 'Protects visitors against clickjacking overlays.', cat: 'security' };
    if (k === 'content-security-policy' || k === 'csp') return { desc: 'Defines trusted resource origins to prevent XSS.', cat: 'security' };
    if (k === 'strict-transport-security' || k === 'hsts') return { desc: 'Forces browser connections over secure HTTPS.', cat: 'security' };
    if (k === 'x-content-type-options') return { desc: 'Prevents MIME sniffing attacks by browser agents.', cat: 'security' };
    if (k === 'referrer-policy') return { desc: 'Controls how much referrer metadata is sent with requests.', cat: 'security' };
    
    return { desc: 'Standard metadata parameter field.', cat: 'general' };
  };

  const parseHeaders = (raw: string) => {
    const lines = raw.split('\n');
    const items: HeaderItem[] = [];
    
    lines.forEach(line => {
      if (line.startsWith('HTTP/')) {
        const parts = line.split(/\s+/);
        if (parts.length >= 3) {
          setStatusCode(parts[1]);
          setStatusText(parts.slice(2).join(' '));
        }
        return;
      }

      const separatorIdx = line.indexOf(':');
      if (separatorIdx !== -1) {
        const key = line.slice(0, separatorIdx).trim();
        const value = line.slice(separatorIdx + 1).trim();
        if (key) {
          const info = getHeaderDescription(key);
          items.push({
            key,
            value,
            category: info.cat,
            description: info.desc
          });
        }
      }
    });

    setParsedHeaders(items);
  };

  // Run header audit reports
  useEffect(() => {
    parseHeaders(headersInput);
  }, [headersInput]);

  useEffect(() => {
    const securityHeaders = [
      { key: 'content-security-policy', name: 'Content Security Policy (CSP)', desc: 'Prevents XSS attacks.' },
      { key: 'strict-transport-security', name: 'Strict-Transport-Security (HSTS)', desc: 'Enforces HTTPS encryption.' },
      { key: 'x-frame-options', name: 'X-Frame-Options', desc: 'Protects against clickjacking.' },
      { key: 'x-content-type-options', name: 'X-Content-Type-Options', desc: 'Prevents MIME type sniffing.' },
      { key: 'referrer-policy', name: 'Referrer-Policy', desc: 'Restricts referrer headers leaks.' }
    ];

    const report = securityHeaders.map(sh => {
      const present = parsedHeaders.some(ph => ph.key.toLowerCase() === sh.key);
      return {
        name: sh.name,
        present,
        description: sh.desc
      };
    });

    setSecurityReport(report);
    const score = report.filter(r => r.present).length;
    setSecurityScore(score * 20); // Scale to percentage points
  }, [parsedHeaders]);

  const applyPreset = (preset: 'cors' | 'cache' | 'security') => {
    if (preset === 'cors') {
      setHeadersInput(`Access-Control-Allow-Origin: *\nAccess-Control-Allow-Methods: GET, POST, OPTIONS\nAccess-Control-Allow-Headers: Content-Type, Authorization\nAccess-Control-Allow-Credentials: true\nAccess-Control-Max-Age: 86400`);
    } else if (preset === 'cache') {
      setHeadersInput(`Cache-Control: public, max-age=31536000, immutable\nETag: "5f2b8429-1c2b"\nLast-Modified: Wed, 21 Oct 2015 07:28:00 GMT`);
    } else {
      setHeadersInput(`Content-Security-Policy: default-src 'self'\nStrict-Transport-Security: max-age=63072000; includeSubDomains; preload\nX-Frame-Options: DENY\nX-Content-Type-Options: nosniff\nReferrer-Policy: strict-origin-when-cross-origin`);
    }
  };

  const getCORSOutput = (): string => {
    return `Access-Control-Allow-Origin: ${corsOrigin}\nAccess-Control-Allow-Methods: ${corsMethods}\nAccess-Control-Allow-Headers: ${corsHeaders}\nAccess-Control-Allow-Credentials: ${corsCredentials}\nAccess-Control-Max-Age: 86400`;
  };

  const handleCopyCORS = () => {
    navigator.clipboard.writeText(getCORSOutput());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Status code lookup
  const runStatusLookup = (code: string) => {
    setLookupStatus(code);
    const desc = HTTP_STATUS_DESCRIPTIONS[code] || 'Unknown: Code definition not loaded.';
    setLookupResult(desc);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Editor Inputs */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-[#3C6B4D] font-bold border-b border-slate-800 pb-2">HTTP Header Inspector</h3>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-semibold uppercase">Paste Raw Headers String</label>
            <textarea
              value={headersInput}
              onChange={(e) => setHeadersInput(e.target.value)}
              rows={6}
              placeholder="e.g. Cache-Control: max-age=0..."
              className="bg-slate-950 border border-slate-850 rounded-xl p-3.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-[#3C6B4D] w-full"
            />
          </div>
        </div>

        {/* Audited header list table */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <span className="text-xs text-slate-400 font-bold uppercase border-b border-slate-850 pb-2 flex justify-between">
            <span>Parsed Headers</span>
            {statusCode && (
              <span className="text-[10px] text-slate-500 font-bold uppercase font-mono">Status: {statusCode} {statusText}</span>
            )}
          </span>

          <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
            {parsedHeaders.map((h, idx) => (
              <div key={idx} className="flex flex-col gap-1 bg-slate-900/30 border border-slate-850/50 p-3 rounded-xl text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-slate-250 break-all">{h.key}</span>
                  <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    h.category === 'security' 
                      ? 'bg-emerald-550/15 text-emerald-400 border border-emerald-900/30' 
                      : h.category === 'cors'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-900/30'
                        : 'bg-slate-950 text-slate-400 border border-slate-850'
                  }`}>
                    {h.category}
                  </span>
                </div>
                <div className="text-slate-350 font-mono break-all font-semibold">{h.value}</div>
                <div className="text-[9px] text-slate-500">{h.description}</div>
              </div>
            ))}
            {parsedHeaders.length === 0 && (
              <span className="text-slate-500 text-xs italic text-center py-6">No header items parsed. Enter header lines.</span>
            )}
          </div>
        </div>

        {/* Dynamic CORS Configuration Compiler */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-850 pb-2">
            <span className="text-xs text-slate-400 font-bold uppercase">CORS Rule Generator</span>
            <button
              onClick={handleCopyCORS}
              className="py-1 px-3 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copied ? 'Copied CORS!' : 'Copy Rules'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Allowed Origin</label>
              <input
                type="text"
                value={corsOrigin}
                onChange={(e) => setCorsOrigin(e.target.value)}
                className="bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Allowed Methods</label>
              <input
                type="text"
                value={corsMethods}
                onChange={(e) => setCorsMethods(e.target.value)}
                className="bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Allowed Headers</label>
              <input
                type="text"
                value={corsHeaders}
                onChange={(e) => setCorsHeaders(e.target.value)}
                className="bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between bg-slate-950 border border-slate-850/80 rounded-xl p-2.5">
              <div className="flex flex-col">
                <span className="text-xs text-slate-200 font-semibold">Allow Credentials</span>
              </div>
              <button
                onClick={() => setCorsCredentials(!corsCredentials)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none shrink-0 ${
                  corsCredentials ? 'bg-[#3C6B4D]' : 'bg-slate-700'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  corsCredentials ? 'translate-x-4.5' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Audit report and presets sidebar */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        {/* Preset configs */}
        <div className="glass-card p-6 flex flex-col gap-3">
          <span className="text-xs text-slate-400 font-bold uppercase border-b border-slate-800 pb-2">Presets Templates</span>
          <div className="grid grid-cols-1 gap-2">
            <button onClick={() => applyPreset('security')} className="py-2 px-3 bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-850 hover:border-slate-800 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5"><FileText size={12} /> Security Headers Preset</button>
            <button onClick={() => applyPreset('cors')} className="py-2 px-3 bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-850 hover:border-slate-800 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5"><FileText size={12} /> CORS Headers Preset</button>
            <button onClick={() => applyPreset('cache')} className="py-2 px-3 bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-850 hover:border-slate-800 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5"><FileText size={12} /> Caching Headers Preset</button>
          </div>
        </div>

        {/* Security headers validation audit */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-850 pb-2">
            <span className="text-xs text-slate-400 font-bold uppercase">Security Audit Score</span>
            <span className="font-mono text-xs text-[#3C6B4D] font-bold">{securityScore}%</span>
          </div>

          <div className="flex flex-col gap-3.5">
            {securityReport.map((rep, idx) => (
              <div key={idx} className="flex gap-2.5 items-start text-xs">
                {rep.present ? (
                  <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert size={16} className="text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-slate-200">{rep.name}</span>
                  <span className="text-[10px] text-slate-500 leading-normal">{rep.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HTTP Status Code lookup details */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <span className="text-xs text-slate-400 font-bold uppercase border-b border-slate-850 pb-2 flex items-center gap-1.5"><Cpu size={13} className="text-[#3C6B4D]" /> HTTP Status Lookup</span>
          <div className="flex flex-col gap-3">
            <select
              value={lookupStatus}
              onChange={(e) => runStatusLookup(e.target.value)}
              className="bg-slate-950 border border-slate-850 text-slate-350 p-2.5 text-xs rounded-xl focus:outline-none"
            >
              {Object.keys(HTTP_STATUS_DESCRIPTIONS).map(code => (
                <option key={code} value={code}>Status Code {code}</option>
              ))}
            </select>
            <div className="bg-slate-950 border border-slate-850/80 p-3.5 rounded-xl flex items-start gap-2">
              <HelpCircle size={14} className="text-[#3C6B4D] shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-350 leading-relaxed font-semibold">{lookupResult}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
