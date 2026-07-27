import React, { useState, useEffect } from 'react';
import { LayoutGrid, Cpu, Sparkles, Copy, Check, RefreshCw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { parseMarkdown } from '../../utils/markdownParser';

export const CSSGridFlexStudioTool: React.FC = () => {
  const [cols, setCols] = useState(3);
  const [rows, setRows] = useState(2);
  const [gap, setGap] = useState(16);
  const [itemCount, setItemCount] = useState(6);
  const [layoutType, setLayoutType] = useState<'grid' | 'flex'>('grid');
  const [flexDirection, setFlexDirection] = useState<'row' | 'column' | 'row-reverse' | 'column-reverse'>('row');
  const [justifyContent, setJustifyContent] = useState<'flex-start' | 'center' | 'space-between' | 'space-around'>('center');
  const [alignItems, setAlignItems] = useState<'flex-start' | 'center' | 'stretch'>('center');

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

  const generatedCss =
    layoutType === 'grid'
      ? `display: grid;
grid-template-columns: repeat(${cols}, minmax(0, 1fr));
grid-template-rows: repeat(${rows}, minmax(0, 1fr));
gap: ${gap}px;`
      : `display: flex;
flex-direction: ${flexDirection};
justify-content: ${justifyContent};
align-items: ${alignItems};
gap: ${gap}px;`;

  const copyCss = () => {
    navigator.clipboard.writeText(generatedCss);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunAiLayoutArchitect = async () => {
    if (!selectedModel) return;
    setIsGenerating(true);
    setError(null);

    const systemPrompt = `You are a Senior CSS Grid & Flexbox Layout Systems Architect.
Layout type: ${layoutType.toUpperCase()}. Cols: ${cols}, Gap: ${gap}px.
Provide responsive CSS media queries (@media screen) and Tailwind CSS class recommendations for mobile, tablet, and desktop breakpoints.`;

    try {
      const response = await aiService.generateTextOllama(selectedModel, `Synthesize responsive CSS layout specs for ${layoutType}`, 2048, systemPrompt);
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
              <LayoutGrid size={24} />
            </div>
            <div>
              <h3 className="font-bold text-[#ECEBE9] text-xl">AI CSS Grid & Flexbox Layout Architect</h3>
              <p className="text-[#A3A09B] text-xs mt-1">
                Visual CSS Grid and Flexbox container layout builder, customize gap, alignment, and template columns, export CSS code, and prompt Local AI.
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
          <div className="flex items-center gap-2 border-b border-[#2A2D30] pb-2">
            {(['grid', 'flex'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setLayoutType(mode)}
                className={`text-xs font-semibold px-4 py-2 rounded-xl capitalize transition cursor-pointer ${
                  layoutType === mode ? 'bg-[#3C6B4D] text-white' : 'bg-[#111213] text-[#A3A09B] hover:text-[#ECEBE9]'
                }`}
              >
                CSS {mode}
              </button>
            ))}
          </div>

          {layoutType === 'grid' ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#A3A09B]">Columns ({cols})</label>
                <input type="range" min="1" max="6" value={cols} onChange={(e) => setCols(Number(e.target.value))} className="accent-[#3C6B4D] cursor-pointer" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#A3A09B]">Rows ({rows})</label>
                <input type="range" min="1" max="4" value={rows} onChange={(e) => setRows(Number(e.target.value))} className="accent-[#3C6B4D] cursor-pointer" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#A3A09B]">Flex Direction</label>
                <select value={flexDirection} onChange={(e) => setFlexDirection(e.target.value as any)} className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-2 rounded-lg cursor-pointer">
                  <option value="row font-mono">Row (Horizontal)</option>
                  <option value="column">Column (Vertical)</option>
                  <option value="row-reverse">Row Reverse</option>
                  <option value="column-reverse">Column Reverse</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#A3A09B]">Justify Content</label>
                  <select value={justifyContent} onChange={(e) => setJustifyContent(e.target.value as any)} className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-2 rounded-lg cursor-pointer">
                    <option value="flex-start">Flex Start</option>
                    <option value="center">Center</option>
                    <option value="space-between">Space Between</option>
                    <option value="space-around">Space Around</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#A3A09B]">Align Items</label>
                  <select value={alignItems} onChange={(e) => setAlignItems(e.target.value as any)} className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-2 rounded-lg cursor-pointer">
                    <option value="flex-start">Flex Start</option>
                    <option value="center">Center</option>
                    <option value="stretch">Stretch</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#A3A09B]">Gap ({gap}px)</label>
              <input type="range" min="0" max="40" value={gap} onChange={(e) => setGap(Number(e.target.value))} className="accent-[#3C6B4D] cursor-pointer" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#A3A09B]">Item Count ({itemCount})</label>
              <input type="range" min="1" max="12" value={itemCount} onChange={(e) => setItemCount(Number(e.target.value))} className="accent-[#3C6B4D] cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Viewport Preview */}
        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col justify-between text-left relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-[#ECEBE9]">Interactive Layout Viewport</span>
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
            className="flex-1 p-6 bg-[#111213] rounded-xl border border-[#2A2D30] min-h-[260px] overflow-hidden"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'center center',
            }}
          >
            <div
              style={{
                display: layoutType,
                gridTemplateColumns: layoutType === 'grid' ? `repeat(${cols}, minmax(0, 1fr))` : undefined,
                gridTemplateRows: layoutType === 'grid' ? `repeat(${rows}, minmax(0, 1fr))` : undefined,
                flexDirection: layoutType === 'flex' ? flexDirection : undefined,
                justifyContent: layoutType === 'flex' ? justifyContent : undefined,
                alignItems: layoutType === 'flex' ? alignItems : undefined,
                gap: `${gap}px`,
              }}
              className="w-full h-full"
            >
              {Array.from({ length: itemCount }).map((_, idx) => (
                <div key={idx} className="bg-[#18191B] border border-[#3C6B4D]/40 p-4 rounded-xl flex items-center justify-center font-mono text-xs font-bold text-[#3C6B4D]">
                  Card #{idx + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Local AI Advisor */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#3C6B4D]">
            <Sparkles size={18} />
            <h4 className="font-bold text-[#ECEBE9] text-sm">Local AI Responsive Layout Architect</h4>
          </div>
          <button
            onClick={handleRunAiLayoutArchitect}
            disabled={isGenerating || !selectedModel}
            className="flex items-center gap-2 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
          >
            {isGenerating ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
            {isGenerating ? 'Synthesizing Rules...' : 'Synthesize Breakpoint Rules'}
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
