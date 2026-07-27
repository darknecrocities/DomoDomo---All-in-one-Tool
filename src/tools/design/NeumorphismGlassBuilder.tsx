import React, { useState, useEffect } from 'react';
import { Layers, Cpu, Sparkles, Copy, Check, RefreshCw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { parseMarkdown } from '../../utils/markdownParser';

export const NeumorphismGlassBuilderTool: React.FC = () => {
  const [bgColor, setBgColor] = useState('#E0E5EC');
  const [size, setSize] = useState(200);
  const [radius, setRadius] = useState(30);
  const [distance, setDistance] = useState(15);
  const [blur, setBlur] = useState(30);
  const [shape, setShape] = useState<'flat' | 'concave' | 'convex' | 'pressed'>('flat');
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

  const hexToRgb = (hex: string) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
      : { r: 224, g: 229, b: 236 };
  };

  const adjustColor = (hex: string, amount: number) => {
    const rgb = hexToRgb(hex);
    const clamp = (val: number) => Math.max(0, Math.min(255, val));
    const r = clamp(rgb.r + amount);
    const g = clamp(rgb.g + amount);
    const b = clamp(rgb.b + amount);
    return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
  };

  const lightColor = adjustColor(bgColor, 30);
  const darkColor = adjustColor(bgColor, -30);

  const shadowCss =
    shape === 'pressed'
      ? `inset ${distance}px ${distance}px ${blur}px ${darkColor}, inset -${distance}px -${distance}px ${blur}px ${lightColor}`
      : `${distance}px ${distance}px ${blur}px ${darkColor}, -${distance}px -${distance}px ${blur}px ${lightColor}`;

  const generatedCss = `background: ${bgColor};
border-radius: ${radius}px;
box-shadow: ${shadowCss};`;

  const copyCss = () => {
    navigator.clipboard.writeText(generatedCss);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunAiArchitect = async () => {
    if (!selectedModel) return;
    setIsGenerating(true);
    setError(null);

    const systemPrompt = `You are a Neumorphic & Soft UI Design Specialist.
Base background color: ${bgColor}, Radius: ${radius}px, Blur: ${blur}px, Shape: ${shape}.
Provide soft UI component layout guidelines, WCAG accessibility contrast advice, and modern CSS glassmorphism overlay snippets.`;

    try {
      const response = await aiService.generateTextOllama(selectedModel, `Synthesize Neumorphic soft UI component design system specs for ${bgColor}`, 2048, systemPrompt);
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
              <h3 className="font-bold text-[#ECEBE9] text-xl">AI Neumorphism & Soft UI Generator</h3>
              <p className="text-[#A3A09B] text-xs mt-1">
                Design soft extruded and inset neumorphic UI components, generate dual light/dark shadows, and synthesize soft UI systems with Local AI.
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
          <h4 className="text-sm font-semibold text-[#ECEBE9]">Neumorphic Parameters</h4>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#A3A09B]">Background Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-[#2A2D30]"
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-2 rounded-lg w-full font-mono uppercase"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#A3A09B]">Shape Type</label>
            <div className="grid grid-cols-2 gap-2">
              {(['flat', 'pressed'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setShape(s)}
                  className={`text-xs p-2 rounded-lg font-semibold capitalize border transition cursor-pointer ${
                    shape === s ? 'bg-[#3C6B4D] text-white border-[#3C6B4D]' : 'bg-[#111213] text-[#ECEBE9] border-[#2A2D30]'
                  }`}
                >
                  {s === 'flat' ? 'Extruded (Raised)' : 'Pressed (Inset)'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#A3A09B]">Size ({size}px)</label>
              <input
                type="range"
                min="100"
                max="300"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="accent-[#3C6B4D] cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#A3A09B]">Border Radius ({radius}px)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="accent-[#3C6B4D] cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#A3A09B]">Distance ({distance}px)</label>
              <input
                type="range"
                min="5"
                max="50"
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                className="accent-[#3C6B4D] cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#A3A09B]">Blur ({blur}px)</label>
              <input
                type="range"
                min="10"
                max="100"
                value={blur}
                onChange={(e) => setBlur(Number(e.target.value))}
                className="accent-[#3C6B4D] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Viewport Preview */}
        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col justify-between text-left relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-[#ECEBE9]">Interactive Soft UI Viewport</span>
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
            className="flex-1 flex items-center justify-center p-8 rounded-xl border border-white/10 min-h-[260px]"
            style={{
              backgroundColor: bgColor,
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'center center',
            }}
          >
            <div
              style={{
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: bgColor,
                borderRadius: `${radius}px`,
                boxShadow: shadowCss,
              }}
              className="flex items-center justify-center font-mono text-xs font-bold transition-all"
            >
              Soft UI Component
            </div>
          </div>
        </div>
      </div>

      {/* Local AI Soft UI Architect */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#3C6B4D]">
            <Sparkles size={18} />
            <h4 className="font-bold text-[#ECEBE9] text-sm">Local AI Soft UI Design Architect</h4>
          </div>
          <button
            onClick={handleRunAiArchitect}
            disabled={isGenerating || !selectedModel}
            className="flex items-center gap-2 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
          >
            {isGenerating ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
            {isGenerating ? 'Synthesizing Spec...' : 'Synthesize Soft UI Spec'}
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
