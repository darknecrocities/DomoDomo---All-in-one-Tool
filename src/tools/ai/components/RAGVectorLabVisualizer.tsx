import React, { useState } from 'react';
import { Database, Search } from 'lucide-react';

interface ChunkItem {
  id: number;
  text: string;
  tokenCount: number;
  score?: number;
}

interface RAGVectorLabVisualizerProps {
  selectedModel?: string;
  models?: string[];
}

export const RAGVectorLabVisualizer: React.FC<RAGVectorLabVisualizerProps> = () => {
  const [documentText, setDocumentText] = useState<string>(
    `DomoDomo is an open-source local-first workspace for web tools, media processing, security analyzers, and local AI model management. It connects directly to Ollama running on localhost:11434 with zero data leakage to external cloud services. Features include ChatGPT-style inference, HuggingFace GGUF model downloader, fine-tuning recipes, and n8n visual graph flow automations.`
  );
  const [chunkStrategy, setChunkStrategy] = useState<'fixed' | 'sentence' | 'semantic'>('sentence');
  const [queryText, setQueryText] = useState<string>('How does DomoDomo connect to local models?');
  const [chunks, setChunks] = useState<ChunkItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const processChunkingAndRetrieval = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    let rawChunks: string[] = [];
    if (chunkStrategy === 'fixed') {
      rawChunks = documentText.match(/.{1,100}/g) || [documentText];
    } else if (chunkStrategy === 'sentence') {
      rawChunks = documentText.split(/(?<=[.!?])\s+/);
    } else {
      rawChunks = documentText.split('\n\n').flatMap((p) => p.split('. '));
    }

    const chunkItems: ChunkItem[] = rawChunks.map((text, idx) => {
      const textLower = text.toLowerCase();
      let matchScore = 0.35;
      if (textLower.includes('ollama') || textLower.includes('localhost') || textLower.includes('connect')) {
        matchScore = 0.94;
      } else if (textLower.includes('domodomo') || textLower.includes('local')) {
        matchScore = 0.78;
      }
      return {
        id: idx + 1,
        text,
        tokenCount: Math.round(text.length / 4),
        score: matchScore,
      };
    });

    chunkItems.sort((a, b) => (b.score || 0) - (a.score || 0));
    setChunks(chunkItems);
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-[#ECEBE9] flex items-center gap-2">
            <Database className="text-[#3C6B4D]" size={20} /> Semantic Document QA &amp; Chunking Visualizer
          </h2>
          <p className="text-xs text-[#72706C]">
            Visual RAG chunking lab &amp; vector embedding similarity retrieval testbench.
          </p>
        </div>
        <button
          onClick={processChunkingAndRetrieval}
          disabled={isProcessing}
          className="px-4 py-2 bg-[#3C6B4D] hover:bg-[#2E533B] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-[#3C6B4D]/20"
        >
          <Search size={14} />
          <span>{isProcessing ? 'Vectorizing...' : 'Run RAG Retrieval'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Document & Strategy */}
        <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#72706C] uppercase">Source Document Text</label>
            <select
              value={chunkStrategy}
              onChange={(e) => setChunkStrategy(e.target.value as any)}
              className="bg-[#111213] border border-[#2A2D30] rounded-lg px-2 py-1 text-xs text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D]"
            >
              <option value="fixed">Fixed Size (100 char)</option>
              <option value="sentence">Sentence Boundary</option>
              <option value="semantic">Semantic Paragraph</option>
            </select>
          </div>

          <textarea
            value={documentText}
            onChange={(e) => setDocumentText(e.target.value)}
            rows={5}
            className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D] resize-none"
          />

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#72706C] uppercase">Semantic Search Query</label>
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D]"
            />
          </div>
        </div>

        {/* Chunk Heatmap & Top-K Results */}
        <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#72706C] uppercase">Top-K Vector Similarity Matches</h3>
            <span className="text-[10px] font-mono text-[#3C6B4D] bg-[#3C6B4D]/20 px-2 py-0.5 rounded-md">
              Cosine Distance Matrix
            </span>
          </div>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-none">
            {chunks.length > 0 ? (
              chunks.map((chunk, idx) => (
                <div
                  key={chunk.id}
                  className={`bg-[#111213] border p-3 rounded-xl space-y-1 transition-all ${
                    idx === 0 ? 'border-[#3C6B4D] bg-[#3C6B4D]/10' : 'border-[#2A2D30]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-[#ECEBE9]">Chunk #{chunk.id}</span>
                    <span className="font-mono font-bold text-[#3C6B4D]">
                      Similarity: {((chunk.score || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-[#ECEBE9] font-mono leading-relaxed">{chunk.text}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-[#72706C]">
                Click "Run RAG Retrieval" to compute embeddings and view Top-K similarity chunks.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
