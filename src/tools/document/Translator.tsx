import { useState } from 'react';



export const TranslatorTool = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');

  const handleTranslate = () => {
    if (!text) return;
    // Simple offline dictionary translator stub
    setResult(text.split(' ').map(w => w + '-local').join(' '));
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">Translator (Local)</h3>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter English text to translate..." className="bg-slate-900 border border-slate-800 rounded p-3 text-xs h-24 text-slate-200 resize-none focus:outline-none" />
      <button onClick={handleTranslate} className="btn-primary w-full py-2 text-xs">Translate</button>
      {result && (
        <div className="bg-slate-950 p-3 rounded text-xs text-slate-350 border border-slate-850 mt-2 whitespace-pre-wrap">{result}</div>
      )}
    </div>
  );
};
