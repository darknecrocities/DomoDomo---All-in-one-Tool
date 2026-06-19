import { handleTextCopy } from '../../utils/sharedHelpers';
import { useState } from 'react';



export const JSONFormatterTool = () => {
  const [input, setInput] = useState('{"name":"DomoDomo","version":"1.0.0"}');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleFormat = () => {
    try {
      setError('');
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">JSON Formatter</h3>
      <textarea value={input} onChange={(e) => setInput(e.target.value)} className="bg-slate-900 border border-slate-800 rounded p-3 text-xs font-mono h-24 text-slate-200 resize-none" />
      <button onClick={handleFormat} className="btn-primary w-full py-2 text-xs">Beautify JSON</button>
      {error && <div className="text-rose-400 text-xs">{error}</div>}
      {output && (
        <div className="flex flex-col gap-2 mt-2">
          <textarea readOnly value={output} className="bg-slate-950 p-3 text-xs font-mono h-32 rounded border border-slate-800 text-emerald-400 resize-none" />
          <button onClick={() => handleTextCopy(output, setCopied)} className="btn-secondary py-1.5 text-xs">
            {copied ? 'Copied!' : 'Copy Result'}
          </button>
        </div>
      )}
    </div>
  );
};
