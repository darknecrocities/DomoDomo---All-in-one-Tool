import React, { useState, useEffect, useRef } from 'react';
import { unifiedMemory } from '../../utils/unifiedMemory';
import { Search, Eye, Trash2, Brain, RefreshCw, ZoomIn, ZoomOut, Database } from 'lucide-react';

interface VisualNode {
  id: string;
  label: string;
  text: string;
  source: string;
  category: 'document' | 'thought' | 'habit';
  x: number;
  y: number;
  vx: number;
  vy: number;
  originalData: any;
}

export const DomoNeuralAtlas: React.FC = () => {
  const [nodes, setNodes] = useState<VisualNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<VisualNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<SVGSVGElement | null>(null);

  const fetchMemorySpace = async () => {
    setIsLoading(true);
    try {
      const dbChunks = await unifiedMemory.getAllChunks();
      const recentActions = await unifiedMemory.getRecentActions(50);
      
      const newNodes: VisualNode[] = [];
      const width = 800;
      const height = 500;

      // Helper to generate coordinates
      const randomCoords = () => ({
        x: width / 2 + (Math.random() - 0.5) * 350,
        y: height / 2 + (Math.random() - 0.5) * 250,
      });

      // 1. Process document chunks (RAG)
      dbChunks.forEach((chunk, index) => {
        const coords = randomCoords();
        newNodes.push({
          id: `rag_${chunk.id || index}`,
          label: `RAG Chunk #${index + 1}`,
          text: chunk.text,
          source: chunk.metadata.source || 'Uploaded Document',
          category: 'document',
          x: coords.x,
          y: coords.y,
          vx: 0,
          vy: 0,
          originalData: chunk,
        });
      });

      // 2. Process recent user habits/activities
      recentActions.forEach((action, index) => {
        const coords = randomCoords();
        newNodes.push({
          id: `habit_${action.id || index}`,
          label: action.action,
          text: `Action: ${action.action}. Category: ${action.category}. Detail: ${action.detail || 'None'}`,
          source: `Activity Log (${new Date(action.timestamp).toLocaleDateString()})`,
          category: 'habit',
          x: coords.x,
          y: coords.y,
          vx: 0,
          vy: 0,
          originalData: action,
        });
      });

      // Simple Force-Directed Layout Simulation Loop (run a few ticks to spread them)
      const forceTicks = 60;
      for (let t = 0; t < forceTicks; t++) {
        // Gravity to center
        for (const node of newNodes) {
          const dx = width / 2 - node.x;
          const dy = height / 2 - node.y;
          node.vx += dx * 0.005;
          node.vy += dy * 0.005;
        }

        // Repulsion between nodes
        for (let i = 0; i < newNodes.length; i++) {
          for (let j = i + 1; j < newNodes.length; j++) {
            const nodeA = newNodes[i];
            const nodeB = newNodes[j];
            const dx = nodeB.x - nodeA.x;
            const dy = nodeB.y - nodeA.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            
            // Adjust minimum distance depending on category
            const minDist = 75;
            if (dist < minDist) {
              const force = (minDist - dist) / dist * 0.15;
              nodeA.vx -= dx * force;
              nodeA.vy -= dy * force;
              nodeB.vx += dx * force;
              nodeB.vy += dy * force;
            }
          }
        }

        // Apply velocities and friction
        for (const node of newNodes) {
          node.x += node.vx;
          node.y += node.vy;
          node.vx *= 0.85;
          node.vy *= 0.85;
          
          // Boundary checks
          node.x = Math.max(50, Math.min(width - 50, node.x));
          node.y = Math.max(50, Math.min(height - 50, node.y));
        }
      }

      setNodes(newNodes);
    } catch (e) {
      console.error('Error compiling neural memory map:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemorySpace();
  }, []);

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).tagName === 'svg') {
      setIsDraggingCanvas(true);
      dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDraggingCanvas) {
      setPan({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingCanvas(false);
  };

  const handleNodeClick = (node: VisualNode) => {
    setSelectedNode(node);
  };

  const handleDeleteNode = async (node: VisualNode) => {
    if (node.category === 'document') {
      const source = node.source;
      if (confirm(`Are you sure you want to delete all chunks belonging to source: "${source}"?`)) {
        await unifiedMemory.deleteKnowledge(source);
        setSelectedNode(null);
        fetchMemorySpace();
      }
    } else if (node.category === 'habit') {
      alert('Activity records are managed in local session timeline history.');
    }
  };

  // Filter nodes matching search
  const filteredNodes = nodes.filter(node => 
    node.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
    node.source.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#111213] text-[#ECEBE9] font-sans p-6 rounded-3xl border border-[#2A2D30] overflow-hidden">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-[#2A2D30] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/20">
              <Brain size={20} className="animate-pulse" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Domo Brain Neural Atlas</h1>
          </div>
          <p className="text-xs text-[#A3A09B]">
            Interactive 2D topological map of your local vector memory space, thoughts, and action logs.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-2.5 text-[#A3A09B]" size={16} />
            <input
              type="text"
              placeholder="Search concepts, text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#18191B] text-xs font-semibold pl-9 pr-4 py-2.5 rounded-xl border border-[#2A2D30] focus:border-[#3C6B4D] focus:outline-none w-full md:w-64"
            />
          </div>
          <button
            onClick={fetchMemorySpace}
            disabled={isLoading}
            className="p-2.5 bg-[#18191B] border border-[#2A2D30] rounded-xl hover:text-[#3C6B4D] transition-colors disabled:opacity-50"
            title="Refresh Space"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Map Body */}
      <div className="flex flex-col lg:flex-row flex-grow gap-6 min-h-0 overflow-hidden">
        {/* SVG Viewport */}
        <div 
          className="flex-grow bg-[#18191B]/40 rounded-3xl border border-[#2A2D30] relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        >
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111213]/80 z-10">
              <RefreshCw className="animate-spin text-[#3C6B4D] mb-3" size={32} />
              <div className="text-xs font-bold text-[#ECEBE9]">Compiling local semantic vector field...</div>
            </div>
          ) : filteredNodes.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center p-6">
              <Database className="text-[#2A2D30] mb-3 animate-bounce" size={48} />
              <div className="text-sm font-bold text-[#A3A09B]">No memory nodes matched search queries.</div>
              <p className="text-xs text-[#A3A09B]/70 max-w-xs mt-1">
                Upload some documents or use the Local AI chat to seed memory chunks here.
              </p>
            </div>
          ) : null}

          {/* Controls overlay */}
          <div className="absolute top-4 left-4 flex gap-1 z-20 bg-[#18191B] border border-[#2A2D30] rounded-xl p-1.5 shadow-lg">
            <button 
              onClick={() => setZoom(z => Math.min(2.5, z + 0.15))}
              className="p-1.5 hover:bg-[#2A2D30] rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
            <button 
              onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}
              className="p-1.5 hover:bg-[#2A2D30] rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
            <button 
              onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
              className="px-2 text-[10px] font-bold uppercase hover:bg-[#2A2D30] rounded-lg transition-colors"
              title="Reset View"
            >
              Reset
            </button>
          </div>

          <svg 
            ref={canvasRef}
            width="100%"
            height="100%"
            viewBox="0 0 800 500"
            className="w-full h-full"
          >
            {/* Grid background */}
            <defs>
              <pattern id="neural-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#2A2D30" strokeWidth="0.5" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#neural-grid)" />

            {/* Transform Group */}
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* Force directed links (connections between similar category nodes) */}
              {filteredNodes.map((n, i) => {
                // Find next node of same category to draw a link
                const nextNode = filteredNodes.slice(i + 1).find(other => other.category === n.category);
                if (!nextNode) return null;
                return (
                  <line
                    key={`link_${n.id}_${nextNode.id}`}
                    x1={n.x}
                    y1={n.y}
                    x2={nextNode.x}
                    y2={nextNode.y}
                    stroke={
                      n.category === 'document' ? '#3C6B4D' : 
                      n.category === 'thought' ? '#E29E2D' : '#3c82f6'
                    }
                    strokeWidth={0.5}
                    strokeDasharray="4 4"
                    opacity={0.15}
                  />
                );
              })}

              {/* Node Renderers */}
              {filteredNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const isMatch = searchQuery && (node.text.toLowerCase().includes(searchQuery.toLowerCase()) || node.source.toLowerCase().includes(searchQuery.toLowerCase()));

                return (
                  <g 
                    key={node.id} 
                    transform={`translate(${node.x}, ${node.y})`}
                    className="cursor-pointer"
                    onClick={() => handleNodeClick(node)}
                  >
                    {/* Glowing outer shadow ring */}
                    <circle
                      r={isSelected ? 16 : isMatch ? 14 : 10}
                      fill="none"
                      stroke={
                        node.category === 'document' ? '#3C6B4D' : 
                        node.category === 'thought' ? '#E29E2D' : '#3c82f6'
                      }
                      strokeWidth={isSelected ? 4 : 2}
                      opacity={isSelected ? 0.6 : isMatch ? 0.4 : 0.15}
                      className={isMatch ? 'animate-pulse' : ''}
                    />

                    {/* Central core node */}
                    <circle
                      r={isSelected ? 8 : 6}
                      fill={
                        node.category === 'document' ? '#3C6B4D' : 
                        node.category === 'thought' ? '#E29E2D' : '#3c82f6'
                      }
                    />

                    {/* Labels only shown if zoomed in or selected */}
                    {(zoom > 0.8 || isSelected) && (
                      <text
                        y={-14}
                        textAnchor="middle"
                        fill="#ECEBE9"
                        fontSize={10}
                        fontWeight={isSelected ? 'bold' : 'normal'}
                        className="bg-[#111213] fill-[#ECEBE9] px-1 pointer-events-none select-none text-[8px]"
                      >
                        {node.label.length > 15 ? node.label.slice(0, 15) + '...' : node.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Legends overlay */}
          <div className="absolute bottom-4 left-4 flex gap-4 bg-[#18191B]/80 backdrop-blur-md border border-[#2A2D30] px-4 py-2.5 rounded-2xl text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3C6B4D]" />
              <span className="text-[#A3A09B]">Knowledge (RAG)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E29E2D]" />
              <span className="text-[#A3A09B]">Thoughts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3c82f6]" />
              <span className="text-[#A3A09B]">Activities</span>
            </div>
          </div>
        </div>

        {/* Sidebar Info Panel */}
        <div className="w-full lg:w-80 bg-[#18191B] border border-[#2A2D30] rounded-3xl p-5 flex flex-col justify-between min-h-0 select-text">
          {selectedNode ? (
            <div className="flex flex-col h-full justify-between min-h-0">
              <div className="min-h-0 overflow-y-auto pr-1">
                {/* Category label */}
                <span className={`inline-block px-2.5 py-1 text-[9px] font-bold uppercase rounded-lg mb-3 ${
                  selectedNode.category === 'document' ? 'bg-[#3C6B4D]/10 text-[#3C6B4D]' : 
                  selectedNode.category === 'thought' ? 'bg-[#E29E2D]/10 text-[#E29E2D]' : 'bg-[#3c82f6]/10 text-[#3c82f6]'
                }`}>
                  {selectedNode.category}
                </span>

                <h2 className="text-sm font-bold text-[#ECEBE9] mb-2">{selectedNode.label}</h2>
                
                {/* Source details */}
                <div className="flex items-center gap-1 text-[10px] text-[#A3A09B] mb-4">
                  <Database size={12} />
                  <span className="truncate max-w-[200px]" title={selectedNode.source}>{selectedNode.source}</span>
                </div>

                <hr className="border-[#2A2D30] mb-4" />

                {/* Content body */}
                <div className="bg-[#111213] rounded-2xl p-4 border border-[#2A2D30]/60 max-h-64 overflow-y-auto mb-4">
                  <p className="text-xs leading-relaxed text-[#ECEBE9]/90 italic">
                    "{selectedNode.text}"
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-4 border-t border-[#2A2D30]">
                {selectedNode.category === 'document' && (
                  <button
                    onClick={() => handleDeleteNode(selectedNode)}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#f87171]/10 text-[#f87171] border border-[#f87171]/20 hover:bg-[#f87171]/20 rounded-xl text-xs font-bold transition-all w-full"
                  >
                    <Trash2 size={14} />
                    Purge Source Vectors
                  </button>
                )}
                <button
                  onClick={() => setSelectedNode(null)}
                  className="py-2.5 px-4 bg-[#2A2D30] hover:bg-[#34383c] rounded-xl text-xs font-bold text-[#ECEBE9] transition-all w-full text-center"
                >
                  Close Panel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-[#A3A09B]">
              <Eye size={36} className="text-[#2A2D30] mb-3" />
              <div className="text-xs font-bold text-[#ECEBE9]">Inspect Memory Node</div>
              <p className="text-[10px] text-[#A3A09B] mt-1 max-w-[180px]">
                Click on any node in the vector field to view its raw contents, semantic source coordinates, and purge database vectors.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default DomoNeuralAtlas;
