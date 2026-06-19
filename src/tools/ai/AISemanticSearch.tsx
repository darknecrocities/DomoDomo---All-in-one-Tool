import { useState } from 'react';
import { Search, Loader2, Play } from 'lucide-react';
import { aiService } from '../../utils/aiService';

interface RankedDoc {
  text: string;
  score: number;
}

export const AISemanticSearchTool = () => {
  const [documents, setDocuments] = useState<string[]>([
    'Vite is a fast development server and build tool.',
    'ONNX Runtime Web allows running machine learning models in browser tabs.',
    'Lucide react provides beautiful icons for modern web design UI layouts.',
    'Transformers.js compiles machine learning models into local JavaScript-accessible assets.',
    'Vercel offers global edge deployment structures for rapid application hosting.'
  ]);
  const [newDoc, setNewDoc] = useState('');
  const [query, setQuery] = useState('How do I run ML models inside the browser?');
  const [results, setResults] = useState<RankedDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [progress, setProgress] = useState(0);

  const handleAddDoc = () => {
    if (!newDoc.trim()) return;
    setDocuments(prev => [...prev, newDoc.trim()]);
    setNewDoc('');
  };

  const handleRemoveDoc = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
    setResults([]);
  };

  // Helper: Cosine Similarity
  const cosineSimilarity = (vecA: number[], vecB: number[]) => {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  };

  const handleSearch = async () => {
    if (!query.trim() || documents.length === 0) return;
    setLoading(true);
    setResults([]);
    setStatusMsg('Initializing embedding model...');

    try {
      // 1. Initialize embedder
      await aiService.initEmbedder((status, prog) => {
        setStatusMsg(status);
        setProgress(prog);
      });

      // 2. Generate embedding for query
      setStatusMsg('Encoding query vector...');
      const queryEmbedding = await aiService.getEmbedding(query.trim());

      // 3. Generate embeddings for all documents and compute similarities
      const ranked: RankedDoc[] = [];
      for (let i = 0; i < documents.length; i++) {
        setStatusMsg(`Encoding document vector ${i + 1}/${documents.length}...`);
        const docEmbedding = await aiService.getEmbedding(documents[i]);
        const score = cosineSimilarity(queryEmbedding, docEmbedding);
        ranked.push({ text: documents[i], score });
      }

      // 4. Sort by score descending
      ranked.sort((a, b) => b.score - a.score);
      setResults(ranked);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
      setStatusMsg('');
    }
  };

  return (
    <div className="max-w-xl mx-auto glass-card p-6 flex flex-col gap-5 text-left">
      <div className="flex justify-between items-center border-b border-slate-850 pb-3">
        <h3 className="font-bold text-teal-400 flex items-center gap-2 text-base">
          <Search size={18} />
          <span>Local Semantic Search Analyzer</span>
        </h3>
        <span className="text-[10px] bg-slate-800 text-slate-350 px-2 py-0.5 rounded border border-slate-750">
          all-MiniLM-L6-v2 Vector Model
        </span>
      </div>

      {/* Query input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-400">Search Query</label>
        <div className="flex gap-2.5">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            placeholder="Type your semantic search query..."
          />
          <button
            onClick={handleSearch}
            disabled={loading || documents.length === 0}
            className="btn-primary px-3 text-xs flex items-center gap-1"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Load progress */}
      {loading && statusMsg && (
        <div className="w-full flex flex-col gap-2 bg-slate-950/60 p-3 rounded-lg border border-slate-900 animate-pulse">
          <div className="text-[10px] font-mono text-slate-400 truncate">{statusMsg}</div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-teal-500 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Ranked Search Results */}
      {results.length > 0 && (
        <div className="flex flex-col gap-2.5 animate-fadeIn">
          <label className="text-xs font-semibold text-slate-300 font-mono">Ranked Semantic Results</label>
          <div className="flex flex-col gap-2">
            {results.map((r, idx) => (
              <div
                key={idx}
                className="bg-slate-900/60 border border-slate-850 rounded-lg p-3 flex justify-between items-start gap-4"
              >
                <p className="text-xs text-slate-200 leading-relaxed flex-1">{r.text}</p>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  r.score > 0.6 ? 'bg-green-950/60 text-green-400 border border-green-900/30' :
                  r.score > 0.35 ? 'bg-yellow-950/60 text-yellow-400 border border-yellow-900/30' :
                  'bg-slate-850 text-slate-450'
                }`}>
                  {(r.score * 100).toFixed(0)}% Similarity
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editable Document Pool */}
      <div className="flex flex-col gap-3 border-t border-slate-850 pt-4">
        <label className="text-xs font-semibold text-slate-400 flex items-center justify-between">
          <span>Documents Pool ({documents.length})</span>
          <span className="text-[9px] font-mono text-slate-500 font-normal">Vectors recalculated on search</span>
        </label>

        {/* Add Document */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newDoc}
            onChange={(e) => setNewDoc(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddDoc()}
            className="flex-1 bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-[11px] text-slate-300 focus:outline-none"
            placeholder="Add new document sentence..."
          />
          <button
            onClick={handleAddDoc}
            className="btn-primary py-1 px-3 text-[11px]"
          >
            Add
          </button>
        </div>

        {/* Documents list */}
        <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
          {documents.map((doc, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center bg-slate-950/30 border border-slate-900 rounded px-2.5 py-1.5 text-[11px]"
            >
              <span className="text-slate-400 truncate flex-1">{doc}</span>
              <button
                onClick={() => handleRemoveDoc(idx)}
                className="text-red-500 hover:text-red-400 text-[10px] pl-2"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
