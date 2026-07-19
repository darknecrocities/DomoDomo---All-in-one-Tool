import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Upload, Download, Plus, Trash2, ZoomIn, ZoomOut, RotateCcw,
  Square, Pentagon, Target, Check, Image as ImageIcon, FileCode
} from 'lucide-react';

interface LabelClass {
  id: string;
  name: string;
  color: string;
}

interface Annotation {
  id: string;
  classId: string;
  type: 'bbox' | 'polygon' | 'keypoint';
  bbox?: [number, number, number, number];
  points?: Array<[number, number]>;
}

interface ImageItem {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  annotations: Annotation[];
}

const DEFAULT_CLASSES: LabelClass[] = [
  { id: '1', name: 'person', color: '#10B981' },
  { id: '2', name: 'car', color: '#3B82F6' },
  { id: '3', name: 'dog', color: '#F59E0B' },
  { id: '4', name: 'defect', color: '#EF4444' },
];

export const BoundingBoxAnnotatorTool: React.FC = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [activeImgIndex, setActiveImgIndex] = useState<number>(0);
  const [classes, setClasses] = useState<LabelClass[]>(DEFAULT_CLASSES);
  const [activeClassId, setActiveClassId] = useState<string>('1');
  const [drawMode, setDrawMode] = useState<'bbox' | 'polygon' | 'keypoint'>('bbox');
  const [selectedAnnoId, setSelectedAnnoId] = useState<string | null>(null);
  
  const [zoom, setZoom] = useState<number>(1);
  const [showCrosshair, setShowCrosshair] = useState<boolean>(true);
  const [newClassName, setNewClassName] = useState<string>('');
  const [newClassColor, setNewClassColor] = useState<string>('#EC4899');
  
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null);
  const [polyPoints, setPolyPoints] = useState<Array<[number, number]>>([]);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentImage = images[activeImgIndex] || null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImages((prev) => [
            ...prev,
            {
              id: Math.random().toString(36).substring(2, 9),
              name: file.name,
              url: event.target?.result as string,
              width: img.width,
              height: img.height,
              annotations: [],
            },
          ]);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const addClass = () => {
    if (!newClassName.trim()) return;
    const newCls: LabelClass = {
      id: Date.now().toString(),
      name: newClassName.trim(),
      color: newClassColor,
    };
    setClasses((prev) => [...prev, newCls]);
    setActiveClassId(newCls.id);
    setNewClassName('');
  };

  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!currentImage) {
      imgRef.current = null;
      return;
    }
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      drawCanvas();
    };
    img.src = currentImage.url;
  }, [currentImage?.url]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentImage || !imgRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = currentImage.width * zoom;
    canvas.height = currentImage.height * zoom;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);

      currentImage.annotations.forEach((anno) => {
        const cls = classes.find((c) => c.id === anno.classId) || { color: '#10B981', name: 'label' };
        const isSelected = anno.id === selectedAnnoId;

        ctx.strokeStyle = cls.color;
        ctx.fillStyle = cls.color + '33';
        ctx.lineWidth = isSelected ? 3 : 2;

        if (anno.type === 'bbox' && anno.bbox) {
          const [nx, ny, nw, nh] = anno.bbox;
          const x = nx * canvas.width;
          const y = ny * canvas.height;
          const w = nw * canvas.width;
          const h = nh * canvas.height;

          ctx.fillRect(x, y, w, h);
          ctx.strokeRect(x, y, w, h);

          ctx.fillStyle = cls.color;
          ctx.fillRect(x, y - 22 > 0 ? y - 22 : y, ctx.measureText(cls.name).width + 12, 20);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 11px sans-serif';
          ctx.fillText(cls.name, x + 6, (y - 22 > 0 ? y - 22 : y) + 14);
        } else if (anno.type === 'polygon' && anno.points && anno.points.length > 0) {
          ctx.beginPath();
          anno.points.forEach(([px, py], i) => {
            const cx = px * canvas.width;
            const cy = py * canvas.height;
            if (i === 0) ctx.moveTo(cx, cy);
            else ctx.lineTo(cx, cy);
          });
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else if (anno.type === 'keypoint' && anno.bbox) {
          const kx = anno.bbox[0] * canvas.width;
          const ky = anno.bbox[1] * canvas.height;
          ctx.beginPath();
          ctx.arc(kx, ky, 6, 0, Math.PI * 2);
          ctx.fillStyle = cls.color;
          ctx.fill();
          ctx.stroke();
        }
      });

      if (isDrawing && startPoint && currentPoint && drawMode === 'bbox') {
        const cls = classes.find((c) => c.id === activeClassId) || { color: '#10B981' };
        const x = Math.min(startPoint.x, currentPoint.x) * canvas.width;
        const y = Math.min(startPoint.y, currentPoint.y) * canvas.height;
        const w = Math.abs(currentPoint.x - startPoint.x) * canvas.width;
        const h = Math.abs(currentPoint.y - startPoint.y) * canvas.height;

        ctx.strokeStyle = cls.color;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(x, y, w, h);
        ctx.setLineDash([]);
      }

      if (drawMode === 'polygon' && polyPoints.length > 0) {
        const cls = classes.find((c) => c.id === activeClassId) || { color: '#10B981' };
        ctx.strokeStyle = cls.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        polyPoints.forEach(([px, py], idx) => {
          const cx = px * canvas.width;
          const cy = py * canvas.height;
          if (idx === 0) ctx.moveTo(cx, cy);
          else ctx.lineTo(cx, cy);
        });
        if (mousePos) {
          ctx.lineTo(mousePos.x * canvas.width, mousePos.y * canvas.height);
        }
        ctx.stroke();
      }

      if (showCrosshair && mousePos) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(mousePos.x * canvas.width, 0);
        ctx.lineTo(mousePos.x * canvas.width, canvas.height);
        ctx.moveTo(0, mousePos.y * canvas.height);
        ctx.lineTo(canvas.width, mousePos.y * canvas.height);
        ctx.stroke();
      }
  }, [currentImage, zoom, classes, selectedAnnoId, isDrawing, startPoint, currentPoint, drawMode, polyPoints, mousePos, showCrosshair, activeClassId]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentImage || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;

    if (drawMode === 'bbox') {
      setIsDrawing(true);
      setStartPoint({ x: nx, y: ny });
      setCurrentPoint({ x: nx, y: ny });
    } else if (drawMode === 'polygon') {
      setPolyPoints((prev) => [...prev, [nx, ny]]);
    } else if (drawMode === 'keypoint') {
      const newAnno: Annotation = {
        id: Date.now().toString(),
        classId: activeClassId,
        type: 'keypoint',
        bbox: [nx, ny, 0.02, 0.02],
      };
      setImages((prev) =>
        prev.map((img, idx) =>
          idx === activeImgIndex ? { ...img, annotations: [...img.annotations, newAnno] } : img
        )
      );
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const nx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const ny = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setMousePos({ x: nx, y: ny });

    if (isDrawing && drawMode === 'bbox') {
      setCurrentPoint({ x: nx, y: ny });
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && startPoint && currentPoint && drawMode === 'bbox') {
      setIsDrawing(false);
      const x = Math.min(startPoint.x, currentPoint.x);
      const y = Math.min(startPoint.y, currentPoint.y);
      const w = Math.abs(currentPoint.x - startPoint.x);
      const h = Math.abs(currentPoint.y - startPoint.y);

      if (w > 0.01 && h > 0.01) {
        const newAnno: Annotation = {
          id: Date.now().toString(),
          classId: activeClassId,
          type: 'bbox',
          bbox: [x, y, w, h],
        };
        setImages((prev) =>
          prev.map((img, idx) =>
            idx === activeImgIndex ? { ...img, annotations: [...img.annotations, newAnno] } : img
          )
        );
      }
      setStartPoint(null);
      setCurrentPoint(null);
    }
  };

  const finishPolygon = () => {
    if (polyPoints.length >= 3) {
      const newAnno: Annotation = {
        id: Date.now().toString(),
        classId: activeClassId,
        type: 'polygon',
        points: polyPoints,
      };
      setImages((prev) =>
        prev.map((img, idx) =>
          idx === activeImgIndex ? { ...img, annotations: [...img.annotations, newAnno] } : img
        )
      );
    }
    setPolyPoints([]);
  };

  const removeAnnotation = (id: string) => {
    setImages((prev) =>
      prev.map((img, idx) =>
        idx === activeImgIndex
          ? { ...img, annotations: img.annotations.filter((a) => a.id !== id) }
          : img
      )
    );
  };

  const exportYOLO = () => {
    if (!currentImage) return;
    const lines: string[] = [];
    currentImage.annotations.forEach((anno) => {
      const clsIdx = classes.findIndex((c) => c.id === anno.classId);
      const classId = clsIdx >= 0 ? clsIdx : 0;
      if (anno.type === 'bbox' && anno.bbox) {
        const [x, y, w, h] = anno.bbox;
        const cx = (x + w / 2).toFixed(6);
        const cy = (y + h / 2).toFixed(6);
        lines.push(`${classId} ${cx} ${cy} ${w.toFixed(6)} ${h.toFixed(6)}`);
      } else if (anno.type === 'polygon' && anno.points) {
        const pts = anno.points.map(([px, py]) => `${px.toFixed(6)} ${py.toFixed(6)}`).join(' ');
        lines.push(`${classId} ${pts}`);
      }
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${currentImage.name.replace(/\.[^/.]+$/, '')}.txt`;
    link.click();
  };

  const exportCOCO = () => {
    if (!currentImage) return;
    const cocoData = {
      images: [
        {
          id: 1,
          file_name: currentImage.name,
          width: currentImage.width,
          height: currentImage.height,
        },
      ],
      categories: classes.map((c, idx) => ({ id: idx + 1, name: c.name })),
      annotations: currentImage.annotations.map((anno, idx) => {
        const clsIdx = classes.findIndex((c) => c.id === anno.classId) + 1;
        if (anno.type === 'bbox' && anno.bbox) {
          const [x, y, w, h] = anno.bbox;
          const px = x * currentImage.width;
          const py = y * currentImage.height;
          const pw = w * currentImage.width;
          const ph = h * currentImage.height;
          return {
            id: idx + 1,
            image_id: 1,
            category_id: clsIdx,
            bbox: [px, py, pw, ph],
            area: pw * ph,
            iscrowd: 0,
          };
        }
        return { id: idx + 1, image_id: 1, category_id: clsIdx, segmentation: anno.points || [] };
      }),
    };

    const blob = new Blob([JSON.stringify(cocoData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${currentImage.name.replace(/\.[^/.]+$/, '')}_coco.json`;
    link.click();
  };

  const downloadRenderedImage = () => {
    const canvas = canvasRef.current;
    if (!canvas || !currentImage) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `annotated_${currentImage.name}`;
    link.click();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-110px)] bg-[#111213] text-[#ECEBE9] rounded-2xl overflow-hidden border border-[#2A2D30]">
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#18191B] border-b border-[#2A2D30]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#3C6B4D]/20 text-[#3C6B4D] rounded-xl border border-[#3C6B4D]/30">
            <Square size={20} />
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-wide text-[#ECEBE9]">Bounding Box & Polygon Image Annotator</h2>
            <p className="text-xs text-[#72706C]">Label multi-class objects, polygons, and keypoints with client-side YOLO/COCO export</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-3 py-1.5 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 text-[#ECEBE9] rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-md">
            <Upload size={14} />
            <span>Upload Images</span>
            <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>

          {currentImage && (
            <>
              <button
                onClick={exportYOLO}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E2022] hover:bg-[#2A2D30] border border-[#2A2D30] text-xs font-semibold rounded-xl text-[#ECEBE9] transition-all"
              >
                <FileCode size={14} className="text-[#3C6B4D]" />
                <span>Export YOLO</span>
              </button>
              <button
                onClick={exportCOCO}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E2022] hover:bg-[#2A2D30] border border-[#2A2D30] text-xs font-semibold rounded-xl text-[#ECEBE9] transition-all"
              >
                <FileCode size={14} className="text-[#E29E2D]" />
                <span>Export COCO JSON</span>
              </button>
              <button
                onClick={downloadRenderedImage}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3C6B4D]/20 hover:bg-[#3C6B4D]/40 border border-[#3C6B4D]/40 text-xs font-semibold rounded-xl text-[#3C6B4D] transition-all"
              >
                <Download size={14} />
                <span>Download Overlay PNG</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-[#141517] border-r border-[#2A2D30] flex flex-col p-4 gap-4 overflow-y-auto">
          <div>
            <span className="text-xs font-bold text-[#72706C] uppercase tracking-wider block mb-2">Annotation Mode</span>
            <div className="grid grid-cols-3 gap-1.5 bg-[#18191B] p-1 rounded-xl border border-[#2A2D30]">
              <button
                onClick={() => setDrawMode('bbox')}
                className={`flex flex-col items-center py-2 rounded-lg text-xs font-semibold transition-all ${
                  drawMode === 'bbox' ? 'bg-[#3C6B4D] text-white shadow-sm' : 'text-[#72706C] hover:text-[#ECEBE9]'
                }`}
              >
                <Square size={14} className="mb-1" />
                Box
              </button>
              <button
                onClick={() => setDrawMode('polygon')}
                className={`flex flex-col items-center py-2 rounded-lg text-xs font-semibold transition-all ${
                  drawMode === 'polygon' ? 'bg-[#3C6B4D] text-white shadow-sm' : 'text-[#72706C] hover:text-[#ECEBE9]'
                }`}
              >
                <Pentagon size={14} className="mb-1" />
                Polygon
              </button>
              <button
                onClick={() => setDrawMode('keypoint')}
                className={`flex flex-col items-center py-2 rounded-lg text-xs font-semibold transition-all ${
                  drawMode === 'keypoint' ? 'bg-[#3C6B4D] text-white shadow-sm' : 'text-[#72706C] hover:text-[#ECEBE9]'
                }`}
              >
                <Target size={14} className="mb-1" />
                Point
              </button>
            </div>
            {drawMode === 'polygon' && polyPoints.length > 0 && (
              <button
                onClick={finishPolygon}
                className="w-full mt-2 py-1.5 bg-[#3C6B4D] text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                <Check size={14} /> Finish Polygon ({polyPoints.length} pts)
              </button>
            )}
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#72706C] uppercase tracking-wider">Classes ({classes.length})</span>
            </div>
            <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
              {classes.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setActiveClassId(cls.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                    activeClassId === cls.id
                      ? 'bg-[#1E2022] border-[#3C6B4D] text-white shadow-sm'
                      : 'bg-[#18191B] border-[#2A2D30] text-[#A3A09B] hover:border-[#3C6B4D]/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: cls.color }} />
                    <span>{cls.name}</span>
                  </div>
                  {activeClassId === cls.id && <Check size={12} className="text-[#3C6B4D]" />}
                </button>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-[#2A2D30] space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New label name..."
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="flex-1 bg-[#18191B] border border-[#2A2D30] rounded-xl px-2.5 py-1.5 text-xs text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D]"
                />
                <input
                  type="color"
                  value={newClassColor}
                  onChange={(e) => setNewClassColor(e.target.value)}
                  className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-[#2A2D30]"
                />
              </div>
              <button
                onClick={addClass}
                className="w-full py-1.5 bg-[#1E2022] hover:bg-[#2A2D30] border border-[#2A2D30] text-xs font-semibold text-[#ECEBE9] rounded-xl flex items-center justify-center gap-1 transition-all"
              >
                <Plus size={14} /> Add Class
              </button>
            </div>
          </div>
        </div>

        <div ref={containerRef} className="flex-1 bg-[#0D0E0F] relative overflow-auto flex items-center justify-center p-6 min-h-[400px]">
          {currentImage && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#18191B]/90 backdrop-blur-md p-1.5 rounded-xl border border-[#2A2D30] z-20 shadow-xl">
              <button
                onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))))}
                className="p-1.5 hover:bg-[#2A2D30] rounded-lg text-[#72706C] hover:text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <span className="text-xs font-mono text-[#A3A09B] px-1">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom((z) => Math.min(3, Number((z + 0.25).toFixed(2))))}
                className="p-1.5 hover:bg-[#2A2D30] rounded-lg text-[#72706C] hover:text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="p-1.5 hover:bg-[#2A2D30] rounded-lg text-[#72706C] hover:text-white transition-colors"
                title="Reset Zoom"
              >
                <RotateCcw size={14} />
              </button>
              <div className="w-[1px] h-4 bg-[#2A2D30] mx-0.5" />
              <button
                onClick={() => setShowCrosshair((prev) => !prev)}
                className={`p-1.5 rounded-lg transition-colors ${
                  showCrosshair ? 'bg-[#3C6B4D] text-white' : 'text-[#72706C] hover:bg-[#2A2D30]'
                }`}
                title="Toggle Crosshair Guide"
              >
                <Target size={14} />
              </button>
            </div>
          )}

          {currentImage ? (
            <div 
              className="relative border border-[#2A2D30] rounded-xl overflow-hidden shadow-2xl bg-[#141517] transition-transform duration-150 ease-out origin-center"
              style={{ transform: `scale(${zoom})` }}
            >
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className="cursor-crosshair block max-w-full max-h-[75vh] object-contain"
              />
            </div>
          ) : (
            <div className="text-center p-12 max-w-md border-2 border-dashed border-[#2A2D30] rounded-3xl bg-[#141517]/50">
              <div className="w-16 h-16 rounded-2xl bg-[#3C6B4D]/10 text-[#3C6B4D] flex items-center justify-center mx-auto mb-4 border border-[#3C6B4D]/20">
                <ImageIcon size={32} />
              </div>
              <h3 className="text-base font-bold text-[#ECEBE9] mb-1">No Image Selected</h3>
              <p className="text-xs text-[#72706C] mb-6">Upload single or multiple image files to start bounding box and polygon annotation.</p>
              <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 text-[#ECEBE9] rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-lg shadow-[#3C6B4D]/20">
                <Upload size={14} />
                <span>Select Images</span>
                <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          )}
        </div>

        <div className="w-72 bg-[#141517] border-l border-[#2A2D30] flex flex-col p-4 gap-4 overflow-y-auto">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#72706C] uppercase tracking-wider">
                Labels ({currentImage?.annotations.length || 0})
              </span>
            </div>
            <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
              {currentImage?.annotations.map((anno) => {
                const cls = classes.find((c) => c.id === anno.classId) || { name: 'Unknown', color: '#888' };
                return (
                  <div
                    key={anno.id}
                    onClick={() => setSelectedAnnoId(anno.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs border transition-all cursor-pointer ${
                      selectedAnnoId === anno.id
                        ? 'bg-[#1E2022] border-[#3C6B4D] text-white shadow-sm'
                        : 'bg-[#18191B] border-[#2A2D30] text-[#A3A09B] hover:border-[#3C6B4D]/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cls.color }} />
                      <span className="font-semibold truncate">{cls.name}</span>
                      <span className="text-[10px] text-[#72706C] uppercase bg-[#111213] px-1.5 py-0.5 rounded border border-[#2A2D30]">
                        {anno.type}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeAnnotation(anno.id);
                      }}
                      className="p-1 text-[#72706C] hover:text-[#EF4444] transition-colors"
                      title="Delete Label"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="h-44 pt-3 border-t border-[#2A2D30] flex flex-col">
            <span className="text-xs font-bold text-[#72706C] uppercase tracking-wider mb-2">
              Queue ({images.length})
            </span>
            <div className="grid grid-cols-3 gap-2 overflow-y-auto flex-1 pr-1">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImgIndex(idx)}
                  className={`relative rounded-xl overflow-hidden border-2 aspect-square transition-all ${
                    activeImgIndex === idx ? 'border-[#3C6B4D] ring-2 ring-[#3C6B4D]/30' : 'border-[#2A2D30] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                  {img.annotations.length > 0 && (
                    <span className="absolute bottom-1 right-1 bg-[#3C6B4D] text-white text-[9px] font-bold px-1 rounded">
                      {img.annotations.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
