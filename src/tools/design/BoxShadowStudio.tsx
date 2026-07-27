import React, { useState, useEffect } from 'react';
import { Layers, Cpu, Sparkles, Copy, Check, RefreshCw, ZoomIn, ZoomOut, Maximize2, Plus, Trash2 } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { parseMarkdown } from '../../utils/markdownParser';

interface ShadowLayer {
  id: string;
  inset: boolean;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
}

export const BoxShadowStudioTool: React.FC = () => {
  const [layers, setLayers] = useState<ShadowLayer[]>([
    { id: '1', inset: false, x: 0, y: 10, blur: 25, spread: -5, color: '#000000', opacity: 0.5 },
    { id: '2', inset: false, x: 0, y: 4, blur: 10, spread: -2, color: '#3C6B4D', opacity: 0.3 },
  ]);
  const [boxBg, setBoxBg] = useState('#18191B');
  const [borderRadius, setBorderRadius] = useState(16);
  const [zoom, setZoom] = useState(100);
  const [copied, setCopied] = useState(false);

  // Local AI State
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      const { status, models } = await aiService.checkOllama();
      if (status && models.length > 0) {
        setModels(models);
        const saved = aiService.getSelectedOllamaModel();
        if (saved && models.includes(saved)) {
          setSelectedModel(saved);
        } else {
          setSelectedModel(models[0]);
        }
      }
    };
    fetchModels();
  }, []);

  const hexToRgba = (hex: string, alpha: number) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return `rgba(0, 0, 0, ${alpha})`;
    return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`;
  };

  const shadowCss = layers
    .map(
      (l) =>
        `${l.inset ? 'inset ' : ''}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${hexToRgba(l.color, l.opacity)}`
    )
    .join(', ');

  const fullCss = `box-shadow: ${shadowCss};
border-radius: ${borderRadius}px;`;

  const copyCss = () => {
    navigator.clipboard.writeText(fullCss);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddLayer = () => {
    setLayers((prev) => [
      ...prev,
      { id: String(Date.now()), inset: false, x: 0, y: 15, blur: 30, spread: 0, color: '#000000', opacity: 0.2 },
    ]);
  };

  const handleRemoveLayer = (id: string) => {
    if (layers.length > 1) {
      setLayers((prev) => prev.filter((l) => l.id !== id));
    }
  };

  const handleRunAiShadowAdvisor = async () => {
    if (!selectedModel) return;
    setIsGenerating(true);
    setError(null);

    const systemPrompt = `You are a Senior UI Lighting & Elevation Architect.
