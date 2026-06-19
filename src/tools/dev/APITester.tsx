import { useState } from 'react';



export const APITesterTool = () => {
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/todos/1');
  const [res, setRes] = useState('');

  const handleFetch = () => {
    setRes('Fetching api payload...');
    fetch(url).then(r => r.json()).then(data => setRes(JSON.stringify(data, null, 2))).catch(() => setRes('CORS block or URL error.'));
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">Local API Fetch Tester</h3>
      <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200" />
      <button onClick={handleFetch} className="btn-primary w-full py-2 text-xs">Send Request</button>
      {res && <textarea readOnly value={res} className="bg-slate-950 p-2.5 rounded border border-slate-850 text-xs font-mono text-slate-350 h-28 resize-none" />}
    </div>
  );
};
