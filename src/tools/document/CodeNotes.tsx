import { triggerTextDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';



export const CodeNotesTool = () => {
  const [code, setCode] = useState('// Write code snippet here\nfunction test() {\n  console.log("local notes");\n}');
  const [lang, setLang] = useState('javascript');

  return (
    <div className="max-w-2xl mx-auto glass-card p-6 flex flex-col gap-4 text-left h-[450px]">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">Code Notes Editor</h3>
      <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 font-semibold max-w-[150px]">
        <option value="javascript">JavaScript</option>
        <option value="python">Python</option>
        <option value="html">HTML</option>
      </select>
      <textarea value={code} onChange={(e) => setCode(e.target.value)} className="flex-1 bg-slate-950/20 border border-slate-850 rounded p-3.5 text-xs font-mono resize-none focus:outline-none focus:border-[#4E8E5E] text-slate-350 h-64" />
      <button onClick={() => triggerTextDownload(code, `code_snippet.${lang === 'javascript' ? 'js' : lang === 'python' ? 'py' : 'html'}`)} className="btn-primary py-2 text-xs">Save Code Note</button>
    </div>
  );
};
