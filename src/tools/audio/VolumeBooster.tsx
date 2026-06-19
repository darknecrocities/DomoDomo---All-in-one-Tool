import { useState, useRef, useEffect, useCallback } from 'react';
import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { Upload, Volume2, Download, Loader2, Settings, ShieldAlert, Sparkles } from 'lucide-react';

const encodeWav = (buffer: AudioBuffer): ArrayBuffer => {
  const ch = buffer.numberOfChannels;
  const numSamples = buffer.length;
  const sampleRate = buffer.sampleRate;
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
  view.setUint16(32, blockAlign, true); view.setUint16(34, 16, true);
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

const EQ_PRESETS = [
  { label: 'Flat', bass: 0, mid: 0, treble: 0 },
  { label: 'Bass Boost', bass: 7, mid: 1, treble: -2 },
  { label: 'Vocal Enhance', bass: -3, mid: 5, treble: 2 },
  { label: 'Treble Booster', bass: -2, mid: 0, treble: 6 },
  { label: 'Classic V-Shape', bass: 5, mid: -3, treble: 4 },
];

export const VolumeBoosterTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [gainDb, setGainDb] = useState(6);
  const [normalize, setNormalize] = useState(false);
  const [limiter, setLimiter] = useState(true);
  const [equalizer, setEqualizer] = useState({ bass: 0, mid: 0, treble: 0 });
  const [stereoPan, setStereoPan] = useState(0); // -1 (Left) to +1 (Right)
  const [customName, setCustomName] = useState('');

  const [outputFormat, setOutputFormat] = useState<'wav' | 'ogg'>('wav');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [peakDb, setPeakDb] = useState<number | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const gainLinear = Math.pow(10, gainDb / 20);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      const baseName = file.name.replace(/\.[^.]+$/, '');
      setCustomName(`${baseName}_boosted`);

      // Analyze Peak levels
      file.arrayBuffer().then(async (buf) => {
        const ac = new AudioContext();
        const decoded = await ac.decodeAudioData(buf);
        let peak = 0;
        for (let c = 0; c < decoded.numberOfChannels; c++) {
          const data = decoded.getChannelData(c);
          for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]));
        }
        setPeakDb(peak > 0 ? 20 * Math.log10(peak) : -Infinity);
        ac.close();
      });
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const handleApplyPreset = (preset: typeof EQ_PRESETS[0]) => {
    setEqualizer({ bass: preset.bass, mid: preset.mid, treble: preset.treble });
  };

  const handleProcess = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(10);
    try {
      const buf = await file.arrayBuffer();
      setProgress(25);
      const offCtx = new OfflineAudioContext(2, 1, 44100);
      const decoded = await offCtx.decodeAudioData(buf);
      setProgress(40);

      const sampleRate = decoded.sampleRate;
      const ch = decoded.numberOfChannels;
      const renderCtx = new OfflineAudioContext(ch, decoded.length, sampleRate);

      const src = renderCtx.createBufferSource();
      src.buffer = decoded;

      // EQ Nodes
      const bassF = renderCtx.createBiquadFilter();
      bassF.type = 'lowshelf'; bassF.frequency.value = 250; bassF.gain.value = equalizer.bass;
      const midF = renderCtx.createBiquadFilter();
      midF.type = 'peaking'; midF.frequency.value = 1200; midF.Q.value = 1.0; midF.gain.value = equalizer.mid;
      const trebleF = renderCtx.createBiquadFilter();
      trebleF.type = 'highshelf'; trebleF.frequency.value = 7500; trebleF.gain.value = equalizer.treble;

      // Pan Node
      const panNode = renderCtx.createStereoPanner();
      panNode.pan.value = stereoPan;

      // Gain Node
      const gainNode = renderCtx.createGain();
      if (normalize) {
        let peak = 0;
        for (let c = 0; c < decoded.numberOfChannels; c++) {
          const data = decoded.getChannelData(c);
          for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]));
        }
        gainNode.gain.value = peak > 0 ? Math.min(gainLinear, 0.98 / peak) : gainLinear;
      } else {
        gainNode.gain.value = gainLinear;
      }

      // Hard Limiter Node
      const comp = renderCtx.createDynamicsCompressor();
      comp.threshold.value = -1;
      comp.ratio.value = 20;
      comp.attack.value = 0.001;
      comp.release.value = 0.1;

      // Connect DSP chain: source -> EQ -> Pan -> Gain -> Limiter -> destination
      src.connect(bassF);
      bassF.connect(midF);
      midF.connect(trebleF);
      trebleF.connect(panNode);
      panNode.connect(gainNode);
      gainNode.connect(limiter ? comp : renderCtx.destination);
      if (limiter) comp.connect(renderCtx.destination);
      
      src.start();
      setProgress(65);
      const rendered = await renderCtx.startRendering();
      setProgress(85);

      const targetFileName = customName.trim() ? customName.trim() : 'amplified_audio';

      if (outputFormat === 'wav') {
        const wavBuf = encodeWav(rendered);
        triggerBlobDownload(new Blob([wavBuf], { type: 'audio/wav' }), `${targetFileName}.wav`);
        setProgress(100);
        setProcessing(false);
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
          setProcessing(false);
          setProgress(0);
        };
        mr.start(200);
        bufSrc.start();
        bufSrc.onended = () => mr.stop();
      }
    } catch (err) {
      console.error(err);
      setProcessing(false);
    }
  }, [file, gainLinear, normalize, limiter, equalizer, stereoPan, outputFormat, customName]);

  const headroomDb = peakDb !== null ? -(peakDb + gainDb) : null;

  return (
    <div className="max-w-3xl mx-auto glass-card p-6 flex flex-col gap-6 text-left font-sans">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Volume2 size={18} className="text-teal-400" />
        <div>
          <h3 className="font-bold text-teal-400 text-sm">Volume Booster & EQ</h3>
          <p className="text-[10px] text-slate-500">Amplify decibel channels, configure equalizer bands, and adjust pan balancing</p>
        </div>
        <span className="ml-auto text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">GainNode DSP</span>
      </div>

      {!file ? (
        <label className="flex flex-col items-center gap-3 py-12 border-2 border-dashed border-slate-700/60 rounded-xl cursor-pointer hover:border-teal-500/50 hover:bg-slate-950/20 transition-all justify-center">
          <Upload size={36} className="text-teal-400" />
          <span className="text-slate-300 text-sm font-semibold">Drop or click to upload audio file</span>
          <span className="text-slate-500 text-xs">Supports MP3, WAV, OGG, FLAC, M4A, etc.</span>
          <input type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
        </label>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main EQ & Boost panel */}
          <div className="md:col-span-7 flex flex-col gap-4">
            <div className="bg-slate-950/45 rounded-xl p-4 border border-slate-850 flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Audio Player Preview</span>
              <audio ref={audioRef} src={audioUrl} controls className="w-full" preload="metadata" />
            </div>

            {/* EQ board slider */}
            <div className="bg-slate-900/30 border border-slate-850 p-4 rounded-xl flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Settings size={12} /> 3-Band Equalizer</span>
                <span className="text-[9px] text-slate-500 font-mono">Range: -12dB to +12dB</span>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap gap-1.5">
                {EQ_PRESETS.map(p => (
                  <button key={p.label} onClick={() => handleApplyPreset(p)} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-850 text-[9px] font-semibold text-slate-400 hover:text-teal-400 transition-all">
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                {(['bass', 'mid', 'treble'] as const).map(band => (
                  <div key={band} className="flex flex-col items-center gap-2 bg-slate-950/30 p-3 rounded-lg border border-slate-850/50">
                    <span className="text-[10px] text-slate-400 capitalize font-bold">{band}</span>
                    <input type="range" min={-12} max={12} step={0.5} value={equalizer[band]}
                      onChange={(e) => setEqualizer(prev => ({ ...prev, [band]: parseFloat(e.target.value) }))}
                      className="h-20 accent-teal-500 cursor-row-resize" style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                    />
                    <span className="text-[10px] font-mono text-teal-400 font-bold">
                      {equalizer[band] > 0 ? '+' : ''}{equalizer[band]} dB
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stereo Pan balancing */}
            <div className="bg-slate-900/30 border border-slate-850 p-4 rounded-xl flex flex-col gap-3">
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5"><Sparkles size={12} /> Stereo Pan Balance</span>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Left Channel</span>
                <span className="text-teal-400 font-semibold">{stereoPan === 0 ? 'Center' : stereoPan > 0 ? `R: +${Math.round(stereoPan * 100)}` : `L: +${Math.round(Math.abs(stereoPan) * 100)}`}</span>
                <span>Right Channel</span>
              </div>
              <input type="range" min={-1.0} max={1.0} step={0.05} value={stereoPan} onChange={(e) => setStereoPan(parseFloat(e.target.value))} className="w-full accent-teal-500 mt-1" />
            </div>
          </div>

          {/* Right panel settings */}
          <div className="md:col-span-5 flex flex-col gap-4 border-l border-slate-800 md:pl-6">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amplification deck</span>

            {/* Peak info */}
            {peakDb !== null && (
              <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
                <div className="bg-slate-950/45 border border-slate-850 rounded-lg p-2 text-center">
                  <div className="text-slate-500 text-[8px] uppercase">Input Peak</div>
                  <div className={`font-bold mt-0.5 ${peakDb > -3 ? 'text-red-400' : 'text-teal-400'}`}>
                    {peakDb.toFixed(1)} dB
                  </div>
                </div>
                <div className="bg-slate-950/45 border border-slate-850 rounded-lg p-2 text-center">
                  <div className="text-slate-500 text-[8px] uppercase">Decibel Gain</div>
                  <div className="text-teal-400 font-bold mt-0.5">+{gainDb} dB</div>
                </div>
                <div className="bg-slate-950/45 border border-slate-850 rounded-lg p-2 text-center">
                  <div className="text-slate-500 text-[8px] uppercase">Headroom</div>
                  <div className={`font-bold mt-0.5 ${headroomDb !== null && headroomDb < 0 ? 'text-red-400' : 'text-slate-200'}`}>
                    {headroomDb !== null ? `${headroomDb.toFixed(1)} dB` : '—'}
                  </div>
                </div>
              </div>
            )}

            {/* Gain slider */}
            <div className="flex flex-col gap-1.5 bg-slate-900/40 p-3 rounded-lg border border-slate-850">
              <div className="flex justify-between items-center text-[10px] text-slate-500">
                <span className="uppercase font-semibold">Gain Multiplier</span>
                <span className="font-mono text-teal-400 font-bold">{gainLinear.toFixed(2)}x</span>
              </div>
              <input type="range" min={-20} max={30} step={1} value={gainDb}
                onChange={(e) => setGainDb(Number(e.target.value))} className="w-full accent-teal-500" />
              <div className="flex justify-between text-[9px] text-slate-550 font-mono mt-0.5">
                <span>-20 dB</span>
                <span>0 dB (Unity)</span>
                <span>+30 dB</span>
              </div>
            </div>

            {/* Limiters */}
            <div className="flex flex-col gap-2 bg-slate-900/40 p-3.5 rounded-lg border border-slate-850">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={normalize} onChange={(e) => setNormalize(e.target.checked)} className="accent-teal-500 w-3.5 h-3.5 rounded" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-350">Peak Auto Normalizer</span>
                  <span className="text-[8px] text-slate-500">Stretches gain to peak dynamic range</span>
                </div>
              </label>

              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input type="checkbox" checked={limiter} onChange={(e) => setLimiter(e.target.checked)} className="accent-teal-500 w-3.5 h-3.5 rounded" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-350">True Peak Hard Limiter</span>
                  <span className="text-[8px] text-slate-500">Blocks digital clipping & distortion</span>
                </div>
              </label>
            </div>

            {/* Format & name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-550 uppercase">Output container format</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['wav', 'ogg'] as const).map(f => (
                  <button key={f} onClick={() => setOutputFormat(f)}
                    className={`py-1.5 text-[10px] font-bold rounded uppercase border transition-all ${
                      outputFormat === f ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-850 bg-slate-950 text-slate-450'
                    }`}>{f}</button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-550 uppercase font-semibold">Save File Name</label>
              <input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Target file name" className="bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-slate-300 text-xs font-mono" />
            </div>

            {headroomDb !== null && headroomDb < 0 && !limiter && (
              <div className="flex items-start gap-2 bg-rose-950/20 border border-rose-500/30 rounded-lg p-2.5 text-[10px] text-rose-400">
                <ShieldAlert size={12} className="shrink-0 mt-0.5 text-rose-500" />
                <span>Gain exceeds headroom limits! Enable the True Peak Limiter or lower output boost to prevent static clipping.</span>
              </div>
            )}

            {processing && (
              <div className="flex flex-col gap-1 mt-1">
                <div className="flex justify-between text-[10px] text-slate-500 font-semibold uppercase"><span>Rendering boosted buffer…</span><span>{progress}%</span></div>
                <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-850">
                  <div className="h-full bg-teal-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <button onClick={handleProcess} disabled={processing}
              className="btn-primary w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold disabled:opacity-50 mt-auto">
              {processing ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              {processing ? `Amplifying…` : 'Render and Save Audio'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
