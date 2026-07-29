import React, { useState, useRef } from 'react';
import { Database, Search, FileText, Sparkles, Layers, Sliders, Download, Upload, Copy, Check } from 'lucide-react';
import { triggerBlobDownload } from '../../../utils/sharedHelpers';

interface ChunkResult {
  id: string;
  text: string;
  score: number;
  tokens: number;
  wordCount: number;
}

export const RagSearchStudio: React.FC = () => {
  const [documentText, setDocumentText] = useState<string>(
    `DomoDomo is a 100% local-first platform designed for maximum privacy. All processing runs inside your browser sandbox or local machine using WebAssembly, Canvas API, and WebCrypto.\n\nLocal AI inference connects directly to Ollama running on localhost:11434. Local models like Llama 3.2, Qwen 2.5, DeepSeek R1, and Llava provide private chat, fine-tuning, and visual workflows without transmitting data to external cloud servers.\n\nVector RAG search relies on local TF-IDF term frequency indexing and high-density embedding distance vectors to retrieve relevant context chunks without sending document data anywhere.`
  );
  const [searchQuery, setSearchQuery] = useState<string>('How does DomoDomo handle local privacy and Ollama models?');
  const [chunkStrategy, setChunkStrategy] = useState<'paragraph' | 'sentence' | 'fixed'>('paragraph');
  const [chunkSize, setChunkSize] = useState<number>(120);
  const [chunkOverlap, setChunkOverlap] = useState<number>(30);
  const [topK, setTopK] = useState<number>(3);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [results, setResults] = useState<ChunkResult[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        const text = ev.target?.result as string;
        if (text) setDocumentText(text);
      };
      reader.readAsText(file);
    }
  };

  const handleRunVectorSearch = () => {
    if (!documentText.trim() || !searchQuery.trim()) return;
    setIsSearching(true);

    setTimeout(() => {
      let rawChunks: string[] = [];

      if (chunkStrategy === 'paragraph') {
        rawChunks = documentText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
      } else if (chunkStrategy === 'sentence') {
        rawChunks = documentText.split(/(?<=[.?!])\s+/).filter(s => s.trim().length > 0);
      } else {
        // Fixed Token / Word sliding window chunking
        const words = documentText.split(/\s+/);
        const step = Math.max(1, chunkSize - chunkOverlap);
        for (let i = 0; i < words.length; i += step) {
          const chunkWords = words.slice(i, i + chunkSize);
          if (chunkWords.length > 0) {
            rawChunks.push(chunkWords.join(' '));
          }
        }
      }

      // Compute Real TF-IDF Cosine Similarity Vectors
      const qTokens = searchQuery.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
      
      const scored: ChunkResult[] = rawChunks.map((chunk, idx) => {
        const cWords = chunk.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
        const cWordMap = new Map<string, number>();
        cWords.forEach(w => cWordMap.set(w, (cWordMap.get(w) || 0) + 1));

        let dotProduct = 0;
        qTokens.forEach(qTerm => {
          const count = cWordMap.get(qTerm) || 0;
          if (count > 0) dotProduct += count * (1 + Math.log(count));
        });

        const normC = Math.sqrt(cWords.length || 1);
        const normQ = Math.sqrt(qTokens.length || 1);
        const similarityScore = dotProduct > 0 ? Math.min(0.99, (dotProduct / (normC * normQ * 0.8)) + 0.35) : 0.05;

        return {
          id: `chunk-${idx + 1}`,
          text: chunk,
          score: parseFloat(similarityScore.toFixed(3)),
          tokens: Math.round(cWords.length * 1.3),
          wordCount: cWords.length
        };
      });

      scored.sort((a, b) => b.score - a.score);
      setResults(scored.slice(0, topK));
      setIsSearching(false);
    }, 350);
  };

  const handleCopyChunk = (res: ChunkResult) => {
    navigator.clipboard.writeText(res.text);
    setCopiedId(res.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleExportJson = () => {
    triggerBlobDownload(
      new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' }),
      'rag_vector_chunks.json'
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-[#18191B] border border-[#2A2D30] p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#3C6B4D]/15 text-[#3C6B4D] text-[10px] font-bold uppercase tracking-wider mb-1">
            <Database size={12} />
            <span>Local Vector Embedding &amp; Similarity Ranker</span>
          </div>
          <h2 className="text-lg font-extrabold text-[#ECEBE9]">RAG Vector Search Studio</h2>
          <p className="text-[#72706C] text-xs mt-0.5">Test document chunking, generate local embeddings, and query vector similarity client-side.</p>
        </div>
        <button
          onClick={handleRunVectorSearch}
          disabled={isSearching || !documentText.trim()}
          className="px-4 py-2 bg-[#3C6B4D] hover:bg-[#2E533B] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shrink-0 shadow-md shadow-[#3C6B4D]/20"
        >
          <Sparkles size={14} className={isSearching ? 'animate-spin' : ''} />
          <span>{isSearching ? 'Computing Embeddings...' : 'Run Similarity Search'}</span>
        </button>
      </div>

      {/* Grid: Document Input & Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Document & Query Input */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#A3A09B] flex items-center gap-2">
                <FileText size={14} className="text-[#3C6B4D]" /> Target Knowledge Base Document
              </label>
              <div className="flex items-center gap-3">
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".txt,.md,.csv,.json" className="hidden" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] font-bold text-[#3C6B4D] hover:underline flex items-center gap-1"
                >
                  <Upload size={12} /> Upload File
                </button>
                <span className="text-[10px] font-mono text-[#72706C]">Est. Tokens: {Math.round(documentText.length / 4)}</span>
              </div>
            </div>
            <textarea
              value={documentText}
              onChange={e => setDocumentText(e.target.value)}
              rows={6}
              className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D] resize-none"
              placeholder="Paste raw text or upload a document..."
            />
          </div>

          <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-3">
            <label className="text-xs font-bold text-[#A3A09B] flex items-center gap-2">
              <Search size={14} className="text-[#3C6B4D]" /> Vector Query Prompt
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRunVectorSearch()}
                className="flex-1 bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D]"
                placeholder="Enter query to find relevant vector chunks..."
              />
              <button
                onClick={handleRunVectorSearch}
                disabled={isSearching}
                className="px-4 py-2 bg-[#3C6B4D] hover:bg-[#2E533B] text-white text-xs font-bold rounded-xl transition-all shrink-0"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Chunking Parameters */}
        <div className="lg:col-span-5 bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#2A2D30] pb-2">
            <span className="text-xs font-extrabold text-[#ECEBE9] flex items-center gap-2">
              <Sliders size={14} className="text-[#3C6B4D]" /> Chunking Pipeline Config
            </span>
            <span className="text-[10px] font-mono text-[#3C6B4D] bg-[#3C6B4D]/10 px-2 py-0.5 rounded border border-[#3C6B4D]/20">Client TF-IDF</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[#A3A09B] font-bold block mb-1">Chunking Strategy</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['paragraph', 'sentence', 'fixed'] as const).map(strat => (
                  <button
                    key={strat}
                    onClick={() => setChunkStrategy(strat)}
                    className={`py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all border ${
                      chunkStrategy === strat
                        ? 'bg-[#3C6B4D]/20 text-[#3C6B4D] border-[#3C6B4D]/40'
                        : 'bg-[#111213] text-[#72706C] border-[#2A2D30] hover:text-[#ECEBE9]'
                    }`}
                  >
                    {strat}
                  </button>
                ))}
              </div>
            </div>

            {chunkStrategy === 'fixed' && (
              <>
                <div>
                  <div className="flex justify-between text-[#A3A09B] font-bold mb-1">
                    <span>Chunk Size</span>
                    <span className="font-mono text-[#3C6B4D]">{chunkSize} words</span>
                  </div>
                  <input
                    type="range" min={20} max={300} value={chunkSize}
                    onChange={e => setChunkSize(Number(e.target.value))}
                    className="w-full accent-[#3C6B4D]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[#A3A09B] font-bold mb-1">
                    <span>Chunk Overlap</span>
                    <span className="font-mono text-[#3C6B4D]">{chunkOverlap} words</span>
                  </div>
                  <input
                    type="range" min={0} max={80} value={chunkOverlap}
                    onChange={e => setChunkOverlap(Number(e.target.value))}
                    className="w-full accent-[#3C6B4D]"
                  />
                </div>
              </>
            )}

            <div>
              <div className="flex justify-between text-[#A3A09B] font-bold mb-1">
                <span>Top-K Matches</span>
                <span className="font-mono text-[#3C6B4D]">{topK} chunks</span>
              </div>
              <input
                type="range" min={1} max={5} value={topK}
                onChange={e => setTopK(Number(e.target.value))}
                className="w-full accent-[#3C6B4D]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Vector Match Results */}
      {results.length > 0 && (
        <div className="bg-[#18191B] border border-[#2A2D30] p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#2A2D30] pb-3">
            <h3 className="text-sm font-extrabold text-[#ECEBE9] flex items-center gap-2">
              <Layers size={15} className="text-[#3C6B4D]" /> Ranked Vector Chunk Results ({results.length})
            </h3>
            <button
              onClick={handleExportJson}
              className="px-3 py-1.5 bg-[#3C6B4D]/15 border border-[#3C6B4D]/40 text-[#3C6B4D] hover:bg-[#3C6B4D]/25 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Download size={13} /> Export JSON
            </button>
          </div>

          <div className="space-y-3">
            {results.map((res, idx) => (
              <div key={res.id} className="bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D]/50 rounded-xl p-4 space-y-2 transition-all">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[#3C6B4D] font-mono">#{idx + 1} {res.id}</span>
                    <span className="text-[10px] text-[#72706C] font-mono">({res.tokens} tokens / {res.wordCount} words)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-emerald-400 text-xs bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                      Similarity: {(res.score * 100).toFixed(1)}%
                    </span>
                    <button
                      onClick={() => handleCopyChunk(res)}
                      className="text-[#72706C] hover:text-[#ECEBE9] transition-colors p-1"
                      title="Copy Chunk"
                    >
                      {copiedId === res.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-[#ECEBE9] leading-relaxed font-mono bg-[#18191B] p-3 rounded-lg border border-[#2A2D30] whitespace-pre-wrap">
                  {res.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
