import React, { useState, useRef, useEffect } from 'react';
import { useTemplateStudio } from './template-studio/useTemplateStudio';
import { LayerPanel } from './template-studio/components/LayerPanel';
import { PropertiesPanel } from './template-studio/components/TextPropertiesPanel';
import { CanvasEditor } from './template-studio/components/CanvasEditor';
import { parseCSV, generateBatchZIP } from './template-studio/utils';
import { PRESET_TEMPLATES } from './template-studio/templates';
import { Upload, Download, Plus, Save, LayoutTemplate, Undo, Redo, ZoomIn, ZoomOut, Maximize, Loader2, Hand, MousePointer2, QrCode, Barcode, Image as ImageIcon, Library, X } from 'lucide-react';
import { triggerBlobDownload } from '../../utils/sharedHelpers';

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
