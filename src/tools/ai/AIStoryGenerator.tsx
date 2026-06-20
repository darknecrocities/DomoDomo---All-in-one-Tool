import { useState } from 'react';
import { Loader2, Copy, Check, Download, RefreshCw, Sparkles, ChevronDown } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { handleTextCopy } from '../../utils/sharedHelpers';
import { LocalAIConfigPanel } from '../../components/LocalAIConfigPanel';

type Genre = 'fantasy' | 'sci-fi' | 'horror' | 'romance' | 'mystery' | 'thriller' | 'comedy' | 'adventure';
type POV = 'first-person' | 'third-person';
type StoryLength = 'flash' | 'short' | 'long';

interface StoryEntry { title: string; story: string; genre: Genre; timestamp: string }

export const AIStoryGeneratorTool = () => {
  const [genre, setGenre] = useState<Genre>('fantasy');
  const [character, setCharacter] = useState('A lone wizard who lost their memory');
  const [setting, setSetting] = useState('A floating city above the clouds');
  const [plotTwist, setPlotTwist] = useState(true);
  const [pov, setPov] = useState<POV>('third-person');
  const [storyLength, setStoryLength] = useState<StoryLength>('short');
  const [continuationText, setContinuationText] = useState('');
  const [continueMode, setContinueMode] = useState(false);
  const [generatedStory, setGeneratedStory] = useState('');
  const [storyTitle, setStoryTitle] = useState('');
  const [chapterMode, setChapterMode] = useState(false);
  const [chapters, setChapters] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<StoryEntry[]>([]);

  const [selectedModel, setSelectedModel] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are a creative fiction writer. Write engaging, vivid stories with strong narrative arcs and memorable characters.');
  const [temperature, setTemperature] = useState(0.85);
  const [maxTokens, setMaxTokens] = useState(500);

  const lengthWords = { flash: '~150 words', short: '~400 words', long: '~800 words' };

  const generate = async () => {
    setLoading(true);
    setStatusMsg('Writing your story...');
    try {
      const twistNote = plotTwist ? ' Include an unexpected plot twist near the end.' : '';
      const src = continueMode && continuationText
        ? `Continue this story in ${pov} POV, ${storyLength} length:\n\n${continuationText}`
        : `Write a ${genre} story (${lengthWords[storyLength]}) in ${pov} POV.\nCharacter: ${character}\nSetting: ${setting}${twistNote}\n\nReturn JSON: {"title":"...","story":"..."}`;

      const result = await aiService.generateText(
        src,
        maxTokens,
        undefined,
        selectedModel || undefined,
        { systemPrompt, temperature }
      );

      if (continueMode) {
        setGeneratedStory(continuationText + '\n\n' + result);
      } else {
        const match = result.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          setStoryTitle(parsed.title || 'Untitled Story');
          setGeneratedStory(parsed.story || result);
          setHistory(prev => [{ title: parsed.title, story: parsed.story, genre, timestamp: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
        } else {
          setGeneratedStory(result);
          setStoryTitle('Untitled Story');
        }
      }
    } catch { setStatusMsg('Error. Ensure Ollama is running.'); setTimeout(() => setStatusMsg(''), 3000); }
    setStatusMsg('');
    setLoading(false);
  };

  const generateChapter = async () => {
    setLoading(true);
    setStatusMsg(`Writing Chapter ${chapters.length + 1}...`);
    try {
      const context = chapters.length > 0 ? `Previous chapter summary: ${chapters[chapters.length-1].slice(0, 300)}` : `Story setup: ${character} in ${setting}`;
      const result = await aiService.generateText(
        `Write Chapter ${chapters.length + 1} of a ${genre} story in ${pov} POV (${lengthWords[storyLength]}). ${context}`,
        maxTokens,
        undefined,
        selectedModel || undefined,
        { systemPrompt, temperature }
      );
      setChapters(prev => [...prev, result]);
      setGeneratedStory(result);
    } catch { setStatusMsg('Error. Ensure Ollama is running.'); setTimeout(() => setStatusMsg(''), 3000); }
    setStatusMsg('');
    setLoading(false);
  };

  const exportStory = () => {
    const content = chapterMode
      ? chapters.map((c, i) => `CHAPTER ${i + 1}\n\n${c}`).join('\n\n---\n\n')
      : `${storyTitle}\n\n${generatedStory}`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    a.download = `${storyTitle || 'story'}.txt`;
    a.click();
  };

  const genreEmoji: Record<Genre, string> = {
    fantasy: '🧙', 'sci-fi': '🚀', horror: '👻', romance: '💕',
    mystery: '🔍', thriller: '🔪', comedy: '😄', adventure: '⚔️'
  };

  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto">
      <LocalAIConfigPanel
        systemPrompt={systemPrompt} onSystemPromptChange={setSystemPrompt}
        temperature={temperature} onTemperatureChange={setTemperature}
        maxTokens={maxTokens} onMaxTokensChange={setMaxTokens}
        selectedModel={selectedModel} onModelChange={setSelectedModel}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left — Config */}
        <div className="flex flex-col gap-3">
          {/* Genre */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Genre</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['fantasy', 'sci-fi', 'horror', 'romance', 'mystery', 'thriller', 'comedy', 'adventure'] as Genre[]).map(g => (
                <button key={g} onClick={() => setGenre(g)}
                  className={`py-2 rounded-xl text-xs font-bold text-center transition-all ${genre === g ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-600'}`}>
                  {genreEmoji[g]}<br /><span className="text-[9px] capitalize">{g}</span>
                </button>
              ))}
            </div>
          </div>

          <input value={character} onChange={e => setCharacter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            placeholder="Character description..." />
          <input value={setting} onChange={e => setSetting(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            placeholder="Setting/world..." />

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-semibold uppercase">POV</label>
              <div className="relative">
                <select value={pov} onChange={e => setPov(e.target.value as POV)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none appearance-none">
                  <option value="first-person">First Person</option>
                  <option value="third-person">Third Person</option>
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-semibold uppercase">Length</label>
              <div className="relative">
                <select value={storyLength} onChange={e => setStoryLength(e.target.value as StoryLength)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none appearance-none">
                  <option value="flash">Flash (~150w)</option>
                  <option value="short">Short (~400w)</option>
                  <option value="long">Long (~800w)</option>
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={plotTwist} onChange={e => setPlotTwist(e.target.checked)} className="accent-amber-500" />
              <span className="text-xs text-slate-400">Plot Twist</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={chapterMode} onChange={e => setChapterMode(e.target.checked)} className="accent-amber-500" />
              <span className="text-xs text-slate-400">Chapter Mode</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={continueMode} onChange={e => setContinueMode(e.target.checked)} className="accent-amber-500" />
              <span className="text-xs text-slate-400">Continue Story</span>
            </label>
          </div>

          {continueMode && (
            <textarea value={continuationText} onChange={e => setContinuationText(e.target.value)}
              className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 focus:outline-none focus:border-amber-500 resize-none font-mono"
              placeholder="Paste the story to continue from..." />
          )}

          <button onClick={chapterMode ? generateChapter : generate}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-95">
            {loading ? <><Loader2 size={15} className="animate-spin" /><span>{statusMsg}</span></> : <><Sparkles size={15} /><span>{chapterMode ? `Write Chapter ${chapters.length + 1}` : 'Generate Story'}</span></>}
          </button>

          {chapterMode && chapters.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {chapters.map((_, i) => (
                <button key={i} onClick={() => setGeneratedStory(chapters[i])}
                  className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-400 rounded-lg text-[10px] hover:border-amber-600 hover:text-amber-400 transition-all">
                  Ch. {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right — Output */}
        <div className="flex flex-col gap-3">
          {storyTitle && <div className="text-base font-bold text-amber-300 font-heading">{storyTitle}</div>}
          <div className="flex-1 min-h-72 max-h-96 bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap overflow-auto">
            {generatedStory || <span className="text-slate-600 text-xs">Your story will appear here...</span>}
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => handleTextCopy(generatedStory, setCopied)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all">
              {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />} Copy
            </button>
            <button onClick={exportStory} disabled={!generatedStory}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all disabled:opacity-40">
              <Download size={12} /> Export .txt
            </button>
            <button onClick={() => setHistory(h => h)} className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all">
              <RefreshCw size={12} /> History ({history.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
