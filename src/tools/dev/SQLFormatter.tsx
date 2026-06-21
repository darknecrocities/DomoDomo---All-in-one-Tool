import { useState } from 'react';
import { Copy, Check, Download, Trash2 } from 'lucide-react';
import { triggerTextDownload } from '../../utils/sharedHelpers';

export const SQLFormatterTool = () => {
  const [sql, setSql] = useState('SELECT id, name, email FROM users WHERE active = 1 AND age > 21 ORDER BY created_at DESC LIMIT 10;');
  const [formattedSql, setFormattedSql] = useState('');
  const [copied, setCopied] = useState(false);
  const [indentSize, setIndentSize] = useState(2);
  const [casing, setCasing] = useState<'upper' | 'lower' | 'preserve'>('upper');

  const handleFormat = () => {
    let query = sql.trim();
    if (!query) {
      setFormattedSql('');
      return;
    }

    // A simple, pure regex-based SQL formatter that aligns main keywords to newlines
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY', 'LIMIT', 'JOIN', 
      'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'HAVING', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM'
    ];

    // Standardize spacing
    query = query.replace(/\s+/g, ' ');

    // Normalize keyword casings depending on options
    keywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      query = query.replace(regex, (match) => {
        if (casing === 'upper') return match.toUpperCase();
        if (casing === 'lower') return match.toLowerCase();
        return match;
      });
    });

    // Insert newlines before primary keywords
    let formatted = query;
    const indent = ' '.repeat(indentSize);

    keywords.forEach(kw => {
      const matchWord = casing === 'upper' ? kw.toUpperCase() : casing === 'lower' ? kw.toLowerCase() : kw;
      // Replace with newline and keyword
      const regex = new RegExp(`\\b${matchWord}\\b`, 'g');
      formatted = formatted.replace(regex, `\n${matchWord}`);
    });

    // Clean up double newlines and indent nested segments like fields
    let lines = formatted.split('\n').filter(l => l.trim());
    lines = lines.map((line, idx) => {
      let trimmed = line.trim();
      // Indent subparts
      if (idx > 0 && !keywords.some(kw => trimmed.toUpperCase().startsWith(kw))) {
        return indent + trimmed;
      }
      return trimmed;
    });

    setFormattedSql(lines.join('\n'));
  };

  const handleMinify = () => {
    const minified = sql.replace(/\s+/g, ' ').replace(/\s*([,;=><])\s*/g, '$1').trim();
    setFormattedSql(minified);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedSql || sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-teal-400 font-bold border-b border-slate-800 pb-2">SQL Formatter & Beautifier</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[300px]">
            <div className="flex flex-col gap-1.5 h-full">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Raw SQL Input</label>
              <textarea
                value={sql}
                onChange={(e) => setSql(e.target.value)}
                className="w-full h-full bg-slate-950/20 border border-slate-850 rounded-2xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#4E8E5E] resize-none leading-relaxed outline-none"
                placeholder="Paste raw SQL query here..."
              />
            </div>
            
            <div className="flex flex-col gap-1.5 h-full">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Formatted Output</label>
              <pre className="w-full h-full bg-slate-950/40 border border-slate-850 rounded-2xl p-4 text-xs font-mono text-emerald-400 overflow-auto whitespace-pre-wrap select-all leading-relaxed">
                <code>{formattedSql || 'Click Format to generate beautified output...'}</code>
              </pre>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 mt-2 justify-between border-t border-slate-850 pt-3">
            <div className="flex gap-2">
              <button onClick={handleFormat} className="btn-primary py-2 px-4 text-xs">Format SQL</button>
              <button onClick={handleMinify} className="btn-secondary py-2 px-4 text-xs">Minify SQL</button>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5"
                title="Copy output"
              >
                {copied ? <Check size={14} className="text-teal-400" /> : <Copy size={14} />}
                <span>Copy</span>
              </button>
              <button
                onClick={() => triggerTextDownload(formattedSql || sql, 'query.sql')}
                className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5"
                title="Download query file"
              >
                <Download size={14} />
                <span>Download</span>
              </button>
              <button
                onClick={() => { setSql(''); setFormattedSql(''); }}
                className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-350 rounded border border-rose-500/20 transition-all"
                title="Clear input"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3">Format Specifications</h3>
          
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-450 font-semibold">Keywords Casing</label>
            <select
              value={casing}
              onChange={(e) => setCasing(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs font-semibold focus:outline-none"
            >
              <option value="upper">UPPERCASE (Standard)</option>
              <option value="lower">lowercase</option>
              <option value="preserve">Preserve Input Case</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-450 font-semibold">Indent Size (Spaces)</label>
            <input
              type="number"
              min="0"
              max="8"
              value={indentSize}
              onChange={(e) => setIndentSize(parseInt(e.target.value) || 0)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-250 text-xs font-mono focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
