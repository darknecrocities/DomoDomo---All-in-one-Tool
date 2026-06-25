import { useState } from 'react';
import { Copy, Check, Hash, Sliders } from 'lucide-react';

export const CaseConverterTool = () => {
  const [inputText, setInputText] = useState('hello world variable name');
  const [customSeparator, setCustomSeparator] = useState('-');
  const [stripNumbers, setStripNumbers] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Helper cleanups
  const cleanWords = (str: string): string[] => {
    let clean = str;
    // Optionally strip numbers
    if (stripNumbers) {
      clean = clean.replace(/[0-9]/g, '');
    }
    // Match word boundaries, underscores, dashes
    return clean
      .replace(/([a-z])([A-Z])/g, '$1 $2') // split camelCase
      .replace(/[_\-\s]+/g, ' ')           // replace underscores, dashes with space
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  };

  const toCamel = (words: string[]): string => {
    if (words.length === 0) return '';
    return words[0].toLowerCase() + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
  };

  const toPascal = (words: string[]): string => {
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
  };

  const toSnake = (words: string[]): string => {
    return words.map(w => w.toLowerCase()).join('_');
  };

  const toKebab = (words: string[]): string => {
    return words.map(w => w.toLowerCase()).join('-');
  };

  const toConstant = (words: string[]): string => {
    return words.map(w => w.toUpperCase()).join('_');
  };

  const toTitle = (words: string[]): string => {
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  const toSentence = (words: string[]): string => {
    if (words.length === 0) return '';
    const merged = words.map(w => w.toLowerCase()).join(' ');
    return merged.charAt(0).toUpperCase() + merged.slice(1);
  };

  const toSlugify = (str: string): string => {
    return str
      .toLowerCase()
      .normalize('NFD') // Normalize to separate accents from chars
      .replace(/[\u0300-\u036f]/g, '') // remove accent signs
      .replace(/[^a-z0-9\s-_]/g, '') // remove special symbols
      .trim()
      .replace(/[\s-_]+/g, customSeparator); // replace space/dashes with custom separator
  };

  const toToggleCase = (str: string): string => {
    return str
      .split('')
      .map(char => char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase())
      .join('');
  };

  const toDotNotation = (words: string[]): string => {
    return words.map(w => w.toLowerCase()).join('.');
  };

  const words = cleanWords(inputText);

  const conversions = [
    { key: 'camel', name: 'camelCase', value: toCamel(words) },
    { key: 'pascal', name: 'PascalCase', value: toPascal(words) },
    { key: 'snake', name: 'snake_case', value: toSnake(words) },
    { key: 'kebab', name: 'kebab-case', value: toKebab(words) },
    { key: 'constant', name: 'CONSTANT_CASE', value: toConstant(words) },
    { key: 'title', name: 'Title Case', value: toTitle(words) },
    { key: 'sentence', name: 'Sentence case', value: toSentence(words) },
    { key: 'slug', name: 'Slugify (URL)', value: toSlugify(inputText) },
    { key: 'toggle', name: 'tOgGlE cAsE', value: toToggleCase(inputText) },
    { key: 'dot', name: 'dot.notation', value: toDotNotation(words) }
  ];

  const handleCopy = (key: string, text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Input area */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-[#3C6B4D] font-bold border-b border-slate-800 pb-2">Case & Code Identifier Converter</h3>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-semibold uppercase">Enter Variable or Text</label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={3}
              placeholder="e.g. user signup date details"
              className="bg-slate-950 border border-slate-850 rounded-xl p-3.5 text-slate-200 text-sm focus:outline-none focus:border-[#3C6B4D] w-full"
            />
          </div>
        </div>

        {/* Output Grid */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <span className="text-xs text-slate-400 font-bold uppercase border-b border-slate-850 pb-2">Converted Formats</span>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {conversions.map((c) => (
              <div key={c.key} className="flex flex-col gap-1 bg-slate-900/30 border border-slate-850/50 p-3.5 rounded-xl">
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase">
                  <span>{c.name}</span>
                  <button
                    onClick={() => handleCopy(c.key, c.value)}
                    className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-white"
                  >
                    {copiedKey === c.key ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                </div>
                <div className="text-sm font-mono text-slate-250 select-all font-semibold break-all truncate pr-1">
                  {c.value || <span className="text-slate-650 italic">Waiting for input...</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Side panel settings */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-1.5"><Sliders size={14} className="text-[#3C6B4D]" /> Configuration</h3>
          
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold flex items-center gap-1"><Hash size={12} /> Slug Separator</label>
              <select
                value={customSeparator}
                onChange={(e) => setCustomSeparator(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs font-semibold focus:outline-none"
              >
                <option value="-">Dash (-)</option>
                <option value="_">Underscore (_)</option>
                <option value=".">Dot (.)</option>
                <option value="/">Slash (/)</option>
                <option value="">None (Empty)</option>
              </select>
            </div>

            <div className="flex items-center justify-between bg-slate-950 border border-slate-850/80 rounded-xl p-3">
              <div className="flex flex-col">
                <span className="text-xs text-slate-200 font-semibold">Strip Numbers</span>
                <span className="text-[10px] text-slate-500">Remove numerical characters</span>
              </div>
              <button
                onClick={() => setStripNumbers(!stripNumbers)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                  stripNumbers ? 'bg-[#3C6B4D]' : 'bg-slate-700'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  stripNumbers ? 'translate-x-4.5' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
