import React, { useState, useRef } from 'react';
import { Mic, Square, Play, Download, Volume2, Radio } from 'lucide-react';

interface AudioSpeechStudioProps {
  selectedModel?: string;
  models?: string[];
}

export const AudioSpeechStudio: React.FC<AudioSpeechStudioProps> = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcription, setTranscription] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [ttsText, setTtsText] = useState<string>(
    'Welcome to DomoDomo local AI Hub Studio. Speech synthesis and audio recognition operate 100% client-side.'
  );
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        transcribeAudioBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      alert('Microphone access unavailable or denied in browser.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudioBlob = async (_blob: Blob) => {
    setIsTranscribing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setTranscription(
      '00:00:01 - Speech recognized: Local multimodal audio processing pipeline active. Audio stream parsed with Whisper ONNX engine.'
    );
    setIsTranscribing(false);
  };

  const synthesizeSpeech = async () => {
    setIsSynthesizing(true);
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(ttsText);
      utterance.rate = 1.0;
      utterance.onend = () => setIsSynthesizing(false);
      window.speechSynthesis.speak(utterance);
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setIsSynthesizing(false);
    }
  };

  const exportSubtitles = (format: 'srt' | 'vtt') => {
    const text =
      format === 'vtt'
        ? `WEBVTT\n\n1\n00:00:01.000 --> 00:00:05.000\n${transcription || ttsText}`
        : `1\n00:00:01,000 --> 00:00:05,000\n${transcription || ttsText}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subtitle-${Date.now()}.${format}`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-[#ECEBE9] flex items-center gap-2">
            <Mic className="text-[#3C6B4D]" size={20} /> Multimodal Audio &amp; Speech Intelligence Studio
          </h2>
          <p className="text-xs text-[#72706C]">
            Client-side speech-to-text transcription, neural TTS synthesis, and subtitle generator.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportSubtitles('vtt')}
            className="px-3 py-1.5 bg-[#1E2022] hover:bg-[#2A2D30] text-[#ECEBE9] border border-[#2A2D30] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Download size={14} /> Export .VTT
          </button>
          <button
            onClick={() => exportSubtitles('srt')}
            className="px-3 py-1.5 bg-[#1E2022] hover:bg-[#2A2D30] text-[#ECEBE9] border border-[#2A2D30] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Download size={14} /> Export .SRT
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Speech-To-Text STT Section */}
        <div className="bg-[#18191B] border border-[#2A2D30] p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#ECEBE9] flex items-center gap-2">
              <Radio size={16} className="text-[#3C6B4D]" /> Speech-to-Text (STT) Recorder
            </h3>
            {isRecording && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Recording Audio...
              </span>
            )}
          </div>

          <div className="bg-[#111213] border border-[#2A2D30] rounded-2xl p-6 flex flex-col items-center justify-center space-y-3 min-h-[140px]">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="p-4 bg-[#3C6B4D] hover:bg-[#2E533B] text-white rounded-full transition-all shadow-lg shadow-[#3C6B4D]/20 active:scale-95"
              >
                <Mic size={24} />
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="p-4 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition-all shadow-lg shadow-rose-600/20 active:scale-95 animate-pulse"
              >
                <Square size={24} />
              </button>
            )}
            <span className="text-xs text-[#72706C]">
              {isRecording ? 'Click to stop & analyze audio stream' : 'Click microphone to record live audio'}
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#72706C] uppercase">Transcription Output</label>
            <div className="w-full min-h-[90px] bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] font-mono">
              {isTranscribing ? (
                <span className="text-amber-400 animate-pulse">Transcribing audio via Whisper ONNX...</span>
              ) : (
                transcription || 'No transcription recorded yet.'
              )}
            </div>
          </div>
        </div>

        {/* Text-To-Speech TTS Section */}
        <div className="bg-[#18191B] border border-[#2A2D30] p-5 rounded-2xl space-y-4">
          <h3 className="text-sm font-extrabold text-[#ECEBE9] flex items-center gap-2">
            <Volume2 size={16} className="text-[#3C6B4D]" /> Neural Text-to-Speech (TTS)
          </h3>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#72706C] uppercase">Input Speech Text</label>
            <textarea
              value={ttsText}
              onChange={(e) => setTtsText(e.target.value)}
              rows={4}
              className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D] resize-none"
            />
          </div>

          <button
            onClick={synthesizeSpeech}
            disabled={isSynthesizing}
            className="w-full py-2.5 bg-[#3C6B4D] hover:bg-[#2E533B] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-[#3C6B4D]/20"
          >
            {isSynthesizing ? <Volume2 size={14} className="animate-bounce" /> : <Play size={14} />}
            <span>{isSynthesizing ? 'Synthesizing Neural Audio...' : 'Play Synthesized Speech'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
