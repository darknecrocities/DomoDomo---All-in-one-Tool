import { useState, useRef, useEffect, useCallback } from 'react';
import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { Upload, Scissors, Download, Loader2, Play, Pause } from 'lucide-react';

const encodeWav = (buffer: AudioBuffer, channels: number): ArrayBuffer => {
  const ch = Math.min(channels, buffer.numberOfChannels);
  const numSamples = buffer.length;
  const sampleRate = buffer.sampleRate;
  const bitsPerSample = 16;
  const blockAlign = ch * 2;
  const dataSize = numSamples * blockAlign;
  const ab = new ArrayBuffer(44 + dataSize);
  const view = new DataView(ab);
  const write = (off: number, str: string) => { for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i)); };
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
  const [outputFormat, setOutputFormat] = useState<'wav' | 'ogg'>('wav');
  const [cutting, setCutting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [waveform, setWaveform] = useState<number[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
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

  // Draw waveform
  useEffect(() => {
    if (!file || waveform.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = 64;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const barW = canvas.width / waveform.length;
    const startPct = startTime / duration;
    const endPct = endTime / duration;
    waveform.forEach((amp, i) => {
      const pct = i / waveform.length;
      const inRange = pct >= startPct && pct <= endPct;
      ctx.fillStyle = inRange ? 'rgba(78,142,94,0.9)' : 'rgba(78,142,94,0.25)';
      const barH = amp * canvas.height;
      ctx.fillRect(i * barW, (canvas.height - barH) / 2, Math.max(1, barW - 1), barH);
    });
    // Playhead
    const playPct = duration > 0 ? currentTime / duration : 0;
    ctx.fillStyle = '#fff';
    ctx.fillRect(playPct * canvas.width, 0, 2, canvas.height);
  }, [waveform, startTime, endTime, duration, currentTime]);

  const loadWaveform = useCallback(async () => {
    if (!file) return;
    const buf = await file.arrayBuffer();
    const ac = new AudioContext();
    const decoded = await ac.decodeAudioData(buf);
    const ch0 = decoded.getChannelData(0);
    const buckets = 100;
    const size = Math.floor(ch0.length / buckets);
    const wf = Array.from({ length: buckets }, (_, i) => {
      let max = 0;
      for (let s = 0; s < size; s++) max = Math.max(max, Math.abs(ch0[i * size + s] || 0));
      return max;
    });
    setWaveform(wf);
    ac.close();
  }, [file]);

  useEffect(() => { loadWaveform(); }, [loadWaveform]);

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toFixed(1).padStart(4, '0')}`;

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

      const renderCtx = new OfflineAudioContext(channels, trimLen, decoded.sampleRate);
      const trimBuf = renderCtx.createBuffer(channels, trimLen, decoded.sampleRate);
      for (let c = 0; c < channels; c++) {
        trimBuf.copyToChannel(decoded.getChannelData(c).slice(sSample, eSample), c);
      }

      const src = renderCtx.createBufferSource();
      src.buffer = trimBuf;
      const gainNode = renderCtx.createGain();
      src.connect(gainNode);
      gainNode.connect(renderCtx.destination);

      // Fade in
      if (fadeIn > 0) {
        gainNode.gain.setValueAtTime(0, 0);
        gainNode.gain.linearRampToValueAtTime(1, fadeIn);
      }
      // Fade out
      if (fadeOut > 0) {
        const clipDur = (trimLen / decoded.sampleRate);
        gainNode.gain.setValueAtTime(1, clipDur - fadeOut);
        gainNode.gain.linearRampToValueAtTime(0, clipDur);
      }

      src.start();
      setProgress(70);
      const rendered = await renderCtx.startRendering();
      setProgress(85);

      const baseName = file.name.replace(/\.[^.]+$/, '');
      if (outputFormat === 'wav') {
        const wavBuf = encodeWav(rendered, channels);
        triggerBlobDownload(new Blob([wavBuf], { type: 'audio/wav' }), `${baseName}_cut.wav`);
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
          triggerBlobDownload(new Blob(chunks, { type: 'audio/ogg' }), `${baseName}_cut.ogg`);
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
  }, [file, startTime, endTime, fadeIn, fadeOut, outputFormat]);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) { a.currentTime = startTime; a.play(); }
    else a.pause();
  };

  return (
    <div className="max-w-2xl mx-auto glass-card p-6 flex flex-col gap-5 text-left">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Scissors size={18} className="text-teal-400" />
        <h3 className="font-bold text-teal-400 text-sm">Audio Cutter / Trimmer</h3>
        <span className="ml-auto text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full">WebAudio API</span>
      </div>

      {!file ? (
        <label className="flex flex-col items-center gap-3 py-10 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-teal-500/50 transition-colors">
          <Upload size={32} className="text-teal-400" />
          <span className="text-slate-300 text-sm font-medium">Drop or click to upload audio</span>
          <span className="text-slate-500 text-xs">MP3, WAV, OGG, FLAC, M4A</span>
          <input type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
        </label>
      ) : (
        <>
          <audio ref={audioRef} src={audioUrl} preload="metadata" className="w-full" />

          {/* Waveform */}
          {waveform.length > 0 && (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>{fmt(startTime)}</span>
                <span className="text-teal-400 font-bold">Cut: {fmt(endTime - startTime)}</span>
                <span>{fmt(endTime)}</span>
              </div>
              <div className="relative">
                <canvas ref={canvasRef} className="w-full rounded-lg" style={{ height: '64px' }}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const t = ((e.clientX - rect.left) / rect.width) * duration;
                    if (audioRef.current) audioRef.current.currentTime = t;
                  }}
                />
              </div>
            </div>
          )}

          {/* Sliders */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Start: {fmt(startTime)}</label>
              <input type="range" min={0} max={duration} step={0.1} value={startTime}
                onChange={(e) => { const v = parseFloat(e.target.value); setStartTime(v); if (v >= endTime) setEndTime(Math.min(duration, v + 1)); }}
                className="w-full accent-teal-500" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">End: {fmt(endTime)}</label>
              <input type="range" min={0} max={duration} step={0.1} value={endTime}
                onChange={(e) => { const v = parseFloat(e.target.value); setEndTime(v); if (v <= startTime) setStartTime(Math.max(0, v - 1)); }}
                className="w-full accent-teal-500" />
            </div>
          </div>

          {/* Fade + format */}
          <div className="grid grid-cols-2 gap-3 bg-slate-900/50 rounded-lg p-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Fade In: {fadeIn.toFixed(1)}s</label>
              <input type="range" min={0} max={Math.min(3, (endTime - startTime) / 2)} step={0.1} value={fadeIn}
                onChange={(e) => setFadeIn(parseFloat(e.target.value))} className="w-full accent-teal-500" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Fade Out: {fadeOut.toFixed(1)}s</label>
              <input type="range" min={0} max={Math.min(3, (endTime - startTime) / 2)} step={0.1} value={fadeOut}
                onChange={(e) => setFadeOut(parseFloat(e.target.value))} className="w-full accent-teal-500" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Output Format</label>
              <div className="flex gap-2">
                {(['wav', 'ogg'] as const).map(f => (
                  <button key={f} onClick={() => setOutputFormat(f)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded uppercase border transition-all ${
                      outputFormat === f ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-700 bg-slate-800 text-slate-400'
                    }`}>{f}</button>
                ))}
              </div>
            </div>
          </div>

          {cutting && (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Processing…</span><span>{progress}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={togglePlay}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              {isPlaying ? 'Pause' : 'Preview'}
            </button>
            <button onClick={handleCut} disabled={cutting || endTime <= startTime}
              className="flex-1 btn-primary flex items-center justify-center gap-2 py-2 text-xs font-bold disabled:opacity-50">
              {cutting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {cutting ? `Cutting… ${progress}%` : `Export Cut (${fmt(endTime - startTime)})`}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
