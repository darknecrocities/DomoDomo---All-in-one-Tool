import { useState, useCallback } from 'react';
import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { Upload, Wind, Download, Loader2, Info } from 'lucide-react';

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

export const AudioNoiseTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [highpassFreq, setHighpassFreq] = useState(80);
  const [lowpassFreq, setLowpassFreq] = useState(12000);
  const [noiseGateThresh, setNoiseGateThresh] = useState(-40);
  const [notch50Hz, setNotch50Hz] = useState(false);
  const [notch60Hz, setNotch60Hz] = useState(false);
  const [compress, setCompress] = useState(true);
  const [outputFormat, setOutputFormat] = useState<'wav' | 'ogg'>('wav');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFile = (f: File) => {
    setFile(f);
    const url = URL.createObjectURL(f);
    setAudioUrl(url);
  };

  const handleProcess = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(10);
    try {
      const arrayBuffer = await file.arrayBuffer();
      setProgress(25);

      const sampleRate = 44100;
      const offCtx = new OfflineAudioContext(2, 1, sampleRate);
      const decoded = await offCtx.decodeAudioData(arrayBuffer);
      setProgress(40);

      const renderCtx = new OfflineAudioContext(
        decoded.numberOfChannels,
        Math.ceil(decoded.duration * decoded.sampleRate),
        decoded.sampleRate
      );

      const src = renderCtx.createBufferSource();
      src.buffer = decoded;

      let node: AudioNode = src;

      // High-pass filter (removes low rumble/hum)
      const hp = renderCtx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = highpassFreq;
      hp.Q.value = 0.7;
      node.connect(hp);
      node = hp;

      // Low-pass filter (removes high-frequency hiss)
      const lp = renderCtx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = lowpassFreq;
      lp.Q.value = 0.7;
      node.connect(lp);
      node = lp;

      // 50Hz notch (EU mains hum)
      if (notch50Hz) {
        const n50 = renderCtx.createBiquadFilter();
        n50.type = 'notch';
        n50.frequency.value = 50;
        n50.Q.value = 30;
        node.connect(n50);
        node = n50;
      }

      // 60Hz notch (US mains hum)
      if (notch60Hz) {
        const n60 = renderCtx.createBiquadFilter();
        n60.type = 'notch';
        n60.frequency.value = 60;
        n60.Q.value = 30;
        node.connect(n60);
        node = n60;
      }

      // Dynamic compressor (smooths out noise gate artifacts)
      if (compress) {
        const comp = renderCtx.createDynamicsCompressor();
        comp.threshold.value = noiseGateThresh;
        comp.knee.value = 10;
        comp.ratio.value = 12;
        comp.attack.value = 0.003;
        comp.release.value = 0.25;
        node.connect(comp);
        node = comp;
      }

      node.connect(renderCtx.destination);
      src.start();
      setProgress(70);
      const rendered = await renderCtx.startRendering();
      setProgress(85);

      const baseName = file.name.replace(/\.[^.]+$/, '');
      if (outputFormat === 'wav') {
        const wavBuf = encodeWav(rendered);
        triggerBlobDownload(new Blob([wavBuf], { type: 'audio/wav' }), `${baseName}_denoised.wav`);
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
          triggerBlobDownload(new Blob(chunks, { type: 'audio/ogg' }), `${baseName}_denoised.ogg`);
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
  }, [file, highpassFreq, lowpassFreq, noiseGateThresh, notch50Hz, notch60Hz, compress, outputFormat]);

  return (
    <div className="max-w-2xl mx-auto glass-card p-6 flex flex-col gap-5 text-left">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Wind size={18} className="text-teal-400" />
        <h3 className="font-bold text-teal-400 text-sm">Noise Reducer & Audio Cleaner</h3>
        <span className="ml-auto text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full">BiquadFilter API</span>
      </div>

      {!file ? (
        <label className="flex flex-col items-center gap-3 py-10 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-teal-500/50 transition-colors">
          <Upload size={32} className="text-teal-400" />
          <span className="text-slate-300 text-sm font-medium">Drop or click to upload audio</span>
          <span className="text-slate-500 text-xs">MP3, WAV, OGG, M4A</span>
          <input type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </label>
      ) : (
        <>
          <audio src={audioUrl} controls className="w-full" />

          {/* Filters */}
          <div className="grid grid-cols-2 gap-3 bg-slate-900/50 rounded-lg p-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">High-pass Cutoff: {highpassFreq} Hz</label>
              <input type="range" min={20} max={500} step={10} value={highpassFreq}
                onChange={(e) => setHighpassFreq(Number(e.target.value))} className="w-full accent-teal-500" />
              <span className="text-[10px] text-slate-500">Removes low rumble & hum below this freq</span>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Low-pass Cutoff: {lowpassFreq.toLocaleString()} Hz</label>
              <input type="range" min={4000} max={20000} step={500} value={lowpassFreq}
                onChange={(e) => setLowpassFreq(Number(e.target.value))} className="w-full accent-teal-500" />
              <span className="text-[10px] text-slate-500">Removes high-frequency hiss above this freq</span>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Compressor Threshold: {noiseGateThresh} dB</label>
              <input type="range" min={-80} max={0} step={1} value={noiseGateThresh}
                onChange={(e) => setNoiseGateThresh(Number(e.target.value))} className="w-full accent-teal-500" />
              <span className="text-[10px] text-slate-500">Quiet sounds below threshold are compressed</span>
            </div>
            <div className="flex flex-col gap-2 justify-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={notch50Hz} onChange={(e) => setNotch50Hz(e.target.checked)} className="accent-teal-500" />
                <span className="text-xs text-slate-400">50 Hz Notch (EU mains hum)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={notch60Hz} onChange={(e) => setNotch60Hz(e.target.checked)} className="accent-teal-500" />
                <span className="text-xs text-slate-400">60 Hz Notch (US mains hum)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={compress} onChange={(e) => setCompress(e.target.checked)} className="accent-teal-500" />
                <span className="text-xs text-slate-400">Dynamic Compressor</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Output</label>
              <div className="flex gap-2">
                {(['wav', 'ogg'] as const).map(f => (
                  <button key={f} onClick={() => setOutputFormat(f)}
                    className={`px-3 py-1.5 text-xs font-bold rounded uppercase border transition-all ${
                      outputFormat === f ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-700 bg-slate-800 text-slate-400'
                    }`}>{f}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-slate-900/50 rounded-lg p-3 text-xs text-slate-400">
            <Info size={12} className="text-teal-400 shrink-0 mt-0.5" />
            <span>Uses browser BiquadFilter + DynamicsCompressor nodes. Best results on voices with consistent background noise (fans, hiss, hum).</span>
          </div>

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
            {processing ? `Processing… ${progress}%` : 'Apply Noise Reduction & Export'}
          </button>
        </>
      )}
    </div>
  );
};
