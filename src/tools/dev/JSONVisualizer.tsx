import { useState, useMemo } from 'react';
import { AlertCircle, FileJson, ChevronDown, ChevronRight, Check } from 'lucide-react';

type ViewMode = 'json' | 'object';

interface JSONNodeProps {
  data: any;
  nodeKey?: string;
  isLast: boolean;
  mode: ViewMode;
}

const JSONNode = ({ data, nodeKey, isLast, mode }: JSONNodeProps) => {
  const [expanded, setExpanded] = useState(true);
  const isJson = mode === 'json';

  // primitive values
  if (data === null || typeof data !== 'object') {
    return (
      <div className="flex font-mono text-[13px] leading-tight pl-4 py-[2px] hover:bg-slate-800/40 transition-colors rounded -ml-1 px-1">
        {nodeKey && (
          <span className="text-[#4E8E5E] mr-2">
            {isJson ? `"${nodeKey}":` : `${nodeKey}:`}
          </span>
        )}
        {data === null && <span className="text-amber-500">null</span>}
        {typeof data === 'boolean' && <span className="text-amber-500">{data ? 'true' : 'false'}</span>}
        {typeof data === 'number' && <span className="text-blue-400 font-bold">{data}</span>}
        {typeof data === 'string' && (
          <span className="text-slate-200 break-all">{isJson ? `"${data}"` : data}</span>
        )}
        {isJson && !isLast && <span className="text-slate-500">,</span>}
      </div>
    );
  }

  // arrays
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return (
        <div className="flex font-mono text-[13px] leading-tight pl-4 py-[2px] hover:bg-slate-800/40 transition-colors rounded -ml-1 px-1">
          {nodeKey && (
             <span className="text-[#4E8E5E] mr-2">
               {isJson ? `"${nodeKey}":` : `${nodeKey}:`}
             </span>
          )}
          <span className="text-slate-400">{isJson ? '[]' : 'Empty Array'}</span>
          {isJson && !isLast && <span className="text-slate-500">,</span>}
        </div>
      );
    }
    return (
      <div className="font-mono text-[13px] leading-tight">
        <div 
          className="flex items-center cursor-pointer hover:bg-slate-800/40 rounded px-1 -ml-1 transition-colors select-none py-[2px]"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="w-4 h-4 flex items-center justify-center text-slate-500 hover:text-slate-200 transition-colors">
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
          {nodeKey && (
             <span className="text-[#4E8E5E] mr-2">
               {isJson ? `"${nodeKey}":` : `${nodeKey}`}
             </span>
          )}
          {isJson && <span className="text-slate-400">[</span>}
          {!expanded && (
            <span className="text-slate-500 ml-2 italic text-[11px]">
              {data.length} {data.length === 1 ? 'item' : 'items'}{isJson ? ']' : ''}
            </span>
          )}
        </div>
        {expanded && (
          <div className="pl-4 border-l border-slate-800 ml-1.5 my-[2px] hover:border-slate-700 transition-colors">
            {data.map((item, index) => (
              <JSONNode 
                key={index} 
                nodeKey={!isJson ? `[${index}]` : undefined}
                data={item} 
                isLast={index === data.length - 1} 
                mode={mode}
              />
            ))}
          </div>
        )}
        {isJson && expanded && (
          <div className="pl-4 text-slate-400">
            ]{!isLast && <span className="text-slate-500">,</span>}
          </div>
        )}
      </div>
    );
  }

  // objects
  if (typeof data === 'object') {
    const keys = Object.keys(data);
    if (keys.length === 0) {
      return (
        <div className="flex font-mono text-[13px] leading-tight pl-4 py-[2px] hover:bg-slate-800/40 transition-colors rounded -ml-1 px-1">
          {nodeKey && (
             <span className="text-[#4E8E5E] mr-2">
               {isJson ? `"${nodeKey}":` : `${nodeKey}:`}
             </span>
          )}
          <span className="text-slate-400">{isJson ? '{}' : 'Empty Object'}</span>
          {isJson && !isLast && <span className="text-slate-500">,</span>}
        </div>
      );
    }
    return (
      <div className="font-mono text-[13px] leading-tight">
        <div 
          className="flex items-center cursor-pointer hover:bg-slate-800/40 rounded px-1 -ml-1 transition-colors select-none py-[2px]"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="w-4 h-4 flex items-center justify-center text-slate-500 hover:text-slate-200 transition-colors">
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
          {nodeKey && (
             <span className="text-[#4E8E5E] mr-2">
               {isJson ? `"${nodeKey}":` : `${nodeKey}`}
             </span>
          )}
          {isJson && <span className="text-slate-400">{'{'}</span>}
          {!expanded && (
            <span className="text-slate-500 ml-2 italic text-[11px]">
              {keys.length} {keys.length === 1 ? 'key' : 'keys'}{isJson ? '}' : ''}
            </span>
          )}
        </div>
        {expanded && (
          <div className="pl-4 border-l border-slate-800 ml-1.5 my-[2px] hover:border-slate-700 transition-colors">
            {keys.map((key, index) => (
              <JSONNode 
                key={key} 
                nodeKey={key} 
                data={data[key]} 
                isLast={index === keys.length - 1} 
                mode={mode}
              />
            ))}
          </div>
        )}
        {isJson && expanded && (
          <div className="pl-4 text-slate-400">
            {'}'}{!isLast && <span className="text-slate-500">,</span>}
          </div>
        )}
      </div>
    );
  }

  return null;
};

