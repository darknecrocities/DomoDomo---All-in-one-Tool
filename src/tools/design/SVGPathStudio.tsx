import React, { useState, useEffect } from 'react';
import { PenTool, Cpu, Sparkles, Copy, Check, RefreshCw, ZoomIn, ZoomOut, Maximize2, Download, Code, Wand2 } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { parseMarkdown } from '../../utils/markdownParser';

const SVG_PRESETS = [
  { name: 'Wave', path: 'M 10 80 Q 52.5 10, 95 80 T 180 80' },
  { name: 'Shield', path: 'M 100 20 L 170 50 V 110 C 170 150 100 180 100 180 C 100 180 30 150 30 110 V 50 Z' },
  { name: 'Star', path: 'M 100 20 L 123 70 L 177 75 L 136 112 L 149 165 L 100 137 L 51 165 L 64 112 L 23 75 L 77 70 Z' },
  { name: 'Heart', path: 'M 100 160 C 100 160 30 110 30 65 C 30 40 50 25 75 25 C 90 25 98 35 100 45 C 102 35 110 25 125 25 C 150 25 170 40 170 65 C 170 110 100 160 100 160 Z' },
];

export const SVGPathStudioTool: React.FC = () => {
  const [svgPath, setSvgPath] = useState('M 100 20 L 170 50 V 110 C 170 150 100 180 100 180 C 100 180 30 150 30 110 V 50 Z');
  const [strokeColor, setStrokeColor] = useState('#3C6B4D');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [fillColor, setFillColor] = useState('none');
  const [viewBoxSize, setViewBoxSize] = useState(200);
  const [showGrid, setShowGrid] = useState(true);

  // Dash animation state
  const [isAnimated, setIsAnimated] = useState(false);

  const [zoom, setZoom] = useState(100);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Local AI Prompt State
  const [promptInput, setPromptInput] = useState('');
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

  const rawSvgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" width="100%" height="100%">
  <path
    d="${svgPath}"
    fill="${fillColor}"
    stroke="${strokeColor}"
    stroke-width="${strokeWidth}"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>`;

  const reactTsxComponent = `import React from 'react';

export const IconComponent: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 ${viewBoxSize} ${viewBoxSize}"
    width="24"
    height="24"
    fill="${fillColor}"
    stroke="${strokeColor}"
    strokeWidth="${strokeWidth}"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="${svgPath}" />
  </svg>
);`;

  const copySnippet = (text: string, formatName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(formatName);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handleOptimizePath = () => {
    const minified = svgPath
      .replace(/\s+/g, ' ')
      .replace(/(\d+)\.(\d{3,})/g, '$1.$2')
      .trim();
    setSvgPath(minified);
  };

  const handleDownloadPng = () => {
    const img = new Image();
    const svgBlob = new Blob([rawSvgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1000;
      canvas.height = 1000;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, 1000, 1000);
        const a = document.createElement('a');
        a.download = 'vector_render.png';
        a.href = canvas.toDataURL('image/png');
        a.click();
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleAiSvgStudio = async () => {
    if (!promptInput.trim() || !selectedModel) return;
    setIsGenerating(true);
    setError(null);

    const systemPrompt = `You are a Master SVG & Vector Graphics Code Architect.
