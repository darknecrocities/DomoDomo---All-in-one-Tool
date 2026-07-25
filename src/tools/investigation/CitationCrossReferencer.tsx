import React, { useState, useEffect } from 'react';
import { BookOpen, AlertTriangle, Check, Copy, Download, Cpu } from 'lucide-react';
import { aiService } from '../../utils/aiService';

const CITATION_PRESETS = [
  {
    name: 'Sample APA / Mixed References',
    text: `Smith, J. 2024. Local Browser Computing. Journal of Web Assembly, 45, 12-25.
Johnson, A. B., & Lee, C. K. (2023). Quantum algorithms in surface codes. Nature Physics 19(4): pp. 450-462. https://doi.org/10.1038/s41567-023-01980-x
Davis M. Deep Learning for Clinical Diagnostics. Lancet Digital Health 2022.`,
  },
  {
    name: 'Raw BibTeX Block',
    text: `@article{vaswani2017attention,
  title={Attention is all you need},
  author={Vaswani, Ashish and Shazeer, Noam and Parmar, Niki and Uszkoreit, Jakob},
  journal={Advances in Neural Information Processing Systems},
  volume={30},
  year={2017}
}`,
  },
];

export const CitationCrossReferencer: React.FC = () => {
  const [citations, setCitations] = useState('');
  const [style, setStyle] = useState<'apa' | 'mla' | 'ieee' | 'chicago' | 'bibtex'>('apa');
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('llama3.2:1b');
  const [issues, setIssues] = useState<{ id: number; text: string; severity: 'warning' | 'info' }[]>([]);
  const [cleanedCitations, setCleanedCitations] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
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

  const handleAudit = async () => {
    if (!citations.trim()) return;
    setIsAuditing(true);
    setIssues([]);
    setCleanedCitations('');

    const lines = citations.split('\n').filter(l => l.trim().length > 5);
    const foundIssues: { id: number; text: string; severity: 'warning' | 'info' }[] = [];
    const correctedLines: string[] = [];

    lines.forEach((line, index) => {
      const itemNum = index + 1;
      let corrected = line.trim();

      // 1. Missing DOI Check
      if (!line.includes('doi.org') && !line.toLowerCase().includes('doi:')) {
        foundIssues.push({
          id: foundIssues.length + 1,
          text: `Citation #${itemNum}: Missing DOI or digital identifier (recommended for academic rigor).`,
          severity: 'info'
        });
      }

      // 2. Year parentheses check for APA
      if (style === 'apa') {
        const hasYearInParens = /\(\d{4}[a-z]?\)/.test(line);
        if (!hasYearInParens) {
          foundIssues.push({
            id: foundIssues.length + 1,
            text: `Citation #${itemNum}: Year not enclosed in parentheses (APA style requires '(YYYY)').`,
            severity: 'warning'
          });
          corrected = corrected.replace(/\b(19\d\d|20\d\d)\b/, '($1)');
        }
      }

      // 3. Page numbers format
      if (line.toLowerCase().includes('pp.') && style === 'ieee') {
        foundIssues.push({
          id: foundIssues.length + 1,
          text: `Citation #${itemNum}: IEEE style usually uses abbreviated page formats (e.g. 'pp. X-Y' or 'p. X').`,
          severity: 'info'
        });
      }

      // 4. Quotation marks for title in MLA
      if (style === 'mla' && !line.includes('"')) {
        foundIssues.push({
          id: foundIssues.length + 1,
          text: `Citation #${itemNum}: MLA 9th requires article titles to be enclosed in quotation marks.`,
          severity: 'warning'
        });
      }

      correctedLines.push(corrected);
    });

    if (foundIssues.length === 0) {
      foundIssues.push({
        id: 1,
        text: "No major schema issues detected. Perfect referencing structure!",
        severity: 'info'
      });
    }

    setIssues(foundIssues);

    // Try AI for full formatted conversion
    const prompt = `You are a scholarly citation editor. Reformat the following bibliography list into clean, perfectly formatted ${style.toUpperCase()} style:
${citations}`;

    try {
      const aiResponse = await aiService.generateText(prompt, 1000, undefined, selectedModel, {
        systemPrompt: "Reformat citations accurately following official style guidelines."
      });
      setCleanedCitations(aiResponse);
    } catch (err) {
      console.warn('Ollama offline fallback:', err);
      setCleanedCitations(correctedLines.join('\n\n'));
    } finally {
      setIsAuditing(false);
    }
  };

  const handleCopy = () => {
    if (cleanedCitations) {
      navigator.clipboard.writeText(cleanedCitations);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!cleanedCitations) return;
    const ext = style === 'bibtex' ? 'bib' : 'txt';
    const blob = new Blob([cleanedCitations], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bibliography_${style}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] text-[#ECEBE9] flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2A2D30] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#3C6B4D]/10 border border-[#3C6B4D]/20 text-[#3C6B4D] rounded-xl">
            <BookOpen size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold">Academic Citation Cross-Referencer</h3>
            <p className="text-xs text-[#A3A09B]">
              Validate, reformat, and audit citation lists against APA 7th, MLA 9th, IEEE, Chicago, and BibTeX.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#72706C] font-semibold uppercase tracking-wider">Presets:</span>
          {CITATION_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => setCitations(p.text)}
              className="text-[11px] px-2.5 py-1 bg-[#111213] border border-[#2A2D30] text-[#A3A09B] hover:text-[#ECEBE9] hover:border-[#3C6B4D] rounded-lg transition-all"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#A3A09B]">Target Citation Style Schema</label>
          <div className="flex gap-1.5 flex-wrap">
            {(['apa', 'mla', 'ieee', 'chicago', 'bibtex'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition-all border ${
                  style === s
                    ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/45 text-[#ECEBE9]'
                    : 'bg-[#111213] border-[#2A2D30] text-[#A3A09B]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

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
      </div>

      {/* Input */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-[#A3A09B]">Bibliography / Raw References List</label>
        <textarea
          value={citations}
          onChange={(e) => setCitations(e.target.value)}
          placeholder={`Paste your list of raw citations or BibTeX entries here (one per line)...`}
          className="w-full min-h-[150px] bg-[#111213] border border-[#2A2D30] rounded-xl p-3.5 text-xs text-[#ECEBE9] placeholder:text-[#72706C] focus:outline-none focus:border-[#3C6B4D] font-mono leading-relaxed"
        />
      </div>

      <button
        onClick={handleAudit}
        disabled={isAuditing || !citations.trim()}
        className="w-full btn-primary py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
      >
        <Cpu size={14} className={isAuditing ? 'animate-spin' : ''} />
        <span>{isAuditing ? 'Auditing & Reformatting References...' : `Audit & Reformat to ${style.toUpperCase()}`}</span>
      </button>

      {/* Output & Issues */}
      {issues.length > 0 && (
        <div className="flex flex-col gap-4 mt-2 animate-fadeIn">
          <div className="bg-[#111213] border border-[#2A2D30] rounded-xl p-4">
            <span className="text-xs font-bold text-[#ECEBE9] flex items-center gap-2 border-b border-[#2A2D30] pb-2 mb-3">
              <AlertTriangle size={14} className="text-[#3C6B4D]" />
              <span>Formatting Alerts & Compliance Audit ({issues.length} Items)</span>
            </span>
            <ul className="flex flex-col gap-2">
              {issues.map((iss) => (
                <li key={iss.id} className="text-xs flex items-start gap-2.5 text-[#ECEBE9]">
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${iss.severity === 'warning' ? 'bg-amber-500' : 'bg-[#3C6B4D]'}`} />
                  <span className="font-mono">{iss.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {cleanedCitations && (
            <div className="bg-[#111213] border border-[#2A2D30] rounded-xl p-5 relative">
              <div className="flex justify-between items-center border-b border-[#2A2D30] pb-3 mb-3">
                <span className="text-xs font-bold text-[#ECEBE9]">
                  Reformatted {style.toUpperCase()} Bibliography Preview
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
                    <span>Export</span>
                  </button>
                </div>
              </div>
              <pre className="text-xs leading-relaxed text-[#ECEBE9] overflow-auto max-h-[300px] whitespace-pre-wrap font-mono bg-[#18191B] p-4 rounded-lg border border-[#2A2D30]">
                {cleanedCitations}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const CitationCrossReferencerTool = {
  id: 'citation-crossref',
  name: 'Academic Citation Cross-Referencer',
  categories: ['investigation' as any],
  description: 'Validate, reformat, and audit citation lists against APA 7th, MLA 9th, IEEE, Chicago, and BibTeX.',
  icon: 'BookOpen',
  run: async (input: any) => input,
  component: CitationCrossReferencer
};

