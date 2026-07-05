import { useState } from 'react';
import { Sliders, Copy, Check, Download, AlertCircle, Play, Binary } from 'lucide-react';

export const RegexDataExtractorTool = () => {
  const [sourceText, setSourceText] = useState(`[API-ERROR] USER: ram_guinto | CODE: 403 | IP: 192.168.1.102 | ADDR: /api/v1/auth/delete
[API-SUCCESS] USER: arron_kian | CODE: 200 | IP: 127.0.0.1 | ADDR: /api/v1/dashboard
[API-SUCCESS] USER: john_doe | CODE: 200 | IP: 10.0.0.8 | ADDR: /api/v1/posts
[API-ERROR] USER: anonymous_hacker | CODE: 401 | IP: 192.168.1.55 | ADDR: /admin/settings`);

  const [regexPattern, setRegexPattern] = useState<string>(`\\[(API-[A-Z]+)\\] USER: (\\w+) \\| CODE: (\\d{3}) \\| IP: (\\S+)`);
  const [regexFlags, setRegexFlags] = useState<string>('g');
  const [extractedRows, setExtractedRows] = useState<any[]>([]);
  const [groupHeaders, setGroupHeaders] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleExtract = () => {
    try {
      setErrorMsg(null);
      if (!regexPattern.trim()) {
        throw new Error("Regular expression pattern cannot be empty.");
      }

      // Check regex compiling safety
      let regex: RegExp;
      try {
        regex = new RegExp(regexPattern, regexFlags);
      } catch (err: any) {
        throw new Error(`Invalid regex syntax: ${err.message}`);
      }

      const matches = [];
      let match;
      
      // Prevent infinite loops for non-global patterns
      const isGlobal = regexFlags.includes('g');
      
      if (isGlobal) {
        while ((match = regex.exec(sourceText)) !== null) {
          matches.push(match);
          // Zero-width match safeguard
          if (match.index === regex.lastIndex) {
            regex.lastIndex++;
          }
        }
      } else {
        match = regex.exec(sourceText);
        if (match) {
          matches.push(match);
        }
      }

      if (matches.length === 0) {
        setExtractedRows([]);
        setGroupHeaders([]);
        setErrorMsg("No matches found in the text with the provided regular expression.");
        return;
      }

      // Detect number of capture groups
      const maxGroups = matches.reduce((max, m) => Math.max(max, m.length - 1), 0);
      const headers = Array.from({ length: maxGroups }, (_, idx) => `Group ${idx + 1}`);
      setGroupHeaders(headers);

      const rows = matches.map((m, idx) => {
        const item: Record<string, any> = {
          index: idx + 1,
          fullMatch: m[0]
        };
        for (let g = 1; g < m.length; g++) {
          item[`group_${g}`] = m[g] !== undefined ? m[g] : '';
        }
        return item;
      });

      setExtractedRows(rows);
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to process regex extraction.");
      setExtractedRows([]);
      setGroupHeaders([]);
    }
  };

  const getResultsCSV = () => {
    if (extractedRows.length === 0) return '';
    const headers = ['Index', 'Full Match', ...groupHeaders];
    const lines = extractedRows.map(row => {
      const lineItems = [
        row.index,
        `"${row.fullMatch.replace(/"/g, '""')}"`,
        ...groupHeaders.map((_, gIdx) => `"${(row[`group_${gIdx + 1}`] || '').replace(/"/g, '""')}"`)
      ];
      return lineItems.join(',');
    });
    return [headers.join(','), ...lines].join('\n');
  };

  const handleCopy = () => {
    const csv = getResultsCSV();
    if (csv) {
      navigator.clipboard.writeText(csv);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleDownload = () => {
    const csv = getResultsCSV();
    if (csv) {
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `extracted_regex_data.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Configure Area */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-sm font-extrabold text-[#ECEBE9] border-b border-[#2A2D30] pb-2.5 flex items-center gap-1.5">
            <Sliders size={15} className="text-[#3C6B4D]" />
            <span>Regex Extractor Settings</span>
          </h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-[#A3A09B] font-bold uppercase tracking-wider">Source Content Text</label>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              rows={8}
              className="bg-[#111213] border border-[#2A2D30] rounded-xl p-3.5 text-xs font-mono text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D]"
              placeholder="Paste log files or datasets here..."
            />
          </div>

          <div className="grid grid-cols-12 gap-3 items-end">
            <div className="col-span-9 flex flex-col gap-1">
              <label className="text-[10px] text-[#A3A09B] font-bold uppercase tracking-wider">Regex Pattern (No surrounding slashes)</label>
              <input
                type="text"
                value={regexPattern}
                onChange={(e) => setRegexPattern(e.target.value)}
                className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3.5 py-2 text-xs font-mono text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D]"
                placeholder="e.g. \[([A-Z]+)\] (\w+)"
              />
            </div>
            <div className="col-span-3 flex flex-col gap-1">
              <label className="text-[10px] text-[#A3A09B] font-bold uppercase tracking-wider">Flags</label>
              <input
                type="text"
                value={regexFlags}
                onChange={(e) => setRegexFlags(e.target.value)}
                className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs font-mono text-center text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D]"
                placeholder="g, i, m"
              />
            </div>
          </div>

          <button
            onClick={handleExtract}
            className="py-2.5 px-4 bg-[#3C6B4D] hover:bg-[#2E533B] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md transition-colors"
          >
            <Play size={13} />
            <span>Run Regex Matcher</span>
          </button>

          {errorMsg && (
            <div className="bg-rose-950/20 border border-rose-500/30 text-rose-400 p-3 rounded-xl flex items-start gap-2 text-xs">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid records matches display column */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="glass-card p-6 border border-[#2A2D30] rounded-2xl flex flex-col gap-4">
          <div className="pb-3 border-b border-[#2A2D30] flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-[#ECEBE9] flex items-center gap-1.5">
              <Binary size={15} className="text-[#3C6B4D]" />
              <span>Extracted Tabular Output</span>
            </h4>
            {extractedRows.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="py-1 px-3 bg-[#111213] hover:bg-[#1E2022] text-[#A3A09B] hover:text-[#ECEBE9] rounded-lg text-xs font-bold border border-[#2A2D30] flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>Copy CSV</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="py-1 px-3 bg-[#3C6B4D] hover:bg-[#2E533B] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Download size={12} />
                  <span>Export CSV</span>
                </button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto bg-[#111213] border border-[#2A2D30] rounded-xl max-h-[350px]">
            {extractedRows.length === 0 ? (
              <div className="text-center p-12 space-y-1.5 text-xs text-[#A3A09B]">
                <p className="font-semibold">No records extracted.</p>
                <p className="text-[#72706C]">Modify regex matching queries or click run to begin.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#18191B] border-b border-[#2A2D30]">
                    <th className="p-3 text-[#A3A09B] font-extrabold w-[60px]">Index</th>
                    <th className="p-3 text-[#A3A09B] font-extrabold">Full Match Segment</th>
                    {groupHeaders.map(g => (
                      <th key={g} className="p-3 text-[#3C6B4D] font-extrabold">{g}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2D30]/40 text-[#ECEBE9] font-mono text-[11px]">
                  {extractedRows.map(row => (
                    <tr key={row.index} className="hover:bg-[#1E2022]/40 transition-colors">
                      <td className="p-3 font-semibold text-[#A3A09B]">{row.index}</td>
                      <td className="p-3 font-semibold text-[#ECEBE9] truncate max-w-[200px]" title={row.fullMatch}>
                        {row.fullMatch}
                      </td>
                      {groupHeaders.map((_, idx) => {
                        const cellVal = row[`group_${idx + 1}`];
                        return (
                          <td key={idx} className="p-3 text-emerald-400 bg-emerald-500/5">
                            {cellVal || <span className="text-[#72706C] italic">(empty)</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
