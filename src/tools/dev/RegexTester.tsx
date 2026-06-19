import { useState, useEffect } from 'react';
import { Search, Info, AlertTriangle, BookOpen, Layers } from 'lucide-react';

interface RegexTemplate {
  name: string;
  pattern: string;
  desc: string;
}

const TEMPLATES: RegexTemplate[] = [
  { name: 'Email Address', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', desc: 'Validates standard email structures' },
  { name: 'URL Validation', pattern: '^https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)$', desc: 'Validates secure HTTP/HTTPS query URLs' },
  { name: 'IP Address (IPv4)', pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$', desc: 'Validates IPv4 network addresses' },
  { name: 'Date (YYYY-MM-DD)', pattern: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$', desc: 'Validates standard calendar dates' },
  { name: 'Phone Number', pattern: '^\\+?\\d{1,4}?[-.\\s]?\\(?\\d{1,3}?\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,9}$', desc: 'Matches localized telephone profiles' },
];

export const RegexTesterTool = () => {
  const [pattern, setPattern] = useState('^[a-zA-Z5-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$');
  const [flags, setFlags] = useState({
    g: true,
    i: true,
    m: false,
    s: false,
    u: false,
  });
  const [testText, setTestText] = useState('Contact us at support@domodomo.io or admin@domo.com');
  const [error, setError] = useState('');
  
  // Results
  const [isMatch, setIsMatch] = useState(false);
  const [matches, setMatches] = useState<{ text: string; index: number; groups: string[] }[]>([]);

  const handleApplyTemplate = (tpl: RegexTemplate) => {
    setPattern(tpl.pattern);
    setError('');
  };

  useEffect(() => {
    try {
      setError('');
      setIsMatch(false);
      setMatches([]);

      if (!pattern) return;

      // Construct flag string
      let activeFlags = '';
      if (flags.g) activeFlags += 'g';
      if (flags.i) activeFlags += 'i';
      if (flags.m) activeFlags += 'm';
      if (flags.s) activeFlags += 's';
      if (flags.u) activeFlags += 'u';

      const regex = new RegExp(pattern, activeFlags);
      const matched = regex.test(testText);
      setIsMatch(matched);

      if (matched && testText) {
        const found: typeof matches = [];
        // Reset regex index if global flag is on
        regex.lastIndex = 0;
        
        if (flags.g) {
          let m;
          while ((m = regex.exec(testText)) !== null) {
            found.push({
              text: m[0],
              index: m.index,
              groups: m.slice(1).filter(Boolean),
            });
            // Avoid infinite loops on empty matches
            if (m.index === regex.lastIndex) regex.lastIndex++;
          }
        } else {
          const m = testText.match(regex);
          if (m) {
            found.push({
              text: m[0],
              index: m.index || 0,
              groups: m.slice(1).filter(Boolean),
            });
          }
        }
        setMatches(found);
      }
    } catch (e: any) {
      setError(e.message || 'Invalid regular expression');
    }
  }, [pattern, flags, testText]);

  const toggleFlag = (flagKey: keyof typeof flags) => {
    setFlags(prev => ({ ...prev, [flagKey]: !prev[flagKey] }));
  };

  // Render text markup highlights
  const renderHighlightedText = () => {
    if (matches.length === 0 || !testText) return <span>{testText}</span>;

    const elements: React.ReactNode[] = [];
    let lastIdx = 0;

    // Sort matches by index to render sequentially
    const sortedMatches = [...matches].sort((a, b) => a.index - b.index);

    sortedMatches.forEach((m, idx) => {
      const matchStart = m.index;
      const matchEnd = matchStart + m.text.length;

      // Unmatched segment before this match
      if (matchStart > lastIdx) {
        elements.push(<span key={`text-${idx}`}>{testText.substring(lastIdx, matchStart)}</span>);
      }

      // Highlighted match segment
      elements.push(
        <mark key={`match-${idx}`} className="bg-teal-500/25 border-b border-teal-500 text-teal-300 font-bold px-0.5 rounded shadow-sm">
          {m.text}
        </mark>
      );

      lastIdx = matchEnd;
    });

    if (lastIdx < testText.length) {
      elements.push(<span key="text-end">{testText.substring(lastIdx)}</span>);
    }

    return elements;
  };

  return (
    <div className="max-w-4xl mx-auto glass-card p-6 flex flex-col gap-6 text-left">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Search size={18} className="text-teal-400" />
        <div>
          <h3 className="font-bold text-teal-400 text-sm">Regular Expression Tester</h3>
          <p className="text-[10px] text-slate-500">Offline Regex pattern compiler, matches highlighter, and capture groups parser</p>
        </div>
        <span className="ml-auto text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">Compiler</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Editor columns */}
        <div className="md:col-span-7 flex flex-col gap-4">
          {/* Pattern input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-500 uppercase font-semibold">Regex Expression Pattern</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-mono">/</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter regex pattern here..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-6 pr-16 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-teal-500"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">/gim</span>
            </div>
            {error && (
              <div className="bg-rose-500/5 border border-rose-500/20 text-rose-400 text-[10px] p-2.5 rounded flex items-start gap-1 mt-1">
                <AlertTriangle size={11} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Test string input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-500 uppercase font-semibold">Test string text</label>
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Enter matching text payload..."
              className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono h-40 text-slate-200 resize-none w-full focus:outline-none focus:border-teal-500/50"
            />
          </div>

          {/* Render highlights visualization */}
          {testText && isMatch && (
            <div className="bg-slate-950/45 border border-slate-850 p-4 rounded-xl flex flex-col gap-2">
              <span className="text-[9px] text-slate-550 uppercase font-bold tracking-wider">Highlighted Matches Markup</span>
              <div className="text-xs font-mono leading-relaxed whitespace-pre-wrap select-all">
                {renderHighlightedText()}
              </div>
            </div>
          )}
        </div>

        {/* Settings side columns */}
        <div className="md:col-span-5 flex flex-col gap-4 border-l border-slate-800 md:pl-6">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pattern Flags</span>

          {/* Checkbox flags */}
          <div className="grid grid-cols-2 gap-2 bg-slate-900/40 p-3.5 rounded-xl border border-slate-850">
            {[
              { key: 'g', label: 'Global (g)', desc: 'Match all occurrences' },
              { key: 'i', label: 'Case Insensitive (i)', desc: 'Ignore lowercase/uppercase differences' },
              { key: 'm', label: 'Multiline (m)', desc: '^ and $ anchor across lines' },
              { key: 's', label: 'Dot All (s)', desc: 'Dot (.) matches line breaks' },
              { key: 'u', label: 'Unicode (u)', desc: 'Enable full UTF-8 boundaries' }
            ].map(f => (
              <label key={f.key} className="flex items-start gap-2 cursor-pointer col-span-2">
                <input type="checkbox" checked={flags[f.key as keyof typeof flags]} onChange={() => toggleFlag(f.key as keyof typeof flags)} className="accent-teal-500 w-3.5 h-3.5 rounded mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-350">{f.label}</span>
                  <span className="text-[9px] text-slate-500">{f.desc}</span>
                </div>
              </label>
            ))}
          </div>

          {/* Quick presets templates */}
          <div className="flex flex-col gap-2 bg-slate-900/30 p-3 rounded-xl border border-slate-850">
            <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1.5"><BookOpen size={11} /> Match Pattern Presets</span>
            <div className="flex flex-col gap-1.5">
              {TEMPLATES.map(tpl => (
                <button key={tpl.name} onClick={() => handleApplyTemplate(tpl)} className="w-full text-left p-1.5 rounded bg-slate-950 border border-slate-850/60 text-[10px] hover:border-teal-500/40 transition-all">
                  <div className="font-bold text-teal-400">{tpl.name}</div>
                  <div className="text-slate-500 text-[9px] truncate mt-0.5">{tpl.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Match statistics summary */}
          <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-mono">
            <div className={`p-2.5 rounded-lg border font-bold ${isMatch ? 'bg-emerald-950/20 border-emerald-800/30 text-emerald-400' : 'bg-rose-950/20 border-rose-800/30 text-rose-450'}`}>
              STATUS: {isMatch ? 'MATCHES FOUND' : 'NO MATCHES'}
            </div>
            <div className="bg-slate-950/40 border border-slate-850 p-2.5 rounded-lg flex items-center justify-center font-bold text-slate-350">
              COUNT: {matches.length} matches
            </div>
          </div>
        </div>
      </div>

      {/* Capture Groups details tables */}
      {matches.length > 0 && matches.some(m => m.groups.length > 0) && (
        <div className="flex flex-col gap-3 bg-slate-900/40 p-4 rounded-xl border border-slate-850">
          <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1.5"><Layers size={12} /> Captured Sub-groups Table</span>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-550 uppercase">
                  <th className="py-1">Match Index</th>
                  <th className="py-1">Full Match Text</th>
                  <th className="py-1">Captured Groups</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m, idx) => (
                  <tr key={idx} className="border-b border-slate-850/60 hover:bg-slate-900/20">
                    <td className="py-2 text-slate-550">#{idx + 1} (offset {m.index})</td>
                    <td className="py-2 text-teal-400 font-bold">{m.text}</td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-1">
                        {m.groups.map((g, gIdx) => (
                          <span key={gIdx} className="bg-indigo-950/20 border border-indigo-900/40 text-indigo-400 px-1.5 py-0.5 rounded text-[10px]">{g}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex items-start gap-1.5 text-[10px] text-slate-500 bg-slate-950/25 p-3 rounded-lg border border-slate-850/65">
        <Info size={11} className="text-teal-400 shrink-0 mt-0.5" />
        <span>Regular expression compiling operates entirely offline using browser RegExp nodes. Best suited for testing validations.</span>
      </div>
    </div>
  );
};
