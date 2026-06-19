import { useState } from 'react';


export const AITranslatorTool = () => {
  const [text, setText] = useState('good morning');
  const [output, setOutput] = useState('');

  const handleTranslate = () => {
    if (text.toLowerCase().includes('morning')) {
      setOutput('Magandang umaga (Tagalog) / Ohayou (Japanese)');
    } else {
      setOutput('Translation: ' + text + '-translated');
    }
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">AI Translator</h3>
      <input type="text" value={text} onChange={(e) => setText(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200" />
      <button onClick={handleTranslate} className="btn-primary w-full py-2 text-xs">Translate Text</button>
      {output && <div className="bg-slate-950 p-3 rounded border border-slate-850 text-xs text-slate-350 font-semibold mt-2">{output}</div>}
    </div>
  );
};
