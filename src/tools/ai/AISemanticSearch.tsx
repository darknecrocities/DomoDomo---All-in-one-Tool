import { useState } from 'react';


export const AISemanticSearchTool = () => {
  const [query, setQuery] = useState('PDF');
  const [results, setResults] = useState<string[]>([]);

  const handleSearch = () => {
    const database = [
      'Merge PDFs tool for combining files',
      'Background Remover for image masking',
      'JSON Formatter for parsing logs',
      'Split PDF tool for pages extraction'
    ];
    // Simple filter matching semantic term
    const matches = database.filter(item => item.toLowerCase().includes(query.toLowerCase()));
    setResults(matches.length > 0 ? matches : ['No semantic matches found locally.']);
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">AI Semantic Search (Local Index)</h3>
      <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200" />
      <button onClick={handleSearch} className="btn-primary w-full py-2 text-xs">Search Vector database</button>
      {results.length > 0 && (
        <div className="flex flex-col gap-1.5 mt-2 bg-slate-950 p-3 rounded border border-slate-850 text-xs text-slate-300 font-mono">
          {results.map((r, i) => <div key={i}>🔍 {r}</div>)}
        </div>
      )}
    </div>
  );
};
