import { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, Play, Square, Globe, Sparkles, BookOpen } from 'lucide-react';

interface PresetScript {
  title: string;
  body: string;
}

export const TextToSpeechTool = () => {
  const [text, setText] = useState('Welcome to DomoDomo. Run local tools, convert file formats, and inspect developer codes instantly.');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [speaking, setSpeaking] = useState(false);
  const [lang, setLang] = useState('all');
  
  // Realtime highlighting index
  const [highlightRange, setHighlightRange] = useState<{ start: number; end: number } | null>(null);

  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const v = speechSynthesis.getVoices();
      setVoices(v);
      if (v.length > 0 && !selectedVoice) {
        // Prefer English or system default
        const defaultVoice = v.find(voice => voice.lang.startsWith('en')) || v[0];
        setSelectedVoice(defaultVoice.name);
      }
    };
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
    return () => { speechSynthesis.onvoiceschanged = null; };
  }, [selectedVoice]);

  const filteredVoices = lang === 'all' ? voices : voices.filter(v => v.lang.startsWith(lang));
  const uniqueLangs = ['all', ...Array.from(new Set(voices.map(v => v.lang.split('-')[0]))).sort()];

  const handleSpeak = useCallback(() => {
    speechSynthesis.cancel();
    setHighlightRange(null);

    const utt = new SpeechSynthesisUtterance(text);
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) utt.voice = voice;
    utt.rate = rate;
    utt.pitch = pitch;
    utt.volume = volume;
    
    utt.onstart = () => setSpeaking(true);
    utt.onend = () => {
      setSpeaking(false);
      setHighlightRange(null);
    };
    utt.onerror = () => {
      setSpeaking(false);
      setHighlightRange(null);
    };

    // Chrome/Safari onboundary support for highlighting
    utt.onboundary = (e) => {
      if (e.name === 'word') {
        const charIndex = e.charIndex;
        const remainingText = text.substring(charIndex);
        const match = remainingText.match(/^[\w']+/);
        const wordLen = match ? match[0].length : 0;
        setHighlightRange({ start: charIndex, end: charIndex + wordLen });
      }
    };

    utterRef.current = utt;
    speechSynthesis.speak(utt);
  }, [text, voices, selectedVoice, rate, pitch, volume]);

  const handleStop = () => {
    speechSynthesis.cancel();
    setSpeaking(false);
    setHighlightRange(null);
  };

  // SSML-like presets
  const VOICE_PRESETS = [
    { label: 'News Anchor', rate: 1.05, pitch: 0.95 },
    { label: 'Slow Narrator', rate: 0.75, pitch: 1.05 },
    { label: 'Deep Pitch', rate: 0.9, pitch: 0.6 },
    { label: 'High Tone', rate: 1.15, pitch: 1.6 },
    { label: 'Robotic Node', rate: 0.85, pitch: 0.2 },
  ];

  const TEMPLATES: PresetScript[] = [
    { title: 'Welcome Greeting', body: 'Thank you for calling. If you know your party extension, dial it now. Otherwise, press zero to reach operator.' },
    { title: 'Alert warning', body: 'Caution: A high temperature warning has been detected on the secondary core node. Please evacuate the cooling chamber immediately.' },
    { title: 'Out of Office', body: 'Hello. I am currently out of office on annual leave. I will return next Monday. Please contact support team for urgent requests.' },
    { title: 'Project Pitch', body: 'DomoDomo is an open-source local-first workspace. We prioritize developer privacy by processing everything offline in WebAssembly containers.' },
  ];

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  // Estimate speaking duration: average speech rate is ~150 words per minute (at 1x rate)
  const estDur = Math.max(1, Math.round((wordCount / (150 * rate)) * 60));

  // Render text with highlight support
  const renderTextContent = () => {
    if (!highlightRange || !speaking) return <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{text}</p>;
    const before = text.substring(0, highlightRange.start);
    const highlighted = text.substring(highlightRange.start, highlightRange.end);
    const after = text.substring(highlightRange.end);
    return (
      <p className="text-sm text-slate-350 leading-relaxed whitespace-pre-wrap">
        {before}
        <span className="bg-teal-500/25 text-teal-300 border-b-2 border-teal-500 font-bold px-0.5 rounded shadow-sm transition-all duration-75">{highlighted}</span>
        {after}
      </p>
    );
  };

  return (
    <div className="max-w-3xl mx-auto glass-card p-6 flex flex-col gap-6 text-left">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Volume2 size={18} className="text-teal-400" />
        <div>
          <h3 className="font-bold text-teal-400 text-sm">Text to Speech Synthesizer</h3>
          <p className="text-[10px] text-slate-500">Synthesize text into speech locally using native browser voice nodes</p>
        </div>
        <span className="ml-auto text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">High Fidelity</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left pane: editor / highlight */}
        <div className="md:col-span-7 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-slate-500 uppercase font-semibold">Source Script Text</label>
              <span className="text-[10px] text-slate-500 font-mono">{text.length} chars</span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              placeholder="Enter text to convert to speech…"
              className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3 text-xs text-slate-200 resize-none w-full focus:outline-none focus:border-teal-500 transition-colors font-mono"
            />
          </div>

          {/* Interactive Highlight screen */}
          {speaking && (
            <div className="bg-slate-950/45 p-4 rounded-xl border border-slate-850 flex flex-col gap-2 min-h-[90px]">
              <span className="text-[9px] text-slate-500 uppercase font-semibold flex items-center gap-1.5"><Sparkles size={11} className="text-teal-400" /> Live Speech Teleprompter</span>
              <div className="max-h-[140px] overflow-y-auto pr-1">
                {renderTextContent()}
              </div>
            </div>
          )}

          {/* Template select */}
          <div className="flex flex-col gap-2 bg-slate-900/35 border border-slate-850 p-4 rounded-xl">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5"><BookOpen size={12} /> Vocal Script Templates</span>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map(t => (
                <button key={t.title} onClick={() => { handleStop(); setText(t.body); }}
                  className="p-2 text-left bg-slate-950 border border-slate-850 rounded hover:border-teal-500/40 text-[10px] transition-all">
                  <div className="font-bold text-teal-400">{t.title}</div>
                  <div className="text-slate-500 truncate mt-0.5">{t.body}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right pane: settings */}
        <div className="md:col-span-5 flex flex-col gap-4 border-l border-slate-800 md:pl-6">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Voice parameters</span>

          {/* Voice select */}
          {voices.length > 0 ? (
            <div className="flex flex-col gap-2.5 bg-slate-900/30 p-3.5 rounded-xl border border-slate-850">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-550 uppercase flex items-center gap-1"><Globe size={11} /> Filter Language</label>
                <select value={lang} onChange={(e) => setLang(e.target.value)}
                  className="bg-slate-950 border border-slate-850 text-xs px-2 py-1 text-slate-300 rounded focus:outline-none">
                  {uniqueLangs.map(l => <option key={l} value={l}>{l === 'all' ? 'All Languages' : l.toUpperCase()}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-550 uppercase">Voice Pitch Actor</label>
                <select value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)}
                  className="bg-slate-950 border border-slate-850 text-xs px-2 py-1 text-slate-300 rounded focus:outline-none truncate max-w-full">
                  {filteredVoices.map(v => (
                    <option key={v.name} value={v.name}>{v.name}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="text-[10px] text-slate-500 italic bg-slate-950/30 p-3 rounded border border-slate-850">Loading local speech voice agents…</div>
          )}

          {/* Sliders */}
          <div className="grid grid-cols-1 gap-3 bg-slate-905/30 border border-slate-850 p-4 rounded-xl">
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Speed Rate:</span>
                <span className="font-mono text-slate-300">{rate.toFixed(1)}x</span>
              </div>
              <input type="range" min={0.3} max={3.0} step={0.1} value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))} className="w-full accent-teal-500" />
            </div>

            <div className="flex flex-col gap-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Tone Pitch:</span>
                <span className="font-mono text-slate-300">{pitch.toFixed(1)}</span>
              </div>
              <input type="range" min={0.5} max={2.0} step={0.05} value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))} className="w-full accent-teal-500" />
            </div>

            <div className="flex flex-col gap-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Volume level:</span>
                <span className="font-mono text-slate-300">{Math.round(volume * 100)}%</span>
              </div>
              <input type="range" min={0} max={1.0} step={0.05} value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-full accent-teal-500" />
            </div>
          </div>

          {/* Voice presets quick select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-500 uppercase">Voice presets</label>
            <div className="grid grid-cols-3 gap-1">
              {VOICE_PRESETS.map(p => (
                <button key={p.label} onClick={() => { setRate(p.rate); setPitch(p.pitch); }}
                  className="py-1 text-[9px] font-bold rounded bg-slate-900 hover:bg-slate-800 border border-slate-850 text-slate-400">
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Diagnostics statistics */}
          <div className="grid grid-cols-3 gap-2 bg-slate-950/30 p-3 rounded-lg border border-slate-850/60 text-center font-mono text-[10px]">
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-550 uppercase">Words</span>
              <span className="font-bold text-slate-300">{wordCount}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-550 uppercase">Chars</span>
              <span className="font-bold text-slate-300">{text.length}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-550 uppercase">Est. Time</span>
              <span className="font-bold text-slate-300">{estDur}s</span>
            </div>
          </div>

          <div className="flex gap-2 mt-auto">
            {speaking ? (
              <button onClick={handleStop}
                className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-2.5 rounded-lg transition-colors shadow-lg">
                <Square size={13} /> Stop Speech
              </button>
            ) : (
              <button onClick={handleSpeak} disabled={!text.trim()}
                className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 text-xs font-bold disabled:opacity-50 shadow-lg">
                <Play size={13} /> Synthesize Speech
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
