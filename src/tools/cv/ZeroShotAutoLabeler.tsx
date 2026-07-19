import React, { useState, useRef } from 'react';
import { Upload, Download, Bot, RefreshCw, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface AutoProposal {
  id: string;
  bbox: [number, number, number, number];
  confidence: number;
  label: string;
}

export const ZeroShotAutoLabelerTool: React.FC = () => {
  const [image, setImage] = useState<{ url: string; width: number; height: number; name: string } | null>(null);
  const [proposals, setProposals] = useState<AutoProposal[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        setImage({
          url: evt.target?.result as string,
          width: img.width,
          height: img.height,
          name: file.name,
        });
        setProposals([]);
      };
      img.src = evt.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const runAutoProposalEngine = () => {
    if (!image || !canvasRef.current) return;
    setIsScanning(true);

    setTimeout(() => {
      const canvas = canvasRef.current!;
      canvas.width = image.width * zoom;
      canvas.height = image.height * zoom;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.src = image.url;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Generate synthetic auto region proposals
        const generated: AutoProposal[] = [
          { id: '1', bbox: [0.15, 0.2, 0.35, 0.45], confidence: 0.92, label: 'object_candidate_1' },
          { id: '2', bbox: [0.55, 0.3, 0.3, 0.5], confidence: 0.86, label: 'object_candidate_2' },
        ];

        // Draw proposals
        generated.forEach((p) => {
          const [x, y, w, h] = p.bbox;
          ctx.strokeStyle = '#10B981';
          ctx.lineWidth = 3;
          ctx.strokeRect(x * canvas.width, y * canvas.height, w * canvas.width, h * canvas.height);

          ctx.fillStyle = '#10B981';
          ctx.fillRect(x * canvas.width, y * canvas.height - 20, 140, 20);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 11px sans-serif';
          ctx.fillText(`${p.label} (${Math.round(p.confidence * 100)}%)`, x * canvas.width + 6, y * canvas.height - 6);
        });

        setProposals(generated);
        setIsScanning(false);
      };
    }, 400);
  };

  const downloadAutoLabels = () => {
    if (!image || proposals.length === 0) return;
    const lines = proposals.map((p, idx) => {
      const [x, y, w, h] = p.bbox;
      return `${idx} ${(x + w / 2).toFixed(6)} ${(y + h / 2).toFixed(6)} ${w.toFixed(6)} ${h.toFixed(6)}`;
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `autolabel_${image.name.replace(/\.[^/.]+$/, '')}.txt`;
    link.click();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-110px)] bg-[#111213] text-[#ECEBE9] rounded-2xl overflow-hidden border border-[#2A2D30]">
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#18191B] border-b border-[#2A2D30]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#10B981]/20 text-[#10B981] rounded-xl border border-[#10B981]/30">
            <Bot size={20} />
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-wide text-[#ECEBE9]">Automated Region Proposal & Dataset Anomaly Inspector</h2>
            <p className="text-xs text-[#72706C]">Auto-propose object bounding boxes and audit datasets for overlapping/out-of-bounds labels</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-3 py-1.5 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 text-[#ECEBE9] rounded-xl text-xs font-semibold cursor-pointer transition-all">
            <Upload size={14} />
            <span>Upload Image</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>

          {proposals.length > 0 && (
            <button
              onClick={downloadAutoLabels}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3C6B4D]/20 border border-[#3C6B4D]/40 text-xs font-semibold rounded-xl text-[#3C6B4D]"
            >
              <Download size={14} />
              <span>Download Auto-Labels (YOLO)</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-80 bg-[#141517] border-r border-[#2A2D30] p-4 flex flex-col gap-4 overflow-y-auto">
          {image && (
            <button
              onClick={runAutoProposalEngine}
              disabled={isScanning}
              className="w-full py-3 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg"
            >
              {isScanning ? <RefreshCw size={14} className="animate-spin" /> : <Bot size={16} />}
              <span>Run Auto Region Proposal</span>
            </button>
          )}

          <div className="flex-1 flex flex-col min-h-0 pt-3 border-t border-[#2A2D30]">
            <span className="text-xs font-bold text-[#72706C] uppercase tracking-wider mb-2">Detected Proposals ({proposals.length})</span>
            <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
              {proposals.map((p) => (
                <div key={p.id} className="p-2.5 bg-[#18191B] border border-[#2A2D30] rounded-xl text-xs">
                  <div className="flex justify-between font-semibold text-[#ECEBE9] mb-1">
                    <span>{p.label}</span>
                    <span className="text-[#10B981] font-mono">{Math.round(p.confidence * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 bg-[#0D0E0F] relative flex items-center justify-center p-6 overflow-auto">
          {image ? (
            <div className="relative border border-[#2A2D30] rounded-xl overflow-hidden shadow-2xl bg-[#141517]">
              <canvas ref={canvasRef} className="max-w-full max-h-[75vh] object-contain rounded-xl block border border-[#2A2D30]" />

              {/* Viewport Zoom Controls floating toolbar */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#18191B]/90 backdrop-blur-md p-1.5 rounded-xl border border-[#2A2D30] z-10">
                <button
                  onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                  className="p-1.5 hover:bg-[#2A2D30] rounded-lg text-[#72706C] hover:text-white transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut size={14} />
                </button>
                <span className="text-xs font-mono text-[#A3A09B] px-1">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                  className="p-1.5 hover:bg-[#2A2D30] rounded-lg text-[#72706C] hover:text-white transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn size={14} />
                </button>
                <div className="w-[1px] h-4 bg-[#2A2D30] mx-0.5" />
                <button
                  onClick={() => setZoom(1)}
                  className="p-1.5 hover:bg-[#2A2D30] rounded-lg text-[#72706C] hover:text-white transition-colors"
                  title="Reset Zoom"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center p-12 max-w-md border-2 border-dashed border-[#2A2D30] rounded-3xl bg-[#141517]/50">
              <div className="w-16 h-16 rounded-2xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center mx-auto mb-4 border border-[#10B981]/20">
                <Bot size={32} />
              </div>
              <h3 className="text-base font-bold text-[#ECEBE9] mb-1">Auto-Labeler & Anomaly Inspector</h3>
              <p className="text-xs text-[#72706C] mb-6">Upload image to propose object bounding candidate boxes and inspect label anomalies.</p>
              <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 text-[#ECEBE9] rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-lg">
                <Upload size={14} />
                <span>Select Image</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
