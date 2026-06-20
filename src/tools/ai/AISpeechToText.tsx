import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Copy, Check, FileText, Loader2, Sparkles, ShieldAlert, Award } from 'lucide-react';
import { handleTextCopy, triggerTextDownload } from '../../utils/sharedHelpers';
import { LocalAIConfigPanel } from '../../components/LocalAIConfigPanel';
import { aiService } from '../../utils/aiService';

export const AISpeechToTextTool = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [refinedTranscript, setRefinedTranscript] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');
  
  const [language, setLanguage] = useState('en-US');
  const [copied, setCopied] = useState(false);
  const [copiedRefined, setCopiedRefined] = useState(false);
  const [supported, setSupported] = useState(true);

  // Model select options configs
  const [selectedModel, setSelectedModel] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are an expert editor. Format and add proper punctuation to transcripts.');
  const [temperature, setTemperature] = useState(0.3);
  const [maxTokens, setMaxTokens] = useState(150);

  // Expanded speech features
  const [keywordSpotter, setKeywordSpotter] = useState('urgency, help, review');
  const [spottedAlert, setSpottedAlert] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<'A' | 'B'>('A');
  const [secondsRecorded, setSecondsRecorded] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [loadingLLM, setLoadingLLM] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const [micLevel, setMicLevel] = useState(0);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<any>(null);
  const waveCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'es-ES', name: 'Spanish (Spain)' },
    { code: 'fr-FR', name: 'French (France)' },
    { code: 'de-DE', name: 'German (Germany)' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'fil-PH', name: 'Filipino (Tagalog)' }
  ];

  // Load cached transcript (Feature 5)
  useEffect(() => {
    const cached = localStorage.getItem('domodomo_stt_cached');
    if (cached) setTranscript(cached);
  }, []);

  // Save cached transcript
  useEffect(() => {
    localStorage.setItem('domodomo_stt_cached', transcript);
    checkKeywordSpotting(transcript);
  }, [transcript]);

  // Keyword spotter check (Feature 10)
  const checkKeywordSpotting = (text: string) => {
    if (!keywordSpotter.trim()) return;
    const keywords = keywordSpotter.split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
    const textLower = text.toLowerCase();
    const spotted = keywords.some(kw => textLower.includes(kw));
    setSpottedAlert(spotted);
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = language;

    rec.onresult = (event: any) => {
      let final = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          // Append speaker tags (Feature 7)
          const tag = `[Speaker ${activeSpeaker}]: `;
          final += (transcript.endsWith('\n') || transcript === '' ? tag : '') + event.results[i][0].transcript + '\n';
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (final) {
        setTranscript(prev => prev + final);
      }
      setInterimTranscript(interim);
    };

    rec.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
    };

    rec.onend = () => {
      setIsRecording(false);
      stopAudioMonitoring();
      stopTimer();
    };

    recognitionRef.current = rec;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      stopAudioMonitoring();
      stopTimer();
    };
  }, [language, activeSpeaker, transcript]);

  // WPM pacing logic (Feature 6)
  useEffect(() => {
    if (secondsRecorded > 0) {
      const words = transcript.split(/\s+/).filter(Boolean).length;
      const calculatedWpm = Math.round((words / secondsRecorded) * 60);
      setWpm(calculatedWpm);
    }
  }, [transcript, secondsRecorded]);

  const startTimer = () => {
    setSecondsRecorded(0);
    timerRef.current = setInterval(() => {
      setSecondsRecorded(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const startAudioMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const drawWaveform = () => {
        const canvas = waveCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        analyser.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        setMicLevel(Math.min(100, Math.round((avg / 128) * 100)));

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw animated wave bars
        const barWidth = canvas.width / bufferLength;
        for (let i = 0; i < bufferLength; i++) {
          const val = dataArray[i];
          const percent = val / 255;
          const h = canvas.height * percent * 0.9;
          
          ctx.fillStyle = '#14b8a6';
          ctx.fillRect(i * barWidth, canvas.height - h, barWidth - 1, h);
        }

        animationFrameRef.current = requestAnimationFrame(drawWaveform);
      };

      drawWaveform();
    } catch (err) {
      console.error('Error starting audio monitoring:', err);
    }
  };

  const stopAudioMonitoring = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setMicLevel(0);
  };

  const handleToggleRecording = () => {
    if (!supported || !recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setInterimTranscript('');
      recognitionRef.current.start();
      setIsRecording(true);
      startAudioMonitoring();
      startTimer();
    }
  };

  // AI Grammar cleaner
  const handleRefineTranscript = async () => {
    if (!transcript.trim()) return;
    setLoadingLLM(true);
    setStatusMsg('Running punctuation refiner...');

    try {
      const prompt = `Correct spelling, format, and add paragraphs/commas to this speech transcription. Maintain speaker tags like [Speaker A] and [Speaker B]:
"${transcript}"

Output only the corrected formatted document.`;

      const result = await aiService.generateText(prompt, maxTokens, () => {}, selectedModel || undefined, {
        systemPrompt,
        temperature
      });
      setRefinedTranscript(result.trim());
    } catch (err: any) {
      setRefinedTranscript(`Polishing Error: ${err.message || err}`);
    } finally {
      setLoadingLLM(false);
      setStatusMsg('');
    }
  };

  // Convert meeting notes
  const handleGenerateNotes = async () => {
    if (!transcript.trim()) return;
    setLoadingLLM(true);
    setStatusMsg('Compiling action logs...');

    try {
      const prompt = `Compile key takeaways, bullet point notes, and action steps from this speech transcript:
"${transcript}"

Output only structured bullet points.`;

      const result = await aiService.generateText(prompt, maxTokens, () => {}, selectedModel || undefined, {
        systemPrompt: 'You are a secretary. Compile meeting minutes and actions items.',
        temperature: 0.5
      });
      setMeetingNotes(result.trim());
    } catch (err: any) {
      setMeetingNotes(`Notes Error: ${err.message || err}`);
    } finally {
      setLoadingLLM(false);
      setStatusMsg('');
    }
  };

  // Load custom audio file placeholder metadata
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTranscript(prev => prev + `[Audio File Loaded: ${file.name} | ${(file.size/1024/1024).toFixed(2)} MB]\n`);
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-4 text-left">
      {/* Settings control panel */}
      <LocalAIConfigPanel
        systemPrompt={systemPrompt}
        onSystemPromptChange={setSystemPrompt}
        temperature={temperature}
        onTemperatureChange={setTemperature}
        maxTokens={maxTokens}
        onMaxTokensChange={setMaxTokens}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />

      <div className={`glass-card p-6 flex flex-col gap-5 transition-all duration-300 ${spottedAlert ? 'border-amber-500/60 shadow-amber-950/20 shadow-lg' : ''}`}>
        <div className="flex justify-between items-center border-b border-slate-850 pb-3">
          <h3 className="font-bold text-teal-400 flex items-center gap-2 text-base">
            <Mic size={18} />
            <span>Local Voice Transcriber</span>
          </h3>
        </div>

        {!supported && (
          <div className="bg-red-950/40 border border-red-900/30 text-red-300 p-3 rounded-lg text-xs">
            Speech Recognition is not supported by your browser. Try Chrome or Safari.
          </div>
        )}

        {/* Configurations - Language & Speaker Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-450">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400">Speech Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={isRecording}
              className="bg-slate-900 border border-slate-850 rounded px-2.5 py-1.5 focus:outline-none"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400">Active Speaker Tag</label>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveSpeaker('A')}
                className={`flex-1 py-1 rounded border text-[11px] font-mono ${activeSpeaker === 'A' ? 'bg-teal-950/40 text-teal-400 border-teal-900/35' : 'bg-slate-900 border-slate-800'}`}
              >
                Speaker A
              </button>
              <button
                onClick={() => setActiveSpeaker('B')}
                className={`flex-1 py-1 rounded border text-[11px] font-mono ${activeSpeaker === 'B' ? 'bg-teal-950/40 text-teal-400 border-teal-900/35' : 'bg-slate-900 border-slate-800'}`}
              >
                Speaker B
              </button>
            </div>
          </div>
        </div>

        {/* Keyword Spotter Config */}
        <div className="flex flex-col gap-1.5 text-xs font-semibold text-slate-450">
          <label className="text-slate-400 flex items-center justify-between">
            <span>Keyword Spotting Alert</span>
            {spottedAlert && <span className="text-[10px] text-amber-400 animate-pulse flex items-center gap-0.5"><ShieldAlert size={11} /> Keywords Spotted!</span>}
          </label>
          <input
            type="text"
            value={keywordSpotter}
            onChange={(e) => setKeywordSpotter(e.target.value)}
            className="bg-slate-900 border border-slate-850 rounded px-3 py-1 text-xs focus:outline-none font-mono"
            placeholder="e.g. alert, emergency, urgent"
          />
        </div>

        {/* Mic waveform panel */}
        {supported && (
          <div className="flex flex-col items-center gap-3.5 bg-slate-950/40 p-4 rounded-xl border border-slate-850">
            <canvas ref={waveCanvasRef} width={400} height={40} className="w-full h-10 bg-slate-900 rounded border border-slate-850" />
            
            <button
              onClick={handleToggleRecording}
              className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all active:scale-95 ${
                isRecording
                  ? 'bg-red-600 border-red-500 text-white animate-pulse'
                  : 'bg-slate-900 border-slate-800 text-teal-400 hover:border-teal-500'
              }`}
            >
              {isRecording ? <MicOff size={22} /> : <Mic size={22} />}
            </button>
            
            <div className="text-center text-[10px] text-slate-500 font-mono flex justify-between w-full px-2">
              <span>Time: {secondsRecorded}s</span>
              <span>Mic: {micLevel}%</span>
              <span>WPM Rate: {wpm}</span>
            </div>
          </div>
        )}

        {/* Audio upload */}
        <div className="flex flex-col gap-1.5 text-xs font-semibold text-slate-400 border-t border-slate-850/60 pt-3">
          <span>Upload Audio File (Metadata Reader)</span>
          <input
            type="file"
            accept="audio/*"
            onChange={handleAudioUpload}
            className="bg-slate-950 border border-slate-900 rounded px-2.5 py-1 text-[10px]"
          />
        </div>

        {/* Transcripts displays */}
        {(transcript || interimTranscript) && (
          <div className="flex flex-col gap-4 border-t border-slate-850 pt-4 animate-fadeIn">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center pb-1">
                <label className="text-xs font-semibold text-slate-400 font-mono flex items-center gap-1.5">
                  <FileText size={13} className="text-teal-400" />
                  <span>Live Transcript</span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTextCopy(transcript + interimTranscript, setCopied)}
                    className="text-slate-400 hover:text-slate-200 p-1 flex items-center gap-1 text-[10px]"
                  >
                    {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={() => triggerTextDownload(transcript + interimTranscript, 'transcript.txt')}
                    className="text-teal-400 hover:text-teal-350 p-1 text-[10px]"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => setTranscript('')}
                    className="text-red-500 hover:text-red-400 text-[10px] pl-1"
                  >
                    Wipe
                  </button>
                </div>
              </div>
              <div className="w-full bg-slate-900/65 border border-slate-850 rounded-lg p-3 text-xs text-slate-350 min-h-24 max-h-36 overflow-y-auto leading-relaxed font-mono whitespace-pre-wrap">
                {transcript}
                {interimTranscript && <span className="text-slate-500 italic bg-teal-950/20 px-1 rounded">{interimTranscript}</span>}
              </div>
            </div>

            {/* AI post-processing operations */}
            <div className="grid grid-cols-2 gap-3.5">
              <button
                onClick={handleRefineTranscript}
                disabled={loadingLLM || !transcript.trim()}
                className="bg-slate-900 border border-slate-800 hover:text-teal-400 text-slate-300 font-semibold p-2 rounded text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
              >
                <Sparkles size={13} />
                <span>Punctuate & Refine</span>
              </button>

              <button
                onClick={handleGenerateNotes}
                disabled={loadingLLM || !transcript.trim()}
                className="bg-slate-900 border border-slate-800 hover:text-teal-400 text-slate-300 font-semibold p-2 rounded text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
              >
                <Award size={13} />
                <span>Generate Meeting Notes</span>
              </button>
            </div>

            {loadingLLM && statusMsg && (
              <div className="flex items-center gap-2 text-slate-400 font-mono text-[9px] bg-slate-950/60 p-2 border border-slate-900 rounded animate-pulse">
                <Loader2 size={11} className="animate-spin text-teal-400" />
                <span>{statusMsg}</span>
              </div>
            )}

            {/* Cleaned Transcript view */}
            {refinedTranscript && (
              <div className="flex flex-col gap-2 bg-slate-900/40 p-4 border border-slate-850 rounded-xl animate-fadeIn">
                <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
                  <span className="text-[10px] font-mono text-teal-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={11} /> Cleaned Punctuation Output
                  </span>
                  <button
                    onClick={() => handleTextCopy(refinedTranscript, setCopiedRefined)}
                    className="text-slate-400 hover:text-slate-200 p-1 flex items-center gap-1 text-[10px]"
                  >
                    {copiedRefined ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                    <span>Copy</span>
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap mt-2">
                  {refinedTranscript}
                </p>
              </div>
            )}

            {/* Structured Notes view */}
            {meetingNotes && (
              <div className="flex flex-col gap-2 bg-slate-900/40 p-4 border border-slate-850 rounded-xl animate-fadeIn">
                <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
                  <span className="text-[10px] font-mono text-teal-400 uppercase tracking-wider flex items-center gap-1">
                    <Award size={11} /> AI Minutes & Bullet Notes
                  </span>
                  <button
                    onClick={() => triggerTextDownload(meetingNotes, 'meeting-notes.txt')}
                    className="text-teal-450 hover:text-teal-350 p-1 text-[10px] font-medium"
                  >
                    Download Notes (.txt)
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap mt-2">
                  {meetingNotes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
