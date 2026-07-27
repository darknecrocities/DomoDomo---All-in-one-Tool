import React, { useState, useEffect } from 'react';
import { Sparkles, Cpu, Copy, Check, RefreshCw, ZoomIn, ZoomOut, Maximize2, Download, Shuffle } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { parseMarkdown } from '../../utils/markdownParser';

const MESH_PRESETS = [
  { name: 'Cyberpunk', c1: '#FF0055', c2: '#05050A', c3: '#00F0FF', c4: '#7000FF' },
  { name: 'Sunset Glow', c1: '#FF5E36', c2: '#111213', c3: '#FFAE33', c4: '#E60067' },
  { name: 'Emerald Forest', c1: '#3C6B4D', c2: '#0B140E', c3: '#10B981', c4: '#064E3B' },
  { name: 'Glassmorphism', c1: '#6366F1', c2: '#0F172A', c3: '#EC4899', c4: '#8B5CF6' },
  { name: 'Aurora Borealis', c1: '#00FF87', c2: '#010A15', c3: '#60EFFF', c4: '#0061FF' },
  { name: 'Deep Space', c1: '#1E1B4B', c2: '#030712', c3: '#312E81', c4: '#4C1D95' },
];

export const MeshGradientGeneratorTool: React.FC = () => {
  const [color1, setColor1] = useState('#3C6B4D');
  const [color2, setColor2] = useState('#111213');
  const [color3, setColor3] = useState('#4F46E5');
  const [color4, setColor4] = useState('#EC4899');
  const [blurAmount, setBlurAmount] = useState(40);
  const [glassOpacity, setGlassOpacity] = useState(30);
  const [hasNoise, setHasNoise] = useState(false);

  const [zoom, setZoom] = useState(100);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [isAnimated, setIsAnimated] = useState(false);

  // Natural language AI Prompt
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

  const generatedCss = `background-color: ${color2};
background-image: 
  radial-gradient(at 0% 0%, ${color1} 0px, transparent 50%),
  radial-gradient(at 100% 0%, ${color3} 0px, transparent 50%),
  radial-gradient(at 100% 100%, ${color4} 0px, transparent 50%),
  radial-gradient(at 0% 100%, ${color1} 0px, transparent 50%);
filter: blur(${blurAmount}px);
backdrop-filter: blur(${blurAmount / 2}px);`;

  const animatedCss = `@keyframes meshFluid {
  0% { background-position: 0% 0%; }
  50% { background-position: 100% 100%; }
  100% { background-position: 0% 0%; }
}
.mesh-animated {
  ${generatedCss}
  background-size: 200% 200%;
  animation: meshFluid 10s ease infinite;
}`;

  const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <radialGradient id="grad1" cx="0%" cy="0%" r="70%">
      <stop offset="0%" stop-color="${color1}" />
      <stop offset="100%" stop-color="transparent" />
    </radialGradient>
    <radialGradient id="grad2" cx="100%" cy="0%" r="70%">
      <stop offset="0%" stop-color="${color3}" />
      <stop offset="100%" stop-color="transparent" />
    </radialGradient>
    <radialGradient id="grad3" cx="100%" cy="100%" r="70%">
      <stop offset="0%" stop-color="${color4}" />
      <stop offset="100%" stop-color="transparent" />
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="${color2}" />
  <rect width="100%" height="100%" fill="url(#grad1)" />
  <rect width="100%" height="100%" fill="url(#grad2)" />
  <rect width="100%" height="100%" fill="url(#grad3)" />
</svg>`;

  const copySnippet = (text: string, formatName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(formatName);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handleRandomizeColors = () => {
    const randomHex = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    setColor1(randomHex());
    setColor3(randomHex());
    setColor4(randomHex());
  };

  const handleDownloadPng = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = color2;
    ctx.fillRect(0, 0, 1920, 1080);

    const drawRadial = (x: number, y: number, color: string) => {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, 960);
      grad.addColorStop(0, color);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1920, 1080);
    };

    drawRadial(0, 0, color1);
    drawRadial(1920, 0, color3);
    drawRadial(1920, 1080, color4);
    drawRadial(0, 1080, color1);

    const a = document.createElement('a');
    a.download = 'mesh_gradient_hd.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  const handleApplyPreset = (preset: typeof MESH_PRESETS[0]) => {
    setColor1(preset.c1);
    setColor2(preset.c2);
    setColor3(preset.c3);
    setColor4(preset.c4);
  };

  const handleAiArchitect = async () => {
    if (!promptInput.trim() || !selectedModel) return;
    setIsGenerating(true);
    setError(null);

    const systemPrompt = `You are a UI Design Systems Architect specialized in CSS Mesh Gradients and Glassmorphism.
Given a design description from the user:
1. Four harmonized HSL/Hex color codes for radial mesh focal points.
2. Complete CSS code block for background-image and glass backdrop-filter.
3. Design rationale explaining color psychology and UI context.
Format cleanly with code blocks and markdown.`;

    try {
      const response = await aiService.generateTextOllama(selectedModel, promptInput, 2048, systemPrompt);
      setAiOutput(response);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to Local AI. Check Ollama status.');
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
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="font-bold text-[#ECEBE9] text-xl">AI CSS Glass & Mesh Gradient Architect</h3>
              <p className="text-[#A3A09B] text-xs mt-1">
                Synthesize fluid mesh gradients, glassmorphism cards, animated CSS keyframes, noise textures, 4K PNG/SVG exports, or prompt Local AI.
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

      {/* Preset Bar */}
      <div className="glass-card p-4 border-[#2A2D30] bg-[#18191B] rounded-2xl flex items-center justify-between overflow-x-auto text-left gap-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-[#A3A09B] font-semibold whitespace-nowrap mr-1">Presets:</span>
          {MESH_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => handleApplyPreset(p)}
              className="flex items-center gap-2 bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D] text-[#ECEBE9] text-xs px-3 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer"
            >
              <div className="flex items-center gap-0.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.c1 }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.c3 }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.c4 }} />
              </div>
              <span>{p.name}</span>
            </button>
          ))}
        </div>
        <button
          onClick={handleRandomizeColors}
          className="flex items-center gap-1.5 bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D] text-[#3C6B4D] text-xs px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer"
        >
          <Shuffle size={14} />
          Random Palette
        </button>
      </div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-5 text-left">
          <h4 className="text-sm font-semibold text-[#ECEBE9]">Gradient Swatches & Diffusion Controls</h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#A3A09B]">Top-Left Color</label>
              <input
                type="color"
                value={color1}
                onChange={(e) => setColor1(e.target.value)}
                className="w-full h-10 rounded-lg cursor-pointer bg-transparent border border-[#2A2D30]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#A3A09B]">Base Canvas Color</label>
              <input
                type="color"
                value={color2}
                onChange={(e) => setColor2(e.target.value)}
                className="w-full h-10 rounded-lg cursor-pointer bg-transparent border border-[#2A2D30]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#A3A09B]">Top-Right Color</label>
              <input
                type="color"
                value={color3}
                onChange={(e) => setColor3(e.target.value)}
                className="w-full h-10 rounded-lg cursor-pointer bg-transparent border border-[#2A2D30]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#A3A09B]">Bottom-Right Color</label>
              <input
                type="color"
                value={color4}
                onChange={(e) => setColor4(e.target.value)}
                className="w-full h-10 rounded-lg cursor-pointer bg-transparent border border-[#2A2D30]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#A3A09B]">Mesh Diffusion Blur ({blurAmount}px)</label>
            <input
              type="range"
              min="0"
              max="100"
              value={blurAmount}
              onChange={(e) => setBlurAmount(Number(e.target.value))}
              className="accent-[#3C6B4D] cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#A3A09B]">Glass Card Opacity ({glassOpacity}%)</label>
            <input
              type="range"
              min="5"
              max="80"
              value={glassOpacity}
              onChange={(e) => setGlassOpacity(Number(e.target.value))}
              className="accent-[#3C6B4D] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#2A2D30]">
            <label className="flex items-center gap-2 text-xs text-[#ECEBE9] cursor-pointer">
              <input
                type="checkbox"
                checked={isAnimated}
                onChange={(e) => setIsAnimated(e.target.checked)}
                className="accent-[#3C6B4D] rounded cursor-pointer"
              />
              Fluid Motion Animation (@keyframes)
            </label>

            <label className="flex items-center gap-2 text-xs text-[#ECEBE9] cursor-pointer">
              <input
                type="checkbox"
                checked={hasNoise}
                onChange={(e) => setHasNoise(e.target.checked)}
                className="accent-[#3C6B4D] rounded cursor-pointer"
              />
              Grain / Noise Texture
            </label>
          </div>

          {/* Export Code Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => copySnippet(generatedCss, 'css')}
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D] text-[#ECEBE9] text-xs py-2 rounded-xl font-semibold transition cursor-pointer"
            >
              {copiedFormat === 'css' ? <Check size={14} /> : <Copy size={14} />}
              {copiedFormat === 'css' ? 'Copied CSS' : 'Copy CSS'}
            </button>

            <button
              onClick={() => copySnippet(animatedCss, 'keyframes')}
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D] text-[#ECEBE9] text-xs py-2 rounded-xl font-semibold transition cursor-pointer"
            >
              {copiedFormat === 'keyframes' ? <Check size={14} /> : <Copy size={14} />}
              {copiedFormat === 'keyframes' ? 'Copied Animation' : 'Copy Keyframes'}
            </button>

            <button
              onClick={() => copySnippet(svgMarkup, 'svg')}
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D] text-[#ECEBE9] text-xs py-2 rounded-xl font-semibold transition cursor-pointer"
            >
              {copiedFormat === 'svg' ? <Check size={14} /> : <Copy size={14} />}
              {copiedFormat === 'svg' ? 'Copied SVG' : 'Copy SVG'}
            </button>
          </div>
        </div>

        {/* Viewport Preview */}
        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col justify-between text-left relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-[#ECEBE9]">Interactive Canvas Viewport</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPng}
                className="flex items-center gap-1 text-xs text-[#3C6B4D] hover:underline font-semibold cursor-pointer"
                title="Download 4K PNG"
              >
                <Download size={14} />
                Export 4K PNG
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
            className="flex-1 flex items-center justify-center p-8 rounded-xl transition-all border border-white/10 relative overflow-hidden min-h-[260px]"
            style={{
              backgroundColor: color2,
              backgroundImage: `
                radial-gradient(at 0% 0%, ${color1} 0px, transparent 50%),
                radial-gradient(at 100% 0%, ${color3} 0px, transparent 50%),
                radial-gradient(at 100% 100%, ${color4} 0px, transparent 50%),
                radial-gradient(at 0% 100%, ${color1} 0px, transparent 50%)
              `,
              filter: `blur(${blurAmount / 4}px)`,
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'center center',
            }}
          >
            {hasNoise && (
              <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
            )}

            {/* Floating Glassmorphism Overlay Card */}
            <div
              className="p-6 rounded-2xl border border-white/20 shadow-2xl backdrop-blur-md max-w-xs text-center z-10"
              style={{ backgroundColor: `rgba(255, 255, 255, ${glassOpacity / 100})` }}
            >
              <h5 className="font-bold text-white text-base">Glassmorphism Card</h5>
              <p className="text-white/80 text-xs mt-2">
                Live backdrop filter preview with blur({blurAmount / 2}px).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Local AI Architect */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#3C6B4D]">
            <Sparkles size={18} />
            <h4 className="font-bold text-[#ECEBE9] text-sm">Local AI Mesh Gradient Architect</h4>
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
            placeholder="Describe design theme (e.g. 'Deep sea cybernetic purple neon', 'Warm autumn sunrise')..."
            className="flex-1 bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-3 rounded-xl focus:outline-none focus:border-[#3C6B4D]"
          />
          <button
            onClick={handleAiArchitect}
            disabled={isGenerating || !promptInput.trim() || !selectedModel}
            className="flex items-center gap-2 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 disabled:opacity-50 text-white text-xs font-semibold px-4 py-3 rounded-xl transition cursor-pointer"
          >
            {isGenerating ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
            {isGenerating ? 'Synthesizing...' : 'Synthesize Gradient'}
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
