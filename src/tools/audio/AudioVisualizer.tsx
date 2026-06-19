import { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, BarChart2, Mic } from 'lucide-react';

type VisMode = 'bars' | 'wave' | 'circle' | 'spectrum';

const COLOR_THEMES = [
  { label: 'Teal', primary: '#4E8E5E', secondary: '#2DD4BF' },
  { label: 'Purple', primary: '#8B5CF6', secondary: '#EC4899' },
  { label: 'Orange', primary: '#F97316', secondary: '#EAB308' },
  { label: 'Cyan', primary: '#06B6D4', secondary: '#3B82F6' },
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

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
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
      for (let i = 0; i < barCount; i++) {
        const val = (data[Math.floor((i / barCount) * data.length)] / 255) * sensitivity;
        sum += val;
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
    } else if (mode === 'wave') {
      const data = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(data);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, W, H);
      ctx.beginPath();
      ctx.strokeStyle = primary;
      ctx.lineWidth = 2;
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
      const radius = Math.min(W, H) / 4;
      const bars = Math.min(barCount, data.length);
      for (let i = 0; i < bars; i++) {
        const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;
        const val = (data[Math.floor((i / bars) * data.length)] / 255) * sensitivity;
        const barLen = val * radius;
        const x1 = cx + Math.cos(angle) * radius;
        const y1 = cy + Math.sin(angle) * radius;
        const x2 = cx + Math.cos(angle) * (radius + barLen);
        const y2 = cy + Math.sin(angle) * (radius + barLen);
        const pct = i / bars;
        ctx.strokeStyle = `hsl(${160 + pct * 180},70%,${40 + val * 40}%)`;
        ctx.lineWidth = W / bars - 1;
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
      grad.addColorStop(0.5, primary + '88');
      grad.addColorStop(1, secondary);
      ctx.fillStyle = '#0b0f190d';
      ctx.fillRect(0, 0, W, H);
      ctx.beginPath();
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
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
    }

    animRef.current = requestAnimationFrame(draw);
  }, [mode, theme, barCount, sensitivity]);

  useEffect(() => {
    if (isActive && analyserRef.current) {
      analyserRef.current.smoothingTimeConstant = smoothing;
      analyserRef.current.fftSize = 2048;
      animRef.current = requestAnimationFrame(draw);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [isActive, draw, smoothing]);

  const startFile = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    stop();
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = smoothing;
    const src = ctx.createMediaElementSource(audio);
    src.connect(analyser);
    analyser.connect(ctx.destination);
    audioCtxRef.current = ctx;
    analyserRef.current = analyser;
    sourceRef.current = src;
    audio.play();
    setIsActive(true);
  }, [stop, smoothing]);

  const startMic = useCallback(async () => {
    stop();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
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
  }, [stop, smoothing]);

  useEffect(() => () => stop(), [stop]);

  return (
    <div className="max-w-2xl mx-auto glass-card p-6 flex flex-col gap-5 text-left">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <BarChart2 size={18} className="text-teal-400" />
        <h3 className="font-bold text-teal-400 text-sm">Audio Visualizer</h3>
        <span className="ml-auto text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full">Web Audio AnalyserNode</span>
      </div>

      {/* Canvas */}
      <div className="relative bg-[#0b0f19] rounded-xl overflow-hidden" style={{ height: '200px' }}>
        <canvas ref={canvasRef} className="w-full h-full"
          style={{ width: '100%', height: '100%' }}
          width={800} height={200} />
        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs">
            Start visualization to see audio
          </div>
        )}
        {isActive && (
          <div className="absolute top-2 right-2 text-xs font-mono text-teal-400 bg-black/60 px-2 py-0.5 rounded">
            {dbLevel} dB
          </div>
        )}
      </div>

      {/* Source */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-slate-400 font-medium">Audio Source</label>
        <div className="flex gap-2">
          <button onClick={() => setSource('file')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
              source === 'file' ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-700 bg-slate-900 text-slate-400'
            }`}>
            <Upload size={12} /> File Upload
          </button>
          <button onClick={() => setSource('mic')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
              source === 'mic' ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-700 bg-slate-900 text-slate-400'
            }`}>
            <Mic size={12} /> Microphone
          </button>
        </div>
      </div>

      {source === 'file' && (
        <div className="flex flex-col gap-2">
          {!file ? (
            <label className="flex items-center justify-center gap-2 py-3 border border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-teal-500/50 transition-colors text-xs text-slate-400">
              <Upload size={14} className="text-teal-400" /> Choose audio file
              <input type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
            </label>
          ) : (
            <audio ref={audioRef} src={audioUrl} controls className="w-full" />
          )}
        </div>
      )}

      {/* Visualization mode */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-slate-400 font-medium">Visualization Mode</label>
        <div className="grid grid-cols-4 gap-1.5">
          {(['bars', 'wave', 'circle', 'spectrum'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`py-2 text-xs font-bold rounded-lg border capitalize transition-all ${
                mode === m ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'
              }`}>{m}</button>
          ))}
        </div>
      </div>

      {/* Color themes */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-slate-400 font-medium">Color Theme</label>
        <div className="flex gap-2">
          {COLOR_THEMES.map((t, i) => (
            <button key={i} onClick={() => setTheme(i)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                theme === i ? 'border-white' : 'border-slate-700'
              }`}
              style={{ background: `linear-gradient(90deg, ${t.primary}, ${t.secondary})` }}>
              <span className="drop-shadow text-white text-[10px]">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-3 gap-3 bg-slate-900/50 rounded-lg p-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">Bars: {barCount}</label>
          <input type="range" min={16} max={128} step={16} value={barCount}
            onChange={(e) => setBarCount(Number(e.target.value))} className="w-full accent-teal-500" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">Sensitivity: {sensitivity.toFixed(1)}×</label>
          <input type="range" min={0.5} max={4} step={0.1} value={sensitivity}
            onChange={(e) => setSensitivity(parseFloat(e.target.value))} className="w-full accent-teal-500" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">Smoothing: {smoothing.toFixed(2)}</label>
          <input type="range" min={0} max={0.99} step={0.01} value={smoothing}
            onChange={(e) => setSmoothing(parseFloat(e.target.value))} className="w-full accent-teal-500" />
        </div>
      </div>

      <div className="flex gap-2">
        {isActive ? (
          <button onClick={stop}
            className="flex-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-2.5 rounded-lg transition-colors">
            ⏹ Stop Visualizer
          </button>
        ) : source === 'file' ? (
          <button onClick={startFile} disabled={!file}
            className="flex-1 btn-primary py-2.5 text-xs font-bold disabled:opacity-50">
            ▶ Start Visualization
          </button>
        ) : (
          <button onClick={startMic}
            className="flex-1 btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-2">
            <Mic size={14} /> Start Mic Visualizer
          </button>
        )}
      </div>
    </div>
  );
};