export const JSONVisualizerTool = () => {
  const [input, setInput] = useState('{\n  "project": "DomoDomo",\n  "status": "awesome",\n  "version": 2.1,\n  "features": [\n    "Zero-Server",\n    "Local First"\n  ],\n  "config": {\n    "dark_mode": true\n  }\n}');
  const [mode, setMode] = useState<ViewMode>('object');
  
  const { parsed, error, stats } = useMemo(() => {
    if (!input.trim()) return { parsed: null, error: '', stats: null };
    try {
      const parsedData = JSON.parse(input);
      let objects = 0;
      let arrays = 0;
      let values = 0;

      const traverse = (obj: any) => {
        if (obj === null) {
          values++;
        } else if (Array.isArray(obj)) {
          arrays++;
          obj.forEach(traverse);
        } else if (typeof obj === 'object') {
          objects++;
          Object.values(obj).forEach(traverse);
        } else {
          values++;
        }
      };
      
      traverse(parsedData);
      
      return { parsed: parsedData, error: '', stats: { objects, arrays, values } };
    } catch (e: any) {
      return { parsed: null, error: e.message, stats: null };
    }
  }, [input]);

  return (
    <div className="flex flex-col gap-8 text-left">
      
      {/* Stats Card */}
      {parsed !== null && stats !== null && !error && (
        <div className="bg-[#151C2C]/50 border border-slate-800 rounded-xl px-6 py-4 flex flex-wrap items-center justify-start gap-8 md:gap-12 w-full shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4E8E5E] shadow-[0_0_5px_rgba(78,142,94,0.5)]"></span>
            <span className="text-slate-200 font-bold">{stats.objects}</span> <span className="text-slate-500 text-sm">objects</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]"></span>
            <span className="text-slate-200 font-bold">{stats.arrays}</span> <span className="text-slate-500 text-sm">arrays</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_5px_rgba(96,165,250,0.5)]"></span>
            <span className="text-slate-200 font-bold">{stats.values}</span> <span className="text-slate-500 text-sm">values</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Input Section */}
      <div className="lg:col-span-6 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4 h-[600px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileJson className="text-[#4E8E5E]" size={22} />
                <span>Raw JSON</span>
              </h2>
            </div>
          </div>

          <div className="flex-1 bg-slate-950/20 border border-slate-850 rounded-2xl p-5 focus-within:border-[#4E8E5E] transition-colors flex flex-col">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your JSON here..."
              className="w-full h-full bg-transparent text-[13px] text-slate-200 font-mono focus:outline-none resize-none custom-scrollbar"
              spellCheck={false}
            />
          </div>
        </div>
      </div>

      {/* Visualizer Section */}
      <div className="lg:col-span-6 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4 h-[600px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Interactive Tree</span>
              {error ? (
                <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[10px] font-bold border border-rose-500/20 shadow-sm animate-pulse ml-2">
                  Invalid JSON
                </span>
              ) : parsed !== null ? (
                <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 text-[10px] font-bold border border-teal-500/20 flex items-center gap-1 shadow-sm ml-2">
                  <Check size={10} /> Valid
                </span>
              ) : null}
            </h2>
            
            <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
              <button
                onClick={() => setMode('json')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                  mode === 'json'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                JSON
              </button>
              <button
                onClick={() => setMode('object')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                  mode === 'object'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Object
              </button>
            </div>
          </div>

          <div className="flex-1 bg-slate-950/20 border border-slate-850 rounded-2xl p-5 overflow-auto custom-scrollbar">
            {error ? (
              <div className="flex items-center gap-2 text-rose-400 text-sm bg-rose-950/20 p-4 rounded-xl border border-rose-900/30">
                <AlertCircle size={16} />
                <span className="font-mono text-xs">{error}</span>
              </div>
            ) : parsed !== null ? (
              <div className="text-left text-slate-200">
                {mode === 'object' && <div className="pl-4 font-mono text-[13px] text-[#4E8E5E] font-bold mb-1 -ml-1">root</div>}
                <div className={mode === 'object' ? 'pl-2 border-l border-slate-800 ml-3 hover:border-slate-700 transition-colors' : ''}>
                  <JSONNode data={parsed} isLast={true} mode={mode} />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm italic">
                Awaiting input...
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
