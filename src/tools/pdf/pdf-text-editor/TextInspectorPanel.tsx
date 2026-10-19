import React from 'react';
import {
  Search,
  Replace,
  Plus,
  Paintbrush,
  Eraser,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  RotateCw,
  Eye,
} from 'lucide-react';
import type { TextItem } from './types';

interface TextInspectorPanelProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  replaceQuery: string;
  setReplaceQuery: (q: string) => void;
  handleSearchReplace: (replaceAll: boolean) => void;
  customText: string;
  setCustomText: (t: string) => void;
  customFontSize: number;
  setCustomFontSize: (s: number) => void;
  customFontFamily: 'Helvetica' | 'Times-Roman' | 'Courier';
  setCustomFontFamily: (f: 'Helvetica' | 'Times-Roman' | 'Courier') => void;
  customFontStyle: 'regular' | 'bold' | 'italic' | 'bold-italic';
  setCustomFontStyle: (s: 'regular' | 'bold' | 'italic' | 'bold-italic') => void;
  customTextAlign: 'left' | 'center' | 'right' | 'justify';
  setCustomTextAlign: (a: 'left' | 'center' | 'right' | 'justify') => void;
  customRotation: number;
  setCustomRotation: (r: number) => void;
  handleAddCustomTextBlock: () => void;
  drawMode: boolean;
  setDrawMode: (d: boolean) => void;
  brushColor: string;
  setBrushColor: (c: string) => void;
  brushSize: number;
  setBrushSize: (s: number) => void;
  handleClearStrokes: () => void;
  highlightAll: boolean;
  setHighlightAll: (h: boolean) => void;
  activeItem: TextItem | null;
  onUpdateActiveItem: (updates: Partial<TextItem>) => void;
}

