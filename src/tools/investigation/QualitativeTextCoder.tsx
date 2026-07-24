import React, { useState } from 'react';
import { Tag, Plus, Trash, Check, Copy } from 'lucide-react';

interface CodeTag {
  id: string;
  name: string;
  color: string;
  count: number;
}

export const QualitativeTextCoder: React.FC = () => {
  const [transcript, setTranscript] = useState('');
  const [codes, setCodes] = useState<CodeTag[]>([
    { id: '1', name: 'User Experience', color: '#3C6B4D', count: 0 },
    { id: '2', name: 'Performance Issue', color: '#B45309', count: 0 },
    { id: '3', name: 'Privacy Concern', color: '#1D4ED8', count: 0 },
  ]);
  const [newCodeName, setNewCodeName] = useState('');
  const [newCodeColor, setNewCodeColor] = useState('#EC4899');
  const [analysisReport, setAnalysisReport] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleAnalyze = () => {
    if (!transcript.trim()) return;
    setIsProcessing(true);
    setAnalysisReport(null);

    setTimeout(() => {
      // Simple client-side text tag calculation
      const updatedCodes = codes.map((c) => {
        const regex = new RegExp(c.name, 'gi');
        const matches = transcript.match(regex);
        return {
          ...c,
          count: matches ? matches.length : 0
        };
      });

      setCodes(updatedCodes);

      // Generate a thematic summary report
      let report = `## Offline Qualitative Thematic Report\n\n`;
      report += `### Frequency Distribution of Codes\n`;
      report += `| Theme Code | Tag Color | Occurrences Detected |\n`;
      report += `| :--- | :--- | :--- |\n`;
      updatedCodes.forEach((c) => {
        report += `| **${c.name}** | \`${c.color}\` | ${c.count} times |\n`;
      });

      report += `\n### Key Narrative Insights\n`;
      report += `- Active coding reveals dominant patterns centering around **${updatedCodes.sort((a,b) => b.count - a.count)[0].name}**.\n`;
      report += `- Recommended focus: cross-reference highlighted paragraphs corresponding to low frequency tags to isolate edge case experiences.\n`;
      
      setAnalysisReport(report);
      setIsProcessing(false);
    }, 1000);
  };

  const handleCopy = () => {
    if (analysisReport) {
      navigator.clipboard.writeText(analysisReport);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] text-[#ECEBE9] flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#3C6B4D]/10 text-[#3C6B4D] rounded-lg">
          <Tag size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold">Qualitative Text Coder & Labeler</h3>
          <p className="text-xs text-[#A3A09B]">Perform client-side thematic analysis on transcripts, tag interview quotes, and extract codes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Manage Codes */}
        <div className="md:col-span-1 bg-[#111213] border border-[#2A2D30] p-4 rounded-xl flex flex-col gap-4">
          <span className="text-xs font-semibold text-[#A3A09B] border-b border-[#2A2D30] pb-2">Active Qualitative Codes</span>
          
          <div className="flex flex-col gap-2 max-h-[180px] overflow-auto">
            {codes.map((c) => (
              <div key={c.id} className="flex justify-between items-center bg-[#18191B] px-3 py-1.5 rounded-lg border border-[#2A2D30] text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="font-semibold">{c.name}</span>
                </div>
                <button
                  onClick={() => handleDeleteCode(c.id)}
                  className="text-rose-450 hover:text-rose-500 transition-colors"
                >
                  <Trash size={12} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 border-t border-[#2A2D30] pt-3">
            <span className="text-[10px] text-[#A3A09B] uppercase font-bold">Add Custom Code</span>
            <input
              type="text"
              value={newCodeName}
              onChange={(e) => setNewCodeName(e.target.value)}
              placeholder="Code Label (e.g. Price Sensitivity)"
              className="bg-[#18191B] border border-[#2A2D30] rounded-lg px-2.5 py-1.5 text-xs text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D]"
            />
            <div className="flex gap-2">
              <input
                type="color"
                value={newCodeColor}
                onChange={(e) => setNewCodeColor(e.target.value)}
                className="w-10 h-8 rounded border border-[#2A2D30] bg-[#18191B] cursor-pointer"
              />
              <button
                onClick={handleAddCode}
                className="flex-1 btn-primary text-xs py-1 rounded-lg font-bold flex items-center justify-center gap-1"
              >
                <Plus size={12} />
                <span>Add Code</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Ingestion & Output */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-[#A3A09B]">Transcript / Text Ingestion</label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste participant interview transcripts, focus group notes, or qualitative text sections here..."
              className="w-full min-h-[180px] bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] placeholder:text-[#72706C] focus:outline-none focus:border-[#3C6B4D]"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isProcessing || !transcript.trim()}
            className="w-full btn-primary py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isProcessing ? 'Analyzing Qualitative Transcripts...' : 'Run Thematic Indexer'}</span>
          </button>
        </div>
      </div>

      {analysisReport && (
        <div className="flex flex-col gap-2 bg-[#111213] border border-[#2A2D30] rounded-xl p-4 relative animate-fadeIn">
          <div className="flex justify-between items-center border-b border-[#2A2D30] pb-2 mb-2">
            <span className="text-xs font-semibold text-[#A3A09B]">Coding Thematic Summary</span>
            <button
              onClick={handleCopy}
              className="text-[#A3A09B] hover:text-[#ECEBE9] transition-colors p-1"
            >
              {copied ? <Check size={14} className="text-[#3C6B4D]" /> : <Copy size={14} />}
            </button>
          </div>
          <div className="text-xs leading-relaxed text-[#ECEBE9] overflow-auto max-h-[250px] whitespace-pre-wrap font-sans">
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
  description: 'Perform client-side thematic analysis on transcripts, tag interview quotes, and extract codes.',
  icon: 'Tag',
  run: async (input: any) => input,
  component: QualitativeTextCoder
};
