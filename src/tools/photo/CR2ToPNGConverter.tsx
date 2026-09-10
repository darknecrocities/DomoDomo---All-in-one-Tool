import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  Download,
  Trash2,
  Camera,
  Archive,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  AlertCircle,
  Sparkles,
  Layers,
  X,
  FileCheck,
  RefreshCw,
} from 'lucide-react';
import JSZip from 'jszip';
import { triggerBlobDownload } from '../../utils/sharedHelpers';
import {
  extractFromCr2Buffer,
  convertCr2JpegToPngBlob,
  type Cr2Metadata,
} from '../../utils/cr2Parser';

export interface Cr2FileItem {
  id: string;
  file: File;
  status: 'queued' | 'extracting' | 'converting' | 'done' | 'error';
  progress: number;
  metadata?: Cr2Metadata;
  pngBlob?: Blob;
  pngUrl?: string;
  width?: number;
  height?: number;
  error?: string;
}

export const CR2ToPNGConverterTool: React.FC = () => {
  const [items, setItems] = useState<Cr2FileItem[]>([]);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [autoOrient, setAutoOrient] = useState(true);
  const [activeInspectId, setActiveInspectId] = useState<string | null>(null);

  // Viewport zoom & pan state for the preview inspector
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      items.forEach((item) => {
        if (item.pngUrl) URL.revokeObjectURL(item.pngUrl);
      });
    };
  }, [items]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(
      (f) =>
        f.name.toLowerCase().endsWith('.cr2') ||
        f.type === 'image/x-canon-cr2' ||
        f.name.toLowerCase().endsWith('.crw')
    );

    if (validFiles.length === 0 && newFiles.length > 0) {
      alert('Please upload Canon RAW files (.CR2 extension).');
      return;
    }

    const newItems: Cr2FileItem[] = validFiles.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      file,
      status: 'queued',
      progress: 0,
    }));

    setItems((prev) => [...prev, ...newItems]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.pngUrl) URL.revokeObjectURL(item.pngUrl);
      return prev.filter((i) => i.id !== id);
    });
    if (activeInspectId === id) {
      setActiveInspectId(null);
    }
  };

  const clearQueue = () => {
    items.forEach((item) => {
      if (item.pngUrl) URL.revokeObjectURL(item.pngUrl);
    });
    setItems([]);
    setActiveInspectId(null);
  };

  const processSingleItem = useCallback(
    async (item: Cr2FileItem): Promise<Cr2FileItem> => {
      try {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, status: 'extracting', progress: 25, error: undefined }
              : i
          )
        );

        const arrayBuffer = await item.file.arrayBuffer();

        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, status: 'converting', progress: 60 } : i
          )
        );

        // 1. Binary TIFF / CR2 parsing and maximum-resolution JPEG stream extraction
        const extraction = extractFromCr2Buffer(arrayBuffer);

        // 2. Lossless conversion to high-quality PNG with exact 1:1 pixel sampling
        const pngResult = await convertCr2JpegToPngBlob(
          extraction.jpegBytes,
          extraction.orientation,
          autoOrient
        );

        const updated: Cr2FileItem = {
          ...item,
          status: 'done',
          progress: 100,
          pngBlob: pngResult.blob,
          pngUrl: pngResult.url,
          width: pngResult.width,
          height: pngResult.height,
          metadata: extraction.metadata,
        };

        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? updated : i))
        );

        return updated;
      } catch (err: any) {
        const errorMsg = err?.message || 'Failed to process CR2 file.';
        const failedItem: Cr2FileItem = {
          ...item,
          status: 'error',
          progress: 0,
          error: errorMsg,
        };
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? failedItem : i))
        );
        return failedItem;
      }
    },
    [autoOrient]
  );

  const handleConvertAll = async () => {
    if (items.length === 0 || isProcessingAll) return;
    setIsProcessingAll(true);

    const queuedItems = items.filter((i) => i.status !== 'done');
    for (const item of queuedItems) {
      await processSingleItem(item);
    }

    setIsProcessingAll(false);
  };

  const handleDownloadSingle = (item: Cr2FileItem) => {
    if (!item.pngBlob || !item.pngUrl) return;
    const baseName = item.file.name.replace(/\.[^/.]+$/, '');
    const outName = `${baseName}_converted.png`;
    triggerBlobDownload(item.pngBlob, outName);
  };

  const handleDownloadAllZip = async () => {
    const completedItems = items.filter((i) => i.status === 'done' && i.pngBlob);
    if (completedItems.length === 0) {
      alert('Please convert at least one CR2 file before downloading.');
      return;
    }

    setIsZipping(true);
    setZipProgress(10);

    try {
      const zip = new JSZip();
      const folder = zip.folder('canon_cr2_png_exports') || zip;

      completedItems.forEach((item) => {
        if (item.pngBlob) {
          const baseName = item.file.name.replace(/\.[^/.]+$/, '');
          folder.file(`${baseName}.png`, item.pngBlob);
        }
      });

      setZipProgress(50);
      const zipBlob = await zip.generateAsync(
        { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
        (meta) => {
          setZipProgress(Math.round(meta.percent));
        }
      );

      setZipProgress(100);
      triggerBlobDownload(zipBlob, 'canon_cr2_converted_pngs.zip');
    } catch (e: any) {
      alert(`Failed to create ZIP package: ${e?.message}`);
    } finally {
      setIsZipping(false);
      setZipProgress(0);
    }
  };

  // Generate a valid mock CR2 buffer for users who want to try the tool without having a raw camera file
  const handleLoadDemoSample = async () => {
    // Create an offscreen canvas to generate a vibrant camera test chart
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1280;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Beautiful camera test scene
    const grad = ctx.createLinearGradient(0, 0, 1920, 1280);
    grad.addColorStop(0, '#0f2027');
    grad.addColorStop(0.5, '#203a43');
    grad.addColorStop(1, '#2c5364');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1920, 1280);

    // Grid lines & aperture circles
    ctx.strokeStyle = '#3C6B4D';
    ctx.lineWidth = 2;
    for (let x = 0; x < 1920; x += 160) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1280);
      ctx.stroke();
    }
    for (let y = 0; y < 1280; y += 160) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1920, y);
      ctx.stroke();
    }

    // Glowing focus ring
    ctx.beginPath();
    ctx.arc(960, 640, 320, 0, Math.PI * 2);
    ctx.strokeStyle = '#4E8E5E';
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.font = 'bold 44px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText('Canon EOS 5D Mark IV - Sample RAW', 960, 610);
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('1920 x 1280 px | 24mm | f/2.8 | 1/250s | ISO 100', 960, 660);

    const jpegBlob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.95));
    const jpegBuf = new Uint8Array(await jpegBlob.arrayBuffer());

    // Build valid CR2 binary container wrapping this high-res JPEG stream
    const totalHeader = 512;
    const cr2Buf = new Uint8Array(totalHeader + jpegBuf.length);

    // TIFF Header: 'II' (Little Endian)
    cr2Buf[0] = 0x49; cr2Buf[1] = 0x49;
    cr2Buf[2] = 42; cr2Buf[3] = 0x00;
    // Offset to IFD0 (16)
    cr2Buf[4] = 16; cr2Buf[5] = 0; cr2Buf[6] = 0; cr2Buf[7] = 0;
    // CR2 Magic 'CR', version 2.0
    cr2Buf[8] = 0x43; cr2Buf[9] = 0x52;
    cr2Buf[10] = 0x02; cr2Buf[11] = 0x00;
    // Raw IFD offset
    cr2Buf[12] = 0; cr2Buf[13] = 0; cr2Buf[14] = 0; cr2Buf[15] = 0;

    const view = new DataView(cr2Buf.buffer);
    let p = 16;
    view.setUint16(p, 4, true); // 4 entries in IFD0
    p += 2;

    // Make: "Canon"
    const makeOffset = 200;
    const makeStr = 'Canon\0';
    for (let i = 0; i < makeStr.length; i++) cr2Buf[makeOffset + i] = makeStr.charCodeAt(i);
    view.setUint16(p, 0x010f, true); view.setUint16(p + 2, 2, true); view.setUint32(p + 4, 6, true); view.setUint32(p + 8, makeOffset, true);
    p += 12;

    // Model: "Canon EOS 5D Mark IV"
    const modelOffset = 220;
    const modelStr = 'Canon EOS 5D Mark IV\0';
    for (let i = 0; i < modelStr.length; i++) cr2Buf[modelOffset + i] = modelStr.charCodeAt(i);
    view.setUint16(p, 0x0110, true); view.setUint16(p + 2, 2, true); view.setUint32(p + 4, modelStr.length, true); view.setUint32(p + 8, modelOffset, true);
    p += 12;

    // StripOffsets (0x0111) -> points to jpegBuf
    view.setUint16(p, 0x0111, true); view.setUint16(p + 2, 4, true); view.setUint32(p + 4, 1, true); view.setUint32(p + 8, totalHeader, true);
    p += 12;

    // StripByteCounts (0x0117) -> length of jpegBuf
    view.setUint16(p, 0x0117, true); view.setUint16(p + 2, 4, true); view.setUint32(p + 4, 1, true); view.setUint32(p + 8, jpegBuf.length, true);
    p += 12;

    view.setUint32(p, 0, true); // next IFD = 0

    // Copy JPEG stream
    cr2Buf.set(jpegBuf, totalHeader);

    const demoFile = new File([cr2Buf], 'sample_canon_5d_mark_iv.cr2', { type: 'image/x-canon-cr2' });
    addFiles([demoFile]);
  };

  // Zoom handlers for DomoDomo Viewport Standards
  const handleZoomIn = () => setZoom((z) => Math.min(4.0, +(z + 0.25).toFixed(2)));
  const handleZoomOut = () => setZoom((z) => Math.max(0.2, +(z - 0.25).toFixed(2)));
  const handleResetZoom = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };
  const handleFitZoom = () => {
    setZoom(0.75);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const activeItem = items.find((i) => i.id === activeInspectId);
  const completedCount = items.filter((i) => i.status === 'done').length;

  return (
    <div className="flex flex-col gap-6 text-left max-w-7xl mx-auto w-full">
      {/* Top Header & Overview */}
      <div className="glass-card p-6 border border-slate-800 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-950/60 via-[#18191B] to-slate-950/60">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-emerald-950/40 rounded-2xl border border-emerald-800/40 text-emerald-400 shadow-lg shadow-emerald-950/30">
            <Camera size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-100">CR2 to PNG Converter</h2>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                High Quality / Zero-Corruption
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Batch convert Canon Raw (.CR2) photos to lossless, maximum-resolution PNG files on your device with ZIP export.
            </p>
          </div>
        </div>

        {/* Quick Demo Button */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleLoadDemoSample}
            className="btn-secondary text-xs flex items-center justify-center gap-1.5 px-3.5 py-2 w-full md:w-auto border-emerald-800/40 text-emerald-300 hover:bg-emerald-950/30"
          >
            <Sparkles size={14} />
            <span>Load Sample CR2</span>
          </button>
          <label className="btn-primary text-xs flex items-center justify-center gap-1.5 px-4 py-2 cursor-pointer w-full md:w-auto">
            <Upload size={14} />
            <span>Add CR2 Files</span>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".cr2,.CR2,image/x-canon-cr2"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Main Grid: Upload & Queue vs Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Upload Zone & Batch Queue */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {items.length === 0 ? (
            /* Empty State / Dropzone */
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="glass-card p-10 border-2 border-dashed border-slate-800 hover:border-emerald-600/50 rounded-2xl flex flex-col items-center justify-center gap-4 text-center transition-all bg-[#18191B]/60 min-h-[360px]"
            >
              <div className="p-4 bg-emerald-950/30 rounded-full border border-emerald-800/40 text-emerald-400">
                <Upload size={36} />
              </div>
              <div className="flex flex-col gap-1 max-w-md">
                <h3 className="text-base font-semibold text-slate-200">
                  Drag & Drop Canon CR2 Files Here
                </h3>
                <p className="text-xs text-slate-400">
                  Supports batch upload for all Canon EOS camera series (Rebel, 5D, 6D, 7D, 80D, 1D). Files process 100% locally in your browser sandbox.
                </p>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <label className="btn-primary text-xs cursor-pointer px-4 py-2">
                  <span>Browse Photos</span>
                  <input
                    type="file"
                    multiple
                    accept=".cr2,.CR2,image/x-canon-cr2"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={handleLoadDemoSample}
                  className="btn-secondary text-xs px-3.5 py-2 text-slate-300"
                >
                  Try Sample Photo
                </button>
              </div>
            </div>
          ) : (
            /* Queue Table */
            <div className="glass-card p-5 border border-slate-800 rounded-2xl flex flex-col gap-4 bg-[#18191B]/80">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Queue ({items.length} {items.length === 1 ? 'file' : 'files'})
                  </span>
                  {completedCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
                      {completedCount} / {items.length} Converted
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-emerald-400 hover:text-emerald-300 cursor-pointer font-medium px-2 py-1 bg-slate-900 border border-slate-800 rounded hover:border-slate-700">
                    + Add More
                    <input
                      type="file"
                      multiple
                      accept=".cr2,.CR2,image/x-canon-cr2"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={clearQueue}
                    className="text-[11px] text-rose-400 hover:text-rose-300 px-2 py-1 bg-slate-900 border border-slate-800 rounded hover:border-slate-700"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="flex flex-col gap-2.5 max-h-[460px] overflow-y-auto pr-1">
                {items.map((item) => {
                  const isDone = item.status === 'done';
                  const isWorking =
                    item.status === 'extracting' || item.status === 'converting';
                  const isErr = item.status === 'error';

                  return (
                    <div
                      key={item.id}
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                        activeInspectId === item.id
                          ? 'border-emerald-500/60 bg-emerald-950/20'
                          : 'border-slate-850 bg-slate-900/40 hover:border-slate-700'
                      }`}
                    >
                      {/* Left side: Thumbnail & Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-14 h-14 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0 relative group">
                          {item.pngUrl ? (
                            <img
                              src={item.pngUrl}
                              alt={item.file.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Camera size={20} className="text-slate-600" />
                          )}
                          {isDone && (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Eye size={16} className="text-white" />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-slate-200 truncate max-w-[200px] sm:max-w-[280px]">
                            {item.file.name}
                          </span>
                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span className="font-mono">{formatFileSize(item.file.size)}</span>
                            {item.width && item.height && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-400 font-mono">
                                  {item.width} × {item.height} ({item.metadata?.megapixels || 'High-Res'})
                                </span>
                              </>
                            )}
                            {item.metadata?.model && (
                              <>
                                <span>•</span>
                                <span className="text-slate-300 truncate max-w-[140px]">
                                  {item.metadata.model}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Progress or error status */}
                          {isWorking && (
                            <div className="flex items-center gap-2 mt-1.5">
                              <div className="w-28 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-emerald-500 h-full transition-all duration-300"
                                  style={{ width: `${item.progress}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-emerald-400 animate-pulse">
                                {item.status === 'extracting'
                                  ? 'Parsing IFD...'
                                  : 'Encoding PNG...'}
                              </span>
                            </div>
                          )}

                          {isErr && (
                            <span className="text-[10px] text-rose-400 flex items-center gap-1 mt-1">
                              <AlertCircle size={10} /> {item.error}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right side: Action buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                        {isDone && (
                          <>
                            <button
                              onClick={() => {
                                setActiveInspectId(item.id);
                                handleResetZoom();
                              }}
                              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 flex items-center gap-1"
                              title="Inspect in High-Res Viewport"
                            >
                              <Eye size={12} />
                              <span className="hidden sm:inline">Preview</span>
                            </button>
                            <button
                              onClick={() => handleDownloadSingle(item)}
                              className="px-2.5 py-1 text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded border border-emerald-600/40 flex items-center gap-1"
                              title="Download Lossless PNG"
                            >
                              <Download size={12} />
                              <span>PNG</span>
                            </button>
                          </>
                        )}

                        {item.status === 'queued' && (
                          <button
                            onClick={() => processSingleItem(item)}
                            className="px-2.5 py-1 text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded border border-emerald-600/40 flex items-center gap-1"
                          >
                            <RefreshCw size={12} />
                            <span>Convert</span>
                          </button>
                        )}

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded transition-colors"
                          title="Remove from queue"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Conversion Controls & Settings */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Action Card */}
          <div className="glass-card p-6 border border-slate-800 rounded-2xl flex flex-col gap-4 bg-[#18191B]/80">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <Layers size={16} /> Batch Operations
            </h3>

            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Total Files:</span>
                <span className="font-mono text-slate-200">{items.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Converted:</span>
                <span className="font-mono text-emerald-400 font-bold">{completedCount}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Output Format:</span>
                <span className="font-mono text-slate-200">PNG (Lossless 24-bit)</span>
              </div>
            </div>

            {/* Conversion Options */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/80">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoOrient}
                  onChange={(e) => setAutoOrient(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/20"
                />
                <span>Auto-orient based on Exif sensor</span>
              </label>
              <p className="text-[10px] text-slate-500 ml-5">
                Automatically rotates portrait camera shots right-side up.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 mt-2">
              <button
                onClick={handleConvertAll}
                disabled={items.length === 0 || isProcessingAll}
                className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-2 font-semibold shadow-lg shadow-emerald-950/40 disabled:opacity-50"
              >
                {isProcessingAll ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Converting Queue...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Convert All to PNG</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadAllZip}
                disabled={completedCount === 0 || isZipping}
                className="btn-secondary w-full text-xs py-2.5 flex items-center justify-center gap-2 border-emerald-800/40 text-emerald-300 hover:bg-emerald-950/30 disabled:opacity-40"
              >
                {isZipping ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Zipping ({zipProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Archive size={14} />
                    <span>Download All as ZIP ({completedCount})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Technical Specs & Zero-Corruption Guarantee */}
          <div className="glass-card p-5 border border-slate-800 rounded-2xl flex flex-col gap-3 bg-slate-950/40 text-xs">
            <h4 className="font-bold text-slate-300 flex items-center gap-1.5">
              <FileCheck size={14} className="text-emerald-400" />
              <span>Zero-Corruption Guarantee</span>
            </h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Unlike generic web converters that re-sample or compress Bayer mosaics, this tool directly extracts the camera's high-resolution DIGIC hardware image stream and converts it losslessly into 24-bit PNG.
            </p>
            <ul className="text-[10px] text-slate-500 space-y-1 list-disc pl-4">
              <li>100% client-side WebAssembly & Canvas engine</li>
              <li>Preserves original camera sensor resolution</li>
              <li>Reads Little-Endian & Big-Endian TIFF IFDs</li>
              <li>Exif orientation auto-correction</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Interactive High-Res Viewport / Inspector (DomoDomo Standard) */}
      {activeItem && activeItem.pngUrl && (
        <div className="glass-card border border-emerald-800/40 rounded-2xl p-6 flex flex-col gap-4 bg-[#18191B]/95 shadow-2xl relative">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-950/40 rounded-lg text-emerald-400 border border-emerald-800/40">
                <Eye size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span>{activeItem.file.name}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-mono">
                    {activeItem.width} × {activeItem.height} ({activeItem.metadata?.megapixels || 'Lossless'})
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {activeItem.metadata?.model || 'Canon EOS Camera'} •{' '}
                  {activeItem.metadata?.iso ? `ISO ${activeItem.metadata.iso}` : ''} •{' '}
                  {activeItem.metadata?.exposureTime || ''} •{' '}
                  {activeItem.metadata?.fNumber || ''} •{' '}
                  {activeItem.metadata?.focalLength || ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownloadSingle(activeItem)}
                className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5"
              >
                <Download size={13} />
                <span>Save PNG</span>
              </button>
              <button
                onClick={() => setActiveInspectId(null)}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
                title="Close Inspector"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Interactive Viewport Canvas Area with Zoom Controls */}
          <div className="relative w-full h-[520px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center select-none">
            {/* Floating Zoom Controls Bar (DomoDomo Standard) */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-xl p-1.5 shadow-xl text-slate-200 text-xs">
              <button
                onClick={handleZoomIn}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-emerald-400 transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-emerald-400 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-emerald-400 transition-colors"
                title="Reset Zoom (100%)"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={handleFitZoom}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-300 hover:text-emerald-400 transition-colors"
                title="Fit to Screen"
              >
                <Maximize2 size={16} />
              </button>
              <div className="h-4 w-[1px] bg-slate-700 mx-1" />
              <span className="font-mono text-[11px] px-2 font-semibold text-emerald-400 min-w-[50px] text-center">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Draggable Viewport Container */}
            <div
              ref={viewportRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className={`w-full h-full flex items-center justify-center overflow-hidden cursor-${
                isDragging ? 'grabbing' : 'grab'
              }`}
            >
              <img
                src={activeItem.pngUrl}
                alt={activeItem.file.name}
                draggable={false}
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                  maxWidth: '90%',
                  maxHeight: '90%',
                  objectFit: 'contain',
                }}
                className="rounded shadow-2xl pointer-events-none"
              />
            </div>

            {/* Bottom Status Pill */}
            <div className="absolute bottom-3 left-4 z-20 flex items-center gap-2 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-full border border-slate-800 text-[10px] text-slate-400 font-mono">
              <span>Drag to pan</span>
              <span>•</span>
              <span>Lossless 1:1 Rendering</span>
            </div>
          </div>

          {/* Exif Metadata Drawer */}
          {activeItem.metadata && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-800/80 text-xs">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Camera</span>
                <span className="text-slate-200 font-medium truncate">
                  {activeItem.metadata.model || 'Canon EOS'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">ISO Speed</span>
                <span className="text-slate-200 font-medium">
                  {activeItem.metadata.iso ? `ISO ${activeItem.metadata.iso}` : 'N/A'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Shutter</span>
                <span className="text-slate-200 font-medium">
                  {activeItem.metadata.exposureTime || 'N/A'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Aperture</span>
                <span className="text-slate-200 font-medium">
                  {activeItem.metadata.fNumber || 'N/A'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Focal Length</span>
                <span className="text-slate-200 font-medium">
                  {activeItem.metadata.focalLength || 'N/A'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Shot Date</span>
                <span className="text-slate-200 font-medium truncate">
                  {activeItem.metadata.dateTime || 'N/A'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
