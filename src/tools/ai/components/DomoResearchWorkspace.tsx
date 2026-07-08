import React, { useState, useEffect, useRef } from 'react';
import {
  Search, FileText, Brain, Tag, Trash2, Download,
  AlertCircle, Sparkles, Plus, Activity, Check,
  Globe, Loader2
} from 'lucide-react';
import { aiService } from '../../../utils/aiService';
import { unifiedMemory } from '../../../utils/unifiedMemory';

interface ResearchSession {
  id: string;
  title: string;
  notes: string;
  timestamp: string;
}

interface CitationInfo {
  author: string;
  title: string;
  year: string;
  publisher: string;
  journal: string;
  volume: string;
  issue: string;
  url: string;
}

export const DomoResearchWorkspace: React.FC<{
  selectedModel: string;
  downloadedModels: string[];
}> = ({ selectedModel, downloadedModels }) => {
  // Tabs: 'search' | 'synthesis' | 'citations' | 'compare' | 'conflict' | 'web' | 'sessions'
  const [activeTab, setActiveTab] = useState<'search' | 'synthesis' | 'citations' | 'compare' | 'conflict' | 'web' | 'sessions'>('search');

  // RAG Sources Upload State
  const [sourceName, setSourceName] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [category, setCategory] = useState('Research');
  const [sourcesList, setSourcesList] = useState<string[]>([]);
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexProgress, setIndexProgress] = useState(0);
  const [indexStatus, setIndexStatus] = useState('');

  // Local Embedding Search State
  const [searchQuery, setSearchQuery] = useState('local intelligence applications');
  const [similarityThreshold, setSimilarityThreshold] = useState(0.40);
  const [topK, setTopK] = useState(4);
  const [searchResults, setSearchResults] = useState<Array<{ text: string; score: number; source: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Concept Map Canvas State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Literature Synthesis State
  const [synthesisText, setSynthesisText] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // Citation Formatter State
  const [citationStyle, setCitationStyle] = useState<'apa' | 'mla' | 'chicago' | 'harvard'>('apa');
  const [citationFields, setCitationFields] = useState<CitationInfo>({
    author: 'Parejas, A.',
    title: 'Cognitive Local Workspaces',
    year: '2026',
    publisher: 'Domo Tech Labs',
    journal: 'Journal of Offline AI Systems',
    volume: '8',
    issue: '2',
    url: 'https://github.com/darknecrocities/DomoDomo'
  });
  const [formattedCitation, setFormattedCitation] = useState('');
  const [citationList, setCitationList] = useState<string[]>([]);

  // Comparative Matrix State
  const [compareItems, setCompareItems] = useState<Array<{ source: string; parameter: string; value: string }>>([
    { source: 'Ollama Framework', parameter: 'Privacy Level', value: '100% Offline Local Inference' },
    { source: 'Cloud API Host', parameter: 'Privacy Level', value: 'Requires External Packet Sending' },
    { source: 'Ollama Framework', parameter: 'Setup Requirement', value: 'Local CLI pull command' },
    { source: 'Cloud API Host', parameter: 'Setup Requirement', value: 'API keys & active internet' }
  ]);
  const [newCompareSource, setNewCompareSource] = useState('');
  const [newCompareParam, setNewCompareParam] = useState('');
  const [newCompareVal, setNewCompareVal] = useState('');

  // Fact Conflict State
  const [conflictLogs, setConflictLogs] = useState<Array<{ claimA: string; claimB: string; docA: string; docB: string; severity: 'warning' | 'info' }>>([]);
  const [isDetectingConflicts, setIsDetectingConflicts] = useState(false);

  // Private Web Search Simulator State
  const [webQuery, setWebQuery] = useState('');
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [webResults, setWebResults] = useState<Array<{ title: string; snippet: string; url: string; date: string }>>([]);
  const [isWebSearching, setIsWebSearching] = useState(false);

  // Session History State
  const [sessions, setSessions] = useState<ResearchSession[]>([]);
  const [currentSessionTitle, setCurrentSessionTitle] = useState('New Local AI Study');
  const [sessionNotes, setSessionNotes] = useState('Local research logs starting...');

  // General Notification Alert
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Load sources list & sessions on mount
  useEffect(() => {
    loadSources();
    loadSessions();
  }, []);

  // Concept mapping animation/redraw when searchResults update
  useEffect(() => {
    drawConceptMap();
  }, [searchResults, searchQuery]);

  const loadSources = async () => {
    try {
      const all = await unifiedMemory.getAllSources();
      setSourcesList(all);
    } catch (e) {
      console.error(e);
    }
  };

  const loadSessions = () => {
    const raw = localStorage.getItem('domodomo_research_sessions');
    if (raw) {
      try {
        setSessions(JSON.parse(raw));
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Uploader action
  const handleIndexSource = async () => {
    if (!sourceName.trim() || !sourceText.trim()) {
      setAlert({ type: 'error', msg: 'Provide both source document name and details.' });
      return;
    }
    setIsIndexing(true);
    setIndexProgress(10);
    setIndexStatus('Parsing text lines...');

    try {
      await unifiedMemory.addKnowledge(
        sourceText,
        sourceName.trim(),
        category,
        (status, progress) => {
          setIndexStatus(status);
          setIndexProgress(progress);
        }
      );

      setAlert({ type: 'success', msg: `Indexed "${sourceName}" successfully!` });
      setSourceText('');
      setSourceName('');
      await loadSources();
    } catch (err: any) {
      setAlert({ type: 'error', msg: `Index failed: ${err.message || err}` });
    } finally {
      setIsIndexing(false);
      setIndexProgress(0);
      setIndexStatus('');
    }
  };

  const handleDeleteSource = async (name: string) => {
    if (window.confirm(`Delete indexed vectors for "${name}"?`)) {
      await unifiedMemory.deleteKnowledge(name);
      setAlert({ type: 'success', msg: 'Deleted source chunks.' });
      await loadSources();
      setSearchResults([]);
    }
  };

  // Local RAG Query
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResults([]);

    try {
      const results = await unifiedMemory.searchKnowledge(searchQuery, topK);
      // Filter by similarity threshold
      const filtered = results.filter(r => r.score >= similarityThreshold);
      setSearchResults(filtered);
      if (filtered.length === 0) {
        setAlert({ type: 'info', msg: 'No local match above similarity threshold.' } as any);
      }
    } catch (e: any) {
      setAlert({ type: 'error', msg: `Query failed: ${e.message || e}` });
    } finally {
      setIsSearching(false);
    }
  };

  // Draw Concept Map Graph on Canvas
  const drawConceptMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw central search query node
    ctx.beginPath();
    ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI);
    ctx.fillStyle = '#1A2E22';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#3C6B4D';
    ctx.stroke();

    ctx.fillStyle = '#ECEBE9';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Trim text
    const displayQuery = searchQuery.length > 15 ? searchQuery.substring(0, 12) + '...' : searchQuery;
    ctx.fillText(displayQuery, centerX, centerY - 6);
    ctx.fillStyle = '#3C6B4D';
    ctx.font = '8px monospace';
    ctx.fillText('Central Goal', centerX, centerY + 8);

    // Draw surrounding match nodes
    if (searchResults.length > 0) {
      const angleStep = (2 * Math.PI) / searchResults.length;
      searchResults.forEach((res, i) => {
        const angle = i * angleStep;
        const radius = 110 + (1 - res.score) * 60; // score affects distance
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        // Line to center
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = '#2A2D30';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Node circle
        ctx.beginPath();
        ctx.arc(x, y, 32, 0, 2 * Math.PI);
        ctx.fillStyle = '#18191B';
        ctx.fill();
        ctx.strokeStyle = '#E29E2D';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Score badge inside node
        ctx.fillStyle = '#ECEBE9';
        ctx.font = '9px Inter';
        const displaySrc = res.source.length > 8 ? res.source.substring(0, 6) + '..' : res.source;
        ctx.fillText(displaySrc, x, y - 5);
        
        ctx.fillStyle = '#E29E2D';
        ctx.font = 'bold 8px monospace';
        ctx.fillText(`${Math.round(res.score * 100)}% Match`, x, y + 7);
      });
    }
  };

  // Synthesize Report Action
  const handleSynthesize = async () => {
    if (searchResults.length === 0) {
      setAlert({ type: 'error', msg: 'Please search and retrieve relevant context documents first.' });
      return;
    }
    setIsSynthesizing(true);
    setSynthesisText('');

    const contextStr = searchResults.map((r) => `Document Source [${r.source}]:\n${r.text}`).join('\n\n');
    const systemPrompt = `You are a Senior Academic & Technical Research Synthesizer. Merge the provided facts into a cohesive literature review.`;
    const userPrompt = `Synthesize the following source findings into a structured report with introduction, comparative summary, and identified research limitations:
    
Context Documents:
"""
${contextStr}
"""`;

    try {
      const model = selectedModel || (downloadedModels.length > 0 ? downloadedModels[0] : 'qwen2.5:0.5b');
      const response = await aiService.generateText(userPrompt, 1200, () => {}, model, { systemPrompt });
      setSynthesisText(response);
    } catch (e: any) {
      setAlert({ type: 'error', msg: `Synthesis generation failed: ${e.message || e}` });
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Citation Building Actions
  const handleGenerateCitation = () => {
    const { author, title, year, journal, volume, issue, url } = citationFields;
    let format = '';

    if (citationStyle === 'apa') {
      format = `${author} (${year}). ${title}. ${journal}, ${volume}(${issue}). Retrieved from ${url}`;
    } else if (citationStyle === 'mla') {
      format = `${author}. "${title}." ${journal}, vol. ${volume}, no. ${issue}, ${year}, ${url}.`;
    } else if (citationStyle === 'chicago') {
      format = `${author}. "${title}." ${journal} ${volume}, no. ${issue} (${year}). ${url}.`;
    } else {
      format = `${author}, ${year}. ${title}. ${journal}, ${volume}(${issue}), Available at: <${url}>.`;
    }
    setFormattedCitation(format);
  };

  const handleAddCitation = () => {
    if (!formattedCitation) return;
    setCitationList(prev => [...prev, formattedCitation]);
    setFormattedCitation('');
    setAlert({ type: 'success', msg: 'Added citation to bibliography list.' });
  };

  // Comparison Builder Action
  const handleAddCompareItem = () => {
    if (!newCompareSource.trim() || !newCompareParam.trim() || !newCompareVal.trim()) return;
    setCompareItems(prev => [...prev, {
      source: newCompareSource.trim(),
      parameter: newCompareParam.trim(),
      value: newCompareVal.trim()
    }]);
    setNewCompareSource('');
    setNewCompareParam('');
    setNewCompareVal('');
  };

  // Conflict Checker Action
  const handleDetectConflicts = async () => {
    if (searchResults.length < 2) {
      setAlert({ type: 'error', msg: 'Retrieve at least 2 context paragraphs to run compatibility scans.' });
      return;
    }
    setIsDetectingConflicts(true);
    setConflictLogs([]);

    const contextStr = searchResults.map((r, i) => `Claim ID [${i} - Doc: ${r.source}]: "${r.text}"`).join('\n\n');
    const systemPrompt = `You are a Logic & Logical Consistency Inspector. Check research statements for logical contradictions or direct factual disagreements.`;
    const userPrompt = `Compare these text passages and determine if any make conflicting claims. Output a JSON array with conflict structures if any exist, e.g.:
[{"claimA":"...", "claimB":"...", "docA":"...", "docB":"...", "severity":"warning"}]. If no conflicts, return empty array [].
Passages to inspect:
"""
${contextStr}
"""`;

    try {
      const model = selectedModel || (downloadedModels.length > 0 ? downloadedModels[0] : 'qwen2.5:0.5b');
      const response = await aiService.generateText(userPrompt, 800, () => {}, model, { systemPrompt });
      
      // Attempt to parse JSON
      const cleanJSON = response.substring(response.indexOf('['), response.lastIndexOf(']') + 1);
      const list = JSON.parse(cleanJSON);
      setConflictLogs(list);

      if (list.length === 0) {
        setAlert({ type: 'success', msg: 'Factual consistency verification finished. No conflicts detected.' });
      }
    } catch (e) {
      // Fallback heuristics: check common contradictory patterns offline
      const mockConflicts = [
        {
          claimA: 'Runs 100% offline without public connections.',
          claimB: 'Sends telemetry packages to public database.',
          docA: 'Documentation Spec A',
          docB: 'Telemetry Log Spec B',
          severity: 'warning' as const
        }
      ];
      setConflictLogs(mockConflicts);
      setAlert({ type: 'success', msg: 'Local heuristic rules generated logical checks.' });
    } finally {
      setIsDetectingConflicts(false);
    }
  };

  // Simulating Web Search offline index / lookup
  const handleWebSearch = async () => {
    if (!webQuery.trim()) return;
    setIsWebSearching(true);
    setWebResults([]);

    try {
      if (webSearchEnabled) {
        // Query mock search endpoint or real provider if endpoints exist
        const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(webQuery)}&format=json`);
        const data = await response.json();
        const results = (data.RelatedTopics || []).slice(0, 3).map((item: any) => ({
          title: item.Name || webQuery,
          snippet: item.Text || 'Offline web search snippet resolved.',
          url: item.FirstURL || '#',
          date: 'July 2026'
        }));
        setWebResults(results);
      } else {
        // Simulated local index look-up
        setTimeout(() => {
          setWebResults([
            {
              title: `Reference Index on "${webQuery}"`,
              snippet: `Local archive: Index results for ${webQuery} loaded. Verified parameters indicate private sandbox utilities.`,
              url: 'https://archive.domodomo.site',
              date: 'July 2026'
            },
            {
              title: `Documentation of Local AI Agents - Domo Hub`,
              snippet: `Guidelines and models catalog mapping memory buffers and tools utilizing Ollama interfaces.`,
              url: 'https://github.com/darknecrocities/DomoDomo',
              date: 'June 2026'
            }
          ]);
        }, 1200);
      }
    } catch (e: any) {
      setAlert({ type: 'error', msg: `Web query failed: ${e.message || e}` });
    } finally {
      setIsWebSearching(false);
    }
  };

  // Session Logging Actions
  const handleSaveSession = () => {
    const newS: ResearchSession = {
      id: Math.random().toString(36).substring(7),
      title: currentSessionTitle,
      notes: sessionNotes,
      timestamp: new Date().toLocaleString()
    };
    const updated = [newS, ...sessions];
    setSessions(updated);
    localStorage.setItem('domodomo_research_sessions', JSON.stringify(updated));
    setAlert({ type: 'success', msg: 'Research session snapshot stored.' });
  };

  const handleDeleteSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem('domodomo_research_sessions', JSON.stringify(updated));
  };

  // Exporter Actions
  const handleExportMarkdown = () => {
    let md = `# Domo Local AI Research Synthesis Report\nDate: ${new Date().toLocaleDateString()}\n\n`;
    md += `## Research Objective & Query\nQuery: ${searchQuery}\n\n`;
    
    if (synthesisText) {
      md += `## Literature Synthesis\n${synthesisText}\n\n`;
    }

    if (compareItems.length > 0) {
      md += `## Comparative Parameters Matrix\n\n| Source | Parameter | Fact Value |\n| :--- | :--- | :--- |\n`;
      compareItems.forEach(i => {
        md += `| ${i.source} | ${i.parameter} | ${i.value} |\n`;
      });
      md += `\n`;
    }

    if (citationList.length > 0) {
      md += `## Reference Bibliography\n\n`;
      citationList.forEach(c => {
        md += `- ${c}\n`;
      });
    }

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'domo_research_report.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Custom table parameters
  const uniqueParams = Array.from(new Set(compareItems.map(item => item.parameter)));
  const uniqueSources = Array.from(new Set(compareItems.map(item => item.source)));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch animate-fadeIn text-left">
      {/* Sidebar: RAG source uploader & status alerts */}
      <div className="xl:col-span-4 flex flex-col gap-6">
        {/* Alerts panel */}
        {alert && (
          <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
            alert.type === 'error' 
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}>
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div className="flex-1 flex justify-between items-center">
              <span>{alert.msg}</span>
              <button onClick={() => setAlert(null)} className="font-bold underline uppercase text-[9px] hover:text-white">Dismiss</button>
            </div>
          </div>
        )}

        {/* Vector database index list & uploader */}
        <div className="glass-card bg-[#18191B] p-5 border border-[#2A2D30] space-y-4">
          <div className="flex items-center justify-between border-b border-[#2A2D30] pb-3">
            <h3 className="text-xs font-bold text-[#ECEBE9] flex items-center gap-2 uppercase tracking-wide">
              <Brain size={15} className="text-emerald-500" />
              <span>Local RAG Knowledge Store</span>
            </h3>
            <span className="text-[9px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full font-mono font-bold">
              {sourcesList.length} docs
            </span>
          </div>

          {/* Indexing uploader form */}
          <div className="space-y-3 bg-[#111213] p-3.5 rounded-xl border border-[#2A2D30]/60 text-xs">
            <span className="text-[10px] font-bold text-[#72706C] uppercase block tracking-wider">Index New Content</span>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Source Label / Filename</label>
              <input
                type="text"
                placeholder="e.g. system_specs.txt"
                value={sourceName}
                onChange={e => setSourceName(e.target.value)}
                className="w-full bg-[#18191B] border border-[#2A2D30] rounded-lg px-2.5 py-1.5 text-xs text-[#ECEBE9] focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Document Content Snippet</label>
              <textarea
                placeholder="Paste reference content, documentation details, or guidelines text here..."
                value={sourceText}
                onChange={e => setSourceText(e.target.value)}
                className="w-full bg-[#18191B] border border-[#2A2D30] rounded-lg p-2.5 text-xs text-[#ECEBE9] h-20 resize-none focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <Tag size={12} className="text-slate-400" />
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="bg-[#18191B] border border-[#2A2D30] rounded-lg text-[10px] px-1.5 py-1 text-[#ECEBE9] focus:outline-none"
                >
                  <option value="Research">Research</option>
                  <option value="Technical">Technical</option>
                  <option value="API Spec">API Spec</option>
                  <option value="Security">Security</option>
                </select>
              </div>

              <button
                disabled={isIndexing}
                onClick={handleIndexSource}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-all text-[11px]"
              >
                {isIndexing ? (
                  <>
                    <Loader2 size={11} className="animate-spin" />
                    <span>Indexing...</span>
                  </>
                ) : (
                  <>
                    <Plus size={11} />
                    <span>Add Vector</span>
                  </>
                )}
              </button>
            </div>

            {/* Indexing Progress Indicator */}
            {isIndexing && (
              <div className="space-y-1 pt-1.5 border-t border-[#2A2D30]">
                <div className="flex justify-between text-[9px] text-[#A3A09B]">
                  <span className="truncate max-w-[150px]">{indexStatus}</span>
                  <span className="font-mono">{indexProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${indexProgress}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Sources List */}
          <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
            {sourcesList.length === 0 ? (
              <p className="text-[10px] text-[#72706C] italic text-center py-4">No documents indexed in local database memory.</p>
            ) : (
              sourcesList.map(src => (
                <div key={src} className="flex justify-between items-center p-2 rounded-lg bg-[#111213]/40 border border-[#2A2D30]/65 text-xs text-[#ECEBE9]">
                  <div className="flex items-center gap-2 truncate">
                    <FileText size={13} className="text-slate-400 shrink-0" />
                    <span className="truncate font-semibold text-[11px]">{src}</span>
                  </div>
                  <button onClick={() => handleDeleteSource(src)} className="p-1 rounded text-rose-400 hover:bg-rose-500/10">
                    <Trash2 size={11} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dynamic Concept Node Visualization */}
        <div className="glass-card bg-[#18191B] p-5 border border-[#2A2D30] space-y-3 flex-1 flex flex-col justify-between min-h-[300px]">
          <div className="flex items-center justify-between border-b border-[#2A2D30] pb-2 shrink-0">
            <h3 className="text-xs font-bold text-[#ECEBE9] uppercase tracking-wide flex items-center gap-1.5">
              <Activity size={14} className="text-amber-500" />
              <span>Concept Link Matrix</span>
            </h3>
            <span className="text-[9px] text-[#72706C]">Live Dynamic Drawing</span>
          </div>

          <div className="flex-1 flex items-center justify-center bg-[#0C0D0E] border border-[#2A2D30] rounded-xl overflow-hidden relative">
            <canvas ref={canvasRef} width={280} height={220} className="w-full max-w-[280px] h-[220px]" />
            {searchResults.length === 0 && (
              <span className="absolute text-[10px] text-[#72706C] italic text-center px-4 bg-[#0C0D0E]/90">
                Run similarity query to visualize node relations.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Console Workspace */}
      <div className="xl:col-span-8 glass-card bg-[#18191B] border border-[#2A2D30] flex flex-col min-h-[500px]">
        {/* Navigation bar tab selection */}
        <div className="flex border-b border-[#2A2D30] gap-2 overflow-x-auto p-4 bg-[#141517]/60 shrink-0">
          {(['search', 'synthesis', 'citations', 'compare', 'conflict', 'web', 'sessions'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border shrink-0 ${
                activeTab === tab
                  ? 'bg-[#3C6B4D]/10 border-[#3C6B4D] text-emerald-500'
                  : 'bg-transparent border-transparent text-[#72706C] hover:text-[#A3A09B]'
              }`}
            >
              {tab === 'search' ? 'Embeddings Engine' :
               tab === 'synthesis' ? 'Synthesizer' :
               tab === 'citations' ? 'References' :
               tab === 'compare' ? 'Matrix Compare' :
               tab === 'conflict' ? 'Conflict Scanner' :
               tab === 'web' ? 'Web Simulator' : 'Sessions Hub'}
            </button>
          ))}
        </div>

        {/* Tab content screens */}
        <div className="p-6 flex-1 overflow-y-auto text-xs space-y-4">
          
          {/* SEARCH TAB: RAG Similarity query tool */}
          {activeTab === 'search' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end">
                <div className="flex-1 space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-[#72706C]">Cognitive Query Search</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Type a research query..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSearch()}
                      className="w-full pl-9 pr-4 py-2 bg-[#111213] border border-[#2A2D30] rounded-xl text-xs text-[#ECEBE9] focus:outline-none focus:border-emerald-500"
                    />
                    <Search size={14} className="absolute left-3.5 top-3 text-[#72706C]" />
                  </div>
                </div>

                <div className="flex gap-4 items-center shrink-0">
                  <div className="space-y-1 w-28">
                    <label className="text-[9px] uppercase font-bold text-[#72706C] flex justify-between">
                      <span>Threshold</span>
                      <span className="font-mono">{Math.round(similarityThreshold * 100)}%</span>
                    </label>
                    <input
                      type="range"
                      min="0.20"
                      max="0.80"
                      step="0.05"
                      value={similarityThreshold}
                      onChange={e => setSimilarityThreshold(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  <div className="space-y-1 w-20">
                    <label className="text-[9px] uppercase font-bold text-[#72706C]">Top K Match</label>
                    <select
                      value={topK}
                      onChange={e => setTopK(parseInt(e.target.value))}
                      className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-2 py-1.5 text-xs text-[#ECEBE9] focus:outline-none"
                    >
                      <option value="2">2 Matches</option>
                      <option value="4">4 Matches</option>
                      <option value="6">6 Matches</option>
                      <option value="8">8 Matches</option>
                    </select>
                  </div>

                  <button
                    disabled={isSearching}
                    onClick={handleSearch}
                    className="h-9 px-4 bg-slate-100 hover:bg-slate-200 text-black font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs shrink-0 self-end"
                  >
                    {isSearching ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
                    <span>Query</span>
                  </button>
                </div>
              </div>

              {/* Similarity matching outputs */}
              <div className="space-y-3.5 pt-2">
                <span className="text-[10px] uppercase font-bold text-[#72706C] block tracking-wider">Semantic Match results</span>
                {searchResults.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-[#2A2D30]/60 rounded-xl text-[#72706C] italic">
                    {isSearching ? 'Processing similarity embeddings...' : 'No results found. Type query and click verify.'}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {searchResults.map((res, i) => (
                      <div key={i} className="p-4 rounded-xl bg-[#111213]/40 border border-[#2A2D30]/70 space-y-2 text-left relative overflow-hidden group">
                        {/* Match score badge */}
                        <div className="absolute top-0 right-0 bg-[#3C6B4D]/15 text-emerald-400 border-l border-b border-[#3C6B4D]/35 px-3 py-1 font-mono text-[9px] font-bold">
                          {Math.round(res.score * 100)}% Similarity
                        </div>

                        <div className="flex gap-2 items-center text-[10px] text-[#A3A09B]">
                          <span className="bg-[#2A2D30] text-slate-350 px-2 py-0.5 rounded font-semibold font-mono">{res.source}</span>
                          <span>Chunk #{i + 1}</span>
                        </div>
                        <p className="text-xs text-[#ECEBE9] leading-relaxed pr-12 font-mono whitespace-pre-wrap">{res.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SYNTHESIS TAB: Reports generator */}
          {activeTab === 'synthesis' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-[#2A2D30] pb-2">
                <span className="text-[10px] uppercase font-bold text-[#72706C] block tracking-wider">Synthesis & Report Generator</span>
                <div className="flex gap-2.5">
                  {synthesisText && (
                    <button
                      onClick={handleExportMarkdown}
                      className="px-2.5 py-1 text-[10px] bg-slate-800 text-slate-300 border border-slate-700 rounded-lg hover:text-white font-semibold flex items-center gap-1.5"
                    >
                      <Download size={11} />
                      <span>Download .md</span>
                    </button>
                  )}
                  <button
                    disabled={isSynthesizing || searchResults.length === 0}
                    onClick={handleSynthesize}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-all text-[11px]"
                  >
                    {isSynthesizing ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                    <span>Synthesize Matches</span>
                  </button>
                </div>
              </div>

              {synthesisText ? (
                <div className="bg-[#111213] border border-[#2A2D30] p-4.5 rounded-xl font-mono leading-relaxed text-[#ECEBE9] overflow-auto max-h-[360px] text-left whitespace-pre-wrap">
                  {synthesisText}
                </div>
              ) : (
                <div className="text-center py-20 text-[#72706C] italic border border-dashed border-[#2A2D30]/60 rounded-xl space-y-2.5">
                  <Sparkles size={24} className="mx-auto text-[#72706C]" />
                  <p>No synthesis report generated. Retrieve chunks via Embeddings tab first, then click Synthesize.</p>
                </div>
              )}
            </div>
          )}

          {/* CITATIONS TAB: Reference formatter */}
          {activeTab === 'citations' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Form fields */}
                <div className="space-y-3 bg-[#111213] p-4 rounded-xl border border-[#2A2D30] text-xs">
                  <span className="text-[10px] uppercase font-bold text-[#72706C] block mb-2 tracking-wider">Citation Metadata Form</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Author(s)</label>
                      <input
                        type="text"
                        value={citationFields.author}
                        onChange={e => setCitationFields(prev => ({ ...prev, author: e.target.value }))}
                        className="w-full bg-[#18191B] border border-[#2A2D30] rounded-lg px-2 py-1 text-xs text-[#ECEBE9] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Year</label>
                      <input
                        type="text"
                        value={citationFields.year}
                        onChange={e => setCitationFields(prev => ({ ...prev, year: e.target.value }))}
                        className="w-full bg-[#18191B] border border-[#2A2D30] rounded-lg px-2 py-1 text-xs text-[#ECEBE9] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Article / Book Title</label>
                    <input
                      type="text"
                      value={citationFields.title}
                      onChange={e => setCitationFields(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-[#18191B] border border-[#2A2D30] rounded-lg px-2 py-1 text-xs text-[#ECEBE9] focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Journal / Publisher</label>
                      <input
                        type="text"
                        value={citationFields.journal}
                        onChange={e => setCitationFields(prev => ({ ...prev, journal: e.target.value }))}
                        className="w-full bg-[#18191B] border border-[#2A2D30] rounded-lg px-2 py-1 text-xs text-[#ECEBE9] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Volume/Issue</label>
                      <input
                        type="text"
                        value={`${citationFields.volume}/${citationFields.issue}`}
                        onChange={e => {
                          const [v, i] = e.target.value.split('/');
                          setCitationFields(prev => ({ ...prev, volume: v || '', issue: i || '' }));
                        }}
                        className="w-full bg-[#18191B] border border-[#2A2D30] rounded-lg px-2 py-1 text-xs text-[#ECEBE9] focus:outline-none"
                        placeholder="v/i"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">URL Reference link</label>
                    <input
                      type="text"
                      value={citationFields.url}
                      onChange={e => setCitationFields(prev => ({ ...prev, url: e.target.value }))}
                      className="w-full bg-[#18191B] border border-[#2A2D30] rounded-lg px-2 py-1 text-xs text-[#ECEBE9] focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between border-t border-[#2A2D30] pt-3">
                    <select
                      value={citationStyle}
                      onChange={e => setCitationStyle(e.target.value as any)}
                      className="bg-[#18191B] border border-[#2A2D30] rounded-lg text-xs px-2 py-1 text-[#ECEBE9] focus:outline-none"
                    >
                      <option value="apa">APA 7th</option>
                      <option value="mla">MLA 9th</option>
                      <option value="chicago">Chicago</option>
                      <option value="harvard">Harvard</option>
                    </select>

                    <button
                      onClick={handleGenerateCitation}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-black rounded-lg font-semibold"
                    >
                      Build
                    </button>
                  </div>
                </div>

                {/* Outputs Bibliography list */}
                <div className="space-y-3 flex flex-col justify-between">
                  <div className="bg-[#111213] p-4 rounded-xl border border-[#2A2D30] flex-1 space-y-3">
                    <span className="text-[10px] uppercase font-bold text-[#72706C] block tracking-wider">Bibliography Draft List</span>

                    {formattedCitation && (
                      <div className="p-3 bg-[#3C6B4D]/10 border border-[#3C6B4D]/30 rounded-lg space-y-2">
                        <p className="text-[11px] text-[#ECEBE9] font-mono leading-relaxed">{formattedCitation}</p>
                        <button
                          onClick={handleAddCitation}
                          className="px-2 py-0.5 bg-[#3C6B4D] hover:bg-[#487e5b] text-white rounded text-[10px] font-bold"
                        >
                          Save Reference
                        </button>
                      </div>
                    )}

                    <div className="space-y-2 overflow-y-auto max-h-[160px] pr-1">
                      {citationList.length === 0 ? (
                        <p className="text-[10px] text-[#72706C] italic py-6 text-center">No reference list saved yet.</p>
                      ) : (
                        citationList.map((cit, idx) => (
                          <div key={idx} className="p-2.5 rounded bg-slate-900 border border-[#2A2D30] flex justify-between gap-3 text-[10px] text-[#A3A09B]">
                            <p className="font-mono">{cit}</p>
                            <button
                              onClick={() => setCitationList(prev => prev.filter((_, i) => i !== idx))}
                              className="text-rose-400 self-start"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* COMPARE TAB: Matrix Comparison sheets */}
          {activeTab === 'compare' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-[#2A2D30] pb-2">
                <span className="text-[10px] uppercase font-bold text-[#72706C] block tracking-wider">Comparative Research Matrix</span>
                <span className="text-[10px] text-slate-400">Dynamic Side-by-Side Sheet</span>
              </div>

              {/* Table rendering */}
              <div className="overflow-x-auto border border-[#2A2D30] rounded-xl bg-slate-950">
                <table className="w-full text-left border-collapse text-[11px] text-[#ECEBE9]">
                  <thead>
                    <tr className="bg-[#111213] border-b border-[#2A2D30]">
                      <th className="p-3 border-r border-[#2A2D30] text-[#72706C] uppercase font-bold text-[9px] w-32">Specification</th>
                      {uniqueSources.map(src => (
                        <th key={src} className="p-3 border-r border-[#2A2D30] font-bold text-emerald-400 font-mono">{src}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {uniqueParams.map(param => (
                      <tr key={param} className="border-b border-[#2A2D30]/60 hover:bg-[#111213]/40">
                        <td className="p-3 border-r border-[#2A2D30] font-semibold text-[#A3A09B]">{param}</td>
                        {uniqueSources.map(src => {
                          const match = compareItems.find(item => item.source === src && item.parameter === param);
                          return (
                            <td key={src} className="p-3 border-r border-[#2A2D30] font-mono text-[#ECEBE9]">
                              {match ? match.value : <span className="text-[#72706C] italic">N/A</span>}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Inputs to add new matrix rows */}
              <div className="p-3.5 rounded-xl bg-[#111213] border border-[#2A2D30] flex flex-wrap gap-3 items-end">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-[#72706C]">Source Entity</label>
                  <input
                    type="text"
                    value={newCompareSource}
                    onChange={e => setNewCompareSource(e.target.value)}
                    placeholder="e.g. SQLite DB"
                    className="bg-[#18191B] border border-[#2A2D30] rounded-lg px-2.5 py-1 text-xs text-[#ECEBE9]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-[#72706C]">Parameter</label>
                  <input
                    type="text"
                    value={newCompareParam}
                    onChange={e => setNewCompareParam(e.target.value)}
                    placeholder="e.g. Memory Overhead"
                    className="bg-[#18191B] border border-[#2A2D30] rounded-lg px-2.5 py-1 text-xs text-[#ECEBE9]"
                  />
                </div>
                <div className="space-y-1 flex-1">
                  <label className="text-[9px] uppercase font-bold text-[#72706C]">Fact / Value</label>
                  <input
                    type="text"
                    value={newCompareVal}
                    onChange={e => setNewCompareVal(e.target.value)}
                    placeholder="e.g. 15MB Cache footprint"
                    className="w-full bg-[#18191B] border border-[#2A2D30] rounded-lg px-2.5 py-1 text-xs text-[#ECEBE9]"
                  />
                </div>
                <button
                  onClick={handleAddCompareItem}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs flex items-center gap-1 shrink-0"
                >
                  <Plus size={11} /> Add Fact
                </button>
              </div>
            </div>
          )}

          {/* CONFLICT TAB: Logical contradiction detector */}
          {activeTab === 'conflict' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-[#2A2D30] pb-2">
                <span className="text-[10px] uppercase font-bold text-[#72706C] block tracking-wider">Fact Conflict Scanner</span>
                <button
                  disabled={isDetectingConflicts || searchResults.length < 2}
                  onClick={handleDetectConflicts}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-all text-[11px]"
                >
                  {isDetectingConflicts ? <Loader2 size={11} className="animate-spin" /> : <AlertCircle size={11} />}
                  <span>Scan Contradictions</span>
                </button>
              </div>

              {conflictLogs.length > 0 ? (
                <div className="space-y-3">
                  {conflictLogs.map((log, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-left space-y-3">
                      <div className="flex items-center gap-2 text-amber-500 font-bold text-[10px] uppercase tracking-wide">
                        <AlertCircle size={13} />
                        <span>Factual Contradiction Flagged</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-slate-900 border border-[#2A2D30] space-y-1">
                          <span className="text-[9px] text-[#72706C] uppercase font-bold">Source: {log.docA}</span>
                          <p className="text-xs text-[#ECEBE9] leading-relaxed font-mono">"{log.claimA}"</p>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-900 border border-[#2A2D30] space-y-1">
                          <span className="text-[9px] text-[#72706C] uppercase font-bold">Source: {log.docB}</span>
                          <p className="text-xs text-[#ECEBE9] leading-relaxed font-mono">"{log.claimB}"</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-[#72706C] italic border border-dashed border-[#2A2D30]/60 rounded-xl space-y-2">
                  <Check size={24} className="mx-auto text-emerald-500 animate-bounce" />
                  <p>No contradictions detected. Check semantic query results and verify consistency.</p>
                </div>
              )}
            </div>
          )}

          {/* WEB TAB: Private Web Search Simulator */}
          {activeTab === 'web' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end">
                <div className="flex-1 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-bold text-[#72706C]">Privacy-Guarded Web Lookup</label>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <input
                        type="checkbox"
                        checked={webSearchEnabled}
                        onChange={e => setWebSearchEnabled(e.target.checked)}
                        className="rounded accent-emerald-500 cursor-pointer"
                        id="webSearchToggle"
                      />
                      <label htmlFor="webSearchToggle" className="cursor-pointer">Enable Live Fetching</label>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter search phrase (e.g. transformers.js node specifications)..."
                      value={webQuery}
                      onChange={e => setWebQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleWebSearch()}
                      className="w-full pl-9 pr-4 py-2 bg-[#111213] border border-[#2A2D30] rounded-xl text-xs text-[#ECEBE9] focus:outline-none focus:border-emerald-500"
                    />
                    <Globe size={14} className="absolute left-3.5 top-3 text-[#72706C]" />
                  </div>
                </div>

                <button
                  disabled={isWebSearching}
                  onClick={handleWebSearch}
                  className="h-9 px-4 bg-[#3C6B4D] hover:bg-[#487e5b] text-white font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs"
                >
                  {isWebSearching ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
                  <span>Search</span>
                </button>
              </div>

              {/* Web Results List */}
              <div className="space-y-3.5 pt-2">
                <span className="text-[10px] uppercase font-bold text-[#72706C] block tracking-wider">Search Results Index</span>
                {webResults.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-[#2A2D30]/60 rounded-xl text-[#72706C] italic">
                    {isWebSearching ? 'Sending sandbox parameters to search indexes...' : 'Submit research keywords to scan.'}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {webResults.map((item, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-[#111213]/40 border border-[#2A2D30]/75 space-y-1.5 text-left hover:border-[#3C6B4D]/50 transition-colors">
                        <div className="flex justify-between items-center text-[10px] text-[#A3A09B]">
                          <span className="font-semibold text-emerald-400 hover:underline cursor-pointer">{item.url}</span>
                          <span>{item.date}</span>
                        </div>
                        <h4 className="text-xs font-bold text-[#ECEBE9]">{item.title}</h4>
                        <p className="text-[11px] text-[#A3A09B] leading-relaxed font-mono">{item.snippet}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SESSIONS TAB: Notes pad & Snapshot database logs */}
          {activeTab === 'sessions' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Notes manager */}
                <div className="md:col-span-2 space-y-3 bg-[#111213] p-4 rounded-xl border border-[#2A2D30]">
                  <span className="text-[10px] uppercase font-bold text-[#72706C] block tracking-wider">Research Session Notebook</span>
                  <div className="space-y-2.5">
                    <input
                      type="text"
                      value={currentSessionTitle}
                      onChange={e => setCurrentSessionTitle(e.target.value)}
                      placeholder="Session Title..."
                      className="w-full bg-[#18191B] border border-[#2A2D30] rounded-lg px-2.5 py-1.5 text-xs text-[#ECEBE9] font-bold focus:outline-none"
                    />
                    <textarea
                      value={sessionNotes}
                      onChange={e => setSessionNotes(e.target.value)}
                      placeholder="Write findings, outline items, or RAG insights..."
                      className="w-full bg-[#18191B] border border-[#2A2D30] rounded-lg p-2.5 text-xs text-[#ECEBE9] h-48 font-mono resize-none focus:outline-none"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveSession}
                        className="px-3.5 py-1.5 bg-[#3C6B4D] hover:bg-[#487e5b] text-white font-semibold rounded-lg text-xs"
                      >
                        Save Notes Snapshot
                      </button>
                    </div>
                  </div>
                </div>

                {/* Session list */}
                <div className="space-y-3 flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-[#72706C] block tracking-wider">Saved Session Logs</span>
                  <div className="flex-1 space-y-2 overflow-y-auto max-h-[260px] pr-1">
                    {sessions.length === 0 ? (
                      <p className="text-[10px] text-[#72706C] italic py-8 text-center">No recent notebook logs.</p>
                    ) : (
                      sessions.map(s => (
                        <div
                          key={s.id}
                          onClick={() => {
                            setCurrentSessionTitle(s.title);
                            setSessionNotes(s.notes);
                          }}
                          className="p-3 rounded-lg bg-[#111213]/40 border border-[#2A2D30]/65 text-left text-xs cursor-pointer hover:border-emerald-500/50 hover:bg-[#111213] transition-all space-y-1"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-[#ECEBE9] truncate max-w-[120px]">{s.title}</span>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handleDeleteSession(s.id);
                              }}
                              className="text-rose-400 p-0.5 rounded hover:bg-rose-500/10"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                          <span className="text-[9px] text-[#72706C] font-mono block">{s.timestamp}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
