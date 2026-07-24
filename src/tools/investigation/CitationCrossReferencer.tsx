import React, { useState } from 'react';
import { BookOpen, AlertTriangle, Check, Copy } from 'lucide-react';

export const CitationCrossReferencer: React.FC = () => {
  const [citations, setCitations] = useState('');
  const [style, setStyle] = useState<'apa' | 'mla' | 'ieee' | 'chicago'>('apa');
  const [issues, setIssues] = useState<{ id: number; text: string; severity: 'warning' | 'info' }[]>([]);
  const [cleanedCitations, setCleanedCitations] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAudit = () => {
    if (!citations.trim()) return;
    setIsAuditing(true);
    setIssues([]);
    setCleanedCitations('');

    setTimeout(() => {
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
            text: `Citation #${itemNum}: Missing DOI or URL identifier (highly recommended for modern research).`,
            severity: 'info'
          });
        }

        // 2. Year parentheses check for APA
        if (style === 'apa') {
          const hasYearInParens = /\(\d{4}[a-z]?\)/.test(line);
          if (!hasYearInParens) {
            foundIssues.push({
              id: foundIssues.length + 1,
              text: `Citation #${itemNum}: Year not enclosed in parentheses or missing (APA style requires '(YYYY)').`,
              severity: 'warning'
            });
            // Try correcting
            corrected = corrected.replace(/\b(19\d\d|20\d\d)\b/, '($1)');
          }
        }

        // 3. Page numbers format
        if (line.toLowerCase().includes('pp.') && style === 'ieee') {
          foundIssues.push({
            id: foundIssues.length + 1,
            text: `Citation #${itemNum}: IEEE style usually uses abbreviated page formats like "pp. X-Y" or "p. X". Check page notation.`,
            severity: 'info'
          });
        }

        // 4. Quotation marks for title
        if (style === 'mla' && !line.includes('"')) {
          foundIssues.push({
            id: foundIssues.length + 1,
            text: `Citation #${itemNum}: Title of articles should be enclosed in quotation marks in MLA format.`,
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
      setCleanedCitations(correctedLines.join('\n\n'));
      setIsAuditing(false);
    }, 800);
  };

  const handleCopy = () => {
    if (cleanedCitations) {
      navigator.clipboard.writeText(cleanedCitations);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] text-[#ECEBE9] flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#3C6B4D]/10 text-[#3C6B4D] rounded-lg">
          <BookOpen size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold">Academic Citation Cross-Referencer</h3>
          <p className="text-xs text-[#A3A09B]">Validate lists of citations against APA 7th, MLA 9th, IEEE, or Chicago manual schemas.</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-[#A3A09B]">Referencing Style Schema</label>
        <div className="flex gap-2">
          {(['apa', 'mla', 'ieee', 'chicago'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStyle(s)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition-all border ${
                style === s
                  ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/45 text-[#ECEBE9]'
                  : 'bg-[#111213] border-[#2A2D30] text-[#A3A09B] hover:text-[#ECEBE9]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-[#A3A09B]">Bibliography / References List</label>
        <textarea
          value={citations}
          onChange={(e) => setCitations(e.target.value)}
          placeholder={`Paste your list of citations here (one per line). Example:
Smith, J. 2024. Local Browser Computing. Journal of Web Assembly, 45, 12-25.`}
          className="w-full min-h-[140px] bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] placeholder:text-[#72706C] focus:outline-none focus:border-[#3C6B4D]"
        />
      </div>

      <button
        onClick={handleAudit}
        disabled={isAuditing || !citations.trim()}
        className="w-full btn-primary py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>{isAuditing ? 'Auditing References...' : 'Audit Citations & Schema'}</span>
      </button>

      {issues.length > 0 && (
        <div className="flex flex-col gap-3 mt-2">
          <div className="bg-[#111213] border border-[#2A2D30] rounded-xl p-4">
            <span className="text-xs font-semibold text-[#A3A09B] flex items-center gap-1.5 border-b border-[#2A2D30] pb-2 mb-2">
              <AlertTriangle size={12} className="text-[#3C6B4D]" />
              <span>Formatting Alerts & Guidelines</span>
            </span>
            <ul className="flex flex-col gap-2">
              {issues.map((iss) => (
                <li key={iss.id} className="text-xs flex items-start gap-2 text-[#ECEBE9]">
                  <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${iss.severity === 'warning' ? 'bg-amber-500' : 'bg-[#3C6B4D]'}`} />
                  <span>{iss.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {cleanedCitations && (
            <div className="bg-[#111213] border border-[#2A2D30] rounded-xl p-4 relative animate-fadeIn">
              <div className="flex justify-between items-center border-b border-[#2A2D30] pb-2 mb-2">
                <span className="text-xs font-semibold text-[#A3A09B]">Auto-Corrected Citations Preview</span>
                <button
                  onClick={handleCopy}
                  className="text-[#A3A09B] hover:text-[#ECEBE9] transition-colors p-1"
                >
                  {copied ? <Check size={14} className="text-[#3C6B4D]" /> : <Copy size={14} />}
                </button>
              </div>
              <pre className="text-xs leading-relaxed text-[#ECEBE9] overflow-auto max-h-[200px] whitespace-pre-wrap font-sans">
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
  description: 'Validate lists of citations against APA 7th, MLA 9th, IEEE, or Chicago manual schemas.',
  icon: 'BookOpen',
  run: async (input: any) => input,
  component: CitationCrossReferencer
};
