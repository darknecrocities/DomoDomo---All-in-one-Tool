import { useState, useEffect } from 'react';
import { Loader2, Smile, Frown, Meh, Download, Search, Tag, Sparkles, Trash2 } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { LocalAIConfigPanel } from '../../components/LocalAIConfigPanel';

interface JournalEntry {
  id: string;
  date: string;
  text: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  emotions: string[];
  keywords: string[];
  tags: string[];
}

const STORAGE_KEY = 'domo_ai_journal';

export const AISentimentJournalTool = () => {
  const [entryText, setEntryText] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [newTag, setNewTag] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [weeklySummary, setWeeklySummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [view, setView] = useState<'write' | 'history'>('write');

  const [selectedModel, setSelectedModel] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are an empathetic journal AI. Analyze text for sentiment, emotions, and key themes with sensitivity.');
  const [temperature, setTemperature] = useState(0.4);
  const [maxTokens, setMaxTokens] = useState(200);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setEntries(JSON.parse(saved));
    } catch {}
  }, []);

  const saveEntries = (updated: JournalEntry[]) => {
    setEntries(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const analyzeEntry = async () => {
    if (!entryText.trim()) return;
    setLoading(true);
    setStatusMsg('Analyzing your entry...');
    try {
      const result = await aiService.generateText(
        `Analyze this journal entry. Return ONLY valid JSON:\n{"sentiment":"positive|negative|neutral","score":0.85,"emotions":["joy","anxiety"],"keywords":["work","stress","family"]}\n\nEntry: "${entryText}"`,
        maxTokens,
        undefined,
        selectedModel || undefined,
        { systemPrompt, temperature }
      );
      const match = result.match(/\{[\s\S]*\}/);
      let parsed = { sentiment: 'neutral' as const, score: 0.5, emotions: ['calm'], keywords: [] };
      if (match) { try { parsed = JSON.parse(match[0]); } catch {} }

      const entry: JournalEntry = {
        id: Date.now().toString(),
        date: new Date().toLocaleString(),
        text: entryText,
        sentiment: parsed.sentiment || 'neutral',
        score: typeof parsed.score === 'number' ? parsed.score : 0.5,
        emotions: Array.isArray(parsed.emotions) ? parsed.emotions : [],
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
        tags: [...selectedTags],
      };
      saveEntries([entry, ...entries]);
      setEntryText('');
      setSelectedTags([]);
    } catch { setStatusMsg('Could not analyze. Ensure Ollama is running.'); }
    setStatusMsg('');
    setLoading(false);
  };

  const generateWeeklySummary = async () => {
    const recent = entries.slice(0, 7);
    if (recent.length === 0) return;
    setSummaryLoading(true);
    try {
      const texts = recent.map((e, i) => `Entry ${i+1} (${e.date}): ${e.text.slice(0, 200)}`).join('\n');
      const result = await aiService.generateText(
        `Generate a compassionate weekly mood summary from these journal entries. Include overall mood trend, key themes, and one positive affirmation:\n\n${texts}`,
        250,
        undefined,
        selectedModel || undefined,
        { systemPrompt, temperature: 0.6 }
      );
      setWeeklySummary(result);
    } catch { setWeeklySummary('Could not generate summary.'); }
    setSummaryLoading(false);
  };

  const deleteEntry = (id: string) => saveEntries(entries.filter(e => e.id !== id));

  const exportEntries = () => {
    const text = entries.map(e =>
      `[${e.date}] ${e.sentiment.toUpperCase()} (${Math.round(e.score * 100)}%)\nEmotions: ${e.emotions.join(', ')}\n${e.text}\n---`
    ).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    a.download = 'journal-entries.txt';
    a.click();
  };

  const filteredEntries = entries.filter(e => {
    const matchSearch = !searchQuery || e.text.toLowerCase().includes(searchQuery.toLowerCase()) || e.keywords.some(k => k.includes(searchQuery.toLowerCase()));
    const matchTag = !activeTag || e.tags.includes(activeTag);
    return matchSearch && matchTag;
  });

  const allTags = [...new Set(entries.flatMap(e => e.tags))];
  const sentimentIcon = (s: string) => s === 'positive' ? <Smile size={14} className="text-green-400" /> : s === 'negative' ? <Frown size={14} className="text-red-400" /> : <Meh size={14} className="text-amber-400" />;
  const avgScore = entries.length ? entries.reduce((a, e) => a + e.score, 0) / entries.length : 0;
  const positiveCount = entries.filter(e => e.sentiment === 'positive').length;

  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto">
      <LocalAIConfigPanel
        systemPrompt={systemPrompt} onSystemPromptChange={setSystemPrompt}
        temperature={temperature} onTemperatureChange={setTemperature}
        maxTokens={maxTokens} onMaxTokensChange={setMaxTokens}
        selectedModel={selectedModel} onModelChange={setSelectedModel}
      />

      {/* Stats */}
      {entries.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Entries', value: entries.length, color: 'text-violet-400' },
            { label: 'Avg Mood Score', value: `${Math.round(avgScore * 100)}%`, color: avgScore > 0.6 ? 'text-green-400' : avgScore > 0.4 ? 'text-amber-400' : 'text-red-400' },
            { label: 'Positive Days', value: `${positiveCount}/${entries.length}`, color: 'text-teal-400' },
          ].map(s => (
            <div key={s.label} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
              <div className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* View toggle */}
      <div className="flex gap-2">
        {(['write', 'history'] as const).map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize ${view === v ? 'bg-violet-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'}`}>
            {v === 'write' ? '✍️ Write Entry' : `📖 History (${entries.length})`}
          </button>
        ))}
      </div>

      {view === 'write' ? (
        <div className="flex flex-col gap-3">
          <textarea
            value={entryText}
            onChange={e => setEntryText(e.target.value)}
            className="w-full h-40 bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-violet-500 resize-none leading-relaxed"
            placeholder="How was your day? What are you feeling? Write freely..."
          />
          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <Tag size={12} className="text-slate-500" />
            {['work', 'personal', 'health', 'social', 'goals'].map(t => (
              <button key={t} onClick={() => setSelectedTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}
                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${selectedTags.includes(t) ? 'bg-violet-900/40 border-violet-600 text-violet-300' : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'}`}>
                {t}
              </button>
            ))}
            <input value={newTag} onChange={e => setNewTag(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && newTag.trim()) { setSelectedTags(prev => [...prev, newTag.trim()]); setNewTag(''); }}}
              placeholder="+ custom tag" className="bg-transparent border-b border-slate-700 text-[10px] text-slate-400 outline-none w-20 placeholder-slate-600" />
          </div>
          <button onClick={analyzeEntry} disabled={loading || !entryText.trim()}
            className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-95">
            {loading ? <><Loader2 size={15} className="animate-spin" /><span>{statusMsg}</span></> : <><Sparkles size={15} /><span>Analyze & Save Entry</span></>}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search entries..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500" />
            </div>
            <button onClick={exportEntries} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all">
              <Download size={12} /> Export
            </button>
            <button onClick={generateWeeklySummary} disabled={summaryLoading || entries.length === 0}
              className="px-3 py-2 bg-violet-900/40 hover:bg-violet-900/60 border border-violet-800/40 text-violet-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50">
              {summaryLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Weekly
            </button>
          </div>
          {allTags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              <button onClick={() => setActiveTag('')} className={`px-2 py-0.5 rounded-full text-[10px] border ${!activeTag ? 'bg-violet-900/40 border-violet-600 text-violet-300' : 'border-slate-700 text-slate-500'}`}>All</button>
              {allTags.map(t => (
                <button key={t} onClick={() => setActiveTag(t === activeTag ? '' : t)}
                  className={`px-2 py-0.5 rounded-full text-[10px] border ${activeTag === t ? 'bg-violet-900/40 border-violet-600 text-violet-300' : 'border-slate-700 text-slate-500'}`}>{t}</button>
              ))}
            </div>
          )}
          {weeklySummary && (
            <div className="bg-violet-950/30 border border-violet-800/30 rounded-xl p-3 text-xs text-violet-200 leading-relaxed">
              <div className="text-[10px] font-bold text-violet-400 mb-1.5 uppercase">Weekly Summary</div>
              {weeklySummary}
            </div>
          )}
          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
            {filteredEntries.length === 0 ? (
              <div className="text-center text-slate-600 text-sm py-8">No entries found.</div>
            ) : filteredEntries.map(e => (
              <div key={e.id} className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 flex flex-col gap-2 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {sentimentIcon(e.sentiment)}
                    <span className="text-[10px] text-slate-500 font-mono">{e.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500">{Math.round(e.score * 100)}%</span>
                    <button onClick={() => deleteEntry(e.id)} className="text-slate-700 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{e.text}</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {e.emotions.slice(0, 4).map(em => (
                    <span key={em} className="px-1.5 py-0.5 bg-slate-800 text-slate-400 text-[9px] rounded-full">{em}</span>
                  ))}
                  {e.tags.map(t => (
                    <span key={t} className="px-1.5 py-0.5 bg-violet-950/40 text-violet-400 text-[9px] rounded-full border border-violet-900/30">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {entries.length > 0 && view === 'history' && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3">
          <div className="text-[10px] font-semibold text-slate-500 mb-2 uppercase tracking-wider">Mood Trend</div>
          <div className="flex items-end gap-1 h-12">
            {entries.slice(0, 14).reverse().map((e, i) => (
              <div key={i} title={`${e.date}: ${Math.round(e.score * 100)}%`}
                className={`flex-1 rounded-sm transition-all ${e.sentiment === 'positive' ? 'bg-green-500/60' : e.sentiment === 'negative' ? 'bg-red-500/60' : 'bg-amber-500/60'}`}
                style={{ height: `${e.score * 100}%` }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
