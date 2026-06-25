import { useState, useEffect } from 'react';
import { Copy, Check, Plus, Trash2, ShieldCheck, ShieldAlert, Link, Cpu } from 'lucide-react';

export const URLParserTool = () => {
  const [urlInput, setUrlInput] = useState('https://api.example.com:8080/v1/users/profile?id=1023&role=admin&active=true#section-header');
  
  // Parsed components
  const [protocol, setProtocol] = useState('https:');
  const [host, setHost] = useState('api.example.com');
  const [port, setPort] = useState('8080');
  const [pathname, setPathname] = useState('/v1/users/profile');
  const [hash, setHash] = useState('#section-header');
  const [searchParams, setSearchParams] = useState<{ key: string; value: string }[]>([]);
  
  const [jsonParams, setJsonParams] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);
  const [validationMsg, setValidationMsg] = useState('URL format is correct.');

  // Parse URL
  const handleParse = (input: string) => {
    try {
      if (!input.trim()) return;
      
      // Auto-add protocol if missing to allow URL parsing
      let urlStr = input.trim();
      if (!/^([a-z0-9+-.]+):/i.test(urlStr)) {
        urlStr = 'http://' + urlStr;
      }
      
      const parsed = new URL(urlStr);
      setProtocol(parsed.protocol);
      setHost(parsed.hostname);
      setPort(parsed.port);
      setPathname(parsed.pathname);
      setHash(parsed.hash);
      
      const params: { key: string; value: string }[] = [];
      parsed.searchParams.forEach((val, key) => {
        params.push({ key, value: val });
      });
      setSearchParams(params);
      setIsValid(true);
      setValidationMsg('URL structure complies with standard URI schemas.');
    } catch (err) {
      setIsValid(false);
      setValidationMsg('Invalid URL: Make sure the host name and structure are correct.');
    }
  };

  // Re-build full URL
  const buildURL = (): string => {
    try {
      let urlStr = `${protocol}//${host}`;
      if (port) {
        urlStr += `:${port}`;
      }
      urlStr += pathname;
      
      const searchObj = new URLSearchParams();
      searchParams.forEach(p => {
        if (p.key.trim()) {
          searchObj.append(p.key, p.value);
        }
      });
      const query = searchObj.toString();
      if (query) {
        urlStr += `?${query}`;
      }
      if (hash) {
        urlStr += hash.startsWith('#') ? hash : `#${hash}`;
      }
      return urlStr;
    } catch (e) {
      return '';
    }
  };

  // Trigger parsing on input change
  useEffect(() => {
    handleParse(urlInput);
  }, [urlInput]);

  // Handle Search Params JSON output update
  useEffect(() => {
    const obj: Record<string, string> = {};
    searchParams.forEach(p => {
      if (p.key.trim()) {
        obj[p.key] = p.value;
      }
    });
    setJsonParams(JSON.stringify(obj, null, 2));
  }, [searchParams]);

  // Edit query param list handlers
  const updateParam = (index: number, field: 'key' | 'value', value: string) => {
    setSearchParams(prev => prev.map((p, idx) => idx === index ? { ...p, [field]: value } : p));
  };

  const addParam = () => {
    setSearchParams(prev => [...prev, { key: 'newParam', value: '' }]);
  };

  const deleteParam = (index: number) => {
    setSearchParams(prev => prev.filter((_, idx) => idx !== index));
  };

  // Protocols quick switcher helper
  const handleProtocolChange = (newProto: string) => {
    setProtocol(newProto.endsWith(':') ? newProto : `${newProto}:`);
  };

  // URL Encode/Decode helper
  const encodeUrl = () => {
    const full = buildURL();
    setUrlInput(encodeURIComponent(full));
  };

  const decodeUrl = () => {
    try {
      setUrlInput(decodeURIComponent(urlInput));
    } catch (err) {
      alert('URL decoding failed. Formats are not properly escaped.');
    }
  };

  // JSON import params
  const importJsonParams = () => {
    try {
      const parsed = JSON.parse(jsonParams);
      const list = Object.entries(parsed).map(([key, val]) => ({
        key,
        value: String(val)
      }));
      setSearchParams(list);
    } catch (e) {
      alert('Invalid JSON input format.');
    }
  };

  // Clipboard copy
  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const pathBreadcrumbs = pathname.split('/').filter(Boolean);
  const fullRebuiltUrl = buildURL();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Full URL Input Board */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-[#3C6B4D] font-bold border-b border-slate-800 pb-2">URL & Query String Parser</h3>
          
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs text-slate-400 font-semibold uppercase">Enter Full URL</label>
              <div className="flex gap-2">
                <button onClick={encodeUrl} className="text-[10px] bg-slate-800 text-slate-350 hover:bg-slate-700 font-bold px-2 py-0.5 rounded transition-all">URL Encode</button>
                <button onClick={decodeUrl} className="text-[10px] bg-slate-800 text-slate-350 hover:bg-slate-700 font-bold px-2 py-0.5 rounded transition-all">URL Decode</button>
              </div>
            </div>
            <textarea
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              rows={3}
              placeholder="https://..."
              className="bg-slate-950 border border-slate-850 rounded-xl p-3.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-[#3C6B4D] w-full"
            />
          </div>

          <div className={`p-4 rounded-xl border flex items-center gap-3 ${
            isValid 
              ? 'bg-emerald-950/10 border-emerald-900/60 text-emerald-400' 
              : 'bg-rose-950/20 border-rose-950 text-rose-400'
          }`}>
            {isValid ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
            <span className="text-xs font-semibold">{validationMsg}</span>
          </div>
        </div>

        {/* Query Parameter Visual Manager */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-850 pb-2">
            <span className="text-xs text-slate-400 font-bold uppercase">Query Parameters List</span>
            <button
              onClick={addParam}
              className="py-1 px-3 bg-[#3C6B4D]/15 text-[#3C6B4D] border border-[#3C6B4D]/25 rounded-xl text-[10px] font-bold flex items-center gap-1 hover:bg-[#3C6B4D]/30"
            >
              <Plus size={12} /> Add Parameter
            </button>
          </div>

          <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto pr-1">
            {searchParams.map((p, idx) => (
              <div key={idx} className="flex gap-2 items-center bg-slate-950/40 p-2 border border-slate-850/50 rounded-xl">
                <input
                  type="text"
                  value={p.key}
                  onChange={(e) => updateParam(idx, 'key', e.target.value)}
                  placeholder="Key"
                  className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#3C6B4D] flex-1"
                />
                <span className="text-slate-500 font-mono">=</span>
                <input
                  type="text"
                  value={p.value}
                  onChange={(e) => updateParam(idx, 'value', e.target.value)}
                  placeholder="Value"
                  className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#3C6B4D] flex-1"
                />
                <button
                  onClick={() => deleteParam(idx)}
                  className="p-2 hover:bg-rose-950/20 text-rose-400 rounded-lg transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            {searchParams.length === 0 && (
              <span className="text-xs text-slate-500 text-center italic py-4">No query parameters found.</span>
            )}
          </div>
        </div>

        {/* JSON Import/Export of parameters */}
        <div className="glass-card p-6 flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-slate-850 pb-2">
            <span className="text-xs text-slate-400 font-bold uppercase">JSON Representation</span>
            <button
              onClick={importJsonParams}
              className="text-[10px] bg-[#3C6B4D] text-white font-bold px-3 py-1 rounded-lg hover:bg-[#3C6B4D]/80 transition-all"
            >
              Import JSON Settings
            </button>
          </div>
          <textarea
            value={jsonParams}
            onChange={(e) => setJsonParams(e.target.value)}
            rows={5}
            className="bg-slate-950 border border-slate-850 rounded-xl p-3 text-slate-300 text-xs font-mono focus:outline-none focus:border-[#3C6B4D]"
          />
        </div>
      </div>

      {/* Breakdown and Settings panel */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        {/* Rebuilt Result */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <span className="text-xs font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-1.5"><Link size={14} className="text-[#3C6B4D]" /> Rebuilt URL Result</span>
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-xs font-mono break-all text-slate-300 min-h-[90px] select-all">
            {fullRebuiltUrl}
          </div>
          <button
            onClick={() => handleCopy('rebuilt', fullRebuiltUrl)}
            className="w-full py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 rounded-xl text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2 text-xs font-semibold"
          >
            {copiedKey === 'rebuilt' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copiedKey === 'rebuilt' ? 'Copied Rebuilt URL!' : 'Copy Rebuilt URL'}</span>
          </button>
        </div>

        {/* Path segments breadcrumbs */}
        <div className="glass-card p-6 flex flex-col gap-3">
          <span className="text-xs text-slate-400 font-bold uppercase border-b border-slate-800 pb-2">Path Breadcrumbs</span>
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="bg-slate-900 text-slate-400 text-[10px] px-2.5 py-1 rounded font-mono font-bold">host</span>
            {pathBreadcrumbs.map((s, idx) => (
              <span key={idx} className="flex items-center gap-1.5">
                <span className="text-slate-650">/</span>
                <span className="bg-[#3C6B4D]/15 text-[#3C6B4D] text-[10px] px-2.5 py-1 rounded font-mono font-bold">{s}</span>
              </span>
            ))}
            {pathBreadcrumbs.length === 0 && <span className="text-xs text-slate-500 italic">root (/)</span>}
          </div>
        </div>

        {/* Quick parameters component list */}
        <div className="glass-card p-6 flex flex-col gap-3.5">
          <h3 className="text-xs font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-1.5"><Cpu size={14} className="text-[#3C6B4D]" /> Quick switchers</h3>
          
          {/* Protocol switch */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-500 font-bold uppercase">Set Protocol</label>
            <div className="grid grid-cols-3 gap-1.5">
              {['http', 'https', 'ws', 'wss', 'ftp'].map(proto => (
                <button
                  key={proto}
                  onClick={() => handleProtocolChange(proto)}
                  className={`py-1 rounded-lg text-[9px] font-bold border transition-all uppercase ${
                    protocol === `${proto}:`
                      ? 'bg-[#3C6B4D]/15 text-[#3C6B4D] border-[#3C6B4D]/40'
                      : 'bg-slate-950 text-slate-400 border-slate-850 hover:text-slate-200'
                  }`}
                >
                  {proto}
                </button>
              ))}
            </div>
          </div>

          {/* Port customizer */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-500 font-bold uppercase">Port number</label>
            <input
              type="text"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="e.g. 8080"
              className="bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#3C6B4D]"
            />
          </div>

          {/* Hash routing fragment */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-500 font-bold uppercase">Hash segment</label>
            <input
              type="text"
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              placeholder="e.g. #header-id"
              className="bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#3C6B4D]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
