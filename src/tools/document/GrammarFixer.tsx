import { useState } from 'react';
import { FileText, Sparkles, ShieldAlert, AlertCircle } from 'lucide-react';
import { handleTextCopy } from '../../utils/sharedHelpers';

interface FixSuggestion {
  original: string;
  replacement: string;
  reason: string;
}

const COMMON_TYPOS: { [key: string]: string } = {
  'teh': 'the',
  'recieve': 'receive',
  'seperate': 'separate',
  'definitly': 'definitely',
  'truely': 'truly',
  'i': 'I',
  'dont': "don't",
  'cant': "can't",
  'doesnt': "doesn't"
};

export const GrammarFixerTool = () => {
  const [text, setText] = useState('i runs teh code. teh code is truely secure. it cant fails.');
  const [suggestions, setSuggestions] = useState<FixSuggestion[]>([]);
  const [fixedText, setFixedText] = useState('');
  const [copied, setCopied] = useState(false);

  const handleScanText = () => {
    if (!text.trim()) return;

    const foundSuggestions: FixSuggestion[] = [];
    
    // 1. Check double spacing
    if (/\s{2,}/.test(text)) {
      foundSuggestions.push({
        original: 'Double Space',
        replacement: 'Single Space',
        reason: 'Consolidate multiple spacing tabs'
      });
    }

    // 2. Check double words
    const doubleWordMatches = text.match(/\b(\w+)\s+\1\b/gi);
    if (doubleWordMatches) {
      doubleWordMatches.forEach(match => {
        const word = match.split(/\s+/)[0];
        foundSuggestions.push({
          original: match,
          replacement: word,
          reason: `Remove repeated word "${word}"`
        });
      });
    }

    // 3. Check capitalization of standalone "i"
    if (/\bi\b/g.test(text)) {
      foundSuggestions.push({
        original: 'i',
        replacement: 'I',
        reason: 'Capitalize personal pronoun'
      });
    }

    // 4. Check common typos
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    words.forEach(w => {
      if (COMMON_TYPOS[w]) {
        foundSuggestions.push({
          original: w,
          replacement: COMMON_TYPOS[w],
          reason: `Fix spelling typo of "${w}"`
        });
      }
    });

    // 5. Subject verb agreement basics (runs -> run)
    if (/\bi runs\b/i.test(text)) {
      foundSuggestions.push({
        original: 'i runs',
        replacement: 'I run',
        reason: 'Correct subject-verb agreement'
      });
    }

    setSuggestions(foundSuggestions);

    // Apply fixes
    let result = text;
    // double spacing
    result = result.replace(/\s{2,}/g, ' ');
    // double words
    result = result.replace(/\b(\w+)\s+\1\b/gi, '$1');
    // standalone i
    result = result.replace(/\bi\b/g, 'I');
    // typos replacement
    Object.keys(COMMON_TYPOS).forEach(typo => {
      const regex = new RegExp(`\\b${typo}\\b`, 'gi');
      result = result.replace(regex, COMMON_TYPOS[typo]);
    });
    // subject verb
    result = result.replace(/\bi runs\b/gi, 'I run');
    result = result.replace(/\bi is\b/gi, 'I am');
    result = result.replace(/\bhe runs\b/gi, 'he runs'); // keep standard

    // Capitalize sentences
    result = result.replace(/(^\s*|[.!?]\s+)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());

    setFixedText(result);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Editor Workspace */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="text-[#4E8E5E]" size={22} />
              <span>Grammar & Typo Fixer</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">Offline syntax checks</span>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Source Text</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-[#151C2C]/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E] h-32 resize-none leading-relaxed outline-none"
              placeholder="Type or paste paragraphs here..."
            />
          </div>

          {fixedText && (
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-xs text-slate-455 font-bold uppercase tracking-wider">Corrected Output</span>
              <textarea
                readOnly
                value={fixedText}
                className="w-full bg-slate-950 p-4 text-xs font-mono h-32 rounded-2xl border border-slate-900 text-slate-350 focus:outline-none resize-none leading-relaxed"
              />
            </div>
          )}
        </div>
      </div>

      {/* Control panel */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5">
          <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3">Scan results</h3>

          {suggestions.length > 0 ? (
            <div className="flex flex-col gap-3 max-h-[200px] overflow-y-auto pr-1">
              {suggestions.map((sug, index) => (
                <div key={index} className="flex gap-2.5 items-start bg-slate-900/40 p-2.5 rounded-xl border border-slate-850 text-[10px]">
                  <AlertCircle className="text-amber-400 shrink-0 mt-0.5" size={14} />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-slate-300">
                      Replace "{sug.original}" with "{sug.replacement}"
                    </span>
                    <span className="text-slate-500">{sug.reason}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 leading-relaxed">
              No active suggestions. Run scanner to analyze capitalization, double words, and spelling typos.
            </p>
          )}

          <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
            <button onClick={handleScanText} className="btn-primary w-full py-3">
              <Sparkles size={18} />
              <span>Analyze & Auto-Fix</span>
            </button>
            {fixedText && (
              <button
                onClick={() => handleTextCopy(fixedText, setCopied)}
                className="btn-secondary w-full py-2"
              >
                <span>{copied ? 'Copied fixed text!' : 'Copy corrected text'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Local Processing Banner */}
        <div className="bg-[#151C2C]/50 border border-slate-800 rounded-2xl p-4 flex gap-3 text-slate-400">
          <ShieldAlert size={20} className="text-[#4E8E5E] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-slate-300">100% Secure Local Scan</span>
            <span className="text-[10px] leading-relaxed">Typos dictionary checks and word regex parsing run entirely inside your browser sandbox.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
