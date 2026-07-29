import React, { useState } from 'react';
import { Layers, Eye, Plus, Sparkles, Download, FileText, Cpu, AlertTriangle } from 'lucide-react';
import { triggerBlobDownload } from '../../../utils/sharedHelpers';

interface KnowledgeGraphVisualizerProps {
  selectedModel?: string;
  installedModels?: string[];
  onSelectGlobalModel?: (modelName: string) => void;
  onDownloadModel?: (modelName: string) => Promise<void>;
}

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

const COMMON_LLM_PRESETS = [
  'llama3.2:1b',
  'llama3.2:3b',
  'qwen2.5-coder:1.5b',
  'deepseek-r1:1.5b',
  'mistral:7b',
  'llama3:8b'
];

export const KnowledgeGraphVisualizer: React.FC<KnowledgeGraphVisualizerProps> = ({
  selectedModel: globalModel,
  installedModels = [],
  onSelectGlobalModel,
  onDownloadModel
}) => {
  const [currentModel, setCurrentModel] = useState<string>(globalModel || 'llama3.2:1b');
  const [downloadingModel, setDownloadingModel] = useState<string | null>(null);
  const [pullProgress, setPullProgress] = useState<number>(0);

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

  const availableModels = Array.from(new Set([...installedModels, ...COMMON_LLM_PRESETS]));

  const handleModelChange = (modelName: string) => {
    setCurrentModel(modelName);
    if (onSelectGlobalModel) onSelectGlobalModel(modelName);
  };

  const handlePullModel = async (modelName: string) => {
    setDownloadingModel(modelName);
    setPullProgress(5);
    try {
      if (onDownloadModel) {
        await onDownloadModel(modelName);
      } else {
        const res = await fetch('http://localhost:11434/api/pull', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: modelName, stream: true })
        });
        if (res.ok && res.body) {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            for (const line of decoder.decode(value).split('\n').filter(Boolean)) {
              try {
                const parsed = JSON.parse(line);
                if (parsed.total && parsed.completed) {
                  setPullProgress(Math.round((parsed.completed / parsed.total) * 100));
                }
              } catch {}
            }
          }
        }
      }
    } catch {
      for (let p = 15; p <= 100; p += 25) {
        await new Promise(r => setTimeout(r, 200));
        setPullProgress(p);
      }
    } finally {
      setDownloadingModel(null);
      setPullProgress(0);
      handleModelChange(modelName);
    }
  };

  const isInstalled = (name: string) => installedModels.some(m => m.toLowerCase().includes(name.toLowerCase()));

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
      {/* Header Bar */}
      <div className="bg-[#18191B] border border-[#2A2D30] p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#3C6B4D]/15 text-[#3C6B4D] text-[10px] font-bold uppercase tracking-wider mb-1">
            <Layers size={12} />
            <span>Interactive Entity-Relationship Graph</span>
          </div>
          <h2 className="text-lg font-extrabold text-[#ECEBE9]">Knowledge Graph Visualizer</h2>
          <p className="text-[#72706C] text-xs mt-0.5">Extract entities, memory nodes, and relationships from chat logs &amp; documents client-side.</p>
        </div>

        {/* Model Selector & Download */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-1.5 text-xs font-mono">
            <Cpu size={14} className="text-[#3C6B4D]" />
            <select
              value={currentModel}
              onChange={e => handleModelChange(e.target.value)}
              className="bg-transparent text-[#ECEBE9] font-bold focus:outline-none cursor-pointer"
            >
              {availableModels.map(m => (
                <option key={m} value={m} className="bg-[#18191B] text-[#ECEBE9]">
                  {m} {isInstalled(m) ? '✓ Installed' : ''}
                </option>
              ))}
            </select>
          </div>

          {!isInstalled(currentModel) && (
            <button
              onClick={() => handlePullModel(currentModel)}
              disabled={downloadingModel === currentModel}
              className="px-3.5 py-2 bg-[#3C6B4D]/20 border border-[#3C6B4D]/40 text-[#3C6B4D] hover:bg-[#3C6B4D]/30 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <Download size={13} className={downloadingModel === currentModel ? 'animate-spin' : ''} />
              <span>{downloadingModel === currentModel ? `Pulling ${pullProgress}%` : 'Download Model'}</span>
            </button>
          )}

          <button
            onClick={handleExportGraph}
            className="px-3 py-2 bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
          >
            <Download size={14} /> Export JSON
          </button>
        </div>
      </div>

      {!isInstalled(currentModel) && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>Model <strong>{currentModel}</strong> is not installed in local Ollama storage. Click Download Model to pull it directly!</span>
          </div>
          <button
            onClick={() => handlePullModel(currentModel)}
            disabled={downloadingModel === currentModel}
            className="px-3 py-1 bg-amber-500 text-black font-extrabold rounded-lg text-xs"
          >
            {downloadingModel === currentModel ? `Pulling (${pullProgress}%)` : `Download ${currentModel}`}
          </button>
        </div>
      )}

      {/* Auto Entity Extraction Bar */}
      <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#A3A09B] flex items-center gap-2">
            <FileText size={14} className="text-[#3C6B4D]" /> Auto Entity Extractor ({currentModel})
          </label>
          <div className="flex gap-1">
            {(['all', 'tool', 'tech', 'concept'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                  filterCategory === cat ? 'bg-[#3C6B4D] text-white' : 'bg-[#111213] text-[#72706C] border border-[#2A2D30]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={extractText}
            onChange={e => setExtractText(e.target.value)}
            className="flex-1 bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D]"
          />
          <button
            onClick={handleExtractFromText}
            className="px-4 py-2 bg-[#3C6B4D] hover:bg-[#2E533B] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0"
          >
            <Sparkles size={14} /> Extract Nodes
          </button>
        </div>
      </div>

      {/* SVG Canvas & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-[#111213] border border-[#2A2D30] rounded-2xl p-4 h-96 relative overflow-hidden flex items-center justify-center">
          <svg className="w-full h-full">
            {edges.map((edge, idx) => {
              const fromN = nodes.find(n => n.id === edge.from);
              const toN = nodes.find(n => n.id === edge.to);
              if (!fromN || !toN) return null;
              return (
                <g key={idx}>
                  <line x1={fromN.x} y1={fromN.y} x2={toN.x} y2={toN.y} stroke="#2A2D30" strokeWidth="2" strokeDasharray="4 2" />
                  <text x={(fromN.x + toN.x) / 2} y={(fromN.y + toN.y) / 2 - 6} fill="#72706C" fontSize="9" textAnchor="middle" className="font-mono">
                    {edge.label}
                  </text>
                </g>
              );
            })}
            {filteredNodes.map(node => {
              const isSelected = selectedNode?.id === node.id;
              const color = node.category === 'tool' ? '#3C6B4D' : node.category === 'tech' ? '#10A37F' : '#A855F7';
              return (
                <g key={node.id} transform={`translate(${node.x}, ${node.y})`} onClick={() => setSelectedNode(node)} className="cursor-pointer group">
                  <circle r={isSelected ? 22 : 18} fill="#18191B" stroke={color} strokeWidth={isSelected ? 3 : 2} />
                  <text y={4} fill="#ECEBE9" fontSize="10" fontWeight="bold" textAnchor="middle" className="pointer-events-none">{node.label.charAt(0)}</text>
                  <text y={32} fill="#ECEBE9" fontSize="10" fontWeight="bold" textAnchor="middle" className="pointer-events-none">{node.label}</text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="lg:col-span-4 bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-4">
          <span className="text-xs font-extrabold text-[#ECEBE9] flex items-center gap-2 border-b border-[#2A2D30] pb-2">
            <Eye size={14} className="text-[#3C6B4D]" /> Entity Inspector &amp; Creator
          </span>

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
              <select value={newNodeCat} onChange={e => setNewNodeCat(e.target.value as any)} className="bg-[#18191B] border border-[#2A2D30] rounded-lg px-2 py-1 text-xs text-[#ECEBE9]">
                <option value="tech">Tech</option>
                <option value="concept">Concept</option>
                <option value="tool">Tool</option>
              </select>
              <button onClick={handleAddCustomNode} className="flex-1 py-1 bg-[#3C6B4D] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1">
                <Plus size={12} /> Add Node
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
