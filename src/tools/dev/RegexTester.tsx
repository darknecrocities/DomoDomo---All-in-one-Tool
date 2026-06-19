import { useState } from 'react';



export const RegexTesterTool = () => {
  const [exp, setExp] = useState('^domo');
  const [text, setText] = useState('domodomo matches');
  const [match, setMatch] = useState(false);

  const handleTest = () => {
    try {
      const regex = new RegExp(exp, 'i');
      setMatch(regex.test(text));
    } catch (e) {
      setMatch(false);
    }
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">Regex Tester</h3>
      <input type="text" placeholder="Regex Pattern" value={exp} onChange={(e) => setExp(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200" />
      <input type="text" placeholder="Target Text" value={text} onChange={(e) => setText(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200" />
      <button onClick={handleTest} className="btn-primary w-full py-2 text-xs">Test Match</button>
      <div className={`p-3 rounded border text-xs font-semibold ${match ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-400' : 'bg-rose-950/20 border-rose-800/40 text-rose-400'}`}>
        {match ? 'Matches Successfully' : 'No Match'}
      </div>
    </div>
  );
};
