import { useState } from 'react';
import { Copy, Check, Plus, Minus, Layout, Palette } from 'lucide-react';

interface GridChildItem {
  id: number;
  label: string;
  flexGrow: number;
  flexShrink: number;
  alignSelf: string;
  gridColumnSpan: number;
  gridRowSpan: number;
  colorPreset: string;
}

const COLOR_PRESETS = [
  'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
  'bg-teal-500/20 border-teal-500/40 text-teal-400',
  'bg-cyan-500/20 border-cyan-500/40 text-cyan-400',
  'bg-amber-500/20 border-amber-500/40 text-amber-400',
  'bg-rose-500/20 border-rose-500/40 text-rose-400',
  'bg-indigo-500/20 border-indigo-500/40 text-indigo-400',
];

export const FlexboxGridPlaygroundTool = () => {
  const [layoutMode, setLayoutMode] = useState<'flex' | 'grid'>('flex');
  
  // Container states
  const [gap, setGap] = useState(16);
  const [padding, setPadding] = useState(16);
  
  // Flex specific
  const [flexDirection, setFlexDirection] = useState<'row' | 'row-reverse' | 'column' | 'column-reverse'>('row');
  const [flexWrap, setFlexWrap] = useState<'nowrap' | 'wrap' | 'wrap-reverse'>('wrap');
  const [justifyContent, setJustifyContent] = useState('flex-start');
  const [alignItems, setAlignItems] = useState('stretch');
  
  // Grid specific
  const [gridColumns, setGridColumns] = useState('repeat(auto-fit, minmax(120px, 1fr))');
  const [gridAutoFlow, setGridAutoFlow] = useState<'row' | 'column' | 'dense'>('row');

  // Items state
  const [items, setItems] = useState<GridChildItem[]>([
    { id: 1, label: 'Item 1', flexGrow: 0, flexShrink: 1, alignSelf: 'auto', gridColumnSpan: 1, gridRowSpan: 1, colorPreset: COLOR_PRESETS[0] },
    { id: 2, label: 'Item 2', flexGrow: 0, flexShrink: 1, alignSelf: 'auto', gridColumnSpan: 1, gridRowSpan: 1, colorPreset: COLOR_PRESETS[1] },
    { id: 3, label: 'Item 3', flexGrow: 0, flexShrink: 1, alignSelf: 'auto', gridColumnSpan: 1, gridRowSpan: 1, colorPreset: COLOR_PRESETS[2] },
    { id: 4, label: 'Item 4', flexGrow: 0, flexShrink: 1, alignSelf: 'auto', gridColumnSpan: 1, gridRowSpan: 1, colorPreset: COLOR_PRESETS[3] },
  ]);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(1);
  const [copied, setCopied] = useState(false);

  // Layout presets
  const applyPreset = (preset: 'navbar' | 'cards' | 'centered' | 'split') => {
    if (preset === 'navbar') {
      setLayoutMode('flex');
      setFlexDirection('row');
      setFlexWrap('nowrap');
      setJustifyContent('space-between');
      setAlignItems('center');
      setGap(20);
      setItems([
        { id: 1, label: 'Logo 🚀', flexGrow: 0, flexShrink: 1, alignSelf: 'auto', gridColumnSpan: 1, gridRowSpan: 1, colorPreset: COLOR_PRESETS[0] },
        { id: 2, label: 'Home', flexGrow: 0, flexShrink: 1, alignSelf: 'auto', gridColumnSpan: 1, gridRowSpan: 1, colorPreset: COLOR_PRESETS[1] },
        { id: 3, label: 'Products', flexGrow: 0, flexShrink: 1, alignSelf: 'auto', gridColumnSpan: 1, gridRowSpan: 1, colorPreset: COLOR_PRESETS[2] },
        { id: 4, label: 'Contact Us', flexGrow: 0, flexShrink: 1, alignSelf: 'auto', gridColumnSpan: 1, gridRowSpan: 1, colorPreset: COLOR_PRESETS[3] },
      ]);
    } else if (preset === 'cards') {
      setLayoutMode('grid');
      setGridColumns('repeat(auto-fit, minmax(140px, 1fr))');
      setGap(16);
      setItems([
        { id: 1, label: 'Card Item 1', flexGrow: 0, flexShrink: 1, alignSelf: 'auto', gridColumnSpan: 1, gridRowSpan: 1, colorPreset: COLOR_PRESETS[0] },
        { id: 2, label: 'Card Item 2', flexGrow: 0, flexShrink: 1, alignSelf: 'auto', gridColumnSpan: 1, gridRowSpan: 1, colorPreset: COLOR_PRESETS[1] },
        { id: 3, label: 'Card Item 3', flexGrow: 0, flexShrink: 1, alignSelf: 'auto', gridColumnSpan: 1, gridRowSpan: 1, colorPreset: COLOR_PRESETS[2] },
        { id: 4, label: 'Card Item 4', flexGrow: 0, flexShrink: 1, alignSelf: 'auto', gridColumnSpan: 1, gridRowSpan: 1, colorPreset: COLOR_PRESETS[3] },
      ]);
    } else if (preset === 'centered') {
      setLayoutMode('flex');
      setFlexDirection('column');
      setJustifyContent('center');
      setAlignItems('center');
      setGap(10);
      setItems([
        { id: 1, label: '🎯 Centered Content Block', flexGrow: 0, flexShrink: 1, alignSelf: 'auto', gridColumnSpan: 1, gridRowSpan: 1, colorPreset: COLOR_PRESETS[4] }
      ]);
    } else if (preset === 'split') {
      setLayoutMode('flex');
      setFlexDirection('row');
      setJustifyContent('stretch');
      setAlignItems('stretch');
      setGap(16);
      setItems([
        { id: 1, label: 'Sidebar (Nav)', flexGrow: 1, flexShrink: 1, alignSelf: 'auto', gridColumnSpan: 1, gridRowSpan: 1, colorPreset: COLOR_PRESETS[5] },
        { id: 2, label: 'Main Content Board Area', flexGrow: 3, flexShrink: 1, alignSelf: 'auto', gridColumnSpan: 1, gridRowSpan: 1, colorPreset: COLOR_PRESETS[0] }
      ]);
    }
    setSelectedItemId(1);
  };

  const handleAddItem = () => {
    const nextId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    const newItm: GridChildItem = {
      id: nextId,
      label: `Item ${nextId}`,
      flexGrow: 0,
      flexShrink: 1,
      alignSelf: 'auto',
      gridColumnSpan: 1,
      gridRowSpan: 1,
      colorPreset: COLOR_PRESETS[nextId % COLOR_PRESETS.length]
    };
    setItems(prev => [...prev, newItm]);
    setSelectedItemId(nextId);
  };

  const handleRemoveItem = () => {
    if (items.length === 0) return;
    setItems(prev => prev.slice(0, -1));
    setSelectedItemId(items.length > 1 ? items[items.length - 2].id : null);
  };

  const updateItemField = (field: keyof GridChildItem, value: any) => {
    if (selectedItemId === null) return;
    setItems(prev => prev.map(item => item.id === selectedItemId ? { ...item, [field]: value } : item));
  };

  const getContainerStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: layoutMode,
      gap: `${gap}px`,
      padding: `${padding}px`,
      minHeight: '260px',
      borderRadius: '16px',
      transition: 'all 0.2s ease',
    };

    if (layoutMode === 'flex') {
      return {
        ...base,
        flexDirection,
        flexWrap,
        justifyContent,
        alignItems,
      };
    } else {
      return {
        ...base,
        gridTemplateColumns: gridColumns,
        gridAutoFlow,
      };
    }
  };

  const generateCSSCode = (): string => {
    let css = `.container {\n  display: ${layoutMode};\n  gap: ${gap}px;\n  padding: ${padding}px;\n`;
    if (layoutMode === 'flex') {
      css += `  flex-direction: ${flexDirection};\n  flex-wrap: ${flexWrap};\n  justify-content: ${justifyContent};\n  align-items: ${alignItems};\n`;
    } else {
      css += `  grid-template-columns: ${gridColumns};\n  grid-auto-flow: ${gridAutoFlow};\n`;
    }
    css += `}\n\n`;

    items.forEach(item => {
      let itemCss = '';
      if (layoutMode === 'flex') {
        if (item.flexGrow !== 0 || item.flexShrink !== 1) {
          itemCss += `  flex-grow: ${item.flexGrow};\n  flex-shrink: ${item.flexShrink};\n`;
        }
        if (item.alignSelf !== 'auto') {
          itemCss += `  align-self: ${item.alignSelf};\n`;
        }
      } else {
        if (item.gridColumnSpan > 1) {
          itemCss += `  grid-column: span ${item.gridColumnSpan};\n`;
        }
        if (item.gridRowSpan > 1) {
          itemCss += `  grid-row: span ${item.gridRowSpan};\n`;
        }
      }
      if (itemCss) {
        css += `.item-${item.id} {\n${itemCss}}\n\n`;
      }
    });

    return css.trim();
  };

  const handleCopyCSS = () => {
    navigator.clipboard.writeText(generateCSSCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const selectedItem = items.find(i => i.id === selectedItemId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Render playground area */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="text-[#3C6B4D] font-bold">Layout Rendering Board</h3>
            <div className="flex gap-2">
              <button
                onClick={handleAddItem}
                className="py-1 px-3 bg-[#3C6B4D]/15 text-[#3C6B4D] border border-[#3C6B4D]/25 rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-[#3C6B4D]/30"
              >
                <Plus size={11} /> Add Item
              </button>
              <button
                onClick={handleRemoveItem}
                disabled={items.length === 0}
                className="py-1 px-3 bg-rose-950/20 text-rose-400 border border-rose-900/30 rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-rose-950/40 disabled:opacity-40"
              >
                <Minus size={11} /> Remove Item
              </button>
            </div>
          </div>

          {/* Core Interactive Layout Wrapper */}
          <div className="bg-slate-950/80 border border-slate-850 rounded-2xl p-2 relative overflow-hidden">
            <div style={getContainerStyles()} className="bg-slate-900/40">
              {items.map(item => {
                const itemStyles: React.CSSProperties = {};
                if (layoutMode === 'flex') {
                  itemStyles.flexGrow = item.flexGrow;
                  itemStyles.flexShrink = item.flexShrink;
                  itemStyles.alignSelf = item.alignSelf;
                } else {
                  itemStyles.gridColumn = `span ${item.gridColumnSpan}`;
                  itemStyles.gridRow = `span ${item.gridRowSpan}`;
                }

                return (
                  <div
                    key={item.id}
                    style={itemStyles}
                    onClick={() => setSelectedItemId(item.id)}
                    className={`border p-4 rounded-xl cursor-pointer flex flex-col justify-center items-center font-bold text-xs transition-all ${item.colorPreset} ${
                      selectedItemId === item.id 
                        ? 'ring-2 ring-[#3C6B4D] border-transparent scale-[1.02]' 
                        : 'hover:scale-[1.01]'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-[8px] text-slate-500 font-normal font-mono mt-1">
                      {layoutMode === 'flex' ? `grow:${item.flexGrow}` : `span:${item.gridColumnSpan}x${item.gridRowSpan}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dynamic CSS Generator */}
        <div className="glass-card p-6 flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-slate-850 pb-2">
            <span className="text-xs text-slate-400 font-bold uppercase">Compiled CSS Styles</span>
            <button
              onClick={handleCopyCSS}
              className="py-1 px-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copied ? 'Copied CSS!' : 'Copy Code'}</span>
            </button>
          </div>
          <pre className="bg-slate-950 p-4 border border-slate-850 rounded-xl text-xs font-mono text-slate-350 max-h-[220px] overflow-y-auto leading-relaxed">
            {generateCSSCode()}
          </pre>
        </div>
      </div>

      {/* Control settings panels */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        {/* Layout Presets */}
        <div className="glass-card p-6 flex flex-col gap-3">
          <span className="text-xs text-slate-400 font-bold uppercase border-b border-slate-800 pb-2 flex items-center gap-1.5"><Layout size={13} className="text-[#3C6B4D]" /> Layout Presets</span>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => applyPreset('navbar')} className="py-2 px-3 bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-850 hover:border-slate-800 rounded-lg text-[10px] font-bold transition-all">Header Navbar</button>
            <button onClick={() => applyPreset('cards')} className="py-2 px-3 bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-850 hover:border-slate-800 rounded-lg text-[10px] font-bold transition-all">Card Grids</button>
            <button onClick={() => applyPreset('centered')} className="py-2 px-3 bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-850 hover:border-slate-800 rounded-lg text-[10px] font-bold transition-all">Center Block</button>
            <button onClick={() => applyPreset('split')} className="py-2 px-3 bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-850 hover:border-slate-800 rounded-lg text-[10px] font-bold transition-all">Split Sidebar</button>
          </div>
        </div>

        {/* Layout Parameters Selector */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-xs text-slate-400 font-bold uppercase">Container Parameters</span>
            <div className="flex bg-slate-950 border border-slate-850 rounded-lg p-0.5">
              {(['flex', 'grid'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setLayoutMode(mode)}
                  className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
                    layoutMode === mode 
                      ? 'bg-[#3C6B4D] text-white' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic properties configuration */}
          <div className="flex flex-col gap-3.5">
            <div className="flex justify-between items-center text-[10px] text-slate-500">
              <span>Gap Size</span>
              <span className="font-mono text-[#3C6B4D] font-bold">{gap}px</span>
            </div>
            <input type="range" min="0" max="40" value={gap} onChange={(e) => setGap(Number(e.target.value))} className="w-full accent-[#3C6B4D]" />

            <div className="flex justify-between items-center text-[10px] text-slate-500">
              <span>Padding Size</span>
              <span className="font-mono text-[#3C6B4D] font-bold">{padding}px</span>
            </div>
            <input type="range" min="0" max="40" value={padding} onChange={(e) => setPadding(Number(e.target.value))} className="w-full accent-[#3C6B4D]" />

            {/* Flexbox Specific parameters */}
            {layoutMode === 'flex' && (
              <>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Flex Direction</span>
                  <select value={flexDirection} onChange={(e) => setFlexDirection(e.target.value as any)} className="bg-slate-950 border border-slate-850 text-slate-350 p-2 text-xs rounded-xl focus:outline-none">
                    <option value="row">row</option>
                    <option value="row-reverse">row-reverse</option>
                    <option value="column">column</option>
                    <option value="column-reverse">column-reverse</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Flex Wrap</span>
                  <select value={flexWrap} onChange={(e) => setFlexWrap(e.target.value as any)} className="bg-slate-950 border border-slate-850 text-slate-350 p-2 text-xs rounded-xl focus:outline-none">
                    <option value="nowrap">nowrap</option>
                    <option value="wrap">wrap</option>
                    <option value="wrap-reverse">wrap-reverse</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Justify Content</span>
                  <select value={justifyContent} onChange={(e) => setJustifyContent(e.target.value)} className="bg-slate-950 border border-slate-850 text-slate-350 p-2 text-xs rounded-xl focus:outline-none">
                    <option value="flex-start">flex-start</option>
                    <option value="flex-end">flex-end</option>
                    <option value="center">center</option>
                    <option value="space-between">space-between</option>
                    <option value="space-around">space-around</option>
                    <option value="space-evenly">space-evenly</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Align Items</span>
                  <select value={alignItems} onChange={(e) => setAlignItems(e.target.value)} className="bg-slate-950 border border-slate-850 text-slate-350 p-2 text-xs rounded-xl focus:outline-none">
                    <option value="stretch">stretch</option>
                    <option value="flex-start">flex-start</option>
                    <option value="flex-end">flex-end</option>
                    <option value="center">center</option>
                    <option value="baseline">baseline</option>
                  </select>
                </div>
              </>
            )}

            {/* Grid specific parameters */}
            {layoutMode === 'grid' && (
              <>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Grid Template Columns</span>
                  <input
                    type="text"
                    value={gridColumns}
                    onChange={(e) => setGridColumns(e.target.value)}
                    className="bg-slate-950 border border-slate-850 text-slate-300 font-mono p-2 text-xs rounded-xl focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Grid Auto Flow</span>
                  <select value={gridAutoFlow} onChange={(e) => setGridAutoFlow(e.target.value as any)} className="bg-slate-950 border border-slate-850 text-slate-350 p-2 text-xs rounded-xl focus:outline-none">
                    <option value="row">row</option>
                    <option value="column">column</option>
                    <option value="dense">dense</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Selected Child Item Configurator */}
        {selectedItem && (
          <div className="glass-card p-6 flex flex-col gap-4 border border-[#3C6B4D]/30 bg-[#3C6B4D]/5">
            <span className="text-xs font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5"><Palette size={13} className="text-[#3C6B4D]" /> Customize: {selectedItem.label}</span>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] text-slate-500 font-bold uppercase">Item Text Label</label>
              <input
                type="text"
                value={selectedItem.label}
                onChange={(e) => updateItemField('label', e.target.value)}
                className="bg-slate-950 border border-slate-850 text-slate-200 p-2 text-xs rounded-xl focus:outline-none"
              />
            </div>

            {layoutMode === 'flex' ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-slate-500 font-bold uppercase">Flex Grow ({selectedItem.flexGrow})</label>
                    <input type="range" min="0" max="6" value={selectedItem.flexGrow} onChange={(e) => updateItemField('flexGrow', Number(e.target.value))} className="w-full accent-[#3C6B4D]" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-slate-500 font-bold uppercase">Flex Shrink ({selectedItem.flexShrink})</label>
                    <input type="range" min="0" max="6" value={selectedItem.flexShrink} onChange={(e) => updateItemField('flexShrink', Number(e.target.value))} className="w-full accent-[#3C6B4D]" />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Align Self Override</span>
                  <select value={selectedItem.alignSelf} onChange={(e) => updateItemField('alignSelf', e.target.value)} className="bg-slate-950 border border-slate-850 text-slate-350 p-2 text-xs rounded-xl focus:outline-none">
                    <option value="auto">auto</option>
                    <option value="stretch">stretch</option>
                    <option value="flex-start">flex-start</option>
                    <option value="flex-end">flex-end</option>
                    <option value="center">center</option>
                    <option value="baseline">baseline</option>
                  </select>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-slate-500 font-bold uppercase">Col Span ({selectedItem.gridColumnSpan})</label>
                  <input type="range" min="1" max="4" value={selectedItem.gridColumnSpan} onChange={(e) => updateItemField('gridColumnSpan', Number(e.target.value))} className="w-full accent-[#3C6B4D]" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-slate-500 font-bold uppercase">Row Span ({selectedItem.gridRowSpan})</label>
                  <input type="range" min="1" max="4" value={selectedItem.gridRowSpan} onChange={(e) => updateItemField('gridRowSpan', Number(e.target.value))} className="w-full accent-[#3C6B4D]" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
