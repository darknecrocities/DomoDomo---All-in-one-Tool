import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Upload,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  ShieldCheck,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import type { TextItem, DrawStroke, ViewportDim } from './pdf-text-editor/types';
import {
  loadPdfJs,
  renderPageToCanvas,
  extractPageTextItems,
} from './pdf-text-editor/pdfRenderer';
import {
  applySearchReplace,
  createCustomTextItem,
  drawStrokesOnCanvas,
} from './pdf-text-editor/editorActions';
import { CanvasStage } from './pdf-text-editor/CanvasStage';
import { TextInspectorPanel } from './pdf-text-editor/TextInspectorPanel';
import { exportEditedPDF } from './pdf-text-editor/pdfExport';

export const PDFTextEditTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfjsDoc, setPdfjsDoc] = useState<any>(null);
  const [viewportSize, setViewportSize] = useState<ViewportDim>({ width: 600, height: 800 });
  const [scale, setScale] = useState(1.2);
  const [currentViewport, setCurrentViewport] = useState<any>(null);

  // Text & Brush states
  const [allTextItems, setAllTextItems] = useState<{ [pageIndex: number]: TextItem[] }>({});
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [highlightAll, setHighlightAll] = useState(true);

  // Search & Replace
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');

  // Custom text configuration
  const [customText, setCustomText] = useState('New Text Block');
  const [customFontSize, setCustomFontSize] = useState(14);
  const [customFontFamily, setCustomFontFamily] = useState<'Helvetica' | 'Times-Roman' | 'Courier'>('Helvetica');
  const [customFontStyle, setCustomFontStyle] = useState<'regular' | 'bold' | 'italic' | 'bold-italic'>('regular');
  const [customTextAlign, setCustomTextAlign] = useState<'left' | 'center' | 'right' | 'justify'>('left');
  const [customRotation, setCustomRotation] = useState<number>(0);

  // Brush drawing states
  const [drawMode, setDrawMode] = useState(false);
  const [brushColor, setBrushColor] = useState('#D4AF37');
  const [brushSize, setBrushSize] = useState(4);
  const [allStrokes, setAllStrokes] = useState<{ [pageIndex: number]: DrawStroke[] }>({});
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const activeRenderTaskRef = useRef<any>(null);

  const handleSelectFile = (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.pdf') && selectedFile.type !== 'application/pdf') {
      alert('Please select a valid PDF document.');
      return;
    }
    setFile(selectedFile);
    setAllTextItems({});
    setAllStrokes({});
    setCurrentPage(1);
    setTotalPages(0);
    setPdfjsDoc(null);
    setActiveItemId(null);
  };

  // Load PDFjs document
  useEffect(() => {
    if (!file) return;
    let isCancelled = false;

    const loadPDF = async () => {
      setLoading(true);
      try {
        const pdfjsLib = await loadPdfJs();
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        if (!isCancelled) {
          setPdfjsDoc(pdf);
          setTotalPages(pdf.numPages);
        }
      } catch (err) {
        console.error('Failed loading PDF document:', err);
        alert('Could not parse PDF. Ensure the file is not password-protected.');
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    loadPDF();
    return () => {
      isCancelled = true;
    };
  }, [file]);

  // Render Page onto Canvas safely
  const renderCurrentPage = useCallback(async () => {
    if (!pdfjsDoc || !canvasRef.current) return;
    try {
      const vp = await renderPageToCanvas({
        pdfjsDoc,
        pageNumber: currentPage,
        scale,
        canvas: canvasRef.current,
        activeRenderTaskRef,
        onViewportReady: (viewport) => {
          setViewportSize({ width: viewport.width, height: viewport.height });
          setCurrentViewport(viewport);
        },
      });
      if (vp && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) drawStrokesOnCanvas(ctx, allStrokes[currentPage - 1] || [], vp, scale);
      }
    } catch (err) {
      console.error('Error during page render:', err);
    }
  }, [pdfjsDoc, currentPage, scale, allStrokes]);

  useEffect(() => {
    renderCurrentPage();
  }, [renderCurrentPage]);

  // Extract page text items once document/page changes
  useEffect(() => {
    if (!pdfjsDoc) return;
    const pageIndex = currentPage - 1;
    if (allTextItems[pageIndex]) return;

    extractPageTextItems(pdfjsDoc, currentPage)
      .then((items) => {
        setAllTextItems((prev) => ({ ...prev, [pageIndex]: items }));
      })
      .catch((err) => console.error('Error extracting text items:', err));
  }, [pdfjsDoc, currentPage, allTextItems]);

  const handleTextChange = (id: string, newText: string) => {
    const pageIndex = currentPage - 1;
    setAllTextItems((prev) => ({
      ...prev,
      [pageIndex]: (prev[pageIndex] || []).map((item) =>
        item.id === id ? { ...item, text: newText } : item
      ),
    }));
  };

  const handleDeleteItem = (id: string) => {
    const pageIndex = currentPage - 1;
    setAllTextItems((prev) => ({
      ...prev,
      [pageIndex]: (prev[pageIndex] || []).filter((item) => item.id !== id),
    }));
    if (activeItemId === id) setActiveItemId(null);
  };

  const handleUpdateActiveItem = (updates: Partial<TextItem>) => {
    if (!activeItemId) return;
    const pageIndex = currentPage - 1;
    setAllTextItems((prev) => ({
      ...prev,
      [pageIndex]: (prev[pageIndex] || []).map((item) =>
        item.id === activeItemId ? { ...item, ...updates } : item
      ),
    }));
  };

  const handleSearchReplace = (replaceAll: boolean) => {
    const pageIndex = currentPage - 1;
    const items = allTextItems[pageIndex] || [];
    const updated = applySearchReplace(items, searchQuery, replaceQuery, replaceAll);
    setAllTextItems((prev) => ({ ...prev, [pageIndex]: updated }));
  };

  const handleAddCustomTextBlock = () => {
    if (!currentViewport) return;
    const pageIndex = currentPage - 1;
    const [pdfX, pdfY] = currentViewport.convertToPdfPoint(60, 100);
    const newItem = createCustomTextItem(
      pageIndex,
      pdfX,
      pdfY,
      customText,
      customFontSize,
      customFontFamily,
      customFontStyle,
      customRotation,
      customTextAlign
    );
    setAllTextItems((prev) => ({
      ...prev,
      [pageIndex]: [...(prev[pageIndex] || []), newItem],
    }));
    setActiveItemId(newItem.id);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!drawMode || !currentViewport) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const [pdfX, pdfY] = currentViewport.convertToPdfPoint(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
    setCurrentPoints([{ x: pdfX, y: pdfY }]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!drawMode || !isDrawing || !currentViewport) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const [pdfX, pdfY] = currentViewport.convertToPdfPoint(e.clientX - rect.left, e.clientY - rect.top);
    setCurrentPoints((prev) => [...prev, { x: pdfX, y: pdfY }]);
  };

  const handleMouseUp = () => {
    if (!drawMode || !isDrawing) return;
    setIsDrawing(false);
    if (currentPoints.length > 1) {
      const pageIndex = currentPage - 1;
      const stroke: DrawStroke = { points: currentPoints, color: brushColor, size: brushSize };
      setAllStrokes((prev) => ({ ...prev, [pageIndex]: [...(prev[pageIndex] || []), stroke] }));
    }
    setCurrentPoints([]);
  };

  const handleExport = async () => {
    if (!file) return;
    setSaving(true);
    try {
      await exportEditedPDF({ file, allTextItems, allStrokes });
    } catch (err) {
      console.error('Export failed:', err);
      alert('Error building modified PDF.');
    } finally {
      setSaving(false);
    }
  };

  const currentPageItems = allTextItems[currentPage - 1] || [];
  const activeItem = currentPageItems.find((i) => i.id === activeItemId) || null;

  return (
    <div className="flex flex-col gap-6 text-left max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2A2D30] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#A3A09B] uppercase tracking-wider mb-1">
            <span>PDF Suite</span>
            <span>/</span>
            <span className="text-white">Offline Editor</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="text-[#D4AF37]" size={24} />
            <span>PDF Text Editor & Annotator</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Edit text, search & replace, add custom typography, and draw annotations 100% locally.
          </p>
        </div>

        {file && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 bg-[#18191B] border border-[#2A2D30] hover:bg-[#2A2D30] text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <RefreshCw size={13} />
              <span>Change PDF</span>
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={saving}
              className="px-4 py-2 bg-white text-black hover:bg-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              <span>{saving ? 'Exporting...' : 'Download Edited PDF'}</span>
            </button>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,application/pdf"
        onChange={(e) => {
          if (e.target.files?.[0]) handleSelectFile(e.target.files[0]);
          e.target.value = '';
        }}
        className="hidden"
      />

      {/* Upload Drop Zone */}
      {!file ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files?.[0]) handleSelectFile(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-16 text-center flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${
            isDragging ? 'border-white bg-[#18191B]' : 'border-[#2A2D30] bg-[#111213] hover:border-[#72706C]'
          }`}
        >
          <div className="p-5 bg-[#18191B] rounded-2xl border border-[#2A2D30] text-white shadow-xl">
            <Upload size={36} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-base font-bold text-white">Click or drag & drop PDF here</span>
            <span className="text-xs text-slate-400">Processes completely on your device with zero cloud uploads</span>
          </div>
          <span className="py-2 px-4 bg-white text-black text-xs font-bold rounded-xl mt-2">
            Choose PDF Document
          </span>
        </div>
      ) : (
        /* Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 flex flex-col gap-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-24 bg-[#111213] border border-[#2A2D30] rounded-3xl gap-3">
                <Loader2 size={32} className="text-[#D4AF37] animate-spin" />
                <span className="text-sm font-semibold text-white">Parsing and rendering PDF pages...</span>
              </div>
            ) : (
              <CanvasStage
                canvasRef={canvasRef}
                viewportSize={viewportSize}
                scale={scale}
                setScale={setScale}
                currentPageItems={currentPageItems}
                activeItemId={activeItemId}
                setActiveItemId={setActiveItemId}
                drawMode={drawMode}
                brushColor={brushColor}
                brushSize={brushSize}
                currentViewport={currentViewport}
                handleTextChange={handleTextChange}
                handleDeleteItem={handleDeleteItem}
                onCanvasClick={() => setActiveItemId(null)}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                highlightAll={highlightAll}
              />
            )}

            {totalPages > 0 && (
              <div className="flex items-center justify-between bg-[#111213] border border-[#2A2D30] px-4 py-2.5 rounded-2xl text-xs">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage <= 1}
                  className="py-1.5 px-3 bg-[#18191B] border border-[#2A2D30] hover:bg-[#2A2D30] text-white rounded-xl font-semibold flex items-center gap-1 disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                  <span>Prev Page</span>
                </button>
                <span className="text-slate-300 font-mono">
                  Page <strong className="text-white font-bold">{currentPage}</strong> of{' '}
                  <strong className="text-white font-bold">{totalPages}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage >= totalPages}
                  className="py-1.5 px-3 bg-[#18191B] border border-[#2A2D30] hover:bg-[#2A2D30] text-white rounded-xl font-semibold flex items-center gap-1 disabled:opacity-40"
                >
                  <span>Next Page</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 flex flex-col gap-4">
            <TextInspectorPanel
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              replaceQuery={replaceQuery}
              setReplaceQuery={setReplaceQuery}
              handleSearchReplace={handleSearchReplace}
              customText={customText}
              setCustomText={setCustomText}
              customFontSize={customFontSize}
              setCustomFontSize={setCustomFontSize}
              customFontFamily={customFontFamily}
              setCustomFontFamily={setCustomFontFamily}
              customFontStyle={customFontStyle}
              setCustomFontStyle={setCustomFontStyle}
              customTextAlign={customTextAlign}
              setCustomTextAlign={setCustomTextAlign}
              customRotation={customRotation}
              setCustomRotation={setCustomRotation}
              handleAddCustomTextBlock={handleAddCustomTextBlock}
              drawMode={drawMode}
              setDrawMode={setDrawMode}
              brushColor={brushColor}
              setBrushColor={setBrushColor}
              brushSize={brushSize}
              setBrushSize={setBrushSize}
              handleClearStrokes={() => {
                const pageIndex = currentPage - 1;
                setAllStrokes((prev) => ({ ...prev, [pageIndex]: [] }));
                renderCurrentPage();
              }}
              highlightAll={highlightAll}
              setHighlightAll={setHighlightAll}
              activeItem={activeItem}
              onUpdateActiveItem={handleUpdateActiveItem}
            />
            <div className="flex items-center gap-2 p-3 bg-[#18191B] border border-[#2A2D30] rounded-xl text-[11px] text-[#A3A09B]">
              <ShieldCheck size={16} className="text-[#D4AF37] shrink-0" />
              <span>100% Client-side sandbox. Your PDF content never leaves your browser memory.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
