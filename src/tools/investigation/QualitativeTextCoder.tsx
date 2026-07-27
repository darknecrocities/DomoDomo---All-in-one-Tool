import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash, Check, Copy, Download, Highlighter, Cpu, BarChart2 } from 'lucide-react';
import { aiService } from '../../utils/aiService';

interface CodeTag {
  id: string;
  name: string;
  color: string;
  count: number;
}

interface CodedQuote {
  id: string;
  codeName: string;
  color: string;
  quote: string;
}

const TRANSCRIPT_PRESETS = [
  {
    name: 'UX Software Usability Interview',
    text: `P1: "I found the onboarding navigation clean, but the settings menu was confusing. It took me 5 minutes to figure out how to export data."
P2: "The speed and performance of the offline tool was amazing. However, I have privacy concerns about where my local LLM models are stored."
P3: "The dark mode visual aesthetics look premium. But I ran into a performance issue when rendering 1000 items simultaneously."`,
  },
];

export const QualitativeTextCoder: React.FC = () => {
  const [transcript, setTranscript] = useState('');
  const [codes, setCodes] = useState<CodeTag[]>([
    { id: '1', name: 'User Experience', color: '#3C6B4D', count: 0 },
    { id: '2', name: 'Performance Issue', color: '#E29E2D', count: 0 },
    { id: '3', name: 'Privacy Concern', color: '#3B82F6', count: 0 },
  ]);
  const [codedQuotes, setCodedQuotes] = useState<CodedQuote[]>([]);
  const [newCodeName, setNewCodeName] = useState('');
  const [newCodeColor, setNewCodeColor] = useState('#EC4899');
  const [selectedCodeForHighlight, setSelectedCodeForHighlight] = useState<string>('1');
  const [analysisReport, setAnalysisReport] = useState<string | null>(null);
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('llama3.2:1b');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      const { status, models } = await aiService.checkOllama();
      if (status && models.length > 0) {
        setModels(models);
        const saved = aiService.getSelectedOllamaModel();
        if (saved && models.includes(saved)) {
          setSelectedModel(saved);
        } else {
          setSelectedModel(models[0]);
        }
      }
    };
    loadModels();
  }, []);

  const handleAddCode = () => {
    if (!newCodeName.trim()) return;
    setCodes([
      ...codes,
      {
        id: Date.now().toString(),
        name: newCodeName.trim(),
        color: newCodeColor,
        count: 0
      }
    ]);
    setNewCodeName('');
  };

  const handleDeleteCode = (id: string) => {
    setCodes(codes.filter((c) => c.id !== id));
  };

  const handleHighlightSelection = () => {
    const selection = window.getSelection()?.toString().trim();
    if (!selection) return;

    const targetCode = codes.find(c => c.id === selectedCodeForHighlight) || codes[0];
    if (!targetCode) return;

    const newQuote: CodedQuote = {
      id: Date.now().toString(),
      codeName: targetCode.name,
      color: targetCode.color,
      quote: selection,
    };

    setCodedQuotes([...codedQuotes, newQuote]);
  };

  const handleAnalyze = async () => {
    if (!transcript.trim()) return;
    setIsProcessing(true);
    setAnalysisReport(null);

    // 1. Client-side tag frequency update
    const updatedCodes = codes.map((c) => {
      const regex = new RegExp(c.name, 'gi');
      const matches = transcript.match(regex);
      return {
        ...c,
        count: (matches ? matches.length : 0) + codedQuotes.filter(q => q.codeName === c.name).length
      };
    });
    setCodes(updatedCodes);

    const prompt = `You are a qualitative research methodology specialist. Perform thematic coding on the transcript below.
Categories to code: ${codes.map(c => c.name).join(', ')}

Output:
1. Frequency & Distribution Analysis Table
2. Key Quotes & Sub-theme Extraction
3. Core Qualitative Insights & Participant Patterns

Transcript:
${transcript}`;

    try {
      const response = await aiService.generateText(prompt, 1200, undefined, selectedModel, {
        systemPrompt: "You are an expert qualitative researcher doing thematic coding."
      });
      setAnalysisReport(response);
    } catch (err) {
      console.warn('Ollama offline fallback:', err);
      let report = `## Offline Qualitative Thematic Report\n\n`;
      report += `### Frequency Distribution of Codes\n`;
      report += `| Theme Code | Tag Color | Total Occurrences |\n`;
      report += `| :--- | :--- | :--- |\n`;
      updatedCodes.forEach((c) => {
        report += `| **${c.name}** | \`${c.color}\` | ${c.count} |\n`;
      });

      report += `\n### Tagged Participant Quotes (${codedQuotes.length})\n`;
      codedQuotes.forEach((q) => {
        report += `- **[${q.codeName}]**: "${q.quote}"\n`;
      });

      setAnalysisReport(report);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (analysisReport) {
      navigator.clipboard.writeText(analysisReport);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!analysisReport) return;
    const blob = new Blob([analysisReport], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qualitative_thematic_codebook.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] text-[#ECEBE9] flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2A2D30] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#3C6B4D]/10 border border-[#3C6B4D]/20 text-[#3C6B4D] rounded-xl">
            <Tag size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold">Qualitative Text Coder & Labeler</h3>
            <p className="text-xs text-[#A3A09B]">
              Code interview transcripts, tag qualitative themes, and generate thematic distribution reports offline.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#72706C] font-semibold uppercase tracking-wider">Presets:</span>
          {TRANSCRIPT_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => setTranscript(p.text)}
              className="text-[11px] px-2.5 py-1 bg-[#111213] border border-[#2A2D30] text-[#A3A09B] hover:text-[#ECEBE9] hover:border-[#3C6B4D] rounded-lg transition-all"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* AI Model Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-[#A3A09B]">Local AI Model Selector</label>
        <select
          value={selectedModel}
          onChange={(e) => {
            setSelectedModel(e.target.value);
            aiService.setSelectedOllamaModel(e.target.value);
          }}
          className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#3C6B4D]"
        >
          {models.length > 0 ? (
            models.map((m) => <option key={m} value={m}>{m}</option>)
          ) : (
            <option value="llama3.2:1b">llama3.2:1b (Deterministic Local Fallback)</option>
          )}
        </select>
      </div>

      {/* Codebook & Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Codebook */}
        <div className="md:col-span-1 bg-[#111213] border border-[#2A2D30] p-4 rounded-xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#2A2D30] pb-2">
            <span className="text-xs font-bold text-[#ECEBE9]">Thematic Codebook</span>
            <span className="text-[10px] text-[#72706C]">{codes.length} Codes</span>
          </div>

          <div className="flex flex-col gap-2 max-h-[160px] overflow-auto pr-1">
            {codes.map((c) => (
              <div key={c.id} className="flex justify-between items-center bg-[#18191B] px-3 py-2 rounded-lg border border-[#2A2D30] text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="font-bold">{c.name}</span>
                </div>
                <button
                  onClick={() => handleDeleteCode(c.id)}
                  className="text-rose-450 hover:text-rose-500 p-1"
                >
                  <Trash size={12} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 border-t border-[#2A2D30] pt-3">
            <span className="text-[10px] text-[#72706C] uppercase font-bold">Add Custom Theme Code</span>
            <input
              type="text"
              value={newCodeName}
              onChange={(e) => setNewCodeName(e.target.value)}
              placeholder="Code Label (e.g. Frustration)"
              className="bg-[#18191B] border border-[#2A2D30] rounded-lg px-3 py-1.5 text-xs text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D]"
            />
            <div className="flex gap-2">
              <input
                type="color"
                value={newCodeColor}
                onChange={(e) => setNewCodeColor(e.target.value)}
                className="w-9 h-8 rounded border border-[#2A2D30] bg-[#18191B] cursor-pointer"
              />
              <button
                onClick={handleAddCode}
                className="flex-1 btn-primary text-xs py-1.5 rounded-lg font-bold flex items-center justify-center gap-1"
              >
                <Plus size={12} />
                <span>Add Code</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Ingestion & Actions */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-semibold text-[#A3A09B]">Transcript / Text Ingestion</label>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#72706C]">Tag Selected Text As:</span>
                <select
                  value={selectedCodeForHighlight}
                  onChange={(e) => setSelectedCodeForHighlight(e.target.value)}
                  className="bg-[#111213] border border-[#2A2D30] text-xs text-[#ECEBE9] rounded-lg px-2 py-1"
                >
                  {codes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button
                  onClick={handleHighlightSelection}
                  className="btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1"
                  title="Highlight text in text box below, then click to tag"
                >
                  <Highlighter size={12} />
                  <span>Tag Quote</span>
                </button>
              </div>
            </div>

            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste participant transcripts, focus group notes, or interview sections here..."
              className="w-full min-h-[160px] bg-[#111213] border border-[#2A2D30] rounded-xl p-3.5 text-xs text-[#ECEBE9] placeholder:text-[#72706C] focus:outline-none focus:border-[#3C6B4D] font-mono leading-relaxed"
            />
          </div>

          {/* Tagged Quotes Repository */}
          {codedQuotes.length > 0 && (
            <div className="bg-[#111213] border border-[#2A2D30] p-3 rounded-xl flex flex-col gap-2">
              <span className="text-[10px] text-[#72706C] font-bold uppercase tracking-wider">
                Tagged Quotes Repository ({codedQuotes.length})
              </span>
              <div className="flex flex-wrap gap-2 max-h-[120px] overflow-auto">
                {codedQuotes.map((q) => (
                  <div key={q.id} className="bg-[#18191B] border border-[#2A2D30] p-2 rounded-lg text-[11px] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: q.color }} />
                    <span className="font-bold text-[#ECEBE9]">{q.codeName}:</span>
                    <span className="text-[#A3A09B] italic line-clamp-1">"{q.quote}"</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={isProcessing || !transcript.trim()}
            className="w-full btn-primary py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <Cpu size={14} className={isProcessing ? 'animate-spin' : ''} />
            <span>{isProcessing ? 'Running Thematic Indexing...' : 'Run Thematic Indexer & Codebook'}</span>
          </button>
        </div>
      </div>

      {/* Analysis Report Output */}
      {analysisReport && (
        <div className="flex flex-col gap-3 bg-[#111213] border border-[#2A2D30] rounded-xl p-5 relative animate-fadeIn">
          <div className="flex justify-between items-center border-b border-[#2A2D30] pb-2">
            <span className="text-xs font-bold text-[#ECEBE9] flex items-center gap-1.5">
              <BarChart2 size={14} className="text-[#3C6B4D]" />
              <span>Thematic Coding Analysis Brief</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="btn-secondary text-[11px] py-1 px-3 flex items-center gap-1"
              >
                {copied ? <Check size={12} className="text-[#3C6B4D]" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="btn-primary text-[11px] py-1 px-3 flex items-center gap-1"
              >
                <Download size={12} />
                <span>Export .md</span>
              </button>
            </div>
          </div>
          <div className="text-xs leading-relaxed text-[#ECEBE9] overflow-auto max-h-[350px] whitespace-pre-wrap font-mono bg-[#18191B] p-4 rounded-lg border border-[#2A2D30]">
            {analysisReport}
          </div>
        </div>
      )}
    </div>
  );
};

export const QualitativeTextCoderTool = {
  id: 'qualitative-coder',
  name: 'Qualitative Text Coder & Labeler',
  categories: ['investigation' as any],
  description: 'Code interview transcripts, tag qualitative themes, and generate thematic distribution reports offline.',
  icon: 'Tag',
  run: async (input: any) => input,
  component: QualitativeTextCoder
};
