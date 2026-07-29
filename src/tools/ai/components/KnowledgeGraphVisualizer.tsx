import React, { useState } from 'react';
import { Layers, Eye, Plus, Sparkles, Download, FileText } from 'lucide-react';
import { triggerBlobDownload } from '../../../utils/sharedHelpers';

interface NodeItem {
  id: string;
  label: string;
  category: 'tool' | 'concept' | 'tech';
  x: number;
  y: number;
}

interface EdgeItem {
  from: string;
  to: string;
  label: string;
}

export const KnowledgeGraphVisualizer: React.FC = () => {
  const [nodes, setNodes] = useState<NodeItem[]>([
    { id: '1', label: 'DomoDomo Platform', category: 'tool', x: 220, y: 150 },
    { id: '2', label: 'Ollama Engine', category: 'tech', x: 100, y: 80 },
    { id: '3', label: 'WebAssembly (Wasm)', category: 'tech', x: 340, y: 80 },
    { id: '4', label: 'IndexedDB Memory', category: 'concept', x: 100, y: 230 },
    { id: '5', label: 'Vector Store RAG', category: 'concept', x: 340, y: 230 }
  ]);

  const [edges, setEdges] = useState<EdgeItem[]>([
    { from: '1', to: '2', label: 'connects via HTTP' },
    { from: '1', to: '3', label: 'accelerates pipelines' },
    { from: '1', to: '4', label: 'persists state' },
    { from: '1', to: '5', label: 'indexes chunks' }
  ]);

  const [selectedNode, setSelectedNode] = useState<NodeItem | null>(nodes[0]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [extractText, setExtractText] = useState<string>(
    'DomoDomo utilizes React and TypeScript to build low-latency interfaces. Local AI connects to Ollama for offline LLM inference.'
  );

  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeCat, setNewNodeCat] = useState<'tool' | 'concept' | 'tech'>('tech');

  const filteredNodes = nodes.filter(n => filterCategory === 'all' || n.category === filterCategory);

  const handleExtractFromText = () => {
    if (!extractText.trim()) return;
    const lower = extractText.toLowerCase();

    const newNodesList: NodeItem[] = [...nodes];
    const newEdgesList: EdgeItem[] = [...edges];

    const addIfMissing = (label: string, category: 'tool' | 'concept' | 'tech', x: number, y: number) => {
      let existing = newNodesList.find(n => n.label.toLowerCase() === label.toLowerCase());
      if (!existing) {
        existing = { id: (newNodesList.length + 1).toString(), label, category, x, y };
        newNodesList.push(existing);
      }
      return existing;
    };

    if (lower.includes('react')) {
      const rNode = addIfMissing('React Framework', 'tech', 180, 50);
      newEdgesList.push({ from: '1', to: rNode.id, label: 'built with' });
    }
    if (lower.includes('typescript')) {
      const tsNode = addIfMissing('TypeScript', 'tech', 280, 50);
      newEdgesList.push({ from: '1', to: tsNode.id, label: 'strictly typed' });
    }

    setNodes(newNodesList);
    setEdges(newEdgesList);
  };

  const handleAddCustomNode = () => {
    if (!newNodeName.trim()) return;
    const newNode: NodeItem = {
      id: (nodes.length + 1).toString(),
      label: newNodeName.trim(),
      category: newNodeCat,
      x: Math.floor(Math.random() * 300) + 80,
      y: Math.floor(Math.random() * 180) + 60
    };
    setNodes(prev => [...prev, newNode]);
    if (selectedNode) {
      setEdges(prev => [...prev, { from: selectedNode.id, to: newNode.id, label: 'relates to' }]);
    }
    setNewNodeName('');
  };

  const handleExportGraph = () => {
    triggerBlobDownload(
      new Blob([JSON.stringify({ nodes, edges }, null, 2)], { type: 'application/json' }),
      'knowledge_graph_export.json'
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-[#18191B] border border-[#2A2D30] p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#3C6B4D]/15 text-[#3C6B4D] text-[10px] font-bold uppercase tracking-wider mb-1">
            <Layers size={12} />
            <span>Interactive Entity-Relationship Graph</span>
          </div>
          <h2 className="text-lg font-extrabold text-[#ECEBE9]">Knowledge Graph Visualizer</h2>
          <p className="text-[#72706C] text-xs mt-0.5">Extract entities, memory nodes, and relationships from chat logs &amp; documents client-side.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportGraph}
            className="px-3.5 py-2 bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs font-bold rounded-xl transition-all flex items-center gap-2"
          >
            <Download size={14} /> Export JSON
          </button>
          {(['all', 'tool', 'tech', 'concept'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all uppercase ${
                filterCategory === cat ? 'bg-[#3C6B4D] text-white' : 'bg-[#111213] text-[#72706C] border border-[#2A2D30]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Auto Entity Extraction Bar */}
      <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-3">
        <label className="text-xs font-bold text-[#A3A09B] flex items-center gap-2">
          <FileText size={14} className="text-[#3C6B4D]" /> Auto Entity Extractor from Document Text
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={extractText}
            onChange={e => setExtractText(e.target.value)}
            className="flex-1 bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D]"
            placeholder="Type text to extract entities and connections..."
          />
          <button
            onClick={handleExtractFromText}
            className="px-4 py-2 bg-[#3C6B4D] hover:bg-[#2E533B] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0"
          >
            <Sparkles size={14} /> Extract Nodes
          </button>
        </div>
      </div>

      {/* SVG Interactive Canvas & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Graph Canvas */}
        <div className="lg:col-span-8 bg-[#111213] border border-[#2A2D30] rounded-2xl p-4 h-96 relative overflow-hidden flex items-center justify-center">
          <svg className="w-full h-full">
            {/* Edges */}
            {edges.map((edge, idx) => {
              const fromN = nodes.find(n => n.id === edge.from);
              const toN = nodes.find(n => n.id === edge.to);
              if (!fromN || !toN) return null;
              return (
                <g key={idx}>
                  <line
                    x1={fromN.x} y1={fromN.y}
                    x2={toN.x} y2={toN.y}
                    stroke="#2A2D30" strokeWidth="2" strokeDasharray="4 2"
                  />
                  <text
                    x={(fromN.x + toN.x) / 2} y={(fromN.y + toN.y) / 2 - 6}
                    fill="#72706C" fontSize="9" textAnchor="middle" className="font-mono"
                  >
                    {edge.label}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {filteredNodes.map(node => {
              const isSelected = selectedNode?.id === node.id;
              const color = node.category === 'tool' ? '#3C6B4D' : node.category === 'tech' ? '#10A37F' : '#A855F7';
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer group"
                >
                  <circle
                    r={isSelected ? 22 : 18}
                    fill="#18191B"
                    stroke={color}
                    strokeWidth={isSelected ? 3 : 2}
                    className="transition-all group-hover:scale-110"
                  />
                  <text y={4} fill="#ECEBE9" fontSize="10" fontWeight="bold" textAnchor="middle" className="pointer-events-none select-none">
                    {node.label.charAt(0)}
                  </text>
                  <text y={32} fill="#ECEBE9" fontSize="10" fontWeight="bold" textAnchor="middle" className="pointer-events-none select-none">
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Entity Inspector & Custom Node Form */}
        <div className="lg:col-span-4 bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-4">
          <span className="text-xs font-extrabold text-[#ECEBE9] flex items-center gap-2 border-b border-[#2A2D30] pb-2">
            <Eye size={14} className="text-[#3C6B4D]" /> Entity Inspector &amp; Creator
          </span>

          {/* Add Custom Node Form */}
          <div className="bg-[#111213] border border-[#2A2D30] p-3 rounded-xl space-y-2 text-xs">
            <span className="font-bold text-[#A3A09B] block">Add Custom Graph Node</span>
            <input
              type="text"
              value={newNodeName}
              onChange={e => setNewNodeName(e.target.value)}
              placeholder="Entity Name..."
              className="w-full bg-[#18191B] border border-[#2A2D30] rounded-lg px-2.5 py-1 text-xs text-[#ECEBE9] font-mono focus:outline-none"
            />
            <div className="flex gap-2">
              <select
                value={newNodeCat}
                onChange={e => setNewNodeCat(e.target.value as any)}
                className="bg-[#18191B] border border-[#2A2D30] rounded-lg px-2 py-1 text-xs text-[#ECEBE9]"
              >
                <option value="tech">Tech</option>
                <option value="concept">Concept</option>
                <option value="tool">Tool</option>
              </select>
              <button
                onClick={handleAddCustomNode}
                className="flex-1 py-1 bg-[#3C6B4D] hover:bg-[#2E533B] text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1"
              >
                <Plus size={12} /> Add Node
              </button>
            </div>
          </div>

          {selectedNode ? (
            <div className="space-y-3 text-xs">
              <div className="bg-[#111213] border border-[#2A2D30] p-3 rounded-xl space-y-1">
                <span className="text-[10px] text-[#72706C] uppercase font-bold">Node Name</span>
                <p className="font-extrabold text-[#ECEBE9] text-sm">{selectedNode.label}</p>
                <span className="text-[9px] font-mono text-[#3C6B4D] uppercase font-bold bg-[#3C6B4D]/15 px-2 py-0.5 rounded border border-[#3C6B4D]/30 inline-block mt-1">
                  Category: {selectedNode.category}
                </span>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-[#72706C] uppercase font-bold">Connected Links</span>
                {edges.filter(e => e.from === selectedNode.id || e.to === selectedNode.id).map((e, idx) => (
                  <div key={idx} className="bg-[#111213] border border-[#2A2D30] p-2 rounded-lg font-mono text-[11px] text-[#A3A09B]">
                    {e.label}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#72706C]">Select a node in the graph to inspect relationships.</p>
          )}
        </div>
      </div>
    </div>
  );
};
