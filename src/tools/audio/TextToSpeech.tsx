import { useState, useEffect, useRef, useCallback } from 'react';

import { Volume2, Play, Square, Download, Globe } from 'lucide-react';

export const TextToSpeechTool = () => {
  const [text, setText] = useState('Welcome to DomoDomo — your all-in-one browser toolbox.');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [speaking, setSpeaking] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [lang, setLang] = useState('all');
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const v = speechSynthesis.getVoices();
      setVoices(v);
      if (v.length > 0 && !selectedVoice) setSelectedVoice(v[0].name);
    };
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
    return () => { speechSynthesis.onvoiceschanged = null; };
  }, []);

  useEffect(() => { setCharCount(text.length); }, [text]);

  const filteredVoices = lang === 'all' ? voices : voices.filter(v => v.lang.startsWith(lang));

  const uniqueLangs = ['all', ...Array.from(new Set(voices.map(v => v.lang.split('-')[0]))).sort()];

  const handleSpeak = useCallback(() => {
    speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) utt.voice = voice;
    utt.rate = rate;
    utt.pitch = pitch;
    utt.volume = volume;
    utt.onstart = () => setSpeaking(true);
    utt.onend = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    utterRef.current = utt;
    speechSynthesis.speak(utt);
  }, [text, voices, selectedVoice, rate, pitch, volume]);

  const handleStop = () => {
    speechSynthesis.cancel();
    setSpeaking(false);
  };

  const handleDownload = useCallback(() => {
    // Use MediaRecorder to capture the speech output
    navigator.mediaDevices.getUserMedia({ audio: true }).then((_stream) => {
      // We'll route via speak + mic capture workaround
      // Since Web Speech API doesn't expose audio output, we inform the user
      alert('Browser Speech API does not expose audio output for direct download. Use the Record Voice tool or an OS audio loopback to capture TTS output.');
    }).catch(() => {
      alert('To download TTS audio, use the Voice Recorder tool with a system audio capture or screen recorder.');
    });
  }, []);

  // SSML-like presets
  const PRESETS = [
    { label: 'News Reader', rate: 1.1, pitch: 0.95, volume: 1 },
    { label: 'Slow & Clear', rate: 0.7, pitch: 1, volume: 1 },
    { label: 'Fast Narrator', rate: 1.6, pitch: 1.1, volume: 0.9 },
    { label: 'Deep Voice', rate: 0.9, pitch: 0.6, volume: 1 },
    { label: 'Child-like', rate: 1.2, pitch: 1.8, volume: 1 },
    { label: 'Robot', rate: 0.85, pitch: 0.3, volume: 1 },
  ];

  return (
    <div className="max-w-2xl mx-auto glass-card p-6 flex flex-col gap-5 text-left">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Volume2 size={18} className="text-teal-400" />
        <h3 className="font-bold text-teal-400 text-sm">Text to Speech Synthesizer</h3>
        <span className="ml-auto text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full">Web Speech API</span>
      </div>

      {/* Text input */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label className="text-xs text-slate-400 font-medium">Text to Speak</label>
          <span className={`text-xs ${charCount > 200 ? 'text-yellow-400' : 'text-slate-500'}`}>{charCount} chars</span>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="Enter text to convert to speech…"
          className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 resize-none w-full focus:outline-none focus:border-teal-500 transition-colors"
        />
      </div>

      {/* Presets */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-slate-400 font-medium">Voice Presets</label>
        <div className="grid grid-cols-3 gap-1.5">
          {PRESETS.map(p => (
            <button key={p.label}
              onClick={() => { setRate(p.rate); setPitch(p.pitch); setVolume(p.volume); }}
              className="py-1.5 text-xs font-bold rounded-lg border border-slate-700 bg-slate-900 text-slate-400 hover:border-teal-500 hover:text-teal-400 transition-all">
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Voice selection */}
      {voices.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 flex items-center gap-1"><Globe size={10} /> Filter Language</label>
            <select value={lang} onChange={(e) => setLang(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs px-2 py-1.5 rounded text-slate-200">
              {uniqueLangs.map(l => <option key={l} value={l}>{l === 'all' ? 'All Languages' : l}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Voice ({filteredVoices.length} available)</label>
            <select value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs px-2 py-1.5 rounded text-slate-200">
              {filteredVoices.map(v => (
                <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Rate / Pitch / Volume sliders */}
      <div className="grid grid-cols-3 gap-3 bg-slate-900/50 rounded-lg p-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">Rate: {rate.toFixed(1)}×</label>
          <input type="range" min={0.1} max={10} step={0.1} value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))} className="w-full accent-teal-500" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">Pitch: {pitch.toFixed(1)}</label>
          <input type="range" min={0} max={2} step={0.05} value={pitch}
            onChange={(e) => setPitch(parseFloat(e.target.value))} className="w-full accent-teal-500" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">Volume: {Math.round(volume * 100)}%</label>
          <input type="range" min={0} max={1} step={0.05} value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-full accent-teal-500" />
        </div>
      </div>

      {/* Speaking indicator */}
      {speaking && (
        <div className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 rounded-lg px-3 py-2">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-1 bg-teal-400 rounded-full animate-pulse"
                style={{ height: `${8 + Math.random() * 12}px`, animationDelay: `${i * 100}ms` }} />
            ))}
          </div>
          <span className="text-xs text-teal-400 font-bold">Speaking…</span>
        </div>
      )}

      <div className="flex gap-2">
        {speaking ? (
          <button onClick={handleStop}
            className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-2.5 rounded-lg transition-colors">
            <Square size={14} /> Stop
          </button>
        ) : (
          <button onClick={handleSpeak} disabled={!text.trim()}
            className="flex-1 btn-primary flex items-center justify-center gap-2 py-2.5 text-xs font-bold disabled:opacity-50">
            <Play size={14} /> Speak Text
          </button>
        )}
        <button onClick={handleDownload}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-lg transition-colors">
          <Download size={14} /> Save
        </button>
      </div>
    </div>
  );
};
