import React, { useState, useEffect } from 'react';
import { Sparkles, Cpu, Copy, Check, RefreshCw, ZoomIn, ZoomOut, Maximize2, Shuffle, Wand2 } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { parseMarkdown } from '../../utils/markdownParser';

export const BorderRadiusBlobMakerTool: React.FC = () => {
  const [tlX, setTlX] = useState(30);
  const [trX, setTrX] = useState(70);
  const [brX, setBrX] = useState(70);
  const [blX, setBlX] = useState(30);

  const [tlY, setTlY] = useState(30);
  const [trY, setTrY] = useState(30);
  const [brY, setBrY] = useState(70);
  const [blY, setBlY] = useState(70);

  const [fillColor, setFillColor] = useState('#3C6B4D');
  const [size, setSize] = useState(200);
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

  const borderRadiusCss = `${tlX}% ${trX}% ${brX}% ${blX}% / ${tlY}% ${trY}% ${brY}% ${blY}%`;

  const copyCss = () => {
    navigator.clipboard.writeText(`background: ${fillColor};\nborder-radius: ${borderRadiusCss};`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRandomizeBlob = () => {
    const rand = () => Math.floor(Math.random() * 60) + 20;
    setTlX(rand());
    setTrX(rand());
    setBrX(rand());
    setBlX(rand());
    setTlY(rand());
    setTrY(rand());
    setBrY(rand());
    setBlY(rand());
  };

  const handleRunAiBlobArchitect = async () => {
    if (!selectedModel) return;
    setIsGenerating(true);
    setError(null);

    const systemPrompt = `You are an Organic Graphic UI Specialist & CSS Animation Architect.
Current Blob Border Radius: border-radius: ${borderRadiusCss}; Fill: ${fillColor}.
Provide keyframe animation snippet (@keyframes blobMorph) and organic UI shape usage in modern hero sections.`;

    try {
      const response = await aiService.generateTextOllama(selectedModel, `Synthesize organic blob CSS animation code for border-radius: ${borderRadiusCss}`, 2048, systemPrompt);
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
              <Wand2 size={24} />
            </div>
            <div>
              <h3 className="font-bold text-[#ECEBE9] text-xl">AI Organic CSS Blob & Border Radius Generator</h3>
              <p className="text-[#A3A09B] text-xs mt-1">
                Manipulate 8-point organic CSS border-radius coordinates, synthesize fluid morphing keyframes, export CSS code, and prompt Local AI.
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
        {/* Controls */}
        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-5 text-left">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-[#ECEBE9]">8-Point Organic Radius Handles</h4>
            <button
              onClick={handleRandomizeBlob}
              className="flex items-center gap-1.5 text-xs text-[#3C6B4D] hover:underline font-semibold cursor-pointer"
            >
              <Shuffle size={14} />
              Randomize Shape
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#A3A09B]">Top-Left Horizontal ({tlX}%)</label>
              <input type="range" min="10" max="90" value={tlX} onChange={(e) => setTlX(Number(e.target.value))} className="accent-[#3C6B4D] cursor-pointer" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#A3A09B]">Top-Right Horizontal ({trX}%)</label>
              <input type="range" min="10" max="90" value={trX} onChange={(e) => setTrX(Number(e.target.value))} className="accent-[#3C6B4D] cursor-pointer" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#A3A09B]">Bottom-Right Horizontal ({brX}%)</label>
              <input type="range" min="10" max="90" value={brX} onChange={(e) => setBrX(Number(e.target.value))} className="accent-[#3C6B4D] cursor-pointer" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#A3A09B]">Bottom-Left Horizontal ({blX}%)</label>
              <input type="range" min="10" max="90" value={blX} onChange={(e) => setBlX(Number(e.target.value))} className="accent-[#3C6B4D] cursor-pointer" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#A3A09B]">Top-Left Vertical ({tlY}%)</label>
              <input type="range" min="10" max="90" value={tlY} onChange={(e) => setTlY(Number(e.target.value))} className="accent-[#3C6B4D] cursor-pointer" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#A3A09B]">Top-Right Vertical ({trY}%)</label>
              <input type="range" min="10" max="90" value={trY} onChange={(e) => setTrY(Number(e.target.value))} className="accent-[#3C6B4D] cursor-pointer" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#A3A09B]">Bottom-Right Vertical ({brY}%)</label>
              <input type="range" min="10" max="90" value={brY} onChange={(e) => setBrY(Number(e.target.value))} className="accent-[#3C6B4D] cursor-pointer" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#A3A09B]">Bottom-Left Vertical ({blY}%)</label>
              <input type="range" min="10" max="90" value={blY} onChange={(e) => setBlY(Number(e.target.value))} className="accent-[#3C6B4D] cursor-pointer" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#2A2D30]">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#A3A09B]">Blob Dimension ({size}px)</label>
              <input type="range" min="100" max="300" value={size} onChange={(e) => setSize(Number(e.target.value))} className="accent-[#3C6B4D] cursor-pointer" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#A3A09B]">Blob Fill Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fillColor}
                  onChange={(e) => setFillColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-[#2A2D30]"
                />
                <input
                  type="text"
                  value={fillColor}
                  onChange={(e) => setFillColor(e.target.value)}
                  className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-2 rounded-lg w-full font-mono uppercase"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Viewport Preview */}
        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col justify-between text-left relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-[#ECEBE9]">Interactive Blob Viewport</span>
            <div className="flex items-center gap-2">
              <button onClick={copyCss} className="flex items-center gap-1 text-xs text-[#3C6B4D] hover:underline font-semibold cursor-pointer">
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy Radius CSS'}
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
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: fillColor,
                borderRadius: borderRadiusCss,
              }}
              className="shadow-2xl transition-all duration-300 border border-white/20"
            />
          </div>

          <div className="mt-4 pt-4 border-t border-[#2A2D30]">
            <p className="text-[10px] text-[#A3A09B] mb-1 font-semibold">Generated CSS border-radius:</p>
            <p className="bg-[#111213] p-2 rounded-lg font-mono text-[11px] text-[#ECEBE9] truncate border border-[#2A2D30]">
              border-radius: {borderRadiusCss};
            </p>
          </div>
        </div>
      </div>

      {/* Local AI Advisor */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#3C6B4D]">
            <Sparkles size={18} />
            <h4 className="font-bold text-[#ECEBE9] text-sm">Local AI Organic Shape Architect</h4>
          </div>
          <button
            onClick={handleRunAiBlobArchitect}
            disabled={isGenerating || !selectedModel}
            className="flex items-center gap-2 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
          >
            {isGenerating ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
            {isGenerating ? 'Synthesizing Animation...' : 'Synthesize Keyframe Animation'}
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
