import { useState, useCallback } from 'react';
import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { Upload, Wind, Download, Loader2, Info, Settings, ShieldAlert, Sliders } from 'lucide-react';

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

export const AudioNoiseTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [highpassFreq, setHighpassFreq] = useState(80);
  const [lowpassFreq, setLowpassFreq] = useState(12000);
  const [noiseGateThresh, setNoiseGateThresh] = useState(-45);
  const [notch50Hz, setNotch50Hz] = useState(false);
  const [notch60Hz, setNotch60Hz] = useState(false);
  const [compress, setCompress] = useState(true);
  const [deEsser, setDeEsser] = useState(false);
  const [dePopper, setDePopper] = useState(false);
  const [customName, setCustomName] = useState('');

  // 5-Band Equalizer gains
  const [eq60Hz, setEq60Hz] = useState(0);
  const [eq250Hz, setEq250Hz] = useState(0);
  const [eq1kHz, setEq1kHz] = useState(0);
  const [eq4kHz, setEq4kHz] = useState(0);
  const [eq16kHz, setEq16kHz] = useState(0);

  const [outputFormat, setOutputFormat] = useState<'wav' | 'ogg'>('wav');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFile = (f: File) => {
    setFile(f);
    const url = URL.createObjectURL(f);
    setAudioUrl(url);
    const baseName = f.name.replace(/\.[^.]+$/, '');
    setCustomName(`${baseName}_denoised`);
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

      // High-pass filter (removes rumble)
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

      // 50Hz notch (EU hum)
      if (notch50Hz) {
        const n50 = renderCtx.createBiquadFilter();
        n50.type = 'notch';
        n50.frequency.value = 50;
        n50.Q.value = 30;
        node.connect(n50);
        node = n50;
      }

      // 60Hz notch (US hum)
      if (notch60Hz) {
        const n60 = renderCtx.createBiquadFilter();
        n60.type = 'notch';
        n60.frequency.value = 60;
        n60.Q.value = 30;
        node.connect(n60);
        node = n60;
      }

      // Pop Filter (Low shelf at 150Hz)
      if (dePopper) {
        const popFilter = renderCtx.createBiquadFilter();
        popFilter.type = 'lowshelf';
        popFilter.frequency.value = 150;
        popFilter.gain.value = -12; // Cut low plosives
        node.connect(popFilter);
        node = popFilter;
      }

      // De-Esser (Peaking cut at 6500Hz)
      if (deEsser) {
        const deEssNode = renderCtx.createBiquadFilter();
        deEssNode.type = 'peaking';
        deEssNode.frequency.value = 6500;
        deEssNode.Q.value = 2.0;
        deEssNode.gain.value = -8; // Attenuate sibilance
        node.connect(deEssNode);
        node = deEssNode;
      }

      // 5-Band Equalizer configuration
      const eqFrequencies = [60, 250, 1000, 4000, 16000];
      const eqGains = [eq60Hz, eq250Hz, eq1kHz, eq4kHz, eq16kHz];

      eqFrequencies.forEach((freq, idx) => {
        const gainVal = eqGains[idx];
        if (gainVal !== 0) {
          const eqNode = renderCtx.createBiquadFilter();
          eqNode.type = idx === 0 ? 'lowshelf' : idx === 4 ? 'highshelf' : 'peaking';
          eqNode.frequency.value = freq;
          if (eqNode.type === 'peaking') eqNode.Q.value = 1.0;
          eqNode.gain.value = gainVal;
          node.connect(eqNode);
          node = eqNode;
        }
      });

      // Dynamics compressor
      if (compress) {
        const comp = renderCtx.createDynamicsCompressor();
        comp.threshold.value = noiseGateThresh;
        comp.knee.value = 12;
        comp.ratio.value = 10;
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

      const targetFileName = customName.trim() ? customName.trim() : 'denoised_audio';

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
  }, [file, highpassFreq, lowpassFreq, noiseGateThresh, notch50Hz, notch60Hz, compress, deEsser, dePopper, eq60Hz, eq250Hz, eq1kHz, eq4kHz, eq16kHz, outputFormat, customName]);

  return (
    <div className="max-w-3xl mx-auto glass-card p-6 flex flex-col gap-6 text-left">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Wind size={18} className="text-teal-400 animate-pulse" />
        <div>
          <h3 className="font-bold text-teal-400 text-sm">Noise Reducer & Audio Cleaner</h3>
          <p className="text-[10px] text-slate-500">Filter background hum, low rumbles, high hiss, and apply targeted Equalization</p>
        </div>
        <span className="ml-auto text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">High Fidelity</span>
      </div>

      {!file ? (
        <label className="flex flex-col items-center gap-3 py-12 border-2 border-dashed border-slate-700/60 rounded-xl cursor-pointer hover:border-teal-500/50 hover:bg-slate-950/20 transition-all justify-center">
          <Upload size={36} className="text-teal-400" />
          <span className="text-slate-300 text-sm font-semibold">Drop or click to upload audio file</span>
          <span className="text-slate-500 text-xs">Supports MP3, WAV, OGG, FLAC, M4A, etc.</span>
          <input type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </label>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="md:col-span-7 flex flex-col gap-4">
            <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-850/50 flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Audio Input Player</span>
              <audio src={audioUrl} controls className="w-full" />
            </div>

            {/* Frequencies Filtering */}
            <div className="bg-slate-900/30 border border-slate-850 p-4 rounded-xl flex flex-col gap-3">
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5"><Settings size={12} /> Frequency Cutoff Filters</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>High-pass Rumble Cut:</span>
                    <span className="font-mono text-teal-400">{highpassFreq} Hz</span>
                  </div>
                  <input type="range" min={20} max={400} step={5} value={highpassFreq}
                    onChange={(e) => setHighpassFreq(Number(e.target.value))} className="w-full accent-teal-500" />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Low-pass Hiss Cut:</span>
                    <span className="font-mono text-teal-400">{lowpassFreq} Hz</span>
                  </div>
                  <input type="range" min={3000} max={18000} step={200} value={lowpassFreq}
                    onChange={(e) => setLowpassFreq(Number(e.target.value))} className="w-full accent-teal-500" />
                </div>
              </div>
            </div>

            {/* Vocal Enhancement & Clean Up */}
            <div className="bg-slate-900/30 border border-slate-850 p-4 rounded-xl flex flex-col gap-3">
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5"><ShieldAlert size={12} /> Vocal De-Noise Cleaners</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-950/45 p-2 rounded border border-slate-850">
                  <input type="checkbox" checked={deEsser} onChange={(e) => setDeEsser(e.target.checked)} className="accent-teal-500 w-3.5 h-3.5 rounded" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-300">De-Esser Filter</span>
                    <span className="text-[9px] text-slate-550">Tames sharp 'S' sibilance peaks</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-950/45 p-2 rounded border border-slate-850">
                  <input type="checkbox" checked={dePopper} onChange={(e) => setDePopper(e.target.checked)} className="accent-teal-500 w-3.5 h-3.5 rounded" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-300">De-Popper Filter</span>
                    <span className="text-[9px] text-slate-550">Blocks pop & breath sounds</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Graphic 5-Band EQ */}
            <div className="bg-slate-900/30 border border-slate-850 p-4 rounded-xl flex flex-col gap-3">
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5"><Sliders size={12} /> Noise Shaping Graphic EQ</span>
              <div className="grid grid-cols-5 gap-1.5 text-center">
                {[
                  { freq: '60Hz', value: eq60Hz, setter: setEq60Hz },
                  { freq: '250Hz', value: eq250Hz, setter: setEq250Hz },
                  { freq: '1kHz', value: eq1kHz, setter: setEq1kHz },
                  { freq: '4kHz', value: eq4kHz, setter: setEq4kHz },
                  { freq: '16kHz', value: eq16kHz, setter: setEq16kHz }
                ].map((band, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5 bg-slate-950/40 p-2 rounded border border-slate-850/60">
                    <span className="text-[9px] text-slate-450 font-bold">{band.freq}</span>
                    <input type="range" min={-15} max={15} step={1} value={band.value} onChange={(e) => band.setter(Number(e.target.value))} className="h-16 accent-teal-500 cursor-row-resize" style={{ writingMode: 'vertical-lr', direction: 'rtl' }} />
                    <span className="text-[9px] font-mono text-teal-400">{band.value > 0 ? `+${band.value}` : band.value}dB</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side panel */}
          <div className="md:col-span-5 flex flex-col gap-4 border-l border-slate-800 md:pl-6">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Denoising & Export Settings</span>

            {/* Mains Hum Notch filters */}
            <div className="flex flex-col gap-2 bg-slate-900/40 p-3 rounded-lg border border-slate-850">
              <label className="text-[10px] text-slate-500 uppercase">Hum Attenuation</label>
              <div className="flex flex-col gap-2 mt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={notch50Hz} onChange={(e) => setNotch50Hz(e.target.checked)} className="accent-teal-500" />
                  <span className="text-xs text-slate-400">50 Hz Notch (EU Mains Hum)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={notch60Hz} onChange={(e) => setNotch60Hz(e.target.checked)} className="accent-teal-500" />
                  <span className="text-xs text-slate-400">60 Hz Notch (US Mains Hum)</span>
                </label>
              </div>
            </div>

            {/* Compressor Threshold */}
            <div className="flex flex-col gap-1.5 bg-slate-900/40 p-3 rounded-lg border border-slate-850">
              <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase">
                <span>Gate Compressor</span>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" checked={compress} onChange={(e) => setCompress(e.target.checked)} className="accent-teal-500 w-3 h-3 rounded" />
                  <span className="text-[10px] text-slate-400">Enabled</span>
                </label>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>Gate Threshold:</span>
                <span className="text-teal-400 font-bold">{noiseGateThresh} dB</span>
              </div>
              <input type="range" min={-70} max={-20} step={1} value={noiseGateThresh}
                onChange={(e) => setNoiseGateThresh(Number(e.target.value))} className="w-full accent-teal-500" disabled={!compress} />
            </div>

            {/* Output settings */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-slate-550 uppercase font-semibold">Output Format</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['wav', 'ogg'] as const).map(f => (
                  <button key={f} onClick={() => setOutputFormat(f)}
                    className={`py-1.5 text-[10px] font-bold rounded uppercase border transition-all ${
                      outputFormat === f ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-800 bg-slate-950 text-slate-450'
                    }`}>{f}</button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-550 uppercase font-semibold">Save File Name</label>
              <input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Target file name" className="bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-slate-300 text-xs font-mono" />
            </div>

            <div className="flex items-start gap-1.5 text-[10px] text-slate-500 bg-slate-950/20 p-2.5 rounded border border-slate-850 mt-1">
              <Info size={11} className="text-teal-400 shrink-0 mt-0.5" />
              <span>Denoising runs 100% inside client thread via WebAudio API. No files are transmitted to servers.</span>
            </div>

            {processing && (
              <div className="flex flex-col gap-1 mt-1">
                <div className="flex justify-between text-[10px] text-slate-500 font-semibold uppercase"><span>Rendering clean buffer…</span><span>{progress}%</span></div>
                <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-850">
                  <div className="h-full bg-teal-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <button onClick={handleProcess} disabled={processing}
              className="btn-primary w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold disabled:opacity-50 mt-auto">
              {processing ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              {processing ? `Rendering…` : 'Save Denoised Track'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
