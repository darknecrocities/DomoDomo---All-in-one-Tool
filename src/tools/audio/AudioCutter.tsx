import { useState, useRef, useEffect, useCallback } from 'react';
import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { Upload, Scissors, Download, Loader2, Play, Pause, ChevronLeft, ChevronRight, Gauge } from 'lucide-react';

const encodeWav = (buffer: AudioBuffer, channels: number): ArrayBuffer => {
  const ch = Math.min(channels, buffer.numberOfChannels);
  const numSamples = buffer.length;
  const sampleRate = buffer.sampleRate;
  const bitsPerSample = 16;
  const blockAlign = ch * 2;
  const dataSize = numSamples * blockAlign;
  const ab = new ArrayBuffer(44 + dataSize);
  const view = new DataView(ab);
  const write = (off: number, str: string) => { 
    for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i)); 
  };
  write(0, 'RIFF'); view.setUint32(4, 36 + dataSize, true); write(8, 'WAVE'); write(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, ch, true);
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true); view.setUint16(34, bitsPerSample, true);
  write(36, 'data'); view.setUint32(40, dataSize, true);
  let off = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let c = 0; c < ch; c++) {
      const s = Math.max(-1, Math.min(1, buffer.getChannelData(c)[i]));
      view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      off += 2;
    }
  }
  return ab;
};

