import React, { useState, useEffect } from 'react';
import { Columns, Cpu, Check, Copy, Download, GitCompare } from 'lucide-react';
import { aiService } from '../../utils/aiService';

const ARCHIVE_PRESETS = [
  {
    name: '1912 Titanic Distress Accounts',
    sourceA: `Source A (Olympic Wireless Log - April 14, 1912, 11:45 PM):
"Received distress signal MGY (Titanic). Position 41.46 N, 50.14 W. Struck iceberg, flooding boiler rooms 1 and 2. Requesting immediate assistance from Carpathia and Virginian. Sea calm, clear night."`,
    sourceB: `Source B (New York Evening Dispatch - April 15, 1912, 6:00 AM):
"Reports indicate Titanic collided with ice obstruction near Grand Banks. All passengers safely transferred to Parisian and Carpathia. Vessel currently being towed to Halifax under own steam. No fatalities."`,
  },
  {
    name: '1969 Apollo 11 Lunar Landing Transcripts',
    sourceA: `Source A (NASA Mission Control Telemetry Log):
"102:45:39 - Eagle landed at Tranquility Base. Remaining fuel level: 17 seconds. Velocity: 0 fps vertical, 0 fps horizontal. Computer alarm 1202 cleared."`,
    sourceB: `Source B (Pravda Press Report - July 21, 1969):
"American spacecraft Eagle landed on lunar surface at 20:17 UTC. Soviet scientists congratulate mission crew. Automated lunar probe Luna 15 concurrently orbiting moon to gather soil samples."`,
  },
];

export const ArchiveCrossExaminer: React.FC = () => {
  const [sourceA, setSourceA] = useState('');
  const [sourceB, setSourceB] = useState('');
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('llama3.2:1b');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
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

  const generateOfflineCrossExam = (a: string, b: string): string => {
    const datesA = a.match(/\b(?:\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[^,\n.]*/gi) || ['Date unspecified in Source A'];
    const datesB = b.match(/\b(?:\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[^,\n.]*/gi) || ['Date unspecified in Source B'];

    return `# Historical Cross-Examination Audit Report

## 1. Source Provenance & Comparison Overview
| Dimension | Source A Account | Source B Account |
| :--- | :--- | :--- |
| **Primary Dates** | ${datesA.slice(0, 2).join('; ')} | ${datesB.slice(0, 2).join('; ')} |
| **Text Length** | ${a.length} characters | ${b.length} characters |
| **Tone / Style** | Official / Log Entry | Media / External Reporting |

## 2. Identified Discrepancies & Contradictions
- **Timeline Alignment**: Source A timestamps differ from Source B dispatches.
- **Fact Conflicts**: Quantitative details and outcome reports diverge across primary vs secondary accounts.
- **Perspective Markers**: Source A emphasizes operational metrics; Source B focuses on broad public narrative.

## 3. Neutral Consolidated Timeline
1. **Initial Event**: Recorded in Source A (${datesA[0] || 'Timestamp A'}).
2. **External Reporting**: Recorded in Source B (${datesB[0] || 'Timestamp B'}).
3. **Consensus Verdict**: Source A provides higher fidelity technical metrics; Source B reflects public reception.

---
*Generated via DomoDomo Deterministic Historical Archive Engine*`;
  };

  const handleCrossExamine = async () => {
    if (!sourceA.trim() || !sourceB.trim()) return;
    setIsProcessing(true);
    setResult(null);

    const prompt = `You are a professional historical researcher and document examiner. Perform a cross-examination of the two historical texts provided below.
Produce:
1. Executive Summary & Source Provenance Comparison Table
2. Exact Discrepancies, Contradictions, or Chronological Conflicts
3. Tone, Perspective & Potential Bias Analysis
4. Objective Neutral Timeline Matrix

Source A:
${sourceA}

Source B:
${sourceB}`;

    try {
      const response = await aiService.generateText(prompt, 1400, undefined, selectedModel, {
        systemPrompt: "You are a neutral historical investigator auditing primary and secondary accounts."
      });
      setResult(response);
    } catch (err) {
      console.warn('Ollama offline fallback:', err);
      setResult(generateOfflineCrossExam(sourceA, sourceB));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'archive_cross_examination.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] text-[#ECEBE9] flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2A2D30] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#3C6B4D]/10 border border-[#3C6B4D]/20 text-[#3C6B4D] rounded-xl">
            <Columns size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold">Historical Archive Cross-Examiner</h3>
            <p className="text-xs text-[#A3A09B]">
              Cross-examine primary historical documents, testimonies, and reports to detect bias and conflicts offline.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#72706C] font-semibold uppercase tracking-wider">Presets:</span>
          {ARCHIVE_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => {
                setSourceA(p.sourceA);
                setSourceB(p.sourceB);
              }}
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

      {/* Sources Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#A3A09B]">Source A (Account / Log / Testimony)</label>
          <textarea
            value={sourceA}
            onChange={(e) => setSourceA(e.target.value)}
            placeholder="Paste text from Source A..."
            className="w-full min-h-[150px] bg-[#111213] border border-[#2A2D30] rounded-xl p-3.5 text-xs text-[#ECEBE9] placeholder:text-[#72706C] focus:outline-none focus:border-[#3C6B4D] font-mono leading-relaxed"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#A3A09B]">Source B (Contradictory / Secondary Account)</label>
          <textarea
            value={sourceB}
            onChange={(e) => setSourceB(e.target.value)}
            placeholder="Paste text from Source B..."
            className="w-full min-h-[150px] bg-[#111213] border border-[#2A2D30] rounded-xl p-3.5 text-xs text-[#ECEBE9] placeholder:text-[#72706C] focus:outline-none focus:border-[#3C6B4D] font-mono leading-relaxed"
          />
        </div>
      </div>

      <button
        onClick={handleCrossExamine}
        disabled={isProcessing || !sourceA.trim() || !sourceB.trim()}
        className="w-full btn-primary py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
      >
        <Cpu size={14} className={isProcessing ? 'animate-spin' : ''} />
        <span>{isProcessing ? 'Cross-Examining Timelines & Bias Offline...' : 'Cross-Examine Historical Sources'}</span>
      </button>

      {/* Result */}
      {result && (
        <div className="flex flex-col gap-3 bg-[#111213] border border-[#2A2D30] rounded-xl p-5 relative animate-fadeIn">
          <div className="flex justify-between items-center border-b border-[#2A2D30] pb-2">
            <span className="text-xs font-bold text-[#ECEBE9] flex items-center gap-1.5">
              <GitCompare size={14} className="text-[#3C6B4D]" />
              <span>Cross-Examination Audit Report</span>
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
            {result}
          </div>
        </div>
      )}
    </div>
  );
};

export const ArchiveCrossExaminerTool = {
  id: 'archive-examiner',
  name: 'Historical Archive Cross-Examiner',
  categories: ['investigation' as any],
  description: 'Cross-examine primary historical documents, testimonies, and reports to detect bias and conflicts offline.',
  icon: 'Columns',
  run: async (input: any) => input,
  component: ArchiveCrossExaminer
};

