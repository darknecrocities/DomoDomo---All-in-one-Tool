import { useState } from 'react';
import { FileText, Sparkles, Check, ShieldAlert, Sliders } from 'lucide-react';
import { handleTextCopy } from '../../utils/sharedHelpers';

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 
  'by', 'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'in', 'of', 
  'that', 'this', 'these', 'those', 'it', 'its', 'they', 'them', 'their', 'we', 
  'us', 'our', 'you', 'your', 'i', 'me', 'my', 'he', 'him', 'his', 'she', 'her', 
  'has', 'have', 'had', 'do', 'does', 'did', 'as', 'with', 'about', 'would', 
  'should', 'could', 'which', 'who', 'whom', 'whose', 'what', 'why', 'how'
]);

export const SummarizerTool = () => {
  const [text, setText] = useState(`Offline-first applications prioritize local data processing over cloud server queries. By running WebAssembly components directly inside the browser Sandbox, developers can compile native processing tools such as FFmpeg.wasm and pdf-lib locally. This client-side execution model completely eliminates server hosting overhead and guarantees user privacy because files never leave the machine. Modern browsers support sandboxed environments like IndexedDB for secure storage and Web Workers for high-performance threading layers. Therefore, a user can convert formats, merge sheets, and scan files even without an active internet connection. Zero-server tech represents a new era in lightweight, private, and secure developer utilities.`);
  const [summary, setSummary] = useState('');
  const [ratio, setRatio] = useState<number>(40); // target percentage (e.g. 40% of sentences)
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<{ originalWords: number; summaryWords: number; saved: string } | null>(null);

  const handleSummarize = () => {
    if (!text.trim()) return;

    // 1. Split text into sentences using simple regex
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const sentenceList = sentences.map(s => s.trim()).filter(s => s.length > 0);

    if (sentenceList.length <= 1) {
      setSummary(text);
      setStats({
        originalWords: text.split(/\s+/).length,
        summaryWords: text.split(/\s+/).length,
        saved: '0%'
      });
      return;
    }

    // 2. Tokenize words and count frequencies
    const wordCounts: { [key: string]: number } = {};
    let totalWords = 0;

    sentenceList.forEach(sentence => {
      const words = sentence.toLowerCase().match(/\b\w+\b/g) || [];
      words.forEach(word => {
        totalWords += 1;
        if (!STOP_WORDS.has(word)) {
          wordCounts[word] = (wordCounts[word] || 0) + 1;
        }
      });
    });

    // 3. Assign weights to sentences
    const sentenceScores = sentenceList.map((sentence, idx) => {
      const words = sentence.toLowerCase().match(/\b\w+\b/g) || [];
      let score = 0;
      words.forEach(word => {
        if (wordCounts[word]) {
          score += wordCounts[word];
        }
      });
      // Normalize score by sentence word count to prevent favoring excessively long sentences
      const normalizedScore = words.length > 0 ? score / words.length : 0;
      return { index: idx, sentence, score: normalizedScore };
    });

    // 4. Select top sentences based on ratio
    const targetCount = Math.max(1, Math.round((sentenceList.length * ratio) / 100));
    
    // Sort scores descending to find top thresholds
    const sortedScores = [...sentenceScores].sort((a, b) => b.score - a.score);
    const topThresholds = sortedScores.slice(0, targetCount).map(s => s.index);

    // Filter original list to maintain chronological order
    const summarySentences = sentenceList.filter((_, idx) => topThresholds.includes(idx));
    const summaryResult = summarySentences.join(' ');

    setSummary(summaryResult);

    const origWordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    const sumWordCount = summaryResult.split(/\s+/).filter(w => w.length > 0).length;
    const savedPercentage = (((origWordCount - sumWordCount) / origWordCount) * 100).toFixed(0);

    setStats({
      originalWords: origWordCount,
      summaryWords: sumWordCount,
      saved: savedPercentage + '%'
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Editor Panel */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="text-[#4E8E5E]" size={22} />
              <span>Text Summarizer Engine</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">Frequency weight parser</span>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Source Paragraphs</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-[#151C2C]/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E] h-48 resize-none leading-relaxed outline-none"
              placeholder="Paste large document text paragraphs here..."
            />
          </div>

          {summary && (
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-xs text-slate-455 font-bold uppercase tracking-wider">Generated Summary</span>
              <textarea
                readOnly
                value={summary}
                className="w-full bg-slate-950 p-4 text-xs font-mono h-40 rounded-2xl border border-slate-900 text-slate-300 focus:outline-none resize-none leading-relaxed"
              />
            </div>
          )}
        </div>
      </div>

      {/* Control panel */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5">
          <div className="flex items-center gap-2 text-teal-400 font-semibold border-b border-slate-800 pb-3">
            <Sliders size={18} />
            <span>Summary Settings</span>
          </div>

          {/* Length slider */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-medium">Summary Length</span>
              <span className="text-teal-400 font-semibold">{ratio}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              value={ratio}
              onChange={(e) => setRatio(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#4E8E5E]"
            />
            <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
              Select what percentage of original sentences should be kept.
            </p>
          </div>

          {/* Summary stats */}
          {stats && (
            <div className="flex flex-col gap-3 bg-slate-900/40 p-4 rounded-xl border border-slate-850 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-450">Original words:</span>
                <span className="font-semibold text-slate-200">{stats.originalWords}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450">Summary words:</span>
                <span className="font-semibold text-[#4E8E5E]">{stats.summaryWords}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2 font-bold">
                <span className="text-slate-350">Saved space:</span>
                <span className="text-[#4E8E5E]">{stats.saved}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
            {summary ? (
              <button
                onClick={() => handleTextCopy(summary, setCopied)}
                className="btn-primary w-full py-3"
              >
                {copied ? <Check size={18} /> : <Sparkles size={18} />}
                <span>{copied ? 'Copied summary!' : 'Copy Summary'}</span>
              </button>
            ) : (
              <button
                onClick={handleSummarize}
                disabled={!text.trim()}
                className="btn-primary w-full py-3"
              >
                <Sparkles size={18} />
                <span>Summarize Paragraphs</span>
              </button>
            )}
          </div>
        </div>

        {/* Local Processing Banner */}
        <div className="bg-[#151C2C]/50 border border-slate-800 rounded-2xl p-4 flex gap-3 text-slate-400">
          <ShieldAlert size={20} className="text-[#4E8E5E] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-slate-300">100% Client-Side Summarizer</span>
            <span className="text-[10px] leading-relaxed">Paragraph splitting and sentence ranking weight allocations are completed fully offline.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
