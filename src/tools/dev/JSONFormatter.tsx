import { useState } from 'react';
import { handleTextCopy, triggerTextDownload } from '../../utils/sharedHelpers';
import { Play, Clipboard, Download, RefreshCw, AlertCircle, Check, FileText } from 'lucide-react';

export const JSONFormatterTool = () => {
  const [input, setInput] = useState('{\n  "app": "DomoDomo",\n  "version": "2.1.0",\n  "features": [\n    "Offline Resampling",\n    "Vector Visualizers",\n    "Local Checksums"\n  ],\n  "active": true\n}');
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState<'2' | '4' | 'tab'>('2');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleFormat = (mode: 'beautify' | 'minify') => {
    try {
      setError('');
      if (!input.trim()) {
        setOutput('');
        return;
      }
      const parsed = JSON.parse(input);
      
      if (mode === 'beautify') {
        const spacing = indent === '2' ? 2 : indent === '4' ? 4 : '\t';
        setOutput(JSON.stringify(parsed, null, spacing));
      } else {
        setOutput(JSON.stringify(parsed));
      }
    } catch (e: any) {
      setError(e.message || 'Invalid JSON format');
    }
  };

  const handleLoadSample = () => {
    setInput('{\n  "id": "domodomo-777",\n  "meta": {\n    "title": "Local Web Utility Hub",\n    "license": "MIT",\n    "dependencies": {\n      "lucide-react": "^0.400.0",\n      "react": "^18.0.0"\n    }\n  },\n  "tags": ["developer", "offline", "wasm"]\n}');
    setOutput('');
    setError('');
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto glass-card p-6 flex flex-col gap-6 text-left">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <FileText size={18} className="text-teal-400" />
        <div>
          <h3 className="font-bold text-teal-400 text-sm">JSON Formatter & Validator</h3>
          <p className="text-[10px] text-slate-500">Offline JSON syntax beautifier, minifier, and format checker</p>
        </div>
        <span className="ml-auto text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">Validation</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Side: Input */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Source Raw JSON</span>
            <div className="flex gap-2">
              <button onClick={handleLoadSample} className="text-[10px] text-teal-400 hover:underline">Load Sample</button>
              <span className="text-slate-600">|</span>
              <button onClick={handleClear} className="text-[10px] text-rose-400 hover:underline">Clear</button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your JSON payload here..."
            className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono h-80 text-slate-200 resize-none w-full focus:outline-none focus:border-teal-500/50"
          />
        </div>

        {/* Right Side: Output */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Output Results</span>
            {output && (
              <span className="text-[9px] text-slate-500 font-mono">Size: {output.length} characters</span>
            )}
          </div>
          {output ? (
            <textarea
              readOnly
              value={output}
              className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono h-80 text-emerald-400 resize-none w-full focus:outline-none"
            />
          ) : (
            <div className="bg-slate-950 border border-slate-800 rounded-xl h-80 flex flex-col items-center justify-center text-slate-600 text-xs text-center p-4">
              {error ? (
                <div className="flex flex-col items-center gap-2 text-rose-400">
                  <AlertCircle size={24} />
                  <span className="font-bold text-xs uppercase">Syntax Parsing Error</span>
                  <span className="text-[10px] text-slate-400 max-w-[200px] leading-relaxed break-words">{error}</span>
                </div>
              ) : (
                <span>Format or Minify input to display formatted blocks</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Settings bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-850 items-center">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-slate-550 uppercase font-semibold">Indentation Format</label>
          <div className="grid grid-cols-3 gap-1">
            {(['2', '4', 'tab'] as const).map(ind => (
              <button key={ind} onClick={() => setIndent(ind)}
                className={`py-1 text-[10px] font-bold rounded border transition-all ${
                  indent === ind ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-800 bg-slate-950 text-slate-450'
                }`}>{ind === 'tab' ? 'Tabs' : `${ind} Spaces`}</button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 sm:mt-auto">
          <button onClick={() => handleFormat('beautify')}
            className="flex-1 btn-primary py-2 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md">
            <Play size={13} /> Beautify
          </button>
          <button onClick={() => handleFormat('minify')}
            className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 py-2 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md">
            <RefreshCw size={13} /> Minify
          </button>
        </div>
      </div>

      {/* Download/Copy Actions */}
      {output && (
        <div className="flex gap-2">
          <button onClick={() => handleTextCopy(output, setCopied)}
            className="flex-1 btn-secondary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5">
            {copied ? <Check size={14} className="text-teal-400" /> : <Clipboard size={14} />}
            {copied ? 'Copied to Clipboard' : 'Copy Output'}
          </button>
          <button onClick={() => triggerTextDownload(output, 'beautified.json')}
            className="flex-1 btn-secondary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5">
            <Download size={14} /> Download .JSON File
          </button>
        </div>
      )}
    </div>
  );
};
