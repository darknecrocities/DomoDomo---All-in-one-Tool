import { useState } from 'react';



export const CitationGeneratorTool = () => {
  const [title, setTitle] = useState('DomoDomo Project');
  const [author, setAuthor] = useState('Parejas, A.');
  const [year, setYear] = useState('2026');
  const [citation, setCitation] = useState('');

  const handleGenerate = () => {
    setCitation(`${author} (${year}). ${title}. DomoDomo Publications.`);
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">APA Citation Generator</h3>
      <input type="text" placeholder="Author" value={author} onChange={(e) => setAuthor(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200" />
      <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200" />
      <input type="text" placeholder="Year" value={year} onChange={(e) => setYear(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200" />
      <button onClick={handleGenerate} className="btn-primary w-full py-2 text-xs">Generate Citation</button>
      {citation && (
        <div className="bg-slate-950 p-3 rounded text-xs text-slate-350 border border-slate-850 mt-2 font-mono">{citation}</div>
      )}
    </div>
  );
};
