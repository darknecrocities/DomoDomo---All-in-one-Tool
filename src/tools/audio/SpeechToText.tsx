import { useState, useRef, useCallback } from 'react';
import { triggerTextDownload, handleTextCopy } from '../../utils/sharedHelpers';
import { Mic, Square, Download, Copy, Check, Globe, Upload, Search, Edit3, Trash2, AlertCircle, Sparkles } from 'lucide-react';

interface Transcript { 
  id: string;
  text: string; 
  timestamp: string; 
  confidence: number; 
}

export const SpeechToTextTool = () => {
  const [mode, setMode] = useState<'live' | 'file'>('live');
  const [listening, setListening] = useState(false);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [interimText, setInterimText] = useState('');
  const [lang, setLang] = useState('en-US');
  const [continuous, setContinuous] = useState(true);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Search & Replace
  const [searchWord, setSearchWord] = useState('');
  const [replaceWord, setReplaceWord] = useState('');

  // Audio meters
  const [micLevel, setMicLevel] = useState(0);

  // Refs
  const recRef = useRef<any>(null);
  const shouldRestartRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micAnimRef = useRef<number>(0);

  const LANGUAGES = [
    { code: 'en-US', label: 'English (US)' },
    { code: 'en-GB', label: 'English (UK)' },
    { code: 'es-ES', label: 'Spanish' },
    { code: 'fr-FR', label: 'French' },
    { code: 'de-DE', label: 'German' },
    { code: 'ja-JP', label: 'Japanese' },
    { code: 'zh-CN', label: 'Chinese (Simplified)' },
    { code: 'ko-KR', label: 'Korean' },
    { code: 'pt-BR', label: 'Portuguese (BR)' },
    { code: 'ar-SA', label: 'Arabic' },
    { code: 'hi-IN', label: 'Hindi' },
    { code: 'tl-PH', label: 'Filipino (tl-PH)' },
    { code: 'fil-PH', label: 'Filipino (fil-PH)' },
  ];

  const monitorMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      micAnalyserRef.current = analyser;
      const src = ctx.createMediaStreamSource(stream);
      src.connect(analyser);

      const data = new Uint8Array(analyser.frequencyBinCount);
      const update = () => {
        if (!analyser) return;
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i];
        setMicLevel(Math.round((sum / data.length) / 2.55));
        micAnimRef.current = requestAnimationFrame(update);
      };
      update();
    } catch (e) {
      console.error(e);
    }
  };

  const stopMicMonitoring = () => {
    cancelAnimationFrame(micAnimRef.current);
    micStreamRef.current?.getTracks().forEach(t => t.stop());
    audioCtxRef.current?.close();
    setMicLevel(0);
  };

  const startLive = useCallback(() => {
    setErrorMsg('');
    const Speech = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Speech) {
      setErrorMsg('Speech recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }
    const rec = new Speech() as any;
    recRef.current = rec;
    rec.lang = lang;
    rec.continuous = continuous;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    shouldRestartRef.current = continuous;

    rec.onstart = () => {
      setListening(true);
      monitorMic();
    };

    rec.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (!e.results[i].isFinal) {
          interim += e.results[i][0].transcript;
        } else {
          const result = e.results[i][0];
          const entry: Transcript = {
            id: `${Date.now()}-${Math.random()}`,
            text: result.transcript,
            timestamp: new Date().toLocaleTimeString(),
            confidence: result.confidence,
          };
          setTranscripts(prev => [...prev, entry]);
          interim = '';
        }
      }
      setInterimText(interim);
    };

    rec.onerror = (event: any) => {
      console.error('Speech recognition error', event);
      if (event.error === 'no-speech' || event.error === 'aborted') {
        // Safe to ignore / let it auto-restart
        return;
      }
      setErrorMsg(`Speech recognition error: ${event.error}`);
      stopLive();
    };

    rec.onend = () => {
      // Auto-restart if continuous mode is active and we didn't explicitly call stop
      if (shouldRestartRef.current) {
        try {
          rec.start();
        } catch (e) {
          console.warn('Auto-restart failed', e);
          setListening(false);
          stopMicMonitoring();
        }
      } else {
        setListening(false);
        stopMicMonitoring();
        setInterimText('');
      }
    };

    try {
      rec.start();
    } catch (e: any) {
      setErrorMsg(`Failed to start: ${e.message}`);
    }
  }, [lang, continuous]);

  const stopLive = () => {
    shouldRestartRef.current = false;
    recRef.current?.stop();
    stopMicMonitoring();
    setListening(false);
    setInterimText('');
  };

  const handleEditSegment = (id: string, newText: string) => {
    setTranscripts(prev => prev.map(t => t.id === id ? { ...t, text: newText } : t));
  };

  const handleDeleteSegment = (id: string) => {
    setTranscripts(prev => prev.filter(t => t.id !== id));
  };

  const handleSearchReplace = () => {
    if (!searchWord.trim()) return;
    setTranscripts(prev => prev.map(t => ({
      ...t,
      text: t.text.replace(new RegExp(searchWord, 'gi'), replaceWord)
    })));
  };

  const allText = transcripts.map(t => t.text).join(' ');
  const wordCount = allText.split(/\s+/).filter(Boolean).length;
  const charCount = allText.length;
  const wpm = transcripts.length > 1 ? Math.round(wordCount / (transcripts.length * 0.1)) : 0;

  const exportTranscript = () => {
    const content = transcripts.map(t =>
      `[${t.timestamp}] (${Math.round((t.confidence || 0) * 100)}% confidence)\n${t.text}`
    ).join('\n\n');
    triggerTextDownload(content, 'transcript.txt');
  };

  const exportSRT = () => {
    const srt = transcripts.map((t, i) => {
      const idx = i + 1;
      const sSec = i * 4;
      const eSec = sSec + 3.5;
      const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        const ms = Math.floor((seconds % 1) * 1000).toString().padStart(3, '0');
        return `${h}:${m}:${s},${ms}`;
      };
      return `${idx}\n${formatTime(sSec)} --> ${formatTime(eSec)}\n${t.text}\n`;
    }).join('\n');
    triggerTextDownload(srt, 'transcript.srt');
  };

  const exportVTT = () => {
    const vtt = 'WEBVTT\n\n' + transcripts.map((t, i) => {
      const sSec = i * 4;
      const eSec = sSec + 3.5;
      const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        const ms = Math.floor((seconds % 1) * 1000).toString().padStart(3, '0');
        return `${h}:${m}:${s}.${ms}`;
      };
      return `${formatTime(sSec)} --> ${formatTime(eSec)}\n${t.text}\n`;
    }).join('\n');
    triggerTextDownload(vtt, 'transcript.vtt');
  };

  const exportJSON = () => {
    triggerTextDownload(JSON.stringify(transcripts, null, 2), 'transcript.json');
  };

  return (
    <div className="max-w-3xl mx-auto glass-card p-6 flex flex-col gap-6 text-left">
      <div className="flex items-center gap-2 border-b border-slate-880 pb-3">
        <Mic size={18} className="text-teal-400" />
        <div>
          <h3 className="font-bold text-teal-400 text-sm">Speech to Text Transcriber</h3>
          <p className="text-[10px] text-slate-500">Transcribe voice dictations or audio files locally with inline corrections</p>
        </div>
        <span className="ml-auto text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">Web Speech API</span>
      </div>

      <div className="flex gap-2">
        {(['live', 'file'] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); stopLive(); setTranscripts([]); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg border capitalize transition-all flex items-center justify-center gap-1.5 ${
              mode === m ? 'border-teal-500 bg-teal-500/10 text-teal-400 font-bold' : 'border-slate-800 bg-slate-900 text-slate-400'
            }`}>
            {m === 'live' ? <Mic size={12} /> : <Upload size={12} />}
            {m === 'live' ? 'Live Microphone' : 'From Audio File'}
          </button>
        ))}
      </div>

      {errorMsg && (
        <div className="bg-red-950/40 border border-red-900/30 text-red-300 p-3 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Workspace details */}
        <div className="md:col-span-7 flex flex-col gap-4">
          {mode === 'file' ? (
            <div className="flex flex-col gap-3 bg-teal-950/20 border border-teal-900/30 p-5 rounded-2xl text-center items-center justify-center min-h-[220px]">
              <Sparkles size={32} className="text-teal-400 animate-pulse" />
              <h4 className="text-xs font-bold text-teal-350">Need High-Accuracy File Transcription?</h4>
              <p className="text-[11px] text-slate-400 max-w-sm">
                Transcribing files requires advanced speech models. Please use our **Local Voice Transcriber** tool which runs the **Whisper AI model** locally inside your browser!
              </p>
              <button 
                onClick={() => {
                  // Dispatch location change or notify user
                  window.location.hash = '#/tools/ai/AISpeechToText';
                }}
                className="mt-2 bg-teal-500 hover:bg-teal-400 text-white text-xs font-bold py-2 px-4 rounded-xl transition-all"
              >
                Go to Local Voice Transcriber
              </button>
            </div>
          ) : (
            <>
              {/* Transcript logs */}
              {transcripts.length > 0 ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Interactive transcripts log</span>
                    <button onClick={() => setTranscripts([])} className="text-[10px] text-rose-450 hover:text-rose-400">Reset logs</button>
                  </div>

                  <div className="bg-slate-950/40 rounded-xl border border-slate-850 p-4 max-h-[350px] overflow-y-auto flex flex-col gap-3">
                    {transcripts.map((t) => (
                      <div key={t.id} className="flex flex-col gap-1.5 bg-slate-900/40 border border-slate-850/50 p-3 rounded-lg hover:border-slate-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-slate-500 font-mono">[{t.timestamp}]</span>
                            {t.confidence > 0 && (
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                                t.confidence > 0.8 ? 'bg-teal-500/10 text-teal-400' : t.confidence > 0.5 ? 'bg-yellow-500/10 text-yellow-400' : 'bg-rose-500/10 text-rose-400'
                              }`}>
                                {Math.round(t.confidence * 100)}% accuracy
                              </span>
                            )}
                          </div>
                          <button onClick={() => handleDeleteSegment(t.id)} className="p-1 text-slate-500 hover:text-rose-400"><Trash2 size={11} /></button>
                        </div>
                        <div className="flex gap-2 items-start">
                          <Edit3 size={11} className="text-slate-500 shrink-0 mt-1" />
                          <textarea
                            value={t.text}
                            onChange={(e) => handleEditSegment(t.id, e.target.value)}
                            rows={1}
                            className="w-full bg-transparent text-xs text-slate-200 focus:outline-none border-b border-transparent focus:border-teal-500/30 resize-none overflow-hidden"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Subtitle / text downloaders */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button onClick={exportTranscript} className="py-1 px-2 border border-slate-885 bg-slate-900 hover:bg-slate-850 rounded text-[10px] font-bold text-slate-350 flex items-center justify-center gap-1.5"><Download size={11} /> TXT</button>
                    <button onClick={exportSRT} className="py-1 px-2 border border-slate-885 bg-slate-900 hover:bg-slate-850 rounded text-[10px] font-bold text-slate-350 flex items-center justify-center gap-1.5"><Download size={11} /> SRT</button>
                    <button onClick={exportVTT} className="py-1 px-2 border border-slate-885 bg-slate-900 hover:bg-slate-850 rounded text-[10px] font-bold text-slate-350 flex items-center justify-center gap-1.5"><Download size={11} /> VTT</button>
                    <button onClick={exportJSON} className="py-1 px-2 border border-slate-885 bg-slate-900 hover:bg-slate-850 rounded text-[10px] font-bold text-slate-350 flex items-center justify-center gap-1.5"><Download size={11} /> JSON</button>
                  </div>
                </div>
              ) : (
                <div className="h-[200px] bg-slate-950/20 border border-slate-850 rounded-xl flex items-center justify-center text-slate-550 text-xs">
                  No transcription entries yet
                </div>
              )}
            </>
          )}
        </div>

        {/* Configurations Side */}
        <div className="md:col-span-5 flex flex-col gap-4 border-l border-slate-800 md:pl-6">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Engine parameters</span>

          <div className="grid grid-cols-1 gap-3 bg-slate-900/40 p-4 rounded-xl border border-slate-850">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-500 uppercase flex items-center gap-1"><Globe size={11} /> Dictation Language</label>
              <select value={lang} onChange={(e) => setLang(e.target.value)}
                disabled={listening}
                className="bg-slate-950 border border-slate-850 text-xs px-2.5 py-1.5 rounded text-slate-200 focus:outline-none focus:border-teal-500">
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>
            {mode === 'live' && (
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input type="checkbox" checked={continuous} onChange={(e) => setContinuous(e.target.checked)} className="accent-teal-550 w-3.5 h-3.5 rounded" />
                <span className="text-xs text-slate-450">Continuous speech capturing</span>
              </label>
            )}
          </div>

          {/* VAD Decibel ring */}
          {listening && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex flex-col gap-3 items-center text-center">
              <div className="relative w-16 h-16 rounded-full flex items-center justify-center border-2 border-red-550/40 transition-all duration-75" style={{ transform: `scale(${1 + (micLevel / 150)})` }}>
                <Square size={20} className="text-red-400 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-red-400">Microphone Capturing</span>
                <span className="text-[9px] text-slate-555 font-mono mt-0.5">Input volume: {micLevel}%</span>
              </div>
              {interimText && (
                <div className="text-[10px] text-slate-400 bg-slate-950/40 border border-slate-850 px-2 py-1 rounded max-w-full truncate italic">
                  "{interimText}"
                </div>
              )}
            </div>
          )}

          {/* Search & replace tools */}
          {transcripts.length > 0 && (
            <div className="bg-slate-900/30 border border-slate-850 p-4 rounded-xl flex flex-col gap-3">
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5"><Search size={12} /> Replace text keywords</span>
              <div className="flex gap-2">
                <input type="text" placeholder="Find word" value={searchWord} onChange={(e) => setSearchWord(e.target.value)} className="w-1/2 bg-slate-950 border border-slate-850 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none" />
                <input type="text" placeholder="Replace" value={replaceWord} onChange={(e) => setReplaceWord(e.target.value)} className="w-1/2 bg-slate-950 border border-slate-850 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none" />
              </div>
              <button onClick={handleSearchReplace} className="py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded text-[10px] font-bold uppercase tracking-wider">Replace globally</button>
            </div>
          )}

          {/* Text statistics diagnostics */}
          {transcripts.length > 0 && (
            <div className="grid grid-cols-3 gap-2 bg-slate-950/30 p-3 rounded-lg border border-slate-850/60 text-center">
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-550 uppercase">Words</span>
                <span className="text-xs font-bold text-slate-300 font-mono">{wordCount}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-555 uppercase">Characters</span>
                <span className="text-xs font-bold text-slate-300 font-mono">{charCount}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-555 uppercase">WPM Rate</span>
                <span className="text-xs font-bold text-slate-300 font-mono">~{wpm}</span>
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-auto pt-3 border-t border-slate-850">
            {transcripts.length > 0 && (
              <button onClick={() => handleTextCopy(allText, setCopied)} className="p-2 border border-slate-800 bg-slate-900 text-slate-400 hover:text-teal-400 rounded-lg">
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            )}
            {mode === 'live' && (
              listening ? (
                <button onClick={stopLive}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-2.5 rounded-lg transition-colors">
                  <Square size={13} /> Stop Listen
                </button>
              ) : (
                <button onClick={startLive}
                  className="flex-1 bg-teal-600 hover:bg-teal-500 text-white flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold">
                  <Mic size={13} /> Capture Microphone
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
