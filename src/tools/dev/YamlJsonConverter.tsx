import { useState } from 'react';
import { Copy, Check, RefreshCw, Trash2 } from 'lucide-react';

export const YamlJsonConverterTool = () => {
  const [input, setInput] = useState(`title: DomoDomo App
version: 1.0.0
secure: true
tags:
  - offline
  - productivity
  - sandbox
features:
  media: true
  pdf: true
  ai: true
`);
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'yaml2json' | 'json2yaml'>('yaml2json');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const jsonToYaml = (obj: any, indent = 0): string => {
    const spaces = ' '.repeat(indent);
    if (obj === null) return 'null';
    if (typeof obj !== 'object') {
      if (typeof obj === 'string') return `"${obj.replace(/"/g, '\\"')}"`;
      return String(obj);
    }
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]';
      return obj.map(item => `\n${spaces}- ${jsonToYaml(item, indent + 2).trim()}`).join('');
    }
    return Object.entries(obj).map(([key, val]) => {
      const formattedVal = typeof val === 'object' && val !== null ? jsonToYaml(val, indent + 2) : ` ${jsonToYaml(val, indent + 2)}`;
      return `\n${spaces}${key}:${formattedVal}`;
    }).join('').trim();
  };

  const parseYamlValue = (val: string): any => {
    if (val === 'null' || val === '~') return null;
    if (val === 'true') return true;
    if (val === 'false') return false;
    if (!isNaN(Number(val)) && val !== '') return Number(val);
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      return val.slice(1, -1);
    }
    return val;
  };

  const yamlToJson = (yamlStr: string): any => {
    const lines = yamlStr.split('\n');
    const result: any = {};
    const path: { indent: number; ref: any; key?: string; isArray?: boolean }[] = [{ indent: -1, ref: result }];

    for (let line of lines) {
      if (line.trim().startsWith('#') || !line.trim()) continue;

      const indent = line.search(/\S/);
      const content = line.trim();

      while (path.length > 1 && path[path.length - 1].indent >= indent) {
        path.pop();
      }
      const parent = path[path.length - 1];

      if (content.startsWith('-')) {
        const valStr = content.slice(1).trim();
        let value: any = parseYamlValue(valStr);
        
        if (!Array.isArray(parent.ref)) {
          if (parent.key) {
            const grandParent = path[path.length - 2] || parent;
            if (!Array.isArray(grandParent.ref[parent.key])) {
              grandParent.ref[parent.key] = [];
            }
            grandParent.ref[parent.key].push(value);
            path.push({ indent, ref: grandParent.ref[parent.key], isArray: true });
          }
        } else {
          parent.ref.push(value);
        }
      } else if (content.includes(':')) {
        const colonIdx = content.indexOf(':');
        const key = content.slice(0, colonIdx).trim();
        const valStr = content.slice(colonIdx + 1).trim();

        if (valStr === '') {
          const newObj = {};
          if (Array.isArray(parent.ref)) {
            parent.ref.push(newObj);
          } else {
            parent.ref[key] = newObj;
          }
          path.push({ indent, ref: newObj, key });
        } else {
          let value: any = parseYamlValue(valStr);
          if (Array.isArray(parent.ref)) {
            parent.ref.push({ [key]: value });
          } else {
            parent.ref[key] = value;
          }
        }
      }
    }
    return result;
  };

  const handleConvert = () => {
    setError('');
    try {
      if (mode === 'yaml2json') {
        const parsed = yamlToJson(input);
        setOutput(JSON.stringify(parsed, null, 2));
      } else {
        const parsed = JSON.parse(input);
        setOutput(jsonToYaml(parsed));
      }
    } catch (err: any) {
      setError(err.message || 'Conversion failed. Please verify syntax structure.');
    }
  };

  const handleToggle = () => {
    setInput(output || '');
    setOutput(input || '');
    setMode(mode === 'yaml2json' ? 'json2yaml' : 'yaml2json');
    setError('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h3 className="text-teal-400 font-bold">YAML ↔ JSON Converter</h3>
            <button onClick={handleToggle} className="btn-secondary py-1 px-3 text-xs flex items-center gap-1.5 font-bold">
              <RefreshCw size={12} /> Swap Modes
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[300px]">
            <div className="flex flex-col gap-1.5 h-full">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {mode === 'yaml2json' ? 'YAML Input' : 'JSON Input'}
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-full bg-slate-950/20 border border-slate-850 rounded-2xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#4E8E5E] resize-none leading-relaxed outline-none"
                placeholder={mode === 'yaml2json' ? 'Enter YAML...' : 'Enter JSON...'}
              />
            </div>
            
            <div className="flex flex-col gap-1.5 h-full">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {mode === 'yaml2json' ? 'JSON Output' : 'YAML Output'}
              </label>
              <pre className="w-full h-full bg-slate-950/40 border border-slate-850 rounded-2xl p-4 text-xs font-mono text-emerald-400 overflow-auto whitespace-pre-wrap select-all leading-relaxed">
                <code>{output || 'Click Convert to see output...'}</code>
              </pre>
            </div>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/25 p-3 rounded-xl text-xs text-rose-400 font-semibold font-mono">
              Error: {error}
            </div>
          )}

          <div className="flex flex-wrap gap-2.5 mt-2 justify-between border-t border-slate-850 pt-3">
            <button onClick={handleConvert} className="btn-primary py-2 px-6 text-xs">Convert</button>
            
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                disabled={!output}
                className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5 disabled:opacity-40"
              >
                {copied ? <Check size={14} className="text-teal-400" /> : <Copy size={14} />}
                <span>Copy Output</span>
              </button>
              <button
                onClick={() => { setInput(''); setOutput(''); setError(''); }}
                className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-350 rounded border border-rose-500/20 transition-all"
                title="Clear Workspace"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3">Mode Details</h3>
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850/60 flex flex-col gap-2 text-xs">
            <div>
              <span className="text-slate-400 font-bold block">Current Direction:</span>
              <span className="text-emerald-400 font-bold font-mono">
                {mode === 'yaml2json' ? 'YAML → JSON' : 'JSON → YAML'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed mt-2 border-t border-slate-855 pt-2">
              {mode === 'yaml2json' 
                ? 'Converts YAML parameters, hierarchies, list markers, and basic values to fully indented JSON.' 
                : 'Converts nested JSON objects and arrays into structured clean YAML config lines.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
