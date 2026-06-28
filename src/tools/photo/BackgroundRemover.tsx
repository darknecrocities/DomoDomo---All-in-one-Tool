import { FileUploadWrapper, triggerDownload } from '../../utils/sharedHelpers';
import React, { useState, useRef, useEffect } from 'react';
import { Download, Upload, Undo2, Redo2, Paintbrush, Scissors, Pipette, Trash2, Check, RefreshCw } from 'lucide-react';

export const BackgroundRemoverTool = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [tolerance, setTolerance] = useState(32);
  const [brushSize, setBrushSize] = useState(20);
  const [activeTool, setActiveTool] = useState<'key' | 'eraser' | 'trace'>('key');
  const [selectedColor, setSelectedColor] = useState<{r:number, g:number, b:number} | null>(null);
  
  // Trace tool states
  const [tracePoints, setTracePoints] = useState<{x: number, y: number}[]>([]);
  const [traceAction, setTraceAction] = useState<'keep' | 'remove'>('keep');
  
  // Background replacement settings
  const [bgMode, setBgMode] = useState<'transparent' | 'color' | 'image'>('transparent');
  const [bgColor, setBgColor] = useState('#4E8E5E');
  const [bgImageUrl, setBgImageUrl] = useState('');

  // Canvas references
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const origCanvasRef = useRef<HTMLCanvasElement>(null);
  const manualMaskCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Drawing state
  const isDrawing = useRef(false);
  const prevMousePosRef = useRef<{x: number, y: number} | null>(null);
  const [mouseHoverPos, setMouseHoverPos] = useState<{x: number, y: number} | null>(null);

  // Undo/Redo history stack
  const historyRef = useRef<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Redraw counter to trigger render updates
  const [redrawCounter, setRedrawCounter] = useState(0);
  const triggerRedraw = () => setRedrawCounter(prev => prev + 1);

  // Pushes the current manual mask state to the undo/redo history
  const pushHistory = () => {
    const mmc = manualMaskCanvasRef.current;
    if (!mmc) return;
    const mctx = mmc.getContext('2d');
    if (!mctx) return;
    const currentData = mctx.getImageData(0, 0, mmc.width, mmc.height);
    
    const nextHistory = historyRef.current.slice(0, historyIndex + 1);
    nextHistory.push(currentData);
    
    // Cap history size to 30 states to avoid high memory overhead
    if (nextHistory.length > 30) {
      nextHistory.shift();
    }
    
    historyRef.current = nextHistory;
    setHistoryIndex(nextHistory.length - 1);
  };

  // Perform undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      const mmc = manualMaskCanvasRef.current;
      if (mmc) {
        const mctx = mmc.getContext('2d');
        if (mctx) {
          mctx.putImageData(historyRef.current[prevIndex], 0, 0);
          triggerRedraw();
        }
      }
    }
  };

  // Perform redo
  const handleRedo = () => {
    if (historyIndex < historyRef.current.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      const mmc = manualMaskCanvasRef.current;
      if (mmc) {
        const mctx = mmc.getContext('2d');
        if (mctx) {
          mctx.putImageData(historyRef.current[nextIndex], 0, 0);
          triggerRedraw();
        }
      }
    }
  };

  // Set up canvases and initialize masks on image load
  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.onload = () => {
      const c = canvasRef.current;
      const oc = origCanvasRef.current;
      if (!c || !oc) return;
      
      c.width = img.width > 800 ? 800 : img.width;
      c.height = (c.width / img.width) * img.height;
      oc.width = c.width;
      oc.height = c.height;
      
      // Draw image onto original canvas
      oc.getContext('2d')?.drawImage(img, 0, 0, c.width, c.height);
      
      // Initialize manual mask canvas
      let mmc = manualMaskCanvasRef.current;
      if (!mmc) {
        mmc = document.createElement('canvas');
        manualMaskCanvasRef.current = mmc;
      }
      mmc.width = c.width;
      mmc.height = c.height;
      const mctx = mmc.getContext('2d');
      if (mctx) {
        mctx.fillStyle = '#ffffff';
        mctx.fillRect(0, 0, mmc.width, mmc.height);
        const initialData = mctx.getImageData(0, 0, mmc.width, mmc.height);
        historyRef.current = [initialData];
        setHistoryIndex(0);
      }
      
      setSelectedColor(null);
      setTracePoints([]);
      triggerRedraw();
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Main composite render loop
  useEffect(() => {
    const c = canvasRef.current;
    const oc = origCanvasRef.current;
    const mmc = manualMaskCanvasRef.current;
    if (!c || !oc || !mmc || !imageUrl) return;

    const ctx = c.getContext('2d');
    const octx = oc.getContext('2d');
    if (!ctx || !octx) return;

    const { width, height } = c;

    // 1. Draw Background Layer
    ctx.clearRect(0, 0, width, height);
    if (bgMode === 'color') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
    } else if (bgMode === 'image' && bgImageUrl) {
      const bgImg = new Image();
      bgImg.onload = () => {
        ctx.drawImage(bgImg, 0, 0, width, height);
        drawForeground();
      };
      bgImg.src = bgImageUrl;
      return;
    }

    const drawForeground = () => {
      // 2. Create offscreen canvas for foreground + mask computation
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tctx = tempCanvas.getContext('2d');
      if (!tctx) return;

      // Draw original image on temp canvas
      tctx.drawImage(oc, 0, 0, width, height);

      // Apply dynamic Chroma Key if color selected
      if (selectedColor) {
        const imgData = tctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        const { r: kr, g: kg, b: kb } = selectedColor;
        const toleranceSq = tolerance ** 2;
        
        for (let i = 0; i < data.length; i += 4) {
          const sqDist = (data[i] - kr) ** 2 + (data[i + 1] - kg) ** 2 + (data[i + 2] - kb) ** 2;
          if (sqDist < toleranceSq) {
            data[i + 3] = 0; // Transparent
          }
        }
        tctx.putImageData(imgData, 0, 0);
      }

      // Layer the manual mask canvas on top
      tctx.save();
      tctx.globalCompositeOperation = 'destination-in';
      tctx.drawImage(mmc, 0, 0);
      tctx.restore();

      // Output masked foreground onto display canvas
      ctx.drawImage(tempCanvas, 0, 0);

      // 3. Draw interactive Overlay graphics
      drawOverlays(ctx);
    };

    const drawOverlays = (context: CanvasRenderingContext2D) => {
      // Draw Trace/Lasso path
      if (activeTool === 'trace' && tracePoints.length > 0) {
        context.save();
        
        // Draw lines connecting trace points
        context.beginPath();
        context.moveTo(tracePoints[0].x, tracePoints[0].y);
        for (let i = 1; i < tracePoints.length; i++) {
          context.lineTo(tracePoints[i].x, tracePoints[i].y);
        }
        
        // Line extending to active hover position
        if (mouseHoverPos) {
          context.lineTo(mouseHoverPos.x, mouseHoverPos.y);
        }
        
        context.strokeStyle = '#06b6d4'; // Cyan neon
        context.lineWidth = 2.5;
        context.setLineDash([4, 4]);
        context.stroke();
        context.setLineDash([]);

        // Vertices
        tracePoints.forEach((pt, idx) => {
          context.beginPath();
          context.arc(pt.x, pt.y, idx === 0 ? 6 : 4, 0, Math.PI * 2);
          context.fillStyle = idx === 0 ? '#10b981' : '#06b6d4'; // Green for root node
          context.strokeStyle = '#ffffff';
          context.lineWidth = 1.5;
          context.fill();
          context.stroke();
        });
        
        context.restore();
      }

      // Draw active Eraser brush outline circle
      if (activeTool === 'eraser' && mouseHoverPos) {
        context.save();
        context.beginPath();
        context.arc(mouseHoverPos.x, mouseHoverPos.y, brushSize, 0, Math.PI * 2);
        context.strokeStyle = 'rgba(244, 63, 94, 0.85)'; // Soft pink/rose circle
        context.lineWidth = 1.5;
        context.stroke();
        context.restore();
      }
    };

    drawForeground();

  }, [imageUrl, selectedColor, tolerance, bgMode, bgColor, bgImageUrl, redrawCounter, activeTool, tracePoints, mouseHoverPos]);

  // Click handler for color picking and tracing
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current;
    if (!c) return;
    const rect = c.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * c.width;
    const y = ((e.clientY - rect.top) / rect.height) * c.height;

    if (activeTool === 'key') {
      const pixel = c.getContext('2d')?.getImageData(x, y, 1, 1).data;
      if (pixel) setSelectedColor({ r: pixel[0], g: pixel[1], b: pixel[2] });
    } else if (activeTool === 'trace') {
      // If clicking near the initial vertex, close the loop & apply
      if (tracePoints.length >= 3) {
        const root = tracePoints[0];
        const dist = Math.sqrt((x - root.x) ** 2 + (y - root.y) ** 2);
        if (dist < 12) {
          applyTrace();
          return;
        }
      }
      setTracePoints(prev => [...prev, { x, y }]);
    }
  };

  // Draw manual eraser marks to manualMaskCanvas
  const drawEraser = (x: number, y: number, prevX: number | null, prevY: number | null) => {
    const mmc = manualMaskCanvasRef.current;
    if (!mmc) return;
    const mctx = mmc.getContext('2d');
    if (!mctx) return;
    
    mctx.save();
    mctx.globalCompositeOperation = 'destination-out';
    mctx.lineWidth = brushSize * 2;
    mctx.lineCap = 'round';
    mctx.lineJoin = 'round';
    
    mctx.beginPath();
    if (prevX !== null && prevY !== null) {
      mctx.moveTo(prevX, prevY);
    } else {
      mctx.moveTo(x, y);
    }
    mctx.lineTo(x, y);
    mctx.stroke();
    mctx.restore();
  };

  // Mouse move handler for tracking, hovering and painting
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current;
    if (!c) return;
    const rect = c.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * c.width;
    const y = ((e.clientY - rect.top) / rect.height) * c.height;
    
    setMouseHoverPos({ x, y });

    if (isDrawing.current && activeTool === 'eraser') {
      const prev = prevMousePosRef.current;
      drawEraser(x, y, prev ? prev.x : null, prev ? prev.y : null);
      prevMousePosRef.current = { x, y };
      triggerRedraw();
    }
  };

  // Apply trace mask cutout operation
  const applyTrace = () => {
    if (tracePoints.length < 3) return;
    
    pushHistory();
    
    const mmc = manualMaskCanvasRef.current;
    if (!mmc) return;
    const mctx = mmc.getContext('2d');
    if (!mctx) return;
    
    mctx.save();
    if (traceAction === 'remove') {
      // Remove region inside the drawn trace path
      mctx.globalCompositeOperation = 'destination-out';
      mctx.beginPath();
      mctx.moveTo(tracePoints[0].x, tracePoints[0].y);
      for (let i = 1; i < tracePoints.length; i++) {
        mctx.lineTo(tracePoints[i].x, tracePoints[i].y);
      }
      mctx.closePath();
      mctx.fillStyle = 'rgba(0,0,0,1)';
      mctx.fill();
    } else {
      // Keep only the region inside trace path (remove outside)
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = mmc.width;
      tempCanvas.height = mmc.height;
      tempCanvas.getContext('2d')?.drawImage(mmc, 0, 0);
      
      mctx.clearRect(0, 0, mmc.width, mmc.height);
      
      mctx.globalCompositeOperation = 'source-over';
      mctx.beginPath();
      mctx.moveTo(tracePoints[0].x, tracePoints[0].y);
      for (let i = 1; i < tracePoints.length; i++) {
        mctx.lineTo(tracePoints[i].x, tracePoints[i].y);
      }
      mctx.closePath();
      mctx.fillStyle = '#ffffff';
      mctx.fill();
      
      mctx.globalCompositeOperation = 'source-in';
      mctx.drawImage(tempCanvas, 0, 0);
    }
    mctx.restore();
    
    setTracePoints([]);
    triggerRedraw();
  };

  // Clean slate reset
  const handleReset = () => {
    const mmc = manualMaskCanvasRef.current;
    if (mmc) {
      const mctx = mmc.getContext('2d');
      if (mctx) {
        mctx.fillStyle = '#ffffff';
        mctx.fillRect(0, 0, mmc.width, mmc.height);
        pushHistory();
      }
    }
    setSelectedColor(null);
    setTracePoints([]);
    triggerRedraw();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-8 glass-card p-6 flex flex-col justify-center min-h-[400px] relative overflow-hidden">
        <div className="absolute inset-0 bg-[#0B0F19]" style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
        <div className="relative z-10 w-full flex flex-col justify-center">
          {!imageUrl ? (
            <FileUploadWrapper onUpload={(file) => { setImageUrl(URL.createObjectURL(file)); }} />
          ) : (
            <div className="relative mx-auto">
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                onMouseDown={(e) => {
                  if (activeTool === 'eraser') {
                    isDrawing.current = true;
                    const rect = canvasRef.current!.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * canvasRef.current!.width;
                    const y = ((e.clientY - rect.top) / rect.height) * canvasRef.current!.height;
                    drawEraser(x, y, null, null);
                    prevMousePosRef.current = { x, y };
                    triggerRedraw();
                  }
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={() => {
                  if (isDrawing.current) {
                    isDrawing.current = false;
                    prevMousePosRef.current = null;
                    pushHistory();
                  }
                }}
                onMouseLeave={() => {
                  isDrawing.current = false;
                  prevMousePosRef.current = null;
                  setMouseHoverPos(null);
                  triggerRedraw();
                }}
                className="max-w-full h-auto rounded border border-slate-800 shadow-xl cursor-crosshair bg-checkered"
              />
              
              {activeTool === 'trace' && tracePoints.length > 0 && (
                <div className="absolute top-2 left-2 flex gap-2">
                  <button onClick={applyTrace} className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold shadow flex items-center gap-1 transition-colors">
                    <Check size={12} /> Apply Cutout
                  </button>
                  <button onClick={() => { setTracePoints([]); triggerRedraw(); }} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold shadow flex items-center gap-1 transition-colors">
                    <Trash2 size={12} /> Clear Path
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <canvas ref={origCanvasRef} className="hidden" />
      </div>

      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h3 className="text-teal-400 font-bold">Background Remover</h3>
            {imageUrl && (
              <button 
                onClick={handleReset}
                className="p-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded transition-colors flex items-center gap-1"
                title="Reset Image"
              >
                <RefreshCw size={12} /> Reset
              </button>
            )}
          </div>
          
          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Mask Tools</span>
            {imageUrl && (
              <div className="flex gap-1.5">
                <button
                  disabled={historyIndex <= 0}
                  onClick={handleUndo}
                  className={`p-1 rounded ${historyIndex > 0 ? 'text-teal-450 hover:bg-slate-800' : 'text-slate-600 cursor-not-allowed'}`}
                  title="Undo"
                >
                  <Undo2 size={14} />
                </button>
                <button
                  disabled={historyIndex >= historyRef.current.length - 1}
                  onClick={handleRedo}
                  className={`p-1 rounded ${historyIndex < historyRef.current.length - 1 ? 'text-teal-450 hover:bg-slate-800' : 'text-slate-600 cursor-not-allowed'}`}
                  title="Redo"
                >
                  <Redo2 size={14} />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-1">
            <button 
              onClick={() => { setActiveTool('key'); setTracePoints([]); }} 
              className={`py-1.5 rounded text-[11px] font-bold flex items-center justify-center gap-1 transition-colors ${activeTool === 'key' ? 'bg-[#4E8E5E] text-white' : 'bg-slate-900 text-slate-400 border border-slate-850 hover:bg-slate-850'}`}
            >
              <Pipette size={11} /> Chroma Key
            </button>
            <button 
              onClick={() => { setActiveTool('eraser'); setTracePoints([]); }} 
              className={`py-1.5 rounded text-[11px] font-bold flex items-center justify-center gap-1 transition-colors ${activeTool === 'eraser' ? 'bg-[#4E8E5E] text-white' : 'bg-slate-900 text-slate-400 border border-slate-850 hover:bg-slate-850'}`}
            >
              <Paintbrush size={11} /> Eraser
            </button>
            <button 
              onClick={() => { setActiveTool('trace'); }} 
              className={`py-1.5 rounded text-[11px] font-bold flex items-center justify-center gap-1 transition-colors ${activeTool === 'trace' ? 'bg-[#4E8E5E] text-white' : 'bg-slate-900 text-slate-400 border border-slate-850 hover:bg-slate-850'}`}
            >
              <Scissors size={11} /> Trace Lasso
            </button>
          </div>

          {activeTool === 'key' && (
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Chroma Color:</span>
                {selectedColor ? (
                  <span className="flex items-center gap-1 font-mono text-[10px] text-teal-400">
                    <span 
                      className="w-3 h-3 rounded-full border border-slate-700" 
                      style={{ backgroundColor: `rgb(${selectedColor.r}, ${selectedColor.g}, ${selectedColor.b})` }} 
                    />
                    rgb({selectedColor.r}, {selectedColor.g}, {selectedColor.b})
                    <button onClick={() => { setSelectedColor(null); triggerRedraw(); }} className="text-rose-450 hover:underline ml-1">Clear</button>
                  </span>
                ) : (
                  <span className="text-slate-500 italic">Click image to sample color</span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] text-slate-450">
                  <span>Match Tolerance</span>
                  <span>{tolerance}</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="150" 
                  value={tolerance} 
                  onChange={(e) => setTolerance(parseInt(e.target.value))} 
                  className="w-full accent-[#4E8E5E]" 
                />
              </div>
            </div>
          )}

          {activeTool === 'eraser' && (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs"><span className="text-slate-400">Brush Size</span><span className="text-slate-300">{brushSize}px</span></div>
              <input type="range" min="3" max="80" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="w-full accent-[#4E8E5E]" />
            </div>
          )}

          {activeTool === 'trace' && (
            <div className="flex flex-col gap-2 border border-cyan-900/30 bg-cyan-950/10 p-2.5 rounded text-xs text-slate-300">
              <div className="font-semibold text-cyan-400">How to Trace:</div>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-400">
                <li>Click points on image to form boundary lines.</li>
                <li>Close the loop by clicking the green start point, or click <strong className="text-cyan-400">Apply Cutout</strong>.</li>
              </ul>
              <div className="flex justify-between items-center mt-1 pt-1.5 border-t border-slate-850">
                <span className="text-[11px] text-slate-400 font-bold uppercase">Trace Action</span>
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => setTraceAction('keep')} 
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${traceAction === 'keep' ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
                  >
                    Keep Inside
                  </button>
                  <button 
                    onClick={() => setTraceAction('remove')} 
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${traceAction === 'remove' ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
                  >
                    Erase Inside
                  </button>
                </div>
              </div>
            </div>
          )}

          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-2 border-t border-slate-850 pt-3">Background Mode</span>
          <div className="grid grid-cols-3 gap-1">
            {(['transparent', 'color', 'image'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setBgMode(m)}
                className={`py-1 rounded text-[10px] font-bold ${bgMode === m ? 'bg-[#4E8E5E] text-white' : 'bg-slate-900 text-slate-450 border border-slate-850'}`}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>

          {bgMode === 'color' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-semibold uppercase">Color Fill</label>
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full h-8 bg-transparent border border-slate-800 cursor-pointer rounded" />
            </div>
          )}

          {bgMode === 'image' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-semibold uppercase">Upload Background</label>
              <label className="btn-secondary cursor-pointer py-1.5 flex items-center justify-center gap-1 text-xs">
                <Upload size={12} /> Choose Image
                <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && setBgImageUrl(URL.createObjectURL(e.target.files[0]))} className="hidden" />
              </label>
            </div>
          )}

          {imageUrl && (
            <button onClick={() => canvasRef.current && triggerDownload(canvasRef.current.toDataURL('image/png'), 'no_bg.png')} className="btn-primary w-full text-xs mt-3 flex items-center justify-center gap-1">
              <Download size={14} /> Download Final Image
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