export const AudioCutterTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10);
  const [fadeIn, setFadeIn] = useState(0);
  const [fadeOut, setFadeOut] = useState(0);
  const [fadeCurve, setFadeCurve] = useState<'linear' | 'exponential'>('linear');
  const [tempo, setTempo] = useState(1.0);
  const [customName, setCustomName] = useState('');
  const [outputFormat, setOutputFormat] = useState<'wav' | 'ogg'>('wav');
  const [cutting, setCutting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<1 | 2 | 5 | 10>(1);
  const [waveform, setWaveform] = useState<number[]>([]);

  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waveformContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      const baseName = file.name.replace(/\.[^.]+$/, '');
      setCustomName(`${baseName}_trimmed`);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onMeta = () => { setDuration(a.duration); setEndTime(a.duration); };
    const onTime = () => setCurrentTime(a.currentTime);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('play', onPlay);
    a.addEventListener('pause', onPause);
    return () => {
      a.removeEventListener('loadedmetadata', onMeta);
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('play', onPlay);
      a.removeEventListener('pause', onPause);
    };
  }, [audioUrl]);

  // Synchronize playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = tempo;
    }
  }, [tempo, isPlaying]);

  // Draw waveform with Zoom support
  useEffect(() => {
    if (!file || waveform.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const baseWidth = canvas.parentElement?.offsetWidth || 500;
    canvas.width = baseWidth * zoomLevel * 2;
    canvas.height = 100;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barW = canvas.width / waveform.length;
    const startPct = startTime / duration;
    const endPct = endTime / duration;

    waveform.forEach((amp, i) => {
      const pct = i / waveform.length;
      const inRange = pct >= startPct && pct <= endPct;
      
      // Dynamic visual color styling
      if (inRange) {
        ctx.fillStyle = '#2DD4BF'; // active segment (teal)
      } else {
        ctx.fillStyle = 'rgba(45, 212, 191, 0.15)'; // outside segment
      }

      const barH = amp * canvas.height * 0.85;
      ctx.fillRect(i * barW, (canvas.height - barH) / 2, Math.max(1.5, barW - 1), barH);
    });

    // Draw start and end boundaries
    ctx.strokeStyle = '#F43F5E'; // rose borders
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startPct * canvas.width, 0);
    ctx.lineTo(startPct * canvas.width, canvas.height);
    ctx.moveTo(endPct * canvas.width, 0);
    ctx.lineTo(endPct * canvas.width, canvas.height);
    ctx.stroke();

    // Semi-transparent overlay outside bounds
    ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
    ctx.fillRect(0, 0, startPct * canvas.width, canvas.height);
    ctx.fillRect(endPct * canvas.width, 0, canvas.width - (endPct * canvas.width), canvas.height);

    // Playhead
    const playPct = duration > 0 ? currentTime / duration : 0;
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowBlur = 4;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.fillRect(playPct * canvas.width - 1, 0, 3, canvas.height);
    ctx.shadowBlur = 0;
  }, [waveform, startTime, endTime, duration, currentTime, zoomLevel]);

  const loadWaveform = useCallback(async () => {
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      // Use standard AudioContext to offline decode
      const ac = new AudioContext();
      const decoded = await ac.decodeAudioData(buf);
      const ch0 = decoded.getChannelData(0);
      const buckets = 120 * zoomLevel; // More buckets for zoomed-in rendering
      const size = Math.floor(ch0.length / buckets);
      const wf = Array.from({ length: buckets }, (_, i) => {
        let max = 0;
        for (let s = 0; s < size; s++) {
          max = Math.max(max, Math.abs(ch0[i * size + s] || 0));
        }
        return max;
      });
      setWaveform(wf);
      ac.close();
    } catch (e) {
      console.error('Waveform load error', e);
    }
  }, [file, zoomLevel]);

  useEffect(() => { loadWaveform(); }, [loadWaveform]);

  // Center timeline to playback position when zoomed in
  useEffect(() => {
    const container = waveformContainerRef.current;
    if (container && zoomLevel > 1 && isPlaying) {
      const playPct = duration > 0 ? currentTime / duration : 0;
      const scrollTarget = playPct * container.scrollWidth - container.clientWidth / 2;
      container.scrollLeft = scrollTarget;
    }
  }, [currentTime, duration, zoomLevel, isPlaying]);

  const fmt = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    const ms = Math.floor((s % 1) * 1000);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  const handleCut = useCallback(async () => {
    if (!file) return;
    setCutting(true);
    setProgress(10);
    try {
      const buf = await file.arrayBuffer();
      setProgress(30);
      const sampleRate = 44100;
      const offCtx = new OfflineAudioContext(2, 1, sampleRate);
      const decoded = await offCtx.decodeAudioData(buf);
      setProgress(50);

      const sSample = Math.floor(startTime * decoded.sampleRate);
      const eSample = Math.floor(endTime * decoded.sampleRate);
      const trimLen = eSample - sSample;
      const channels = decoded.numberOfChannels;

      // offline context with pitch shift / speed node if speed !== 1
      const renderCtx = new OfflineAudioContext(channels, Math.ceil(trimLen / tempo), decoded.sampleRate);
      const trimBuf = renderCtx.createBuffer(channels, trimLen, decoded.sampleRate);
      for (let c = 0; c < channels; c++) {
        trimBuf.copyToChannel(decoded.getChannelData(c).slice(sSample, eSample), c);
      }

      const src = renderCtx.createBufferSource();
      src.buffer = trimBuf;
      src.playbackRate.value = tempo;

      const gainNode = renderCtx.createGain();
      src.connect(gainNode);
      gainNode.connect(renderCtx.destination);

      const outputDur = trimLen / decoded.sampleRate / tempo;

      // Handle linear vs exponential fades
      if (fadeIn > 0) {
        gainNode.gain.setValueAtTime(0, 0);
        if (fadeCurve === 'linear') {
          gainNode.gain.linearRampToValueAtTime(1, fadeIn);
        } else {
          gainNode.gain.exponentialRampToValueAtTime(1, fadeIn);
        }
      }
      if (fadeOut > 0) {
        gainNode.gain.setValueAtTime(1, outputDur - fadeOut);
        if (fadeCurve === 'linear') {
          gainNode.gain.linearRampToValueAtTime(0, outputDur);
        } else {
          gainNode.gain.setTargetAtTime(0, outputDur - fadeOut, fadeOut / 3);
        }
      }

      src.start();
      setProgress(70);
      const rendered = await renderCtx.startRendering();
      setProgress(85);

      const targetFileName = customName.trim() ? customName.trim() : 'clipped_audio';

      if (outputFormat === 'wav') {
        const wavBuf = encodeWav(rendered, channels);
        triggerBlobDownload(new Blob([wavBuf], { type: 'audio/wav' }), `${targetFileName}.wav`);
        setProgress(100);
        setCutting(false);
      } else {
        const liveCtx = new AudioContext();
        const dest = liveCtx.createMediaStreamDestination();
        const bufSrc = liveCtx.createBufferSource();
        bufSrc.buffer = rendered;
        bufSrc.connect(dest);
        const mimeType = MediaRecorder.isTypeSupported('audio/ogg;codecs=opus') ? 'audio/ogg;codecs=opus' : 'audio/webm';
        const mr = new MediaRecorder(dest.stream, { mimeType });
        const chunks: BlobPart[] = [];
        mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
        mr.onstop = () => {
          triggerBlobDownload(new Blob(chunks, { type: 'audio/ogg' }), `${targetFileName}.ogg`);
          liveCtx.close();
          setProgress(100);
          setCutting(false);
        };
        mr.start(100);
        bufSrc.start();
        bufSrc.onended = () => mr.stop();
      }
    } catch (err) {
      console.error(err);
      setCutting(false);
    }
  }, [file, startTime, endTime, fadeIn, fadeOut, fadeCurve, tempo, customName, outputFormat]);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) { 
      a.currentTime = startTime; 
      a.play(); 
    } else {
      a.pause();
    }
  };

  const adjustBound = (type: 'start' | 'end', delta: number) => {
    if (type === 'start') {
      const next = Math.max(0, Math.min(endTime - 0.1, startTime + delta));
      setStartTime(next);
    } else {
      const next = Math.max(startTime + 0.1, Math.min(duration, endTime + delta));
      setEndTime(next);
    }
  };

  return (
    <div className="max-w-3xl mx-auto glass-card p-6 flex flex-col gap-6 text-left">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Scissors size={18} className="text-rose-400" />
        <div>
          <h3 className="font-bold text-teal-400 text-sm">Audio Cutter & Speed Changer</h3>
          <p className="text-[10px] text-slate-500">Trim start/end marks, customize speed, and configure audio fades</p>
        </div>
        <span className="ml-auto text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">High Accuracy</span>
      </div>

      {!file ? (
        <label className="flex flex-col items-center gap-3 py-12 border-2 border-dashed border-slate-700/60 rounded-xl cursor-pointer hover:border-teal-500/50 hover:bg-slate-950/20 transition-all">
          <Upload size={36} className="text-teal-400" />
          <span className="text-slate-300 text-sm font-semibold">Drop or click to upload audio file</span>
          <span className="text-slate-500 text-xs">Supports MP3, WAV, OGG, FLAC, M4A, etc.</span>
          <input type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
        </label>
      ) : (
        <div className="flex flex-col gap-5">
          <audio ref={audioRef} src={audioUrl} preload="metadata" className="hidden" />

          {/* Waveform Window with Zoom */}
          <div className="flex flex-col gap-2 bg-slate-950/35 border border-slate-850 p-4 rounded-xl">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Timeline Zoom:</span>
                <div className="flex bg-slate-900 rounded border border-slate-800 overflow-hidden">
                  {([1, 2, 5, 10] as const).map(z => (
                    <button key={z} onClick={() => setZoomLevel(z)}
                      className={`px-2 py-0.5 text-[10px] font-mono ${zoomLevel === z ? 'bg-teal-500/10 text-teal-400 border-r border-slate-855' : 'text-slate-400 hover:bg-slate-800'}`}>
                      {z}x
                    </button>
                  ))}
                </div>
              </div>
              <span className="text-[10px] font-semibold text-teal-400 font-mono">Cut Span: {fmt(endTime - startTime)}</span>
            </div>

            {/* Scrollable Waveform Container */}
            <div ref={waveformContainerRef} className="overflow-x-auto overflow-y-hidden border border-slate-800/80 rounded-lg bg-slate-900/40 relative max-w-full">
              <canvas ref={canvasRef} className="block cursor-pointer" style={{ height: '90px', width: `${100 * zoomLevel}%` }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const t = ((e.clientX - rect.left) / rect.width) * duration;
                  if (audioRef.current) audioRef.current.currentTime = t;
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono px-1">
              <span>0:00.0</span>
              <span>{fmt(duration)}</span>
            </div>
          </div>

          {/* Fine Tuning Position Handles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start point adjusting */}
            <div className="bg-slate-900/30 border border-slate-850 p-3.5 rounded-xl flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Start Position</span>
                <span className="text-xs font-mono font-bold text-slate-200">{fmt(startTime)}</span>
              </div>
              <input type="range" min={0} max={duration} step={0.01} value={startTime}
                onChange={(e) => { const v = parseFloat(e.target.value); setStartTime(v); if (v >= endTime) setEndTime(Math.min(duration, v + 0.1)); }}
                className="w-full accent-rose-500" />
              <div className="flex gap-1.5 mt-1">
                <button onClick={() => adjustBound('start', -1)} className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold flex justify-center items-center gap-0.5"><ChevronLeft size={10} /> -1s</button>
                <button onClick={() => adjustBound('start', -0.1)} className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold flex justify-center items-center gap-0.5"><ChevronLeft size={10} /> -0.1s</button>
                <button onClick={() => adjustBound('start', 0.1)} className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold flex justify-center items-center gap-0.5">+0.1s <ChevronRight size={10} /></button>
                <button onClick={() => adjustBound('start', 1)} className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold flex justify-center items-center gap-0.5">+1s <ChevronRight size={10} /></button>
              </div>
            </div>

            {/* End point adjusting */}
            <div className="bg-slate-900/30 border border-slate-850 p-3.5 rounded-xl flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">End Position</span>
                <span className="text-xs font-mono font-bold text-slate-200">{fmt(endTime)}</span>
              </div>
              <input type="range" min={0} max={duration} step={0.01} value={endTime}
                onChange={(e) => { const v = parseFloat(e.target.value); setEndTime(v); if (v <= startTime) setStartTime(Math.max(0, v - 0.1)); }}
                className="w-full accent-rose-500" />
              <div className="flex gap-1.5 mt-1">
                <button onClick={() => adjustBound('end', -1)} className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold flex justify-center items-center gap-0.5"><ChevronLeft size={10} /> -1s</button>
                <button onClick={() => adjustBound('end', -0.1)} className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold flex justify-center items-center gap-0.5"><ChevronLeft size={10} /> -0.1s</button>
                <button onClick={() => adjustBound('end', 0.1)} className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold flex justify-center items-center gap-0.5">+0.1s <ChevronRight size={10} /></button>
                <button onClick={() => adjustBound('end', 1)} className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold flex justify-center items-center gap-0.5">+1s <ChevronRight size={10} /></button>
              </div>
            </div>
          </div>

          {/* Fade Settings and Speed controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/40 border border-slate-850 p-4 rounded-xl">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-slate-400 uppercase">Fade Curves</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['linear', 'exponential'] as const).map(c => (
                  <button key={c} onClick={() => setFadeCurve(c)}
                    className={`py-1.5 text-[10px] font-bold rounded border uppercase transition-all ${
                      fadeCurve === c ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-800 bg-slate-950 text-slate-450'
                    }`}>{c}</button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-slate-500">In: {fadeIn.toFixed(1)}s</span>
                  <input type="range" min={0} max={Math.min(5, (endTime - startTime) / 2)} step={0.1} value={fadeIn}
                    onChange={(e) => setFadeIn(parseFloat(e.target.value))} className="accent-teal-500" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-slate-500">Out: {fadeOut.toFixed(1)}s</span>
                  <input type="range" min={0} max={Math.min(5, (endTime - startTime) / 2)} step={0.1} value={fadeOut}
                    onChange={(e) => setFadeOut(parseFloat(e.target.value))} className="accent-teal-500" />
                </div>
              </div>
            </div>

            {/* Speed Tempo control */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-1"><Gauge size={11} /> Speed Tempo</label>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0.5x</span>
                <span className="text-teal-400 font-bold">{tempo.toFixed(2)}x</span>
                <span>2.0x</span>
              </div>
              <input type="range" min={0.5} max={2.0} step={0.05} value={tempo}
                onChange={(e) => setTempo(parseFloat(e.target.value))} className="w-full accent-teal-500 mt-1" />
              <div className="flex gap-1 mt-1">
                {[0.75, 1.0, 1.25, 1.5].map(t => (
                  <button key={t} onClick={() => setTempo(t)} className={`flex-1 py-0.5 rounded text-[9px] font-semibold ${tempo === t ? 'bg-teal-500/10 text-teal-400' : 'bg-slate-900 text-slate-450 hover:bg-slate-800'}`}>{t}x</button>
                ))}
              </div>
            </div>

            {/* Target Output Formats & Filename */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-slate-400 uppercase">Output Settings</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['wav', 'ogg'] as const).map(f => (
                  <button key={f} onClick={() => setOutputFormat(f)}
                    className={`py-1.5 text-[10px] font-bold rounded uppercase border transition-all ${
                      outputFormat === f ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}>{f}</button>
                ))}
              </div>
              <input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Target file name" className="bg-slate-950 border border-slate-850 rounded px-2.5 py-1 text-slate-300 text-xs font-mono mt-1" />
            </div>
          </div>

          {cutting && (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px] text-slate-500 font-semibold uppercase">
                <span>Rendering Trimmed Track…</span><span>{progress}%</span>
              </div>
              <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-850">
                <div className="h-full bg-teal-500 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <div className="flex gap-2.5 pt-2">
            <button onClick={togglePlay}
              className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors">
              {isPlaying ? <Pause size={14} className="text-teal-400" /> : <Play size={14} className="text-teal-400" />}
              {isPlaying ? 'Pause Selection' : 'Preview Selection'}
            </button>
            <button onClick={handleCut} disabled={cutting || endTime <= startTime}
              className="flex-1 btn-primary flex items-center justify-center gap-2 py-2.5 text-xs font-bold disabled:opacity-50">
              {cutting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {cutting ? `Exporting (${progress}%)` : `Download Trimmed Audio`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
