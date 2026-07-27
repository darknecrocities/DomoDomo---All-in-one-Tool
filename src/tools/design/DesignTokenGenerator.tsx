import React, { useState, useEffect } from 'react';
import { Sliders, Cpu, Sparkles, Copy, Check, RefreshCw, Download } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { parseMarkdown } from '../../utils/markdownParser';

export const DesignTokenGeneratorTool: React.FC = () => {
  const [brandName, setBrandName] = useState('DomoDomo System');
  const [primaryHex, setPrimaryHex] = useState('#3C6B4D');
  const [baseFontSize, setBaseFontSize] = useState(16);
  const [typeScaleRatio, setTypeScaleRatio] = useState(1.25);
  const [spacingUnit, setSpacingUnit] = useState(4);
  const [tokenFormat, setTokenFormat] = useState<'css' | 'json'>('json');

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

  const fontSm = Math.round(baseFontSize / typeScaleRatio);
  const fontMd = baseFontSize;
  const fontLg = Math.round(baseFontSize * typeScaleRatio);
  const fontXl = Math.round(baseFontSize * Math.pow(typeScaleRatio, 2));

  const tokensObj = {
    name: brandName,
    color: {
      primary: primaryHex,
      background: '#111213',
      card: '#18191B',
      border: '#2A2D30',
      text: '#ECEBE9',
    },
    typography: {
      fontBase: `${baseFontSize}px`,
      ratio: typeScaleRatio,
      sm: `${fontSm}px`,
      md: `${fontMd}px`,
      lg: `${fontLg}px`,
      xl: `${fontXl}px`,
    },
    spacing: {
      xs: `${spacingUnit * 1}px`,
      sm: `${spacingUnit * 2}px`,
      md: `${spacingUnit * 4}px`,
      lg: `${spacingUnit * 8}px`,
    },
  };

  const cssVariables = `:root {
  --color-primary: ${primaryHex};
  --color-bg: #111213;
  --color-[#18191B]: #18191B;
  --color-border: #2A2D30;
  --color-text: #ECEBE9;
  --font-size-sm: ${fontSm}px;
  --font-size-md: ${fontMd}px;
  --font-size-lg: ${fontLg}px;
  --font-size-xl: ${fontXl}px;
  --spacing-xs: ${spacingUnit * 1}px;
  --spacing-sm: ${spacingUnit * 2}px;
  --spacing-md: ${spacingUnit * 4}px;
  --spacing-lg: ${spacingUnit * 8}px;
}`;

  const formattedOutput =
    tokenFormat === 'json' ? JSON.stringify(tokensObj, null, 2) : cssVariables;

  const copyTokens = () => {
    navigator.clipboard.writeText(formattedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTokens = () => {
    const ext = tokenFormat === 'json' ? 'json' : 'css';
    const blob = new Blob([formattedOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = `design_tokens.${ext}`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRunAiTokenArchitect = async () => {
    if (!selectedModel) return;
    setIsGenerating(true);
    setError(null);

    const systemPrompt = `You are a Principal Design Tokens & W3C Token Specification Architect.
Brand Name: ${brandName}, Primary Color: ${primaryHex}, Base Font: ${baseFontSize}px, Spacing Base: ${spacingUnit}px.
Provide W3C Design Tokens specification JSON structure and Style Dictionary integration workflow.`;

    try {
      const response = await aiService.generateTextOllama(selectedModel, `Synthesize design token system for ${brandName}`, 2048, systemPrompt);
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
              <Sliders size={24} />
            </div>
            <div>
              <h3 className="font-bold text-[#ECEBE9] text-xl">AI Design Token & CSS Variables System Studio</h3>
              <p className="text-[#A3A09B] text-xs mt-1">
                Construct cross-platform design token suites (Colors, Typography scale, Spacing, Elevation), export W3C JSON / CSS custom variables, and prompt Local AI.
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
          <h4 className="text-sm font-semibold text-[#ECEBE9]">Token Spec Settings</h4>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#A3A09B]">Design System Brand Name</label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-2.5 rounded-lg font-mono"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#A3A09B]">Primary Brand Hex</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={primaryHex}
                onChange={(e) => setPrimaryHex(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-[#2A2D30]"
              />
              <input
                type="text"
                value={primaryHex}
                onChange={(e) => setPrimaryHex(e.target.value)}
                className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-2 rounded-lg w-full font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#A3A09B]">Base Font Size ({baseFontSize}px)</label>
              <input type="range" min="12" max="20" value={baseFontSize} onChange={(e) => setBaseFontSize(Number(e.target.value))} className="accent-[#3C6B4D] cursor-pointer" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#A3A09B]">Type Scale Ratio ({typeScaleRatio})</label>
              <select value={typeScaleRatio} onChange={(e) => setTypeScaleRatio(Number(e.target.value))} className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-2 rounded-lg cursor-pointer">
                <option value={1.2}>1.200 - Minor Third</option>
                <option value={1.25}>1.250 - Major Third</option>
                <option value={1.333}>1.333 - Perfect Fourth</option>
                <option value={1.414}>1.414 - Augmented Fourth</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#A3A09B]">Base Spacing Unit ({spacingUnit}px)</label>
            <input type="range" min="2" max="16" step="2" value={spacingUnit} onChange={(e) => setSpacingUnit(Number(e.target.value))} className="accent-[#3C6B4D] cursor-pointer" />
          </div>
        </div>

        {/* Viewport Code Output */}
        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col justify-between text-left relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {(['json', 'css'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setTokenFormat(fmt)}
                  className={`text-xs px-3 py-1 rounded-lg font-mono uppercase font-bold transition cursor-pointer ${
                    tokenFormat === fmt ? 'bg-[#3C6B4D] text-white' : 'bg-[#111213] text-[#A3A09B]'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={copyTokens} className="flex items-center gap-1 text-xs text-[#3C6B4D] hover:underline font-semibold cursor-pointer">
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy Tokens'}
              </button>
              <button onClick={handleDownloadTokens} className="flex items-center gap-1 text-xs text-[#3C6B4D] hover:underline font-semibold cursor-pointer">
                <Download size={14} />
                Download
              </button>
            </div>
          </div>

          <div className="flex-1 bg-[#111213] p-4 rounded-xl border border-[#2A2D30] font-mono text-xs text-[#ECEBE9] overflow-x-auto min-h-[240px]">
            <pre>{formattedOutput}</pre>
          </div>
        </div>
      </div>

      {/* Local AI Advisor */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#3C6B4D]">
            <Sparkles size={18} />
            <h4 className="font-bold text-[#ECEBE9] text-sm">Local AI W3C Design Tokens Architect</h4>
          </div>
          <button
            onClick={handleRunAiTokenArchitect}
            disabled={isGenerating || !selectedModel}
            className="flex items-center gap-2 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
          >
            {isGenerating ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
            {isGenerating ? 'Synthesizing Spec...' : 'Synthesize Style Dictionary Spec'}
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
