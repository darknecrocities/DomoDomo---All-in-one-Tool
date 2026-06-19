import { useState, useRef, useEffect, useCallback } from 'react';
import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { Upload, Volume2, Download, Loader2, Info } from 'lucide-react';

const encodeWav = (buffer: AudioBuffer): ArrayBuffer => {
  const ch = buffer.numberOfChannels;
  const numSamples = buffer.length;
  const sampleRate = buffer.sampleRate;
  const blockAlign = ch * 2;
  const dataSize = numSamples * blockAlign;
  const ab = new ArrayBuffer(44 + dataSize);
  const view = new DataView(ab);
  const write = (off: number, str: string) => { for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i)); };
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

export const VolumeBoosterTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [gainDb, setGainDb] = useState(6);
  const [normalize, setNormalize] = useState(false);
  const [limiter, setLimiter] = useState(true);
  const [equalizer, setEqualizer] = useState({ bass: 0, mid: 0, treble: 0 });
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
      // Analyze peak
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

      // EQ chain
      const bassF = renderCtx.createBiquadFilter();
      bassF.type = 'lowshelf'; bassF.frequency.value = 200; bassF.gain.value = equalizer.bass;
      const midF = renderCtx.createBiquadFilter();
      midF.type = 'peaking'; midF.frequency.value = 1000; midF.Q.value = 1; midF.gain.value = equalizer.mid;
      const trebleF = renderCtx.createBiquadFilter();
      trebleF.type = 'highshelf'; trebleF.frequency.value = 8000; trebleF.gain.value = equalizer.treble;

      // Gain node
      const gain = renderCtx.createGain();

      if (normalize) {
        let peak = 0;
        for (let c = 0; c < decoded.numberOfChannels; c++) {
          const data = decoded.getChannelData(c);
          for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]));
        }
        gain.gain.value = peak > 0 ? Math.min(gainLinear, 0.98 / peak) : gainLinear;
      } else {
        gain.gain.value = gainLinear;
      }

      // Limiter
      const comp = renderCtx.createDynamicsCompressor();
      comp.threshold.value = -1;
      comp.ratio.value = 20;
      comp.attack.value = 0.001;
      comp.release.value = 0.1;

      src.connect(bassF);
      bassF.connect(midF);
      midF.connect(trebleF);
      trebleF.connect(gain);
      gain.connect(limiter ? comp : renderCtx.destination);
      if (limiter) comp.connect(renderCtx.destination);
      src.start();

      setProgress(65);
      const rendered = await renderCtx.startRendering();
      setProgress(85);

      const baseName = file.name.replace(/\.[^.]+$/, '');
      if (outputFormat === 'wav') {
        const wavBuf = encodeWav(rendered);
        triggerBlobDownload(new Blob([wavBuf], { type: 'audio/wav' }), `${baseName}_boosted.wav`);
        setProgress(100);
        setProcessing(false);
        setTimeout(() => setProgress(0), 500);
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
          triggerBlobDownload(new Blob(chunks, { type: 'audio/ogg' }), `${baseName}_boosted.ogg`);
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
  }, [file, gainLinear, normalize, limiter, equalizer, outputFormat]);

  const headroomDb = peakDb !== null ? -(peakDb + gainDb) : null;

  return (
    <div className="max-w-2xl mx-auto glass-card p-6 flex flex-col gap-5 text-left">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Volume2 size={18} className="text-teal-400" />
        <h3 className="font-bold text-teal-400 text-sm">Volume Booster & EQ</h3>
        <span className="ml-auto text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full">WebAudio GainNode</span>
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
          <audio ref={audioRef} src={audioUrl} controls className="w-full" preload="metadata" />

          {/* Peak info */}
          {peakDb !== null && (
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-slate-900 rounded-lg p-2 text-center">
                <div className="text-slate-500">Peak</div>
                <div className={`font-bold ${peakDb > -3 ? 'text-red-400' : peakDb > -12 ? 'text-yellow-400' : 'text-teal-400'}`}>
                  {peakDb.toFixed(1)} dBFS
                </div>
              </div>
              <div className="bg-slate-900 rounded-lg p-2 text-center">
                <div className="text-slate-500">Boost</div>
                <div className="text-teal-400 font-bold">+{gainDb} dB</div>
              </div>
              <div className="bg-slate-900 rounded-lg p-2 text-center">
                <div className="text-slate-500">Headroom</div>
                <div className={`font-bold ${headroomDb !== null && headroomDb < 0 ? 'text-red-400' : 'text-slate-200'}`}>
                  {headroomDb !== null ? `${headroomDb.toFixed(1)} dB` : '—'}
                </div>
              </div>
            </div>
          )}

          {/* Gain slider */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <label className="text-xs text-slate-400 font-medium">Gain Boost: +{gainDb} dB ({gainLinear.toFixed(2)}×)</label>
              <span className="text-xs text-slate-500">{gainLinear.toFixed(1)}×</span>
            </div>
            <input type="range" min={-20} max={40} step={1} value={gainDb}
              onChange={(e) => setGainDb(Number(e.target.value))} className="w-full accent-teal-500" />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>-20 dB (quiet)</span>
              <span>0 dB</span>
              <span>+40 dB (max)</span>
            </div>
          </div>

          {/* EQ */}
          <div className="flex flex-col gap-2 bg-slate-900/50 rounded-lg p-3">
            <label className="text-xs text-slate-400 font-medium">3-Band Equalizer</label>
            <div className="grid grid-cols-3 gap-3">
              {(['bass', 'mid', 'treble'] as const).map(band => (
                <div key={band} className="flex flex-col items-center gap-1">
                  <label className="text-xs text-slate-400 capitalize">{band}</label>
                  <div className="relative h-24 w-2 bg-slate-800 rounded-full flex items-center">
                    <input type="range" min={-12} max={12} step={0.5} value={equalizer[band]}
                      onChange={(e) => setEqualizer(prev => ({ ...prev, [band]: parseFloat(e.target.value) }))}
                      className="absolute accent-teal-500"
                      style={{ writingMode: 'vertical-lr', direction: 'rtl', width: '96px', height: '8px', transform: 'rotate(0deg) translateX(-44px)' }}
                    />
                  </div>
                  <span className={`text-[10px] font-bold ${equalizer[band] > 0 ? 'text-teal-400' : equalizer[band] < 0 ? 'text-slate-500' : 'text-slate-400'}`}>
                    {equalizer[band] > 0 ? '+' : ''}{equalizer[band]} dB
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3 bg-slate-900/50 rounded-lg p-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={normalize} onChange={(e) => setNormalize(e.target.checked)} className="accent-teal-500" />
              <span className="text-xs text-slate-400">Normalize (auto peak-limit gain)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={limiter} onChange={(e) => setLimiter(e.target.checked)} className="accent-teal-500" />
              <span className="text-xs text-slate-400">True Peak Limiter (prevents clipping)</span>
            </label>
            <div className="col-span-2 flex flex-col gap-1">
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

          {headroomDb !== null && headroomDb < 0 && !limiter && (
            <div className="flex items-start gap-2 bg-red-900/30 border border-red-500/30 rounded-lg p-3 text-xs text-red-400">
              <Info size={12} className="shrink-0 mt-0.5" />
              <span>⚠️ Clipping likely at +{gainDb} dB with this audio's peak. Enable the <strong>True Peak Limiter</strong> or reduce gain.</span>
            </div>
          )}

          {processing && (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-slate-400"><span>Processing…</span><span>{progress}%</span></div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <button onClick={handleProcess} disabled={processing}
            className="btn-primary flex items-center justify-center gap-2 py-2.5 text-xs font-bold disabled:opacity-50">
            {processing ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {processing ? `Processing… ${progress}%` : `Boost +${gainDb}dB & Export`}
          </button>
        </>
      )}
    </div>
  );
};
