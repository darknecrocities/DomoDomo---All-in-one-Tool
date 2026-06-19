import { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, BarChart2, Mic, Maximize2, Minimize2, Settings, Zap } from 'lucide-react';

type VisMode = 'bars' | 'wave' | 'circle' | 'spectrum' | 'retro' | 'oscilloscope';

const COLOR_THEMES = [
  { label: 'Cyberpunk', primary: '#FF007F', secondary: '#00F0FF' },
  { label: 'Aurora', primary: '#00FF87', secondary: '#60EFFF' },
  { label: 'Teal', primary: '#0D9488', secondary: '#2DD4BF' },
  { label: 'Retro Gold', primary: '#F59E0B', secondary: '#EF4444' },
];

export const AudioVisualizerTool = () => {
  const [source, setSource] = useState<'file' | 'mic'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [mode, setMode] = useState<VisMode>('bars');
  const [theme, setTheme] = useState(0);
  const [barCount, setBarCount] = useState(64);
  const [sensitivity, setSensitivity] = useState(1.5);
  const [smoothing, setSmoothing] = useState(0.8);
  const [isActive, setIsActive] = useState(false);
  const [dbLevel, setDbLevel] = useState(-60);
  const [peakFreq, setPeakFreq] = useState(0);
  const [fftSize, setFftSize] = useState<256 | 512 | 1024 | 2048>(1024);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<AudioNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const stop = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    analyserRef.current = null;
    sourceRef.current = null;
    setIsActive(false);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d')!;
    const W = canvas.width;
    const H = canvas.height;
    const { primary, secondary } = COLOR_THEMES[theme];

    if (mode === 'bars') {
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, W, H);

      const barW = W / barCount;
      let sum = 0;
      let maxVal = 0;
      let maxIdx = 0;

      for (let i = 0; i < barCount; i++) {
        const idx = Math.floor((i / barCount) * data.length);
        const rawVal = data[idx];
        const val = (rawVal / 255) * sensitivity;
        sum += val;
        if (rawVal > maxVal) {
          maxVal = rawVal;
          maxIdx = idx;
        }

        const barH = val * H;
        const pct = i / barCount;
        const r1 = parseInt(primary.slice(1, 3), 16);
        const g1 = parseInt(primary.slice(3, 5), 16);
        const b1 = parseInt(primary.slice(5, 7), 16);
        const r2 = parseInt(secondary.slice(1, 3), 16);
        const g2 = parseInt(secondary.slice(3, 5), 16);
        const b2 = parseInt(secondary.slice(5, 7), 16);
        const r = Math.round(r1 + (r2 - r1) * pct);
        const g = Math.round(g1 + (g2 - g1) * pct);
        const b = Math.round(b1 + (b2 - b1) * pct);

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(i * barW + 1, H - barH, barW - 2, barH);
      }
      setDbLevel(Math.round((sum / barCount) * 60 - 60));
      const sampleRate = audioCtxRef.current?.sampleRate || 44100;
      setPeakFreq(Math.round((maxIdx * sampleRate) / analyser.fftSize));

    } else if (mode === 'wave') {
      const data = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(data);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, W, H);
      ctx.beginPath();
      ctx.strokeStyle = primary;
      ctx.lineWidth = 2.5;
      const sliceW = W / data.length;
      let x = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] / 128 - 1) * sensitivity;
        const y = H / 2 + v * H / 2;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        x += sliceW;
      }
      ctx.stroke();

    } else if (mode === 'circle') {
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;
      const radius = Math.min(W, H) / 4.5;
      const bars = Math.min(barCount * 2, data.length);
      for (let i = 0; i < bars; i++) {
        const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;
        const val = (data[Math.floor((i / bars) * data.length)] / 255) * sensitivity;
        const barLen = val * radius * 1.2;
        const x1 = cx + Math.cos(angle) * radius;
        const y1 = cy + Math.sin(angle) * radius;
        const x2 = cx + Math.cos(angle) * (radius + barLen);
        const y2 = cy + Math.sin(angle) * (radius + barLen);
        const pct = i / bars;
        ctx.strokeStyle = `hsl(${(180 + pct * 240) % 360}, 90%, ${45 + val * 30}%)`;
        ctx.lineWidth = Math.max(1, (W / bars) - 0.5);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

    } else if (mode === 'spectrum') {
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      const grad = ctx.createLinearGradient(0, H, 0, 0);
      grad.addColorStop(0, '#0b0f19');
      grad.addColorStop(0.5, primary + 'aa');
      grad.addColorStop(1, secondary);
      ctx.fillStyle = '#0b0f190d';
      ctx.fillRect(0, 0, W, H);
      ctx.beginPath();
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.moveTo(0, H);
      for (let i = 0; i < data.length; i++) {
        const x = (i / data.length) * W;
        const y = H - (data[i] / 255) * sensitivity * H;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fillStyle = `${primary}22`;
      ctx.fill();
      ctx.stroke();

    } else if (mode === 'retro') {
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      ctx.fillStyle = '#05070c';
      ctx.fillRect(0, 0, W, H);

      const segmentCount = 12;
      const retroBars = Math.min(barCount, 40);
      const gap = 3;
      const barW = (W - (retroBars * gap)) / retroBars;

      for (let i = 0; i < retroBars; i++) {
        const idx = Math.floor((i / retroBars) * data.length);
        const val = (data[idx] / 255) * sensitivity;
        const activeSegments = Math.round(val * segmentCount);

        for (let j = 0; j < segmentCount; j++) {
          const segH = (H - (segmentCount * gap)) / segmentCount;
          const y = H - (j * (segH + gap)) - segH;
          const isActiveSeg = j < activeSegments;

          if (isActiveSeg) {
            ctx.fillStyle = j > 9 ? '#EF4444' : j > 6 ? '#F59E0B' : '#10B981'; // Green -> Orange -> Red stack
          } else {
            ctx.fillStyle = '#1e293b22'; // Dim segments
          }
          ctx.fillRect(i * (barW + gap), y, barW, segH);
        }
      }

    } else if (mode === 'oscilloscope') {
      const data = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(data);
      ctx.fillStyle = 'rgba(11, 15, 25, 0.2)'; // persistence effect
      ctx.fillRect(0, 0, W, H);

      // Draw vector lines
      ctx.beginPath();
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 10;
      ctx.shadowColor = secondary;

      const sliceW = W / data.length;
      let x = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] / 128 - 1) * sensitivity;
        const y = H / 2 + v * H / 2;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        x += sliceW;
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // reset
    }

    animRef.current = requestAnimationFrame(draw);
  }, [mode, theme, barCount, sensitivity]);

  // Handle FFT size mutations
  useEffect(() => {
    if (analyserRef.current) {
      analyserRef.current.fftSize = fftSize;
    }
  }, [fftSize]);

  useEffect(() => {
    if (isActive && analyserRef.current) {
      analyserRef.current.smoothingTimeConstant = smoothing;
      analyserRef.current.fftSize = fftSize;
      animRef.current = requestAnimationFrame(draw);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [isActive, draw, smoothing, fftSize]);

  const startFile = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    stop();
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = fftSize;
    analyser.smoothingTimeConstant = smoothing;
    const src = ctx.createMediaElementSource(audio);
    src.connect(analyser);
    analyser.connect(ctx.destination);
    audioCtxRef.current = ctx;
    analyserRef.current = analyser;
    sourceRef.current = src;
    audio.play();
    setIsActive(true);
  }, [stop, smoothing, fftSize]);

  const startMic = useCallback(async () => {
    stop();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = fftSize;
      analyser.smoothingTimeConstant = smoothing;
      const src = ctx.createMediaStreamSource(stream);
      src.connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = src;
      setIsActive(true);
    } catch (err) {
      console.error(err);
      alert('Microphone access denied.');
    }
  }, [stop, smoothing, fftSize]);

  const toggleFullscreen = () => {
    const element = containerRef.current;
    if (!element) return;
    if (!document.fullscreenElement) {
      element.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => console.error(err));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  useEffect(() => () => stop(), [stop]);

  return (
    <div className="max-w-3xl mx-auto glass-card p-6 flex flex-col gap-6 text-left">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <BarChart2 size={18} className="text-teal-400" />
        <div>
          <h3 className="font-bold text-teal-400 text-sm">Audio Spectrum & Wave Visualizer</h3>
          <p className="text-[10px] text-slate-500">Render frequency matrices, wave vectors, and retro decibel bars</p>
        </div>
        <span className="ml-auto text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">GPU Accelerated</span>
      </div>

      {/* Visual Canvas Container */}
      <div ref={containerRef} className={`relative bg-[#0b0f19] rounded-xl overflow-hidden border border-slate-850 flex flex-col items-center justify-center ${isFullscreen ? 'w-full h-screen p-0' : 'h-[250px]'}`}>
        <canvas ref={canvasRef} className="w-full h-full" width={1000} height={350} />
        
        {/* Fullscreen control overlay */}
        <button onClick={toggleFullscreen} className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-black/60 border border-slate-800 text-slate-400 hover:text-white transition-all">
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>

        {!isActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 text-xs bg-slate-950/20 backdrop-blur-[1px]">
            <Zap size={22} className="text-teal-500/60 mb-2 animate-bounce" />
            <span>Launch source playback to visual sound profiles</span>
          </div>
        )}

        {isActive && (
          <div className="absolute top-3 left-3 flex gap-2">
            <div className="text-[10px] font-mono text-teal-400 bg-black/75 border border-slate-800/60 px-2.5 py-1 rounded shadow-lg">
              LEVEL: {dbLevel} dB
            </div>
            <div className="text-[10px] font-mono text-indigo-400 bg-black/75 border border-slate-800/60 px-2.5 py-1 rounded shadow-lg">
              PEAK FREQ: {peakFreq.toLocaleString()} Hz
            </div>
          </div>
        )}
      </div>

      {/* Controller Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 flex flex-col gap-4">
          {/* Source toggler */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-slate-500 uppercase font-semibold">Decibel input source</label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { setSource('file'); stop(); }}
                className={`py-1.5 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                  source === 'file' ? 'border-teal-500 bg-teal-500/10 text-teal-400 font-bold' : 'border-slate-800 bg-slate-900 text-slate-400'
                }`}>
                <Upload size={12} /> Local File
              </button>
              <button onClick={() => { setSource('mic'); stop(); }}
                className={`py-1.5 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                  source === 'mic' ? 'border-teal-500 bg-teal-500/10 text-teal-400 font-bold' : 'border-slate-800 bg-slate-900 text-slate-400'
                }`}>
                <Mic size={12} /> Live Microphone
              </button>
            </div>
          </div>

          {source === 'file' && (
            <div className="flex flex-col gap-2 bg-slate-900/30 p-3 rounded-lg border border-slate-850">
              {!file ? (
                <label className="flex items-center justify-center gap-2 py-4 border border-dashed border-slate-700/60 rounded-lg cursor-pointer hover:border-teal-500/50 transition-colors text-xs text-slate-400">
                  <Upload size={14} className="text-teal-400" /> Choose Audio File
                  <input type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
                </label>
              ) : (
                <div className="flex flex-col gap-2">
                  <audio ref={audioRef} src={audioUrl} controls className="w-full" />
                  <span className="text-[9px] text-slate-550 truncate font-mono">File: {file.name}</span>
                </div>
              )}
            </div>
          )}

          {/* Visualization mode select */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-slate-550 uppercase font-semibold">Render visualizer style</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['bars', 'wave', 'circle', 'spectrum', 'retro', 'oscilloscope'] as const).map(m => (
                <button key={m} onClick={() => setMode(m)}
                  className={`py-2 text-[10px] font-bold rounded-lg border capitalize transition-all ${
                    mode === m ? 'border-teal-500 bg-teal-500/10 text-teal-400 font-bold' : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                  }`}>{m}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Configurations Side */}
        <div className="md:col-span-5 flex flex-col gap-4 border-l border-slate-800 md:pl-6">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rendering presets</span>

          {/* Color theme selectors */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-550 uppercase">Glow themes</label>
            <div className="grid grid-cols-2 gap-1.5">
              {COLOR_THEMES.map((t, i) => (
                <button key={i} onClick={() => setTheme(i)}
                  className={`py-1.5 rounded-lg border transition-all ${
                    theme === i ? 'border-white ring-1 ring-white/50' : 'border-slate-850'
                  }`}
                  style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})` }}>
                  <span className="drop-shadow-md text-white text-[9px] font-bold uppercase">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Settings panel */}
          <div className="bg-slate-900/30 border border-slate-850 p-4 rounded-xl flex flex-col gap-3">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5"><Settings size={12} /> Render Parameters</span>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Decibel Peaks:</span>
                <span className="font-mono text-slate-300">{barCount}</span>
              </div>
              <input type="range" min={16} max={128} step={16} value={barCount}
                onChange={(e) => setBarCount(Number(e.target.value))} className="w-full accent-teal-500" />
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Amplitude Sensitivity:</span>
                <span className="font-mono text-slate-300">{sensitivity.toFixed(1)}x</span>
              </div>
              <input type="range" min={0.5} max={4} step={0.1} value={sensitivity}
                onChange={(e) => setSensitivity(parseFloat(e.target.value))} className="w-full accent-teal-500" />
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Time Smoothing:</span>
                <span className="font-mono text-slate-300">{smoothing.toFixed(2)}</span>
              </div>
              <input type="range" min={0} max={0.99} step={0.01} value={smoothing}
                onChange={(e) => setSmoothing(parseFloat(e.target.value))} className="w-full accent-teal-500" />
            </div>

            <div className="flex flex-col gap-1.5 text-xs">
              <span className="text-slate-500">FFT resolution (Bins):</span>
              <div className="grid grid-cols-4 gap-1 mt-0.5">
                {([256, 512, 1024, 2048] as const).map(f => (
                  <button key={f} onClick={() => setFftSize(f)}
                    className={`py-1 text-[9px] font-mono font-bold rounded border ${
                      fftSize === f ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-800 bg-slate-950 text-slate-450'
                    }`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-auto">
            {isActive ? (
              <button onClick={stop}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-2.5 rounded-lg transition-colors">
                ⏹ Stop Analyzer
              </button>
            ) : source === 'file' ? (
              <button onClick={startFile} disabled={!file}
                className="w-full btn-primary py-2.5 text-xs font-bold disabled:opacity-50">
                ▶ Start Visualization
              </button>
            ) : (
              <button onClick={startMic}
                className="w-full btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5">
                <Mic size={13} /> Open Microphone Feed
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
