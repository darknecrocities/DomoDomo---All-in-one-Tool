import React, { useState, useMemo, useRef } from 'react';
import { Sliders, Copy, Check, RefreshCw, PenTool } from 'lucide-react';

interface PathNode {
  id: string;
  x: number;
  y: number;
  type: 'line' | 'curve';
  cx?: number; // control point X (for Q curve)
  cy?: number; // control point Y
}

export const SVGPathInspectorTool = () => {
  const [nodes, setNodes] = useState<PathNode[]>([
    { id: 'n-1', x: 50, y: 150, type: 'line' },
    { id: 'n-2', x: 150, y: 50, type: 'curve', cx: 100, cy: 30 },
    { id: 'n-3', x: 250, y: 150, type: 'line' }
  ]);

  const [activeNodeId, setActiveNodeId] = useState<string>('n-2');
  const [closePath, setClosePath] = useState<boolean>(false);
  const [strokeColor, setStrokeColor] = useState<string>('#3C6B4D');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [copied, setCopied] = useState<boolean>(false);

  // Drag states
  const dragInfo = useRef<{ nodeId: string; isControlPoint: boolean; startX: number; startY: number } | null>(null);

  const activeNode = useMemo(() => {
    return nodes.find(n => n.id === activeNodeId) || nodes[0];
  }, [nodes, activeNodeId]);

  // Compile nodes to d attribute
  const dAttribute = useMemo(() => {
    if (nodes.length === 0) return '';
    let d = `M ${nodes[0].x} ${nodes[0].y}`;
    for (let i = 1; i < nodes.length; i++) {
      const n = nodes[i];
      if (n.type === 'curve' && n.cx !== undefined && n.cy !== undefined) {
        d += ` Q ${n.cx} ${n.cy}, ${n.x} ${n.y}`;
      } else {
        d += ` L ${n.x} ${n.y}`;
      }
    }
    if (closePath) d += ' Z';
    return d;
  }, [nodes, closePath]);

  const fullSvgCode = useMemo(() => {
    return `<svg width="300" height="300" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
  <path d="${dAttribute}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" />
</svg>`;
  }, [dAttribute, strokeColor, strokeWidth]);

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    // Prevent click trigger when dragging nodes
    if (dragInfo.current) return;
    
    // Add new vertex node
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    
    const id = `n-${Date.now()}`;
    const newNode: PathNode = {
      id,
      x,
      y,
      type: 'line'
    };
    
    setNodes([...nodes, newNode]);
    setActiveNodeId(id);
  };

  const handleNodeMouseDown = (nodeId: string, isControlPoint: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    dragInfo.current = {
      nodeId,
      isControlPoint,
      startX: e.clientX,
      startY: e.clientY
    };
    setActiveNodeId(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragInfo.current) return;
    const { nodeId, isControlPoint, startX, startY } = dragInfo.current;
    
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    setNodes(prev => prev.map(n => {
      if (n.id === nodeId) {
        if (isControlPoint) {
          return {
            ...n,
            cx: Math.max(0, Math.min(300, (n.cx || 0) + dx)),
            cy: Math.max(0, Math.min(300, (n.cy || 0) + dy))
          };
        } else {
          // Dragging vertex also drags control point by offset to maintain curve shape
          const updatedCx = n.cx !== undefined ? n.cx + dx : undefined;
          const updatedCy = n.cy !== undefined ? n.cy + dy : undefined;
          return {
            ...n,
            x: Math.max(0, Math.min(300, n.x + dx)),
            y: Math.max(0, Math.min(300, n.y + dy)),
            cx: updatedCx,
            cy: updatedCy
          };
        }
      }
      return n;
    }));

    dragInfo.current.startX = e.clientX;
    dragInfo.current.startY = e.clientY;
  };

  const handleMouseUp = () => {
    dragInfo.current = null;
  };

  const handleRemoveNode = (id: string) => {
    if (nodes.length <= 1) return;
    const next = nodes.filter(n => n.id !== id);
    setNodes(next);
    setActiveNodeId(next[0].id);
  };

  const handleUpdateNode = (id: string, updates: Partial<PathNode>) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const handleToggleType = (id: string) => {
    const target = nodes.find(n => n.id === id);
    if (!target) return;
    if (target.type === 'line') {
      // Toggle to curve, initialize control point between target and previous node
      const idx = nodes.indexOf(target);
      const prevNode = nodes[idx - 1] || nodes[0];
      const cx = Math.round((target.x + prevNode.x) / 2);
      const cy = Math.round((target.y + prevNode.y) / 2 - 30); // offset upward
      handleUpdateNode(id, { type: 'curve', cx, cy });
    } else {
      // Toggle to line
      handleUpdateNode(id, { type: 'line', cx: undefined, cy: undefined });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fullSvgCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleReset = () => {
    setNodes([
      { id: 'n-1', x: 50, y: 150, type: 'line' },
      { id: 'n-2', x: 150, y: 50, type: 'curve', cx: 100, cy: 30 },
      { id: 'n-3', x: 250, y: 150, type: 'line' }
    ]);
    setActiveNodeId('n-2');
    setClosePath(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Visual Settings Column */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-sm font-extrabold text-[#ECEBE9] border-b border-[#2A2D30] pb-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5"><Sliders size={15} className="text-[#3C6B4D]" /> Vector Path Editor</span>
            <button
              onClick={handleReset}
              className="p-1 hover:bg-[#1E2022] rounded text-[#72706C] hover:text-[#ECEBE9]"
              title="Reset path canvas"
            >
              <RefreshCw size={13} />
            </button>
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <label className="text-[#A3A09B] cursor-pointer flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={closePath}
                  onChange={(e) => setClosePath(e.target.checked)}
                  className="accent-[#3C6B4D]"
                />
                <span>Close Loop Path (Z)</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#A3A09B] font-bold uppercase">Stroke Width</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(Number(e.target.value))}
                  className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-1.5 text-xs text-[#ECEBE9] focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#A3A09B] font-bold uppercase">Stroke Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={strokeColor}
                    onChange={(e) => setStrokeColor(e.target.value)}
                    className="w-8 h-8 rounded border border-[#2A2D30] cursor-pointer bg-[#111213]"
                  />
                  <input
                    type="text"
                    value={strokeColor}
                    onChange={(e) => setStrokeColor(e.target.value)}
                    className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-2 py-1.5 text-xs text-[#ECEBE9] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {activeNode && (
              <div className="border-t border-[#2A2D30] pt-3.5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-emerald-450 font-bold uppercase">Node Config: {activeNodeId}</span>
                  {nodes.length > 1 && (
                    <button
                      onClick={() => handleRemoveNode(activeNode.id)}
                      className="text-[10px] text-rose-450 font-bold hover:underline"
                    >
                      Delete Vertex
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-[#A3A09B] font-bold uppercase">X Coordinate</label>
                    <input
                      type="number"
                      value={activeNode.x}
                      onChange={(e) => handleUpdateNode(activeNode.id, { x: Number(e.target.value) })}
                      className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-1.5 text-[#ECEBE9] focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-[#A3A09B] font-bold uppercase">Y Coordinate</label>
                    <input
                      type="number"
                      value={activeNode.y}
                      onChange={(e) => handleUpdateNode(activeNode.id, { y: Number(e.target.value) })}
                      className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-1.5 text-[#ECEBE9] focus:outline-none"
                    />
                  </div>
                </div>

                {nodes.indexOf(activeNode) > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-[#A3A09B] font-bold uppercase">Segment Type</label>
                    <button
                      onClick={() => handleToggleType(activeNode.id)}
                      className={`py-1.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                        activeNode.type === 'curve' 
                          ? 'bg-[#3C6B4D]/10 border-[#3C6B4D] text-emerald-400 font-extrabold' 
                          : 'bg-[#111213] border-[#2A2D30] text-[#A3A09B] hover:border-[#2A2D30]/80'
                      }`}
                    >
                      {activeNode.type === 'curve' ? '✓ Quadratic Curve (Q)' : '+ Set as Curve'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Canvas column */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="relative bg-[#111213] border border-[#2A2D30] rounded-2xl overflow-hidden cursor-crosshair select-none flex items-center justify-center p-6 h-[320px]"
        >
          {/* Subtle grid backdrop */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#2a2d30_0.5px,transparent_0.5px),linear-gradient(to_bottom,#2a2d30_0.5px,transparent_0.5px)] bg-[size:1rem_1rem] opacity-15"></div>
          
          <span className="absolute bottom-4 left-4 text-[9px] text-[#72706C] font-bold uppercase tracking-wider">Click grid workspace to add new nodes. Drag vertices or control handles.</span>

          {/* Target Interactive SVG canvas */}
          <svg
            width="300"
            height="300"
            viewBox="0 0 300 300"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) handleCanvasClick(e);
            }}
            className="w-[300px] h-[300px] bg-[#18191B] border border-[#2A2D30] rounded-xl relative shadow-lg"
          >
            {/* Draw Path */}
            <path
              d={dAttribute}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />

            {/* Draw curve control handle lines */}
            {nodes.map(n => {
              if (n.type === 'curve' && n.cx !== undefined && n.cy !== undefined) {
                // Find previous node
                const idx = nodes.indexOf(n);
                const prevNode = nodes[idx - 1] || nodes[0];
                return (
                  <g key={`handle-${n.id}`} className="opacity-60">
                    <line x1={prevNode.x} y1={prevNode.y} x2={n.cx} y2={n.cy} stroke="#72706C" strokeWidth="1" strokeDasharray="2" />
                    <line x1={n.x} y1={n.y} x2={n.cx} y2={n.cy} stroke="#72706C" strokeWidth="1" strokeDasharray="2" />
                    <circle
                      cx={n.cx}
                      cy={n.cy}
                      r="4.5"
                      fill="#D97706"
                      stroke="#111213"
                      strokeWidth="1.5"
                      className="cursor-move hover:scale-125 transition-transform"
                      onMouseDown={(e) => handleNodeMouseDown(n.id, true, e)}
                    />
                  </g>
                );
              }
              return null;
            })}

            {/* Draw vertex points */}
            {nodes.map(n => {
              const isActive = n.id === activeNodeId;
              return (
                <circle
                  key={n.id}
                  cx={n.x}
                  cy={n.y}
                  r={isActive ? '5.5' : '4.5'}
                  fill={isActive ? '#10B981' : '#3C6B4D'}
                  stroke="#111213"
                  strokeWidth="1.5"
                  className="cursor-move hover:scale-125 transition-transform"
                  onMouseDown={(e) => handleNodeMouseDown(n.id, false, e)}
                />
              );
            })}
          </svg>
        </div>

        {/* Exporter panel */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <div className="pb-2 border-b border-[#2A2D30] flex items-center justify-between">
            <span className="text-[10px] text-[#A3A09B] font-bold uppercase tracking-wider flex items-center gap-1"><PenTool size={13} className="text-[#3C6B4D]" /> SVG Output Code</span>
            <button
              onClick={handleCopy}
              className="py-1 px-3 bg-[#111213] hover:bg-[#1E2022] text-[#A3A09B] hover:text-[#ECEBE9] rounded-lg text-xs font-bold border border-[#2A2D30] flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>Copy SVG</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 bg-[#111213] p-3 rounded-xl border border-[#2A2D30]">
              <span className="text-[9px] text-[#72706C] font-bold uppercase">Path attribute (d)</span>
              <pre className="text-[10px] font-mono text-[#E29E2D] overflow-x-auto whitespace-pre-wrap select-all font-semibold break-all mt-1">
                {dAttribute}
              </pre>
            </div>
            <div className="flex flex-col gap-1 bg-[#111213] p-3 rounded-xl border border-[#2A2D30]">
              <span className="text-[9px] text-[#72706C] font-bold uppercase">Full SVG Tag Block</span>
              <pre className="text-[10px] font-mono text-[#E29E2D] overflow-x-auto whitespace-pre-wrap select-all font-semibold break-all mt-1">
                {fullSvgCode}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
