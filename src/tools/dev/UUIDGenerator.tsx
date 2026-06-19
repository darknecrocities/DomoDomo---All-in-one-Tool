import { useState } from 'react';
import { Clipboard, RefreshCw, Check, FileText } from 'lucide-react';
import { handleTextCopy, triggerTextDownload } from '../../utils/sharedHelpers';

export const UUIDGeneratorTool = () => {
  const [version, setVersion] = useState<'v4' | 'v1' | 'v7'>('v4');
  const [quantity, setQuantity] = useState(5);
  const [casing, setCasing] = useState<'lower' | 'upper'>('lower');
  const [useHyphens, setUseHyphens] = useState(true);
  const [list, setList] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const uuidv1 = (): string => {
    const now = Date.now();
    const gTicks = (now * 10000) + 122192928000000000;
    const timeHex = gTicks.toString(16).padStart(16, '0');
    
    const part1 = timeHex.slice(8, 16);
    const part2 = timeHex.slice(4, 8);
    const part3 = '1' + timeHex.slice(1, 4); // v1
    
    const randArr = new Uint16Array(2);
    crypto.getRandomValues(randArr);
    const seq = ((randArr[0] & 0x3FFF) | 0x8000).toString(16).padStart(4, '0');
    const node = (randArr[1].toString(16).padStart(4, '0') + '00000000').slice(0, 12);
    
    return `${part1}-${part2}-${part3}-${seq}-${node}`;
  };

  const uuidv7 = (): string => {
    const now = Date.now();
    const hexTime = now.toString(16).padStart(12, '0');
    
    const randArr = new Uint16Array(6);
    crypto.getRandomValues(randArr);
    
    const part1 = hexTime.slice(0, 8);
    const part2 = hexTime.slice(8, 12);
    const varPart = (randArr[0] & 0x0FFF) | 0x7000; // v7
    const varHex = varPart.toString(16).padStart(4, '0');
    const seqPart = (randArr[1] & 0x3FFF) | 0x8000; // variant 10xx
    const seqHex = seqPart.toString(16).padStart(4, '0');
    const restHex = (randArr[2].toString(16).padStart(4, '0') +
                    randArr[3].toString(16).padStart(4, '0') +
                    randArr[4].toString(16).padStart(4, '0')).slice(0, 12);
                    
    return `${part1}-${part2}-${varHex}-${seqHex}-${restHex}`;
  };

  const generate = () => {
    const items: string[] = [];
    for (let i = 0; i < quantity; i++) {
      let raw = '';
      if (version === 'v4') {
        raw = crypto.randomUUID();
      } else if (version === 'v1') {
        raw = uuidv1();
      } else {
        raw = uuidv7();
      }

      // Formatting options
      let formatted = raw;
      if (!useHyphens) {
        formatted = formatted.replace(/-/g, '');
      }
      if (casing === 'upper') {
        formatted = formatted.toUpperCase();
      } else {
        formatted = formatted.toLowerCase();
      }

      items.push(formatted);
    }
    setList(items);
  };

  const handleCopySingle = (val: string, idx: number) => {
    navigator.clipboard.writeText(val);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const handleCopyBatch = () => {
    const batch = list.join('\n');
    handleTextCopy(batch, setCopiedAll);
  };

  const handleDownloadBatch = () => {
    const batch = list.join('\n');
    triggerTextDownload(batch, `uuids_${version}.txt`);
  };

  return (
    <div className="max-w-3xl mx-auto glass-card p-6 flex flex-col gap-6 text-left">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <FileText size={18} className="text-teal-400 animate-pulse" />
        <div>
          <h3 className="font-bold text-teal-400 text-sm">UUID Generator</h3>
          <p className="text-[10px] text-slate-500">Generate secure, random, or chronological Universally Unique Identifiers offline</p>
        </div>
        <span className="ml-auto text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">UUIDv7</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Settings block */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Generator Settings</span>

          {/* Version */}
          <div className="flex flex-col gap-1.5 bg-slate-900/40 p-3 rounded-lg border border-slate-850">
            <label className="text-[10px] text-slate-500 uppercase">UUID Version</label>
            <div className="flex flex-col gap-1 mt-1">
              {[
                { key: 'v4', title: 'UUID v4 (Random)', desc: 'Standard cryptographically secure random key' },
                { key: 'v7', title: 'UUID v7 (Time-ordered)', desc: 'Great for databases, sorted by generation timestamp' },
                { key: 'v1', title: 'UUID v1 (Timestamp-based)', desc: '100ns Gregorian timestamp and clock sequence' }
              ].map(opt => (
                <button key={opt.key} onClick={() => setVersion(opt.key as any)}
                  className={`w-full text-left p-2 rounded text-xs border transition-all ${
                    version === opt.key ? 'border-teal-500 bg-teal-500/10 text-teal-400 font-bold' : 'border-slate-850 bg-slate-950 text-slate-450 hover:border-slate-800'
                  }`}>
                  <div>{opt.title}</div>
                  <div className="text-[8px] text-slate-500 font-medium mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-500 uppercase">Generation count: {quantity}</label>
            <input type="range" min={1} max={50} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full accent-teal-500" />
          </div>

          {/* Options checkboxes */}
          <div className="flex flex-col gap-2 bg-slate-900/45 p-3 rounded-xl border border-slate-850">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={useHyphens} onChange={(e) => setUseHyphens(e.target.checked)} className="accent-teal-500 w-3.5 h-3.5 rounded" />
              <span className="text-xs text-slate-450">Include hyphens/separators</span>
            </label>
            <div className="flex gap-2 border-t border-slate-850 pt-2 mt-1">
              <button onClick={() => setCasing('lower')} className={`flex-1 py-1 text-[10px] font-bold rounded border ${casing === 'lower' ? 'border-teal-500 text-teal-400' : 'border-slate-800 text-slate-500'}`}>Lowercase</button>
              <button onClick={() => setCasing('upper')} className={`flex-1 py-1 text-[10px] font-bold rounded border ${casing === 'upper' ? 'border-teal-500 text-teal-400' : 'border-slate-800 text-slate-500'}`}>Uppercase</button>
            </div>
          </div>

          <button onClick={generate} className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 mt-2">
            <RefreshCw size={13} /> Generate Batch
          </button>
        </div>

        {/* Display list block */}
        <div className="md:col-span-7 flex flex-col gap-3 border-l border-slate-800 md:pl-6">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-400 font-bold uppercase tracking-wider">Generated List ({list.length})</span>
            {list.length > 0 && (
              <div className="flex gap-2">
                <button onClick={handleCopyBatch} className="text-teal-400 hover:underline">{copiedAll ? 'Copied' : 'Copy All'}</button>
                <span className="text-slate-700">·</span>
                <button onClick={handleDownloadBatch} className="text-teal-400 hover:underline">Download</button>
              </div>
            )}
          </div>

          {list.length > 0 ? (
            <div className="bg-slate-950/45 rounded-xl border border-slate-850 p-4 max-h-[360px] overflow-y-auto flex flex-col gap-2">
              {list.map((uuidItem, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-900/60 border border-slate-850 p-2.5 rounded-lg hover:border-slate-800">
                  <span className="font-mono text-xs text-emerald-400 select-all truncate max-w-[85%]">{uuidItem}</span>
                  <button onClick={() => handleCopySingle(uuidItem, idx)} className="p-1 text-slate-500 hover:text-white shrink-0">
                    {copiedIdx === idx ? <Check size={12} className="text-teal-400" /> : <Clipboard size={12} />}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[260px] bg-slate-950/20 border border-slate-850 rounded-xl flex items-center justify-center text-slate-550 text-xs">
              Generate keys to view records
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
