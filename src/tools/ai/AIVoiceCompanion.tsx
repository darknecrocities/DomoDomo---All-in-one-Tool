import React, { useState, useEffect, useRef } from 'react';
import { aiService } from '../../utils/aiService';
import { Mic, MicOff, Volume2, Sparkles, AlertTriangle } from 'lucide-react';

export const AIVoiceCompanion: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Click mic to start talking to Domo');
  const [chatLog, setChatLog] = useState<{ sender: 'user' | 'domo'; text: string }[]>([]);
  const [modelStatus, setModelStatus] = useState<'idle' | 'transcribing' | 'thinking' | 'speaking'>('idle');
  const [hasMicPermission, setHasMicPermission] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Request mic permissions on mount
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => setHasMicPermission(true))
      .catch(() => setHasMicPermission(false));

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  // Drawing glowing amplitude circle
  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const analyser = analyserRef.current;

    const dataArray = new Uint8Array(analyser ? analyser.frequencyBinCount : 128);
    
    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, width, height);

      let averageAmplitude = 0;
      if (analyser && isRecording) {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        averageAmplitude = sum / dataArray.length;
      } else if (modelStatus === 'speaking') {
        // Mock subtle pulsing when AI speaks
        averageAmplitude = 30 + Math.sin(Date.now() * 0.015) * 15;
      } else if (modelStatus === 'thinking') {
        averageAmplitude = 10 + Math.random() * 8;
      }

      // Base radius of glowing circle
      const baseRadius = 60 + averageAmplitude * 0.8;

      // Outer glow radial gradient matching Forest Green #3C6B4D
      const grad = ctx.createRadialGradient(width / 2, height / 2, baseRadius * 0.5, width / 2, height / 2, baseRadius * 1.5);
      
      let glowColor = 'rgba(60, 107, 77, '; // Forest Green base
      if (modelStatus === 'transcribing') glowColor = 'rgba(226, 158, 45, '; // Amber
      if (modelStatus === 'thinking') glowColor = 'rgba(59, 130, 246, '; // Blue

      grad.addColorStop(0, `${glowColor}0.3)`);
      grad.addColorStop(0.5, `${glowColor}0.1)`);
      grad.addColorStop(1, `${glowColor}0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, baseRadius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Inner Core Solid circle
      ctx.fillStyle = modelStatus === 'transcribing' ? '#E29E2D' : 
                      modelStatus === 'thinking' ? '#3b82f6' : '#3C6B4D';
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, baseRadius * 0.6, 0, Math.PI * 2);
      ctx.fill();
    };

    draw();
  };

  const startVoiceRecording = async () => {
    if (!hasMicPermission) {
      alert('Microphone permission is required to run the Voice Companion.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      setModelStatus('idle');
      setStatusMsg('Listening to your voice... Click stop to finish.');

      // Setup audio analyzer
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;

      drawWaveform();

      // Setup recorder
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        stream.getTracks().forEach(track => track.stop());
        if (audioCtxRef.current) {
          audioCtxRef.current.close();
          audioCtxRef.current = null;
        }
        analyserRef.current = null;
        processUserAudio(audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
    } catch (e) {
      console.error('Error starting audio recording:', e);
      setIsRecording(false);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processUserAudio = async (audioBlob: Blob) => {
    setModelStatus('transcribing');
    setStatusMsg('Transcribing your speech offline...');
    
    try {
      // 1. Transcribe voice inputs using Whisper model
      const transcript = await aiService.transcribeAudio(audioBlob, false, (status, prog) => {
        setStatusMsg(`${status} (${prog}%)`);
      });

      if (!transcript.trim()) {
        setStatusMsg('Could not understand speech. Click mic to try again.');
        setModelStatus('idle');
        return;
      }

      setChatLog(prev => [...prev, { sender: 'user', text: transcript }]);
      
      // 2. Query LLM model with strict prompt constraints
      setModelStatus('thinking');
      setStatusMsg('Domo is formulating response...');

      const responseText = await aiService.generateText(
        transcript,
        40, // very short to reduce synthesis duration
        undefined,
        undefined,
        {
          systemPrompt: 'You are Domo Voice Companion. Respond to the user in a short, friendly sentence. Maximum 12 words.'
        }
      );

      setChatLog(prev => [...prev, { sender: 'domo', text: responseText }]);

      // 3. Synthesize Speech locally with SpeechT5
      setModelStatus('speaking');
      setStatusMsg('Synthesizing speech locally...');

      const synthesis = await aiService.synthesizeSpeechLocally(
        responseText,
        'cmu_us_awb_arctic-wav-arctic_a0001',
        (status, prog) => {
          setStatusMsg(`${status} (${prog}%)`);
        }
      );

      // Play synthesized float32 buffer
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const playCtx = new AudioCtx();
      const playBuffer = playCtx.createBuffer(1, synthesis.audio.length, synthesis.sampling_rate);
      playBuffer.copyToChannel(synthesis.audio as any, 0);

      const playSource = playCtx.createBufferSource();
      playSource.buffer = playBuffer;
      playSource.connect(playCtx.destination);
      
      playSource.onended = () => {
        setModelStatus('idle');
        setStatusMsg('Click mic to start talking to Domo');
        playCtx.close();
      };
      
      playSource.start();
    } catch (err: any) {
      console.error('Error during voice synthesis processing cycle:', err);
      setStatusMsg(`Voice system error: ${err.message || String(err)}`);
      setModelStatus('idle');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111213] text-[#ECEBE9] font-sans p-6 rounded-3xl border border-[#2A2D30] overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center gap-2 mb-6 border-b border-[#2A2D30] pb-6">
        <div className="p-2 rounded-xl bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/20">
          <Volume2 size={20} className="animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Domo voice Companion</h1>
          <p className="text-xs text-[#A3A09B]">
            Real-time vocal conversation simulator utilizing 100% offline speech recognition (Whisper) and speech synthesis (SpeechT5).
          </p>
        </div>
      </div>

      {/* Warning if no permissions */}
      {!hasMicPermission && (
        <div className="mb-4 bg-red-400/10 border border-red-400/20 text-red-400 p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold">
          <AlertTriangle size={16} />
          Please enable microphone permissions in your browser settings to run vocal simulations.
        </div>
      )}

      {/* Main companion interface layout */}
      <div className="flex-grow flex flex-col lg:flex-row gap-6 min-h-0 overflow-hidden">
        {/* Glow Sphere Viewport */}
        <div className="flex-grow bg-[#18191B]/40 rounded-3xl border border-[#2A2D30] flex flex-col items-center justify-center p-6 min-h-[300px]">
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            className="w-64 h-64 mb-6 rounded-full"
          />

          <div className="text-center">
            <div className="text-xs font-bold text-[#ECEBE9] mb-1">{statusMsg}</div>
            <div className="text-[10px] text-[#A3A09B] uppercase font-black tracking-wider">System State: {modelStatus}</div>
          </div>

          <button
            onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
            disabled={!hasMicPermission || modelStatus === 'speaking' || modelStatus === 'thinking' || modelStatus === 'transcribing'}
            className={`mt-6 p-6 rounded-full shadow-2xl transition-all border ${
              isRecording 
                ? 'bg-red-500/20 border-red-500 hover:bg-red-500/30 text-red-500 animate-pulse'
                : 'bg-[#3C6B4D]/20 border-[#3C6B4D] hover:bg-[#3C6B4D]/30 text-[#3C6B4D] disabled:opacity-50'
            }`}
          >
            {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
          </button>
        </div>

        {/* Dynamic chat dialogue logs */}
        <div className="w-full lg:w-96 bg-[#18191B] border border-[#2A2D30] rounded-3xl p-6 flex flex-col justify-between overflow-hidden">
          <div className="flex flex-col h-full min-h-0 justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-[#3C6B4D]" />
                <span className="text-xs font-black tracking-wider text-[#ECEBE9]">Vocal Dialogue Logs</span>
              </div>
              <hr className="border-[#2A2D30] mb-4" />
            </div>

            <div className="flex-grow overflow-y-auto max-h-[320px] mb-4 pr-1 flex flex-col gap-3">
              {chatLog.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-[#A3A09B] p-6">
                  <Volume2 size={24} className="text-[#2A2D30] mb-2 animate-bounce" />
                  <span className="text-[10px] font-bold text-[#A3A09B]">Dialogue logs are empty.</span>
                </div>
              ) : (
                chatLog.map((log, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-2xl max-w-[85%] text-xs font-semibold ${
                      log.sender === 'user' 
                        ? 'bg-[#3C6B4D]/15 text-[#ECEBE9] border border-[#3C6B4D]/25 self-end'
                        : 'bg-[#2A2D30]/40 text-[#A3A09B] border border-[#2A2D30]/65 self-start'
                    }`}
                  >
                    <div className="text-[8px] uppercase tracking-wider mb-0.5 opacity-60">
                      {log.sender === 'user' ? 'You' : 'Domo'}
                    </div>
                    <div>{log.text}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AIVoiceCompanion;