Provide layered elevation shadow system recommendations (SM, MD, LG, XL, 2XL) for dark mode web apps using HSL/RGBA key + ambient shadows.`;

    try {
      const response = await aiService.generateTextOllama(selectedModel, 'Synthesize multi-layer shadow system for dark mode cards', 2048, systemPrompt);
      setAiOutput(response);
    } catch (err: any) {
      setError(err.message || 'Failed to query local AI model.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] flex flex-col gap-4 text-left rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/20 p-2.5 rounded-xl">
              <Layers size={24} />
            </div>
            <div>
              <h3 className="font-bold text-[#ECEBE9] text-xl">AI Multi-Layer CSS Shadow & Elevation Studio</h3>
              <p className="text-[#A3A09B] text-xs mt-1">
                Compose multi-layer ambient and key shadows, build realistic natural elevation steps, and synthesize lighting systems with Local AI.
              </p>
            </div>
          </div>
          {models.length > 0 && (
            <div className="flex items-center gap-2 bg-[#111213] p-2 rounded-xl border border-[#2A2D30]">
              <Cpu size={16} className="text-[#3C6B4D]" />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-transparent text-xs text-[#ECEBE9] focus:outline-none cursor-pointer"
              >
                {models.map((m) => (
                  <option key={m} value={m} className="bg-[#18191B] text-[#ECEBE9]">
                    {m}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Layer Controls */}
        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-4 text-left">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-[#ECEBE9]">Shadow Layers ({layers.length})</h4>
            <button
              onClick={handleAddLayer}
              className="flex items-center gap-1 bg-[#3C6B4D] text-white text-xs px-3 py-1.5 rounded-xl font-semibold hover:bg-[#3C6B4D]/80 transition cursor-pointer"
            >
              <Plus size={14} />
              Add Shadow Layer
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#A3A09B]">Container Background</label>
              <div className="flex items-center gap-2">
                <input type="color" value={boxBg} onChange={(e) => setBoxBg(e.target.value)} className="w-6 h-6 rounded bg-transparent cursor-pointer" />
                <input type="text" value={boxBg} onChange={(e) => setBoxBg(e.target.value)} className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-1.5 rounded font-mono uppercase w-full" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#A3A09B]">Border Radius ({borderRadius}px)</label>
              <input type="range" min="0" max="50" value={borderRadius} onChange={(e) => setBorderRadius(Number(e.target.value))} className="accent-[#3C6B4D] cursor-pointer" />
            </div>
          </div>

          <div className="flex flex-col gap-4 max-h-[360px] overflow-y-auto pr-1">
            {layers.map((l, idx) => (
              <div key={l.id} className="bg-[#111213] p-4 rounded-xl border border-[#2A2D30] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#3C6B4D]">Layer #{idx + 1}</span>
                  {layers.length > 1 && (
                    <button onClick={() => handleRemoveLayer(l.id)} className="text-xs text-rose-400 hover:underline">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-[#A3A09B]">Offset X ({l.x}px)</label>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={l.x}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setLayers((prev) => prev.map((item) => (item.id === l.id ? { ...item, x: val } : item)));
                      }}
                      className="accent-[#3C6B4D] cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-[#A3A09B]">Offset Y ({l.y}px)</label>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={l.y}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setLayers((prev) => prev.map((item) => (item.id === l.id ? { ...item, y: val } : item)));
                      }}
                      className="accent-[#3C6B4D] cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-[#A3A09B]">Blur ({l.blur}px)</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={l.blur}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setLayers((prev) => prev.map((item) => (item.id === l.id ? { ...item, blur: val } : item)));
                      }}
                      className="accent-[#3C6B4D] cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-[#A3A09B]">Spread ({l.spread}px)</label>
                    <input
                      type="range"
                      min="-20"
                      max="50"
                      value={l.spread}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setLayers((prev) => prev.map((item) => (item.id === l.id ? { ...item, spread: val } : item)));
                      }}
                      className="accent-[#3C6B4D] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Viewport Preview */}
        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col justify-between text-left relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-[#ECEBE9]">Interactive Shadow Viewport</span>
            <div className="flex items-center gap-2">
              <button onClick={copyCss} className="flex items-center gap-1 text-xs text-[#3C6B4D] hover:underline font-semibold cursor-pointer">
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy CSS'}
              </button>
              <div className="flex items-center gap-1 bg-[#111213] border border-[#2A2D30] px-2 py-1 rounded-lg">
                <button onClick={() => setZoom((z) => Math.max(50, z - 10))} className="p-1 text-[#A3A09B] hover:text-[#ECEBE9]"><ZoomOut size={14} /></button>
                <span className="text-[10px] text-[#ECEBE9] font-mono w-10 text-center">{zoom}%</span>
                <button onClick={() => setZoom((z) => Math.min(200, z + 10))} className="p-1 text-[#A3A09B] hover:text-[#ECEBE9]"><ZoomIn size={14} /></button>
                <button onClick={() => setZoom(100)} className="p-1 text-[#A3A09B] hover:text-[#ECEBE9]"><Maximize2 size={14} /></button>
              </div>
            </div>
          </div>

          <div
            className="flex-1 flex items-center justify-center p-8 bg-[#111213] rounded-xl border border-[#2A2D30] min-h-[260px]"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'center center',
            }}
          >
            <div
              style={{
                width: '180px',
                height: '180px',
                backgroundColor: boxBg,
                borderRadius: `${borderRadius}px`,
                boxShadow: shadowCss,
              }}
              className="flex items-center justify-center font-mono text-xs text-[#ECEBE9] font-bold border border-[#2A2D30]"
            >
              Elevation Card
            </div>
          </div>
        </div>
      </div>

      {/* Local AI Advisor */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#3C6B4D]">
            <Sparkles size={18} />
            <h4 className="font-bold text-[#ECEBE9] text-sm">Local AI Shadow System Advisor</h4>
          </div>
          <button
            onClick={handleRunAiShadowAdvisor}
            disabled={isGenerating || !selectedModel}
            className="flex items-center gap-2 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
          >
            {isGenerating ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
            {isGenerating ? 'Synthesizing...' : 'Synthesize Elevation Tokens'}
          </button>
        </div>

        {error && <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">{error}</div>}

        {aiOutput && (
          <div
            className="bg-[#111213] p-5 rounded-xl border border-[#2A2D30] text-[#ECEBE9] text-xs leading-relaxed overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(aiOutput) }}
          />
        )}
      </div>
    </div>
  );
};