export const TextInspectorPanel: React.FC<TextInspectorPanelProps> = ({
  searchQuery,
  setSearchQuery,
  replaceQuery,
  setReplaceQuery,
  handleSearchReplace,
  customText,
  setCustomText,
  customFontSize,
  setCustomFontSize,
  customFontFamily,
  setCustomFontFamily,
  customFontStyle,
  setCustomFontStyle,
  customTextAlign,
  setCustomTextAlign,
  customRotation,
  setCustomRotation,
  handleAddCustomTextBlock,
  drawMode,
  setDrawMode,
  brushColor,
  setBrushColor,
  brushSize,
  setBrushSize,
  handleClearStrokes,
  highlightAll,
  setHighlightAll,
  activeItem,
  onUpdateActiveItem,
}) => {
  return (
    <div className="flex flex-col gap-5 text-left text-xs text-[#A3A09B]">
      {/* 1. Global Search & Replace */}
      <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-4 flex flex-col gap-3">
        <span className="font-bold text-[#ECEBE9] uppercase tracking-wider text-[11px] flex items-center gap-2">
          <Search size={14} className="text-[#D4AF37]" />
          <span>Find & Replace in Document</span>
        </span>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Search text pattern..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
          />
          <input
            type="text"
            placeholder="Replace with..."
            value={replaceQuery}
            onChange={(e) => setReplaceQuery(e.target.value)}
            className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
          />
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              type="button"
              onClick={() => handleSearchReplace(false)}
              disabled={!searchQuery.trim()}
              className="py-2 px-3 bg-[#111213] border border-[#2A2D30] hover:bg-[#2A2D30] text-white rounded-xl font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              <Replace size={13} />
              <span>Replace Next</span>
            </button>
            <button
              type="button"
              onClick={() => handleSearchReplace(true)}
              disabled={!searchQuery.trim()}
              className="py-2 px-3 bg-white text-black hover:bg-slate-200 rounded-xl font-bold flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              <Replace size={13} />
              <span>Replace All</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Custom Text / Active Item Typography Controls */}
      <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-[#2A2D30] pb-2">
          <span className="font-bold text-[#ECEBE9] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Plus size={14} className="text-[#D4AF37]" />
            <span>{activeItem ? 'Edit Selected Text Block' : 'Add New Text Block'}</span>
          </span>
          {activeItem && (
            <span className="text-[10px] text-amber-400 font-mono">Active Item</span>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          <textarea
            rows={2}
            value={activeItem ? activeItem.text : customText}
            onChange={(e) => {
              if (activeItem) {
                onUpdateActiveItem({ text: e.target.value });
              } else {
                setCustomText(e.target.value);
              }
            }}
            placeholder="Type your text content here..."
            className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37] resize-none"
          />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] uppercase text-slate-400 mb-1">Font Family</label>
              <select
                value={activeItem ? activeItem.fontFamily : customFontFamily}
                onChange={(e) => {
                  const val = e.target.value as 'Helvetica' | 'Times-Roman' | 'Courier';
                  if (activeItem) onUpdateActiveItem({ fontFamily: val });
                  else setCustomFontFamily(val);
                }}
                className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
              >
                <option value="Helvetica">Helvetica (Sans)</option>
                <option value="Times-Roman">Times New Roman (Serif)</option>
                <option value="Courier">Courier (Mono)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase text-slate-400 mb-1">
                Size ({activeItem ? activeItem.fontSize : customFontSize}pt)
              </label>
              <input
                type="range"
                min={8}
                max={48}
                value={activeItem ? activeItem.fontSize : customFontSize}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (activeItem) onUpdateActiveItem({ fontSize: val });
                  else setCustomFontSize(val);
                }}
                className="w-full accent-white mt-1.5"
              />
            </div>
          </div>

          {/* Style & Alignment Row */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1 bg-[#111213] p-1 border border-[#2A2D30] rounded-xl">
              <button
                type="button"
                onClick={() => {
                  const isBold = (activeItem?.fontStyle || customFontStyle).includes('bold');
                  const isItalic = (activeItem?.fontStyle || customFontStyle).includes('italic');
                  let next: 'regular' | 'bold' | 'italic' | 'bold-italic' = isBold
                    ? isItalic
                      ? 'italic'
                      : 'regular'
                    : isItalic
                    ? 'bold-italic'
                    : 'bold';
                  if (activeItem) onUpdateActiveItem({ fontStyle: next });
                  else setCustomFontStyle(next);
                }}
                className={`p-1.5 rounded-lg ${
                  (activeItem?.fontStyle || customFontStyle).includes('bold')
                    ? 'bg-white text-black'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Bold"
              >
                <Bold size={13} />
              </button>
              <button
                type="button"
                onClick={() => {
                  const isBold = (activeItem?.fontStyle || customFontStyle).includes('bold');
                  const isItalic = (activeItem?.fontStyle || customFontStyle).includes('italic');
                  let next: 'regular' | 'bold' | 'italic' | 'bold-italic' = isItalic
                    ? isBold
                      ? 'bold'
                      : 'regular'
                    : isBold
                    ? 'bold-italic'
                    : 'italic';
                  if (activeItem) onUpdateActiveItem({ fontStyle: next });
                  else setCustomFontStyle(next);
                }}
                className={`p-1.5 rounded-lg ${
                  (activeItem?.fontStyle || customFontStyle).includes('italic')
                    ? 'bg-white text-black'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Italic"
              >
                <Italic size={13} />
              </button>
            </div>

            <div className="flex items-center gap-1 bg-[#111213] p-1 border border-[#2A2D30] rounded-xl">
              {(['left', 'center', 'right', 'justify'] as const).map((align) => {
                const Icon =
                  align === 'left'
                    ? AlignLeft
                    : align === 'center'
                    ? AlignCenter
                    : align === 'right'
                    ? AlignRight
                    : AlignJustify;
                const active = (activeItem?.textAlign || customTextAlign) === align;
                return (
                  <button
                    key={align}
                    type="button"
                    onClick={() => {
                      if (activeItem) onUpdateActiveItem({ textAlign: align });
                      else setCustomTextAlign(align);
                    }}
                    className={`p-1.5 rounded-lg ${
                      active ? 'bg-white text-black' : 'text-slate-400 hover:text-white'
                    }`}
                    title={`Align ${align}`}
                  >
                    <Icon size={13} />
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1 bg-[#111213] px-2 py-1 border border-[#2A2D30] rounded-xl">
              <RotateCw size={12} className="text-slate-400" />
              <input
                type="number"
                min={-180}
                max={180}
                value={activeItem ? activeItem.rotation || 0 : customRotation}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (activeItem) onUpdateActiveItem({ rotation: val });
                  else setCustomRotation(val);
                }}
                className="w-10 bg-transparent text-white font-mono text-center outline-none"
              />
              <span className="text-[10px] text-slate-500">°</span>
            </div>
          </div>

          {!activeItem && (
            <button
              type="button"
              onClick={handleAddCustomTextBlock}
              className="mt-1 w-full py-2 bg-white text-black hover:bg-slate-200 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus size={14} />
              <span>Insert Text on Page</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Freehand Annotation Brush */}
      <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#ECEBE9] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Paintbrush size={14} className="text-[#D4AF37]" />
            <span>Freehand Drawing Brush</span>
          </span>
          <button
            type="button"
            onClick={() => setDrawMode(!drawMode)}
            className={`py-1 px-2.5 rounded-lg font-bold text-[10px] transition-colors ${
              drawMode ? 'bg-[#D4AF37] text-black' : 'bg-[#111213] border border-[#2A2D30] text-white'
            }`}
          >
            {drawMode ? 'Drawing Active' : 'Enable Brush'}
          </button>
        </div>

        {drawMode && (
          <div className="flex flex-col gap-3 pt-1 border-t border-[#2A2D30]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Stroke Color:</span>
              <div className="flex items-center gap-1.5">
                {['#D4AF37', '#FFFFFF', '#EF4444', '#3B82F6'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setBrushColor(color)}
                    className={`w-5 h-5 rounded-full border ${
                      brushColor === color ? 'border-white ring-2 ring-amber-400' : 'border-slate-700'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Stroke Size ({brushSize}px):</span>
              <input
                type="range"
                min={1}
                max={16}
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-28 accent-white"
              />
            </div>

            <button
              type="button"
              onClick={handleClearStrokes}
              className="py-1.5 px-3 bg-[#111213] border border-[#2A2D30] hover:bg-red-500/10 hover:border-red-500/30 text-red-400 rounded-xl font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Eraser size={13} />
              <span>Clear Page Strokes</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Display Preferences */}
      <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-3 flex items-center justify-between">
        <span className="text-slate-400 flex items-center gap-2">
          <Eye size={14} className="text-slate-500" />
          <span>Highlight Text Blocks</span>
        </span>
        <input
          type="checkbox"
          checked={highlightAll}
          onChange={(e) => setHighlightAll(e.target.checked)}
          className="rounded accent-white w-4 h-4 cursor-pointer"
        />
      </div>
    </div>
  );
};
