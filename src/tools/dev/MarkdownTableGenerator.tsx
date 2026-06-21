import { useState, useEffect } from 'react';
import { Copy, Check, Plus, Minus, Download } from 'lucide-react';
import { triggerTextDownload } from '../../utils/sharedHelpers';

export const MarkdownTableGeneratorTool = () => {
  const [cols, setCols] = useState(3);
  const [rows, setRows] = useState(3);
  const [alignments, setAlignments] = useState<('left' | 'center' | 'right')[]>(['left', 'left', 'left']);
  const [headers, setHeaders] = useState<string[]>(['Header 1', 'Header 2', 'Header 3']);
  const [grid, setGrid] = useState<string[][]>([
    ['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
    ['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3'],
    ['Row 3 Col 1', 'Row 3 Col 2', 'Row 3 Col 3']
  ]);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const generateMarkdownTable = () => {
    let md = '';
    // Headers
    md += '| ' + headers.map(h => h.trim() || ' ').join(' | ') + ' |\n';
    
    // Separator / Alignments
    md += '| ' + alignments.map(align => {
      if (align === 'center') return ':---:';
      if (align === 'right') return '---:';
      return ':---';
    }).join(' | ') + ' |\n';

    // Rows
    grid.forEach(row => {
      md += '| ' + row.map(cell => cell.trim() || ' ').join(' | ') + ' |\n';
    });

    setOutput(md);
  };

  useEffect(() => {
    generateMarkdownTable();
  }, [cols, rows, alignments, headers, grid]);

  const handleHeaderChange = (index: number, val: string) => {
    const updated = [...headers];
    updated[index] = val;
    setHeaders(updated);
  };

  const handleCellChange = (rIdx: number, cIdx: number, val: string) => {
    const updated = grid.map((r, ri) => {
      if (ri === rIdx) {
        return r.map((c, ci) => (ci === cIdx ? val : c));
      }
      return r;
    });
    setGrid(updated);
  };

  const handleAlignChange = (index: number, val: 'left' | 'center' | 'right') => {
    const updated = [...alignments];
    updated[index] = val;
    setAlignments(updated);
  };

  const addColumn = () => {
    setCols(cols + 1);
    setHeaders([...headers, `Header ${cols + 1}`]);
    setAlignments([...alignments, 'left']);
    setGrid(grid.map(row => [...row, '']));
  };

  const removeColumn = () => {
    if (cols <= 1) return;
    setCols(cols - 1);
    setHeaders(headers.slice(0, -1));
    setAlignments(alignments.slice(0, -1));
    setGrid(grid.map(row => row.slice(0, -1)));
  };

  const addRow = () => {
    setRows(rows + 1);
    setGrid([...grid, Array(cols).fill('')]);
  };

  const removeRow = () => {
    if (rows <= 1) return;
    setRows(rows - 1);
    setGrid(grid.slice(0, -1));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-teal-400 font-bold border-b border-slate-800 pb-2">Markdown Table Generator</h3>
          
          <div className="flex gap-4 items-center bg-slate-900/40 p-3 rounded-xl border border-slate-850">
            <span className="text-xs text-slate-400 font-semibold uppercase">Controls:</span>
            <div className="flex gap-2">
              <button onClick={addColumn} className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1"><Plus size={12} /> Col</button>
              <button onClick={removeColumn} className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1 disabled:opacity-30" disabled={cols <= 1}><Minus size={12} /> Col</button>
            </div>
            <div className="flex gap-2">
              <button onClick={addRow} className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1"><Plus size={12} /> Row</button>
              <button onClick={removeRow} className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1 disabled:opacity-30" disabled={rows <= 1}><Minus size={12} /> Row</button>
            </div>
          </div>

          <div className="overflow-x-auto w-full border border-slate-850/80 rounded-xl bg-slate-950/20 p-4">
            <table className="min-w-full text-xs text-slate-200">
              <thead>
                <tr>
                  {headers.map((h, cIdx) => (
                    <th key={cIdx} className="p-1 border border-slate-850/60 bg-slate-900/60 min-w-[120px]">
                      <div className="flex flex-col gap-1.5">
                        <input
                          type="text"
                          value={h}
                          onChange={(e) => handleHeaderChange(cIdx, e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded p-1 text-center font-bold text-slate-200 focus:outline-none"
                        />
                        <select
                          value={alignments[cIdx] || 'left'}
                          onChange={(e) => handleAlignChange(cIdx, e.target.value as any)}
                          className="bg-slate-950 border border-slate-800 rounded p-0.5 text-[10px] text-slate-400 focus:outline-none"
                        >
                          <option value="left">Left Align</option>
                          <option value="center">Center Align</option>
                          <option value="right">Right Align</option>
                        </select>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grid.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-1 border border-slate-850/60">
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                          className="w-full bg-transparent border border-transparent rounded p-1 hover:bg-slate-900/20 focus:bg-slate-950 focus:border-slate-800 text-slate-300 focus:outline-none"
                          style={{
                            textAlign: alignments[cIdx] === 'center' ? 'center' : alignments[cIdx] === 'right' ? 'right' : 'left'
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3">Markdown Code</h3>
          <pre className="w-full h-[250px] bg-slate-950/40 border border-slate-850 rounded-2xl p-4 text-xs font-mono text-emerald-400 overflow-auto whitespace-pre-wrap select-all leading-relaxed">
            <code>{output}</code>
          </pre>
          <div className="flex gap-2 mt-2">
            <button onClick={handleCopy} className="btn-primary py-2 px-4 text-xs flex-1 flex items-center justify-center gap-1.5">
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied ✓' : 'Copy Table'}</span>
            </button>
            <button onClick={() => triggerTextDownload(output, 'table.md')} className="btn-secondary py-2 px-3 text-xs" title="Download file"><Download size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};
