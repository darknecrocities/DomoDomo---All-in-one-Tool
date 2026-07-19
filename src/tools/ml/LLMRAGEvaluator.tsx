import React, { useState } from 'react';
import { Upload, Download, Bot } from 'lucide-react';

interface RAGEvalSample {
  id: string;
  query: string;
  context: string;
  answer: string;
  faithfulness: number;
  relevance: number;
  contextRecall: number;
}

const DEFAULT_RAG_SAMPLES: RAGEvalSample[] = [
  {
    id: '1',
    query: 'What is DomoDomo local storage security policy?',
    context: 'DomoDomo executes all tools locally in the browser sandbox. Files and inputs never leave the client device.',
    answer: 'DomoDomo runs all processing strictly client-side inside your local browser sandbox without transmitting data to cloud servers.',
    faithfulness: 0.98,
    relevance: 0.95,
    contextRecall: 1.0,
  },
  {
    id: '2',
    query: 'How does t-SNE work in the embedding visualizer?',
    context: 'The embedding visualizer uses PCA and t-SNE algorithms to reduce 768-dimensional vector embeddings down to 2D coordinates.',
    answer: 'It uses PCA and t-SNE to convert high-dimensional vectors into 2D scatter plots.',
    faithfulness: 0.94,
    relevance: 0.91,
    contextRecall: 0.88,
  },
];

export const LLMRAGEvaluatorTool: React.FC = () => {
  const [samples, setSamples] = useState<RAGEvalSample[]>(DEFAULT_RAG_SAMPLES);
  const [selectedId, setSelectedId] = useState<string>('1');

  const activeSample = samples.find((s) => s.id === selectedId) || samples[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) setSamples(parsed);
      } catch (err) {
        alert('Invalid JSON. Expecting array of { query, context, answer, faithfulness, relevance, contextRecall }');
      }
    };
    reader.readAsText(e.target.files[0]);
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(samples, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'rag_evaluation_benchmark.json';
    link.click();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-110px)] bg-[#111213] text-[#ECEBE9] rounded-2xl overflow-hidden border border-[#2A2D30]">
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#18191B] border-b border-[#2A2D30]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#10B981]/20 text-[#10B981] rounded-xl border border-[#10B981]/30">
            <Bot size={20} />
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-wide text-[#ECEBE9]">LLM & RAG Model Evaluation Benchmark Studio</h2>
            <p className="text-xs text-[#72706C]">Evaluate Faithfulness, Answer Relevance, and Context Recall across RAG pipelines</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-3 py-1.5 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 text-[#ECEBE9] rounded-xl text-xs font-semibold cursor-pointer transition-all">
            <Upload size={14} />
            <span>Upload JSON Benchmark</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
          <button onClick={downloadJSON} className="px-3 py-1.5 bg-[#18191B] hover:bg-[#2A2D30] border border-[#2A2D30] text-xs font-semibold rounded-xl transition-all">
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sample Picker Sidebar */}
        <div className="w-full md:w-80 bg-[#141517] border-r border-[#2A2D30] p-4 flex flex-col gap-3 overflow-y-auto">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#72706C]">Evaluation Queries</h3>
          {samples.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedId === s.id ? 'bg-[#3C6B4D]/15 border-[#3C6B4D]/40 text-[#ECEBE9]' : 'bg-[#18191B] border-[#2A2D30] text-[#72706C] hover:text-[#A3A09B]'
              }`}
            >
              <span className="text-xs font-bold line-clamp-1 block">{s.query}</span>
              <span className="text-[10px] font-mono text-[#10B981]">Faithfulness: {(s.faithfulness * 100).toFixed(0)}%</span>
            </button>
          ))}
        </div>

        {/* Detailed Inspector Viewport */}
        {activeSample && (
          <div className="flex-1 bg-[#0D0E0F] p-6 overflow-auto space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-[#141517] border border-[#2A2D30] rounded-2xl">
                <span className="text-xs text-[#72706C] block">Faithfulness Score</span>
                <span className="text-2xl font-extrabold text-[#10B981] font-mono">{(activeSample.faithfulness * 100).toFixed(1)}%</span>
              </div>
              <div className="p-4 bg-[#141517] border border-[#2A2D30] rounded-2xl">
                <span className="text-xs text-[#72706C] block">Answer Relevance</span>
                <span className="text-2xl font-extrabold text-[#3B82F6] font-mono">{(activeSample.relevance * 100).toFixed(1)}%</span>
              </div>
              <div className="p-4 bg-[#141517] border border-[#2A2D30] rounded-2xl">
                <span className="text-xs text-[#72706C] block">Context Recall</span>
                <span className="text-2xl font-extrabold text-[#F59E0B] font-mono">{(activeSample.contextRecall * 100).toFixed(1)}%</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-[#141517] border border-[#2A2D30] rounded-2xl space-y-1">
                <span className="text-xs font-bold text-[#72706C] uppercase tracking-wider block">Retrieved Context</span>
                <p className="text-xs text-[#ECEBE9] leading-relaxed font-mono">{activeSample.context}</p>
              </div>

              <div className="p-4 bg-[#141517] border border-[#2A2D30] rounded-2xl space-y-1">
                <span className="text-xs font-bold text-[#72706C] uppercase tracking-wider block">LLM Generated Response</span>
                <p className="text-xs text-[#ECEBE9] leading-relaxed font-mono">{activeSample.answer}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
