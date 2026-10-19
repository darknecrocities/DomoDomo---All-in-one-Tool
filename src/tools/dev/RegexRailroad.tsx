import React, { useState, useRef, useMemo } from 'react';
import {
  Code,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Copy,
  Download,
  Check,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import {
  type RailToken,
  tokenizeRegexPattern,
} from './regexRailroadHelper';

interface RailNode {
  id: string;
  type: RailToken['type'];
  label: string;
  detail?: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type { RailNode, RailToken };
export { tokenizeRegexPattern };

export const RegexRailroadTool: React.FC = () => {
  const [pattern, setPattern] = useState<string>('^(https?:\\/\\/)?([\\da-z.-]+)\\.([a-z.]{2,6})([\\/\\w .-]*)*\\/?$');
  const [flags, setFlags] = useState<string>('gmi');
  const [scale, setScale] = useState<number>(1.0);
  const [copied, setCopied] = useState<boolean>(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Simplified robust tokenizer that maps regex tokens into visual railroad nodes
  const { nodes, totalWidth, totalHeight } = useMemo(() => {
    const raw = pattern.trim();
    const tokenList = tokenizeRegexPattern(raw);

    // Layout nodes horizontally with track spacing
    const calculatedNodes: RailNode[] = [];
    let currentX = 40;
    const centerY = 120;
    const nodeHeight = 36;

    tokenList.forEach((t, idx) => {
      const textWidth = Math.max(t.label.length * 9 + 28, 54);
      calculatedNodes.push({
        id: `node-${idx}`,
        type: t.type,
        label: t.label,
        detail: t.detail,
        x: currentX,
        y: centerY - nodeHeight / 2,
        width: textWidth,
        height: nodeHeight,
      });
      currentX += textWidth + 36;
    });

    return {
      nodes: calculatedNodes,
      totalWidth: currentX + 40,
      totalHeight: 240,
    };
  }, [pattern]);

  const handleCopySvg = () => {
    if (!svgRef.current) return;
    const svgStr = new XMLSerializer().serializeToString(svgRef.current);
    navigator.clipboard.writeText(svgStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    if (!svgRef.current) return;
    const svgStr = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'regex-railroad.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getNodeColor = (type: RailNode['type']) => {
    switch (type) {
      case 'start':
      case 'end':
        return { fill: '#18191B', stroke: '#FFFFFF', text: '#FFFFFF' };
      case 'class':
        return { fill: '#1E2024', stroke: '#D4AF37', text: '#D4AF37' };
      case 'group':
        return { fill: '#141618', stroke: '#72706C', text: '#A3A09B' };
      case 'quantifier':
        return { fill: '#241F16', stroke: '#D4AF37', text: '#F6E05E' };
      case 'anchor':
        return { fill: '#201A18', stroke: '#E2E8F0', text: '#E2E8F0' };
      default:
        return { fill: '#18191B', stroke: '#2A2D30', text: '#ECEBE9' };
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2A2D30] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#A3A09B] uppercase tracking-wider mb-1">
            <span>Developer Suite</span>
            <span>/</span>
            <span className="text-white">Syntax Architecture</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Code className="text-[#D4AF37]" size={24} />
            <span>RegEx Railroad Diagram Generator</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Transform regular expressions into high-contrast interactive syntax railroad diagrams offline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopySvg}
            className="px-3 py-2 bg-[#18191B] border border-[#2A2D30] hover:bg-[#2A2D30] text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            {copied ? <Check size={14} className="text-[#D4AF37]" /> : <Copy size={14} />}
            <span>{copied ? 'Copied SVG' : 'Copy SVG'}</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadSvg}
            className="px-4 py-2 bg-white text-black hover:bg-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg"
          >
            <Download size={14} />
            <span>Download SVG</span>
          </button>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-10 flex flex-col gap-1">
            <label className="text-[11px] font-bold text-[#A3A09B] uppercase tracking-wider">
              Regular Expression Pattern
            </label>
            <div className="flex items-center bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2.5 focus-within:border-white">
              <span className="text-slate-500 font-mono text-sm mr-1">/</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="e.g. ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                className="w-full bg-transparent text-white font-mono text-xs focus:outline-none placeholder-slate-600"
              />
              <span className="text-slate-500 font-mono text-sm ml-1">/</span>
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col gap-1">
            <label className="text-[11px] font-bold text-[#A3A09B] uppercase tracking-wider">Flags</label>
            <input
              type="text"
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              placeholder="gmi"
              className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-white"
            />
          </div>
        </div>

        {/* Preset quick test patterns */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#2A2D30]/60 text-xs">
          <span className="text-slate-500 text-[11px] font-semibold">Presets:</span>
          {[
            { label: 'URL Address', val: '^(https?:\\/\\/)?([\\da-z.-]+)\\.([a-z.]{2,6})([\\/\\w .-]*)*\\/?$' },
            { label: 'Email Format', val: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' },
            { label: 'SemVer Version', val: '^v?(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-[\\da-z-]+)?$' },
            { label: 'IPv4 Address', val: '^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$' },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setPattern(preset.val)}
              className="px-2.5 py-1 bg-[#111213] border border-[#2A2D30] hover:border-[#72706C] text-[#A3A09B] hover:text-white rounded-lg text-[11px] transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Viewport Section */}
      <div className="bg-[#111213] border border-[#2A2D30] rounded-3xl p-5 flex flex-col gap-4">
        {/* Viewport Control Bar */}
        <div className="flex items-center justify-between border-b border-[#2A2D30] pb-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white uppercase tracking-wider text-[11px]">
              Railroad Syntax Graph
            </span>
            <span className="text-[#A3A09B] font-mono bg-[#18191B] px-2 py-0.5 rounded border border-[#2A2D30]">
              {Math.round(scale * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(s - 0.15, 0.4))}
              className="p-1.5 bg-[#18191B] border border-[#2A2D30] rounded-lg hover:bg-[#2A2D30] text-slate-300 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut size={15} />
            </button>
            <button
              type="button"
              onClick={() => setScale(1.0)}
              className="p-1.5 bg-[#18191B] border border-[#2A2D30] rounded-lg hover:bg-[#2A2D30] text-slate-300 transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw size={15} />
            </button>
            <button
              type="button"
              onClick={() => setScale((s) => Math.min(s + 0.15, 2.5))}
              className="p-1.5 bg-[#18191B] border border-[#2A2D30] rounded-lg hover:bg-[#2A2D30] text-slate-300 transition-colors"
              title="Zoom In"
            >
              <ZoomIn size={15} />
            </button>
          </div>
        </div>

        {/* Scrollable Diagram Canvas */}
        <div className="w-full overflow-auto bg-[#0D0D0D] border border-[#2A2D30] rounded-2xl p-6 min-h-[300px] flex items-center justify-center">
          <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center', transition: 'transform 0.15s ease' }}>
            <svg
              ref={svgRef}
              width={totalWidth}
              height={totalHeight}
              viewBox={`0 0 ${totalWidth} ${totalHeight}`}
              className="overflow-visible"
            >
              <defs>
                <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.5" />
                </filter>
              </defs>

              {/* Main connecting railroad track */}
              <path
                d={`M 20 120 L ${totalWidth - 20} 120`}
                stroke="#2A2D30"
                strokeWidth="3"
                fill="none"
              />

              {/* Railroad Nodes */}
              {nodes.map((node, idx) => {
                const style = getNodeColor(node.type);
                return (
                  <g key={node.id} filter="url(#shadow)">
                    {/* Junction connectors */}
                    {idx > 0 && (
                      <line
                        x1={nodes[idx - 1].x + nodes[idx - 1].width}
                        y1={120}
                        x2={node.x}
                        y2={120}
                        stroke="#D4AF37"
                        strokeWidth="2"
                        strokeDasharray={node.type === 'quantifier' ? '3 3' : undefined}
                      />
                    )}
                    {/* Node Box */}
                    <rect
                      x={node.x}
                      y={node.y}
                      width={node.width}
                      height={node.height}
                      rx={node.type === 'start' || node.type === 'end' ? 18 : 8}
                      fill={style.fill}
                      stroke={style.stroke}
                      strokeWidth="1.5"
                    />
                    {/* Node Label */}
                    <text
                      x={node.x + node.width / 2}
                      y={node.y + node.height / 2 + 4}
                      fill={style.text}
                      fontSize={node.type === 'start' || node.type === 'end' ? '10' : '11'}
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-[11px] text-[#A3A09B]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white inline-block" />
              <span>Boundary Anchors</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] inline-block" />
              <span>Character Classes / Escapes</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#72706C] inline-block" />
              <span>Capturing Groups</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F6E05E] inline-block" />
              <span>Quantifiers & Repeats</span>
            </span>
          </div>

          <span className="flex items-center gap-1 text-[#D4AF37]">
            <Sparkles size={13} />
            <span>Pure SVG vector rendering</span>
          </span>
        </div>
      </div>

      {/* Footer Security Note */}
      <div className="flex items-center gap-2 p-3 bg-[#18191B] border border-[#2A2D30] rounded-xl text-[11px] text-[#A3A09B]">
        <ShieldCheck size={16} className="text-[#D4AF37] shrink-0" />
        <span>100% Client-side AST syntax tokenizer. Regex patterns are never sent to any server.</span>
      </div>
    </div>
  );
};
