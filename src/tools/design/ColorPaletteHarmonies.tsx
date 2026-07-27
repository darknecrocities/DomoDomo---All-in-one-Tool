import React, { useState, useEffect } from 'react';
import { Palette, Cpu, Sparkles, Copy, Check, RefreshCw, ZoomIn, ZoomOut, Maximize2, Shuffle } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { parseMarkdown } from '../../utils/markdownParser';

export const ColorPaletteHarmoniesTool: React.FC = () => {
  const [baseColor, setBaseColor] = useState('#3C6B4D');
  const [harmonyType, setHarmonyType] = useState<'complementary' | 'analogous' | 'triadic' | 'split' | 'monochromatic'>('complementary');
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

  const hexToHsl = (hex: string) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16) / 255;
      g = parseInt(hex.slice(3, 5), 16) / 255;
      b = parseInt(hex.slice(5, 7), 16) / 255;
    }
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const hslToHex = (h: number, s: number, l: number) => {
    h = (h % 360 + 360) % 360;
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
    const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const generatePalette = () => {
    const { h, s, l } = hexToHsl(baseColor);
    if (harmonyType === 'complementary') {
      return [
        baseColor,
        hslToHex(h + 180, s, l),
        hslToHex(h, Math.max(10, s - 30), Math.min(90, l + 20)),
        hslToHex(h + 180, Math.max(10, s - 20), Math.max(10, l - 20)),
        hslToHex(h, s, Math.max(10, l - 30)),
      ];
    }
    if (harmonyType === 'analogous') {
      return [
        hslToHex(h - 30, s, l),
        hslToHex(h - 15, s, l),
        baseColor,
        hslToHex(h + 15, s, l),
        hslToHex(h + 30, s, l),
      ];
    }
    if (harmonyType === 'triadic') {
      return [
        baseColor,
        hslToHex(h + 120, s, l),
        hslToHex(h + 240, s, l),
        hslToHex(h + 120, s, Math.min(90, l + 20)),
        hslToHex(h + 240, s, Math.max(10, l - 20)),
      ];
    }
    if (harmonyType === 'split') {
      return [
        baseColor,
        hslToHex(h + 150, s, l),
        hslToHex(h + 210, s, l),
        hslToHex(h + 150, s, Math.min(90, l + 20)),
        hslToHex(h + 210, s, Math.max(10, l - 20)),
      ];
    }
    return [
      hslToHex(h, s, Math.max(10, l - 40)),
      hslToHex(h, s, Math.max(20, l - 20)),
      baseColor,
      hslToHex(h, s, Math.min(80, l + 20)),
      hslToHex(h, s, Math.min(95, l + 40)),
    ];
  };

  const palette = generatePalette();

  const tailwindConfigJson = JSON.stringify(
    {
      theme: {
        extend: {
          colors: {
            brand: {
              50: palette[4],
              100: palette[3],
              500: palette[0],
              700: palette[1],
              900: palette[2],
            },
          },
        },
      },
    },
    null,
    2
  );

  const copyConfig = () => {
    navigator.clipboard.writeText(tailwindConfigJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRandomize = () => {
    const randomHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    setBaseColor(randomHex);
  };

  const handleRunAiPaletteAdvisor = async () => {
    if (!selectedModel) return;
    setIsGenerating(true);
    setError(null);

    const systemPrompt = `You are a Principal Color Theorist & Brand Design System Architect.
Base color: ${baseColor}, Harmony rule: ${harmonyType}.
Provide color psychology analysis, UI application guidelines (background, primary buttons, borders, text tokens), and WCAG accessibility pair rules.`;

    try {
      const response = await aiService.generateTextOllama(selectedModel, `Synthesize color palette strategy for ${baseColor} (${harmonyType})`, 2048, systemPrompt);
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
              <Palette size={24} />
            </div>
            <div>
              <h3 className="font-bold text-[#ECEBE9] text-xl">AI Color Palette & Harmony Studio</h3>
              <p className="text-[#A3A09B] text-xs mt-1">
                Calculate color theory harmonies (Complementary, Triadic, Analogous), generate Tailwind theme configs, check contrast swatches, and prompt Local AI.
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
            <h4 className="text-sm font-semibold text-[#ECEBE9]">Base Seed & Harmony Rule</h4>
            <button
              onClick={handleRandomize}
              className="flex items-center gap-1.5 text-xs text-[#3C6B4D] hover:underline font-semibold cursor-pointer"
            >
              <Shuffle size={14} />
              Random Seed
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#A3A09B]">Base Seed Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={baseColor}
                onChange={(e) => setBaseColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-[#2A2D30]"
              />
              <input
                type="text"
                value={baseColor}
                onChange={(e) => setBaseColor(e.target.value)}
                className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-2 rounded-lg w-full font-mono uppercase"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#A3A09B]">Color Harmony Formula</label>
            <select
              value={harmonyType}
              onChange={(e) => setHarmonyType(e.target.value as any)}
              className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-2.5 rounded-lg w-full cursor-pointer"
            >
              <option value="complementary">Complementary (Opposite 180°)</option>
              <option value="analogous">Analogous (Neighboring 30°)</option>
              <option value="triadic">Triadic (Equidistant 120°)</option>
              <option value="split">Split-Complementary (150° / 210°)</option>
              <option value="monochromatic">Monochromatic (Shades & Tints)</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-[#2A2D30]">
            <div className="flex items-center justify-between">
              <label className="text-xs text-[#A3A09B]">Tailwind Config Snippet</label>
              <button onClick={copyConfig} className="text-xs text-[#3C6B4D] hover:underline font-semibold cursor-pointer flex items-center gap-1">
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy JSON'}
              </button>
            </div>
            <pre className="bg-[#111213] p-3 rounded-xl border border-[#2A2D30] font-mono text-[10px] text-[#ECEBE9] overflow-x-auto max-h-32">
              {tailwindConfigJson}
            </pre>
          </div>
        </div>

        {/* Viewport Swatches Preview */}
        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col justify-between text-left relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-[#ECEBE9]">Interactive Color Palette Viewport</span>
            <div className="flex items-center gap-1 bg-[#111213] border border-[#2A2D30] px-2 py-1 rounded-lg">
              <button onClick={() => setZoom((z) => Math.max(50, z - 10))} className="p-1 text-[#A3A09B] hover:text-[#ECEBE9]"><ZoomOut size={14} /></button>
              <span className="text-[10px] text-[#ECEBE9] font-mono w-10 text-center">{zoom}%</span>
              <button onClick={() => setZoom((z) => Math.min(200, z + 10))} className="p-1 text-[#A3A09B] hover:text-[#ECEBE9]"><ZoomIn size={14} /></button>
              <button onClick={() => setZoom(100)} className="p-1 text-[#A3A09B] hover:text-[#ECEBE9]"><Maximize2 size={14} /></button>
            </div>
          </div>

          <div
            className="flex-1 grid grid-cols-5 gap-2 p-4 bg-[#111213] rounded-xl border border-[#2A2D30] min-h-[220px]"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'center center',
            }}
          >
            {palette.map((c, i) => (
              <div
                key={i}
                style={{ backgroundColor: c }}
                className="rounded-xl flex flex-col items-center justify-between p-3 border border-white/10 shadow-lg cursor-pointer hover:scale-105 transition"
                onClick={() => navigator.clipboard.writeText(c)}
                title="Click to copy hex"
              >
                <span className="text-[10px] font-mono font-bold uppercase bg-black/40 text-white px-1.5 py-0.5 rounded">
                  {c}
                </span>
                <span className="text-[9px] font-mono text-white/80 bg-black/40 px-1 py-0.5 rounded">
                  #{i + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Local AI Advisor */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#3C6B4D]">
            <Sparkles size={18} />
            <h4 className="font-bold text-[#ECEBE9] text-sm">Local AI Color Theory & System Advisor</h4>
          </div>
          <button
            onClick={handleRunAiPaletteAdvisor}
            disabled={isGenerating || !selectedModel}
            className="flex items-center gap-2 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
          >
            {isGenerating ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
            {isGenerating ? 'Synthesizing Strategy...' : 'Synthesize Color Strategy'}
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
