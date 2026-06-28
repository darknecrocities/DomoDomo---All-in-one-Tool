import React, { useState, useRef, useEffect } from 'react';
import { useTemplateStudio } from './template-studio/useTemplateStudio';
import { LayerPanel } from './template-studio/components/LayerPanel';
import { PropertiesPanel } from './template-studio/components/TextPropertiesPanel';
import { CanvasEditor } from './template-studio/components/CanvasEditor';
import { parseCSV, generateBatchZIP } from './template-studio/utils';
import { PRESET_TEMPLATES } from './template-studio/templates';
import { Upload, Download, Plus, Save, LayoutTemplate, Undo, Redo, ZoomIn, ZoomOut, Maximize, Loader2, Hand, MousePointer2, QrCode, Barcode, Image as ImageIcon, Library, X, Sparkles } from 'lucide-react';
import { triggerBlobDownload } from '../../utils/sharedHelpers';
import Tesseract from 'tesseract.js';

export const TemplateStudioTool = () => {
  const [mode, setMode] = useState<'admin' | 'user'>('admin');
  const {
    template,
    selectedId,
    setSelectedId,
    updateTemplate,
    addLayer,
    updateLayer,
    deleteLayer,
    reorderLayer,
    undo,
    redo,
    canUndo,
    canRedo,
    loadTemplateJSON
  } = useTemplateStudio();

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [canvasMode, setCanvasMode] = useState<'select' | 'hand'>('select');
  const [isPanning, setIsPanning] = useState(false);
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const stageRef = useRef<any>(null);

  // Magic Layers states
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState('');

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in input
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) redo();
        else undo();
        e.preventDefault();
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) {
          deleteLayer(selectedId);
          e.preventDefault();
        }
      }

      if (selectedId) {
        const layer = template.layers.find(l => l.id === selectedId);
        if (layer && !layer.locked) {
          const STEP = e.shiftKey ? 10 : 1;
          if (e.key === 'ArrowUp') updateLayer(selectedId, { y: layer.y - STEP });
          if (e.key === 'ArrowDown') updateLayer(selectedId, { y: layer.y + STEP });
          if (e.key === 'ArrowLeft') updateLayer(selectedId, { x: layer.x - STEP });
          if (e.key === 'ArrowRight') updateLayer(selectedId, { x: layer.x + STEP });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, selectedId, template.layers, deleteLayer, updateLayer]);

  const handleWheel = (e: any) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const scaleBy = 1.05;
      const newScale = e.deltaY > 0 ? scale / scaleBy : scale * scaleBy;
      setScale(Math.max(0.1, Math.min(newScale, 5)));
    } else {
      setOffset(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (canvasMode === 'hand' || e.button === 1 || e.shiftKey) {
      setIsPanning(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPanning) {
      setOffset(prev => ({ x: prev.x + e.movementX, y: prev.y + e.movementY }));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsPanning(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const handleMagicLayersGrab = async () => {
    if (!template.bgImage) return;
    setIsOcrProcessing(true);
    setOcrProgress('Scanning background image for text...');
    
    try {
      // 1. Perform OCR using Tesseract.js
      const result = await Tesseract.recognize(
        template.bgImage,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setOcrProgress(`Extracting text layout: ${Math.round(m.progress * 100)}%`);
            }
          }
        }
      ) as any;

      console.log('Tesseract OCR Result:', result);
      console.log('Detected Text:', result.data.text);
      
      // Filter lines: require minimum confidence (40+) and length (2+ chars)
      const lines = (result.data.lines || []).filter((line: any) => {
        if (!line.text || line.text.trim().length < 2) return false;
        if (typeof line.confidence === 'number' && line.confidence < 40) return false;
        return true;
      });
      
      console.log('Filtered Lines:', lines.length, 'of', (result.data.lines || []).length);
      if (!lines || lines.length === 0) {
        alert(`No text detected in the image (or all text was below confidence threshold).\nFull text: ${result.data.text || 'None'}`);
        setIsOcrProcessing(false);
        return;
      }

      setOcrProgress('Analyzing text colors...');

      // 2. Load the original image into a canvas for analysis
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = template.bgImage;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const bgCanvas = document.createElement('canvas');
      bgCanvas.width = img.width;
      bgCanvas.height = img.height;
      const bgCtx = bgCanvas.getContext('2d');
      if (!bgCtx) throw new Error("Could not initialize canvas context");
      bgCtx.drawImage(img, 0, 0);

      // 3. BEFORE healing: detect text colors from the ORIGINAL image
      //    Uses histogram clustering to separate text pixels from background pixels
      const lineColorData: { textColor: string; bgLuminance: number }[] = [];
      
      lines.forEach((line: any) => {
        const { x0, y0, x1, y1 } = line.bbox;
        const w = Math.max(1, x1 - x0);
        const h = Math.max(1, y1 - y0);
        const sx = Math.max(0, Math.min(bgCanvas.width - 1, x0));
        const sy = Math.max(0, Math.min(bgCanvas.height - 1, y0));
        const sw = Math.min(w, bgCanvas.width - sx);
        const sh = Math.min(h, bgCanvas.height - sy);
        
        let textColor = '#000000';
        let bgLum = 200;
        
        try {
          const imgData = bgCtx.getImageData(sx, sy, sw, sh).data;
          
          // Bucket pixels into "light" and "dark" groups
          const lightPixels: { r: number; g: number; b: number }[] = [];
          const darkPixels: { r: number; g: number; b: number }[] = [];
          
          for (let i = 0; i < imgData.length; i += 16) { // sample every 4th pixel
            const r = imgData[i], g = imgData[i + 1], b = imgData[i + 2];
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            if (lum > 128) {
              lightPixels.push({ r, g, b });
            } else {
              darkPixels.push({ r, g, b });
            }
          }
          
          // The minority group is likely text; the majority is background
          const totalPixels = lightPixels.length + darkPixels.length;
          const textIsLight = lightPixels.length < darkPixels.length;
          const textPixels = textIsLight ? lightPixels : darkPixels;
          const bgPixels = textIsLight ? darkPixels : lightPixels;
          
          // Only trust clustering if there's a meaningful minority (at least 5% text pixels)
          if (textPixels.length > totalPixels * 0.05 && textPixels.length > 0) {
            const avgR = Math.round(textPixels.reduce((s, p) => s + p.r, 0) / textPixels.length);
            const avgG = Math.round(textPixels.reduce((s, p) => s + p.g, 0) / textPixels.length);
            const avgB = Math.round(textPixels.reduce((s, p) => s + p.b, 0) / textPixels.length);
            textColor = `#${avgR.toString(16).padStart(2, '0')}${avgG.toString(16).padStart(2, '0')}${avgB.toString(16).padStart(2, '0')}`;
          } else {
            // Fallback: use contrast against average background
            if (bgPixels.length > 0) {
              const bgR = bgPixels.reduce((s, p) => s + p.r, 0) / bgPixels.length;
              const bgG = bgPixels.reduce((s, p) => s + p.g, 0) / bgPixels.length;
              const bgB = bgPixels.reduce((s, p) => s + p.b, 0) / bgPixels.length;
              bgLum = 0.299 * bgR + 0.587 * bgG + 0.114 * bgB;
            }
            textColor = bgLum > 128 ? '#000000' : '#ffffff';
          }
          
          // Calculate background luminance for later use
          if (bgPixels.length > 0) {
            const bgR = bgPixels.reduce((s, p) => s + p.r, 0) / bgPixels.length;
            const bgG = bgPixels.reduce((s, p) => s + p.g, 0) / bgPixels.length;
            const bgB = bgPixels.reduce((s, p) => s + p.b, 0) / bgPixels.length;
            bgLum = 0.299 * bgR + 0.587 * bgG + 0.114 * bgB;
          }
        } catch (e) {
          console.warn('Color detection failed for line:', line.text, e);
        }
        
        lineColorData.push({ textColor, bgLuminance: bgLum });
      });

      setOcrProgress('Cleaning background (inpainting)...');

      // 4. Gradient-based background inpainting (feathered fill)
      lines.forEach((line: any) => {
        const { x0, y0, x1, y1 } = line.bbox;
        const pad = 6;
        const px0 = Math.max(0, x0 - pad);
        const py0 = Math.max(0, y0 - pad);
        const px1 = Math.min(bgCanvas.width, x1 + pad);
        const py1 = Math.min(bgCanvas.height, y1 + pad);
        const pWidth = px1 - px0;
        const pHeight = py1 - py0;

        if (pWidth <= 0 || pHeight <= 0) return;

        // Sample boundary strips (top, bottom, left, right edges)
        const sampleBoundary = (cx: number, cy: number): [number, number, number] => {
          const clx = Math.max(0, Math.min(bgCanvas.width - 1, Math.round(cx)));
          const cly = Math.max(0, Math.min(bgCanvas.height - 1, Math.round(cy)));
          try {
            const p = bgCtx.getImageData(clx, cly, 1, 1).data;
            return [p[0], p[1], p[2]];
          } catch {
            return [200, 200, 200];
          }
        };

        // Get edge color arrays for interpolation
        const topColors: [number, number, number][] = [];
        const bottomColors: [number, number, number][] = [];
        const leftColors: [number, number, number][] = [];
        const rightColors: [number, number, number][] = [];
        
        const EDGE_SAMPLES = Math.max(4, Math.min(pWidth, 20));
        for (let i = 0; i < EDGE_SAMPLES; i++) {
          const t = i / (EDGE_SAMPLES - 1);
          const edgeX = px0 + t * pWidth;
          topColors.push(sampleBoundary(edgeX, Math.max(0, py0 - 1)));
          bottomColors.push(sampleBoundary(edgeX, Math.min(bgCanvas.height - 1, py1)));
        }
        
        const EDGE_SAMPLES_V = Math.max(4, Math.min(pHeight, 20));
        for (let i = 0; i < EDGE_SAMPLES_V; i++) {
          const t = i / (EDGE_SAMPLES_V - 1);
          const edgeY = py0 + t * pHeight;
          leftColors.push(sampleBoundary(Math.max(0, px0 - 1), edgeY));
          rightColors.push(sampleBoundary(Math.min(bgCanvas.width - 1, px1), edgeY));
        }

        // Bilinear interpolation fill
        const fillData = bgCtx.createImageData(pWidth, pHeight);
        for (let fy = 0; fy < pHeight; fy++) {
          for (let fx = 0; fx < pWidth; fx++) {
            const tx = pWidth > 1 ? fx / (pWidth - 1) : 0.5;
            const ty = pHeight > 1 ? fy / (pHeight - 1) : 0.5;
            
            // Sample from each edge at the corresponding position
            const topIdx = Math.min(Math.floor(tx * (EDGE_SAMPLES - 1)), EDGE_SAMPLES - 1);
            const bottomIdx = Math.min(Math.floor(tx * (EDGE_SAMPLES - 1)), EDGE_SAMPLES - 1);
            const leftIdx = Math.min(Math.floor(ty * (EDGE_SAMPLES_V - 1)), EDGE_SAMPLES_V - 1);
            const rightIdx = Math.min(Math.floor(ty * (EDGE_SAMPLES_V - 1)), EDGE_SAMPLES_V - 1);
            
            const top = topColors[topIdx];
            const bottom = bottomColors[bottomIdx];
            const left = leftColors[leftIdx];
            const right = rightColors[rightIdx];
            
            // Weighted blend: edges closer to a boundary get more weight from that boundary
            const wTop = 1 - ty;
            const wBottom = ty;
            const wLeft = 1 - tx;
            const wRight = tx;
            const totalW = wTop + wBottom + wLeft + wRight;
            
            const idx = (fy * pWidth + fx) * 4;
            fillData.data[idx] = Math.round((top[0] * wTop + bottom[0] * wBottom + left[0] * wLeft + right[0] * wRight) / totalW);
            fillData.data[idx + 1] = Math.round((top[1] * wTop + bottom[1] * wBottom + left[1] * wLeft + right[1] * wRight) / totalW);
            fillData.data[idx + 2] = Math.round((top[2] * wTop + bottom[2] * wBottom + left[2] * wLeft + right[2] * wRight) / totalW);
            fillData.data[idx + 3] = 255;
          }
        }
        
        bgCtx.putImageData(fillData, px0, py0);
      });

      const newBgImage = bgCanvas.toDataURL('image/png');

      setOcrProgress('Mapping text layers...');

      // 5. Create text layers using pre-computed color data
      const newLayers = lines.map((line: any, index: number) => {
        const { x0, y0, x1, y1 } = line.bbox;
        const textWidth = x1 - x0;
        const textHeight = y1 - y0;
        const newId = `text-magic-${Date.now()}-${index}`;
        
        const colorInfo = lineColorData[index] || { textColor: '#000000', bgLuminance: 200 };
        const cleanedText = line.text.trim().replace(/\n+/g, ' ');
        
        // Better font size: use 0.85 multiplier for more accurate Konva rendering
        const estimatedFontSize = Math.max(12, Math.round(textHeight * 0.85));
        
        // Add 30% extra width to prevent Konva text wrapping
        const layerWidth = Math.max(150, Math.round(textWidth * 1.3));

        return {
          id: newId,
          type: 'text' as const,
          name: `Grabbed Text ${index + 1}`,
          x: x0,
          y: y0,
          width: layerWidth,
          height: textHeight > 0 ? textHeight + 8 : 30,
          rotation: 0,
          opacity: 1,
          locked: false,
          visible: true,
          zIndex: template.layers.length + index + 1,
          text: cleanedText || 'Sample Text',
          placeholder: 'Enter text here',
          variableName: `{{GRABBED_VAR_${index + 1}}}`,
          fontFamily: 'Arial',
          fontSize: estimatedFontSize,
          fontWeight: 'normal' as const,
          fontStyle: 'normal' as const,
          textDecoration: 'none' as const,
          fill: colorInfo.textColor,
          backgroundColor: null,
          align: 'left' as const,
          letterSpacing: 0,
          lineHeight: 1.1,
          stroke: null,
          strokeWidth: 0,
          shadowColor: null,
          shadowBlur: 0,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          textTransform: 'none' as const
        };
      });

      updateTemplate((prev) => ({
        ...prev,
        bgImage: newBgImage,
        layers: [...prev.layers, ...newLayers]
      }));

      alert(`✨ Successfully extracted ${newLayers.length} editable text layers!`);
    } catch (err: any) {
      console.error(err);
      alert(`Magic Layers extraction failed: ${err.message || err}`);
    } finally {
      setIsOcrProcessing(false);
      setOcrProgress('');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new window.Image();
      img.src = ev.target?.result as string;
      img.onload = () => {
        updateTemplate(prev => ({
          ...prev,
          bgImage: img.src,
          width: img.width,
          height: img.height
        }));
      };
    };
    reader.readAsDataURL(file);
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        loadTemplateJSON(json);
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await parseCSV(file);
      if (data.length === 0) return alert('CSV is empty');
      
      setIsGenerating(true);
      setProgress(0);
      
      await generateBatchZIP(stageRef, data, (inputs) => setUserInputs(inputs), setProgress);
      
      setIsGenerating(false);
      setProgress(0);
    } catch (err) {
      alert('Error processing CSV');
      setIsGenerating(false);
    }
  };

  const addTextLayer = () => {
    const newId = `text-${Date.now()}`;
    addLayer({
      id: newId,
      type: 'text',
      name: `Text ${template.layers.length + 1}`,
      x: template.width / 2 - 100,
      y: template.height / 2 - 20,
      width: 200,
      height: 40,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: template.layers.length + 1,
      text: 'Sample Text',
      placeholder: 'Enter text here',
      variableName: `{{VAR_${template.layers.length + 1}}}`,
      fontFamily: 'Arial',
      fontSize: 40,
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      fill: '#ffffff',
      backgroundColor: null,
      align: 'center',
      letterSpacing: 0,
      lineHeight: 1,
      stroke: null,
      strokeWidth: 0,
      shadowColor: null,
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      textTransform: 'none'
    });
  };

  const addQRLayer = () => {
    addLayer({
      id: `qr-${Date.now()}`,
      type: 'qr',
      name: `QR Code ${template.layers.length + 1}`,
      x: template.width / 2 - 50,
      y: template.height / 2 - 50,
      width: 100,
      height: 100,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: template.layers.length + 1,
      text: 'https://example.com',
      variableName: `{{QR_${template.layers.length + 1}}}`,
      fgColor: '#000000',
      bgColor: '#ffffff'
    });
  };

  const addBarcodeLayer = () => {
    addLayer({
      id: `barcode-${Date.now()}`,
      type: 'barcode',
      name: `Barcode ${template.layers.length + 1}`,
      x: template.width / 2 - 75,
      y: template.height / 2 - 25,
      width: 150,
      height: 50,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: template.layers.length + 1,
      text: '123456789012',
      variableName: `{{BARCODE_${template.layers.length + 1}}}`,
      format: 'CODE128',
      lineColor: '#000000',
      bgColor: '#ffffff',
      displayValue: true
    });
  };

  const addImageLayer = () => {
    addLayer({
      id: `image-${Date.now()}`,
      type: 'image',
      name: `Image ${template.layers.length + 1}`,
      x: template.width / 2 - 50,
      y: template.height / 2 - 50,
      width: 100,
      height: 100,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: template.layers.length + 1,
      src: null,
      placeholder: 'Placeholder Image',
      variableName: `{{IMG_${template.layers.length + 1}}}`
    });
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    triggerBlobDownload(blob, `${template.name.replace(/\s+/g, '_')}.json`);
  };

  const handleExportImage = (format: 'png' | 'jpeg', quality: number = 1) => {
    if (!stageRef.current) return;
    setSelectedId(null);
    setTimeout(() => {
      const dataURL = stageRef.current.toDataURL({ mimeType: `image/${format}`, quality });
      const link = document.createElement('a');
      link.download = `${template.name}.${format}`;
      link.href = dataURL;
      link.click();
    }, 50);
  };

  const selectedLayer = template.layers.find(l => l.id === selectedId);

  return (
    <div className="flex flex-col h-full bg-[#111213] text-[#ECEBE9] rounded-xl overflow-hidden border border-[#2A2D30]">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between p-3 bg-[#18191B] border-b border-[#2A2D30]">
        <div className="flex items-center gap-4">
          <div className="flex bg-[#0A0B0C] rounded-lg p-1 border border-[#2A2D30]">
            <button onClick={() => { setMode('admin'); setSelectedId(null); }} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${mode === 'admin' ? 'bg-[#3C6B4D] text-white shadow' : 'text-[#72706C] hover:text-[#ECEBE9]'}`}>Admin</button>
            <button onClick={() => { setMode('user'); setSelectedId(null); }} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${mode === 'user' ? 'bg-[#3C6B4D] text-white shadow' : 'text-[#72706C] hover:text-[#ECEBE9]'}`}>User</button>
          </div>
          
          {mode === 'admin' && (
            <div className="flex items-center gap-1 border-l border-[#2A2D30] pl-4">
              <button onClick={undo} disabled={!canUndo} className="p-1.5 rounded hover:bg-[#2A2D30] text-[#A3A09B] disabled:opacity-30"><Undo size={16} /></button>
              <button onClick={redo} disabled={!canRedo} className="p-1.5 rounded hover:bg-[#2A2D30] text-[#A3A09B] disabled:opacity-30"><Redo size={16} /></button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 mr-4 border-r border-[#2A2D30] pr-4">
            <button onClick={() => setCanvasMode('select')} className={`p-1.5 rounded ${canvasMode === 'select' ? 'bg-[#3C6B4D] text-white' : 'hover:bg-[#2A2D30] text-[#A3A09B]'}`} title="Selection Tool"><MousePointer2 size={16} /></button>
            <button onClick={() => setCanvasMode('hand')} className={`p-1.5 rounded ${canvasMode === 'hand' ? 'bg-[#3C6B4D] text-white' : 'hover:bg-[#2A2D30] text-[#A3A09B]'}`} title="Hand Tool (Pan)"><Hand size={16} /></button>
            <div className="w-px h-4 bg-[#2A2D30] mx-1" />
            <button onClick={() => setScale(s => s * 0.9)} className="p-1.5 rounded hover:bg-[#2A2D30] text-[#A3A09B]"><ZoomOut size={16} /></button>
            <span className="text-xs font-mono w-12 text-center">{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale(s => s * 1.1)} className="p-1.5 rounded hover:bg-[#2A2D30] text-[#A3A09B]"><ZoomIn size={16} /></button>
            <button onClick={() => { setScale(1); setOffset({ x: 0, y: 0 }); }} className="p-1.5 rounded hover:bg-[#2A2D30] text-[#A3A09B] ml-1"><Maximize size={16} /></button>
          </div>

          {mode === 'admin' ? (
            <button onClick={handleExportJSON} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2A2D30] hover:bg-[#3A3D40] text-sm font-bold rounded-lg transition-colors">
              <Save size={16} /> Save Template
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => handleExportImage('png')} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2A2D30] hover:bg-[#3A3D40] text-sm font-bold rounded-lg">
                <Download size={16} /> PNG
              </button>
              <button onClick={() => handleExportImage('jpeg', 0.8)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2A2D30] hover:bg-[#3A3D40] text-sm font-bold rounded-lg">
                <Download size={16} /> JPG
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {showGallery && (
          <div className="absolute inset-0 z-50 bg-[#0A0B0C]/90 backdrop-blur-sm flex items-center justify-center p-8">
            <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl w-full max-w-3xl max-h-full flex flex-col shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-[#2A2D30]">
                <h2 className="text-xl font-bold flex items-center gap-2"><Library className="text-[#3C6B4D]" /> Templates Gallery</h2>
                <button onClick={() => setShowGallery(false)} className="p-2 hover:bg-[#2A2D30] rounded-lg text-[#A3A09B]"><X size={20} /></button>
              </div>
              <div className="p-6 overflow-y-auto grid grid-cols-2 gap-4">
                {Object.values(PRESET_TEMPLATES).map(preset => (
                  <div 
                    key={preset.id} 
                    onClick={() => { loadTemplateJSON(preset); setShowGallery(false); }}
                    className="border border-[#2A2D30] bg-[#111213] rounded-xl p-4 cursor-pointer hover:border-[#3C6B4D] hover:bg-[#1E2022] transition-all group"
                  >
                    <div className="w-full h-32 bg-[#0A0B0C] rounded-lg border border-[#2A2D30] mb-4 flex flex-col items-center justify-center text-[#72706C] group-hover:text-[#3C6B4D]">
                      <LayoutTemplate size={32} className="mb-2 opacity-50" />
                      <span className="text-xs font-mono">{preset.width}x{preset.height}</span>
                    </div>
                    <h3 className="font-bold text-md">{preset.name}</h3>
                    <p className="text-xs text-[#A3A09B] mt-1">{preset.layers.length} Layers</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {isGenerating && (
          <div className="absolute inset-0 z-50 bg-[#0A0B0C]/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <Loader2 size={48} className="text-[#3C6B4D] animate-spin mb-4" />
            <h2 className="text-xl font-bold">Generating Batch ZIP...</h2>
            <div className="w-64 h-2 bg-[#2A2D30] rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-[#3C6B4D] transition-all duration-200" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-sm text-[#A3A09B]">{progress}% Complete</p>
          </div>
        )}

        {isOcrProcessing && (
          <div className="absolute inset-0 z-50 bg-[#0A0B0C]/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <Loader2 size={48} className="text-[#3C6B4D] animate-spin mb-4" />
            <h2 className="text-xl font-bold">AI Magic Layers</h2>
            <p className="mt-2 text-sm text-teal-400 font-mono animate-pulse">{ocrProgress}</p>
          </div>
        )}

        {/* Left Sidebar (Admin = Layers, User = Inputs) */}
        <div className="w-72 flex-shrink-0 bg-[#18191B] border-r border-[#2A2D30] p-4 overflow-y-auto custom-scrollbar flex flex-col gap-6">
          {mode === 'admin' ? (
            <>
              <div className="space-y-3">
                <input 
                  type="text" 
                  value={template.name} 
                  onChange={e => updateTemplate(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-transparent font-bold text-lg outline-none border-b border-transparent focus:border-[#3C6B4D]"
                  placeholder="Template Name"
                />
                
                <label className="flex items-center justify-center gap-2 w-full p-3 border border-dashed border-[#3C6B4D]/40 rounded-xl hover:border-[#3C6B4D] hover:bg-[#3C6B4D]/10 cursor-pointer text-[#A3A09B]">
                  <Upload size={16} /> <span className="text-xs font-bold">Upload Background</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>

                {template.bgImage && (
                  <button 
                    onClick={handleMagicLayersGrab} 
                    disabled={isOcrProcessing}
                    className="flex items-center justify-center gap-2 w-full p-2.5 bg-gradient-to-r from-teal-600 to-[#3C6B4D] hover:from-teal-500 hover:to-[#4E8E5E] text-white rounded-xl text-xs font-bold transition-all shadow disabled:opacity-50"
                  >
                    <Sparkles size={14} />
                    <span>AI Magic Layers (Grab Text)</span>
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <label className="flex flex-col items-center justify-center gap-1 w-full p-2 border border-[#2A2D30] rounded-xl hover:bg-[#2A2D30] cursor-pointer text-[#A3A09B]">
                    <LayoutTemplate size={14} /> <span className="text-xs font-bold text-center">Load JSON</span>
                    <input type="file" accept=".json" className="hidden" onChange={handleJsonUpload} />
                  </label>
                  <button onClick={() => setShowGallery(true)} className="flex flex-col items-center justify-center gap-1 w-full p-2 border border-[#3C6B4D] bg-[#3C6B4D]/10 text-[#3C6B4D] rounded-xl hover:bg-[#3C6B4D]/20 cursor-pointer text-xs font-bold">
                    <Library size={14} /> Gallery
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button onClick={addTextLayer} className="py-2 bg-[#2A2D30] hover:bg-[#3A3D40] rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1">
                    <Plus size={14} /> Text
                  </button>
                  <button onClick={addImageLayer} className="py-2 bg-[#2A2D30] hover:bg-[#3A3D40] rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1">
                    <ImageIcon size={14} /> Image
                  </button>
                  <button onClick={addQRLayer} className="py-2 bg-[#2A2D30] hover:bg-[#3A3D40] rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1">
                    <QrCode size={14} /> QR
                  </button>
                  <button onClick={addBarcodeLayer} className="py-2 bg-[#2A2D30] hover:bg-[#3A3D40] rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1">
                    <Barcode size={14} /> Barcode
                  </button>
                </div>
              </div>
              <div className="h-px bg-[#2A2D30]" />
              <LayerPanel 
                layers={template.layers} 
                selectedId={selectedId} 
                onSelect={setSelectedId} 
                onUpdate={updateLayer} 
                onDelete={deleteLayer} 
                onReorder={reorderLayer} 
              />
            </>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col items-center justify-center gap-1 w-full p-2 border border-[#2A2D30] rounded-xl hover:bg-[#2A2D30] cursor-pointer text-[#ECEBE9]">
                  <LayoutTemplate size={16} /> <span className="text-xs font-bold text-center">Load JSON</span>
                  <input type="file" accept=".json" className="hidden" onChange={handleJsonUpload} />
                </label>
                <button onClick={() => setShowGallery(true)} className="flex flex-col items-center justify-center gap-1 w-full p-2 border border-[#3C6B4D] bg-[#3C6B4D]/10 text-[#3C6B4D] rounded-xl hover:bg-[#3C6B4D]/20 cursor-pointer text-xs font-bold">
                  <Library size={16} /> Gallery
                </button>
              </div>

              {template.layers.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-[#E29E2D] border-b border-[#2A2D30] pb-2">Fill Variables</h3>
                  {template.layers.filter(l => l.variableName).map((layer) => {
                    const l = layer as any;
                    return (
                      <div key={l.id} className="space-y-1">
                        <label className="text-xs font-bold text-[#A3A09B]">
                          {l.variableName} 
                          {l.type === 'qr' ? ' (QR Code)' : l.type === 'barcode' ? ' (Barcode)' : l.type === 'image' ? ' (Image URL)' : ''}
                        </label>
                        <input
                          type="text"
                          value={userInputs[l.variableName] ?? (l.text || l.src || '')}
                          onChange={e => setUserInputs(prev => ({ ...prev, [l.variableName]: e.target.value }))}
                          placeholder={l.type === 'image' ? "Paste image URL here" : ""}
                          className="w-full bg-[#0A0B0C] border border-[#2A2D30] rounded-lg p-2 text-sm outline-none focus:border-[#3C6B4D]"
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="h-px bg-[#2A2D30]" />
              
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#3C6B4D]">Batch Processing</h3>
                <p className="text-[10px] text-[#A3A09B]">Upload a CSV file. Headers must map to variables (e.g. "name" for "{"{{name}}"}")</p>
                <label className="flex items-center justify-center gap-2 w-full py-2 bg-[#3C6B4D] hover:bg-[#2E533B] text-white rounded-xl cursor-pointer">
                  <Upload size={14} /> <span className="text-xs font-bold">Upload CSV & Generate ZIP</span>
                  <input type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
                </label>
              </div>
            </div>
          )}
        </div>

        <div 
          className="flex-1 relative overflow-hidden"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{ cursor: canvasMode === 'hand' ? (isPanning ? 'grabbing' : 'grab') : 'default' }}
        >
          <CanvasEditor 
            template={template}
            mode={mode}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onUpdateLayer={updateLayer}
            scale={scale}
            offset={offset}
            onWheel={handleWheel}
            userInputs={userInputs}
            stageRef={stageRef}
            canvasMode={canvasMode}
          />
        </div>

        {/* Right Sidebar (Admin = Properties) */}
        {mode === 'admin' && selectedLayer && (
          <div className="w-72 flex-shrink-0 bg-[#18191B] border-l border-[#2A2D30] p-4 overflow-y-auto custom-scrollbar">
            <h3 className="text-xs font-bold text-[#A3A09B] uppercase tracking-wider mb-4 border-b border-[#2A2D30] pb-2">Properties</h3>
            <PropertiesPanel 
              layer={selectedLayer} 
              onChange={(changes) => updateLayer(selectedLayer.id, changes)} 
            />
          </div>
        )}
      </div>
    </div>
  );
};
