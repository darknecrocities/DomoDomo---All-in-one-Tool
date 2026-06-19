import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Upload, FileText, Check, ShieldAlert, PenTool, RefreshCw, Layers } from 'lucide-react';

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
  const [posX, setPosX] = useState<number>(150);
  const [posY, setPosY] = useState<number>(50);
  const [sigScale, setSigScale] = useState<number>(100);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef<boolean>(false);

  // Initialize/Clear Signature Canvas
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw white background
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setSignatureSaved(false);
    setSignatureUrl('');
  };

  useEffect(() => {
    initCanvas();
  }, []);

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
    
    // Check if touch event
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
    
    // Check if canvas is empty
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

  const handlePlaceSignature = async () => {
    if (!file || !signatureUrl || !pageCount) return;
    setLoading(true);
    setSuccess(false);
    try {
      const pdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      
      // Load signature PNG image bytes
      const sigImgBytes = await fetch(signatureUrl).then((res) => res.arrayBuffer());
      const sigImage = await pdfDoc.embedPng(sigImgBytes);

      // Fetch target page (1-indexed to 0-indexed)
      const pageIndex = Math.max(0, Math.min(targetPage - 1, pageCount - 1));
      const page = pdfDoc.getPages()[pageIndex];

      const scaledW = (sigImage.width * sigScale) / 200;
      const scaledH = (sigImage.height * sigScale) / 200;

      // Draw onto target page
      page.drawImage(sigImage, {
        x: posX,
        y: posY,
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
            {/* Signature Draw Area */}
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

            {/* Brush Customization */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/30 rounded-xl border border-slate-850">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">Ink Color:</span>
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
                  <input
                    type="color"
                    value={inkColor}
                    onChange={(e) => setInkColor(e.target.value)}
                    className="w-6 h-6 rounded-full bg-transparent border-0 cursor-pointer p-0 shrink-0"
                  />
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
                <span className="text-[10px] text-teal-400 font-mono font-bold">{brushWidth}px</span>
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

        {/* PDF File Upload */}
        <div className="glass-card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="text-[#4E8E5E]" size={22} />
              <span>2. Upload Document to Sign</span>
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
              <p className="text-slate-500 text-xs">Select PDF you wish to stamp your signature onto</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 bg-slate-900/30 p-4 rounded-xl border border-slate-850">
              <div className="flex items-center gap-3">
                <FileText className="text-[#4E8E5E]" size={24} />
                <div className="flex flex-col">
                  <span className="text-slate-200 text-xs font-bold">{file.name}</span>
                  <span className="text-[10px] text-slate-400">
                    {(file.size / 1024).toFixed(1)} KB — {pageCount} {pageCount === 1 ? 'page' : 'pages'} total
                  </span>
                </div>
              </div>
              <button
                onClick={() => { setFile(null); setPageCount(null); }}
                className="text-[10px] text-rose-400 hover:text-rose-350 font-bold self-start"
              >
                Change PDF File
              </button>
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
            <label className="text-xs text-slate-450 font-medium">Placement Page</label>
            <input
              type="number"
              min="1"
              max={pageCount || 1}
              value={targetPage}
              disabled={!pageCount}
              onChange={(e) => setTargetPage(Math.max(1, parseInt(e.target.value) || 1))}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E] disabled:opacity-30"
            />
          </div>

          {/* X coordinate slider */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-medium">Horizontal Offset (X)</span>
              <span className="text-teal-400 font-semibold font-mono">{posX}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="600"
              value={posX}
              disabled={!file}
              onChange={(e) => setPosX(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#4E8E5E] disabled:opacity-30"
            />
          </div>

          {/* Y coordinate slider */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-medium">Vertical Offset (Y)</span>
              <span className="text-teal-400 font-semibold font-mono">{posY}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="800"
              value={posY}
              disabled={!file}
              onChange={(e) => setPosY(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#4E8E5E] disabled:opacity-30"
            />
          </div>

          {/* Signature Scale slider */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-medium">Signature Size Scale</span>
              <span className="text-teal-400 font-semibold font-mono">{sigScale}%</span>
            </div>
            <input
              type="range"
              min="30"
              max="250"
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
            <p className="text-[10px] text-slate-500 text-center leading-relaxed">
              Ensure you lock the signature canvas and upload a PDF document first.
            </p>
          </div>
        </div>

        {/* Local Processing Banner */}
        <div className="bg-[#151C2C]/50 border border-slate-800 rounded-2xl p-4 flex gap-3 text-slate-400 text-left">
          <ShieldAlert size={20} className="text-[#4E8E5E] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-slate-300">100% Secure Client-Side Signature</span>
            <span className="text-[10px] leading-relaxed">Your drawing and document buffers are composited entirely within local memory via array buffer mapping.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
