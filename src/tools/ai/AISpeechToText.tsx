import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Copy, Check, FileText, Globe } from 'lucide-react';
import { handleTextCopy, triggerTextDownload } from '../../utils/sharedHelpers';

export const AISpeechToTextTool = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [language, setLanguage] = useState('en-US');
  const [copied, setCopied] = useState(false);
  const [supported, setSupported] = useState(true);

  // Web Audio levels for visual feedback
  const [micLevel, setMicLevel] = useState(0);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Languages list
  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'es-ES', name: 'Spanish (Spain)' },
    { code: 'fr-FR', name: 'French (France)' },
    { code: 'de-DE', name: 'German (Germany)' },
    { code: 'it-IT', name: 'Italian (Italy)' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' },
    { code: 'fil-PH', name: 'Filipino (Tagalog)' }
  ];

  useEffect(() => {
    // Initialize Web Speech Recognition
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
          final += event.results[i][0].transcript + ' ';
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
    };

    recognitionRef.current = rec;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      stopAudioMonitoring();
    };
  }, [language]);

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

      const checkLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        // Clamp and map to a scale of 0 to 100
        setMicLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animationFrameRef.current = requestAnimationFrame(checkLevel);
      };

      checkLevel();
    } catch (err) {
      console.error('Error starting audio context:', err);
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
    }
  };

  return (
    <div className="max-w-xl mx-auto glass-card p-6 flex flex-col gap-5 text-left">
      <div className="flex justify-between items-center border-b border-slate-850 pb-3">
        <h3 className="font-bold text-teal-400 flex items-center gap-2 text-base">
          <Mic size={18} />
          <span>Local Voice Transcriber</span>
        </h3>
        <span className="text-[10px] bg-slate-800 text-slate-350 px-2 py-0.5 rounded border border-slate-750">
          Native Web Speech API
        </span>
      </div>

      {!supported && (
        <div className="bg-red-950/40 border border-red-900/30 text-red-300 p-3 rounded-lg text-xs">
          Speech Recognition is not supported by your current browser. Please try Chrome, Safari, or Edge.
        </div>
      )}

      {/* Language Selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
          <Globe size={12} className="text-teal-400" />
          <span>Speech Language</span>
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={isRecording}
          className="bg-slate-900 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      {/* Mic Trigger */}
      {supported && (
        <div className="flex flex-col items-center gap-3.5 bg-slate-950/40 p-5 rounded-xl border border-slate-850">
          <button
            onClick={handleToggleRecording}
            className={`w-16 h-16 rounded-full flex items-center justify-center border transition-all shadow-md active:scale-95 ${
              isRecording
                ? 'bg-red-600 border-red-500 text-white animate-pulse'
                : 'bg-slate-900 border-slate-800 text-teal-400 hover:border-teal-500'
            }`}
          >
            {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          
          <div className="text-center">
            <span className="text-[11px] font-semibold text-slate-300">
              {isRecording ? 'Listening... Speak now.' : 'Click to start transcribing'}
            </span>
            {isRecording && (
              <div className="w-24 bg-slate-900 h-1.5 rounded-full overflow-hidden mt-2 mx-auto border border-slate-850">
                <div
                  className="bg-teal-400 h-full transition-all duration-150"
                  style={{ width: `${micLevel}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transcript Results */}
      {(transcript || interimTranscript) && (
        <div className="flex flex-col gap-2.5 animate-fadeIn">
          <div className="flex justify-between items-center pb-1">
            <label className="text-xs font-semibold text-slate-400 font-mono flex items-center gap-1.5">
              <FileText size={13} className="text-teal-400" />
              <span>Live Transcription</span>
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
                onClick={() => triggerTextDownload(transcript + interimTranscript, 'voice-transcript.txt')}
                className="text-teal-400 hover:text-teal-350 p-1 text-[10px] font-medium"
              >
                Download (.txt)
              </button>
            </div>
          </div>
          
          <div className="w-full bg-slate-900/65 border border-slate-850 rounded-lg p-3 text-xs text-slate-200 min-h-24 max-h-48 overflow-y-auto leading-relaxed">
            <span className="text-slate-200">{transcript}</span>
            {interimTranscript && (
              <span className="text-slate-400 italic bg-teal-950/20 px-1 rounded">{interimTranscript}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
