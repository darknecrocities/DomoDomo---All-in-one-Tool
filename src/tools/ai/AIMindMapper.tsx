import { useState } from 'react';
import { Network, Loader2, Copy, Check, Download, Sparkles, ChevronRight, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { handleTextCopy } from '../../utils/sharedHelpers';
import { LocalAIConfigPanel } from '../../components/LocalAIConfigPanel';

interface MapNode {
  id: string;
  label: string;
  children: MapNode[];
  collapsed: boolean;
  depth: number;
}

const depthColors = ['text-violet-400', 'text-teal-400', 'text-amber-400', 'text-rose-400'];
const depthBg = ['bg-violet-950/30 border-violet-800/40', 'bg-teal-950/30 border-teal-800/40', 'bg-amber-950/30 border-amber-800/40', 'bg-rose-950/30 border-rose-800/40'];

let nodeCounter = 100;
const newId = () => `node-${++nodeCounter}`;

function buildTree(text: string, depth = 0, parentId = 'root'): MapNode[] {
  const lines = text.split('\n').filter(l => l.trim());
  const nodes: MapNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim().replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '');
    if (line) {
      nodes.push({ id: `${parentId}-${i}`, label: line, children: [], collapsed: false, depth });
    }
    i++;
  }
  return nodes;
}

