import { useState, useMemo } from 'react';
import { Sliders, Copy, Check, Download, Play, ZoomIn, ZoomOut, AlertCircle } from 'lucide-react';

interface MindNode {
  id: string;
  label: string;
  depth: number;
  parentIdx: number;
  x?: number;
  y?: number;
}

export const FlowchartMindmapMakerTool = () => {
  const [outlineText, setOutlineText] = useState(`- DomoDomo App Suite
  - Photo Suite
    - Background Remover
    - Image Resizer
    - Collage Maker
  - PDF Suite
    - Merge PDFs
    - Sign PDF
  - Visualizer Suite
    - JSON Chart Builder
    - ER Schema Designer`);

  const [mindNodes, setMindNodes] = useState<MindNode[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleParse = () => {
    try {
      setErrorMsg(null);
      const lines = outlineText.split('\n').filter(l => l.trim().length > 0);
      if (lines.length === 0) {
        throw new Error("Outline text cannot be empty.");
      }

      // Simple Markdown bullet indention depth parser
      const parsedNodes: MindNode[] = [];
      const parentStack: number[] = [];

      lines.forEach((line, idx) => {
        // Find indention length
        const spaceMatch = line.match(/^(\s*)/);
        const spacesCount = spaceMatch ? spaceMatch[1].length : 0;
        const depth = Math.floor(spacesCount / 2); // assume 2 spaces per indentation level

        const label = line.replace(/^\s*[-*+]\s*/, '').trim();

        // Update stack of parents
        while (parentStack.length > depth) {
          parentStack.pop();
        }

        const parentIdx = parentStack.length > 0 ? parentStack[parentStack.length - 1] : -1;
        parsedNodes.push({
          id: `node-${idx}`,
          label,
          depth,
          parentIdx
        });

        parentStack.push(idx);
      });

      // Layout algorithm (Simple Left-to-Right tree layout)
      // Height map tracking for overlapping nodes
      const depthCounter: Record<number, number> = {};
      const totalDepthHeight: Record<number, number> = {};

      // Compute heights at each depth level
      parsedNodes.forEach(node => {
        totalDepthHeight[node.depth] = (totalDepthHeight[node.depth] || 0) + 1;
      });

      parsedNodes.forEach(node => {
        const d = node.depth;
        const count = depthCounter[d] || 0;
        depthCounter[d] = count + 1;

        // Spread points on Y axis symmetrically
        const spacingY = 55;
        const totalH = (totalDepthHeight[d] - 1) * spacingY;
        const startY = 160 - totalH / 2;

        node.x = 40 + d * 140;
        node.y = startY + count * spacingY;
      });

      setMindNodes(parsedNodes);
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to compile outline mindmap.");
      setMindNodes([]);
    }
  };

  const generatedSvgContent = useMemo(() => {
    if (mindNodes.length === 0) return '';
    
    const linesGroup = mindNodes.map(node => {
      if (node.parentIdx >= 0) {
        const parent = mindNodes[node.parentIdx];
        if (parent.x !== undefined && parent.y !== undefined && node.x !== undefined && node.y !== undefined) {
          // Curved connector paths
          const cpX1 = parent.x + (node.x - parent.x) / 2;
          const cpY1 = parent.y;
          const cpX2 = parent.x + (node.x - parent.x) / 2;
          const cpY2 = node.y;
          return `  <path d="M ${parent.x} ${parent.y} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${node.x} ${node.y}" fill="none" stroke="#2A2D30" stroke-width="1.5" stroke-linecap="round" />`;
        }
      }
      return '';
    }).filter(Boolean).join('\n');

    const nodesGroup = mindNodes.map(node => {
      if (node.x === undefined || node.y === undefined) return '';
      const rectW = Math.max(90, node.label.length * 7);
      const rectH = 26;
      const rx = node.x - rectW / 2;
      const ry = node.y - rectH / 2;
      
      let cardBg = '#18191B';
      let border = '#2A2D30';
      let textColor = '#ECEBE9';
      if (node.depth === 0) {
        cardBg = '#3C6B4D';
        border = '#3C6B4D';
        textColor = '#FFFFFF';
      } else if (node.depth === 1) {
        border = '#3C6B4D';
      }

      return `  <g id="${node.id}">
    <rect x="${rx}" y="${ry}" width="${rectW}" height="${rectH}" rx="6" fill="${cardBg}" stroke="${border}" stroke-width="1.5" />
    <text x="${node.x}" y="${node.y + 4}" font-family="system-ui" font-size="10px" font-weight="bold" fill="${textColor}" text-anchor="middle">${node.label}</text>
  </g>`;
    }).join('\n');

    return `<svg width="560" height="340" viewBox="0 0 560 340" xmlns="http://www.w3.org/2000/svg">
  <rect width="560" height="340" fill="#111213" rx="12" />
  <g transform="scale(${zoomScale})" transform-origin="280 170">
${linesGroup}
${nodesGroup}
  </g>
</svg>`;
  }, [mindNodes, zoomScale]);

  const handleCopy = () => {
    if (generatedSvgContent) {
      navigator.clipboard.writeText(generatedSvgContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleDownload = () => {
    if (generatedSvgContent) {
      const blob = new Blob([generatedSvgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mindmap_tree.svg`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Configure area */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-sm font-extrabold text-[#ECEBE9] border-b border-[#2A2D30] pb-2.5 flex items-center gap-1.5">
            <Sliders size={15} className="text-[#3C6B4D]" />
            <span>Mind Map Outline Spec</span>
          </h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-[#A3A09B] font-bold uppercase tracking-wider">Bulleted Tree List (Indented)</label>
            <textarea
              value={outlineText}
              onChange={(e) => setOutlineText(e.target.value)}
              rows={11}
              className="bg-[#111213] border border-[#2A2D30] rounded-xl p-3.5 text-xs font-mono text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D] leading-relaxed"
              placeholder="Use spaces to indent sub-items..."
            />
          </div>

          <button
            onClick={handleParse}
            className="py-2.5 px-4 bg-[#3C6B4D] hover:bg-[#2E533B] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md transition-colors"
          >
            <Play size={13} />
            <span>Generate Mind Map SVG</span>
          </button>

          {errorMsg && (
            <div className="bg-rose-950/20 border border-rose-500/30 text-rose-400 p-3 rounded-xl flex items-start gap-2 text-xs">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Mind map svg render viewport */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card bg-[#18191B] p-6 border border-[#2A2D30] rounded-2xl flex flex-col gap-4">
          <div className="pb-3 border-b border-[#2A2D30] flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-[#ECEBE9]">Rendered Tree Graph</h4>
            
            {mindNodes.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomScale(prev => Math.max(0.5, prev - 0.1))}
                  className="p-1 bg-[#111213] border border-[#2A2D30] hover:bg-[#1E2022] rounded-lg text-[#A3A09B]"
                  title="Zoom Out"
                >
                  <ZoomOut size={13} />
                </button>
                <button
                  onClick={() => setZoomScale(prev => Math.min(2, prev + 0.1))}
                  className="p-1 bg-[#111213] border border-[#2A2D30] hover:bg-[#1E2022] rounded-lg text-[#A3A09B]"
                  title="Zoom In"
                >
                  <ZoomIn size={13} />
                </button>

                <button
                  onClick={handleCopy}
                  className="py-1 px-3 bg-[#111213] hover:bg-[#1E2022] text-[#A3A09B] hover:text-[#ECEBE9] rounded-lg text-xs font-bold border border-[#2A2D30] flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>Copy SVG</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="py-1 px-3 bg-[#3C6B4D] hover:bg-[#2E533B] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Download size={12} />
                  <span>Download SVG</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center bg-[#111213] rounded-2xl p-4 border border-[#2A2D30] min-h-[350px]">
            {mindNodes.length === 0 ? (
              <div className="text-center p-12 space-y-1.5 text-xs text-[#A3A09B]">
                <p className="font-semibold">No active outline tree processed.</p>
                <p className="text-[#72706C]">Configure indent list points on the left to compile your mindmap.</p>
              </div>
            ) : (
              <div
                className="w-full h-auto text-xs"
                dangerouslySetInnerHTML={{ __html: generatedSvgContent }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
