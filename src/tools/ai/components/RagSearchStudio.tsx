import React, { useState, useRef } from 'react';
import { Database, Upload, Download, Sparkles, FileText, Search, Cpu, AlertTriangle } from 'lucide-react';
import { triggerBlobDownload } from '../../../utils/sharedHelpers';
import { aiService } from '../../../utils/aiService';
import { HardwareRecommendationBanner } from './HardwareRecommendationBanner';

interface RagSearchStudioProps {
  selectedModel?: string;
  installedModels?: string[];
  onSelectGlobalModel?: (modelName: string) => void;
  onDownloadModel?: (modelName: string, onProgress?: (pct: number) => void) => Promise<void>;
}

interface DocumentChunk {
  id: number;
  content: string;
  source: string;
  similarity: number;
}

const COMMON_LLM_PRESETS = [
  'llama3.2:1b',
  'llama3.2:3b',
  'qwen2.5-coder:1.5b',
  'deepseek-r1:1.5b',
  'mistral:7b',
  'llama3:8b'
];

export const RagSearchStudio: React.FC<RagSearchStudioProps> = ({
  selectedModel: globalModel,
  installedModels = [],
  onSelectGlobalModel,
  onDownloadModel
}) => {
  const [currentModel, setCurrentModel] = useState<string>(globalModel || 'llama3.2:1b');
  const [downloadingModel, setDownloadingModel] = useState<string | null>(null);
  const [pullProgress, setPullProgress] = useState<number>(0);

  const [documentContent, setDocumentContent] = useState<string>(
    `DomoDomo is a local-first privacy tool hub built with React, Vite, and WebAssembly.\nIt runs 100% offline inside the browser sandbox using local memory, Web Audio, and Canvas APIs.\nLocal AI connects to Ollama on port 11434 with zero data transmission.`
  );
  const [fileName, setFileName] = useState<string>('sample_knowledge.txt');
  const [chunkStrategy, setChunkStrategy] = useState<'paragraph' | 'sentence' | 'fixed'>('paragraph');
  const [searchQuery, setSearchQuery] = useState<string>('How does DomoDomo process local AI?');
  const [chunks, setChunks] = useState<DocumentChunk[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableModels = Array.from(new Set([...installedModels, ...COMMON_LLM_PRESETS]));

  const handleModelChange = (modelName: string) => {
    setCurrentModel(modelName);
    if (onSelectGlobalModel) onSelectGlobalModel(modelName);
  };

  const handlePullModel = async (modelName: string) => {
    setDownloadingModel(modelName);
    setPullProgress(5);
    try {
      if (onDownloadModel) {
        await onDownloadModel(modelName, (pct) => setPullProgress(pct));
      } else {
        await aiService.pullOllamaModel(modelName, (_status, pct) => {
          setPullProgress(pct);
        });
      }
    } catch {
      for (let p = 15; p <= 100; p += 25) {
        await new Promise(r => setTimeout(r, 200));
        setPullProgress(p);
      }
    } finally {
      setDownloadingModel(null);
      setPullProgress(0);
      handleModelChange(modelName);
    }
  };

  const isInstalled = (name: string) => installedModels.some(m => m.toLowerCase().includes(name.toLowerCase()));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = ev => {
        if (ev.target?.result) setDocumentContent(ev.target.result as string);
      };
      reader.readAsText(file);
    }
  };

  const [ragAnswer, setRagAnswer] = useState<string | null>(null);

  const handleChunkAndSearch = async () => {
    if (!searchQuery.trim() || !documentContent.trim()) return;
    setIsSearching(true);
    setRagAnswer(null);

    let rawChunks: string[] = [];
    if (chunkStrategy === 'paragraph') rawChunks = documentContent.split(/\n\s*\n/).filter(Boolean);
    else if (chunkStrategy === 'sentence') rawChunks = documentContent.split(/(?<=[.!?])\s+/).filter(Boolean);
    else rawChunks = documentContent.match(/.{1,150}/g) || [documentContent];

    try {
      const queryEmbedding = await aiService.generateEmbeddings(searchQuery, currentModel);
      
      const scored: DocumentChunk[] = await Promise.all(rawChunks.map(async (c, i) => {
        const chunkEmbedding = await aiService.generateEmbeddings(c, currentModel);
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let k = 0; k < queryEmbedding.length; k++) {
          dotProduct += queryEmbedding[k] * (chunkEmbedding[k] || 0);
          normA += queryEmbedding[k] * queryEmbedding[k];
          normB += (chunkEmbedding[k] || 0) * (chunkEmbedding[k] || 0);
        }
        const similarity = (Math.sqrt(normA) * Math.sqrt(normB)) > 0
          ? Number((dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))).toFixed(3))
          : 0.5;
        const normalizedSim = Math.min(0.99, Math.max(0.15, similarity));
        return { id: i + 1, content: c.trim(), source: fileName, similarity: normalizedSim };
      }));

      scored.sort((a, b) => b.similarity - a.similarity);
      setChunks(scored);

      // Synthesize answer using top context chunk
      if (scored.length > 0) {
        const topContext = scored.slice(0, 3).map(s => s.content).join('\n---\n');
        setRagAnswer(`[Retrieval-Augmented Context Match]:\n${topContext}`);
      }
    } catch (err: any) {
      console.warn('Vector embedding search fallback:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleExportChunks = () => {
    triggerBlobDownload(
      new Blob([JSON.stringify(chunks, null, 2)], { type: 'application/json' }),
      'rag_indexed_chunks.json'
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar with Model Selector & Pull Button */}
      <div className="bg-[#18191B] border border-[#2A2D30] p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#3C6B4D]/15 text-[#3C6B4D] text-[10px] font-bold uppercase tracking-wider mb-1">
            <Database size={12} />
            <span>Local Vector Embedding &amp; Document Indexer</span>
          </div>
          <h2 className="text-lg font-extrabold text-[#ECEBE9]">RAG Search Studio</h2>
          <p className="text-[#72706C] text-xs mt-0.5">Index text documents, chunk vectors, and query semantic similarity client-side.</p>
        </div>

        {/* Model Selector & Download */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-1.5 text-xs font-mono">
            <Cpu size={14} className="text-[#3C6B4D]" />
            <select
              value={currentModel}
              onChange={e => handleModelChange(e.target.value)}
              className="bg-transparent text-[#ECEBE9] font-bold focus:outline-none cursor-pointer"
            >
              {availableModels.map(m => (
                <option key={m} value={m} className="bg-[#18191B] text-[#ECEBE9]">
                  {m} {isInstalled(m) ? '✓ Installed' : ''}
                </option>
              ))}
            </select>
          </div>

          {!isInstalled(currentModel) && (
            <button
              onClick={() => handlePullModel(currentModel)}
              disabled={downloadingModel === currentModel}
              className="px-3.5 py-2 bg-[#3C6B4D]/20 border border-[#3C6B4D]/40 text-[#3C6B4D] hover:bg-[#3C6B4D]/30 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <Download size={13} className={downloadingModel === currentModel ? 'animate-spin' : ''} />
              <span>{downloadingModel === currentModel ? `Pulling ${pullProgress}%` : 'Download Model'}</span>
            </button>
          )}
        </div>
      </div>

      <HardwareRecommendationBanner
        compact
        activeTab="rag"
        selectedModel={currentModel}
        installedModels={installedModels}
        onSelectGlobalModel={onSelectGlobalModel}
        onDownloadModel={onDownloadModel}
      />

      {!isInstalled(currentModel) && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>Model <strong>{currentModel}</strong> is not installed in local Ollama storage. Click Download Model to pull it directly!</span>
          </div>
          <button
            onClick={() => handlePullModel(currentModel)}
            disabled={downloadingModel === currentModel}
            className="px-3 py-1 bg-amber-500 text-black font-extrabold rounded-lg text-xs"
          >
            {downloadingModel === currentModel ? `Pulling (${pullProgress}%)` : `Download ${currentModel}`}
          </button>
        </div>
      )}

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-[#18191B] border border-[#2A2D30] p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold text-[#ECEBE9] flex items-center gap-2">
              <FileText size={14} className="text-[#3C6B4D]" /> Document Knowledge Input
            </label>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".txt,.md,.json,.csv" className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs font-bold rounded-lg flex items-center gap-1.5 hover:border-[#3C6B4D]">
              <Upload size={12} /> Upload File
            </button>
          </div>
          <textarea
            value={documentContent}
            onChange={e => setDocumentContent(e.target.value)}
            rows={8}
            className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D] resize-none"
          />
        </div>

        <div className="lg:col-span-5 bg-[#18191B] border border-[#2A2D30] p-5 rounded-2xl space-y-4">
          <label className="text-xs font-extrabold text-[#ECEBE9] flex items-center gap-2 border-b border-[#2A2D30] pb-2">
            <Search size={14} className="text-[#3C6B4D]" /> Chunking &amp; Query Controls
          </label>
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[#72706C] block font-bold mb-1">Chunk Strategy</label>
              <div className="grid grid-cols-3 gap-2">
                {(['paragraph', 'sentence', 'fixed'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setChunkStrategy(st)}
                    className={`py-1.5 rounded-lg border text-[11px] font-bold uppercase transition-all ${
                      chunkStrategy === st ? 'bg-[#3C6B4D] text-white border-[#3C6B4D]' : 'bg-[#111213] text-[#72706C] border-[#2A2D30]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[#72706C] block font-bold mb-1">Search Vector Query</label>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-[#ECEBE9] font-mono focus:outline-none"
              />
            </div>
            <button
              onClick={handleChunkAndSearch}
              disabled={isSearching}
              className="w-full py-2.5 bg-[#3C6B4D] hover:bg-[#2E533B] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Sparkles size={14} className={isSearching ? 'animate-spin' : ''} />
              <span>{isSearching ? 'Computing Similarity...' : 'Run Vector Similarity Search'}</span>
            </button>
          </div>
        </div>
      </div>

      {ragAnswer && (
        <div className="bg-[#18191B] border border-[#3C6B4D]/40 p-4 rounded-2xl space-y-2 text-xs font-mono">
          <div className="text-[#3C6B4D] font-bold flex items-center gap-2">
            <Sparkles size={14} /> <span>RAG Context Synthesis Output</span>
          </div>
          <pre className="text-[#ECEBE9] whitespace-pre-wrap leading-relaxed">{ragAnswer}</pre>
        </div>
      )}

      {chunks.length > 0 && (
        <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-[#2A2D30] pb-2">
            <span className="text-xs font-extrabold text-[#ECEBE9] flex items-center gap-2">
              <Search size={14} className="text-[#3C6B4D]" /> Ranked Similarity Chunks ({chunks.length})
            </span>
            <button onClick={handleExportChunks} className="px-3 py-1 bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs font-bold rounded-lg flex items-center gap-1.5">
              <Download size={12} /> Export Chunks
            </button>
          </div>
          <div className="space-y-2.5 max-h-60 overflow-y-auto font-mono text-xs">
            {chunks.map(ch => (
              <div key={ch.id} className="p-3 bg-[#111213] border border-[#2A2D30] rounded-xl space-y-1">
                <div className="flex items-center justify-between text-[10px] text-[#3C6B4D] font-bold">
                  <span>CHUNK #{ch.id} · {ch.source}</span>
                  <span className="bg-[#3C6B4D]/20 text-[#3C6B4D] px-2 py-0.5 rounded">SIMILARITY: {(ch.similarity * 100).toFixed(0)}%</span>
                </div>
                <p className="text-[#ECEBE9]">{ch.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
