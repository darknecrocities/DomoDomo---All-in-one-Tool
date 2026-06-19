import { useState, useCallback } from 'react';
import { handleTextCopy } from '../../utils/sharedHelpers';
import { Send, Plus, Trash2, Clipboard, Check, RefreshCw, Layers, Settings, Globe } from 'lucide-react';

interface HeaderItem {
  key: string;
  value: string;
}

export const APITesterTool = () => {
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/todos/1');
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>('GET');
  const [headers, setHeaders] = useState<HeaderItem[]>([
    { key: 'Content-Type', value: 'application/json' }
  ]);
  const [requestBody, setRequestBody] = useState('{\n  "title": "foo",\n  "body": "bar",\n  "userId": 1\n}');
  
  // Response states
  const [loading, setLoading] = useState(false);
  const [responseBody, setResponseBody] = useState('');
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [statusText, setStatusText] = useState('');
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [responseSize, setResponseSize] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<HeaderItem[]>([]);
  const [copied, setCopied] = useState(false);

  const addHeaderRow = () => {
    setHeaders(prev => [...prev, { key: '', value: '' }]);
  };

  const removeHeaderRow = (idx: number) => {
    setHeaders(prev => prev.filter((_, i) => i !== idx));
  };

  const updateHeaderRow = (idx: number, field: 'key' | 'value', val: string) => {
    setHeaders(prev => prev.map((h, i) => i === idx ? { ...h, [field]: val } : h));
  };

  const handleSend = useCallback(async () => {
    setLoading(true);
    setResponseBody('');
    setStatusCode(null);
    setStatusText('');
    setResponseTime(null);
    setResponseSize(null);
    setResponseHeaders([]);

    const headersObj: Record<string, string> = {};
    headers.forEach(h => {
      if (h.key.trim()) {
        headersObj[h.key.trim()] = h.value.trim();
      }
    });

    const init: RequestInit = {
      method,
      headers: headersObj,
    };

    if (method !== 'GET' && requestBody.trim()) {
      init.body = requestBody.trim();
    }

    const startTime = performance.now();
    try {
      const response = await fetch(url, init);
      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));
      setStatusCode(response.status);
      setStatusText(response.statusText);

      // Parse headers
      const resHeadersList: HeaderItem[] = [];
      response.headers.forEach((value, key) => {
        resHeadersList.push({ key, value });
      });
      setResponseHeaders(resHeadersList);

      const contentType = response.headers.get('content-type') || '';
      const textData = await response.text();
      setResponseSize(textData.length);

      if (contentType.includes('application/json')) {
        try {
          const parsed = JSON.parse(textData);
          setResponseBody(JSON.stringify(parsed, null, 2));
        } catch {
          setResponseBody(textData);
        }
      } else {
        setResponseBody(textData);
      }
    } catch (e: any) {
      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));
      setStatusCode(0);
      setStatusText('Network Error / CORS Blocked');
      setResponseBody('Could not complete request. This endpoint might block client-side fetch requests via CORS restrictions (Cross-Origin Resource Sharing) or the URL could be invalid.');
    }
    setLoading(false);
  }, [url, method, headers, requestBody]);

  return (
    <div className="max-w-4xl mx-auto glass-card p-6 flex flex-col gap-6 text-left">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Globe size={18} className="text-teal-400" />
        <div>
          <h3 className="font-bold text-teal-400 text-sm">Local API Request Tester</h3>
          <p className="text-[10px] text-slate-500">Send HTTP requests, configure request headers, and inspect response streams</p>
        </div>
        <span className="ml-auto text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">HTTP Client</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Request Setup block */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Configure Request</span>

          {/* Method and URL */}
          <div className="flex gap-2">
            <select value={method} onChange={(e) => setMethod(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-lg text-teal-400 font-bold focus:outline-none focus:border-teal-500/50">
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/endpoint"
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Request Headers list */}
          <div className="bg-slate-900/35 border border-slate-850 p-4 rounded-xl flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5"><Settings size={12} /> Custom Request Headers</span>
              <button onClick={addHeaderRow} className="text-[10px] text-teal-450 hover:underline flex items-center gap-0.5"><Plus size={12} /> Add Row</button>
            </div>
            <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
              {headers.map((h, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input type="text" placeholder="Header Key" value={h.key} onChange={(e) => updateHeaderRow(idx, 'key', e.target.value)} className="w-1/2 bg-slate-950 border border-slate-850 rounded px-2.5 py-1 text-xs font-mono text-slate-300" />
                  <input type="text" placeholder="Value" value={h.value} onChange={(e) => updateHeaderRow(idx, 'value', e.target.value)} className="w-1/2 bg-slate-950 border border-slate-850 rounded px-2.5 py-1 text-xs font-mono text-slate-300" />
                  <button onClick={() => removeHeaderRow(idx)} className="p-1 text-slate-500 hover:text-rose-450"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Request Body (show only if not GET) */}
          {method !== 'GET' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-500 uppercase font-semibold">Request payload body</label>
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                placeholder="{}"
                className="bg-slate-905 border border-slate-800 rounded-xl p-3 text-xs font-mono h-32 text-slate-200 resize-none w-full focus:outline-none focus:border-teal-500"
              />
            </div>
          )}

          <button onClick={handleSend} disabled={loading || !url}
            className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg">
            {loading ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
            {loading ? 'Sending Request...' : 'Send API Call'}
          </button>
        </div>

        {/* Response Inspect block */}
        <div className="lg:col-span-6 flex flex-col gap-4 border-l border-slate-850 lg:pl-6">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inspect Response</span>

          {/* Metadata statuses */}
          {statusCode !== null && (
            <div className="grid grid-cols-3 gap-2 bg-slate-900/40 p-3 rounded-xl border border-slate-850 text-center font-mono text-[10px]">
              <div className="flex flex-col">
                <span className="text-[8px] text-slate-500 uppercase">Status</span>
                <span className={`font-bold mt-0.5 ${statusCode >= 200 && statusCode < 300 ? 'text-teal-400' : 'text-rose-400'}`}>
                  {statusCode} {statusText}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] text-slate-500 uppercase">Response Time</span>
                <span className="text-slate-300 font-bold mt-0.5">{responseTime !== null ? `${responseTime} ms` : '—'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] text-slate-500 uppercase">Payload Size</span>
                <span className="text-slate-300 font-bold mt-0.5">{responseSize !== null ? `${(responseSize / 1024).toFixed(1)} KB` : '—'}</span>
              </div>
            </div>
          )}

          {/* Response Body text */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-500 uppercase font-semibold">Response Body Payload</label>
            {loading ? (
              <div className="h-56 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-center gap-2">
                <RefreshCw size={14} className="animate-spin text-teal-400" />
                <span className="text-xs text-slate-500 font-bold uppercase">Awaiting Server Response...</span>
              </div>
            ) : responseBody ? (
              <div className="relative">
                <textarea
                  readOnly
                  value={responseBody}
                  className="bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs font-mono h-56 text-emerald-400 w-full resize-none focus:outline-none"
                />
                <button onClick={() => handleTextCopy(responseBody, setCopied)}
                  className="absolute right-3.5 bottom-3.5 p-1 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-white shrink-0">
                  {copied ? <Check size={11} className="text-teal-400" /> : <Clipboard size={11} />}
                </button>
              </div>
            ) : (
              <div className="h-56 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-center text-slate-600 text-xs">
                No active response payload
              </div>
            )}
          </div>

          {/* Response headers table */}
          {responseHeaders.length > 0 && (
            <div className="flex flex-col gap-2 bg-slate-900/30 p-3 rounded-xl border border-slate-850 max-h-[140px] overflow-y-auto">
              <span className="text-[9px] text-slate-550 font-bold uppercase tracking-wider flex items-center gap-1.5"><Layers size={11} /> Response Headers</span>
              <div className="flex flex-col gap-1 text-[10px] font-mono">
                {responseHeaders.map((rh, idx) => (
                  <div key={idx} className="flex justify-between border-b border-slate-850/60 pb-1">
                    <span className="text-slate-450 font-bold truncate mr-3">{rh.key}</span>
                    <span className="text-slate-300 truncate">{rh.value}</span>
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
