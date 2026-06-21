import { useState } from 'react';
import { Columns, Eye, Trash2 } from 'lucide-react';

export const DiffCheckerTool = () => {
  const [originalText, setOriginalText] = useState('const user = "Arron";\nconsole.log(user);\n\n// TODO: Fix background remover tool\nconst status = "pending";');
  const [modifiedText, setModifiedText] = useState('const user = "Arron Kian";\nconsole.log(user);\n\n// TODO: Fix background remover tool\n// Finished background remover fixes\nconst status = "resolved";');
  const [viewMode, setViewMode] = useState<'split' | 'inline'>('split');

  const computeDiff = () => {
    const origLines = originalText.split('\n');
    const modLines = modifiedText.split('\n');
    
    const maxLines = Math.max(origLines.length, modLines.length);
    const diffList: {
      origLineNum: number | null;
      modLineNum: number | null;
      origContent: string;
      modContent: string;
      type: 'added' | 'deleted' | 'modified' | 'unchanged';
    }[] = [];

    for (let i = 0; i < maxLines; i++) {
      const orig = origLines[i] !== undefined ? origLines[i] : null;
      const mod = modLines[i] !== undefined ? modLines[i] : null;

      if (orig === null && mod !== null) {
        diffList.push({ origLineNum: null, modLineNum: i + 1, origContent: '', modContent: mod, type: 'added' });
      } else if (orig !== null && mod === null) {
        diffList.push({ origLineNum: i + 1, modLineNum: null, origContent: orig, modContent: '', type: 'deleted' });
      } else if (orig !== mod) {
        diffList.push({ origLineNum: i + 1, modLineNum: i + 1, origContent: orig || '', modContent: mod || '', type: 'modified' });
      } else {
        diffList.push({ origLineNum: i + 1, modLineNum: i + 1, origContent: orig || '', modContent: mod || '', type: 'unchanged' });
      }
    }
    return diffList;
  };

  const diffs = computeDiff();

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="glass-card p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-teal-400 font-bold">Text Diff Checker</h3>
          <div className="flex p-0.5 bg-slate-900 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1 rounded-md font-semibold flex items-center gap-1.5 ${viewMode === 'split' ? 'bg-[#4E8E5E] text-white' : 'text-slate-450 hover:text-slate-200'}`}
            >
              <Columns size={12} />
              <span>Side-by-Side</span>
            </button>
            <button
              onClick={() => setViewMode('inline')}
              className={`px-3 py-1 rounded-md font-semibold flex items-center gap-1.5 ${viewMode === 'inline' ? 'bg-[#4E8E5E] text-white' : 'text-slate-450 hover:text-slate-200'}`}
            >
              <Eye size={12} />
              <span>Unified List</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Original Text</span>
            <textarea
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              rows={6}
              className="bg-slate-950/20 border border-slate-850 rounded-2xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#4E8E5E] resize-none outline-none leading-relaxed"
              placeholder="Paste original source text here..."
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Modified Text</span>
            <textarea
              value={modifiedText}
              onChange={(e) => setModifiedText(e.target.value)}
              rows={6}
              className="bg-slate-950/20 border border-slate-850 rounded-2xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#4E8E5E] resize-none outline-none leading-relaxed"
              placeholder="Paste modified text here..."
            />
          </div>
        </div>

        {/* Diff Output Workspace */}
        <div className="border border-slate-850 rounded-2xl bg-slate-950/40 overflow-hidden font-mono text-[11px] leading-relaxed p-4 max-h-[350px] overflow-y-auto">
          {viewMode === 'split' ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-0.5 border-r border-slate-850/50 pr-2">
                {diffs.map((diff, idx) => (
                  <div
                    key={idx}
                    className={`flex px-2 py-0.5 rounded ${
                      diff.type === 'deleted' ? 'bg-rose-950/45 text-rose-350 border-l-2 border-rose-500' :
                      diff.type === 'modified' ? 'bg-amber-950/30 text-amber-300' : 'text-slate-400'
                    }`}
                  >
                    <span className="w-8 shrink-0 text-slate-600 select-none">{diff.origLineNum || ''}</span>
                    <span className="break-all">{diff.origContent || ' '}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-0.5">
                {diffs.map((diff, idx) => (
                  <div
                    key={idx}
                    className={`flex px-2 py-0.5 rounded ${
                      diff.type === 'added' ? 'bg-emerald-950/40 text-emerald-350 border-l-2 border-emerald-500' :
                      diff.type === 'modified' ? 'bg-amber-950/30 text-amber-300' : 'text-slate-400'
                    }`}
                  >
                    <span className="w-8 shrink-0 text-slate-600 select-none">{diff.modLineNum || ''}</span>
                    <span className="break-all">{diff.modContent || ' '}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {diffs.map((diff, idx) => {
                if (diff.type === 'added') {
                  return (
                    <div key={idx} className="bg-emerald-950/40 text-emerald-350 px-3 py-0.5 rounded border-l-2 border-emerald-500 flex">
                      <span className="w-12 shrink-0 text-slate-600 select-none">+{diff.modLineNum}</span>
                      <span className="break-all">{diff.modContent}</span>
                    </div>
                  );
                }
                if (diff.type === 'deleted') {
                  return (
                    <div key={idx} className="bg-rose-950/45 text-rose-350 px-3 py-0.5 rounded border-l-2 border-rose-500 flex">
                      <span className="w-12 shrink-0 text-slate-600 select-none">-{diff.origLineNum}</span>
                      <span className="break-all">{diff.origContent}</span>
                    </div>
                  );
                }
                if (diff.type === 'modified') {
                  return (
                    <div key={idx} className="flex flex-col gap-0.5">
                      <div className="bg-rose-950/30 text-rose-400/80 px-3 py-0.5 rounded border-l-2 border-rose-500/50 flex">
                        <span className="w-12 shrink-0 text-slate-600 select-none">-{diff.origLineNum}</span>
                        <span className="break-all">{diff.origContent}</span>
                      </div>
                      <div className="bg-emerald-950/20 text-emerald-400/80 px-3 py-0.5 rounded border-l-2 border-emerald-500/50 flex">
                        <span className="w-12 shrink-0 text-slate-600 select-none">+{diff.modLineNum}</span>
                        <span className="break-all">{diff.modContent}</span>
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={idx} className="px-3 py-0.5 rounded flex text-slate-450">
                    <span className="w-12 shrink-0 text-slate-600 select-none">{diff.modLineNum}</span>
                    <span className="break-all">{diff.modContent}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button onClick={() => { setOriginalText(''); setModifiedText(''); }} className="btn-secondary self-end text-xs flex items-center gap-1.5">
          <Trash2 size={13} />
          <span>Clear Panels</span>
        </button>
      </div>
    </div>
  );
};
