import { useState, useMemo } from 'react';
import { Sliders, Copy, Check, Grid, RefreshCw } from 'lucide-react';

interface GridArea {
  name: string;
  startCol: number;
  endCol: number;
  startRow: number;
  endRow: number;
  color: string;
}

export const CSSGridBuilderTool = () => {
  const [cols, setCols] = useState<number>(4);
  const [rows, setRows] = useState<number>(3);
  const [colGap, setColGap] = useState<number>(10);
  const [rowGap, setRowGap] = useState<number>(10);
  
  // Track units configurations (e.g. fr, px, %)
  const [colTracks, setColTracks] = useState<string[]>(['1fr', '1fr', '1fr', '1fr']);
  const [rowTracks, setRowTracks] = useState<string[]>(['1fr', '1fr', '1fr']);

  const [gridAreas, setGridAreas] = useState<GridArea[]>([
    { name: 'header', startCol: 1, endCol: 5, startRow: 1, endRow: 2, color: '#3C6B4D' },
    { name: 'sidebar', startCol: 1, endCol: 2, startRow: 2, endRow: 4, color: '#10B981' },
    { name: 'content', startCol: 2, endCol: 5, startRow: 2, endRow: 4, color: '#D97706' }
  ]);

  const [newAreaName, setNewAreaName] = useState<string>('footer');
  const [copied, setCopied] = useState<boolean>(false);

  const [selection, setSelection] = useState<{ startX: number; startY: number; curX: number; curY: number } | null>(null);

  const colors = ['#8B5CF6', '#EC4899', '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#3C6B4D'];

  const handleUpdateColsCount = (count: number) => {
    setCols(count);
    const nextTracks = Array.from({ length: count }, (_, idx) => colTracks[idx] || '1fr');
    setColTracks(nextTracks);
  };

  const handleUpdateRowsCount = (count: number) => {
    setRows(count);
    const nextTracks = Array.from({ length: count }, (_, idx) => rowTracks[idx] || '1fr');
    setRowTracks(nextTracks);
  };

  const handleCreateArea = () => {
    if (!selection) return;
    if (!newAreaName.trim()) return;

    // Calculate grid coordinates (1-based index)
    const minCol = Math.min(selection.startX, selection.curX);
    const maxCol = Math.max(selection.startX, selection.curX) + 1;
    const minRow = Math.min(selection.startY, selection.curY);
    const maxRow = Math.max(selection.startY, selection.curY) + 1;

    // Overlap checks: strip any overlapping parts
    const filteredAreas = gridAreas.filter(area => {
      const horizontalOverlap = !(maxCol <= area.startCol || minCol >= area.endCol);
      const verticalOverlap = !(maxRow <= area.startRow || minRow >= area.endRow);
      return !(horizontalOverlap && verticalOverlap);
    });

    const newArea: GridArea = {
      name: newAreaName.trim().toLowerCase().replace(/\s+/g, '-'),
      startCol: minCol,
      endCol: maxCol,
      startRow: minRow,
      endRow: maxRow,
      color: colors[filteredAreas.length % colors.length]
    };

    setGridAreas([...filteredAreas, newArea]);
    setSelection(null);
    setNewAreaName(`area-${filteredAreas.length + 2}`);
  };

  // Compile CSS grid template code
  const generatedCssCode = useMemo(() => {
    const parentRules = `.grid-container {
  display: grid;
  grid-template-columns: ${colTracks.join(' ')};
  grid-template-rows: ${rowTracks.join(' ')};
  column-gap: ${colGap}px;
  row-gap: ${rowGap}px;
}`;

    const childRules = gridAreas.map(area => {
      return `.${area.name} {
  grid-column: ${area.startCol} / ${area.endCol};
  grid-row: ${area.startRow} / ${area.endRow};
  background-color: ${area.color};
}`;
    }).join('\n\n');

    return `${parentRules}\n\n${childRules}`;
  }, [colTracks, rowTracks, colGap, rowGap, gridAreas]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleReset = () => {
    setGridAreas([]);
    setSelection(null);
    setCols(4);
    setRows(3);
    setColTracks(['1fr', '1fr', '1fr', '1fr']);
    setRowTracks(['1fr', '1fr', '1fr']);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Configure sidebar */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-sm font-extrabold text-[#ECEBE9] border-b border-[#2A2D30] pb-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5"><Sliders size={15} className="text-[#3C6B4D]" /> Grid Specifications</span>
            <button
              onClick={handleReset}
              className="p-1 hover:bg-[#1E2022] rounded text-[#72706C] hover:text-[#ECEBE9]"
              title="Reset Grid Layout"
            >
              <RefreshCw size={13} />
            </button>
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[#A3A09B] font-bold uppercase">Columns ({cols})</label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={cols}
                  onChange={(e) => handleUpdateColsCount(Number(e.target.value))}
                  className="accent-[#3C6B4D]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[#A3A09B] font-bold uppercase">Rows ({rows})</label>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={rows}
                  onChange={(e) => handleUpdateRowsCount(Number(e.target.value))}
                  className="accent-[#3C6B4D]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#A3A09B] font-bold uppercase">Column Gap (px)</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={colGap}
                  onChange={(e) => setColGap(Number(e.target.value))}
                  className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-1.5 text-xs text-[#ECEBE9] focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#A3A09B] font-bold uppercase">Row Gap (px)</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={rowGap}
                  onChange={(e) => setRowGap(Number(e.target.value))}
                  className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-1.5 text-xs text-[#ECEBE9] focus:outline-none"
                />
              </div>
            </div>

            {/* Custom track units config */}
            <div className="border-t border-[#2A2D30] pt-4 space-y-2.5">
              <label className="text-[10px] text-[#A3A09B] font-bold uppercase block">Track Sizing overrides (e.g. 1fr, 100px, 25%)</label>
              <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                {colTracks.map((track, i) => (
                  <div key={`col-${i}`} className="flex items-center justify-between text-xs bg-[#111213] border border-[#2A2D30] p-1.5 rounded-xl">
                    <span className="text-[#72706C] font-mono">Col {i+1}</span>
                    <input
                      type="text"
                      value={track}
                      onChange={(e) => {
                        const next = [...colTracks];
                        next[i] = e.target.value;
                        setColTracks(next);
                      }}
                      className="bg-transparent border-b border-[#2A2D30] focus:border-[#3C6B4D] text-xs text-right text-[#ECEBE9] w-[80px] focus:outline-none font-mono"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Area creator */}
            {selection && (
              <div className="border-t border-[#2A2D30] pt-4 space-y-3 bg-[#3C6B4D]/5 p-3 rounded-xl border border-[#3C6B4D]/25">
                <span className="text-[10px] text-emerald-450 font-bold uppercase">Create Grid Area</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAreaName}
                    onChange={(e) => setNewAreaName(e.target.value)}
                    placeholder="Area name (e.g. main)"
                    className="flex-1 bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-1.5 text-xs text-[#ECEBE9] focus:outline-none"
                  />
                  <button
                    onClick={handleCreateArea}
                    className="py-1.5 px-3 bg-[#3C6B4D] hover:bg-[#2E533B] text-white text-xs font-bold rounded-xl"
                  >
                    Save Area
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid Canvas and CSS exporter */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="glass-card bg-[#18191B] p-6 border border-[#2A2D30] rounded-2xl flex flex-col gap-4">
          <div className="pb-2 border-b border-[#2A2D30]">
            <h4 className="text-sm font-extrabold text-[#ECEBE9] flex items-center gap-1.5"><Grid size={15} className="text-[#3C6B4D]" /> Visual Layout Editor</h4>
            <span className="text-[9px] text-[#72706C] font-semibold uppercase mt-0.5 block">Click and drag across cells to highlight/create named grid-areas.</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`,
              gap: '6px'
            }}
            className="bg-[#111213] p-4 rounded-xl border border-[#2A2D30] min-h-[220px] select-none"
          >
            {Array.from({ length: rows }).map((_, rIdx) => {
              const r = rIdx + 1;
              return Array.from({ length: cols }).map((_, cIdx) => {
                const c = cIdx + 1;
                
                // Check if this cell belongs to any defined grid area
                const matchedArea = gridAreas.find(area => {
                  return c >= area.startCol && c < area.endCol && r >= area.startRow && r < area.endRow;
                });

                // Check selection highlighting
                const isSelected = selection && 
                  c >= Math.min(selection.startX, selection.curX) && c <= Math.max(selection.startX, selection.curX) &&
                  r >= Math.min(selection.startY, selection.curY) && r <= Math.max(selection.startY, selection.curY);

                let cellBg = 'bg-[#18191B] border-[#2A2D30]/65 hover:border-[#3C6B4D]';
                let style: React.CSSProperties = {};
                if (matchedArea) {
                  style = { backgroundColor: `${matchedArea.color}25`, borderColor: matchedArea.color };
                } else if (isSelected) {
                  style = { backgroundColor: '#3C6B4D15', borderColor: '#3C6B4D' };
                }

                return (
                  <div
                    key={`${r}-${c}`}
                    style={style}
                    onMouseDown={() => {
                      setSelection({ startX: c, startY: r, curX: c, curY: r });
                    }}
                    onMouseEnter={() => {
                      if (selection) {
                        setSelection({ ...selection, curX: c, curY: r });
                      }
                    }}
                    className={`border-2 border-dashed rounded-lg p-3 text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-75 text-[10px] ${cellBg}`}
                  >
                    {matchedArea ? (
                      <span className="font-bold text-[#ECEBE9] truncate max-w-full" style={{ color: matchedArea.color }}>
                        {matchedArea.name}
                      </span>
                    ) : (
                      <span className="text-[#72706C] font-mono">{r},{c}</span>
                    )}
                  </div>
                );
              });
            })}
          </div>
        </div>

        {/* Code exporter */}
        <div className="glass-card p-6 flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-[#2A2D30] pb-2">
            <span className="text-[10px] text-[#A3A09B] font-bold uppercase tracking-wider">CSS Grid Code Export</span>
            <button
              onClick={handleCopy}
              className="py-1 px-3 bg-[#111213] hover:bg-[#1E2022] text-[#A3A09B] hover:text-[#ECEBE9] rounded-lg text-xs font-bold border border-[#2A2D30] flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>Copy Code</span>
            </button>
          </div>

          <div className="bg-[#111213] p-3 rounded-xl border border-[#2A2D30] max-h-[160px] overflow-y-auto">
            <pre className="text-[10px] font-mono text-[#E29E2D] leading-relaxed break-all select-all">
              {generatedCssCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
