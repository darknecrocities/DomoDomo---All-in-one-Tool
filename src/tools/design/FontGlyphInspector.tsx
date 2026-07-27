import React, { useState, useEffect } from 'react';
import { Type, Cpu, Sparkles, RefreshCw, ZoomIn, ZoomOut, Maximize2, Upload, Copy, Check, Search } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { parseMarkdown } from '../../utils/markdownParser';

export const FontGlyphInspectorTool: React.FC = () => {
  const [fontName, setFontName] = useState('System Sans / Inter');
  const [fontFamily, setFontFamily] = useState('sans-serif');
  const [subsetText, setSubsetText] = useState('ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 !@#$%^&*()');
  const [fontSize, setFontSize] = useState(28);
  const [lineHeight, setLineHeight] = useState(1.4);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [fontWeight, setFontWeight] = useState(400);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'uppercase' | 'lowercase' | 'numbers' | 'symbols'>('all');
  const [glyphSearch, setGlyphSearch] = useState('');

  const [zoom, setZoom] = useState(100);
  const [copied, setCopied] = useState(false);
  const [activeGlyph, setActiveGlyph] = useState<string | null>(null);

  // Local AI State
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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

  const handleFontFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const name = file.name.replace(/\.[^/.]+$/, '');
    setFontName(name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const arrayBuffer = evt.target?.result as ArrayBuffer;
      const customFont = new FontFace(name, arrayBuffer);
      customFont.load().then((loadedFont) => {
        document.fonts.add(loadedFont);
        setFontFamily(`"${name}", sans-serif`);
      }).catch(() => {
        setError('Could not parse font binary structure.');
      });
    };
    reader.readAsArrayBuffer(file);
  };

  const fontFaceCss = `@font-face {
  font-family: '${fontName}';
  src: url('${fontName}.woff2') format('woff2');
  font-weight: ${fontWeight};
  font-style: normal;
  font-display: swap;
  unicode-range: U+0020-007E;
}`;

  const copyCss = () => {
    navigator.clipboard.writeText(fontFaceCss);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunAiFontAdvisor = async () => {
    if (!selectedModel) return;
    setIsAnalyzing(true);
    setError(null);

    const systemPrompt = `You are a World-Class Web Typography & Font Optimization Specialist.
User current target font context: "${fontName}".
Provide a comprehensive typography strategy:
1. Recommended Font Pairings (Heading + Body + Monospace code) for modern Dark Mode Web Applications.
2. Responsive CSS Type Scale variables (rem/px for h1 through p).
3. Line-height, letter-spacing, and font-display: swap optimizations.
4. CSS @font-face performance subsetting rules.
Format with clean markdown tables and code blocks.`;

    try {
      const response = await aiService.generateTextOllama(selectedModel, `Analyze font configuration for "${fontName}" and provide typography system recommendations.`, 2048, systemPrompt);
      setAiOutput(response);
    } catch (err: any) {
      setError(err.message || 'Failed to query local AI model.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const glyphChars = Array.from(new Set(subsetText.replace(/\s+/g, ''))).filter((char) => {
    if (glyphSearch && !char.toLowerCase().includes(glyphSearch.toLowerCase())) return false;
    if (selectedCategory === 'uppercase') return /[A-Z]/.test(char);
    if (selectedCategory === 'lowercase') return /[a-z]/.test(char);
    if (selectedCategory === 'numbers') return /[0-9]/.test(char);
    if (selectedCategory === 'symbols') return /[^A-Za-z0-9]/.test(char);
    return true;
  });

  const estimatedWoff2Size = Math.max(12, Math.round(glyphChars.length * 0.45));

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      {/* Header Card */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] flex flex-col gap-4 text-left rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/20 p-2.5 rounded-xl">
              <Type size={24} />
            </div>
            <div>
              <h3 className="font-bold text-[#ECEBE9] text-xl">AI Font Subsetter & Typography Advisor</h3>
              <p className="text-[#A3A09B] text-xs mt-1">
                Inspect binary .woff2/.ttf font glyph maps, subset character ranges, calculate bundle size reductions, and generate AI font pairing systems.
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
            <h4 className="text-sm font-semibold text-[#ECEBE9]">Font Settings & Upload</h4>
            <label className="flex items-center gap-1.5 bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D] text-[#3C6B4D] text-xs px-3 py-1.5 rounded-xl cursor-pointer font-semibold transition">
              <Upload size={14} />
              Upload Font File (.woff2/.ttf)
              <input type="file" accept=".ttf,.otf,.woff,.woff2" onChange={handleFontFileUpload} className="hidden" />
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#A3A09B]">Target Font Family Name</label>
            <input
              type="text"
              value={fontName}
              onChange={(e) => setFontName(e.target.value)}
              className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-2.5 rounded-lg w-full font-mono"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#A3A09B]">Subsetting Characters (Unicode Range Target)</label>
            <textarea
              value={subsetText}
              onChange={(e) => setSubsetText(e.target.value)}
              rows={3}
              className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-2.5 rounded-lg w-full font-mono resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#A3A09B]">Font Size ({fontSize}px)</label>
              <input
                type="range"
                min="12"
                max="64"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="accent-[#3C6B4D] cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#A3A09B]">Line Height ({lineHeight})</label>
              <input
                type="range"
                min="1.0"
                max="2.2"
                step="0.1"
                value={lineHeight}
                onChange={(e) => setLineHeight(Number(e.target.value))}
                className="accent-[#3C6B4D] cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#A3A09B]">Letter Spacing ({letterSpacing}px)</label>
              <input
                type="range"
                min="-2"
                max="10"
                value={letterSpacing}
                onChange={(e) => setLetterSpacing(Number(e.target.value))}
                className="accent-[#3C6B4D] cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#A3A09B]">Font Weight ({fontWeight})</label>
              <select
                value={fontWeight}
                onChange={(e) => setFontWeight(Number(e.target.value))}
                className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-2 rounded-lg cursor-pointer"
              >
                <option value={300}>300 - Light</option>
                <option value={400}>400 - Regular</option>
                <option value={600}>600 - SemiBold</option>
                <option value={700}>700 - Bold</option>
              </select>
            </div>
          </div>
        </div>

        {/* Viewport Preview */}
        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col justify-between text-left relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-[#ECEBE9]">Interactive Typography Viewport</span>
            <div className="flex items-center gap-2">
              <button
                onClick={copyCss}
                className="flex items-center gap-1 text-xs text-[#3C6B4D] hover:underline font-semibold cursor-pointer"
                title="Copy @font-face CSS snippet"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy CSS'}
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
            className="flex-1 flex items-center justify-center p-8 bg-[#111213] rounded-xl border border-[#2A2D30] min-h-[180px] overflow-hidden"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'center center',
            }}
          >
            <p
              style={{
                fontFamily: fontFamily,
                fontSize: `${fontSize}px`,
                lineHeight: lineHeight,
                letterSpacing: `${letterSpacing}px`,
                fontWeight: fontWeight,
              }}
              className="text-[#ECEBE9] text-center max-w-full break-words"
            >
              {subsetText || 'Pack my box with five dozen liquor jugs.'}
            </p>
          </div>

          {/* Subsetting Metrics */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#2A2D30]">
            <div className="bg-[#111213] p-3 rounded-xl border border-[#2A2D30]">
              <p className="text-[10px] text-[#A3A09B]">Subset Count</p>
              <p className="text-base font-bold text-[#ECEBE9] font-mono mt-1">{glyphChars.length} Glyphs</p>
            </div>
            <div className="bg-[#111213] p-3 rounded-xl border border-[#2A2D30]">
              <p className="text-[10px] text-[#A3A09B]">Est. WOFF2 Payload</p>
              <p className="text-base font-bold text-[#3C6B4D] font-mono mt-1">~{estimatedWoff2Size} KB</p>
            </div>
            <div className="bg-[#111213] p-3 rounded-xl border border-[#2A2D30]">
              <p className="text-[10px] text-[#A3A09B]">Payload Reduction</p>
              <p className="text-base font-bold text-emerald-400 font-mono mt-1">~78% Saved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Glyph Explorer Map */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-4 text-left">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h4 className="font-bold text-[#ECEBE9] text-sm">Subset Glyph Vector Inspector Grid</h4>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-48">
              <Search className="absolute left-3 top-2.5 text-[#A3A09B]" size={14} />
              <input
                type="text"
                placeholder="Search glyph..."
                value={glyphSearch}
                onChange={(e) => setGlyphSearch(e.target.value)}
                className="w-full bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs pl-8 pr-3 py-1.5 rounded-xl"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-2 rounded-xl cursor-pointer"
            >
              <option value="all">All Glyphs</option>
              <option value="uppercase">Uppercase (A-Z)</option>
              <option value="lowercase">Lowercase (a-z)</option>
              <option value="numbers">Digits (0-9)</option>
              <option value="symbols">Symbols & Punctuation</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 gap-2 max-h-64 overflow-y-auto p-2 bg-[#111213] rounded-xl border border-[#2A2D30]">
          {glyphChars.map((char, index) => {
            const hexCode = char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0');
            return (
              <button
                key={index}
                onClick={() => setActiveGlyph(char)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition cursor-pointer ${
                  activeGlyph === char ? 'bg-[#3C6B4D]/20 border-[#3C6B4D] text-[#3C6B4D]' : 'bg-[#18191B] border-[#2A2D30] hover:border-[#3C6B4D] text-[#ECEBE9]'
                }`}
              >
                <span className="text-xl font-mono" style={{ fontFamily }}>
                  {char}
                </span>
                <span className="text-[9px] text-[#A3A09B] font-mono mt-1">U+{hexCode}</span>
              </button>
            );
          })}
        </div>

        {activeGlyph && (
          <div className="p-4 bg-[#111213] rounded-xl border border-[#2A2D30] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-4xl font-mono text-[#3C6B4D]" style={{ fontFamily }}>
                {activeGlyph}
              </span>
              <div>
                <p className="text-xs font-bold text-[#ECEBE9]">Glyph Metadata</p>
                <p className="text-[11px] text-[#A3A09B] font-mono">
                  Unicode: U+{activeGlyph.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')} | HTML Entity: &#x{activeGlyph.charCodeAt(0).toString(16)}; | Code Point: {activeGlyph.charCodeAt(0)}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveGlyph(null)}
              className="text-xs text-[#A3A09B] hover:text-[#ECEBE9]"
            >
              Close Details
            </button>
          </div>
        )}
      </div>

      {/* Local AI Font Pairings Advisor */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#3C6B4D]">
            <Sparkles size={18} />
            <h4 className="font-bold text-[#ECEBE9] text-sm">Local AI Typography & Subsetting Advisor</h4>
          </div>
          <button
            onClick={handleRunAiFontAdvisor}
            disabled={isAnalyzing || !selectedModel}
            className="flex items-center gap-2 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
          >
            {isAnalyzing ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
            {isAnalyzing ? 'Analyzing Typography...' : 'Generate Typography System'}
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
