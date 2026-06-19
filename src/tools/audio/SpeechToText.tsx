import { useState, useRef, useEffect, useCallback } from 'react';
import { triggerTextDownload, handleTextCopy } from '../../utils/sharedHelpers';
import { Mic, Square, Download, Copy, Check, Globe, Upload, Loader2 } from 'lucide-react';

interface Transcript { text: string; timestamp: string; confidence: number; }

export const SpeechToTextTool = () => {
  const [mode, setMode] = useState<'live' | 'file'>('live');
  const [listening, setListening] = useState(false);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [interimText, setInterimText] = useState('');
  const [lang, setLang] = useState('en-US');
  const [continuous, setContinuous] = useState(true);
  const [copied, setCopied] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

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
    { code: 'tl-PH', label: 'Filipino' },
  ];

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const startLive = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Speech = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Speech) {
      alert('Speech recognition is not supported in this browser. Use Chrome or Edge.');
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = new Speech() as any;
    recRef.current = rec;
    rec.lang = lang;
    rec.continuous = continuous;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => setListening(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.oninterimresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (!e.results[i].isFinal) interim += e.results[i][0].transcript;
      }
      setInterimText(interim);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          const result = e.results[i][0];
          const entry: Transcript = {
            text: result.transcript,
            timestamp: new Date().toLocaleTimeString(),
            confidence: result.confidence,
          };
          setTranscripts(prev => [...prev, entry]);
          setInterimText('');
        }
      }
    };
    rec.onerror = () => { setListening(false); setInterimText(''); };
    rec.onend = () => { setListening(false); setInterimText(''); };
    rec.start();
  }, [lang, continuous]);

  const stopLive = () => {
    recRef.current?.stop();
    setListening(false);
    setInterimText('');
  };

  const startFileTranscription = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !file) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Speech = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Speech) { alert('Speech recognition not supported.'); return; }

    setProcessing(true);
    setTranscripts([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = new Speech() as any;
    recRef.current = rec;
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          setTranscripts(prev => [...prev, {
            text: e.results[i][0].transcript,
            timestamp: `${audio.currentTime.toFixed(1)}s`,
            confidence: e.results[i][0].confidence,
          }]);
        }
      }
    };
    rec.onerror = () => { setProcessing(false); audio.pause(); };
    rec.onend = () => { setProcessing(false); };

    // Route audio through speaker (recognition will pick up)
    audio.currentTime = 0;
    audio.play();
    rec.start();
  }, [file, lang]);

  const allText = transcripts.map(t => t.text).join(' ');

  const exportTranscript = () => {
    const content = transcripts.map(t =>
      `[${t.timestamp}] (${Math.round((t.confidence || 0) * 100)}% confidence)\n${t.text}`
    ).join('\n\n');
    triggerTextDownload(content, 'transcript.txt');
  };

  const exportSRT = () => {
    const srt = transcripts.map((t, i) => `${i + 1}\n00:00:0${i * 3},000 --> 00:00:0${(i + 1) * 3},000\n${t.text}\n`).join('\n');
    triggerTextDownload(srt, 'transcript.srt');
  };

  return (
    <div className="max-w-2xl mx-auto glass-card p-6 flex flex-col gap-5 text-left">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Mic size={18} className="text-teal-400" />
        <h3 className="font-bold text-teal-400 text-sm">Speech to Text Transcriber</h3>
        <span className="ml-auto text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full">Web Speech API</span>
      </div>

      {/* Mode */}
      <div className="flex gap-2">
        {(['live', 'file'] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); stopLive(); setTranscripts([]); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg border capitalize transition-all flex items-center justify-center gap-1.5 ${
              mode === m ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-700 bg-slate-900 text-slate-400'
            }`}>
            {m === 'live' ? <Mic size={12} /> : <Upload size={12} />}
            {m === 'live' ? 'Live Microphone' : 'From Audio File'}
          </button>
        ))}
      </div>

      {/* Settings */}
      <div className="grid grid-cols-2 gap-3 bg-slate-900/50 rounded-lg p-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400 flex items-center gap-1"><Globe size={10} /> Language</label>
          <select value={lang} onChange={(e) => setLang(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs px-2 py-1.5 rounded text-slate-200">
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>
        {mode === 'live' && (
          <div className="flex items-center gap-2">
            <input type="checkbox" id="continuous-mode" checked={continuous} onChange={(e) => setContinuous(e.target.checked)} className="accent-teal-500" />
            <label htmlFor="continuous-mode" className="text-xs text-slate-400">Continuous (keep listening)</label>
          </div>
        )}
      </div>

      {/* File mode */}
      {mode === 'file' && (
        <div className="flex flex-col gap-2">
          {!file ? (
            <label className="flex flex-col items-center gap-2 py-6 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-teal-500/50 transition-colors">
              <Upload size={24} className="text-teal-400" />
              <span className="text-slate-300 text-xs">Upload audio to transcribe</span>
              <input type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
            </label>
          ) : (
            <audio ref={audioRef} src={fileUrl} controls className="w-full" />
          )}
        </div>
      )}

      {/* Live indicator */}
      {listening && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs text-red-400 font-bold">Recording…</span>
          {interimText && <span className="text-xs text-slate-400 italic ml-2 truncate">{interimText}</span>}
        </div>
      )}

      {/* Transcript display */}
      {transcripts.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-400 font-medium">{transcripts.length} segments transcribed</label>
            <div className="flex gap-2">
              <button onClick={() => handleTextCopy(allText, setCopied)}
                className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300">
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy All'}
              </button>
              <button onClick={() => setTranscripts([])} className="text-xs text-slate-500 hover:text-red-400">Clear</button>
            </div>
          </div>
          <div className="bg-slate-900/80 rounded-xl p-3 max-h-52 overflow-y-auto flex flex-col gap-2">
            {transcripts.map((t, i) => (
              <div key={i} className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-mono">[{t.timestamp}]</span>
                  {t.confidence > 0 && (
                    <span className={`text-[10px] px-1 rounded ${t.confidence > 0.8 ? 'text-teal-400' : t.confidence > 0.5 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {Math.round(t.confidence * 100)}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-200">{t.text}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={exportTranscript}
              className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors">
              <Download size={12} /> Export .TXT
            </button>
            <button onClick={exportSRT}
              className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors">
              <Download size={12} /> Export .SRT
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {mode === 'live' ? (
          listening ? (
            <button onClick={stopLive}
              className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-2.5 rounded-lg transition-colors">
              <Square size={14} /> Stop Recording
            </button>
          ) : (
            <button onClick={startLive}
              className="flex-1 btn-primary flex items-center justify-center gap-2 py-2.5 text-xs font-bold">
              <Mic size={14} /> Start Recording
            </button>
          )
        ) : (
          <button onClick={startFileTranscription} disabled={!file || processing}
            className="flex-1 btn-primary flex items-center justify-center gap-2 py-2.5 text-xs font-bold disabled:opacity-50">
            {processing ? <Loader2 size={14} className="animate-spin" /> : <Mic size={14} />}
            {processing ? 'Transcribing…' : 'Transcribe File'}
          </button>
        )}
      </div>
    </div>
  );
};