Given a user prompt for an icon, shape, or vector element:
1. Output optimized SVG markup with viewBox, fill, stroke, and stroke-width parameters.
2. Provide a fully functional React (TSX) functional component wrapping the SVG.
3. Include CSS stroke-dasharray keyframe animation code for drawing animations.
Format with clean markdown and highlighted code blocks.`;

    try {
      const response = await aiService.generateTextOllama(selectedModel, promptInput, 2048, systemPrompt);
      setAiOutput(response);
    } catch (err: any) {
      setError(err.message || 'Failed to generate SVG code from Local AI.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Parse path tokens
  const commands = svgPath.match(/([a-zA-Z])([^a-zA-Z]*)/g) || [];

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] flex flex-col gap-4 text-left rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/20 p-2.5 rounded-xl">
              <PenTool size={24} />
            </div>
            <div>
              <h3 className="font-bold text-[#ECEBE9] text-xl">AI SVG Component & Vector Code Studio</h3>
              <p className="text-[#A3A09B] text-xs mt-1">
                Edit Bezier path coordinates, optimize decimal precision, synthesize React TSX icon components, build stroke animations, or prompt Local AI.
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

      {/* Preset Selector */}
      <div className="glass-card p-4 border-[#2A2D30] bg-[#18191B] rounded-2xl flex items-center justify-between overflow-x-auto text-left gap-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-[#A3A09B] font-semibold whitespace-nowrap mr-1">Presets:</span>
          {SVG_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => setSvgPath(p.path)}
              className="bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D] text-[#ECEBE9] text-xs px-3 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer"
            >
              {p.name}
            </button>
          ))}
        </div>

        <button
          onClick={handleOptimizePath}
          className="flex items-center gap-1.5 bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D] text-[#3C6B4D] text-xs px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer"
        >
          <Wand2 size={14} />
          Optimize Path
        </button>
      </div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-5 text-left">
          <h4 className="text-sm font-semibold text-[#ECEBE9]">Vector Path & Style Settings</h4>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#A3A09B]">SVG Path 'd' Attribute</label>
            <textarea
              value={svgPath}
              onChange={(e) => setSvgPath(e.target.value)}
              rows={4}
              className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-3 rounded-xl font-mono resize-none focus:outline-none focus:border-[#3C6B4D]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-[#A3A09B]">Stroke Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-[#2A2D30]"
                />
                <input
                  type="text"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                  className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-2 rounded-lg w-full font-mono uppercase"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-[#A3A09B]">Fill Color ('none' or hex)</label>
              <input
                type="text"
                value={fillColor}
                onChange={(e) => setFillColor(e.target.value)}
                className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-2.5 rounded-lg w-full font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#A3A09B]">Stroke Width ({strokeWidth}px)</label>
              <input
                type="range"
                min="1"
                max="20"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="accent-[#3C6B4D] cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#A3A09B]">ViewBox Size ({viewBoxSize}px)</label>
              <input
                type="range"
                min="100"
                max="500"
                step="50"
                value={viewBoxSize}
                onChange={(e) => setViewBoxSize(Number(e.target.value))}
                className="accent-[#3C6B4D] cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#2A2D30]">
            <label className="flex items-center gap-2 text-xs text-[#ECEBE9] cursor-pointer">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="accent-[#3C6B4D] rounded cursor-pointer"
              />
              Show Canvas Grid Overlay
            </label>

            <label className="flex items-center gap-2 text-xs text-[#ECEBE9] cursor-pointer">
              <input
                type="checkbox"
                checked={isAnimated}
                onChange={(e) => setIsAnimated(e.target.checked)}
                className="accent-[#3C6B4D] rounded cursor-pointer"
              />
              Stroke Line Draw Animation
            </label>
          </div>

          {/* Copy Snippet Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => copySnippet(rawSvgMarkup, 'svg')}
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D] text-[#ECEBE9] text-xs py-2 rounded-xl font-semibold transition cursor-pointer"
            >
              {copiedFormat === 'svg' ? <Check size={14} /> : <Copy size={14} />}
              {copiedFormat === 'svg' ? 'Copied SVG' : 'Copy SVG'}
            </button>

            <button
              onClick={() => copySnippet(reactTsxComponent, 'tsx')}
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D] text-[#ECEBE9] text-xs py-2 rounded-xl font-semibold transition cursor-pointer"
            >
              {copiedFormat === 'tsx' ? <Check size={14} /> : <Code size={14} />}
              {copiedFormat === 'tsx' ? 'Copied TSX' : 'Copy React TSX'}
            </button>
          </div>
        </div>

        {/* Viewport Preview */}
        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col justify-between text-left relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-[#ECEBE9]">Interactive Vector Viewport</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPng}
                className="flex items-center gap-1 text-xs text-[#3C6B4D] hover:underline font-semibold cursor-pointer"
                title="Download PNG Render"
              >
                <Download size={14} />
                Export PNG
              </button>
              <div className="flex items-center gap-1 bg-[#111213] border border-[#2A2D30] px-2 py-1 rounded-lg">
                <button
                  onClick={() => setZoom((z) => Math.max(50, z - 10))}
                  className="p-1 text-[#A3A09B] hover:text-[#ECEBE9]"
                  title="Zoom Out"
                >
                  <ZoomOut size={14} />
                </button>
                <span className="text-[10px] text-[#ECEBE9] font-mono w-10 text-center">{zoom}%</span>
                <button
                  onClick={() => setZoom((z) => Math.min(200, z + 10))}
                  className="p-1 text-[#A3A09B] hover:text-[#ECEBE9]"
                  title="Zoom In"
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  onClick={() => setZoom(100)}
                  className="p-1 text-[#A3A09B] hover:text-[#ECEBE9]"
                  title="Reset Zoom"
                >
                  <Maximize2 size={14} />
                </button>
              </div>
            </div>
          </div>

          <div
            className={`flex-1 flex items-center justify-center p-8 bg-[#111213] rounded-xl border border-[#2A2D30] relative overflow-hidden min-h-[260px] ${
              showGrid ? 'bg-[radial-gradient(#2A2D30_1px,transparent_1px)] [background-size:16px_16px]' : ''
            }`}
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'center center',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
              className="w-48 h-48 drop-shadow-lg"
            >
              <path
                d={svgPath}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={isAnimated ? 'animate-pulse' : ''}
              />
            </svg>
          </div>

          {/* Path Commands Breakdown */}
          <div className="mt-4 pt-4 border-t border-[#2A2D30]">
            <p className="text-[10px] text-[#A3A09B] mb-2 font-semibold">Path Commands Breakdown ({commands.length} Nodes)</p>
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
              {commands.map((cmd, idx) => (
                <span key={idx} className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] font-mono text-[10px] px-2 py-0.5 rounded-md">
                  {cmd.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Local AI Vector Studio */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#3C6B4D]">
            <Sparkles size={18} />
            <h4 className="font-bold text-[#ECEBE9] text-sm">Local AI Vector & Icon Architect</h4>
          </div>
          {selectedModel && (
            <span className="text-[10px] bg-[#111213] border border-[#2A2D30] text-[#3C6B4D] px-2 py-0.5 rounded-md font-mono">
              Model: {selectedModel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="Prompt AI (e.g. 'Generate a glowing cybernetic keyhole icon', 'Create a minimalist rocket vector path')..."
            className="flex-1 bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-3 rounded-xl focus:outline-none focus:border-[#3C6B4D]"
          />
          <button
            onClick={handleAiSvgStudio}
            disabled={isGenerating || !promptInput.trim() || !selectedModel}
            className="flex items-center gap-2 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 disabled:opacity-50 text-white text-xs font-semibold px-4 py-3 rounded-xl transition cursor-pointer"
          >
            {isGenerating ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
            {isGenerating ? 'Generating SVG...' : 'Generate SVG Component'}
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
