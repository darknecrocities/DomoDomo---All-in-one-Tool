import { useState, useRef, useEffect } from 'react';
import { Search, Loader2, Play, Sparkles, ChevronDown } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { LocalAIConfigPanel } from '../../components/LocalAIConfigPanel';

interface RankedDoc {
  text: string;
  tag: string;
  score: number;
  vector: number[];
}

export const AISemanticSearchTool = () => {
  const [documents, setDocuments] = useState<{ text: string; tag: string }[]>([
    { text: 'Vite is a fast development server and build tool.', tag: 'Vite' },
    { text: 'ONNX Runtime Web allows running machine learning models in browser tabs.', tag: 'ML' },
    { text: 'Lucide react provides beautiful icons for modern web design UI layouts.', tag: 'UI' },
    { text: 'Transformers.js compiles machine learning models into local JavaScript-accessible assets.', tag: 'ML' },
    { text: 'Vercel offers global edge deployment structures for rapid application hosting.', tag: 'Cloud' }
  ]);
  const [newDoc, setNewDoc] = useState('');
  const [newTag, setNewTag] = useState('General');
  const [query, setQuery] = useState('How do I run ML models inside the browser?');
  const [results, setResults] = useState<RankedDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [progress, setProgress] = useState(0);

  // Configuration settings config panel
  const [selectedModel, setSelectedModel] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are an assistant that produces relevant query variations for search optimization.');
  const [temperature, setTemperature] = useState(0.5);
  const [maxTokens, setMaxTokens] = useState(60);

  // Expanded features states
  const [similarityThreshold, setSimilarityThreshold] = useState(0.35);
  const [topK, setTopK] = useState(3);
  const [activeFilterTag, setActiveFilterTag] = useState('All');
  const [querySuggestions, setQuerySuggestions] = useState<string[]>([]);
  const [inspectIndex, setInspectIndex] = useState<number | null>(null);
  const [queryVector, setQueryVector] = useState<number[]>([]);


  const heatmapCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Redraw canvas heatmap when results change
  useEffect(() => {
    drawHeatmap();
  }, [results]);

  const handleAddDoc = () => {
    if (!newDoc.trim()) return;
    setDocuments(prev => [...prev, { text: newDoc.trim(), tag: newTag }]);
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
    setQueryVector([]);
    setQuerySuggestions([]);
    setStatusMsg('Initializing embedding model...');

    try {
      // 1. Initialize embedder
      await aiService.initEmbedder((status, prog) => {
        setStatusMsg(status);
        setProgress(prog);
      });

      // 2. Generate embedding for query
      setStatusMsg('Encoding query vector...');
      const qEmbedding = await aiService.getEmbedding(query.trim());
      setQueryVector(qEmbedding);

      // 3. Generate embeddings for all documents and compute similarities
      const ranked: RankedDoc[] = [];
      const filteredDocs = activeFilterTag === 'All' 
        ? documents 
        : documents.filter(d => d.tag === activeFilterTag);

      for (let i = 0; i < filteredDocs.length; i++) {
        setStatusMsg(`Encoding document vector ${i + 1}/${filteredDocs.length}...`);
        const docEmbedding = await aiService.getEmbedding(filteredDocs[i].text);
        const score = cosineSimilarity(qEmbedding, docEmbedding);
        ranked.push({ 
          text: filteredDocs[i].text, 
          tag: filteredDocs[i].tag, 
          score,
          vector: docEmbedding
        });
      }

      // 4. Sort and filter
      ranked.sort((a, b) => b.score - a.score);
      setResults(ranked);

      // 5. Query Suggestions via Local LLM (Feature 8)
      try {
        setStatusMsg('Suggesting search synonyms...');
        const prompt = `Give exactly 3 short search query synonyms for: "${query}". Return them as a comma-separated list.`;
        const res = await aiService.generateText(prompt, maxTokens, () => {}, selectedModel || undefined, {
          systemPrompt,
          temperature
        });
        const suggestions = res.split(',').map(s => s.trim().replace(/^"(.*)"$/, '$1')).filter(Boolean);
        setQuerySuggestions(suggestions);
      } catch (err) {
        console.warn('Ollama query suggestions skipped:', err);
      }

    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
      setStatusMsg('');
    }
  };

  // Bulk parser upload
  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 5);
      const parsed = lines.map(line => {
        const parts = line.split(',');
        const t = parts[0];
        const g = parts[1] ? parts[1].trim() : 'General';
        return { text: t, tag: g };
      });
      setDocuments(prev => [...prev, ...parsed]);
    };
    reader.readAsText(file);
  };

  // Export JSON pool database
  const handleExportDB = () => {
    const content = JSON.stringify(documents, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'semantic-search-pool.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Visual Heatmap drawer
  const drawHeatmap = () => {
    const canvas = heatmapCanvasRef.current;
    if (!canvas || results.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Heatmap bar chart representing similarity levels
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const barWidth = canvas.width / results.length;
    results.forEach((r, idx) => {
      const h = canvas.height * r.score;
      // Map score to color
      const alpha = Math.max(0.1, r.score);
      ctx.fillStyle = `rgba(20, 184, 166, ${alpha})`;
      ctx.fillRect(idx * barWidth, canvas.height - h, barWidth - 4, h);
      
      // Text label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '8px monospace';
      ctx.fillText(`#${idx+1}`, idx * barWidth + 2, canvas.height - 4);
    });
  };

  const uniqueTags = ['All', ...Array.from(new Set(documents.map(d => d.tag)))];

  // Filters results by similarity slider and Top-K limit
  const filteredResults = results
    .filter(r => r.score >= similarityThreshold)
    .slice(0, topK);

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-4 text-left">
      {/* Settings control panel */}
      <LocalAIConfigPanel
        systemPrompt={systemPrompt}
        onSystemPromptChange={setSystemPrompt}
        temperature={temperature}
        onTemperatureChange={setTemperature}
        maxTokens={maxTokens}
        onMaxTokensChange={setMaxTokens}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />

      <div className="glass-card p-6 flex flex-col gap-5">
        <div className="flex justify-between items-center border-b border-slate-850 pb-3">
          <h3 className="font-bold text-teal-400 flex items-center gap-2 text-base">
            <Search size={18} />
            <span>Local Semantic Search Analyzer</span>
          </h3>
        </div>

        {/* Filter tags & Search parameter configs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-450">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400">Tag filter</label>
            <select
              value={activeFilterTag}
              onChange={(e) => setActiveFilterTag(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none"
            >
              {uniqueTags.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 justify-center">
            <div className="flex justify-between">
              <span>Similarity Threshold</span>
              <span className="font-mono text-slate-350 bg-slate-900 px-1 rounded">{(similarityThreshold*100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.85"
              step="0.05"
              value={similarityThreshold}
              onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
              className="w-full accent-teal-500 bg-slate-900 h-1 rounded cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400">Top-K Results Limit</label>
            <select
              value={topK}
              onChange={(e) => setTopK(parseInt(e.target.value))}
              className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none"
            >
              <option value="1">Top 1</option>
              <option value="3">Top 3</option>
              <option value="5">Top 5</option>
              <option value="10">Top 10</option>
            </select>
          </div>
        </div>

        {/* Query Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400">Search Query</label>
          <div className="flex gap-2.5">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              placeholder="Type your semantic query..."
            />
            <button
              onClick={handleSearch}
              disabled={loading || documents.length === 0}
              className="btn-primary px-4 text-xs flex items-center gap-1.5"
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Query Suggestions */}
        {querySuggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center bg-slate-950/40 p-2.5 rounded-lg border border-slate-900 text-xs">
            <span className="text-slate-500 font-semibold flex items-center gap-0.5"><Sparkles size={11} className="text-teal-400" /> Did you mean:</span>
            {querySuggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => { setQuery(s); handleSearch(); }}
                className="text-teal-400 hover:underline bg-slate-900 border border-slate-850 px-2 py-0.5 rounded text-[10px]"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Embedding Progress */}
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

        {/* Heatmap Canvas visual chart */}
        {results.length > 0 && (
          <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3.5 flex flex-col gap-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Similarity Bar Metrics {queryVector.length > 0 && <span className="text-teal-500 normal-case">({queryVector.length}d embedding)</span>}</span>
            <canvas ref={heatmapCanvasRef} width={450} height={40} className="w-full bg-slate-950 rounded border border-slate-900" />
          </div>
        )}

        {/* Results output list */}
        {filteredResults.length > 0 && (
          <div className="flex flex-col gap-2.5 animate-fadeIn">
            <label className="text-xs font-semibold text-slate-350 font-mono">Top Matches</label>
            <div className="flex flex-col gap-2">
              {filteredResults.map((r, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/60 border border-slate-850 rounded-lg p-3 flex flex-col gap-2 transition-all hover:border-slate-800"
                >
                  <div className="flex justify-between items-start gap-4">
                    <p className="text-xs text-slate-200 leading-relaxed flex-1">{r.text}</p>
                    <div className="flex gap-2 items-center">
                      <span className="text-[8px] bg-slate-950 text-slate-500 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">{r.tag}</span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        r.score > 0.65 ? 'bg-green-950/60 text-green-400 border border-green-900/30' :
                        r.score > 0.4 ? 'bg-yellow-950/60 text-yellow-400 border border-yellow-900/30' :
                        'bg-slate-850 text-slate-450'
                      }`}>
                        {(r.score * 100).toFixed(0)}% Similarity
                      </span>
                    </div>
                  </div>

                  {/* Vector inspector button */}
                  <button
                    onClick={() => setInspectIndex(inspectIndex === idx ? null : idx)}
                    className="text-[9px] text-slate-500 hover:text-teal-400 font-mono flex items-center gap-1 mt-1 self-start"
                  >
                    <span>{inspectIndex === idx ? 'Hide Vector Array' : 'Inspect Vector Array'}</span>
                    <ChevronDown size={10} className={`transform ${inspectIndex === idx ? 'rotate-180' : ''}`} />
                  </button>

                  {inspectIndex === idx && (
                    <div className="bg-slate-950/80 p-2.5 rounded border border-slate-900 text-[9px] font-mono text-teal-300 overflow-x-auto leading-normal whitespace-pre-wrap max-h-24">
                      {`Dimension Count: 384\n[` + r.vector.slice(0, 10).map(v => v.toFixed(5)).join(', ') + `, ...]` }
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Editable pool segment */}
        <div className="flex flex-col gap-3 border-t border-slate-850 pt-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Documents Pool ({documents.length})</span>
            <div className="flex gap-2">
              <button
                onClick={handleExportDB}
                className="text-teal-400 hover:text-teal-350 text-[10px]"
              >
                Export JSON
              </button>
            </div>
          </div>

          {/* Bulk file parsing upload */}
          <div className="flex flex-col gap-1.5 text-xs font-semibold text-slate-450">
            <span className="text-[10px] text-slate-500">Bulk Load Pool (CSV: Text,Tag)</span>
            <input
              type="file"
              accept=".txt,.csv"
              onChange={handleBulkUpload}
              className="bg-slate-950 border border-slate-900 rounded px-2 py-1 text-[10px] text-slate-350"
            />
          </div>

          {/* Manual insert items inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mt-1">
            <input
              type="text"
              value={newDoc}
              onChange={(e) => setNewDoc(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddDoc()}
              className="sm:col-span-3 bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-[11px] text-slate-300 focus:outline-none"
              placeholder="Add sentence to document pool..."
            />
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-[11px] text-slate-300 focus:outline-none font-mono"
              placeholder="Tag (e.g. ML)"
            />
          </div>

          <button
            onClick={handleAddDoc}
            className="btn-primary w-full py-1 text-[11px] font-semibold"
          >
            Insert Document row
          </button>

          {/* Documents Pool List viewer */}
          <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-1">
            {documents.map((doc, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-slate-950/30 border border-slate-900 rounded px-2.5 py-1 text-[10px]"
              >
                <div className="flex gap-2 truncate items-center">
                  <span className="bg-slate-950 text-slate-500 font-mono px-1 rounded text-[8px]">{doc.tag}</span>
                  <span className="text-slate-400 truncate">{doc.text}</span>
                </div>
                <button
                  onClick={() => handleRemoveDoc(idx)}
                  className="text-red-500 hover:text-red-400 text-[10px] pl-2 font-mono"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
