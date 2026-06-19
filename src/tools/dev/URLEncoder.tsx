import { useState, useEffect } from 'react';
import { handleTextCopy } from '../../utils/sharedHelpers';
import { Clipboard, Check, Plus, Trash2, Settings, Globe } from 'lucide-react';

interface QueryParam {
  id: string;
  key: string;
  value: string;
}

export const URLEncoderTool = () => {
  const [inputText, setInputText] = useState('https://domodomo.io/tools?category=dev&mode=offline&active=true');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [copied, setCopied] = useState(false);
  const [queryParams, setQueryParams] = useState<QueryParam[]>([]);

  // Compute conversion
  const handleConvert = () => {
    try {
      if (!inputText) {
        setOutputText('');
        return;
      }
      if (mode === 'encode') {
        // Encode only query params or full string?
        // Usually, developers want full encodeURIComponent or standard encodeURI
        setOutputText(encodeURIComponent(inputText));
      } else {
        setOutputText(decodeURIComponent(inputText));
      }
    } catch (e) {
      setOutputText('Decoding Error: Invalid URI format');
    }
  };

  // Parse URL query params automatically
  useEffect(() => {
    try {
      if (!inputText.trim()) {
        setQueryParams([]);
        return;
      }
      const urlStr = inputText.includes('?') ? inputText : `?${inputText}`;
      const searchParams = new URLSearchParams(urlStr.substring(urlStr.indexOf('?')));
      const params: QueryParam[] = [];
      searchParams.forEach((value, key) => {
        params.push({
          id: `${Date.now()}-${Math.random()}`,
          key,
          value
        });
      });
      setQueryParams(params);
    } catch (e) {
      setQueryParams([]);
    }
  }, [inputText]);

  useEffect(() => {
    handleConvert();
  }, [inputText, mode]);

  // Re-assemble URL from parsed query parameters grid
  const rebuildFromParams = (updatedParams: QueryParam[]) => {
    const searchParams = new URLSearchParams();
    updatedParams.forEach(p => {
      if (p.key.trim()) {
        searchParams.append(p.key.trim(), p.value.trim());
      }
    });

    const queryStr = searchParams.toString();
    const base = inputText.includes('?') ? inputText.split('?')[0] : inputText;
    
    if (queryStr) {
      setInputText(`${base}?${queryStr}`);
    } else {
      setInputText(base);
    }
  };

  const handleUpdateParam = (id: string, field: 'key' | 'value', value: string) => {
    const updated = queryParams.map(p => p.id === id ? { ...p, [field]: value } : p);
    setQueryParams(updated);
    rebuildFromParams(updated);
  };

  const handleAddParam = () => {
    const newParam = { id: `${Date.now()}-${Math.random()}`, key: 'new_param', value: 'value' };
    const updated = [...queryParams, newParam];
    setQueryParams(updated);
    rebuildFromParams(updated);
  };

  const handleRemoveParam = (id: string) => {
    const updated = queryParams.filter(p => p.id !== id);
    setQueryParams(updated);
    rebuildFromParams(updated);
  };

  return (
    <div className="max-w-4xl mx-auto glass-card p-6 flex flex-col gap-6 text-left">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Globe size={18} className="text-teal-400" />
        <div>
          <h3 className="font-bold text-teal-400 text-sm">URL Encoder & Decoder</h3>
          <p className="text-[10px] text-slate-500">Encode special URI characters, decode parameter strings, and parse URL query arguments</p>
        </div>
        <span className="ml-auto text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">URI Component</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Editor block */}
        <div className="md:col-span-7 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Source URL String</span>
              <button onClick={() => setInputText('')} className="text-[10px] text-rose-450 hover:underline">Clear</button>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your URL or parameter string here..."
              className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono h-40 text-slate-200 resize-none w-full focus:outline-none focus:border-teal-500/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-500 uppercase font-semibold">Output Results</label>
            {outputText ? (
              <div className="relative">
                <textarea
                  readOnly
                  value={outputText}
                  className="bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs font-mono h-40 text-emerald-400 w-full resize-none focus:outline-none"
                />
                <button onClick={() => handleTextCopy(outputText, setCopied)}
                  className="absolute right-3.5 bottom-3.5 p-1 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-white shrink-0">
                  {copied ? <Check size={12} className="text-teal-400" /> : <Clipboard size={12} />}
                </button>
              </div>
            ) : (
              <div className="h-40 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-center text-slate-650 text-xs">
                Awaiting input content to convert
              </div>
            )}
          </div>
        </div>

        {/* Configurations Side */}
        <div className="md:col-span-5 flex flex-col gap-4 border-l border-slate-800 md:pl-6">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Conversion Options</span>

          {/* Mode switch */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-550 uppercase">Operation Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setMode('encode')}
                className={`py-1.5 text-xs font-bold rounded border transition-all ${
                  mode === 'encode' ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-800 bg-slate-950 text-slate-450'
                }`}>Encode URL</button>
              <button onClick={() => setMode('decode')}
                className={`py-1.5 text-xs font-bold rounded border transition-all ${
                  mode === 'decode' ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-800 bg-slate-950 text-slate-450'
                }`}>Decode URL</button>
            </div>
          </div>

          {/* Query Params grid parser */}
          <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl flex flex-col gap-3 flex-1 min-h-[220px]">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5"><Settings size={12} /> URL Query Parameters</span>
              <button onClick={handleAddParam} className="text-[9px] text-teal-450 hover:underline flex items-center gap-0.5"><Plus size={11} /> Add Param</button>
            </div>
            <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-1">
              {queryParams.length > 0 ? (
                queryParams.map((p) => (
                  <div key={p.id} className="flex gap-1.5 items-center">
                    <input type="text" value={p.key} onChange={(e) => handleUpdateParam(p.id, 'key', e.target.value)} className="w-1/2 bg-slate-950 border border-slate-850 rounded px-2 py-0.5 text-[10px] font-mono text-slate-300" placeholder="key" />
                    <input type="text" value={p.value} onChange={(e) => handleUpdateParam(p.id, 'value', e.target.value)} className="w-1/2 bg-slate-950 border border-slate-850 rounded px-2 py-0.5 text-[10px] font-mono text-slate-350" placeholder="value" />
                    <button onClick={() => handleRemoveParam(p.id)} className="p-1 text-slate-500 hover:text-rose-400"><Trash2 size={11} /></button>
                  </div>
                ))
              ) : (
                <div className="text-[10px] text-slate-600 italic text-center py-8">No parameters detected in the query string</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
