import { useState, useEffect, useRef } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { 
  Upload, Check, ShieldAlert, Sliders, Search, 
  ChevronLeft, ChevronRight, Edit3, Download, Plus, Trash2, HelpCircle
} from 'lucide-react';

// Dynamically load PDF.js script from CDN
const loadPdfJs = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
      resolve(pdfjsLib);
    };
    script.onerror = () => reject(new Error('Failed to load PDF.js engine'));
    document.body.appendChild(script);
  });
};

interface TextItem {
  id: string;
  pageIndex: number;
  text: string;
  originalText: string;
  x: number;
  y: number;
  fontSize: number;
  width: number;
  height: number;
  fontName: string;
  fontFamily: 'Helvetica' | 'Times-Roman' | 'Courier';
  fontStyle?: 'regular' | 'bold' | 'italic' | 'bold-italic';
  isNew?: boolean;
}

export const PDFTextEditTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  
  // Cache for text items across pages
  const [allTextItems, setAllTextItems] = useState<{ [pageIndex: number]: TextItem[] }>({});
  
  const [pdfjsDoc, setPdfjsDoc] = useState<any>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1.2);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [currentViewport, setCurrentViewport] = useState<any>(null);
  const [highlightAll, setHighlightAll] = useState(true);
  
  // Custom text configuration
  const [customText, setCustomText] = useState('New Text Block');
  const [customFontSize, setCustomFontSize] = useState(12);
  const [customFontFamily, setCustomFontFamily] = useState<'Helvetica' | 'Times-Roman' | 'Courier'>('Helvetica');
  const [customFontStyle, setCustomFontStyle] = useState<'regular' | 'bold' | 'italic' | 'bold-italic'>('regular');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setAllTextItems({});
      setCurrentPage(1);
      setTotalPages(0);
      setPdfjsDoc(null);
      setActiveItemId(null);
    }
  };

  // Load PDFjs document
  useEffect(() => {
    if (!file) return;

    const loadPDF = async () => {
      setLoading(true);
      try {
        const pdfjsLib = await loadPdfJs();
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        setPdfjsDoc(pdf);
        setTotalPages(pdf.numPages);
      } catch (err) {
        console.error(err);
        alert('Error parsing PDF file.');
      } finally {
        setLoading(false);
      }
    };

    loadPDF();
  }, [file]);

  // Render PDF page onto Canvas (ONLY runs when doc, page, or scale changes)
  useEffect(() => {
    if (!pdfjsDoc) return;

    const renderPage = async () => {
      try {
        const page = await pdfjsDoc.getPage(currentPage);
        const viewport = page.getViewport({ scale });
        setViewportSize({ width: viewport.width, height: viewport.height });
        setCurrentViewport(viewport);

        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const context = canvas.getContext('2d');
          if (context) {
            await page.render({ canvasContext: context, viewport }).promise;
          }
        }
      } catch (err) {
        console.error('Error rendering page:', err);
      }
    };

    renderPage();
  }, [pdfjsDoc, currentPage, scale]);

  // Extract page text items (ONLY runs when doc or page changes and items aren't cached yet)
  useEffect(() => {
    if (!pdfjsDoc) return;

    const loadItems = async () => {
      const pageIndex = currentPage - 1;
      if (allTextItems[pageIndex]) return; // already cached

      try {
        const page = await pdfjsDoc.getPage(currentPage);
        const textContent = await page.getTextContent();
        const items: TextItem[] = textContent.items.map((item: any, idx: number) => {
          const transform = item.transform;
          const fontSize = Math.abs(transform[3]);
          
          let fontFamily: 'Helvetica' | 'Times-Roman' | 'Courier' = 'Helvetica';
          const fontLower = (item.fontName || '').toLowerCase();
          if (fontLower.includes('times') || fontLower.includes('serif') || fontLower.includes('roman') || fontLower.includes('georgia')) {
            fontFamily = 'Times-Roman';
          } else if (fontLower.includes('courier') || fontLower.includes('mono') || fontLower.includes('consolas') || fontLower.includes('code')) {
            fontFamily = 'Courier';
          }

          let fontStyle: 'regular' | 'bold' | 'italic' | 'bold-italic' = 'regular';
          const nameLower = (item.fontName || '').toLowerCase();
          const hasBold = nameLower.includes('bold') || nameLower.includes('bd') || nameLower.includes('w7');
          const hasItalic = nameLower.includes('italic') || nameLower.includes('oblique') || nameLower.includes('it');
          if (hasBold && hasItalic) {
            fontStyle = 'bold-italic';
          } else if (hasBold) {
            fontStyle = 'bold';
          } else if (hasItalic) {
            fontStyle = 'italic';
          }

          return {
            id: `text-${pageIndex}-${idx}`,
            pageIndex,
            text: item.str,
            originalText: item.str,
            x: transform[4],
            y: transform[5],
            fontSize: fontSize || 11,
            width: item.width || 60,
            height: item.height || fontSize || 12,
            fontName: item.fontName || 'Helvetica',
            fontFamily,
            fontStyle
          };
        });

        setAllTextItems(prev => ({
          ...prev,
          [pageIndex]: items
        }));
      } catch (err) {
        console.error('Error loading text items:', err);
      }
    };

    loadItems();
  }, [pdfjsDoc, currentPage]);

  const currentPageItems = allTextItems[currentPage - 1] || [];

  const estimateWidth = (text: string, fontSize: number, fontFamily: string, fontStyle?: string) => {
    const isCourier = fontFamily === 'Courier';
    const isBold = fontStyle === 'bold' || fontStyle === 'bold-italic';
    const isItalic = fontStyle === 'italic' || fontStyle === 'bold-italic';
    
    let charRatio = isCourier ? 0.6 : 0.53;
    if (isBold) charRatio += 0.05;
    if (isItalic) charRatio += 0.02;
    
    // Add extra padding boundary to prevent horizontal cutoffs completely
    return (text.length * fontSize * charRatio) + 22;
  };

  // Update text item value
  const handleTextChange = (id: string, newText: string) => {
    const pageIndex = currentPage - 1;
    setAllTextItems(prev => {
      const updated = (prev[pageIndex] || []).map(item => {
        if (item.id === id) {
          const nextWidth = estimateWidth(newText, item.fontSize, item.fontFamily, item.fontStyle);
          return { 
            ...item, 
            text: newText,
            width: Math.max(item.width, nextWidth)
          };
        }
        return item;
      });
      return { ...prev, [pageIndex]: updated };
    });
  };

  // Update font family
  const handleFontChange = (id: string, font: 'Helvetica' | 'Times-Roman' | 'Courier') => {
    const pageIndex = currentPage - 1;
    setAllTextItems(prev => {
      const updated = (prev[pageIndex] || []).map(item => {
        if (item.id === id) {
          const nextWidth = estimateWidth(item.text, item.fontSize, font, item.fontStyle);
          return { 
            ...item, 
            fontFamily: font,
            width: nextWidth
          };
        }
        return item;
      });
      return { ...prev, [pageIndex]: updated };
    });
  };

  // Update font size
  const handleFontSizeChange = (id: string, size: number) => {
    const pageIndex = currentPage - 1;
    setAllTextItems(prev => {
      const updated = (prev[pageIndex] || []).map(item => {
        if (item.id === id) {
          const nextWidth = estimateWidth(item.text, size, item.fontFamily, item.fontStyle);
          return { 
            ...item, 
            fontSize: size,
            width: nextWidth
          };
        }
        return item;
      });
      return { ...prev, [pageIndex]: updated };
    });
  };

  // Update font style
  const handleFontStyleChange = (id: string, styleVal: 'regular' | 'bold' | 'italic' | 'bold-italic') => {
    const pageIndex = currentPage - 1;
    setAllTextItems(prev => {
      const updated = (prev[pageIndex] || []).map(item => {
        if (item.id === id) {
          const nextWidth = estimateWidth(item.text, item.fontSize, item.fontFamily, styleVal);
          return {
            ...item,
            fontStyle: styleVal,
            width: nextWidth
          };
        }
        return item;
      });
      return { ...prev, [pageIndex]: updated };
    });
  };

  // Delete text block
  const handleDeleteItem = (id: string) => {
    const pageIndex = currentPage - 1;
    setAllTextItems(prev => {
      const updated = (prev[pageIndex] || []).filter(item => item.id !== id);
      return { ...prev, [pageIndex]: updated };
    });
    if (activeItemId === id) {
      setActiveItemId(null);
    }
  };

  // Add custom text on click
  const handleCanvasClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pdfjsDoc || !containerRef.current) return;

    // Do not trigger custom text placement if clicking inputs or buttons
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'BUTTON' || target.closest('button')) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    try {
      const page = await pdfjsDoc.getPage(currentPage);
      const viewport = page.getViewport({ scale });
      const [pdfX, pdfY] = viewport.convertToPdfPoint(clickX, clickY);
      const pageIndex = currentPage - 1;

      // Smart proximity check: auto-select nearest text block or match style
      const items = allTextItems[pageIndex] || [];
      let closestItem: TextItem | null = null;
      let minDistance = Infinity;

      for (const item of items) {
        // Pad boundaries slightly to make selection feel natural
        const padX = Math.max(item.width * 0.1, 10);
        const padY = Math.max(item.fontSize * 0.5, 8);
        
        const inX = pdfX >= (item.x - padX) && pdfX <= (item.x + item.width + padX);
        const inY = pdfY >= (item.y - padY) && pdfY <= (item.y + item.fontSize + padY);

        // Distance from click point to item starting point
        const dist = Math.hypot(pdfX - item.x, pdfY - item.y);
        
        if (inX && inY) {
          closestItem = item;
          minDistance = 0;
          break;
        } else if (dist < minDistance) {
          minDistance = dist;
          closestItem = item;
        }
      }

      // 1. Auto-select existing block if click is directly inside or extremely close
      if (closestItem && minDistance <= 18) {
        setActiveItemId(closestItem.id);
        return;
      }

      // 2. Otherwise match the style of the nearest block (within 100 points) and create a new block
      let finalFontSize = customFontSize;
      let finalFontFamily = customFontFamily;
      let finalFontStyle = customFontStyle;
      if (closestItem && minDistance <= 100) {
        finalFontSize = closestItem.fontSize;
        finalFontFamily = closestItem.fontFamily;
        finalFontStyle = closestItem.fontStyle || 'regular';
        
        setCustomFontSize(closestItem.fontSize);
        setCustomFontFamily(closestItem.fontFamily);
        setCustomFontStyle(closestItem.fontStyle || 'regular');
      }

      const calculatedWidth = estimateWidth(customText, finalFontSize, finalFontFamily, finalFontStyle);

      const newItem: TextItem = {
        id: `custom-${pageIndex}-${Date.now()}`,
        pageIndex,
        text: customText,
        originalText: '',
        x: pdfX,
        y: pdfY,
        fontSize: finalFontSize,
        width: calculatedWidth,
        height: finalFontSize * 1.2,
        fontName: 'Helvetica',
        fontFamily: finalFontFamily,
        fontStyle: finalFontStyle,
        isNew: true
      };

      setAllTextItems(prev => ({
        ...prev,
        [pageIndex]: [...(prev[pageIndex] || []), newItem]
      }));
      setActiveItemId(newItem.id);
    } catch (err) {
      console.error(err);
    }
  };

  // Replace text
  const handleReplace = () => {
    if (!searchQuery) return;
    const pageIndex = currentPage - 1;
    setAllTextItems(prev => {
      const updated = (prev[pageIndex] || []).map(item => {
        if (item.text.includes(searchQuery)) {
          const nextText = item.text.replaceAll(searchQuery, replaceQuery);
          const nextWidth = estimateWidth(nextText, item.fontSize, item.fontFamily, item.fontStyle);
          return {
            ...item,
            text: nextText,
            width: Math.max(item.width, nextWidth)
          };
        }
        return item;
      });
      return { ...prev, [pageIndex]: updated };
    });
    setSearchQuery('');
    setReplaceQuery('');
  };

  // Export updated PDF
  const handleExport = async () => {
    if (!file) return;
    setSaving(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      
      // Embed standard font variants
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
      const helveticaBoldOblique = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);

      const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
      const timesRomanItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
      const timesRomanBoldItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic);

      const courier = await pdfDoc.embedFont(StandardFonts.Courier);
      const courierBold = await pdfDoc.embedFont(StandardFonts.CourierBold);
      const courierOblique = await pdfDoc.embedFont(StandardFonts.CourierOblique);
      const courierBoldOblique = await pdfDoc.embedFont(StandardFonts.CourierBoldOblique);

      const fontMap = {
        'Helvetica': {
          'regular': helvetica,
          'bold': helveticaBold,
          'italic': helveticaOblique,
          'bold-italic': helveticaBoldOblique
        },
        'Times-Roman': {
          'regular': timesRoman,
          'bold': timesRomanBold,
          'italic': timesRomanItalic,
          'bold-italic': timesRomanBoldItalic
        },
        'Courier': {
          'regular': courier,
          'bold': courierBold,
          'italic': courierOblique,
          'bold-italic': courierBoldOblique
        }
      };

      for (const pageIdxStr of Object.keys(allTextItems)) {
        const pageIdx = parseInt(pageIdxStr, 10);
        if (pageIdx >= pages.length) continue;

        const page = pages[pageIdx];
        const items = allTextItems[pageIdx];

        for (const item of items) {
          const isChanged = item.text !== item.originalText;
          if (isChanged || item.isNew) {
            // Draw covering white rectangle
            if (!item.isNew && item.originalText.trim().length > 0) {
              page.drawRectangle({
                x: item.x - 2,
                y: item.y - 2,
                width: item.width + 4,
                height: item.fontSize * 1.25,
                color: rgb(1, 1, 1),
              });
            }

            // Draw new text with selected font family and style variant
            if (item.text.trim().length > 0) {
              const familyMap = fontMap[item.fontFamily] || fontMap['Helvetica'];
              const selectedFont = familyMap[item.fontStyle || 'regular'] || familyMap['regular'];
              
              page.drawText(item.text, {
                x: item.x,
                y: item.y,
                size: item.fontSize,
                font: selectedFont,
                color: rgb(0, 0, 0),
              });
            }
          }
        }
      }

      const modifiedBytes = await pdfDoc.save();
      triggerBlobDownload(
        new Blob([new Uint8Array(modifiedBytes)], { type: 'application/pdf' }),
        `${file.name.replace(/\.[^/.]+$/, "")}_edited.pdf`
      );
    } catch (err) {
      console.error(err);
      alert('Error building modified PDF.');
    } finally {
      setSaving(false);
    }
  };

  // Render inline inputs
  const renderOverlayInputs = () => {
    if (!pdfjsDoc || !currentViewport || currentPageItems.length === 0) return null;
    
    try {
      const viewport = currentViewport;
      
      return currentPageItems.map((item) => {
        const [vx, vy] = viewport.convertToViewportPoint(item.x, item.y);
        const itemHeight = item.fontSize * scale;
        const itemWidth = item.width * scale;
        const isActive = activeItemId === item.id;
        const isChanged = item.text !== item.originalText;
        const shouldShowOpaque = isChanged || isActive || item.isNew;

        let inputClass = "";
        if (shouldShowOpaque) {
          inputClass = "bg-white border-[#4E8E5E] text-slate-950 shadow-sm z-10 animate-fadeIn";
        } else if (highlightAll) {
          inputClass = "bg-[#4E8E5E]/5 border-dashed border-[#4E8E5E]/30 text-transparent hover:bg-[#4E8E5E]/15 hover:border-[#4E8E5E]/60 hover:text-slate-900/70";
        } else {
          inputClass = "bg-transparent text-transparent border-transparent hover:bg-[#4E8E5E]/10 hover:border-[#4E8E5E]/40 hover:text-slate-900/60";
        }

        const isBold = item.fontStyle === 'bold' || item.fontStyle === 'bold-italic';
        const isItalic = item.fontStyle === 'italic' || item.fontStyle === 'bold-italic';

        return (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              left: `${vx}px`,
              top: `${vy - itemHeight}px`,
              width: `${Math.max(itemWidth, 75)}px`,
              height: `${Math.max(itemHeight + 5, 20)}px`,
            }}
            className="group"
          >
            <input
              type="text"
              value={item.text}
              onChange={(e) => handleTextChange(item.id, e.target.value)}
              onFocus={(e) => {
                e.stopPropagation();
                setActiveItemId(item.id);
              }}
              style={{
                fontSize: `${item.fontSize * scale}px`,
                fontFamily: item.fontFamily === 'Times-Roman' ? 'serif' : item.fontFamily === 'Courier' ? 'monospace' : 'sans-serif',
                fontWeight: isBold ? 'bold' : 'normal',
                fontStyle: isItalic ? 'italic' : 'normal',
                paddingRight: '8px' // Prevents cursor clipping on last letters
              }}
              className={`w-full h-full font-medium px-1 py-0.5 rounded border transition-all focus:outline-none ${inputClass} ${
                isActive 
                  ? 'ring-2 ring-[#4E8E5E]/20' 
                  : item.isNew 
                    ? 'border-dotted border-violet-400 bg-violet-500/5' 
                    : ''
              }`}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteItem(item.id);
              }}
              className="absolute -top-3 -right-3 p-0.5 bg-rose-900 border border-rose-800 text-rose-200 rounded-full hover:bg-rose-850 opacity-0 group-hover:opacity-100 transition-opacity z-20"
              title="Delete block"
            >
              <Trash2 size={10} />
            </button>
          </div>
        );
      });
    } catch (err) {
      return null;
    }
  };

  const activeItem = currentPageItems.find(item => item.id === activeItemId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left animate-fadeIn">
      {/* Canvas workspace */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4 min-h-[500px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Edit3 className="text-[#4E8E5E]" size={22} />
              <span>PDF Text Editor & Annotator</span>
            </h2>
            {file && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setHighlightAll(prev => !prev)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold border transition-all ${
                    highlightAll 
                      ? 'bg-[#4E8E5E]/15 border-[#4E8E5E]/40 text-[#4E8E5E]' 
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {highlightAll ? 'Hide Text Fields' : 'Highlight All Text'}
                </button>
                <button
                  onClick={() => setScale(prev => Math.max(prev - 0.1, 0.7))}
                  className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-400 hover:text-slate-200 text-xs font-semibold"
                >
                  Zoom -
                </button>
                <span className="text-xs font-mono text-slate-300">{Math.round(scale * 100)}%</span>
                <button
                  onClick={() => setScale(prev => Math.min(prev + 0.1, 1.8))}
                  className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-400 hover:text-slate-200 text-xs font-semibold"
                >
                  Zoom +
                </button>
              </div>
            )}
          </div>

          {!file ? (
            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/20 p-8 text-center gap-3 py-20">
              <div className="p-4 bg-slate-900/60 rounded-full border border-slate-800 text-[#4E8E5E]">
                <Upload size={32} />
              </div>
              <label className="btn-primary cursor-pointer mt-1">
                <span>Select PDF Document</span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-slate-500 text-xs">Load PDF offline to edit document text and add custom labels.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 flex-1">
              <div className="flex items-center gap-1.5 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-300 text-xs">
                <HelpCircle size={14} className="shrink-0" />
                <span>
                  <strong>Live Preview:</strong> Hover over any text on the page to view editable blocks. Clicking to edit immediately overlays a solid white label to display your changes in real time.
                </span>
              </div>
              
              {/* PDF rendering area */}
              <div className="flex-1 flex justify-center bg-slate-950/60 rounded-2xl border border-slate-850 p-4 overflow-auto max-h-[600px] relative">
                <div 
                  ref={containerRef} 
                  onClick={handleCanvasClick}
                  className="relative shadow-lg border border-slate-800 bg-white"
                  style={{ width: viewportSize.width, height: viewportSize.height }}
                >
                  <canvas ref={canvasRef} className="block" />
                  
                  {/* Overlay inputs */}
                  {renderOverlayInputs()}
                </div>
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center bg-slate-900/30 px-4 py-3 rounded-xl border border-slate-850/60 mt-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage <= 1}
                  className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1 disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                  <span>Prev Page</span>
                </button>
                
                <span className="text-xs font-bold text-slate-350">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage >= totalPages}
                  className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1 disabled:opacity-40"
                >
                  <span>Next Page</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Controls */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5">
          <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
            <Sliders size={16} className="text-[#4E8E5E]" />
            <span>Editor Settings</span>
          </h3>

          {file ? (
            <div className="flex flex-col gap-4">
              
              {/* Selected block configuration */}
              {activeItem ? (
                <div className="flex flex-col gap-3 p-3 bg-slate-900/40 rounded-xl border border-indigo-500/25">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Block Settings</span>
                    <button 
                      onClick={() => setActiveItemId(null)}
                      className="text-[9px] text-slate-500 hover:text-slate-300"
                    >
                      Deselect
                    </button>
                  </span>
                  
                  <div className="flex flex-col gap-2.5">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-400 font-bold">TEXT CONTENT</label>
                      <textarea
                        value={activeItem.text}
                        onChange={(e) => handleTextChange(activeItem.id, e.target.value)}
                        className="w-full bg-[#151C2C] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none h-16 resize-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-400 font-bold">FONT FAMILY</label>
                      <select
                        value={activeItem.fontFamily}
                        onChange={(e) => handleFontChange(activeItem.id, e.target.value as any)}
                        className="w-full bg-[#151C2C] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="Helvetica">Helvetica (Sans-Serif)</option>
                        <option value="Times-Roman">Times (Serif)</option>
                        <option value="Courier">Courier (Monospace)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-slate-400 font-bold">FONT SIZE</label>
                        <input
                          type="number"
                          value={activeItem.fontSize}
                          onChange={(e) => handleFontSizeChange(activeItem.id, parseFloat(e.target.value) || 12)}
                          className="w-full bg-[#151C2C] border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-slate-400 font-bold">FONT WEIGHT/STYLE</label>
                        <select
                          value={activeItem.fontStyle || 'regular'}
                          onChange={(e) => handleFontStyleChange(activeItem.id, e.target.value as any)}
                          className="w-full bg-[#151C2C] border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
                        >
                          <option value="regular">Regular</option>
                          <option value="bold">Bold</option>
                          <option value="italic">Italic</option>
                          <option value="bold-italic">Bold Italic</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-slate-500 bg-slate-900/20 p-3 rounded-lg border border-slate-850 italic">
                  Select any text box on the page to customize its font style or scale individually.
                </div>
              )}

              {/* Add Custom Text settings */}
              <div className="flex flex-col gap-3 p-3 bg-slate-900/40 rounded-xl border border-slate-850">
                <span className="text-xs font-bold text-slate-350 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus size={13} className="text-teal-400" />
                  <span>Click-to-Add Text Tool</span>
                </span>
                
                <div className="flex flex-col gap-2.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-500 font-semibold">ANNOTATION TEXT</label>
                    <input
                      type="text"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      className="w-full bg-[#151C2C] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-500 font-semibold">FONT FAMILY</label>
                    <select
                      value={customFontFamily}
                      onChange={(e) => setCustomFontFamily(e.target.value as any)}
                      className="w-full bg-[#151C2C] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="Helvetica">Helvetica</option>
                      <option value="Times-Roman">Times</option>
                      <option value="Courier">Courier</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-500 font-semibold">FONT SIZE</label>
                      <input
                        type="number"
                        value={customFontSize}
                        onChange={(e) => setCustomFontSize(parseInt(e.target.value, 10) || 12)}
                        className="w-full bg-[#151C2C] border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-500 font-semibold">FONT STYLE</label>
                      <select
                        value={customFontStyle}
                        onChange={(e) => setCustomFontStyle(e.target.value as any)}
                        className="w-full bg-[#151C2C] border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="regular">Regular</option>
                        <option value="bold">Bold</option>
                        <option value="italic">Italic</option>
                        <option value="bold-italic">Bold Italic</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Page-wide Search & Replace */}
              <div className="flex flex-col gap-3 p-3 bg-slate-900/40 rounded-xl border border-slate-850">
                <span className="text-xs font-bold text-slate-350 uppercase tracking-wider flex items-center gap-1.5">
                  <Search size={13} className="text-indigo-400" />
                  <span>Search & Replace Page</span>
                </span>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="Find word..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#151C2C] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Replace with..."
                    value={replaceQuery}
                    onChange={(e) => setReplaceQuery(e.target.value)}
                    className="w-full bg-[#151C2C] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                  <button
                    onClick={handleReplace}
                    disabled={!searchQuery}
                    className="btn-secondary w-full py-1.5 text-xs font-semibold flex justify-center items-center gap-1 disabled:opacity-40"
                  >
                    Run Search-Replace
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={handleExport}
                  disabled={saving || loading}
                  className="btn-primary w-full py-3"
                >
                  {saving ? <Check size={18} /> : <Download size={18} />}
                  <span>{saving ? 'Building PDF...' : 'Download Edited PDF'}</span>
                </button>
                <button
                  onClick={() => { setFile(null); setAllTextItems({}); }}
                  className="btn-secondary w-full py-2 text-xs border-rose-950/20 text-rose-400 hover:bg-rose-950/20"
                >
                  Close Document
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 leading-relaxed">
              Open a PDF file to begin custom styling, text editing, and annotations.
            </p>
          )}
        </div>

        <div className="bg-[#151C2C]/50 border border-slate-800 rounded-2xl p-4 flex gap-3 text-slate-400 text-left">
          <ShieldAlert size={20} className="text-[#4E8E5E] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-slate-300">Offline Sandboxed Operations</span>
            <span className="text-[10px] leading-relaxed">
              No files are ever uploaded. Text rendering, coordinates masking, and font embeddings are fully compiled using sandboxed JavaScript arrays.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