function MapNodeComponent({ node, onToggle, onDelete, onAdd }: { node: MapNode; onToggle: (id: string) => void; onDelete: (id: string) => void; onAdd: (parentId: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${depthBg[Math.min(node.depth, 3)]} transition-all hover:opacity-90`}>
        {node.children.length > 0 ? (
          <button onClick={() => onToggle(node.id)} className={`${depthColors[Math.min(node.depth, 3)]} flex-shrink-0`}>
            {node.collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
          </button>
        ) : <span className="w-3 flex-shrink-0" />}
        <span className={`flex-1 ${depthColors[Math.min(node.depth, 3)]}`}>{node.label}</span>
        <button onClick={() => onAdd(node.id)} className="text-slate-600 hover:text-slate-300 flex-shrink-0 transition-colors"><Plus size={11} /></button>
        <button onClick={() => onDelete(node.id)} className="text-slate-700 hover:text-red-400 flex-shrink-0 transition-colors"><Trash2 size={10} /></button>
      </div>
      {!node.collapsed && node.children.length > 0 && (
        <div className="ml-5 pl-3 border-l border-slate-800/60 flex flex-col gap-1">
          {node.children.map(child => (
            <MapNodeComponent key={child.id} node={child} onToggle={onToggle} onDelete={onDelete} onAdd={onAdd} />
          ))}
        </div>
      )}
    </div>
  );
}

function toggleNode(nodes: MapNode[], id: string): MapNode[] {
  return nodes.map(n => ({
    ...n,
    collapsed: n.id === id ? !n.collapsed : n.collapsed,
    children: toggleNode(n.children, id),
  }));
}

function deleteNode(nodes: MapNode[], id: string): MapNode[] {
  return nodes.filter(n => n.id !== id).map(n => ({ ...n, children: deleteNode(n.children, id) }));
}

function addChildNode(nodes: MapNode[], parentId: string, depth: number): MapNode[] {
  return nodes.map(n => {
    if (n.id === parentId) {
      return { ...n, children: [...n.children, { id: newId(), label: 'New Node', children: [], collapsed: false, depth: depth + 1 }] };
    }
    return { ...n, children: addChildNode(n.children, parentId, n.depth) };
  });
}

function nodesToMarkdown(nodes: MapNode[], indent = 0): string {
  return nodes.map(n => `${'  '.repeat(indent)}- ${n.label}\n${nodesToMarkdown(n.children, indent + 1)}`).join('');
}

export const AIMindMapperTool = () => {
  const [topic, setTopic] = useState('Machine Learning');
  const [depth, setDepth] = useState(3);
  const [mapNodes, setMapNodes] = useState<MapNode[]>([]);
  const [centralTopic, setCentralTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const [selectedModel, setSelectedModel] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are a knowledge organizer. Create comprehensive, well-structured mind maps that capture all key aspects of a topic hierarchically.');
  const [temperature, setTemperature] = useState(0.65);
  const [maxTokens, setMaxTokens] = useState(400);

  const generateMap = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setStatusMsg('Generating mind map...');
    try {
      const result = await aiService.generateText(
        `Create a ${depth}-level mind map for the topic: "${topic}".\n\nFormat as a nested JSON structure:\n{"center":"${topic}","branches":[{"label":"Main Branch 1","children":[{"label":"Sub-topic 1.1","children":[{"label":"Detail 1.1.1","children":[]}]},{"label":"Sub-topic 1.2","children":[]}]},{"label":"Main Branch 2","children":[]}]}\n\nCreate 5-7 main branches with 2-4 sub-topics each.`,
        600,
        undefined,
        selectedModel || undefined,
        { systemPrompt, temperature }
      );
      const match = result.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        setCentralTopic(parsed.center || topic);
        const buildNodes = (items: any[], depth = 1): MapNode[] =>
          (items || []).map((item: any) => ({
            id: newId(),
            label: item.label || item,
            children: buildNodes(item.children || [], depth + 1),
            collapsed: depth >= 3,
            depth,
          }));
        setMapNodes(buildNodes(parsed.branches || []));
      } else {
        setCentralTopic(topic);
        setMapNodes(buildTree(result, 1));
      }
    } catch { setStatusMsg('Error. Ensure Ollama is running.'); setTimeout(() => setStatusMsg(''), 3000); }
    setStatusMsg('');
    setLoading(false);
  };

  const expandBranch = async (label: string) => {
    setLoading(true);
    setStatusMsg(`Expanding "${label}"...`);
    try {
      await aiService.generateText(
        `Expand this mind map branch "${label}" (part of "${centralTopic || topic}"). List 4-6 specific sub-topics or key points as a simple bullet list.`,
        200,
        undefined,
        selectedModel || undefined,
        { systemPrompt, temperature }
      );
    } catch {}
    setStatusMsg('');
    setLoading(false);
  };

  const exportMarkdown = () => {
    const content = `# ${centralTopic || topic}\n\n${nodesToMarkdown(mapNodes)}`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    a.download = `${topic}-mindmap.md`;
    a.click();
  };

  const exportText = () => {
    const content = `MIND MAP: ${centralTopic || topic}\n\n${mapNodes.map(n => `• ${n.label}\n${n.children.map(c => `  ◦ ${c.label}\n${c.children.map(g => `    ▪ ${g.label}`).join('\n')}`).join('\n')}`).join('\n')}`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    a.download = `${topic}-mindmap.txt`;
    a.click();
  };

  const markdownOutput = mapNodes.length > 0 ? `# ${centralTopic || topic}\n\n${nodesToMarkdown(mapNodes)}` : '';

  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto">
      <LocalAIConfigPanel
        systemPrompt={systemPrompt} onSystemPromptChange={setSystemPrompt}
        temperature={temperature} onTemperatureChange={setTemperature}
        maxTokens={maxTokens} onMaxTokensChange={setMaxTokens}
        selectedModel={selectedModel} onModelChange={setSelectedModel}
      />

      {/* Input */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <input value={topic} onChange={e => setTopic(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
            placeholder="Enter a topic to mind map..." />
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3">
            <span className="text-[10px] text-slate-500 font-semibold whitespace-nowrap">Depth: {depth}</span>
            <input type="range" min={1} max={4} value={depth} onChange={e => setDepth(+e.target.value)}
              className="w-20 accent-violet-500" />
          </div>
          <button onClick={generateMap} disabled={loading || !topic.trim()}
            className="flex items-center gap-2 bg-violet-700 hover:bg-violet-600 disabled:opacity-50 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-all active:scale-95">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Network size={15} />}
            <span>{loading ? statusMsg || 'Generating...' : 'Map It'}</span>
          </button>
        </div>
      </div>

      {mapNodes.length > 0 && (
        <div className="flex flex-col gap-4">
          {/* Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-2 text-sm font-bold text-violet-400">
              <Network size={16} /> {centralTopic || topic}
            </span>
            <div className="ml-auto flex gap-1.5">
              <button onClick={() => handleTextCopy(markdownOutput, setCopied)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all">
                {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />} Copy MD
              </button>
              <button onClick={exportMarkdown}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all">
                <Download size={12} /> .md
              </button>
              <button onClick={exportText}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all">
                <Download size={12} /> .txt
              </button>
              <button onClick={() => expandBranch(mapNodes[0]?.label || '')} disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-900/40 hover:bg-violet-900/60 border border-violet-800/40 text-violet-300 rounded-lg text-xs font-bold transition-all disabled:opacity-50">
                <Sparkles size={12} /> Expand
              </button>
            </div>
          </div>

          {/* Color legend */}
          <div className="flex gap-3 flex-wrap text-[10px]">
            {['Main Branch', 'Sub-topic', 'Detail', 'Sub-detail'].slice(0, depth).map((label, i) => (
              <span key={i} className={`flex items-center gap-1 ${depthColors[i]}`}>
                <span className="w-2 h-2 rounded-full bg-current" /> {label}
              </span>
            ))}
          </div>

          {/* Mind map tree */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 max-h-[30rem] overflow-auto">
            <div className="flex flex-col gap-2">
              {mapNodes.map(node => (
                <MapNodeComponent
                  key={node.id}
                  node={node}
                  onToggle={(id) => setMapNodes(prev => toggleNode(prev, id))}
                  onDelete={(id) => setMapNodes(prev => deleteNode(prev, id))}
                  onAdd={(parentId) => setMapNodes(prev => addChildNode(prev, parentId, 1))}
                />
              ))}
              <button onClick={() => setMapNodes(prev => [...prev, { id: newId(), label: 'New Branch', children: [], collapsed: false, depth: 1 }])}
                className="flex items-center gap-2 px-3 py-1.5 text-slate-600 hover:text-violet-400 text-xs border border-dashed border-slate-800 hover:border-violet-800 rounded-lg transition-all">
                <Plus size={12} /> Add Branch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
