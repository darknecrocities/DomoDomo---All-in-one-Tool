import React, { useState, useRef, useEffect } from 'react';
import {
  Volume2,
  Play,
  Square,
  Download,
  ZoomIn,
  ZoomOut,
  Sliders,
  ShieldCheck,
  Sparkles,
  Music,
} from 'lucide-react';
import { generateSynthWavBuffer } from './wavHelper';

type Waveform = 'sine' | 'square' | 'sawtooth' | 'triangle';

interface ADSREnvelope {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

export const SynthSoundStudioTool: React.FC = () => {
  const [waveform, setWaveform] = useState<Waveform>('sawtooth');
  const [baseFreq, setBaseFreq] = useState<number>(440);
  const [envelope, setEnvelope] = useState<ADSREnvelope>({
    attack: 0.05,
    decay: 0.2,
    sustain: 0.5,
    release: 0.4,
  });
  const [filterCutoff, setFilterCutoff] = useState<number>(2400);
  const [filterResonance, setFilterResonance] = useState<number>(4);
  const [lfoRate, setLfoRate] = useState<number>(5);
  const [lfoDepth, setLfoDepth] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(1.0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playTone = (freq: number = baseFreq, duration: number = 0.8) => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();

    if (!analyserRef.current) {
      analyserRef.current = ctx.createAnalyser();
      analyserRef.current.fftSize = 256;
    }

    // Configure Oscillator
    osc.type = waveform;
    osc.frequency.setValueAtTime(freq, now);

    // Configure LFO Vibrato
    if (lfoDepth > 0) {
      lfo.frequency.setValueAtTime(lfoRate, now);
      lfoGain.gain.setValueAtTime(lfoDepth, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(now);
      lfo.stop(now + duration + envelope.release);
    }

    // Configure Biquad Filter
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterCutoff, now);
    filter.Q.setValueAtTime(filterResonance, now);

    // Configure ADSR Envelope
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.7, now + envelope.attack);
    gain.gain.exponentialRampToValueAtTime(Math.max(envelope.sustain * 0.7, 0.0001), now + envelope.attack + envelope.decay);
    gain.gain.setValueAtTime(Math.max(envelope.sustain * 0.7, 0.0001), now + duration);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + envelope.release);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(analyserRef.current);
    analyserRef.current.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + envelope.release);
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), (duration + envelope.release) * 1000);
  };

  // Oscilloscope Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      ctx.fillStyle = '#0D0D0D';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (!analyserRef.current) {
        ctx.strokeStyle = '#2A2D30';
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
        return;
      }

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteTimeDomainData(dataArray);

      ctx.lineWidth = 2 * scale;
      ctx.strokeStyle = '#D4AF37';
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [scale]);

  // SFX Presets
  const applyPreset = (preset: string) => {
    if (preset === 'coin') {
      setWaveform('square');
      setBaseFreq(987.77); // B5
      setEnvelope({ attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.15 });
      setFilterCutoff(4000);
      setLfoDepth(0);
      setTimeout(() => playTone(1318.51, 0.25), 80); // E6
      playTone(987.77, 0.1);
    } else if (preset === 'laser') {
      setWaveform('sawtooth');
      setBaseFreq(880);
      setEnvelope({ attack: 0.01, decay: 0.15, sustain: 0.1, release: 0.1 });
      setFilterCutoff(3200);
      setLfoRate(20);
      setLfoDepth(120);
      playTone(880, 0.2);
    } else if (preset === 'jump') {
      setWaveform('square');
      setBaseFreq(220);
      setEnvelope({ attack: 0.02, decay: 0.2, sustain: 0.3, release: 0.15 });
      setFilterCutoff(2800);
      playTone(330, 0.25);
    } else if (preset === 'powerup') {
      setWaveform('triangle');
      setEnvelope({ attack: 0.05, decay: 0.3, sustain: 0.6, release: 0.3 });
      setFilterCutoff(5000);
      [261.63, 329.63, 392.0, 523.25].forEach((f, idx) => {
        setTimeout(() => playTone(f, 0.18), idx * 75);
      });
    } else if (preset === 'drone') {
      setWaveform('sine');
      setBaseFreq(110);
      setEnvelope({ attack: 0.4, decay: 0.5, sustain: 0.8, release: 0.8 });
      setFilterCutoff(1200);
      setLfoRate(2);
      setLfoDepth(15);
      playTone(110, 1.5);
    }
  };

  // Export to 16-bit PCM WAV
  const handleExportWav = () => {
    const wavBuffer = generateSynthWavBuffer({
      waveform,
      baseFreq,
      attack: envelope.attack,
      decay: envelope.decay,
      sustain: envelope.sustain,
      release: envelope.release,
      duration: 1.0,
    });
    const blob = new Blob([wavBuffer], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `synth-${waveform}-${Math.round(baseFreq)}hz.wav`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pianoKeys = [
    { note: 'C4', freq: 261.63 },
    { note: 'D4', freq: 293.66 },
    { note: 'E4', freq: 329.63 },
    { note: 'F4', freq: 349.23 },
    { note: 'G4', freq: 392.0 },
    { note: 'A4', freq: 440.0 },
    { note: 'B4', freq: 493.88 },
    { note: 'C5', freq: 523.25 },
  ];

  return (
    <div className="flex flex-col gap-6 text-left max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2A2D30] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#A3A09B] uppercase tracking-wider mb-1">
            <span>Audio Suite</span>
            <span>/</span>
            <span className="text-white">Synthesizer Studio</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Volume2 className="text-[#D4AF37]" size={24} />
            <span>Web Audio Synthesizer & Sound FX</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Multi-waveform modular synthesizer with real-time ADSR, lowpass biquad filter, and 16-bit WAV export.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => playTone()}
            className="px-4 py-2 bg-white text-black hover:bg-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg"
          >
            {isPlaying ? <Square size={14} className="fill-black" /> : <Play size={14} className="fill-black" />}
            <span>{isPlaying ? 'Playing...' : 'Play Sound'}</span>
          </button>
          <button
            type="button"
            onClick={handleExportWav}
            className="px-4 py-2 bg-[#18191B] border border-[#2A2D30] hover:bg-[#2A2D30] text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <Download size={14} />
            <span>Export WAV</span>
          </button>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold text-[#ECEBE9] flex items-center gap-1.5 uppercase tracking-wider">
          <Sparkles size={14} className="text-[#D4AF37]" />
          <span>Preset Sound Effects</span>
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: '8-Bit Coin', key: 'coin' },
            { label: 'Laser Blaster', key: 'laser' },
            { label: 'Retro Jump', key: 'jump' },
            { label: 'Power-Up Arp', key: 'powerup' },
            { label: 'Deep Drone', key: 'drone' },
          ].map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => applyPreset(p.key)}
              className="px-3 py-1.5 bg-[#111213] border border-[#2A2D30] hover:border-[#D4AF37] text-white rounded-xl text-xs font-medium transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Oscilloscope Viewport */}
      <div className="bg-[#111213] border border-[#2A2D30] rounded-3xl p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs border-b border-[#2A2D30] pb-2">
          <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
            <Music size={13} className="text-[#D4AF37]" />
            <span>Real-Time Waveform Oscilloscope</span>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(s - 0.2, 0.6))}
              className="p-1 bg-[#18191B] border border-[#2A2D30] rounded hover:bg-[#2A2D30] text-slate-300"
              title="Zoom Out"
            >
              <ZoomOut size={13} />
            </button>
            <span className="font-mono text-[11px] text-[#A3A09B] px-1">{Math.round(scale * 100)}%</span>
            <button
              type="button"
              onClick={() => setScale((s) => Math.min(s + 0.2, 2.0))}
              className="p-1 bg-[#18191B] border border-[#2A2D30] rounded hover:bg-[#2A2D30] text-slate-300"
              title="Zoom In"
            >
              <ZoomIn size={13} />
            </button>
          </div>
        </div>

        <div className="w-full bg-[#0D0D0D] border border-[#2A2D30] rounded-2xl p-2 flex justify-center">
          <canvas ref={canvasRef} width={640} height={140} className="rounded-xl w-full max-h-[140px]" />
        </div>
      </div>

      {/* Piano Keyboard */}
      <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-4 flex flex-col gap-2">
        <span className="text-[11px] font-bold text-[#A3A09B] uppercase tracking-wider">Interactive Scale Test</span>
        <div className="grid grid-cols-8 gap-1.5">
          {pianoKeys.map((k) => (
            <button
              key={k.note}
              type="button"
              onClick={() => {
                setBaseFreq(k.freq);
                playTone(k.freq, 0.4);
              }}
              className="py-3 bg-[#111213] border border-[#2A2D30] hover:bg-white hover:text-black rounded-xl text-xs font-mono font-bold text-slate-300 transition-colors"
            >
              {k.note}
            </button>
          ))}
        </div>
      </div>

      {/* Synthesis Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Oscillator & Frequency */}
        <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 flex flex-col gap-4">
          <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Sliders size={14} className="text-[#D4AF37]" />
            <span>Oscillator Parameters</span>
          </span>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] text-slate-400">Waveform</label>
            <div className="grid grid-cols-2 gap-2">
              {(['sine', 'square', 'sawtooth', 'triangle'] as Waveform[]).map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWaveform(w)}
                  className={`py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                    waveform === w ? 'bg-white text-black border-white' : 'bg-[#111213] border-[#2A2D30] text-slate-400'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Base Frequency</span>
              <span className="font-mono text-white">{Math.round(baseFreq)} Hz</span>
            </div>
            <input
              type="range"
              min={60}
              max={1200}
              value={baseFreq}
              onChange={(e) => setBaseFreq(Number(e.target.value))}
              className="accent-white"
            />
          </div>
        </div>

        {/* ADSR Envelope */}
        <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 flex flex-col gap-3">
          <span className="font-bold text-white text-xs uppercase tracking-wider">ADSR Envelope</span>

          {[
            { label: 'Attack', key: 'attack', min: 0.01, max: 1.0, unit: 's' },
            { label: 'Decay', key: 'decay', min: 0.01, max: 1.0, unit: 's' },
            { label: 'Sustain', key: 'sustain', min: 0.0, max: 1.0, unit: '' },
            { label: 'Release', key: 'release', min: 0.05, max: 2.0, unit: 's' },
          ].map((param) => (
            <div key={param.key} className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>{param.label}</span>
                <span className="font-mono text-white">
                  {(envelope as any)[param.key].toFixed(2)}
                  {param.unit}
                </span>
              </div>
              <input
                type="range"
                min={param.min}
                max={param.max}
                step={0.01}
                value={(envelope as any)[param.key]}
                onChange={(e) =>
                  setEnvelope((prev) => ({ ...prev, [param.key]: Number(e.target.value) }))
                }
                className="accent-white"
              />
            </div>
          ))}
        </div>

        {/* Filter & Modulation */}
        <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 flex flex-col gap-3">
          <span className="font-bold text-white text-xs uppercase tracking-wider">Filter & Vibrato</span>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Lowpass Cutoff</span>
              <span className="font-mono text-white">{filterCutoff} Hz</span>
            </div>
            <input
              type="range"
              min={200}
              max={8000}
              step={50}
              value={filterCutoff}
              onChange={(e) => setFilterCutoff(Number(e.target.value))}
              className="accent-white"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Filter Resonance (Q)</span>
              <span className="font-mono text-white">{filterResonance}</span>
            </div>
            <input
              type="range"
              min={0}
              max={15}
              step={0.5}
              value={filterResonance}
              onChange={(e) => setFilterResonance(Number(e.target.value))}
              className="accent-white"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Vibrato LFO Depth</span>
              <span className="font-mono text-white">{lfoDepth}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={lfoDepth}
              onChange={(e) => setLfoDepth(Number(e.target.value))}
              className="accent-white"
            />
          </div>
        </div>
      </div>

      {/* Footer Security */}
      <div className="flex items-center gap-2 p-3 bg-[#18191B] border border-[#2A2D30] rounded-xl text-[11px] text-[#A3A09B]">
        <ShieldCheck size={16} className="text-[#D4AF37] shrink-0" />
        <span>100% Client-side Web Audio API audio synthesis. Zero telemetry or network requests.</span>
      </div>
    </div>
  );
};
