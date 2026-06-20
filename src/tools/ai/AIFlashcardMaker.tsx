import { useState } from 'react';
import { BookOpen, Loader2, Shuffle, Download, Check, Star, ChevronRight, ChevronLeft, RefreshCw, Sparkles } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { LocalAIConfigPanel } from '../../components/LocalAIConfigPanel';

interface Flashcard {
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  known: boolean;
}

export const AIFlashcardMakerTool = () => {
  const [inputText, setInputText] = useState('The JavaScript event loop processes callbacks from the task queue after the call stack is empty. Promises use the microtask queue which is processed before the task queue.');
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [cardCount, setCardCount] = useState(8);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [sessionMode, setSessionMode] = useState(false);
  const [reviewOnly, setReviewOnly] = useState(false);

  const [selectedModel, setSelectedModel] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are a skilled educator. Create clear, concise flashcard Q&A pairs that test understanding, not just recall.');
  const [temperature, setTemperature] = useState(0.6);
  const [maxTokens, setMaxTokens] = useState(400);

  const generateCards = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setStatusMsg('Generating flashcards...');
    try {
      const result = await aiService.generateText(
        `Create exactly ${cardCount} flashcard Q&A pairs from this text. Format as JSON array: [{"question":"...","answer":"...","difficulty":"easy|medium|hard"}]\n\nText:\n${inputText}`,
        600,
        undefined,
        selectedModel || undefined,
        { systemPrompt, temperature }
      );
      const match = result.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed: Omit<Flashcard, 'known'>[] = JSON.parse(match[0]);
        setCards(parsed.map(c => ({ ...c, known: false })));
        setCurrentIndex(0);
        setFlipped(false);
        setSessionMode(true);
      }
    } catch { setStatusMsg('Error generating cards. Ensure Ollama is running.'); setTimeout(() => setStatusMsg(''), 3000); }
    setLoading(false);
    setStatusMsg('');
  };

  const shuffle = () => {
    setCards(prev => [...prev].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setFlipped(false);
  };

  const toggleKnown = (i: number) => setCards(prev => prev.map((c, idx) => idx === i ? { ...c, known: !c.known } : c));

  const visibleCards = reviewOnly ? cards.filter(c => !c.known) : cards;
  const currentCard = visibleCards[currentIndex];

  const exportCSV = () => {
    const csv = 'Question,Answer,Difficulty\n' + cards.map(c => `"${c.question}","${c.answer}","${c.difficulty}"`).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'flashcards.csv';
    a.click();
  };

  const diffColor = (d: string) => d === 'easy' ? 'text-green-400' : d === 'medium' ? 'text-amber-400' : 'text-red-400';
  const knownCount = cards.filter(c => c.known).length;

  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto">
      <LocalAIConfigPanel
        systemPrompt={systemPrompt} onSystemPromptChange={setSystemPrompt}
        temperature={temperature} onTemperatureChange={setTemperature}
        maxTokens={maxTokens} onMaxTokensChange={setMaxTokens}
        selectedModel={selectedModel} onModelChange={setSelectedModel}
      />

      {!sessionMode ? (
        <div className="flex flex-col gap-4">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <BookOpen size={14} className="text-violet-400" /> Topic or Text to Study
          </label>
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            className="w-full h-40 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-violet-500 resize-none leading-relaxed"
            placeholder="Paste notes, a paragraph, or describe a topic..."
          />
          <div className="flex items-center gap-4">
            <label className="text-xs text-slate-400 font-semibold">Cards to generate:</label>
            <input type="range" min={5} max={50} step={5} value={cardCount} onChange={e => setCardCount(+e.target.value)}
              className="flex-1 accent-violet-500" />
            <span className="text-xs font-mono text-violet-400 w-8">{cardCount}</span>
          </div>
          <button
            onClick={generateCards}
            disabled={loading || !inputText.trim()}
            className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all active:scale-95"
          >
            {loading ? <><Loader2 size={15} className="animate-spin" /><span>{statusMsg}</span></> : <><Sparkles size={15} /><span>Generate {cardCount} Flashcards</span></>}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Progress bar */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{knownCount}/{cards.length} known</span>
            <div className="flex-1 mx-4 bg-slate-800 rounded-full h-1.5">
              <div className="bg-violet-500 h-1.5 rounded-full transition-all" style={{ width: `${(knownCount/cards.length)*100}%` }} />
            </div>
            <span>{visibleCards.length} remaining</span>
          </div>

          {/* Card */}
          {currentCard ? (
            <div
              onClick={() => setFlipped(!flipped)}
              className="relative min-h-52 bg-gradient-to-br from-slate-900 to-slate-950 border border-violet-900/40 rounded-2xl p-6 cursor-pointer flex flex-col items-center justify-center gap-3 transition-all hover:border-violet-500/50 select-none"
            >
              <span className={`text-[10px] font-bold uppercase tracking-wider ${diffColor(currentCard.difficulty)}`}>
                {currentCard.difficulty}
              </span>
              <p className="text-center text-base font-semibold text-slate-200 leading-relaxed">
                {flipped ? currentCard.answer : currentCard.question}
              </p>
              <span className="text-[10px] text-slate-600 mt-2">{flipped ? 'Answer' : 'Question — tap to reveal'}</span>
              <span className="absolute top-3 right-3 text-[10px] text-slate-600 font-mono">{currentIndex + 1}/{visibleCards.length}</span>
            </div>
          ) : (
            <div className="min-h-52 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-500 text-sm">
              🎉 All cards reviewed!
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between gap-2">
            <button onClick={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); setFlipped(false); }}
              disabled={currentIndex === 0}
              className="flex items-center gap-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl text-xs font-bold transition-all">
              <ChevronLeft size={14} /> Prev
            </button>
            <div className="flex gap-2">
              <button onClick={() => toggleKnown(cards.indexOf(currentCard))}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${currentCard?.known ? 'bg-green-900/30 border-green-700 text-green-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                <Star size={12} fill={currentCard?.known ? 'currentColor' : 'none'} /> Known
              </button>
              <button onClick={shuffle}
                className="flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all">
                <Shuffle size={12} /> Shuffle
              </button>
              <button onClick={() => setReviewOnly(!reviewOnly)}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${reviewOnly ? 'bg-amber-900/30 border-amber-700 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                <RefreshCw size={12} /> Review Only
              </button>
            </div>
            <button onClick={() => { setCurrentIndex(Math.min(visibleCards.length - 1, currentIndex + 1)); setFlipped(false); }}
              disabled={currentIndex >= visibleCards.length - 1}
              className="flex items-center gap-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl text-xs font-bold transition-all">
              Next <ChevronRight size={14} />
            </button>
          </div>

          <div className="flex gap-2">
            <button onClick={exportCSV}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all">
              <Download size={13} /> Export CSV
            </button>
            <button onClick={() => { setSessionMode(false); setCards([]); setFlipped(false); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-violet-900/40 hover:bg-violet-900/60 text-violet-300 rounded-xl text-xs font-bold transition-all border border-violet-800/40">
              <Check size={13} /> New Deck
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
