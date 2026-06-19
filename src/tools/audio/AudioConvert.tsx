import { useState, useRef, useEffect, useCallback } from 'react';
import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { Upload, RefreshCw, Download, Loader2, Music } from 'lucide-react';

// PCM → WAV encoder
const encodeWav = (buffer: AudioBuffer, channels: number): ArrayBuffer => {
  const ch = Math.min(channels, buffer.numberOfChannels);
  const numSamples = buffer.length;
  const sampleRate = buffer.sampleRate;
  const bitsPerSample = 16;
  const blockAlign = ch * (bitsPerSample / 8);
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const ab = new ArrayBuffer(44 + dataSize);
  const view = new DataView(ab);
  const write = (off: number, str: string) => { for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i)); };
  write(0, 'RIFF'); view.setUint32(4, 36 + dataSize, true);
  write(8, 'WAVE'); write(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, ch, true); view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true); view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true); write(36, 'data');
  view.setUint32(40, dataSize, true);
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

const FORMAT_OPTS = [
  { value: 'wav', label: 'WAV (Lossless)', mime: 'audio/wav' },
  { value: 'ogg', label: 'OGG Vorbis', mime: 'audio/ogg' },
  { value: 'webm', label: 'WebM Opus', mime: 'audio/webm' },
];

export const AudioConvertTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [format, setFormat] = useState('wav');
  const [sampleRate, setSampleRate] = useState(44100);
  const [channels, setChannels] = useState(2);
  const [normalize, setNormalize] = useState(false);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [meta, setMeta] = useState({ duration: 0, sr: 0, ch: 0, size: 0 });
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setMeta(prev => ({ ...prev, size: file.size }));
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onMeta = () => setMeta(prev => ({ ...prev, duration: a.duration }));
    a.addEventListener('loadedmetadata', onMeta);
    return () => a.removeEventListener('loadedmetadata', onMeta);
  }, [audioUrl]);

  const fmtSize = (b: number) => b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${(b / 1024).toFixed(0)} KB`;
  const fmtDur = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

  const handleConvert = useCallback(async () => {
    if (!file) return;
    setConverting(true);
    setProgress(10);
    try {
      const arrayBuffer = await file.arrayBuffer();
      setProgress(25);
      const offCtx = new OfflineAudioContext(channels, 1, sampleRate);
      const decoded = await offCtx.decodeAudioData(arrayBuffer);
      setProgress(40);
      setMeta(prev => ({ ...prev, sr: decoded.sampleRate, ch: decoded.numberOfChannels }));

      // Resample via OfflineAudioContext
      const targetSamples = Math.ceil(decoded.duration * sampleRate);
      const renderCtx = new OfflineAudioContext(channels, targetSamples, sampleRate);
      const src = renderCtx.createBufferSource();
      src.buffer = decoded;

      if (normalize) {
        const gain = renderCtx.createGain();
        // Find peak
        let peak = 0;
        for (let c = 0; c < decoded.numberOfChannels; c++) {
          const data = decoded.getChannelData(c);
          for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]));
        }
        gain.gain.value = peak > 0 ? 0.98 / peak : 1;
        src.connect(gain);
        gain.connect(renderCtx.destination);
      } else {
        src.connect(renderCtx.destination);
      }

      src.start();
      setProgress(60);
      const rendered = await renderCtx.startRendering();
      setProgress(80);

      const baseName = file.name.replace(/\.[^.]+$/, '');

      if (format === 'wav') {
        const wavBuf = encodeWav(rendered, channels);
        triggerBlobDownload(new Blob([wavBuf], { type: 'audio/wav' }), `${baseName}.wav`);
        setProgress(100);
        setConverting(false);
      } else {
        // OGG / WebM via MediaRecorder
        const liveCtx = new AudioContext({ sampleRate });
        const dest = liveCtx.createMediaStreamDestination();
        const bufSrc = liveCtx.createBufferSource();
        bufSrc.buffer = rendered;
        bufSrc.connect(dest);
        bufSrc.connect(liveCtx.destination);

        const mimeType = format === 'ogg'
          ? (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus') ? 'audio/ogg;codecs=opus' : 'audio/webm')
          : 'audio/webm;codecs=opus';

        const mr = new MediaRecorder(dest.stream, { mimeType });
        const chunks: BlobPart[] = [];
        mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
        mr.onstop = () => {
          triggerBlobDownload(new Blob(chunks, { type: mimeType }), `${baseName}.${format}`);
          liveCtx.close();
          setProgress(100);
          setConverting(false);
        };
        mr.start(200);
        bufSrc.start();
        bufSrc.onended = () => mr.stop();
      }
      setProgress(90);
    } catch (err) {
      console.error(err);
      setConverting(false);
    }
  }, [file, format, sampleRate, channels, normalize]);

  return (
    <div className="max-w-2xl mx-auto glass-card p-6 flex flex-col gap-5 text-left">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <RefreshCw size={18} className="text-teal-400" />
        <h3 className="font-bold text-teal-400 text-sm">Audio Format Converter</h3>
        <span className="ml-auto text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full">WebAudio API</span>
      </div>

      {!file ? (
        <label className="flex flex-col items-center gap-3 py-10 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-teal-500/50 transition-colors">
          <Upload size={32} className="text-teal-400" />
          <span className="text-slate-300 text-sm font-medium">Drop or click to upload audio</span>
          <span className="text-slate-500 text-xs">MP3, WAV, OGG, FLAC, M4A, AAC</span>
          <input type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
        </label>
      ) : (
        <>
          <audio ref={audioRef} src={audioUrl} controls className="w-full" preload="metadata" />

          {meta.duration > 0 && (
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-slate-900 rounded-lg p-2 text-center">
                <div className="text-slate-500">Duration</div>
                <div className="text-slate-200 font-bold">{fmtDur(meta.duration)}</div>
              </div>
              <div className="bg-slate-900 rounded-lg p-2 text-center">
                <div className="text-slate-500">Input Size</div>
                <div className="text-slate-200 font-bold">{fmtSize(meta.size)}</div>
              </div>
              <div className="bg-slate-900 rounded-lg p-2 text-center">
                <div className="text-slate-500">Source</div>
                <div className="text-slate-200 font-bold">{file.name.replace(/.*\./, '').toUpperCase()}</div>
              </div>
            </div>
          )}

          {/* Output format */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-400 font-medium">Target Format</label>
            <div className="flex gap-2">
              {FORMAT_OPTS.map(f => (
                <button key={f.value} onClick={() => setFormat(f.value)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                    format === f.value ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-2 gap-3 bg-slate-900/50 rounded-lg p-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Sample Rate</label>
              <select value={sampleRate} onChange={(e) => setSampleRate(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 text-xs px-2 py-1.5 rounded text-slate-200">
                <option value={22050}>22,050 Hz</option>
                <option value={44100}>44,100 Hz (CD)</option>
                <option value={48000}>48,000 Hz (Studio)</option>
                <option value={96000}>96,000 Hz (Hi-Res)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Channels</label>
              <div className="flex gap-2 mt-0.5">
                {[1, 2].map(c => (
                  <button key={c} onClick={() => setChannels(c)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      channels === c ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-700 bg-slate-800 text-slate-400'
                    }`}>{c === 1 ? 'Mono' : 'Stereo'}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <input type="checkbox" id="normalize-audio" checked={normalize} onChange={(e) => setNormalize(e.target.checked)} className="accent-teal-500" />
              <label htmlFor="normalize-audio" className="text-xs text-slate-400">Normalize peak volume to 0 dBFS</label>
            </div>
          </div>

          {converting && (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Converting…</span><span>{progress}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <label className="flex items-center gap-2 text-xs text-teal-400 cursor-pointer hover:text-teal-300">
              <Music size={14} />
              Change file
              <input type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
            </label>
            <button onClick={handleConvert} disabled={converting}
              className="flex-1 btn-primary flex items-center justify-center gap-2 py-2.5 text-xs font-bold disabled:opacity-50">
              {converting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {converting ? `Converting… ${progress}%` : `Convert to ${format.toUpperCase()}`}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
