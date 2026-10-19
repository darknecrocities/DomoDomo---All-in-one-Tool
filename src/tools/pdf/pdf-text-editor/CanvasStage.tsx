import React, { useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Trash2, GripVertical } from 'lucide-react';
import type { TextItem, ViewportDim } from './types';

interface CanvasStageProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  viewportSize: ViewportDim;
  scale: number;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  currentPageItems: TextItem[];
  activeItemId: string | null;
  setActiveItemId: (id: string | null) => void;
  drawMode: boolean;
  brushColor: string;
  brushSize: number;
  currentViewport: any;
  handleTextChange: (id: string, text: string) => void;
  handleDeleteItem: (id: string) => void;
  onCanvasClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseUp: () => void;
  highlightAll: boolean;
}

export const CanvasStage: React.FC<CanvasStageProps> = ({
  canvasRef,
  viewportSize,
  scale,
  setScale,
  currentPageItems,
  activeItemId,
  setActiveItemId,
  drawMode,
  currentViewport,
  handleTextChange,
  handleDeleteItem,
  onCanvasClick,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  highlightAll,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.15, 2.5));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.15, 0.5));
  const resetZoom = () => setScale(1.2);

  const renderOverlayInputs = () => {
    if (!currentViewport || currentPageItems.length === 0) return null;

    return currentPageItems.map((item) => {
      const [vx, vy] = currentViewport.convertToViewportPoint(item.x, item.y);
      const isActive = activeItemId === item.id;
      const displayWidth = Math.max(item.width * scale, 60);
      const displayHeight = Math.max((item.height || item.fontSize || 12) * scale, 20);
      const topOffset = vy - displayHeight;

      const fontClass =
        item.fontFamily === 'Times-Roman'
          ? 'font-serif'
          : item.fontFamily === 'Courier'
          ? 'font-mono'
          : 'font-sans';

      const fontWeight =
        item.fontStyle === 'bold' || item.fontStyle === 'bold-italic'
          ? 'font-bold'
          : 'font-normal';
      const fontItalic =
        item.fontStyle === 'italic' || item.fontStyle === 'bold-italic' ? 'italic' : '';

      return (
        <div
          key={item.id}
          className={`absolute transition-all group ${
            isActive
              ? 'z-40 ring-2 ring-amber-400 bg-white shadow-xl rounded'
              : highlightAll
              ? 'hover:ring-1 hover:ring-amber-300/80 bg-white/40 hover:bg-white/90 z-20'
              : 'z-10 hover:bg-white/60'
          }`}
          style={{
            left: `${vx}px`,
            top: `${topOffset}px`,
            width: `${displayWidth}px`,
            transform: `rotate(${-(item.rotation || 0)}deg)`,
            transformOrigin: 'top left',
          }}
          onClick={(e) => {
            e.stopPropagation();
            setActiveItemId(item.id);
          }}
        >
          {isActive ? (
            <div className="relative flex flex-col p-0.5 bg-white rounded shadow border border-slate-300">
              <div className="flex items-center justify-between bg-slate-100 px-1 py-0.5 border-b border-slate-200 text-[10px] text-slate-600">
                <span className="flex items-center gap-1 font-mono">
                  <GripVertical size={10} />
                  {Math.round(item.fontSize)}pt
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteItem(item.id);
                  }}
                  className="text-red-500 hover:text-red-700 p-0.5"
                  title="Remove text"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <textarea
                value={item.text}
                onChange={(e) => handleTextChange(item.id, e.target.value)}
                rows={Math.max((item.text || '').split('\n').length, 1)}
                className={`w-full bg-white text-black p-1 text-xs border-0 outline-none resize-none leading-tight ${fontClass} ${fontWeight} ${fontItalic}`}
                style={{
                  fontSize: `${item.fontSize * scale * 0.9}px`,
                  textAlign: item.textAlign || 'left',
                }}
                autoFocus
              />
            </div>
          ) : (
            <div
              className={`px-1 py-0.5 cursor-pointer truncate ${fontClass} ${fontWeight} ${fontItalic}`}
              style={{
                fontSize: `${item.fontSize * scale * 0.9}px`,
                color: item.text !== item.originalText ? '#000000' : 'transparent',
                textAlign: item.textAlign || 'left',
              }}
              title={item.text}
            >
              {item.text || ' '}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col gap-3 flex-1 w-full">
      {/* Zoom and Controls Header Bar */}
      <div className="flex items-center justify-between bg-[#111213] border border-[#2A2D30] rounded-xl px-4 py-2 text-xs">
        <span className="text-[#A3A09B] font-medium flex items-center gap-2">
          <span>Viewport Zoom</span>
          <span className="text-white font-mono bg-[#18191B] px-2 py-0.5 rounded border border-[#2A2D30]">
            {Math.round(scale * 100)}%
          </span>
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={zoomOut}
            className="p-1.5 bg-[#18191B] border border-[#2A2D30] rounded-lg hover:bg-[#2A2D30] text-slate-300 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={15} />
          </button>
          <button
            type="button"
            onClick={resetZoom}
            className="p-1.5 bg-[#18191B] border border-[#2A2D30] rounded-lg hover:bg-[#2A2D30] text-slate-300 transition-colors"
            title="Reset Zoom"
          >
            <RotateCcw size={15} />
          </button>
          <button
            type="button"
            onClick={zoomIn}
            className="p-1.5 bg-[#18191B] border border-[#2A2D30] rounded-lg hover:bg-[#2A2D30] text-slate-300 transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={15} />
          </button>
        </div>
      </div>

      {/* PDF Viewport Scrollable Area */}
      <div className="flex-1 flex justify-center bg-[#0D0D0D] rounded-2xl border border-[#2A2D30] p-6 overflow-auto max-h-[640px] min-h-[420px] relative">
        <div
          ref={containerRef}
          onClick={onCanvasClick}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          className="relative shadow-2xl border border-slate-700 bg-white transition-transform"
          style={{
            width: viewportSize.width || 600,
            height: viewportSize.height || 800,
            cursor: drawMode ? 'crosshair' : 'default',
          }}
        >
          <canvas ref={canvasRef} className="block w-full h-full" />
          {renderOverlayInputs()}
        </div>
      </div>
    </div>
  );
};
