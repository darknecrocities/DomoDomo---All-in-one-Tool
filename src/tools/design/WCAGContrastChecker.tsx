import React, { useState, useEffect, useRef } from 'react';
import { Palette, Cpu, CheckCircle2, ShieldAlert, Sparkles, RefreshCw, ZoomIn, ZoomOut, Maximize2, Download, Wand2, Grid, Copy, Check } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { parseMarkdown } from '../../utils/markdownParser';

export const WCAGContrastCheckerTool: React.FC = () => {
  const [fgColor, setFgColor] = useState('#FFFFFF');
  const [bgColor, setBgColor] = useState('#111213');
  const [fontSize, setFontSize] = useState(16);
  const [isBold, setIsBold] = useState(false);
  const [sampleText, setSampleText] = useState('Accessible design builds better experiences for everyone.');
  const [visionFilter, setVisionFilter] = useState<'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia'>('normal');

  // Palette Matrix State
  const [palette, setPalette] = useState<string[]>(['#111213', '#18191B', '#3C6B4D', '#A3A09B', '#FFFFFF']);
  const [copiedCss, setCopiedCss] = useState(false);

  // Zoom controls for canvas viewport preview
  const [zoom, setZoom] = useState(100);
  const previewRef = useRef<HTMLDivElement>(null);

  // Local AI State
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
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

  // Calculate Luminance
  const getLuminance = (hex: string) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const hexToRgb = (hex: string) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('');
  };

  const getContrastRatio = (c1: string, c2: string) => {
    const l1 = getLuminance(c1);
    const l2 = getLuminance(c2);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };

  // APCA (Advanced Perceptual Contrast Algorithm) estimated score
  const getApcaScore = (txtHex: string, bgHex: string) => {
    const lTxt = getLuminance(txtHex);
    const lBg = getLuminance(bgHex);
    const diff = Math.abs(Math.pow(lBg, 0.56) - Math.pow(lTxt, 0.57)) * 100;
    return Math.round(diff);
  };

  const ratio = getContrastRatio(fgColor, bgColor);
  const contrastRatio = ratio.toFixed(2);
  const apcaScore = getApcaScore(fgColor, bgColor);

  const passesAASmall = ratio >= 4.5;
  const passesAAASmall = ratio >= 7.0;
  const passesAALarge = ratio >= 3.0;

  // Auto-Fixer: Finds nearest AAA compliant foreground color
  const handleAutoFixAaa = () => {
    const bgLum = getLuminance(bgColor);
    const rgb = hexToRgb(fgColor) || { r: 255, g: 255, b: 255 };

    if (bgLum < 0.5) {
      let r = rgb.r, g = rgb.g, b = rgb.b;
      while (r < 255 || g < 255 || b < 255) {
        r = Math.min(255, r + 15);
        g = Math.min(255, g + 15);
        b = Math.min(255, b + 15);
        const hex = rgbToHex(r, g, b);
        const rat = getContrastRatio(hex, bgColor);
        if (rat >= 7.0) {
          setFgColor(hex);
          break;
        }
      }
    } else {
      let r = rgb.r, g = rgb.g, b = rgb.b;
      while (r > 0 || g > 0 || b > 0) {
        r = Math.max(0, r - 15);
        g = Math.max(0, g - 15);
        b = Math.max(0, b - 15);
        const hex = rgbToHex(r, g, b);
        const rat = getContrastRatio(hex, bgColor);
        if (rat >= 7.0) {
          setFgColor(hex);
          break;
        }
      }
    }
  };

  const handleCopyCssVariables = () => {
    const css = `:root {
  --color-foreground: ${fgColor};
  --color-background: ${bgColor};
  --contrast-ratio: ${contrastRatio}:1;
  --wcag-compliance: ${passesAAASmall ? 'AAA' : passesAASmall ? 'AA' : 'Fail'};
}`;
    navigator.clipboard.writeText(css);
    setCopiedCss(true);
    setTimeout(() => setCopiedCss(false), 2000);
  };

  const handleDownloadReport = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 800, 400);

    ctx.fillStyle = fgColor;
    ctx.font = `${isBold ? 'bold' : 'normal'} ${fontSize * 1.5}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(sampleText, 400, 180);

    ctx.fillStyle = fgColor;
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`WCAG 2.1: ${contrastRatio}:1 | APCA Lc: ${apcaScore} | ${passesAAASmall ? 'AAA Passed' : passesAASmall ? 'AA Passed' : 'Fail'}`, 400, 320);

    const a = document.createElement('a');
    a.download = `wcag_contrast_report_${contrastRatio}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  const handleRunAiAudit = async () => {
    if (!selectedModel) return;
    setIsAnalyzing(true);
    setError(null);

    const systemPrompt = `You are a WCAG 2.1 & 3.0 APCA Accessibility Specialist.
FG: ${fgColor}, BG: ${bgColor}, Contrast Ratio: ${contrastRatio}:1, APCA Score: Lc ${apcaScore}.
Text style: ${fontSize}px (${isBold ? 'Bold' : 'Regular'}).
Provide a comprehensive accessibility audit:
1. WCAG 2.1 AA/AAA compliance breakdown for normal, large text, and UI components.
2. APCA (Advanced Perceptual Contrast Algorithm) readability evaluation.
3. Colorblindness usability under Protanopia, Deuteranopia, Tritanopia, and Achromatopsia.
4. CSS hex code recommendations to pass AAA compliance if failing.
5. ARIA and high-contrast theme recommendations.
Format with clean markdown tables and bullet points.`;

    try {
      const prompt = `Perform an accessibility audit for FG: ${fgColor}, BG: ${bgColor}, Contrast Ratio: ${contrastRatio}:1. Sample Text: "${sampleText}"`;
      const response = await aiService.generateTextOllama(selectedModel, prompt, 2048, systemPrompt);
      setAiAnalysis(response);
    } catch (err: any) {
      setError(err.message || 'Failed to generate AI audit. Ensure Ollama is running locally.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      {/* Header Card */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] flex flex-col gap-4 text-left rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/20 p-2.5 rounded-xl">
              <Palette size={24} />
            </div>
            <div>
              <h3 className="font-bold text-[#ECEBE9] text-xl">AI WCAG Contrast & Accessibility Auditor</h3>
              <p className="text-[#A3A09B] text-xs mt-1">
                Evaluate text-to-background contrast against WCAG 2.1 & APCA standards, audit multi-color palette contrast matrices, simulate vision deficiencies, and run Local AI audits.
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
            <h4 className="text-sm font-semibold text-[#ECEBE9]">Color & Typography Settings</h4>
            <button
              onClick={handleAutoFixAaa}
              className="flex items-center gap-1.5 text-xs text-[#3C6B4D] hover:underline font-semibold cursor-pointer"
              title="Auto-adjust foreground color to achieve AAA contrast"
            >
              <Wand2 size={14} />
              1-Click AAA Auto-Fix
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-[#A3A09B]">Text (Foreground)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-[#2A2D30]"
                />
                <input
                  type="text"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-2 rounded-lg w-full font-mono uppercase"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-[#A3A09B]">Background</label>
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
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#A3A09B]">Sample Text Content</label>
            <input
              type="text"
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-2.5 rounded-lg w-full"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-xs text-[#A3A09B]">Font Size ({fontSize}px)</label>
              <input
                type="range"
                min="12"
                max="48"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="accent-[#3C6B4D] cursor-pointer"
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-[#ECEBE9] cursor-pointer">
              <input
                type="checkbox"
                checked={isBold}
                onChange={(e) => setIsBold(e.target.checked)}
                className="accent-[#3C6B4D] rounded cursor-pointer"
              />
              Bold Weight
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#A3A09B]">Vision Simulation Filter</label>
            <select
              value={visionFilter}
              onChange={(e) => setVisionFilter(e.target.value as any)}
              className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-2.5 rounded-lg w-full cursor-pointer"
            >
              <option value="normal">Normal Vision</option>
              <option value="protanopia">Protanopia (Red-Blind)</option>
              <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
              <option value="tritanopia">Tritanopia (Blue-Blind)</option>
              <option value="achromatopsia">Achromatopsia (Monochrome)</option>
            </select>
          </div>
        </div>

        {/* Viewport Preview */}
        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col justify-between text-left relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-[#ECEBE9]">Interactive Viewport Preview</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCssVariables}
                className="flex items-center gap-1 text-xs text-[#3C6B4D] hover:underline cursor-pointer font-semibold"
                title="Copy CSS variables"
              >
                {copiedCss ? <Check size={14} /> : <Copy size={14} />}
                {copiedCss ? 'Copied' : 'Copy CSS'}
              </button>
              <button
                onClick={handleDownloadReport}
                className="flex items-center gap-1 text-xs text-[#3C6B4D] hover:underline cursor-pointer font-semibold"
                title="Download PNG Contrast Card"
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
            ref={previewRef}
            className="flex-1 flex items-center justify-center p-8 rounded-xl transition-all border border-white/10 min-h-[160px]"
            style={{
              backgroundColor: bgColor,
              filter:
                visionFilter === 'protanopia'
                  ? 'url(#protanopia)'
                  : visionFilter === 'deuteranopia'
                  ? 'url(#deuteranopia)'
                  : visionFilter === 'tritanopia'
                  ? 'url(#tritanopia)'
                  : visionFilter === 'achromatopsia'
                  ? 'grayscale(100%)'
                  : 'none',
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'center center',
            }}
          >
            <p
              style={{
                color: fgColor,
                fontSize: `${fontSize}px`,
                fontWeight: isBold ? 'bold' : 'normal',
              }}
              className="text-center leading-relaxed max-w-full break-words"
            >
              {sampleText}
            </p>
          </div>

          {/* SVG Filters */}
          <svg className="hidden">
            <defs>
              <filter id="protanopia">
                <feColorMatrix type="matrix" values="0.56667 0.43333 0 0 0 0.55833 0.44167 0 0 0 0 0.24167 0.75833 0 0 0 0 0 1 0" />
              </filter>
              <filter id="deuteranopia">
                <feColorMatrix type="matrix" values="0.625 0.375 0 0 0 0.7 0.3 0 0 0 0 0.3 0.7 0 0 0 0 0 1 0" />
              </filter>
              <filter id="tritanopia">
                <feColorMatrix type="matrix" values="0.95 0.05 0 0 0 0 0.43333 0.56667 0 0 0 0.475 0.525 0 0 0 0 0 1 0" />
              </filter>
            </defs>
          </svg>

          {/* Compliance Scores */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#2A2D30]">
            <div className="bg-[#111213] p-3 rounded-xl border border-[#2A2D30] flex flex-col justify-between">
              <p className="text-[10px] text-[#A3A09B]">WCAG 2.1 Ratio</p>
              <p className="text-base font-bold text-[#ECEBE9] font-mono mt-1">{contrastRatio} : 1</p>
              <span className={`mt-1 text-[10px] font-bold ${passesAAASmall ? 'text-emerald-400' : passesAASmall ? 'text-amber-400' : 'text-rose-400'}`}>
                {passesAAASmall ? 'AAA Pass' : passesAASmall ? 'AA Pass' : 'Fail'}
              </span>
            </div>

            <div className="bg-[#111213] p-3 rounded-xl border border-[#2A2D30] flex flex-col justify-between">
              <p className="text-[10px] text-[#A3A09B]">APCA Contrast Score</p>
              <p className="text-base font-bold text-[#ECEBE9] font-mono mt-1">Lc {apcaScore}</p>
              <span className={`mt-1 text-[10px] font-bold ${apcaScore >= 75 ? 'text-emerald-400' : apcaScore >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                {apcaScore >= 75 ? 'Body Text OK' : apcaScore >= 60 ? 'Large Text' : 'Low Readability'}
              </span>
            </div>

            <div className="bg-[#111213] p-3 rounded-xl border border-[#2A2D30] flex flex-col justify-between">
              <p className="text-[10px] text-[#A3A09B]">WCAG Verdict</p>
              <p className="text-xs font-bold text-[#ECEBE9] mt-1">
                {passesAAASmall ? 'WCAG AAA' : passesAASmall ? 'WCAG AA' : 'Non-Compliant'}
              </p>
              <div className="mt-1 flex items-center gap-1">
                {passesAASmall ? <CheckCircle2 className="text-emerald-400" size={14} /> : <ShieldAlert className="text-rose-400" size={14} />}
                <span className="text-[10px] text-[#A3A09B]">{passesAALarge ? 'UI Pass' : 'UI Fail'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Contrast Matrix */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#3C6B4D]">
            <Grid size={18} />
            <h4 className="font-bold text-[#ECEBE9] text-sm">Palette Cross-Contrast Audit Matrix</h4>
          </div>
          <span className="text-xs text-[#A3A09B]">Interactive $5 \times 5$ Pairwise Evaluation</span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {palette.map((c, i) => (
            <div key={i} className="flex items-center gap-2 bg-[#111213] p-2 rounded-xl border border-[#2A2D30]">
              <input
                type="color"
                value={c}
                onChange={(e) => {
                  const updated = [...palette];
                  updated[i] = e.target.value;
                  setPalette(updated);
                }}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-none"
              />
              <input
                type="text"
                value={c}
                onChange={(e) => {
                  const updated = [...palette];
                  updated[i] = e.target.value;
                  setPalette(updated);
                }}
                className="bg-transparent text-[11px] text-[#ECEBE9] font-mono uppercase focus:outline-none w-full"
              />
            </div>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2A2D30]">
                <th className="p-2 text-[#A3A09B]">BG \ Text</th>
                {palette.map((c, i) => (
                  <th key={i} className="p-2 text-[#ECEBE9] font-mono" style={{ color: c }}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {palette.map((bg, rowIdx) => (
                <tr key={rowIdx} className="border-b border-[#2A2D30]/50">
                  <td className="p-2 font-mono" style={{ color: bg }}>
                    {bg}
                  </td>
                  {palette.map((fg, colIdx) => {
                    const r = getContrastRatio(fg, bg);
                    const passes = r >= 4.5;
                    return (
                      <td key={colIdx} className="p-2">
                        <div
                          className={`p-2 rounded-lg text-center font-mono font-bold border ${
                            passes ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                          }`}
                          style={{ backgroundColor: bg, color: fg }}
                        >
                          {r.toFixed(1)}:1
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Local AI Audit Section */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#3C6B4D]">
            <Sparkles size={18} />
            <h4 className="font-bold text-[#ECEBE9] text-sm">Local AI Accessibility Audit</h4>
          </div>
          <button
            onClick={handleRunAiAudit}
            disabled={isAnalyzing || !selectedModel}
            className="flex items-center gap-2 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
          >
            {isAnalyzing ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
            {isAnalyzing ? 'Analyzing Accessibility...' : 'Run Local AI Audit'}
          </button>
        </div>

        {error && <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">{error}</div>}

        {aiAnalysis && (
          <div
            className="bg-[#111213] p-5 rounded-xl border border-[#2A2D30] text-[#ECEBE9] text-xs leading-relaxed overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(aiAnalysis) }}
          />
        )}
      </div>
    </div>
  );
};
