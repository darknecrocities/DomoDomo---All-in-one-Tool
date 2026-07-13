import React, { useState } from 'react';
import { aiService } from '../../utils/aiService';
import { Upload, FileText, Search, BookOpen, AlertCircle, RefreshCw, HelpCircle } from 'lucide-react';

interface PdfChunk {
  text: string;
  pageNumber: number;
  fileName: string;
  embedding?: number[];
}

interface Citation {
  fileName: string;
  pageNumber: number;
  snippet: string;
}

const loadPdfJs = (): Promise<any> => {
  return new Promise((resolve) => {
    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib);
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
      script.onload = () => {
        const pdfjsLib = (window as any).pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
        resolve(pdfjsLib);
      };
      document.head.appendChild(script);
    }
  });
};

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
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
}

export const AIPDFInvestigator: React.FC = () => {
  const [pdfFiles, setPdfFiles] = useState<{ name: string; size: string }[]>([]);
  const [chunks, setChunks] = useState<PdfChunk[]>([]);
  const [statusMsg, setStatusMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [citations, setCitations] = useState<Citation[]>([]);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setStatusMsg('Loading PDF parsing libraries...');
    setChunks([]);
    setAnswer('');
    setCitations([]);

    const newFiles: { name: string; size: string }[] = [];
    const extractedChunks: PdfChunk[] = [];

    try {
      const pdfjsLib = await loadPdfJs();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type !== 'application/pdf') continue;

        newFiles.push({
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        });

        setStatusMsg(`Reading binary array for: ${file.name}...`);
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          setStatusMsg(`Extracting text page ${pageNum}/${pdf.numPages} from: ${file.name}...`);
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ').trim();
          
          if (pageText.length > 20) {
            // Split large pages into smaller sub-paragraphs if needed
            extractedChunks.push({
              text: pageText,
              pageNumber: pageNum,
              fileName: file.name
            });
          }
        }
      }

      setPdfFiles(newFiles);

      if (extractedChunks.length === 0) {
        setStatusMsg('No extractable text segments found in uploaded PDFs.');
        setIsProcessing(false);
        return;
      }

      // Generate local vector embeddings in batch mode
      setStatusMsg(`Generating local vector embeddings for ${extractedChunks.length} segments...`);
      const textsToEmbed = extractedChunks.map(c => c.text.slice(0, 1000)); // slice to avoid exceeding max dimensions
      const embeddings = await aiService.getEmbeddings(textsToEmbed);

      extractedChunks.forEach((c, idx) => {
        c.embedding = embeddings[idx];
      });

      setChunks(extractedChunks);
      setStatusMsg(`Vector catalog generated successfully. Loaded ${extractedChunks.length} memory pages.`);
    } catch (err: any) {
      console.error('Error during local PDF ingestion:', err);
      setStatusMsg(`Ingestion failed: ${err.message || String(err)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const runInvestigation = async () => {
    if (!query.trim() || chunks.length === 0) return;

    setIsSearching(true);
    setAnswer('');
    setCitations([]);
    setActiveCitation(null);

    try {
      // 1. Generate Query Vector Embedding
      const queryEmbedding = await aiService.getEmbedding(query);

      // 2. Perform Cosine Similarity scoring in browser JS
      const scored = chunks.map(chunk => {
        const score = chunk.embedding ? cosineSimilarity(queryEmbedding, chunk.embedding) : 0;
        return { chunk, score };
      });

      // Filter similarity matching > 0.25 and sort descending
      const topMatches = scored
        .filter(item => item.score > 0.25)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      if (topMatches.length === 0) {
        setAnswer('No matching context segments found in document catalog to compile answer.');
        setIsSearching(false);
        return;
      }

      // 3. Assemble RAG prompt context
      let contextStr = "Analyze these document pages to answer the question below:\n\n";
      const newCitations: Citation[] = [];

      topMatches.forEach((match) => {
        const c = match.chunk;
        contextStr += `[Document: ${c.fileName}, Page: ${c.pageNumber}]\n${c.text}\n\n`;
        newCitations.push({
          fileName: c.fileName,
          pageNumber: c.pageNumber,
          snippet: c.text
        });
      });

      setCitations(newCitations);

      // 4. Query local Ollama model
      const systemPrompt = "You are Domo PDF Investigator, a document auditing assistant. Answer the user prompt strictly based on the provided context passages. Cite documents by file name if appropriate.";
      const prompt = `${contextStr}Question: ${query}\nAnswer:`;

      const responseText = await aiService.generateText(prompt, 600, undefined, undefined, {
        systemPrompt
      });

      setAnswer(responseText);
    } catch (err: any) {
      console.error('Error querying PDF index:', err);
      setAnswer(`Investigation error: ${err.message || String(err)}`);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111213] text-[#ECEBE9] font-sans p-6 rounded-3xl border border-[#2A2D30] overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center gap-2 mb-6 border-b border-[#2A2D30] pb-6">
        <div className="p-2 rounded-xl bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/20">
          <BookOpen size={20} className="animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Domo PDF Semantic Investigator</h1>
          <p className="text-xs text-[#A3A09B]">
            Upload multiple PDF contracts or logs to parse, embed locally, and query off-grid with context-citation mapping.
          </p>
        </div>
      </div>

      {/* Main interface layout */}
      <div className="flex flex-col lg:flex-row flex-grow gap-6 min-h-0 overflow-hidden">
        {/* PDF Ingestion panel */}
        <div className="w-full lg:w-80 bg-[#18191B] border border-[#2A2D30] rounded-3xl p-5 flex flex-col justify-between overflow-hidden">
          <div className="flex-grow flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={16} className="text-[#3C6B4D]" />
              <span className="text-xs font-black tracking-wider text-[#ECEBE9]">Upload Documents</span>
            </div>

            {/* Drag Drop Area */}
            <div className="relative border-2 border-dashed border-[#2A2D30] hover:border-[#3C6B4D]/40 rounded-2xl p-6 text-center cursor-pointer hover:bg-[#111213]/25 transition-all mb-4">
              <input
                type="file"
                multiple
                accept="application/pdf"
                onChange={handleFileUpload}
                disabled={isProcessing}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="mx-auto text-[#A3A09B] mb-2 animate-bounce" size={24} />
              <div className="text-[11px] font-bold text-[#ECEBE9]">Choose PDF Files</div>
              <p className="text-[9px] text-[#A3A09B]/70 mt-0.5">Supports multi-document selections</p>
            </div>

            {/* Ingestion Status message */}
            {statusMsg && (
              <div className="flex items-start gap-2 bg-[#111213] border border-[#2A2D30]/60 p-3 rounded-2xl mb-4">
                <AlertCircle size={14} className="text-[#E29E2D] flex-shrink-0 mt-0.5" />
                <span className="text-[10px] text-[#ECEBE9]/95 leading-relaxed font-semibold">{statusMsg}</span>
              </div>
            )}

            {/* Loaded Files List */}
            {pdfFiles.length > 0 && (
              <div className="flex-grow overflow-y-auto max-h-[160px] pr-1">
                <div className="text-[9px] font-black text-[#A3A09B] mb-2 uppercase tracking-wider">Loaded Catalog</div>
                <div className="flex flex-col gap-2">
                  {pdfFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-[#111213] border border-[#2A2D30]/40 p-2.5 rounded-xl text-xs font-semibold">
                      <FileText size={14} className="text-[#3C6B4D] flex-shrink-0" />
                      <div className="truncate flex-grow text-[#ECEBE9]/90">{file.name}</div>
                      <div className="text-[10px] text-[#A3A09B]">{file.size}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Query & Dialog viewports */}
        <div className="flex-grow flex flex-col justify-between bg-[#18191B]/40 rounded-3xl border border-[#2A2D30] p-6 overflow-hidden">
          {/* Output responses */}
          <div className="flex-grow overflow-y-auto min-h-0 mb-6 pr-1 flex flex-col gap-4">
            {answer ? (
              <div className="bg-[#18191B] border border-[#2A2D30]/80 rounded-2xl p-5 text-xs font-semibold">
                <div className="text-[9px] font-black text-[#3C6B4D] uppercase mb-2 tracking-wider">Investigator Response</div>
                <p className="leading-relaxed text-[#ECEBE9]/95 font-mono whitespace-pre-wrap">
                  {answer}
                </p>

                {/* Page citations badges */}
                {citations.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#2A2D30] flex flex-wrap gap-2 items-center">
                    <span className="text-[9px] text-[#A3A09B] font-bold">SOURCE CITATIONS:</span>
                    {citations.map((cite, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveCitation(cite)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-[#3C6B4D]/10 hover:bg-[#3C6B4D]/25 border border-[#3C6B4D]/25 text-[#3C6B4D] text-[10px] font-black rounded-lg transition-all"
                      >
                        <HelpCircle size={10} />
                        {cite.fileName} (P. {cite.pageNumber})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-[#A3A09B] p-6">
                <Search size={32} className="text-[#2A2D30] mb-2" />
                <span className="text-xs font-bold text-[#ECEBE9]/70">Enter search queries to audit loaded documents.</span>
              </div>
            )}

            {/* Active Citation popup preview */}
            {activeCitation && (
              <div className="bg-[#111213] border border-[#2A2D30] rounded-2xl p-4 text-xs font-semibold relative">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] font-black text-[#E29E2D] uppercase tracking-wider">Citation Context Snippet</span>
                  <button onClick={() => setActiveCitation(null)} className="text-[10px] text-[#A3A09B] hover:text-[#ECEBE9] font-bold">Dismiss</button>
                </div>
                <p className="italic text-[#A3A09B] leading-relaxed">
                  "...{activeCitation.snippet}..."
                </p>
              </div>
            )}
          </div>

          {/* Prompt search text field */}
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isSearching || chunks.length === 0}
              onKeyDown={(e) => e.key === 'Enter' && runInvestigation()}
              className="flex-grow bg-[#18191B] border border-[#2A2D30] rounded-xl text-xs font-semibold px-4 py-3 text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D] disabled:opacity-50"
              placeholder={chunks.length > 0 ? "Ask a question about the uploaded documents..." : "Please upload PDF files to activate RAG index"}
            />
            <button
              onClick={runInvestigation}
              disabled={isSearching || !query.trim() || chunks.length === 0}
              className="flex items-center justify-center p-3 bg-[#3C6B4D] hover:bg-[#467c59] disabled:opacity-50 rounded-xl transition-all shadow-md text-[#ECEBE9]"
            >
              {isSearching ? <RefreshCw className="animate-spin" size={16} /> : <Search size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AIPDFInvestigator;
