import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Upload, Check, ShieldAlert, PenTool, RefreshCw, Layers, Move } from 'lucide-react';

// Dynamically load PDF.js script from a standard CDN
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

export const PDFSignTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Signature States
  const [inkColor, setInkColor] = useState<string>('#000000'); // black
  const [brushWidth, setBrushWidth] = useState<number>(3);
  const [signatureSaved, setSignatureSaved] = useState<boolean>(false);
  const [signatureUrl, setSignatureUrl] = useState<string>('');

  // Placement States
  const [targetPage, setTargetPage] = useState<number>(1);
  const [sigScale, setSigScale] = useState<number>(100);

  // Dragging States
  const [dragPos, setDragPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // PDF Page Rendering Preview Size
  const [previewDim, setPreviewDim] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [pdfRealDim, setPdfRealDim] = useState<{ width: number; height: number }>({ width: 595, height: 842 }); // Default A4

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef<boolean>(false);
  const activeRenderTaskRef = useRef<any>(null);

  // Initialize/Clear Signature Canvas
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setSignatureSaved(false);
    setSignatureUrl('');
  };

  useEffect(() => {
    initCanvas();
    return () => {
      if (activeRenderTaskRef.current) {
        try {
          activeRenderTaskRef.current.cancel();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // Render PDF Preview on Upload or Page Change
  useEffect(() => {
    if (!file) return;
    const renderPreview = async () => {
      try {
        const pdfjsLib = await loadPdfJs();
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        
        // Load target page
        const page = await pdf.getPage(Math.min(targetPage, pageCount || 1));
        const viewport = page.getViewport({ scale: 1.0 });

        setPdfRealDim({ width: viewport.width, height: viewport.height });

        // Fit page preview inside workspace width limits
        const maxWidth = Math.min(window.innerWidth - 64, 500);
        const scale = maxWidth / viewport.width;
        const displayViewport = page.getViewport({ scale });

        const canvas = previewCanvasRef.current;
        if (canvas) {
          const context = canvas.getContext('2d');
          if (context) {
            canvas.width = displayViewport.width;
            canvas.height = displayViewport.height;
            setPreviewDim({ width: displayViewport.width, height: displayViewport.height });

            // Cancel any running rendering task to prevent overlaps/duplicates
            if (activeRenderTaskRef.current) {
              try {
                activeRenderTaskRef.current.cancel();
              } catch (e) {
                // ignore
              }
            }

            const renderTask = page.render({ canvasContext: context, viewport: displayViewport });
            activeRenderTaskRef.current = renderTask;

            try {
              await renderTask.promise;
            } catch (err: any) {
              if (err.name !== 'RenderingCancelledException') {
                throw err;
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed rendering PDF preview page:', err);
      }
    };
    renderPreview();
  }, [file, targetPage, pageCount]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setSuccess(false);
      try {
        const bytes = await selected.arrayBuffer();
        const pdf = await PDFDocument.load(bytes);
        setPageCount(pdf.getPageCount());
        setTargetPage(1);
      } catch (err) {
        console.error(err);
        alert('Invalid PDF file or format.');
        setFile(null);
        setPageCount(null);
      }
    }
  };

  // Canvas Drawing Listeners
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getEventCoords(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = brushWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getEventCoords(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const getEventCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      if (e.touches.length > 0) {
        return {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top
        };
      }
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top
    };
  };

  const saveSignatureImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const blank = document.createElement('canvas');
    blank.width = canvas.width;
    blank.height = canvas.height;
    if (canvas.toDataURL() === blank.toDataURL()) {
      alert('Please draw your signature before saving.');
      return;
    }

    const dataUrl = canvas.toDataURL('image/png');
    setSignatureUrl(dataUrl);
    setSignatureSaved(true);
  };

  // Drag Placement Handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!signatureSaved) return;
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    dragOffset.current = {
      x: clientX - dragPos.x,
      y: clientY - dragPos.y
    };
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !signatureSaved) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    let x = clientX - dragOffset.current.x;
    let y = clientY - dragOffset.current.y;

    // Boundaries constraints
    if (previewDim.width > 0 && previewDim.height > 0) {
      const sigW = (200 * sigScale) / 200;
      const sigH = (80 * sigScale) / 200;
      x = Math.max(0, Math.min(x, previewDim.width - sigW));
      y = Math.max(0, Math.min(y, previewDim.height - sigH));
    }

    setDragPos({ x, y });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove);
      window.addEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging]);

  const handlePlaceSignature = async () => {
    if (!file || !signatureUrl || !pageCount) return;
    setLoading(true);
    setSuccess(false);
    try {
      const pdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      
      const sigImgBytes = await fetch(signatureUrl).then((res) => res.arrayBuffer());
      const sigImage = await pdfDoc.embedPng(sigImgBytes);

      const pageIndex = Math.max(0, Math.min(targetPage - 1, pageCount - 1));
      const page = pdfDoc.getPages()[pageIndex];

      const scaledW = (sigImage.width * sigScale) / 200;
      const scaledH = (sigImage.height * sigScale) / 200;

      // Coordinate mapping from Preview container space to PDF Page space
      // Note: PDF coordinate space origin (0,0) is BOTTOM-LEFT
      const containerScaleX = pdfRealDim.width / previewDim.width;
      const containerScaleY = pdfRealDim.height / previewDim.height;

      const pdfX = dragPos.x * containerScaleX;
      // Convert top-left browser Y to bottom-left PDF Y
      const previewSigH = (80 * sigScale) / 200;
      const pdfY = (previewDim.height - dragPos.y - previewSigH) * containerScaleY;

      page.drawImage(sigImage, {
        x: pdfX,
        y: pdfY,
        width: scaledW,
        height: scaledH
      });

      const finalBytes = await pdfDoc.save();
      triggerBlobDownload(
        new Blob([new Uint8Array(finalBytes)], { type: 'application/pdf' }),
        `${file.name.replace(/\.[^/.]+$/, "")}_signed.pdf`
      );
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error(e);
      alert('Error embedding signature into PDF.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Signature Pad Panel */}
      <div className="lg:col-span-8 flex flex-col gap-6 text-left">
        {/* Draw panel */}
        <div className="glass-card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <PenTool className="text-[#4E8E5E]" size={22} />
              <span>1. Draw Your Signature</span>
            </h2>
            <button
              onClick={initCanvas}
              className="text-[10px] text-rose-400 hover:text-rose-350 font-bold flex items-center gap-1.5"
            >
              <RefreshCw size={12} />
              <span>Clear Pad</span>
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <div className="relative border border-slate-800 rounded-2xl bg-slate-950/40 overflow-hidden flex items-center justify-center p-2">
              <canvas
                ref={canvasRef}
                width={500}
                height={200}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="bg-[#1a2333]/30 border border-slate-850 rounded-xl cursor-pencil max-w-full touch-none"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/30 rounded-xl border border-slate-850">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">Ink:</span>
                <div className="flex gap-2">
                  {['#000000', '#0f172a', '#1e40af', '#991b1b'].map((col) => (
                    <button
                      key={col}
                      onClick={() => setInkColor(col)}
                      className={`w-6 h-6 rounded-full border transition-all ${
                        inkColor === col ? 'ring-2 ring-teal-400 scale-110' : 'opacity-70'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Width:</span>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={brushWidth}
                  onChange={(e) => setBrushWidth(parseInt(e.target.value))}
                  className="w-24 h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-[#4E8E5E]"
                />
              </div>

              <button
                onClick={saveSignatureImage}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                  signatureSaved
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                    : 'bg-[#4E8E5E] text-white hover:bg-[#3d704a]'
                }`}
              >
                {signatureSaved ? 'Signature Locked ✓' : 'Lock Signature'}
              </button>
            </div>
          </div>
        </div>

        {/* Drag Workspace panel */}
        <div className="glass-card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="text-[#4E8E5E]" size={22} />
              <span>2. Drag Signature on Preview</span>
            </h2>
          </div>

          {!file ? (
            <div className="border border-dashed border-slate-800 rounded-2xl p-8 bg-slate-950/20 text-center flex flex-col items-center gap-3">
              <div className="p-4 bg-slate-900/60 rounded-full border border-slate-800 text-[#4E8E5E]">
                <Upload size={32} />
              </div>
              <label className="btn-primary cursor-pointer mt-1">
                <span>Choose PDF File</span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-slate-500 text-xs">Upload document to load interactive drag workspace</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-between w-full bg-slate-900/30 p-3 rounded-xl border border-slate-850 text-xs">
                <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                <button
                  onClick={() => { setFile(null); setPageCount(null); }}
                  className="text-rose-450 font-bold"
                >
                  Change File
                </button>
              </div>

              {/* Drag Positioning Container */}
              <div
                ref={previewContainerRef}
                className="relative border border-slate-800 rounded-2xl bg-slate-950/30 overflow-hidden flex items-center justify-center p-0 select-none touch-none"
                style={{ width: previewDim.width ? previewDim.width : 'auto' }}
              >
                <canvas ref={previewCanvasRef} className="rounded-lg shadow-xl" />

                {/* Overlaid Draggable Signature */}
                {signatureSaved && signatureUrl && (
                  <div
                    onMouseDown={handleDragStart}
                    onTouchStart={handleDragStart}
                    className="absolute cursor-move select-none border border-dashed border-teal-400 bg-teal-500/10 p-1 flex items-center justify-center group touch-none"
                    style={{
                      left: dragPos.x,
                      top: dragPos.y,
                      width: (200 * sigScale) / 200,
                      height: (80 * sigScale) / 200,
                    }}
                  >
                    <img src={signatureUrl} alt="sig" className="w-full h-full object-contain pointer-events-none" />
                    <div className="absolute -top-6 bg-teal-500 text-white font-bold text-[9px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <Move size={8} />
                      <span>Drag me</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Signature Placement Controls */}
      <div className="lg:col-span-4 flex flex-col gap-6 text-left">
        <div className="glass-card p-6 flex flex-col gap-5">
          <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3">Placement Specs</h3>

          {/* Target Page */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-455 font-medium">Placement Page</label>
            <input
              type="number"
              min="1"
              max={pageCount || 1}
              value={targetPage}
              disabled={!pageCount}
              onChange={(e) => setTargetPage(Math.max(1, parseInt(e.target.value) || 1))}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E] disabled:opacity-30"
            />
            <span className="text-[10px] text-slate-500">Page {targetPage} of {pageCount || 1}</span>
          </div>

          {/* Coordinate Displays */}
          <div className="grid grid-cols-2 gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-850 text-xs">
            <div className="flex flex-col">
              <span className="text-slate-500 font-medium">Mapped PDF X:</span>
              <span className="text-[#4E8E5E] font-bold font-mono">
                {Math.round(dragPos.x * (pdfRealDim.width / (previewDim.width || 1)))} pt
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500 font-medium">Mapped PDF Y:</span>
              <span className="text-[#4E8E5E] font-bold font-mono">
                {Math.round((previewDim.height - dragPos.y - (80 * sigScale) / 200) * (pdfRealDim.height / (previewDim.height || 1)))} pt
              </span>
            </div>
          </div>

          {/* Scale slider */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-medium">Signature Scaling</span>
              <span className="text-teal-400 font-semibold font-mono">{sigScale}%</span>
            </div>
            <input
              type="range"
              min="30"
              max="200"
              value={sigScale}
              disabled={!file}
              onChange={(e) => setSigScale(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#4E8E5E] disabled:opacity-30"
            />
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={handlePlaceSignature}
              disabled={!file || !signatureSaved || loading}
              className="btn-primary w-full py-3"
            >
              {success ? <Check size={18} /> : <PenTool size={18} />}
              <span>{loading ? 'Embedding...' : success ? 'Signed & Saved!' : 'Stamp Signature'}</span>
            </button>
          </div>
        </div>

        {/* Local Processing Banner */}
        <div className="bg-[#151C2C]/50 border border-slate-800 rounded-2xl p-4 flex gap-3 text-slate-400">
          <ShieldAlert size={20} className="text-[#4E8E5E] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-slate-300">Draggable Offline Placing</span>
            <span className="text-[10px] leading-relaxed">Drag the watermark box directly inside the layout wrapper. Coordinates map perfectly to PDF points.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
